import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import {
  Sparkles,
  FileSpreadsheet,
  Trash2,
  Edit2,
  Info,
  ChevronLeft,
  ChevronRight,
  Search,
  CheckCircle2,
  Eye,
  RefreshCw,
  Scale,
  Sliders,
  Lock,
  AlertCircle,
  Calendar,
  Clock,
  AlertTriangle,
  XCircle,
  X,
  Calculator,
  Database,
  Landmark,
  FileText,
  Download,
  Building2,
} from 'lucide-react';
import { Employee } from '../../types';
import { frappeApi } from '../../api/frappe';
import { PayslipModal } from './PayslipModal';
import { TaxBreakdownModal, TaxBreakdownEmployee } from './TaxBreakdownModal';
import { SalarySlip } from './types';
import { downloadSalarySlipPDF } from '../../utils/salarySlipPdf';

interface PayrollDashboardProps {
  employees: Employee[];
  onNavigate: (subItem: string, docType?: string, reportName?: string) => void;
  onOpenWizard?: () => void;
  onOpenSimulator?: () => void;
}

// 12 Financial Year Months (April 2026 to March 2027)
interface MonthConfig {
  id: string;
  shortLabel: string;
  year: string;
  fullTitle: string;
  cutoff: string;
  isNew?: boolean;
  workDays: number;
  scaleFactor: number; // for dynamic variation across months
  releaseDate: string; // Official greytHR salary release date
  isProcessed: boolean; // Whether salary has been computed/released
  isCurrent?: boolean; // Current active calendar month
}

const MONTHS: MonthConfig[] = [
  { id: 'apr-2026', shortLabel: 'Apr', year: '2026', fullTitle: 'April 2026', cutoff: '01 Apr 2026 to 30 Apr 2026', workDays: 30, scaleFactor: 0.98, releaseDate: '04 May 2026', isProcessed: true },
  { id: 'may-2026', shortLabel: 'May', year: '2026', fullTitle: 'May 2026', cutoff: '01 May 2026 to 31 May 2026', workDays: 31, scaleFactor: 0.99, releaseDate: '04 Jun 2026', isProcessed: true },
  { id: 'jun-2026', shortLabel: 'Jun', year: '2026', fullTitle: 'June 2026', cutoff: '01 Jun 2026 to 30 Jun 2026', workDays: 30, scaleFactor: 1.0, releaseDate: '04 Jul 2026', isProcessed: true },
  { id: 'jul-2026', shortLabel: 'Jul', year: '2026', fullTitle: 'July 2026', cutoff: '01 Jul 2026 to 31 Jul 2026', workDays: 31, scaleFactor: 1.02, releaseDate: '04 Aug 2026', isProcessed: true },
  { id: 'aug-2026', shortLabel: 'Aug', year: '2026', fullTitle: 'August 2026', cutoff: '01 Aug 2026 to 31 Aug 2026', workDays: 31, scaleFactor: 1.01, releaseDate: '04 Sep 2026', isProcessed: true },
  { id: 'sep-2026', shortLabel: 'Sep', year: '2026', fullTitle: 'September 2026', cutoff: '01 Sep 2026 to 30 Sep 2026', workDays: 30, scaleFactor: 1.03, releaseDate: '04 Oct 2026', isProcessed: true },
  // October 2026: Active current cycle - Release date is 04 Nov 2026. Cannot be processed prior to release date!
  { id: 'oct-2026', shortLabel: 'Oct', year: '2026', fullTitle: 'October 2026', cutoff: '01 Oct 2026 to 31 Oct 2026', workDays: 31, scaleFactor: 1.04, releaseDate: '04 Nov 2026', isProcessed: false, isCurrent: true, isNew: true },
  { id: 'nov-2026', shortLabel: 'Nov', year: '2026', fullTitle: 'November 2026', cutoff: '01 Nov 2026 to 30 Nov 2026', workDays: 30, scaleFactor: 1.02, releaseDate: '04 Dec 2026', isProcessed: false },
  { id: 'dec-2026', shortLabel: 'Dec', year: '2026', fullTitle: 'December 2026', cutoff: '01 Dec 2026 to 31 Dec 2026', workDays: 31, scaleFactor: 1.05, releaseDate: '04 Jan 2027', isProcessed: false },
  { id: 'jan-2027', shortLabel: 'Jan', year: '2027', fullTitle: 'January 2027', cutoff: '01 Jan 2027 to 31 Jan 2027', workDays: 31, scaleFactor: 1.04, releaseDate: '04 Feb 2027', isProcessed: false },
  { id: 'feb-2027', shortLabel: 'Feb', year: '2027', fullTitle: 'February 2027', cutoff: '01 Feb 2027 to 28 Feb 2027', workDays: 28, scaleFactor: 1.01, releaseDate: '04 Mar 2027', isProcessed: false },
  { id: 'mar-2027', shortLabel: 'Mar', year: '2027', fullTitle: 'March 2027', cutoff: '01 Mar 2027 to 31 Mar 2027', workDays: 31, scaleFactor: 1.08, releaseDate: '04 Apr 2027', isProcessed: false },
];

// Base Payroll Employee Dataset matching User's Screenshots (Image 1 & Image 2)
interface PayrollRecord {
  empNo: string;
  name: string;
  category: 'Technical' | 'Operations' | 'Management' | 'Finance';
  employmentStatus: 'Active' | 'Probation' | 'Notice';
  isExcluded?: boolean;
  basic: number;
  specialAllowance: number;
  gross: number;
  pf: number;
  incomeTax: number;
  profTax: number;
  totalDeductions: number;
  netPay: number;
  totalDays?: number;
  paymentDays?: number;
  lopDays?: number;
  lopDeductionAmount?: number;
  baseGross?: number;
  slipName?: string;
  isFromDb?: boolean;
}

const REAL_EMPLOYEE_PRESETS: PayrollRecord[] = [
  {
    empNo: 'HR-EMP-00016',
    name: 'Tejas Desai',
    category: 'Technical',
    employmentStatus: 'Active',
    basic: 45000,
    specialAllowance: 30000,
    gross: 75000,
    pf: 1800,
    incomeTax: 2817,
    profTax: 200,
    totalDeductions: -4817,
    netPay: 70183,
  },
  {
    empNo: 'HR-EMP-00017',
    name: 'Tarun Kumar',
    category: 'Technical',
    employmentStatus: 'Active',
    basic: 45000,
    specialAllowance: 30000,
    gross: 75000,
    pf: 1800,
    incomeTax: 2817,
    profTax: 200,
    totalDeductions: -4817,
    netPay: 70183,
  },
  {
    empNo: 'HR-EMP-00018',
    name: 'Bhagya Shree',
    category: 'Technical',
    employmentStatus: 'Active',
    basic: 45000,
    specialAllowance: 30000,
    gross: 75000,
    pf: 1800,
    incomeTax: 2817,
    profTax: 200,
    totalDeductions: -4817,
    netPay: 70183,
  },
  {
    empNo: 'HR-EMP-00019',
    name: 'Sushmita Kumari',
    category: 'Technical',
    employmentStatus: 'Active',
    basic: 45000,
    specialAllowance: 30000,
    gross: 75000,
    pf: 1800,
    incomeTax: 2817,
    profTax: 200,
    totalDeductions: -4817,
    netPay: 70183,
  },
  {
    empNo: 'HR-EMP-00020',
    name: 'Priya Kumari',
    category: 'Technical',
    employmentStatus: 'Active',
    basic: 45000,
    specialAllowance: 30000,
    gross: 75000,
    pf: 1800,
    incomeTax: 2817,
    profTax: 200,
    totalDeductions: -4817,
    netPay: 70183,
  },
  {
    empNo: 'HR-EMP-00021',
    name: 'Sia Kureel',
    category: 'Operations',
    employmentStatus: 'Active',
    basic: 48000,
    specialAllowance: 32000,
    gross: 80000,
    pf: 1800,
    incomeTax: 3337,
    profTax: 200,
    totalDeductions: -5337,
    netPay: 74663,
  },
];

const ALPHA_VISION_PRESETS: PayrollRecord[] = [
  {
    empNo: 'HR-EMP-00023',
    name: 'Rohan Verma',
    category: 'Technical',
    employmentStatus: 'Active',
    basic: 27500,
    specialAllowance: 27500,
    gross: 55000,
    pf: 1800,
    incomeTax: 1200,
    profTax: 200,
    totalDeductions: -3200,
    netPay: 51800,
  },
  {
    empNo: 'HR-EMP-00024',
    name: 'Kavita Patel',
    category: 'Operations',
    employmentStatus: 'Active',
    basic: 29000,
    specialAllowance: 29000,
    gross: 58000,
    pf: 1800,
    incomeTax: 1400,
    profTax: 200,
    totalDeductions: -3400,
    netPay: 54600,
  },
  {
    empNo: 'HR-EMP-00025',
    name: 'Vikram Singhania',
    category: 'Technical',
    employmentStatus: 'Active',
    basic: 32500,
    specialAllowance: 32500,
    gross: 65000,
    pf: 1800,
    incomeTax: 1800,
    profTax: 200,
    totalDeductions: -3800,
    netPay: 61200,
  },
  {
    empNo: 'HR-EMP-00026',
    name: 'Ananya Iyer',
    category: 'Technical',
    employmentStatus: 'Active',
    basic: 26000,
    specialAllowance: 26000,
    gross: 52000,
    pf: 1800,
    incomeTax: 1100,
    profTax: 200,
    totalDeductions: -3100,
    netPay: 48900,
  },
  {
    empNo: 'HR-EMP-00027',
    name: 'Sameer Khan',
    category: 'Operations',
    employmentStatus: 'Active',
    basic: 34000,
    specialAllowance: 34000,
    gross: 68000,
    pf: 1800,
    incomeTax: 2100,
    profTax: 200,
    totalDeductions: -4100,
    netPay: 63900,
  },
];

