import React, { useState, useRef, useEffect } from 'react';
import {
  Star,
  ChevronDown,
  Building2,
  UserCheck,
  Users,
  Tag,
  X,
  Filter,
  RotateCw,
  MoreHorizontal,
  Info,
} from 'lucide-react';
import { Ticket, ViewMode, QueueFilter } from '../types';
import { QueueMenuDropdown } from './QueueMenuDropdown';
import { TotalCountPopover } from './TotalCountPopover';
import { ViewModeDropdown } from './ViewModeDropdown';

export interface ZohoSubHeaderProps {
  tickets: Ticket[];
  filteredTickets: Ticket[];
  queueFilter: QueueFilter;
  setQueueFilter: (filter: QueueFilter) => void;
  selectedAgentFilter: string | null;
  setSelectedAgentFilter: (agent: string | null) => void;
  selectedTeamFilter: string | null;
  setSelectedTeamFilter: (team: string | null) => void;
  selectedTagFilter: string | null;
  setSelectedTagFilter: (tag: string | null) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  setIsFilterDrawerOpen: (open: boolean) => void;
  setIsKnowledgeDrawerOpen: (open: boolean) => void;
  setIsNewTicketModalOpen: (open: boolean) => void;
  fetchTickets: () => void;
  refreshing: boolean;
  selectedRowIds: string[];
  setSelectedRowIds: (ids: string[]) => void;
  handleBulkStatusChange: (status: string) => void;
  handleBulkDelete: () => void;
  error: string | null;
  setFilterStatus: (status: string) => void;
}

