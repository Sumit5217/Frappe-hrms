import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Percent,
  CheckCircle2,
  DollarSign,
  Scale,
} from 'lucide-react';

export const TaxRegimeSimulator: React.FC = () => {
  // Inputs
  const [annualCtc, setAnnualCtc] = useState<number>(1200000);
  const [section80C, setSection80C] = useState<number>(150000); // 80C investments (PPF, ELSS, EPF)
  const [section80D, setSection80D] = useState<number>(25000); // Mediclaim
  const [annualHra, setAnnualHra] = useState<number>(120000); // HRA exemption
  const [npsContribution, setNpsContribution] = useState<number>(50000); // 80CCD(1B)

  // Monthly values
  const monthlyGross = Math.round(annualCtc / 12);
  const monthlyBasic = Math.round(monthlyGross * 0.5);

  // STRICT STATUTORY RULES: ONLY PF, PT, AND TDS
  // 1. Employee PF: 12% of basic (standard statutory monthly cap of ₹1,800 or 12% of actual basic)
  const monthlyPf = Math.min(1800, Math.round(monthlyBasic * 0.12));
  const annualPf = monthlyPf * 12;

  // 2. Professional Tax (PT): Standard ₹200/month (₹2,400/yr), with ₹300 in Feb if 2,500
  const monthlyPt = annualCtc > 180000 ? 200 : 0;
  const annualPt = monthlyPt * 12;

  // 3. Tax Deducted at Source (TDS) under NEW REGIME (Section 115BAC - FY 2025-27)
  const newRegimeTax = useMemo(() => {
    // New regime standard deduction: ₹75,000
    const standardDeduction = 75000;
    const taxableIncome = Math.max(0, annualCtc - standardDeduction);

    let tax = 0;
    // Slabs:
    // 0 to 3,00,000: Nil
    // 3,00,001 to 7,00,000: 5%
    // 7,00,001 to 10,00,000: 10%
    // 10,00,001 to 12,00,000: 15%
    // 12,00,001 to 15,00,000: 20%
    // Above 15,00,000: 30%
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.30;
      tax += 300000 * 0.20; // 12L-15L
      tax += 200000 * 0.15; // 10L-12L
      tax += 300000 * 0.10; // 7L-10L
      tax += 400000 * 0.05; // 3L-7L
    } else if (taxableIncome > 1200000) {
      tax += (taxableIncome - 1200000) * 0.20;
      tax += 200000 * 0.15;
      tax += 300000 * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.15;
      tax += 300000 * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 700000) {
      tax += (taxableIncome - 700000) * 0.10;
      tax += 400000 * 0.05;
    } else if (taxableIncome > 300000) {
      tax += (taxableIncome - 300000) * 0.05;
    }

    // Section 87A rebate: zero tax if taxable income <= 7,00,000
    if (taxableIncome <= 700000) {
      tax = 0;
    }

    // 4% Health & Education Cess
    const cess = Math.round(tax * 0.04);
    const totalTax = Math.round(tax + cess);
    const monthlyTds = Math.round(totalTax / 12);

    return {
      taxableIncome,
      standardDeduction,
      baseTax: Math.round(tax),
      cess,
      totalTax,
      monthlyTds,
    };
  }, [annualCtc]);

  // 4. Tax Deducted at Source (TDS) under OLD REGIME
  const oldRegimeTax = useMemo(() => {
    // Old regime standard deduction: ₹50,000
    const standardDeduction = 50000;
    // Section 80C capped at 1.5 Lakhs (inclusive of EPF)
    const total80C = Math.min(150000, Math.max(section80C, annualPf));
    const total80D = Math.min(50000, section80D);
    const totalNps = Math.min(50000, npsContribution);
    const totalHra = Math.min(annualHra, Math.round(annualCtc * 0.25));

    const totalDeductions = standardDeduction + annualPt + total80C + total80D + totalNps + totalHra;
    const taxableIncome = Math.max(0, annualCtc - totalDeductions);

    let tax = 0;
    // Slabs:
    // 0 to 2,50,000: Nil
    // 2,50,001 to 5,00,000: 5%
    // 5,00,001 to 10,00,000: 20%
    // Above 10,00,000: 30%
    if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.30;
      tax += 500000 * 0.20; // 5L to 10L
      tax += 250000 * 0.05; // 2.5L to 5L
    } else if (taxableIncome > 500000) {
      tax += (taxableIncome - 500000) * 0.20;
      tax += 250000 * 0.05;
    } else if (taxableIncome > 250000) {
      tax += (taxableIncome - 250000) * 0.05;
    }

    // Section 87A rebate: zero tax if taxable income <= 5,00,000
    if (taxableIncome <= 500000) {
      tax = 0;
    }

    // 4% Health & Education Cess
    const cess = Math.round(tax * 0.04);
    const totalTax = Math.round(tax + cess);
    const monthlyTds = Math.round(totalTax / 12);

    return {
      taxableIncome,
      standardDeduction,
      totalDeductions,
      baseTax: Math.round(tax),
      cess,
      totalTax,
      monthlyTds,
    };
  }, [annualCtc, section80C, section80D, annualHra, npsContribution, annualPf, annualPt]);

  // Comparison Verdict
  const taxSavings = Math.abs(oldRegimeTax.totalTax - newRegimeTax.totalTax);
  const isNewBetter = newRegimeTax.totalTax <= oldRegimeTax.totalTax;

  // Monthly Net Take-Home (Gross - PF - PT - TDS)
  const newTakeHome = monthlyGross - monthlyPf - monthlyPt - newRegimeTax.monthlyTds;
  const oldTakeHome = monthlyGross - monthlyPf - monthlyPt - oldRegimeTax.monthlyTds;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30 mb-2">
              <Scale className="w-3.5 h-3.5" />
              <span>Strict Statutory Compliance (PF • PT • TDS)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-white">
              Income Tax & TDS Regime Simulator
            </h1>
            <p className="text-xs text-slate-300 max-w-2xl mt-1 leading-relaxed">
              Compare your exact tax liabilities under Section 115BAC (New Regime) versus Old Regime. 
              Deductions strictly include <strong>Provident Fund (PF)</strong>, <strong>Professional Tax (PT)</strong>, 
              and <strong>Tax Deducted at Source (TDS)</strong> with nothing extra.
            </p>
          </div>

          {/* Quick Recommendation Badge */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex items-center gap-3.5 flex-shrink-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
              isNewBetter ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'
            }`}>
              ₹
            </div>
            <div>
              <span className="text-[11px] text-slate-300 block font-medium">Recommended Tax Choice</span>
              <span className="text-sm font-bold text-white flex items-center gap-1">
                {isNewBetter ? 'New Regime (Default)' : 'Old Regime'}
                <span className="text-xs text-emerald-300 font-normal">
                  (Save ₹{taxSavings.toLocaleString('en-IN')}/yr)
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form: Salary & Declaration Inputs (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h2 className="font-serif font-bold text-base text-content-main flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-primary" />
                Annual Earnings (CTC)
              </h2>
              <span className="text-xs text-content-muted font-mono">₹{annualCtc.toLocaleString('en-IN')}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-content-main mb-1.5">
                Annual Cost to Company (CTC)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs text-content-muted font-bold">₹</span>
                <input
                  type="number"
                  step="50000"
                  value={annualCtc}
                  onChange={(e) => setAnnualCtc(Math.max(0, Number(e.target.value)))}
                  className="nv-input w-full pl-7 text-xs font-semibold"
                />
              </div>
              <input
                type="range"
                min="300000"
                max="5000000"
                step="50000"
                value={annualCtc}
                onChange={(e) => setAnnualCtc(Number(e.target.value))}
                className="w-full mt-2 accent-primary cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-content-muted mt-1 font-mono">
                <span>₹3L (Entry)</span>
                <span>₹15L (Mid)</span>
                <span>₹50L (Senior)</span>
              </div>
            </div>

            {/* Monthly Breakup Preview */}
            <div className="p-3 rounded-xl bg-surface-low border border-border/60 grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-[11px] text-content-muted block">Monthly Gross:</span>
                <span className="font-bold text-content-main">₹{monthlyGross.toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="text-[11px] text-content-muted block">Monthly Basic (50%):</span>
                <span className="font-bold text-content-main">₹{monthlyBasic.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Strict Mandatory Statutory Deductions Box */}
          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-4">
            <h2 className="font-serif font-bold text-base text-content-main flex items-center gap-2 border-b border-border/70 pb-3">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Statutory Deductions (Strictly PF & PT)
            </h2>

            {/* PF */}
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-emerald-950">Provident Fund (PF)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">12% / Capped</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 mt-0.5">Statutory 12% deduction</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-emerald-950">₹{monthlyPf.toLocaleString('en-IN')}/mo</span>
                <span className="text-[10px] text-emerald-700 block">₹{annualPf.toLocaleString('en-IN')}/yr</span>
              </div>
            </div>

            {/* PT */}
            <div className="p-3 rounded-xl bg-blue-50/50 border border-blue-200/60 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-blue-950">Professional Tax (PT)</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">State Slab</span>
                </div>
                <p className="text-[11px] text-blue-800/80 mt-0.5">₹200 monthly state slab</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-blue-950">₹{monthlyPt.toLocaleString('en-IN')}/mo</span>
                <span className="text-[10px] text-blue-700 block">₹{annualPt.toLocaleString('en-IN')}/yr</span>
              </div>
            </div>
          </div>

          {/* Chapter VI-A Investment Declarations (For Old Regime calculation only) */}
          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs space-y-3.5">
            <div className="flex items-center justify-between border-b border-border/70 pb-3">
              <h2 className="font-serif font-bold text-base text-content-main flex items-center gap-2">
                <Percent className="w-4 h-4 text-amber-600" />
                Old Regime Deductions
              </h2>
              <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                Old Regime Only
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-content-main">Section 80C (PPF, ELSS, Insurance)</span>
                <span className="text-content-muted font-mono">Max ₹1,50,000</span>
              </div>
              <input
                type="number"
                max="150000"
                value={section80C}
                onChange={(e) => setSection80C(Number(e.target.value))}
                className="nv-input w-full text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-content-main">Section 80D (Health Insurance / Mediclaim)</span>
                <span className="text-content-muted font-mono">Max ₹50,000</span>
              </div>
              <input
                type="number"
                max="50000"
                value={section80D}
                onChange={(e) => setSection80D(Number(e.target.value))}
                className="nv-input w-full text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-content-main">House Rent Allowance (HRA) Exemption</span>
                <span className="text-content-muted font-mono">Rent Receipts</span>
              </div>
              <input
                type="number"
                value={annualHra}
                onChange={(e) => setAnnualHra(Number(e.target.value))}
                className="nv-input w-full text-xs"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1 font-medium">
                <span className="text-content-main">Section 80CCD(1B) (NPS Extra Exemption)</span>
                <span className="text-content-muted font-mono">Max ₹50,000</span>
              </div>
              <input
                type="number"
                max="50000"
                value={npsContribution}
                onChange={(e) => setNpsContribution(Number(e.target.value))}
                className="nv-input w-full text-xs"
              />
            </div>
          </div>
        </div>

        {/* Right Output: Side-by-Side Regime Comparison (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Side-by-Side Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 1. New Tax Regime Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              isNewBetter
                ? 'bg-emerald-50/40 border-emerald-400 shadow-md ring-2 ring-emerald-500/20'
                : 'bg-white border-border shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
                  New Regime (115BAC)
                </span>
                {isNewBetter && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Recommended
                  </span>
                )}
              </div>

              <div className="mb-4">
                <span className="text-xs text-content-muted block">Annual Tax Liability</span>
                <span className="text-2xl font-bold font-serif text-content-main">
                  ₹{newRegimeTax.totalTax.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-content-muted block mt-0.5">
                  Monthly TDS: <strong>₹{newRegimeTax.monthlyTds.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/60 text-xs">
                <div className="flex justify-between">
                  <span className="text-content-muted">Standard Deduction:</span>
                  <span className="font-medium text-content-main">₹75,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Taxable Income:</span>
                  <span className="font-semibold text-content-main font-mono">
                    ₹{newRegimeTax.taxableIncome.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Base Tax:</span>
                  <span className="text-content-main">₹{newRegimeTax.baseTax.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">4% Cess:</span>
                  <span className="text-content-main">₹{newRegimeTax.cess.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Take-Home Net */}
              <div className="mt-4 p-3 rounded-xl bg-emerald-100/60 border border-emerald-200">
                <span className="text-[11px] text-emerald-900 block font-medium">Estimated Monthly Take-Home</span>
                <span className="text-lg font-bold text-emerald-950 font-serif">
                  ₹{newTakeHome.toLocaleString('en-IN')} / mo
                </span>
                <span className="text-[10px] text-emerald-800 block mt-0.5">
                  Gross - (PF ₹{monthlyPf} + PT ₹{monthlyPt} + TDS ₹{newRegimeTax.monthlyTds})
                </span>
              </div>
            </div>

            {/* 2. Old Tax Regime Card */}
            <div className={`p-5 rounded-2xl border transition-all ${
              !isNewBetter
                ? 'bg-blue-50/40 border-blue-400 shadow-md ring-2 ring-blue-500/20'
                : 'bg-white border-border shadow-xs'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-blue-700 bg-blue-100/80 px-2.5 py-0.5 rounded-full">
                  Old Tax Regime
                </span>
                {!isNewBetter && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Recommended
                  </span>
                )}
              </div>

              <div className="mb-4">
                <span className="text-xs text-content-muted block">Annual Tax Liability</span>
                <span className="text-2xl font-bold font-serif text-content-main">
                  ₹{oldRegimeTax.totalTax.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-content-muted block mt-0.5">
                  Monthly TDS: <strong>₹{oldRegimeTax.monthlyTds.toLocaleString('en-IN')}</strong>
                </span>
              </div>

              <div className="space-y-2 pt-3 border-t border-border/60 text-xs">
                <div className="flex justify-between">
                  <span className="text-content-muted">Standard Deduction:</span>
                  <span className="font-medium text-content-main">₹50,000</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Total Exemptions:</span>
                  <span className="font-medium text-content-main">₹{oldRegimeTax.totalDeductions.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Taxable Income:</span>
                  <span className="font-semibold text-content-main font-mono">
                    ₹{oldRegimeTax.taxableIncome.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-content-muted">Base Tax:</span>
                  <span className="text-content-main">₹{oldRegimeTax.baseTax.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Take-Home Net */}
              <div className="mt-4 p-3 rounded-xl bg-blue-100/60 border border-blue-200">
                <span className="text-[11px] text-blue-900 block font-medium">Estimated Monthly Take-Home</span>
                <span className="text-lg font-bold text-blue-950 font-serif">
                  ₹{oldTakeHome.toLocaleString('en-IN')} / mo
                </span>
                <span className="text-[10px] text-blue-800 block mt-0.5">
                  Gross - (PF ₹{monthlyPf} + PT ₹{monthlyPt} + TDS ₹{oldRegimeTax.monthlyTds})
                </span>
              </div>
            </div>
          </div>

          {/* Detailed Net Pay Breakdown Table */}
          <div className="bg-white p-5 rounded-2xl border border-border shadow-xs">
            <h3 className="font-serif font-bold text-base text-content-main mb-3 flex items-center justify-between">
              <span>Salary Component-Level Comparison</span>
              <span className="text-xs text-content-muted font-normal">Monthly Figures</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="border-b border-border text-content-muted text-[11px] font-semibold uppercase bg-surface-low">
                    <th className="py-2.5 px-3">Salary Component</th>
                    <th className="py-2.5 px-3">New Regime (₹)</th>
                    <th className="py-2.5 px-3">Old Regime (₹)</th>
                    <th className="py-2.5 px-3">Difference</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-content-main">Basic Pay (Earnings)</td>
                    <td className="py-2.5 px-3 text-content-main font-mono">₹{monthlyBasic.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-content-main font-mono">₹{monthlyBasic.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-content-muted">—</td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-medium text-content-main">Allowances (HRA + Special)</td>
                    <td className="py-2.5 px-3 text-content-main font-mono">₹{(monthlyGross - monthlyBasic).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-content-main font-mono">₹{(monthlyGross - monthlyBasic).toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-content-muted">—</td>
                  </tr>
                  <tr className="bg-emerald-50/30">
                    <td className="py-2.5 px-3 font-semibold text-emerald-900">Deduction: Provident Fund (PF)</td>
                    <td className="py-2.5 px-3 text-emerald-950 font-mono font-semibold">-₹{monthlyPf.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-emerald-950 font-mono font-semibold">-₹{monthlyPf.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-content-muted">0</td>
                  </tr>
                  <tr className="bg-blue-50/30">
                    <td className="py-2.5 px-3 font-semibold text-blue-900">Deduction: Professional Tax (PT)</td>
                    <td className="py-2.5 px-3 text-blue-950 font-mono font-semibold">-₹{monthlyPt.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-blue-950 font-mono font-semibold">-₹{monthlyPt.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-content-muted">0</td>
                  </tr>
                  <tr className="bg-amber-50/30">
                    <td className="py-2.5 px-3 font-semibold text-amber-900">Deduction: Tax Deducted at Source (TDS)</td>
                    <td className="py-2.5 px-3 text-amber-950 font-mono font-bold">-₹{newRegimeTax.monthlyTds.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 text-amber-950 font-mono font-bold">-₹{oldRegimeTax.monthlyTds.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-3 font-mono font-semibold text-emerald-600">
                      {isNewBetter ? `+₹${Math.round(taxSavings / 12).toLocaleString('en-IN')}/mo in hand` : `-₹${Math.round(taxSavings / 12).toLocaleString('en-IN')}/mo`}
                    </td>
                  </tr>
                  <tr className="bg-surface-low/80 font-bold text-sm">
                    <td className="py-3 px-3 text-content-main">Net Monthly Take-Home Pay</td>
                    <td className="py-3 px-3 text-emerald-700 font-mono">₹{newTakeHome.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 text-blue-700 font-mono">₹{oldTakeHome.toLocaleString('en-IN')}</td>
                    <td className="py-3 px-3 font-mono text-emerald-700">
                      {isNewBetter ? `+₹${Math.round(taxSavings / 12).toLocaleString('en-IN')}` : `+₹${Math.round(taxSavings / 12).toLocaleString('en-IN')}`}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
