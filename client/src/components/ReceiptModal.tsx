import React from 'react';
import { X, Printer, Download, CheckCircle2, ShieldCheck, Building2 } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    transactionId: string;
    date: string;
    amount: number;
    type: string;
    status: string;
    description: string;
    userName?: string;
    userEmail?: string;
    loanAccountId?: string;
    paymentMethod?: string;
  } | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ isOpen, onClose, data }) => {
  if (!isOpen || !data) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header toolbar */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-800">Official Payment Receipt</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable receipt content */}
        <div id="printable-receipt" className="p-8 space-y-6 text-slate-800 bg-white">
          {/* Logo & Institution Header */}
          <div className="flex justify-between items-start border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm">
                  F
                </div>
                <span className="font-extrabold text-lg text-slate-900">Finova Finance</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Digital Lending & Credit Operations</p>
              <p className="text-[10px] text-slate-400">GSTIN: 29AABCF8891P1ZV • Bangalore, India</p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5" /> PAID / SUCCESS
              </span>
              <p className="text-xs text-slate-500 mt-1.5">Receipt # {data.transactionId}</p>
              <p className="text-[11px] text-slate-400">
                {new Date(data.date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>

          {/* Amount Showcase */}
          <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Amount Processed</p>
            <p className="text-3xl font-extrabold text-slate-900 mt-1">
              ₹{data.amount.toLocaleString('en-IN')}
            </p>
            <p className="text-xs text-emerald-600 font-medium mt-1">Electronic Transfer Confirmed</p>
          </div>

          {/* Details Table */}
          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Applicant / Payee:</span>
              <span className="font-semibold text-slate-900">{data.userName || 'Rahul Sharma'}</span>
            </div>
            {data.loanAccountId && (
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Loan Account:</span>
                <span className="font-mono font-semibold text-slate-900">{data.loanAccountId}</span>
              </div>
            )}
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Payment Category:</span>
              <span className="font-semibold text-slate-900">{data.type.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-semibold text-slate-900">{data.paymentMethod || 'UPI / Auto-Debit'}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500">Description:</span>
              <span className="font-medium text-slate-700 max-w-[280px] text-right truncate">
                {data.description}
              </span>
            </div>
          </div>

          {/* Security & Verification Stamp */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-400" />
              <span>Finova Digital Settlement Gateway</span>
            </div>
            <span className="font-mono text-[10px]">AUTH_SIG: {Math.random().toString(36).substr(2, 10).toUpperCase()}</span>
          </div>

          <p className="text-[10px] text-slate-400 text-center leading-tight">
            * This is a system-generated computer receipt for demonstration purposes. No physical signature required.
          </p>
        </div>

        {/* Modal footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-sm flex items-center gap-1.5 transition"
          >
            <Printer className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </div>
    </div>
  );
};
