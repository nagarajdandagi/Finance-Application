import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { LoanAccount, Payment } from '../types';
import { ReceiptModal } from '../components/ReceiptModal';
import {
  DollarSign,
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  Receipt,
  QrCode,
  Building,
  ArrowRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [loans, setLoans] = useState<LoanAccount[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Pay Modal State
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanAccount | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'NET_BANKING' | 'DEBIT_CARD'>('UPI');
  const [processing, setProcessing] = useState(false);
  const [paySuccessMsg, setPaySuccessMsg] = useState<string | null>(null);

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<any | null>(null);
  const [receiptOpen, setReceiptOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [loansRes, payRes] = await Promise.all([
        api.get('/loans/my'),
        api.get('/payments/history')
      ]);

      if (loansRes.data.success) {
        setLoans(loansRes.data.data.filter((l: LoanAccount) => l.status === 'ACTIVE'));
      }
      if (payRes.data.success) {
        setPayments(payRes.data.data);
      }
    } catch (err) {
      console.error('Failed to load payment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openPayModal = (loan: LoanAccount) => {
    setSelectedLoan(loan);
    setPaySuccessMsg(null);
    setPayModalOpen(true);
  };

  const handleMakePayment = async () => {
    if (!selectedLoan) return;

    try {
      setProcessing(true);
      const res = await api.post('/payments/pay', {
        loanAccountId: selectedLoan.id,
        amount: selectedLoan.monthly_emi,
        paymentMethod
      });

      if (res.data.success) {
        setPaySuccessMsg(res.data.message);
        // Refresh data
        fetchData();
        // Prepare receipt data
        setReceiptData({
          transactionId: res.data.data.transactionId,
          date: res.data.data.paidAt,
          amount: res.data.data.amount,
          type: 'EMI_PAYMENT',
          status: 'SUCCESS',
          description: `EMI Installment #${res.data.data.installmentNumber} for Loan ${res.data.data.loanAccountId}`,
          loanAccountId: res.data.data.loanAccountId,
          paymentMethod
        });
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      alert(err.response?.data?.message || 'Payment processing failed.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="pb-2 border-b border-slate-200">
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">EMI & Loan Repayments</h1>
        <p className="text-xs text-slate-500 mt-1">
          Pay upcoming monthly installments via secure UPI, Net Banking, or Debit Cards.
        </p>
      </div>

      {/* Upcoming EMI Cards */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Pending & Upcoming Instalments
        </h2>

        {loans.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No active loan accounts requiring payment at this moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {loans.map((loan) => (
              <div
                key={loan.id}
                className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm space-y-5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-slate-900 font-mono">{loan.id}</span>
                    <p className="text-[11px] text-slate-500">{loan.product_name}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" /> Due: {loan.next_emi_date}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium">Monthly EMI</span>
                    <p className="text-2xl font-extrabold text-slate-900">
                      ₹{loan.monthly_emi.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-medium">Remaining Principal</span>
                    <p className="text-xs font-bold text-blue-700">
                      ₹{loan.outstanding_balance.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => openPayModal(loan)}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-4 h-4" /> Pay EMI Now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payment History Table */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">EMI Payment History</h3>
            <p className="text-xs text-slate-500">Official log of past serviced instalments and electronic receipts.</p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {payments.length} Payments
          </span>
        </div>

        {payments.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No payment history on record.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider text-[11px] border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Receipt / Payment ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Loan Account</th>
                  <th className="py-3 px-4">Payment Method</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.id}</td>
                    <td className="py-3 px-4 text-slate-600">
                      {new Date(p.paid_at).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-700">{p.loan_account_id}</td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{p.payment_method}</td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-600">
                      ₹{p.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        SUCCESS
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setReceiptData({
                            transactionId: p.id,
                            date: p.paid_at,
                            amount: p.amount,
                            type: 'EMI_PAYMENT',
                            status: 'SUCCESS',
                            description: `EMI Payment for Loan Account ${p.loan_account_id}`,
                            loanAccountId: p.loan_account_id,
                            paymentMethod: p.payment_method
                          });
                          setReceiptOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition inline-flex items-center gap-1 font-semibold text-[11px]"
                      >
                        <Receipt className="w-3.5 h-3.5" /> View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay EMI Modal */}
      {payModalOpen && selectedLoan && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Process EMI Payment</h3>
                <p className="text-xs text-slate-500">Account: {selectedLoan.id}</p>
              </div>
              <button
                onClick={() => setPayModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            {paySuccessMsg ? (
              <div className="space-y-4 py-4 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h4 className="font-extrabold text-slate-900 text-base">Payment Completed!</h4>
                <p className="text-xs text-slate-600">{paySuccessMsg}</p>
                <div className="pt-2 flex justify-center gap-2">
                  <button
                    onClick={() => {
                      setPayModalOpen(false);
                      setReceiptOpen(true);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
                  >
                    <Receipt className="w-4 h-4" /> View Payment Receipt
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-center">
                  <span className="text-[11px] text-blue-600 font-semibold uppercase">Instalment Amount</span>
                  <p className="text-3xl font-extrabold text-blue-900 mt-1">
                    ₹{selectedLoan.monthly_emi.toLocaleString('en-IN')}
                  </p>
                </div>

                {/* Mode Selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-700">Choose Payment Method</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('UPI')}
                      className={`p-3 rounded-xl border text-center transition ${
                        paymentMethod === 'UPI'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <QrCode className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                      <span className="text-[11px] block">UPI / QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('NET_BANKING')}
                      className={`p-3 rounded-xl border text-center transition ${
                        paymentMethod === 'NET_BANKING'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <Building className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                      <span className="text-[11px] block">Net Banking</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPaymentMethod('DEBIT_CARD')}
                      className={`p-3 rounded-xl border text-center transition ${
                        paymentMethod === 'DEBIT_CARD'
                          ? 'border-blue-600 bg-blue-50 text-blue-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50 font-medium'
                      }`}
                    >
                      <CreditCard className="w-5 h-5 mx-auto mb-1 text-blue-600" />
                      <span className="text-[11px] block">Debit Card</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Demo transaction simulation. Instant electronic clearance.</span>
                </div>

                <button
                  type="button"
                  disabled={processing}
                  onClick={handleMakePayment}
                  className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processing ? 'Processing Settlement...' : `Confirm & Pay ₹${selectedLoan.monthly_emi.toLocaleString('en-IN')}`}
                </button>
              </div>
            )}
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
