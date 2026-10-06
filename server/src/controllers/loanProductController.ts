import { Request, Response } from 'express';
import { query, queryOne } from '../config/db';
import { calculateReducingBalanceEmi, calculateSimpleInterest, generateAmortizationSchedule } from '../utils/calculations';

export function getProducts(_req: Request, res: Response): void {
  try {
    const products = query('SELECT * FROM loan_products WHERE is_active = 1 ORDER BY min_amount ASC');
    const formatted = products.map(p => ({
      ...p,
      eligibility_criteria: JSON.parse(p.eligibility_criteria || '[]'),
      required_documents: JSON.parse(p.required_documents || '[]'),
      guarantor_required: Boolean(p.guarantor_required),
      co_applicant_allowed: Boolean(p.co_applicant_allowed),
      is_active: Boolean(p.is_active)
    }));

    res.json({ success: true, data: formatted });
  } catch (err: any) {
    console.error('getProducts error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve loan products' });
  }
}

export function getProductById(req: Request, res: Response): void {
  try {
    const { id } = req.params;
    const p = queryOne('SELECT * FROM loan_products WHERE id = ?', [id]);
    if (!p) {
      res.status(404).json({ success: false, message: 'Loan product not found' });
      return;
    }

    res.json({
      success: true,
      data: {
        ...p,
        eligibility_criteria: JSON.parse(p.eligibility_criteria || '[]'),
        required_documents: JSON.parse(p.required_documents || '[]'),
        guarantor_required: Boolean(p.guarantor_required),
        co_applicant_allowed: Boolean(p.co_applicant_allowed),
        is_active: Boolean(p.is_active)
      }
    });
  } catch (err: any) {
    console.error('getProductById error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve loan product' });
  }
}

export function computeEmi(req: Request, res: Response): void {
  try {
    const { principal, interestRate, tenure, tenureUnit } = req.body;

    const P = Number(principal);
    const rate = Number(interestRate);
    const rawTenure = Number(tenure);

    if (isNaN(P) || P <= 0) {
      res.status(400).json({ success: false, message: 'Please enter a valid loan amount greater than 0.' });
      return;
    }

    if (isNaN(rate) || rate <= 0) {
      res.status(400).json({ success: false, message: 'Please enter a valid annual interest rate.' });
      return;
    }

    if (isNaN(rawTenure) || rawTenure <= 0) {
      res.status(400).json({ success: false, message: 'Please enter a valid tenure.' });
      return;
    }

    const tenureMonths = tenureUnit === 'years' ? Math.round(rawTenure * 12) : Math.round(rawTenure);
    const emiResult = calculateReducingBalanceEmi(P, rate, tenureMonths);
    const schedule = generateAmortizationSchedule(P, rate, tenureMonths);

    res.json({
      success: true,
      data: {
        principal: emiResult.principal,
        annualRate: rate,
        tenureMonths,
        monthlyEmi: emiResult.monthlyEmi,
        totalInterest: emiResult.totalInterest,
        totalRepayment: emiResult.totalRepayment,
        schedulePreview: schedule.slice(0, 12), // First 12 months for quick preview
        fullScheduleCount: schedule.length
      }
    });
  } catch (err: any) {
    console.error('computeEmi error:', err);
    res.status(500).json({ success: false, message: 'Calculation failed' });
  }
}

export function computeSimpleInterest(req: Request, res: Response): void {
  try {
    const { principal, rate, timeYears } = req.body;
    const P = Number(principal);
    const R = Number(rate);
    const T = Number(timeYears);

    if (isNaN(P) || P <= 0 || isNaN(R) || R <= 0 || isNaN(T) || T <= 0) {
      res.status(400).json({ success: false, message: 'Please enter positive numeric values for principal, rate, and time.' });
      return;
    }

    const result = calculateSimpleInterest(P, R, T);
    res.json({ success: true, data: result });
  } catch (err: any) {
    console.error('computeSimpleInterest error:', err);
    res.status(500).json({ success: false, message: 'Calculation failed' });
  }
}
