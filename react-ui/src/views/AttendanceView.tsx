import React, { useState, useEffect, useMemo } from 'react';
import {
  Clock,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  Search,
  X,
  Send,
  Zap,
  Timer
} from 'lucide-react';
import { Employee, UserSession } from '../types';

interface AttendanceViewProps {
  employees: Employee[];
  user?: UserSession;
  onOpenQuickPunch?: () => void;
  onNavigate?: (subItem: string, docType?: string, reportName?: string) => void;
}

interface AttendanceRecord {
  id: string;
  employee: string;
  employee_name: string;
  department: string;
  date: string;
  in_time: string;
  out_time: string;
  total_hours: string;
  status: 'Present' | 'Late' | 'Half Day' | 'On Leave' | 'Absent';
  shift: string;
}

const INITIAL_ATTENDANCE_LOGS: AttendanceRecord[] = [
  {
    id: 'ATT-2026-10-001',
    employee: 'HR-EMP-00001',
    employee_name: 'Rahul Sharma',
    department: 'Operations - NVPL',
    date: '2026-10-14',
    in_time: '09:22 AM',
    out_time: '06:34 PM',
    total_hours: '9h 12m',
    status: 'Present',
    shift: 'General Shift (09:30 - 18:30)',
  },
  {
    id: 'ATT-2026-10-002',
    employee: 'HR-EMP-00002',
    employee_name: 'Priya Patel',
    department: 'Operations - NVPL',
    date: '2026-10-14',
    in_time: '09:48 AM',
    out_time: '06:45 PM',
    total_hours: '8h 57m',
    status: 'Late',
    shift: 'General Shift (09:30 - 18:30)',
  },
  {
    id: 'ATT-2026-10-003',
    employee: 'HR-EMP-00003',
    employee_name: 'Amit Kumar',
    department: 'Accounts - NVPL',
    date: '2026-10-14',
    in_time: '09:15 AM',
    out_time: '06:20 PM',
    total_hours: '9h 05m',
    status: 'Present',
    shift: 'General Shift (09:30 - 18:30)',
  },
  {
    id: 'ATT-2026-10-004',
    employee: 'HR-EMP-00004',
    employee_name: 'Sneha Rao',
    department: 'Operations - NVPL',
    date: '2026-10-14',
    in_time: '09:28 AM',
    out_time: '06:31 PM',
    total_hours: '9h 03m',
    status: 'Present',
    shift: 'General Shift (09:30 - 18:30)',
  },
  {
    id: 'ATT-2026-10-005',
    employee: 'HR-EMP-00005',
    employee_name: 'Rohan Gupta',
    department: 'Operations - NVPL',
    date: '2026-10-14',
    in_time: '10:05 AM',
    out_time: '06:30 PM',
    total_hours: '8h 25m',
    status: 'Late',
    shift: 'General Shift (09:30 - 18:30)',
  },
  {
    id: 'ATT-2026-10-006',
    employee: 'HR-EMP-00006',
    employee_name: 'Madan Mohan',
    department: 'Operations - NVPL',
    date: '2026-10-14',
    in_time: '--:--',
    out_time: '--:--',
    total_hours: '0h 00m',
    status: 'On Leave',
    shift: 'General Shift (09:30 - 18:30)',
  },
  {
    id: 'ATT-2026-10-007',
    employee: 'HR-EMP-00007',
    employee_name: 'D Mohan Rao',
    department: 'Operations - NVPL',
    date: '2026-10-14',
    in_time: '09:10 AM',
    out_time: '06:15 PM',
    total_hours: '9h 05m',
    status: 'Present',
    shift: 'General Shift (09:30 - 18:30)',
  },
  {
    id: 'ATT-2026-10-008',
    employee: 'HR-EMP-00008',
    employee_name: 'Aadesh Hiralal Sonar',
    department: 'Operations - NVPL',
    date: '2026-10-14',
    in_time: '09:30 AM',
    out_time: '02:00 PM',
    total_hours: '4h 30m',
    status: 'Half Day',
    shift: 'General Shift (09:30 - 18:30)',
  },
];

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  employees,
  onOpenQuickPunch,
}) => {
  const [logs, setLogs] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_LOGS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentTime, setCurrentTime] = useState<string>(new Date().toLocaleTimeString());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Regularization Modal
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [regEmployee, setRegEmployee] = useState(employees[0]?.name || 'HR-EMP-00001');
  const [regDate, setRegDate] = useState('2026-10-14');
  const [regInTime, setRegInTime] = useState('09:30');
  const [regOutTime, setRegOutTime] = useState('18:30');
  const [regReason, setRegReason] = useState('');

  // Clock ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleRegularizeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.name === regEmployee) || employees[0];
    const newLog: AttendanceRecord = {
      id: `ATT-${Date.now().toString().slice(-6)}`,
      employee: emp.name,
      employee_name: emp.employee_name,
      department: emp.department || 'Operations',
      date: regDate,
      in_time: `${regInTime} AM`,
      out_time: `${regOutTime} PM`,
      total_hours: '9h 00m',
      status: 'Present',
      shift: 'General Shift (09:30 - 18:30)',
    };
    setLogs([newLog, ...logs]);
    setIsRegModalOpen(false);
    setToastMessage(`Attendance regularized for ${newLog.employee_name} on ${regDate}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchSearch =
        log.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' ? true : log.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [logs, searchQuery, statusFilter]);

  const presentCount = logs.filter((l) => l.status === 'Present').length;
  const lateCount = logs.filter((l) => l.status === 'Late').length;
  const onLeaveCount = logs.filter((l) => l.status === 'On Leave').length;
  const total = logs.length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount) / total) * 100) : 100;

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-xs animate-scaleUp">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-emerald-500 hover:text-emerald-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Live Punch & Shift Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold tracking-wider uppercase">
            <Clock className="w-4 h-4 animate-spin text-indigo-400" />
            <span>Live Office Biometric Sync • {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight font-mono text-white">
            {currentTime}
          </h2>
          <p className="text-xs text-slate-400">
            Current Shift: <strong className="text-indigo-200">General Corporate Shift (09:30 AM - 06:30 PM)</strong> • 30m grace period enabled
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenQuickPunch}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Fingerprint className="w-4 h-4" />
            <span>Punch In / Out</span>
          </button>

          <button
            onClick={() => setIsRegModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>Regularize Missed Punch</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Present Today</span>
            <h3 className="text-xl font-bold text-slate-800">{presentCount} On Time</h3>
            <p className="text-[11px] text-emerald-600 font-medium">{attendanceRate}% Workforce Present</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</span>
            <h3 className="text-xl font-bold text-slate-800">{lateCount} Employees</h3>
            <p className="text-[11px] text-amber-600 font-medium">Checked in after 09:30 AM</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">On Approved Leave</span>
            <h3 className="text-xl font-bold text-slate-800">{onLeaveCount} Staff</h3>
            <p className="text-[11px] text-blue-600 font-medium">Leaves applied in ledger</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Timer className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg. Daily Hours</span>
            <h3 className="text-xl font-bold text-slate-800">8h 48m</h3>
            <p className="text-[11px] text-indigo-600 font-medium">Exceeds 8.0h threshold</p>
          </div>
        </div>
      </div>

      {/* Main Attendance Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        {/* Table Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search by employee name or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs text-slate-500 font-medium mr-1">Filter:</span>
            {['All', 'Present', 'Late', 'Half Day', 'On Leave'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-800 text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Attendance Records */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Shift</th>
                <th className="py-3 px-4">In Time</th>
                <th className="py-3 px-4">Out Time</th>
                <th className="py-3 px-4">Total Logged</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                        {log.employee_name.charAt(0)}
                      </div>
                      <div>
                        <span className="font-semibold text-slate-800 block">{log.employee_name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">{log.employee}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600">{log.department}</td>
                  <td className="py-3 px-4 text-slate-500 text-[11px] font-mono">{log.shift}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700">{log.in_time}</td>
                  <td className="py-3 px-4 font-mono font-semibold text-slate-700">{log.out_time}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">{log.total_hours}</td>
                  <td className="py-3 px-4">
                    {log.status === 'Present' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Present
                      </span>
                    )}
                    {log.status === 'Late' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Late Arrival
                      </span>
                    )}
                    {log.status === 'Half Day' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                        Half Day
                      </span>
                    )}
                    {log.status === 'On Leave' && (
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        On Leave
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Regularize Missed Punch */}
      {isRegModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsRegModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden animate-scaleUp">
            <div className="h-14 bg-[#1A2232] text-white px-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Attendance Regularization</h3>
                  <p className="text-[11px] text-slate-400">Request correction for missed punches</p>
                </div>
              </div>
              <button
                onClick={() => setIsRegModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleRegularizeSubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={regEmployee}
                  onChange={(e) => setRegEmployee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.name} value={emp.name}>
                      {emp.employee_name} ({emp.name})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Date to Regularize</label>
                <input
                  type="date"
                  required
                  value={regDate}
                  onChange={(e) => setRegDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Correct In-Time</label>
                  <input
                    type="time"
                    required
                    value={regInTime}
                    onChange={(e) => setRegInTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">Correct Out-Time</label>
                  <input
                    type="time"
                    required
                    value={regOutTime}
                    onChange={(e) => setRegOutTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Reason for Regularization</label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Biometric scanner offline, Client on-site meeting..."
                  value={regReason}
                  onChange={(e) => setRegReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500 resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsRegModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Request</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
