import React from 'react';
import { Ticket } from '../../types';
import { formatZohoDate } from '../../constants';
import { ZohoStatusDropdown } from '../ZohoStatusDropdown';

export interface ZohoTableViewProps {
  loading: boolean;
  filteredTickets: Ticket[];
  selectedRowIds: string[];
  isAllSelected: boolean;
  toggleSelectAll: () => void;
  toggleSelectRow: (ticketName: string, e: React.MouseEvent) => void;
  setSelectedTicketId: (ticketName: string) => void;
  handleStatusChange: (ticketName: string, newStatus: string) => void;
}

export const ZohoTableView: React.FC<ZohoTableViewProps> = ({
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
    <table className="w-full text-left text-sm border-collapse">
      <thead className="bg-[#FAFBFD] border-b border-[#E2E8F0] text-[#475569] font-bold uppercase tracking-wider text-xs sticky top-0 z-10">
        <tr>
          <th className="py-3 px-3.5 w-12 text-center">
            <input
              type="checkbox"
              checked={isAllSelected}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
            />
          </th>
          <th className="py-3 px-3.5 font-bold text-[#334155] w-28">TICKET ID</th>
          <th className="py-3 px-3.5 font-bold text-[#334155]">SUBJECT</th>
          <th className="py-3 px-3.5 font-bold text-[#334155]">CUSTOMER RESPONDED TIME</th>
          <th className="py-3 px-3.5 font-bold text-[#334155]">DUE DATE</th>
          <th className="py-3 px-3.5 font-bold text-[#334155] text-right pr-5">STATUS</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-[#F1F5F9] text-[#1E293B]">
        {loading ? (
          <tr>
            <td colSpan={6} className="py-16 text-center text-gray-400 text-base">
              Loading tickets...
            </td>
          </tr>
        ) : filteredTickets.length === 0 ? (
          <tr>
            <td colSpan={6} className="py-16 text-center text-gray-400 text-base">
              No tickets found for this view.
            </td>
          </tr>
        ) : (
          filteredTickets.map((t) => {
            const isSelected = selectedRowIds.includes(t.name);
            return (
              <tr
                key={t.name}
                onClick={() => setSelectedTicketId(t.name)}
                className={`cursor-pointer hover:bg-[#F8FAFC] transition-colors group h-12.5 ${
                  isSelected ? 'bg-blue-50/50' : ''
                }`}
              >
                <td
                  className="py-3 px-3.5 text-center"
                  onClick={(e) => toggleSelectRow(t.name, e)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-0 cursor-pointer"
                  />
                </td>

                <td className="py-3 px-3.5 font-bold text-sm text-blue-600 group-hover:text-blue-700 whitespace-nowrap">
                  <span className="border-b border-dashed border-blue-400">
                    {t.displayId}
                  </span>
                </td>

                <td className="py-2.5 px-3.5 max-w-md">
                  <div className="font-sans font-[450] text-[13.5px] text-[#1E293B] tracking-[-0.01em] group-hover:text-[#1070e5] transition-colors line-clamp-1 antialiased">
                    {t.title}
                  </div>
                  <div className="text-[12px] text-[#64748B] flex items-center gap-1.5 mt-0.5 font-normal truncate">
                    <span className="text-gray-700 font-medium">{t.customer_name}</span>
                    {t.company_name && (
                      <>
                        <span>·</span>
                        <span className="text-gray-500">{t.company_name}</span>
                      </>
                    )}
                  </div>
                </td>

                <td className="py-3 px-3.5 text-sm text-[#64748B] whitespace-nowrap">
                  {formatZohoDate(t.modified)}
                </td>

                <td className="py-3 px-3.5 text-sm text-[#64748B] whitespace-nowrap">
                  {t.sla_deadline ? formatZohoDate(t.sla_deadline) : '-'}
                </td>

                <td className="py-3 px-3.5 text-right pr-5 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <ZohoStatusDropdown
                    status={t.status}
                    onChange={(newStatus) => handleStatusChange(t.name, newStatus)}
                    align="right"
                  />
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
};
