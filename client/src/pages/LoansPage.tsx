import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { LoanProduct } from '../types';
import { calculateReducingBalanceEmi } from '../utils/calculations';
import {
  UserCheck,
  Zap,
  Home,
  Car,
  Briefcase,
  GraduationCap,
  FileText,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Percent,
  Calendar
} from 'lucide-react';

export const LoansPage: React.FC = () => {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/loans/products');
        if (res.data.success) {
          setProducts(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load loan products:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Zap':
        return <Zap className="w-6 h-6" />;
      case 'Home':
        return <Home className="w-6 h-6" />;
      case 'Car':
        return <Car className="w-6 h-6" />;
      case 'Briefcase':
        return <Briefcase className="w-6 h-6" />;
      case 'GraduationCap':
        return <GraduationCap className="w-6 h-6" />;
      default:
        return <UserCheck className="w-6 h-6" />;
    }
  };

  const categories = ['ALL', 'Personal', 'Property', 'Education', 'Automobile', 'Commercial', 'Instant'];

  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            Products & Eligibility
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Transparent Loan Products
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto leading-relaxed">
            All loan rates, tenures, and eligibility requirements are centrally configured and governed by Finova's fair lending guidelines.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat === 'ALL' ? 'All Loans' : cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-500 mt-3">Loading loan products...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((p) => {
              // Sample estimated EMI using default interest rate and median tenure
              const sampleAmount = Math.min(p.max_amount, Math.max(p.min_amount, 300000));
              const sampleMonths = Math.min(p.max_tenure_months, 36);
              const sampleEmi = calculateReducingBalanceEmi(sampleAmount, p.default_interest_rate, sampleMonths);

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl border border-slate-200 hover:border-blue-400 p-6 sm:p-7 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div className="space-y-4">
                    {/* Top Row: Icon + Badge */}
                    <div className="flex justify-between items-start">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                        {getIcon(p.icon)}
                      </div>
                      {p.badge && (
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                          {p.badge}
                        </span>
                      )}
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-xl font-extrabold text-slate-900">{p.name}</h3>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                        {p.description}
                      </p>
                    </div>

                    {/* Financial Specs */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Percent className="w-3.5 h-3.5 text-blue-600" /> Interest Rate:
                        </span>
                        <span className="font-bold text-slate-900">
                          {p.interest_rate_min}% - {p.interest_rate_max}% p.a.
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-blue-600" /> Max Loan Amount:
                        </span>
                        <span className="font-bold text-slate-900">
                          Up to ₹{p.max_amount.toLocaleString('en-IN')}
                        </span>
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-blue-600" /> Available Tenure:
                        </span>
                        <span className="font-bold text-slate-900">
                          {p.min_tenure_months} to {p.max_tenure_months} Mos ({(p.max_tenure_months / 12).toFixed(0)} Yrs)
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                        <span className="text-slate-600 font-medium">Estimated EMI Preview:</span>
                        <span className="font-extrabold text-blue-700">
                          ~₹{sampleEmi.monthlyEmi.toLocaleString('en-IN')}/mo
                        </span>
                      </div>
                    </div>

                    {/* Requirements summary */}
                    <div className="space-y-2 pt-1 text-xs">
                      <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
                        Key Eligibility & Documents
                      </p>
                      <ul className="space-y-1 text-[11px] text-slate-600">
                        {p.eligibility_criteria.slice(0, 2).map((crit, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                            <span>{crit}</span>
                          </li>
                        ))}
                      </ul>

                      {p.guarantor_required && (
                        <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 flex items-center gap-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>Guarantor / Surety required for this product</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="pt-6 mt-4 border-t border-slate-100 flex items-center gap-2">
                    <Link
                      to={`/calculators?amount=${p.min_amount}&rate=${p.default_interest_rate}`}
                      className="px-3 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition"
                      title="Calculate EMI"
                    >
                      Calculate
                    </Link>
                    <Link
                      to={`/apply?product=${p.id}`}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
                    >
                      Apply for this Loan <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
