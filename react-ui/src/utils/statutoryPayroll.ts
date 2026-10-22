/**
 * Central Statutory Payroll & Tax Calculation Engine for India
 * Section 115BAC (New Tax Regime - Default for FY 2025-26 & FY 2026-27)
 * Compliant with EPFO statutory PF caps and State PT regulations.
 */

export interface TaxSlab {
  range: string;
  rate: string;
  cap: number;
  taxedAmount: number;
  tax: number;
}

export interface NewRegimeTaxBreakdown {
  stdDed: number;
  taxableIncome: number;
  slabs: TaxSlab[];
  baseTax: number;
  hasRebate: boolean;
  cess: number;
  totalTax: number;
  monthlyTds: number;
}

export interface StatutoryPayrollResult {
  monthlyGross: number;
  annualGross: number;
  basic: number;
  specialAllowance: number;
  pf: number;
  pt: number;
  tds: number;
  annualTax: number;
  taxableIncome: number;
  stdDed: number;
  baseTax: number;
  cess: number;
  hasRebate: boolean;
  totalDeductions: number;
  netPay: number;
}

/**
 * Calculates Section 115BAC Income Tax (New Tax Regime)
 * Standard Deduction: ₹75,000
 * Section 87A Rebate: Zero tax if taxable income <= ₹7,00,000 (i.e. Gross Annual <= ₹7,75,000)
 * 4% Health & Education Cess
 */
export function calculateNewRegimeTds(annualGross: number): NewRegimeTaxBreakdown {
  const stdDed = 75000;
  const taxableIncome = Math.max(0, annualGross - stdDed);

  const slabs: TaxSlab[] = [
    { range: '₹0 to ₹3,00,000', rate: '0%', cap: 300000, taxedAmount: 0, tax: 0 },
    { range: '₹3,00,001 to ₹7,00,000', rate: '5%', cap: 400000, taxedAmount: 0, tax: 0 },
    { range: '₹7,00,001 to ₹10,00,000', rate: '10%', cap: 300000, taxedAmount: 0, tax: 0 },
    { range: '₹10,00,001 to ₹12,00,000', rate: '15%', cap: 200000, taxedAmount: 0, tax: 0 },
    { range: '₹12,00,001 to ₹15,00,000', rate: '20%', cap: 300000, taxedAmount: 0, tax: 0 },
    { range: 'Above ₹15,00,000', rate: '30%', cap: Infinity, taxedAmount: 0, tax: 0 },
  ];

  let remaining = taxableIncome;

  // 0 - 3L
  const s1 = Math.min(remaining, 300000);
  slabs[0].taxedAmount = s1;
  remaining -= s1;

  // 3L - 7L (4L @ 5% = max ₹20,000)
  const s2 = Math.min(remaining, 400000);
  slabs[1].taxedAmount = s2;
  slabs[1].tax = Math.round(s2 * 0.05);
  remaining -= s2;

  // 7L - 10L (3L @ 10% = max ₹30,000)
  const s3 = Math.min(remaining, 300000);
  slabs[2].taxedAmount = s3;
  slabs[2].tax = Math.round(s3 * 0.10);
  remaining -= s3;

  // 10L - 12L (2L @ 15% = max ₹30,000)
  const s4 = Math.min(remaining, 200000);
  slabs[3].taxedAmount = s4;
  slabs[3].tax = Math.round(s4 * 0.15);
  remaining -= s4;

  // 12L - 15L (3L @ 20% = max ₹60,000)
  const s5 = Math.min(remaining, 300000);
  slabs[4].taxedAmount = s5;
  slabs[4].tax = Math.round(s5 * 0.20);
  remaining -= s5;

  // > 15L (30%)
  if (remaining > 0) {
    slabs[5].taxedAmount = remaining;
    slabs[5].tax = Math.round(remaining * 0.30);
  }

  let baseTax = slabs.reduce((sum, s) => sum + s.tax, 0);

  // Section 87A Full Rebate: If taxable income <= ₹7,00,000, base tax is zero
  const hasRebate = taxableIncome <= 700000;
  if (hasRebate) {
    baseTax = 0;
  }

  // 4% Health & Education Cess
  const cess = Math.round(baseTax * 0.04);
  const totalTax = baseTax + cess;
  const monthlyTds = Math.round(totalTax / 12);

  return {
    stdDed,
    taxableIncome,
    slabs,
    baseTax,
    hasRebate,
    cess,
    totalTax,
    monthlyTds,
  };
}

/**
 * Calculates complete Indian Statutory Payroll for a given monthly gross CTC
 * - Basic Salary: 60% of Gross
 * - Special Allowance: 40% of Gross
 * - PF: 12% capped at ₹1,800/month (EPFO statutory ceiling)
 * - PT: ₹200/month (standard Karnataka/Maharashtra state professional tax for gross >= ₹15,000)
 * - TDS: Exact Sec 115BAC monthly tax
 */
export function calculateStatutoryPayroll(
  monthlyGross: number,
  basicRatio: number = 0.60
): StatutoryPayrollResult {
  const gross = Math.max(0, Math.round(monthlyGross));
  const basic = Math.round(gross * basicRatio);
  const specialAllowance = gross - basic;

  // EPFO Statutory Cap: 12% of Basic, capped at ₹1,800
  const pf = gross > 0 ? (gross >= 15000 ? 1800 : Math.min(1800, Math.round(basic * 0.12))) : 0;

  // Professional Tax: ₹200 for gross >= ₹15,000
  const pt = gross >= 15000 ? 200 : 0;

  // TDS under Section 115BAC
  const taxInfo = calculateNewRegimeTds(gross * 12);
  const tds = taxInfo.monthlyTds;

  const totalDeductions = pf + pt + tds;
  const netPay = Math.max(0, gross - totalDeductions);

  return {
    monthlyGross: gross,
    annualGross: gross * 12,
    basic,
    specialAllowance,
    pf,
    pt,
    tds,
    annualTax: taxInfo.totalTax,
    taxableIncome: taxInfo.taxableIncome,
    stdDed: taxInfo.stdDed,
    baseTax: taxInfo.baseTax,
    cess: taxInfo.cess,
    hasRebate: taxInfo.hasRebate,
    totalDeductions,
    netPay,
  };
}
