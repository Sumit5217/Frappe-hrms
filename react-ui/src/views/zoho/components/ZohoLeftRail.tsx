import React from 'react';
import {
  Columns,
  Radio,
  LayoutList,
  UserCheck,
  Users,
  Tag,
  Clock,
  ArrowLeft,
} from 'lucide-react';
import { ViewMode } from '../types';

export interface ZohoLeftRailProps {
  selectedTicketId: string | null;
  setSelectedTicketId: (id: string | null) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  selectedAgentFilter: string | null;
  selectedTeamFilter: string | null;
  selectedTagFilter: string | null;
  setIsTeamFeedsDrawerOpen: (open: boolean) => void;
  setIsAgentQueueDrawerOpen: (open: boolean) => void;
  setIsTeamQueueDrawerOpen: (open: boolean) => void;
  setIsTagsDrawerOpen: (open: boolean) => void;
  onBackToDashboard?: () => void;
}

export const ZohoLeftRail: React.FC<ZohoLeftRailProps> = ({
  selectedTicketId,
  setSelectedTicketId,
  viewMode,
  setViewMode,
  selectedAgentFilter,
  selectedTeamFilter,
  selectedTagFilter,
  setIsTeamFeedsDrawerOpen,
  setIsAgentQueueDrawerOpen,
  setIsTeamQueueDrawerOpen,
  setIsTagsDrawerOpen,
  onBackToDashboard,
}) => {
  if (selectedTicketId) return null;

  return (
    <aside className="w-16 bg-[#1A2232] flex flex-col items-center py-3.5 gap-3.5 text-[#94A3B8] shrink-0 border-r border-[#2C384F] z-20 animate-fadeIn select-none">
      {/* HQ / Kanban */}
      <button
        onClick={() => setViewMode('status')}
        className={`relative group w-12 py-1.5 rounded-xl hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer ${
          viewMode === 'status' ? 'text-white' : 'text-slate-400'
        }`}
        title="HQ / Kanban Status"
      >
        {viewMode === 'status' && (
          <span className="absolute -left-2 top-2 bottom-2 w-1 bg-purple-500 rounded-r shadow-xs"></span>
        )}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            viewMode === 'status'
              ? 'bg-purple-600/30 text-purple-300 ring-1 ring-purple-500/50 shadow-xs'
              : 'bg-[#243046]/70 group-hover:bg-[#2E3C56] text-purple-400 group-hover:scale-105'
          }`}
        >
          <Columns className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium tracking-tight">HQ</span>
      </button>

      {/* Feeds */}
      <button
        onClick={() => setIsTeamFeedsDrawerOpen(true)}
        className="relative group w-12 py-1.5 rounded-xl hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer text-slate-400"
        title="Team Collaboration Feeds"
      >
        <div className="w-8 h-8 rounded-lg bg-[#243046]/70 group-hover:bg-[#2E3C56] text-emerald-400 flex items-center justify-center transition-all group-hover:scale-105 relative">
          <Radio className="w-4 h-4" />
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 absolute top-1 right-1 animate-pulse"></span>
        </div>
        <span className="text-[10px] font-medium tracking-tight">Feeds</span>
      </button>

      {/* Views */}
      <button
        onClick={() => {
          setSelectedTicketId(null);
          setViewMode('table');
        }}
        className={`relative group w-12 py-1.5 rounded-xl hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer ${
          !selectedTicketId && viewMode === 'table' ? 'text-white' : 'text-slate-400'
        }`}
        title="Views / All Tickets"
      >
        {!selectedTicketId && viewMode === 'table' && (
          <span className="absolute -left-2 top-2 bottom-2 w-1 bg-sky-500 rounded-r shadow-xs"></span>
        )}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            !selectedTicketId && viewMode === 'table'
              ? 'bg-sky-600/30 text-sky-300 ring-1 ring-sky-500/50 shadow-xs'
              : 'bg-[#243046]/70 group-hover:bg-[#2E3C56] text-sky-400 group-hover:scale-105'
          }`}
        >
          <LayoutList className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium tracking-tight">Views</span>
      </button>

      {/* Agent */}
      <button
        onClick={() => setIsAgentQueueDrawerOpen(true)}
        className={`relative group w-12 py-1.5 rounded-xl hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer ${
          selectedAgentFilter ? 'text-white' : 'text-slate-400'
        }`}
        title="Agent Queues & Workloads"
      >
        {selectedAgentFilter && (
          <span className="absolute -left-2 top-2 bottom-2 w-1 bg-blue-500 rounded-r shadow-xs"></span>
        )}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            selectedAgentFilter
              ? 'bg-blue-600/30 text-blue-300 ring-1 ring-blue-500/50 shadow-xs'
              : 'bg-[#243046]/70 group-hover:bg-[#2E3C56] text-blue-400 group-hover:scale-105'
          }`}
        >
          <UserCheck className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium tracking-tight">Agent</span>
      </button>

      {/* Team */}
      <button
        onClick={() => setIsTeamQueueDrawerOpen(true)}
        className={`relative group w-12 py-1.5 rounded-xl hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer ${
          selectedTeamFilter ? 'text-white' : 'text-slate-400'
        }`}
        title="Team Queues (Support & Engineering)"
      >
        {selectedTeamFilter && (
          <span className="absolute -left-2 top-2 bottom-2 w-1 bg-indigo-500 rounded-r shadow-xs"></span>
        )}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            selectedTeamFilter
              ? 'bg-indigo-600/30 text-indigo-300 ring-1 ring-indigo-500/50 shadow-xs'
              : 'bg-[#243046]/70 group-hover:bg-[#2E3C56] text-indigo-400 group-hover:scale-105'
          }`}
        >
          <Users className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium tracking-tight">Team</span>
      </button>

      {/* Tags */}
      <button
        onClick={() => setIsTagsDrawerOpen(true)}
        className={`relative group w-12 py-1.5 rounded-xl hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer ${
          selectedTagFilter ? 'text-white' : 'text-slate-400'
        }`}
        title="Ticket Tags & Categorization"
      >
        {selectedTagFilter && (
          <span className="absolute -left-2 top-2 bottom-2 w-1 bg-amber-500 rounded-r shadow-xs"></span>
        )}
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
            selectedTagFilter
              ? 'bg-amber-600/30 text-amber-300 ring-1 ring-amber-500/50 shadow-xs'
              : 'bg-[#243046]/70 group-hover:bg-[#2E3C56] text-amber-400 group-hover:scale-105'
          }`}
        >
          <Tag className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium tracking-tight">Tags</span>
      </button>

      {/* Schedule */}
      <button
        onClick={() => {
          alert('Scheduled Replies: 2 automated email follow-ups queued for tomorrow at 09:00 AM');
        }}
        className="relative group w-12 py-1.5 rounded-xl hover:text-white transition-all flex flex-col items-center gap-1 cursor-pointer text-slate-400"
        title="Scheduled Replies & Automated Drafts"
      >
        <div className="w-8 h-8 rounded-lg bg-[#243046]/70 group-hover:bg-[#2E3C56] text-orange-400 flex items-center justify-center transition-all group-hover:scale-105">
          <Clock className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-medium tracking-tight">Schedule</span>
      </button>

      <div className="mt-auto">
        <button
          onClick={() => onBackToDashboard && onBackToDashboard()}
          className="w-8 h-8 rounded-lg bg-[#243046]/50 hover:bg-[#2E3C56] hover:text-white text-slate-400 flex items-center justify-center transition-colors cursor-pointer"
          title="Return to Main ERP"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
};
