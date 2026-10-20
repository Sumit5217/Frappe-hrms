import React, { useState, useEffect } from 'react';
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  CheckCircle2,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { frappeApi } from '../../api/frappe';
import { SalaryStructure } from './types';

export const SalaryStructureView: React.FC = () => {
  const [structures, setStructures] = useState<SalaryStructure[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [expandedName, setExpandedName] = useState<string | null>('Standard Staff CTC Package');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [frequency, setFrequency] = useState('Monthly');
  const [saving, setSaving] = useState(false);

  const fetchStructures = async () => {
    setLoading(true);
    try {
      const res = await frappeApi.getDocTypeList('Salary Structure', 50);
      if (res.data && res.data.length > 0) {
        setStructures(
          res.data.map((d: any) => ({
            name: d.name,
            company: d.company || 'Nimble Vision PVT LTD',
            payroll_frequency: d.payroll_frequency || 'Monthly',
            is_active: d.is_active || 'Yes',
            earnings: d.earnings || [
              { salary_component: 'Basic Salary', formula: 'base * 0.50' },
              { salary_component: 'House Rent Allowance (HRA)', formula: 'base * 0.25' },
              { salary_component: 'Special Allowance', formula: 'base * 0.15' },
              { salary_component: 'Conveyance Allowance', formula: 'base * 0.10' },
            ],
            deductions: d.deductions || [
              { salary_component: 'Provident Fund (PF)', formula: 'basic * 0.12' },
              { salary_component: 'Professional Tax (PT)', amount: 200 },
              { salary_component: 'TDS (Income Tax)', formula: 'calculated' },
            ],
          }))
        );
      } else {
        const seedStructures: SalaryStructure[] = [
          {
            name: 'Standard Staff CTC Package',
            company: 'Nimble Vision PVT LTD',
            payroll_frequency: 'Monthly',
            is_active: 'Yes',
            earnings: [
              { salary_component: 'Basic Salary', formula: 'base * 0.50' },
              { salary_component: 'House Rent Allowance (HRA)', formula: 'base * 0.25' },
              { salary_component: 'Special Allowance', formula: 'base * 0.15' },
              { salary_component: 'Conveyance Allowance', formula: 'base * 0.10' },
            ],
            deductions: [
              { salary_component: 'Provident Fund (PF - 12%)', formula: 'basic * 0.12' },
              { salary_component: 'Professional Tax (PT)', amount: 200 },
              { salary_component: 'TDS (Income Tax)', formula: 'slab_tax' },
            ],
          },
          {
            name: 'Executive Leadership CTC',
            company: 'Nimble Vision PVT LTD',
            payroll_frequency: 'Monthly',
            is_active: 'Yes',
            earnings: [
              { salary_component: 'Basic Salary', formula: 'base * 0.40' },
              { salary_component: 'House Rent Allowance (HRA)', formula: 'base * 0.25' },
              { salary_component: 'Executive Performance Bonus', formula: 'base * 0.20' },
              { salary_component: 'Special Allowance', formula: 'base * 0.15' },
            ],
            deductions: [
              { salary_component: 'Provident Fund (PF)', formula: '1800' },
              { salary_component: 'Professional Tax (PT)', amount: 200 },
              { salary_component: 'TDS (Income Tax)', formula: 'slab_tax' },
            ],
          },
        ];
        setStructures(seedStructures);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStructures();
  }, []);

  const handleCreateStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setSaving(true);

    const newStruct: SalaryStructure = {
      name: newTitle.trim(),
      company: 'Nimble vision pvt ltd',
      payroll_frequency: frequency,
      is_active: 'Yes',
      earnings: [
        { salary_component: 'Basic Salary', formula: 'base * 0.50' },
        { salary_component: 'House Rent Allowance (HRA)', formula: 'base * 0.25' },
        { salary_component: 'Special Allowance', formula: 'base * 0.25' },
      ],
      deductions: [
        { salary_component: 'Provident Fund (PF)', formula: 'basic * 0.12' },
        { salary_component: 'Professional Tax (PT)', amount: 200 },
      ],
    };

    await frappeApi.createDocTypeRecord('Salary Structure', {
      name: newTitle.trim(),
      company: 'Nimble vision pvt ltd',
      payroll_frequency: frequency,
      is_active: 'Yes',
    });

    setStructures((prev) => [newStruct, ...prev]);
    setSaving(false);
    setIsModalOpen(false);
    setNewTitle('');
  };

  const filtered = structures.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-[#E2E8F0] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="font-serif text-xl font-bold text-gray-900 tracking-tight">
              Salary Structures & Rules
            </h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
              {filtered.length} Templates
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Configure mathematical formula rules, earning components, and statutory deduction templates for compensation plans.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchStructures}
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
            <span>+ Create Salary Structure</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E2E8F0] flex items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search salary structures by template name..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Structures Cards */}
      <div className="space-y-4">
        {filtered.map((s) => {
          const isExpanded = expandedName === s.name;
          return (
            <div
              key={s.name}
              className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-xs"
            >
              <div
                onClick={() => setExpandedName(isExpanded ? null : s.name)}
                className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-gray-900">{s.name}</h3>
                    <p className="text-[11px] text-gray-400">
                      Frequency: <strong className="text-gray-600">{s.payroll_frequency}</strong> • Company: {s.company}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Active Template</span>
                  </span>
                  <div className="p-1 rounded text-gray-400 hover:text-gray-700">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-5 bg-[#F8FAFC] space-y-4 text-xs font-sans">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Earnings Breakdown */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                      <h4 className="font-bold text-emerald-800 pb-2 mb-3 border-b border-emerald-100 flex justify-between">
                        <span>EARNINGS COMPONENTS</span>
                        <span>FORMULA / RULE</span>
                      </h4>
                      <div className="space-y-2">
                        {s.earnings.map((e, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700 font-medium">
                            <span>{e.salary_component}</span>
                            <span className="font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-[11px]">
                              {e.formula || 'Base percentage'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Deductions Breakdown */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
                      <h4 className="font-bold text-rose-800 pb-2 mb-3 border-b border-rose-100 flex justify-between">
                        <span>DEDUCTIONS COMPONENTS</span>
                        <span>FORMULA / AMOUNT</span>
                      </h4>
                      <div className="space-y-2">
                        {s.deductions.map((d, idx) => (
                          <div key={idx} className="flex justify-between text-gray-700 font-medium">
                            <span>{d.salary_component}</span>
                            <span className="font-mono bg-gray-50 px-2 py-0.5 rounded border border-gray-200 text-[11px]">
                              {d.amount ? `₹${d.amount}` : d.formula || 'Statutory'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
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
                <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Create Salary Structure</h3>
                  <p className="text-[11px] text-slate-400">Define new compensation template</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStructure} className="p-5 space-y-3.5 text-xs font-sans">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Structure Template Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Senior Software Architect CTC"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Payroll Frequency</label>
                <select
                  value={frequency}
                  onChange={(e) => setFrequency(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Bimonthly">Bimonthly</option>
                  <option value="Fortnightly">Fortnightly</option>
                  <option value="Weekly">Weekly</option>
                </select>
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
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold transition-colors cursor-pointer"
                >
                  {saving ? 'Creating...' : 'Create Structure'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
