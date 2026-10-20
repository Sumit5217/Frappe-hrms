import React, { useState, useRef, useEffect } from 'react';
import { UserPlus, RefreshCw, PanelLeftOpen, PanelLeftClose, MoreHorizontal, Download } from 'lucide-react';
import { ModuleTab } from '../types';

interface HeaderProps {
  activeTab: ModuleTab;
  activeSubItem?: string;
  onAddEmployee: () => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
  isMainSidebarOpen?: boolean;
  onToggleMainSidebar?: () => void;
  isSubSidebarOpen?: boolean;
  onToggleSubSidebar?: () => void;
}

const TAB_TITLES: Record<ModuleTab, { title: string; subtitle: string }> = {
  hr_setup: {
    title: 'HR Setup',
    subtitle: 'High-level overview of enterprise headcount, quarterly turnover, and attendance pulse.',
  },
  tenure: {
    title: 'Tenure & Lifecycle',
    subtitle: 'Manage employee lifecycles, promotions, transfers, and separation workflows.',
  },
  recruitment: {
    title: 'Recruitment & Hiring',
    subtitle: 'Track job openings, applicant pipelines, interview rounds, and job offers.',
  },
  shift_and_attendance: {
    title: 'Shift & Attendance',
    subtitle: 'Manage shift rosters, biometric punch sync, and daily attendance logs.',
  },
  leaves: {
    title: 'Leaves & Holidays',
    subtitle: 'Review leave applications, ledger balances, and annual holiday calendars.',
  },
  expenses: {
    title: 'Expense Claims & Advances',
    subtitle: 'Process employee reimbursements, travel claims, and salary advances.',
  },
  performance: {
    title: 'Performance & Appraisals',
    subtitle: 'Align goals, KRAs, employee feedback, and annual review cycles.',
  },
  payroll: {
    title: 'Payroll Management',
    subtitle: 'Salary structure assignments, monthly salary slips, and payroll entries.',
  },
  tax_and_benefits: {
    title: 'Taxation & Employee Benefits',
    subtitle: 'Income tax slabs, deduction declarations, and statutory compliance.',
  },
  complaints: {
    title: 'Complaint Management System',
    subtitle: 'Track and resolve B2B, B2C, and internal complaints with automated SLA enforcement.',
  },
};

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  activeSubItem,
  onAddEmployee,
  onRefresh,
  isRefreshing,
  isMainSidebarOpen = true,
  onToggleMainSidebar,
  isSubSidebarOpen,
  onToggleSubSidebar,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const current = TAB_TITLES[activeTab];
  const isSubPage = activeSubItem && activeSubItem !== 'Home' && activeSubItem !== 'Dashboard';

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="mb-6">
      {/* Breadcrumb & Live Status Bar matching Frappe Desk */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 font-label text-xs tracking-wide text-content-muted">
          {/* Mini Symbol: Toggle Main Sidebar */}
          {onToggleMainSidebar && (
            <button
              type="button"
              onClick={onToggleMainSidebar}
              className="h-7 w-7 flex items-center justify-center rounded-lg text-content-muted hover:text-content-main hover:bg-slate-100 border border-slate-200 transition-all cursor-pointer shadow-2xs"
              title={isMainSidebarOpen ? "Hide Main Sidebar" : "Show Main Sidebar"}
            >
              {isMainSidebarOpen ? (
                <PanelLeftClose className="w-3.5 h-3.5" />
              ) : (
                <PanelLeftOpen className="w-3.5 h-3.5 text-primary" />
              )}
            </button>
          )}

          {/* Mini Symbol: Toggle Sub-Sidebar / Menu */}
          {onToggleSubSidebar && (
            <button
              type="button"
              onClick={onToggleSubSidebar}
              className={`h-7 px-2 flex items-center gap-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer shadow-2xs ${
                isSubSidebarOpen
                  ? 'bg-slate-50 text-content-muted hover:text-content-main hover:bg-slate-100 border-slate-200'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200'
              }`}
              title={isSubSidebarOpen ? "Hide Sub-menu Bar" : "Show Sub-menu Bar"}
            >
              {isSubSidebarOpen ? (
                <>
                  <PanelLeftClose className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Hide Bar</span>
                </>
              ) : (
                <>
                  <PanelLeftOpen className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-[11px] font-medium">Show Bar</span>
                </>
              )}
            </button>
          )}

          <span className="font-semibold text-primary hover:underline cursor-pointer">Frappe HR</span>
          <span className="text-content-subtle">/</span>
          <span className="text-content-muted">{current.title}</span>
          {isSubPage && (
            <>
              <span className="text-content-subtle">/</span>
              <span className="text-content-main font-semibold">{activeSubItem}</span>
            </>
          )}
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Download Excel Button - Shown exclusively in HR Setup and Payroll */}
          {(activeTab === 'hr_setup' || activeTab === 'payroll') && (
            <a
              href="/Employee_and_Salary_Details.xlsx"
              download="Employee_and_Salary_Details.xlsx"
              className="h-8.5 px-3 rounded-lg text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Download Sample Employee & Salary Excel Template (.xlsx)"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Excel</span>
            </a>
          )}

          {/* Frappe Desk Three Dots Menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="w-8 h-8 rounded-md flex items-center justify-center text-content-muted hover:text-content-main hover:bg-[#F1F5F9] transition-colors"
              title="Workspace Options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-1 w-52 rounded-lg bg-white border border-[#E2E8F0] shadow-lg py-1.5 z-50 text-xs font-sans animate-scaleUp">
                {(activeTab === 'hr_setup' || activeTab === 'payroll') && (
                  <a
                    href="/Employee_and_Salary_Details.xlsx"
                    download="Employee_and_Salary_Details.xlsx"
                    onClick={() => setIsMenuOpen(false)}
                    className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] flex items-center gap-2 text-emerald-700 font-medium"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Download Excel</span>
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onRefresh();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] flex items-center gap-2 text-[#334155]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Reload Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onAddEmployee();
                  }}
                  className="w-full px-3.5 py-2 text-left hover:bg-[#F8FAFC] flex items-center gap-2 text-[#334155]"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>+ Add Employee</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Page Title matching Frappe Desk Screenshot 1 */}
      <div className="flex items-baseline justify-between gap-4 pb-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight leading-tight">
            {isSubPage ? activeSubItem : current.title}
          </h1>
          {isSubPage && (
            <p className="text-xs text-slate-500 mt-1 font-sans font-medium">
              Managing {activeSubItem} records in Frappe database.
            </p>
          )}
        </div>
      </div>
    </header>
  );
};
