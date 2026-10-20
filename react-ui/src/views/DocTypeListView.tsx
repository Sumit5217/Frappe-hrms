import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Search,
  Plus,
  RefreshCw,
  FileText,
  Eye,
  ExternalLink,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Heart,
  ChevronDown,
  Filter,
  Trash2,
  Clock,
} from 'lucide-react';
import { frappeApi } from '../api/frappe';
import { GenericDocModal } from '../components/GenericDocModal';
import { DocDetailModal } from '../components/DocDetailModal';
import { calculateSLA } from '../utils/sla';

const SUBMITTABLE_WORKFLOW_DOCTYPES = [
  'Leave Application',
  'Expense Claim',
  'Attendance Request',
  'Employee Advance',
  'Employee Separation',
  'Employee Onboarding',
  'Job Applicant',
];

const DOCTYPE_COLUMNS_MAP: Record<string, string[]> = {
  'Company': ['name', 'default_currency', 'country', 'is_group', 'enable_perpetual_inventory'],
  'Department': ['name', 'department_name', 'company', 'parent_department'],
  'Designation': ['name', 'designation_name', 'description'],
  'Branch': ['name', 'branch'],
  'Employee Grade': ['name', 'grade_name'],
  'Employment Type': ['name', 'employee_type_name'],
  'Shift Type': ['name', 'start_time', 'end_time'],
  'Shift Assignment': ['name', 'employee_name', 'shift_type', 'start_date', 'end_date', 'status'],
  'Shift Request': ['name', 'employee_name', 'shift_type', 'from_date', 'to_date', 'status'],
  'Holiday List': ['name', 'holiday_list_name', 'from_date', 'to_date', 'total_holidays'],
  'Leave Application': ['name', 'employee_name', 'leave_type', 'from_date', 'to_date', 'total_leave_days', 'status'],
  'Leave Allocation': ['name', 'employee_name', 'leave_type', 'from_date', 'to_date', 'new_leaves_allocated', 'total_leaves_allocated'],
  'Leave Type': ['name', 'max_days_allowed', 'is_carry_forward', 'is_lwp'],
  'Leave Policy': ['name', 'leave_policy_name', 'company'],
  'Compensatory Off Request': ['name', 'employee_name', 'work_end_date', 'status'],
  'Attendance': ['name', 'employee_name', 'attendance_date', 'status', 'shift'],
  'Attendance Request': ['name', 'employee_name', 'from_date', 'to_date', 'reason', 'status'],
  'Employee Checkin': ['name', 'employee_name', 'log_type', 'time', 'device_id'],
  'Expense Claim': ['name', 'employee_name', 'claim_date', 'total_claimed_amount', 'approval_status'],
  'Expense Claim Type': ['name', 'expense_type', 'description'],
  'Employee Advance': ['name', 'employee_name', 'posting_date', 'advance_amount', 'paid_amount', 'status'],
  'Travel Request': ['name', 'employee_name', 'departure_date', 'purpose_of_visit', 'status'],
  'Vehicle': ['name', 'license_plate', 'make', 'model', 'status'],
  'Vehicle Log': ['name', 'license_plate', 'employee_name', 'date', 'odometer'],
  'Driver': ['name', 'full_name', 'license_number', 'status'],
  'Job Opening': ['name', 'job_title', 'department', 'designation', 'status'],
  'Job Applicant': ['name', 'applicant_name', 'email_id', 'job_title', 'status'],
  'Job Offer': ['name', 'applicant_name', 'job_title', 'offer_date', 'status'],
  'Interview': ['name', 'job_applicant', 'interview_round', 'scheduled_on', 'status'],
  'Staffing Plan': ['name', 'from_date', 'to_date', 'department', 'company'],
  'Appointment Letter': ['name', 'applicant_name', 'job_title', 'status'],
  'Employee Onboarding': ['name', 'job_applicant', 'boarding_status', 'date_of_joining', 'company'],
  'Employee Separation': ['name', 'employee_name', 'resignation_letter_date', 'status'],
  'Employee Grievance': ['name', 'employee_name', 'subject', 'grievance_type', 'status'],
  'Training Program': ['name', 'training_program_name', 'trainer_name', 'status'],
  'Training Event': ['name', 'event_name', 'training_program', 'start_time', 'end_time'],
  'Appraisal': ['name', 'employee_name', 'appraisal_cycle', 'status', 'total_score'],
  'Appraisal Cycle': ['name', 'cycle_name', 'start_date', 'end_date', 'status'],
  'Goal': ['name', 'goal_name', 'employee_name', 'progress', 'status'],
  'KRA': ['name', 'title', 'description'],
  'Salary Slip': ['name', 'employee_name', 'start_date', 'end_date', 'gross_pay', 'net_pay', 'status'],
  'Payroll Entry': ['name', 'posting_date', 'payroll_frequency', 'company', 'status'],
  'Salary Structure': ['name', 'salary_structure_name', 'company', 'is_active'],
  'Salary Component': ['name', 'salary_component', 'type', 'description'],
  'Salary Structure Assignment': ['name', 'employee_name', 'salary_structure', 'from_date', 'base'],
  'Additional Salary': ['name', 'employee_name', 'salary_component', 'amount', 'payroll_date'],
  'Income Tax Slab': ['name', 'effective_from', 'allow_tax_exemption'],
  'Employee Benefit Application': ['name', 'employee_name', 'date', 'max_benefits', 'status'],
  'Employee Benefit Claim': ['name', 'employee_name', 'claim_date', 'claimed_amount', 'status'],
  'Employee Tax Exemption Declaration': ['name', 'employee_name', 'payroll_period', 'total_exemption_amount'],
  'Employee': ['name', 'employee_name', 'department', 'designation', 'company', 'status'],
  'Payment Entry': ['name', 'payment_type', 'party_type', 'party', 'paid_amount', 'status'],
  'Journal Entry': ['name', 'voucher_type', 'posting_date', 'total_debit', 'total_credit', 'docstatus'],
  'Complaint': ['name', 'title', 'complaint_category', 'priority', 'status', 'sla_deadline'],
};

