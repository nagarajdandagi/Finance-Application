import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Lock, FileCheck, Phone, Mail, MapPin, Award } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-850">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-extrabold text-base shadow-md">
                F
              </div>
              <span className="font-extrabold text-xl text-white tracking-tight">
                Finova<span className="text-blue-400 font-bold ml-0.5">Finance</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Simple Finance. Smarter Decisions. Next-generation digital lending platform empowering individuals and small enterprises with instant approvals, transparent interest, and frictionless repayment tracking.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <Lock className="w-3.5 h-3.5 text-blue-400" />
                <span>256-Bit SSL Encrypted</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs text-slate-300">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>ISO 27001 Security Demo</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Loan Products</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/loans" className="hover:text-white transition">Personal Loans</Link></li>
              <li><Link to="/loans" className="hover:text-white transition">Home Loans</Link></li>
              <li><Link to="/loans" className="hover:text-white transition">Education Loans</Link></li>
              <li><Link to="/loans" className="hover:text-white transition">Vehicle Loans</Link></li>
              <li><Link to="/loans" className="hover:text-white transition">Business Expansion</Link></li>
              <li><Link to="/loans" className="hover:text-white transition">Emergency Micro-loans</Link></li>
            </ul>
          </div>

          {/* Calculators & Tools */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Calculators & Tools</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/calculators" className="hover:text-white transition">Reducing Balance EMI</Link></li>
              <li><Link to="/calculators" className="hover:text-white transition">Simple Interest Calculator</Link></li>
              <li><Link to="/calculators" className="hover:text-white transition">Amortization Schedule</Link></li>
              <li><Link to="/calculators" className="hover:text-white transition">Debt-to-Income Checker</Link></li>
              <li><Link to="/apply" className="hover:text-white transition">Quick Eligibility Quiz</Link></li>
            </ul>
          </div>

          {/* Support & Legal */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">Company & Support</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li><Link to="/about" className="hover:text-white transition">About Finova</Link></li>
              <li><Link to="/help" className="hover:text-white transition">Help & FAQs</Link></li>
              <li><Link to="/help" className="hover:text-white transition">Security & Privacy</Link></li>
              <li><Link to="/admin/login" className="hover:text-amber-400 transition flex items-center gap-1">Underwriter Portal</Link></li>
              <li className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> support@finova.demo
              </li>
              <li className="text-xs text-slate-400 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> 1800-FINOVA-00
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Bottom Bar */}
        <div className="pt-8 text-xs text-slate-400 space-y-3">
          <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-850 text-slate-400">
            <strong className="text-slate-300 font-semibold block mb-1">Project Demo Notice:</strong>
            Finova Finance is a demonstration banking and loan management application developed for portfolio presentation. All financial figures, interest rates, transactions, loan accounts, and approval workflows are simulated mock data and do not represent an actual regulated financial institution or RBI-registered Non-Banking Financial Company (NBFC).
          </div>
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-slate-400 pt-2">
            <p>© {new Date().getFullYear()} Finova Finance Inc. All rights reserved.</p>
            <p className="flex items-center gap-4">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Fair Lending Practices</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
