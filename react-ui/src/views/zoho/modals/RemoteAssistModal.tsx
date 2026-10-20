import React from 'react';
import { X } from 'lucide-react';
import { Ticket } from '../types';

export interface RemoteAssistModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
}

export const RemoteAssistModal: React.FC<RemoteAssistModalProps> = ({ ticket, isOpen, onClose }) => {
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
        <div className="p-4 bg-blue-600 text-white flex items-center justify-between font-bold">
          <span>🖥 Remote Support Session ({ticket?.displayId})</span>
          <X className="w-4 h-4 cursor-pointer" onClick={onClose} />
        </div>
        <div className="p-5 space-y-4">
          <p className="text-gray-600">
            Share this secure remote session key with <strong>{ticket?.customer_name}</strong> to start screen sharing and diagnostic assistance:
          </p>

          <div className="p-3 bg-gray-50 rounded border border-gray-200 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-gray-400 font-bold uppercase block">Session Key</span>
              <span className="font-mono font-bold text-base text-blue-700">893-412-990</span>
            </div>
            <button
              onClick={() => alert('Session link copied to clipboard!')}
              className="px-2.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 rounded font-bold hover:bg-blue-100"
            >
              Copy Link
            </button>
          </div>

          <div className="text-[11px] text-gray-500 bg-amber-50 p-2.5 rounded border border-amber-200">
            ⚠️ Encrypted end-to-end TLS 1.3 telemetry diagnostic gateway session. All interactions are audited in compliance with ISO 27001.
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
