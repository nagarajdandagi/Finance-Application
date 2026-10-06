import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { LoanAccount, LoanApplication, Payment, Transaction } from '../types';
import {
  CreditCard,
  DollarSign,
  Calendar,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FilePlus,
  Calculator,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Activity,
  Layers,
  ChevronRight
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [loansRes, appsRes, payRes, txnRes] = await Promise.all([
          api.get('/loans/my'),
          api.get('/applications/my'),
          api.get('/payments/history'),
          api.get('/transactions')
        ]);

        if (loansRes.data.success) setLoans(loansRes.data.data);
        if (appsRes.data.success) setApplications(appsRes.data.data);
        if (payRes.data.success) setPayments(payRes.data.data);
        if (txnRes.data.success) setTransactions(txnRes.data.data);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Greeting based on time
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Metrics calculation
  const totalLoanAmount = loans.reduce((acc, l) => acc + l.principal_amount, 0);
  const outstandingBalance = loans
    .filter((l) => l.status === 'ACTIVE')
    .reduce((acc, l) => acc + l.outstanding_balance, 0);

  const activeLoans = loans.filter((l) => l.status === 'ACTIVE');
  const completedLoans = loans.filter((l) => l.status === 'CLOSED');
  const pendingApps = applications.filter(
    (a) =>
      a.status === 'PENDING_ADMIN_REVIEW' ||
      a.status === 'UNDER_VERIFICATION' ||
      a.status === 'ADDITIONAL_INFORMATION_REQUIRED'
  );

  // Next upcoming EMI
  const primaryLoan = activeLoans[0];
  const nextEmiAmount = primaryLoan?.monthly_emi || 0;
  const nextEmiDate = primaryLoan?.next_emi_date || 'N/A';

  // Chart data 1: Principal vs Interest
  const totalPrincipalPaid = loans.reduce((acc, l) => acc + (l.total_paid - l.total_interest_paid), 0);
  const totalInterestPaid = loans.reduce((acc, l) => acc + l.total_interest_paid, 0);

  const balancePieData = [
    { name: 'Loan Balance', value: Math.max(1, outstandingBalance), color: '#2563eb' },
    { name: 'Principal Repaid', value: Math.max(1, totalPrincipalPaid), color: '#10b981' },
    { name: 'Interest Serviced', value: Math.max(1, totalInterestPaid), color: '#f59e0b' }
  ];

  // Chart data 2: Monthly EMI payment history
  const monthlyPaymentHistory = [
    { month: 'Apr 2026', paid: 16490 },
    { month: 'May 2026', paid: 16490 },
    { month: 'Jun 2026', paid: 16490 },
    { month: 'Jul 2026', paid: 16490 },
    { month: 'Aug 2026', paid: 16490 },
    { month: 'Sep 2026', paid: 16490 }
  ];

  return (
    <div className="space-y-8">
      {/* Top Greeting & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {greeting}, {user?.fullName}!
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Welcome to your Finova central financial overview. Here is your active credit status.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/apply"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5"
          >
            <FilePlus className="w-4 h-4" /> Apply for Loan
          </Link>
          <Link
            to="/payments"
            className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs border border-slate-200 shadow-sm transition flex items-center gap-1.5"
          >
            <DollarSign className="w-4 h-4 text-emerald-600" /> Pay EMI
          </Link>
        </div>
      </div>

      {/* Top 4 Core Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Loan Amount */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Total Sanctioned Loan</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">
              ₹{totalLoanAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Across all approved credit accounts</p>
          </div>
        </div>

        {/* Card 2: Loan Balance (Outstanding) */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Loan Balance (Outstanding)</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-blue-700">
              ₹{outstandingBalance.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Outstanding principal balance</p>
          </div>
        </div>

        {/* Card 3: Next EMI */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Next Upcoming EMI</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div>
            <p className="text-2xl font-extrabold text-slate-900">
              ₹{nextEmiAmount.toLocaleString('en-IN')}
            </p>
            <p className="text-[11px] text-amber-600 font-medium mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Due on {nextEmiDate}
            </p>
          </div>
        </div>

        {/* Card 4: Credit Health Gauge */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-500">Eligibility & Credit Score</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-extrabold text-emerald-600">785</p>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                EXCELLENT
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">Eligible for prime interest rates</p>
          </div>
        </div>
      </div>

      {/* Secondary 3 Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Loans</p>
            <p className="text-lg font-bold text-slate-900">{activeLoans.length}</p>
          </div>
          <Link to="/loans/active" className="text-xs font-bold text-blue-600 hover:underline">
            View All →
          </Link>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Completed Loans</p>
            <p className="text-lg font-bold text-slate-900">{completedLoans.length}</p>
          </div>
          <span className="text-xs font-medium text-slate-400">100% Repaid</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Applications</p>
            <p className="text-lg font-bold text-amber-700">{pendingApps.length}</p>
          </div>
          <Link to="/applications" className="text-xs font-bold text-blue-600 hover:underline">
            Track Status →
          </Link>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Chart 1: Principal vs Interest Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Loan Portfolio Distribution</h3>
            <span className="text-[10px] text-slate-400">Principal vs Interest</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={balancePieData}
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {balancePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => `₹${Number(val).toLocaleString('en-IN')}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center text-xs">
            <div>
              <span className="block text-[10px] text-slate-400">Outstanding</span>
              <span className="font-bold text-blue-600">₹{(outstandingBalance / 1000).toFixed(0)}k</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Principal Paid</span>
              <span className="font-bold text-emerald-600">₹{(totalPrincipalPaid / 1000).toFixed(0)}k</span>
            </div>
            <div>
              <span className="block text-[10px] text-slate-400">Interest Paid</span>
              <span className="font-bold text-amber-600">₹{(totalInterestPaid / 1000).toFixed(0)}k</span>
            </div>
          </div>
        </div>

        {/* Chart 2: Monthly Repayment History Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-slate-900">Monthly EMI Payment History</h3>
            <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Consistent On-Time Payments
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyPaymentHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'EMI Serviced']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="paid" fill="#2563eb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>Average EMI: ₹16,490</span>
            <Link to="/transactions" className="font-semibold text-blue-600 hover:underline">
              View All Transactions →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity & Loan Status Table */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Applications tracking preview */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-900">My Loan Applications</h3>
              <p className="text-[11px] text-slate-500">Real-time status tracking & verification</p>
            </div>
            <Link to="/applications" className="text-xs font-bold text-blue-600 hover:underline">
              View All ({applications.length}) →
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No loan applications found. Click "Apply for Loan" to get started.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  onClick={() => navigate(`/applications/${app.id}`)}
                  className="py-3.5 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition cursor-pointer"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-xs font-mono">{app.id}</span>
                      <span className="text-slate-400 text-xs">•</span>
                      <span className="text-xs text-slate-700 font-medium">{app.product_name}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      ₹{app.requested_amount.toLocaleString('en-IN')} for {app.tenure_months} months
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={app.status} size="sm" />
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Quick Actions & Recent Transactions */}
        <div className="lg:col-span-5 space-y-6">
          {/* Quick Actions Panel */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900 mb-2">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                to="/apply"
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left space-y-1 group"
              >
                <FilePlus className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800">Apply for Loan</p>
                <p className="text-[10px] text-slate-400">7-step wizard</p>
              </Link>

              <Link
                to="/calculators"
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left space-y-1 group"
              >
                <Calculator className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800">EMI Calculator</p>
                <p className="text-[10px] text-slate-400">Plan monthly budget</p>
              </Link>

              <Link
                to="/loans/active"
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left space-y-1 group"
              >
                <CreditCard className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800">View Active Loans</p>
                <p className="text-[10px] text-slate-400">Amortization schedules</p>
              </Link>

              <Link
                to="/payments"
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition text-left space-y-1 group"
              >
                <DollarSign className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                <p className="text-xs font-bold text-slate-800">Make Payment</p>
                <p className="text-[10px] text-slate-400">Pay upcoming EMI</p>
              </Link>
            </div>
          </div>

          {/* Recent Payments stream */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-900">Recent Payment Records</h3>
              <Link to="/transactions" className="text-xs font-bold text-blue-600 hover:underline">
                Receipts →
              </Link>
            </div>

            <div className="space-y-2">
              {transactions.slice(0, 3).map((t) => (
                <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{t.type.replace(/_/g, ' ')}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{t.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">₹{t.amount.toLocaleString('en-IN')}</p>
                    <span className="text-[10px] text-slate-400">SUCCESS</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