export const ZohoSubHeader: React.FC<ZohoSubHeaderProps> = ({
  tickets,
  filteredTickets,
  queueFilter,
  setQueueFilter,
  selectedAgentFilter,
  setSelectedAgentFilter,
  selectedTeamFilter,
  setSelectedTeamFilter,
  selectedTagFilter,
  setSelectedTagFilter,
  selectedDepartment,
  setSelectedDepartment,
  viewMode,
  setViewMode,
  setIsFilterDrawerOpen,
  setIsKnowledgeDrawerOpen,
  setIsNewTicketModalOpen,
  fetchTickets,
  refreshing,
  selectedRowIds,
  setSelectedRowIds,
  handleBulkStatusChange,
  handleBulkDelete,
  error,
  setFilterStatus,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isTotalCountRevealed, setIsTotalCountRevealed] = useState(false);
  const [isCalculatingCount, setIsCalculatingCount] = useState(false);
  const [isCountDropdownOpen, setIsCountDropdownOpen] = useState(false);

  const moreMenuRef = useRef<HTMLDivElement>(null);
  const totalCountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setIsMoreMenuOpen(false);
      }
      if (totalCountRef.current && !totalCountRef.current.contains(target)) {
        setIsCountDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTouchTotalCount = () => {
    if (isCalculatingCount) return;
    if (!isTotalCountRevealed) {
      setIsCalculatingCount(true);
      setTimeout(() => {
        setIsCalculatingCount(false);
        setIsTotalCountRevealed(true);
        setIsCountDropdownOpen(true);
      }, 400);
    } else {
      setIsCountDropdownOpen((prev) => !prev);
    }
  };

  const countStats = {
    total: filteredTickets.length,
    open: filteredTickets.filter((t) => t.status === 'Open').length,
    inReview: filteredTickets.filter((t) => t.status === 'In Review').length,
    escalated: filteredTickets.filter((t) => t.status === 'Escalated').length,
    resolved: filteredTickets.filter((t) => t.status === 'Resolved').length,
    closed: filteredTickets.filter((t) => t.status === 'Closed').length,
    highPriority: filteredTickets.filter((t) => t.priority === 'High' || t.priority === 'Critical').length,
    mediumPriority: filteredTickets.filter((t) => t.priority === 'Medium').length,
    lowPriority: filteredTickets.filter((t) => t.priority === 'Low').length,
  };

  return (
    <>
      <div className="h-13 border-b border-[#E2E8F0] px-4 flex items-center justify-between bg-white shrink-0">
        <div className="flex items-center gap-3.5">
          <button className="text-amber-400 hover:text-amber-500 transition-colors">
            <Star className="w-5 h-5 fill-amber-400" />
          </button>

          <QueueMenuDropdown
            queueFilter={queueFilter}
            setQueueFilter={setQueueFilter}
            totalTicketsCount={tickets.length}
          />

          {/* Active Filter Badges */}
          {(selectedAgentFilter || selectedTeamFilter || selectedTagFilter || selectedDepartment !== 'All Departments') && (
            <div className="flex items-center gap-2 ml-2">
              {selectedDepartment !== 'All Departments' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-800 text-xs font-medium border border-slate-300 shadow-2xs transition-colors">
                  <Building2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>{selectedDepartment}</span>
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-slate-900"
                    onClick={() => setSelectedDepartment('All Departments')}
                  />
                </span>
              )}
              {selectedAgentFilter && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 hover:bg-blue-100/80 text-blue-700 text-xs font-medium border border-blue-200 shadow-2xs transition-colors">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Agent: <strong className="font-semibold">{selectedAgentFilter}</strong></span>
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-blue-900"
                    onClick={() => setSelectedAgentFilter(null)}
                  />
                </span>
              )}
              {selectedTeamFilter && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100/80 text-indigo-700 text-xs font-medium border border-indigo-200 shadow-2xs transition-colors">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Team: <strong className="font-semibold">{selectedTeamFilter}</strong></span>
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-indigo-900"
                    onClick={() => setSelectedTeamFilter(null)}
                  />
                </span>
              )}
              {selectedTagFilter && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 hover:bg-amber-100/80 text-amber-800 text-xs font-medium border border-amber-200 shadow-2xs transition-colors">
                  <Tag className="w-3.5 h-3.5 text-amber-600" />
                  <span>#<strong className="font-semibold">{selectedTagFilter}</strong></span>
                  <X
                    className="w-3.5 h-3.5 cursor-pointer hover:text-amber-900"
                    onClick={() => setSelectedTagFilter(null)}
                  />
                </span>
              )}
            </div>
          )}

          <div className="h-5 w-px bg-gray-200 mx-1"></div>

          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#475569] hover:text-blue-600 flex items-center gap-1.5 text-xs font-medium shadow-2xs transition-colors cursor-pointer"
            title="Advanced Filters"
          >
            <Filter className="w-3.5 h-3.5 text-blue-600" />
            <span>Filters</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          <button
            onClick={fetchTickets}
            className={`h-8 w-8 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 flex items-center justify-center text-[#64748B] hover:text-blue-600 shadow-2xs transition-colors cursor-pointer ${
              refreshing ? 'animate-spin text-blue-600' : ''
            }`}
            title="Refresh List"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-3 text-sm">
          <TotalCountPopover
            filteredTickets={filteredTickets}
            isTotalCountRevealed={isTotalCountRevealed}
            setIsTotalCountRevealed={setIsTotalCountRevealed}
            isCalculatingCount={isCalculatingCount}
            isCountDropdownOpen={isCountDropdownOpen}
            setIsCountDropdownOpen={setIsCountDropdownOpen}
            handleTouchTotalCount={handleTouchTotalCount}
            countStats={countStats}
            setFilterStatus={setFilterStatus}
            containerRef={totalCountRef}
          />

          {/* View Mode Switcher Dropdown */}
          <ViewModeDropdown
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-1.5 rounded border border-[#CBD5E1] hover:bg-gray-50 text-[#64748B]"
              title="More Options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {isMoreMenuOpen && (
              <div className="absolute right-0 top-8 w-40 bg-white rounded shadow-xl border border-gray-200 py-1 z-40 text-xs">
                <button
                  onClick={() => {
                    setIsNewTicketModalOpen(true);
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50"
                >
                  + New Ticket
                </button>
                <button
                  onClick={() => {
                    window.print();
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-gray-50"
                >
                  Print List
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setIsKnowledgeDrawerOpen(true)}
            className="p-1.5 rounded border border-[#CBD5E1] hover:bg-gray-50 text-[#64748B]"
            title="Knowledge Base & Views Guide"
          >
            <Info className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {selectedRowIds.length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 flex items-center justify-between text-xs text-blue-900 animate-fadeIn">
          <span className="font-semibold">
            {selectedRowIds.length} ticket(s) selected
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleBulkStatusChange('In Review')}
              className="px-2.5 py-1 bg-white border border-blue-300 rounded font-medium hover:bg-blue-100"
            >
              Mark In Review
            </button>
            <button
              onClick={() => handleBulkStatusChange('Closed')}
              className="px-2.5 py-1 bg-white border border-blue-300 rounded font-medium hover:bg-blue-100"
            >
              Mark Closed
            </button>
            <button
              onClick={handleBulkDelete}
              className="px-2.5 py-1 bg-rose-600 text-white rounded font-medium hover:bg-rose-700"
            >
              Delete
            </button>
            <button
              onClick={() => setSelectedRowIds([])}
              className="px-2 py-1 text-gray-500 hover:text-gray-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-rose-700 text-xs">
          {error}
        </div>
      )}
    </>
  );
};
