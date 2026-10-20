import React, { useState } from 'react';
import {
  Banknote,
  FileCheck2,
  Users,
  Sliders,
  Layers,
  Coins,
  LayoutDashboard,
  ArrowLeft,
  Sparkles,
  Scale,
} from 'lucide-react';
import { Employee } from '../types';
import { PayrollDashboard } from '../components/payroll/PayrollDashboard';
import { PayrollEntryView } from '../components/payroll/PayrollEntryView';
import { SalarySlipView } from '../components/payroll/SalarySlipView';
import { SalaryStructureAssignmentView } from '../components/payroll/SalaryStructureAssignmentView';
import { SalaryStructureView } from '../components/payroll/SalaryStructureView';
import { SalaryComponentView } from '../components/payroll/SalaryComponentView';
import { AdditionalSalaryView } from '../components/payroll/AdditionalSalaryView';
import { PayrollWizardModal } from '../components/payroll/PayrollWizardModal';
import { TaxRegimeSimulator } from '../components/payroll/TaxRegimeSimulator';
import { ReportView } from './ReportView';
import { DocTypeListView } from './DocTypeListView';
import { SettingsView } from './SettingsView';

interface PayrollMasterViewProps {
  activeSubItem: string;
  activeDocType?: string | null;
  activeReportName?: string | null;
  employees: Employee[];
  onNavigate: (subItem: string, docType?: string, reportName?: string) => void;
}

export const PayrollMasterView: React.FC<PayrollMasterViewProps> = ({
  activeSubItem,
  activeDocType,
  activeReportName,
  employees,
  onNavigate,
}) => {
  const [isWizardOpen, setIsWizardOpen] = useState(false);

  // Navigation tabs for quick hopping
  const navTabs = [
    { id: 'Dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'Payroll Wizard', label: '⚡ 5-Step Payroll Wizard', icon: Sparkles },
    { id: 'Tax Simulator', label: 'PF • PT • TDS Simulator', icon: Scale },
    { id: 'Payroll Entry', label: 'Payroll Entries', icon: Banknote },
    { id: 'Salary Slip', label: 'Salary Slips', icon: FileCheck2 },
    { id: 'Salary Structure Assignment', label: 'CTC Assignments', icon: Users },
    { id: 'Salary Structure', label: 'Structures & Formulas', icon: Sliders },
    { id: 'Salary Component', label: 'Components', icon: Layers },
    { id: 'Additional Salary', label: 'Adjustments & Bonus', icon: Coins },
  ];

  // Helper to determine current active section
  const currentKey = activeReportName
    ? 'Report'
    : (activeDocType || activeSubItem || 'Dashboard');

  const normalizedKey = currentKey.toLowerCase();

  const isOverview =
    normalizedKey === 'dashboard' ||
    normalizedKey === 'home' ||
    normalizedKey === 'payroll' ||
    normalizedKey === '';

  const renderContent = () => {
    // 1. Report View
    if (activeReportName) {
      return (
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => onNavigate('Dashboard')}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Payroll Hub
            </button>
          </div>
          <ReportView reportName={activeReportName} />
        </div>
      );
    }

    // 2. Settings View
    if (
      activeDocType === 'Payroll Settings' ||
      normalizedKey === 'settings' ||
      normalizedKey === 'payroll settings'
    ) {
      return <SettingsView doctype="Payroll Settings" />;
    }

    // 2.5. Tax Regime Simulator (PF, PT, TDS)
    if (
      normalizedKey.includes('tax simulator') ||
      normalizedKey.includes('simulator') ||
      normalizedKey === 'tax_simulator'
    ) {
      return <TaxRegimeSimulator />;
    }

    // 3. Payroll Entry
    if (normalizedKey.includes('payroll entry') || normalizedKey === 'payroll_entry') {
      return (
        <PayrollEntryView
          employees={employees}
          onNavigateToSlips={() => onNavigate('Salary Slip', 'Salary Slip')}
        />
      );
    }

    // 4. Salary Slip
    if (normalizedKey.includes('salary slip') || normalizedKey === 'salary_slip') {
      return <SalarySlipView employees={employees} />;
    }

    // 5. Salary Structure Assignment
    if (
      normalizedKey.includes('assignment') ||
      normalizedKey.includes('salary structure assignment')
    ) {
      return <SalaryStructureAssignmentView employees={employees} />;
    }

    // 6. Salary Structure (Rules & Formulas)
    if (normalizedKey === 'salary structure' || normalizedKey === 'salary_structure') {
      return <SalaryStructureView />;
    }

    // 7. Salary Component
    if (normalizedKey.includes('component')) {
      return <SalaryComponentView />;
    }

    // 8. Additional Salary
    if (
      normalizedKey.includes('additional salary') ||
      normalizedKey.includes('bonus') ||
      normalizedKey.includes('adjustment')
    ) {
      return <AdditionalSalaryView employees={employees} />;
    }

    // 9. Any other DocType in Payroll (e.g., Income Tax Slab, Employee Benefit Application, etc.)
    if (activeDocType && !isOverview) {
      return <DocTypeListView doctype={activeDocType} />;
    }

    // Default: Dashboard Overview
    return (
      <PayrollDashboard
        employees={employees}
        onNavigate={onNavigate}
        onOpenWizard={() => setIsWizardOpen(true)}
        onOpenSimulator={() => onNavigate('Tax Simulator')}
      />
    );
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Sub-navigation pill bar */}
      <div className="bg-white p-2 rounded-2xl border border-border-light shadow-xs flex items-center gap-1.5 overflow-x-auto scrollbar-none">
        {navTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive =
            (tab.id === 'Dashboard' && isOverview) ||
            (!isOverview &&
              (normalizedKey.includes(tab.id.toLowerCase()) ||
                tab.id.toLowerCase().includes(normalizedKey)));

          return (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'Payroll Wizard') {
                  setIsWizardOpen(true);
                } else {
                  onNavigate(tab.id, tab.id === 'Dashboard' ? undefined : tab.id);
                }
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary text-white shadow-xs'
                  : 'text-content-subtle hover:text-content-main hover:bg-surface-elevated'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Payroll Content */}
      <div>{renderContent()}</div>

      {/* greytHR-Style 5-Step Guided Payroll Run Wizard Modal */}
      <PayrollWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        employees={employees}
        onComplete={() => onNavigate('Salary Slip', 'Salary Slip')}
      />
    </div>
  );
};
