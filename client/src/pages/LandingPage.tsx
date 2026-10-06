import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Clock,
  Lock,
  ChevronDown,
  Calculator,
  UserCheck,
  Zap,
  Building,
  GraduationCap,
  Car,
  Home,
  Briefcase,
  HelpCircle,
  Percent,
  Layers
} from 'lucide-react';
import { calculateReducingBalanceEmi } from '../utils/calculations';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Mini live EMI calculator on landing page
  const [calcAmount, setCalcAmount] = useState<number>(300000);
  const [calcRate, setCalcRate] = useState<number>(11.5);
  const [calcTenure, setCalcTenure] = useState<number>(36);

  const emiResult = calculateReducingBalanceEmi(calcAmount, calcRate, calcTenure);

  // FAQ Accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does the ₹1,00,000 threshold approval rule work?',
      a: 'Loan applications below ₹1,00,000 undergo an automated algorithmic risk check and can be approved instantly. Applications for ₹1,00,000 or above automatically enter "Pending Admin Review", where our underwriting team verifies income documents, bank statements, and guarantor details before issuing final approval.'
    },
    {
      q: 'What documents are required to apply for a loan?',
      a: 'Standard documentation includes your PAN card, government ID proof (Aadhaar or Passport), address proof, 3 months salary slips or income proofs, and 6 months bank statements. For specialized business or home loans, property agreements or GST returns may be required.'
    },
    {
      q: 'How is the reducing-balance EMI calculated?',
      a: 'We use the standard reducing-balance monthly compound formula: EMI = [P × r × (1+r)^n] / [(1+r)^n - 1], where interest is calculated only on the remaining outstanding principal balance each month rather than the initial lump sum.'
    },
    {
      q: 'When do I need to provide a guarantor or co-applicant?',
      a: 'Education loans, high-value commercial loans, and select property loans require a guarantor or co-applicant with verifiable income. You can upload their KYC and income details directly in the multi-step application wizard.'
    },
    {
      q: 'Can I prepay or foreclose my active loan early?',
      a: 'Yes, you can make early part-payments or pay upcoming EMIs anytime through our online payment portal using UPI, Net Banking, or Debit Cards.'
    }
  ];

  return (
    <div className="bg-white">
      {/* ========================================================
          HERO SECTION
         ======================================================== */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold">
                <span className="flex h-2 w-2 rounded-full bg-blue-600 animate-pulse"></span>
                Instant Digital Lending • Transparent Rates
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Finance made simple <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
                  for your next step.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Calculate your EMI, explore loan options, apply online and manage your repayments from one secure dashboard.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/apply"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/25 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  Apply for Loan <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/calculators"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-sm text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition flex items-center justify-center gap-2"
                >
                  <Calculator className="w-4 h-4 text-blue-600" />
                  Calculate EMI
                </Link>
              </div>

              {/* Trust markers */}
              <div className="pt-6 border-t border-slate-200/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-500 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Automated approval &lt; ₹1L</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>No hidden processing fees</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Bank-grade 256-bit encryption</span>
                </div>
              </div>
            </div>

            {/* Right Illustration Card */}
            <div className="lg:col-span-5">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Glow backdrop */}
                <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl blur-xl opacity-20"></div>

                {/* Fintech Showcase Card */}
                <div className="relative rounded-2xl bg-slate-900 text-white p-6 sm:p-8 shadow-2xl border border-slate-800 space-y-6">
                  {/* Top card bar */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                        F
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-slate-200">Active Credit Line</p>
                        <p className="text-[10px] text-slate-400">Account: LN-2026-884920</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ON TRACK
                    </span>
                  </div>

                  {/* Main Metric */}
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Loan Balance</span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl sm:text-4xl font-extrabold text-white">₹4,69,820</span>
                      <span className="text-xs text-slate-400">of ₹5,00,000</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
                      <div className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full w-[24%] rounded-full"></div>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1.5">
                      <span>3 of 36 EMIs paid</span>
                      <span>33 months remaining</span>
                    </div>
                  </div>

                  {/* Next Payment Card */}
                  <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Next Due EMI</p>
                      <p className="text-lg font-bold text-white mt-0.5">₹16,490</p>
                      <p className="text-[10px] text-amber-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> Due in 4 days
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-sm transition"
                    >
                      Pay EMI
                    </button>
                  </div>

                  {/* Underwriting rule preview badge */}
                  <div className="p-3 rounded-lg bg-blue-950/60 border border-blue-900/60 text-[11px] text-blue-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>Rule Engine: Fast approval for &lt; ₹1L • Senior review for ≥ ₹1L</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          1. POPULAR LOAN PRODUCTS SECTION
         ======================================================== */}
      <section className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
              Loan Portfolio
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Tailored Financial Products
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Flexible options designed for everyday aspirations, education, automobiles, and business scale.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Product 1: Personal */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-blue-300 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                  <UserCheck className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                  Most Popular
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-4">Personal Loan</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Collateral-free personal loans for weddings, travel, medical emergencies or gadgets.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Max Amount</span>
                  <span className="font-bold text-slate-800">Up to ₹15,00,000</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Interest Rate</span>
                  <span className="font-bold text-blue-600">From 10.5% p.a.</span>
                </div>
              </div>
              <Link
                to="/apply?product=prod_personal"
                className="mt-5 w-full py-2.5 rounded-xl text-xs font-semibold text-center block bg-slate-900 text-white hover:bg-blue-600 transition"
              >
                Apply Now
              </Link>
            </div>

            {/* Product 2: Emergency */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                  <Zap className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                  Instant Auto-Disbursal
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-4">Emergency / Micro Loan</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Urgent micro-credit under ₹1 Lakh processed with automated instant verification.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Max Amount</span>
                  <span className="font-bold text-slate-800">Up to ₹95,000</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Processing</span>
                  <span className="font-bold text-emerald-600">Under 15 Mins</span>
                </div>
              </div>
              <Link
                to="/apply?product=prod_emergency"
                className="mt-5 w-full py-2.5 rounded-xl text-xs font-semibold text-center block bg-slate-900 text-white hover:bg-emerald-600 transition"
              >
                Apply Now
              </Link>
            </div>

            {/* Product 3: Home */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                  <Home className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700">
                  Lowest Interest
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-4">Home Loan</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Long tenure property financing with subsidized interest rates and co-applicant support.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Max Amount</span>
                  <span className="font-bold text-slate-800">Up to ₹1.5 Crore</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Interest Rate</span>
                  <span className="font-bold text-indigo-600">From 7.8% p.a.</span>
                </div>
              </div>
              <Link
                to="/apply?product=prod_home"
                className="mt-5 w-full py-2.5 rounded-xl text-xs font-semibold text-center block bg-slate-900 text-white hover:bg-indigo-600 transition"
              >
                Apply Now
              </Link>
            </div>

            {/* Product 4: Vehicle */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-amber-300 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition">
                  <Car className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800">
                  Fast On-Road Disbursal
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-4">Vehicle Loan</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Up to 90% funding for electric vehicles, two-wheelers, and passenger cars.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Max Amount</span>
                  <span className="font-bold text-slate-800">Up to ₹25,00,000</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tenure</span>
                  <span className="font-bold text-amber-700">12 - 84 Months</span>
                </div>
              </div>
              <Link
                to="/apply?product=prod_vehicle"
                className="mt-5 w-full py-2.5 rounded-xl text-xs font-semibold text-center block bg-slate-900 text-white hover:bg-amber-600 transition"
              >
                Apply Now
              </Link>
            </div>

            {/* Product 5: Business */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-purple-300 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition">
                  <Briefcase className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700">
                  MSME Growth
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-4">Business Loan</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Working capital and equipment financing for retailers, manufacturers, and startups.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Max Amount</span>
                  <span className="font-bold text-slate-800">Up to ₹50,00,000</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Interest Rate</span>
                  <span className="font-bold text-purple-600">From 11.5% p.a.</span>
                </div>
              </div>
              <Link
                to="/apply?product=prod_business"
                className="mt-5 w-full py-2.5 rounded-xl text-xs font-semibold text-center block bg-slate-900 text-white hover:bg-purple-600 transition"
              >
                Apply Now
              </Link>
            </div>

            {/* Product 6: Education */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 hover:border-teal-300 shadow-sm hover:shadow-lg transition-all group">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center group-hover:bg-teal-600 group-hover:text-white transition">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700">
                  Tax Benefit (Sec 80E)
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-900 mt-4">Education Loan</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Study in India or overseas with tuition fee disbursal and moratorium periods.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Max Amount</span>
                  <span className="font-bold text-slate-800">Up to ₹40,00,000</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Tenure</span>
                  <span className="font-bold text-teal-600">Up to 10 Years</span>
                </div>
              </div>
              <Link
                to="/apply?product=prod_education"
                className="mt-5 w-full py-2.5 rounded-xl text-xs font-semibold text-center block bg-slate-900 text-white hover:bg-teal-600 transition"
              >
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          2. LIVE EMI CALCULATOR PREVIEW SECTION
         ======================================================== */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-100/60 px-3 py-1 rounded-full">
              Financial Transparency
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Live Reducing-Balance EMI Calculator
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              Adjust sliders to calculate your accurate monthly instalment and interest breakdown instantly.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-200/80 max-w-4xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Sliders column */}
              <div className="lg:col-span-7 space-y-6">
                {/* Loan Amount */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700">Loan Amount</label>
                    <span className="text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                      ₹{calcAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={25000}
                    max={2000000}
                    step={25000}
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>₹25,000</span>
                    <span>₹20,00,000</span>
                  </div>
                </div>

                {/* Interest Rate */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700">Annual Interest Rate (%)</label>
                    <span className="text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                      {calcRate}% p.a.
                    </span>
                  </div>
                  <input
                    type="range"
                    min={7}
                    max={24}
                    step={0.25}
                    value={calcRate}
                    onChange={(e) => setCalcRate(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>7%</span>
                    <span>24%</span>
                  </div>
                </div>

                {/* Tenure */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-bold text-slate-700">Tenure (Months)</label>
                    <span className="text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                      {calcTenure} Months ({(calcTenure / 12).toFixed(1)} Yrs)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={6}
                    max={84}
                    step={6}
                    value={calcTenure}
                    onChange={(e) => setCalcTenure(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                    <span>6 Months</span>
                    <span>84 Months</span>
                  </div>
                </div>

                {/* Notice regarding >= 1L threshold */}
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  calcAmount >= 100000 ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}>
                  <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                  <span>
                    {calcAmount >= 100000
                      ? 'Notice: Loans ₹1,00,000 or above require senior underwriter review.'
                      : 'Notice: Loans below ₹1,00,000 qualify for rapid automated approval.'}
                  </span>
                </div>
              </div>

              {/* Output Display Card */}
              <div className="lg:col-span-5 bg-slate-900 rounded-2xl p-6 text-white space-y-6">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Estimated Monthly EMI</p>
                  <p className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                    ₹{emiResult.monthlyEmi.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-emerald-400 mt-1">Reducing balance formula applied</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Principal Amount:</span>
                    <span className="font-semibold text-white">₹{calcAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Total Interest Payable:</span>
                    <span className="font-semibold text-amber-300">₹{emiResult.totalInterest.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                    <span className="font-bold text-white">Total Amount Repayable:</span>
                    <span className="font-extrabold text-blue-400 text-sm">
                      ₹{emiResult.totalRepayment.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <Link
                    to={`/apply?amount=${calcAmount}&tenure=${calcTenure}`}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-center block shadow transition"
                  >
                    Apply for this Loan
                  </Link>
                  <Link
                    to="/calculators"
                    className="w-full py-2 text-[11px] text-slate-400 hover:text-white text-center block transition"
                  >
                    Open Full Amortization Schedule & Simple Interest →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          3. WHY CHOOSE FINOVA SECTION
         ======================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full">
              Finova Advantages
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Why Borrowers Trust Finova Finance
            </h2>
            <p className="text-slate-600 text-sm mt-2">
              We eliminate banking red tape with clear formulas, paperless uploads, and responsible lending.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Rapid Automated Rules</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Eligible micro-loans under ₹1 Lakh are processed automatically within minutes with zero manual delays.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
                <Percent className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Transparent Reducing Rates</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero hidden charges. Every monthly instalment reduces your principal balance according to clear mathematical standards.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Protected Documents</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Your KYC and bank statements are stored safely behind role-based authentication and never exposed publicly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">Complete Control</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Track full amortization schedules, pay upcoming EMIs via UPI, and download verified tax receipts from one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          4. SIMPLE 4-STEP LOAN PROCESS
         ======================================================== */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold text-blue-400 uppercase tracking-widest bg-blue-900/50 px-3 py-1 rounded-full border border-blue-800">
              Simple Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight mt-3">
              Our 4-Step Loan Application Process
            </h2>
            <p className="text-slate-400 text-sm mt-2">
              From calculation to bank account disbursement in four seamless stages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="relative p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                1
              </div>
              <h3 className="text-base font-bold text-white">Select Product & EMI</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose loan category, specify requested amount and preferred tenure, and preview monthly EMI.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                2
              </div>
              <h3 className="text-base font-bold text-white">Fill KYC & Documents</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Complete personal, income, and bank information. Upload KYC proofs and add guarantor details if required.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                3
              </div>
              <h3 className="text-base font-bold text-white">System & Underwriter Review</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Amounts &lt; ₹1L move through rapid automated verification; amounts ≥ ₹1L undergo thorough underwriter review.
              </p>
            </div>

            <div className="relative p-6 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-sm shadow">
                4
              </div>
              <h3 className="text-base font-bold text-white">Direct Disbursement</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Upon sanction, active loan account is created, repayment schedule is generated, and funds are disbursed!
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/apply"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg transition"
            >
              Start Your Application Today <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================
          5. SECURITY & PRIVACY
         ======================================================== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-850 to-blue-950 text-white shadow-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-8 space-y-4">
                <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">
                  Bank-Grade Security Architecture
                </span>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Your Financial Data Protected by 256-Bit Cryptography
                </h2>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  We enforce end-to-end data encryption, JSON Web Token authentication with strict expiry, server-side MIME verification, and masked account identifiers across our entire platform. Customer financial records are isolated through strict Role-Based Access Controls (RBAC).
                </p>
                <div className="flex flex-wrap gap-4 pt-2 text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-emerald-400" /> Masked Bank & PAN Info
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Admin Audit Logs Recorded
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Unauthenticated Document Exposure
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 text-center lg:text-right">
                <div className="inline-block p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10">
                  <Lock className="w-12 h-12 mx-auto text-blue-400 mb-2" />
                  <p className="text-base font-bold text-white">Demo Platform Standards</p>
                  <p className="text-[11px] text-slate-300 mt-1">Realistic sandbox security model</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          6. FREQUENTLY ASKED QUESTIONS
         ======================================================== */}
      <section className="py-20 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest bg-blue-100/60 px-3 py-1 rounded-full">
              Frequently Asked Questions
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
              Clear Answers About Loans & Borrowing
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-white border border-slate-200 shadow-sm overflow-hidden transition"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full px-6 py-4.5 text-left flex justify-between items-center text-sm font-bold text-slate-800 hover:text-blue-600 transition focus:outline-none"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                      openFaq === idx ? 'rotate-180 text-blue-600' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
