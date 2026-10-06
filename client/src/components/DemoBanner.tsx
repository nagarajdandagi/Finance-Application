import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, LogOut, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoBanner: React.FC = () => {
  const { user, quickDemoLogin, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
            DEMO PLATFORM
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Finova Finance — Demonstration Digital Banking & Loan Management Platform (Non-Production)
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs">
          {user ? (
            <div className="flex items-center space-x-3">
              <span className="text-slate-300">
                Logged in as <strong className="text-white">{user.fullName}</strong> ({user.role})
              </span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="text-red-300 hover:text-red-200 underline flex items-center gap-1 transition-colors"
                title="Logout"
              >
                <LogOut className="w-3 h-3" />
                Sign Out
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-slate-400">Quick Test:</span>
              <button
                onClick={async () => {
                  await quickDemoLogin('CUSTOMER');
                  navigate('/dashboard');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-medium text-[11px] transition"
              >
                <UserCheck className="w-3 h-3" />
                Login as Customer (Rahul)
              </button>
              <button
                onClick={async () => {
                  await quickDemoLogin('ADMIN');
                  navigate('/admin/dashboard');
                }}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-[11px] transition"
              >
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Login as Admin
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
