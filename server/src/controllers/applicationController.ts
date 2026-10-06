import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { query, queryOne, run } from '../config/db';
import { calculateDti, calculateReducingBalanceEmi, maskAccountNumber } from '../utils/calculations';
import { uploadsDir } from '../middleware/upload';

export async function createApplication(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const {
      productId,
      requestedAmount,
      tenureMonths,
      purpose,
      employmentType,
      companyName,
      jobTitle,
      monthlyIncome,
      yearsEmployed,
      existingEmis,
      monthlyObligations,
      bankName,
      accountNumber,
      ifscCode,
      accountHolderName,
      guarantor,
      coApplicant
    } = req.body;

    // Validate product
    const product = queryOne('SELECT * FROM loan_products WHERE id = ?', [productId]);
    if (!product) {
      res.status(400).json({ success: false, message: 'Invalid loan product selected.' });
      return;
    }

    const amount = Number(requestedAmount);
    const tenure = Number(tenureMonths);
    const income = Number(monthlyIncome) || 0;
    const existingEmiVal = Number(existingEmis) || 0;
    const obligationsVal = Number(monthlyObligations) || 0;

    if (isNaN(amount) || amount < product.min_amount || amount > product.max_amount) {
      res.status(400).json({
        success: false,
        message: `Requested loan amount must be between ₹${product.min_amount.toLocaleString('en-IN')} and ₹${product.max_amount.toLocaleString('en-IN')}.`
      });
      return;
    }

    if (isNaN(tenure) || tenure < product.min_tenure_months || tenure > product.max_tenure_months) {
      res.status(400).json({
        success: false,
        message: `Tenure must be between ${product.min_tenure_months} and ${product.max_tenure_months} months.`
      });
      return;
    }

    // Guarantor check if required
    if (product.guarantor_required && (!guarantor || !guarantor.fullName || !guarantor.mobile)) {
      res.status(400).json({
        success: false,
        message: 'A guarantor / surety is required for this loan product. Please provide guarantor details.'
      });
      return;
    }

    // Rate & EMI calculation
    const rate = product.default_interest_rate;
    const emiCalc = calculateReducingBalanceEmi(amount, rate, tenure);
    const totalMonthlyDebt = existingEmiVal + obligationsVal + emiCalc.monthlyEmi;
    const dti = calculateDti(totalMonthlyDebt, income);

    // Business Rule Check:
    // If requested amount is >= ₹1,00,000 -> PENDING ADMIN REVIEW
    // If < ₹1,00,000 -> automated eligibility verification
    const ADMIN_APPROVAL_THRESHOLD = product.admin_approval_threshold || 100000;
    const isHighValue = amount >= ADMIN_APPROVAL_THRESHOLD;

    let initialStatus = 'UNDER_VERIFICATION';
    if (isHighValue) {
      initialStatus = 'PENDING_ADMIN_REVIEW';
    } else {
      // Auto-rule for loans < 1L
      if (dti <= 60 && income >= 15000) {
        initialStatus = 'APPROVED';
      } else {
        initialStatus = 'UNDER_VERIFICATION';
      }
    }

    const appId = 'FIN-2026-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();

    run(`
      INSERT INTO loan_applications (
        id, user_id, product_id, requested_amount, tenure_months, interest_rate,
        estimated_emi, purpose, status, monthly_income, employment_type,
        company_name, job_title, years_employed, existing_emis, monthly_obligations,
        debt_to_income_ratio, credit_score_estimate, bank_name, account_number,
        ifsc_code, account_holder_name, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 750, ?, ?, ?, ?, ?, ?);
    `, [
      appId, userId, productId, amount, tenure, rate,
      emiCalc.monthlyEmi, purpose || 'General Requirement', initialStatus,
      income, employmentType || 'Salaried', companyName || null, jobTitle || null,
      Number(yearsEmployed) || 1, existingEmiVal, obligationsVal, dti,
      bankName || null, accountNumber || null, ifscCode || null, accountHolderName || null,
      now, now
    ]);

    // Save Guarantor if provided
    if (guarantor && guarantor.fullName) {
      const guarId = 'guar_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
      run(`
        INSERT INTO guarantors (
          id, application_id, full_name, relationship, mobile, email,
          address, occupation, monthly_income, pan_number, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        guarId, appId, guarantor.fullName, guarantor.relationship || 'Relative',
        guarantor.mobile, guarantor.email || null, guarantor.address || null,
        guarantor.occupation || null, Number(guarantor.monthlyIncome) || 0,
        guarantor.panNumber || null, now
      ]);
    }

    // Save Co-applicant if provided
    if (coApplicant && coApplicant.fullName) {
      const coAppId = 'coapp_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
      run(`
        INSERT INTO co_applicants (
          id, application_id, full_name, relationship, mobile, email,
          address, occupation, monthly_income, pan_number, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `, [
        coAppId, appId, coApplicant.fullName, coApplicant.relationship || 'Spouse',
        coApplicant.mobile, coApplicant.email || null, coApplicant.address || null,
        coApplicant.occupation || null, Number(coApplicant.monthlyIncome) || 0,
        coApplicant.panNumber || null, now
      ]);
    }

    // Create User Notification
    run(`
      INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 0, ?);
    `, [
      'notif_' + Math.random().toString(36).substr(2, 9),
      userId,
      `Loan Application Submitted: ${appId}`,
      isHighValue
        ? `Your application for ₹${amount.toLocaleString('en-IN')} has been submitted and is currently PENDING ADMIN REVIEW.`
        : `Your application for ₹${amount.toLocaleString('en-IN')} has been submitted and is being processed.`,
      isHighValue ? 'WARNING' : 'INFO',
      `/applications/${appId}`,
      now
    ]);

    // If high-value loan >= 1L, notify Admins!
    if (isHighValue) {
      const applicantUser = queryOne('SELECT full_name FROM users WHERE id = ?', [userId]);
      const applicantName = applicantUser ? applicantUser.full_name : 'Applicant';
      run(`
        INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
        VALUES (?, 'ADMIN', ?, ?, 'WARNING', ?, 0, ?);
      `, [
        'notif_' + Math.random().toString(36).substr(2, 9),
        `High-Value Loan Review Required: ${appId}`,
        `Applicant ${applicantName} applied for ₹${amount.toLocaleString('en-IN')} (${product.name}). Requires underwriter review.`,
        `/admin/applications/${appId}`,
        now
      ]);
    }

    res.status(201).json({
      success: true,
      message: isHighValue
        ? `Application ${appId} submitted successfully. Because the loan amount is ₹1,00,000 or above, it is pending administrative review.`
        : `Application ${appId} submitted successfully!`,
      applicationId: appId,
      status: initialStatus
    });
  } catch (err: any) {
    console.error('createApplication error:', err);
    res.status(500).json({ success: false, message: 'Failed to create loan application.' });
  }
}

export function getMyApplications(req: Request, res: Response): void {
  try {
    const userId = req.user!.id;
    const apps = query(`
      SELECT a.*, p.name as product_name, p.category as product_category, p.badge as product_badge
      FROM loan_applications a
      JOIN loan_products p ON a.product_id = p.id
      WHERE a.user_id = ?
      ORDER BY a.created_at DESC
    `, [userId]);

    const formatted = apps.map(app => ({
      ...app,
      account_number_masked: maskAccountNumber(app.account_number)
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('getMyApplications error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch applications' });
  }
}

export function getApplicationById(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const currentUserId = req.user!.id;
    const userRole = req.user!.role;

    const app = queryOne(`
      SELECT a.*, p.name as product_name, p.category as product_category, p.processing_fee_percent,
             u.full_name as user_full_name, u.email as user_email, u.mobile as user_mobile, u.city as user_city
      FROM loan_applications a
      JOIN loan_products p ON a.product_id = p.id
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [id]);

    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    // Permission check: owner or admin
    if (userRole !== 'ADMIN' && app.user_id !== currentUserId) {
      res.status(403).json({ success: false, message: 'Access denied: You do not own this application' });
      return;
    }

    // Documents
    const documents = query('SELECT * FROM loan_documents WHERE application_id = ? ORDER BY uploaded_at ASC', [id]);

    // Guarantor & Co-Applicant
    const guarantor = queryOne('SELECT * FROM guarantors WHERE application_id = ?', [id]);
    const coApplicant = queryOne('SELECT * FROM co_applicants WHERE application_id = ?', [id]);

    // Associated Loan Account if approved & active
    const loanAccount = queryOne('SELECT * FROM loan_accounts WHERE application_id = ?', [id]);

    res.json({
      success: true,
      data: {
        ...app,
        account_number_masked: maskAccountNumber(app.account_number),
        documents,
        guarantor,
        coApplicant,
        loanAccount
      }
    });
  } catch (err: any) {
    console.error('getApplicationById error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch application details' });
  }
}

