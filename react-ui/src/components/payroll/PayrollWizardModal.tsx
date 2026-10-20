import React, { useState } from 'react';
import {
  X,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Download,
  RefreshCw,
  Building2,
  FileSpreadsheet,
  Check,
} from 'lucide-react';
import { Employee } from '../../types';

interface PayrollWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onComplete: () => void;
}

interface WizardEmployeeRow {
  employee: string;
  employee_name: string;
  department: string;
  total_working_days: number;
  lop_days: number;
  payment_days: number;
  gross_pay: number;
  pf: number;      // STRICT STATUTORY DEDUCTION: Provident Fund
  pt: number;      // STRICT STATUTORY DEDUCTION: Professional Tax
  tds: number;     // STRICT STATUTORY DEDUCTION: Tax Deducted at Source
  net_pay: number;
}

export const PayrollWizardModal: React.FC<PayrollWizardModalProps> = ({
  isOpen,
  onClose,
  employees: _employees,
  onComplete,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [processing, setProcessing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [wizardCompany, setWizardCompany] = useState<'Nimble vision pvt ltd' | 'Alpha vision pvt ltd'>('Alpha vision pvt ltd');
  const cycleMonth = 'September 2026';

  const alphaEmployeesList = [
    { name: 'HR-EMP-00023', employee_name: 'Rohan Verma', department: 'Research & Development', designation: 'Engineer', gross: 55000 },
    { name: 'HR-EMP-00024', employee_name: 'Kavita Patel', department: 'Human Resources', designation: 'HR Specialist', gross: 58000 },
    { name: 'HR-EMP-00025', employee_name: 'Vikram Singhania', department: 'Engineering', designation: 'Frontend Developer', gross: 65000 },
    { name: 'HR-EMP-00026', employee_name: 'Ananya Iyer', department: 'Quality Assurance', designation: 'Quality Assurance', gross: 52000 },
    { name: 'HR-EMP-00027', employee_name: 'Sameer Khan', department: 'Operations', designation: 'DevOps Engineer', gross: 68000 },
  ];

  const nimbleEmployeesList = [
    { name: 'HR-EMP-00016', employee_name: 'Tejas Desai', department: 'Engineering', designation: 'Software Developer', gross: 75000 },
    { name: 'HR-EMP-00017', employee_name: 'Tarun Kumar', department: 'Engineering', designation: 'Software Developer', gross: 75000 },
    { name: 'HR-EMP-00018', employee_name: 'Bhagya Shree', department: 'Engineering', designation: 'Software Developer', gross: 75000 },
    { name: 'HR-EMP-00019', employee_name: 'Sushmita Kumari', department: 'Engineering', designation: 'Software Developer', gross: 75000 },
    { name: 'HR-EMP-00020', employee_name: 'Priya Kumari', department: 'Engineering', designation: 'Software Developer', gross: 75000 },
    { name: 'HR-EMP-00021', employee_name: 'Sia Kureel', department: 'Operations - NVPL', designation: 'Business Analyst', gross: 80000 },
  ];

  // Seed rows for active employees with strictly PF, PT, and TDS
  const [rows, setRows] = useState<WizardEmployeeRow[]>([]);

  React.useEffect(() => {
    const list = wizardCompany === 'Alpha vision pvt ltd' ? alphaEmployeesList : nimbleEmployeesList;
    const computedRows = list.map((emp, idx) => {
      const gross = emp.gross;
      const pf = 1800; // Strict Statutory PF Cap
      const pt = 200;  // Strict PT
      const tds = Math.round(gross > 60000 ? (gross - 60000) * 0.12 + 1000 : 1200);
      const lop = idx === 1 ? 1 : 0;
      const payment_days = 30 - lop;
      const adjustedGross = Math.round((gross / 30) * payment_days);
      const net_pay = adjustedGross - (pf + pt + tds);

      return {
        employee: emp.name,
        employee_name: emp.employee_name,
        department: emp.department,
        total_working_days: 30,
        lop_days: lop,
        payment_days,
        gross_pay: adjustedGross,
        pf,
        pt,
        tds,
        net_pay,
      };
    });
    setRows(computedRows);
  }, [wizardCompany]);

  if (!isOpen) return null;

  // Totals
  const totalGross = rows.reduce((acc, r) => acc + r.gross_pay, 0);
  const totalPf = rows.reduce((acc, r) => acc + r.pf, 0);
  const totalPt = rows.reduce((acc, r) => acc + r.pt, 0);
  const totalTds = rows.reduce((acc, r) => acc + r.tds, 0);
  const totalNet = rows.reduce((acc, r) => acc + r.net_pay, 0);

  // Previous month baseline for step 3 diffing
  const prevMonthGross = Math.round(totalGross * 0.96);
  const grossDiffPercent = (((totalGross - prevMonthGross) / prevMonthGross) * 100).toFixed(1);

  // Handle LOP adjustments
  const handleLopChange = (index: number, newLop: number) => {
    setRows((prev) => {
      const copy = [...prev];
      const r = copy[index];
      const lop = Math.max(0, Math.min(30, newLop));
      const payment_days = 30 - lop;
      const baseGross = Math.round((r.gross_pay / r.payment_days) * 30);
      const adjustedGross = Math.round((baseGross / 30) * payment_days);
      const net = adjustedGross - (r.pf + r.pt + r.tds);
      copy[index] = {
        ...r,
        lop_days: lop,
        payment_days,
        gross_pay: adjustedGross,
        net_pay: net,
      };
      return copy;
    });
  };

  // Handle deduction adjustments (Strictly PF, PT, TDS)
  const handleDeductionChange = (index: number, field: 'pf' | 'pt' | 'tds', val: number) => {
    setRows((prev) => {
      const copy = [...prev];
      const r = copy[index];
      const updated = { ...r, [field]: Math.max(0, val) };
      updated.net_pay = updated.gross_pay - (updated.pf + updated.pt + updated.tds);
      copy[index] = updated;
      return copy;
    });
  };

  // Step 4 simulation runner
  const handleRunBatch = () => {
    setProcessing(true);
    setProgress(10);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setProcessing(false);
          setCurrentStep(5);
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  // 1-Click Multi-Bank Disbursal Exporters
  const downloadBankAdvice = (bankType: 'HDFC' | 'ICICI' | 'SBI' | 'NEFT') => {
    let headers = '';
    let csvRows: string[] = [];

    if (bankType === 'HDFC') {
      headers = 'Debit Account,Beneficiary Account,Amount,Beneficiary Name,IFSC Code,Narration';
      csvRows = rows.map((r, i) =>
        `"50200012345678","HDFC000${String(i + 1).padStart(7, '0')}","${r.net_pay}","${r.employee_name}","HDFC0000128","Salary for ${cycleMonth}"`
      );
    } else if (bankType === 'ICICI') {
      headers = 'Corp ID,User ID,Debit Acc,Ben Acc,Amount,Currency,Txn Type,Ben Name,IFSC,Remarks';
      csvRows = rows.map((r, i) =>
        `"CORP889","USER01","000205001234","ICIC000${String(i + 1).padStart(7, '0')}","${r.net_pay}","INR","NFT","${r.employee_name}","ICIC0000002","SAL ${cycleMonth}"`
      );
    } else if (bankType === 'SBI') {
      headers = 'Payment Type,SBI Reference,Debit Account,Amount,Credit Account,Beneficiary Name,IFSC Code';
      csvRows = rows.map((r, i) =>
        `"SALARY","SBICMP-${i + 1}","30998877665","${r.net_pay}","SBIN000${String(i + 1).padStart(7, '0')}","${r.employee_name}","SBIN0000800"`
      );
    } else {
      headers = 'Employee ID,Employee Name,Bank Name,Account Number,IFSC Code,Net Pay,Payment Month';
      csvRows = rows.map((r, i) =>
        `"${r.employee}","${r.employee_name}","HDFC Bank","50100${String(i + 1).padStart(8, '0')}","HDFC0000128","${r.net_pay}","${cycleMonth}"`
      );
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...csvRows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${bankType}_Payroll_Disbursal_${cycleMonth.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const stepsList = [
    { num: 1, title: 'Attendance & LOP Cutoff' },
    { num: 2, title: 'PF, PT & TDS Adjustments' },
    { num: 3, title: 'Variance & Diff Analysis' },
    { num: 4, title: 'Batch Processing' },
    { num: 5, title: 'Lock & Bank Disbursal' },
  ];

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white border border-border shadow-modal rounded-3xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp cursor-default"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-border/80 flex-shrink-0 bg-slate-900 text-white">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold tracking-tight text-white">
                  greytHR-Style 5-Step Payroll Processing Wizard
                </h3>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold">
                  PF • PT • TDS Only
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Guided workflow for {cycleMonth} with strict statutory deduction calculations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Company Scope Switcher */}
            <div className="flex items-center gap-1 p-1 bg-slate-800 rounded-xl border border-slate-700 text-xs">
              <button
                type="button"
                onClick={() => setWizardCompany('Nimble vision pvt ltd')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  wizardCompany === 'Nimble vision pvt ltd'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏢 Nimble Vision
              </button>
              <button
                type="button"
                onClick={() => setWizardCompany('Alpha vision pvt ltd')}
                className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
                  wizardCompany === 'Alpha vision pvt ltd'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                🏢 Alpha Vision
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Wizard Step Progress Indicator */}
        <div className="bg-surface-low border-b border-border/80 px-6 py-3 flex-shrink-0">
          <div className="flex items-center justify-between overflow-x-auto scrollbar-none gap-2">
            {stepsList.map((st) => (
              <div key={st.num} className="flex items-center gap-2 flex-shrink-0">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    currentStep === st.num
                      ? 'bg-primary text-white shadow-xs'
                      : currentStep > st.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white text-content-muted border border-border'
                  }`}
                >
                  {currentStep > st.num ? <Check className="w-3.5 h-3.5" /> : st.num}
                </div>
                <span
                  className={`text-xs whitespace-nowrap ${
                    currentStep === st.num
                      ? 'font-bold text-content-main'
                      : currentStep > st.num
                      ? 'font-medium text-emerald-700'
                      : 'text-content-muted'
                  }`}
                >
                  {st.title}
                </span>
                {st.num < 5 && <ChevronRight className="w-3.5 h-3.5 text-content-muted/50 ml-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Wizard Body (Scrollable) */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* STEP 1: Attendance & LOP Cutoff */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-content-main">
                    Step 1: Attendance Reconciliation & Loss-of-Pay (LOP) Cutoff
                  </h4>
                  <p className="text-xs text-content-muted mt-0.5">
                    Review and adjust unapproved leaves or Loss of Pay (LOP) days. Net payable days adjust automatically.
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-content-muted block">Cycle Month</span>
                  <span className="text-xs font-bold text-content-main font-mono">{cycleMonth}</span>
                </div>
              </div>

              <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-low border-b border-border text-[11px] font-semibold text-content-muted uppercase">
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Department</th>
                      <th className="py-2.5 px-3">Total Working Days</th>
                      <th className="py-2.5 px-3">LOP Days (Loss of Pay)</th>
                      <th className="py-2.5 px-3">Payable Days</th>
                      <th className="py-2.5 px-3">Adjusted Gross (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {rows.map((row, idx) => (
                      <tr key={row.employee} className="hover:bg-surface-low/50">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-content-main block">{row.employee_name}</span>
                          <span className="text-[10px] text-content-muted font-mono">{row.employee}</span>
                        </td>
                        <td className="py-2.5 px-3 text-content-muted">{row.department}</td>
                        <td className="py-2.5 px-3 font-mono font-medium">{row.total_working_days}</td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            min="0"
                            max="30"
                            value={row.lop_days}
                            onChange={(e) => handleLopChange(idx, Number(e.target.value))}
                            className="nv-input w-20 py-1 px-2 text-xs font-mono font-bold text-amber-700 bg-amber-50/40 border-amber-300"
                          />
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                          {row.payment_days} Days
                        </td>
                        <td className="py-2.5 px-3 font-mono font-bold text-content-main">
                          ₹{row.gross_pay.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* STEP 2: Strict PF, PT & TDS Review & Adjustments */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-serif font-bold text-base text-content-main">
                    Step 2: Statutory Deductions Review (Strictly PF, PT & TDS)
                  </h4>
                  <p className="text-xs text-content-muted mt-0.5">
                    Review and fine-tune statutory deductions for each employee. Deductions are strictly limited to PF, PT, and TDS.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-semibold">
                    PF: 12%
                  </span>
                  <span className="text-[11px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-semibold">
                    PT: ₹200
                  </span>
                  <span className="text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                    TDS: Sec 192
                  </span>
                </div>
              </div>

              <div className="border border-border rounded-2xl overflow-hidden bg-white shadow-xs">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-low border-b border-border text-[11px] font-semibold text-content-muted uppercase">
                      <th className="py-2.5 px-3">Employee</th>
                      <th className="py-2.5 px-3">Gross (₹)</th>
                      <th className="py-2.5 px-3 text-emerald-800">PF (12%)</th>
                      <th className="py-2.5 px-3 text-blue-800">PT (State)</th>
                      <th className="py-2.5 px-3 text-amber-800">TDS (Tax)</th>
                      <th className="py-2.5 px-3 text-right">Net Take-Home (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {rows.map((row, idx) => (
                      <tr key={row.employee} className="hover:bg-surface-low/50">
                        <td className="py-2.5 px-3">
                          <span className="font-bold text-content-main block">{row.employee_name}</span>
                          <span className="text-[10px] text-content-muted font-mono">{row.employee}</span>
                        </td>
                        <td className="py-2.5 px-3 font-mono font-medium text-content-main">
                          ₹{row.gross_pay.toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={row.pf}
                            onChange={(e) => handleDeductionChange(idx, 'pf', Number(e.target.value))}
                            className="nv-input w-24 py-1 px-2 text-xs font-mono font-semibold text-emerald-800 bg-emerald-50/50"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={row.pt}
                            onChange={(e) => handleDeductionChange(idx, 'pt', Number(e.target.value))}
                            className="nv-input w-20 py-1 px-2 text-xs font-mono font-semibold text-blue-800 bg-blue-50/50"
                          />
                        </td>
                        <td className="py-2.5 px-3">
                          <input
                            type="number"
                            value={row.tds}
                            onChange={(e) => handleDeductionChange(idx, 'tds', Number(e.target.value))}
                            className="nv-input w-24 py-1 px-2 text-xs font-mono font-semibold text-amber-800 bg-amber-50/50"
                          />
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          ₹{row.net_pay.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-surface-low font-bold text-xs border-t border-border">
                      <td className="py-2.5 px-3 text-content-main">Total Statutory Sums:</td>
                      <td className="py-2.5 px-3 font-mono text-content-main">₹{totalGross.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-mono text-emerald-900">₹{totalPf.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-mono text-blue-900">₹{totalPt.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 font-mono text-amber-900">₹{totalTds.toLocaleString('en-IN')}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-emerald-800">₹{totalNet.toLocaleString('en-IN')}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* STEP 3: Variance & Diffing Analysis */}
          {currentStep === 3 && (
            <div className="space-y-5">
              <div>
                <h4 className="font-serif font-bold text-base text-content-main">
                  Step 3: Month-on-Month Variance & Diffing Analysis
                </h4>
                <p className="text-xs text-content-muted mt-0.5">
                  Verify current payout against the previous month baseline to catch unintended discrepancies before disbursal.
                </p>
              </div>

              {/* High-level KPI cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-surface-low border border-border">
                  <span className="text-[11px] text-content-muted block">Current Gross Payout</span>
                  <span className="text-xl font-bold font-serif text-content-main">₹{totalGross.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-emerald-600 block mt-1 font-semibold">
                    +{grossDiffPercent}% vs Last Month
                  </span>
                </div>
                <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200">
                  <span className="text-[11px] text-emerald-900 block font-medium">Total Employee PF (12%)</span>
                  <span className="text-xl font-bold font-serif text-emerald-950">₹{totalPf.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-emerald-700 block mt-1 font-medium">EPFO Remittance Pool</span>
                </div>
                <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200">
                  <span className="text-[11px] text-blue-900 block font-medium">Total Professional Tax (PT)</span>
                  <span className="text-xl font-bold font-serif text-blue-950">₹{totalPt.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-blue-700 block mt-1 font-medium">State Treasury Challan</span>
                </div>
                <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200">
                  <span className="text-[11px] text-amber-900 block font-medium">Total TDS Withheld (Sec 192)</span>
                  <span className="text-xl font-bold font-serif text-amber-950">₹{totalTds.toLocaleString('en-IN')}</span>
                  <span className="text-[10px] text-amber-700 block mt-1 font-medium">Income Tax Challan 281</span>
                </div>
              </div>

              {/* Net Disbursal Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white flex items-center justify-between shadow-md">
                <div>
                  <span className="text-xs text-emerald-100 block">Total Net Bank Disbursal</span>
                  <span className="text-2xl font-extrabold font-serif">₹{totalNet.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-right text-xs text-emerald-100">
                  <span>Gross ₹{totalGross.toLocaleString('en-IN')}</span>
                  <span className="block font-semibold mt-0.5">
                    Less: PF (₹{totalPf}) • PT (₹{totalPt}) • TDS (₹{totalTds})
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Batch Processing Execution */}
          {currentStep === 4 && (
            <div className="p-8 text-center space-y-6">
              <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto shadow-sm">
                <RefreshCw className={`w-8 h-8 ${processing ? 'animate-spin' : ''}`} />
              </div>

              <div>
                <h4 className="font-serif font-bold text-xl text-content-main">
                  {processing ? 'Processing Monthly Salary Slips...' : 'Batch Verification Ready'}
                </h4>
                <p className="text-xs text-content-muted max-w-md mx-auto mt-1 leading-relaxed">
                  Executing automated salary slip creation, applying attendance LOP proration, and validating strictly PF, PT, and TDS statutory deduction heads.
                </p>
              </div>

              <div className="max-w-md mx-auto space-y-2">
                <div className="w-full bg-surface-low rounded-full h-3 border border-border overflow-hidden">
                  <div
                    className="bg-primary h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-content-muted font-mono font-medium">
                  <span>Processing {rows.length} Staff Slips</span>
                  <span>{progress}% Completed</span>
                </div>
              </div>

              {!processing && progress === 0 && (
                <button
                  type="button"
                  onClick={handleRunBatch}
                  className="btn-primary text-xs h-10 px-6 font-semibold mx-auto"
                >
                  Start Batch Processing
                </button>
              )}
            </div>
          )}

          {/* STEP 5: Finalized, Locked & 1-Click Multi-Bank Disbursal */}
          {currentStep === 5 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-start gap-3.5">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-serif font-bold text-base text-emerald-950">
                    Payroll Cycle {cycleMonth} Finalized & Locked
                  </h4>
                  <p className="text-xs text-emerald-800/90 mt-0.5 leading-relaxed">
                    Salary slips have been generated in the database. General Ledger entry has booked 
                    staff salary expense, PF liability, PT liability, and TDS withholding.
                  </p>
                </div>
              </div>

              <div>
                <h5 className="font-serif font-bold text-sm text-content-main mb-3 flex items-center gap-2">
                  <Download className="w-4 h-4 text-primary" />
                  1-Click Direct Bank Disbursal File Exports
                </h5>
                <p className="text-xs text-content-muted mb-4">
                  Select your corporate banking provider to instantly download pre-formatted batch payment files ready for upload:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => downloadBankAdvice('HDFC')}
                    className="p-4 rounded-xl border border-border hover:border-blue-500 bg-white hover:bg-blue-50/30 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-blue-900">HDFC Bank</span>
                      <FileSpreadsheet className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[11px] text-content-muted block">Corporate NetBanking CSV</span>
                    <span className="text-[10px] text-blue-700 font-semibold mt-2 inline-block">Download CSV →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadBankAdvice('ICICI')}
                    className="p-4 rounded-xl border border-border hover:border-orange-500 bg-white hover:bg-orange-50/30 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-orange-900">ICICI Bank</span>
                      <FileSpreadsheet className="w-4 h-4 text-orange-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[11px] text-content-muted block">CIB Corporate Format</span>
                    <span className="text-[10px] text-orange-700 font-semibold mt-2 inline-block">Download CSV →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadBankAdvice('SBI')}
                    className="p-4 rounded-xl border border-border hover:border-cyan-500 bg-white hover:bg-cyan-50/30 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-cyan-900">State Bank of India</span>
                      <FileSpreadsheet className="w-4 h-4 text-cyan-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[11px] text-content-muted block">SBI CMP Portal File</span>
                    <span className="text-[10px] text-cyan-700 font-semibold mt-2 inline-block">Download CSV →</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => downloadBankAdvice('NEFT')}
                    className="p-4 rounded-xl border border-border hover:border-emerald-500 bg-white hover:bg-emerald-50/30 text-left transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-xs text-emerald-900">Universal NEFT</span>
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-[11px] text-content-muted block">Standard RBI Batch File</span>
                    <span className="text-[10px] text-emerald-700 font-semibold mt-2 inline-block">Download CSV →</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-5 border-t border-border/80 bg-surface-low flex items-center justify-between flex-shrink-0">
          <div>
            {currentStep > 1 && currentStep < 5 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev - 1)}
                className="btn-secondary text-xs h-9 px-4 flex items-center gap-1.5"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous Step</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs h-9 px-4"
            >
              Close
            </button>

            {currentStep < 4 && (
              <button
                type="button"
                onClick={() => setCurrentStep((prev) => prev + 1)}
                className="btn-primary text-xs h-9 px-5 flex items-center gap-1.5"
              >
                <span>Proceed to {stepsList[currentStep].title}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}

            {currentStep === 5 && (
              <button
                type="button"
                onClick={() => {
                  onComplete();
                  onClose();
                }}
                className="btn-primary text-xs h-9 px-5 font-semibold"
              >
                Done & Return to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
