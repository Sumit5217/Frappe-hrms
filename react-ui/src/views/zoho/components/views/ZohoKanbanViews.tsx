import React from 'react';
import { Ticket, ViewMode } from '../../types';
import { getRelativeTime, getStatusBadge } from '../../constants';

export interface ZohoKanbanViewsProps {
  viewMode: ViewMode;
  filteredTickets: Ticket[];
  setSelectedTicketId: (ticketName: string) => void;
}

export const ZohoKanbanViews: React.FC<ZohoKanbanViewsProps> = ({
  viewMode,
  filteredTickets,
  setSelectedTicketId,
}) => {
  if (viewMode === 'status') {
    return (
      <div className="flex gap-4 p-4 h-full min-w-max bg-[#F8FAFC]">
        {['Open', 'In Review', 'Escalated', 'Resolved', 'Closed'].map((colStatus) => {
          const colTickets = filteredTickets.filter((t) => t.status === colStatus);
          return (
            <div
              key={colStatus}
              className="w-72 bg-white rounded-lg border border-[#E2E8F0] flex flex-col max-h-full shadow-sm"
            >
              <div className="p-3 border-b border-[#E2E8F0] font-bold text-xs flex items-center justify-between bg-[#F8FAFC]">
                <span className="text-[#334155]">{colStatus}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-200 text-gray-700 font-bold">
                  {colTickets.length}
                </span>
              </div>
              <div className="p-2 flex-1 overflow-y-auto space-y-2">
                {colTickets.map((t) => (
                  <div
                    key={t.name}
                    onClick={() => setSelectedTicketId(t.name)}
                    className="p-3 rounded border border-[#E2E8F0] bg-white hover:border-blue-400 cursor-pointer shadow-xs transition-all"
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <span className="font-bold text-blue-600">{t.displayId}</span>
                      <span className="text-gray-400">{getRelativeTime(t.modified)}</span>
                    </div>
                    <div className="font-sans font-[450] text-xs text-[#1E293B] tracking-[-0.01em] line-clamp-2 mb-1.5 antialiased">
                      {t.title}
                    </div>
                    <div className="text-[11px] text-[#64748B] flex items-center justify-between">
                      <span>{t.customer_name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 font-medium">
                        {t.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (viewMode === 'handshake') {
    return (
      <div className="flex gap-4 p-4 h-full bg-[#F8FAFC]">
        {['B2B', 'B2C', 'Internal'].map((cat) => {
          const catTickets = filteredTickets.filter((t) => t.complaint_category === cat);
          return (
            <div
              key={cat}
              className="flex-1 bg-white rounded-lg border border-[#E2E8F0] flex flex-col max-h-full shadow-sm"
            >
              <div className="p-3 border-b border-[#E2E8F0] font-bold text-xs flex items-center justify-between bg-blue-50/50">
                <span className="text-blue-900 font-bold">
                  {cat === 'B2B' && '🏢 B2B Enterprise Accounts'}
                  {cat === 'B2C' && '👤 B2C Individual Consumers'}
                  {cat === 'Internal' && '⚙ Internal Operations'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-200 text-blue-900 font-bold">
                  {catTickets.length}
                </span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-2">
                {catTickets.map((t) => (
                  <div
                    key={t.name}
                    onClick={() => setSelectedTicketId(t.name)}
                    className="p-3 rounded border border-gray-200 bg-white hover:border-blue-400 cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-blue-600">{t.displayId}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${getStatusBadge(
                          t.status
                        )}`}
                      >
                        {t.status}
                      </span>
                    </div>
                    <div className="font-sans font-[450] text-xs text-[#1E293B] tracking-[-0.01em] antialiased">
                      {t.title}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t.company_name} • {t.customer_name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  if (viewMode === 'countdown') {
    return (
      <div className="flex gap-4 p-4 h-full bg-[#F8FAFC]">
        {[
          { label: '🔴 SLA Breached', filter: (t: Ticket) => t.status === 'Escalated' },
          { label: '🟠 Due in < 2 Hours', filter: (t: Ticket) => t.priority === 'Critical' },
          { label: '🟡 Due in < 24 Hours', filter: (t: Ticket) => t.priority === 'High' },
          {
            label: '🟢 On Track',
            filter: (t: Ticket) =>
              t.priority !== 'Critical' && t.priority !== 'High' && t.status !== 'Escalated',
          },
        ].map((bucket) => {
          const bucketTickets = filteredTickets.filter(bucket.filter);
          return (
            <div
              key={bucket.label}
              className="flex-1 bg-white rounded-lg border border-[#E2E8F0] flex flex-col max-h-full shadow-sm"
            >
              <div className="p-3 border-b border-[#E2E8F0] font-bold text-xs flex items-center justify-between bg-gray-50">
                <span>{bucket.label}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-gray-200 font-bold">
                  {bucketTickets.length}
                </span>
              </div>
              <div className="p-3 flex-1 overflow-y-auto space-y-2">
                {bucketTickets.map((t) => (
                  <div
                    key={t.name}
                    onClick={() => setSelectedTicketId(t.name)}
                    className="p-3 rounded border border-gray-200 bg-white hover:border-blue-400 cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-blue-600">{t.displayId}</span>
                      <span className="text-xs text-rose-600 font-semibold">
                        Target: {t.sla_deadline || '2026-10-07'}
                      </span>
                    </div>
                    <div className="font-sans font-[450] text-xs text-[#1E293B] tracking-[-0.01em] antialiased">
                      {t.title}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t.customer_name}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  return null;
};
