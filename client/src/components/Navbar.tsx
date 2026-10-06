import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationDropdown } from './NotificationDropdown';
import {
  Menu,
  X,
  CreditCard,
  Calculator,
  Briefcase,
  User,
  LogOut,
  ChevronDown,
  ShieldCheck,
  LayoutDashboard,
  Layers
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-slate-900 via-blue-900 to-blue-700 flex items-center justify-center text-white shadow-md shadow-blue-900/20 group-hover:scale-105 transition-transform duration-200">
                <span className="font-extrabold text-lg tracking-wider text-blue-200">F</span>
              </div>
              <div>
                <span className="font-extrabold text-xl text-slate-900 tracking-tight flex items-center">
                  Finova<span className="text-blue-600 font-bold ml-0.5">Finance</span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-1 font-medium tracking-wide">
                  Simple Finance. Smarter Decisions.
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/') ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/loans"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/loans') ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                Loans
              </Link>
              <Link
                to="/calculators"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/calculators') ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                Calculators
              </Link>
              <Link
                to="/about"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/about') ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                About
              </Link>
              <Link
                to="/help"
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive('/help') ? 'text-blue-700 bg-blue-50 font-semibold' : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                Help
              </Link>
            </div>
          </div>

          {/* Right Action Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <NotificationDropdown />

                {/* Dashboard button */}
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  {isAdmin ? 'Admin Console' : 'My Dashboard'}
                </Link>

                {/* User Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-full border border-slate-200 hover:border-slate-300 transition focus:outline-none"
                  >
                    <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
                      {user?.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-medium text-slate-700 max-w-[100px] truncate">
                      {user?.fullName.split(' ')[0]}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-xl ring-1 ring-black/5 border border-slate-100 py-1.5 z-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                        <span className="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700">
                          {user?.role}
                        </span>
                      </div>

                      <Link
                        to="/profile"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <User className="w-3.5 h-3.5" /> Profile & Settings
                      </Link>

                      <Link
                        to="/applications"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <Briefcase className="w-3.5 h-3.5" /> My Applications
                      </Link>

                      <Link
                        to="/loans/active"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        <CreditCard className="w-3.5 h-3.5" /> Active Loans
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2 px-4 py-2 text-xs text-amber-700 font-semibold hover:bg-amber-50"
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> Admin Portal
                        </Link>
                      )}

                      <div className="border-t border-slate-100 my-1"></div>

                      <button
                        onClick={() => {
                          logout();
                          setProfileDropdownOpen(false);
                          navigate('/login');
                        }}
                        className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/login"
                  className="px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition flex items-center gap-1"
                  title="Underwriter & Admin Login"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Admin
                </Link>
                <div className="h-4 w-px bg-slate-200"></div>
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition transform hover:-translate-y-0.5"
                >
                  Create Account
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex md:hidden items-center gap-2">
            {isAuthenticated && <NotificationDropdown />}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/loans"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Loans
          </Link>
          <Link
            to="/calculators"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Calculators
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            About
          </Link>
          <Link
            to="/help"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Help
          </Link>

          <div className="pt-4 border-t border-slate-100 space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to={isAdmin ? '/admin/dashboard' : '/dashboard'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-semibold text-blue-600 bg-blue-50"
                >
                  {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
                </Link>
                <Link
                  to="/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700"
                >
                  My Applications
                </Link>
                <Link
                  to="/loans/active"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700"
                >
                  Active Loans
                </Link>
                <Link
                  to="/payments"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700"
                >
                  Payments & EMI
                </Link>
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-700"
                >
                  Profile & Settings
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-rose-600"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <div className="space-y-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-lg border border-slate-300 font-semibold text-slate-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-lg bg-blue-600 font-bold text-white shadow"
                >
                  Create Account
                </Link>
                <Link
                  to="/admin/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-xs text-amber-700 font-semibold py-1"
                >
                  Admin Portal Login
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
