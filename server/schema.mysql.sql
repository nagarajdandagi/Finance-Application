-- ==========================================================
-- FINOVA FINANCE - Enterprise MySQL Relational Schema
-- ==========================================================

CREATE DATABASE IF NOT EXISTS finova_finance CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE finova_finance;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  full_name VARCHAR(128) NOT NULL,
  email VARCHAR(128) NOT NULL UNIQUE,
  mobile VARCHAR(20) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('CUSTOMER', 'ADMIN') NOT NULL DEFAULT 'CUSTOMER',
  date_of_birth DATE,
  address TEXT,
  city VARCHAR(64),
  state VARCHAR(64),
  pincode VARCHAR(10),
  pan_number VARCHAR(20),
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  monthly_income DECIMAL(15, 2) DEFAULT 0.00,
  employment_type VARCHAR(50),
  company_name VARCHAR(128),
  job_title VARCHAR(100),
  status ENUM('ACTIVE', 'SUSPENDED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 2. Loan Products Table
CREATE TABLE IF NOT EXISTS loan_products (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  description TEXT NOT NULL,
  min_amount DECIMAL(15, 2) NOT NULL,
  max_amount DECIMAL(15, 2) NOT NULL,
  interest_rate_min DECIMAL(5, 2) NOT NULL,
  interest_rate_max DECIMAL(5, 2) NOT NULL,
  default_interest_rate DECIMAL(5, 2) NOT NULL,
  min_tenure_months INT NOT NULL,
  max_tenure_months INT NOT NULL,
  processing_fee_percent DECIMAL(5, 2) NOT NULL DEFAULT 1.00,
  eligibility_criteria JSON NOT NULL,
  required_documents JSON NOT NULL,
  guarantor_required BOOLEAN NOT NULL DEFAULT FALSE,
  co_applicant_allowed BOOLEAN NOT NULL DEFAULT TRUE,
  admin_approval_threshold DECIMAL(15, 2) NOT NULL DEFAULT 100000.00,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  badge VARCHAR(64),
  icon VARCHAR(64)
);

-- 3. Loan Applications Table
CREATE TABLE IF NOT EXISTS loan_applications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  requested_amount DECIMAL(15, 2) NOT NULL,
  tenure_months INT NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  estimated_emi DECIMAL(15, 2) NOT NULL,
  purpose TEXT,
  status ENUM(
    'DRAFT', 'SUBMITTED', 'DOCUMENTS_PENDING', 'UNDER_VERIFICATION',
    'PENDING_ADMIN_REVIEW', 'APPROVED', 'REJECTED',
    'ADDITIONAL_INFORMATION_REQUIRED', 'DISBURSED', 'ACTIVE', 'COMPLETED'
  ) NOT NULL DEFAULT 'SUBMITTED',
  monthly_income DECIMAL(15, 2) NOT NULL,
  employment_type VARCHAR(50) NOT NULL,
  company_name VARCHAR(128),
  job_title VARCHAR(100),
  years_employed DECIMAL(4, 1) DEFAULT 0,
  existing_emis DECIMAL(15, 2) DEFAULT 0,
  monthly_obligations DECIMAL(15, 2) DEFAULT 0,
  debt_to_income_ratio DECIMAL(5, 2) DEFAULT 0,
  credit_score_estimate INT DEFAULT 750,
  bank_name VARCHAR(100),
  account_number VARCHAR(50),
  ifsc_code VARCHAR(20),
  account_holder_name VARCHAR(128),
  rejection_reason TEXT,
  admin_notes TEXT,
  info_request_message TEXT,
  user_clarification_response TEXT,
  approved_amount DECIMAL(15, 2),
  reviewed_by VARCHAR(64),
  reviewed_at DATETIME,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES loan_products(id)
);

