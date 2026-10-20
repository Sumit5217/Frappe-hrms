import React from 'react';
import { X, Users } from 'lucide-react';
import { TeamStat } from '../types';

export interface TeamQueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  teamStats: TeamStat[];
  selectedTeamFilter: string | null;
  setSelectedTeamFilter: (filter: string | null) => void;
  setSelectedTicketId: (id: string | null) => void;
}

export const TeamQueueDrawer: React.FC<TeamQueueDrawerProps> = ({
  isOpen,
  onClose,
  teamStats,
  selectedTeamFilter,
  setSelectedTeamFilter,
  setSelectedTicketId,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity animate-fadeIn cursor-pointer"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 left-12 w-88 max-w-full bg-white shadow-2xl z-10 flex flex-col border-r border-[#E2E8F0] animate-slideInLeft text-xs">
        <div className="h-12 bg-[#1A2232] text-white px-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 font-bold text-sm">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
            <span>Team & Department Queues</span>
          </div>
          <X className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white" onClick={onClose} />
        </div>

        <div className="p-3 bg-gray-50 border-b border-gray-200">
          <p className="text-gray-500 text-[11px]">
            Filter tickets by operational squads to review backlog and team SLA metrics.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          {teamStats.map((team) => (
            <div
              key={team.id}
              className={`p-3.5 rounded-lg border transition-all ${
                selectedTeamFilter === team.name
                  ? 'border-indigo-500 bg-indigo-50/50 shadow-xs'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-lg ${team.iconBg || 'bg-indigo-50 text-indigo-600'} flex items-center justify-center shrink-0 shadow-2xs`}>
                    {team.icon || <Users className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 leading-tight">{team.name}</div>
                    <div className="text-[10px] text-gray-400">{team.dept}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-bold text-[9px] border border-gray-200">
                  {team.badge}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-1 my-2 py-2 border-y border-gray-100 text-[10px] text-center">
                <div>
                  <span className="text-gray-400 block">Queue</span>
                  <strong className="text-indigo-600 font-bold text-xs">{team.openCount}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">SLA Rate</span>
                  <strong className="text-emerald-600 font-bold text-xs">{team.slaRate}</strong>
                </div>
                <div>
                  <span className="text-gray-400 block">Avg Reply</span>
                  <strong className="text-gray-700 font-bold text-xs">{team.avgResponse}</strong>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-gray-500 mb-2">
                <span>Lead: <strong>{team.lead}</strong></span>
                <span>{team.members} Members</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setSelectedTeamFilter(team.name);
                    setSelectedTicketId(null);
                    onClose();
                  }}
                  className={`flex-1 py-1.5 rounded font-bold text-xs cursor-pointer transition-colors ${
                    selectedTeamFilter === team.name
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedTeamFilter === team.name ? '✓ Viewing Team' : 'Select Team Queue'}
                </button>
                {selectedTeamFilter === team.name && (
                  <button
                    onClick={() => setSelectedTeamFilter(null)}
                    className="px-2 py-1.5 text-gray-500 hover:text-rose-600 rounded border border-gray-200 text-xs cursor-pointer"
                    title="Clear Team Filter"
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
              setSelectedTeamFilter(null);
              onClose();
            }}
            className="w-full py-2 bg-white border border-gray-300 rounded font-semibold text-gray-700 hover:bg-gray-100 text-xs cursor-pointer"
          >
            Reset to All Teams
          </button>
        </div>
      </div>
    </div>
  );
};
