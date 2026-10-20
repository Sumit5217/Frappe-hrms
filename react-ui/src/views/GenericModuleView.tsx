import React, { useEffect, useState } from 'react';
import { ModuleTab } from '../types';
import { MetricCard, MetricVariant } from '../components/MetricCard';
import { frappeApi } from '../api/frappe';
import {
  Calendar,
  Clock,
  Receipt,
  Star,
  Wallet,
  Percent,
  Users,
  UserCheck,
  UserMinus,
  CheckCircle2,
  FileCheck,
  Zap,
  Building2,
  Layers,
  Briefcase,
  MapPin,
  ShieldAlert,
  Award,
  CalendarRange,
  Shuffle,
  Fingerprint,
  CheckSquare,
  Tag,
  CalendarDays,
  CreditCard,
  Plane,
  RefreshCw,
  Target,
  DollarSign,
  FileText,
  Shield,
  ArrowRight,
  Plus,
  AlertCircle,
} from 'lucide-react';

interface GenericModuleViewProps {
  module: ModuleTab;
  onSelectDocType: (doctype: string) => void;
  onNewRecord?: (doctype: string) => void;
}

interface ModuleMeta {
  title: string;
  themeColor: string;
  badgeBg: string;
  badgeBorder: string;
  badgeText: string;
  description: string;
  primaryDocType: string;
  card1Variant: MetricVariant;
  card2Variant: MetricVariant;
  card3Variant: MetricVariant;
  quickTip: string;
}

const MODULE_METAS: Record<ModuleTab, ModuleMeta> = {
  hr_setup: {
    title: 'HR Setup & Organization',
    themeColor: '#3E5ECC',
    badgeBg: 'bg-[#EDF3FF]',
    badgeBorder: 'border-[#BFDBFE]',
    badgeText: 'text-[#3E5ECC]',
    description: 'System configurations, company structure, branch locations, and organizational masters.',
    primaryDocType: 'Company',
    card1Variant: 'blue',
    card2Variant: 'green',
    card3Variant: 'amber',
    quickTip: 'Frappe HR manages company-wide master data and default accounts.',
  },
  tenure: {
    title: 'Tenure & Employee Lifecycle',
    themeColor: '#059669',
    badgeBg: 'bg-[#ECFDF5]',
    badgeBorder: 'border-[#A7F3D0]',
    badgeText: 'text-[#059669]',
    description: 'Manage employee onboarding milestones, grievances, training events, and exit procedures.',
    primaryDocType: 'Employee Onboarding',
    card1Variant: 'green',
    card2Variant: 'amber',
    card3Variant: 'purple',
    quickTip: 'Automated onboarding checklists trigger automatically for newly confirmed hires.',
  },
  recruitment: {
    title: 'Recruitment & Candidate Pipeline',
    themeColor: '#9333EA',
    badgeBg: 'bg-[#FAF5FF]',
    badgeBorder: 'border-[#E9D5FF]',
    badgeText: 'text-[#9333EA]',
    description: 'Job requisitions, applicant pipeline management, interview scoring, and digital appointment letters.',
    primaryDocType: 'Job Opening',
    card1Variant: 'purple',
    card2Variant: 'blue',
    card3Variant: 'rose',
    quickTip: 'Published Job Openings automatically generate public web apply pages.',
  },
  shift_and_attendance: {
    title: 'Shift Scheduling & Attendance Pulse',
    themeColor: '#D97706',
    badgeBg: 'bg-[#FFFBEB]',
    badgeBorder: 'border-[#FDE68A]',
    badgeText: 'text-[#D97706]',
    description: 'Biometric punch sync, mobile checkin with GPS coordinates, auto-attendance processing, and shift rotas.',
    primaryDocType: 'Attendance',
    card1Variant: 'teal',
    card2Variant: 'amber',
    card3Variant: 'blue',
    quickTip: 'Hourly background worker reconciles raw biometric punches into daily Attendance logs.',
  },
  leaves: {
    title: 'Leaves & Holiday Management',
    themeColor: '#E11D48',
    badgeBg: 'bg-[#FFF1F2]',
    badgeBorder: 'border-[#FECDD3]',
    badgeText: 'text-[#E11D48]',
    description: 'Leave policy allocations, compensatory off requests, immutable leave ledger, and encashment runs.',
    primaryDocType: 'Leave Application',
    card1Variant: 'rose',
    card2Variant: 'amber',
    card3Variant: 'green',
    quickTip: 'Leaves are tracked double-entry in the Leave Ledger for full auditability.',
  },
  expenses: {
    title: 'Expense Claims & Employee Advances',
    themeColor: '#0D9488',
    badgeBg: 'bg-[#F0FDFA]',
    badgeBorder: 'border-[#99F6E4]',
    badgeText: 'text-[#0D9488]',
    description: 'Travel vouchers, fuel claims, multi-level sanctioning, and direct ERPNext Journal Entry settlement.',
    primaryDocType: 'Expense Claim',
    card1Variant: 'amber',
    card2Variant: 'teal',
    card3Variant: 'purple',
    quickTip: 'Expense claims automatically generate Payment Entries in the accounting ledger.',
  },
  performance: {
    title: 'Performance & Appraisal Cycles',
    themeColor: '#CA8A04',
    badgeBg: 'bg-[#FEFCE8]',
    badgeBorder: 'border-[#FEF08A]',
    badgeText: 'text-[#CA8A04]',
    description: 'Continuous feedback, goal setting, Key Result Areas (KRAs), and 360-degree review evaluations.',
    primaryDocType: 'Appraisal',
    card1Variant: 'purple',
    card2Variant: 'green',
    card3Variant: 'blue',
    quickTip: 'Goals can be linked directly to Company Objectives and Key Result Areas.',
  },
  payroll: {
    title: 'Payroll & Compensation Engine',
    themeColor: '#16A34A',
    badgeBg: 'bg-[#F0FDF4]',
    badgeBorder: 'border-[#BBF7D0]',
    badgeText: 'text-[#16A34A]',
    description: 'Salary structures, formula evaluation, loan deductions, bank transfer advice, and payslip dispatch.',
    primaryDocType: 'Salary Slip',
    card1Variant: 'green',
    card2Variant: 'blue',
    card3Variant: 'amber',
    quickTip: 'Payroll Entry automatically validates employee bank accounts and active salary structures.',
  },
  tax_and_benefits: {
    title: 'Taxation & Statutory Benefits',
    themeColor: '#0284C7',
    badgeBg: 'bg-[#F0F9FF]',
    badgeBorder: 'border-[#BAE6FD]',
    badgeText: 'text-[#0284C7]',
    description: 'Income tax slabs, PF, ESI, Gratuity rules, Section 80C declarations, and Form 16 audit generation.',
    primaryDocType: 'Employee Tax Exemption Declaration',
    card1Variant: 'teal',
    card2Variant: 'rose',
    card3Variant: 'blue',
    quickTip: 'Supports Indian TDS calculations with marginal relief and HRA exemptions.',
  },
  complaints: {
    title: 'Complaint Management Engine',
    themeColor: '#DC2626',
    badgeBg: 'bg-[#FEF2F2]',
    badgeBorder: 'border-[#FECACA]',
    badgeText: 'text-[#DC2626]',
    description: 'Centralized ticket registry for B2B company disputes, B2C customer service, and internal incidents with SLA timers.',
    primaryDocType: 'Complaint',
    card1Variant: 'rose',
    card2Variant: 'amber',
    card3Variant: 'green',
    quickTip: 'SLA timers automatically flag overdue tickets and trigger daily escalation workflows.',
  },
};