-- 4. Loan Documents Table
CREATE TABLE IF NOT EXISTS loan_documents (
  id VARCHAR(64) PRIMARY KEY,
  application_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  file_path VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  verification_status ENUM('PENDING', 'VERIFIED', 'REJECTED') DEFAULT 'PENDING',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES loan_applications(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Guarantors Table
CREATE TABLE IF NOT EXISTS guarantors (
  id VARCHAR(64) PRIMARY KEY,
  application_id VARCHAR(64) NOT NULL,
  full_name VARCHAR(128) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(128),
  address TEXT,
  occupation VARCHAR(100),
  monthly_income DECIMAL(15, 2) DEFAULT 0,
  pan_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
);

-- 6. Co-Applicants Table
CREATE TABLE IF NOT EXISTS co_applicants (
  id VARCHAR(64) PRIMARY KEY,
  application_id VARCHAR(64) NOT NULL,
  full_name VARCHAR(128) NOT NULL,
  relationship VARCHAR(50) NOT NULL,
  mobile VARCHAR(20) NOT NULL,
  email VARCHAR(128),
  address TEXT,
  occupation VARCHAR(100),
  monthly_income DECIMAL(15, 2) DEFAULT 0,
  pan_number VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES loan_applications(id) ON DELETE CASCADE
);

-- 7. Loan Accounts Table
CREATE TABLE IF NOT EXISTS loan_accounts (
  id VARCHAR(64) PRIMARY KEY,
  application_id VARCHAR(64) NOT NULL UNIQUE,
  user_id VARCHAR(64) NOT NULL,
  product_id VARCHAR(64) NOT NULL,
  principal_amount DECIMAL(15, 2) NOT NULL,
  outstanding_balance DECIMAL(15, 2) NOT NULL,
  interest_rate DECIMAL(5, 2) NOT NULL,
  tenure_months INT NOT NULL,
  remaining_tenure_months INT NOT NULL,
  monthly_emi DECIMAL(15, 2) NOT NULL,
  total_payable DECIMAL(15, 2) NOT NULL,
  total_interest DECIMAL(15, 2) NOT NULL,
  total_paid DECIMAL(15, 2) DEFAULT 0,
  total_interest_paid DECIMAL(15, 2) DEFAULT 0,
  disbursement_date DATETIME NOT NULL,
  next_emi_date DATE NOT NULL,
  status ENUM('ACTIVE', 'CLOSED', 'DEFAULTED') NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES loan_applications(id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (product_id) REFERENCES loan_products(id)
);

-- 8. Repayment Schedules Table
CREATE TABLE IF NOT EXISTS repayment_schedules (
  id VARCHAR(64) PRIMARY KEY,
  loan_account_id VARCHAR(64) NOT NULL,
  installment_number INT NOT NULL,
  due_date DATE NOT NULL,
  opening_balance DECIMAL(15, 2) NOT NULL,
  principal_component DECIMAL(15, 2) NOT NULL,
  interest_component DECIMAL(15, 2) NOT NULL,
  emi_amount DECIMAL(15, 2) NOT NULL,
  closing_balance DECIMAL(15, 2) NOT NULL,
  status ENUM('PAID', 'UPCOMING', 'OVERDUE') NOT NULL DEFAULT 'UPCOMING',
  paid_date DATE,
  payment_id VARCHAR(64),
  FOREIGN KEY (loan_account_id) REFERENCES loan_accounts(id) ON DELETE CASCADE
);

-- 9. Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id VARCHAR(64) PRIMARY KEY,
  loan_account_id VARCHAR(64) NOT NULL,
  user_id VARCHAR(64) NOT NULL,
  schedule_id VARCHAR(64),
  amount DECIMAL(15, 2) NOT NULL,
  payment_method VARCHAR(50) NOT NULL,
  transaction_reference VARCHAR(100) NOT NULL,
  status ENUM('SUCCESS', 'PENDING', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
  paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_account_id) REFERENCES loan_accounts(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 10. Transactions Table
CREATE TABLE IF NOT EXISTS transactions (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  loan_account_id VARCHAR(64),
  type ENUM('LOAN_DISBURSEMENT', 'EMI_PAYMENT', 'PROCESSING_FEE', 'REFUND', 'OTHER') NOT NULL,
  amount DECIMAL(15, 2) NOT NULL,
  status ENUM('SUCCESS', 'PENDING', 'FAILED') NOT NULL DEFAULT 'SUCCESS',
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 11. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL,
  title VARCHAR(128) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('INFO', 'SUCCESS', 'WARNING', 'DANGER', 'ACTION_REQUIRED') DEFAULT 'INFO',
  link VARCHAR(255),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 12. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(64) PRIMARY KEY,
  admin_id VARCHAR(64) NOT NULL,
  admin_email VARCHAR(128) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_type VARCHAR(50) NOT NULL,
  target_id VARCHAR(64) NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
