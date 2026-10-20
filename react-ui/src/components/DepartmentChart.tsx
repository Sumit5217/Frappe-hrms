import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
  PieChart,
  Pie,
} from 'recharts';
import { Layers, BarChart2, PieChart as PieIcon, Users, X } from 'lucide-react';
import { DepartmentHeadcount, Employee } from '../types';

interface DepartmentChartProps {
  data?: DepartmentHeadcount[];
  employees?: Employee[];
  lastSynced?: string;
}

interface DeptInfo {
  department: string;
  count: number;
  color: string;
  members: { name: string; designation?: string; id: string }[];
}

const DEPT_COLORS = [
  '#2563EB', // Blue 600
  '#059669', // Emerald 600
  '#D97706', // Amber 600
  '#7C3AED', // Purple 600
  '#0D9488', // Teal 600
  '#E11D48', // Rose 600
  '#0284C7', // Sky 600
  '#EA580C', // Orange 600
];

const cleanDepartmentName = (dept?: string): string => {
  if (!dept) return 'Operations';
  // Strip trailing company suffix like " - NVPL"
  const cleaned = dept.replace(/\s*-\s*[A-Z0-9]+$/i, '').trim();
  return cleaned || 'Operations';
};

export const DepartmentChart: React.FC<DepartmentChartProps> = ({
  data = [],
  employees = [],
  lastSynced = 'just now',
}) => {
  const [viewMode, setViewMode] = useState<'bar' | 'donut'>('bar');
  const [selectedDept, setSelectedDept] = useState<string | null>(null);

  // Dynamically compute department aggregates exclusively from real data
  const departmentData: DeptInfo[] = useMemo(() => {
    if (employees && employees.length > 0) {
      const map: Record<string, { count: number; members: { name: string; designation?: string; id: string }[] }> = {};

      employees.forEach((emp) => {
        const dept = cleanDepartmentName(emp.department);
        if (!map[dept]) {
          map[dept] = { count: 0, members: [] };
        }
        map[dept].count += 1;
        map[dept].members.push({
          name: emp.employee_name || emp.name,
          designation: emp.designation || 'Staff',
          id: emp.name,
        });
      });

      return Object.entries(map).map(([dept, info], idx) => ({
        department: dept,
        count: info.count,
        members: info.members,
        color: DEPT_COLORS[idx % DEPT_COLORS.length],
      }));
    }

    if (data && data.length > 0) {
      return data.map((d, idx) => ({
        department: cleanDepartmentName(d.department),
        count: d.count,
        members: [],
        color: d.color || DEPT_COLORS[idx % DEPT_COLORS.length],
      }));
    }

    return [];
  }, [employees, data]);

  const totalEmployeesCount = useMemo(() => {
    if (employees && employees.length > 0) return employees.length;
    return departmentData.reduce((acc, curr) => acc + curr.count, 0);
  }, [employees, departmentData]);

  const activeDeptInfo = useMemo(() => {
    if (!selectedDept) return null;
    return departmentData.find((d) => d.department === selectedDept) || null;
  }, [selectedDept, departmentData]);

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-xs overflow-hidden">
      {/* 1. Header with Stats & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#F1F5F9] mb-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold shadow-xs">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-800 font-serif">
                Department Wise Employee Count
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                {totalEmployeesCount} {totalEmployeesCount === 1 ? 'Employee' : 'Employees'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live headcount distribution across {departmentData.length} active departments • Synced {lastSynced}
            </p>
          </div>
        </div>

        {/* View Switcher: Bar vs Donut */}
        <div className="flex items-center gap-2">
          {selectedDept && (
            <button
              type="button"
              onClick={() => setSelectedDept(null)}
              className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filter</span>
            </button>
          )}

          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('bar')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'bar'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Bar Chart</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('donut')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                viewMode === 'donut'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Distribution</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Interactive Department Metric Cards */}
      {departmentData.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-5">
          {departmentData.map((d) => {
            const percentage = ((d.count / (totalEmployeesCount || 1)) * 100).toFixed(1);
            const isSelected = selectedDept === d.department;

            return (
              <button
                key={d.department}
                type="button"
                onClick={() => setSelectedDept(isSelected ? null : d.department)}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-400 shadow-sm ring-2 ring-blue-500/20'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: d.color }}
                    ></span>
                    <span className="font-semibold text-xs text-slate-700 truncate" title={d.department}>
                      {d.department}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200/80">
                    {percentage}%
                  </span>
                </div>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xl font-black font-serif text-slate-900">
                    {d.count}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {d.count === 1 ? 'employee' : 'employees'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {/* 3. Main Chart Display */}
      <div className="h-64 w-full">
        {departmentData.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-2">
            <Users className="w-8 h-8 stroke-1 text-slate-300" />
            <p className="text-sm font-medium">No department employee data available</p>
          </div>
        ) : viewMode === 'bar' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentData}
              margin={{ top: 12, right: 20, left: -10, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis
                dataKey="department"
                stroke="#64748B"
                fontSize={12}
                fontWeight={600}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
              />
              <YAxis
                stroke="#64748B"
                fontSize={12}
                tickLine={false}
                axisLine={{ stroke: '#CBD5E1' }}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as DeptInfo;
                    const pct = ((item.count / (totalEmployeesCount || 1)) * 100).toFixed(1);
                    return (
                      <div className="bg-white p-3.5 rounded-xl shadow-xl border border-slate-200 min-w-[220px] text-xs">
                        <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-2">
                          <span
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <span className="font-bold text-sm text-slate-800">
                            {item.department}
                          </span>
                        </div>
                        <div className="space-y-1.5 text-slate-600">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Employee Count:</span>
                            <span className="font-bold text-blue-700">
                              {item.count} {item.count === 1 ? 'Employee' : 'Employees'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Workforce Share:</span>
                            <span className="font-semibold text-emerald-600">{pct}%</span>
                          </div>
                          {item.members && item.members.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 mt-2">
                              <span className="text-[11px] text-slate-500 block mb-1 font-semibold uppercase tracking-wider">
                                Team Members ({item.members.length}):
                              </span>
                              <div className="text-[11px] text-slate-800 max-h-24 overflow-y-auto space-y-1">
                                {item.members.map((m) => (
                                  <div key={m.id} className="flex justify-between items-center py-0.5">
                                    <span className="font-medium text-slate-700">{m.name}</span>
                                    {m.designation && (
                                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {m.designation}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar
                dataKey="count"
                radius={[6, 6, 0, 0]}
                barSize={48}
                onClick={(entry: any) => setSelectedDept(entry.department)}
                className="cursor-pointer"
              >
                {departmentData.map((entry) => (
                  <Cell
                    key={`dept-bar-cell-${entry.department}`}
                    fill={entry.color}
                    opacity={selectedDept && selectedDept !== entry.department ? 0.35 : 1}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as DeptInfo;
                    const pct = ((item.count / (totalEmployeesCount || 1)) * 100).toFixed(1);
                    return (
                      <div className="bg-white p-3 rounded-lg shadow-lg border border-slate-200 text-xs min-w-[180px]">
                        <div className="flex items-center gap-2 mb-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: item.color }}
                          ></span>
                          <span className="font-bold text-slate-800">{item.department}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Count:</span>
                          <span className="font-bold text-blue-700">{item.count}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                          <span>Share:</span>
                          <span className="font-semibold text-emerald-600">{pct}%</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Pie
                data={departmentData}
                dataKey="count"
                nameKey="department"
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                onClick={(entry: any) => setSelectedDept(entry.department)}
                className="cursor-pointer"
              >
                {departmentData.map((entry) => (
                  <Cell
                    key={`pie-cell-${entry.department}`}
                    fill={entry.color}
                    opacity={selectedDept && selectedDept !== entry.department ? 0.35 : 1}
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* 4. Selected Department Member Drilldown Details */}
      {activeDeptInfo && activeDeptInfo.members.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-5 -mb-5 p-4 rounded-b-xl">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: activeDeptInfo.color }}
              ></span>
              <span className="font-bold text-xs text-slate-800">
                {activeDeptInfo.department} Department Members
              </span>
              <span className="text-[11px] font-semibold text-slate-500">
                ({activeDeptInfo.members.length} {activeDeptInfo.members.length === 1 ? 'member' : 'members'})
              </span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedDept(null)}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {activeDeptInfo.members.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-2.5 bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs"
              >
                <div
                  className="w-7 h-7 rounded-full text-white flex items-center justify-center font-bold text-xs flex-shrink-0"
                  style={{ backgroundColor: activeDeptInfo.color }}
                >
                  {m.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-800 truncate">{m.name}</div>
                  <div className="text-[10px] text-slate-500 truncate flex items-center gap-1.5">
                    <span>{m.id}</span>
                    {m.designation && <span>• {m.designation}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
