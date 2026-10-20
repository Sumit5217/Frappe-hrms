import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { Employee } from '../types';
import {
  Mail,
  Phone,
  Building2,
  Sparkles,
  Edit3,
  Download,
  FileSpreadsheet,
  Plus,
  Search,
  CheckCircle2,
  X,
  Filter,
} from 'lucide-react';

interface EmployeeTableProps {
  employees: Employee[];
  onEdit?: (employee: Employee) => void;
  onOpenBulkImport?: () => void;
  onAddEmployee?: () => void;
}

const AVATAR_GRADIENTS = [
  'from-blue-500 to-indigo-600',
  'from-emerald-500 to-teal-600',
  'from-amber-500 to-orange-600',
  'from-purple-500 to-pink-600',
  'from-rose-500 to-red-600',
  'from-cyan-500 to-blue-600',
  'from-violet-500 to-purple-600',
];

const getDeptBadgeStyle = (dept?: string) => {
  if (!dept) return 'bg-slate-50 text-slate-700 border-slate-200';
  const lower = dept.toLowerCase();
  if (lower.includes('eng') || lower.includes('tech')) {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }
  if (lower.includes('op')) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }
  if (lower.includes('fin') || lower.includes('account')) {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }
  if (lower.includes('manage') || lower.includes('dir')) {
    return 'bg-purple-50 text-purple-700 border-purple-200';
  }
  return 'bg-teal-50 text-teal-700 border-teal-200';
};

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  onEdit,
  onOpenBulkImport,
  onAddEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('All');

  // Extract distinct departments for filtering
  const distinctDepts = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      if (e.department) set.add(e.department);
    });
    return ['All', ...Array.from(set)];
  }, [employees]);

  // Filtered employees list
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const matchesSearch =
        !searchTerm ||
        emp.employee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (emp.designation && emp.designation.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (emp.department && emp.department.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesDept =
        selectedDept === 'All' ||
        emp.department === selectedDept;

      return matchesSearch && matchesDept;
    });
  }, [employees, searchTerm, selectedDept]);

  const exportToExcel = () => {
    const data = filteredEmployees.map((emp) => ({
      'Employee ID': emp.name,
      'Full Name': emp.employee_name || emp.name,
      'Department': emp.department || 'Operations',
      'Designation': emp.designation || 'Staff',
      'Date of Joining': emp.date_of_joining || 'N/A',
      'Status': emp.status || 'Active',
      'Company Email': emp.company_email || 'N/A',
      'Company': emp.company || 'Nimble Vision Pvt Ltd',
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Employees');
    XLSX.writeFile(workbook, 'Employees_Directory_Export.xlsx');
  };

  const getStatusBadge = (status: Employee['status']) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active
          </span>
        );
      case 'Suspended':
      case 'Left':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {status}
          </span>
        );
      case 'Inactive':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200/90 rounded-xl shadow-xs overflow-hidden">
      {/* Top Header Card Bar */}
      <div className="p-5 pb-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold shadow-sm">
            <Sparkles className="w-5 h-5 text-blue-100" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-heading text-lg font-bold text-slate-900 tracking-tight">
                Employee Directory & Roster
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs font-mono">
                {employees.length} Total Enrolled
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-sans">
              Live synchronized employee directory & verified company roster.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={exportToExcel}
            className="h-8.5 px-3 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
            title="Export Employees to Excel (.xlsx)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Excel</span>
          </button>

          {onOpenBulkImport && (
            <button
              type="button"
              onClick={onOpenBulkImport}
              className="h-8.5 px-3 rounded-lg text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Bulk Import Employees and Salaries via Excel"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600" />
              <span>Bulk Import (XL)</span>
            </button>
          )}

          {onAddEmployee && (
            <button
              type="button"
              onClick={onAddEmployee}
              className="btn-primary text-xs h-8.5 px-3.5 flex items-center gap-1.5 font-semibold shadow-xs cursor-pointer"
              title="Add Single Employee"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Add Employee</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="px-5 py-3 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by employee name, ID, role, or department..."
            className="w-full text-xs h-8.5 pl-9 pr-8 bg-white border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all font-sans"
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" />
            Dept:
          </span>
          {distinctDepts.map((dept) => {
            const isSelected = selectedDept === dept;
            return (
              <button
                key={dept}
                type="button"
                onClick={() => setSelectedDept(dept)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-2xs font-bold'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {dept}
              </button>
            );
          })}
        </div>
      </div>

      {/* Table Data */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider bg-slate-50/90 font-mono">
              <th className="py-3 px-4">Employee</th>
              <th className="py-3 px-4">Department</th>
              <th className="py-3 px-4">Designation</th>
              <th className="py-3 px-4">Date Joined</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Quick Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs font-sans">
            {filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-slate-400 text-sm">
                  No employees found matching "{searchTerm}"
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp, index) => {
                const gradient = AVATAR_GRADIENTS[index % AVATAR_GRADIENTS.length];
                const initials = emp.employee_name
                  .split(' ')
                  .map((p) => p[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join('');

                return (
                  <tr
                    key={emp.name}
                    className="hover:bg-blue-50/30 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradient} text-white font-bold flex items-center justify-center text-xs flex-shrink-0 shadow-xs tracking-wider`}
                        >
                          {initials || emp.name.slice(-2)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 group-hover:text-blue-700 transition-colors flex items-center gap-1.5">
                            <span>{emp.employee_name}</span>
                            <span className="text-[10px] text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded font-mono">
                              {emp.name}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">
                            {emp.company || 'Nimble Vision Pvt Ltd'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getDeptBadgeStyle(
                          emp.department
                        )}`}
                      >
                        <Building2 className="w-3 h-3 opacity-70" />
                        {emp.department || 'Operations'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-800 font-medium">
                      {emp.designation || 'Staff'}
                    </td>

                    <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                      {emp.date_of_joining || '2023-01-01'}
                    </td>

                    <td className="py-3 px-4">
                      {getStatusBadge(emp.status)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5 text-slate-400">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(emp)}
                            title="Edit Employee Profile"
                            className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                          </button>
                        )}
                        {emp.cell_number && (
                          <a
                            href={`tel:${emp.cell_number}`}
                            title={`Call ${emp.cell_number}`}
                            className="p-1.5 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 text-emerald-600" />
                          </a>
                        )}
                        <button
                          type="button"
                          title="Send Email"
                          className="p-1.5 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="px-5 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <span className="font-bold text-slate-800">{filteredEmployees.length}</span> of{' '}
          <span className="font-bold text-slate-800">{employees.length}</span> active team members
        </span>
        <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Enterprise Payroll Ready
        </span>
      </div>
    </div>
  );
};
