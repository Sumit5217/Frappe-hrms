import React from 'react';
import { RotateCw, ChevronDown } from 'lucide-react';
import { Ticket } from '../types';

export interface TotalCountPopoverProps {
  filteredTickets: Ticket[];
  isTotalCountRevealed: boolean;
  setIsTotalCountRevealed: React.Dispatch<React.SetStateAction<boolean>>;
  isCalculatingCount: boolean;
  isCountDropdownOpen: boolean;
  setIsCountDropdownOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleTouchTotalCount: (e?: React.SyntheticEvent) => void;
  countStats: {
    total: number;
    open: number;
    inReview: number;
    escalated: number;
    resolved: number;
    closed: number;
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
  };
  setFilterStatus: (status: string) => void;
  containerRef?: any;
}

export const TotalCountPopover: React.FC<TotalCountPopoverProps> = ({
  filteredTickets,
  isTotalCountRevealed,
  setIsTotalCountRevealed,
  isCalculatingCount,
  isCountDropdownOpen,
  setIsCountDropdownOpen,
  handleTouchTotalCount,
  countStats,
  setFilterStatus,
  containerRef,
}) => {
  return (
    <div className="relative" ref={containerRef}>
      <div
        role="button"
        tabIndex={0}
        onClick={handleTouchTotalCount}
        onTouchStart={handleTouchTotalCount}
        className="group flex items-center gap-2 px-2.5 py-1 rounded-md hover:bg-gray-100 active:bg-gray-200/80 transition-all cursor-pointer select-none border border-transparent hover:border-gray-200"
        title={
          isTotalCountRevealed
            ? 'Click to see status breakdown'
            : 'Click to calculate total count'
        }
      >
        <span className="text-[#64748B] font-medium text-sm group-hover:text-[#334155]">
          Total Count
        </span>

        {isCalculatingCount ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
            <RotateCw className="w-3 h-3 animate-spin" />
            <span>Calculating...</span>
          </span>
        ) : isTotalCountRevealed ? (
          <span className="inline-flex items-center gap-1">
            <strong className="text-[#0F172A] font-bold text-base transition-transform group-hover:scale-105 animate-fadeIn">
              {filteredTickets.length}
            </strong>
            <ChevronDown
              className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform duration-200 ${
                isCountDropdownOpen ? 'rotate-180 text-blue-600' : 'group-hover:text-gray-600'
              }`}
            />
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded bg-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600 text-gray-500 font-mono text-xs font-semibold transition-colors">
            ---
          </span>
        )}
      </div>

      {/* Numbers Breakdown Popover */}
      {isCountDropdownOpen && isTotalCountRevealed && (
        <div className="absolute right-0 top-10 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 p-3.5 z-40 text-xs animate-fadeIn">
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-[#0F172A]">Ticket Counts</span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700">
                {countStats.total} Total
              </span>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsTotalCountRevealed(false);
                setIsCountDropdownOpen(false);
              }}
              className="text-[11px] text-gray-400 hover:text-gray-600 cursor-pointer"
              title="Reset / Hide Count"
            >
              Reset
            </button>
          </div>

          <div className="py-2.5 space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              By Status
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              <div
                onClick={() => {
                  setFilterStatus('Open');
                  setIsCountDropdownOpen(false);
                }}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#FAF5FF] hover:bg-purple-100/70 border border-purple-100 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-medium text-purple-900">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  Open
                </span>
                <span className="font-bold text-purple-700">{countStats.open}</span>
              </div>

              <div
                onClick={() => {
                  setFilterStatus('In Review');
                  setIsCountDropdownOpen(false);
                }}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#EFF6FF] hover:bg-blue-100/70 border border-blue-100 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-medium text-blue-900">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  In Review
                </span>
                <span className="font-bold text-blue-700">{countStats.inReview}</span>
              </div>

              <div
                onClick={() => {
                  setFilterStatus('Escalated');
                  setIsCountDropdownOpen(false);
                }}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#FFF1F2] hover:bg-rose-100/70 border border-rose-100 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-medium text-rose-900">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Escalated
                </span>
                <span className="font-bold text-rose-700">{countStats.escalated}</span>
              </div>

              <div
                onClick={() => {
                  setFilterStatus('Resolved');
                  setIsCountDropdownOpen(false);
                }}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#F0FDF4] hover:bg-emerald-100/70 border border-emerald-100 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5 font-medium text-emerald-900">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Resolved
                </span>
                <span className="font-bold text-emerald-700">{countStats.resolved}</span>
              </div>

              <div
                onClick={() => {
                  setFilterStatus('Closed');
                  setIsCountDropdownOpen(false);
                }}
                className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors cursor-pointer col-span-2"
              >
                <span className="flex items-center gap-1.5 font-medium text-gray-800">
                  <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                  Closed Tickets
                </span>
                <span className="font-bold text-gray-700">{countStats.closed}</span>
              </div>
            </div>

            <div className="pt-2 text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              By Priority
            </div>
            <div className="flex items-center justify-between gap-1 pt-0.5">
              <span className="px-2 py-1 bg-rose-50 text-rose-700 rounded font-semibold text-[11px] flex-1 text-center">
                🔴 {countStats.highPriority} High
              </span>
              <span className="px-2 py-1 bg-amber-50 text-amber-700 rounded font-semibold text-[11px] flex-1 text-center">
                🟡 {countStats.mediumPriority} Med
              </span>
              <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded font-semibold text-[11px] flex-1 text-center">
                ⚪ {countStats.lowPriority} Low
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TotalCountPopover;
