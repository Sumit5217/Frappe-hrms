import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Edit3,
  Save,
  CheckCircle,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Tag,
  Paperclip,
  Share2,
  UserCheck,
  ChevronDown,
  MessageSquare,
  ShieldAlert,
  Trash2,
  Maximize2,
  Minimize2,
  RefreshCw,
  Send,
  Mail,
  Building2,
  FileText,
  History,
  CornerDownRight,
} from 'lucide-react';
import { frappeApi } from '../api/frappe';
import { calculateSLA } from '../utils/sla';

interface DocDetailModalProps {
  doctype: string;
  docname: string | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

const COMPANY_TABS = [
  'Details',
  'Accounts',
  'Accounts Closing',
  'Buying and Selling',
  'HR & Payroll',
  'Stock and Manufacturing',
  'Dashboard',
];

export const DocDetailModal: React.FC<DocDetailModalProps> = ({
  doctype,
  docname,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [docData, setDocData] = useState<Record<string, any> | null>(null);
  const [editableData, setEditableData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('Details');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);
  const [newNote, setNewNote] = useState<string>('');
  const [postingNote, setPostingNote] = useState<boolean>(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailMessage, setEmailMessage] = useState<string>('');
  const [emailRecipient, setEmailRecipient] = useState<string>('');
  const [sendingEmail, setSendingEmail] = useState<boolean>(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && docname) {
      setLoading(true);
      setErrorMessage(null);
      setSuccessMessage(null);
      setIsEditing(false);
      if (doctype === 'Complaint') {
        setActiveTab('Ticket Details');
      } else {
        setActiveTab('Details');
      }
      setNewNote('');

      frappeApi.getDocDetail(doctype, docname).then((data) => {
        setDocData(data);
        setEditableData(data || {});
        setLoading(false);
      });
    }
  }, [isOpen, doctype, docname]);

