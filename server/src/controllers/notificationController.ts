import { Request, Response } from 'express';
import { query, run } from '../config/db';

export function getMyNotifications(req: Request, res: Response): void {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let notifs;
    if (role === 'ADMIN') {
      notifs = query(`
        SELECT * FROM notifications
        WHERE user_id = ? OR user_id = 'ADMIN'
        ORDER BY created_at DESC
        LIMIT 50
      `, [userId]);
    } else {
      notifs = query(`
        SELECT * FROM notifications
        WHERE user_id = ?
        ORDER BY created_at DESC
        LIMIT 50
      `, [userId]);
    }

    res.json({ success: true, data: notifs });
  } catch (err: any) {
    console.error('getMyNotifications error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve notifications' });
  }
}

export function markAsRead(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const role = req.user!.role;

    if (role === 'ADMIN') {
      run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND (user_id = ? OR user_id = 'ADMIN')`, [id, userId]);
    } else {
      run(`UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?`, [id, userId]);
    }

    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    console.error('markAsRead error:', err);
    res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
}

export function markAllAsRead(req: Request, res: Response): void {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    if (role === 'ADMIN') {
      run(`UPDATE notifications SET is_read = 1 WHERE user_id = ? OR user_id = 'ADMIN'`, [userId]);
    } else {
      run(`UPDATE notifications SET is_read = 1 WHERE user_id = ?`, [userId]);
    }

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    console.error('markAllAsRead error:', err);
    res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
}
