import React from 'react';
import { ApplicationStatus } from '../types';
import { Check, Clock, AlertCircle, X, ShieldAlert } from 'lucide-react';

interface ApplicationTimelineProps {
  status: ApplicationStatus;
  requestedAmount: number;
}

export const ApplicationTimeline: React.FC<ApplicationTimelineProps> = ({ status, requestedAmount }) => {
  const isHighValue = requestedAmount >= 100000;

  const steps = [
    { key: 'SUBMITTED', title: 'Application Submitted', desc: 'Application received and logged' },
    { key: 'DOCUMENTS', title: 'Documents Uploaded', desc: 'KYC & income proofs verified' },
    { key: 'VERIFICATION', title: 'Verification', desc: 'Credit check and DTI calculation' },
    {
      key: 'ADMIN_REVIEW',
      title: isHighValue ? 'Admin Review (Mandatory >= ₹1L)' : 'Underwriting Review',
      desc: isHighValue ? 'Assigned to senior credit risk officer' : 'Automated rule verification'
    },
    { key: 'DECISION', title: 'Approval / Decision', desc: 'Sanction letter issued' },
    { key: 'DISBURSEMENT', title: 'Disbursement & Active Loan', desc: 'Funds transferred to account' }
  ];

  // Helper to determine status index
  const getStepState = (index: number) => {
    if (status === 'REJECTED') {
      if (index === 4) return 'rejected';
      if (index < 4) return 'completed';
      return 'pending';
    }

    if (status === 'ADDITIONAL_INFORMATION_REQUIRED') {
      if (index === 3) return 'warning';
      if (index < 3) return 'completed';
      return 'pending';
    }

    if (status === 'PENDING_ADMIN_REVIEW') {
      if (index < 3) return 'completed';
      if (index === 3) return 'current';
      return 'pending';
    }

    if (status === 'UNDER_VERIFICATION') {
      if (index < 2) return 'completed';
      if (index === 2) return 'current';
      return 'pending';
    }

    if (status === 'APPROVED') {
      if (index <= 4) return 'completed';
      return 'current';
    }

    if (status === 'DISBURSED' || status === 'ACTIVE' || status === 'COMPLETED') {
      return 'completed';
    }

    return index === 0 ? 'current' : 'pending';
  };

  return (
    <div className="w-full py-4">
      <div className="relative">
        <div className="hidden md:block absolute top-5 left-8 right-8 h-0.5 bg-slate-200 -z-0" />
        
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
          {steps.map((step, index) => {
            const state = getStepState(index);

            return (
              <div key={step.key} className="flex md:flex-col items-start md:items-center text-left md:text-center group">
                {/* Node icon */}
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                    state === 'completed'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-500/20'
                      : state === 'current'
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 shadow-md animate-pulse'
                      : state === 'warning'
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                      : state === 'rejected'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {state === 'completed' && <Check className="w-5 h-5 stroke-[2.5]" />}
                  {state === 'current' && <Clock className="w-5 h-5" />}
                  {state === 'warning' && <AlertCircle className="w-5 h-5" />}
                  {state === 'rejected' && <X className="w-5 h-5 stroke-[2.5]" />}
                  {state === 'pending' && <span>{index + 1}</span>}
                </div>

                {/* Content */}
                <div className="ml-4 md:ml-0 md:mt-3">
                  <p
                    className={`text-sm font-semibold leading-tight ${
                      state === 'current'
                        ? 'text-blue-700'
                        : state === 'warning'
                        ? 'text-amber-700'
                        : state === 'rejected'
                        ? 'text-rose-700'
                        : state === 'completed'
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5 leading-snug">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
