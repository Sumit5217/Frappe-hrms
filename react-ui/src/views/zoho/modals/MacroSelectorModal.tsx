import React from 'react';
import { X, AlertTriangle, FileText, CheckCircle2, Check } from 'lucide-react';

export interface MacroSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (macroType: string) => void;
}

export const MacroSelectorModal: React.FC<MacroSelectorModalProps> = ({ isOpen, onClose, onApply }) => {
  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-200 overflow-hidden text-xs cursor-default"
      >
        <div className="p-4 bg-[#1A2232] text-white flex items-center justify-between font-bold">
          <span>Execute 1-Click Macro</span>
          <X className="w-4 h-4 cursor-pointer" onClick={onClose} />
        </div>
        <div className="p-4 space-y-2">
          <button
            onClick={() => {
              onApply('escalate');
              onClose();
            }}
            className="w-full p-3 text-left border rounded hover:border-rose-500 hover:bg-rose-50/40 flex items-start gap-2.5 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gray-900">Escalate to Level 2 Technical Team</h4>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Sets status to Escalated, priority to High, and assigns on-call engineer.
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              onApply('request_log');
              onClose();
            }}
            className="w-full p-3 text-left border rounded hover:border-blue-500 hover:bg-blue-50/40 flex items-start gap-2.5 transition-colors"
          >
            <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gray-900">Request Sensor Calibration Log</h4>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Pre-fills reply with telemetry diagnostic checklist and opens public reply composer.
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              onApply('resolve');
              onClose();
            }}
            className="w-full p-3 text-left border rounded hover:border-emerald-500 hover:bg-emerald-50/40 flex items-start gap-2.5 transition-colors"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gray-900">Apply Standard Calibration & Mark Resolved</h4>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Records standard calibration notes and marks ticket status as Resolved in Frappe.
              </p>
            </div>
          </button>

          <button
            onClick={() => {
              onApply('close');
              onClose();
            }}
            className="w-full p-3 text-left border rounded hover:border-gray-500 hover:bg-gray-50 flex items-start gap-2.5 transition-colors"
          >
            <Check className="w-4 h-4 text-gray-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-gray-900">Close Ticket Immediately</h4>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Transitions ticket status to Closed and commits audit history.
              </p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
