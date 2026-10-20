import React from 'react';
import { Clock, Play, Pause } from 'lucide-react';
import { TimeEntry } from '../types';
import { formatTimer } from '../constants';

export interface TicketTimeTabProps {
  timerSeconds: number;
  isTimerRunning: boolean;
  setIsTimerRunning: React.Dispatch<React.SetStateAction<boolean>>;
  handleCommitTimerToLog: () => void;
  newLogHours: string;
  setNewLogHours: (val: string) => void;
  newLogActivity: string;
  setNewLogActivity: (val: string) => void;
  newLogBillable: boolean;
  setNewLogBillable: (val: boolean) => void;
  handleAddTimeEntry: (e: React.FormEvent) => void;
  timeEntries: TimeEntry[];
}

export const TicketTimeTab: React.FC<TicketTimeTabProps> = ({
  timerSeconds,
  isTimerRunning,
  setIsTimerRunning,
  handleCommitTimerToLog,
  newLogHours,
  setNewLogHours,
  newLogActivity,
  setNewLogActivity,
  newLogBillable,
  setNewLogBillable,
  handleAddTimeEntry,
  timeEntries,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAFC]">
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-gray-900">Active Live Stopwatch</h4>
            <span className="font-mono text-base font-bold text-blue-700">
              {formatTimer(timerSeconds)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setIsTimerRunning(!isTimerRunning)}
            className={`px-3 py-1.5 rounded font-bold flex items-center gap-1 text-white cursor-pointer ${
              isTimerRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isTimerRunning ? 'Pause' : 'Start Timer'}</span>
          </button>
          <button
            onClick={handleCommitTimerToLog}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold cursor-pointer"
          >
            Log to Ticket
          </button>
        </div>
      </div>

      {/* Add Manual Time Form */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-4 shadow-xs">
        <h4 className="font-bold text-xs text-gray-900 mb-3">+ Log Manual Time Entry</h4>
        <form onSubmit={handleAddTimeEntry} className="grid grid-cols-4 gap-3 text-xs items-end">
          <div>
            <label className="text-gray-600 font-semibold block mb-1">Hours</label>
            <input
              type="number"
              step="0.25"
              value={newLogHours}
              onChange={(e) => setNewLogHours(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-xs"
            />
          </div>
          <div className="col-span-2">
            <label className="text-gray-600 font-semibold block mb-1">Activity / Notes</label>
            <input
              type="text"
              value={newLogActivity}
              onChange={(e) => setNewLogActivity(e.target.value)}
              placeholder="e.g. Telemetry analysis"
              className="w-full p-2 border border-gray-300 rounded text-xs"
            />
          </div>
          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-1.5 cursor-pointer text-gray-700 font-semibold mb-2">
              <input
                type="checkbox"
                checked={newLogBillable}
                onChange={(e) => setNewLogBillable(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0"
              />
              <span>Billable</span>
            </label>
            <button
              type="submit"
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-xs cursor-pointer"
            >
              + Add Entry
            </button>
          </div>
        </form>
      </div>

      {/* Time Entries Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] overflow-hidden shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#FAFBFD] border-b border-[#E2E8F0] text-gray-500 font-bold uppercase text-[10px]">
            <tr>
              <th className="py-2 px-3">AGENT</th>
              <th className="py-2 px-3">DATE</th>
              <th className="py-2 px-3">HOURS</th>
              <th className="py-2 px-3">ACTIVITY</th>
              <th className="py-2 px-3 text-right">BILLABLE</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {timeEntries.map((t) => (
              <tr key={t.id} className="hover:bg-gray-50">
                <td className="py-2 px-3 font-semibold text-gray-800">{t.agent}</td>
                <td className="py-2 px-3 text-gray-500">{t.date}</td>
                <td className="py-2 px-3 font-bold text-blue-600">{t.hours} hrs</td>
                <td className="py-2 px-3 text-gray-700">{t.activity}</td>
                <td className="py-2 px-3 text-right">
                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 font-bold">
                    {t.billable ? 'Billable' : 'Non-billable'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TicketTimeTab;
