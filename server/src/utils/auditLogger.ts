import { run } from '../config/db';

export function recordAuditLog(
  adminId: string,
  adminEmail: string,
  action: string,
  targetType: string,
  targetId: string,
  description: string
): void {
  try {
    const logId = 'aud_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    const now = new Date().toISOString();
    run(`
      INSERT INTO audit_logs (
        id, admin_id, admin_email, action, target_type, target_id, description, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?);
    `, [logId, adminId, adminEmail, action, targetType, targetId, description, now]);
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
}
