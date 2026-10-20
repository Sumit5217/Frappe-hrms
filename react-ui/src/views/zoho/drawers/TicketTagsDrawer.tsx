import React from 'react';
import { X, Tag } from 'lucide-react';

export interface TicketTagsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tag: string | null) => void;
  setSelectedTicketId: (id: string | null) => void;
}

export const TicketTagsDrawer: React.FC<TicketTagsDrawerProps> = ({
  isOpen,
  onClose,
  selectedTagFilter,
  setSelectedTagFilter,
  setSelectedTicketId,
}) => {
  if (!isOpen) return null;

  const tags = [
    { tag: 'delivery', label: 'DelayedDelivery', count: 1, color: 'bg-rose-50 text-rose-700 border-rose-200', iconColor: 'text-rose-500' },
    { tag: 'sensor', label: 'SensorCalibration', count: 1, color: 'bg-blue-50 text-blue-700 border-blue-200', iconColor: 'text-blue-500' },
    { tag: 'technical', label: 'TechnicalIssue', count: 2, color: 'bg-purple-50 text-purple-700 border-purple-200', iconColor: 'text-purple-500' },
    { tag: 'b2c', label: 'B2CCustomer', count: 2, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', iconColor: 'text-emerald-500' },
    { tag: 'b2b', label: 'EnterpriseClient', count: 1, color: 'bg-indigo-50 text-indigo-700 border-indigo-200', iconColor: 'text-indigo-500' },
    { tag: 'urgent', label: 'UrgentPriority', count: 1, color: 'bg-amber-50 text-amber-700 border-amber-200', iconColor: 'text-amber-500' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity animate-fadeIn cursor-pointer"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-12 w-80 max-w-full bg-white shadow-2xl z-10 flex flex-col border-r border-[#E2E8F0] animate-slideInLeft text-xs">
        <div className="h-12 bg-[#1A2232] text-white px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <div className="w-6 h-6 rounded-md bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Tag className="w-4 h-4" />
            </div>
            <span>Ticket Tags</span>
          </div>
          <X className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white" onClick={onClose} />
        </div>

        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <p className="text-gray-500 text-[11px]">
            Click on any tag to immediately filter matching tickets in the table.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {tags.map((t) => (
            <button
              key={t.tag}
              onClick={() => {
                setSelectedTagFilter(selectedTagFilter === t.tag ? null : t.tag);
                setSelectedTicketId(null);
                onClose();
              }}
              className={`w-full p-2.5 rounded-lg border text-left flex items-center justify-between transition-colors cursor-pointer group ${
                selectedTagFilter === t.tag ? 'border-amber-500 bg-amber-50/50 font-bold shadow-2xs' : 'border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Tag className={`w-3.5 h-3.5 ${t.iconColor} group-hover:scale-110 transition-transform`} />
                <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${t.color}`}>
                  #{t.label}
                </span>
              </div>
              <span className="text-[11px] text-gray-500">
                {selectedTagFilter === t.tag ? '✓ Active' : `${t.count} tickets`}
              </span>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              setSelectedTagFilter(null);
              onClose();
            }}
            className="w-full py-2 bg-white border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-100 text-xs cursor-pointer"
          >
            Clear Tag Filter
          </button>
        </div>
      </div>
    </div>
  );
};
