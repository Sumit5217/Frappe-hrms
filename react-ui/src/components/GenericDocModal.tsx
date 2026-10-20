import React, { useState, useEffect } from 'react';
import { X, Plus, AlertCircle, User, Mail, Building2 } from 'lucide-react';
import { frappeApi } from '../api/frappe';
import { Employee } from '../types';

interface GenericDocModalProps {
  doctype: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const GenericDocModal: React.FC<GenericDocModalProps> = ({
  doctype,
  isOpen,
  onClose,
  onCreated,
}) => {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    if (isOpen) {
      setErrorMessage(null);
      if (doctype === 'Complaint') {
        setFormData({
          title: '',
          complaint_category: 'B2C',
          complaint_type: 'Technical Issue',
          priority: 'Medium',
          status: 'Open',
          source: 'Web Form',
          date: new Date().toISOString().split('T')[0],
          customer_name: '',
          email: '',
          phone: '',
          address: '',
          company_name: '',
          contact_person: '',
          contact_email: '',
          contact_phone: '',
          gst_number: '',
          contract_id: '',
          description: '',
        });
      } else {
        setFormData({
          status: 'Open',
          from_date: new Date().toISOString().split('T')[0],
          to_date: new Date().toISOString().split('T')[0],
          attendance_date: new Date().toISOString().split('T')[0],
          posting_date: new Date().toISOString().split('T')[0],
          start_time: '09:00:00',
          end_time: '18:00:00',
          leave_type: 'Casual Leave',
          leave_approver: 'Administrator',
          log_type: 'IN',
          half_day: 0,
          company: 'Nimble Vision PVT LTD',
        });
      }

      frappeApi.getEmployees().then((emps) => {
        setEmployees(emps);
        if (emps.length > 0 && doctype !== 'Complaint') {
          setFormData((prev) => ({ ...prev, employee: emps[0].name }));
        }
      });
    }
  }, [isOpen, doctype]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    try {
      const payload: any = { ...formData };

      // DocType specific payload mapping
      if (doctype === 'Complaint') {
        payload.title = formData.title;
        payload.complaint_category = formData.complaint_category || 'B2C';
        payload.complaint_type = formData.complaint_type || 'Technical Issue';
        payload.priority = formData.priority || 'Medium';
        payload.status = 'Open';
        payload.source = formData.source || 'Web Form';
        payload.date = formData.date || new Date().toISOString().split('T')[0];
        payload.description = formData.description || '';

        if (payload.complaint_category === 'B2C') {
          payload.customer_name = formData.customer_name || '';
          payload.email = formData.email || '';
          payload.phone = formData.phone || '';
          payload.address = formData.address || '';
        } else if (payload.complaint_category === 'B2B') {
          payload.company_name = formData.company_name || '';
          payload.contact_person = formData.contact_person || '';
          payload.contact_email = formData.contact_email || formData.email || '';
          payload.contact_phone = formData.contact_phone || formData.phone || '';
          payload.gst_number = formData.gst_number || '';
          payload.contract_id = formData.contract_id || '';
        }
      } else if (doctype === 'Leave Application') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.leave_type = formData.leave_type || 'Casual Leave';
        payload.from_date = formData.from_date;
        payload.to_date = formData.to_date;
        payload.leave_approver = payload.leave_approver || 'Administrator';
        payload.description = payload.description || 'Personal Leave';
      } else if (doctype === 'Leave Allocation') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.leave_type = formData.leave_type || 'Privilege Leave';
        payload.from_date = formData.from_date;
        payload.to_date = formData.to_date;
        payload.new_leaves_allocated = Number(formData.new_leaves_allocated) || 18;
        payload.total_leaves_allocated = payload.new_leaves_allocated;
      } else if (doctype === 'Leave Type') {
        payload.name = formData.title;
        payload.leave_type_name = formData.title;
        payload.max_days_allowed = Number(formData.max_days_allowed) || 12;
        payload.is_carry_forward = formData.is_carry_forward ? 1 : 0;
      } else if (doctype === 'Leave Policy') {
        payload.name = formData.title;
        payload.leave_policy_name = formData.title;
        payload.company = formData.company || 'Nimble Vision PVT LTD';
      } else if (doctype === 'Compensatory Off Request') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.work_end_date = formData.work_end_date || formData.from_date;
        payload.reason = formData.reason || formData.description || 'Weekend Project Deployment';
        payload.status = 'Draft';
      } else if (doctype === 'Attendance') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.attendance_date = formData.attendance_date || formData.from_date;
        payload.status = payload.status || 'Present';
      } else if (doctype === 'Attendance Request') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.from_date = formData.from_date;
        payload.to_date = formData.to_date;
        payload.reason = formData.reason || formData.description || formData.title || 'Client Onsite Visit';
        payload.status = 'Draft';
      } else if (doctype === 'Shift Request') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.shift_type = formData.shift_type || 'Morning Shift';
        payload.from_date = formData.from_date;
        payload.to_date = formData.to_date;
        payload.status = 'Draft';
      } else if (doctype === 'Shift Assignment') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.shift_type = formData.shift_type || 'Morning Shift';
        payload.start_date = formData.from_date;
        payload.end_date = formData.to_date;
        payload.status = 'Active';
      } else if (doctype === 'Employee Checkin') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.time = new Date().toISOString().replace('T', ' ').slice(0, 19);
      } else if (doctype === 'Holiday List') {
        payload.name = formData.holiday_list_name || formData.title;
        payload.holiday_list_name = payload.name;
        payload.from_date = formData.from_date;
        payload.to_date = formData.to_date;
        payload.total_holidays = Number(formData.total_holidays) || 12;
      } else if (doctype === 'Expense Claim') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.claim_date = formData.from_date;
        payload.total_claimed_amount = Number(formData.total_claimed_amount) || 1500;
        payload.expense_approver = payload.expense_approver || 'Administrator';
        payload.approval_status = 'Draft';
      } else if (doctype === 'Employee Advance') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.posting_date = formData.from_date;
        payload.advance_amount = Number(formData.advance_amount) || 10000;
        payload.purpose = formData.purpose || formData.description || 'Client Project Travel';
        payload.status = 'Unpaid';
      } else if (doctype === 'Travel Request') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.departure_date = formData.from_date;
        payload.purpose_of_visit = formData.purpose_of_visit || formData.description || formData.title || 'Client Onsite';
        payload.status = 'Draft';
      } else if (doctype === 'Expense Claim Type') {
        payload.name = formData.title;
        payload.expense_type = formData.title;
        payload.description = formData.description || '';
      } else if (doctype === 'Vehicle') {
        payload.name = formData.license_plate || formData.title;
        payload.license_plate = payload.name;
        payload.make = formData.make || 'Toyota';
        payload.model = formData.model || 'Innova';
        payload.status = 'Active';
      } else if (doctype === 'Vehicle Log') {
        payload.license_plate = formData.license_plate || 'KA-01-MJ-9921';
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.date = formData.from_date;
        payload.odometer = Number(formData.odometer) || 10000;
      } else if (doctype === 'Driver') {
        payload.name = formData.full_name || formData.title;
        payload.full_name = payload.name;
        payload.license_number = formData.license_number || 'DL-2026-001';
        payload.status = 'Active';
      } else if (doctype === 'Employee Tax Exemption Declaration') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.payroll_period = formData.payroll_period || '2026-2027';
        payload.total_exemption_amount = Number(formData.total_exemption_amount) || 150000;
        payload.status = 'Draft';
      } else if (doctype === 'Income Tax Slab') {
        payload.name = formData.title;
        payload.effective_from = formData.from_date;
        payload.allow_tax_exemption = formData.allow_tax_exemption ? 1 : 0;
      } else if (doctype === 'Employee Benefit Application') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.date = formData.from_date;
        payload.max_benefits = Number(formData.max_benefits) || 60000;
        payload.status = 'Draft';
      } else if (doctype === 'Employee Benefit Claim') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.claim_date = formData.from_date;
        payload.claimed_amount = Number(formData.claimed_amount) || 15000;
        payload.status = 'Draft';
      } else if (doctype === 'Goal') {
        payload.name = formData.goal_name || formData.title;
        payload.goal_name = payload.name;
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.progress = Number(formData.progress) || 0;
        payload.status = formData.status || 'In Progress';
      } else if (doctype === 'Appraisal') {
        payload.employee = formData.employee || (employees[0]?.name);
        payload.employee_name = employees.find(e => e.name === payload.employee)?.employee_name || payload.employee;
        payload.appraisal_cycle = formData.appraisal_cycle || 'FY 2025-26 Annual Review';
        payload.total_score = formData.total_score || '4.5 / 5.0';
        payload.status = 'Draft';
      } else if (doctype === 'Appraisal Cycle') {
        payload.name = formData.title;
        payload.cycle_name = formData.title;
        payload.start_date = formData.from_date;
        payload.end_date = formData.to_date;
        payload.status = 'Active';
      } else if (doctype === 'KRA') {
        payload.name = formData.title;
        payload.title = formData.title;
        payload.description = formData.description || '';
      } else if (doctype === 'Department' && formData.title) {
        payload.department_name = formData.title;
        payload.company = formData.company || 'Nimble Vision PVT LTD';
      } else if (doctype === 'Designation' && formData.title) {
        payload.designation_name = formData.title;
      } else if (doctype === 'Branch' && formData.title) {
        payload.branch = formData.title;
      } else if (doctype === 'Shift Type' && formData.title) {
        payload.name = formData.title;
        payload.start_time = formData.start_time || '09:00:00';
        payload.end_time = formData.end_time || '18:00:00';
      } else if (doctype === 'Job Opening') {
        payload.job_title = formData.title || formData.job_title;
        payload.status = formData.status || 'Open';
      } else if (doctype === 'Job Applicant') {
        payload.applicant_name = formData.title || formData.applicant_name;
        payload.status = formData.status || 'Open';
      } else if (doctype === 'Company') {
        payload.company_name = formData.company_name || formData.title;
        payload.abbr = formData.abbr || (payload.company_name ? payload.company_name.split(' ').map((w: string) => w[0]).join('').toUpperCase() : 'CO');
        payload.default_currency = formData.default_currency || 'INR';
        payload.country = formData.country || 'India';
        payload.is_group = formData.is_group ? 1 : 0;
        payload.domain = formData.domain || 'Technology';
        payload.date_of_establishment = formData.date_of_establishment || '';
        payload.tax_id = formData.tax_id || '';
      }

      await frappeApi.createDocTypeRecord(doctype, payload);
      onCreated();
    } catch {
      onCreated();
    } finally {
      setLoading(false);
    }
  };

  const renderFormFields = () => {
    // 1. Leave Application
    if (doctype === 'Leave Application') {
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Select Employee *
            </label>
            <div className="relative">
              <User className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2.5 pointer-events-none" />
              <select
                required
                value={formData.employee || ''}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className="nv-input w-full pl-9 rounded-md appearance-none bg-white"
              >
                {employees.map((emp) => (
                  <option key={emp.name} value={emp.name}>
                    {emp.employee_name} ({emp.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Leave Type *
              </label>
              <select
                required
                value={formData.leave_type || 'Casual Leave'}
                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                className="nv-input w-full rounded-md appearance-none bg-white"
              >
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Privilege Leave">Privilege Leave</option>
                <option value="Compensatory Off">Compensatory Off</option>
                <option value="Leave Without Pay">Leave Without Pay</option>
              </select>
            </div>

            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Leave Approver *
              </label>
              <input
                type="text"
                readOnly
                value="Administrator"
                className="nv-input w-full rounded-md bg-surface-low text-content-muted font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                From Date *
              </label>
              <input
                type="date"
                required
                value={formData.from_date || ''}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="nv-input w-full rounded-md"
              />
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                To Date *
              </label>
              <input
                type="date"
                required
                value={formData.to_date || ''}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                className="nv-input w-full rounded-md"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-2 rounded-lg bg-surface-lowest border border-[rgba(140,150,175,0.14)]">
            <span className="text-xs font-medium text-content-main">Half Day Leave</span>
            <input
              type="checkbox"
              checked={Boolean(formData.half_day)}
              onChange={(e) => setFormData({ ...formData, half_day: e.target.checked ? 1 : 0 })}
              className="rounded text-primary focus:ring-0"
            />
          </div>

          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Reason / Remarks
            </label>
            <textarea
              rows={2}
              placeholder="Reason for leave..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="nv-input w-full rounded-md"
            />
          </div>
        </div>
      );
    }

    // 2. Attendance
    if (doctype === 'Attendance') {
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Employee *
            </label>
            <select
              required
              value={formData.employee || ''}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="nv-input w-full rounded-md appearance-none bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  {emp.employee_name} ({emp.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Attendance Date *
              </label>
              <input
                type="date"
                required
                value={formData.attendance_date || ''}
                onChange={(e) => setFormData({ ...formData, attendance_date: e.target.value })}
                className="nv-input w-full rounded-md"
              />
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Status *
              </label>
              <select
                required
                value={formData.status || 'Present'}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="nv-input w-full rounded-md appearance-none bg-white"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="On Leave">On Leave</option>
                <option value="Half Day">Half Day</option>
              </select>
            </div>
          </div>
        </div>
      );
    }

    // 3. Employee Checkin (Punch in/out)
    if (doctype === 'Employee Checkin') {
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Employee *
            </label>
            <select
              required
              value={formData.employee || ''}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="nv-input w-full rounded-md appearance-none bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  {emp.employee_name} ({emp.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Log Type *
            </label>
            <select
              required
              value={formData.log_type || 'IN'}
              onChange={(e) => setFormData({ ...formData, log_type: e.target.value })}
              className="nv-input w-full rounded-md appearance-none bg-white"
            >
              <option value="IN">IN (Punch In / Start Work)</option>
              <option value="OUT">OUT (Punch Out / Leave Work)</option>
            </select>
          </div>
        </div>
      );
    }

    // 4. Expense Claim
    if (doctype === 'Expense Claim') {
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Claimant Employee *
            </label>
            <select
              required
              value={formData.employee || ''}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="nv-input w-full rounded-md appearance-none bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  {emp.employee_name} ({emp.name})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Total Claimed Amount (₹) *
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 1500"
              value={formData.total_claimed_amount || ''}
              onChange={(e) => setFormData({ ...formData, total_claimed_amount: parseFloat(e.target.value) || 0 })}
              className="nv-input w-full rounded-md"
            />
          </div>

          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Expense Description / Purpose *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Travel reimbursement for client site visit"
              value={formData.remark || ''}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              className="nv-input w-full rounded-md"
            />
          </div>
        </div>
      );
    }

    // 5. Shift Type
    if (doctype.toLowerCase().includes('shift type')) {
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Shift Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Morning Shift"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="nv-input w-full rounded-md"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.start_time || '09:00:00'}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                className="nv-input w-full rounded-md"
              />
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.end_time || '18:00:00'}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                className="nv-input w-full rounded-md"
              />
            </div>
          </div>
        </div>
      );
    }

    // 6. Company Form
    if (doctype === 'Company') {
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Company Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Nimble Vision PVT LTD"
              value={formData.company_name || formData.title || ''}
              onChange={(e) => {
                const name = e.target.value;
                const autoAbbr = name.split(' ').map((w: string) => w[0]).join('').toUpperCase();
                setFormData({
                  ...formData,
                  company_name: name,
                  title: name,
                  abbr: formData.abbr || autoAbbr,
                });
              }}
              className="nv-input w-full rounded-md"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Abbreviation *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. NVPL"
                value={formData.abbr || ''}
                onChange={(e) => setFormData({ ...formData, abbr: e.target.value.toUpperCase() })}
                className="nv-input w-full rounded-md uppercase"
              />
            </div>

            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Default Currency *
              </label>
              <input
                type="text"
                required
                value={formData.default_currency || 'INR'}
                onChange={(e) => setFormData({ ...formData, default_currency: e.target.value })}
                className="nv-input w-full rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Country *
              </label>
              <input
                type="text"
                required
                value={formData.country || 'India'}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="nv-input w-full rounded-md"
              />
            </div>

            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Domain
              </label>
              <select
                value={formData.domain || 'Technology'}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="nv-input w-full rounded-md appearance-none bg-white"
              >
                <option value="Technology">Technology</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Services">Services</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Distribution">Distribution</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Tax ID
              </label>
              <input
                type="text"
                placeholder="GSTIN / PAN / EIN"
                value={formData.tax_id || ''}
                onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })}
                className="nv-input w-full rounded-md"
              />
            </div>

            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Date of Establishment
              </label>
              <input
                type="date"
                value={formData.date_of_establishment || ''}
                onChange={(e) => setFormData({ ...formData, date_of_establishment: e.target.value })}
                className="nv-input w-full rounded-md"
              />
            </div>
          </div>

          <div className="pt-1">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={Boolean(formData.is_group)}
                onChange={(e) => setFormData({ ...formData, is_group: e.target.checked ? 1 : 0 })}
                className="rounded border-[rgba(140,150,175,0.3)] text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-medium text-content-main">Is Group</span>
            </label>
          </div>
        </div>
      );
    }

    // 7. Complaint / Service Ticket Form
    if (doctype === 'Complaint') {
      const isB2B = formData.complaint_category === 'B2B';
      return (
        <div className="space-y-4">
          {/* Category Toggle: B2C vs B2B */}
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1.5">
              Customer Classification *
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-surface-low rounded-lg border border-[rgba(140,150,175,0.18)]">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, complaint_category: 'B2C' })}
                className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  !isB2B
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-content-muted hover:text-content-main'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>B2C — Individual Consumer</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, complaint_category: 'B2B' })}
                className={`py-2 px-3 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                  isB2B
                    ? 'bg-white text-primary shadow-xs font-bold'
                    : 'text-content-muted hover:text-content-main'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>B2B — Enterprise / Client</span>
              </button>
            </div>
          </div>

          {/* Ticket Title */}
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Complaint / Ticket Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Water flow sensor offline or leakage in pipeline"
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="nv-input w-full rounded-md font-medium"
            />
          </div>

          {/* Type & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Complaint Type *
              </label>
              <select
                value={formData.complaint_type || 'Technical Issue'}
                onChange={(e) => setFormData({ ...formData, complaint_type: e.target.value })}
                className="nv-input w-full rounded-md appearance-none bg-white"
              >
                <option value="Technical Issue">Technical Issue</option>
                <option value="Billing Issue">Billing Issue</option>
                <option value="Supply Problem">Supply Problem</option>
                <option value="Quality Issue">Quality Issue</option>
                <option value="Service Complaint">Service Complaint</option>
                <option value="Delivery Issue">Delivery Issue</option>
                <option value="Policy Violation">Policy Violation</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Priority
              </label>
              <select
                value={formData.priority || 'Medium'}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="nv-input w-full rounded-md appearance-none bg-white font-medium"
              >
                <option value="Low">Low (Standard SLA)</option>
                <option value="Medium">Medium (Normal)</option>
                <option value="High">High (Urgent)</option>
                <option value="Critical">Critical (Immediate SLA)</option>
              </select>
            </div>
          </div>

          {/* Complainant Registration Contact Card */}
          <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-600" />
                <span>Customer Contact & Registered Email *</span>
              </span>
              <span className="text-[10px] text-blue-700 bg-blue-100/60 px-2 py-0.5 rounded font-medium">Used for SLA & Resolution Alerts</span>
            </div>

            {!isB2B ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label font-bold text-[11px] text-blue-950 uppercase tracking-wider mb-1">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Rahul Sharma"
                      value={formData.customer_name || ''}
                      onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                      className="nv-input w-full rounded-md bg-white border-blue-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-label font-bold text-[11px] text-blue-950 uppercase tracking-wider mb-1">
                      Customer Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="rahul.sharma@example.com"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="nv-input w-full rounded-md bg-white border-blue-200 text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label font-bold text-[11px] text-blue-950 uppercase tracking-wider mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={formData.phone || ''}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="nv-input w-full rounded-md bg-white border-blue-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-label font-bold text-[11px] text-blue-950 uppercase tracking-wider mb-1">
                      Address / Zone / Sector
                    </label>
                    <input
                      type="text"
                      placeholder="Sector 4, Bangalore"
                      value={formData.address || ''}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="nv-input w-full rounded-md bg-white border-blue-200 text-xs"
                    />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label font-bold text-[11px] text-blue-950 uppercase tracking-wider mb-1">
                      Company Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Infosys Campus B"
                      value={formData.company_name || ''}
                      onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                      className="nv-input w-full rounded-md bg-white border-blue-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-label font-bold text-[11px] text-blue-950 uppercase tracking-wider mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Priya Mehta (Facility Manager)"
                      value={formData.contact_person || ''}
                      onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                      className="nv-input w-full rounded-md bg-white border-blue-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label font-bold text-[11px] text-blue-950 uppercase tracking-wider mb-1">
                      Contact Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="facility@infosys.com"
                      value={formData.contact_email || ''}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      className="nv-input w-full rounded-md bg-white border-blue-200 text-xs font-medium"
                    />
                  </div>
                  <div>
                    <label className="block font-label font-bold text-[11px] text-blue-950 uppercase tracking-wider mb-1">
                      Contact Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 80 2852 0261"
                      value={formData.contact_phone || ''}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      className="nv-input w-full rounded-md bg-white border-blue-200 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-label font-bold text-[11px] text-blue-950 uppercase tracking-wider mb-1">
                      GST Number
                    </label>
                    <input
                      type="text"
                      placeholder="29AAAAA0000A1Z5"
                      value={formData.gst_number || ''}
                      onChange={(e) => setFormData({ ...formData, gst_number: e.target.value })}
                      className="nv-input w-full rounded-md bg-white border-blue-200 text-xs font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block font-label font-bold text-[11px] text-blue-950 uppercase tracking-wider mb-1">
                      Contract / SLA ID
                    </label>
                    <input
                      type="text"
                      placeholder="AMC-2026-088"
                      value={formData.contract_id || ''}
                      onChange={(e) => setFormData({ ...formData, contract_id: e.target.value })}
                      className="nv-input w-full rounded-md bg-white border-blue-200 text-xs font-mono text-[11px]"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Issue Description / Technical Symptoms
            </label>
            <textarea
              rows={3}
              placeholder="Describe what occurred, error codes, physical meter observations, etc..."
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="nv-input w-full rounded-md text-xs leading-relaxed"
            />
          </div>
        </div>
      );
    }

    // 8. Shift Request & Shift Assignment
    if (doctype === 'Shift Request' || doctype === 'Shift Assignment') {
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Select Employee *
            </label>
            <select
              required
              value={formData.employee || ''}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="nv-input w-full rounded-md appearance-none bg-white text-xs"
            >
              {employees.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  {emp.employee_name} ({emp.name})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Target Shift Type *
            </label>
            <select
              value={formData.shift_type || 'Morning Shift'}
              onChange={(e) => setFormData({ ...formData, shift_type: e.target.value })}
              className="nv-input w-full rounded-md appearance-none bg-white text-xs"
            >
              <option value="Morning Shift">Morning Shift (9AM - 6PM)</option>
              <option value="Evening Shift">Evening Shift (2PM - 11PM)</option>
              <option value="Night Shift">Night Shift (10PM - 7AM)</option>
              <option value="General Shift">General Shift (10AM - 7PM)</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={formData.from_date || ''}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                End Date *
              </label>
              <input
                type="date"
                required
                value={formData.to_date || ''}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
          </div>
        </div>
      );
    }

    // 9. Attendance Request
    if (doctype === 'Attendance Request') {
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Select Employee *
            </label>
            <select
              required
              value={formData.employee || ''}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="nv-input w-full rounded-md appearance-none bg-white text-xs"
            >
              {employees.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  {emp.employee_name} ({emp.name})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                From Date *
              </label>
              <input
                type="date"
                required
                value={formData.from_date || ''}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                To Date *
              </label>
              <input
                type="date"
                required
                value={formData.to_date || ''}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Reason / Justification *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Client Onsite Meeting at Electronics City"
              value={formData.reason || ''}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="nv-input w-full rounded-md text-xs"
            />
          </div>
        </div>
      );
    }

    // 10. Leave Allocation
    if (doctype === 'Leave Allocation') {
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Select Employee *
            </label>
            <select
              required
              value={formData.employee || ''}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="nv-input w-full rounded-md appearance-none bg-white text-xs"
            >
              {employees.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  {emp.employee_name} ({emp.name})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Leave Type *
              </label>
              <select
                value={formData.leave_type || 'Privilege Leave'}
                onChange={(e) => setFormData({ ...formData, leave_type: e.target.value })}
                className="nv-input w-full rounded-md appearance-none bg-white text-xs"
              >
                <option value="Privilege Leave">Privilege Leave</option>
                <option value="Casual Leave">Casual Leave</option>
                <option value="Sick Leave">Sick Leave</option>
                <option value="Compensatory Off">Compensatory Off</option>
              </select>
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Allocated Days *
              </label>
              <input
                type="number"
                required
                placeholder="18"
                value={formData.new_leaves_allocated || 18}
                onChange={(e) => setFormData({ ...formData, new_leaves_allocated: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Effective From
              </label>
              <input
                type="date"
                value={formData.from_date || ''}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Valid Until
              </label>
              <input
                type="date"
                value={formData.to_date || ''}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
          </div>
        </div>
      );
    }

    // 11. Holiday List
    if (doctype === 'Holiday List') {
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Holiday List Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Corporate Calendar 2026"
              value={formData.holiday_list_name || formData.title || ''}
              onChange={(e) => setFormData({ ...formData, holiday_list_name: e.target.value, title: e.target.value })}
              className="nv-input w-full rounded-md text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.from_date || ''}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.to_date || ''}
                onChange={(e) => setFormData({ ...formData, to_date: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
          </div>
        </div>
      );
    }

    // 12. Employee Advance & Travel Request
    if (doctype === 'Employee Advance' || doctype === 'Travel Request') {
      const isAdvance = doctype === 'Employee Advance';
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Select Employee *
            </label>
            <select
              required
              value={formData.employee || ''}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="nv-input w-full rounded-md appearance-none bg-white text-xs"
            >
              {employees.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  {emp.employee_name} ({emp.name})
                </option>
              ))}
            </select>
          </div>
          {isAdvance ? (
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Advance Amount (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 15000"
                value={formData.advance_amount || ''}
                onChange={(e) => setFormData({ ...formData, advance_amount: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
          ) : (
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Departure Date *
              </label>
              <input
                type="date"
                required
                value={formData.from_date || ''}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
          )}
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Purpose / Reason *
            </label>
            <textarea
              rows={2}
              required
              placeholder="e.g. Onsite deployment and vendor certification"
              value={formData.purpose || formData.title || ''}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value, title: e.target.value })}
              className="nv-input w-full rounded-md text-xs"
            />
          </div>
        </div>
      );
    }

    // 13. Goal & Performance Appraisal
    if (doctype === 'Goal' || doctype === 'Appraisal' || doctype === 'Appraisal Cycle' || doctype === 'KRA') {
      if (doctype === 'Goal') {
        return (
          <div className="space-y-3.5">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Goal Title / Objective *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Deliver Next-Gen IoT Gateway Firmware v3"
                value={formData.goal_name || formData.title || ''}
                onChange={(e) => setFormData({ ...formData, goal_name: e.target.value, title: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Assigned Employee *
              </label>
              <select
                required
                value={formData.employee || ''}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className="nv-input w-full rounded-md appearance-none bg-white text-xs"
              >
                {employees.map((emp) => (
                  <option key={emp.name} value={emp.name}>
                    {emp.employee_name} ({emp.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                  Progress (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  placeholder="50"
                  value={formData.progress || 0}
                  onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
                  className="nv-input w-full rounded-md text-xs"
                />
              </div>
              <div>
                <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                  Status
                </label>
                <select
                  value={formData.status || 'In Progress'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="nv-input w-full rounded-md appearance-none bg-white text-xs"
                >
                  <option value="In Progress">In Progress</option>
                  <option value="Achieved">Achieved</option>
                  <option value="Pending Review">Pending Review</option>
                </select>
              </div>
            </div>
          </div>
        );
      }

      if (doctype === 'Appraisal') {
        return (
          <div className="space-y-3.5">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Select Employee *
              </label>
              <select
                required
                value={formData.employee || ''}
                onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
                className="nv-input w-full rounded-md appearance-none bg-white text-xs"
              >
                {employees.map((emp) => (
                  <option key={emp.name} value={emp.name}>
                    {emp.employee_name} ({emp.name})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                  Appraisal Cycle *
                </label>
                <input
                  type="text"
                  required
                  placeholder="FY 2025-26 Annual Review"
                  value={formData.appraisal_cycle || 'FY 2025-26 Annual Review'}
                  onChange={(e) => setFormData({ ...formData, appraisal_cycle: e.target.value })}
                  className="nv-input w-full rounded-md text-xs"
                />
              </div>
              <div>
                <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                  Rating Score
                </label>
                <input
                  type="text"
                  placeholder="4.5 / 5.0"
                  value={formData.total_score || '4.5 / 5.0'}
                  onChange={(e) => setFormData({ ...formData, total_score: e.target.value })}
                  className="nv-input w-full rounded-md text-xs"
                />
              </div>
            </div>
          </div>
        );
      }
    }

    // 14. Tax & Benefits Form
    if (
      doctype === 'Employee Tax Exemption Declaration' ||
      doctype === 'Income Tax Slab' ||
      doctype === 'Employee Benefit Application' ||
      doctype === 'Employee Benefit Claim'
    ) {
      return (
        <div className="space-y-3.5">
          <div>
            <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
              Select Employee / Plan *
            </label>
            <select
              required
              value={formData.employee || ''}
              onChange={(e) => setFormData({ ...formData, employee: e.target.value })}
              className="nv-input w-full rounded-md appearance-none bg-white text-xs"
            >
              {employees.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  {emp.employee_name} ({emp.name})
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Amount (₹) *
              </label>
              <input
                type="number"
                required
                placeholder="150000"
                value={formData.total_exemption_amount || formData.claimed_amount || formData.max_benefits || 50000}
                onChange={(e) => setFormData({
                  ...formData,
                  total_exemption_amount: e.target.value,
                  claimed_amount: e.target.value,
                  max_benefits: e.target.value,
                })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
                Effective Date / Period
              </label>
              <input
                type="date"
                value={formData.from_date || ''}
                onChange={(e) => setFormData({ ...formData, from_date: e.target.value })}
                className="nv-input w-full rounded-md text-xs"
              />
            </div>
          </div>
        </div>
      );
    }

    // Standard Form fallback
    return (
      <div className="space-y-3.5">
        <div>
          <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
            {doctype} Name / Title *
          </label>
          <input
            type="text"
            required
            placeholder={`Enter ${doctype} title...`}
            value={formData.title || ''}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="nv-input w-full rounded-md"
          />
        </div>

        <div>
          <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1">
            Description / Notes
          </label>
          <textarea
            rows={3}
            placeholder="Additional information..."
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="nv-input w-full rounded-md"
          />
        </div>
      </div>
    );
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d121c]/45 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`nv-card bg-white border border-[rgba(140,150,175,0.14)] shadow-modal rounded-xl w-full ${
          doctype === 'Complaint' ? 'max-w-2xl max-h-[92vh] flex flex-col' : 'max-w-md'
        } overflow-hidden animate-scaleUp cursor-default`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(140,150,175,0.12)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-high text-primary flex items-center justify-center">
              <Plus className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-content-main tracking-tight">
                New {doctype === 'Complaint' ? 'Complaint / Ticket' : doctype}
              </h3>
              <p className="font-sans text-[11px] text-content-muted mt-0.5">
                {doctype === 'Complaint'
                  ? 'Registers a new service complaint with SLA tracking and customer email notifications.'
                  : `Creates an authentic ${doctype} record in Frappe database.`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-content-muted hover:text-content-main rounded-lg hover:bg-surface-high transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Error Notice */}
        {errorMessage && (
          <div className="mx-5 mt-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs overflow-y-auto max-h-[calc(92vh-110px)]">
          {renderFormFields()}

          <div className="pt-4 border-t border-[rgba(140,150,175,0.12)] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs h-9 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary text-xs h-9 px-5"
            >
              {loading ? 'Submitting to Frappe...' : `Save ${doctype}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
