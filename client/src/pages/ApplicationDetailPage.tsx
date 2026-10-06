import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api, { API_BASE_URL } from '../services/api';
import { LoanApplication, LoanDocument, Guarantor, CoApplicant } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ApplicationTimeline } from '../components/ApplicationTimeline';
import {
  FileText,
  User,
  Building,
  CreditCard,
  AlertTriangle,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  UploadCloud
} from 'lucide-react';

export const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [application, setApplication] = useState<LoanApplication | null>(null);
  const [documents, setDocuments] = useState<LoanDocument[]>([]);
  const [guarantor, setGuarantor] = useState<Guarantor | null>(null);
  const [coApplicant, setCoApplicant] = useState<CoApplicant | null>(null);
  const [loading, setLoading] = useState(true);

  // Clarification reply state
  const [clarificationText, setClarificationText] = useState('');
  const [clarificationSubmitting, setClarificationSubmitting] = useState(false);
  const [clarificationSuccess, setClarificationSuccess] = useState<string | null>(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/applications/${id}`);
      if (res.data.success) {
        setApplication(res.data.data);
        setDocuments(res.data.data.documents || []);
        setGuarantor(res.data.data.guarantor || null);
        setCoApplicant(res.data.data.coApplicant || null);
      }
    } catch (err) {
      console.error('Failed to load application detail:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleClarificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clarificationText.trim()) return;

    try {
      setClarificationSubmitting(true);
      const res = await api.post(`/applications/${id}/clarification`, {
        clarificationResponse: clarificationText
      });

      if (res.data.success) {
        setClarificationSuccess('Your response has been dispatched to the underwriter.');
        setClarificationText('');
        fetchDetails();
      }
    } catch (err) {
      console.error('Error submitting clarification:', err);
    } finally {
      setClarificationSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-3">Loading application dossier...</p>
      </div>
    );
  }

  if (!application) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="font-bold text-slate-800 text-sm">Application Not Found</h3>
        <p className="text-xs text-slate-500 mt-1">
          Could not locate application {id}. Please return to your applications list.
        </p>
        <Link to="/applications" className="mt-4 inline-block text-xs font-bold text-blue-600">
          ← Back to My Applications
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 font-mono">{application.id}</h1>
            <StatusBadge status={application.status} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Product: <strong>{application.product_name}</strong> • Created on{' '}
            {new Date(application.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        {/* If Active / Approved, link to active loan account */}
        {application.status === 'ACTIVE' && (
          <Link
            to={`/loans/account/LN-2026-884920`}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <CreditCard className="w-4 h-4" /> Open Active Loan Account
          </Link>
        )}
      </div>

      {/* Visual Application Timeline (Section 12) */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Application Progress Timeline
        </h3>
        <ApplicationTimeline
          status={application.status}
          requestedAmount={application.requested_amount}
        />
      </div>

      {/* Action Required Alert: Underwriter info request */}
      {application.status === 'ADDITIONAL_INFORMATION_REQUIRED' && (
        <div className="p-6 rounded-3xl bg-amber-50 border border-amber-300 shadow-sm space-y-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-bold text-amber-900">
                Action Required: Additional Information Requested by Underwriter
              </h3>
              <p className="text-xs text-amber-800 mt-1 leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200 mt-2 font-medium">
                "{application.info_request_message}"
              </p>
            </div>
          </div>

          {clarificationSuccess ? (
            <div className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              {clarificationSuccess}
            </div>
          ) : (
            <form onSubmit={handleClarificationSubmit} className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-amber-900">
                Your Clarification / Document Explanation
              </label>
              <textarea
                rows={3}
                required
                value={clarificationText}
                onChange={(e) => setClarificationText(e.target.value)}
                placeholder="State your clarification or explain newly uploaded documents..."
                className="w-full p-3 rounded-xl border border-amber-300 text-xs text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={clarificationSubmitting}
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow-md transition flex items-center gap-2 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {clarificationSubmitting ? 'Submitting...' : 'Submit Response to Underwriter'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* High-Value Notice Banner */}
      {application.requested_amount >= 100000 && application.status === 'PENDING_ADMIN_REVIEW' && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
          <span>
            Because this application exceeds ₹1,00,000, it is currently in queue with the senior credit risk committee. You will receive an automated notification as soon as a determination is made.
          </span>
        </div>
      )}

      {/* Main Dossier Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Loan Request Summary */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard className="w-4 h-4 text-blue-600" /> Loan Request Details
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Requested Amount:</span>
              <span className="font-extrabold text-slate-900 text-sm">
                ₹{application.requested_amount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Interest Rate:</span>
              <span className="font-bold text-slate-800">{application.interest_rate}% p.a.</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Tenure:</span>
              <span className="font-bold text-slate-800">{application.tenure_months} Months</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Estimated Monthly EMI:</span>
              <span className="font-extrabold text-blue-700">
                ₹{application.estimated_emi.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Stated Purpose:</span>
              <span className="font-medium text-slate-700 max-w-[200px] text-right truncate">
                {application.purpose || 'General Need'}
              </span>
            </div>
          </div>
        </div>

        {/* Income & Bank Account */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building className="w-4 h-4 text-blue-600" /> Financial & Disbursement
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Employment Type:</span>
              <span className="font-bold text-slate-800">{application.employment_type}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Monthly Net Income:</span>
              <span className="font-extrabold text-slate-900">
                ₹{application.monthly_income.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Disbursement Bank:</span>
              <span className="font-bold text-slate-800">{application.bank_name || 'HDFC Bank'}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">Masked Account Number:</span>
              <span className="font-mono font-bold text-slate-800">
                {application.account_number_masked || 'XXXX-XXXX-8765'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500">IFSC Code:</span>
              <span className="font-mono font-semibold text-slate-700">{application.ifsc_code}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Guarantor & Co-Applicant Cards */}
      {(guarantor || coApplicant) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guarantor && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-emerald-600" /> Guarantor / Surety
              </h3>
              <div className="space-y-2 text-xs">
                <p><strong>Name:</strong> {guarantor.full_name} ({guarantor.relationship})</p>
                <p><strong>Mobile:</strong> {guarantor.mobile}</p>
                <p><strong>Occupation:</strong> {guarantor.occupation}</p>
                <p><strong>Monthly Income:</strong> ₹{guarantor.monthly_income?.toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {coApplicant && (
            <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" /> Co-Applicant
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

      {/* Uploaded Documents List */}
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
    </div>
  );
};
