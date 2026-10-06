import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LoanApplication } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  ArrowRight,
  Plus,
  Clock,
  Layers,
  ChevronRight
} from 'lucide-react';

export const ApplicationsListPage: React.FC = () => {
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApps = async () => {
      try {
        setLoading(true);
        const res = await api.get('/applications/my');
        if (res.data.success) {
          setApplications(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  const filteredApps = applications.filter((app) => {
    const matchesSearch =
      app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (app.product_name && app.product_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Loan Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time underwriting progress, document requests, and approval status.
          </p>
        </div>
        <Link
          to="/apply"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> New Application
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Application ID (e.g. FIN-2026-...) or Loan Type"
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Application Statuses</option>
          <option value="PENDING_ADMIN_REVIEW">Pending Admin Review</option>
          <option value="UNDER_VERIFICATION">Under Verification</option>
          <option value="APPROVED">Approved</option>
          <option value="ACTIVE">Active / Disbursed</option>
          <option value="ADDITIONAL_INFORMATION_REQUIRED">Action Required</option>
          <option value="REJECTED">Rejected</option>
        </select>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3">Retrieving your application dossiers...</p>
        </div>
      ) : filteredApps.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <FileText className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
          <h3 className="text-sm font-bold text-slate-800">No applications found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You don't have any loan applications matching the filter. Click below to start a new application.
          </p>
          <Link
            to="/apply"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            Apply for Loan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredApps.map((app) => (
            <div
              key={app.id}
              onClick={() => navigate(`/applications/${app.id}`)}
              className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-extrabold text-slate-900">{app.id}</span>
                  <StatusBadge status={app.status} size="sm" />
                  {app.requested_amount >= 100000 && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                      ≥ ₹1L Threshold
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800">{app.product_name}</span>
                  <span>•</span>
                  <span>Requested: <strong>₹{app.requested_amount.toLocaleString('en-IN')}</strong></span>
                  <span>•</span>
                  <span>Tenure: <strong>{app.tenure_months} Mos</strong></span>
                  <span>•</span>
                  <span>Est. EMI: <strong>₹{app.estimated_emi.toLocaleString('en-IN')}</strong></span>
                </div>

                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Submitted on{' '}
                  {new Date(app.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                <span className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
                  View Timeline & Dossier <ChevronRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
