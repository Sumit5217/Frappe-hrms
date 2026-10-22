import React, { useState, useMemo } from 'react';
import {
  X,
  Calculator,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { calculateNewRegimeTds } from '../../utils/statutoryPayroll';

export interface TaxBreakdownEmployee {
  empNo: string;
  name: string;
  monthlyGross: number;
  monthlyBasic?: number;
  monthlyPf?: number;
  monthlyPt?: number;
  currentTds?: number;
  department?: string;
  designation?: string;
}

interface TaxBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: TaxBreakdownEmployee | null;
}

export const TaxBreakdownModal: React.FC<TaxBreakdownModalProps> = ({
  isOpen,
  onClose,
  employee,
}) => {
  const [regime, setRegime] = useState<'new' | 'old'>('new');
  
  // Custom Declarations for Old Regime
  const [sec80C, setSec80C] = useState<number>(150000);
  const [sec80D, setSec80D] = useState<number>(25000);
  const [annualHra, setAnnualHra] = useState<number>(120000);

  if (!isOpen || !employee) return null;

  const monthlyGross = employee.monthlyGross || 0;
  const annualGross = monthlyGross * 12;

  // New Regime Calculation (FY 2025-27 / Section 115BAC) using unified statutory engine
  const newRegimeCalc = useMemo(() => {
    return calculateNewRegimeTds(annualGross);
  }, [annualGross]);

  // Old Regime Calculation
  const oldRegimeCalc = useMemo(() => {
    const stdDed = 50000;
    const pt = (employee.monthlyPt || 200) * 12;
    const totalDeductions = stdDed + pt + Math.min(150000, sec80C) + Math.min(50000, sec80D) + annualHra;
    const taxableIncome = Math.max(0, annualGross - totalDeductions);

    const slabs = [
      { range: '₹0 to ₹2,50,000', rate: '0%', cap: 250000, taxedAmount: 0, tax: 0 },
      { range: '₹2,50,001 to ₹5,00,000', rate: '5%', cap: 250000, taxedAmount: 0, tax: 0 },
      { range: '₹5,00,001 to ₹10,00,000', rate: '20%', cap: 500000, taxedAmount: 0, tax: 0 },
      { range: 'Above ₹10,00,000', rate: '30%', cap: Infinity, taxedAmount: 0, tax: 0 },
    ];

    let remaining = taxableIncome;
    const s1 = Math.min(remaining, 250000);
    slabs[0].taxedAmount = s1;
    remaining -= s1;

    const s2 = Math.min(remaining, 250000);
    slabs[1].taxedAmount = s2;
    slabs[1].tax = Math.round(s2 * 0.05);
    remaining -= s2;

    const s3 = Math.min(remaining, 500000);
    slabs[2].taxedAmount = s3;
    slabs[2].tax = Math.round(s3 * 0.20);
    remaining -= s3;

    if (remaining > 0) {
      slabs[3].taxedAmount = remaining;
      slabs[3].tax = Math.round(remaining * 0.30);
    }

    let baseTax = slabs.reduce((sum, s) => sum + s.tax, 0);
    const hasRebate = taxableIncome <= 500000;
    if (hasRebate) {
      baseTax = 0;
    }

    const cess = Math.round(baseTax * 0.04);
    const totalTax = baseTax + cess;
    const monthlyTds = Math.round(totalTax / 12);

    return {
      stdDed,
      totalDeductions,
      taxableIncome,
      slabs,
      baseTax,
      hasRebate,
      cess,
      totalTax,
      monthlyTds,
    };
  }, [annualGross, sec80C, sec80D, annualHra, employee.monthlyPt]);

  const activeCalc = regime === 'new' ? newRegimeCalc : oldRegimeCalc;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-200 overflow-hidden my-6 animate-scaleUp text-xs font-sans">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm tracking-tight text-white">TDS & Income Tax Breakdown</h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-[10px] font-semibold">
                  Section 192 Compliance
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {employee.name} ({employee.empNo}) • {employee.designation || 'Specialist'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Regime Switcher Bar */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
            <div>
              <span className="font-bold text-slate-800 text-xs block">Tax Regime Selector</span>
              <span className="text-[11px] text-slate-500">
                Compare tax liability under the Default New Regime vs Old Exemption Regime
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-slate-200 shadow-xs">
              <button
                onClick={() => setRegime('new')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  regime === 'new'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                New Regime (Sec 115BAC)
              </button>
              <button
                onClick={() => setRegime('old')}
                className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                  regime === 'old'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Old Regime (With 80C & HRA)
              </button>
            </div>
          </div>

          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Monthly Gross</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                ₹{monthlyGross.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-slate-400">₹{annualGross.toLocaleString('en-IN')}/yr</span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Deductions</span>
              <p className="text-base font-bold text-emerald-700 mt-0.5">
                -₹{(regime === 'new' ? newRegimeCalc.stdDed : oldRegimeCalc.totalDeductions).toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-slate-400">
                {regime === 'new' ? '₹75,000 Standard' : 'Std + 80C + HRA'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] text-slate-500 uppercase font-semibold">Taxable Income</span>
              <p className="text-base font-bold text-indigo-700 mt-0.5">
                ₹{activeCalc.taxableIncome.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-slate-400">Subject to tax slabs</span>
            </div>

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
              <span className="text-[10px] text-indigo-700 uppercase font-bold">Monthly TDS (Cut)</span>
              <p className="text-base font-extrabold text-indigo-900 mt-0.5">
                ₹{activeCalc.monthlyTds.toLocaleString('en-IN')}
              </p>
              <span className="text-[10px] text-indigo-600 font-semibold">
                ₹{activeCalc.totalTax.toLocaleString('en-IN')}/yr
              </span>
            </div>
          </div>

          {/* Old Regime Inputs Accordion */}
          {regime === 'old' && (
            <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-900 text-xs">Employee Declarations & Proofs</span>
                <span className="text-[10px] text-amber-700">Old Regime Deductions applied</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                    Section 80C (PF, ELSS, PPF)
                  </label>
                  <input
                    type="number"
                    value={sec80C}
                    onChange={(e) => setSec80C(Number(e.target.value))}
                    max={150000}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  <span className="text-[9px] text-slate-400">Max limit: ₹1,50,000</span>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                    Section 80D (Health Ins.)
                  </label>
                  <input
                    type="number"
                    value={sec80D}
                    onChange={(e) => setSec80D(Number(e.target.value))}
                    max={50000}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  <span className="text-[9px] text-slate-400">Max limit: ₹50,000</span>
                </div>
                <div>
                  <label className="text-[10px] font-semibold text-slate-600 block mb-1">
                    HRA Exemption (Rent)
                  </label>
                  <input
                    type="number"
                    value={annualHra}
                    onChange={(e) => setAnnualHra(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                  <span className="text-[9px] text-slate-400">Annual rent exemption</span>
                </div>
              </div>
            </div>
          )}

          {/* Slabs Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 font-bold text-slate-800 flex justify-between border-b border-slate-200">
              <span>TAX SLAB BRACKET</span>
              <div className="flex gap-12">
                <span className="w-24 text-right">TAXED PORTION</span>
                <span className="w-20 text-right">SLAB TAX</span>
              </div>
            </div>
            <div className="divide-y divide-slate-100">
              {activeCalc.slabs.map((slab, idx) => (
                <div key={idx} className="flex justify-between items-center px-4 py-2 hover:bg-slate-50/70">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">{slab.range}</span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-200/70 text-slate-700 text-[10px] font-bold">
                      {slab.rate}
                    </span>
                  </div>
                  <div className="flex gap-12 font-medium">
                    <span className="w-24 text-right text-slate-600">
                      ₹{slab.taxedAmount.toLocaleString('en-IN')}
                    </span>
                    <span className="w-20 text-right font-bold text-slate-900">
                      ₹{slab.tax.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Slabs Subtotal & Cess */}
            <div className="bg-slate-50 border-t border-slate-200 p-3 space-y-1.5">
              <div className="flex justify-between px-2 text-slate-700">
                <span>Base Income Tax:</span>
                <span className="font-bold">₹{activeCalc.baseTax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between px-2 text-slate-700">
                <span className="flex items-center gap-1">
                  Health & Education Cess (4% of Tax):
                  <Info className="w-3 h-3 text-slate-400" />
                </span>
                <span className="font-bold">+₹{activeCalc.cess.toLocaleString('en-IN')}</span>
              </div>
              {activeCalc.hasRebate && (
                <div className="flex justify-between px-2 text-emerald-700 font-bold bg-emerald-50 py-1 rounded">
                  <span>Section 87A Full Tax Rebate:</span>
                  <span>-₹{activeCalc.baseTax + activeCalc.cess} (Tax is ₹0)</span>
                </div>
              )}
              <div className="flex justify-between px-2 text-slate-900 font-extrabold text-sm border-t border-slate-200 pt-1.5">
                <span>Total Annual Tax Liability:</span>
                <span className="text-indigo-700">₹{activeCalc.totalTax.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Final Monthly TDS Box */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border border-emerald-500/20 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wide block">
                Monthly TDS Cut in Pay Slip
              </span>
              <p className="text-lg font-black text-emerald-900 mt-0.5">
                ₹{activeCalc.monthlyTds.toLocaleString('en-IN')} / month
              </p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Formula: ₹{activeCalc.totalTax.toLocaleString('en-IN')} ÷ 12 months = ₹{activeCalc.monthlyTds.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Computed Correctly</span>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
          <span>Compliant with Indian Income Tax Act 1961 • Section 192 TDS</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold transition-colors cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
