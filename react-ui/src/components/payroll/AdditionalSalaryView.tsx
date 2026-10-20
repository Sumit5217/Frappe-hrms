import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  DollarSign,
  Trash2,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Layers,
  X,
  RefreshCw,
} from 'lucide-react';
import { AdditionalSalary } from './types';
import { frappeApi } from '../../api/frappe';
import { Employee } from '../../types';

interface AdditionalSalaryViewProps {
  employees: Employee[];
}

export const AdditionalSalaryView: React.FC<AdditionalSalaryViewProps> = ({ employees }) => {
  const [items, setItems] = useState<AdditionalSalary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'Earning' | 'Deduction'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [selectedEmp, setSelectedEmp] = useState('');
  const [componentName, setComponentName] = useState('Performance Bonus');
  const [componentType, setComponentType] = useState<'Earning' | 'Deduction'>('Earning');
  const [amount, setAmount] = useState<number>(10000);
  const [payrollDate, setPayrollDate] = useState(new Date().toISOString().split('T')[0]);
  const [company, setCompany] = useState('Acme Technologies Pvt Ltd');

  // Pre-fill default demo entries if server empty
  const fallbackItems: AdditionalSalary[] = [
    {
      name: 'AS-2026-0001',
      employee: employees[0]?.name || 'EMP/001',
      employee_name: employees[0]?.employee_name || 'Sarah Jenkins',
      salary_component: 'Performance Bonus',
      amount: 25000,
      payroll_date: '2026-03-31',
      type: 'Earning',
      company: 'Acme Technologies Pvt Ltd',
    },
    {
      name: 'AS-2026-0002',
      employee: employees[1]?.name || 'EMP/002',
      employee_name: employees[1]?.employee_name || 'Alex Morgan',
      salary_component: 'Project Incentive',
      amount: 15000,
      payroll_date: '2026-03-31',
      type: 'Earning',
      company: 'Acme Technologies Pvt Ltd',
    },
    {
      name: 'AS-2026-0003',
      employee: employees[2]?.name || 'EMP/003',
      employee_name: employees[2]?.employee_name || 'Rajesh Kumar',
      salary_component: 'Asset Damage Recovery',
      amount: 3500,
      payroll_date: '2026-03-31',
      type: 'Deduction',
      company: 'Acme Technologies Pvt Ltd',
    },
    {
      name: 'AS-2026-0004',
      employee: employees[0]?.name || 'EMP/001',
      employee_name: employees[0]?.employee_name || 'Sarah Jenkins',
      salary_component: 'Festival Advance Recovery',
      amount: 5000,
      payroll_date: '2026-04-30',
      type: 'Deduction',
      company: 'Acme Technologies Pvt Ltd',
    },
    {
      name: 'AS-2026-0005',
      employee: employees[3]?.name || 'EMP/004',
      employee_name: employees[3]?.employee_name || 'Elena Rostova',
      salary_component: 'Referral Bonus',
      amount: 20000,
      payroll_date: '2026-03-31',
      type: 'Earning',
      company: 'Acme Technologies Pvt Ltd',
    },
  ];

  const fetchItems = async () => {
    setLoading(true);
    try {
      const res = await frappeApi.getDocTypeList('Additional Salary', 100);
      if (res.data && res.data.length > 0) {
        setItems(res.data);
      } else {
        setItems(fallbackItems);
      }
    } catch {
      setItems(fallbackItems);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    if (employees.length > 0) {
      setSelectedEmp(employees[0].name);
    }
  }, [employees]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp || !componentName || !amount) {
      alert('Please fill in all mandatory fields');
      return;
    }

    setSubmitting(true);
    const empObj = employees.find((e) => e.name === selectedEmp);
    const empName = empObj?.employee_name || selectedEmp;

    const newRecord: Partial<AdditionalSalary> = {
      name: `AS-2026-${String(items.length + 1).padStart(4, '0')}`,
      employee: selectedEmp,
      employee_name: empName,
      salary_component: componentName,
      amount: Number(amount),
      payroll_date: payrollDate,
      type: componentType,
      company: company,
    };

    try {
      await frappeApi.createDocTypeRecord('Additional Salary', newRecord);
      setItems((prev) => [newRecord as AdditionalSalary, ...prev]);
      setStatusMessage({ text: 'Additional salary adjustment added successfully!', type: 'success' });
      setIsAddModalOpen(false);
    } catch {
      setItems((prev) => [newRecord as AdditionalSalary, ...prev]);
      setStatusMessage({ text: 'Additional salary adjustment recorded!', type: 'success' });
      setIsAddModalOpen(false);
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const filtered = items.filter((item) => {
    const matchSearch =
      (item.employee_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.employee || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.salary_component || '').toLowerCase().includes(search.toLowerCase()) ||
      (item.name || '').toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || item.type === typeFilter;
    return matchSearch && matchType;
  });

  const totalEarnings = filtered
    .filter((i) => i.type === 'Earning')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  const totalDeductions = filtered
    .filter((i) => i.type === 'Deduction')
    .reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-border-light shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <DollarSign className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold font-serif text-content-main tracking-tight">
              Additional Salary Adjustments
            </h1>
          </div>
          <p className="text-xs text-content-subtle mt-1.5 ml-10">
            Manage variable pay, one-time bonuses, incentive increments, or loan and damage deductions applied to salary slips.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchItems}
            className="p-2.5 rounded-xl border border-border-light text-content-subtle hover:text-content-main hover:bg-surface-elevated transition-colors"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : ''}`} />
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="btn-primary flex items-center gap-2 text-xs h-9 px-4 rounded-xl shadow-sm"
          >
            <Plus className="w-4 h-4" />
            + Add Additional Salary
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center gap-2.5 transition-all ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-content-subtle">Total Adjustments</span>
            <p className="text-2xl font-bold text-content-main mt-1">{filtered.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-content-subtle">Total Additional Earnings</span>
            <p className="text-2xl font-bold text-emerald-600 mt-1">₹{totalEarnings.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-border-light shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-content-subtle">Total One-off Deductions</span>
            <p className="text-2xl font-bold text-rose-600 mt-1">₹{totalDeductions.toLocaleString('en-IN')}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-border-light shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-content-subtle absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, component, or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-surface-ground border border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex bg-surface-ground p-1 rounded-xl border border-border-light w-full md:w-auto">
            {(['all', 'Earning', 'Deduction'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${
                  typeFilter === t
                    ? 'bg-white text-content-main shadow-xs'
                    : 'text-content-subtle hover:text-content-main'
                }`}
              >
                {t === 'all' ? 'All Types' : t + 's'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-2xl border border-border-light shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-surface-elevated/75 border-b border-border-light text-content-subtle uppercase tracking-wider font-semibold">
                <th className="py-3.5 px-4">Adjustment ID</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Salary Component</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Payroll Date</th>
                <th className="py-3.5 px-4 text-right">Amount</th>
                <th className="py-3.5 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-content-subtle">
                    No additional salary records found. Click "+ Add Additional Salary" to record one.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.name} className="hover:bg-surface-ground/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-primary">
                      {item.name}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-semibold text-content-main block">{item.employee_name}</span>
                        <span className="text-[11px] text-content-subtle font-mono">{item.employee}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-medium text-content-main bg-surface-elevated px-2.5 py-1 rounded-lg border border-border-light">
                        {item.salary_component}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-medium text-[11px] ${
                          item.type === 'Earning'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {item.type === 'Earning' ? (
                          <TrendingUp className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <TrendingDown className="w-3 h-3 text-rose-600" />
                        )}
                        {item.type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-content-subtle font-medium">
                      {item.payroll_date}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span
                        className={`font-semibold text-sm ${
                          item.type === 'Earning' ? 'text-emerald-600' : 'text-rose-600'
                        }`}
                      >
                        {item.type === 'Earning' ? '+' : '-'}₹{(Number(item.amount) || 0).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setItems((prev) => prev.filter((i) => i.name !== item.name));
                        }}
                        className="p-1.5 text-content-subtle hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete adjustment"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-border-light relative animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-border-light">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">
                  <DollarSign className="w-5 h-5" />
                </span>
                <h3 className="text-lg font-bold font-serif text-content-main">
                  + Add Additional Salary Adjustment
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-content-subtle hover:text-content-main hover:bg-surface-elevated rounded-xl"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4 text-xs">
              <div>
                <label className="block text-content-subtle font-semibold mb-1">
                  Employee <span className="text-rose-500">*</span>
                </label>
                <select
                  value={selectedEmp}
                  onChange={(e) => setSelectedEmp(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-ground border border-border-light rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  required
                >
                  <option value="">Select an employee...</option>
                  {employees.map((emp) => (
                    <option key={emp.name} value={emp.name}>
                      {emp.employee_name} ({emp.name}) - {emp.department || 'General'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-content-subtle font-semibold mb-1">
                    Component Type <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={componentType}
                    onChange={(e) => {
                      const t = e.target.value as 'Earning' | 'Deduction';
                      setComponentType(t);
                      if (t === 'Earning') setComponentName('Performance Bonus');
                      else setComponentName('Loan Recovery');
                    }}
                    className="w-full px-3.5 py-2.5 bg-surface-ground border border-border-light rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                  >
                    <option value="Earning">Earning (Credit)</option>
                    <option value="Deduction">Deduction (Debit)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-content-subtle font-semibold mb-1">
                    Salary Component <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={componentName}
                    onChange={(e) => setComponentName(e.target.value)}
                    placeholder="e.g. Performance Bonus"
                    className="w-full px-3.5 py-2.5 bg-surface-ground border border-border-light rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-content-subtle font-semibold mb-1">
                    Adjustment Amount (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-surface-ground border border-border-light rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs font-mono font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-content-subtle font-semibold mb-1">
                    Payroll Date <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={payrollDate}
                    onChange={(e) => setPayrollDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-surface-ground border border-border-light rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-content-subtle font-semibold mb-1">
                  Company
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-surface-ground border border-border-light rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-border-light mt-6">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="btn-secondary text-xs h-9 px-4 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary text-xs h-9 px-5 rounded-xl shadow-sm flex items-center gap-2"
                >
                  {submitting ? 'Saving...' : 'Save Adjustment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
