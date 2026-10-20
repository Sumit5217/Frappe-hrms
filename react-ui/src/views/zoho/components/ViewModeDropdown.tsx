import React, { useState } from 'react';
import {
  ChevronDown,
  LayoutList,
  Clock,
  Table,
  ListFilter,
  Columns,
  Flame,
  Check,
  Sparkles,
} from 'lucide-react';
import { ViewMode } from '../types';

export interface ViewModeDropdownProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  containerRef?: any;
}

export const ViewModeDropdown: React.FC<ViewModeDropdownProps> = ({
  viewMode,
  setViewMode,
  containerRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] bg-white hover:bg-slate-50 text-[#1E293B] font-semibold flex items-center gap-2 shadow-2xs text-xs transition-colors cursor-pointer"
        title="Switch View Mode"
      >
        {viewMode === 'classic' && (
          <div className="w-5 h-5 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
            <LayoutList className="w-3.5 h-3.5" />
          </div>
        )}
        {viewMode === 'compact' && (
          <div className="w-5 h-5 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ListFilter className="w-3.5 h-3.5" />
          </div>
        )}
        {viewMode === 'table' && (
          <div className="w-5 h-5 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Table className="w-3.5 h-3.5" />
          </div>
        )}
        {viewMode === 'status' && (
          <div className="w-5 h-5 rounded bg-purple-50 text-purple-600 flex items-center justify-center">
            <Columns className="w-3.5 h-3.5" />
          </div>
        )}
        {viewMode === 'handshake' && (
          <div className="w-5 h-5 rounded bg-sky-50 text-sky-600 flex items-center justify-center">
            <Columns className="w-3.5 h-3.5" />
          </div>
        )}
        {viewMode === 'countdown' && (
          <div className="w-5 h-5 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-3.5 h-3.5" />
          </div>
        )}
        {viewMode === 'priority' && (
          <div className="w-5 h-5 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5" />
          </div>
        )}
        <span className="font-semibold text-[#1E293B]">
          {viewMode === 'table' && 'Table View'}
          {viewMode === 'classic' && 'Classic View'}
          {viewMode === 'compact' && 'Compact View'}
          {viewMode === 'status' && 'Status Mode'}
          {viewMode === 'handshake' && 'Handshake Mode'}
          {viewMode === 'countdown' && 'Countdown Mode'}
          {viewMode === 'priority' && 'Priority Mode'}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#94A3B8] transition-transform ${
            isOpen ? 'rotate-180 text-blue-600' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-9 w-60 bg-white rounded-xl shadow-2xl border border-[#E2E8F0] py-2 z-40 text-xs animate-fadeIn select-none">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Layout Views
          </div>

          <button
            onClick={() => {
              setViewMode('classic');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-blue-50/80 flex items-center justify-between transition-colors cursor-pointer group ${
              viewMode === 'classic' ? 'bg-blue-50/60 font-semibold' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <LayoutList className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 leading-tight">Classic View</div>
                <div className="text-[10px] text-gray-400 font-normal">Card list with snippet</div>
              </div>
            </div>
            {viewMode === 'classic' && <Check className="w-4 h-4 text-blue-600" />}
          </button>

          <button
            onClick={() => {
              setViewMode('compact');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-indigo-50/80 flex items-center justify-between transition-colors cursor-pointer group ${
              viewMode === 'compact' ? 'bg-indigo-50/60 font-semibold' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <ListFilter className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 leading-tight">Compact View</div>
                <div className="text-[10px] text-gray-400 font-normal">Condensed row list</div>
              </div>
            </div>
            {viewMode === 'compact' && <Check className="w-4 h-4 text-indigo-600" />}
          </button>

          <button
            onClick={() => {
              setViewMode('table');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-emerald-50/80 flex items-center justify-between transition-colors cursor-pointer group ${
              viewMode === 'table' ? 'bg-emerald-50/60 font-semibold' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <Table className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 leading-tight">Table View</div>
                <div className="text-[10px] text-gray-400 font-normal">Spreadsheet grid</div>
              </div>
            </div>
            {viewMode === 'table' && <Check className="w-4 h-4 text-emerald-600" />}
          </button>

          <div className="border-t border-[#F1F5F9] my-1.5 pt-1.5 px-3 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>Work Modes</span>
          </div>

          <button
            onClick={() => {
              setViewMode('status');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-purple-50/80 flex items-center justify-between transition-colors cursor-pointer group ${
              viewMode === 'status' ? 'bg-purple-50/60 font-semibold' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <Columns className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 leading-tight">Status Mode</div>
                <div className="text-[10px] text-gray-400 font-normal">Workflow lanes</div>
              </div>
            </div>
            {viewMode === 'status' && <Check className="w-4 h-4 text-purple-600" />}
          </button>

          <button
            onClick={() => {
              setViewMode('handshake');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-sky-50/80 flex items-center justify-between transition-colors cursor-pointer group ${
              viewMode === 'handshake' ? 'bg-sky-50/60 font-semibold' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <Columns className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 leading-tight">Handshake Mode</div>
                <div className="text-[10px] text-gray-400 font-normal">Customer vs agent</div>
              </div>
            </div>
            {viewMode === 'handshake' && <Check className="w-4 h-4 text-sky-600" />}
          </button>

          <button
            onClick={() => {
              setViewMode('countdown');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-amber-50/80 flex items-center justify-between transition-colors cursor-pointer group ${
              viewMode === 'countdown' ? 'bg-amber-50/60 font-semibold' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 leading-tight">Countdown Mode</div>
                <div className="text-[10px] text-gray-400 font-normal">SLA urgency lanes</div>
              </div>
            </div>
            {viewMode === 'countdown' && <Check className="w-4 h-4 text-amber-600" />}
          </button>

          <button
            onClick={() => {
              setViewMode('priority');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-rose-50/80 flex items-center justify-between transition-colors cursor-pointer group ${
              viewMode === 'priority' ? 'bg-rose-50/60 font-semibold' : ''
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform shadow-2xs">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="font-semibold text-gray-900 leading-tight">Priority Mode</div>
                <div className="text-[10px] text-gray-400 font-normal">Severity matrix</div>
              </div>
            </div>
            {viewMode === 'priority' && <Check className="w-4 h-4 text-rose-600" />}
          </button>
        </div>
      )}
    </div>
  );
};

export default ViewModeDropdown;