interface ModuleDocTypeCard {
  doctype: string;
  label: string;
  description: string;
  icon: any;
}

const MODULE_DOCTYPES: Record<ModuleTab, ModuleDocTypeCard[]> = {
  hr_setup: [
    { doctype: 'Employee', label: 'Employees', description: 'Staff directory & master profiles', icon: Users },
    { doctype: 'Company', label: 'Company', description: 'Enterprise organizational entity', icon: Building2 },
    { doctype: 'Department', label: 'Department', description: 'Functional organizational divisions', icon: Layers },
    { doctype: 'Designation', label: 'Designation', description: 'Job titles and role hierarchy', icon: Briefcase },
    { doctype: 'Branch', label: 'Branch', description: 'Office and physical campus locations', icon: MapPin },
  ],
  tenure: [
    { doctype: 'Employee Onboarding', label: 'Employee Onboarding', description: 'New hire onboarding tasks & checklists', icon: UserCheck },
    { doctype: 'Employee Separation', label: 'Employee Separation', description: 'Offboarding, exit interviews & clearances', icon: UserMinus },
    { doctype: 'Employee Grievance', label: 'Employee Grievance', description: 'Workplace dispute & grievance tracking', icon: ShieldAlert },
    { doctype: 'Training Program', label: 'Training Program', description: 'Staff skill building & workshops', icon: Award },
  ],
  recruitment: [
    { doctype: 'Job Opening', label: 'Job Openings', description: 'Published vacancies & job descriptions', icon: Briefcase },
    { doctype: 'Job Applicant', label: 'Job Applicants', description: 'Candidate resumes & application pipeline', icon: Users },
    { doctype: 'Interview', label: 'Interviews', description: 'Candidate interview rounds & scoring', icon: Calendar },
    { doctype: 'Job Offer', label: 'Job Offers', description: 'Drafted and released appointment offers', icon: FileCheck },
  ],
  shift_and_attendance: [
    { doctype: 'Attendance', label: 'Attendance Logs', description: 'Daily employee presence and check-ins', icon: Clock },
    { doctype: 'Shift Type', label: 'Shift Types', description: 'Configured working shifts and timings', icon: CalendarRange },
    { doctype: 'Shift Request', label: 'Shift Requests', description: 'Employee shift swap and change requests', icon: Shuffle },
    { doctype: 'Employee Checkin', label: 'Biometric Check-ins', description: 'Raw biometric and GPS punch logs', icon: Fingerprint },
  ],
  leaves: [
    { doctype: 'Leave Application', label: 'Leave Applications', description: 'Employee PTO, casual, and sick leave requests', icon: Calendar },
    { doctype: 'Leave Allocation', label: 'Leave Allocations', description: 'Annual quota and leave entitlements', icon: CheckSquare },
    { doctype: 'Leave Type', label: 'Leave Types', description: 'Configured leave categories and policy rules', icon: Tag },
    { doctype: 'Holiday List', label: 'Holiday Calendars', description: 'Official corporate and national holidays', icon: CalendarDays },
  ],
  expenses: [
    { doctype: 'Expense Claim', label: 'Expense Claims', description: 'Reimbursement vouchers and receipts', icon: Receipt },
    { doctype: 'Employee Advance', label: 'Employee Advances', description: 'Cash advances and imprest accounts', icon: CreditCard },
    { doctype: 'Expense Claim Type', label: 'Expense Categories', description: 'Travel, meals, fuel, and supplies codes', icon: Tag },
    { doctype: 'Travel Request', label: 'Travel Requests', description: 'Business travel sanctioning & itineraries', icon: Plane },
  ],
  performance: [
    { doctype: 'Appraisal', label: 'Performance Appraisals', description: 'Employee scorecards and performance reviews', icon: Star },
    { doctype: 'Appraisal Cycle', label: 'Appraisal Cycles', description: 'Quarterly and annual review timeframes', icon: RefreshCw },
    { doctype: 'Goal', label: 'Goals & Targets', description: 'Tracked OKRs and individual milestones', icon: Target },
    { doctype: 'KRA', label: 'Key Result Areas (KRAs)', description: 'Job role result expectations', icon: Award },
  ],
  payroll: [
    { doctype: 'Salary Slip', label: 'Salary Slips', description: 'Monthly payslips and net pay calculations', icon: Wallet },
    { doctype: 'Payroll Entry', label: 'Payroll Runs', description: 'Batch monthly payroll processing', icon: DollarSign },
    { doctype: 'Salary Structure', label: 'Salary Structures', description: 'Base salary formulas and pay component rules', icon: Layers },
    { doctype: 'Salary Component', label: 'Salary Components', description: 'Earnings and deductions catalog', icon: Tag },
  ],
  tax_and_benefits: [
    { doctype: 'Employee Tax Exemption Declaration', label: 'Tax Declarations', description: 'Section 80C declarations and planned investments', icon: FileText },
    { doctype: 'Employee Benefit Application', label: 'Benefit Applications', description: 'Flexible benefit plans and claims', icon: Percent },
    { doctype: 'Income Tax Slab', label: 'Tax Slabs', description: 'Statutory tax brackets and rates', icon: Shield },
  ],
  complaints: [
    { doctype: 'Complaint', label: 'All Complaints', description: 'Master registry of B2B, B2C, and internal issues', icon: AlertCircle },
    { doctype: 'Complaint', label: 'B2B Complaints', description: 'Corporate vendor & business contract complaints', icon: Building2 },
    { doctype: 'Complaint', label: 'B2C Complaints', description: 'Retail and consumer service requests', icon: Users },
  ],
};

