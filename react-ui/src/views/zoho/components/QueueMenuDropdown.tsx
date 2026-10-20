import React, { useState } from 'react';
import {
  ChevronDown,
  LayoutList,
  Clock,
  AlertTriangle,
  Briefcase,
  Headphones,
  CheckCircle2,
} from 'lucide-react';
import { QueueFilter } from '../types';

export interface QueueMenuDropdownProps {
  queueFilter: QueueFilter;
  setQueueFilter: (filter: QueueFilter) => void;
  totalTicketsCount: number;
  containerRef?: any;
}

export const QueueMenuDropdown: React.FC<QueueMenuDropdownProps> = ({
  queueFilter,
  setQueueFilter,
  totalTicketsCount,
  containerRef,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="font-bold text-[#0F172A] text-base flex items-center gap-2 hover:text-blue-600 transition-colors cursor-pointer"
      >
        <span>
          {queueFilter === 'all' && `All Tickets (${String(totalTicketsCount).padStart(2, '0')})`}
          {queueFilter === 'open' && 'Open Tickets'}
          {queueFilter === 'overdue' && 'Overdue Tickets'}
          {queueFilter === 'b2b' && 'B2B Accounts'}
          {queueFilter === 'b2c' && 'B2C Consumers'}
          {queueFilter === 'closed' && 'Closed Tickets'}
        </span>
        <ChevronDown className="w-4 h-4 text-[#64748B]" />
      </button>

      {isOpen && (
        <div className="absolute top-9 left-0 w-64 bg-white rounded-xl shadow-2xl border border-[#E2E8F0] py-2 z-40 text-xs animate-fadeIn">
          <div className="px-3 py-1.5 border-b border-gray-100 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Ticket Queues
          </div>
          <button
            onClick={() => {
              setQueueFilter('all');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 flex items-center justify-between font-medium cursor-pointer transition-colors ${
              queueFilter === 'all' ? 'bg-blue-50/70 text-blue-700 font-bold' : 'text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-blue-50 text-blue-600 flex items-center justify-center">
                <LayoutList className="w-3.5 h-3.5" />
              </div>
              <span>All Tickets</span>
            </div>
            <span className="text-[11px] text-gray-400 font-semibold">{totalTicketsCount}</span>
          </button>
          <button
            onClick={() => {
              setQueueFilter('open');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-blue-50 flex items-center justify-between font-medium cursor-pointer transition-colors ${
              queueFilter === 'open' ? 'bg-amber-50/70 text-amber-800 font-bold' : 'text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span>Open & In Review</span>
            </div>
          </button>
          <button
            onClick={() => {
              setQueueFilter('overdue');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-rose-50 flex items-center justify-between font-medium cursor-pointer transition-colors ${
              queueFilter === 'overdue' ? 'bg-rose-50/70 text-rose-700 font-bold' : 'text-rose-600'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertTriangle className="w-3.5 h-3.5" />
              </div>
              <span>Overdue / SLA Breached</span>
            </div>
          </button>
          <button
            onClick={() => {
              setQueueFilter('b2b');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-indigo-50 flex items-center justify-between font-medium cursor-pointer transition-colors ${
              queueFilter === 'b2b' ? 'bg-indigo-50/70 text-indigo-700 font-bold' : 'text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Briefcase className="w-3.5 h-3.5" />
              </div>
              <span>B2B Enterprise Accounts</span>
            </div>
          </button>
          <button
            onClick={() => {
              setQueueFilter('b2c');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-emerald-50 flex items-center justify-between font-medium cursor-pointer transition-colors ${
              queueFilter === 'b2c' ? 'bg-emerald-50/70 text-emerald-700 font-bold' : 'text-gray-700'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Headphones className="w-3.5 h-3.5" />
              </div>
              <span>B2C Consumers</span>
            </div>
          </button>
          <button
            onClick={() => {
              setQueueFilter('closed');
              setIsOpen(false);
            }}
            className={`w-full text-left px-3.5 py-2 hover:bg-gray-100 flex items-center justify-between font-medium cursor-pointer transition-colors ${
              queueFilter === 'closed' ? 'bg-gray-100 text-gray-900 font-bold' : 'text-gray-600'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded bg-gray-100 text-gray-500 flex items-center justify-center">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>Closed & Resolved</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default QueueMenuDropdown;
