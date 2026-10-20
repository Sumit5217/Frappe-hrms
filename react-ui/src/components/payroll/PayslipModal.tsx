import React, { useState } from 'react';
import { X, Printer, CheckCircle2, Building2, Wallet, Calculator, Download } from 'lucide-react';
import { SalarySlip } from './types';
import { TaxBreakdownModal } from './TaxBreakdownModal';
import { downloadSalarySlipPDF } from '../../utils/salarySlipPdf';

interface PayslipModalProps {
  slip: SalarySlip | null;
  isOpen: boolean;
  onClose: () => void;
}

// Convert numbers to Indian Rupees in words
function numberToWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  const inWords = (n: number): string => {
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (str !== '') str += 'and ';
      if (n < 20) str += a[n];
      else {
        str += b[Math.floor(n / 10)];
        if (n % 10 > 0) str += ' ' + a[n % 10];
        str += ' ';
      }
    }
    return str;
  };

  return inWords(n).trim() + ' Rupees Only';
}

export const PayslipModal: React.FC<PayslipModalProps> = ({ slip, isOpen, onClose }) => {
  const [showTaxBreakdown, setShowTaxBreakdown] = useState(false);

  if (!isOpen || !slip) return null;

  const handlePrint = () => {
    window.print();
  };

  const monthYearStr = slip.start_date
    ? new Date(slip.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'September 2026';

  const incomeTaxAmount = slip.deductions?.find((d) =>
    d.salary_component?.toLowerCase().includes('income tax') || d.salary_component?.toLowerCase().includes('tds')
  )?.amount || 0;

  return (
    <>
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-payslip, #printable-payslip * {
            visibility: visible !important;
          }
          #printable-payslip {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 20px !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
          }
        }
      `}</style>
      <div
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      >
        <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-gray-200 overflow-hidden my-8 animate-scaleUp text-xs font-sans">
          {/* Top Control Bar (Non-printable) */}
          <div className="bg-[#1A2232] text-white px-6 py-3.5 flex items-center justify-between print:hidden">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight">Nimble Vision Digital Payslip</h3>
                <p className="text-[11px] text-slate-400">Reference: {slip.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowTaxBreakdown(true)}
                className="px-3 py-1.5 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs border border-indigo-400/30"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>TDS Breakdown</span>
              </button>
              <button
                onClick={() => downloadSalarySlipPDF(slip)}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs shadow-xs"
                title="Download Official PDF to your computer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PDF</span>
              </button>
              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer text-xs"
                title="Print Official Payslip"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print</span>
              </button>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

        {/* Printable Payslip Body */}
        <div className="p-8 space-y-6 print:p-6" id="printable-payslip">
          {/* Header */}
          <div className="text-center border-b border-gray-200 pb-5">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Building2 className="w-5 h-5 text-emerald-600" />
              <h1 className="text-xl font-serif font-black tracking-tight text-gray-900">
                {slip.company || 'Nimble Vision Private Limited'}
              </h1>
            </div>
            <p className="text-gray-500 text-[11px]">
              Sompura Gate, BMT Marutham Gardens, Sarjapura, Bengaluru, Karnataka
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              <div className="inline-block px-4 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs">
                PAYSLIP FOR THE MONTH OF {monthYearStr.toUpperCase()}
              </div>
              {slip.status === 'Draft' && (
                <div className="inline-block px-3 py-1 rounded-full bg-amber-50 border border-amber-300 text-amber-800 font-bold text-[11px]">
                  ⚠️ DRAFT PREVIEW (UNPROCESSED) • RELEASE DATE: 04 NOV 2026
                </div>
              )}
            </div>
          </div>

          {/* Employee & Attendance Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50/70 p-4 rounded-xl border border-gray-200/80">
            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-32 text-gray-500 font-medium">Employee Code:</span>
                <span className="font-bold text-gray-900">{slip.employee}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500 font-medium">Employee Name:</span>
                <span className="font-bold text-gray-900">{slip.employee_name}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500 font-medium">Department:</span>
                <span className="text-gray-800">{slip.department || 'Engineering'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500 font-medium">Designation:</span>
                <span className="text-gray-800">{slip.designation || 'Specialist'}</span>
              </div>
              <div className="flex">
                <span className="w-32 text-gray-500 font-medium">Bank Name:</span>
                <span className="text-gray-800">{slip.bank_name || 'HDFC Bank'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex">
                <span className="w-36 text-gray-500 font-medium">Account Number:</span>
                <span className="font-bold text-gray-900">{slip.bank_account_no || '•••• •••• 4892'}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-gray-500 font-medium">PAN Number:</span>
                <span className="text-gray-800">{slip.pan_number || 'ABCDE1234F'}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-gray-500 font-medium">UAN / PF Number:</span>
                <span className="text-gray-800">{slip.uan || '101289384920'}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-gray-500 font-medium">Total Working Days:</span>
                <span className="font-bold text-gray-900">{slip.total_working_days || 30}</span>
              </div>
              <div className="flex">
                <span className="w-36 text-gray-500 font-medium">Paid Days / LOP:</span>
                <span className="font-bold text-emerald-700">
                  {slip.payment_days || 30} Days / <span className="text-rose-600">{slip.leave_without_pay || 0} LOP</span>
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Earnings & Deductions Tables */}
          <div className="border border-gray-200 rounded-xl overflow-hidden shadow-xs">
            <div className="grid grid-cols-2 divide-x divide-gray-200">
              {/* Left Column: Earnings */}
              <div>
                <div className="bg-emerald-50/80 px-4 py-2.5 font-bold text-emerald-900 flex justify-between border-b border-gray-200">
                  <span>EARNINGS</span>
                  <span>AMOUNT (₹)</span>
                </div>
                <div className="divide-y divide-gray-100 p-2">
                  {slip.earnings && slip.earnings.length > 0 ? (
                    slip.earnings.map((e, idx) => (
                      <div key={idx} className="flex justify-between py-1.5 px-2 text-gray-700">
                        <span>{e.salary_component}</span>
                        <span className="font-semibold">{e.amount?.toLocaleString('en-IN') || 0}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between py-1.5 px-2 text-gray-700">
                        <span>Basic Salary</span>
                        <span className="font-semibold">{Math.round((slip.gross_pay || 75000) * 0.6).toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between py-1.5 px-2 text-gray-700">
                        <span>Special Allowance</span>
                        <span className="font-semibold">{Math.round((slip.gross_pay || 75000) * 0.4).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Right Column: Deductions */}
              <div>
                <div className="bg-rose-50/80 px-4 py-2.5 font-bold text-rose-900 flex justify-between border-b border-gray-200">
                  <span>DEDUCTIONS</span>
                  <span>AMOUNT (₹)</span>
                </div>
                <div className="divide-y divide-gray-100 p-2">
                  {slip.deductions && slip.deductions.length > 0 ? (
                    slip.deductions.map((d, idx) => {
                      const isTax =
                        d.salary_component?.toLowerCase().includes('income tax') ||
                        d.salary_component?.toLowerCase().includes('tds');
                      return (
                        <div key={idx} className="flex justify-between items-center py-1.5 px-2 text-gray-700">
                          <div className="flex items-center gap-1.5">
                            <span>{d.salary_component}</span>
                            {isTax && (
                              <button
                                type="button"
                                onClick={() => setShowTaxBreakdown(true)}
                                className="px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold border border-indigo-200 cursor-pointer print:hidden transition-colors"
                                title="Click to view full tax calculation & slabs"
                              >
                                ⚡ Breakdown
                              </button>
                            )}
                          </div>
                          <span className="font-semibold">{d.amount?.toLocaleString('en-IN') || 0}</span>
                        </div>
                      );
                    })
                  ) : (
                    <>
                      <div className="flex justify-between py-1.5 px-2 text-gray-700">
                        <span>Provident Fund (PF - Statutory)</span>
                        <span className="font-semibold">1,800</span>
                      </div>
                      <div className="flex justify-between py-1.5 px-2 text-gray-700">
                        <span>Professional Tax (PT)</span>
                        <span className="font-semibold">200</span>
                      </div>
                      <div className="flex justify-between items-center py-1.5 px-2 text-gray-700">
                        <div className="flex items-center gap-1.5">
                          <span>TDS (Income Tax - Sec 115BAC)</span>
                          <button
                            type="button"
                            onClick={() => setShowTaxBreakdown(true)}
                            className="px-1.5 py-0.5 rounded bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[9px] font-bold border border-indigo-200 cursor-pointer print:hidden transition-colors"
                            title="Click to view full tax calculation & slabs"
                          >
                            ⚡ Breakdown
                          </button>
                        </div>
                        <span className="font-semibold">{Math.max(0, (slip.total_deduction || 4817) - 1800 - 200).toLocaleString('en-IN')}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Subtotals Strip */}
            <div className="grid grid-cols-2 divide-x divide-gray-200 bg-gray-50 border-t border-gray-200 font-bold">
              <div className="flex justify-between px-4 py-2.5 text-gray-900">
                <span>Total Gross Earnings:</span>
                <span className="text-emerald-700 font-bold">
                  ₹{slip.gross_pay?.toLocaleString('en-IN') || '50,000'}
                </span>
              </div>
              <div className="flex justify-between px-4 py-2.5 text-gray-900">
                <span>Total Deductions:</span>
                <span className="text-rose-700 font-bold">
                  ₹{slip.total_deduction?.toLocaleString('en-IN') || '4,000'}
                </span>
              </div>
            </div>
          </div>

          {/* Net Pay Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-xl p-5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-wider text-emerald-100 font-semibold block">
                Net Take-Home Pay (Disbursed)
              </span>
              <p className="text-2xl font-extrabold tracking-tight mt-0.5">
                ₹{(slip.net_pay || slip.gross_pay - slip.total_deduction || 46000).toLocaleString('en-IN')}
              </p>
              <p className="text-[11px] text-emerald-100 italic mt-1 font-medium">
                {numberToWords(slip.net_pay || slip.gross_pay - slip.total_deduction || 46000)}
              </p>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold border border-white/30">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-200" />
                <span>Status: {slip.status || 'Submitted'}</span>
              </div>
            </div>
          </div>

          {/* Footer & Disclaimer */}
          <div className="text-center text-[10px] text-gray-400 pt-4 border-t border-gray-100">
            <p>This is a computer-generated document and does not require a physical signature.</p>
            <p className="mt-0.5">Nimble Vision HRMS • Official Payroll Document</p>
          </div>
        </div>
      </div>
      {showTaxBreakdown && (
        <TaxBreakdownModal
          isOpen={showTaxBreakdown}
          onClose={() => setShowTaxBreakdown(false)}
          employee={{
            empNo: slip.employee || '',
            name: slip.employee_name || '',
            monthlyGross: slip.gross_pay || 0,
            currentTds: incomeTaxAmount,
            department: slip.department,
            designation: slip.designation,
          }}
        />
      )}
    </div>
  </>
  );
};
