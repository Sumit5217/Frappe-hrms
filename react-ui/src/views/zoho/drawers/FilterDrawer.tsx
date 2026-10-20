import React from 'react';
import { X } from 'lucide-react';

export interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterPriority: string;
  setFilterPriority: (val: string) => void;
  filterCategory: string;
  setFilterCategory: (val: string) => void;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
  isOpen,
  onClose,
  filterStatus,
  setFilterStatus,
  filterPriority,
  setFilterPriority,
  filterCategory,
  setFilterCategory,
  searchQuery,
  setSearchQuery,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity animate-fadeIn cursor-pointer"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 w-80 max-w-full bg-white shadow-2xl z-10 flex flex-col border-l border-[#E2E8F0] p-4 text-xs animate-slideInRight">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200 font-bold text-sm text-gray-900">
          <span>Filter Tickets</span>
          <X className="w-4 h-4 cursor-pointer text-gray-500" onClick={onClose} />
        </div>

        <div className="space-y-4 py-4 flex-1 overflow-y-auto">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full p-2 border rounded border-gray-300"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open</option>
              <option value="In Review">In Review</option>
              <option value="Escalated">Escalated</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full p-2 border rounded border-gray-300"
            >
              <option value="All">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Category</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full p-2 border rounded border-gray-300"
            >
              <option value="All">All Categories</option>
              <option value="B2B">B2B Enterprise</option>
              <option value="B2C">B2C Consumer</option>
              <option value="Internal">Internal</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Search Keywords</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ID, subject, contact..."
              className="w-full p-2 border rounded border-gray-300"
            />
          </div>
        </div>

        <div className="pt-3 border-t border-gray-200 flex gap-2">
          <button
            onClick={() => {
              setFilterStatus('All');
              setFilterPriority('All');
              setFilterCategory('All');
              setSearchQuery('');
            }}
            className="flex-1 py-1.5 border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-50"
          >
            Reset
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-1.5 bg-blue-600 text-white rounded font-bold hover:bg-blue-700"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};
