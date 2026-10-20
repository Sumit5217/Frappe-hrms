import React, { useState } from 'react';
import { Mail, X, Send, Paperclip } from 'lucide-react';
import { Ticket } from '../types';

export interface ReplyAllModalProps {
  ticket: Ticket;
  isOpen: boolean;
  onClose: () => void;
  onSend: (payload: { to: string; cc: string; subject: string; body: string; closeAfter: boolean }) => void;
}

export const ReplyAllModal: React.FC<ReplyAllModalProps> = ({ ticket, isOpen, onClose, onSend }) => {
  const [to, setTo] = useState(ticket.email || ticket.contact_email || 'client@example.com');
  const [cc, setCc] = useState('support@nimblevision.io, dispatch@nimblevision.io');
  const [subject, setSubject] = useState(`Re: [${ticket.displayId}] ${ticket.title}`);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);

  if (!isOpen) return null;

  const handleSendAction = (closeAfter: boolean) => {
    if (!body.trim()) return alert('Please write a reply message');
    setSending(true);
    onSend({ to, cc, subject, body, closeAfter });
    setSending(false);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-200 overflow-hidden flex flex-col max-h-[90vh] animate-fadeIn text-sm">
        {/* Modal Header */}
        <div className="p-4 bg-[#1A2232] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Reply All</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Ticket <span className="text-blue-400 font-semibold">{ticket.displayId}</span> — {ticket.title}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Recipient & Subject Header Strip */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 space-y-2.5 text-xs">
          <div className="flex items-center gap-3">
            <span className="w-16 font-bold text-slate-500 uppercase tracking-wide">To:</span>
            <input
              type="text"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Recipient email..."
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 font-bold text-slate-500 uppercase tracking-wide">CC:</span>
            <input
              type="text"
              value={cc}
              onChange={(e) => setCc(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="CC team emails..."
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="w-16 font-bold text-slate-500 uppercase tracking-wide">Subject:</span>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="flex-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 font-semibold focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Message Body & Templates */}
        <div className="p-4 flex-1 overflow-y-auto space-y-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-500">Quick Templates:</span>
            {[
              {
                title: '⚡ Standard Acknowledgment',
                text: `Dear ${ticket.customer_name},\n\nWe have received your request regarding "${ticket.title}". Our telemetry engineering team has prioritized this ticket and is reviewing system logs.\n\nWe will update you shortly.\n\nRegards,\nSumit Singh | Lead Support Engineer`,
              },
              {
                title: '🔧 Field Visit Scheduled',
                text: `Dear ${ticket.customer_name},\n\nA field technical team has been assigned for an on-site calibration check. Our technician will contact you directly before arrival.\n\nRegards,\nNimble Vision Field Operations`,
              },
              {
                title: '✓ Resolution Confirmation',
                text: `Dear ${ticket.customer_name},\n\nThe reported issue has been diagnosed and resolved. Kindly verify the telemetry metrics on your dashboard.\n\nThank you for your cooperation.\n\nBest regards,\nNimble Vision Customer Success`,
              },
            ].map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setBody(tmpl.text)}
                className="px-2.5 py-1 bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-md text-xs font-medium text-slate-700 transition-colors cursor-pointer"
              >
                {tmpl.title}
              </button>
            ))}
          </div>

          <textarea
            rows={7}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Type your reply message to all parties..."
            className="w-full p-3.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 leading-relaxed"
          ></textarea>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Paperclip className="w-4 h-4 text-slate-400" />
            <span>Standard email dispatch via Frappe SMTP gateway</span>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-white text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={sending || !body.trim()}
              onClick={() => handleSendAction(false)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Reply All</span>
            </button>
            <button
              type="button"
              disabled={sending || !body.trim()}
              onClick={() => handleSendAction(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
            >
              Send & Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
