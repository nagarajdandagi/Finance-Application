import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { API_BASE_URL } from '../../services/api';
import { LoanApplication, LoanDocument, Guarantor, CoApplicant } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { ApplicationTimeline } from '../../components/ApplicationTimeline';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  User,
  Building,
  CreditCard,
  ShieldAlert,
  ShieldCheck,
  Eye,
  Check,
  X,
  MessageSquare,
  Clock,
  ArrowLeft
} from 'lucide-react';

export const AdminApplicationReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [application, setApplication] = useState<any | null>(null);
  const [documents, setDocuments] = useState<LoanDocument[]>([]);
  const [guarantor, setGuarantor] = useState<Guarantor | null>(null);
  const [coApplicant, setCoApplicant] = useState<CoApplicant | null>(null);
  const [loading, setLoading] = useState(true);

  // Action Modals State
  const [actionLoading, setActionLoading] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [requestInfoModalOpen, setRequestInfoModalOpen] = useState(false);

  // Approval Form
  const [approvedAmount, setApprovedAmount] = useState<number>(0);
  const [approvedRate, setApprovedRate] = useState<number>(0);
  const [adminNotes, setAdminNotes] = useState('');

  // Rejection Form
  const [rejectionReason, setRejectionReason] = useState('Debt-to-Income ratio exceeds policy limit (max 50%).');

  // Request Info Form
  const [infoMessage, setInfoMessage] = useState('Please provide latest 3 months salary slips and vehicle dealer proforma invoice.');

  const fetchDossier = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/admin/applications/${id}`);
      if (res.data.success) {
        const data = res.data.data;
        setApplication(data);
        setDocuments(data.documents || []);
        setGuarantor(data.guarantor || null);
        setCoApplicant(data.coApplicant || null);
        setApprovedAmount(data.requested_amount);
        setApprovedRate(data.interest_rate);
      }
    } catch (err) {
      console.error('Failed to load application dossier:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDossier();
  }, [id]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/applications/${id}/approve`, {
        approvedAmount,
        interestRate: approvedRate,
        adminNotes
      });
      if (res.data.success) {
        alert(res.data.message);
        setApproveModalOpen(false);
        fetchDossier();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Approval failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/applications/${id}/reject`, {
        rejectionReason,
        adminNotes
      });
      if (res.data.success) {
        alert(res.data.message);
        setRejectModalOpen(false);
        fetchDossier();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rejection failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRequestInfo = async () => {
    if (!infoMessage.trim()) {
      alert('Please specify the required information.');
      return;
    }
    try {
      setActionLoading(true);
      const res = await api.put(`/admin/applications/${id}/request-info`, {
        message: infoMessage,
        adminNotes
      });
      if (res.data.success) {
        alert(res.data.message);
        setRequestInfoModalOpen(false);
        fetchDossier();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Request info failed.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || !application) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-3">Loading underwriter dossier...</p>
      </div>
    );
  }

  const isApproved = ['APPROVED', 'ACTIVE', 'DISBURSED', 'COMPLETED'].includes(application.status);
  const isRejected = application.status === 'REJECTED';

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            to="/admin/applications"
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-2 transition"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Queue
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 font-mono">{application.id}</h1>
            <StatusBadge status={application.status} size="md" />
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                application.riskLevel === 'HIGH'
                  ? 'bg-rose-50 text-rose-700 border border-rose-200'
                  : application.riskLevel === 'MEDIUM'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              }`}
            >
              Risk: {application.riskLevel || 'LOW'} (DTI: {application.debt_to_income_ratio}%)
            </span>
          </div>
        </div>

        {/* Action Panel Buttons */}
        {!isApproved && !isRejected && (
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={() => setApproveModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> Approve & Sanction
            </button>
            <button
              onClick={() => setRequestInfoModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4" /> Request Info
            </button>
            <button
              onClick={() => setRejectModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        )}
      </div>

      {/* Progress Timeline */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Underwriting Lifecycle
        </h3>
        <ApplicationTimeline
          status={application.status}
          requestedAmount={application.requested_amount}
        />
      </div>

      {/* Dossier Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Applicant Profile */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <User className="w-4 h-4 text-blue-600" /> Applicant Identity & KYC
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Legal Name:</span>
              <span className="font-bold text-slate-900">{application.applicant_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Contact:</span>
              <span className="font-semibold text-slate-800">
                {application.applicant_mobile} • {application.applicant_email}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Permanent PAN:</span>
              <span className="font-mono font-bold text-slate-900">
                {application.applicant_pan || 'ABCPS1234F'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Address:</span>
              <span className="font-medium text-slate-700 max-w-[240px] text-right truncate">
                {application.applicant_address || 'Bengaluru, Karnataka'}
              </span>
            </div>
          </div>
        </div>

        {/* Credit & Income Scrutiny */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Credit & Cash Flow Underwriting
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Monthly Net Income:</span>
              <span className="font-bold text-slate-900">
                ₹{application.monthly_income.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Existing Monthly Debts:</span>
              <span className="font-bold text-slate-800">
                ₹{application.existing_emis.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Debt-to-Income (DTI) Ratio:</span>
              <span className={`font-bold ${application.debt_to_income_ratio > 45 ? 'text-amber-600' : 'text-emerald-600'}`}>
                {application.debt_to_income_ratio}% (Benchmark: &lt; 50%)
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Estimated Bureau Score:</span>
              <span className="font-bold text-emerald-600">
                {application.credit_score_estimate || 750} (Score Tier: PRIME)
              </span>
            </div>
          </div>
        </div>

        {/* Loan Request Specifications */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-600" /> Loan Parameters
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Loan Product:</span>
              <span className="font-bold text-slate-900">{application.product_name}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Requested Principal:</span>
              <span className="font-extrabold text-slate-900 text-sm">
                ₹{application.requested_amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Tenure:</span>
              <span className="font-bold text-slate-800">{application.tenure_months} Months</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">System Calculated EMI:</span>
              <span className="font-extrabold text-blue-700">
                ₹{application.estimated_emi.toLocaleString('en-IN')}/mo
              </span>
            </div>
          </div>
        </div>

        {/* Bank & Disbursement Target */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-600" /> Target Disbursement Account
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Bank Name:</span>
              <span className="font-bold text-slate-900">{application.bank_name || 'HDFC Bank'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Masked Account:</span>
              <span className="font-mono font-bold text-slate-800">
                {application.account_number_masked || 'XXXX-XXXX-8765'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">IFSC Code:</span>
              <span className="font-mono font-semibold text-slate-700">{application.ifsc_code || 'HDFC0001234'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Beneficiary:</span>
              <span className="font-semibold text-slate-800">{application.account_holder_name || application.applicant_name}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guarantor & Co-Applicant */}
      {(guarantor || coApplicant) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guarantor && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" /> Guarantor / Surety Details
              </h3>
              <div className="space-y-2 text-xs">
                <p><strong>Name:</strong> {guarantor.full_name} ({guarantor.relationship})</p>
                <p><strong>Mobile:</strong> {guarantor.mobile}</p>
                <p><strong>Occupation:</strong> {guarantor.occupation}</p>
                <p><strong>Monthly Income:</strong> ₹{guarantor.monthly_income?.toLocaleString('en-IN')}</p>
                <p><strong>PAN:</strong> <span className="font-mono">{guarantor.pan_number || 'N/A'}</span></p>
              </div>
            </div>
          )}

          {coApplicant && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" /> Co-Applicant Details
              </h3>
              <div className="space-y-2 text-xs">
                <p><strong>Name:</strong> {coApplicant.full_name} ({coApplicant.relationship})</p>
                <p><strong>Mobile:</strong> {coApplicant.mobile}</p>
                <p><strong>Occupation:</strong> {coApplicant.occupation}</p>
                <p><strong>Monthly Income:</strong> ₹{coApplicant.monthly_income?.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Documents List with Preview Buttons */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-blue-600" /> Uploaded Dossier Documents ({documents.length})
        </h3>

        {documents.length === 0 ? (
          <p className="text-xs text-slate-400 py-3">No documents linked to this application.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="truncate pr-2">
                  <p className="font-bold text-slate-800 truncate">{doc.document_type.replace(/_/g, ' ')}</p>
                  <p className="text-[10px] text-slate-400 truncate">{doc.original_name}</p>
                  <span className="inline-block mt-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                    {doc.verification_status}
                  </span>
                </div>

                <a
                  href={`${API_BASE_URL}/applications/documents/${doc.id}/view`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-xl bg-white border border-slate-200 text-blue-600 hover:text-blue-700 shadow-sm flex-shrink-0"
                  title="View Secure Document"
                >
                  <Eye className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================
          MODAL 1: APPROVE APPLICATION
         ======================================================== */}
      {approveModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" /> Sanction & Disburse Loan
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Approving will generate an active loan account, calculate the full reducing-balance amortization schedule, and disburse credit.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Approved Principal Amount (₹)</label>
                <input
                  type="number"
                  value={approvedAmount}
                  onChange={(e) => setApprovedAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Sanctioned Interest Rate (% p.a.)</label>
                <input
                  type="number"
                  step={0.1}
                  value={approvedRate}
                  onChange={(e) => setApprovedRate(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Underwriter Sanction Notes</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Approved after verifying ITR and satisfactory CIBIL rating"
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setApproveModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleApprove}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md"
              >
                {actionLoading ? 'Sanctioning...' : 'Confirm Loan Approval'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 2: REJECT APPLICATION
         ======================================================== */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-600" /> Reject Loan Application
            </h3>
            <p className="text-xs text-slate-600">
              Rejection requires a documented reason that will be transmitted to the applicant and logged in security audits.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rejection Reason <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="State precise reason for credit denial..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleReject}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md"
              >
                {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL 3: REQUEST MORE INFORMATION
         ======================================================== */}
      {requestInfoModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-5">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-600" /> Request Additional Information
            </h3>
            <p className="text-xs text-slate-600">
              This will update the application status to <strong>ADDITIONAL_INFORMATION_REQUIRED</strong> and prompt the user to provide documents or reply.
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Required Clarification / Missing Documents <span className="text-amber-500">*</span>
              </label>
              <textarea
                rows={3}
                required
                value={infoMessage}
                onChange={(e) => setInfoMessage(e.target.value)}
                placeholder="e.g. Please upload latest 3 months salary slips..."
                className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setRequestInfoModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={handleRequestInfo}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md"
              >
                {actionLoading ? 'Transmitting...' : 'Dispatch Request to Applicant'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
