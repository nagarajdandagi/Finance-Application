import bcrypt from 'bcryptjs';
import { exec, queryOne, run } from './db';
import { calculateReducingBalanceEmi, generateAmortizationSchedule } from '../utils/calculations';

export async function setupDatabaseSchemaAndSeed(): Promise<void> {
  // Create all required tables
  exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      full_name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      mobile TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'CUSTOMER',
      date_of_birth TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      pan_number TEXT,
      bank_name TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      monthly_income REAL DEFAULT 0,
      employment_type TEXT,
      company_name TEXT,
      job_title TEXT,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS loan_products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      description TEXT NOT NULL,
      min_amount REAL NOT NULL,
      max_amount REAL NOT NULL,
      interest_rate_min REAL NOT NULL,
      interest_rate_max REAL NOT NULL,
      default_interest_rate REAL NOT NULL,
      min_tenure_months INTEGER NOT NULL,
      max_tenure_months INTEGER NOT NULL,
      processing_fee_percent REAL NOT NULL,
      eligibility_criteria TEXT NOT NULL,
      required_documents TEXT NOT NULL,
      guarantor_required INTEGER NOT NULL DEFAULT 0,
      co_applicant_allowed INTEGER NOT NULL DEFAULT 1,
      admin_approval_threshold REAL NOT NULL DEFAULT 100000,
      is_active INTEGER NOT NULL DEFAULT 1,
      badge TEXT,
      icon TEXT
    );

    CREATE TABLE IF NOT EXISTS loan_applications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      requested_amount REAL NOT NULL,
      tenure_months INTEGER NOT NULL,
      interest_rate REAL NOT NULL,
      estimated_emi REAL NOT NULL,
      purpose TEXT,
      status TEXT NOT NULL,
      monthly_income REAL NOT NULL,
      employment_type TEXT NOT NULL,
      company_name TEXT,
      job_title TEXT,
      years_employed REAL DEFAULT 0,
      existing_emis REAL DEFAULT 0,
      monthly_obligations REAL DEFAULT 0,
      debt_to_income_ratio REAL DEFAULT 0,
      credit_score_estimate INTEGER DEFAULT 750,
      bank_name TEXT,
      account_number TEXT,
      ifsc_code TEXT,
      account_holder_name TEXT,
      rejection_reason TEXT,
      admin_notes TEXT,
      info_request_message TEXT,
      user_clarification_response TEXT,
      approved_amount REAL,
      reviewed_by TEXT,
      reviewed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (product_id) REFERENCES loan_products(id)
    );

    CREATE TABLE IF NOT EXISTS loan_documents (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      document_type TEXT NOT NULL,
      file_name TEXT NOT NULL,
      original_name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      file_size INTEGER NOT NULL,
      mime_type TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'PENDING',
      uploaded_at TEXT NOT NULL,
      FOREIGN KEY (application_id) REFERENCES loan_applications(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS guarantors (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      mobile TEXT NOT NULL,
      email TEXT,
      address TEXT,
      occupation TEXT,
      monthly_income REAL DEFAULT 0,
      pan_number TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (application_id) REFERENCES loan_applications(id)
    );

    CREATE TABLE IF NOT EXISTS co_applicants (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL,
      full_name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      mobile TEXT NOT NULL,
      email TEXT,
      address TEXT,
      occupation TEXT,
      monthly_income REAL DEFAULT 0,
      pan_number TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (application_id) REFERENCES loan_applications(id)
    );

    CREATE TABLE IF NOT EXISTS loan_accounts (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL UNIQUE,
      user_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      principal_amount REAL NOT NULL,
      outstanding_balance REAL NOT NULL,
      interest_rate REAL NOT NULL,
      tenure_months INTEGER NOT NULL,
      remaining_tenure_months INTEGER NOT NULL,
      monthly_emi REAL NOT NULL,
      total_payable REAL NOT NULL,
      total_interest REAL NOT NULL,
      total_paid REAL DEFAULT 0,
      total_interest_paid REAL DEFAULT 0,
      disbursement_date TEXT NOT NULL,
      next_emi_date TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'ACTIVE',
      created_at TEXT NOT NULL,
      FOREIGN KEY (application_id) REFERENCES loan_applications(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS repayment_schedules (
      id TEXT PRIMARY KEY,
      loan_account_id TEXT NOT NULL,
      installment_number INTEGER NOT NULL,
      due_date TEXT NOT NULL,
      opening_balance REAL NOT NULL,
      principal_component REAL NOT NULL,
      interest_component REAL NOT NULL,
      emi_amount REAL NOT NULL,
      closing_balance REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'UPCOMING',
      paid_date TEXT,
      payment_id TEXT,
      FOREIGN KEY (loan_account_id) REFERENCES loan_accounts(id)
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      loan_account_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      schedule_id TEXT,
      amount REAL NOT NULL,
      payment_method TEXT NOT NULL,
      transaction_reference TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'SUCCESS',
      paid_at TEXT NOT NULL,
      FOREIGN KEY (loan_account_id) REFERENCES loan_accounts(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      loan_account_id TEXT,
      type TEXT NOT NULL,
      amount REAL NOT NULL,
      status TEXT NOT NULL DEFAULT 'SUCCESS',
      description TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'INFO',
      link TEXT,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      admin_id TEXT NOT NULL,
      admin_email TEXT NOT NULL,
      action TEXT NOT NULL,
      target_type TEXT NOT NULL,
      target_id TEXT NOT NULL,
      description TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
  `);

  // Check if seed data exists
  const existingUser = queryOne('SELECT id FROM users WHERE email = ?', ['rahul@example.com']);
  if (!existingUser) {
    console.log('Seeding initial demo data...');
    await seedDemoData();
    console.log('Demo data seeded successfully!');
  }
}

async function seedDemoData(): Promise<void> {
  const customerPasswordHash = await bcrypt.hash('Password@123', 10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const now = new Date().toISOString();

  // 1. Users
  run(`
    INSERT INTO users (
      id, full_name, email, mobile, password_hash, role,
      date_of_birth, address, city, state, pincode, pan_number,
      bank_name, account_number, ifsc_code, monthly_income,
      employment_type, company_name, job_title, status, created_at, updated_at
    ) VALUES (
      'usr_rahul', 'Rahul Sharma', 'rahul@example.com', '9876543210', ?, 'CUSTOMER',
      '1992-05-14', 'Flat 402, Sunshine Heights, Outer Ring Road', 'Bengaluru', 'Karnataka', '560103', 'ABCPS1234F',
      'HDFC Bank', '50100432198765', 'HDFC0001234', 85000,
      'Salaried', 'Infosys Ltd', 'Senior Software Engineer', 'ACTIVE', ?, ?
    );
  `, [customerPasswordHash, now, now]);

  run(`
    INSERT INTO users (
      id, full_name, email, mobile, password_hash, role,
      date_of_birth, address, city, state, pincode, pan_number,
      bank_name, account_number, ifsc_code, monthly_income,
      employment_type, company_name, job_title, status, created_at, updated_at
    ) VALUES (
      'usr_admin', 'Finova Operations Admin', 'admin@finova.demo', '9876500001', ?, 'ADMIN',
      '1988-11-20', 'Finova Tower, Cyber City Phase 2', 'Gurugram', 'Haryana', '122002', 'FINVA9876A',
      'ICICI Bank', '100200300400', 'ICIC0000001', 150000,
      'Salaried', 'Finova Financial Services Pvt Ltd', 'Credit Risk Manager', 'ACTIVE', ?, ?
    );
  `, [adminPasswordHash, now, now]);

  // Additional realistic demo user
  run(`
    INSERT INTO users (
      id, full_name, email, mobile, password_hash, role,
      date_of_birth, address, city, state, pincode, pan_number,
      bank_name, account_number, ifsc_code, monthly_income,
      employment_type, company_name, job_title, status, created_at, updated_at
    ) VALUES (
      'usr_priya', 'Priya Patel', 'priya.patel@example.com', '9811223344', ?, 'CUSTOMER',
      '1995-08-22', 'Plot 12, Navrangpura', 'Ahmedabad', 'Gujarat', '380009', 'BKWPP9871D',
      'State Bank of India', '334455667788', 'SBIN0004567', 62000,
      'Self-employed', 'Patel Design Studio', 'Creative Director', 'ACTIVE', ?, ?
    );
  `, [customerPasswordHash, now, now]);

  // 2. Centralized Loan Products Configuration
  const products = [
    {
      id: 'prod_personal',
      name: 'Personal Loan',
      category: 'Personal',
      description: 'Quick collateral-free loans for vacations, weddings, medical expenses or lifestyle needs.',
      min_amount: 25000,
      max_amount: 1500000,
      interest_rate_min: 10.5,
      interest_rate_max: 18.0,
      default_interest_rate: 11.5,
      min_tenure_months: 6,
      max_tenure_months: 60,
      processing_fee_percent: 1.5,
      eligibility_criteria: JSON.stringify([
        'Minimum monthly salary of ₹25,000',
        'Minimum age 21 years and maximum 58 years',
        'Credit score of 650 or above',
        'At least 1 year of continuous employment'
      ]),
      required_documents: JSON.stringify([
        'PAN Card',
        'Identity Proof (Aadhaar / Passport / Voter ID)',
        'Address Proof (Utility Bill / Rent Agreement)',
        'Last 3 Months Salary Slips',
        'Last 6 Months Bank Statement'
      ]),
      guarantor_required: 0,
      co_applicant_allowed: 1,
      admin_approval_threshold: 100000,
      badge: 'Most Popular',
      icon: 'UserCheck'
    },
    {
      id: 'prod_home',
      name: 'Home Loan',
      category: 'Property',
      description: 'Competitive interest rates with flexible tenure up to 30 years to buy, build or renovate your dream home.',
      min_amount: 500000,
      max_amount: 15000000,
      interest_rate_min: 7.8,
      interest_rate_max: 11.5,
      default_interest_rate: 8.5,
      min_tenure_months: 24,
      max_tenure_months: 360,
      processing_fee_percent: 0.5,
      eligibility_criteria: JSON.stringify([
        'Salaried or self-employed with stable income',
        'Minimum age 23 years and maximum 65 years',
        'Minimum monthly household income ₹40,000',
        'Credit score 700+'
      ]),
      required_documents: JSON.stringify([
        'PAN Card',
        'Identity & Address Proof',
        'Property Sale Agreement / Allotment Letter',
        'Last 2 Years ITR / Form 16',
        'Last 6 Months Bank Statements'
      ]),
      guarantor_required: 1,
      co_applicant_allowed: 1,
      admin_approval_threshold: 100000,
      badge: 'Lowest Rate',
      icon: 'Home'
    },
    {
      id: 'prod_education',
      name: 'Education Loan',
      category: 'Education',
      description: 'Fund domestic or international higher education with moratorium period and flexible repayment.',
      min_amount: 50000,
      max_amount: 4000000,
      interest_rate_min: 8.5,
      interest_rate_max: 13.0,
      default_interest_rate: 9.5,
      min_tenure_months: 12,
      max_tenure_months: 120,
      processing_fee_percent: 1.0,
      eligibility_criteria: JSON.stringify([
        'Indian citizen with admission secured in recognized institution',
        'Co-applicant / Parent with verifiable income source',
        'Good academic standing'
      ]),
      required_documents: JSON.stringify([
        'Admission Confirmation Letter with Fee Structure',
        'Mark sheets of 10th, 12th and Graduation',
        'Co-applicant KYC & Income Proof',
        'Bank statements of Co-applicant'
      ]),
      guarantor_required: 1,
      co_applicant_allowed: 1,
      admin_approval_threshold: 100000,
      badge: 'Tax Benefit (Sec 80E)',
      icon: 'GraduationCap'
    },
    {
      id: 'prod_vehicle',
      name: 'Vehicle Loan',
      category: 'Automobile',
      description: 'Attractive rates on new and pre-owned four-wheelers and electric vehicles with up to 90% financing.',
      min_amount: 50000,
      max_amount: 2500000,
      interest_rate_min: 8.9,
      interest_rate_max: 14.5,
      default_interest_rate: 9.2,
      min_tenure_months: 12,
      max_tenure_months: 84,
      processing_fee_percent: 1.0,
      eligibility_criteria: JSON.stringify([
        'Age between 21 and 65 years',
        'Minimum annual income ₹3,00,000',
        'Valid Driving License'
      ]),
      required_documents: JSON.stringify([
        'PAN Card & Driving License',
        'Address Proof',
        'Vehicle Pro-forma Invoice from Dealer',
        'Last 3 Months Salary Slip / ITR'
      ]),
      guarantor_required: 0,
      co_applicant_allowed: 1,
      admin_approval_threshold: 100000,
      badge: 'Fast Clearance',
      icon: 'Car'
    },
    {
      id: 'prod_business',
      name: 'Business Loan',
      category: 'Commercial',
      description: 'Working capital, machinery purchase, or business expansion loans tailored for enterprises and MSMEs.',
      min_amount: 100000,
      max_amount: 5000000,
      interest_rate_min: 11.5,
      interest_rate_max: 19.5,
      default_interest_rate: 13.0,
      min_tenure_months: 12,
      max_tenure_months: 84,
      processing_fee_percent: 2.0,
      eligibility_criteria: JSON.stringify([
        'Business vintage of minimum 2 years',
        'Minimum annual turnover ₹15,00,000',
        'GST registered business entity'
      ]),
      required_documents: JSON.stringify([
        'PAN of Business & Proprietor/Partners',
        'GST Returns (Last 12 months)',
        'Audited Financial Statements (Last 2 years)',
        'Business Bank Statements (12 months)'
      ]),
      guarantor_required: 1,
      co_applicant_allowed: 1,
      admin_approval_threshold: 100000,
      badge: 'MSME Special',
      icon: 'Briefcase'
    },
    {
      id: 'prod_emergency',
      name: 'Emergency / Micro Loan',
      category: 'Instant',
      description: 'Ultra-fast disbursal micro-loans under ₹1 Lakh with minimal documentation for urgent requirements.',
      min_amount: 10000,
      max_amount: 95000,
      interest_rate_min: 12.0,
      interest_rate_max: 20.0,
      default_interest_rate: 13.5,
      min_tenure_months: 3,
      max_tenure_months: 24,
      processing_fee_percent: 2.0,
      eligibility_criteria: JSON.stringify([
        'Age 21-55 years',
        'Minimum income ₹18,000 per month',
        'Active bank account with UPI/Netbanking'
      ]),
      required_documents: JSON.stringify([
        'PAN Card',
        'Aadhaar / Voter ID',
        'Bank Statement (3 months)'
      ]),
      guarantor_required: 0,
      co_applicant_allowed: 0,
      admin_approval_threshold: 100000,
      badge: 'Instant Automated Disbursal',
      icon: 'Zap'
    }
  ];

  for (const p of products) {
    run(`
      INSERT INTO loan_products (
        id, name, category, description, min_amount, max_amount,
        interest_rate_min, interest_rate_max, default_interest_rate,
        min_tenure_months, max_tenure_months, processing_fee_percent,
        eligibility_criteria, required_documents, guarantor_required,
        co_applicant_allowed, admin_approval_threshold, is_active, badge, icon
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?);
    `, [
      p.id, p.name, p.category, p.description, p.min_amount, p.max_amount,
      p.interest_rate_min, p.interest_rate_max, p.default_interest_rate,
      p.min_tenure_months, p.max_tenure_months, p.processing_fee_percent,
      p.eligibility_criteria, p.required_documents, p.guarantor_required,
      p.co_applicant_allowed, p.admin_approval_threshold, p.badge, p.icon
    ]);
  }

  // 3. Realistic Demo Applications for Rahul Sharma

  // Application 1: ₹5,00,000 Personal Loan -> APPROVED & DISBURSED -> ACTIVE LOAN
  const app1Emi = calculateReducingBalanceEmi(500000, 11.5, 36);
  run(`
    INSERT INTO loan_applications (
      id, user_id, product_id, requested_amount, tenure_months, interest_rate,
      estimated_emi, purpose, status, monthly_income, employment_type,
      company_name, job_title, years_employed, existing_emis, monthly_obligations,
      debt_to_income_ratio, credit_score_estimate, bank_name, account_number,
      ifsc_code, account_holder_name, approved_amount, reviewed_by, reviewed_at,
      created_at, updated_at
    ) VALUES (
      'FIN-2026-000101', 'usr_rahul', 'prod_personal', 500000, 36, 11.5,
      ?, 'Home Renovation & Electronics', 'ACTIVE', 85000, 'Salaried',
      'Infosys Ltd', 'Senior Software Engineer', 4.5, 0, 12000,
      32, 785, 'HDFC Bank', '50100432198765', 'HDFC0001234', 'Rahul Sharma',
      500000, 'usr_admin', '2026-01-10T11:30:00Z', '2026-01-08T09:15:00Z', '2026-01-10T12:00:00Z'
    );
  `, [app1Emi.monthlyEmi]);

  // Documents for Application 1
  const app1Docs = [
    { type: 'PAN_CARD', name: 'rahul_pan_card.pdf', size: 184500, mime: 'application/pdf' },
    { type: 'IDENTITY_PROOF', name: 'aadhaar_card_masked.pdf', size: 245000, mime: 'application/pdf' },
    { type: 'INCOME_PROOF', name: 'infosys_salary_slips_q4.pdf', size: 450000, mime: 'application/pdf' },
    { type: 'BANK_STATEMENT', name: 'hdfc_statement_6m.pdf', size: 780000, mime: 'application/pdf' }
  ];
  for (const doc of app1Docs) {
    run(`
      INSERT INTO loan_documents (
        id, application_id, user_id, document_type, file_name, original_name,
        file_path, file_size, mime_type, verification_status, uploaded_at
      ) VALUES (
        ?, 'FIN-2026-000101', 'usr_rahul', ?, ?, ?,
        'uploads/sample_doc.pdf', ?, ?, 'VERIFIED', '2026-01-08T09:25:00Z'
      );
    `, ['doc_' + Math.random().toString(36).substr(2, 9), doc.type, doc.name, doc.name, doc.size, doc.mime]);
  }

  // Active Loan Account for Application 1
  const loan1Schedule = generateAmortizationSchedule(500000, 11.5, 36, new Date('2026-01-10'));
  // Rahul has already paid 3 installments!
  let totalPaid = 0;
  let totalInterestPaid = 0;
  for (let i = 0; i < 3; i++) {
    loan1Schedule[i].status = 'PAID';
    loan1Schedule[i].paidDate = loan1Schedule[i].dueDate;
    totalPaid += loan1Schedule[i].emiAmount;
    totalInterestPaid += loan1Schedule[i].interestComponent;
  }
  const currentOutstanding = loan1Schedule[2].closingBalance;
  const nextDueDate = loan1Schedule[3].dueDate;

  run(`
    INSERT INTO loan_accounts (
      id, application_id, user_id, product_id, principal_amount,
      outstanding_balance, interest_rate, tenure_months, remaining_tenure_months,
      monthly_emi, total_payable, total_interest, total_paid, total_interest_paid,
      disbursement_date, next_emi_date, status, created_at
    ) VALUES (
      'LN-2026-884920', 'FIN-2026-000101', 'usr_rahul', 'prod_personal', 500000,
      ?, 11.5, 36, 33,
      ?, ?, ?, ?, ?,
      '2026-01-10T12:00:00Z', ?, 'ACTIVE', '2026-01-10T12:00:00Z'
    );
  `, [
    currentOutstanding,
    app1Emi.monthlyEmi,
    app1Emi.totalRepayment,
    app1Emi.totalInterest,
    totalPaid,
    totalInterestPaid,
    nextDueDate
  ]);

  // Insert Amortization Schedule for Loan 1
  for (const row of loan1Schedule) {
    run(`
      INSERT INTO repayment_schedules (
        id, loan_account_id, installment_number, due_date, opening_balance,
        principal_component, interest_component, emi_amount, closing_balance,
        status, paid_date, payment_id
      ) VALUES (
        ?, 'LN-2026-884920', ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?
      );
    `, [
      'sch_' + row.installmentNumber + '_884920',
      row.installmentNumber,
      row.dueDate,
      row.openingBalance,
      row.principalComponent,
      row.interestComponent,
      row.emiAmount,
      row.closingBalance,
      row.status,
      row.status === 'PAID' ? row.dueDate : null,
      row.status === 'PAID' ? 'PAY-2026-0' + row.installmentNumber : null
    ]);
  }

  // Add payments for the 3 paid installments
  for (let i = 1; i <= 3; i++) {
    const pDate = loan1Schedule[i - 1].dueDate;
    run(`
      INSERT INTO payments (
        id, loan_account_id, user_id, schedule_id, amount,
        payment_method, transaction_reference, status, paid_at
      ) VALUES (
        ?, 'LN-2026-884920', 'usr_rahul', ?, ?,
        'UPI', ?, 'SUCCESS', ?
      );
    `, [
      'PAY-2026-0' + i,
      'sch_' + i + '_884920',
      app1Emi.monthlyEmi,
      'UPI/2026/FIN/' + (789400 + i),
      pDate + 'T14:30:00Z'
    ]);

    run(`
      INSERT INTO transactions (
        id, user_id, loan_account_id, type, amount, status, description, created_at
      ) VALUES (
        ?, 'usr_rahul', 'LN-2026-884920', 'EMI_PAYMENT', ?,
        'SUCCESS', ?, ?
      );
    `, [
      'TXN-2026-' + (54120 + i),
      app1Emi.monthlyEmi,
      'EMI Payment - Installment #' + i + ' for Loan LN-2026-884920',
      pDate + 'T14:30:00Z'
    ]);
  }

  // Disbursement Transaction for Loan 1
  run(`
    INSERT INTO transactions (
      id, user_id, loan_account_id, type, amount, status, description, created_at
    ) VALUES (
      'TXN-2026-50001', 'usr_rahul', 'LN-2026-884920', 'LOAN_DISBURSEMENT', 500000,
      'SUCCESS', 'Loan Disbursed to HDFC Bank A/c ending 8765', '2026-01-10T12:00:00Z'
    );
  `);

  // Processing Fee Transaction for Loan 1
  run(`
    INSERT INTO transactions (
      id, user_id, loan_account_id, type, amount, status, description, created_at
    ) VALUES (
      'TXN-2026-50002', 'usr_rahul', 'LN-2026-884920', 'PROCESSING_FEE', 7500,
      'SUCCESS', 'Processing fee (1.5% + GST) for Loan FIN-2026-000101', '2026-01-10T11:45:00Z'
    );
  `);

  // Application 2: ₹2,50,000 Business Expansion Loan -> PENDING ADMIN REVIEW (>= ₹1,00,000!)
  const app2Emi = calculateReducingBalanceEmi(250000, 13.0, 24);
  run(`
    INSERT INTO loan_applications (
      id, user_id, product_id, requested_amount, tenure_months, interest_rate,
      estimated_emi, purpose, status, monthly_income, employment_type,
      company_name, job_title, years_employed, existing_emis, monthly_obligations,
      debt_to_income_ratio, credit_score_estimate, bank_name, account_number,
      ifsc_code, account_holder_name, created_at, updated_at
    ) VALUES (
      'FIN-2026-000102', 'usr_rahul', 'prod_business', 250000, 24, 13.0,
      ?, 'E-commerce Tech Inventory Purchase', 'PENDING_ADMIN_REVIEW', 85000, 'Salaried',
      'Infosys Ltd', 'Senior Software Engineer', 4.5, 16490, 15000,
      38, 765, 'HDFC Bank', '50100432198765', 'HDFC0001234', 'Rahul Sharma',
      '2026-09-28T16:20:00Z', '2026-09-28T16:20:00Z'
    );
  `, [app2Emi.monthlyEmi]);

  // Documents for Application 2
  run(`
    INSERT INTO loan_documents (
      id, application_id, user_id, document_type, file_name, original_name,
      file_path, file_size, mime_type, verification_status, uploaded_at
    ) VALUES (
      'doc_buss_102', 'FIN-2026-000102', 'usr_rahul', 'BUSINESS_PROOF', 'gst_registration_cert.pdf',
      'gst_registration_cert.pdf', 'uploads/sample_doc.pdf', 312000, 'application/pdf', 'PENDING', '2026-09-28T16:25:00Z'
    );
  `);

  // Guarantor for Application 2
  run(`
    INSERT INTO guarantors (
      id, application_id, full_name, relationship, mobile, email,
      address, occupation, monthly_income, pan_number, created_at
    ) VALUES (
      'guar_102', 'FIN-2026-000102', 'Suresh Sharma', 'Father', '9844001122', 'suresh.sharma@example.com',
      'Flat 101, Green Meadows, Bengaluru', 'Retired Govt Officer / Pensioner', 45000, 'ABGPS9988H', '2026-09-28T16:22:00Z'
    );
  `);

  // Application 3: ₹60,000 Emergency Loan -> APPROVED (< ₹1,00,000, normal workflow)
  const app3Emi = calculateReducingBalanceEmi(60000, 13.5, 12);
  run(`
    INSERT INTO loan_applications (
      id, user_id, product_id, requested_amount, tenure_months, interest_rate,
      estimated_emi, purpose, status, monthly_income, employment_type,
      company_name, job_title, years_employed, existing_emis, monthly_obligations,
      debt_to_income_ratio, credit_score_estimate, bank_name, account_number,
      ifsc_code, account_holder_name, approved_amount, reviewed_by, reviewed_at,
      created_at, updated_at
    ) VALUES (
      'FIN-2026-000103', 'usr_rahul', 'prod_emergency', 60000, 12, 13.5,
      ?, 'Family Medical Checkup & Insurance Co-pay', 'APPROVED', 85000, 'Salaried',
      'Infosys Ltd', 'Senior Software Engineer', 4.5, 16490, 15000,
      37, 780, 'HDFC Bank', '50100432198765', 'HDFC0001234', 'Rahul Sharma',
      60000, 'SYSTEM_AUTO_RULE', '2026-10-02T10:05:00Z', '2026-10-02T10:00:00Z', '2026-10-02T10:05:00Z'
    );
  `, [app3Emi.monthlyEmi]);

  // Application 4: ₹1,20,000 Vehicle Loan -> ADDITIONAL_INFORMATION_REQUIRED
  const app4Emi = calculateReducingBalanceEmi(120000, 9.2, 24);
  run(`
    INSERT INTO loan_applications (
      id, user_id, product_id, requested_amount, tenure_months, interest_rate,
      estimated_emi, purpose, status, monthly_income, employment_type,
      company_name, job_title, years_employed, existing_emis, monthly_obligations,
      debt_to_income_ratio, credit_score_estimate, bank_name, account_number,
      ifsc_code, account_holder_name, info_request_message, reviewed_by, reviewed_at,
      created_at, updated_at
    ) VALUES (
      'FIN-2026-000104', 'usr_rahul', 'prod_vehicle', 120000, 24, 9.2,
      ?, 'Electric Scooter (Ather 450X) Purchase', 'ADDITIONAL_INFORMATION_REQUIRED', 85000, 'Salaried',
      'Infosys Ltd', 'Senior Software Engineer', 4.5, 16490, 15000,
      37, 760, 'HDFC Bank', '50100432198765', 'HDFC0001234', 'Rahul Sharma',
      'Please upload the vehicle dealer proforma invoice and updated 3 months salary slip to verify current employer bonus component.',
      'usr_admin', '2026-10-04T15:20:00Z', '2026-10-03T11:15:00Z', '2026-10-04T15:20:00Z'
    );
  `, [app4Emi.monthlyEmi]);

  // 4. Notifications
  const sampleNotifications = [
    {
      userId: 'usr_rahul',
      title: 'Action Required: Additional Info for FIN-2026-000104',
      message: 'Admin requested: Please upload vehicle proforma invoice and latest salary slip.',
      type: 'ACTION_REQUIRED',
      link: '/applications/FIN-2026-000104',
      isRead: 0,
      date: '2026-10-04T15:20:00Z'
    },
    {
      userId: 'usr_rahul',
      title: 'Loan Approved: FIN-2026-000103',
      message: 'Your emergency loan application of ₹60,000 has been approved via automated verification!',
      type: 'SUCCESS',
      link: '/applications/FIN-2026-000103',
      isRead: 0,
      date: '2026-10-02T10:05:00Z'
    },
    {
      userId: 'usr_rahul',
      title: 'EMI Payment Successful',
      message: 'Your EMI installment of ₹16,490 for Loan LN-2026-884920 has been received.',
      type: 'SUCCESS',
      link: '/loans/account/LN-2026-884920',
      isRead: 1,
      date: '2026-04-10T14:30:00Z'
    },
    {
      userId: 'usr_rahul',
      title: 'Upcoming EMI Due Reminder',
      message: 'Your next EMI of ₹16,490 is due on ' + nextDueDate + '. Keep your account funded.',
      type: 'WARNING',
      link: '/payments',
      isRead: 0,
      date: '2026-10-05T08:00:00Z'
    },
    // Admin notification for high value loan
    {
      userId: 'ADMIN',
      title: 'High-Value Loan Review Required: FIN-2026-000102',
      message: 'Applicant Rahul Sharma has requested ₹2,50,000 for Business Loan. Requires underwriter review.',
      type: 'WARNING',
      link: '/admin/applications/FIN-2026-000102',
      isRead: 0,
      date: '2026-09-28T16:20:00Z'
    }
  ];

  for (const n of sampleNotifications) {
    run(`
      INSERT INTO notifications (
        id, user_id, title, message, type, link, is_read, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [
      'notif_' + Math.random().toString(36).substr(2, 9),
      n.userId,
      n.title,
      n.message,
      n.type,
      n.link,
      n.isRead,
      n.date
    ]);
  }

  // 5. Audit Log Seed
  run(`
    INSERT INTO audit_logs (
      id, admin_id, admin_email, action, target_type, target_id, description, created_at
    ) VALUES (
      'aud_001', 'usr_admin', 'admin@finova.demo', 'APPROVE_APPLICATION', 'APPLICATION',
      'FIN-2026-000101', 'Approved Personal Loan ₹5,00,000 for Rahul Sharma after DTI verification (32%)', '2026-01-10T11:30:00Z'
    );
  `);
  run(`
    INSERT INTO audit_logs (
      id, admin_id, admin_email, action, target_type, target_id, description, created_at
    ) VALUES (
      'aud_002', 'usr_admin', 'admin@finova.demo', 'REQUEST_INFO', 'APPLICATION',
      'FIN-2026-000104', 'Requested dealer invoice and salary verification for Vehicle Loan FIN-2026-000104', '2026-10-04T15:20:00Z'
    );
  `);
}
