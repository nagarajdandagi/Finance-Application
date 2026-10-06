import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { LoanAccount, RepaymentSchedule } from '../types';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  Percent,
  Check,
  Receipt
} from 'lucide-react';

export const LoanDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [loan, setLoan] = useState<LoanAccount | null>(null);
  const [schedule, setSchedule] = useState<RepaymentSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoanAccount = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/loans/account/${id}`);
      if (res.data.success) {
        setLoan(res.data.data);
        setSchedule(res.data.data.repaymentSchedule || []);
      }
    } catch (err) {
      console.error('Failed to load loan account:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanAccount();
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 mt-3">Loading loan account details...</p>
      </div>
    );
  }

  if (!loan) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
        <h3 className="font-bold text-slate-800 text-sm">Loan Account Not Found</h3>
        <Link to="/loans/active" className="mt-3 inline-block text-xs font-bold text-blue-600">
          ← Back to Active Loans
        </Link>
      </div>
    );
  }

  const progress = Math.min(100, Math.round((loan.total_paid / loan.total_payable) * 100));

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-extrabold text-slate-900 font-mono">{loan.id}</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
              loan.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600'
            }`}>
              {loan.status}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Product: <strong>{loan.product_name}</strong> • Disbursed on{' '}
            {new Date(loan.disbursement_date).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}
          </p>
        </div>

        {loan.status === 'ACTIVE' && (
          <Link
            to="/payments"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-2 self-start sm:self-auto"
          >
            <DollarSign className="w-4 h-4" /> Pay Upcoming EMI
          </Link>
        )}
      </div>

      {/* Main Financial Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 text-xs font-medium">Sanctioned Principal</span>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{loan.principal_amount.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400 block">Original loan amount</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 text-xs font-medium">Loan Balance (Outstanding)</span>
          <p className="text-2xl font-extrabold text-blue-700">
            ₹{loan.outstanding_balance.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-slate-400 block">Current principal due</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 text-xs font-medium">Monthly EMI</span>
          <p className="text-2xl font-extrabold text-slate-900">
            ₹{loan.monthly_emi.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-amber-600 font-semibold block">
            Next Due: {loan.next_emi_date}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-1">
          <span className="text-slate-400 text-xs font-medium">Interest & Tenure</span>
          <p className="text-2xl font-extrabold text-slate-900">{loan.interest_rate}% p.a.</p>
          <span className="text-[11px] text-slate-400 block">
            {loan.remaining_tenure_months} of {loan.tenure_months} months remaining
          </span>
        </div>
      </div>

      {/* Repayment Progress bar */}
      <div className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-3">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-800">Repayment Lifecycle ({progress}% Complete)</span>
          <span className="text-slate-500 font-medium">
            Paid: <strong>₹{loan.total_paid.toLocaleString('en-IN')}</strong> of ₹{loan.total_payable.toLocaleString('en-IN')}
          </span>
        </div>
        <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex justify-between text-[11px] text-slate-400 pt-1">
          <span>Interest Paid to date: ₹{loan.total_interest_paid.toLocaleString('en-IN')}</span>
          <span>Remaining Interest: ₹{(loan.total_interest - loan.total_interest_paid).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Loan Amortization Repayment Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Detailed tracking of principal and interest allocations per installment.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
            Total {schedule.length} Installments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Instalment</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4 text-right">Opening Balance</th>
                <th className="py-3 px-4 text-right">Principal</th>
                <th className="py-3 px-4 text-right">Interest</th>
                <th className="py-3 px-4 text-right">Monthly EMI</th>
                <th className="py-3 px-4 text-right">Closing Balance</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {schedule.map((row) => (
                <tr
                  key={row.installment_number}
                  className={`hover:bg-slate-50/80 transition-colors ${
                    row.status === 'PAID' ? 'bg-emerald-50/20' : ''
                  }`}
                >
                  <td className="py-3 px-4 font-bold text-slate-900">#{row.installment_number}</td>
                  <td className="py-3 px-4 text-slate-600">{row.due_date}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    ₹{row.opening_balance.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-blue-700">
                    ₹{row.principal_component.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-amber-700">
                    ₹{row.interest_component.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{row.emi_amount.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    ₹{row.closing_balance.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {row.status === 'PAID' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <Check className="w-3 h-3" /> PAID
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                        <Clock className="w-3 h-3 text-slate-400" /> UPCOMING
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
