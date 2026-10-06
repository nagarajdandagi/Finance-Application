import { Request, Response } from 'express';
import { query, queryOne, run } from '../config/db';

export function makePayment(req: Request, res: Response): void {
  try {
    const userId = req.user!.id;
    const { loanAccountId, amount, paymentMethod } = req.body;

    if (!loanAccountId) {
      res.status(400).json({ success: false, message: 'Please select a loan account.' });
      return;
    }

    const loan = queryOne('SELECT * FROM loan_accounts WHERE id = ?', [loanAccountId]);
    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan account not found.' });
      return;
    }

    if (loan.user_id !== userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ success: false, message: 'Access denied: You do not own this loan account.' });
      return;
    }

    if (loan.status === 'CLOSED') {
      res.status(400).json({ success: false, message: 'This loan has already been fully paid and closed!' });
      return;
    }

    // Find the next upcoming installment
    const upcomingSchedule = queryOne(`
      SELECT * FROM repayment_schedules
      WHERE loan_account_id = ? AND status = 'UPCOMING'
      ORDER BY installment_number ASC
      LIMIT 1
    `, [loanAccountId]);

    if (!upcomingSchedule) {
      res.status(400).json({ success: false, message: 'No pending installments found for this loan.' });
      return;
    }

    const paymentAmount = Number(amount) || upcomingSchedule.emi_amount;
    const payId = 'PAY-2026-' + Math.floor(10000 + Math.random() * 90000);
    const txnId = 'TXN-2026-' + Math.floor(10000 + Math.random() * 90000);
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    // 1. Mark schedule row as PAID
    run(`
      UPDATE repayment_schedules
      SET status = 'PAID', paid_date = ?, payment_id = ?
      WHERE id = ?;
    `, [today, payId, upcomingSchedule.id]);

    // 2. Update loan account balances
    const newOutstanding = Math.max(0, loan.outstanding_balance - upcomingSchedule.principal_component);
    const newTotalPaid = loan.total_paid + paymentAmount;
    const newTotalInterestPaid = loan.total_interest_paid + upcomingSchedule.interest_component;
    const newRemainingTenure = Math.max(0, loan.remaining_tenure_months - 1);

    // Look up subsequent installment date
    const nextRow = queryOne(`
      SELECT due_date FROM repayment_schedules
      WHERE loan_account_id = ? AND status = 'UPCOMING'
      ORDER BY installment_number ASC
      LIMIT 1
    `, [loanAccountId]);

    const nextDueDate = nextRow ? nextRow.due_date : null;
    const newLoanStatus = newRemainingTenure === 0 || newOutstanding <= 0 ? 'CLOSED' : 'ACTIVE';

    run(`
      UPDATE loan_accounts
      SET outstanding_balance = ?, total_paid = ?, total_interest_paid = ?,
          remaining_tenure_months = ?, next_emi_date = ?, status = ?
      WHERE id = ?;
    `, [
      newOutstanding, newTotalPaid, newTotalInterestPaid,
      newRemainingTenure, nextDueDate || loan.next_emi_date, newLoanStatus,
      loanAccountId
    ]);

    // 3. Record Payment
    run(`
      INSERT INTO payments (
        id, loan_account_id, user_id, schedule_id, amount,
        payment_method, transaction_reference, status, paid_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 'SUCCESS', ?);
    `, [
      payId, loanAccountId, userId, upcomingSchedule.id, paymentAmount,
      paymentMethod || 'UPI', `${paymentMethod || 'UPI'}/FINOVA/${Date.now().toString().slice(-8)}`, now
    ]);

    // 4. Record Transaction
    run(`
      INSERT INTO transactions (
        id, user_id, loan_account_id, type, amount, status, description, created_at
      ) VALUES (?, ?, ?, 'EMI_PAYMENT', ?, 'SUCCESS', ?, ?);
    `, [
      txnId, userId, loanAccountId, paymentAmount,
      `EMI Installment #${upcomingSchedule.installment_number} for Loan ${loanAccountId}`,
      now
    ]);

    // 5. Send Notification
    run(`
      INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
      VALUES (?, ?, ?, ?, 'SUCCESS', ?, 0, ?);
    `, [
      'notif_' + Math.random().toString(36).substr(2, 9),
      userId,
      `EMI Payment Successful: ₹${paymentAmount.toLocaleString('en-IN')}`,
      `Payment of ₹${paymentAmount.toLocaleString('en-IN')} received for Loan ${loanAccountId} (Installment #${upcomingSchedule.installment_number}). Outstanding balance is now ₹${newOutstanding.toLocaleString('en-IN')}.`,
      `/loans/account/${loanAccountId}`,
      now
    ]);

    res.json({
      success: true,
      message: 'EMI Payment of ₹' + paymentAmount.toLocaleString('en-IN') + ' completed successfully!',
      data: {
        paymentId: payId,
        transactionId: txnId,
        amount: paymentAmount,
        installmentNumber: upcomingSchedule.installment_number,
        loanAccountId,
        newOutstandingBalance: newOutstanding,
        nextDueDate,
        paidAt: now
      }
    });
  } catch (err: any) {
    console.error('makePayment error:', err);
    res.status(500).json({ success: false, message: 'Payment processing failed.' });
  }
}

export function getPaymentHistory(req: Request, res: Response): void {
  try {
    const userId = req.user!.id;
    const payments = query(`
      SELECT p.*, la.product_id, lp.name as product_name
      FROM payments p
      JOIN loan_accounts la ON p.loan_account_id = la.id
      JOIN loan_products lp ON la.product_id = lp.id
      WHERE p.user_id = ?
      ORDER BY p.paid_at DESC
    `, [userId]);

    res.json({ success: true, data: payments });
  } catch (err: any) {
    console.error('getPaymentHistory error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve payments' });
  }
}

export function getTransactions(req: Request, res: Response): void {
  try {
    const userId = req.user!.id;
    const { type, status } = req.query;

    let sql = `
      SELECT t.*, u.full_name as user_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE t.user_id = ?
    `;
    const params: any[] = [userId];

    if (type) {
      sql += ' AND t.type = ?';
      params.push(type);
    }

    if (status) {
      sql += ' AND t.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY t.created_at DESC';

    const txns = query(sql, params);
    res.json({ success: true, data: txns });
  } catch (err: any) {
    console.error('getTransactions error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve transactions' });
  }
}

export function getTransactionById(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    const txn = queryOne(`
      SELECT t.*, u.full_name as user_name, u.email as user_email, u.mobile as user_mobile,
             la.product_id, la.interest_rate, lp.name as product_name
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      LEFT JOIN loan_accounts la ON t.loan_account_id = la.id
      LEFT JOIN loan_products lp ON la.product_id = lp.id
      WHERE t.id = ?
    `, [id]);

    if (!txn) {
      res.status(404).json({ success: false, message: 'Transaction not found' });
      return;
    }

    if (role !== 'ADMIN' && txn.user_id !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    res.json({ success: true, data: txn });
  } catch (err: any) {
    console.error('getTransactionById error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve transaction' });
  }
}
