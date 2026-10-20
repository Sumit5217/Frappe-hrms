import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Search,
  CalendarDays,
  CalendarRange,
  FileText,
  X,
  Send,
  PartyPopper
} from 'lucide-react';
import { Employee, UserSession } from '../types';

interface LeavesViewProps {
  employees: Employee[];
  user?: UserSession;
  activeSubItem?: string;
  onNavigate?: (subItem: string, docType?: string, reportName?: string) => void;
}

interface LeaveApplicationRecord {
  id: string;
  employee: string;
  employee_name: string;
  department: string;
  leave_type: 'Casual Leave' | 'Sick Leave' | 'Privilege Leave' | 'Maternity / Paternity' | 'Compensatory Off';
  from_date: string;
  to_date: string;
  total_leave_days: number;
  reason: string;
  status: 'Open' | 'Approved' | 'Rejected';
  posting_date: string;
}

interface HolidayRecord {
  date: string;
  name: string;
  day: string;
  type: 'National Holiday' | 'Regional Festival' | 'Restricted Holiday';
}

const INITIAL_LEAVE_APPLICATIONS: LeaveApplicationRecord[] = [
  {
    id: 'LEAVE-2026-001',
    employee: 'HR-EMP-00001',
    employee_name: 'Rahul Sharma',
    department: 'Operations - NVPL',
    leave_type: 'Casual Leave',
    from_date: '2026-10-20',
    to_date: '2026-10-21',
    total_leave_days: 2,
    reason: 'Family wedding event in native hometown',
    status: 'Open',
    posting_date: '2026-10-12',
  },
  {
    id: 'LEAVE-2026-002',
    employee: 'HR-EMP-00002',
    employee_name: 'Priya Patel',
    department: 'Operations - NVPL',
    leave_type: 'Sick Leave',
    from_date: '2026-10-14',
    to_date: '2026-10-15',
    total_leave_days: 2,
    reason: 'Severe viral fever and doctor prescribed rest',
    status: 'Open',
    posting_date: '2026-10-13',
  },
  {
    id: 'LEAVE-2026-003',
    employee: 'HR-EMP-00003',
    employee_name: 'Amit Kumar',
    department: 'Accounts - NVPL',
    leave_type: 'Privilege Leave',
    from_date: '2026-10-28',
    to_date: '2026-10-31',
    total_leave_days: 4,
    reason: 'Annual family vacation travel booked',
    status: 'Open',
    posting_date: '2026-10-10',
  },
  {
    id: 'LEAVE-2026-004',
    employee: 'HR-EMP-00004',
    employee_name: 'Sneha Rao',
    department: 'Operations - NVPL',
    leave_type: 'Casual Leave',
    from_date: '2026-10-05',
    to_date: '2026-10-05',
    total_leave_days: 1,
    reason: 'Personal banking and government paperwork',
    status: 'Approved',
    posting_date: '2026-10-03',
  },
  {
    id: 'LEAVE-2026-005',
    employee: 'HR-EMP-00005',
    employee_name: 'Rohan Gupta',
    department: 'Operations - NVPL',
    leave_type: 'Compensatory Off',
    from_date: '2026-10-06',
    to_date: '2026-10-06',
    total_leave_days: 1,
    reason: 'Worked on production server deployment over the weekend',
    status: 'Approved',
    posting_date: '2026-10-04',
  },
  {
    id: 'LEAVE-2026-006',
    employee: 'HR-EMP-00008',
    employee_name: 'Aadesh Hiralal Sonar',
    department: 'Operations - NVPL',
    leave_type: 'Privilege Leave',
    from_date: '2026-09-22',
    to_date: '2026-09-25',
    total_leave_days: 4,
    reason: 'Travel without prior manager sprint approval',
    status: 'Rejected',
    posting_date: '2026-09-20',
  },
];

const COMPANY_HOLIDAYS_2026: HolidayRecord[] = [
  { date: '2026-01-26', name: 'Republic Day', day: 'Monday', type: 'National Holiday' },
  { date: '2026-03-04', name: 'Holi', day: 'Wednesday', type: 'Regional Festival' },
  { date: '2026-03-20', name: 'Ugadi / Gudi Padwa', day: 'Friday', type: 'Regional Festival' },
  { date: '2026-04-14', name: 'Dr. Ambedkar Jayanti', day: 'Tuesday', type: 'National Holiday' },
  { date: '2026-05-01', name: 'May Day / Labor Day', day: 'Friday', type: 'National Holiday' },
  { date: '2026-08-15', name: 'Independence Day', day: 'Saturday', type: 'National Holiday' },
  { date: '2026-10-02', name: 'Mahatma Gandhi Jayanti', day: 'Friday', type: 'National Holiday' },
  { date: '2026-10-20', name: 'Dussehra (Vijayadashami)', day: 'Tuesday', type: 'Regional Festival' },
  { date: '2026-11-08', name: 'Diwali (Deepavali)', day: 'Sunday', type: 'Regional Festival' },
  { date: '2026-11-10', name: 'Bhai Dooj', day: 'Tuesday', type: 'Restricted Holiday' },
  { date: '2026-12-25', name: 'Christmas Day', day: 'Friday', type: 'National Holiday' },
];

