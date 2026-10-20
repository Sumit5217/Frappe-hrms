import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  Briefcase,
  Phone,
  AlertCircle,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Copy,
  Check,
  KeyRound,
  MapPin,
  Clock,
  DollarSign,
  User,
  FileText,
  UserCheck,
  LogOut,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { Employee } from '../types';
import { frappeApi } from '../api/frappe';

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (employee: Partial<Employee>) => Promise<{
    success: boolean;
    message?: string;
    employeeName?: string;
    employeeId?: string;
    credentials?: { email: string; password?: string };
  }>;
}

type TabKey =
  | 'overview'
  | 'address_and_contacts'
  | 'attendance_and_leaves'
  | 'salary'
  | 'personal_details'
  | 'profile'
  | 'joining'
  | 'exit';

interface TabItem {
  key: TabKey;
  label: string;
  icon: React.ElementType;
}

const TABS: TabItem[] = [
  { key: 'overview', label: 'Overview', icon: User },
  { key: 'address_and_contacts', label: 'Address & Contacts', icon: MapPin },
  { key: 'attendance_and_leaves', label: 'Attendance & Leaves', icon: Clock },
  { key: 'salary', label: 'Salary', icon: DollarSign },
  { key: 'personal_details', label: 'Personal Details', icon: FileText },
  { key: 'profile', label: 'Profile', icon: Briefcase },
  { key: 'joining', label: 'Joining', icon: UserCheck },
  { key: 'exit', label: 'Exit', icon: LogOut },
];

