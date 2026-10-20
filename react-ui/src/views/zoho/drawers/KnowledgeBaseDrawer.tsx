import React from 'react';
import { ArrowLeft, Maximize2, X, Search, ChevronDown } from 'lucide-react';

export interface KnowledgeBaseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KnowledgeBaseDrawer: React.FC<KnowledgeBaseDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity animate-fadeIn cursor-pointer"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 w-[440px] max-w-full bg-white shadow-2xl z-10 flex flex-col border-l border-[#E2E8F0] animate-slideInRight">
        <div className="h-12 bg-blue-600 text-white px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 font-bold text-sm">
            <ArrowLeft className="w-4 h-4 cursor-pointer hover:opacity-80" onClick={onClose} />
            <span>Knowledge Base</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="cursor-pointer hover:underline">English ▾</span>
            <Maximize2 className="w-3.5 h-3.5 cursor-pointer hover:opacity-80" />
            <X className="w-4 h-4 cursor-pointer hover:opacity-80" onClick={onClose} />
          </div>
        </div>

        <div className="p-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search articles..."
              className="w-full pl-8 pr-3 py-1.5 rounded border border-[#CBD5E1] text-xs outline-none focus:border-blue-500 bg-white"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 text-xs text-[#334155] space-y-4">
          <h2 className="text-base font-bold text-[#0F172A] leading-tight">
            Ticket Views - Custom, List, Detail, Blueprint, and Archived Views
          </h2>

          <div className="p-3 bg-blue-50/70 border border-blue-100 rounded text-blue-900">
            <div className="font-bold flex items-center justify-between cursor-pointer">
              <span>Table of Contents</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </div>
            <ul className="mt-2 space-y-1 pl-4 list-disc text-[11px] text-blue-800">
              <li>Overview of Ticket Views</li>
              <li>Table View vs Classic View</li>
              <li>Work Modes: Status, Handshake & Countdown</li>
              <li>Using Macros and Omnichannel Email Gateway</li>
            </ul>
          </div>

          <p className="leading-relaxed">
            A ticket is a digital record created when a customer submits an issue or query. It
            contains all relevant details about the person, their organization, description, and
            interaction history.
          </p>

          <h4 className="font-bold text-xs text-[#0F172A] pt-2">How Work Modes Help Support Teams</h4>
          <ul className="space-y-1.5 pl-4 list-disc text-[11px] text-gray-600">
            <li>
              <strong>Status Mode:</strong> Kanban column board tracking issue progression from Open to Closed.
            </li>
            <li>
              <strong>Handshake Mode:</strong> Prioritizes enterprise B2B accounts with strict SLA commitments.
            </li>
            <li>
              <strong>Countdown Mode:</strong> Real-time radar highlighting tickets approaching SLA breach deadlines.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
