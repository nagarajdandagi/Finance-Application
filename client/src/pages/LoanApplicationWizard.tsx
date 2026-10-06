import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { LoanProduct } from '../types';
import { DocumentUploader } from '../components/DocumentUploader';
import { calculateReducingBalanceEmi } from '../utils/calculations';
import {
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  FileText,
  User,
  Briefcase,
  Building,
  Upload,
  Users,
  Check,
  Edit2
} from 'lucide-react';

export const LoanApplicationWizard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Form State
  const [selectedProductId, setSelectedProductId] = useState<string>('prod_personal');
  const [requestedAmount, setRequestedAmount] = useState<number>(300000);
  const [tenureMonths, setTenureMonths] = useState<number>(36);
  const [purpose, setPurpose] = useState<string>('Personal & Family Requirement');

  // Personal Info
  const [personalInfo, setPersonalInfo] = useState({
    fullName: user?.fullName || '',
    dateOfBirth: user?.dateOfBirth || '1992-05-14',
    gender: 'Male',
    mobile: user?.mobile || '',
    email: user?.email || '',
    address: user?.address || 'Flat 402, Sunshine Heights, Outer Ring Road',
    city: user?.city || 'Bengaluru',
    state: user?.state || 'Karnataka',
    pincode: user?.pincode || '560103'
  });

  // Employment & Income
  const [employmentInfo, setEmploymentInfo] = useState({
    employmentType: 'Salaried',
    companyName: user?.companyName || 'Infosys Ltd',
    jobTitle: user?.jobTitle || 'Senior Software Engineer',
    monthlyIncome: user?.monthlyIncome || 85000,
    yearsEmployed: 4.5,
    existingEmis: 0,
    monthlyObligations: 12000
  });

  // Bank Info
  const [bankInfo, setBankInfo] = useState({
    bankName: user?.bankName || 'HDFC Bank',
    accountNumber: user?.accountNumber || '50100432198765',
    confirmAccountNumber: user?.accountNumber || '50100432198765',
    ifscCode: user?.ifscCode || 'HDFC0001234',
    accountHolderName: user?.fullName || 'Rahul Sharma'
  });

  // Document Uploads
  const [panDoc, setPanDoc] = useState<File | null>(null);
  const [idDoc, setIdDoc] = useState<File | null>(null);
  const [addressDoc, setAddressDoc] = useState<File | null>(null);
  const [incomeDoc, setIncomeDoc] = useState<File | null>(null);
  const [bankDoc, setBankDoc] = useState<File | null>(null);
  const [salaryDoc, setSalaryDoc] = useState<File | null>(null);

  // Guarantor & Co-Applicant
  const [hasGuarantor, setHasGuarantor] = useState(false);
  const [guarantor, setGuarantor] = useState({
    fullName: 'Suresh Sharma',
    relationship: 'Father',
    mobile: '9844001122',
    email: 'suresh.sharma@example.com',
    address: 'Flat 101, Green Meadows, Bengaluru',
    occupation: 'Retired Pensioner',
    monthlyIncome: 45000,
    panNumber: 'ABGPS9988H'
  });

  const [hasCoApplicant, setHasCoApplicant] = useState(false);
  const [coApplicant, setCoApplicant] = useState({
    fullName: '',
    relationship: 'Spouse',
    mobile: '',
    email: '',
    address: '',
    occupation: '',
    monthlyIncome: 0,
    panNumber: ''
  });

  // Declaration
  const [termsAgreed, setTermsAgreed] = useState(false);

  // Load products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/loans/products');
        if (res.data.success) {
          setProducts(res.data.data);

          // Check URL query parameters
          const queryProduct = searchParams.get('product');
          const queryAmount = searchParams.get('amount');
          const queryTenure = searchParams.get('tenure');

          if (queryProduct) setSelectedProductId(queryProduct);
          if (queryAmount) setRequestedAmount(Number(queryAmount));
          if (queryTenure) setTenureMonths(Number(queryTenure));
        }
      } catch (err) {
        console.error('Failed to load products:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, [searchParams]);

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];

  // Auto-enable guarantor toggle if product requires it
  useEffect(() => {
    if (selectedProduct?.guarantor_required) {
      setHasGuarantor(true);
    }
  }, [selectedProduct]);

  // Live EMI Calculation
  const currentRate = selectedProduct ? selectedProduct.default_interest_rate : 12;
  const liveEmi = calculateReducingBalanceEmi(requestedAmount, currentRate, tenureMonths);

  // Steps definition
  const steps = [
    { number: 1, title: 'Loan Selection', icon: FileText },
    { number: 2, title: 'Personal Info', icon: User },
    { number: 3, title: 'Income & Job', icon: Briefcase },
    { number: 4, title: 'Bank Account', icon: Building },
    { number: 5, title: 'Upload Proofs', icon: Upload },
    { number: 6, title: 'Guarantor / Surety', icon: Users },
    { number: 7, title: 'Final Review', icon: CheckCircle2 }
  ];

  // Validation before advancing
  const handleNext = () => {
    setSubmitError(null);

    if (currentStep === 1) {
      if (!selectedProduct) {
        setSubmitError('Please select a loan product.');
        return;
      }
      if (requestedAmount < selectedProduct.min_amount || requestedAmount > selectedProduct.max_amount) {
        setSubmitError(
          `Amount must be between ₹${selectedProduct.min_amount.toLocaleString('en-IN')} and ₹${selectedProduct.max_amount.toLocaleString('en-IN')}.`
        );
        return;
      }
    }

    if (currentStep === 2) {
      if (!personalInfo.fullName || !personalInfo.mobile || !personalInfo.email) {
        setSubmitError('Please fill all mandatory personal details.');
        return;
      }
    }

    if (currentStep === 4) {
      if (bankInfo.accountNumber !== bankInfo.confirmAccountNumber) {
        setSubmitError('Bank account numbers do not match.');
        return;
      }
    }

    if (currentStep === 6) {
      if (selectedProduct.guarantor_required && (!guarantor.fullName || !guarantor.mobile)) {
        setSubmitError('A guarantor is mandatory for this loan product. Please provide details.');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(steps.length, prev + 1));
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!termsAgreed) {
      setSubmitError('Please confirm the accuracy of information by checking the declaration.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      const payload: any = {
        productId: selectedProductId,
        requestedAmount,
        tenureMonths,
        purpose,
        employmentType: employmentInfo.employmentType,
        companyName: employmentInfo.companyName,
        jobTitle: employmentInfo.jobTitle,
        monthlyIncome: employmentInfo.monthlyIncome,
        yearsEmployed: employmentInfo.yearsEmployed,
        existingEmis: employmentInfo.existingEmis,
        monthlyObligations: employmentInfo.monthlyObligations,
        bankName: bankInfo.bankName,
        accountNumber: bankInfo.accountNumber,
        ifscCode: bankInfo.ifscCode,
        accountHolderName: bankInfo.accountHolderName
      };

      if (hasGuarantor && guarantor.fullName) {
        payload.guarantor = guarantor;
      }

      if (hasCoApplicant && coApplicant.fullName) {
        payload.coApplicant = coApplicant;
      }

      const res = await api.post('/applications', payload);
      if (res.data.success) {
        const appId = res.data.applicationId;

        // If documents selected, upload them to application
        const docUploadList = [
          { file: panDoc, type: 'PAN_CARD' },
          { file: idDoc, type: 'IDENTITY_PROOF' },
          { file: addressDoc, type: 'ADDRESS_PROOF' },
          { file: incomeDoc, type: 'INCOME_PROOF' },
          { file: bankDoc, type: 'BANK_STATEMENT' },
          { file: salaryDoc, type: 'SALARY_SLIP' }
        ];

        for (const docItem of docUploadList) {
          if (docItem.file) {
            const formData = new FormData();
            formData.append('file', docItem.file);
            formData.append('documentType', docItem.type);
            await api.post(`/applications/${appId}/documents`, formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
            });
          }
        }

        // Navigate to application status tracking page
        navigate(`/applications/${appId}`);
      } else {
        setSubmitError(res.data.message || 'Submission failed.');
      }
    } catch (err: any) {
      console.error('Error submitting loan application:', err);
      setSubmitError(err.response?.data?.message || 'Failed to submit application. Please check your data.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Top Header */}
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
          Digital Loan Application
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Finova Smart Application Wizard
        </h1>
        <p className="text-xs text-slate-500">
          Complete the 7 steps below. Applications with amounts ≥ ₹1,00,000 will be routed for administrative underwriter review.
        </p>
      </div>

      {/* Progress Step Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm overflow-x-auto">
        <div className="flex items-center justify-between min-w-[600px] px-2">
          {steps.map((step, idx) => {
            const isCompleted = currentStep > step.number;
            const isCurrent = currentStep === step.number;

            return (
              <React.Fragment key={step.number}>
                <div
                  onClick={() => isCompleted && setCurrentStep(step.number)}
                  className={`flex flex-col items-center cursor-pointer transition ${
                    isCompleted ? 'hover:opacity-80' : ''
                  }`}
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      isCompleted
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : isCurrent
                        ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : step.number}
                  </div>
                  <span
                    className={`text-[11px] font-semibold mt-1.5 whitespace-nowrap ${
                      isCurrent ? 'text-blue-700' : isCompleted ? 'text-slate-700' : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </span>
                </div>

                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-2 transition-all ${
                      currentStep > step.number ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error alert */}
      {submitError && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-start gap-2.5 shadow-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <span>{submitError}</span>
        </div>
      )}

      {/* Wizard Step Card */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-200 shadow-xl space-y-8">
        {/* ========================================================
            STEP 1: LOAN SELECTION
           ======================================================== */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 1: Select Loan Product & Amount</h2>
              <p className="text-xs text-slate-500">Pick from our product portfolio and customize tenure.</p>
            </div>

            {/* Product selection tiles */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setSelectedProductId(p.id);
                    setRequestedAmount(Math.min(p.max_amount, Math.max(p.min_amount, requestedAmount)));
                  }}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition text-left space-y-1 ${
                    selectedProductId === p.id
                      ? 'border-blue-600 bg-blue-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <p className="font-bold text-xs text-slate-900">{p.name}</p>
                  <p className="text-[11px] text-blue-600 font-semibold">{p.default_interest_rate}% p.a.</p>
                  <p className="text-[10px] text-slate-400">
                    Up to ₹{(p.max_amount / 100000).toFixed(1)} Lakhs
                  </p>
                </div>
              ))}
            </div>

            {/* Amount Slider */}
            {selectedProduct && (
              <div className="space-y-6 pt-2">
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Requested Loan Amount</label>
                    <span className="text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                      ₹{requestedAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={selectedProduct.min_amount}
                    max={selectedProduct.max_amount}
                    step={25000}
                    value={requestedAmount}
                    onChange={(e) => setRequestedAmount(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Min: ₹{selectedProduct.min_amount.toLocaleString('en-IN')}</span>
                    <span>Max: ₹{selectedProduct.max_amount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Tenure */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs font-bold text-slate-700">Preferred Tenure (Months)</label>
                    <span className="text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg">
                      {tenureMonths} Months ({(tenureMonths / 12).toFixed(1)} Yrs)
                    </span>
                  </div>
                  <input
                    type="range"
                    min={selectedProduct.min_tenure_months}
                    max={selectedProduct.max_tenure_months}
                    step={6}
                    value={tenureMonths}
                    onChange={(e) => setTenureMonths(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>

                {/* Purpose */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Loan Purpose / Reason</label>
                  <input
                    type="text"
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    placeholder="e.g. Home Renovation, Inventory Purchase, Medical Expense"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Live Estimated EMI Banner */}
                <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[11px] text-slate-400">Estimated Monthly EMI</span>
                    <p className="text-2xl font-extrabold text-white">
                      ₹{liveEmi.monthlyEmi.toLocaleString('en-IN')} / month
                    </p>
                    <p className="text-[10px] text-emerald-400 mt-0.5">
                      Interest Rate: {currentRate}% p.a. • Total Interest: ₹{liveEmi.totalInterest.toLocaleString('en-IN')}
                    </p>
                  </div>

                  {requestedAmount >= 100000 && (
                    <span className="px-3 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-semibold">
                      Requires Admin Review (≥ ₹1L)
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ========================================================
            STEP 2: PERSONAL INFORMATION
           ======================================================== */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 2: Personal Information</h2>
              <p className="text-xs text-slate-500">Provide official details as indicated on your government identity cards.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={personalInfo.fullName}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  required
                  value={personalInfo.dateOfBirth}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={personalInfo.mobile}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, mobile: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={personalInfo.email}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Residential Address</label>
                <input
                  type="text"
                  value={personalInfo.address}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City</label>
                <input
                  type="text"
                  value={personalInfo.city}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, city: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">State</label>
                <input
                  type="text"
                  value={personalInfo.state}
                  onChange={(e) => setPersonalInfo({ ...personalInfo, state: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 3: EMPLOYMENT / INCOME
           ======================================================== */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 3: Employment & Monthly Cash Flow</h2>
              <p className="text-xs text-slate-500">
                Used to verify Debt-To-Income (DTI) ratio and automated repayment eligibility.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employment Type</label>
                <select
                  value={employmentInfo.employmentType}
                  onChange={(e) => setEmploymentInfo({ ...employmentInfo, employmentType: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                >
                  <option value="Salaried">Salaried Professional</option>
                  <option value="Self-employed">Self-Employed Professional</option>
                  <option value="Business Owner">Business Owner / MSME</option>
                  <option value="Student">Student</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Name</label>
                <input
                  type="text"
                  value={employmentInfo.companyName}
                  onChange={(e) => setEmploymentInfo({ ...employmentInfo, companyName: e.target.value })}
                  placeholder="e.g. Infosys, TCS, Self"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Job Title</label>
                <input
                  type="text"
                  value={employmentInfo.jobTitle}
                  onChange={(e) => setEmploymentInfo({ ...employmentInfo, jobTitle: e.target.value })}
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Net Monthly In-Hand Income (₹)</label>
                <input
                  type="number"
                  required
                  value={employmentInfo.monthlyIncome}
                  onChange={(e) => setEmploymentInfo({ ...employmentInfo, monthlyIncome: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Total Years in Employment / Business</label>
                <input
                  type="number"
                  step={0.5}
                  value={employmentInfo.yearsEmployed}
                  onChange={(e) => setEmploymentInfo({ ...employmentInfo, yearsEmployed: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Existing Monthly EMIs (₹)</label>
                <input
                  type="number"
                  value={employmentInfo.existingEmis}
                  onChange={(e) => setEmploymentInfo({ ...employmentInfo, existingEmis: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 4: BANK ACCOUNT INFORMATION
           ======================================================== */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 4: Bank Account Details</h2>
              <p className="text-xs text-slate-500">
                Loan disbursement funds will be wired directly to this account upon approval.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={bankInfo.bankName}
                  onChange={(e) => setBankInfo({ ...bankInfo, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank, ICICI Bank, SBI"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Legal Name</label>
                <input
                  type="text"
                  required
                  value={bankInfo.accountHolderName}
                  onChange={(e) => setBankInfo({ ...bankInfo, accountHolderName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Account Number</label>
                <input
                  type="password"
                  required
                  value={bankInfo.accountNumber}
                  onChange={(e) => setBankInfo({ ...bankInfo, accountNumber: e.target.value })}
                  placeholder="Enter full account number"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Account Number</label>
                <input
                  type="text"
                  required
                  value={bankInfo.confirmAccountNumber}
                  onChange={(e) => setBankInfo({ ...bankInfo, confirmAccountNumber: e.target.value })}
                  placeholder="Confirm account number"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code (11 Digits)</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={bankInfo.ifscCode}
                  onChange={(e) => setBankInfo({ ...bankInfo, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="HDFC0001234"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-medium text-slate-900 uppercase"
                />
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 5: DOCUMENT UPLOAD
           ======================================================== */}
        {currentStep === 5 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 5: KYC & Financial Document Upload</h2>
              <p className="text-xs text-slate-500">
                Upload clear PDF or JPG scans. Files are validated for security and stored confidentially.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <DocumentUploader
                label="PAN Card Document"
                description="Mandatory for tax identity"
                required
                selectedFile={panDoc}
                onFileSelect={setPanDoc}
              />

              <DocumentUploader
                label="Government Identity Proof"
                description="Aadhaar, Passport, or Voter ID"
                required
                selectedFile={idDoc}
                onFileSelect={setIdDoc}
              />

              <DocumentUploader
                label="Address Proof"
                description="Electricity bill or rent agreement"
                selectedFile={addressDoc}
                onFileSelect={setAddressDoc}
              />

              <DocumentUploader
                label="Last 3 Months Salary Slips"
                description="Salary slips from employer"
                selectedFile={salaryDoc}
                onFileSelect={setSalaryDoc}
              />

              <DocumentUploader
                label="Last 6 Months Bank Statement"
                description="Salary credited account PDF"
                selectedFile={bankDoc}
                onFileSelect={setBankDoc}
              />

              <DocumentUploader
                label="Income Proof / Form 16"
                description="ITR Acknowledgement / Form 16"
                selectedFile={incomeDoc}
                onFileSelect={setIncomeDoc}
              />
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 6: GUARANTOR / SURETY & CO-APPLICANT
           ======================================================== */}
        {currentStep === 6 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 6: Guarantor / Surety & Co-Applicant</h2>
              <p className="text-xs text-slate-500">
                Strengthens credit eligibility and required for select loan categories.
              </p>
            </div>

            {/* Guarantor Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Guarantor / Surety</h3>
                  <p className="text-[11px] text-slate-500">
                    {selectedProduct?.guarantor_required
                      ? 'Mandatory for this loan product'
                      : 'Optional surety to enhance loan eligibility'}
                  </p>
                </div>
                {!selectedProduct?.guarantor_required && (
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={hasGuarantor}
                      onChange={(e) => setHasGuarantor(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                    />
                    <span>Add Guarantor</span>
                  </label>
                )}
              </div>

              {hasGuarantor && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Guarantor Full Name</label>
                    <input
                      type="text"
                      value={guarantor.fullName}
                      onChange={(e) => setGuarantor({ ...guarantor, fullName: e.target.value })}
                      placeholder="e.g. Suresh Sharma"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship with Applicant</label>
                    <input
                      type="text"
                      value={guarantor.relationship}
                      onChange={(e) => setGuarantor({ ...guarantor, relationship: e.target.value })}
                      placeholder="e.g. Father, Brother, Relative"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={guarantor.mobile}
                      onChange={(e) => setGuarantor({ ...guarantor, mobile: e.target.value })}
                      placeholder="9844001122"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Income (₹)</label>
                    <input
                      type="number"
                      value={guarantor.monthlyIncome}
                      onChange={(e) => setGuarantor({ ...guarantor, monthlyIncome: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Guarantor PAN Number</label>
                    <input
                      type="text"
                      value={guarantor.panNumber}
                      onChange={(e) => setGuarantor({ ...guarantor, panNumber: e.target.value.toUpperCase() })}
                      placeholder="ABGPS9988H"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900 uppercase"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Co-Applicant Section */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Co-Applicant</h3>
                  <p className="text-[11px] text-slate-500">Add spouse or parent to pool household income.</p>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                  <input
                    type="checkbox"
                    checked={hasCoApplicant}
                    onChange={(e) => setHasCoApplicant(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <span>Add Co-Applicant</span>
                </label>
              </div>

              {hasCoApplicant && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Co-Applicant Full Name</label>
                    <input
                      type="text"
                      value={coApplicant.fullName}
                      onChange={(e) => setCoApplicant({ ...coApplicant, fullName: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
                    <input
                      type="text"
                      value={coApplicant.relationship}
                      onChange={(e) => setCoApplicant({ ...coApplicant, relationship: e.target.value })}
                      placeholder="e.g. Spouse"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number</label>
                    <input
                      type="tel"
                      value={coApplicant.mobile}
                      onChange={(e) => setCoApplicant({ ...coApplicant, mobile: e.target.value })}
                      placeholder="9811223344"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Income (₹)</label>
                    <input
                      type="number"
                      value={coApplicant.monthlyIncome}
                      onChange={(e) => setCoApplicant({ ...coApplicant, monthlyIncome: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-900"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
            STEP 7: COMPLETE SUMMARY & REVIEW
           ======================================================== */}
        {currentStep === 7 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Step 7: Application Summary & Confirmation</h2>
              <p className="text-xs text-slate-500">
                Please verify all provided details before transmitting your credit dossier.
              </p>
            </div>

            {/* High-value approval rule alert */}
            {requestedAmount >= 100000 ? (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Administrative Review Notice (Loan ≥ ₹1,00,000)</span>
                </div>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  In accordance with Finova credit underwriting policy, your application of ₹{requestedAmount.toLocaleString('en-IN')} will be marked as <strong>PENDING ADMIN REVIEW</strong>. Our operations team will verify your dossier and issue approval.
                </p>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Automated Workflow (Loan &lt; ₹1,00,000)</span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Your application meets the threshold for rapid automated underwriting eligibility.
                </p>
              </div>
            )}

            {/* Summary cards */}
            <div className="space-y-4 text-xs">
              {/* Loan Details summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900">Loan Request Details</h4>
                  <p className="text-slate-600">Product: <strong>{selectedProduct?.name}</strong></p>
                  <p className="text-slate-600">Amount: <strong>₹{requestedAmount.toLocaleString('en-IN')}</strong></p>
                  <p className="text-slate-600">Tenure: <strong>{tenureMonths} Months</strong></p>
                  <p className="text-slate-600">Estimated EMI: <strong className="text-blue-700">₹{liveEmi.monthlyEmi.toLocaleString('en-IN')}/mo</strong></p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>

              {/* Personal Details summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900">Personal Information</h4>
                  <p className="text-slate-600">Applicant: <strong>{personalInfo.fullName}</strong></p>
                  <p className="text-slate-600">Contact: {personalInfo.mobile} • {personalInfo.email}</p>
                  <p className="text-slate-600">Address: {personalInfo.address}, {personalInfo.city}, {personalInfo.state} - {personalInfo.pincode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>

              {/* Income Details summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900">Income & Employment</h4>
                  <p className="text-slate-600">Profile: {employmentInfo.employmentType} ({employmentInfo.jobTitle} at {employmentInfo.companyName})</p>
                  <p className="text-slate-600">Monthly Net Income: <strong>₹{employmentInfo.monthlyIncome.toLocaleString('en-IN')}</strong></p>
                  <p className="text-slate-600">Existing Monthly Debts: ₹{employmentInfo.existingEmis.toLocaleString('en-IN')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>

              {/* Bank Details summary */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex justify-between items-start">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-900">Disbursement Bank Account</h4>
                  <p className="text-slate-600">Bank: <strong>{bankInfo.bankName}</strong></p>
                  <p className="text-slate-600">Account: <strong>XXXX-XXXX-{bankInfo.accountNumber.slice(-4)}</strong> (Masked for Security)</p>
                  <p className="text-slate-600">IFSC: {bankInfo.ifscCode}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1"
                >
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
              </div>
            </div>

            {/* Declaration Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 p-4 rounded-2xl bg-blue-50/50 border border-blue-100 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={termsAgreed}
                  onChange={(e) => setTermsAgreed(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-slate-700 leading-relaxed font-medium">
                  I confirm that the information provided in this loan application is accurate, valid, and true to the best of my knowledge. I authorize Finova Finance underwriter agents to verify credit bureau data and evaluate income documents.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Wizard Navigation Toolbar */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-100">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" /> Previous Step
            </button>
          ) : (
            <div />
          )}

          {currentStep < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition flex items-center gap-1.5"
            >
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled={submitting || !termsAgreed}
              onClick={handleSubmit}
              className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Transmitting Dossier...' : 'Submit Loan Application'}
              <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
