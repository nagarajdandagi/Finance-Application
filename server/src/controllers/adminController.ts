import { Request, Response } from 'express';
import { query, queryOne, run } from '../config/db';
import { calculateReducingBalanceEmi, generateAmortizationSchedule, maskAccountNumber } from '../utils/calculations';
import { recordAuditLog } from '../utils/auditLogger';

export function getDashboardStats(_req: Request, res: Response): void {
  try {
    const totalCustomers = queryOne('SELECT COUNT(*) as count FROM users WHERE role = ?', ['CUSTOMER'])?.count || 0;
    const totalApplications = queryOne('SELECT COUNT(*) as count FROM loan_applications')?.count || 0;
    const pendingReview = queryOne("SELECT COUNT(*) as count FROM loan_applications WHERE status = 'PENDING_ADMIN_REVIEW'")?.count || 0;
    const underVerification = queryOne("SELECT COUNT(*) as count FROM loan_applications WHERE status = 'UNDER_VERIFICATION'")?.count || 0;
    const approvedCount = queryOne("SELECT COUNT(*) as count FROM loan_applications WHERE status IN ('APPROVED', 'ACTIVE', 'DISBURSED', 'COMPLETED')")?.count || 0;
    const rejectedCount = queryOne("SELECT COUNT(*) as count FROM loan_applications WHERE status = 'REJECTED'")?.count || 0;
    const totalDisbursed = queryOne('SELECT COALESCE(SUM(principal_amount), 0) as total FROM loan_accounts')?.total || 0;
    const outstandingLoans = queryOne('SELECT COALESCE(SUM(outstanding_balance), 0) as total FROM loan_accounts WHERE status = ?', ['ACTIVE'])?.total || 0;
    const activeLoansCount = queryOne("SELECT COUNT(*) as count FROM loan_accounts WHERE status = 'ACTIVE'")?.count || 0;
    const completedLoansCount = queryOne("SELECT COUNT(*) as count FROM loan_accounts WHERE status = 'CLOSED'")?.count || 0;

    // Monthly application trends (mock aggregated representation)
    const monthlyTrend = [
      { month: 'May 2026', applications: 12, approved: 9, rejected: 3, disbursed: 3200000 },
      { month: 'Jun 2026', applications: 18, approved: 14, rejected: 4, disbursed: 4800000 },
      { month: 'Jul 2026', applications: 24, approved: 19, rejected: 5, disbursed: 6100000 },
      { month: 'Aug 2026', applications: 31, approved: 26, rejected: 5, disbursed: 8900000 },
      { month: 'Sep 2026', applications: 42, approved: 35, rejected: 7, disbursed: 11200000 },
      { month: 'Oct 2026', applications: totalApplications, approved: approvedCount, rejected: rejectedCount, disbursed: totalDisbursed }
    ];

    // Product breakdown
    const productStats = query(`
      SELECT p.name, COUNT(a.id) as count, COALESCE(SUM(a.requested_amount), 0) as totalAmount
      FROM loan_products p
      LEFT JOIN loan_applications a ON p.id = a.product_id
      GROUP BY p.id, p.name
    `);

    res.json({
      success: true,
      data: {
        cards: {
          totalCustomers,
          totalApplications,
          pendingReview,
          underVerification,
          totalPending: pendingReview + underVerification,
          approvedCount,
          rejectedCount,
          totalDisbursed,
          outstandingLoans,
          activeLoansCount,
          completedLoansCount
        },
        monthlyTrend,
        productStats
      }
    });
  } catch (err: any) {
    console.error('getDashboardStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve admin dashboard stats' });
  }
}

