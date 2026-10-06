import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Lock, Award, HeartHandshake, Phone, Mail, FileCheck, CheckCircle2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            About Finova
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simple Finance. Smarter Decisions.
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
            Finova Finance was founded with a singular mission: removing the friction, confusion, and hidden penalties from digital personal and commercial borrowing.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-lg font-bold text-slate-900">Our Core Principles</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
              <h3 className="font-bold text-slate-900 text-base">Mathematical Honesty</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Standard reducing-balance calculations with full amortization transparency. Borrowers always see their principal vs interest breakdown.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <Lock className="w-8 h-8 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Institutional Security</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                256-bit encryption, masked account identifiers, zero unauthenticated file exposure, and comprehensive underwriting audit trails.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
              <HeartHandshake className="w-8 h-8 text-amber-600" />
              <h3 className="font-bold text-slate-900 text-base">Fair Underwriting</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Fast automated decisions for loans under ₹1 Lakh, paired with thoughtful human underwriter scrutiny for high-value requests.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1">
            <strong>Demonstration Sandbox Notice:</strong>
            <p>
              Finova Finance is a demonstration banking and lending software platform built for showcase purposes. It is not an active financial entity or depository institution.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HelpPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            Help & Knowledge Base
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How Can We Assist You?
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Guidance on application workflows, required documentation, repayment schedules, and account security.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base">How to Track Application Status</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Navigate to "My Applications" from your dashboard. Click any dossier to view the 6-stage lifecycle progress bar and check for underwriter requests.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base">High-Value Loan Approval Rule</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Applications for ₹1,00,000 or more require underwriting review. If the committee needs clarifications, an action prompt appears in your dashboard.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base">Document Upload Guidelines</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Please ensure documents are in PDF, JPG, or PNG format and smaller than 10MB. Files are verified for legitimate MIME types prior to server storage.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-900 text-base">How to Download Tax Receipts</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Visit "Transaction History" and click the "Receipt" icon on any completed EMI or disbursement to view, save, or print an official tax invoice.
            </p>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Need Direct Assistance?</h3>
            <p className="text-xs text-slate-500 mt-1">Our support desk is available Monday through Saturday from 9 AM to 7 PM IST.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-xl flex items-center gap-1.5">
              <Mail className="w-4 h-4" /> support@finova.demo
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
