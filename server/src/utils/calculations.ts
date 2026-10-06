/**
 * Financial Calculation Utilities
 * Implements standard Reducing-Balance EMI formula with decimal rounding:
 * EMI = [P * r * (1+r)^n] / [(1+r)^n - 1]
 * where:
 * P = Principal loan amount
 * r = Monthly interest rate (annualRate / 12 / 100)
 * n = Number of monthly payments (tenure in months)
 */

export interface EmiCalculationResult {
  principal: number;
  monthlyEmi: number;
  totalInterest: number;
  totalRepayment: number;
  effectiveRate: number;
  tenureMonths: number;
}

export interface AmortizationScheduleRow {
  installmentNumber: number;
  dueDate: string;
  openingBalance: number;
  principalComponent: number;
  interestComponent: number;
  emiAmount: number;
  closingBalance: number;
  status: 'PAID' | 'UPCOMING' | 'OVERDUE';
  paidDate?: string;
}

export function calculateReducingBalanceEmi(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): EmiCalculationResult {
  const P = Math.round(principal);
  const n = Math.round(tenureMonths);
  const r = annualInterestRate / 12 / 100;

  if (n <= 0 || P <= 0) {
    return {
      principal: P,
      monthlyEmi: 0,
      totalInterest: 0,
      totalRepayment: P,
      effectiveRate: annualInterestRate,
      tenureMonths: n
    };
  }

  // If interest rate is 0 (interest-free promo)
  if (r === 0) {
    const emi = Math.round(P / n);
    return {
      principal: P,
      monthlyEmi: emi,
      totalInterest: 0,
      totalRepayment: P,
      effectiveRate: 0,
      tenureMonths: n
    };
  }

  const factor = Math.pow(1 + r, n);
  const emiExact = (P * r * factor) / (factor - 1);
  const monthlyEmi = Math.round(emiExact);
  const totalRepayment = monthlyEmi * n;
  const totalInterest = Math.max(0, totalRepayment - P);

  return {
    principal: P,
    monthlyEmi,
    totalInterest,
    totalRepayment,
    effectiveRate: annualInterestRate,
    tenureMonths: n
  };
}

export function calculateSimpleInterest(
  principal: number,
  annualRate: number,
  timeInYears: number
): { principal: number; interest: number; totalAmount: number } {
  const P = Math.round(principal);
  const interest = Math.round((P * annualRate * timeInYears) / 100);
  return {
    principal: P,
    interest,
    totalAmount: P + interest
  };
}

export function generateAmortizationSchedule(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number,
  startDate: Date = new Date()
): AmortizationScheduleRow[] {
  const result = calculateReducingBalanceEmi(principal, annualInterestRate, tenureMonths);
  const emi = result.monthlyEmi;
  const monthlyRate = annualInterestRate / 12 / 100;

  let balance = principal;
  const schedule: AmortizationScheduleRow[] = [];

  for (let i = 1; i <= tenureMonths; i++) {
    const dueDate = new Date(startDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const interestComponent = Math.round(balance * monthlyRate);
    let principalComponent = emi - interestComponent;

    // Adjust last month rounding
    if (i === tenureMonths || balance - principalComponent < 0) {
      principalComponent = balance;
    }

    const closingBalance = Math.max(0, Math.round(balance - principalComponent));

    schedule.push({
      installmentNumber: i,
      dueDate: dueDate.toISOString().split('T')[0],
      openingBalance: Math.round(balance),
      principalComponent: Math.round(principalComponent),
      interestComponent: Math.round(interestComponent),
      emiAmount: emi,
      closingBalance,
      status: 'UPCOMING'
    });

    balance = closingBalance;
    if (balance <= 0) break;
  }

  return schedule;
}

export function calculateDti(monthlyDebt: number, monthlyIncome: number): number {
  if (!monthlyIncome || monthlyIncome <= 0) return 100;
  return Math.min(100, Math.round((monthlyDebt / monthlyIncome) * 100));
}

export function maskAccountNumber(acc: string): string {
  if (!acc || acc.length < 4) return 'XXXX';
  const last4 = acc.slice(-4);
  return `XXXX-XXXX-${last4}`;
}

export function maskPan(pan: string): string {
  if (!pan || pan.length < 5) return 'XXXXX0000X';
  return `${pan.slice(0, 2)}XXX${pan.slice(-2)}`;
}
