import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { LoanAccount } from '../types';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingDown,
  ChevronRight
} from 'lucide-react';

export const ActiveLoansPage: React.FC = () => {
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        setLoading(true);
        const res = await api.get('/loans/my');
        if (res.data.success) {
          setLoans(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load active loans:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLoans();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Active Loan Accounts</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review active balances, amortization schedules, and make upcoming EMI payments.
          </p>
        </div>
        <Link
          to="/payments"
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center gap-1.5 self-start sm:self-auto"
        >
          <DollarSign className="w-4 h-4" /> Make EMI Payment
        </Link>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3">Loading your loan accounts...</p>
        </div>
      ) : loans.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
          <CreditCard className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
          <h3 className="text-sm font-bold text-slate-800">No active loans found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You do not currently have any active or disbursed loan accounts.
          </p>
          <Link
            to="/apply"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs"
          >
            Apply for Loan <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {loans.map((loan) => {
            const progress = Math.min(100, Math.round((loan.total_paid / loan.total_payable) * 100));

            return (
              <div
                key={loan.id}
                onClick={() => navigate(`/loans/account/${loan.id}`)}
                className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 font-mono">{loan.id}</h3>
                      <p className="text-xs text-slate-500">{loan.product_name || 'Personal Loan'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      loan.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {loan.status}
                    </span>
                    <span className="text-xs font-bold text-blue-600 flex items-center gap-1 pl-2">
                      Amortization Schedule <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>

                {/* Key Financial Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Sanctioned Principal</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{loan.principal_amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Loan Balance (Outstanding)</span>
                    <span className="font-extrabold text-blue-700 text-sm">
                      ₹{loan.outstanding_balance.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Monthly EMI</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ₹{loan.monthly_emi.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Next Due Date</span>
                    <span className="font-bold text-amber-600 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {loan.next_emi_date}
                    </span>
                  </div>
                </div>

                {/* Repayment Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500 font-medium">
                    <span>Repayment Progress ({progress}%)</span>
                    <span>{loan.tenure_months - loan.remaining_tenure_months} of {loan.tenure_months} EMIs Serviced</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
