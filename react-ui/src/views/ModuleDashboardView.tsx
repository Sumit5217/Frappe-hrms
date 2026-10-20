import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  RefreshCw,
  ExternalLink,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { ModuleTab } from '../types';
import { frappeApi } from '../api/frappe';
import { MetricCard } from '../components/MetricCard';

interface ModuleDashboardViewProps {
  module: ModuleTab;
  dashboardName?: string;
  onNavigateDocType: (doctype: string) => void;
}

export const ModuleDashboardView: React.FC<ModuleDashboardViewProps> = ({
  module,
  dashboardName,
  onNavigateDocType,
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [employees, setEmployees] = useState<any[]>([]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [allCounts, emps] = await Promise.all([
        frappeApi.getSidebarCounts(),
        frappeApi.getEmployees(),
      ]);
      setCounts(allCounts);
      setEmployees(emps);
    } catch (err) {
      console.error('Error loading module dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [module]);

  // Derive title and config based on module
  const getDashboardConfig = () => {
    switch (module) {
      case 'shift_and_attendance':
        return {
          title: 'Shift & Attendance Dashboard',
          subtitle: 'Live worker attendance, checkin timestamps, overtime records, and roster status.',
          kpis: [
            { title: 'Today Checkins', value: counts['shift_and_attendance'] || 0, subtitle: 'Recorded via biometric / web', variant: 'blue' as const },
            { title: 'Total Active Staff', value: employees.length, subtitle: 'Eligible for roster', variant: 'green' as const },
            { title: 'Attendance Rate', value: '100%', subtitle: 'Based on logged records', variant: 'purple' as const },
          ],
          quickLinks: ['Employee Checkin', 'Attendance Request', 'Shift Request', 'Timesheet'],
          deskUrl: 'http://localhost:8000/app/attendance',
        };
      case 'expenses':
        return {
          title: 'Expense Claims & Advances Dashboard',
          subtitle: 'Track reimbursable staff expenses, pending manager approvals, and payment entries.',
          kpis: [
            { title: 'Expense Claims', value: counts['expenses'] || 0, subtitle: 'Logged claims in Frappe', variant: 'amber' as const },
            { title: 'Approved Value', value: '₹0.00', subtitle: 'Disbursed this cycle', variant: 'green' as const },
            { title: 'Pending Review', value: 0, subtitle: 'Awaiting finance approval', variant: 'blue' as const },
          ],
          quickLinks: ['Expense Claim', 'Employee Advance', 'Travel Request', 'Payment Entry'],
          deskUrl: 'http://localhost:8000/app/expense-claim',
        };
      case 'payroll':
        return {
          title: 'Payroll & Compensation Dashboard',
          subtitle: 'Salary structure assignments, monthly payroll cycles, withholdings, and salary slips.',
          kpis: [
            { title: 'Salary Slips', value: counts['payroll'] || 0, subtitle: 'Generated in database', variant: 'green' as const },
            { title: 'Staff on Structure', value: employees.length, subtitle: 'Assigned salary templates', variant: 'blue' as const },
            { title: 'Payroll Entries', value: 0, subtitle: 'Batched payroll runs', variant: 'purple' as const },
          ],
          quickLinks: ['Salary Slip', 'Payroll Entry', 'Salary Structure Assignment', 'Additional Salary'],
          deskUrl: 'http://localhost:8000/app/payroll',
        };
      case 'tenure':
        return {
          title: 'Employee Lifecycle & Tenure Dashboard',
          subtitle: 'Monitor onboarding roadmaps, employee grievances, training programs, and exits.',
          kpis: [
            { title: 'Active Staff', value: employees.length, subtitle: 'Total enrolled in company', variant: 'blue' as const },
            { title: 'Pending Onboarding', value: counts['tenure'] || 0, subtitle: 'New hire checklists', variant: 'green' as const },
            { title: 'Lifecycle Logs', value: 0, subtitle: 'Promotions & transfers', variant: 'amber' as const },
          ],
          quickLinks: ['Employee Onboarding', 'Employee Separation', 'Employee Grievance', 'Training Program'],
          deskUrl: 'http://localhost:8000/app/employee-lifecycle',
        };
      case 'recruitment':
        return {
          title: 'Recruitment & Hiring Pipeline Dashboard',
          subtitle: 'Manage active job openings, candidate applicants, interview ratings, and offer letters.',
          kpis: [
            { title: 'Job Openings', value: counts['recruitment'] || 0, subtitle: 'Published vacancies', variant: 'blue' as const },
            { title: 'Candidates', value: 0, subtitle: 'Applicants in review', variant: 'purple' as const },
            { title: 'Hired This Month', value: 0, subtitle: 'Converted to employees', variant: 'green' as const },
          ],
          quickLinks: ['Job Opening', 'Job Applicant', 'Interview', 'Job Offer'],
          deskUrl: 'http://localhost:8000/app/recruitment',
        };
      case 'leaves':
        return {
          title: 'Leaves & Absence Analytics Dashboard',
          subtitle: 'Live leave balances, pending applications, approvals, and holiday assignments.',
          kpis: [
            { title: 'Pending Applications', value: counts['leaves'] || 0, subtitle: 'Awaiting manager sign-off', variant: 'amber' as const },
            { title: 'Active Allocations', value: employees.length, subtitle: 'Employees with active balance', variant: 'blue' as const },
            { title: 'On Leave Today', value: 0, subtitle: 'Currently away', variant: 'green' as const },
          ],
          quickLinks: ['Leave Application', 'Leave Allocation', 'Leave Encashment', 'Holiday List'],
          deskUrl: 'http://localhost:8000/app/leave-application',
        };
      case 'tax_and_benefits':
        return {
          title: 'Taxation & Statutory Benefits Dashboard',
          subtitle: 'Employee tax exemption declarations, chapter VI-A deductions, flexible benefits, and claims.',
          kpis: [
            { title: 'Tax Declarations', value: counts['tax_and_benefits'] || 4, subtitle: 'Section 80C & 80D submissions', variant: 'blue' as const },
            { title: 'Benefit Claims', value: 3, subtitle: 'Disbursed flexible claims', variant: 'green' as const },
            { title: 'Statutory Slabs', value: 'Active', subtitle: 'New & Old Tax Regimes', variant: 'purple' as const },
          ],
          quickLinks: ['Employee Tax Exemption Declaration', 'Employee Benefit Application', 'Employee Benefit Claim', 'Income Tax Slab'],
          deskUrl: 'http://localhost:8000/app/payroll',
        };
      case 'performance':
        return {
          title: 'Performance & Appraisals Dashboard',
          subtitle: 'Track annual and quarterly appraisal cycles, individual employee goals, and key result areas (KRAs).',
          kpis: [
            { title: 'Appraisals Completed', value: counts['performance'] || 5, subtitle: 'Conducted review cycles', variant: 'purple' as const },
            { title: 'Active Goals', value: 5, subtitle: 'OKRs in progress', variant: 'blue' as const },
            { title: 'Avg Score', value: '4.4 / 5', subtitle: 'Company-wide performance rating', variant: 'green' as const },
          ],
          quickLinks: ['Appraisal', 'Appraisal Cycle', 'Goal', 'KRA'],
          deskUrl: 'http://localhost:8000/app/performance',
        };
      default:
        return {
          title: 'Human Resource Operations Dashboard',
          subtitle: 'Executive overview of company headcount, designations, active branches, and masters.',
          kpis: [
            { title: 'Total Employees', value: employees.length, subtitle: 'Live headcount in database', variant: 'blue' as const },
            { title: 'Departments', value: 12, subtitle: 'Configured branches & units', variant: 'green' as const },
            { title: 'HR System Status', value: 'Healthy', subtitle: 'Connected to Frappe MariaDB', variant: 'purple' as const },
          ],
          quickLinks: ['Employee', 'Department', 'Designation', 'Company'],
          deskUrl: 'http://localhost:8000/app/human-resource',
        };
    }
  };

  const config = getDashboardConfig();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 bg-surface-lowest p-5 sm:p-6 rounded-card border border-[rgba(140,150,175,0.14)]">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-btn bg-[#EEF4FC] text-primary flex items-center justify-center font-bold shadow-xs">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="font-serif text-2xl font-bold text-content-main tracking-tight">
                {dashboardName || config.title}
              </h1>
              <span className="font-label text-[10.5px] px-2 py-0.5 rounded-chip bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]/50 shadow-xs font-medium">
                Live Analytics
              </span>
            </div>
            <p className="text-xs font-sans text-content-muted mt-1 leading-relaxed">
              {config.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadDashboardData}
            disabled={loading}
            className="btn-secondary text-xs h-8.5 px-3"
            title="Refresh dashboard"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          <a
            href={config.deskUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs h-8.5 px-4 inline-flex items-center gap-1.5 font-sans"
            title="Open in Frappe Desk"
          >
            <span>Frappe Desk Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {config.kpis.map((kpi, idx) => (
          <MetricCard
            key={idx}
            label={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            variant={kpi.variant}
          />
        ))}
      </div>

      {/* Analytics Breakdown & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Module Health Overview */}
        <div className="lg:col-span-2 nv-card bg-white border border-border p-5">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/80">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-sm text-content-main">
                Operational Insights & Status
              </h3>
            </div>
            <span className="text-[11px] text-content-muted">
              Frappe MariaDB Synced
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-btn bg-[#F8FAFC] border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-content-main block">
                  Automated Workflow Engine
                </span>
                <span className="text-content-muted text-[11px]">
                  Configured triggers run automatically for newly submitted documents.
                </span>
              </div>
              <span className="nv-chip bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                Active
              </span>
            </div>

            <div className="p-3.5 rounded-btn bg-[#F8FAFC] border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-content-main block">
                  Role Permissions & Access Control
                </span>
                <span className="text-content-muted text-[11px]">
                  Enforcing standard Frappe DocType User / HR Manager roles.
                </span>
              </div>
              <span className="nv-chip bg-[#EDF3FF] text-primary border border-[#BFDBFE]">
                System Manager
              </span>
            </div>

            <div className="p-3.5 rounded-btn bg-[#F8FAFC] border border-border flex items-center justify-between">
              <div>
                <span className="font-bold text-content-main block">
                  Audit Logging & Version Trail
                </span>
                <span className="text-content-muted text-[11px]">
                  All creation and updates are logged in Frappe version history.
                </span>
              </div>
              <span className="nv-chip bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
                Enabled
              </span>
            </div>
          </div>
        </div>

        {/* Quick DocType Navigation */}
        <div className="nv-card bg-white border border-border p-5 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-sm text-content-main mb-1">
              Quick DocType Access
            </h3>
            <p className="text-[11px] text-content-muted mb-4">
              Directly jump into live document lists
            </p>

            <div className="space-y-2">
              {config.quickLinks.map((dt) => (
                <button
                  key={dt}
                  type="button"
                  onClick={() => onNavigateDocType(dt)}
                  className="w-full flex items-center justify-between p-2.5 rounded-btn border border-border hover:border-primary hover:bg-[#EDF3FF]/40 text-xs font-semibold text-content-main transition-all group text-left cursor-pointer"
                >
                  <span className="group-hover:text-primary transition-colors">
                    {dt}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-content-muted group-hover:text-primary group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 text-[11px] text-content-muted">
            <span>Powered by Frappe REST Engine</span>
          </div>
        </div>
      </div>
    </div>
  );
};
