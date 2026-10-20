import React, { useState, useEffect } from 'react';
import {
  Tag,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  X,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { frappeApi } from '../../api/frappe';
import { SalaryComponent } from './types';

export const SalaryComponentView: React.FC = () => {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Earning' | 'Deduction'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [type, setType] = useState<'Earning' | 'Deduction'>('Earning');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchComponents = async () => {
    setLoading(true);
    try {
      const res = await frappeApi.getDocTypeList('Salary Component', 100);
      if (res.data && res.data.length > 0) {
        setComponents(
          res.data.map((d: any) => ({
            name: d.name,
            type: d.type || (d.name.includes('Tax') || d.name.includes('PF') ? 'Deduction' : 'Earning'),
            description: d.description || `${d.type || 'Earning'} component`,
            depends_on_payment_days: Boolean(d.depends_on_payment_days),
          }))
        );
      } else {
        const seedComponents: SalaryComponent[] = [
          { name: 'Basic Salary', type: 'Earning', description: 'Core base wage for PF calculation', depends_on_payment_days: true },
          { name: 'House Rent Allowance (HRA)', type: 'Earning', description: 'Rent subsidy tax exempt under Sec 10(13A)', depends_on_payment_days: true },
          { name: 'Special Allowance', type: 'Earning', description: 'Fully taxable flexible compensation allowance', depends_on_payment_days: true },
          { name: 'Conveyance Allowance', type: 'Earning', description: 'Transport and commute allowance', depends_on_payment_days: true },
          { name: 'Provident Fund (PF)', type: 'Deduction', description: 'Statutory 12% EPFO deduction under Section 80C', depends_on_payment_days: true },
          { name: 'Professional Tax (PT)', type: 'Deduction', description: 'State municipal employment tax (₹200/mo)', depends_on_payment_days: false },
          { name: 'TDS (Income Tax)', type: 'Deduction', description: 'Withholding tax deducted at source under IT rules', depends_on_payment_days: false },
          { name: 'Employee State Insurance (ESI)', type: 'Deduction', description: 'ESIC healthcare coverage deduction (0.75%)', depends_on_payment_days: true },
        ];
        setComponents(seedComponents);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleCreateComponent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);

    const newComp: SalaryComponent = {
      name: name.trim(),
      type,
      description: description.trim() || `${type} salary item`,
      depends_on_payment_days: true,
    };

    await frappeApi.createDocTypeRecord('Salary Component', {
      name: name.trim(),
      type,
      description: description.trim(),
    });

    setComponents((prev) => [newComp, ...prev]);
    setSaving(false);
    setIsModalOpen(false);
    setName('');
    setDescription('');
  };

  const filtered = components.filter((c) => {
    if (typeFilter !== 'All' && c.type !== typeFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return c.name.toLowerCase().includes(q) || (c.description && c.description.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
              <Tag className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900 tracking-tight">
              Salary Components Directory
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
              {filtered.length} Components
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Manage earning allowances, statutory deduction heads, and tax applicability flags.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchComponents}
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
            <span>+ Add Salary Component</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-[#E2E8F0]">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search salary components by name or description..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-400 font-medium">Type:</span>
          {(['All', 'Earning', 'Deduction'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-3 py-1 rounded-full font-medium transition-colors cursor-pointer border ${
                typeFilter === t
                  ? 'bg-teal-50 text-teal-700 border-teal-200'
                  : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
              }`}
            >
              {t === 'All' ? 'All Heads' : t === 'Earning' ? 'Earnings' : 'Deductions'}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-600">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Component Name</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4">LOP Deduction</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.map((c) => (
                <tr key={c.name} className="hover:bg-gray-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{c.name}</td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        c.type === 'Earning'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {c.type === 'Earning' ? (
                        <TrendingUp className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-rose-600" />
                      )}
                      <span>{c.type}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 max-w-md">{c.description}</td>
                  <td className="py-3.5 px-4">
                    <span className="text-gray-700">
                      {c.depends_on_payment_days ? 'Yes (Pro-rated)' : 'Fixed / Slabs'}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Active</span>
                    </span>
                  </td>
                </tr>
              ))}
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
                <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Add Salary Component</h3>
                  <p className="text-[11px] text-slate-400">Define earning or deduction head</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateComponent} className="p-5 space-y-3.5 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Component Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Travel Allowance or Gratuity"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Component Type</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setType('Earning')}
                    className={`py-2 rounded-lg font-bold border text-center transition-colors cursor-pointer ${
                      type === 'Earning'
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    + Earning (Gross)
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('Deduction')}
                    className={`py-2 rounded-lg font-bold border text-center transition-colors cursor-pointer ${
                      type === 'Deduction'
                        ? 'bg-rose-50 border-rose-300 text-rose-800'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    - Deduction
                  </button>
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Details regarding tax applicability and calculation rules..."
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-teal-500"
                />
              </div>

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
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save Component'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
