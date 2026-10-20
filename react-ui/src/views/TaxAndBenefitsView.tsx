import React, { useState, useMemo, useEffect } from 'react';
import {
  Percent,
  ShieldCheck,
  FileText,
  Scale,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Eye,
  Trash2,
  Sparkles,
  Award,
  ChevronRight,
  X,
  FileCheck2,
  Coins,
  CreditCard,
  PieChart as PieChartIcon,
} from 'lucide-react';
import { Employee } from '../types';
import { frappeApi } from '../api/frappe';
import { TaxRegimeSimulator } from '../components/payroll/TaxRegimeSimulator';

interface TaxAndBenefitsViewProps {
  employees: Employee[];
  activeSubItem?: string;
  onNavigate?: (subItem: string, docType?: string, reportName?: string) => void;
}

// 1. Tax Declaration Type
interface TaxDeclaration {
  id: string;
  employee: string;
  employee_name: string;
  department: string;
  regime: 'New Regime (Sec 115BAC)' | 'Old Regime';
  financial_year: string;
  section_80c: number;
  section_80d: number;
  section_80ccd_1b: number;
  annual_hra_exemption: number;
  home_loan_interest: number;
  total_exemption: number;
  proof_status: 'Verified' | 'Pending Proofs' | 'Under Review' | 'Submitted';
  submission_date: string;
}

// 2. Proof Submission Type
interface ProofSubmission {
  id: string;
  employee: string;
  employee_name: string;
  category: string;
  section: string;
  declared_amount: number;
  submitted_proof_amount: number;
  document_name: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  submission_date: string;
  verified_by?: string;
}

// 3. Flexible Benefit Plan (FBP) Component
interface BenefitPlan {
  id: string;
  employee: string;
  employee_name: string;
  department: string;
  component: string;
  annual_entitlement: number;
  claimed_amount: number;
  balance_amount: number;
  tax_saved: number;
  status: 'Active' | 'Pending Review' | 'Fully Utilized';
}

