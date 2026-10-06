import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne, run } from '../config/db';

export function updateProfile(req: Request, res: Response): void {
  try {
    const userId = req.user!.id;
    const {
      address,
      city,
      state,
      pincode,
      bankName,
      accountNumber,
      ifscCode,
      monthlyIncome,
      employmentType,
      companyName,
      jobTitle,
      panNumber
    } = req.body;

    const now = new Date().toISOString();

    run(`
      UPDATE users
      SET address = COALESCE(?, address),
          city = COALESCE(?, city),
          state = COALESCE(?, state),
          pincode = COALESCE(?, pincode),
          bank_name = COALESCE(?, bank_name),
          account_number = COALESCE(?, account_number),
          ifsc_code = COALESCE(?, ifsc_code),
          monthly_income = COALESCE(?, monthly_income),
          employment_type = COALESCE(?, employment_type),
          company_name = COALESCE(?, company_name),
          job_title = COALESCE(?, job_title),
          pan_number = COALESCE(?, pan_number),
          updated_at = ?
      WHERE id = ?;
    `, [
      address, city, state, pincode, bankName, accountNumber, ifscCode,
      monthlyIncome !== undefined ? Number(monthlyIncome) : null,
      employmentType, companyName, jobTitle, panNumber, now, userId
    ]);

    res.json({ success: true, message: 'Profile updated successfully!' });
  } catch (err: any) {
    console.error('updateProfile error:', err);
    res.status(500).json({ success: false, message: 'Failed to update profile' });
  }
}

export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const userId = req.user!.id;
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    if (!currentPassword || !newPassword) {
      res.status(400).json({ success: false, message: 'Please provide current and new password.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      res.status(400).json({ success: false, message: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
      return;
    }

    const user = queryOne('SELECT password_hash FROM users WHERE id = ?', [userId]);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      res.status(400).json({ success: false, message: 'Incorrect current password.' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    const now = new Date().toISOString();

    run('UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?', [newHash, now, userId]);

    res.json({ success: true, message: 'Password changed successfully!' });
  } catch (err: any) {
    console.error('changePassword error:', err);
    res.status(500).json({ success: false, message: 'Failed to change password' });
  }
}
