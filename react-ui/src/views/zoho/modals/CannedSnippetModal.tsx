import React from 'react';
import { X } from 'lucide-react';
import { Ticket } from '../types';

export interface CannedSnippetModalProps {
  ticket: Ticket | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (snippetText: string) => void;
}

export const CannedSnippetModal: React.FC<CannedSnippetModalProps> = ({
  ticket,
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  const customerName = ticket?.customer_name || 'Customer';

  const snippets = [
    {
      title: 'Issue Resolved Confirmation',
      text: `Dear ${customerName},\n\nWe have tested and verified that your issue has been resolved. Please verify on your side and let us know if any further assistance is required.`,
    },
    {
      title: 'Under Investigation / Telemetry Check',
      text: `Dear ${customerName},\n\nOur engineering team is actively analyzing the device telemetry feed. We will provide our next update within 2 hours.`,
    },
    {
      title: 'Request Device Serial & Location',
      text: `Dear ${customerName},\n\nTo expedite resolution, could you kindly reply with the device serial number and physical installation site address?`,
    },
    {
      title: 'Technician Dispatched',
      text: `Dear ${customerName},\n\nA field service technician has been assigned and scheduled to visit your site today.`,
    },
  ];

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
        <div className="p-3.5 bg-[#1A2232] text-white flex items-center justify-between font-bold">
          <span>⚡ Insert Canned Response</span>
          <X className="w-4 h-4 cursor-pointer" onClick={onClose} />
        </div>
        <div className="p-3 space-y-2 max-h-[60vh] overflow-y-auto">
          {snippets.map((canned, idx) => (
            <button
              key={idx}
              onClick={() => {
                onSelect(canned.text);
                onClose();
              }}
              className="w-full p-2.5 text-left border rounded hover:border-blue-400 hover:bg-blue-50/30 transition-colors"
            >
              <h5 className="font-bold text-gray-900">{canned.title}</h5>
              <p className="text-gray-500 text-[11px] mt-0.5 line-clamp-2">{canned.text}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
