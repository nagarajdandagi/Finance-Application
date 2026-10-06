import React from 'react';
import { ApplicationStatus } from '../types';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileSearch,
  Hourglass,
  ArrowRightCircle
} from 'lucide-react';

interface StatusBadgeProps {
  status: ApplicationStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
    lg: 'px-3 py-1.5 text-sm gap-2',
  }[size];

  switch (status) {
    case 'PENDING_ADMIN_REVIEW':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-amber-50 text-amber-800 border border-amber-200 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
          Pending Admin Review
        </span>
      );

    case 'UNDER_VERIFICATION':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200 ${sizeClasses}`}>
          <FileSearch className="w-3.5 h-3.5 text-blue-500" />
          Under Verification
        </span>
      );

    case 'APPROVED':
    case 'ACTIVE':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          {status === 'ACTIVE' ? 'Active Loan' : 'Approved'}
        </span>
      );

    case 'REJECTED':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-rose-50 text-rose-700 border border-rose-200 ${sizeClasses}`}>
          <XCircle className="w-3.5 h-3.5 text-rose-600" />
          Rejected
        </span>
      );

    case 'ADDITIONAL_INFORMATION_REQUIRED':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-orange-50 text-orange-800 border border-orange-300 ${sizeClasses}`}>
          <AlertTriangle className="w-3.5 h-3.5 text-orange-600" />
          Action Required: Info Needed
        </span>
      );

    case 'DISBURSED':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200 ${sizeClasses}`}>
          <ArrowRightCircle className="w-3.5 h-3.5 text-teal-600" />
          Disbursed
        </span>
      );

    case 'COMPLETED':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-700 border border-slate-300 ${sizeClasses}`}>
          <CheckCircle2 className="w-3.5 h-3.5 text-slate-500" />
          Completed
        </span>
      );

    case 'SUBMITTED':
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-sky-50 text-sky-700 border border-sky-200 ${sizeClasses}`}>
          <Clock className="w-3.5 h-3.5 text-sky-500" />
          Submitted
        </span>
      );

    default:
      return (
        <span className={`inline-flex items-center font-medium rounded-full bg-slate-100 text-slate-600 border border-slate-200 ${sizeClasses}`}>
          <Hourglass className="w-3.5 h-3.5 text-slate-400" />
          {status.replace(/_/g, ' ')}
        </span>
      );
  }
};
