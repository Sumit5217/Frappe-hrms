import React from 'react';
import { ArrowLeft, Star, ChevronDown, Pin } from 'lucide-react';
import { Ticket } from '../types';
import { formatZohoDate } from '../constants';
import { ZohoStatusDropdown } from '../components/ZohoStatusDropdown';

export interface TicketQueueStripProps {
  filteredTickets: Ticket[];
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  handleStatusChange: (ticketName: string, newStatus: string) => void;
  isPropertiesPaneOpen: boolean;
  setIsPropertiesPaneOpen: (open: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: 'conversations' | 'resolution' | 'time' | 'attachment' | 'activity') => void;
}

export const TicketQueueStrip: React.FC<TicketQueueStripProps> = ({
  filteredTickets,
  selectedTicketId,
  setSelectedTicketId,
  handleStatusChange,
  isPropertiesPaneOpen,
  setIsPropertiesPaneOpen,
  activeTab,
  setActiveTab,
}) => {
  const [isTotalCountRevealed, setIsTotalCountRevealed] = React.useState(false);
  const handleTouchTotalCount = () => setIsTotalCountRevealed(true);
  return (
    <>
      {/* PANE 1 (Left - 280px): Sticky Ticket Queue Strip */}
      <div className="w-72 border-r border-[#E2E8F0] flex flex-col bg-white shrink-0 overflow-hidden">
        <div className="h-10 px-3.5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSelectedTicketId(null)}
              className="p-1 rounded hover:bg-gray-200 text-gray-500 cursor-pointer"
              title="Back to All Tickets"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="font-semibold text-xs text-[#0F172A]">All Tickets</span>
            <ChevronDown className="w-3 h-3 text-gray-400" />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTouchTotalCount}
              onTouchStart={handleTouchTotalCount}
              className="text-[11px] text-gray-500 hover:text-blue-600 px-1.5 py-0.5 rounded hover:bg-gray-200/60 font-semibold cursor-pointer transition-colors"
              title="Click to calculate total count"
            >
              {isTotalCountRevealed ? `${filteredTickets.length} tickets` : 'Count: ---'}
            </button>
            <div className="flex items-center gap-1 text-gray-400 hover:text-gray-600 cursor-pointer text-[11px]">
              <Pin className="w-3.5 h-3.5" />
              <span className="text-[10px]">Unpin</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-[#F1F5F9]">
          {filteredTickets.map((t) => {
            const isActive = t.name === selectedTicketId;
            return (
              <div
                key={t.name}
                onClick={() => setSelectedTicketId(t.name)}
                className={`p-3 cursor-pointer transition-colors relative ${
                  isActive
                    ? 'bg-blue-50/70 border-l-3 border-l-blue-600'
                    : 'hover:bg-[#F8FAFC]'
                }`}
              >
                <div className="flex items-start justify-between gap-1.5">
                  <div className="font-sans font-[450] text-[12.5px] text-[#1E293B] tracking-[-0.01em] line-clamp-1 leading-snug antialiased group-hover:text-[#1070e5]">
                    {t.title}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-[#4f6bf5] text-white flex items-center justify-center text-xs font-semibold shrink-0">
                    S
                  </div>
                </div>

                <div className="text-[11px] text-[#64748B] mt-0.5 truncate flex items-center gap-1 font-normal">
                  <span className="font-semibold text-gray-700">{t.displayId}</span>
                  <span>·</span>
                  <span className="text-gray-700 font-medium">{t.customer_name}</span>
                  {t.company_name && (
                    <>
                      <span>·</span>
                      <span className="text-gray-500">{t.company_name}</span>
                    </>
                  )}
                </div>

                <div className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                  <span>🕒</span>
                  <span>{formatZohoDate(t.modified)}</span>
                </div>

                <div className="mt-2 flex items-center justify-between" onClick={(e) => e.stopPropagation()}>
                  <ZohoStatusDropdown
                    status={t.status}
                    onChange={(newStatus) => handleStatusChange(t.name, newStatus)}
                    align="left"
                    size="sm"
                  />
                  <span className="text-[11px] text-gray-400 font-normal">✉ =2</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Narrow Vertical Icon Rail */}
      <div className="w-11 border-r border-[#E2E8F0] bg-[#F4F6FA] py-4 flex flex-col items-center gap-6 text-gray-500 shrink-0 select-none">
        {/* 1. Ticket with gear (Properties toggle) */}
        <button
          type="button"
          onClick={() => setIsPropertiesPaneOpen(!isPropertiesPaneOpen)}
          className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
            isPropertiesPaneOpen
              ? 'text-blue-600 bg-blue-100/70 shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
          }`}
          title={isPropertiesPaneOpen ? 'Hide Ticket Properties' : 'Show Ticket Properties'}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 3h12a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v1" />
            <path d="M4 14v-1a2 2 0 0 0 0-4V5a2 2 0 0 1 2-2" />
            <path d="M4 17a2 2 0 0 0 2 2h3" />
            <circle cx="16.5" cy="16.5" r="2.2" />
            <path d="M16.5 12.8v1.2M16.5 19v1.2M12.8 16.5h1.2M19 16.5h1.2M13.9 13.9l.9.9M18.2 18.2l.9.9M13.9 19.1l.9-.9M18.2 14.8l.9-.9" />
          </svg>
        </button>

        {/* 2. Lightbulb with rays (Solutions / Knowledge Base) */}
        <button
          type="button"
          onClick={() => setActiveTab('resolution')}
          className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'resolution'
              ? 'text-blue-600 bg-blue-100/70 shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
          }`}
          title="Solutions & Knowledge Base"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18h6M10 21h4" />
            <path d="M12 2v2M4.9 4.9l1.4 1.4M19.1 4.9l-1.4 1.4" />
            <path d="M8.5 15a5.5 5.5 0 1 1 7 0c-.8.6-1.5 1.5-1.5 3h-4c0-1.5-.7-2.4-1.5-3z" />
          </svg>
        </button>

        {/* 3. History / Timeline */}
        <button
          type="button"
          onClick={() => setActiveTab('activity')}
          className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'activity'
              ? 'text-blue-600 bg-blue-100/70 shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
          }`}
          title="History & Timeline"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 2.64-6.36L3 8" />
            <path d="M3 3v5h5" />
            <polyline points="12 7 12 12 15 14" />
          </svg>
        </button>

        {/* 4. Circle with Checkmark (Tasks & Resolution) */}
        <button
          type="button"
          onClick={() => setActiveTab('time')}
          className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'time'
              ? 'text-blue-600 bg-blue-100/70 shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
          }`}
          title="Tasks & Resolution"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="9" />
            <polyline points="8.5 12 11 14.5 15.5 9.5" />
          </svg>
        </button>

        {/* 5. Atom (Integrations & Marketplace) */}
        <button
          type="button"
          onClick={() => setActiveTab('attachment')}
          className={`p-2 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
            activeTab === 'attachment'
              ? 'text-blue-600 bg-blue-100/70 shadow-2xs'
              : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
          }`}
          title="Integrations & Marketplace"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(0 12 12)" />
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(60 12 12)" />
            <ellipse cx="12" cy="12" rx="9" ry="3.5" transform="rotate(120 12 12)" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
          </svg>
        </button>
      </div>
    </>
  );
};
