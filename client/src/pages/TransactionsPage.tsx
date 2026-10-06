import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { Transaction } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  History,
  Search,
  Filter,
  Receipt,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Printer
} from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Receipt Modal
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  useEffect(() => {
    const fetchTxns = async () => {
      try {
        setLoading(true);
        const res = await api.get('/transactions');
        if (res.data.success) {
          setTransactions(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load transactions:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTxns();
  }, []);

  const filtered = transactions.filter((t) => {
    const matchType = typeFilter === 'ALL' || t.type === typeFilter;
    const matchStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchType && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Transaction History</h1>
          <p className="text-xs text-slate-500 mt-1">
            Complete audit trail of loan disbursements, fee collections, and repayments.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap gap-3">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Transaction Types</option>
          <option value="LOAN_DISBURSEMENT">Loan Disbursement</option>
          <option value="EMI_PAYMENT">EMI Payment</option>
          <option value="PROCESSING_FEE">Processing Fee</option>
          <option value="REFUND">Refund</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="SUCCESS">Success</option>
          <option value="PENDING">Pending</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      {/* Transactions Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 mt-3">Loading transaction ledger...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 text-xs text-slate-500">
          No transactions match your current filter.
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Date & Time</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">{t.id}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {new Date(t.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">
                      {t.type.replace(/_/g, ' ')}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[240px] truncate">
                      {t.description}
                    </td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-extrabold ${
                        t.type === 'LOAN_DISBURSEMENT'
                          ? 'text-blue-700'
                          : 'text-emerald-600'
                      }`}
                    >
                      ₹{t.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        SUCCESS
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setReceiptData({
                            transactionId: t.id,
                            date: t.created_at,
                            amount: t.amount,
                            type: t.type,
                            status: t.status,
                            description: t.description,
                            loanAccountId: t.loan_account_id
                          });
                          setReceiptOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition inline-flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <Receipt className="w-3.5 h-3.5" /> Receipt
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Printable Receipt Modal */}
      <ReceiptModal
        isOpen={receiptOpen}
        onClose={() => setReceiptOpen(false)}
        data={receiptData}
      />
    </div>
  );
};