const COLUMN_LABEL_MAP: Record<string, string> = {
  name: 'ID',
  id: 'ID',
  title: 'Title / Subject',
  complaint_category: 'Category',
  priority: 'Priority',
  status: 'Status',
  sla_deadline: 'SLA Deadline',
  default_currency: 'Default Currency',
  country: 'Country',
  is_group: 'Is Group',
  enable_perpetual_inventory: 'Enable Perpetual Inventory',
  department_name: 'Department Name',
  department: 'Department',
  designation_name: 'Designation Name',
  designation: 'Designation',
  company_name: 'Company Name',
  company: 'Company',
  employee_name: 'Employee Name',
  employee: 'Employee',
  holiday_list_name: 'Holiday List Name',
  from_date: 'From Date',
  to_date: 'To Date',
  total_leave_days: 'Total Days',
  claim_date: 'Claim Date',
  total_claimed_amount: 'Claimed Amount',
  approval_status: 'Approval Status',
  start_time: 'Start Time',
  end_time: 'End Time',
  grade_name: 'Grade Name',
  employee_type_name: 'Employment Type',
  shift_type: 'Shift Type',
  start_date: 'Start Date',
  end_date: 'End Date',
  new_leaves_allocated: 'Allocated Days',
  total_leaves_allocated: 'Total Quota',
  leave_type: 'Leave Type',
  leave_policy_name: 'Policy Name',
  work_end_date: 'Comp-Off Date',
  attendance_date: 'Attendance Date',
  shift: 'Shift',
  reason: 'Reason',
  log_type: 'Punch Type',
  time: 'Log Time',
  device_id: 'Device ID',
  expense_type: 'Expense Type',
  posting_date: 'Posting Date',
  advance_amount: 'Advance Amount',
  paid_amount: 'Paid Amount',
  departure_date: 'Departure Date',
  purpose_of_visit: 'Purpose',
  license_plate: 'License Plate',
  make: 'Vehicle Make',
  model: 'Model',
  odometer: 'Odometer (km)',
  full_name: 'Driver Name',
  license_number: 'License No',
  job_title: 'Job Title',
  applicant_name: 'Applicant Name',
  email_id: 'Email Address',
  offer_date: 'Offer Date',
  job_applicant: 'Job Applicant',
  interview_round: 'Interview Round',
  scheduled_on: 'Scheduled On',
  boarding_status: 'Onboarding Status',
  date_of_joining: 'Joining Date',
  resignation_letter_date: 'Resignation Date',
  subject: 'Subject',
  grievance_type: 'Grievance Type',
  training_program_name: 'Program Name',
  trainer_name: 'Trainer Name',
  event_name: 'Event Name',
  training_program: 'Training Program',
  appraisal_cycle: 'Appraisal Cycle',
  total_score: 'Score / Rating',
  cycle_name: 'Cycle Name',
  goal_name: 'Goal Name',
  progress: 'Progress (%)',
  gross_pay: 'Gross Earnings',
  net_pay: 'Net Take-Home',
  payroll_frequency: 'Payroll Frequency',
  salary_structure_name: 'Structure Name',
  salary_structure: 'Salary Structure',
  is_active: 'Active Status',
  salary_component: 'Component Name',
  type: 'Type',
  base: 'Base CTC',
  amount: 'Amount',
  payroll_date: 'Payroll Date',
  effective_from: 'Effective Date',
  allow_tax_exemption: 'Tax Exemption Allowed',
  max_benefits: 'Max Benefits',
  claimed_amount: 'Claimed Amount',
  payroll_period: 'Payroll Period',
  total_exemption_amount: 'Exemption Total',
  payment_type: 'Payment Type',
  party_type: 'Party Type',
  party: 'Party',
  voucher_type: 'Voucher Type',
  total_debit: 'Total Debit',
  total_credit: 'Total Credit',
  docstatus: 'Doc Status',
  creation: 'Created On',
  modified: 'Last Modified',
};

