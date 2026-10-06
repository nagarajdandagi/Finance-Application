export type UserRole = 'CUSTOMER' | 'ADMIN';

export interface User {
  id: string;
  fullName: string;
  email: string;
  mobile: string;
  role: UserRole;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  panNumber?: string;
  panMasked?: string;
  bankName?: string;
  accountNumber?: string;
  accountMasked?: string;
  ifscCode?: string;
  monthlyIncome?: number;
  employmentType?: string;
  companyName?: string;
  jobTitle?: string;
  status?: 'ACTIVE' | 'SUSPENDED';
  createdAt?: string;
}

export interface LoanProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  min_amount: number;
  max_amount: number;
  interest_rate_min: number;
  interest_rate_max: number;
  default_interest_rate: number;
  min_tenure_months: number;
  max_tenure_months: number;
  processing_fee_percent: number;
  eligibility_criteria: string[];
  required_documents: string[];
  guarantor_required: boolean;
  co_applicant_allowed: boolean;
  admin_approval_threshold: number;
  is_active: boolean;
  badge?: string;
  icon?: string;
}

export type ApplicationStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'DOCUMENTS_PENDING'
  | 'UNDER_VERIFICATION'
  | 'PENDING_ADMIN_REVIEW'
  | 'APPROVED'
  | 'REJECTED'
  | 'ADDITIONAL_INFORMATION_REQUIRED'
  | 'DISBURSED'
  | 'ACTIVE'
  | 'COMPLETED';

export interface LoanApplication {
  id: string;
  user_id: string;
  product_id: string;
  product_name?: string;
  product_category?: string;
  product_badge?: string;
  requested_amount: number;
  tenure_months: number;
  interest_rate: number;
  estimated_emi: number;
  purpose: string;
  status: ApplicationStatus;
  monthly_income: number;
  employment_type: string;
  company_name?: string;
  job_title?: string;
  years_employed?: number;
  existing_emis?: number;
  monthly_obligations?: number;
  debt_to_income_ratio: number;
  credit_score_estimate?: number;
  bank_name?: string;
  account_number?: string;
  account_number_masked?: string;
  ifsc_code?: string;
  account_holder_name?: string;
  rejection_reason?: string;
  admin_notes?: string;
  info_request_message?: string;
  user_clarification_response?: string;
  approved_amount?: number;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  updated_at: string;
  applicant_name?: string;
  applicant_email?: string;
  applicant_mobile?: string;
  riskLevel?: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface LoanDocument {
  id: string;
  application_id: string;
  user_id: string;
  document_type: string;
  file_name: string;
  original_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  uploaded_at: string;
}

export interface Guarantor {
  id: string;
  application_id: string;
  full_name: string;
  relationship: string;
  mobile: string;
  email?: string;
  address?: string;
  occupation?: string;
  monthly_income?: number;
  pan_number?: string;
}

export interface CoApplicant {
  id: string;
  application_id: string;
  full_name: string;
  relationship: string;
  mobile: string;
  email?: string;
  address?: string;
  occupation?: string;
  monthly_income?: number;
  pan_number?: string;
}

export interface LoanAccount {
  id: string;
  application_id: string;
  user_id: string;
  product_id: string;
  product_name?: string;
  principal_amount: number;
  outstanding_balance: number;
  interest_rate: number;
  tenure_months: number;
  remaining_tenure_months: number;
  monthly_emi: number;
  total_payable: number;
  total_interest: number;
  total_paid: number;
  total_interest_paid: number;
  disbursement_date: string;
  next_emi_date: string;
  status: 'ACTIVE' | 'CLOSED' | 'DEFAULTED';
  created_at: string;
  user_name?: string;
}

export interface RepaymentSchedule {
  id: string;
  loan_account_id: string;
  installment_number: number;
  due_date: string;
  opening_balance: number;
  principal_component: number;
  interest_component: number;
  emi_amount: number;
  closing_balance: number;
  status: 'PAID' | 'UPCOMING' | 'OVERDUE';
  paid_date?: string;
  payment_id?: string;
}

export interface Payment {
  id: string;
  loan_account_id: string;
  user_id: string;
  schedule_id?: string;
  amount: number;
  payment_method: string;
  transaction_reference: string;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  paid_at: string;
  product_name?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  loan_account_id?: string;
  type: 'LOAN_DISBURSEMENT' | 'EMI_PAYMENT' | 'PROCESSING_FEE' | 'REFUND' | 'OTHER';
  amount: number;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
  description: string;
  created_at: string;
  user_name?: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER' | 'ACTION_REQUIRED';
  link?: string;
  is_read: number;
  created_at: string;
}

export interface AuditLog {
  id: string;
  admin_id: string;
  admin_email: string;
  action: string;
  target_type: string;
  target_id: string;
  description: string;
  created_at: string;
}