export const LeavesView: React.FC<LeavesViewProps> = ({ employees }) => {
  const [activeTab, setActiveTab] = useState<'applications' | 'balances' | 'holidays'>('applications');
  const [applications, setApplications] = useState<LeaveApplicationRecord[]>(INITIAL_LEAVE_APPLICATIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Approved' | 'Rejected'>('All');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Apply Leave Modal state
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [applyEmployee, setApplyEmployee] = useState(employees[0]?.name || 'HR-EMP-00001');
  const [applyLeaveType, setApplyLeaveType] = useState<LeaveApplicationRecord['leave_type']>('Casual Leave');
  const [applyFromDate, setApplyFromDate] = useState('2026-10-22');
  const [applyToDate, setApplyToDate] = useState('2026-10-23');
  const [applyReason, setApplyReason] = useState('');

  // Calculate day difference
  const calculatedDays = useMemo(() => {
    if (!applyFromDate || !applyToDate) return 1;
    const start = new Date(applyFromDate).getTime();
    const end = new Date(applyToDate).getTime();
    const diffDays = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
    return diffDays > 0 ? diffDays : 1;
  }, [applyFromDate, applyToDate]);

  // Handle Approve / Reject
  const handleUpdateStatus = (id: string, status: 'Approved' | 'Rejected') => {
    setApplications((prev) =>
      prev.map((app) => (app.id === id ? { ...app, status } : app))
    );
    setToastMessage(`Leave request ${id} has been marked as ${status}!`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handle Apply Leave Submit
  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((e) => e.name === applyEmployee) || employees[0];
    const newRecord: LeaveApplicationRecord = {
      id: `LEAVE-2026-${String(applications.length + 1).padStart(3, '0')}`,
      employee: emp?.name || 'HR-EMP-00001',
      employee_name: emp?.employee_name || 'Selected Employee',
      department: emp?.department || 'Operations',
      leave_type: applyLeaveType,
      from_date: applyFromDate,
      to_date: applyToDate,
      total_leave_days: calculatedDays,
      reason: applyReason || 'Personal / Medical leave',
      status: 'Open',
      posting_date: new Date().toISOString().split('T')[0],
    };

    setApplications([newRecord, ...applications]);
    setIsApplyModalOpen(false);
    setApplyReason('');
    setToastMessage(`Leave application submitted successfully for ${newRecord.employee_name}!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered Applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      const matchSearch =
        app.employee_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.employee.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.leave_type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'All' ? true : app.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [applications, searchQuery, statusFilter]);

  const openCount = applications.filter((a) => a.status === 'Open').length;

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

      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Casual Leave</span>
            <h3 className="text-xl font-bold text-slate-800">8 / 12 Days</h3>
            <p className="text-[11px] text-emerald-600 font-medium">4 Days Utilized</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sick Leave</span>
            <h3 className="text-xl font-bold text-slate-800">7 / 10 Days</h3>
            <p className="text-[11px] text-emerald-600 font-medium">3 Days Utilized</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <CalendarRange className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Privilege / Earned</span>
            <h3 className="text-xl font-bold text-slate-800">15 / 18 Days</h3>
            <p className="text-[11px] text-purple-600 font-medium">Eligible for carry-forward</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center gap-4 bg-gradient-to-br from-amber-50/40 to-white">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Pending Action</span>
            <h3 className="text-xl font-bold text-slate-800">{openCount} Approvals</h3>
            <p className="text-[11px] text-amber-600 font-medium">Requires Manager Sign-off</p>
          </div>
        </div>
      </div>

      {/* Main Tab Controller & Apply Leave Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'applications'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Leave Applications ({applications.length})</span>
            {openCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('balances')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'balances'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>Leave Ledgers & Balances</span>
          </button>

          <button
            onClick={() => setActiveTab('holidays')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'holidays'
                ? 'bg-primary text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <PartyPopper className="w-4 h-4 text-amber-500" />
            <span>Holiday Calendar 2026 ({COMPANY_HOLIDAYS_2026.length})</span>
          </button>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="btn-primary text-xs h-9 px-4 flex items-center gap-2 shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Apply for Leave</span>
        </button>
      </div>

      {/* TAB 1: Leave Applications List with Filter and Quick Approval */}
      {activeTab === 'applications' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden animate-fadeIn">
          {/* Filter Bar */}
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search by employee, leave type, department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              {(['All', 'Open', 'Approved', 'Rejected'] as const).map((st) => (
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

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 border-b border-slate-200 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Application ID</th>
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Leave Type</th>
                  <th className="py-3 px-4">Duration & Dates</th>
                  <th className="py-3 px-4">Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApps.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      No leave applications match the selected criteria.
                    </td>
                  </tr>
                ) : (
                  filteredApps.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">{app.id}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                            {app.employee_name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 block">{app.employee_name}</span>
                            <span className="text-[10px] text-slate-500 font-mono">{app.department}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {app.leave_type}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {app.total_leave_days} {app.total_leave_days === 1 ? 'Day' : 'Days'}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          {app.from_date} ➔ {app.to_date}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={app.reason}>
                        {app.reason}
                      </td>
                      <td className="py-3 px-4">
                        {app.status === 'Open' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-fit">
                            <Clock className="w-3 h-3" />
                            Pending Approval
                          </span>
                        )}
                        {app.status === 'Approved' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            Approved
                          </span>
                        )}
                        {app.status === 'Rejected' && (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {app.status === 'Open' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Approved')}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Approve Leave"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Approve</span>
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(app.id, 'Rejected')}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                              title="Reject Leave"
                            >
                              <XCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Reject</span>
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-mono">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: Leave Balances & Allocation Ledger */}
      {activeTab === 'balances' && (
        <div className="space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {employees.map((emp) => (
              <div key={emp.name} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-sm">
                      {emp.employee_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{emp.employee_name}</h4>
                      <p className="text-[11px] text-slate-400 font-mono">{emp.name} • {emp.department}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Casual Leave (CL)</span>
                      <span className="font-bold text-slate-800">8 / 12 Remaining</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '66%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Sick Leave (SL)</span>
                      <span className="font-bold text-slate-800">7 / 10 Remaining</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-600 h-2 rounded-full" style={{ width: '70%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-slate-600 mb-1">
                      <span>Privilege Leave (PL)</span>
                      <span className="font-bold text-slate-800">15 / 18 Remaining</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '83%' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Official Company Holiday Calendar 2026 */}
      {activeTab === 'holidays' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden animate-fadeIn">
          <div className="p-5 border-b border-slate-100 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                <PartyPopper className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Official Company Holiday List (FY 2026)</h3>
                <p className="text-xs text-slate-500">
                  Approved general public and festival holidays applicable to all corporate branch locations.
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {COMPANY_HOLIDAYS_2026.map((holiday, idx) => (
              <div key={idx} className="p-4 sm:px-6 flex items-center justify-between hover:bg-slate-50/80 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 text-center p-2 rounded-xl bg-slate-100 border border-slate-200">
                    <span className="block text-[10px] font-bold uppercase text-slate-500">
                      {new Date(holiday.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                    <span className="block text-base font-extrabold text-slate-800 leading-tight">
                      {new Date(holiday.date).getDate()}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-sm text-slate-800">{holiday.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">
                      {holiday.day} • {holiday.date}
                    </p>
                  </div>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                    holiday.type === 'National Holiday'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : holiday.type === 'Regional Festival'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }`}
                >
                  {holiday.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Apply for Leave */}
      {isApplyModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsApplyModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden animate-scaleUp">
            <div className="h-14 bg-[#1A2232] text-white px-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Apply for Leave</h3>
                  <p className="text-[11px] text-slate-400">Submit request for manager approval</p>
                </div>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  Employee <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={applyEmployee}
                  onChange={(e) => setApplyEmployee(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  {employees.map((emp) => (
                    <option key={emp.name} value={emp.name}>
                      {emp.employee_name} ({emp.name}) — {emp.department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Leave Type</label>
                <select
                  value={applyLeaveType}
                  onChange={(e) => setApplyLeaveType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary bg-white"
                >
                  <option value="Casual Leave">Casual Leave (CL)</option>
                  <option value="Sick Leave">Sick Leave (SL)</option>
                  <option value="Privilege Leave">Privilege Leave (PL / Earned)</option>
                  <option value="Compensatory Off">Compensatory Off (Comp-Off)</option>
                  <option value="Maternity / Paternity">Maternity / Paternity Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-gray-700 block mb-1">From Date</label>
                  <input
                    type="date"
                    required
                    value={applyFromDate}
                    onChange={(e) => setApplyFromDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700 block mb-1">To Date</label>
                  <input
                    type="date"
                    required
                    value={applyToDate}
                    onChange={(e) => setApplyToDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-blue-900">
                <span className="font-medium">Total Duration:</span>
                <span className="font-extrabold text-sm">{calculatedDays} {calculatedDays === 1 ? 'Working Day' : 'Working Days'}</span>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">Reason for Leave</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide brief context for the manager..."
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-primary text-white font-bold hover:bg-blue-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Leave</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
