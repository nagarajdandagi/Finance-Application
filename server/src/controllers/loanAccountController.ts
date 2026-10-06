import { Request, Response } from 'express';
import { query, queryOne } from '../config/db';

export function getMyLoans(req: Request, res: Response): void {
  try {
    const userId = req.user!.id;
    const loans = query(`
      SELECT la.*, lp.name as product_name, lp.category as product_category, lp.icon as product_icon
      FROM loan_accounts la
      JOIN loan_products lp ON la.product_id = lp.id
      WHERE la.user_id = ?
      ORDER BY la.created_at DESC
    `, [userId]);

    res.json({ success: true, data: loans });
  } catch (err: any) {
    console.error('getMyLoans error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve active loans' });
  }
}

export function getLoanById(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    const loan = queryOne(`
      SELECT la.*, lp.name as product_name, lp.category as product_category, lp.icon as product_icon,
             u.full_name as user_name, u.email as user_email
      FROM loan_accounts la
      JOIN loan_products lp ON la.product_id = lp.id
      JOIN users u ON la.user_id = u.id
      WHERE la.id = ?
    `, [id]);

    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan account not found' });
      return;
    }

    if (role !== 'ADMIN' && loan.user_id !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    // Amortization schedule
    const schedule = query(`
      SELECT * FROM repayment_schedules
      WHERE loan_account_id = ?
      ORDER BY installment_number ASC
    `, [id]);

    // Payments
    const payments = query(`
      SELECT * FROM payments
      WHERE loan_account_id = ?
      ORDER BY paid_at DESC
    `, [id]);

    res.json({
      success: true,
      data: {
        ...loan,
        repaymentSchedule: schedule,
        payments
      }
    });
  } catch (err: any) {
    console.error('getLoanById error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve loan account details' });
  }
}

export function getLoanSchedule(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    const loan = queryOne('SELECT user_id FROM loan_accounts WHERE id = ?', [id]);
    if (!loan) {
      res.status(404).json({ success: false, message: 'Loan account not found' });
      return;
    }

    if (role !== 'ADMIN' && loan.user_id !== userId) {
      res.status(403).json({ success: false, message: 'Access denied' });
      return;
    }

    const schedule = query(`
      SELECT * FROM repayment_schedules
      WHERE loan_account_id = ?
      ORDER BY installment_number ASC
    `, [id]);

    res.json({ success: true, data: schedule });
  } catch (err: any) {
    console.error('getLoanSchedule error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve amortization schedule' });
  }
}
