import { Router } from 'express';
import { register, login, getMe, forgotPasswordDemo } from '../controllers/authController';
import { getProducts, getProductById, computeEmi, computeSimpleInterest } from '../controllers/loanProductController';
import {
  createApplication,
  getMyApplications,
  getApplicationById,
  uploadApplicationDocument,
  viewDocumentFile,
  submitClarification
} from '../controllers/applicationController';
import { getMyLoans, getLoanById, getLoanSchedule } from '../controllers/loanAccountController';
import { makePayment, getPaymentHistory, getTransactions, getTransactionById } from '../controllers/paymentController';
import { getMyNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController';
import { updateProfile, changePassword } from '../controllers/userController';
import {
  getDashboardStats,
  getApplications as getAdminApplications,
  getApplicationDetail as getAdminApplicationDetail,
  approveApplication,
  rejectApplication,
  requestMoreInfo,
  getUsers as getAdminUsers,
  getUserDetail as getAdminUserDetail,
  toggleUserStatus,
  getLoanProductsAdmin,
  createLoanProduct,
  updateLoanProduct,
  getAuditLogs
} from '../controllers/adminController';
import { authenticateJwt } from '../middleware/auth';
import { requireRole } from '../middleware/role';
import { documentUpload } from '../middleware/upload';

const router = Router();

// ==========================================
// 1. Authentication Routes
// ==========================================
router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/forgot-password', forgotPasswordDemo);
router.get('/auth/me', authenticateJwt, getMe);

// ==========================================
// 2. User Profile Routes
// ==========================================
router.get('/users/me', authenticateJwt, getMe);
router.put('/users/profile', authenticateJwt, updateProfile);
router.put('/users/change-password', authenticateJwt, changePassword);

// ==========================================
// 3. Loan Products & Calculators (Public/Open)
// ==========================================
router.get('/loans/products', getProducts);
router.get('/loans/products/:id', getProductById);
router.post('/calculator/emi', computeEmi);
router.post('/calculator/simple-interest', computeSimpleInterest);

// ==========================================
// 4. Loan Applications (Customer & Protected)
// ==========================================
router.post('/applications', authenticateJwt, createApplication);
router.get('/applications/my', authenticateJwt, getMyApplications);
router.get('/applications/:id', authenticateJwt, getApplicationById);
router.post('/applications/:id/documents', authenticateJwt, documentUpload.single('file'), uploadApplicationDocument);
router.get('/applications/documents/:docId/view', authenticateJwt, viewDocumentFile);
router.post('/applications/:id/clarification', authenticateJwt, submitClarification);

// ==========================================
// 5. Active Loan Accounts & Schedules
// ==========================================
router.get('/loans/my', authenticateJwt, getMyLoans);
router.get('/loans/account/:id', authenticateJwt, getLoanById);
router.get('/loans/account/:id/schedule', authenticateJwt, getLoanSchedule);

// ==========================================
// 6. Payments & Transactions
// ==========================================
router.post('/payments/pay', authenticateJwt, makePayment);
router.get('/payments/history', authenticateJwt, getPaymentHistory);
router.get('/transactions', authenticateJwt, getTransactions);
router.get('/transactions/:id', authenticateJwt, getTransactionById);

// ==========================================
// 7. Notifications
// ==========================================
router.get('/notifications', authenticateJwt, getMyNotifications);
router.put('/notifications/:id/read', authenticateJwt, markAsRead);
router.put('/notifications/read-all', authenticateJwt, markAllAsRead);

// ==========================================
// 8. Admin Routes (Protected by ADMIN role)
// ==========================================
router.get('/admin/stats', authenticateJwt, requireRole('ADMIN'), getDashboardStats);
router.get('/admin/applications', authenticateJwt, requireRole('ADMIN'), getAdminApplications);
router.get('/admin/applications/:id', authenticateJwt, requireRole('ADMIN'), getAdminApplicationDetail);
router.put('/admin/applications/:id/approve', authenticateJwt, requireRole('ADMIN'), approveApplication);
router.put('/admin/applications/:id/reject', authenticateJwt, requireRole('ADMIN'), rejectApplication);
router.put('/admin/applications/:id/request-info', authenticateJwt, requireRole('ADMIN'), requestMoreInfo);

router.get('/admin/users', authenticateJwt, requireRole('ADMIN'), getAdminUsers);
router.get('/admin/users/:id', authenticateJwt, requireRole('ADMIN'), getAdminUserDetail);
router.put('/admin/users/:id/status', authenticateJwt, requireRole('ADMIN'), toggleUserStatus);

router.get('/admin/loans', authenticateJwt, requireRole('ADMIN'), getLoanProductsAdmin);
router.post('/admin/loans', authenticateJwt, requireRole('ADMIN'), createLoanProduct);
router.put('/admin/loans/:id', authenticateJwt, requireRole('ADMIN'), updateLoanProduct);

router.get('/admin/audit-logs', authenticateJwt, requireRole('ADMIN'), getAuditLogs);

export default router;