export function uploadApplicationDocument(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { documentType } = req.body;
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
      res.status(400).json({ success: false, message: 'No file uploaded or file rejected by validator.' });
      return;
    }

    const app = queryOne('SELECT * FROM loan_applications WHERE id = ?', [id]);
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    if (req.user!.role !== 'ADMIN' && app.user_id !== userId) {
      res.status(403).json({ success: false, message: 'Access denied: Cannot upload documents to this application.' });
      return;
    }

    const docId = 'doc_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    const now = new Date().toISOString();

    run(`
      INSERT INTO loan_documents (
        id, application_id, user_id, document_type, file_name, original_name,
        file_path, file_size, mime_type, verification_status, uploaded_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'PENDING', ?);
    `, [
      docId, id, userId, documentType || 'SUPPORTING_DOCUMENT',
      file.filename, file.originalname,
      'uploads/' + file.filename,
      file.size, file.mimetype, now
    ]);

    res.status(201).json({
      success: true,
      message: 'Document uploaded successfully!',
      document: {
        id: docId,
        applicationId: id,
        documentType: documentType || 'SUPPORTING_DOCUMENT',
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedAt: now
      }
    });
  } catch (err: any) {
    console.error('uploadApplicationDocument error:', err);
    res.status(500).json({ success: false, message: 'Failed to upload document.' });
  }
}

