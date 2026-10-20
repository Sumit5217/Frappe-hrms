import React from 'react';
import { X, Radio } from 'lucide-react';

export interface TeamFeedsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeamFeedsDrawer: React.FC<TeamFeedsDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity animate-fadeIn cursor-pointer"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-12 w-84 max-w-full bg-white shadow-2xl z-10 flex flex-col border-r border-[#E2E8F0] animate-slideInLeft text-xs">
        <div className="h-12 bg-[#1E293B] text-white px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <Radio className="w-4 h-4 text-emerald-400" />
            <span>Team Feeds</span>
          </div>
          <X className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white" onClick={onClose} />
        </div>

        <div className="p-3 bg-emerald-50/50 border-b border-emerald-100">
          <p className="text-emerald-800 text-[11px] font-medium">
            Live updates stream, system broadcasts & agent collaboration chatter.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {[
            {
              user: 'Sumit Singh',
              action: 'marked ticket #100 as Resolved',
              time: '15m ago',
              note: 'Applied standard hardware telemetry register calibration.',
              avatar: 'S',
            },
            {
              user: 'Radar SLA Engine',
              action: 'flagged ticket #101',
              time: '42m ago',
              note: 'Customer response pending for over 23 hours in Enterprise Support department.',
              avatar: '⚠️',
            },
            {
              user: 'Triage System',
              action: 'assigned #101 to Sia kureel',
              time: '2h ago',
              note: 'Category classified as B2C Delivery Issue from online webform.',
              avatar: '⚙️',
            },
            {
              user: 'Omnichannel Gateway',
              action: 'synced 2 new emails with Frappe',
              time: '3h ago',
              note: 'Support inbox verified and incoming customer replies mapped.',
              avatar: '✉️',
            },
          ].map((feed, idx) => (
            <div key={idx} className="flex items-start gap-3 p-2.5 rounded-lg border border-gray-100 bg-gray-50/50">
              <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                {feed.avatar}
              </span>
              <div>
                <div className="text-gray-800 text-xs">
                  <strong>{feed.user}</strong> {feed.action}
                </div>
                <p className="text-gray-500 text-[11px] mt-1">{feed.note}</p>
                <span className="text-[10px] text-gray-400 mt-1 block">{feed.time}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-200">
          <input
            type="text"
            placeholder="Post team update or announcement..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                alert(`Broadcast sent: "${e.currentTarget.value}"`);
                e.currentTarget.value = '';
              }
            }}
            className="w-full p-2 border border-gray-300 rounded text-xs outline-none focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
