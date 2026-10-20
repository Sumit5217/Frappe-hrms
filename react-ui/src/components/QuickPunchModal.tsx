import React, { useState, useEffect } from 'react';
import { X, Clock, LogIn, LogOut, CheckCircle2, AlertCircle, UserCheck } from 'lucide-react';
import { frappeApi } from '../api/frappe';
import { Employee, UserSession } from '../types';

interface QuickPunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  user: UserSession;
  employees: Employee[];
}

export const QuickPunchModal: React.FC<QuickPunchModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  user,
  employees,
}) => {
  const [selectedEmp, setSelectedEmp] = useState<string>('');
  const [logType, setLogType] = useState<'IN' | 'OUT'>('IN');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Live clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pre-select employee matching current user
  useEffect(() => {
    if (isOpen && employees.length > 0) {
      setErrorMsg(null);
      setSuccessMsg(null);

      // Check if user email matches an employee
      const matched = employees.find(
        (e) =>
          e.user_id === user.name ||
          e.company_email === user.email ||
          e.personal_email === user.email
      );

      if (matched) {
        setSelectedEmp(matched.name);
      } else if (!selectedEmp) {
        setSelectedEmp(employees[0].name);
      }
    }
  }, [isOpen, user, employees]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handlePunch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) {
      setErrorMsg('Please select an employee.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await frappeApi.punchCheckin(selectedEmp, logType);
      if (res.success) {
        const empName = employees.find((e) => e.name === selectedEmp)?.employee_name || selectedEmp;
        setSuccessMsg(
          `Successfully punched ${logType} for ${empName} at ${new Date().toLocaleTimeString()}! Logged directly to Frappe Checkin.`
        );
        if (onSuccess) onSuccess();
      } else {
        setErrorMsg(res.message || 'Failed to record checkin punch.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error executing checkin punch.');
    } finally {
      setLoading(false);
    }
  };

  const selectedEmpObj = employees.find((e) => e.name === selectedEmp);

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0d121c]/45 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      <div onClick={(e) => e.stopPropagation()} className="nv-card bg-white border border-[rgba(140,150,175,0.14)] shadow-modal rounded-xl w-full max-w-md overflow-hidden animate-scaleUp cursor-default">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[rgba(140,150,175,0.12)] bg-surface-lowest">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#EEF4FC] text-primary flex items-center justify-center font-bold">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-content-main tracking-tight">
                Quick Punch / Check-in
              </h3>
              <p className="font-label text-[11px] text-content-muted uppercase tracking-wider">
                Frappe Attendance Biometric Sync
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

        {/* Live Clock Display */}
        <div className="py-6 px-5 bg-[#0C1220] text-center text-white border-b border-[rgba(140,150,175,0.14)]">
          <span className="text-[11px] font-label uppercase tracking-widest text-[#38BDF8]">
            Current Time
          </span>
          <div className="text-3xl font-mono font-bold tracking-tight text-white mt-1">
            {currentTime}
          </div>
          <span className="text-xs text-white/60 font-sans mt-0.5 block">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>

        <form onSubmit={handlePunch} className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-lg bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Employee Selector */}
          <div>
            <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-1.5">
              Employee
            </label>
            <select
              value={selectedEmp}
              onChange={(e) => setSelectedEmp(e.target.value)}
              className="nv-input w-full text-xs py-2 bg-white"
            >
              {employees.map((emp) => (
                <option key={emp.name} value={emp.name}>
                  {emp.employee_name} ({emp.name}) — {emp.designation || 'Staff'}
                </option>
              ))}
            </select>
            {selectedEmpObj && (
              <p className="text-[11px] text-content-muted mt-1 font-sans">
                Department: <strong className="text-content-main">{selectedEmpObj.department}</strong>
              </p>
            )}
          </div>

          {/* Punch Type Selector: IN vs OUT */}
          <div>
            <label className="block text-xs font-label font-bold text-content-main uppercase tracking-wider mb-2">
              Punch Action
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setLogType('IN')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                  logType === 'IN'
                    ? 'border-[#059669] bg-[#ECFDF5] text-[#059669] font-bold shadow-xs'
                    : 'border-[rgba(140,150,175,0.2)] bg-surface-lowest text-content-muted hover:border-content-muted'
                }`}
              >
                <LogIn className="w-5 h-5" />
                <span className="text-xs">Punch IN</span>
                <span className="text-[10px] opacity-75 font-normal">Shift Arrival</span>
              </button>

              <button
                type="button"
                onClick={() => setLogType('OUT')}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1.5 transition-all ${
                  logType === 'OUT'
                    ? 'border-[#DC2626] bg-[#FEF2F2] text-[#DC2626] font-bold shadow-xs'
                    : 'border-[rgba(140,150,175,0.2)] bg-surface-lowest text-content-muted hover:border-content-muted'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span className="text-xs">Punch OUT</span>
                <span className="text-[10px] opacity-75 font-normal">Shift Departure</span>
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors disabled:opacity-50 ${
                logType === 'IN' ? 'bg-[#059669] hover:bg-[#047857]' : 'bg-[#DC2626] hover:bg-[#B91C1C]'
              }`}
            >
              {loading ? (
                <span>Recording to Frappe...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Confirm Punch {logType}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
