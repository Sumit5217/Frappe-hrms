import React from 'react';
import { DepartmentChart } from '../components/DepartmentChart';
import { MetricCard } from '../components/MetricCard';
import { EmployeeTable } from '../components/EmployeeTable';
import { DepartmentHeadcount, Employee, HRKPIs, ModuleTab } from '../types';
import { Users, UserPlus, FileSpreadsheet } from 'lucide-react';

interface HRSetupDashboardProps {
  kpis: HRKPIs;
  departments: DepartmentHeadcount[];
  employees: Employee[];
  onAddEmployee: () => void;
  onNavigateTab: (tab: ModuleTab) => void;
  onEditEmployee?: (employee: Employee) => void;
  onOpenBulkImport?: () => void;
}

export const HRSetupDashboard: React.FC<HRSetupDashboardProps> = ({
  kpis,
  departments,
  employees,
  onAddEmployee,
  onEditEmployee,
  onOpenBulkImport,
}) => {
  // Compute actual total employees and departments from props
  const effectiveTotalEmployees = employees ? employees.length : (kpis?.totalEmployees || 0);
  const totalDepts = departments ? departments.length : 0;

  return (
    <div className="space-y-6">
      {/* 1. Executive Top Hero Banner with Prominent Total Employees Count */}
      <div className="bg-gradient-to-r from-[#0C1B33] via-[#102A4E] to-[#163866] rounded-2xl p-6 sm:p-7 text-white shadow-xl shadow-blue-950/10 border border-[#1E40AF]/30 relative overflow-hidden">
        {/* Ambient decorative glow */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-cyan-400/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-14 right-32 w-56 h-56 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-[#38BDF8]/20 text-[#38BDF8] border border-[#38BDF8]/30 shadow-xs">
                Core HR Workspace
              </span>
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[11px] text-emerald-300 font-semibold">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Frappe DB Synced
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading tracking-tight text-white flex items-center gap-2.5">
              HR Setup & Organization
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-sans leading-relaxed">
              Manage enterprise structure, departments, designations, and employee directory with live synchronization.
            </p>
          </div>

          {/* Prominent Total Employees Stat Card in Header */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3.5 flex items-center gap-4 shadow-xl flex-shrink-0">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/30 flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-[11px] uppercase tracking-wider text-slate-300 font-bold font-heading">
                  Total Employees
                </div>
                <div className="text-3xl font-extrabold font-heading text-white leading-tight flex items-baseline gap-2">
                  <span>{effectiveTotalEmployees}</span>
                  <span className="text-xs font-semibold text-cyan-300">Headcount</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0 min-w-[145px]">
              <button
                type="button"
                onClick={onAddEmployee}
                className="bg-blue-600 hover:bg-blue-500 active:scale-98 text-white text-xs h-9 px-4 rounded-xl flex items-center justify-center gap-2 font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer whitespace-nowrap w-full"
              >
                <UserPlus className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="whitespace-nowrap">Add Employee</span>
              </button>
              {onOpenBulkImport && (
                <button
                  type="button"
                  onClick={onOpenBulkImport}
                  className="bg-white/10 hover:bg-white/20 active:scale-98 text-white border border-white/20 text-xs h-9 px-4 rounded-xl flex items-center justify-center gap-2 font-semibold transition-all cursor-pointer backdrop-blur-sm whitespace-nowrap w-full"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-cyan-300 flex-shrink-0" />
                  <span className="whitespace-nowrap">Bulk Import (XL)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Employee Wise & Department Wise Interactive Analytics Graph */}
      <section>
        <DepartmentChart data={departments} employees={employees} />
      </section>

      {/* 3. Three Metric Cards with Live Headcounts */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          label="Total Employees"
          value={effectiveTotalEmployees}
          subtitle={`Active staff across ${totalDepts} departments`}
        />
        <MetricCard
          label="Employees Joining (This Quarter)"
          value={kpis.joiningThisQuarter}
          subtitle="New additions in Q4"
        />
        <MetricCard
          label="Employees Relieving (This Quarter)"
          value={kpis.relievingThisQuarter}
          subtitle="Separations recorded in Q4"
        />
      </section>

      {/* 4. Live Employee Directory Table with Excel Export & Bulk Import */}
      <section>
        <EmployeeTable
          employees={employees}
          onEdit={onEditEmployee}
          onOpenBulkImport={onOpenBulkImport}
          onAddEmployee={onAddEmployee}
        />
      </section>
    </div>
  );
};

