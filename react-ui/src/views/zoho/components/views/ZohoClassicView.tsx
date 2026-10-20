import React from 'react';
import { Star } from 'lucide-react';
import { Ticket } from '../../types';
import { formatZohoDate } from '../../constants';
import { ZohoStatusDropdown } from '../ZohoStatusDropdown';

export interface ZohoClassicViewProps {
  loading: boolean;
  filteredTickets: Ticket[];
  selectedRowIds: string[];
  isAllSelected: boolean;
  toggleSelectAll: () => void;
  toggleSelectRow: (ticketName: string, e: React.MouseEvent) => void;
  setSelectedTicketId: (ticketName: string) => void;
  handleStatusChange: (ticketName: string, newStatus: string) => void;
}

export const ZohoClassicView: React.FC<ZohoClassicViewProps> = ({
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
    <div className="p-3 sm:p-4 space-y-2.5 bg-[#F8FAFC] min-h-full">
      {/* View Header Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E2E8F0] text-xs text-[#64748B]">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAll}
            className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
          />
          <span className="font-semibold text-[#334155]">Select All</span>
        </div>
        <span className="text-[11px] text-gray-400">
          {filteredTickets.length} tickets
        </span>
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400 text-sm">Loading tickets...</div>
      ) : filteredTickets.length === 0 ? (
        <div className="py-16 text-center text-gray-400 text-sm">No tickets found for this view.</div>
      ) : (
        filteredTickets.map((t) => {
          const isSelected = selectedRowIds.includes(t.name);
          const initials = (t.customer_name || t.contact_person || 'CU')
            .split(' ')
            .map((n) => n[0])
            .join('')
            .slice(0, 2)
            .toUpperCase();

          return (
            <div
              key={t.name}
              onClick={() => setSelectedTicketId(t.name)}
              className={`bg-white rounded-lg border p-3 transition-all cursor-pointer hover:border-blue-400 hover:shadow-xs group ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/20 ring-1 ring-blue-500'
                  : 'border-[#E2E8F0]'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Left: Checkbox & Star */}
                <div
                  className="flex flex-col items-center gap-2 pt-0.5 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    onClick={(e) => toggleSelectRow(t.name, e)}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                  <Star className="w-3.5 h-3.5 text-gray-300 hover:text-amber-400 transition-colors cursor-pointer" />
                </div>

                {/* Contact Initials Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {initials}
                </div>

                {/* Middle: Content & Metadata in Small Words */}
                <div className="flex-1 min-w-0">
                  {/* Header line: ID + Subject + Badges */}
                  <div className="flex items-center flex-wrap gap-2 mb-0.5">
                    <span className="font-mono font-bold text-xs text-blue-600 group-hover:underline">
                      {t.displayId}
                    </span>
                    <span className="font-sans font-[450] text-[13px] text-[#1E293B] tracking-[-0.01em] group-hover:text-[#1070e5] transition-colors truncate max-w-lg antialiased">
                      {t.title}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                        t.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-700'
                          : t.priority === 'High'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {t.priority}
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-blue-50 text-blue-700">
                      {t.complaint_category}
                    </span>
                  </div>

                  {/* Contact Name & Account Name below Subject in small words */}
                  <div className="text-[11px] text-[#64748B] flex items-center gap-1.5 font-normal truncate">
                    <span className="text-gray-700 font-medium">{t.customer_name}</span>
                    {t.company_name && (
                      <>
                        <span>·</span>
                        <span className="text-gray-500">{t.company_name}</span>
                      </>
                    )}
                    <span>·</span>
                    <span className="text-gray-400">{formatZohoDate(t.modified)}</span>
                    {t.sla_deadline && (
                      <>
                        <span>·</span>
                        <span className="text-gray-400">Due: {formatZohoDate(t.sla_deadline)}</span>
                      </>
                    )}
                  </div>

                  {/* Description Preview snippet */}
                  {t.description && t.description.trim() && (
                    <p className="text-[11px] text-gray-500 line-clamp-1 mt-1 leading-normal font-normal">
                      {t.description}
                    </p>
                  )}
                </div>

                {/* Right: Status Dropdown & Replies count */}
                <div
                  className="shrink-0 flex items-center gap-2 ml-2 pt-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <span className="text-[11px] text-gray-400 font-normal hidden sm:inline">✉ =2</span>
                  <ZohoStatusDropdown
                    status={t.status}
                    onChange={(newStatus) => handleStatusChange(t.name, newStatus)}
                    align="right"
                    size="sm"
                  />
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};
