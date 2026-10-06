import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import {
  ShieldAlert,
  Users,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminStats = async () => {
      try {
        setLoading(true);
        const res = await api.get('/admin/stats');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-3">Loading underwriter executive metrics...</p>
      </div>
    );
  }

  const { cards, monthlyTrend, productStats } = stats;

  // Pie chart for Approved vs Rejected
  const decisionPieData = [
    { name: 'Approved / Active', value: cards.approvedCount, color: '#10b981' },
    { name: 'Pending Review', value: cards.totalPending, color: '#f59e0b' },
    { name: 'Rejected', value: cards.rejectedCount, color: '#ef4444' }
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
              OPERATIONS CONSOLE
            </span>
            <span className="text-xs text-slate-400">| Credit Underwriting & Risk</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Finova Underwriting Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            to="/admin/applications"
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md shadow-amber-500/20 transition flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4" /> Review Applications ({cards.pendingReview})
          </Link>
        </div>
      </div>

      {/* Urgent Attention Alert if applications pending review */}
      {cards.pendingReview > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-extrabold flex items-center justify-center flex-shrink-0 shadow">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-amber-950">
                {cards.pendingReview} High-Value Application(s) Awaiting Underwriter Action
              </h3>
              <p className="text-xs text-amber-800 mt-0.5">
                Loans ≥ ₹1,00,000 threshold requiring manual scrutiny of bank statements, DTI, and surety KYC.
              </p>
            </div>
          </div>

          <Link
            to="/admin/applications?status=PENDING_ADMIN_REVIEW"
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs shadow transition whitespace-nowrap"
          >
            Review Queue Now →
          </Link>
        </div>
      )}

      {/* 8 Primary Cards Grid (Section 13) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* 1. Total Customers */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Total Borrowers</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{cards.totalCustomers}</p>
          <span className="text-[11px] text-slate-400">Registered customer accounts</span>
        </div>

        {/* 2. Total Applications */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Total Applications</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{cards.totalApplications}</p>
          <span className="text-[11px] text-slate-400">Total submitted loan files</span>
        </div>

        {/* 3. Pending Review (>= 1L) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Under Review (≥ ₹1L)</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700">{cards.pendingReview}</p>
          <span className="text-[11px] text-amber-600 font-medium">Pending manual underwriter signoff</span>
        </div>

        {/* 4. Approved Loans */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Approved Loans</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-600">{cards.approvedCount}</p>
          <span className="text-[11px] text-slate-400">Sanctioned & disbursed credit</span>
        </div>

        {/* 5. Rejected Loans */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Rejected Files</span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600">{cards.rejectedCount}</p>
          <span className="text-[11px] text-slate-400">High DTI or insufficient credit</span>
        </div>

        {/* 6. Total Disbursed Amount */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Total Capital Disbursed</span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-teal-700">
            ₹{(cards.totalDisbursed / 100000).toFixed(1)} Lakhs
          </p>
          <span className="text-[11px] text-slate-400">Gross funds disbursed</span>
        </div>

        {/* 7. Outstanding Principal */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Active Outstanding Book</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-blue-700">
            ₹{(cards.outstandingLoans / 100000).toFixed(1)} Lakhs
          </p>
          <span className="text-[11px] text-slate-400">Principal under recovery</span>
        </div>

        {/* 8. Active vs Completed count */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-2">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Active vs Closed Loans</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900">
            {cards.activeLoansCount} <span className="text-xs text-slate-400 font-normal">/ {cards.completedLoansCount} closed</span>
          </p>
          <span className="text-[11px] text-slate-400">Performing credit accounts</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Monthly Applications & Disbursals Bar Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Loan Applications & Disbursal Trends</h3>
              <p className="text-[11px] text-slate-500">Monthly underwriting volume overview</p>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">Last 6 Months</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    name === 'disbursed' ? `₹${(Number(val) / 100000).toFixed(1)}L` : val,
                    name === 'disbursed' ? 'Disbursed (₹)' : 'Applications'
                  ]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="applications" fill="#2563eb" radius={[6, 6, 0, 0]} name="Applications" />
                <Bar dataKey="approved" fill="#10b981" radius={[6, 6, 0, 0]} name="Approved" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Approval Decision Ratio Donut */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Credit Decisions Ratio</h3>
          <div className="h-48 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={decisionPieData}
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {decisionPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} Applications`, 'Volume']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs pt-2 border-t border-slate-100">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Approved / Active:
              </span>
              <span className="font-bold text-slate-900">{cards.approvedCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                Under Review:
              </span>
              <span className="font-bold text-amber-700">{cards.totalPending}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                Rejected:
              </span>
              <span className="font-bold text-rose-700">{cards.rejectedCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