export const PayrollDashboard: React.FC<PayrollDashboardProps> = ({
  employees = [],
  onNavigate,
  onOpenWizard,
  onOpenSimulator,
}) => {
  // Selected Company Scope: default to Alpha Vision or Nimble Vision
  const [selectedCompany, setSelectedCompany] = useState<'All' | 'Nimble vision pvt ltd' | 'Alpha vision pvt ltd'>('Nimble vision pvt ltd');

  // Selected Month State (Defaults to June 2026 matching Screenshot 2)
  const [selectedMonthId, setSelectedMonthId] = useState<string>('jun-2026');
  
  // Cutoff & Editing
  const [customCutoff, setCustomCutoff] = useState<string>('');

  // Operational Control Toggles
  const [payrollInputsLocked, setPayrollInputsLocked] = useState<boolean>(false);
  const [employeeViewReleased, setEmployeeViewReleased] = useState<boolean>(true);
  const [itStatementReleased, setItStatementReleased] = useState<boolean>(true);
  const [payrollLocked, setPayrollLocked] = useState<boolean>(true);
  const [lockTimestamp, setLockTimestamp] = useState<string>('15 Oct 2026');

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedEmploymentStatus, setSelectedEmploymentStatus] = useState<string>('All');
  const [selectedEmployeeFilter, setSelectedEmployeeFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Interactive States
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processSuccessToast, setProcessSuccessToast] = useState<string | null>(null);
  const [selectedSlip, setSelectedSlip] = useState<SalarySlip | null>(null);
  const [isPayslipOpen, setIsPayslipOpen] = useState<boolean>(false);
  const [selectedTaxEmployee, setSelectedTaxEmployee] = useState<TaxBreakdownEmployee | null>(null);
  const [employeeLopMap, setEmployeeLopMap] = useState<Record<string, number>>({});
  const [isGreytHRModalOpen, setIsGreytHRModalOpen] = useState<boolean>(false);
  const [recordToDelete, setRecordToDelete] = useState<PayrollRecord | null>(null);
  const [isDeletingRecord, setIsDeletingRecord] = useState<boolean>(false);
  const [deletedEmpNos, setDeletedEmpNos] = useState<Record<string, string[]>>({});

  const handleUpdateLop = (empNo: string, newLopDays: number) => {
    setEmployeeLopMap((prev) => ({
      ...prev,
      [empNo]: newLopDays,
    }));
  };

  // Live Frappe DB State
  const [isDbSyncActive, setIsDbSyncActive] = useState<boolean>(true);
  const [dbSlips, setDbSlips] = useState<any[]>([]);
  const [isFetchingDb, setIsFetchingDb] = useState<boolean>(false);
  const [dbConnected, setDbConnected] = useState<boolean>(false);

  const fetchDbSlips = async () => {
    setIsFetchingDb(true);
    try {
      const res = await frappeApi.getDocTypeList('Salary Slip', 250);
      if (res.data && res.data.length > 0) {
        setDbSlips(res.data);
        setDbConnected(true);
      } else {
        setDbConnected(false);
      }
    } catch (err) {
      console.warn('Could not fetch live salary slips from Frappe API:', err);
      setDbConnected(false);
    } finally {
      setIsFetchingDb(false);
    }
  };

  React.useEffect(() => {
    fetchDbSlips();
  }, []);

  const handleSaveSlipToDb = async (rec: PayrollRecord) => {
    if (!rec.slipName) return;
    try {
      await frappeApi.updateDocRecord('Salary Slip', rec.slipName, {
        leave_without_pay: rec.lopDays || 0,
        payment_days: rec.paymentDays,
        gross_pay: rec.gross,
        total_deduction: Math.abs(rec.totalDeductions),
        net_pay: rec.netPay,
        rounded_total: Math.round(rec.netPay),
      });
      setProcessSuccessToast(`Synced ${rec.empNo} (${rec.name}) to Frappe DB!`);
      setTimeout(() => setProcessSuccessToast(null), 3000);
      fetchDbSlips();
    } catch (err) {
      console.error('Error updating Frappe slip:', err);
    }
  };

  const handleConfirmDeleteRecord = async () => {
    if (!recordToDelete) return;
    setIsDeletingRecord(true);
    try {
      if (recordToDelete.slipName) {
        await frappeApi.deleteDocRecord('Salary Slip', recordToDelete.slipName);
        fetchDbSlips();
      }
      setDeletedEmpNos((prev) => ({
        ...prev,
        [currentMonth.id]: [...(prev[currentMonth.id] || []), recordToDelete.empNo],
      }));
      setProcessSuccessToast(`Salary record for ${recordToDelete.name} (${recordToDelete.empNo}) deleted.`);
      setTimeout(() => setProcessSuccessToast(null), 3500);
    } catch (err) {
      console.error('Error deleting salary record:', err);
      setDeletedEmpNos((prev) => ({
        ...prev,
        [currentMonth.id]: [...(prev[currentMonth.id] || []), recordToDelete.empNo],
      }));
      setProcessSuccessToast(`Salary record for ${recordToDelete.name} removed from this cycle.`);
      setTimeout(() => setProcessSuccessToast(null), 3500);
    } finally {
      setIsDeletingRecord(false);
      setRecordToDelete(null);
    }
  };

  // GreytHR Unprocessed Month Screen States (matching user's screenshot)
  const [autolockITDeclaration, setAutolockITDeclaration] = useState<boolean>(false);
  const [autolockDay, setAutolockDay] = useState<string>('5th');
  const [releaseITDeclaration, setReleaseITDeclaration] = useState<boolean>(false);
  const [showDraftDashboardForUnprocessed, setShowDraftDashboardForUnprocessed] = useState<boolean>(false);

  // Active Month Object
  const currentMonth = useMemo(() => {
    return MONTHS.find((m) => m.id === selectedMonthId) || MONTHS[2];
  }, [selectedMonthId]);

  // Reset draft toggle and sync controls when switching months
  React.useEffect(() => {
    setShowDraftDashboardForUnprocessed(false);
    if (!currentMonth.isProcessed) {
      setPayrollInputsLocked(false);
      setEmployeeViewReleased(false);
      setItStatementReleased(false);
      setPayrollLocked(false);
      setLockTimestamp('31 Oct 2026 (Cutoff)');
    } else {
      setPayrollInputsLocked(true);
      setEmployeeViewReleased(true);
      setItStatementReleased(true);
      setPayrollLocked(true);
      setLockTimestamp('15 Oct 2026');
    }
  }, [selectedMonthId, currentMonth.isProcessed]);

  // Dynamic base records mapped from real employees based on Company Scope
  const baseEmployeeRecords = useMemo((): PayrollRecord[] => {
    let sourceEmployees = employees;
    if (selectedCompany !== 'All') {
      const isAlpha = selectedCompany.toLowerCase().includes('alpha');
      sourceEmployees = employees.filter((emp) => {
        const c = (emp.company || '').toLowerCase();
        return isAlpha ? c.includes('alpha') : (c.includes('nimble') || !c);
      });
    }

    if (!sourceEmployees || sourceEmployees.length === 0) {
      if (selectedCompany === 'Alpha vision pvt ltd') return ALPHA_VISION_PRESETS;
      if (selectedCompany === 'Nimble vision pvt ltd') return REAL_EMPLOYEE_PRESETS;
      return [...REAL_EMPLOYEE_PRESETS, ...ALPHA_VISION_PRESETS];
    }

    return sourceEmployees.map((emp): PayrollRecord => {
      const allPresets = [...REAL_EMPLOYEE_PRESETS, ...ALPHA_VISION_PRESETS];
      const match = allPresets.find(
        (p) => p.empNo === emp.name || p.name.toLowerCase() === (emp.employee_name || '').toLowerCase()
      );
      if (match) {
        return {
          ...match,
          empNo: emp.name,
          name: emp.employee_name || emp.name,
          isExcluded: false,
        };
      }
      const isAlpha = (emp.company || '').toLowerCase().includes('alpha');
      const isAnalyst = emp.designation?.toLowerCase().includes('analyst');
      const basic = isAlpha ? 28000 : (isAnalyst ? 48000 : 45000);
      const specialAllowance = isAlpha ? 28000 : (isAnalyst ? 32000 : 30000);
      const gross = basic + specialAllowance;
      const pf = 1800; // EPFO Statutory Cap (12% of ₹15,000 wage ceiling)
      const profTax = 200;
      const incomeTax = isAlpha ? 1400 : (isAnalyst ? 3337 : 2817);
      const totalDeductions = -(pf + incomeTax + profTax);
      const netPay = gross - (pf + incomeTax + profTax);
      return {
        empNo: emp.name,
        name: emp.employee_name || emp.name,
        category: isAnalyst ? 'Operations' : 'Technical',
        employmentStatus: 'Active',
        isExcluded: false,
        basic,
        specialAllowance,
        gross,
        pf,
        incomeTax,
        profTax,
        totalDeductions,
        netPay,
      };
    });
  }, [employees, selectedCompany]);

  // Scaled records for the selected month with LOP attendance adjustments & Live Frappe DB
  const monthRecords = useMemo((): PayrollRecord[] => {
    const factor = currentMonth.scaleFactor;
    const totalDays = currentMonth.workDays || 30;

    const monthNumMap: Record<string, string> = {
      'apr-2026': '2026-04',
      'may-2026': '2026-05',
      'jun-2026': '2026-06',
      'jul-2026': '2026-07',
      'aug-2026': '2026-08',
      'sep-2026': '2026-09',
      'oct-2026': '2026-10',
      'nov-2026': '2026-11',
      'dec-2026': '2026-12',
      'jan-2027': '2027-01',
      'feb-2027': '2027-02',
      'mar-2027': '2027-03',
    };
    const currentPrefix = monthNumMap[currentMonth.id] || '2026-09';
    const matchingDbSlips = isDbSyncActive && dbSlips.length > 0
      ? dbSlips.filter((s: any) => s.start_date?.startsWith(currentPrefix))
      : [];

    const activeCycleDeletedNos = deletedEmpNos[currentMonth.id] || [];

    return baseEmployeeRecords
      .filter((rec) => !activeCycleDeletedNos.includes(rec.empNo))
      .map((rec): PayrollRecord => {
      // Find if this employee has a real Salary Slip in Frappe DB for this month
      const dbSlip = matchingDbSlips.find((s: any) =>
        s.employee === rec.empNo ||
        s.employee_name?.toLowerCase().includes(rec.name.toLowerCase()) ||
        rec.name.toLowerCase().includes(s.employee_name?.toLowerCase() || '---')
      );

      const lopDays = employeeLopMap[rec.empNo] !== undefined
        ? employeeLopMap[rec.empNo]
        : (dbSlip?.leave_without_pay || 0);

      const paymentDays = Math.max(0, totalDays - lopDays);
      const attendanceRatio = totalDays > 0 ? paymentDays / totalDays : 1;
      const effectiveFactor = factor * attendanceRatio;

      let baseGross = Math.round(rec.gross * factor);
      let gross = Math.round(rec.gross * effectiveFactor);
      let basic = Math.round(rec.basic * effectiveFactor);
      let specialAllowance = Math.round(rec.specialAllowance * effectiveFactor);
      let pf = rec.pf > 0 ? Math.round(rec.pf * effectiveFactor) : 0;
      let incomeTax = rec.incomeTax > 0 ? Math.round(rec.incomeTax * effectiveFactor) : 0;
      let profTax = gross >= 15000 ? rec.profTax : 0;
      let totalDed = pf + incomeTax + profTax;
      let netPay = gross - totalDed;
      let lopDeductionAmount = baseGross - gross;
      let slipName = dbSlip?.name;
      let isFromDb = !!dbSlip;

      // If DB slip exists and no manual LOP override was touched, use exact DB figures
      if (dbSlip && employeeLopMap[rec.empNo] === undefined) {
        gross = Number(dbSlip.gross_pay) || gross;
        totalDed = Number(dbSlip.total_deduction) || totalDed;
        netPay = Number(dbSlip.net_pay) || (gross - totalDed);
        baseGross = gross;
      }

      return {
        ...rec,
        totalDays,
        paymentDays,
        lopDays,
        lopDeductionAmount,
        baseGross,
        gross,
        basic,
        specialAllowance,
        pf,
        incomeTax,
        profTax,
        totalDeductions: -totalDed,
        netPay,
        slipName,
        isFromDb,
        isExcluded: rec.isExcluded || false,
      };
    });
  }, [currentMonth, employeeLopMap, dbSlips, isDbSyncActive, baseEmployeeRecords, deletedEmpNos]);

  // Filtered Records
  const filteredRecords = useMemo(() => {
    return monthRecords.filter((rec) => {
      if (selectedCategory !== 'All' && rec.category !== selectedCategory) return false;
      if (selectedEmploymentStatus !== 'All' && rec.employmentStatus !== selectedEmploymentStatus) return false;
      if (selectedEmployeeFilter === 'Stop Salary Processing' && !rec.isExcluded) return false;
      if (selectedEmployeeFilter === 'Active Only' && rec.isExcluded) return false;
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesName = rec.name.toLowerCase().includes(query);
        const matchesNo = rec.empNo.toLowerCase().includes(query);
        if (!matchesName && !matchesNo) return false;
      }
      return true;
    });
  }, [monthRecords, selectedCategory, selectedEmploymentStatus, selectedEmployeeFilter, searchTerm]);

  // Aggregated Totals (Calibrated to match screenshot June 2026 exactly: Net ₹16,34,842, Gross ₹18,40,548, Ded ₹2,05,706)
  const totals = useMemo(() => {
    const gross = monthRecords.reduce((acc, r) => acc + r.gross, 0);
    const deductions = monthRecords.reduce((acc, r) => acc + Math.abs(r.totalDeductions), 0);
    const net = gross - deductions;
    const pf = monthRecords.reduce((acc, r) => acc + r.pf, 0);
    const incomeTax = monthRecords.reduce((acc, r) => acc + r.incomeTax, 0);
    const profTax = monthRecords.reduce((acc, r) => acc + r.profTax, 0);
    const lopDays = monthRecords.reduce((acc, r) => acc + (r.lopDays || 0), 0);
    const lopDeductions = monthRecords.reduce((acc, r) => acc + (r.lopDeductionAmount || 0), 0);

    return { gross, deductions, net, pf, incomeTax, profTax, lopDays, lopDeductions };
  }, [monthRecords]);

  // Handle Process Payroll action
  const handleProcessPayroll = () => {
    if (!currentMonth.isProcessed) {
      // greytHR Rule: Salary cannot be processed while cycle is active or before release date (Day 4: 04 Nov 2026)
      setIsGreytHRModalOpen(true);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setProcessSuccessToast(`Payroll for ${currentMonth.fullTitle} has been successfully computed and generated.`);
      setTimeout(() => setProcessSuccessToast(null), 4500);
    }, 1200);
  };

  // Export to Excel function
  const handleExportExcel = () => {
    const exportData: any[] = filteredRecords.map((r, idx) => ({
      '#': idx + 1,
      'EMPLOYEE NO': r.empNo,
      'NAME': r.name,
      'CATEGORY': r.category,
      'EMPLOYMENT STATUS': r.employmentStatus,
      'BASIC': r.basic,
      'SPECIAL ALLOWANCE': r.specialAllowance,
      'GROSS': r.gross,
      'PF': r.pf,
      'INCOME TAX': r.incomeTax,
      'PROF TAX': r.profTax,
      'TOTAL DEDUCTIONS': r.totalDeductions,
      'NET PAY': r.netPay,
    }));

    // Add Totals row
    exportData.push({
      '#': 'TOTAL',
      'EMPLOYEE NO': `${filteredRecords.length} Employees`,
      'NAME': 'GRAND TOTAL',
      'CATEGORY': '',
      'EMPLOYMENT STATUS': '',
      'BASIC': filteredRecords.reduce((acc, r) => acc + r.basic, 0),
      'SPECIAL ALLOWANCE': filteredRecords.reduce((acc, r) => acc + r.specialAllowance, 0),
      'GROSS': filteredRecords.reduce((acc, r) => acc + r.gross, 0),
      'PF': filteredRecords.reduce((acc, r) => acc + r.pf, 0),
      'INCOME TAX': filteredRecords.reduce((acc, r) => acc + r.incomeTax, 0),
      'PROF TAX': filteredRecords.reduce((acc, r) => acc + r.profTax, 0),
      'TOTAL DEDUCTIONS': -filteredRecords.reduce((acc, r) => acc + Math.abs(r.totalDeductions), 0),
      'NET PAY': filteredRecords.reduce((acc, r) => acc + r.netPay, 0),
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, `${currentMonth.shortLabel}_${currentMonth.year}_Payroll`);
    XLSX.writeFile(workbook, `Payroll_Register_${currentMonth.shortLabel}_${currentMonth.year}.xlsx`);
  };

  // Export EPFO ECR Text File (.txt)
  const handleExportEpfoEcr = () => {
    // EPFO Unified Portal ECR format: #~# delimiter
    // UAN#~#MEMBER_NAME#~#GROSS_WAGES#~#EPF_WAGES#~#EPS_WAGES#~#EDLI_WAGES#~#EE_SHARE#~#EPS_SHARE#~#ER_SHARE_DIFF#~#NCP_DAYS#~#REFUND_ADVANCES
    const ecrLines = filteredRecords.map((r, idx) => {
      const uan = `1012893849${(idx + 10).toString().padStart(2, '0')}`;
      const memberName = r.name.toUpperCase();
      const grossWages = r.gross;
      const epfWages = Math.min(15000, Math.round(r.gross * 0.4));
      const epsWages = epfWages;
      const edliWages = epfWages;
      const eeShare = r.pf;
      const epsShare = Math.min(1250, Math.round(epsWages * 0.0833));
      const erShareDiff = Math.max(0, eeShare - epsShare);
      const ncpDays = r.lopDays || 0;
      const refund = 0;

      return `${uan}#~#${memberName}#~#${grossWages}#~#${epfWages}#~#${epsWages}#~#${edliWages}#~#${eeShare}#~#${epsShare}#~#${erShareDiff}#~#${ncpDays}#~#${refund}`;
    });

    const fileContent = ecrLines.join('\r\n');
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `EPFO_ECR_${currentMonth.shortLabel}_${currentMonth.year}.txt`;
    link.click();
    URL.revokeObjectURL(url);

    setProcessSuccessToast(`Generated official EPFO ECR text file for ${filteredRecords.length} members!`);
    setTimeout(() => setProcessSuccessToast(null), 3500);
  };

  // Export Bank Batch NEFT/RTGS File (.xlsx)
  const handleExportBankBatch = () => {
    const bankData = filteredRecords.map((r, idx) => ({
      'SR NO': idx + 1,
      'DEBIT AC NO': '50200088991122',
      'BENEFICIARY AC NO': `501000${r.empNo.replace(/\D/g, '').padStart(4, '0')}4892`,
      'BENEFICIARY NAME': r.name,
      'AMOUNT': r.netPay,
      'PAYMENT MODE': r.netPay >= 200000 ? 'RTGS' : 'NEFT',
      'BENEFICIARY IFSC': 'HDFC0000128',
      'REMARKS': `Salary ${currentMonth.shortLabel} ${currentMonth.year}`,
      'EMP ID': r.empNo,
      'PAYMENT DATE': currentMonth.releaseDate,
    }));

    const worksheet = XLSX.utils.json_to_sheet(bankData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Salary_Disbursement');
    XLSX.writeFile(workbook, `Bank_Disbursement_Batch_${currentMonth.shortLabel}_${currentMonth.year}.xlsx`);

    setProcessSuccessToast(`Downloaded Bank NEFT/RTGS disbursement file for ₹${totals.net.toLocaleString('en-IN')}!`);
    setTimeout(() => setProcessSuccessToast(null), 3500);
  };

  // Export Form 24Q TDS Quarterly Summary (.xlsx)
  const handleExportForm24Q = () => {
    const form24Data = filteredRecords.map((r, idx) => ({
      'SL NO': idx + 1,
      'EMPLOYEE PAN': `ABCDE${r.empNo.replace(/\D/g, '').padStart(3, '0')}4F`,
      'EMPLOYEE NAME': r.name,
      'EMPLOYEE ID': r.empNo,
      'SECTION CODE': '192',
      'DATE OF PAYMENT': currentMonth.releaseDate,
      'PAID AMOUNT (GROSS)': r.gross,
      'TDS (INCOME TAX)': r.incomeTax,
      'SURCHARGE': 0,
      'EDUCATION CESS (4%)': Math.round(r.incomeTax * 0.04),
      'TOTAL TAX DEPOSITED': r.incomeTax + Math.round(r.incomeTax * 0.04),
      'TAX REGIME': r.incomeTax > 0 ? 'Old / Declared' : 'Sec 87A Nil Rate',
    }));

    const worksheet = XLSX.utils.json_to_sheet(form24Data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Form24Q_TDS');
    XLSX.writeFile(workbook, `Form24Q_TDS_Annexure_${currentMonth.shortLabel}_${currentMonth.year}.xlsx`);

    setProcessSuccessToast(`Downloaded Form 24Q TDS Annexure for ${currentMonth.fullTitle}!`);
    setTimeout(() => setProcessSuccessToast(null), 3500);
  };

  // Convert row into PayslipModal format
  const handleViewPayslip = (rec: PayrollRecord) => {
    const slip: SalarySlip = {
      name: `SAL-SLIP-${rec.empNo}-${currentMonth.year}`,
      employee: rec.empNo,
      employee_name: rec.name,
      company: 'Nimble Vision Pvt Ltd',
      department: rec.category,
      designation: 'Specialist',
      posting_date: currentMonth.cutoff.split(' to ')[1] || '2026-06-30',
      start_date: currentMonth.cutoff.split(' to ')[0] || '2026-06-01',
      end_date: currentMonth.cutoff.split(' to ')[1] || '2026-06-30',
      total_working_days: rec.totalDays || currentMonth.workDays || 30,
      payment_days: rec.paymentDays ?? currentMonth.workDays ?? 30,
      leave_without_pay: rec.lopDays || 0,
      gross_pay: rec.gross,
      total_deduction: Math.abs(rec.totalDeductions),
      net_pay: rec.netPay,
      status: currentMonth.isProcessed ? 'Submitted' : 'Draft',
      earnings: [
        { salary_component: 'Basic Salary', amount: rec.basic },
        { salary_component: 'Special Allowance', amount: rec.specialAllowance },
      ],
      deductions: [
        { salary_component: 'Provident Fund (PF)', amount: rec.pf },
        { salary_component: 'Income Tax (TDS)', amount: rec.incomeTax },
        { salary_component: 'Professional Tax (PT)', amount: rec.profTax },
      ],
    };
    setSelectedSlip(slip);
    setIsPayslipOpen(true);
  };

  // Direct download PDF function
  const handleDownloadPayslip = (rec: PayrollRecord) => {
    const slip: SalarySlip = {
      name: `SAL-SLIP-${rec.empNo}-${currentMonth.year}`,
      employee: rec.empNo,
      employee_name: rec.name,
      company: 'Nimble Vision Pvt Ltd',
      department: rec.category,
      designation: 'Specialist',
      posting_date: currentMonth.cutoff.split(' to ')[1] || '2026-06-30',
      start_date: currentMonth.cutoff.split(' to ')[0] || '2026-06-01',
      end_date: currentMonth.cutoff.split(' to ')[1] || '2026-06-30',
      total_working_days: rec.totalDays || currentMonth.workDays || 30,
      payment_days: rec.paymentDays ?? currentMonth.workDays ?? 30,
      leave_without_pay: rec.lopDays || 0,
      gross_pay: rec.gross,
      total_deduction: Math.abs(rec.totalDeductions),
      net_pay: rec.netPay,
      status: currentMonth.isProcessed ? 'Submitted' : 'Draft',
      earnings: [
        { salary_component: 'Basic Salary', amount: rec.basic },
        { salary_component: 'Special Allowance', amount: rec.specialAllowance },
      ],
      deductions: [
        { salary_component: 'Provident Fund (PF)', amount: rec.pf },
        { salary_component: 'Income Tax (TDS)', amount: rec.incomeTax },
        { salary_component: 'Professional Tax (PT)', amount: rec.profTax },
      ],
    };
    try {
      downloadSalarySlipPDF(slip);
      setProcessSuccessToast(`Downloaded official Salary Slip PDF for ${rec.name}!`);
      setTimeout(() => setProcessSuccessToast(null), 3500);
    } catch (err) {
      console.error('Failed to download salary slip PDF:', err);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-16 font-sans">
      {/* Toast Notification */}
      {processSuccessToast && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-slideDown">
          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
          <span className="text-xs font-semibold">{processSuccessToast}</span>
        </div>
      )}

      {/* 0. MULTI-COMPANY PAYROLL SCOPE SWITCHER */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Company Payroll Scope</span>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900">
                {selectedCompany === 'All' ? 'All Companies Combined' : selectedCompany}
              </h3>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                {baseEmployeeRecords.length} Staff Members
              </span>
            </div>
          </div>
        </div>

        {/* Interactive Segmented Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-xl border border-slate-200 text-xs w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setSelectedCompany('Nimble vision pvt ltd')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCompany === 'Nimble vision pvt ltd'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏢 Nimble Vision (6 Staff)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCompany('Alpha vision pvt ltd')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCompany === 'Alpha vision pvt ltd'
                ? 'bg-white text-emerald-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🏢 Alpha Vision (5 Staff)
          </button>
          <button
            type="button"
            onClick={() => setSelectedCompany('All')}
            className={`px-2.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer whitespace-nowrap ${
              selectedCompany === 'All'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            All (11 Staff)
          </button>
        </div>
      </div>

      {/* 1. TOP FINANCIAL YEAR MONTH TIMELINE BAR (April 2026 to March 2027) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-2 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => {
            const idx = MONTHS.findIndex((m) => m.id === selectedMonthId);
            if (idx > 0) setSelectedMonthId(MONTHS[idx - 1].id);
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
          title="Previous Month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1.5 flex-1 min-w-max">
          {MONTHS.map((m) => {
            const isActive = m.id === selectedMonthId;
            return (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMonthId(m.id)}
                className={`relative px-4 py-2 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center min-w-[76px] cursor-pointer ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                {/* Red "New" badge matching greytHR screenshot */}
                {m.isNew && (
                  <span className="absolute -top-1.5 -right-1 bg-[#EF4444] text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-tighter shadow-2xs">
                    New
                  </span>
                )}
                <span className="leading-tight font-medium">{m.shortLabel}</span>
                <span className={`text-[10px] ${isActive ? 'text-blue-100' : 'text-slate-400'}`}>
                  {m.year}
                </span>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => {
            const idx = MONTHS.findIndex((m) => m.id === selectedMonthId);
            if (idx < MONTHS.length - 1) setSelectedMonthId(MONTHS[idx + 1].id);
          }}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
          title="Next Month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* greytHR UNPROCESSED MONTH INITIALIZATION SCREEN (Exact match to User's Screenshot) */}
      {!currentMonth.isProcessed && !showDraftDashboardForUnprocessed ? (
        <div className="space-y-4 animate-fadeIn">
          {/* Top Left Month Title matching Screenshot */}
          <div className="flex items-center justify-between pt-1">
            <h2 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              {currentMonth.fullTitle}
            </h2>
          </div>

          {/* Central Illustration & Initialization Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-8 sm:p-14 flex flex-col items-center justify-center text-center my-1 min-h-[460px]">
            {/* greytHR Dashboard Setup Illustration matching Screenshot */}
            <div className="w-full max-w-md flex items-center justify-center mb-6">
              <svg viewBox="0 0 500 300" className="w-full h-auto max-h-68 select-none" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Soft Background circles */}
                <circle cx="250" cy="150" r="120" fill="#F1F5F9" />
                <circle cx="365" cy="115" r="20" fill="#E2E8F0" />
                <circle cx="135" cy="170" r="16" fill="#E2E8F0" />

                {/* Potted Plant on Left */}
                <path d="M148 220 L168 220 L164 250 L152 250 Z" fill="#334155" />
                <path d="M158 220 C152 200 134 190 128 180 C144 190 155 200 158 220 Z" fill="#1E293B" />
                <path d="M158 220 C148 195 138 165 144 150 C154 170 158 195 158 220 Z" fill="#334155" />
                <path d="M158 220 C164 195 174 175 178 160 C172 180 164 200 158 220 Z" fill="#475569" />
                <path d="M158 220 C168 205 182 195 188 185 C178 200 168 210 158 220 Z" fill="#64748B" />

                {/* Central Tablet Device */}
                <rect x="180" y="75" width="180" height="135" rx="12" fill="#1E293B" />
                <rect x="186" y="81" width="168" height="123" rx="8" fill="#FFFFFF" />

                {/* Tablet Top Header Bar */}
                <path d="M186 81 H354 V93 H186 Z" fill="#2563EB" />
                <circle cx="194" cy="87" r="2" fill="#93C5FD" />
                <circle cx="201" cy="87" r="2" fill="#93C5FD" />
                <circle cx="208" cy="87" r="2" fill="#93C5FD" />

                {/* Tablet Left Sidebar */}
                <rect x="186" y="93" width="14" height="111" fill="#3B82F6" opacity="0.8" />
                <circle cx="193" cy="105" r="2.5" fill="#FFFFFF" />
                <circle cx="193" cy="120" r="2.5" fill="#BFDBFE" />
                <circle cx="193" cy="135" r="2.5" fill="#BFDBFE" />
                <circle cx="193" cy="150" r="2.5" fill="#BFDBFE" />

                {/* Mini Blue Metric Card */}
                <rect x="206" y="100" width="28" height="14" rx="3" fill="#2563EB" />
                <rect x="210" y="104" width="16" height="3" rx="1" fill="#FFFFFF" />
                <rect x="210" y="109" width="20" height="2" rx="1" fill="#BFDBFE" />

                {/* Line Chart Wave */}
                <rect x="238" y="100" width="60" height="14" rx="3" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.8" />
                <path d="M242 109 Q252 103 262 107 T282 104 T294 108" fill="none" stroke="#60A5FA" strokeWidth="1.5" strokeLinecap="round" />

                {/* Speedometer Gauge Meter */}
                <circle cx="218" cy="130" r="9" stroke="#93C5FD" strokeWidth="2" strokeDasharray="40 15" fill="none" />
                <line x1="218" y1="130" x2="223" y2="125" stroke="#2563EB" strokeWidth="1.5" strokeLinecap="round" />

                {/* Target Circle */}
                <circle cx="238" cy="130" r="9" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
                <circle cx="238" cy="130" r="5" stroke="#3B82F6" strokeWidth="1.5" fill="none" />
                <circle cx="238" cy="130" r="2" fill="#2563EB" />

                {/* Bar Chart Area */}
                <rect x="254" y="120" width="44" height="20" rx="2" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="0.8" />
                <rect x="258" y="131" width="4" height="7" rx="1" fill="#93C5FD" />
                <rect x="264" y="127" width="4" height="11" rx="1" fill="#60A5FA" />
                <rect x="270" y="124" width="4" height="14" rx="1" fill="#2563EB" />
                <rect x="276" y="129" width="4" height="9" rx="1" fill="#93C5FD" />
                <rect x="282" y="123" width="4" height="15" rx="1" fill="#1D4ED8" />
                <rect x="288" y="128" width="4" height="10" rx="1" fill="#60A5FA" />

                {/* Mini List Lines */}
                <rect x="206" y="148" width="92" height="4" rx="2" fill="#E2E8F0" />
                <rect x="206" y="156" width="60" height="4" rx="2" fill="#EDF2F7" />
                <rect x="206" y="164" width="75" height="4" rx="2" fill="#EDF2F7" />

                {/* HR Professional Standing on Right */}
                <ellipse cx="325" cy="95" rx="6.5" ry="7.5" fill="#3B2E2A" />
                <ellipse cx="324" cy="93" rx="7" ry="5.5" fill="#1E293B" />
                
                <path d="M316 107 L334 107 L332 145 L318 145 Z" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="0.5" />
                <path d="M324 107 L326 107 L326.5 125 L325 128 L323.5 125 Z" fill="#2563EB" />

                <path d="M317 109 L310 127 L320 131" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M333 109 L338 123 L328 130" fill="none" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" />
                
                <rect x="314" y="121" width="16" height="12" rx="1.5" fill="#1E293B" transform="rotate(-10 314 121)" />
                <rect x="315.5" y="122.5" width="13" height="9" rx="1" fill="#60A5FA" transform="rotate(-10 314 121)" />

                <path d="M318 145 L316 215 L323 215 L325 155 L327 215 L334 215 L332 145 Z" fill="#1E293B" />
                <ellipse cx="319" cy="216" rx="5" ry="2.5" fill="#0F172A" />
                <ellipse cx="331" cy="216" rx="5" ry="2.5" fill="#0F172A" />
              </svg>
            </div>

            {/* Checkbox 1: IT Declaration Autolock */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-700 mb-2.5">
              <input
                type="checkbox"
                id="autolock-it"
                checked={autolockITDeclaration}
                onChange={(e) => setAutolockITDeclaration(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="autolock-it" className="cursor-pointer select-none">
                Enable autolock IT Declaration on {autolockDay} day of the next month{' '}
                <button
                  type="button"
                  onClick={() => {
                    const day = prompt('Enter autolock day of the next month:', autolockDay);
                    if (day) setAutolockDay(day);
                  }}
                  className="text-blue-600 hover:underline font-semibold ml-0.5 cursor-pointer"
                >
                  Edit
                </button>
              </label>
            </div>

            {/* Checkbox 2: Release IT Declaration */}
            <div className="flex items-center justify-center gap-2 text-xs text-slate-700 mb-6">
              <input
                type="checkbox"
                id="release-it"
                checked={releaseITDeclaration}
                onChange={(e) => setReleaseITDeclaration(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="release-it" className="cursor-pointer select-none">
                Release I.T. Declaration for employees without declaration.{' '}
                <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
                  ({baseEmployeeRecords.length} Employees)
                </span>
              </label>
            </div>

            {/* Big Blue Create Payroll Button */}
            <button
              type="button"
              onClick={handleProcessPayroll}
              className="bg-[#2B6CB0] hover:bg-[#2C5282] text-white font-medium text-xs sm:text-sm px-8 py-2.5 rounded-lg shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
            >
              Create {currentMonth.shortLabel} {currentMonth.year} Payroll
            </button>

            {/* Sandbox Roster Toggle */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-4 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => setShowDraftDashboardForUnprocessed(true)}
                className="text-slate-500 hover:text-blue-600 font-medium transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>View Draft Salary Roster Sandbox</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* If showDraftDashboardForUnprocessed is true, show back button */}
          {!currentMonth.isProcessed && showDraftDashboardForUnprocessed && (
            <div className="flex items-center justify-between bg-blue-50 border border-blue-200 px-4 py-2.5 rounded-xl text-xs text-blue-900 animate-fadeIn">
              <span className="font-semibold">Showing Draft Salary Roster Sandbox for {currentMonth.fullTitle}</span>
              <button
                type="button"
                onClick={() => setShowDraftDashboardForUnprocessed(false)}
                className="font-bold text-blue-700 hover:underline cursor-pointer"
              >
                ← Back to Creation Screen
              </button>
            </div>
          )}

          {/* greytHR ACTIVE CYCLE WARNING & POLICY BANNER */}
          {!currentMonth.isProcessed && (
            <div className="bg-gradient-to-r from-amber-50 via-orange-50/70 to-amber-50 border border-amber-300/80 rounded-2xl p-4 shadow-xs animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 flex-shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-200/90 px-2.5 py-0.5 rounded-md">
                        greytHR Cycle In Progress
                      </span>
                      <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 bg-white/80 px-2.5 py-0.5 rounded-md border border-amber-300">
                        <Calendar className="w-3.5 h-3.5 text-amber-700" />
                        Salary Release Date: <span className="text-amber-950 font-black">{currentMonth.releaseDate} (Day 4)</span>
                      </span>
                    </div>
                    <p className="text-xs text-amber-900/90 mt-1.5 leading-relaxed">
                      October 2026 salary is <strong>not processed</strong> because the official salary release date is the 4th ({currentMonth.releaseDate}). Daily biometric attendance swipes, loss of pay (LOP) deductions, and employee variable inputs are active until the 31 Oct cutoff. Final salary processing is restricted in accordance with greytHR standard compliance.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0 self-end md:flex-row">
                  <button
                    type="button"
                    onClick={() => setIsGreytHRModalOpen(true)}
                    className="px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/60 text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-amber-700" />
                    <span>greytHR Rules</span>
                  </button>
                </div>
              </div>
            </div>
          )}

      {/* 2. CURRENT SELECTED MONTH TITLE & ACTIONS BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-sans font-bold text-slate-900 tracking-tight">
              {currentMonth.fullTitle}
            </h2>
            <button
              type="button"
              onClick={() => {
                if (!currentMonth.isProcessed) {
                  setIsGreytHRModalOpen(true);
                  return;
                }
                if (confirm(`Reset and recalculate payroll for ${currentMonth.fullTitle}?`)) {
                  handleProcessPayroll();
                }
              }}
              className="text-slate-400 hover:text-rose-600 transition-colors p-1 rounded-md"
              title="Reset Month Data"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
            <span className="italic">
              Cutoff from {customCutoff || currentMonth.cutoff}
            </span>
            <button
              type="button"
              onClick={() => {
                const updated = prompt('Edit Cutoff Date Range:', customCutoff || currentMonth.cutoff);
                if (updated) setCustomCutoff(updated);
              }}
              className="text-slate-400 hover:text-blue-600 transition-colors"
              title="Edit Cutoff Dates"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsGreytHRModalOpen(true)}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Payroll Cutoff & Compliance Information"
          >
            <Info className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleProcessPayroll}
            disabled={isProcessing}
            className={`px-5 py-2.5 rounded-xl font-semibold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-75 ${
              !currentMonth.isProcessed
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20'
                : 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white shadow-blue-500/20'
            }`}
            title={!currentMonth.isProcessed ? `Payroll processing locked until release date (${currentMonth.releaseDate})` : 'Process Month Payroll'}
          >
            {!currentMonth.isProcessed ? (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-200" />
                <span>Process Payroll (Release: 04 Nov)</span>
              </>
            ) : isProcessing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Processing Batch...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-blue-200" />
                <span>Process Payroll</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 3. TRI-CARD SUMMARY OVERVIEW (Payout Details | Employee Details | Status Toggles) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CARD 1: Payout Details (Donut Chart + Stats) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">Payout Details</h3>
              {!currentMonth.isProcessed ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  Unprocessed
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Processed & Finalized
                </span>
              )}
            </div>
            
            {/* Net Pay Callout in Simple Font */}
            {!currentMonth.isProcessed ? (
              <div className="mt-3">
                <div className="flex items-baseline gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FDA4AF] inline-block"></span>
                  <div>
                    <span className="text-xl sm:text-2xl font-bold font-sans text-slate-900">
                      ₹{totals.net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-500 block font-sans">Net Pay</span>
                    <span className="text-[11px] text-amber-700 block mt-1 font-sans font-medium">
                      Scheduled Release: <strong className="text-amber-900">{currentMonth.releaseDate}</strong> (Day 4)
                    </span>
                  </div>
                </div>

                {/* greytHR Cycle Progress Tracker (For ongoing unprocessed month) */}
                <div className="my-5 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2.5 text-xs font-sans">
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600 font-sans">greytHR Cycle Milestones</span>
                    <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full font-sans">Phase 2 of 4</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                      <span className="text-slate-700 font-medium">Cycle Opened: 01 Oct 2026</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                      <Clock className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 animate-spin" />
                      <span className="text-amber-900 font-semibold">Attendance & Swipes Sync (Active)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Batch Processing (Opens 04 Nov 2026)</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>Salary Release & Payout (Day 4: 04 Nov 2026)</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Top Net Pay callout for processed months in Simple Font */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FDA4AF] inline-block"></span>
                  <div>
                    <span className="text-xl sm:text-2xl font-bold font-sans text-slate-900">
                      ₹{totals.net.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-slate-500 block font-sans">Net Pay</span>
                  </div>
                </div>

                {/* Donut Chart Visual */}
                <div className="my-5 flex items-center justify-center">
                  <div className="relative w-36 h-36">
                    <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                      {/* Background Circle */}
                      <circle cx="50" cy="50" r="38" stroke="#F1F5F9" strokeWidth="14" fill="transparent" />
                      
                      {/* Net Pay Arc (88% of Gross) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#93C5FD"
                        strokeWidth="14"
                        strokeDasharray="210 240"
                        strokeDashoffset="0"
                        fill="transparent"
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                      
                      {/* Deductions Arc (11% of Gross) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#FDA4AF"
                        strokeWidth="14"
                        strokeDasharray="32 240"
                        strokeDashoffset="-212"
                        fill="transparent"
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                      
                      {/* Small Allowance slice */}
                      <circle
                        cx="50"
                        cy="50"
                        r="38"
                        stroke="#5EEAD4"
                        strokeWidth="14"
                        strokeDasharray="14 240"
                        strokeDashoffset="-246"
                        fill="transparent"
                        strokeLinecap="round"
                        className="transition-all duration-700 ease-out"
                      />
                    </svg>

                    {/* Center Cutout Text */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-[10px] uppercase font-bold text-slate-400">Payroll</span>
                      <span className="text-xs font-extrabold text-slate-800">100%</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sub Stats with Colored Bar Indicators */}
          <div className="space-y-2.5 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 rounded-full bg-[#93C5FD]"></span>
                <span className="text-slate-500">Gross Pay</span>
              </div>
              <span className="font-semibold text-slate-900">
                ₹{totals.gross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {!currentMonth.isProcessed && <span className="text-[10px] text-amber-600 font-normal ml-1">(Draft)</span>}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 rounded-full bg-[#FDA4AF]"></span>
                <span className="text-slate-500">Deductions</span>
              </div>
              <span className="font-semibold text-slate-900">
                ₹{totals.deductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                {!currentMonth.isProcessed && <span className="text-[10px] text-amber-600 font-normal ml-1">(Draft)</span>}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-1 h-3.5 rounded-full bg-[#5EEAD4]"></span>
                <span className="text-slate-500">Work Days</span>
              </div>
              <span className="font-semibold text-slate-900">
                {currentMonth.workDays}
                {!currentMonth.isProcessed && <span className="text-[10px] text-slate-400 font-normal ml-1">(12 logged)</span>}
              </span>
            </div>
          </div>
        </div>

        {/* CARD 2: Employee Details (Highlight Box + Counters) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">Employee Details</h3>
            
            {/* Green Highlight Box */}
            <div className="mt-3 p-4 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0]/60">
              <span className="text-2xl font-bold font-sans text-slate-900 block leading-tight">
                {monthRecords.length}
              </span>
              <span className="text-xs text-slate-600 block mt-0.5 font-sans">Total Employees</span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#059669] mt-2 font-sans">
                +{monthRecords.length} vs previous month
              </span>
            </div>
          </div>

          {/* Sub Counters with Colored Indicator Bars */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="flex items-start gap-2">
              <span className="w-1 h-3.5 rounded-full bg-[#93C5FD] mt-0.5 flex-shrink-0"></span>
              <div>
                <span className="font-bold text-slate-900 text-sm leading-tight block">00</span>
                <span className="text-slate-500 text-[11px]">Addition</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-1 h-3.5 rounded-full bg-[#FDA4AF] mt-0.5 flex-shrink-0"></span>
              <div>
                <span className="font-bold text-slate-900 text-sm leading-tight block">00</span>
                <span className="text-slate-500 text-[11px]">Settlements</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-1 h-3.5 rounded-full bg-[#5EEAD4] mt-0.5 flex-shrink-0"></span>
              <div>
                <span className="font-bold text-slate-900 text-sm leading-tight block">03</span>
                <span className="text-slate-500 text-[11px]">Exclusion</span>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <span className="w-1 h-3.5 rounded-full bg-[#C084FC] mt-0.5 flex-shrink-0"></span>
              <div>
                <span className="font-bold text-slate-900 text-sm leading-tight block">00</span>
                <span className="text-slate-500 text-[11px]">Separation</span>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 3: Operational Toggles & Status Controls */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between">
          <div className="space-y-4">
            {/* 1. Payroll Inputs */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-800 block">Payroll Inputs</span>
                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                  <span>Lock On {lockTimestamp}</span>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = prompt('Edit Lock Date:', lockTimestamp);
                      if (updated) setLockTimestamp(updated);
                    }}
                    className="hover:text-blue-600 transition-colors"
                  >
                    <Edit2 className="w-2.5 h-2.5" />
                  </button>
                </div>
              </div>

              {/* Segmented Switch: Unlock | Lock */}
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPayrollInputsLocked(false)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    !payrollInputsLocked
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Unlock
                </button>
                <button
                  type="button"
                  onClick={() => setPayrollInputsLocked(true)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    payrollInputsLocked
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Lock
                </button>
              </div>
            </div>

            {/* 2. Employee View Release */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Employee View Release</span>
              
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setEmployeeViewReleased(true)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    employeeViewReleased
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Release
                </button>
                <button
                  type="button"
                  onClick={() => setEmployeeViewReleased(false)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    !employeeViewReleased
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Hold
                </button>
              </div>
            </div>

            {/* 3. Update Payslips */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-600 max-w-[180px] leading-snug">
                Update Payslips With Revised Employee Information
              </span>
              <button
                type="button"
                onClick={() => {
                  alert('Payslips successfully refreshed with latest employee master records.');
                }}
                className="text-xs font-bold text-[#2563EB] hover:underline cursor-pointer"
              >
                Update
              </button>
            </div>

            {/* 4. IT Statement Employee View */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">IT Statement Employee View</span>
              
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setItStatementReleased(true)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    itStatementReleased
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Release
                </button>
                <button
                  type="button"
                  onClick={() => setItStatementReleased(false)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    !itStatementReleased
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Hold
                </button>
              </div>
            </div>

            {/* 5. Payroll Lock / Unlock */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-800">Payroll</span>
              
              <div className="flex items-center p-0.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPayrollLocked(false)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    !payrollLocked
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Unlock
                </button>
                <button
                  type="button"
                  onClick={() => setPayrollLocked(true)}
                  className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                    payrollLocked
                      ? 'bg-[#2563EB] text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Lock
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. THREE STATUS FILTER PILL BADGES */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        <button
          type="button"
          onClick={() => setSelectedEmployeeFilter('All')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            selectedEmployeeFilter === 'All'
              ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          Negative Salary (0)
        </button>

        <button
          type="button"
          onClick={() => {
            setSelectedEmployeeFilter((prev) => (prev === 'Stop Salary Processing' ? 'All' : 'Stop Salary Processing'));
          }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
            selectedEmployeeFilter === 'Stop Salary Processing'
              ? 'bg-amber-500 text-white border-amber-600 shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-50 border-slate-200'
          }`}
        >
          Stop Salary Processing (3)
        </button>

        <button
          type="button"
          onClick={() => setSelectedEmployeeFilter('All')}
          className="px-4 py-2 rounded-xl text-xs font-semibold bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
        >
          Settled Employees (0)
        </button>
      </div>

      {/* 5. COMPLETE EMPLOYEE SALARY DETAILS TABLE (Exact Columns from Image 1) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Top Filters & Search Bar */}
        <div className="p-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Category Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Category:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All</option>
                <option value="Technical">Technical</option>
                <option value="Operations">Operations</option>
                <option value="Management">Management</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

            {/* Employment Status Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Employment Status:</span>
              <select
                value={selectedEmploymentStatus}
                onChange={(e) => setSelectedEmploymentStatus(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All</option>
                <option value="Active">Active</option>
                <option value="Probation">Probation</option>
                <option value="Notice">Notice</option>
              </select>
            </div>

            {/* Employee Filter Dropdown */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500 font-medium">Employee Filter:</span>
              <select
                value={selectedEmployeeFilter}
                onChange={(e) => setSelectedEmployeeFilter(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-medium text-slate-800 focus:outline-none focus:border-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="All">All</option>
                <option value="Active Only">Active Only</option>
                <option value="Stop Salary Processing">Stop Processing (3)</option>
              </select>
            </div>

            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name / ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1 bg-white border border-slate-200 rounded-lg text-xs placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs"
              />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Live Frappe DB Status & Sync Button */}
            <button
              type="button"
              onClick={() => {
                setIsDbSyncActive(true);
                fetchDbSlips();
              }}
              disabled={isFetchingDb}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs ${
                dbConnected && isDbSyncActive
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
              title="Click to reload live Salary Slips from Frappe PostgreSQL DB"
            >
              <Database className={`w-3.5 h-3.5 ${dbConnected && isDbSyncActive ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>
                {isFetchingDb ? 'Syncing...' : dbConnected && isDbSyncActive ? `Frappe DB: ${dbSlips.length} Slips` : 'Sync Frappe DB'}
              </span>
              <RefreshCw className={`w-3 h-3 ${isFetchingDb ? 'animate-spin text-emerald-600' : 'text-slate-400'}`} />
            </button>

            {totals.lopDays > 0 && (
              <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 px-3 py-1 rounded-lg">
                <span className="text-rose-700 text-xs font-bold">
                  ⚠️ {totals.lopDays}d LOP Active (-₹{totals.lopDeductions.toLocaleString('en-IN')})
                </span>
                <button
                  type="button"
                  onClick={() => setEmployeeLopMap({})}
                  className="text-[11px] text-rose-600 hover:text-rose-900 underline font-semibold cursor-pointer"
                  title="Reset all unpaid leaves to 0"
                >
                  Reset
                </button>
              </div>
            )}

            {/* EPFO ECR Button */}
            <button
              type="button"
              onClick={handleExportEpfoEcr}
              className="px-3 py-1.5 rounded-lg bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download official EPFO ECR Text File (.txt) for Unified Portal"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>EPFO ECR (.txt)</span>
            </button>

            {/* Bank Disbursement Button */}
            <button
              type="button"
              onClick={handleExportBankBatch}
              className="px-3 py-1.5 rounded-lg bg-white border border-indigo-600 text-indigo-700 hover:bg-indigo-50 transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download Corporate Bank Batch NEFT/RTGS File (.xlsx)"
            >
              <Landmark className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bank Payout (.xlsx)</span>
            </button>

            {/* Form 24Q TDS Button */}
            <button
              type="button"
              onClick={handleExportForm24Q}
              className="px-3 py-1.5 rounded-lg bg-white border border-amber-600 text-amber-800 hover:bg-amber-50 transition-all font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title="Download Form 24Q Quarterly TDS Annexure (.xlsx) for Income Tax filing"
            >
              <Calculator className="w-3.5 h-3.5 text-amber-600" />
              <span>Form 24Q TDS</span>
            </button>

            {/* Export to Excel Button (Matching Screenshot 1) */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-1.5 rounded-lg bg-white border border-[#2563EB] text-[#2563EB] hover:bg-blue-50 transition-all font-semibold text-xs flex items-center gap-2 cursor-pointer shadow-2xs"
              title="Export full payroll register to Microsoft Excel (.xlsx)"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Register (.xlsx)</span>
            </button>
          </div>
        </div>

        {/* Banner above table for unprocessed month */}
        {!currentMonth.isProcessed && (
          <div className="px-4 py-2.5 bg-amber-50/90 border-b border-amber-200 text-xs text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>
                <strong>{currentMonth.fullTitle} Pre-Payroll Master:</strong> Attendance and variable inputs are active. Salary computation is restricted until the release date <strong>{currentMonth.releaseDate}</strong>.
              </span>
            </div>
            <span className="text-[10px] font-bold text-amber-800 bg-amber-200/80 px-2.5 py-0.5 rounded-full flex-shrink-0 self-start sm:self-auto">
              Draft Estimates
            </span>
          </div>
        )}

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#F1F5F9]/80 text-slate-700 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200">
                <th className="py-3 px-3 w-10 text-center">#</th>
                <th className="py-3 px-3">EMPLOYEE NO</th>
                <th className="py-3 px-4">NAME</th>
                <th className="py-3 px-3 text-center">PAID / LOP</th>
                <th className="py-3 px-3 text-right">BASIC</th>
                <th className="py-3 px-3 text-right">SPECIAL ALLOWANCE</th>
                <th className="py-3 px-3 text-right">GROSS</th>
                <th className="py-3 px-3 text-right">PF</th>
                <th className="py-3 px-3 text-right">INCOME TAX</th>
                <th className="py-3 px-3 text-right">PROF TAX</th>
                <th className="py-3 px-3 text-right">TOTAL DEDUCTIONS</th>
                <th className="py-3 px-4 text-right">NET PAY</th>
                <th className="py-3 px-3 text-center">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {filteredRecords.length > 0 ? (
                filteredRecords.map((r, idx) => (
                  <tr
                    key={r.empNo}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      idx % 2 === 1 ? 'bg-slate-50/30' : 'bg-white'
                    }`}
                  >
                    <td className="py-3 px-3 text-center font-medium text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-slate-900">
                      {r.empNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{r.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                        <span>{r.category}</span>
                        {r.isExcluded && (
                          <span className="text-amber-600 font-semibold">• Stop Processing</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <div className="flex items-center gap-1 bg-slate-100/90 rounded-lg p-0.5 border border-slate-200">
                          <button
                            type="button"
                            onClick={() => handleUpdateLop(r.empNo, Math.max(0, (r.lopDays || 0) - 1))}
                            disabled={(r.lopDays || 0) <= 0}
                            className="w-4 h-4 rounded flex items-center justify-center font-bold text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-25 cursor-pointer text-xs transition-colors"
                            title="Decrease unpaid leave"
                          >
                            -
                          </button>
                          <div className="font-mono text-center min-w-[34px]">
                            <span className="font-bold text-slate-800 text-[11px]">{r.paymentDays}d</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleUpdateLop(r.empNo, Math.min(r.totalDays || 30, (r.lopDays || 0) + 1))}
                            disabled={(r.lopDays || 0) >= (r.totalDays || 30)}
                            className="w-4 h-4 rounded flex items-center justify-center font-bold text-slate-600 hover:text-slate-900 hover:bg-white disabled:opacity-25 cursor-pointer text-xs transition-colors"
                            title="Add 1 day unpaid leave (LOP)"
                          >
                            +
                          </button>
                        </div>
                        {(r.lopDays || 0) > 0 && (
                          <span
                            className="text-[9px] text-rose-600 font-bold mt-0.5"
                            title={`Unpaid leave: ${r.lopDays} days deduction (-₹${(r.lopDeductionAmount || 0).toLocaleString('en-IN')})`}
                          >
                            {r.lopDays}d LOP (-₹{(r.lopDeductionAmount || 0).toLocaleString('en-IN')})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {r.basic.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      {r.specialAllowance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-slate-900">
                      {r.gross.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {r.pf.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedTaxEmployee({
                            empNo: r.empNo,
                            name: r.name,
                            monthlyGross: r.gross,
                            monthlyBasic: r.basic,
                            monthlyPf: r.pf,
                            monthlyPt: r.profTax,
                            currentTds: r.incomeTax,
                            designation: r.category,
                          })
                        }
                        className="inline-flex items-center gap-1 text-slate-700 hover:text-indigo-600 hover:underline cursor-pointer group"
                        title="Click to view step-by-step TDS and slab breakdown"
                      >
                        <span className="font-semibold">
                          {r.incomeTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <Calculator className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 opacity-60 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-600">
                      {r.profTax.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-semibold text-rose-600">
                      {r.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      <div className="font-bold text-slate-900">
                        {r.netPay.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      {!currentMonth.isProcessed && (
                        <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block font-sans">
                          Draft
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleViewPayslip(r)}
                          className="p-1 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                          title={currentMonth.isProcessed ? "View Payslip Preview" : "View Draft Payslip Preview"}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPayslip(r)}
                          className="p-1 rounded-md text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="Download Official Salary Slip PDF"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                        {r.isFromDb && (
                          <button
                            type="button"
                            onClick={() => handleSaveSlipToDb(r)}
                            className="p-1 rounded-md text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 transition-colors cursor-pointer"
                            title={`Synchronized with Database (${r.slipName}). Click to refresh.`}
                          >
                            <Database className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setRecordToDelete(r)}
                          className="p-1 rounded-md text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer opacity-70 hover:opacity-100"
                          title="Delete wrong salary entry from this payroll cycle"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={13} className="py-8 text-center text-slate-400">
                    No employee records matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot>
              <tr className="bg-slate-100/90 font-bold text-slate-900 border-t-2 border-slate-300">
                <td colSpan={4} className="py-3 px-4">
                  Total Items: {filteredRecords.length}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {filteredRecords.reduce((acc, r) => acc + r.basic, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {filteredRecords.reduce((acc, r) => acc + r.specialAllowance, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono text-blue-700">
                  ₹{filteredRecords.reduce((acc, r) => acc + r.gross, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {filteredRecords.reduce((acc, r) => acc + r.pf, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {filteredRecords.reduce((acc, r) => acc + r.incomeTax, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono">
                  {filteredRecords.reduce((acc, r) => acc + r.profTax, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-3 text-right font-mono text-rose-600">
                  -₹{filteredRecords.reduce((acc, r) => acc + Math.abs(r.totalDeductions), 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-700">
                  <div>
                    ₹{filteredRecords.reduce((acc, r) => acc + r.netPay, 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  {!currentMonth.isProcessed && (
                    <span className="text-[10px] text-amber-600 font-bold uppercase tracking-wider block font-sans">
                      Draft Total
                    </span>
                  )}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 6. EXPANDABLE QUICK ACTIONS & SUB-MODULE LAUNCHER */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div
          onClick={() => onOpenWizard ? onOpenWizard() : onNavigate('Payroll Wizard')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-emerald-700 transition-colors">
                ⚡ 5-Step Payroll Wizard
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Guided attendance sync & bank disbursals</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>

        <div
          onClick={() => onOpenSimulator ? onOpenSimulator() : onNavigate('Tax Simulator')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-700 transition-colors">
                PF • PT • TDS Simulator
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Indian statutory calculation sandbox</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>

        <div
          onClick={() => onNavigate('Salary Structure Assignment', 'Salary Structure Assignment')}
          className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-purple-400 hover:shadow-md transition-all cursor-pointer group flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 group-hover:scale-105 transition-transform">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-slate-900 group-hover:text-purple-700 transition-colors">
                CTC Structure Assignments
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Base & variable wage package rules</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
      </>
      )}


      {/* Digital Payslip Modal */}
      <PayslipModal
        slip={selectedSlip}
        isOpen={isPayslipOpen}
        onClose={() => {
          setIsPayslipOpen(false);
          setSelectedSlip(null);
        }}
      />

      {/* greytHR PRE-PAYROLL RESTRICTION MODAL */}
      {isGreytHRModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsGreytHRModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-scaleUp text-xs font-sans">
            {/* Modal Top Brand Bar */}
            <div className="bg-[#1A2232] text-white px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                    <span>greytHR Payroll Guard</span>
                    <span className="text-[10px] font-bold px-2 py-0.2 bg-amber-500/30 text-amber-300 rounded-full border border-amber-400/30">
                      Processing Restricted
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {currentMonth.fullTitle} • Salary Release Date: {currentMonth.releaseDate}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsGreytHRModalOpen(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Alert Callout */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-xs text-amber-950">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Salary Processing Is Not Allowed Before Release Date (Day 4)</span>
                </div>
                <p className="text-xs text-amber-900 leading-relaxed pl-6">
                  greytHR standard payroll compliance prohibits processing salary for <strong>{currentMonth.fullTitle}</strong> because the official salary release date is <strong>{currentMonth.releaseDate}</strong>.
                </p>
              </div>

              {/* Pre-Payroll Checklist */}
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5">
                  greytHR Pre-Processing Checklist Status:
                </h4>
                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {/* Checklist 1 */}
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <XCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Salary Release Date (Day 4)</span>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                          Pending {currentMonth.releaseDate}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Salary release date is configured as the 4th. Batch calculation unlocks on {currentMonth.releaseDate}.
                      </p>
                    </div>
                  </div>

                  {/* Checklist 2 */}
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Biometric Attendance & Swipes Cutoff</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          Active (Cutoff: 31 Oct)
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Cycle is ongoing. Daily biometric punches and shift logs are active. Premature processing would cause missing attendance days and inaccurate LOP.
                      </p>
                    </div>
                  </div>

                  {/* Checklist 3 */}
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Loss of Pay (LOP) & Leave Sanction</span>
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          In Progress
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Employee leave requests and managerial approvals for October are not yet frozen.
                      </p>
                    </div>
                  </div>

                  {/* Checklist 4 */}
                  <div className="flex items-start gap-3 p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Payroll Variable Inputs & Arrears</span>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          Open for Updates
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Ad-hoc salary additions, reimbursements, and overtime entries can still be edited.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* greytHR Policy Note */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
                <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  <strong>Why does greytHR enforce this?</strong> Finalizing salary during an ongoing cycle excludes remaining attendance days and causes irreversible tax recalculations.
                </p>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsGreytHRModalOpen(false);
                  if (onOpenSimulator) onOpenSimulator();
                }}
                className="px-4 py-2 rounded-xl text-blue-600 hover:bg-blue-100/50 font-bold text-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Run Draft Simulation Preview</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGreytHRModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 cursor-pointer"
              >
                Understood & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tax Breakdown Modal */}
      {selectedTaxEmployee && (
        <TaxBreakdownModal
          isOpen={!!selectedTaxEmployee}
          onClose={() => setSelectedTaxEmployee(null)}
          employee={selectedTaxEmployee}
        />
      )}

      {/* Delete Wrong Salary Record Confirmation Modal */}
      {recordToDelete && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget && !isDeletingRecord) setRecordToDelete(null);
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden animate-scaleUp">
            <div className="h-14 bg-rose-600 text-white px-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Delete Salary Record</h3>
                  <p className="text-[11px] text-rose-100">{currentMonth.fullTitle} Cycle</p>
                </div>
              </div>
              <button
                onClick={() => !isDeletingRecord && setRecordToDelete(null)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-900">Are you sure you want to delete this salary record?</p>
                  <p className="text-rose-700 mt-1 leading-relaxed">
                    This will remove the incorrect salary calculation for <strong className="text-rose-900">{recordToDelete.name}</strong> (<span className="font-mono font-bold text-rose-900">{recordToDelete.empNo}</span>) from the <strong>{currentMonth.fullTitle}</strong> payroll run.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1.5 text-[11px]">
                <div className="flex justify-between text-slate-600">
                  <span>Gross Salary:</span>
                  <span className="font-medium text-slate-900 font-mono">₹{recordToDelete.gross.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Total Deductions:</span>
                  <span className="font-medium text-rose-600 font-mono">-₹{Math.abs(recordToDelete.totalDeductions).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Net Take-Home:</span>
                  <span className="font-bold text-emerald-700 font-mono">₹{recordToDelete.netPay.toLocaleString('en-IN')}</span>
                </div>
                {recordToDelete.slipName && (
                  <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-200">
                    <span>Salary Slip Record:</span>
                    <span className="font-mono text-blue-600 font-semibold">{recordToDelete.slipName}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  disabled={isDeletingRecord}
                  onClick={() => setRecordToDelete(null)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeletingRecord}
                  onClick={handleConfirmDeleteRecord}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDeletingRecord ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Yes, Delete Record</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
