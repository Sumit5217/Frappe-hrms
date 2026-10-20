import React from 'react';
import { ActivityEvent } from '../types';

export interface TicketActivityTabProps {
  activityLogs: ActivityEvent[];
}

export const TicketActivityTab: React.FC<TicketActivityTabProps> = ({ activityLogs }) => {
  return (
    <div className="flex-1 overflow-y-auto p-5 bg-[#F8FAFC]">
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs max-w-2xl">
        <h3 className="font-bold text-xs text-gray-900 mb-4 pb-2 border-b border-gray-100">
          Audit Trail & Event Activity History
        </h3>
        <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200">
          {activityLogs.map((act) => (
            <div key={act.id} className="relative text-xs">
              <span className="w-3 h-3 rounded-full bg-blue-600 ring-4 ring-white absolute -left-6 top-0.5" />
              <div className="flex items-center justify-between">
                <span className="font-bold text-gray-900">{act.action}</span>
                <span className="text-[11px] text-gray-400">{act.timestamp}</span>
              </div>
              <p className="text-gray-600 mt-0.5 text-[11px]">{act.detail}</p>
              <span className="text-[10px] text-gray-400 italic">By: {act.user}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TicketActivityTab;