  const handleSave = async () => {
    if (!docname) return;
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await frappeApi.updateDocRecord(doctype, docname, editableData);
      if (res.success) {
        setSuccessMessage('Changes saved to Frappe database successfully.');
        setIsEditing(false);
        setDocData({ ...editableData });
        if (onSaved) onSaved();
      } else {
        setErrorMessage(res.message || 'Failed to update record in Frappe.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating record.');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusWorkflow = async (targetStatus: 'Approved' | 'Rejected') => {
    if (!docname) return;
    setApproving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const isSubmittableDoc = ['Leave Application', 'Expense Claim', 'Attendance Request'].includes(doctype);
      const docstatus = targetStatus === 'Approved' && isSubmittableDoc ? 1 : undefined;

      const res = await frappeApi.updateDocStatus(doctype, docname, targetStatus, docstatus);
      if (res.success) {
        setSuccessMessage(`Record ${targetStatus.toLowerCase()} successfully in Frappe.`);
        const refreshed = await frappeApi.getDocDetail(doctype, docname);
        if (refreshed) {
          setDocData(refreshed);
          setEditableData(refreshed);
        }
        if (onSaved) onSaved();
      } else {
        setErrorMessage(res.message || `Failed to update status to ${targetStatus}.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating workflow status.');
    } finally {
      setApproving(false);
    }
  };

  const handleComplaintAction = async (action: 'Assign' | 'Resolve' | 'Reject' | 'Close' | 'Reopen') => {
    if (!docname) return;
    setApproving(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      let updatePayload: Record<string, any> = {};
      if (action === 'Assign') {
        updatePayload = {
          status: 'In Review',
          assigned_to: 'Administrator',
        };
      } else if (action === 'Resolve') {
        const note = window.prompt('Enter resolution note:', editableData.resolution_note || 'Issue resolved by field technician');
        if (!note) {
          setApproving(false);
          return;
        }
        updatePayload = {
          status: 'Resolved',
          resolution_note: note,
          resolution_date: new Date().toISOString().slice(0, 10),
          resolved_by: 'Administrator',
        };
      } else if (action === 'Reject') {
        if (!window.confirm('Reject this complaint as invalid?')) {
          setApproving(false);
          return;
        }
        updatePayload = { status: 'Rejected' };
      } else if (action === 'Close') {
        if (!window.confirm('Close this complaint permanently?')) {
          setApproving(false);
          return;
        }
        updatePayload = { status: 'Closed' };
      } else if (action === 'Reopen') {
        const reason = window.prompt('Enter reason for reopening ticket:', 'Customer reported issue is not fully resolved');
        if (!reason) {
          setApproving(false);
          return;
        }
        const timeNow = new Date().toLocaleString();
        const existingNotes = editableData.internal_notes || '';
        const reopenLog = `${existingNotes ? existingNotes + '\n' : ''}[${timeNow} - System / User]: Reopened ticket. Reason: ${reason}`;
        updatePayload = {
          status: 'Open',
          internal_notes: reopenLog.trim(),
        };
      }

      const res = await frappeApi.updateDocRecord('Complaint', docname, updatePayload);
      if (res.success) {
        setSuccessMessage(`Complaint updated successfully in Frappe.`);
        const refreshed = await frappeApi.getDocDetail('Complaint', docname);
        if (refreshed) {
          setDocData(refreshed);
          setEditableData(refreshed);
        }
        if (onSaved) onSaved();
      } else {
        setErrorMessage(res.message || 'Failed to update complaint.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error updating complaint.');
    } finally {
      setApproving(false);
    }
  };

  const handleAddInternalNote = async () => {
    if (!docname || !newNote.trim()) return;
    setPostingNote(true);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const timeNow = new Date().toLocaleString();
      const existing = editableData.internal_notes || '';
      const appended = `${existing ? existing + '\n' : ''}[${timeNow} - Technician / Support]: ${newNote.trim()}`;

      const res = await frappeApi.updateDocRecord('Complaint', docname, {
        internal_notes: appended,
      });
      if (res.success) {
        setSuccessMessage('Internal note added successfully.');
        setNewNote('');
        const refreshed = await frappeApi.getDocDetail('Complaint', docname);
        if (refreshed) {
          setDocData(refreshed);
          setEditableData(refreshed);
        }
      } else {
        setErrorMessage(res.message || 'Failed to post note.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error posting internal note.');
    } finally {
      setPostingNote(false);
    }
  };

  const handleOpenEmailModal = () => {
    setEmailError(null);
    const defaultRecipient = editableData.email || editableData.contact_email || '';
    setEmailRecipient(defaultRecipient);
    setEmailSubject(`[Update] Complaint ${docname}: ${editableData.title || ''}`);
    setEmailMessage(
      `Hello ${editableData.customer_name || editableData.contact_person || 'Customer'},\n\nThis is an official update regarding your complaint (${docname}): "${editableData.title || ''}".\n\nCurrent Status: ${docData?.status || 'Open'}\nSLA Deadline: ${editableData.sla_deadline || 'On Track'}\n\nRemarks:\n${editableData.resolution_note || editableData.description || 'Our team is actively investigating your request.'}\n\nBest regards,\nNimble Vision Support & Field Service Team`
    );
    setIsEmailModalOpen(true);
  };

  const [supportSenderEmail, setSupportSenderEmail] = useState<string>('support@nimblevision.io');

  const handleSendEmail = async () => {
    if (!docname) return;
    if (!emailRecipient.trim()) {
      setEmailError('Please provide a recipient email address.');
      return;
    }
    setSendingEmail(true);
    setEmailError(null);
    setErrorMessage(null);
    setSuccessMessage(null);
    try {
      const res = await frappeApi.sendComplaintEmail(
        docname,
        emailSubject,
        emailMessage,
        emailRecipient.trim(),
        supportSenderEmail.trim(),
        supportSenderEmail.trim()
      );
      if (res.success) {
        setSuccessMessage(res.message || `Email sent successfully to ${emailRecipient}`);
        setIsEmailModalOpen(false);
        const timeNow = new Date().toLocaleString();
        const existing = editableData.internal_notes || '';
        const log = `${existing ? existing + '\n' : ''}[${timeNow} - Email Sent]: Dispatched status email to ${emailRecipient}`;
        await frappeApi.updateDocRecord('Complaint', docname, { internal_notes: log });
        const refreshed = await frappeApi.getDocDetail('Complaint', docname);
        if (refreshed) {
          setDocData(refreshed);
          setEditableData(refreshed);
        }
      } else {
        setEmailError(res.message || 'Failed to dispatch email.');
        setErrorMessage(res.message || 'Failed to dispatch email.');
      }
    } catch (err: any) {
      setEmailError(err.message || 'Error sending email.');
      setErrorMessage(err.message || 'Error sending email.');
    } finally {
      setSendingEmail(false);
    }
  };

  const handleDelete = async () => {
    if (!docname) return;
    const confirmed = window.confirm(`Permanently delete ${doctype} "${docname}" from Frappe database?\n\nThis action cannot be undone.`);
    if (!confirmed) return;

    setDeleting(true);
    setErrorMessage(null);
    try {
      const res = await frappeApi.deleteDocRecord(doctype, docname);
      if (res.success) {
        if (onSaved) onSaved();
        onClose();
      } else {
        setErrorMessage(res.message || `Failed to delete ${docname}.`);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error deleting record.');
    } finally {
      setDeleting(false);
    }
  };

  const isWorkflowDoc = [
    'Leave Application',
    'Expense Claim',
    'Attendance Request',
    'Employee Advance',
    'Employee Separation',
    'Employee Onboarding',
    'Job Applicant',
  ].includes(doctype);

  const currentStatus = (docData?.status || docData?.approval_status || '').toLowerCase();
  const isPendingApproval =
    isWorkflowDoc &&
    (['open', 'draft', 'pending', 'applied', 'under review'].includes(currentStatus) ||
      docData?.docstatus === 0);

  // Derive monogram initials for avatar box (e.g. Nimble Vision -> NV)
  const monogram = useMemo(() => {
    const title = editableData.company_name || docname || 'NV';
    const parts = String(title).trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return title.slice(0, 2).toUpperCase();
  }, [editableData.company_name, docname]);

  // Generic display fields for non-Company DocTypes
  const genericDisplayFields: string[] = useMemo(() => {
    if (!docData) return [];
    const fields = Object.keys(docData).filter(
      (k: string) =>
        !k.startsWith('_') &&
        !['doctype', 'lft', 'rgt', 'owner', 'modified_by', 'idx'].includes(k)
    );
    const topPriority = [
      'name',
      'company_name',
      'department_name',
      'designation_name',
      'employee_name',
      'abbr',
      'default_currency',
      'country',
      'is_group',
      'domain',
      'status',
      'approval_status',
      'from_date',
      'to_date',
      'total_leave_days',
      'claim_date',
      'total_claimed_amount',
    ];
    return [...fields].sort((a, b) => {
      const aIdx = topPriority.indexOf(a);
      const bIdx = topPriority.indexOf(b);
      if (aIdx !== -1 && bIdx !== -1) return aIdx - bIdx;
      if (aIdx !== -1) return -1;
      if (bIdx !== -1) return 1;
      return 0;
    });
  }, [docData]);

  const renderFieldInput = (
    label: string,
    field: string,
    required = false,
    placeholder = ''
  ) => {
    const val = editableData[field];
    return (
      <div>
        <label className="block font-sans text-xs font-medium text-[#475569] mb-1">
          {label} {required && <span className="text-[#EF4444]">*</span>}
        </label>
        {isEditing ? (
          <input
            type="text"
            placeholder={placeholder}
            value={val ?? ''}
            onChange={(e) => setEditableData({ ...editableData, [field]: e.target.value })}
            className="w-full text-xs py-2 px-3 bg-white rounded-md border border-[#CBD5E1] text-[#1E293B] focus:outline-none focus:border-primary transition-colors"
          />
        ) : (
          <div className="text-xs py-2 px-3 rounded-md bg-[#F8FAFC] border border-[#E2E8F0] font-medium text-[#1E293B] min-h-[34px] flex items-center">
            {val !== undefined && val !== null && val !== '' ? String(val) : '—'}
          </div>
        )}
      </div>
    );
  };

  const renderCheckboxField = (label: string, field: string) => {
    const isChecked = Boolean(editableData[field]);
    return (
      <div className="flex items-center gap-2 pt-6">
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
          <input
            type="checkbox"
            disabled={!isEditing}
            checked={isChecked}
            onChange={(e) =>
              setEditableData({ ...editableData, [field]: e.target.checked ? 1 : 0 })
            }
            className="w-4 h-4 rounded border-[#CBD5E1] text-primary focus:ring-primary cursor-pointer disabled:opacity-80"
          />
          <span className="text-xs font-medium text-[#1E293B]">{label}</span>
        </label>
      </div>
    );
  };

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !docname) return null;

  const isComplaint = doctype === 'Complaint';

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-[#0d121c]/60 backdrop-blur-sm animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`nv-card bg-white border border-[rgba(140,150,175,0.18)] shadow-2xl rounded-xl w-full flex flex-col overflow-hidden animate-scaleUp transition-all duration-200 cursor-default ${
          isMaximized
            ? 'w-[99vw] h-[98vh] max-w-none max-h-none'
            : isComplaint
            ? 'w-[98vw] max-w-none max-h-[96vh] h-[95vh]'
            : 'max-w-5xl max-h-[90vh]'
        }`}
      >
        {/* Header matching Frappe Desk Screenshot 3 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0] bg-white flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-sm font-semibold text-content-muted">
              {doctype}
            </span>
            <span className="text-content-muted/50 font-serif text-sm">/</span>
            <h2 className="text-sm font-bold text-[#1E293B] tracking-tight truncate max-w-md">
              {editableData.title ? `${docname} — ${editableData.title}` : (editableData.company_name || docname)}
            </h2>
            {docData?.status && (
              <span
                className={`nv-chip text-[10px] font-semibold ml-2 ${
                  ['approved', 'submitted', 'active'].includes(currentStatus)
                    ? 'bg-[#ECFDF5] text-[#059669] border-[#A7F3D0]'
                    : ['rejected', 'cancelled'].includes(currentStatus)
                    ? 'bg-[#FEF2F2] text-[#DC2626] border-[#FECACA]'
                    : 'bg-[#FFFBEB] text-[#D97706] border-[#FDE68A]'
                }`}
              >
                {docData.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-xs text-content-muted mr-1">
              <button
                type="button"
                className="px-2.5 py-1 rounded border border-[#CBD5E1] hover:bg-[#F8FAFC] flex items-center gap-1 font-medium text-[#475569]"
              >
                <span>View</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              <button
                type="button"
                className="px-2.5 py-1 rounded border border-[#CBD5E1] hover:bg-[#F8FAFC] flex items-center gap-1 font-medium text-[#475569]"
              >
                <span>Manage</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <a
              href={`http://localhost:8000/app/${encodeURIComponent(
                doctype.toLowerCase().replace(/\s+/g, '-')
              )}/${encodeURIComponent(docname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-xs h-8 px-2.5 inline-flex items-center gap-1"
              title="Open directly in Frappe Desk"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desk</span>
            </a>

            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="btn-secondary text-xs h-8 px-3.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="btn-primary text-xs h-8 px-4"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="px-2.5 h-8 rounded-md bg-[#FEF2F2] hover:bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] text-xs font-semibold inline-flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title={`Permanently delete ${docname}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{deleting ? 'Deleting...' : 'Delete'}</span>
            </button>

            <button
              type="button"
              onClick={() => setIsMaximized((prev) => !prev)}
              className="p-1.5 text-content-muted hover:text-content-main rounded-lg hover:bg-surface-high transition-colors"
              title={isMaximized ? 'Restore size' : 'Expand full size'}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-content-muted hover:text-content-main rounded-lg hover:bg-surface-high transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs Bar matching Frappe Desk Screenshot 3 */}
        {doctype === 'Company' ? (
          <div className="flex items-center gap-6 px-6 border-b border-[#E2E8F0] bg-white overflow-x-auto text-xs font-medium text-[#64748B] flex-shrink-0">
            {COMPANY_TABS.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-3 relative whitespace-nowrap transition-colors ${
                  activeTab === tab
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'hover:text-[#1E293B]'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        ) : doctype === 'Complaint' ? (
          <div className="flex items-center gap-6 px-6 border-b border-[#E2E8F0] bg-white overflow-x-auto text-xs font-medium text-[#64748B] flex-shrink-0">
            {['Ticket Details', 'Timeline & Notes', 'Customer & B2B Info'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`py-3 relative whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeTab === tab
                    ? 'text-primary font-bold border-b-2 border-primary'
                    : 'hover:text-[#1E293B]'
                }`}
              >
                {tab === 'Ticket Details' && <FileText className="w-3.5 h-3.5" />}
                {tab === 'Timeline & Notes' && <History className="w-3.5 h-3.5" />}
                {tab === 'Customer & B2B Info' && <Building2 className="w-3.5 h-3.5" />}
                <span>{tab}</span>
              </button>
            ))}
          </div>
        ) : null}

        {/* Workflow 1-Click Approval Action Bar for Pending Requests */}
        {isPendingApproval && !loading && (
          <div className="bg-[#FAFBFD] border-b border-[#E2E8F0] px-6 py-3 flex items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-sans text-content-muted">
              <Clock className="w-3.5 h-3.5 text-[#D97706]" />
              <span className="font-medium text-content-main">Awaiting Decision:</span>
              <span>This record is pending approval in Frappe.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStatusWorkflow('Approved')}
                disabled={approving}
                className="h-7.5 px-3 rounded-md bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{approving ? 'Processing...' : '1-Click Approve'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleStatusWorkflow('Rejected')}
                disabled={approving}
                className="h-7.5 px-3 rounded-md bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
            </div>
          </div>
        )}

        {/* Complaint Workflow Actions with Dynamic SLA and Smart Buttons */}
        {doctype === 'Complaint' && !loading && docData && (
          <div className="bg-[#FAFBFD] border-b border-[#E2E8F0] px-6 py-3 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
            <div className="flex items-center gap-3 text-xs font-sans text-content-muted">
              <span className="font-semibold text-content-main">Status:</span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border inline-flex items-center gap-1.5 ${
                  docData.status === 'Open'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : docData.status === 'In Review'
                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                    : docData.status === 'Escalated'
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : docData.status === 'Resolved'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : docData.status === 'Rejected'
                    ? 'bg-red-50 text-red-700 border-red-200'
                    : 'bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                <span>{docData.status || 'Open'}</span>
              </span>

              {/* Dynamic SLA Countdown Badge and Progress Bar */}
              {docData.sla_deadline && (() => {
                const sla = calculateSLA(docData.sla_deadline, docData.status);
                if (!sla) return null;
                return (
                  <div className="flex items-center gap-2 pl-2 border-l border-[#CBD5E1]">
                    <span className={`px-2.5 py-1 rounded-md text-xs border inline-flex items-center gap-1.5 ${sla.badgeClass}`}>
                      <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{sla.label}</span>
                    </span>
                    <div className="w-24 bg-[#E2E8F0] h-2 rounded-full overflow-hidden hidden sm:block">
                      <div
                        className={`h-full ${sla.barColor} transition-all duration-500`}
                        style={{ width: `${sla.progressPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Smart Action Buttons (Zero Redundancy) */}
            <div className="flex items-center gap-2">
              {docData.status === 'Open' && (
                <>
                  <button
                    type="button"
                    onClick={() => handleComplaintAction('Assign')}
                    disabled={approving}
                    className="h-7.5 px-3 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Assign to Me</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleComplaintAction('Resolve')}
                    disabled={approving}
                    className="h-7.5 px-3 rounded-md bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve Directly</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleComplaintAction('Reject')}
                    disabled={approving}
                    className="h-7.5 px-3 rounded-md bg-[#DC2626] hover:bg-[#B91C1C] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </>
              )}
              {['In Review', 'Escalated'].includes(docData.status) && (
                <>
                  <button
                    type="button"
                    onClick={() => handleComplaintAction('Resolve')}
                    disabled={approving}
                    title="Click when you have finished resolving this complaint"
                    className="h-7.5 px-3.5 rounded-md bg-[#059669] hover:bg-[#047857] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve Complaint</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleComplaintAction('Close')}
                    disabled={approving}
                    className="h-7.5 px-3 rounded-md bg-[#475569] hover:bg-[#334155] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Close Ticket</span>
                  </button>
                </>
              )}
              {['Resolved', 'Closed', 'Rejected'].includes(docData.status) && (
                <button
                  type="button"
                  onClick={() => handleComplaintAction('Reopen')}
                  disabled={approving}
                  className="h-7.5 px-3.5 rounded-md bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reopen Ticket</span>
                </button>
              )}

              {/* Email Customer Button */}
              <button
                type="button"
                onClick={handleOpenEmailModal}
                className="h-7.5 px-3 rounded-md bg-white hover:bg-[#F8FAFC] text-[#2563EB] border border-[#BFDBFE] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Send an email update or receipt to the complainant"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Email Customer</span>
              </button>
            </div>
          </div>
        )}

        {/* Notices */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-start gap-2 flex-shrink-0">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs flex items-start gap-2 flex-shrink-0">
            <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Body Content with 2 Columns + Right Sidebar matching Screenshot 3 */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="py-20 text-center text-xs text-content-muted font-label uppercase tracking-wider">
              Loading record details from Frappe database...
            </div>
          ) : !docData ? (
            <div className="py-20 text-center text-xs text-content-muted font-serif">
              Could not retrieve record details from Frappe.
            </div>
          ) : doctype === 'Company' ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main Content Area (8 Cols) */}
              <div className="lg:col-span-8 space-y-6">
                {activeTab === 'Details' && (
                  <div className="space-y-6">
                    {/* Two-Column Details matching Frappe Desk Screenshot 3 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                      {/* Left Column */}
                      <div className="space-y-4">
                        {renderFieldInput('Abbr', 'abbr', true, 'e.g. NVPL')}
                        {renderFieldInput('Default Currency', 'default_currency', true, 'e.g. INR')}
                        {renderFieldInput('Country', 'country', true, 'e.g. India')}
                        {renderCheckboxField('Is Group', 'is_group')}
                        {renderFieldInput('Default Holiday List', 'default_holiday_list', false, 'Select Holiday List')}
                        {renderFieldInput('Default Letter Head (DocType)', 'default_letter_head', false)}
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        {renderFieldInput('Tax ID', 'tax_id', false, 'GSTIN / PAN / EIN')}
                        {renderFieldInput('Domain', 'domain', false, 'e.g. Technology')}
                        {renderFieldInput('Date of Establishment', 'date_of_establishment', false, 'YYYY-MM-DD')}
                        {renderFieldInput('Parent Company', 'parent_company', false)}
                        {renderFieldInput('Reporting Currency', 'reporting_currency', false, 'e.g. INR')}
                        {renderFieldInput('Default Letter Head (Report)', 'default_letter_head_report', false)}
                      </div>
                    </div>

                    {/* Address & Contact Section */}
                    <div className="pt-6 border-t border-[#E2E8F0]">
                      <h4 className="text-xs font-bold text-[#1E293B] uppercase tracking-wider mb-4 flex items-center gap-2">
                        <span>Address & Contact</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                        {renderFieldInput('Phone No', 'phone_no', false, '+91 ...')}
                        {renderFieldInput('Email', 'email', false, 'info@company.com')}
                        {renderFieldInput('Website', 'website', false, 'https://...')}
                        {renderFieldInput('Registration Details', 'registration_details', false)}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'Accounts' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-bold text-[#1E293B]">Default Accounts</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderFieldInput('Default Bank Account', 'default_bank_account')}
                      {renderFieldInput('Default Cash Account', 'default_cash_account')}
                      {renderFieldInput('Default Receivable Account', 'default_receivable_account')}
                      {renderFieldInput('Default Payable Account', 'default_payable_account')}
                      {renderFieldInput('Default Cost Center', 'cost_center')}
                      {renderFieldInput('Round Off Account', 'round_off_account')}
                    </div>
                  </div>
                )}

                {activeTab === 'Accounts Closing' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-bold text-[#1E293B]">Period Closing Settings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderFieldInput('Period Closing Date', 'period_closing_date')}
                      {renderFieldInput('Accumulated Profit/Loss Account', 'accumulated_profit_loss_account')}
                    </div>
                  </div>
                )}

                {activeTab === 'Buying and Selling' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-bold text-[#1E293B]">Buying & Selling Defaults</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderFieldInput('Default Buying Terms', 'default_buying_terms')}
                      {renderFieldInput('Default Selling Terms', 'default_selling_terms')}
                      {renderFieldInput('Default Price List', 'default_price_list')}
                    </div>
                  </div>
                )}

                {activeTab === 'HR & Payroll' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-bold text-[#1E293B]">HR & Payroll Configuration</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderFieldInput('Default Holiday List', 'default_holiday_list')}
                      {renderFieldInput('Default Expense Claim Account', 'default_expense_claim_payable_account')}
                      {renderFieldInput('Default Payroll Payable Account', 'default_payroll_payable_account')}
                      {renderFieldInput('Standard Working Hours', 'standard_working_hours')}
                    </div>
                  </div>
                )}

                {activeTab === 'Stock and Manufacturing' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-bold text-[#1E293B]">Stock Settings</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderCheckboxField('Enable Perpetual Inventory', 'enable_perpetual_inventory')}
                      {renderFieldInput('Default Inventory Account', 'default_inventory_account')}
                      {renderFieldInput('Stock Adjustment Account', 'stock_adjustment_account')}
                      {renderFieldInput('Stock Received But Not Billed', 'stock_received_but_not_billed')}
                    </div>
                  </div>
                )}

                {activeTab === 'Dashboard' && (
                  <div className="space-y-4 text-xs">
                    <h4 className="font-bold text-[#1E293B]">Company Dashboard & Analytics</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                        <div className="text-content-muted text-[11px] font-medium">Headcount</div>
                        <div className="text-xl font-bold text-[#1E293B] mt-1">3 Active</div>
                      </div>
                      <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                        <div className="text-content-muted text-[11px] font-medium">Departments</div>
                        <div className="text-xl font-bold text-[#1E293B] mt-1">4 Recorded</div>
                      </div>
                      <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
                        <div className="text-content-muted text-[11px] font-medium">Database Status</div>
                        <div className="text-xs font-semibold text-[#059669] mt-2 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Connected</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Sidebar matching Screenshot 3 */}
              <div className="lg:col-span-4 space-y-6 lg:border-l lg:border-[#E2E8F0] lg:pl-6">
                {/* Monogram Box (NV) */}
                <div className="flex flex-col items-center sm:items-start">
                  <div className="w-24 h-24 rounded-2xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-3xl font-bold text-[#64748B] tracking-wider select-none shadow-xs mb-3">
                    {monogram}
                  </div>
                  <h3 className="font-bold text-sm text-[#1E293B]">
                    {editableData.company_name || docname}
                  </h3>
                  <p className="text-xs text-content-muted mt-0.5">
                    Frappe ERP Master Entity
                  </p>
                </div>

                {/* Quick actions: Assign, Attachments, Tags, Share */}
                <div className="space-y-2 text-xs pt-2 border-t border-[#E2E8F0]">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#F8FAFC] text-[#475569] transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-content-muted" />
                    <span>Assign</span>
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#F8FAFC] text-[#475569] transition-colors"
                  >
                    <Paperclip className="w-4 h-4 text-content-muted" />
                    <span>Attachments</span>
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#F8FAFC] text-[#475569] transition-colors"
                  >
                    <Tag className="w-4 h-4 text-content-muted" />
                    <span>Tags</span>
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#F8FAFC] text-[#475569] transition-colors"
                  >
                    <Share2 className="w-4 h-4 text-content-muted" />
                    <span>Share</span>
                  </button>
                </div>

                {/* Audit Timestamps matching Screenshot 3 */}
                <div className="pt-4 border-t border-[#E2E8F0] space-y-3 text-[11px] text-[#64748B]">
                  <div>
                    <div className="font-medium text-[#1E293B]">Last Edited By You</div>
                    <div>{docData.modified ? `${docData.modified.slice(0, 16)}` : 'Recently'}</div>
                  </div>
                  <div>
                    <div className="font-medium text-[#1E293B]">Created By You</div>
                    <div>{docData.creation ? `${docData.creation.slice(0, 16)}` : 'Recently'}</div>
                  </div>
                </div>
              </div>
            </div>
          ) : doctype === 'Complaint' ? (
            <div className="space-y-6 text-xs">
              {/* TAB 1: TICKET DETAILS */}
              {activeTab === 'Ticket Details' && (
                <div className="space-y-6">
                  {/* 1. Dynamic SLA Countdown & Progress Card */}
                  {docData?.sla_deadline && (() => {
                    const sla = calculateSLA(docData.sla_deadline, docData.status);
                    if (!sla) return null;
                    return (
                      <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        sla.isBreached
                          ? 'bg-[#FEF2F2] border-[#FECACA] text-[#DC2626]'
                          : sla.hoursRemaining <= 12
                          ? 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]'
                          : 'bg-[#F0FDF4] border-[#BBF7D0] text-[#16A34A]'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            sla.isBreached ? 'bg-[#DC2626] text-white' : sla.hoursRemaining <= 12 ? 'bg-[#D97706] text-white' : 'bg-[#16A34A] text-white'
                          }`}>
                            <Clock className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="font-bold text-sm">{sla.label}</div>
                            <div className="text-xs opacity-80 mt-0.5">
                              SLA Deadline Target: <span className="font-semibold">{docData.sla_deadline}</span>
                            </div>
                          </div>
                        </div>

                        <div className="w-full sm:w-64 space-y-1.5">
                          <div className="flex justify-between text-[11px] font-semibold">
                            <span>SLA Resolution Progress</span>
                            <span>{Math.round(sla.progressPercent)}%</span>
                          </div>
                          <div className="w-full bg-white/70 h-2 rounded-full overflow-hidden border border-black/10">
                            <div
                              className={`h-full ${sla.barColor} transition-all duration-500`}
                              style={{ width: `${sla.progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* 2. Key Metadata Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="text-[11px] font-semibold text-content-muted uppercase">Category</div>
                      <div className="font-bold text-sm text-[#1E293B] mt-1">{editableData.complaint_category || 'B2C'}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="text-[11px] font-semibold text-content-muted uppercase">Type</div>
                      <div className="font-bold text-sm text-[#1E293B] mt-1">{editableData.complaint_type || 'General'}</div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="text-[11px] font-semibold text-content-muted uppercase">Priority</div>
                      <div className="font-bold text-sm text-[#1E293B] mt-1">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          editableData.priority === 'Critical' ? 'bg-[#FEF2F2] text-[#DC2626]' :
                          editableData.priority === 'High' ? 'bg-[#FFFBEB] text-[#D97706]' :
                          'bg-[#F0FDF4] text-[#16A34A]'
                        }`}>
                          {editableData.priority || 'Medium'}
                        </span>
                      </div>
                    </div>
                    <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                      <div className="text-[11px] font-semibold text-content-muted uppercase">Assigned Handler</div>
                      <div className="font-bold text-sm text-[#1E293B] mt-1 truncate">{editableData.assigned_to || 'Unassigned'}</div>
                    </div>
                  </div>

                  {/* 3. Core Complaint Fields */}
                  <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-xs">
                    <h4 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-primary" />
                      <span>Ticket Specifications</span>
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {renderFieldInput('Complaint Title', 'title', true)}
                      {renderFieldInput('Date Registered', 'date')}
                      {renderFieldInput('Source Channel', 'source')}
                      {renderFieldInput('Assigned Handler', 'assigned_to')}
                    </div>
                  </div>

                  {/* 4. Issue Description Card */}
                  <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-2 shadow-xs">
                    <h4 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-[#D97706]" />
                      <span>Issue Description</span>
                    </h4>
                    {isEditing ? (
                      <textarea
                        rows={4}
                        value={editableData.description ?? ''}
                        onChange={(e) => setEditableData({ ...editableData, description: e.target.value })}
                        className="w-full text-xs p-3 bg-white rounded-md border border-[#CBD5E1] text-[#1E293B] focus:outline-none focus:border-primary"
                      />
                    ) : (
                      <div className="p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] font-sans text-xs text-[#334155] leading-relaxed whitespace-pre-wrap">
                        {editableData.description || 'No description provided.'}
                      </div>
                    )}
                  </div>

                  {/* 5. Resolution Section */}
                  {(editableData.resolution_note || isEditing || editableData.status === 'Resolved' || editableData.status === 'Closed') && (
                    <div className="p-5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] space-y-3 shadow-xs">
                      <h4 className="font-bold text-sm text-[#16A34A] flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-[#16A34A]" />
                        <span>Resolution Details</span>
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderFieldInput('Resolved By', 'resolved_by')}
                        {renderFieldInput('Resolution Date', 'resolution_date')}
                      </div>
                      <div>
                        <label className="block font-sans text-xs font-medium text-[#475569] mb-1">
                          Resolution Note
                        </label>
                        {isEditing ? (
                          <textarea
                            rows={3}
                            value={editableData.resolution_note ?? ''}
                            onChange={(e) => setEditableData({ ...editableData, resolution_note: e.target.value })}
                            className="w-full text-xs p-2.5 bg-white rounded-md border border-[#CBD5E1] text-[#1E293B]"
                          />
                        ) : (
                          <div className="p-3.5 rounded-lg bg-white border border-[#CBD5E1] text-xs text-[#1E293B] whitespace-pre-wrap">
                            {editableData.resolution_note || 'Issue resolved.'}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: TIMELINE & INTERNAL NOTES (COMMUNICATION HUB) */}
              {activeTab === 'Timeline & Notes' && (
                <div className="space-y-6">
                  {/* Timeline Summary Box */}
                  <div className="p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <History className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-sm text-[#1E293B]">Field Service & Activity Hub</div>
                        <div className="text-[11px] text-content-muted">
                          Registered via {editableData.source || 'Portal'} on {editableData.date || 'Today'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-content-muted">Assignee:</span>
                      <span className="font-semibold text-xs text-[#1E293B] bg-white px-2.5 py-1 rounded-md border border-[#CBD5E1]">
                        {editableData.assigned_to || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  {/* Internal Notes Feed */}
                  <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        <span>Technician Notes & Status Log</span>
                      </h4>
                      <span className="text-[11px] text-content-muted">Stored in Frappe MariaDB</span>
                    </div>

                    {editableData.internal_notes ? (
                      <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                        {editableData.internal_notes
                          .split('\n')
                          .filter((line: string) => line.trim().length > 0)
                          .map((line: string, idx: number) => {
                            const isSystem = line.includes('System') || line.includes('Reopened');
                            return (
                              <div
                                key={idx}
                                className={`p-3 rounded-lg border text-xs font-sans leading-relaxed ${
                                  isSystem
                                    ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1E40AF]'
                                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#1E293B]'
                                }`}
                              >
                                <div className="flex items-start gap-2">
                                  <CornerDownRight className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-content-muted" />
                                  <span className="whitespace-pre-wrap">{line}</span>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      <div className="p-6 text-center rounded-lg bg-[#F8FAFC] border border-dashed border-[#CBD5E1] text-xs text-content-muted">
                        No internal technician notes recorded yet. Post the first update below.
                      </div>
                    )}

                    {/* New Note Form */}
                    <div className="pt-3 border-t border-[#E2E8F0] space-y-2.5">
                      <label className="block text-xs font-semibold text-[#475569]">
                        Add Technician Remark / Field Finding
                      </label>
                      <textarea
                        rows={3}
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        placeholder="e.g. Inspected water meter on-site. Found pressure valve clogged, scheduled replacement for 2 PM..."
                        className="w-full text-xs p-3 bg-white rounded-lg border border-[#CBD5E1] text-[#1E293B] focus:outline-none focus:border-primary transition-colors"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          disabled={postingNote || !newNote.trim()}
                          onClick={handleAddInternalNote}
                          className="h-8.5 px-4 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>{postingNote ? 'Posting...' : 'Post Internal Note'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Direct Email Communication Card */}
                  <div className="p-4.5 rounded-xl bg-[#F0F9FF] border border-[#BAE6FD] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#0284C7] text-white flex items-center justify-center flex-shrink-0">
                        <Mail className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-[#0369A1]">Complainant Email Communication</div>
                        <div className="text-[11px] text-[#0284C7] mt-0.5">
                          {editableData.email || editableData.contact_email ? (
                            <span>Recipient: <b>{editableData.email || editableData.contact_email}</b></span>
                          ) : (
                            <span className="text-[#E11D48]">No email address registered for this complainant</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleOpenEmailModal}
                      disabled={!(editableData.email || editableData.contact_email)}
                      className="px-3.5 py-1.5 rounded-lg bg-[#0284C7] hover:bg-[#0369A1] text-white font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-50"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Compose Email</span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: CUSTOMER & B2B INFO */}
              {activeTab === 'Customer & B2B Info' && (
                <div className="space-y-6">
                  <div className="p-5 rounded-xl bg-white border border-[#E2E8F0] space-y-4 shadow-xs">
                    <h4 className="font-bold text-sm text-[#1E293B] flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-[#0284C7]" />
                      <span>Complainant Details ({editableData.complaint_category || 'B2C'})</span>
                    </h4>
                    {editableData.complaint_category === 'B2B' ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderFieldInput('Company Name', 'company_name', true)}
                        {renderFieldInput('GST / Tax ID', 'gst_number')}
                        {renderFieldInput('Contact Person', 'contact_person')}
                        {renderFieldInput('Contact Phone', 'contact_phone')}
                        {renderFieldInput('Contact Email', 'contact_email')}
                        {renderFieldInput('Contract / Agreement ID', 'contract_id')}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {renderFieldInput('Customer Name', 'customer_name', true)}
                        {renderFieldInput('Phone Number', 'phone')}
                        {renderFieldInput('Email Address', 'email')}
                        {renderFieldInput('Physical Location / Address', 'address')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Fallback for other generic DocTypes */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {genericDisplayFields.map((field: string) => {
                const val = editableData[field];
                const isReadOnly = ['name', 'creation', 'modified', 'owner'].includes(field);

                return (
                  <div
                    key={field}
                    className="p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex flex-col justify-between"
                  >
                    <span className="font-sans font-semibold text-[11px] text-content-muted uppercase tracking-wide mb-1.5">
                      {field.replace(/_/g, ' ')}
                    </span>
                    {isEditing && !isReadOnly ? (
                      <input
                        type="text"
                        value={val ?? ''}
                        onChange={(e) =>
                          setEditableData({ ...editableData, [field]: e.target.value })
                        }
                        className="w-full text-xs py-1.5 px-2.5 bg-white border border-[#CBD5E1] rounded-md font-medium text-[#1E293B]"
                      />
                    ) : (
                      <span className="font-sans font-medium text-[#1E293B] break-words">
                        {val !== undefined && val !== null && val !== ''
                          ? String(val)
                          : '—'}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between text-xs text-content-muted flex-shrink-0 font-sans">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span>Synced with Frappe MariaDB ({doctype})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary text-xs h-8 px-4"
          >
            Close
          </button>
        </div>
      </div>

      {/* Email Composer Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="nv-card bg-white border border-[#CBD5E1] shadow-2xl rounded-2xl w-full max-w-lg overflow-hidden animate-scaleUp">
            <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#0284C7]/15 text-[#0284C7] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-[#1E293B]">Email Complainant</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="p-1 rounded-md text-[#94A3B8] hover:text-[#1E293B] hover:bg-[#E2E8F0]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3.5 text-xs">
              {emailError && (
                <div className="p-2.5 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{emailError}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#475569] mb-1">
                    From (Support Desk Email)
                  </label>
                  <input
                    type="email"
                    value={supportSenderEmail}
                    onChange={(e) => setSupportSenderEmail(e.target.value)}
                    placeholder="support@nimblevision.io"
                    className="w-full text-xs py-2 px-3 bg-white rounded-lg border border-[#CBD5E1] text-[#1E293B] focus:outline-none focus:border-primary font-mono text-[11px]"
                  />
                  <span className="text-[10px] text-content-muted mt-0.5 block">
                    Replies will route back to this support address
                  </span>
                </div>
                <div>
                  <label className="block font-semibold text-[#475569] mb-1">
                    To (Customer Email)
                  </label>
                  <input
                    type="email"
                    value={emailRecipient}
                    onChange={(e) => setEmailRecipient(e.target.value)}
                    placeholder="customer@example.com"
                    className="w-full text-xs py-2 px-3 bg-white rounded-lg border border-[#CBD5E1] text-[#1E293B] focus:outline-none focus:border-primary"
                  />
                  <span className="text-[10px] text-content-muted mt-0.5 block">
                    Recipient customer inbox
                  </span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#475569] mb-1">Subject</label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  placeholder="Complaint update..."
                  className="w-full text-xs py-2 px-3 bg-white rounded-lg border border-[#CBD5E1] text-[#1E293B] focus:outline-none focus:border-primary"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-semibold text-[#475569]">Message Body</label>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-content-muted">Quick Templates:</span>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailSubject(`[Resolved] Ticket #${docname}: ${editableData.title || ''}`);
                        setEmailMessage(
                          `Dear ${editableData.customer_name || editableData.contact_person || 'Customer'},\n\nWe are pleased to inform you that your issue regarding "${editableData.title || ''}" has been successfully resolved.\n\nResolution Details:\n${editableData.resolution_note || 'All field repairs and meter testing have been completed satisfactorily.'}\n\nResolved Date: ${new Date().toLocaleDateString()}\n\nIf you have any further questions, simply reply to this email or reopen this ticket.\n\nBest regards,\nNimble Vision Field Engineering & Support Team`
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[10px] font-semibold transition-colors"
                    >
                      ✓ Resolved
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailSubject(`[In Progress] Ticket #${docname}: ${editableData.title || ''}`);
                        setEmailMessage(
                          `Dear ${editableData.customer_name || editableData.contact_person || 'Customer'},\n\nOur field engineering team is actively working on your ticket "${editableData.title || ''}".\n\nTarget SLA Deadline: ${editableData.sla_deadline || 'Within 24-48 hours'}\n\nWe will update you as soon as the technician completes work on-site.\n\nBest regards,\nNimble Vision Support Team`
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-semibold transition-colors"
                    >
                      ⚙️ Working
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEmailSubject(`[Info Needed] Ticket #${docname}: ${editableData.title || ''}`);
                        setEmailMessage(
                          `Dear ${editableData.customer_name || editableData.contact_person || 'Customer'},\n\nCould you please provide additional details or photo verification of your water meter / sensor installation to help us speed up resolution?\n\nBest regards,\nNimble Vision Support Team`
                        );
                      }}
                      className="px-2 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-semibold transition-colors"
                    >
                      ❓ Need Info
                    </button>
                  </div>
                </div>
                <textarea
                  rows={6}
                  value={emailMessage}
                  onChange={(e) => setEmailMessage(e.target.value)}
                  placeholder="Enter message for the customer..."
                  className="w-full text-xs p-3 bg-white rounded-lg border border-[#CBD5E1] text-[#1E293B] focus:outline-none focus:border-primary leading-relaxed"
                />
              </div>

              <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[11px] text-content-muted flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] flex-shrink-0"></span>
                <span>Dispatches via Frappe Mail Gateway & logs to ticket history</span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-end gap-2 text-xs">
              <button
                type="button"
                onClick={() => setIsEmailModalOpen(false)}
                className="btn-secondary h-8 px-3"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={sendingEmail || !emailRecipient.trim()}
                onClick={handleSendEmail}
                className="btn-primary h-8 px-4 font-semibold flex items-center gap-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{sendingEmail ? 'Sending...' : 'Send Email Now'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