export const GenericModuleView: React.FC<GenericModuleViewProps> = ({
  module,
  onSelectDocType,
  onNewRecord,
}) => {
  const meta = MODULE_METAS[module] || MODULE_METAS.tenure;
  const doctypes = MODULE_DOCTYPES[module] || [];
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<{
    metric1: { label: string; value: string | number; subtitle: string };
    metric2: { label: string; value: string | number; subtitle: string };
    metric3: { label: string; value: string | number; subtitle: string };
  }>({
    metric1: { label: 'Loading...', value: '...', subtitle: 'Frappe DB' },
    metric2: { label: 'Loading...', value: '...', subtitle: 'Frappe DB' },
    metric3: { label: 'Loading...', value: '...', subtitle: 'Frappe DB' },
  });

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    frappeApi.getModuleMetrics(module).then((res) => {
      if (isMounted) {
        setMetrics(res);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [module]);

  const getModuleIcon = () => {
    switch (module) {
      case 'tenure': return UserCheck;
      case 'recruitment': return Users;
      case 'shift_and_attendance': return Clock;
      case 'leaves': return Calendar;
      case 'expenses': return Receipt;
      case 'performance': return Star;
      case 'payroll': return Wallet;
      case 'tax_and_benefits': return Percent;
      case 'complaints': return AlertCircle;
      default: return Users;
    }
  };

  const Icon = getModuleIcon();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 1. Colorful Module Feature Banner */}
      <section
        className="nv-card border border-border flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4"
        style={{
          background: `linear-gradient(135deg, #FFFFFF 60%, ${meta.themeColor}12 100%)`,
        }}
      >
        <div className="flex items-start gap-3.5">
          <div
            className="w-11 h-11 rounded-btn flex items-center justify-center flex-shrink-0"
            style={{
              backgroundColor: `${meta.themeColor}18`,
              color: meta.themeColor,
            }}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-serif text-2xl font-bold text-content-main tracking-tight">
                {meta.title}
              </h2>
              <span
                className={`nv-chip text-[10.5px] border ${meta.badgeBg} ${meta.badgeBorder} ${meta.badgeText}`}
              >
                Live Backend Connected
              </span>
            </div>
            <p className="text-xs font-sans text-content-muted mt-1.5 max-w-xl leading-relaxed">
              {meta.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => onSelectDocType(meta.primaryDocType)}
          className="btn-primary text-xs h-9 px-4 flex-shrink-0 cursor-pointer shadow-xs"
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Open {meta.primaryDocType}</span>
        </button>
      </section>

      {/* 2. Top Overview Real Frappe Metric Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label={metrics.metric1.label}
          value={loading ? '...' : metrics.metric1.value}
          subtitle={metrics.metric1.subtitle}
          variant={meta.card1Variant}
          icon={Icon}
        />
        <MetricCard
          label={metrics.metric2.label}
          value={loading ? '...' : metrics.metric2.value}
          subtitle={metrics.metric2.subtitle}
          variant={meta.card2Variant}
          icon={Icon}
        />
        <MetricCard
          label={metrics.metric3.label}
          value={loading ? '...' : metrics.metric3.value}
          subtitle={metrics.metric3.subtitle}
          variant={meta.card3Variant}
          icon={Icon}
        />
      </section>

      {/* 3. Operational Best Practice Box */}
      <section className="p-4 rounded-card bg-surface-lowest border border-[rgba(140,150,175,0.14)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-content-main font-semibold font-label">
          <CheckCircle2 className="w-4 h-4 text-[#059669] flex-shrink-0" />
          <span>Frappe HR System Note:</span>
        </div>
        <div className="flex-1 font-sans text-content-muted">
          {meta.quickTip}
        </div>
        <div className="flex items-center gap-1.5 text-primary font-semibold cursor-pointer hover:underline">
          <FileCheck className="w-3.5 h-3.5" />
          <span>Docs Reference</span>
        </div>
      </section>

      {/* 4. Module-Specific Documents & Management Grid */}
      <section className="pt-2">
        <div className="flex items-baseline justify-between mb-4">
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: meta.themeColor }}
            ></span>
            <h3 className="font-serif text-lg font-bold text-content-main tracking-tight">
              {meta.title} Records & Documents
            </h3>
          </div>
          <span className="font-label text-xs text-content-muted">
            Directly synced with Frappe database
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {doctypes.map((doc, idx) => {
            const DocIcon = doc.icon;
            return (
              <div
                key={`${doc.doctype}-${idx}`}
                onClick={() => onSelectDocType(doc.doctype)}
                className="nv-card bg-surface-lowest border border-[rgba(140,150,175,0.14)] p-4.5 flex flex-col justify-between hover:border-primary/40 transition-all cursor-pointer group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <div
                      className="w-8.5 h-8.5 rounded-btn flex items-center justify-center transition-transform group-hover:scale-105 shadow-xs"
                      style={{
                        backgroundColor: `${meta.themeColor}12`,
                        color: meta.themeColor,
                      }}
                    >
                      <DocIcon className="w-4 h-4" />
                    </div>
                    <span className="text-content-muted group-hover:text-primary transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-content-main group-hover:text-primary transition-colors">
                    {doc.label}
                  </h4>
                  <p className="text-[11.5px] font-sans text-content-muted mt-1.5 leading-relaxed">
                    {doc.description}
                  </p>
                </div>

                <div className="mt-4.5 pt-3 border-t border-[rgba(140,150,175,0.10)] flex items-center justify-between text-xs">
                  <span className="font-semibold text-primary group-hover:underline">
                    View Records
                  </span>
                  {onNewRecord && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNewRecord(doc.doctype);
                      }}
                      title={`Add new ${doc.doctype}`}
                      className="p-1 rounded-btn text-content-muted hover:text-primary hover:bg-[#EEF4FC] transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
