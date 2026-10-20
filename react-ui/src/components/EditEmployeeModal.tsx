import React, { useState, useEffect } from 'react';
import { X, Edit3, Building, Briefcase, Phone, Calendar, Heart, AlertCircle, ShieldCheck } from 'lucide-react';
import { Employee } from '../types';
import { frappeApi } from '../api/frappe';

interface EditEmployeeModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, data: Partial<Employee>) => Promise<{ success: boolean; message?: string }>;
}

export const EditEmployeeModal: React.FC<EditEmployeeModalProps> = ({
  employee,
  isOpen,
  onClose,
  onUpdate,
}) => {
  const [departments, setDepartments] = useState<Array<{ name: string; department_name: string }>>([]);
  const [designations, setDesignations] = useState<Array<{ name: string; designation_name: string }>>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    department: '',
    designation: '',
    gender: 'Female' as 'Female' | 'Male' | 'Other',
    status: 'Active' as Employee['status'],
    date_of_joining: '',
    cell_number: '',
  });

  useEffect(() => {
    if (isOpen && employee) {
      setErrorMessage(null);
      const names = (employee.employee_name || '').split(' ');
      setFormData({
        first_name: names[0] || '',
        last_name: names.slice(1).join(' ') || '',
        department: employee.department === 'Unassigned' ? '' : employee.department || '',
        designation: employee.designation || '',
        gender: employee.gender || 'Female',
        status: employee.status || 'Active',
        date_of_joining: employee.date_of_joining || '',
        cell_number: employee.cell_number || '',
      });

      Promise.all([
        frappeApi.getDepartments(),
        frappeApi.getDesignations(),
      ]).then(([depts, desigs]) => {
        setDepartments(depts);
        setDesignations(desigs);
      });
    }
  }, [isOpen, employee]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !employee) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);
    try {
      const result = await onUpdate(employee.name, {
        employee_name: `${formData.first_name} ${formData.last_name}`.trim(),
        department: formData.department || 'Unassigned',
        designation: formData.designation,
        gender: formData.gender,
        status: formData.status,
        date_of_joining: formData.date_of_joining,
        cell_number: formData.cell_number,
      });

      if (result.success) {
        onClose();
      } else {
        setErrorMessage(result.message || 'Could not update employee in Frappe backend.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d121c]/45 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      <div onClick={(e) => e.stopPropagation()} className="nv-card bg-white border border-[rgba(140,150,175,0.14)] shadow-modal rounded-xl w-full max-w-lg overflow-hidden animate-scaleUp cursor-default">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(140,150,175,0.12)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-high text-primary flex items-center justify-center">
              <Edit3 className="w-4 h-4 stroke-[2]" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="font-serif text-lg font-bold text-content-main tracking-tight">
                  Edit Employee
                </h3>
                <span className="chip-archival text-[10px]">
                  {employee.name}
                </span>
              </div>
              <p className="font-sans text-[11px] text-content-muted mt-0.5">
                Update staff profile in Frappe HR database.
              </p>
            </div>
          </div>
          <button
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1.5">
                First Name *
              </label>
              <input
                type="text"
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                className="nv-input w-full rounded-md"
              />
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1.5">
                Last Name
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                className="nv-input w-full rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1.5">
                Gender
              </label>
              <div className="relative">
                <Heart className="w-3.5 h-3.5 text-content-muted absolute left-3 top-3 pointer-events-none" />
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="nv-input w-full pl-9 appearance-none bg-white rounded-md"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1.5">
                Status
              </label>
              <div className="relative">
                <ShieldCheck className="w-3.5 h-3.5 text-content-muted absolute left-3 top-3 pointer-events-none" />
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="nv-input w-full pl-9 appearance-none bg-white rounded-md"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Suspended">Suspended</option>
                  <option value="Left">Left</option>
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1.5">
                Department
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 text-content-muted absolute left-3 top-3 pointer-events-none" />
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="nv-input w-full pl-9 appearance-none bg-white truncate rounded-md"
                >
                  <option value="">-- Unassigned --</option>
                  {departments.map((dept) => (
                    <option key={dept.name} value={dept.name}>
                      {dept.department_name || dept.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1.5">
                Designation
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 text-content-muted absolute left-3 top-3 pointer-events-none" />
                <select
                  value={formData.designation}
                  onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                  className="nv-input w-full pl-9 appearance-none bg-white truncate rounded-md"
                >
                  <option value="">-- Select Designation --</option>
                  {designations.map((desig) => (
                    <option key={desig.name} value={desig.name}>
                      {desig.designation_name || desig.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-content-muted absolute left-3 top-3 pointer-events-none" />
                <input
                  type="tel"
                  value={formData.cell_number}
                  onChange={(e) => setFormData({ ...formData, cell_number: e.target.value })}
                  placeholder="e.g. 7760406283"
                  className="nv-input w-full pl-9 rounded-md"
                />
              </div>
            </div>
            <div>
              <label className="block font-label font-bold text-[11px] text-content-muted uppercase tracking-wider mb-1.5">
                Date of Joining
              </label>
              <div className="relative">
                <Calendar className="w-3.5 h-3.5 text-content-muted absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={formData.date_of_joining}
                  onChange={(e) => setFormData({ ...formData, date_of_joining: e.target.value })}
                  className="nv-input w-full pl-9 rounded-md"
                />
              </div>
            </div>
          </div>

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
              {loading ? 'Updating in Frappe...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
