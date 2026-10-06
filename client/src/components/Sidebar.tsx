import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import {
  LayoutDashboard,
  FilePlus,
  Files,
  CreditCard,
  DollarSign,
  History,
  Calculator,
  User,
  Shield,
  Users,
  Settings,
  ListOrdered,
  LogOut,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

interface SidebarProps {
  isAdminMode?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isAdminMode = false }) => {
  const { user, logout } = useAuth();
  const { unreadCount } = useNotifications();

  const customerNavItems = [
    { to: '/dashboard', label: 'Financial Overview', icon: LayoutDashboard },
    { to: '/apply', label: 'Apply for Loan', icon: FilePlus, badge: 'Fast Track' },
    { to: '/applications', label: 'My Applications', icon: Files },
    { to: '/loans/active', label: 'Active Loans', icon: CreditCard },
    { to: '/payments', label: 'EMI & Payments', icon: DollarSign },
    { to: '/transactions', label: 'Transaction History', icon: History },
    { to: '/calculators', label: 'Loan Calculators', icon: Calculator },
    { to: '/profile', label: 'Profile & Documents', icon: User },
  ];

  const adminNavItems = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/applications', label: 'Loan Applications', icon: Files, badge: 'Review' },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/loans', label: 'Loan Products Config', icon: Settings },
    { to: '/admin/audit-logs', label: 'Security Audit Logs', icon: ListOrdered },
  ];

  const items = isAdminMode ? adminNavItems : customerNavItems;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-4rem)] flex flex-col justify-between py-6 px-4 shadow-sm">
      <div className="space-y-6">
        {/* User Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl font-bold flex items-center justify-center text-sm shadow-sm ${
            isAdminMode ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'
          }`}>
            {user?.fullName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-sm font-semibold text-slate-900 truncate">{user?.fullName}</h4>
            <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
            <span className={`inline-block mt-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold ${
              isAdminMode ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {isAdminMode ? 'UNDERWRITER / ADMIN' : 'CUSTOMER'}
            </span>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {isAdminMode ? 'Underwriting & Operations' : 'Account Management'}
          </p>

          {items.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/dashboard' || item.to === '/admin/dashboard'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? isAdminMode
                        ? 'bg-amber-500/10 text-amber-900 font-semibold shadow-sm'
                        : 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? isAdminMode ? 'text-amber-600' : 'text-blue-600'
                            : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                        isAdminMode ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Switcher */}
      <div className="pt-6 border-t border-slate-100 space-y-2">
        {user?.role === 'ADMIN' && (
          <NavLink
            to={isAdminMode ? '/dashboard' : '/admin/dashboard'}
            className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
          >
            <span className="flex items-center gap-2">
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              {isAdminMode ? 'Switch to Customer View' : 'Switch to Admin View'}
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </NavLink>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Account
        </button>
      </div>
    </aside>
  );
};