export function viewDocumentFile(req: Request, res: Response): void {
  try {
    const { docId } = req.params;
    const doc = queryOne('SELECT * FROM loan_documents WHERE id = ?', [docId]);

    if (!doc) {
      res.status(404).json({ success: false, message: 'Document not found' });
      return;
    }

    // Role or owner verification
    if (req.user!.role !== 'ADMIN' && doc.user_id !== req.user!.id) {
      res.status(403).json({ success: false, message: 'Access denied: You cannot view this document.' });
      return;
    }

    let filePath = path.resolve(uploadsDir, doc.file_name);
    if (!fs.existsSync(filePath)) {
      filePath = path.resolve(uploadsDir, 'sample_doc.pdf');
    }

    res.setHeader('Content-Type', doc.mime_type || 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${doc.original_name}"`);
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (err: any) {
    console.error('viewDocumentFile error:', err);
    res.status(500).json({ success: false, message: 'Failed to access document' });
  }
}

export function submitClarification(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { clarificationResponse } = req.body;
    const userId = req.user!.id;

    if (!clarificationResponse || !clarificationResponse.trim()) {
      res.status(400).json({ success: false, message: 'Clarification message cannot be empty.' });
      return;
    }

    const app = queryOne('SELECT * FROM loan_applications WHERE id = ?', [id]);
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    if (app.user_id !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const now = new Date().toISOString();
    const newStatus = app.requested_amount >= 100000 ? 'PENDING_ADMIN_REVIEW' : 'UNDER_VERIFICATION';

    run(`
      UPDATE loan_applications
      SET user_clarification_response = ?, status = ?, updated_at = ?
      WHERE id = ?;
    `, [clarificationResponse.trim(), newStatus, now, id]);

    // Admin notification
    run(`
      INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
      VALUES (?, 'ADMIN', ?, ?, 'INFO', ?, 0, ?);
    `, [
      'notif_' + Math.random().toString(36).substr(2, 9),
      `Clarification Submitted for ${id}`,
      `Applicant submitted clarification for loan application ${id}. Ready for reassessment.`,
      `/admin/applications/${id}`,
      now
    ]);

    res.json({
      success: true,
      message: 'Clarification submitted successfully. Application has returned to review status.',
      status: newStatus
    });
  } catch (err: any) {
    console.error('submitClarification error:', err);
    res.status(500).json({ success: false, message: 'Failed to submit clarification.' });
  }
}
