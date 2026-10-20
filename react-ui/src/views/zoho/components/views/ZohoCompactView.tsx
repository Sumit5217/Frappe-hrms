import React from 'react';
import { Ticket } from '../../types';
import { formatZohoDate } from '../../constants';
import { ZohoStatusDropdown } from '../ZohoStatusDropdown';

export interface ZohoCompactViewProps {
  loading: boolean;
  filteredTickets: Ticket[];
  selectedRowIds: string[];
  isAllSelected: boolean;
  toggleSelectAll: () => void;
  toggleSelectRow: (ticketName: string, e: React.MouseEvent) => void;
  setSelectedTicketId: (ticketName: string) => void;
  handleStatusChange: (ticketName: string, newStatus: string) => void;
}

export const ZohoCompactView: React.FC<ZohoCompactViewProps> = ({
  loading,
  filteredTickets,
  selectedRowIds,
  isAllSelected,
  toggleSelectAll,
  toggleSelectRow,
  setSelectedTicketId,
  handleStatusChange,
}) => {
  return (
    <div className="w-full bg-white divide-y divide-[#F1F5F9] text-sm">
      {/* Header Row */}
      <div className="flex items-center gap-3.5 px-3.5 py-2.5 bg-[#FAFBFD] border-b border-[#E2E8F0] text-xs font-bold text-[#475569] uppercase tracking-wider sticky top-0 z-10">
        <div className="w-6 text-center shrink-0">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
          />
        </div>
        <span className="w-3 shrink-0"></span>
        <span className="w-20 shrink-0 font-bold">ID</span>
        <span className="flex-1 min-w-[220px] font-bold">Subject</span>
        <span className="w-24 shrink-0 font-bold text-center">Priority</span>
        <span className="w-32 shrink-0 font-bold text-right hidden lg:inline-block">Due Date</span>
        <span className="w-28 shrink-0 font-bold text-right pr-2">Status</span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400 text-base">Loading compact view...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-base">No tickets found for this view.</div>
      ) : (
        filteredTickets.map((t) => {
          const isSelected = selectedRowIds.includes(t.name);
          return (
            <div
              key={t.name}
              onClick={() => setSelectedTicketId(t.name)}
              className={`flex items-center gap-3.5 px-3.5 py-2.5 hover:bg-[#F8FAFC] cursor-pointer transition-colors border-b border-[#F1F5F9] group ${
                isSelected ? 'bg-blue-50/60' : ''
              }`}
            >
              {/* Checkbox */}
              <div className="w-6 text-center shrink-0" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => {}}
                  onClick={(e) => toggleSelectRow(t.name, e)}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                />
              </div>

              {/* Status Indicator Dot */}
              <span
                className={`w-3 h-3 rounded-full shrink-0 shadow-xs ${
                  t.status === 'Open'
                    ? 'bg-blue-500 ring-2 ring-blue-200'
                    : t.status === 'In Review'
                    ? 'bg-amber-500 ring-2 ring-amber-200'
                    : t.status === 'Escalated'
                    ? 'bg-rose-500 ring-2 ring-rose-200'
                    : t.status === 'Resolved'
                    ? 'bg-emerald-500 ring-2 ring-emerald-200'
                    : 'bg-green-600 ring-2 ring-green-200'
                }`}
                title={`Status: ${t.status}`}
              />

              {/* Ticket ID */}
              <span className="font-mono font-bold text-sm text-blue-600 w-20 shrink-0 group-hover:underline">
                {t.displayId}
              </span>

              {/* Subject / Title */}
              <div className="flex-1 min-w-[220px] py-0.5">
                <div className="font-sans font-[450] text-[13px] text-[#1E293B] tracking-[-0.01em] truncate leading-tight group-hover:text-[#1070e5] transition-colors antialiased">
                  {t.title}
                </div>
                <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 mt-0.5 font-normal truncate">
                  <span className="text-gray-700 font-medium">{t.customer_name}</span>
                  {t.company_name && (
                    <>
                      <span>·</span>
                      <span className="text-gray-500">{t.company_name}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Priority Badge */}
              <div className="w-24 shrink-0 text-center">
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-bold ${
                    t.priority === 'Critical'
                      ? 'bg-rose-100 text-rose-700'
                      : t.priority === 'High'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {t.priority}
                </span>
              </div>

              {/* Due Date */}
              <span className="text-[#64748B] text-xs w-32 shrink-0 text-right whitespace-nowrap font-medium hidden lg:inline-block">
                {t.sla_deadline ? formatZohoDate(t.sla_deadline) : '-'}
              </span>

              {/* Status Select */}
              <div className="w-28 shrink-0 text-right pr-2" onClick={(e) => e.stopPropagation()}>
                <ZohoStatusDropdown
                  status={t.status}
                  onChange={(newStatus) => handleStatusChange(t.name, newStatus)}
                  align="right"
                  size="sm"
                />
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
