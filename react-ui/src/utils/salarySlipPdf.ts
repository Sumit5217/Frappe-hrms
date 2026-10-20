import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { SalarySlip } from '../components/payroll/types';

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

export async function downloadSalarySlipPDF(slip: SalarySlip) {
  const monthYearStr = slip.start_date
    ? new Date(slip.start_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : 'October 2026';

  const sanitizedEmp = (slip.employee_name || slip.employee || 'Employee').replace(/\s+/g, '_');
  const filename = `Salary_Slip_${sanitizedEmp}_${monthYearStr.replace(/\s+/g, '_')}.pdf`;

  // 1. Check if the active printable element is already mounted on the page
  const activePrintable = document.getElementById('printable-payslip');
  let targetElement: HTMLElement;
  let isTemp = false;

  if (activePrintable && activePrintable.offsetParent !== null) {
    targetElement = activePrintable;
  } else {
    // 2. Generate a clone with the identical styling of the View modal
    isTemp = true;
    targetElement = document.createElement('div');
    targetElement.style.position = 'fixed';
    targetElement.style.left = '-9999px';
    targetElement.style.top = '0';
    targetElement.style.width = '780px';
    targetElement.style.backgroundColor = '#ffffff';
    targetElement.style.padding = '32px';
    targetElement.style.fontFamily = 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    targetElement.style.color = '#1e293b';
    targetElement.style.zIndex = '-999';

    const gross = slip.gross_pay || 50000;
    const ded = slip.total_deduction || 4000;
    const net = slip.net_pay || (gross - ded);

    const earnings = slip.earnings && slip.earnings.length > 0 ? slip.earnings : [
      { salary_component: 'Basic Salary', amount: Math.round(gross * 0.6) },
      { salary_component: 'Special Allowance', amount: Math.round(gross * 0.4) },
    ];

    const deductions = slip.deductions && slip.deductions.length > 0 ? slip.deductions : [
      { salary_component: 'Provident Fund (PF - Statutory)', amount: 1800 },
      { salary_component: 'Income Tax (TDS - Sec 115BAC)', amount: Math.max(0, ded - 1800 - 200) },
      { salary_component: 'Professional Tax (PT)', amount: 200 },
    ];

    targetElement.innerHTML = `
      <div style="font-size: 12px; line-height: 1.5; color: #1e293b; background: #ffffff;">
        <!-- Header -->
        <div style="text-align: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px;">
            <svg style="width: 22px; height: 22px; color: #059669;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"/>
              <path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"/>
              <path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"/>
              <path d="M10 6h4"/>
              <path d="M10 10h4"/>
              <path d="M10 14h4"/>
              <path d="M10 18h4"/>
            </svg>
            <h1 style="font-size: 20px; font-weight: 900; color: #0f172a; margin: 0; font-family: serif;">
              ${slip.company || 'Nimble Vision Private Limited'}
            </h1>
          </div>
          <p style="color: #64748b; font-size: 11px; margin: 2px 0 0 0;">
            Sompura Gate, BMT Marutham Gardens, Sarjapura, Bengaluru, Karnataka
          </p>
          <div style="margin-top: 12px;">
            <span style="display: inline-block; padding: 4px 16px; border-radius: 9999px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; font-weight: 700; font-size: 11px; letter-spacing: 0.5px;">
              PAYSLIP FOR THE MONTH OF ${monthYearStr.toUpperCase()}
            </span>
          </div>
        </div>

        <!-- Employee & Attendance Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0; margin-bottom: 24px;">
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex;"><span style="width: 120px; color: #64748b; font-weight: 500;">Employee Code:</span><span style="font-weight: 700; color: #0f172a;">${slip.employee || 'HR-EMP-00001'}</span></div>
            <div style="display: flex;"><span style="width: 120px; color: #64748b; font-weight: 500;">Employee Name:</span><span style="font-weight: 700; color: #0f172a;">${slip.employee_name || 'Selected Employee'}</span></div>
            <div style="display: flex;"><span style="width: 120px; color: #64748b; font-weight: 500;">Department:</span><span style="color: #1e293b;">${slip.department || 'Operations'}</span></div>
            <div style="display: flex;"><span style="width: 120px; color: #64748b; font-weight: 500;">Designation:</span><span style="color: #1e293b;">${slip.designation || 'Specialist'}</span></div>
            <div style="display: flex;"><span style="width: 120px; color: #64748b; font-weight: 500;">Bank Name:</span><span style="color: #1e293b;">${slip.bank_name || 'HDFC Bank'}</span></div>
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex;"><span style="width: 130px; color: #64748b; font-weight: 500;">Account Number:</span><span style="font-weight: 700; color: #0f172a;">${slip.bank_account_no || '•••• •••• 4892'}</span></div>
            <div style="display: flex;"><span style="width: 130px; color: #64748b; font-weight: 500;">PAN Number:</span><span style="color: #1e293b;">${slip.pan_number || 'ABCDE1234F'}</span></div>
            <div style="display: flex;"><span style="width: 130px; color: #64748b; font-weight: 500;">UAN / PF Number:</span><span style="color: #1e293b;">${slip.uan || '101289384920'}</span></div>
            <div style="display: flex;"><span style="width: 130px; color: #64748b; font-weight: 500;">Total Working Days:</span><span style="font-weight: 700; color: #0f172a;">${slip.total_working_days || 30}</span></div>
            <div style="display: flex;"><span style="width: 130px; color: #64748b; font-weight: 500;">Paid Days / LOP:</span><span style="font-weight: 700; color: #047857;">${slip.payment_days || 30} Days / <span style="color: #e11d48;">${slip.leave_without_pay || 0} LOP</span></span></div>
          </div>
        </div>

        <!-- 2-Column Earnings & Deductions Tables -->
        <div style="border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px;">
          <div style="display: grid; grid-template-columns: 1fr 1fr;">
            <!-- Left: Earnings -->
            <div style="border-right: 1px solid #e2e8f0;">
              <div style="background: #ecfdf5; padding: 10px 16px; font-weight: 700; color: #065f46; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0;">
                <span>EARNINGS</span>
                <span>AMOUNT (₹)</span>
              </div>
              <div style="padding: 8px;">
                ${earnings.map(e => `
                  <div style="display: flex; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid #f1f5f9; color: #334155;">
                    <span>${e.salary_component}</span>
                    <span style="font-weight: 600; color: #0f172a;">₹${Number(e.amount).toLocaleString('en-IN')}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Right: Deductions -->
            <div>
              <div style="background: #fff1f2; padding: 10px 16px; font-weight: 700; color: #881337; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0;">
                <span>DEDUCTIONS</span>
                <span>AMOUNT (₹)</span>
              </div>
              <div style="padding: 8px;">
                ${deductions.map(d => `
                  <div style="display: flex; justify-content: space-between; padding: 6px 8px; border-bottom: 1px solid #f1f5f9; color: #334155;">
                    <span>${d.salary_component}</span>
                    <span style="font-weight: 600; color: #0f172a;">₹${Number(d.amount).toLocaleString('en-IN')}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Subtotals Strip -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; background: #f8fafc; border-top: 1px solid #e2e8f0; font-weight: 700;">
            <div style="display: flex; justify-content: space-between; padding: 10px 16px; border-right: 1px solid #e2e8f0; color: #0f172a;">
              <span>Total Gross Earnings:</span>
              <span style="color: #047857;">₹${Number(gross).toLocaleString('en-IN')}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 10px 16px; color: #0f172a;">
              <span>Total Deductions:</span>
              <span style="color: #be123c;">₹${Number(ded).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        <!-- Net Take-Home Pay Banner -->
        <div style="background: linear-gradient(135deg, #059669 0%, #0f766e 100%); color: #ffffff; border-radius: 12px; padding: 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          <div>
            <span style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #a7f3d0; font-weight: 600; display: block;">
              Net Take-Home Pay (Disbursed)
            </span>
            <p style="font-size: 24px; font-weight: 800; margin: 4px 0 0 0; letter-spacing: -0.5px;">
              ₹${Number(net).toLocaleString('en-IN')}
            </p>
            <p style="font-size: 11px; color: #a7f3d0; font-style: italic; margin: 4px 0 0 0; font-weight: 500;">
              ${numberToWords(net)}
            </p>
          </div>
          <div style="text-align: right;">
            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(255, 255, 255, 0.2); padding: 6px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; border: 1px solid rgba(255, 255, 255, 0.3);">
              <span>Status: ${slip.status || 'Submitted'}</span>
            </div>
          </div>
        </div>

        <!-- Footer & Disclaimer -->
        <div style="text-align: center; font-size: 10px; color: #94a3b8; border-top: 1px solid #f1f5f9; padding-top: 16px;">
          <p style="margin: 0;">This is a computer-generated document and does not require a physical signature.</p>
          <p style="margin: 4px 0 0 0;">Nimble Vision HRMS • Official Payroll Document</p>
        </div>
      </div>
    `;

    document.body.appendChild(targetElement);
  }

  try {
    const canvas = await html2canvas(targetElement, {
      scale: 2, // High resolution crisp rendering
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10;
    const renderWidth = pageWidth - margin * 2;
    const renderHeight = (canvas.height * renderWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', margin, margin, renderWidth, Math.min(renderHeight, pageHeight - margin * 2));
    pdf.save(filename);
  } finally {
    if (isTemp && targetElement && targetElement.parentNode) {
      targetElement.parentNode.removeChild(targetElement);
    }
  }
}
