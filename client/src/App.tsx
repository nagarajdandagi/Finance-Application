import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Components
import { DemoBanner } from './components/DemoBanner';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoansPage } from './pages/LoansPage';
import { CalculatorsPage } from './pages/CalculatorsPage';
import { AboutPage, HelpPage } from './pages/AboutHelpPages';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { AdminLoginPage } from './pages/AdminLoginPage';

// Customer Pages
import { DashboardPage } from './pages/DashboardPage';
import { LoanApplicationWizard } from './pages/LoanApplicationWizard';
import { ApplicationsListPage } from './pages/ApplicationsListPage';
import { ApplicationDetailPage } from './pages/ApplicationDetailPage';
import { ActiveLoansPage } from './pages/ActiveLoansPage';
import { LoanDetailPage } from './pages/LoanDetailPage';
import { PaymentsPage } from './pages/PaymentsPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminApplicationsPage } from './pages/admin/AdminApplicationsPage';
import { AdminApplicationReviewPage } from './pages/admin/AdminApplicationReviewPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminLoansPage } from './pages/admin/AdminLoansPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Layout 1: Public Layout
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <DemoBanner />
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Layout 2: Customer Dashboard Layout (with Sidebar)
const CustomerPortalLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      <DemoBanner />
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <div className="hidden md:block">
          <Sidebar isAdminMode={false} />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Layout 3: Admin Portal Layout (with Admin Sidebar)
const AdminPortalLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-100/70 text-slate-800">
      <DemoBanner />
      <Navbar />
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        <div className="hidden md:block">
          <Sidebar isAdminMode={true} />
        </div>
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

// Route Guard: Protected Route for Customers
const CustomerProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Route Guard: Protected Route for Admin only
const AdminProtectedRoute: React.FC = () => {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }
  if (!user) return <Navigate to="/admin/login" replace />;
  if (user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <Outlet />
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Routes */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/loans" element={<LoansPage />} />
              <Route path="/calculators" element={<CalculatorsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/help" element={<HelpPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/admin/login" element={<AdminLoginPage />} />
            </Route>

            {/* Customer Protected Routes */}
            <Route element={<CustomerProtectedRoute />}>
              <Route element={<CustomerPortalLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/apply" element={<LoanApplicationWizard />} />
                <Route path="/applications" element={<ApplicationsListPage />} />
                <Route path="/applications/:id" element={<ApplicationDetailPage />} />
                <Route path="/loans/active" element={<ActiveLoansPage />} />
                <Route path="/loans/account/:id" element={<LoanDetailPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<AdminProtectedRoute />}>
              <Route element={<AdminPortalLayout />}>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="/admin/applications" element={<AdminApplicationsPage />} />
                <Route path="/admin/applications/:id" element={<AdminApplicationReviewPage />} />
                <Route path="/admin/users" element={<AdminUsersPage />} />
                <Route path="/admin/loans" element={<AdminLoansPage />} />
                <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
};

export default App;