interface DocTypeListViewProps {
  doctype: string;
}

export const DocTypeListView: React.FC<DocTypeListViewProps> = ({ doctype }) => {
  const [records, setRecords] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState<string>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedDocName, setSelectedDocName] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState<number>(doctype === 'Complaint' ? 100 : 20);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState<boolean>(false);

  const isWorkflowDoc = SUBMITTABLE_WORKFLOW_DOCTYPES.includes(doctype);

  const handleRowApproval = async (
    e: React.MouseEvent,
    docname: string,
    targetStatus: 'Approved' | 'Rejected'
  ) => {
    e.stopPropagation();
    setActionLoading((prev) => ({ ...prev, [docname]: true }));
    try {
      const isSubmittable = ['Leave Application', 'Expense Claim', 'Attendance Request'].includes(doctype);
      const docstatus = targetStatus === 'Approved' && isSubmittable ? 1 : undefined;
      await frappeApi.updateDocStatus(doctype, docname, targetStatus, docstatus);
      await loadRecords();
    } catch (err) {
      console.error('Row approval error:', err);
    } finally {
      setActionLoading((prev) => ({ ...prev, [docname]: false }));
    }
  };

  const handleRowDelete = async (e: React.MouseEvent, docname: string) => {
    e.stopPropagation();
    const confirmed = window.confirm(`Permanently delete ${doctype} "${docname}" from Frappe database?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    setActionLoading((prev) => ({ ...prev, [docname]: true }));
    try {
      const res = await frappeApi.deleteDocRecord(doctype, docname);
      if (res.success) {
        setSelectedIds((prev) => {
          const next = new Set(prev);
          next.delete(docname);
          return next;
        });
        await loadRecords();
      } else {
        alert(res.message || `Failed to delete ${docname}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting record');
    } finally {
      setActionLoading((prev) => ({ ...prev, [docname]: false }));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    const count = selectedIds.size;
    const confirmed = window.confirm(
      `Permanently delete ${count} selected ${doctype} record(s) from Frappe database?\n\nThis action cannot be undone.`
    );
    if (!confirmed) return;

    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      let successCount = 0;
      let errorMsg = '';

      for (const id of ids) {
        const res = await frappeApi.deleteDocRecord(doctype, id);
        if (res.success) {
          successCount++;
        } else {
          errorMsg = res.message || `Failed to delete ${id}`;
        }
      }

      setSelectedIds(new Set());
      await loadRecords();

      if (errorMsg && successCount < count) {
        alert(`Deleted ${successCount} of ${count} records. Error: ${errorMsg}`);
      }
    } catch (err: any) {
      alert(err.message || 'Error deleting selected records');
    } finally {
      setBulkDeleting(false);
    }
  };

  const loadRecords = async () => {
    setLoading(true);
    try {
      const res = await frappeApi.getDocTypeList(doctype);
      setRecords(res.data);
      setColumns(res.fields);
    } catch (err) {
      console.error(`Failed to load ${doctype} records:`, err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
    if (doctype === 'Complaint') {
      setPageSize(100);
    }
  }, [doctype]);

  const filteredRecords = useMemo(() => {
    if (!search.trim()) return records;
    const q = search.toLowerCase();
    return records.filter((r) =>
      Object.values(r).some((val) => String(val).toLowerCase().includes(q))
    );
  }, [records, search]);

  const renderBadge = (val: any) => {
    const s = String(val);
    const lower = s.toLowerCase();
    if (['active', 'approved', 'submitted', 'paid', 'confirmed', 'resolved'].includes(lower)) {
      return (
        <span className="nv-chip bg-[#ECFDF5] text-[#059669] border border-[#A7F3D0]">
          {s}
        </span>
      );
    }
    if (['open'].includes(lower)) {
      return (
        <span className="nv-chip bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
          {s}
        </span>
      );
    }
    if (['draft', 'pending', 'in review'].includes(lower)) {
      return (
        <span className="nv-chip bg-[#FFFBEB] text-[#D97706] border border-[#FDE68A]">
          {s}
        </span>
      );
    }
    if (['escalated'].includes(lower)) {
      return (
        <span className="nv-chip bg-[#FFF1F2] text-[#E11D48] border border-[#FECDD3]">
          {s}
        </span>
      );
    }
    if (['rejected', 'cancelled', 'inactive', 'left'].includes(lower)) {
      return (
        <span className="nv-chip bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
          {s}
        </span>
      );
    }
    if (['closed'].includes(lower)) {
      return (
        <span className="nv-chip bg-[#F1F5F9] text-[#475569] border border-[#CBD5E1]">
          {s}
        </span>
      );
    }
    return <span className="nv-chip bg-[#F8FAFC] text-[#64748B] border border-[#E2E8F0]">{s}</span>;
  };

  const renderCellContent = (col: string, val: any, item?: any) => {
    const isStatus = col.toLowerCase().includes('status');
    if (isStatus) {
      return renderBadge(val);
    }
    if (col === 'sla_deadline') {
      const sla = calculateSLA(val, item?.status);
      if (!sla) {
        return <span className="text-[#64748B] text-xs font-mono">{String(val || '—')}</span>;
      }
      return (
        <div className="flex flex-col gap-1 min-w-[135px] max-w-[185px]">
          <span className={`px-2 py-0.5 rounded text-[10.5px] border inline-flex items-center gap-1 leading-tight ${sla.badgeClass}`}>
            <Clock className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{sla.shortLabel}</span>
          </span>
          <div className="w-full bg-[#E2E8F0] h-1.5 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${sla.barColor} transition-all duration-300`} style={{ width: `${sla.progressPercent}%` }} />
          </div>
        </div>
      );
    }
    if (col === 'name' || col === 'id') {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (val) setSelectedDocName(String(val));
          }}
          className="font-semibold text-primary hover:underline hover:text-primary-hover text-left cursor-pointer transition-colors"
        >
          {String(val ?? '—')}
        </button>
      );
    }
    if (
      col === 'is_group' ||
      col === 'enable_perpetual_inventory' ||
      col.startsWith('is_') ||
      col.startsWith('enable_')
    ) {
      const isTrue = val === 1 || val === true || val === '1';
      return isTrue ? (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded bg-[#64748B] text-white text-[10px] font-bold shadow-xs">
          ✓
        </span>
      ) : (
        <span className="inline-flex items-center justify-center w-4 h-4 rounded border border-[#CBD5E1] bg-white"></span>
      );
    }
    if (
      [
        'gross_pay', 'net_pay', 'advance_amount', 'paid_amount',
        'total_claimed_amount', 'base', 'amount', 'total_exemption_amount',
        'max_benefits', 'claimed_amount', 'total_debit', 'total_credit'
      ].includes(col)
    ) {
      const num = Number(val);
      if (!isNaN(num) && val !== null && val !== '') {
        return (
          <span className="font-mono font-semibold text-content-main">
            ₹{num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        );
      }
    }
    if (col.includes('date') || col === 'creation' || col === 'modified') {
      if (val && typeof val === 'string') {
        const d = val.split('T')[0];
        return <span className="text-[#475569] font-mono text-xs">{d}</span>;
      }
    }
    return (
      <span className="text-[#334155] font-normal">
        {String(val ?? '—')}
      </span>
    );
  };

  // Determine key display columns matching Frappe Desk
  const displayColumns = useMemo(() => {
    if (DOCTYPE_COLUMNS_MAP[doctype]) {
      const predefined = DOCTYPE_COLUMNS_MAP[doctype];
      const valid = predefined.filter((c) => columns.includes(c) || records.some((r) => r[c] !== undefined));
      if (valid.length > 0) return valid;
    }
    if (columns.length === 0) return ['name'];
    const priority = ['name', 'company_name', 'department_name', 'designation_name', 'status', 'employee_name', 'department', 'designation', 'company', 'date'];
    const chosen = columns.filter((c) => priority.includes(c));
    return chosen.length > 0 ? chosen.slice(0, 5) : columns.slice(0, 4);
  }, [columns, doctype, records]);

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Top Header Card matching Frappe Desk Screenshot 2 */}
      <div className="nv-card bg-surface-lowest border border-[rgba(140,150,175,0.14)] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-btn bg-[#EEF4FC] text-primary flex items-center justify-center font-bold shadow-xs">
            <Layers className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="font-serif text-xl font-bold text-content-main tracking-tight">
                {doctype}
              </h3>
              <span className="font-label text-[10.5px] px-2 py-0.5 rounded-chip bg-surface-low text-content-muted border border-[rgba(140,150,175,0.18)]">
                {records.length} records in Frappe
              </span>
            </div>
            <p className="text-xs font-sans text-content-muted mt-0.5">
              Live records synced directly from Frappe ERP database.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-content-muted">
            <button
              type="button"
              className="px-2.5 py-1.5 rounded-md border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] flex items-center gap-1 font-medium text-[#475569]"
            >
              <span>List View</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <button
            type="button"
            onClick={loadRecords}
            disabled={loading}
            className="btn-secondary text-xs h-8.5 px-3"
            title="Refresh from Frappe"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <a
            href={`http://localhost:8000/app/${encodeURIComponent(doctype.toLowerCase().replace(/\s+/g, '-'))}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-xs h-8.5 px-3 inline-flex items-center gap-1.5"
            title="Open in Frappe Desk"
          >
            <span>Frappe Desk</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary text-xs h-8.5 px-3.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add {doctype}</span>
          </button>
        </div>
      </div>

      {/* Filter / Search bar matching Frappe Desk Screenshot 2 */}
      {/* Multi-Select Bulk Actions Bar matching Frappe Desk */}
      {selectedIds.size > 0 && (
        <div className="bg-[#FEF2F2] border border-[#FECACA] rounded-xl px-4 py-2.5 flex items-center justify-between gap-4 animate-fadeIn shadow-xs">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center bg-[#DC2626] text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {selectedIds.size}
            </span>
            <span className="text-xs font-semibold text-[#991B1B]">
              {selectedIds.size === 1 ? '1 item selected' : `${selectedIds.size} items selected`}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="px-3 py-1.5 text-xs text-[#64748B] hover:text-[#1E293B] hover:bg-white rounded-lg transition-colors font-medium"
            >
              Deselect All
            </button>
            <button
              type="button"
              disabled={bulkDeleting}
              onClick={handleBulkDelete}
              className="px-3.5 py-1.5 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold rounded-lg shadow-xs inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{bulkDeleting ? 'Deleting...' : `Delete (${selectedIds.size})`}</span>
            </button>
          </div>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder={`Search ${doctype} by ID or name...`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="nv-input w-full pl-9 text-xs py-2 bg-white border-[rgba(140,150,175,0.22)]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs font-label">
          <span className="nv-chip bg-surface-low text-content-muted border border-[rgba(140,150,175,0.18)]">
            ID ≈
          </span>
          <span className="nv-chip bg-[#EEF4FC] text-primary border border-primary/20 font-medium inline-flex items-center gap-1">
            <Filter className="w-3 h-3" />
            <span>Filter</span>
          </span>
          <span className="nv-chip bg-surface-low text-content-muted border border-[rgba(140,150,175,0.18)]">
            Created On ▾
          </span>
        </div>
      </div>

      {/* Records Table or Authentic Frappe Empty State */}
      <div className="nv-card bg-surface-lowest border border-[rgba(140,150,175,0.14)] overflow-hidden min-h-[380px] flex flex-col justify-between">
        {loading ? (
          <div className="p-16 text-center text-xs text-content-muted my-auto">
            <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />
            <span>Loading {doctype} from Frappe backend...</span>
          </div>
        ) : filteredRecords.length === 0 ? (
          /* Empty state matching Frappe Desk Screenshot 2 */
          <div className="p-16 text-center text-xs text-content-muted flex flex-col items-center justify-center animate-fadeIn my-auto">
            <div className="w-16 h-16 rounded-2xl bg-surface-low border border-[rgba(140,150,175,0.18)] flex items-center justify-center mb-3 text-content-muted/70">
              <FileText className="w-8 h-8 stroke-[1.2]" />
            </div>
            <p className="font-serif font-bold text-base text-content-main mb-1">
              No {doctype} found
            </p>
            <p className="text-content-muted mb-4 text-xs font-sans">
              Clear the filters to see all records.
            </p>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="btn-secondary text-xs h-8 px-4 font-semibold hover:border-primary hover:text-primary transition-all flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {(() => {
              const visibleRecords = filteredRecords.slice(0, pageSize);
              const allVisibleSelected =
                visibleRecords.length > 0 && visibleRecords.every((r) => selectedIds.has(r.name));

              const toggleSelectAll = () => {
                if (allVisibleSelected) {
                  setSelectedIds(new Set());
                } else {
                  const next = new Set(selectedIds);
                  visibleRecords.forEach((r) => next.add(r.name));
                  setSelectedIds(next);
                }
              };

              const toggleSelectRow = (e: React.MouseEvent, name: string) => {
                e.stopPropagation();
                setSelectedIds((prev) => {
                  const next = new Set(prev);
                  if (next.has(name)) {
                    next.delete(name);
                  } else {
                    next.add(name);
                  }
                  return next;
                });
              };

              return (
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#E2E8F0] font-sans text-[11px] font-semibold text-[#64748B] bg-[#F8FAFC]">
                      <th className="w-10 py-3 px-3.5 text-center">
                        <input
                          type="checkbox"
                          checked={allVisibleSelected}
                          onChange={toggleSelectAll}
                          className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-primary focus:ring-primary cursor-pointer"
                        />
                      </th>
                      {displayColumns.map((col) => (
                        <th key={col} className="py-3 px-3.5">
                          {COLUMN_LABEL_MAP[col] || col.replace(/_/g, ' ')}
                        </th>
                      ))}
                      <th className="py-3 px-3.5 text-right w-44">
                        <div className="flex items-center justify-end gap-1 font-medium text-[11px]">
                          <span>{filteredRecords.length} of {records.length}</span>
                          <Heart className="w-3.5 h-3.5 text-[#94A3B8]" />
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#E2E8F0] text-xs font-sans">
                    {visibleRecords.map((item, idx) => {
                      const isSelected = selectedIds.has(item.name);
                      return (
                        <tr
                          key={item.name || idx}
                          onClick={() => setSelectedDocName(item.name)}
                          className={`transition-colors cursor-pointer group ${
                            isSelected ? 'bg-[#EFF6FF]' : 'hover:bg-[#F8FAFC]'
                          }`}
                        >
                          <td
                            className="w-10 py-2.5 px-3.5 text-center"
                            onClick={(e) => toggleSelectRow(e, item.name)}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleSelectRow(e as any, item.name);
                              }}
                              className="w-3.5 h-3.5 rounded border-[#CBD5E1] text-primary focus:ring-primary cursor-pointer"
                            />
                          </td>
                    {displayColumns.map((col) => {
                      const val = item[col];
                      return (
                        <td key={col} className="py-2.5 px-3.5">
                          {renderCellContent(col, val, item)}
                        </td>
                      );
                    })}
                    <td className="py-2.5 px-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-2 text-[#64748B]">
                        {/* 1-Click quick actions ONLY for submittable workflow documents */}
                        {isWorkflowDoc &&
                          (['open', 'draft', 'pending', 'applied'].includes(
                            String(item.status || item.approval_status || '').toLowerCase()
                          ) ||
                            item.docstatus === 0) && (
                            <div className="flex items-center gap-1 mr-1">
                              <button
                                type="button"
                                disabled={actionLoading[item.name]}
                                onClick={(e) => handleRowApproval(e, item.name, 'Approved')}
                                title="1-Click Approve"
                                className="px-2 py-0.5 rounded bg-[#ECFDF5] hover:bg-[#D1FAE5] text-[#059669] border border-[#A7F3D0] transition-colors disabled:opacity-50 inline-flex items-center gap-1 text-[11px] font-semibold"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                type="button"
                                disabled={actionLoading[item.name]}
                                onClick={(e) => handleRowApproval(e, item.name, 'Rejected')}
                                title="Reject"
                                className="px-2 py-0.5 rounded bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] transition-colors disabled:opacity-50 inline-flex items-center gap-1 text-[11px] font-semibold"
                              >
                                <XCircle className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}

                        <span className="text-[11px] text-[#94A3B8] hidden md:inline">5 h</span>
                        <span className="hidden md:inline-flex items-center gap-0.5 text-[11px] text-[#94A3B8]">
                          <MessageSquare className="w-3 h-3" />
                          <span>0</span>
                        </span>
                        <Heart className="w-3.5 h-3.5 text-[#94A3B8] hover:text-red-500 transition-colors cursor-pointer hidden md:inline" />

                        <button
                          type="button"
                          onClick={() => setSelectedDocName(item.name)}
                          className="text-primary hover:text-accent px-2 py-1 rounded hover:bg-[#EDF3FF] transition-colors inline-flex items-center gap-1 text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        <button
                          type="button"
                          disabled={actionLoading[item.name]}
                          onClick={(e) => handleRowDelete(e, item.name)}
                          className="text-[#94A3B8] hover:text-[#DC2626] px-1.5 py-1 rounded hover:bg-[#FEF2F2] transition-colors inline-flex items-center gap-1 text-xs font-semibold disabled:opacity-50"
                          title={`Permanently delete ${item.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden lg:inline">Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        );
      })()}
    </div>
  )}

        {/* Table Bottom Bar matching Frappe Desk Screenshot 2 */}
        <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#64748B]">
          <div className="flex items-center gap-2">
            {[20, 100, 500, 2500].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPageSize(size)}
                className={`px-2 py-0.5 rounded text-xs transition-colors ${
                  pageSize === size
                    ? 'bg-white font-bold text-primary shadow-xs border border-[#CBD5E1]'
                    : 'hover:text-[#1E293B]'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span>Showing {Math.min(filteredRecords.length, pageSize)} of {records.length} records</span>
          </div>
        </div>
      </div>

      {/* Generic Create Modal */}
      <GenericDocModal
        doctype={doctype}
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={() => {
          setIsCreateModalOpen(false);
          loadRecords();
        }}
      />

      {/* Document Detail & Edit Modal */}
      {selectedDocName && (
        <DocDetailModal
          doctype={doctype}
          docname={selectedDocName}
          isOpen={Boolean(selectedDocName)}
          onClose={() => setSelectedDocName(null)}
          onSaved={loadRecords}
        />
      )}
    </div>
  );
};

export default DocTypeListView;