export const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [departments, setDepartments] = useState<Array<{ name: string; department_name: string }>>([]);
  const [designations, setDesignations] = useState<Array<{ name: string; designation_name: string }>>([]);
  const [existingEmployees, setExistingEmployees] = useState<Employee[]>([]);
  const [companies, setCompanies] = useState<string[]>(['Nimble vision pvt ltd', 'Alpha vison pvt ltd']);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailManuallyEdited, setEmailManuallyEdited] = useState(false);
  const [passwordManuallyEdited, setPasswordManuallyEdited] = useState(false);
  const [copied, setCopied] = useState(false);

  // Success state showing credentials
  const [createdInfo, setCreatedInfo] = useState<{
    name: string;
    id: string;
    email: string;
    password?: string;
  } | null>(null);

  // Full form state matching all 8 Frappe tabs
  const [formData, setFormData] = useState({
    // Overview tab
    naming_series: 'HR-EMP-',
    first_name: '',
    middle_name: '',
    last_name: '',
    salutation: 'Ms',
    gender: 'Female' as 'Female' | 'Male' | 'Other',
    date_of_birth: '1998-05-15',
    date_of_joining: new Date().toISOString().split('T')[0],
    status: 'Active' as 'Active' | 'Inactive' | 'Suspended' | 'Left',
    company: 'Nimble vision pvt ltd',
    department: '',
    designation: '',
    reports_to: '',
    branch: '',
    grade: '',
    employment_type: 'Full-time',

    // User details / Credentials
    create_login: true,
    company_email: '',
    password: 'Welcome@123',

    // Address & Contacts tab
    cell_number: '',
    personal_email: '',
    current_address: '',
    current_accommodation_type: 'Rented',
    permanent_address: '',
    permanent_accommodation_type: 'Owned',
    person_to_be_contacted: '',
    emergency_phone_number: '',
    relation: '',

    // Attendance & Leaves tab
    attendance_device_id: '',
    holiday_list: '',
    default_shift: '',
    leave_approver: 'Administrator',

    // Salary tab
    ctc: '',
    salary_currency: 'INR',
    salary_mode: 'Bank',
    bank_name: '',
    bank_ac_no: '',
    iban: '',
    payroll_cost_center: '',

    // Personal Details tab
    marital_status: 'Single',
    blood_group: 'O+',
    family_background: '',
    health_details: '',
    passport_number: '',
    valid_upto: '',
    date_of_issue: '',
    place_of_issue: '',

    // Profile tab
    bio: '',

    // Joining tab
    scheduled_confirmation_date: '',
    final_confirmation_date: '',
    contract_end_date: '',
    notice_number_of_days: '30',
    date_of_retirement: '',

    // Exit tab
    resignation_letter_date: '',
    relieving_date: '',
    held_on: '',
    new_workplace: '',
    leave_encashed: 'No',
    encashment_date: '',
    reason_for_leaving: '',
    feedback: '',
  });

  useEffect(() => {
    if (isOpen) {
      setActiveTab('overview');
      setErrorMessage(null);
      setCreatedInfo(null);
      setEmailManuallyEdited(false);
      setCopied(false);

      Promise.all([
        frappeApi.getDepartments(),
        frappeApi.getDesignations(),
        frappeApi.getEmployees(),
        frappeApi.getDocTypeList('Company', 20).catch(() => ({ data: [] })),
      ]).then(([depts, desigs, emps, compRes]) => {
        setDepartments(depts);
        setDesignations(desigs);
        setExistingEmployees(emps);
        if (compRes.data && compRes.data.length > 0) {
          const compNames = compRes.data.map((c: any) => c.name || c.company_name).filter(Boolean);
          if (compNames.length > 0) setCompanies(compNames);
        }
        setFormData((prev) => ({
          ...prev,
          department: depts.length > 0 ? depts[0].name : '',
          designation: desigs.length > 0 ? desigs[0].name : '',
        }));
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Auto-generate company email as firstname@nimblevision.io and password as firstname@123
  const handleNameChange = (field: 'first_name' | 'last_name' | 'middle_name', value: string) => {
    const nextFirst = field === 'first_name' ? value : formData.first_name;

    const updated = {
      ...formData,
      [field]: value,
    };

    const cleanFirst = nextFirst.toLowerCase().replace(/[^a-z0-9]/g, '');

    if (!emailManuallyEdited) {
      if (cleanFirst) {
        updated.company_email = `${cleanFirst}@nimblevision.io`;
      } else {
        updated.company_email = '';
      }
    }

    if (!passwordManuallyEdited) {
      if (cleanFirst) {
        updated.password = `${cleanFirst}@123`;
      } else {
        updated.password = 'arun@123';
      }
    }

    setFormData(updated);
  };

  const handleCopyCredentials = () => {
    if (createdInfo) {
      const cleanFirst = createdInfo.name.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'arun';
      const text = `Nimble Vision Portal Login\nURL: http://localhost:5173\nEmployee ID: ${createdInfo.id}\nUsername / Work Email: ${createdInfo.email}\nPassword: ${createdInfo.password || `${cleanFirst}@123`}`;
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const generatePassword = () => {
    const cleanFirst = formData.first_name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'arun';
    setFormData((prev) => ({ ...prev, password: `${cleanFirst}@123` }));
    setPasswordManuallyEdited(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!formData.first_name.trim()) {
      setActiveTab('overview');
      setErrorMessage('First Name is mandatory.');
      return;
    }

    setLoading(true);

    try {
      const fullName = [formData.first_name, formData.middle_name, formData.last_name]
        .filter(Boolean)
        .join(' ');

      const payload: Partial<Employee> = {
        ...formData,
        employee_name: fullName,
        first_name: formData.first_name.trim(),
        middle_name: formData.middle_name.trim(),
        last_name: formData.last_name.trim(),
        company: formData.company || 'Nimble vision pvt ltd',
        department: formData.department,
        designation: formData.designation,
        status: formData.status,
        gender: formData.gender,
        date_of_birth: formData.date_of_birth,
        date_of_joining: formData.date_of_joining,
        cell_number: formData.cell_number,
      };

      if (formData.create_login && formData.company_email.trim()) {
        payload.company_email = formData.company_email.trim();
        payload.user_id = formData.company_email.trim();
        payload.password = formData.password.trim();
      }

      const result = await onSubmit(payload);

      if (result.success) {
        setCreatedInfo({
          name: result.employeeName || fullName,
          id: result.employeeId || 'HR-EMP-XXXXX',
          email: formData.company_email || '—',
          password: formData.password,
        });
      } else {
        setErrorMessage(result.message || 'Failed to create employee in Frappe.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error occurred while saving employee record.');
    } finally {
      setLoading(false);
    }
  };

  const currentTabIndex = TABS.findIndex((t) => t.key === activeTab);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d121c]/45 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      <div onClick={(e) => e.stopPropagation()} className="nv-card bg-white border border-[rgba(140,150,175,0.14)] shadow-modal rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-scaleUp cursor-default">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(140,150,175,0.12)] bg-surface-lowest flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EEF4FC] text-primary flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-bold text-content-main tracking-tight">
                  New Employee
                </h3>
                <span className="font-label text-[10px] px-2 py-0.5 rounded-chip bg-surface-low text-content-muted border border-[rgba(140,150,175,0.18)]">
                  HRMS Master Record
                </span>
              </div>
              <p className="font-label text-[11px] text-content-muted uppercase tracking-wider mt-0.5">
                Overview • Address • Attendance • Salary • Personal • Profile • Joining • Exit
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

        {/* Success Credentials View */}
        {createdInfo ? (
          <div className="p-6 md:p-8 overflow-y-auto space-y-6">
            <div className="p-6 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-[#059669] text-white flex items-center justify-center mb-3 shadow-sm">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-serif text-xl font-bold text-[#065F46] tracking-tight">
                Employee Enrolled Successfully!
              </h4>
              <p className="text-xs text-[#047857] mt-1 max-w-md font-sans">
                Master record created with auto-generated web and mobile login credentials.
              </p>

              <div className="w-full max-w-md mt-6 p-4 rounded-lg bg-white border border-[#A7F3D0] shadow-xs text-left space-y-3 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-[rgba(140,150,175,0.1)]">
                  <span className="font-label text-content-muted uppercase tracking-wider font-semibold">
                    Employee ID:
                  </span>
                  <span className="font-mono font-bold text-content-main bg-surface-low px-2 py-0.5 rounded">
                    {createdInfo.id}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[rgba(140,150,175,0.1)]">
                  <span className="font-label text-content-muted uppercase tracking-wider font-semibold">
                    Full Name:
                  </span>
                  <span className="font-sans font-medium text-content-main">
                    {createdInfo.name}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-[rgba(140,150,175,0.1)]">
                  <span className="font-label text-content-muted uppercase tracking-wider font-semibold">
                    Work Email / Username:
                  </span>
                  <span className="font-mono font-medium text-primary">
                    {createdInfo.email}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-label text-content-muted uppercase tracking-wider font-semibold">
                    Initial Password:
                  </span>
                  <span className="font-mono font-bold text-[#DC2626] bg-[#FEF2F2] px-2 py-0.5 rounded border border-[#FECACA]">
                    {createdInfo.password || 'Welcome@123'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="btn-primary text-xs h-9 px-4 flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Credentials Copied!' : 'Copy Credentials'}</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-xs h-9 px-4"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            {/* Horizontal Tabs Navigation Matching Frappe Screenshot */}
            <div className="flex items-center border-b border-[rgba(140,150,175,0.14)] bg-surface-lowest px-4 overflow-x-auto scrollbar-thin flex-shrink-0">
              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 py-3 px-3.5 border-b-2 text-xs font-label tracking-wide whitespace-nowrap transition-colors ${
                      isActive
                        ? 'border-primary text-primary font-bold bg-white'
                        : 'border-transparent text-content-muted hover:text-content-main hover:bg-surface-low/50 font-medium'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Error notice */}
            {errorMessage && (
              <div className="mx-6 mt-4 p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-start gap-2 flex-shrink-0">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Tab Form Contents */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* TAB 1: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Primary Demographics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Series <span className="text-[#DC2626]">*</span>
                      </label>
                      <select
                        value={formData.naming_series}
                        onChange={(e) => setFormData({ ...formData, naming_series: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      >
                        <option value="HR-EMP-">HR-EMP-</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Gender <span className="text-[#DC2626]">*</span>
                      </label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Date of Joining <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_joining}
                        onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                        required
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>
                  </div>

                  {/* Name fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        First Name <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul"
                        value={formData.first_name}
                        onChange={(e) => handleNameChange('first_name', e.target.value)}
                        required
                        className="nv-input w-full text-xs py-2 bg-white font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        placeholder="Middle name"
                        value={formData.middle_name}
                        onChange={(e) => handleNameChange('middle_name', e.target.value)}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Last Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Kumar"
                        value={formData.last_name}
                        onChange={(e) => handleNameChange('last_name', e.target.value)}
                        className="nv-input w-full text-xs py-2 bg-white font-medium"
                      />
                    </div>
                  </div>

                  {/* Salutation, DOB, Status */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Salutation
                      </label>
                      <select
                        value={formData.salutation}
                        onChange={(e) => setFormData({ ...formData, salutation: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      >
                        <option value="Ms">Ms</option>
                        <option value="Mr">Mr</option>
                        <option value="Mrs">Mrs</option>
                        <option value="Dr">Dr</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Date of Birth <span className="text-[#DC2626]">*</span>
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_birth}
                        onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                        required
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Status <span className="text-[#DC2626]">*</span>
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                        <option value="Suspended">Suspended</option>
                        <option value="Left">Left</option>
                      </select>
                    </div>
                  </div>

                  {/* User Details & Login Credentials Section */}
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#F8FAFC] to-[#EEF4FC]/40 border border-[#CBD5E1] space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-primary" />
                        <span className="font-serif font-bold text-sm text-content-main tracking-tight">
                          User Details & Login Credentials
                        </span>
                      </div>
                      <label className="flex items-center gap-2 cursor-pointer text-xs font-label font-medium text-content-main">
                        <input
                          type="checkbox"
                          checked={formData.create_login}
                          onChange={(e) => setFormData({ ...formData, create_login: e.target.checked })}
                          className="rounded text-primary focus:ring-primary h-4 w-4"
                        />
                        <span>Create User Automatically</span>
                      </label>
                    </div>

                    {formData.create_login && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                        <div>
                          <label className="block text-[11px] font-label font-bold text-content-muted uppercase tracking-wider mb-1">
                            Work Email / Username <span className="text-[#DC2626]">*</span>
                          </label>
                          <div className="relative">
                            <Mail className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2.5" />
                            <input
                              type="email"
                              value={formData.company_email}
                              onChange={(e) => {
                                setEmailManuallyEdited(true);
                                setFormData({ ...formData, company_email: e.target.value });
                              }}
                              placeholder="e.g. arun@nimblevision.io"
                              required={formData.create_login}
                              className="nv-input w-full pl-9 text-xs py-2 bg-white font-mono"
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-[11px] font-label font-bold text-content-muted uppercase tracking-wider">
                              Initial Password <span className="text-[#DC2626]">*</span>
                            </label>
                            <button
                              type="button"
                              onClick={generatePassword}
                              className="text-[10px] text-primary hover:underline font-semibold"
                            >
                              Reset to firstname@123
                            </button>
                          </div>
                          <div className="relative">
                            <Lock className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2.5" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              value={formData.password}
                              onChange={(e) => {
                                setPasswordManuallyEdited(true);
                                setFormData({ ...formData, password: e.target.value });
                              }}
                              required={formData.create_login}
                              className="nv-input w-full pl-9 pr-9 text-xs py-2 bg-white font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-2.5 text-content-muted hover:text-content-main"
                            >
                              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Company Details Section */}
                  <div className="space-y-4 pt-2">
                    <h4 className="font-serif font-bold text-sm text-content-main border-b border-[rgba(140,150,175,0.12)] pb-1.5">
                      Company Details
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Company <span className="text-[#DC2626]">*</span>
                        </label>
                        <select
                          value={formData.company}
                          onChange={(e) => {
                            const newComp = e.target.value;
                            setFormData((prev) => {
                              const cleanFirst = prev.first_name.toLowerCase().replace(/[^a-z0-9]/g, '');
                              const domain = newComp.toLowerCase().includes('alpha') ? 'alphavision.io' : 'nimblevision.io';
                              return {
                                ...prev,
                                company: newComp,
                                company_email: !emailManuallyEdited && cleanFirst ? `${cleanFirst}@${domain}` : prev.company_email,
                              };
                            });
                          }}
                          className="nv-input w-full text-xs py-2 bg-white font-medium"
                        >
                          {companies.map((comp) => (
                            <option key={comp} value={comp}>
                              {comp}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Department
                        </label>
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="nv-input w-full text-xs py-2 bg-white"
                        >
                          <option value="">Select Department...</option>
                          {departments.map((d) => (
                            <option key={d.name} value={d.name}>
                              {d.department_name || d.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Designation
                        </label>
                        <select
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          className="nv-input w-full text-xs py-2 bg-white"
                        >
                          <option value="">Select Designation...</option>
                          {designations.map((d) => (
                            <option key={d.name} value={d.name}>
                              {d.designation_name || d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Reports to
                        </label>
                        <select
                          value={formData.reports_to}
                          onChange={(e) => setFormData({ ...formData, reports_to: e.target.value })}
                          className="nv-input w-full text-xs py-2 bg-white"
                        >
                          <option value="">None (Top Level)</option>
                          {existingEmployees.map((emp) => (
                            <option key={emp.name} value={emp.name}>
                              {emp.employee_name} ({emp.name})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Branch
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Bangalore HQ"
                          value={formData.branch}
                          onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                          className="nv-input w-full text-xs py-2 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Grade
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. L3 / Senior"
                          value={formData.grade}
                          onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                          className="nv-input w-full text-xs py-2 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Employment Type
                        </label>
                        <select
                          value={formData.employment_type}
                          onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                          className="nv-input w-full text-xs py-2 bg-white"
                        >
                          <option value="Full-time">Full-time</option>
                          <option value="Part-time">Part-time</option>
                          <option value="Contract">Contract</option>
                          <option value="Intern">Intern</option>
                          <option value="Probation">Probation</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: ADDRESS & CONTACTS */}
              {activeTab === 'address_and_contacts' && (
                <div className="space-y-6 animate-fadeIn">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-content-main border-b border-[rgba(140,150,175,0.12)] pb-1.5 mb-4">
                      Contact Information
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Cell Number
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2.5" />
                          <input
                            type="tel"
                            placeholder="e.g. +91 9876543210"
                            value={formData.cell_number}
                            onChange={(e) => setFormData({ ...formData, cell_number: e.target.value })}
                            className="nv-input w-full pl-9 text-xs py-2 bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Personal Email
                        </label>
                        <div className="relative">
                          <Mail className="w-3.5 h-3.5 text-content-muted absolute left-3 top-2.5" />
                          <input
                            type="email"
                            placeholder="e.g. personal@gmail.com"
                            value={formData.personal_email}
                            onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                            className="nv-input w-full pl-9 text-xs py-2 bg-white font-mono"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Current & Permanent Addresses */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider">
                          Current Address
                        </label>
                        <select
                          value={formData.current_accommodation_type}
                          onChange={(e) => setFormData({ ...formData, current_accommodation_type: e.target.value })}
                          className="nv-input text-[11px] py-1 bg-white"
                        >
                          <option value="Rented">Rented</option>
                          <option value="Owned">Owned</option>
                        </select>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="House / Flat No., Street, City, State, PIN"
                        value={formData.current_address}
                        onChange={(e) => setFormData({ ...formData, current_address: e.target.value })}
                        className="nv-input w-full text-xs p-2.5 bg-white font-sans"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider">
                          Permanent Address
                        </label>
                        <select
                          value={formData.permanent_accommodation_type}
                          onChange={(e) => setFormData({ ...formData, permanent_accommodation_type: e.target.value })}
                          className="nv-input text-[11px] py-1 bg-white"
                        >
                          <option value="Owned">Owned</option>
                          <option value="Rented">Rented</option>
                        </select>
                      </div>
                      <textarea
                        rows={3}
                        placeholder="Permanent native home address"
                        value={formData.permanent_address}
                        onChange={(e) => setFormData({ ...formData, permanent_address: e.target.value })}
                        className="nv-input w-full text-xs p-2.5 bg-white font-sans"
                      />
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div>
                    <h4 className="font-serif font-bold text-sm text-content-main border-b border-[rgba(140,150,175,0.12)] pb-1.5 mb-4">
                      Emergency Contact Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Emergency Contact Name
                        </label>
                        <input
                          type="text"
                          placeholder="Contact person"
                          value={formData.person_to_be_contacted}
                          onChange={(e) => setFormData({ ...formData, person_to_be_contacted: e.target.value })}
                          className="nv-input w-full text-xs py-2 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Emergency Phone
                        </label>
                        <input
                          type="tel"
                          placeholder="Phone number"
                          value={formData.emergency_phone_number}
                          onChange={(e) => setFormData({ ...formData, emergency_phone_number: e.target.value })}
                          className="nv-input w-full text-xs py-2 bg-white"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                          Relation
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Spouse, Parent, Sibling"
                          value={formData.relation}
                          onChange={(e) => setFormData({ ...formData, relation: e.target.value })}
                          className="nv-input w-full text-xs py-2 bg-white"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ATTENDANCE & LEAVES */}
              {activeTab === 'attendance_and_leaves' && (
                <div className="space-y-6 animate-fadeIn">
                  <h4 className="font-serif font-bold text-sm text-content-main border-b border-[rgba(140,150,175,0.12)] pb-1.5 mb-4">
                    Biometric Sync & Shift Configuration
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Attendance Device ID (Biometric / RF Tag ID)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. BIO-1002"
                        value={formData.attendance_device_id}
                        onChange={(e) => setFormData({ ...formData, attendance_device_id: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white font-mono"
                      />
                      <p className="text-[11px] text-content-muted mt-1">
                        Used for syncing biometric hardware punches directly to Frappe Checkin.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Default Shift
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. General Shift (9:00 - 18:00)"
                        value={formData.default_shift}
                        onChange={(e) => setFormData({ ...formData, default_shift: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Holiday List
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Standard 2026 Holiday Calendar"
                        value={formData.holiday_list}
                        onChange={(e) => setFormData({ ...formData, holiday_list: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Leave Approver
                      </label>
                      <input
                        type="text"
                        placeholder="Administrator"
                        value={formData.leave_approver}
                        onChange={(e) => setFormData({ ...formData, leave_approver: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: SALARY */}
              {activeTab === 'salary' && (
                <div className="space-y-6 animate-fadeIn">
                  <h4 className="font-serif font-bold text-sm text-content-main border-b border-[rgba(140,150,175,0.12)] pb-1.5 mb-4">
                    Salary & Compensation
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Cost to Company (CTC)
                      </label>
                      <input
                        type="number"
                        placeholder="e.g. 1200000"
                        value={formData.ctc}
                        onChange={(e) => setFormData({ ...formData, ctc: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Salary Currency
                      </label>
                      <select
                        value={formData.salary_currency}
                        onChange={(e) => setFormData({ ...formData, salary_currency: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      >
                        <option value="INR">INR (₹)</option>
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Salary Mode
                      </label>
                      <select
                        value={formData.salary_mode}
                        onChange={(e) => setFormData({ ...formData, salary_mode: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      >
                        <option value="Bank">Bank</option>
                        <option value="Cash">Cash</option>
                        <option value="Cheque">Cheque</option>
                      </select>
                    </div>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-content-main border-b border-[rgba(140,150,175,0.12)] pb-1.5 mb-4 pt-2">
                    Bank Account Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. HDFC Bank"
                        value={formData.bank_name}
                        onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Bank A/C No.
                      </label>
                      <input
                        type="text"
                        placeholder="Account number"
                        value={formData.bank_ac_no}
                        onChange={(e) => setFormData({ ...formData, bank_ac_no: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        IBAN / IFSC Code
                      </label>
                      <input
                        type="text"
                        placeholder="IFSC or IBAN"
                        value={formData.iban}
                        onChange={(e) => setFormData({ ...formData, iban: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white font-mono uppercase"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: PERSONAL DETAILS */}
              {activeTab === 'personal_details' && (
                <div className="space-y-6 animate-fadeIn">
                  <h4 className="font-serif font-bold text-sm text-content-main border-b border-[rgba(140,150,175,0.12)] pb-1.5 mb-4">
                    Personal & Medical Background
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Marital Status
                      </label>
                      <select
                        value={formData.marital_status}
                        onChange={(e) => setFormData({ ...formData, marital_status: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      >
                        <option value="Single">Single</option>
                        <option value="Married">Married</option>
                        <option value="Divorced">Divorced</option>
                        <option value="Widowed">Widowed</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Blood Group
                      </label>
                      <select
                        value={formData.blood_group}
                        onChange={(e) => setFormData({ ...formData, blood_group: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white font-medium"
                      >
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Family Background
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Spouse / Dependent details"
                        value={formData.family_background}
                        onChange={(e) => setFormData({ ...formData, family_background: e.target.value })}
                        className="nv-input w-full text-xs p-2 bg-white font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Health Details
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Allergies, chronic conditions or medical notes"
                        value={formData.health_details}
                        onChange={(e) => setFormData({ ...formData, health_details: e.target.value })}
                        className="nv-input w-full text-xs p-2 bg-white font-sans"
                      />
                    </div>
                  </div>

                  <h4 className="font-serif font-bold text-sm text-content-main border-b border-[rgba(140,150,175,0.12)] pb-1.5 mb-4 pt-2">
                    Passport Details
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Passport Number
                      </label>
                      <input
                        type="text"
                        placeholder="Passport No."
                        value={formData.passport_number}
                        onChange={(e) => setFormData({ ...formData, passport_number: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white font-mono uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Valid Up To
                      </label>
                      <input
                        type="date"
                        value={formData.valid_upto}
                        onChange={(e) => setFormData({ ...formData, valid_upto: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Date of Issue
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_issue}
                        onChange={(e) => setFormData({ ...formData, date_of_issue: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Place of Issue
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        value={formData.place_of_issue}
                        onChange={(e) => setFormData({ ...formData, place_of_issue: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: PROFILE */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-fadeIn">
                  <h4 className="font-serif font-bold text-sm text-content-main border-b border-[rgba(140,150,175,0.12)] pb-1.5 mb-4">
                    Profile Summary & Bio
                  </h4>

                  <div>
                    <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                      Bio / Professional Summary
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Write a brief professional overview, core competencies, and career background..."
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      className="nv-input w-full text-xs p-3 bg-white font-sans leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {/* TAB 7: JOINING */}
              {activeTab === 'joining' && (
                <div className="space-y-6 animate-fadeIn">
                  <h4 className="font-serif font-bold text-sm text-content-main border-b border-[rgba(140,150,175,0.12)] pb-1.5 mb-4">
                    Employment & Confirmation Dates
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Offer Date
                      </label>
                      <input
                        type="date"
                        value={formData.scheduled_confirmation_date}
                        onChange={(e) => setFormData({ ...formData, scheduled_confirmation_date: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Confirmation Date
                      </label>
                      <input
                        type="date"
                        value={formData.final_confirmation_date}
                        onChange={(e) => setFormData({ ...formData, final_confirmation_date: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Contract End Date
                      </label>
                      <input
                        type="date"
                        value={formData.contract_end_date}
                        onChange={(e) => setFormData({ ...formData, contract_end_date: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Notice Period (days)
                      </label>
                      <input
                        type="number"
                        placeholder="30"
                        value={formData.notice_number_of_days}
                        onChange={(e) => setFormData({ ...formData, notice_number_of_days: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Date of Retirement
                      </label>
                      <input
                        type="date"
                        value={formData.date_of_retirement}
                        onChange={(e) => setFormData({ ...formData, date_of_retirement: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 8: EXIT */}
              {activeTab === 'exit' && (
                <div className="space-y-6 animate-fadeIn">
                  <h4 className="font-serif font-bold text-sm text-content-main border-b border-[rgba(140,150,175,0.12)] pb-1.5 mb-4">
                    Exit & Separation Workflows
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Resignation Letter Date
                      </label>
                      <input
                        type="date"
                        value={formData.resignation_letter_date}
                        onChange={(e) => setFormData({ ...formData, resignation_letter_date: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Relieving Date
                      </label>
                      <input
                        type="date"
                        value={formData.relieving_date}
                        onChange={(e) => setFormData({ ...formData, relieving_date: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Exit Interview Held On
                      </label>
                      <input
                        type="date"
                        value={formData.held_on}
                        onChange={(e) => setFormData({ ...formData, held_on: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        New Workplace
                      </label>
                      <input
                        type="text"
                        placeholder="Company name"
                        value={formData.new_workplace}
                        onChange={(e) => setFormData({ ...formData, new_workplace: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Leave Encashed?
                      </label>
                      <select
                        value={formData.leave_encashed}
                        onChange={(e) => setFormData({ ...formData, leave_encashed: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Encashment Date
                      </label>
                      <input
                        type="date"
                        value={formData.encashment_date}
                        onChange={(e) => setFormData({ ...formData, encashment_date: e.target.value })}
                        className="nv-input w-full text-xs py-2 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Reason for Leaving
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Career growth, relocation, higher education..."
                        value={formData.reason_for_leaving}
                        onChange={(e) => setFormData({ ...formData, reason_for_leaving: e.target.value })}
                        className="nv-input w-full text-xs p-2 bg-white font-sans"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
                        Exit Feedback
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Observations, suggestions, company experience"
                        value={formData.feedback}
                        onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                        className="nv-input w-full text-xs p-2 bg-white font-sans"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer with Step Navigation & Create Button */}
            <div className="p-4 border-t border-[rgba(140,150,175,0.12)] bg-surface-lowest flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                {currentTabIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(TABS[currentTabIndex - 1].key)}
                    className="btn-secondary text-xs h-8.5 px-3 flex items-center gap-1 font-sans"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back: {TABS[currentTabIndex - 1].label}</span>
                  </button>
                )}
                {currentTabIndex < TABS.length - 1 && (
                  <button
                    type="button"
                    onClick={() => setActiveTab(TABS[currentTabIndex + 1].key)}
                    className="btn-secondary text-xs h-8.5 px-3 flex items-center gap-1 font-sans"
                  >
                    <span>Next: {TABS[currentTabIndex + 1].label}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="btn-secondary text-xs h-8.5 px-4 font-sans"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary text-xs h-8.5 px-5 flex items-center gap-2 font-sans font-bold shadow-sm"
                >
                  {loading ? (
                    <span>Saving to Frappe...</span>
                  ) : (
                    <>
                      <UserPlus className="w-3.5 h-3.5" />
                      <span>Create Employee & Account</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
