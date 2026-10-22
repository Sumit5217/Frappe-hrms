import React, { useState, useEffect } from 'react';
import {
  HandCoins,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  X,
  Layers,
} from 'lucide-react';
import { frappeApi } from '../../api/frappe';
import { Employee } from '../../types';
import { SalaryStructureAssignment } from './types';
import { calculateStatutoryPayroll } from '../../utils/statutoryPayroll';

interface SalaryStructureAssignmentViewProps {
  employees: Employee[];
}

export const SalaryStructureAssignmentView: React.FC<SalaryStructureAssignmentViewProps> = ({
  employees,
}) => {
  const [assignments, setAssignments] = useState<SalaryStructureAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [companyFilter, setCompanyFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [employee, setEmployee] = useState('');
  const [structure, setStructure] = useState('Standard Staff CTC Package');
  const [base, setBase] = useState('60000');
  const [fromDate, setFromDate] = useState('2026-04-01');
  const [saving, setSaving] = useState(false);

  const fetchAssignments = async () => {
    setLoading(true);
    try {
      const res = await frappeApi.getDocTypeList('Salary Structure Assignment', 100);
      if (res.data && res.data.length > 0) {
        setAssignments(
          res.data.map((d: any) => ({
            name: d.name,
            employee: d.employee || 'HR-EMP-00001',
            employee_name: d.employee_name || d.name,
            department: d.department || 'Operations',
            designation: d.designation || 'Specialist',
            salary_structure: d.salary_structure || 'Standard Staff CTC Package',
            from_date: d.from_date || '2026-04-01',
            base: Number(d.base) || 60000,
            company: d.company || 'Nimble Vision PVT LTD',
          }))
        );
      } else {
        const seedAssignments: SalaryStructureAssignment[] = (employees.length > 0 ? employees : [
          { name: 'HR-EMP-00001', employee_name: 'Sumit Singh', department: 'Engineering', designation: 'Technical Lead', company: 'Nimble Vision' },
          { name: 'HR-EMP-00002', employee_name: 'Sia Kureel', department: 'Customer Support', designation: 'Support Lead', company: 'Nimble Vision' },
          { name: 'HR-EMP-00003', employee_name: 'David Chen', department: 'Operations', designation: 'Operations Specialist', company: 'Nimble Vision' },
          { name: 'HR-EMP-00004', employee_name: 'Anita Desai', department: 'Finance & HR', designation: 'HR Specialist', company: 'Nimble Vision' },
        ]).map((emp: any, idx: number) => ({
          name: `SSA-2026-${String(idx + 1).padStart(4, '0')}`,
          employee: emp.name,
          employee_name: emp.employee_name,
          department: emp.department || 'Engineering',
          designation: emp.designation || 'Lead',
          salary_structure: idx === 0 ? 'Executive Leadership CTC' : 'Standard Engineering CTC',
          from_date: '2026-04-01',
          base: 65000 + idx * 15000,
          company: 'Nimble Vision PVT LTD',
        }));
        setAssignments(seedAssignments);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [employees]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const empObj: any = employees.find((e) => e.name === employee) || {
      name: employee || 'HR-EMP-00001',
      employee_name: 'Employee',
      department: 'Engineering',
      designation: 'Staff',
      company: 'Nimble vision pvt ltd',
    };

    const resolvedCompany = empObj.company || 'Nimble vision pvt ltd';
    const newAssignment: SalaryStructureAssignment = {
      name: `SSA-${Date.now().toString().slice(-5)}`,
      employee: empObj.name,
      employee_name: empObj.employee_name,
      department: empObj.department,
      designation: empObj.designation,
      salary_structure: structure,
      from_date: fromDate,
      base: Number(base) || 60000,
      company: resolvedCompany,
    };

    try {
      await frappeApi.createDocTypeRecord('Salary Structure Assignment', {
        employee: empObj.name,
        salary_structure: structure,
        from_date: fromDate,
        base: Number(base) || 60000,
        company: resolvedCompany,
      });
    } catch {
      // Local fallback
    }

    setAssignments((prev) => [newAssignment, ...prev]);
    setSaving(false);
    setIsModalOpen(false);
  };

  const filtered = assignments.filter((a) => {
    if (companyFilter !== 'All') {
      const isAlphaFilter = companyFilter.toLowerCase().includes('alpha');
      const isAlphaA = (a.company || '').toLowerCase().includes('alpha');
      if (isAlphaFilter !== isAlphaA) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        a.employee_name.toLowerCase().includes(q) ||
        a.employee.toLowerCase().includes(q) ||
        a.salary_structure.toLowerCase().includes(q) ||
        (a.company && a.company.toLowerCase().includes(q)) ||
        (a.department && a.department.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <HandCoins className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900 tracking-tight">
              Salary Structure Assignments
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800">
              {filtered.length} Active Assignments
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Assign salary packages, base compensation, and CTC tiers to individual employees with effective dates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchAssignments}
            className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn-primary text-xs h-9 px-4 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>+ Assign Salary Structure</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search assignments by employee name, code, department, or structure..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2">
          <label className="text-[11px] font-bold text-gray-500 whitespace-nowrap">Filter Company:</label>
          <select
            value={companyFilter}
            onChange={(e) => setCompanyFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white font-medium text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="All">All Companies</option>
            <option value="Nimble vision pvt ltd">Nimble vision</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Assignment ID</th>
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Assigned Structure</th>
                <th className="py-3 px-4">Gross CTC</th>
                <th className="py-3 px-4">Statutory Taxes (PF • PT • TDS)</th>
                <th className="py-3 px-4">In-Hand Net</th>
                <th className="py-3 px-4">Effective From</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.map((a) => {
                const stat = calculateStatutoryPayroll(a.base || 0);
                return (
                  <tr key={a.name} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">{a.name}</td>
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-gray-900 block">{a.employee_name}</span>
                        <span className="text-[11px] text-gray-400">{a.employee} • {a.department}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-gray-800">
                      <span className="inline-flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                        <Layers className="w-3 h-3 text-indigo-500" />
                        <span>{a.salary_structure}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm">
                      ₹{a.base.toLocaleString('en-IN')}
                      <span className="block text-[10px] text-slate-400 font-normal">₹{(a.base * 12).toLocaleString('en-IN')}/yr</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 text-[11px] font-mono">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-500">PF:</span>
                          <span className="font-semibold text-slate-800">₹{stat.pf.toLocaleString('en-IN')}</span>
                          <span className="text-slate-300">|</span>
                          <span className="text-slate-500">PT:</span>
                          <span className="font-semibold text-slate-800">₹{stat.pt.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-indigo-600 font-semibold">TDS (115BAC):</span>
                          <span className="font-bold text-indigo-900">₹{stat.tds.toLocaleString('en-IN')}</span>
                          {stat.tds === 0 && (
                            <span className="text-[9px] text-emerald-600 bg-emerald-50 px-1 rounded font-sans font-medium">Rebate Nil</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-black text-emerald-700 text-sm">
                      ₹{stat.netPay.toLocaleString('en-IN')}
                      <span className="block text-[10px] text-emerald-600 font-normal">Take-Home</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-600">{a.from_date}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden animate-scaleUp">
            <div className="h-14 bg-[#1A2232] text-white px-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <HandCoins className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Assign Salary Structure</h3>
                  <p className="text-[11px] text-slate-400">Bind CTC package to employee</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAssignment} className="p-5 space-y-3.5 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={employee}
                  onChange={(e) => setEmployee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                >
                  <option value="">Select Employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.name} value={emp.name}>
                      {emp.employee_name} ({emp.name}) • {emp.company || 'Nimble vision pvt ltd'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Salary Structure</label>
                <select
                  value={structure}
                  onChange={(e) => setStructure(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium"
                >
                  <option value="Standard Staff CTC Package">Standard Staff CTC Package</option>
                  <option value="Executive Leadership CTC">Executive Leadership CTC</option>
                  <option value="Technical Specialist Grade 1">Technical Specialist Grade 1</option>
                  <option value="Customer Support Tier 1">Customer Support Tier 1</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Monthly Base / CTC (₹)</label>
                  <input
                    type="number"
                    required
                    value={base}
                    onChange={(e) => setBase(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-emerald-700"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Effective From</label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Live Statutory Tax & Pay Breakdown Preview */}
              {(() => {
                const stat = calculateStatutoryPayroll(Number(base) || 0);
                return (
                  <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider">
                        Statutory Tax & Compensation Breakdown
                      </span>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                        Section 115BAC Compliant
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                        <span className="text-slate-500 block text-[10px]">Basic Salary (60%)</span>
                        <span className="font-bold text-slate-900">₹{stat.basic.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                        <span className="text-slate-500 block text-[10px]">Special Allowance (40%)</span>
                        <span className="font-bold text-slate-900">₹{stat.specialAllowance.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                        <span className="text-slate-500 block text-[10px]">PF (EPFO Cap)</span>
                        <span className="font-bold text-slate-900">₹{stat.pf.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-200/80">
                        <span className="text-slate-500 block text-[10px]">PT (Prof Tax)</span>
                        <span className="font-bold text-slate-900">₹{stat.pt.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="bg-indigo-50/70 p-2 rounded-lg border border-indigo-200/80">
                        <span className="text-indigo-600 block text-[10px] font-semibold">TDS (Income Tax)</span>
                        <span className="font-black text-indigo-950">₹{stat.tds.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block">Total Deductions</span>
                        <span className="font-bold text-rose-600">-₹{stat.totalDeductions.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 block">Estimated Net Take-Home</span>
                        <span className="font-black text-emerald-700 text-sm">₹{stat.netPay.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
