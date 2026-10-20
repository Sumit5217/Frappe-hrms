import React from 'react';
import { X, UserCheck } from 'lucide-react';
import { AgentStat } from '../types';

export interface AgentQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  agentStats: AgentStat[];
  selectedAgentFilter: string | null;
  setSelectedAgentFilter: (filter: string | null) => void;
  setSelectedTicketId: (id: string | null) => void;
}

export const AgentQueueDrawer: React.FC<AgentQueueDrawerProps> = ({
  isOpen,
  onClose,
  agentStats,
  selectedAgentFilter,
  setSelectedAgentFilter,
  setSelectedTicketId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity animate-fadeIn cursor-pointer"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-12 w-84 max-w-full bg-white shadow-2xl z-10 flex flex-col border-r border-[#E2E8F0] animate-slideInLeft text-xs">
        <div className="h-12 bg-[#1A2232] text-white px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <div className="w-6 h-6 rounded-md bg-blue-500/20 text-blue-400 flex items-center justify-center">
              <UserCheck className="w-4 h-4" />
            </div>
            <span>Agent Queues</span>
          </div>
          <X className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white" onClick={onClose} />
        </div>

        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <p className="text-gray-500 text-[11px]">
            Select an agent to view their assigned workload, response metrics, and active tickets.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {agentStats.map((agent) => (
            <div
              key={agent.id}
              className={`p-3.5 rounded-lg border transition-all ${
                selectedAgentFilter === agent.filterValue
                  ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                    {agent.avatar}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 leading-tight">{agent.name}</div>
                    <div className="text-[10px] text-gray-400">{agent.role}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                  {agent.status}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 my-2 py-2 border-y border-gray-100 text-[10px] text-center">
                <div>
                  <span className="text-gray-400 block">Open</span>
                  <strong className="text-blue-600 font-bold text-xs">{agent.openCount}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">Total</span>
                  <strong className="text-gray-800 font-bold text-xs">{agent.totalCount}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">SLA</span>
                  <strong className="text-emerald-600 font-bold text-xs">{agent.sla}</strong>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedAgentFilter(agent.filterValue);
                    setSelectedTicketId(null);
                    onClose();
                  }}
                  className={`flex-1 py-1.5 rounded font-bold text-xs cursor-pointer transition-colors ${
                    selectedAgentFilter === agent.filterValue
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedAgentFilter === agent.filterValue ? '✓ Viewing Agent' : 'Select Queue'}
                </button>
                {selectedAgentFilter === agent.filterValue && (
                  <button
                    onClick={() => setSelectedAgentFilter(null)}
                    className="px-2 py-1.5 text-gray-500 hover:text-rose-600 rounded border border-gray-200 text-xs cursor-pointer"
                    title="Clear Agent Filter"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <button
            onClick={() => {
              setSelectedAgentFilter(null);
              onClose();
            }}
            className="w-full py-2 bg-white border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-100 text-xs cursor-pointer"
          >
            Reset to All Agents
          </button>
        </div>
      </div>
    </div>
  );
};
