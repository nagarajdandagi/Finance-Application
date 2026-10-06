import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { LoanApplication } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import {
  FileText,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  ChevronRight,
  TrendingDown
} from 'lucide-react';

export const AdminApplicationsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => searchParams.get('status') || 'ALL');
  const [amountFilter, setAmountFilter] = useState('ALL');

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        let url = '/admin/applications';
        const params: string[] = [];

        if (statusFilter !== 'ALL') params.push(`status=${statusFilter}`);
        if (amountFilter === 'HIGH') params.push('minAmount=100000');
        if (amountFilter === 'LOW') params.push('maxAmount=99999');

        if (params.length > 0) {
          url += '?' + params.join('&');
        }

        const res = await api.get(url);
        if (res.data.success) {
          setApplications(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, [statusFilter, amountFilter]);

  const filtered = applications.filter((app) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      app.id.toLowerCase().includes(term) ||
      (app.applicant_name && app.applicant_name.toLowerCase().includes(term)) ||
      (app.applicant_mobile && app.applicant_mobile.includes(term)) ||
      (app.product_name && app.product_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Underwriter Loan Applications Queue
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Review dossier compliance, debt-to-income ratios, uploaded proofs, and render credit decisions.
          </p>
        </div>
        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          {filtered.length} Applications Displayed
        </span>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        <div className="sm:col-span-6 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by ID (FIN-2026-...), Applicant Name, Mobile..."
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Application Statuses</option>
            <option value="PENDING_ADMIN_REVIEW">Pending Admin Review (≥ ₹1L)</option>
            <option value="UNDER_VERIFICATION">Under Verification</option>
            <option value="APPROVED">Approved / Disbursed</option>
            <option value="ADDITIONAL_INFORMATION_REQUIRED">Action Required (Info Requested)</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <div className="sm:col-span-3">
          <select
            value={amountFilter}
            onChange={(e) => setAmountFilter(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="ALL">All Amounts</option>
            <option value="HIGH">≥ ₹1,00,000 (Mandatory Review)</option>
            <option value="LOW">&lt; ₹1,00,000 (Automated Route)</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3">Fetching queue from database...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
          No applications found matching the selected filter criteria.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Loan Product</th>
                  <th className="py-3 px-4 text-right">Requested</th>
                  <th className="py-3 px-4 text-right">Monthly Income</th>
                  <th className="py-3 px-4 text-center">Risk / DTI</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{app.id}</td>
                    <td className="py-3 px-4">
                      <p className="font-bold text-slate-900">{app.applicant_name}</p>
                      <p className="text-[10px] text-slate-400">{app.applicant_mobile}</p>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{app.product_name}</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                      ₹{app.requested_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-600">
                      ₹{app.monthly_income.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          app.riskLevel === 'HIGH'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : app.riskLevel === 'MEDIUM'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {app.riskLevel || 'LOW'} ({app.debt_to_income_ratio}%)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <StatusBadge status={app.status} size="sm" />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        to={`/admin/applications/${app.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition"
                      >
                        <Eye className="w-3.5 h-3.5" /> Review Dossier
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