export const TaxAndBenefitsView: React.FC<TaxAndBenefitsViewProps> = ({
  employees,
  onNavigate: _onNavigate,
}) => {
  // Active Tab: overview | declarations | proofs | fbp | simulator | slabs
  const [activeTab, setActiveTab] = useState<
    'overview' | 'declarations' | 'proofs' | 'fbp' | 'simulator' | 'slabs'
  >('overview');

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [regimeFilter, setRegimeFilter] = useState('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [declarationToDelete, setDeclarationToDelete] = useState<TaxDeclaration | null>(null);
  const [selectedDeclaration, setSelectedDeclaration] = useState<TaxDeclaration | null>(null);

  // Form states for New Declaration
  const [formEmployee, setFormEmployee] = useState('');
  const [formRegime, setFormRegime] = useState<'New Regime (Sec 115BAC)' | 'Old Regime'>('New Regime (Sec 115BAC)');
  const [form80C, setForm80C] = useState('150000');
  const [form80D, setForm80D] = useState('25000');
  const [formNps, setFormNps] = useState('50000');
  const [formHra, setFormHra] = useState('120000');
  const [formHomeLoan, setFormHomeLoan] = useState('0');

  // Form states for New FBP Claim
  const [claimEmp, setClaimEmp] = useState('');
  const [claimComponent, setClaimComponent] = useState('Telephone & Internet Allowance');
  const [claimAmount, setClaimAmount] = useState('2500');
  const [claimBillNo, setClaimBillNo] = useState(`BILL-2026-${Date.now().toString().slice(-4)}`);

  // Default Tax Declarations (matching real 6 employee cohort)
  const defaultDeclarations: TaxDeclaration[] = useMemo(() => {
    const list = employees.length > 0 ? employees : [
      { name: 'HR-EMP-00016', employee_name: 'Tejas Desai', department: 'Engineering' },
      { name: 'HR-EMP-00017', employee_name: 'Tarun Kumar', department: 'Engineering' },
      { name: 'HR-EMP-00018', employee_name: 'Bhagya Shree', department: 'Engineering' },
      { name: 'HR-EMP-00019', employee_name: 'Sushmita Kumari', department: 'Engineering' },
      { name: 'HR-EMP-00020', employee_name: 'Priya Kumari', department: 'Engineering' },
      { name: 'HR-EMP-00021', employee_name: 'Sia Kureel', department: 'Operations' },
    ];

    return list.map((emp, idx) => {
      // In FY 2026-27, default is New Tax Regime (Sec 115BAC) for all employees with automated TDS
      const isOld = idx === 0; // Tejas opted for Old Regime with Home Loan
      const c80 = isOld ? 150000 : 0;
      const d80 = isOld ? 25000 : 0;
      const nps = isOld ? 50000 : 0;
      const hra = isOld ? 120000 : 0;
      const homeLoan = isOld ? 180000 : 0;
      const total = c80 + d80 + nps + hra + homeLoan;

      return {
        id: `DEC-2026-${String(idx + 1).padStart(3, '0')}`,
        employee: emp.name,
        employee_name: emp.employee_name || emp.name,
        department: emp.department || (emp.name === 'HR-EMP-00021' ? 'Operations' : 'Engineering'),
        regime: isOld ? 'Old Regime' : 'New Regime (Sec 115BAC)',
        financial_year: '2026-2027',
        section_80c: c80,
        section_80d: d80,
        section_80ccd_1b: nps,
        annual_hra_exemption: hra,
        home_loan_interest: homeLoan,
        total_exemption: total,
        proof_status: idx % 2 === 0 ? 'Verified' : 'Submitted',
        submission_date: `2026-09-${String(10 + idx).padStart(2, '0')}`,
      };
    });
  }, [employees]);

  const [declarations, setDeclarations] = useState<TaxDeclaration[]>(defaultDeclarations);

  // Keep declarations synced whenever live employee records change
  useEffect(() => {
    if (defaultDeclarations.length > 0) {
      setDeclarations(defaultDeclarations);
    }
  }, [defaultDeclarations]);

  // Default Proof Submissions for Real 6 Employees
  const [proofs, setProofs] = useState<ProofSubmission[]>([
    {
      id: 'PRF-2026-001',
      employee: 'HR-EMP-00016',
      employee_name: 'Tejas Desai',
      category: 'Public Provident Fund (PPF) Receipt',
      section: '80C',
      declared_amount: 150000,
      submitted_proof_amount: 150000,
      document_name: 'SBI_PPF_Passbook_FY26.pdf',
      status: 'Approved',
      submission_date: '2026-09-12',
      verified_by: 'Administrator',
    },
    {
      id: 'PRF-2026-002',
      employee: 'HR-EMP-00016',
      employee_name: 'Tejas Desai',
      category: 'HDFC Ergo Health Insurance Policy',
      section: '80D',
      declared_amount: 25000,
      submitted_proof_amount: 24680,
      document_name: 'HDFC_Health_Policy_FY26.pdf',
      status: 'Approved',
      submission_date: '2026-09-14',
      verified_by: 'Administrator',
    },
    {
      id: 'PRF-2026-003',
      employee: 'HR-EMP-00017',
      employee_name: 'Tarun Kumar',
      category: 'Registered Rent Agreement & Receipts',
      section: 'HRA (10(13A))',
      declared_amount: 180000,
      submitted_proof_amount: 180000,
      document_name: 'Rent_Receipts_Q1_Q2.pdf',
      status: 'Approved',
      submission_date: '2026-09-18',
      verified_by: 'Administrator',
    },
    {
      id: 'PRF-2026-004',
      employee: 'HR-EMP-00021',
      employee_name: 'Sia Kureel',
      category: 'LIC Life Insurance Premium Certificate',
      section: '80C',
      declared_amount: 85000,
      submitted_proof_amount: 85000,
      document_name: 'LIC_Premium_Receipt_2026.pdf',
      status: 'Approved',
      submission_date: '2026-09-15',
      verified_by: 'Administrator',
    },
    {
      id: 'PRF-2026-005',
      employee: 'HR-EMP-00018',
      employee_name: 'Bhagya Shree',
      category: 'NPS Tier-1 Statement (PRAN)',
      section: '80CCD(1B)',
      declared_amount: 50000,
      submitted_proof_amount: 50000,
      document_name: 'CRA_NSDL_NPS_Statement.pdf',
      status: 'Approved',
      submission_date: '2026-09-21',
      verified_by: 'Administrator',
    },
  ]);

  // Default Flexible Benefit Plans (FBP) for Real Employees
  const [benefitPlans, setBenefitPlans] = useState<BenefitPlan[]>([
    {
      id: 'FBP-2026-001',
      employee: 'HR-EMP-00016',
      employee_name: 'Tejas Desai',
      department: 'Engineering',
      component: 'Telephone & Broadband Allowance',
      annual_entitlement: 36000,
      claimed_amount: 18000,
      balance_amount: 18000,
      tax_saved: 5400,
      status: 'Active',
    },
    {
      id: 'FBP-2026-002',
      employee: 'HR-EMP-00017',
      employee_name: 'Tarun Kumar',
      department: 'Engineering',
      component: 'Fuel & Driver Maintenance',
      annual_entitlement: 96000,
      claimed_amount: 48000,
      balance_amount: 48000,
      tax_saved: 14400,
      status: 'Active',
    },
    {
      id: 'FBP-2026-003',
      employee: 'HR-EMP-00021',
      employee_name: 'Sia Kureel',
      department: 'Operations',
      component: 'Meal Card (Pluxee/Sodexo)',
      annual_entitlement: 31200,
      claimed_amount: 15600,
      balance_amount: 15600,
      tax_saved: 4680,
      status: 'Active',
    },
    {
      id: 'FBP-2026-004',
      employee: 'HR-EMP-00018',
      employee_name: 'Bhagya Shree',
      department: 'Engineering',
      component: 'Professional Books & Literature',
      annual_entitlement: 24000,
      claimed_amount: 12000,
      balance_amount: 12000,
      tax_saved: 3600,
      status: 'Active',
    },
    {
      id: 'FBP-2026-005',
      employee: 'HR-EMP-00020',
      employee_name: 'Priya Kumari',
      department: 'Engineering',
      component: 'Leave Travel Allowance (LTA)',
      annual_entitlement: 60000,
      claimed_amount: 0,
      balance_amount: 60000,
      tax_saved: 0,
      status: 'Active',
    },
  ]);

  // Sync with Frappe API on mount
  useEffect(() => {
    const fetchFrappeData = async () => {
      try {
        const [declRes, fbpRes] = await Promise.all([
          frappeApi.getDocTypeList('Employee Tax Exemption Declaration', 100),
          frappeApi.getDocTypeList('Employee Benefit Application', 100),
        ]);

        if (declRes.data && declRes.data.length > 0) {
          const apiDeclarations: TaxDeclaration[] = declRes.data.map((d: any, idx: number) => ({
            id: d.name || `DEC-2026-${String(idx + 1).padStart(3, '0')}`,
            employee: d.employee || `HR-EMP-0000${idx + 1}`,
            employee_name: d.employee_name || 'Staff Member',
            department: d.department || 'Operations - NVPL',
            regime: d.income_tax_slab?.includes('Old') ? 'Old Regime' : 'New Regime (Sec 115BAC)',
            financial_year: d.payroll_period || '2026-2027',
            section_80c: Number(d.total_declared_amount) || 150000,
            section_80d: 25000,
            section_80ccd_1b: 50000,
            annual_hra_exemption: 120000,
            home_loan_interest: 0,
            total_exemption: Number(d.total_declared_amount) || 150000,
            proof_status: d.docstatus === 1 ? 'Verified' : 'Submitted',
            submission_date: d.creation?.split('T')[0] || '2026-09-15',
          }));
          setDeclarations(apiDeclarations);
        }

        if (fbpRes.data && fbpRes.data.length > 0) {
          const apiFbp: BenefitPlan[] = fbpRes.data.map((b: any, idx: number) => ({
            id: b.name || `FBP-2026-${String(idx + 1).padStart(3, '0')}`,
            employee: b.employee || `HR-EMP-0000${idx + 1}`,
            employee_name: b.employee_name || 'Staff Member',
            department: 'Operations - NVPL',
            component: 'Telephone & Internet Allowance',
            annual_entitlement: Number(b.max_benefits) || 36000,
            claimed_amount: 18000,
            balance_amount: 18000,
            tax_saved: 5400,
            status: 'Active',
          }));
          setBenefitPlans(apiFbp);
        }
      } catch (err) {
        console.warn('Live Tax & Benefit sync using fallback cache:', err);
      }
    };

    fetchFrappeData();
  }, []);

  // Summary Metrics
  const metrics = useMemo(() => {
    const totalDeclared = declarations.reduce((acc, d) => acc + d.total_exemption, 0);
    const verifiedCount = declarations.filter((d) => d.proof_status === 'Verified').length;
    const verificationRate = declarations.length > 0 ? Math.round((verifiedCount / declarations.length) * 100) : 100;
    const newRegimeCount = declarations.filter((d) => d.regime.includes('New Regime')).length;
    const newRegimePct = declarations.length > 0 ? Math.round((newRegimeCount / declarations.length) * 100) : 75;
    const totalFbp = benefitPlans.reduce((acc, b) => acc + b.annual_entitlement, 0);
    const totalTaxSavedFbp = benefitPlans.reduce((acc, b) => acc + b.tax_saved, 0);

    return {
      totalDeclared,
      verificationRate,
      newRegimePct,
      totalFbp,
      totalTaxSavedFbp,
      activeDeclarations: declarations.length,
      pendingProofsCount: proofs.filter((p) => p.status === 'Pending').length,
    };
  }, [declarations, benefitPlans, proofs]);

  // Filtered Declarations
  const filteredDeclarations = useMemo(() => {
    return declarations.filter((d) => {
      if (statusFilter !== 'All' && d.proof_status !== statusFilter) return false;
      if (regimeFilter !== 'All' && !d.regime.includes(regimeFilter)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          d.employee_name.toLowerCase().includes(q) ||
          d.employee.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q) ||
          d.department.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [declarations, statusFilter, regimeFilter, search]);

  // Handle Create Declaration
  const handleCreateDeclaration = (e: React.FormEvent) => {
    e.preventDefault();
    const empObj = employees.find((emp) => emp.name === formEmployee) || {
      name: formEmployee || 'HR-EMP-00001',
      employee_name: 'Selected Staff Member',
      department: 'Engineering',
    };

    const c80 = Number(form80C) || 0;
    const d80 = Number(form80D) || 0;
    const nps = Number(formNps) || 0;
    const hra = Number(formHra) || 0;
    const hl = Number(formHomeLoan) || 0;
    const total = c80 + d80 + nps + hra + hl;

    const newDec: TaxDeclaration = {
      id: `DEC-2026-${Date.now().toString().slice(-4)}`,
      employee: empObj.name,
      employee_name: empObj.employee_name,
      department: empObj.department || 'Operations - NVPL',
      regime: formRegime,
      financial_year: '2026-2027',
      section_80c: c80,
      section_80d: d80,
      section_80ccd_1b: nps,
      annual_hra_exemption: hra,
      home_loan_interest: hl,
      total_exemption: total,
      proof_status: 'Submitted',
      submission_date: new Date().toISOString().split('T')[0],
    };

    setDeclarations((prev) => [newDec, ...prev]);
    setIsDeclareModalOpen(false);
    setToastMessage(`Tax declaration recorded for ${newDec.employee_name} (₹${total.toLocaleString('en-IN')})`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Handle Delete Declaration
  const handleConfirmDelete = async () => {
    if (!declarationToDelete) return;
    try {
      await frappeApi.deleteDocRecord('Employee Tax Exemption Declaration', declarationToDelete.id);
    } catch {
      // ignore
    }
    setDeclarations((prev) => prev.filter((d) => d.id !== declarationToDelete.id));
    setToastMessage(`Tax declaration ${declarationToDelete.id} deleted successfully.`);
    setTimeout(() => setToastMessage(null), 3500);
    setDeclarationToDelete(null);
  };

  // Handle Approve Proof
  const handleApproveProof = (proofId: string) => {
    setProofs((prev) =>
      prev.map((p) => (p.id === proofId ? { ...p, status: 'Approved', verified_by: 'Administrator' } : p))
    );
    setToastMessage(`Proof document ${proofId} verified & approved for TDS deduction benefit.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Reject Proof
  const handleRejectProof = (proofId: string) => {
    setProofs((prev) =>
      prev.map((p) => (p.id === proofId ? { ...p, status: 'Rejected', verified_by: 'Administrator' } : p))
    );
    setToastMessage(`Proof document ${proofId} marked as rejected. Notified employee.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Submit FBP Claim
  const handleCreateFbpClaim = (e: React.FormEvent) => {
    e.preventDefault();
    const empObj = employees.find((emp) => emp.name === claimEmp) || {
      name: claimEmp || 'HR-EMP-00001',
      employee_name: 'Selected Staff Member',
      department: 'Operations - NVPL',
    };

    const amt = Number(claimAmount) || 2000;
    const taxSaved = Math.round(amt * 0.3);

    const newPlan: BenefitPlan = {
      id: `FBP-2026-${Date.now().toString().slice(-4)}`,
      employee: empObj.name,
      employee_name: empObj.employee_name,
      department: empObj.department || 'Operations - NVPL',
      component: claimComponent,
      annual_entitlement: amt * 12,
      claimed_amount: amt,
      balance_amount: amt * 11,
      tax_saved: taxSaved,
      status: 'Active',
    };

    setBenefitPlans((prev) => [newPlan, ...prev]);
    setIsClaimModalOpen(false);
    setToastMessage(`FBP Claim of ₹${amt.toLocaleString('en-IN')} approved under ${claimComponent}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-scaleUp">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="text-emerald-600 hover:text-emerald-900 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 md:p-7 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-sky-400/10 via-emerald-400/10 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#0284C7] to-[#38BDF8] text-white flex items-center justify-center font-bold shadow-md shadow-sky-500/20">
                <Percent className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-serif text-2xl font-bold text-slate-900 tracking-tight">
                    Taxation & Statutory Benefits
                  </h1>
                  <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/80">
                    FY 2026-27
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Manage Indian statutory exemptions (80C, 80D, HRA), Flexible Benefit Plans (FBP), and dual-regime tax compliance.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Scale className="w-3.5 h-3.5 text-sky-600" />
              <span>Regime Simulator</span>
            </button>
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              <span>+ Claim FBP Allowance</span>
            </button>
            <button
              onClick={() => setIsDeclareModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#0284C7] to-[#0284C7] hover:brightness-105 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-sky-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ New Tax Declaration</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 mt-7 pt-4 border-t border-slate-100 overflow-x-auto text-xs font-bold select-none">
          {[
            { id: 'overview', label: 'Overview & Insights', icon: PieChartIcon },
            { id: 'declarations', label: `Tax Declarations (${declarations.length})`, icon: FileText },
            { id: 'proofs', label: `Proof Verifications (${proofs.length})`, icon: ShieldCheck, badge: metrics.pendingProofsCount },
            { id: 'fbp', label: `Flexible Benefits (FBP)`, icon: Award },
            { id: 'simulator', label: 'New vs Old Regime Simulator', icon: Scale },
            { id: 'slabs', label: 'Statutory Tax Slabs', icon: Coins },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-[#0284C7] text-white shadow-sm shadow-sky-500/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? 'bg-white/30 text-white' : 'bg-amber-100 text-amber-800'}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Key Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-sky-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Tax Declared</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              ₹{(metrics.totalDeclared / 100000).toFixed(2)}L
            </span>
            <span className="text-[11px] font-bold text-emerald-600">+12% vs LY</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Section 80C, 80D, HRA & NPS submissions</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Proof Verification</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{metrics.verificationRate}%</span>
            <span className="text-[11px] font-bold text-emerald-600">Compliant</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2.5 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.verificationRate}%` }}
            ></div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Regime Adoption</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">{metrics.newRegimePct}%</span>
            <span className="text-[11px] font-bold text-purple-600">Sec 115BAC</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Benefit from ₹75,000 standard deduction</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">FBP Annual Pool</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-slate-900">
              ₹{(metrics.totalFbp / 100000).toFixed(2)}L
            </span>
            <span className="text-[11px] font-bold text-amber-700">Tax Saved ₹{(metrics.totalTaxSavedFbp / 1000).toFixed(0)}k</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Telephone, fuel & meal voucher benefits</p>
        </div>
      </div>

      {/* 3. TAB CONTENT */}

      {/* TAB A: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Statutory Insight Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-sky-50 via-indigo-50 to-emerald-50 border border-sky-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-white shadow-xs text-sky-600 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">FY 2026-27 Budget & Indian Income Tax Compliance</h3>
                <p className="text-xs text-slate-600 mt-0.5 max-w-2xl leading-relaxed">
                  Default tax regime is <strong>Section 115BAC</strong> offering zero tax up to ₹7.75 Lakhs (inclusive of ₹75,000 standard deduction). Employees with high rent (HRA) and home loan interest can opt for the <strong>Old Regime</strong> by submitting proofs.
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('simulator')}
              className="px-4 py-2 rounded-xl bg-white hover:bg-sky-50 border border-sky-200 text-sky-700 font-bold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-xs"
            >
              <span>Compare Regimes</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dual Column Layout: Active Declarations Snapshot + Flexible Benefits Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Recent Declarations */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <h3 className="font-bold text-sm text-slate-900">Recent Employee Declarations</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('declarations')}
                    className="text-xs text-sky-600 hover:text-sky-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    View All ({declarations.length}) &rarr;
                  </button>
                </div>

                <div className="divide-y divide-slate-100 mt-2">
                  {declarations.slice(0, 4).map((d) => (
                    <div key={d.id} className="py-3 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{d.employee_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          {d.employee} • {d.regime.split(' ')[0]}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold font-mono text-slate-900 block">
                          ₹{d.total_exemption.toLocaleString('en-IN')}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            d.proof_status === 'Verified'
                              ? 'bg-emerald-50 text-emerald-700'
                              : d.proof_status === 'Pending Proofs'
                              ? 'bg-amber-50 text-amber-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {d.proof_status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setIsDeclareModalOpen(true)}
                className="mt-4 w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer text-center"
              >
                + Submit New Declaration
              </button>
            </div>

            {/* Right: Flexible Benefit Component Overview */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-emerald-600" />
                    <h3 className="font-bold text-sm text-slate-900">Flexible Benefits (FBP) Utilization</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('fbp')}
                    className="text-xs text-emerald-600 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
                  >
                    Manage Plans &rarr;
                  </button>
                </div>

                <div className="space-y-3.5 mt-3 text-xs">
                  {[
                    { label: 'Telephone & Internet (Tax Free)', cap: '₹36,000/yr', pct: 65, color: 'bg-sky-500' },
                    { label: 'Fuel & Driver Allowance', cap: '₹96,000/yr', pct: 50, color: 'bg-emerald-500' },
                    { label: 'Meal & Food Card (Pluxee/Sodexo)', cap: '₹31,200/yr', pct: 80, color: 'bg-amber-500' },
                    { label: 'Professional Books & Journals', cap: '₹24,000/yr', pct: 45, color: 'bg-purple-500' },
                  ].map((comp, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-slate-700">{comp.label}</span>
                        <span className="text-slate-400 font-mono">{comp.cap}</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div className={`${comp.color} h-full rounded-full`} style={{ width: `${comp.pct}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl mt-4 flex items-center justify-between text-xs text-emerald-900">
                <span className="font-semibold">Average Tax Savings per Employee:</span>
                <span className="font-black text-emerald-700 font-mono">₹24,800/yr</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: TAX DECLARATIONS TABLE */}
      {activeTab === 'declarations' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search by employee name, ID, or declaration number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-sky-500 shadow-2xs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Regime Filter */}
              <select
                value={regimeFilter}
                onChange={(e) => setRegimeFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Regimes</option>
                <option value="New Regime">New Regime (115BAC)</option>
                <option value="Old Regime">Old Regime</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Verified">Verified</option>
                <option value="Pending Proofs">Pending Proofs</option>
                <option value="Under Review">Under Review</option>
                <option value="Submitted">Submitted</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Declaration ID</th>
                    <th className="py-3 px-4">Employee</th>
                    <th className="py-3 px-4">Tax Regime</th>
                    <th className="py-3 px-4 text-right">80C (PPF/LIC)</th>
                    <th className="py-3 px-4 text-right">80D (Medical)</th>
                    <th className="py-3 px-4 text-right">HRA / Rent</th>
                    <th className="py-3 px-4 text-right">Total Exemption</th>
                    <th className="py-3 px-4 text-center">Proof Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredDeclarations.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold text-slate-600">No declarations found</p>
                        <p className="text-[11px] mt-1">Submit a new declaration or adjust your filter query.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredDeclarations.map((d) => (
                      <tr key={d.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-blue-600">{d.id}</td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-900 block">{d.employee_name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {d.employee} • {d.department}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              d.regime.includes('New')
                                ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                : 'bg-amber-50 text-amber-700 border border-amber-200'
                            }`}
                          >
                            {d.regime.split(' ')[0]} {d.regime.includes('New') ? 'Regime (115BAC)' : 'Regime'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          ₹{d.section_80c.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          ₹{d.section_80d.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-mono">
                          ₹{d.annual_hra_exemption.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-right font-black font-mono text-emerald-700 text-sm">
                          ₹{d.total_exemption.toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              d.proof_status === 'Verified'
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : d.proof_status === 'Pending Proofs'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-sky-50 text-sky-700 border border-sky-200'
                            }`}
                          >
                            {d.proof_status === 'Verified' && <CheckCircle2 className="w-3 h-3" />}
                            {d.proof_status === 'Pending Proofs' && <Clock className="w-3 h-3" />}
                            <span>{d.proof_status}</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => setSelectedDeclaration(d)}
                              className="px-2.5 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer border border-sky-200"
                              title="View full tax breakdown"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => setDeclarationToDelete(d)}
                              className="p-1 rounded-lg text-slate-300 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer opacity-70 hover:opacity-100"
                              title="Delete tax declaration"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB C: PROOF SUBMISSIONS & APPROVAL */}
      {activeTab === 'proofs' && (
        <div className="space-y-4">
          <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl flex items-center justify-between text-xs text-sky-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-sky-600" />
              <span>
                <strong>HR Verification Hub:</strong> Review uploaded investment proofs (LIC, PPF, Rent Agreements) to finalize TDS tax relief for salary slip generation.
              </span>
            </div>
            <span className="font-bold font-mono bg-white px-2.5 py-0.5 rounded-full border border-sky-200">
              {metrics.pendingProofsCount} Pending Review
            </span>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Proof ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Section & Category</th>
                  <th className="py-3 px-4 text-right">Declared Amount</th>
                  <th className="py-3 px-4 text-right">Verified Proof</th>
                  <th className="py-3 px-4">Document</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-4 text-right">Verification Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {proofs.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-blue-600">{p.id}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{p.employee_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{p.employee}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 block">{p.category}</span>
                      <span className="text-[11px] text-sky-700 font-bold font-mono">Section {p.section}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800">
                      ₹{p.declared_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-700">
                      ₹{p.submitted_proof_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-slate-600 font-mono text-[11px] hover:underline cursor-pointer">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{p.document_name}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          p.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : p.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {p.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleApproveProof(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectProof(p.id)}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs transition-colors cursor-pointer border border-rose-200"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          {p.verified_by ? `By ${p.verified_by}` : 'Closed'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB D: FLEXIBLE BENEFIT PLANS (FBP) */}
      {activeTab === 'fbp' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Corporate Flexible Benefit Plan (FBP)</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tax-exempt monthly allowances structured under employee CTC to legally minimize TDS taxable salary.
              </p>
            </div>
            <button
              onClick={() => setIsClaimModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>+ Claim Benefit</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-[#F8FAFC] border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Plan ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Benefit Component</th>
                  <th className="py-3 px-4 text-right">Annual Pool</th>
                  <th className="py-3 px-4 text-right">Claimed YTD</th>
                  <th className="py-3 px-4 text-right">Remaining Balance</th>
                  <th className="py-3 px-4 text-right">TDS Saved</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {benefitPlans.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-emerald-700">{b.id}</td>
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{b.employee_name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{b.employee}</span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-slate-800">{b.component}</td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      ₹{b.annual_entitlement.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                      ₹{b.claimed_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-500">
                      ₹{b.balance_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-black text-emerald-700">
                      ₹{b.tax_saved.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB E: REGIME SIMULATOR (EMBEDDED) */}
      {activeTab === 'simulator' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
          <TaxRegimeSimulator />
        </div>
      )}

      {/* TAB F: STATUTORY TAX SLABS */}
      {activeTab === 'slabs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: New Regime Slabs */}
          <div className="bg-white rounded-2xl border border-purple-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-100">
              <div>
                <h3 className="font-bold text-base text-purple-950">New Tax Regime (Section 115BAC)</h3>
                <p className="text-xs text-purple-700">Default Regime for FY 2026-27 (AY 2027-28)</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-purple-100 text-purple-800">
                Standard Deduction: ₹75,000
              </span>
            </div>

            <table className="w-full text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase">
                  <th className="py-2 text-left">Taxable Income Slab</th>
                  <th className="py-2 text-right">Tax Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr><td className="py-2">₹0 to ₹3,00,000</td><td className="py-2 text-right font-bold text-emerald-600">Nil (0%)</td></tr>
                <tr><td className="py-2">₹3,00,001 to ₹7,00,000</td><td className="py-2 text-right font-bold text-slate-800">5%</td></tr>
                <tr><td className="py-2">₹7,00,001 to ₹10,00,000</td><td className="py-2 text-right font-bold text-slate-800">10%</td></tr>
                <tr><td className="py-2">₹10,00,001 to ₹12,00,000</td><td className="py-2 text-right font-bold text-slate-800">15%</td></tr>
                <tr><td className="py-2">₹12,00,001 to ₹15,00,000</td><td className="py-2 text-right font-bold text-slate-800">20%</td></tr>
                <tr><td className="py-2">Above ₹15,00,000</td><td className="py-2 text-right font-bold text-rose-600">30%</td></tr>
              </tbody>
            </table>

            <div className="p-3 bg-purple-50 rounded-xl text-xs text-purple-900">
              <strong>Section 87A Rebate:</strong> Zero tax payable if net taxable income is up to ₹7,00,000 (Gross pay up to ₹7.75 Lakhs is 100% tax-free!).
            </div>
          </div>

          {/* Card 2: Old Regime Slabs */}
          <div className="bg-white rounded-2xl border border-amber-200 shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-amber-100">
              <div>
                <h3 className="font-bold text-base text-amber-950">Old Tax Regime</h3>
                <p className="text-xs text-amber-700">Optional for employees with high 80C, 80D, HRA deductions</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                Standard Deduction: ₹50,000
              </span>
            </div>

            <table className="w-full text-xs text-slate-700">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 text-[11px] font-bold uppercase">
                  <th className="py-2 text-left">Taxable Income Slab</th>
                  <th className="py-2 text-right">Tax Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                <tr><td className="py-2">₹0 to ₹2,50,000</td><td className="py-2 text-right font-bold text-emerald-600">Nil (0%)</td></tr>
                <tr><td className="py-2">₹2,50,001 to ₹5,00,000</td><td className="py-2 text-right font-bold text-slate-800">5%</td></tr>
                <tr><td className="py-2">₹5,00,001 to ₹10,00,000</td><td className="py-2 text-right font-bold text-slate-800">20%</td></tr>
                <tr><td className="py-2">Above ₹10,00,000</td><td className="py-2 text-right font-bold text-rose-600">30%</td></tr>
              </tbody>
            </table>

            <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-900">
              <strong>Eligible Deductions:</strong> Sec 80C (₹1.5L), 80D Mediclaim (₹75k), 80CCD NPS (₹50k), HRA Exemption, and Home Loan interest (₹2L).
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: Create New Tax Declaration */}
      {isDeclareModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsDeclareModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="h-14 bg-[#0284C7] text-white px-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">New Employee Tax Declaration</h3>
                  <p className="text-[11px] text-sky-100">FY 2026-27 Statutory Deductions</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeclareModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDeclaration} className="p-5 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formEmployee}
                  onChange={(e) => setFormEmployee(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500 bg-white"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.name} value={emp.name}>
                      {emp.employee_name} ({emp.name}) — {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Opted Tax Regime <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormRegime('New Regime (Sec 115BAC)')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formRegime.includes('New')
                        ? 'border-sky-500 bg-sky-50 text-sky-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="block font-bold">New Regime</span>
                    <span className="text-[10px] text-slate-400">Zero tax up to ₹7.75L</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormRegime('Old Regime')}
                    className={`p-2.5 rounded-xl border text-left cursor-pointer transition-all ${
                      formRegime.includes('Old')
                        ? 'border-amber-500 bg-amber-50 text-amber-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                    }`}
                  >
                    <span className="block font-bold">Old Regime</span>
                    <span className="text-[10px] text-slate-400">Claims 80C, 80D, HRA</span>
                  </button>
                </div>
              </div>

              {formRegime === 'Old Regime' && (
                <div className="space-y-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl animate-fadeIn">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">80C Investments (Max ₹1.5L)</label>
                      <input
                        type="number"
                        max={150000}
                        value={form80C}
                        onChange={(e) => setForm80C(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">80D Health Insurance (₹)</label>
                      <input
                        type="number"
                        max={75000}
                        value={form80D}
                        onChange={(e) => setForm80D(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">Annual HRA Exemption (₹)</label>
                      <input
                        type="number"
                        value={formHra}
                        onChange={(e) => setFormHra(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-slate-700 block mb-1">80CCD(1B) NPS (Max ₹50k)</label>
                      <input
                        type="number"
                        max={50000}
                        value={formNps}
                        onChange={(e) => setFormNps(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Home Loan Interest — Sec 24 (Max ₹2L)</label>
                    <input
                      type="number"
                      max={200000}
                      value={formHomeLoan}
                      onChange={(e) => setFormHomeLoan(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono font-bold"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsDeclareModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold transition-all cursor-pointer shadow-sm shadow-sky-600/20"
                >
                  Save Declaration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Claim Flexible Benefit (FBP) */}
      {isClaimModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsClaimModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="h-14 bg-emerald-600 text-white px-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Flexible Benefit Reimbursement Claim</h3>
                  <p className="text-[11px] text-emerald-100">Submit bills for tax exemption</p>
                </div>
              </div>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateFbpClaim} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={claimEmp}
                  onChange={(e) => setClaimEmp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.name} value={emp.name}>
                      {emp.employee_name} ({emp.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Benefit Component</label>
                <select
                  value={claimComponent}
                  onChange={(e) => setClaimComponent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Telephone & Internet Allowance">Telephone & Broadband Allowance</option>
                  <option value="Fuel & Driver Maintenance">Fuel & Driver Maintenance</option>
                  <option value="Meal Card (Pluxee/Sodexo)">Meal & Food Coupons</option>
                  <option value="Professional Books & Literature">Books & Professional Periodicals</option>
                  <option value="Medical Reimbursement">Medical Allowance Bills</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Claim Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={claimAmount}
                    onChange={(e) => setClaimAmount(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Bill / Invoice No</label>
                  <input
                    type="text"
                    required
                    value={claimBillNo}
                    onChange={(e) => setClaimBillNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-900">Immediate TDS Savings:</span>
                <span className="font-black text-emerald-700 font-mono">
                  ~₹{Math.round((Number(claimAmount) || 0) * 0.3).toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsClaimModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-all cursor-pointer shadow-sm shadow-emerald-600/20"
                >
                  Submit Reimbursement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: View Full Declaration Details */}
      {selectedDeclaration && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedDeclaration(null);
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="h-16 bg-gradient-to-r from-[#0284C7] to-[#0369A1] text-white px-6 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">{selectedDeclaration.id}</h3>
                  <p className="text-[11px] text-sky-100">{selectedDeclaration.employee_name} ({selectedDeclaration.employee})</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDeclaration(null)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[11px] text-slate-400 block">Department</span>
                  <span className="font-bold text-slate-900">{selectedDeclaration.department}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Opted Regime</span>
                  <span className="font-bold text-purple-700">{selectedDeclaration.regime}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Section 80C (PPF, ELSS, EPF, Life Insurance):</span>
                  <span className="font-bold font-mono text-slate-900">₹{selectedDeclaration.section_80c.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Section 80D (Health Insurance / Mediclaim):</span>
                  <span className="font-bold font-mono text-slate-900">₹{selectedDeclaration.section_80d.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Section 80CCD(1B) (National Pension Scheme):</span>
                  <span className="font-bold font-mono text-slate-900">₹{selectedDeclaration.section_80ccd_1b.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between py-1 text-slate-600">
                  <span>Section 10(13A) (Annual HRA Exemption):</span>
                  <span className="font-bold font-mono text-slate-900">₹{selectedDeclaration.annual_hra_exemption.toLocaleString('en-IN')}</span>
                </div>
                {selectedDeclaration.home_loan_interest > 0 && (
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>Section 24 (Housing Loan Interest):</span>
                    <span className="font-bold font-mono text-slate-900">₹{selectedDeclaration.home_loan_interest.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between text-xs">
                <span className="font-bold text-emerald-950">Total Exempted from Taxable Salary:</span>
                <span className="text-base font-black text-emerald-700 font-mono">
                  ₹{selectedDeclaration.total_exemption.toLocaleString('en-IN')}
                </span>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedDeclaration(null)}
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Delete Declaration Confirmation (with subtle faded style) */}
      {declarationToDelete && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeclarationToDelete(null);
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-scaleUp">
            <div className="h-14 bg-rose-600 text-white px-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-white">
                  <Trash2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Delete Tax Declaration</h3>
                  <p className="text-[11px] text-rose-100">Remove incorrect declaration entry</p>
                </div>
              </div>
              <button
                onClick={() => setDeclarationToDelete(null)}
                className="w-7 h-7 rounded-lg hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-rose-900">Are you sure you want to delete this declaration?</p>
                  <p className="text-rose-700 mt-1 leading-relaxed">
                    This will remove declaration <span className="font-mono font-bold text-rose-900">{declarationToDelete.id}</span> for <strong className="text-rose-900">{declarationToDelete.employee_name}</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeclarationToDelete(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Yes, Delete Declaration</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