export function getApplications(req: Request, res: Response): void {
  try {
    const { status, productId, search, minAmount, maxAmount } = req.query;

    let sql = `
      SELECT a.*, p.name as product_name, p.category as product_category,
             u.full_name as applicant_name, u.email as applicant_email, u.mobile as applicant_mobile
      FROM loan_applications a
      JOIN loan_products p ON a.product_id = p.id
      JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (status) {
      sql += ' AND a.status = ?';
      params.push(status);
    }

    if (productId) {
      sql += ' AND a.product_id = ?';
      params.push(productId);
    }

    if (minAmount) {
      sql += ' AND a.requested_amount >= ?';
      params.push(Number(minAmount));
    }

    if (maxAmount) {
      sql += ' AND a.requested_amount <= ?';
      params.push(Number(maxAmount));
    }

    if (search) {
      sql += ' AND (a.id LIKE ? OR u.full_name LIKE ? OR u.mobile LIKE ? OR u.email LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }

    sql += ' ORDER BY a.created_at DESC';

    const applications = query(sql, params);
    const formatted = applications.map(app => {
      // Risk indicator logic
      let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
      if (app.debt_to_income_ratio > 50 || (app.credit_score_estimate && app.credit_score_estimate < 680)) {
        riskLevel = 'HIGH';
      } else if (app.debt_to_income_ratio > 40 || (app.credit_score_estimate && app.credit_score_estimate < 720)) {
        riskLevel = 'MEDIUM';
      }

      return {
        ...app,
        account_number_masked: maskAccountNumber(app.account_number),
        riskLevel
      };
    });

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('getApplications error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve applications' });
  }
}

export function getApplicationDetail(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const app = queryOne(`
      SELECT a.*, p.name as product_name, p.category as product_category, p.processing_fee_percent,
             p.guarantor_required as product_guarantor_required,
             u.full_name as applicant_name, u.email as applicant_email, u.mobile as applicant_mobile,
             u.date_of_birth as applicant_dob, u.address as applicant_address, u.city as applicant_city,
             u.state as applicant_state, u.pincode as applicant_pincode, u.pan_number as applicant_pan
      FROM loan_applications a
      JOIN loan_products p ON a.product_id = p.id
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `, [id]);

    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const documents = query('SELECT * FROM loan_documents WHERE application_id = ? ORDER BY uploaded_at ASC', [id]);
    const guarantor = queryOne('SELECT * FROM guarantors WHERE application_id = ?', [id]);
    const coApplicant = queryOne('SELECT * FROM co_applicants WHERE application_id = ?', [id]);
    const loanAccount = queryOne('SELECT * FROM loan_accounts WHERE application_id = ?', [id]);

    // Risk assessment
    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' = 'LOW';
    if (app.debt_to_income_ratio > 50 || (app.credit_score_estimate && app.credit_score_estimate < 680)) {
      riskLevel = 'HIGH';
    } else if (app.debt_to_income_ratio > 40 || (app.credit_score_estimate && app.credit_score_estimate < 720)) {
      riskLevel = 'MEDIUM';
    }

    res.json({
      success: true,
      data: {
        ...app,
        account_number_masked: maskAccountNumber(app.account_number),
        riskLevel,
        documents,
        guarantor,
        coApplicant,
        loanAccount
      }
    });
  } catch (err: any) {
    console.error('getApplicationDetail error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve application details' });
  }
}

export function approveApplication(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { approvedAmount, interestRate, adminNotes } = req.body;
    const admin = req.user!;

    const app = queryOne('SELECT * FROM loan_applications WHERE id = ?', [id]);
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    if (app.status === 'APPROVED' || app.status === 'ACTIVE' || app.status === 'DISBURSED') {
      res.status(400).json({ success: false, message: 'Application is already approved and active.' });
      return;
    }

    const principal = Number(approvedAmount) || app.requested_amount;
    const rate = Number(interestRate) || app.interest_rate;
    const tenureMonths = app.tenure_months;

    const emiResult = calculateReducingBalanceEmi(principal, rate, tenureMonths);
    const loanAccountId = 'LN-2026-' + Math.floor(100000 + Math.random() * 900000);
    const now = new Date().toISOString();
    const schedule = generateAmortizationSchedule(principal, rate, tenureMonths, new Date());
    const nextEmiDate = schedule[0]?.dueDate || now.split('T')[0];

    // 1. Update application status
    run(`
      UPDATE loan_applications
      SET status = 'APPROVED', approved_amount = ?, interest_rate = ?, estimated_emi = ?,
          admin_notes = ?, reviewed_by = ?, reviewed_at = ?, updated_at = ?
      WHERE id = ?;
    `, [
      principal, rate, emiResult.monthlyEmi,
      adminNotes || 'Approved by Underwriter', admin.id, now, now, id
    ]);

    // 2. Create Loan Account
    run(`
      INSERT INTO loan_accounts (
        id, application_id, user_id, product_id, principal_amount,
        outstanding_balance, interest_rate, tenure_months, remaining_tenure_months,
        monthly_emi, total_payable, total_interest, total_paid, total_interest_paid,
        disbursement_date, next_emi_date, status, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, 'ACTIVE', ?);
    `, [
      loanAccountId, id, app.user_id, app.product_id, principal,
      principal, rate, tenureMonths, tenureMonths,
      emiResult.monthlyEmi, emiResult.totalRepayment, emiResult.totalInterest,
      now, nextEmiDate, now
    ]);

    // 3. Create Full Amortization Schedule
    for (const row of schedule) {
      run(`
        INSERT INTO repayment_schedules (
          id, loan_account_id, installment_number, due_date, opening_balance,
          principal_component, interest_component, emi_amount, closing_balance,
          status, paid_date, payment_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'UPCOMING', null, null);
      `, [
        'sch_' + row.installmentNumber + '_' + loanAccountId.slice(-6),
        loanAccountId, row.installmentNumber, row.dueDate, row.openingBalance,
        row.principalComponent, row.interestComponent, row.emiAmount, row.closingBalance
      ]);
    }

    // 4. Record Disbursement Transaction
    const txnId = 'TXN-2026-' + Math.floor(10000 + Math.random() * 90000);
    run(`
      INSERT INTO transactions (
        id, user_id, loan_account_id, type, amount, status, description, created_at
      ) VALUES (?, ?, ?, 'LOAN_DISBURSEMENT', ?, 'SUCCESS', ?, ?);
    `, [
      txnId, app.user_id, loanAccountId, principal,
      `Loan Disbursed for approved application ${id} to verified bank account`, now
    ]);

    // 5. Send User Notification
    run(`
      INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
      VALUES (?, ?, ?, ?, 'SUCCESS', ?, 0, ?);
    `, [
      'notif_' + Math.random().toString(36).substr(2, 9),
      app.user_id,
      `Loan Approved & Disbursed: ${id}`,
      `Congratulations! Your loan of ₹${principal.toLocaleString('en-IN')} has been approved and active loan account ${loanAccountId} has been created. Monthly EMI is ₹${emiResult.monthlyEmi.toLocaleString('en-IN')}.`,
      `/loans/account/${loanAccountId}`,
      now
    ]);

    // 6. Record Audit Log
    recordAuditLog(
      admin.id,
      admin.email,
      'APPROVE_APPLICATION',
      'APPLICATION',
      id,
      `Approved application ${id} for ₹${principal} at ${rate}% rate. Created Loan Account ${loanAccountId}. Notes: ${adminNotes || 'None'}`
    );

    res.json({
      success: true,
      message: `Application ${id} approved successfully! Loan Account ${loanAccountId} has been generated.`,
      loanAccountId
    });
  } catch (err: any) {
    console.error('approveApplication error:', err);
    res.status(500).json({ success: false, message: 'Failed to approve application' });
  }
}

export function rejectApplication(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { rejectionReason, adminNotes } = req.body;
    const admin = req.user!;

    if (!rejectionReason || !rejectionReason.trim()) {
      res.status(400).json({ success: false, message: 'Rejection reason is mandatory.' });
      return;
    }

    const app = queryOne('SELECT * FROM loan_applications WHERE id = ?', [id]);
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const now = new Date().toISOString();

    run(`
      UPDATE loan_applications
      SET status = 'REJECTED', rejection_reason = ?, admin_notes = ?,
          reviewed_by = ?, reviewed_at = ?, updated_at = ?
      WHERE id = ?;
    `, [rejectionReason.trim(), adminNotes || null, admin.id, now, now, id]);

    // Send User Notification
    run(`
      INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
      VALUES (?, ?, ?, ?, 'DANGER', ?, 0, ?);
    `, [
      'notif_' + Math.random().toString(36).substr(2, 9),
      app.user_id,
      `Loan Application Rejected: ${id}`,
      `Your loan application ${id} could not be approved at this time. Reason: ${rejectionReason.trim()}`,
      `/applications/${id}`,
      now
    ]);

    // Record Audit Log
    recordAuditLog(
      admin.id,
      admin.email,
      'REJECT_APPLICATION',
      'APPLICATION',
      id,
      `Rejected application ${id}. Reason: ${rejectionReason.trim()}`
    );

    res.json({
      success: true,
      message: `Application ${id} has been rejected.`
    });
  } catch (err: any) {
    console.error('rejectApplication error:', err);
    res.status(500).json({ success: false, message: 'Failed to reject application' });
  }
}

export function requestMoreInfo(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { message, adminNotes } = req.body;
    const admin = req.user!;

    if (!message || !message.trim()) {
      res.status(400).json({ success: false, message: 'Please provide a message stating the required information.' });
      return;
    }

    const app = queryOne('SELECT * FROM loan_applications WHERE id = ?', [id]);
    if (!app) {
      res.status(404).json({ success: false, message: 'Application not found' });
      return;
    }

    const now = new Date().toISOString();

    run(`
      UPDATE loan_applications
      SET status = 'ADDITIONAL_INFORMATION_REQUIRED', info_request_message = ?, admin_notes = ?,
          reviewed_by = ?, reviewed_at = ?, updated_at = ?
      WHERE id = ?;
    `, [message.trim(), adminNotes || null, admin.id, now, now, id]);

    // Send User Notification
    run(`
      INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
      VALUES (?, ?, ?, ?, 'ACTION_REQUIRED', ?, 0, ?);
    `, [
      'notif_' + Math.random().toString(36).substr(2, 9),
      app.user_id,
      `Additional Information Required for ${id}`,
      `Finova underwriting team requires further information: ${message.trim()}`,
      `/applications/${id}`,
      now
    ]);

    // Record Audit Log
    recordAuditLog(
      admin.id,
      admin.email,
      'REQUEST_MORE_INFO',
      'APPLICATION',
      id,
      `Requested additional information for application ${id}: ${message.trim()}`
    );

    res.json({
      success: true,
      message: `Information request sent to applicant for application ${id}.`
    });
  } catch (err: any) {
    console.error('requestMoreInfo error:', err);
    res.status(500).json({ success: false, message: 'Failed to request information' });
  }
}

export function getUsers(req: Request, res: Response): void {
  try {
    const { search, role, status } = req.query;

    let sql = `
      SELECT u.id, u.full_name, u.email, u.mobile, u.role, u.city, u.state,
             u.monthly_income, u.employment_type, u.status, u.created_at,
             (SELECT COUNT(*) FROM loan_applications WHERE user_id = u.id) as application_count,
             (SELECT COUNT(*) FROM loan_accounts WHERE user_id = u.id AND status = 'ACTIVE') as active_loans_count,
             (SELECT COALESCE(SUM(principal_amount), 0) FROM loan_accounts WHERE user_id = u.id) as total_borrowed
      FROM users u
      WHERE 1=1
    `;
    const params: any[] = [];

    if (role) {
      sql += ' AND u.role = ?';
      params.push(role);
    }

    if (status) {
      sql += ' AND u.status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (u.full_name LIKE ? OR u.email LIKE ? OR u.mobile LIKE ?)';
      const s = `%${search}%`;
      params.push(s, s, s);
    }

    sql += ' ORDER BY u.created_at DESC';

    const users = query(sql, params);
    res.json({ success: true, data: users });
  } catch (err: any) {
    console.error('getUsers error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve users' });
  }
}

export function getUserDetail(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const user = queryOne(`
      SELECT id, full_name, email, mobile, role, date_of_birth, address,
             city, state, pincode, pan_number, bank_name, account_number, ifsc_code,
             monthly_income, employment_type, company_name, job_title, status, created_at
      FROM users
      WHERE id = ?
    `, [id]);

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const applications = query('SELECT * FROM loan_applications WHERE user_id = ? ORDER BY created_at DESC', [id]);
    const loans = query('SELECT * FROM loan_accounts WHERE user_id = ? ORDER BY created_at DESC', [id]);
    const documents = query('SELECT * FROM loan_documents WHERE user_id = ? ORDER BY uploaded_at DESC', [id]);

    res.json({
      success: true,
      data: {
        ...user,
        account_number_masked: maskAccountNumber(user.account_number),
        applications,
        loans,
        documents
      }
    });
  } catch (err: any) {
    console.error('getUserDetail error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve user details' });
  }
}

export function toggleUserStatus(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'ACTIVE' or 'SUSPENDED'
    const admin = req.user!;

    if (status !== 'ACTIVE' && status !== 'SUSPENDED') {
      res.status(400).json({ success: false, message: 'Invalid status. Must be ACTIVE or SUSPENDED.' });
      return;
    }

    const user = queryOne('SELECT full_name, email FROM users WHERE id = ?', [id]);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    run('UPDATE users SET status = ?, updated_at = ? WHERE id = ?', [status, new Date().toISOString(), id]);

    recordAuditLog(
      admin.id,
      admin.email,
      'TOGGLE_USER_STATUS',
      'USER',
      id,
      `Changed user status of ${user.full_name} (${user.email}) to ${status}`
    );

    res.json({ success: true, message: `User status changed to ${status}` });
  } catch (err: any) {
    console.error('toggleUserStatus error:', err);
    res.status(500).json({ success: false, message: 'Failed to update user status' });
  }
}

export function getLoanProductsAdmin(_req: Request, res: Response): void {
  try {
    const products = query('SELECT * FROM loan_products ORDER BY min_amount ASC');
    const formatted = products.map(p => ({
      ...p,
      eligibility_criteria: JSON.parse(p.eligibility_criteria || '[]'),
      required_documents: JSON.parse(p.required_documents || '[]'),
      guarantor_required: Boolean(p.guarantor_required),
      co_applicant_allowed: Boolean(p.co_applicant_allowed),
      is_active: Boolean(p.is_active)
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('getLoanProductsAdmin error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve loan products' });
  }
}

export function createLoanProduct(req: Request, res: Response): void {
  try {
    const {
      name, category, description, minAmount, maxAmount,
      interestRateMin, interestRateMax, defaultInterestRate,
      minTenureMonths, maxTenureMonths, processingFeePercent,
      eligibilityCriteria, requiredDocuments, guarantorRequired,
      coApplicantAllowed, adminApprovalThreshold, badge, icon
    } = req.body;
    const admin = req.user!;

    if (!name || !minAmount || !maxAmount || !defaultInterestRate) {
      res.status(400).json({ success: false, message: 'Required fields missing for loan product.' });
      return;
    }

    const prodId = 'prod_' + name.toLowerCase().replace(/[^a-z0-9]/g, '_') + '_' + Date.now().toString().slice(-4);
    const eligList = Array.isArray(eligibilityCriteria) ? JSON.stringify(eligibilityCriteria) : '[]';
    const docsList = Array.isArray(requiredDocuments) ? JSON.stringify(requiredDocuments) : '[]';

    run(`
      INSERT INTO loan_products (
        id, name, category, description, min_amount, max_amount,
        interest_rate_min, interest_rate_max, default_interest_rate,
        min_tenure_months, max_tenure_months, processing_fee_percent,
        eligibility_criteria, required_documents, guarantor_required,
        co_applicant_allowed, admin_approval_threshold, is_active, badge, icon
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?);
    `, [
      prodId, name, category || 'General', description || '',
      Number(minAmount), Number(maxAmount),
      Number(interestRateMin) || 10, Number(interestRateMax) || 18, Number(defaultInterestRate),
      Number(minTenureMonths) || 6, Number(maxTenureMonths) || 60, Number(processingFeePercent) || 1.5,
      eligList, docsList, guarantorRequired ? 1 : 0, coApplicantAllowed ? 1 : 0,
      Number(adminApprovalThreshold) || 100000, badge || null, icon || 'FileText'
    ]);

    recordAuditLog(
      admin.id,
      admin.email,
      'CREATE_LOAN_PRODUCT',
      'LOAN_PRODUCT',
      prodId,
      `Created loan product ${name} (${prodId})`
    );

    res.status(201).json({ success: true, message: `Loan product ${name} created successfully!`, id: prodId });
  } catch (err: any) {
    console.error('createLoanProduct error:', err);
    res.status(500).json({ success: false, message: 'Failed to create loan product' });
  }
}

export function updateLoanProduct(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const {
      name, description, minAmount, maxAmount,
      interestRateMin, interestRateMax, defaultInterestRate,
      minTenureMonths, maxTenureMonths, processingFeePercent,
      guarantorRequired, coApplicantAllowed, adminApprovalThreshold, isActive, badge
    } = req.body;
    const admin = req.user!;

    const existing = queryOne('SELECT * FROM loan_products WHERE id = ?', [id]);
    if (!existing) {
      res.status(404).json({ success: false, message: 'Loan product not found' });
      return;
    }

    run(`
      UPDATE loan_products
      SET name = COALESCE(?, name),
          description = COALESCE(?, description),
          min_amount = COALESCE(?, min_amount),
          max_amount = COALESCE(?, max_amount),
          interest_rate_min = COALESCE(?, interest_rate_min),
          interest_rate_max = COALESCE(?, interest_rate_max),
          default_interest_rate = COALESCE(?, default_interest_rate),
          min_tenure_months = COALESCE(?, min_tenure_months),
          max_tenure_months = COALESCE(?, max_tenure_months),
          processing_fee_percent = COALESCE(?, processing_fee_percent),
          guarantor_required = COALESCE(?, guarantor_required),
          co_applicant_allowed = COALESCE(?, co_applicant_allowed),
          admin_approval_threshold = COALESCE(?, admin_approval_threshold),
          is_active = COALESCE(?, is_active),
          badge = COALESCE(?, badge)
      WHERE id = ?;
    `, [
      name, description,
      minAmount !== undefined ? Number(minAmount) : null,
      maxAmount !== undefined ? Number(maxAmount) : null,
      interestRateMin !== undefined ? Number(interestRateMin) : null,
      interestRateMax !== undefined ? Number(interestRateMax) : null,
      defaultInterestRate !== undefined ? Number(defaultInterestRate) : null,
      minTenureMonths !== undefined ? Number(minTenureMonths) : null,
      maxTenureMonths !== undefined ? Number(maxTenureMonths) : null,
      processingFeePercent !== undefined ? Number(processingFeePercent) : null,
      guarantorRequired !== undefined ? (guarantorRequired ? 1 : 0) : null,
      coApplicantAllowed !== undefined ? (coApplicantAllowed ? 1 : 0) : null,
      adminApprovalThreshold !== undefined ? Number(adminApprovalThreshold) : null,
      isActive !== undefined ? (isActive ? 1 : 0) : null,
      badge, id
    ]);

    recordAuditLog(
      admin.id,
      admin.email,
      'UPDATE_LOAN_PRODUCT',
      'LOAN_PRODUCT',
      id,
      `Updated loan product ${id}`
    );

    res.json({ success: true, message: 'Loan product updated successfully!' });
  } catch (err: any) {
    console.error('updateLoanProduct error:', err);
    res.status(500).json({ success: false, message: 'Failed to update loan product' });
  }
}

export function getAuditLogs(_req: Request, res: Response): void {
  try {
    const logs = query('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100');
    res.json({ success: true, data: logs });
  } catch (err: any) {
    console.error('getAuditLogs error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve audit logs' });
  }
}
