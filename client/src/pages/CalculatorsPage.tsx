import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  calculateReducingBalanceEmi,
  calculateSimpleInterest,
  generateAmortizationSchedule
} from '../utils/calculations';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from 'recharts';
import {
  Calculator,
  RotateCcw,
  ArrowRight,
  TrendingDown,
  Info,
  Calendar,
  Layers,
  Percent,
  Coins
} from 'lucide-react';

export const CalculatorsPage: React.FC = () => {
  const [searchParams] = useSearchParams();

  // Active calculator tab: 'EMI' or 'SIMPLE'
  const [activeTab, setActiveTab] = useState<'EMI' | 'SIMPLE'>('EMI');

  // EMI Calculator States
  const [principal, setPrincipal] = useState<number>(() => {
    const qAmount = searchParams.get('amount');
    return qAmount ? Number(qAmount) : 500000;
  });
  const [interestRate, setInterestRate] = useState<number>(() => {
    const qRate = searchParams.get('rate');
    return qRate ? Number(qRate) : 12;
  });
  const [tenureValue, setTenureValue] = useState<number>(5);
  const [tenureUnit, setTenureUnit] = useState<'years' | 'months'>('years');
  const [schedulePage, setSchedulePage] = useState<number>(1);

  // Simple Interest Calculator States
  const [siPrincipal, setSiPrincipal] = useState<number>(100000);
  const [siRate, setSiRate] = useState<number>(10);
  const [siTimeYears, setSiTimeYears] = useState<number>(3);

  // Computations
  const tenureInMonths = tenureUnit === 'years' ? tenureValue * 12 : tenureValue;
  const emiResult = calculateReducingBalanceEmi(principal, interestRate, tenureInMonths);
  const fullSchedule = generateAmortizationSchedule(principal, interestRate, tenureInMonths);

  const siResult = calculateSimpleInterest(siPrincipal, siRate, siTimeYears);

  // Pie chart data for EMI
  const pieData = [
    { name: 'Principal Amount', value: emiResult.principal, color: '#2563eb' },
    { name: 'Total Interest', value: emiResult.totalInterest, color: '#f59e0b' }
  ];

  const handleResetEmi = () => {
    setPrincipal(500000);
    setInterestRate(12);
    setTenureValue(5);
    setTenureUnit('years');
  };

  const handleResetSi = () => {
    setSiPrincipal(100000);
    setSiRate(10);
    setSiTimeYears(3);
  };

  // Pagination for amortization table (12 per page)
  const itemsPerPage = 12;
  const totalPages = Math.ceil(fullSchedule.length / itemsPerPage);
  const paginatedSchedule = fullSchedule.slice((schedulePage - 1) * itemsPerPage, schedulePage * itemsPerPage);

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
            Precision Financial Tools
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Loan EMI & Interest Calculators
          </h1>
          <p className="text-slate-600 text-sm max-w-xl mx-auto">
            Accurately plan your borrowing with reducing balance amortization or compare with standard simple interest.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-10">
          <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-sm flex gap-1">
            <button
              onClick={() => setActiveTab('EMI')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'EMI'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <TrendingDown className="w-4 h-4" />
              Reducing Balance EMI Calculator
            </button>
            <button
              onClick={() => setActiveTab('SIMPLE')}
              className={`px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition flex items-center gap-2 ${
                activeTab === 'SIMPLE'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Coins className="w-4 h-4" />
              Simple Interest Calculator
            </button>
          </div>
        </div>

        {/* ========================================================
            TAB 1: REDUCING BALANCE EMI CALCULATOR
           ======================================================== */}
        {activeTab === 'EMI' && (
          <div className="space-y-10">
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Inputs Column */}
                <div className="lg:col-span-7 space-y-8">
                  {/* Loan Principal */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-700">Loan Principal Amount (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">₹</span>
                        <input
                          type="number"
                          min={10000}
                          max={10000000}
                          step={10000}
                          value={principal}
                          onChange={(e) => setPrincipal(Math.max(1000, Number(e.target.value)))}
                          className="w-36 pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 text-right text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                    <input
                      type="range"
                      min={10000}
                      max={10000000}
                      step={25000}
                      value={principal}
                      onChange={(e) => setPrincipal(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>₹10,000</span>
                      <span>₹50,00,000</span>
                      <span>₹1,00,00,000</span>
                    </div>
                  </div>

                  {/* Interest Rate */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-700">Annual Interest Rate (% p.a.)</label>
                      <div className="relative">
                        <input
                          type="number"
                          min={5}
                          max={30}
                          step={0.1}
                          value={interestRate}
                          onChange={(e) => setInterestRate(Math.max(1, Number(e.target.value)))}
                          className="w-28 pr-7 pl-3 py-1.5 rounded-lg border border-slate-300 text-right text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <span className="absolute right-3 top-2 text-xs font-bold text-slate-400">%</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={25}
                      step={0.25}
                      value={interestRate}
                      onChange={(e) => setInterestRate(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>5%</span>
                      <span>15%</span>
                      <span>25%</span>
                    </div>
                  </div>

                  {/* Tenure with Unit Toggle */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold text-slate-700">Loan Tenure</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          max={tenureUnit === 'years' ? 30 : 360}
                          value={tenureValue}
                          onChange={(e) => setTenureValue(Math.max(1, Number(e.target.value)))}
                          className="w-20 px-3 py-1.5 rounded-lg border border-slate-300 text-right text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="bg-slate-100 p-0.5 rounded-lg flex text-xs font-semibold">
                          <button
                            type="button"
                            onClick={() => {
                              if (tenureUnit === 'months') {
                                setTenureValue(Math.max(1, Math.round(tenureValue / 12)));
                                setTenureUnit('years');
                              }
                            }}
                            className={`px-2.5 py-1 rounded-md transition ${
                              tenureUnit === 'years' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
                            }`}
                          >
                            Years
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (tenureUnit === 'years') {
                                setTenureValue(tenureValue * 12);
                                setTenureUnit('months');
                              }
                            }}
                            className={`px-2.5 py-1 rounded-md transition ${
                              tenureUnit === 'months' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500'
                            }`}
                          >
                            Months
                          </button>
                        </div>
                      </div>
                    </div>
                    <input
                      type="range"
                      min={1}
                      max={tenureUnit === 'years' ? 30 : 360}
                      step={1}
                      value={tenureValue}
                      onChange={(e) => setTenureValue(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                      <span>1 {tenureUnit}</span>
                      <span>{tenureUnit === 'years' ? '15 Years' : '180 Months'}</span>
                      <span>{tenureUnit === 'years' ? '30 Years' : '360 Months'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleResetEmi}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                    <Link
                      to={`/apply?amount=${principal}&tenure=${tenureInMonths}`}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center shadow-md shadow-blue-600/20 transition flex items-center justify-center gap-1.5"
                    >
                      Apply for this Loan <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Results Column */}
                <div className="lg:col-span-5 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between space-y-6">
                  <div>
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      Monthly Payment (EMI)
                    </span>
                    <p className="text-3xl sm:text-4xl font-extrabold text-white mt-1">
                      ₹{emiResult.monthlyEmi.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-emerald-400 mt-0.5">Reducing balance calculation</p>
                  </div>

                  {/* Donut Chart */}
                  <div className="h-48 w-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={50}
                          outerRadius={75}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: any) => `₹${Number(value).toLocaleString('en-IN')}`}
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Summary Breakdown */}
                  <div className="space-y-3 pt-4 border-t border-slate-800 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span>
                        Principal Loan Amount:
                      </span>
                      <span className="font-bold text-white">₹{emiResult.principal.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-400 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                        Total Interest Payable:
                      </span>
                      <span className="font-bold text-amber-300">₹{emiResult.totalInterest.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                      <span className="text-white font-bold">Total Repayment:</span>
                      <span className="font-extrabold text-blue-400 text-base">
                        ₹{emiResult.totalRepayment.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Amortization Schedule Table */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Amortization Repayment Schedule
                  </h3>
                  <p className="text-xs text-slate-500">
                    Monthly breakdown of principal, interest, and remaining balance across {tenureInMonths} months.
                  </p>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full self-start sm:self-auto">
                  Showing Month {(schedulePage - 1) * itemsPerPage + 1} to {Math.min(schedulePage * itemsPerPage, fullSchedule.length)} of {fullSchedule.length}
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
                      <th className="py-3 px-4 text-right">Total EMI</th>
                      <th className="py-3 px-4 text-right">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paginatedSchedule.map((row) => (
                      <tr key={row.installmentNumber} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">#{row.installmentNumber}</td>
                        <td className="py-3 px-4 text-slate-600">{row.dueDate}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-600">
                          ₹{row.openingBalance.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-semibold text-blue-700">
                          ₹{row.principalComponent.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-amber-700">
                          ₹{row.interestComponent.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          ₹{row.emiAmount.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono text-slate-700">
                          ₹{row.closingBalance.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                  <button
                    disabled={schedulePage === 1}
                    onClick={() => setSchedulePage(p => Math.max(1, p - 1))}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Previous
                  </button>
                  <span className="text-xs text-slate-500 font-medium">
                    Page {schedulePage} of {totalPages}
                  </span>
                  <button
                    disabled={schedulePage === totalPages}
                    onClick={() => setSchedulePage(p => Math.min(totalPages, p + 1))}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            TAB 2: SIMPLE INTEREST CALCULATOR
           ======================================================== */}
        {activeTab === 'SIMPLE' && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-lg max-w-4xl mx-auto space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Principal Amount (₹)
                  </label>
                  <input
                    type="number"
                    min={1000}
                    step={1000}
                    value={siPrincipal}
                    onChange={(e) => setSiPrincipal(Math.max(100, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Annual Interest Rate (% p.a.)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    step={0.1}
                    value={siRate}
                    onChange={(e) => setSiRate(Math.max(0.1, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Time Period (Years)
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    max={50}
                    step={0.5}
                    value={siTimeYears}
                    onChange={(e) => setSiTimeYears(Math.max(0.1, Number(e.target.value)))}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <button
                  onClick={handleResetSi}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              {/* SI Results Output */}
              <div className="md:col-span-5 bg-slate-900 rounded-2xl p-6 text-white space-y-5">
                <div>
                  <p className="text-xs text-slate-400 font-medium">Simple Interest Payable</p>
                  <p className="text-3xl font-extrabold text-amber-300 mt-1">
                    ₹{siResult.interest.toLocaleString('en-IN')}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Formula: (P × R × T) / 100</p>
                </div>

                <div className="space-y-3 pt-3 border-t border-slate-800 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span>Principal (P):</span>
                    <span className="font-bold text-white">₹{siResult.principal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Rate (R):</span>
                    <span className="font-bold text-white">{siRate}% p.a.</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Time (T):</span>
                    <span className="font-bold text-white">{siTimeYears} Years</span>
                  </div>
                  <div className="flex justify-between text-slate-300 pt-2 border-t border-slate-800">
                    <span className="font-bold text-white">Total Amount:</span>
                    <span className="font-extrabold text-blue-400 text-base">
                      ₹{siResult.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/apply?amount=${siPrincipal}`}
                  className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-xs text-center block shadow transition"
                >
                  Apply with these parameters
                </Link>
              </div>
            </div>

            {/* Explanation Note */}
            <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100 text-xs text-blue-900 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold">
                <Info className="w-4 h-4 text-blue-600" />
                <span>Simple vs Reducing Balance Interest Explained</span>
              </div>
              <p className="leading-relaxed text-blue-800">
                In <strong>Simple Interest</strong>, interest is charged only on the original principal amount over the entire duration. In <strong>Reducing Balance EMI</strong>, every monthly installment pays off a portion of the principal, so subsequent interest is calculated solely on the diminished balance, resulting in lower effective lifetime interest for borrowers!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
