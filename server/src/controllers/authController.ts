import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, run } from '../config/db';
import { JWT_SECRET } from '../middleware/auth';
import { maskAccountNumber, maskPan } from '../utils/calculations';

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const {
      fullName,
      email,
      mobile,
      password,
      confirmPassword,
      dateOfBirth,
      address,
      city,
      state,
      pincode
    } = req.body;

    // Validations
    if (!fullName || !email || !mobile || !password) {
      res.status(400).json({ success: false, message: 'Please provide all required fields.' });
      return;
    }

    if (password !== confirmPassword) {
      res.status(400).json({ success: false, message: 'Passwords do not match.' });
      return;
    }

    if (password.length < 6) {
      res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
      return;
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
      return;
    }

    // Indian mobile format (10 digits)
    const mobileClean = mobile.replace(/[^0-9]/g, '');
    if (mobileClean.length !== 10) {
      res.status(400).json({ success: false, message: 'Please enter a valid 10-digit Indian mobile number.' });
      return;
    }

    // Check existing email or mobile
    const existing = queryOne('SELECT id FROM users WHERE email = ? OR mobile = ?', [email.toLowerCase(), mobileClean]);
    if (existing) {
      res.status(409).json({ success: false, message: 'An account with this email or mobile number already exists.' });
      return;
    }

    const userId = 'usr_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 5);
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    run(`
      INSERT INTO users (
        id, full_name, email, mobile, password_hash, role,
        date_of_birth, address, city, state, pincode, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'CUSTOMER', ?, ?, ?, ?, ?, 'ACTIVE', ?, ?);
    `, [
      userId,
      fullName.trim(),
      email.toLowerCase().trim(),
      mobileClean,
      passwordHash,
      dateOfBirth || null,
      address || null,
      city || null,
      state || null,
      pincode || null,
      now,
      now
    ]);

    // Create welcoming notification
    run(`
      INSERT INTO notifications (id, user_id, title, message, type, link, is_read, created_at)
      VALUES (?, ?, 'Welcome to Finova Finance', 'Your account has been created successfully. Explore our loans and calculate EMI anytime.', 'SUCCESS', '/dashboard', 0, ?);
    `, ['notif_' + Math.random().toString(36).substr(2, 9), userId, now]);

    // Issue token
    const token = jwt.sign(
      { id: userId, email: email.toLowerCase().trim(), role: 'CUSTOMER', fullName: fullName.trim() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully!',
      token,
      user: {
        id: userId,
        fullName: fullName.trim(),
        email: email.toLowerCase().trim(),
        mobile: mobileClean,
        role: 'CUSTOMER'
      }
    });
  } catch (err: any) {
    console.error('Register error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during registration.' });
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { identifier, password } = req.body; // identifier can be email or mobile

    if (!identifier || !password) {
      res.status(400).json({ success: false, message: 'Please enter your email or mobile and password.' });
      return;
    }

    const cleanId = identifier.trim().toLowerCase();
    const cleanMobile = identifier.replace(/[^0-9]/g, '');

    const user = queryOne(`
      SELECT * FROM users WHERE LOWER(email) = ? OR mobile = ?
    `, [cleanId, cleanMobile]);

    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({ success: false, message: 'Your account has been suspended. Please contact Finova support.' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: 'Login successful!',
      token,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        city: user.city,
        state: user.state,
        panMasked: maskPan(user.pan_number),
        accountMasked: maskAccountNumber(user.account_number),
        monthlyIncome: user.monthly_income,
        employmentType: user.employment_type
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ success: false, message: 'Internal server error during login.' });
  }
}

export function getMe(req: Request, res: Response): void {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Not authenticated' });
      return;
    }

    const user = queryOne('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        fullName: user.full_name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        dateOfBirth: user.date_of_birth,
        address: user.address,
        city: user.city,
        state: user.state,
        pincode: user.pincode,
        panNumber: user.pan_number,
        panMasked: maskPan(user.pan_number),
        bankName: user.bank_name,
        accountNumber: user.account_number,
        accountMasked: maskAccountNumber(user.account_number),
        ifscCode: user.ifsc_code,
        monthlyIncome: user.monthly_income,
        employmentType: user.employment_type,
        companyName: user.company_name,
        jobTitle: user.job_title,
        status: user.status,
        createdAt: user.created_at
      }
    });
  } catch (err: any) {
    console.error('getMe error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
}

export function forgotPasswordDemo(req: Request, res: Response): void {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
    return;
  }
  res.json({
    success: true,
    message: 'Demo Password Reset: A password reset link has been dispatched to ' + email + '. (For testing, use demo passwords Password@123 or Admin@123).'
  });
}
