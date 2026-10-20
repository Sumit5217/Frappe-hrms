import React from 'react';
import { FileCheck, CheckCircle2 } from 'lucide-react';
import { Ticket } from '../types';
import { getStatusBadge } from '../constants';

export interface TicketResolutionTabProps {
  activeTicket?: Ticket;
  rootCause: string;
  setRootCause: (val: string) => void;
  resolutionText: string;
  setResolutionText: (val: string) => void;
  resolutionSuccessMessage: string;
  savingResolution: boolean;
  handleSaveResolution: () => void;
}

export const TicketResolutionTab: React.FC<TicketResolutionTabProps> = ({
  activeTicket,
  rootCause,
  setRootCause,
  resolutionText,
  setResolutionText,
  resolutionSuccessMessage,
  savingResolution,
  handleSaveResolution,
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#F8FAFC]">
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-xs max-w-2xl">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-sm text-[#0F172A]">Ticket Resolution Details</h3>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBadge(
              activeTicket?.status || 'Open'
            )}`}
          >
            {activeTicket?.status}
          </span>
        </div>

        {resolutionSuccessMessage && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{resolutionSuccessMessage}</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-gray-700 block mb-1">Root Cause Category</label>
            <select
              value={rootCause}
              onChange={(e) => setRootCause(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded text-xs outline-none bg-white"
            >
              <option value="Sensor Drift / Hardware Calibration">
                Sensor Drift / Hardware Calibration
              </option>
              <option value="Firmware Register Misconfiguration">
                Firmware Register Misconfiguration
              </option>
              <option value="Network Telemetry Delay">Network Telemetry Delay</option>
              <option value="User Operation Error">User Operation Error</option>
              <option value="Normal Maintenance Scheduled">Normal Maintenance Scheduled</option>
            </select>
          </div>

          <div>
            <label className="font-bold text-gray-700 block mb-1">Resolution Summary Note *</label>
            <textarea
              rows={5}
              value={resolutionText}
              onChange={(e) => setResolutionText(e.target.value)}
              placeholder="Explain the technical resolution steps taken to solve this ticket..."
              className="w-full p-2.5 border border-gray-300 rounded text-xs outline-none focus:border-blue-500 font-sans"
            />
          </div>

          <div className="p-3 bg-gray-50 rounded border border-gray-200 text-[11px] text-gray-600 space-y-1">
            <div>
              <strong>Resolved By:</strong> {activeTicket?.assigned_to || 'Sumit Singh'}
            </div>
            <div>
              <strong>Ticket ID:</strong> {activeTicket?.displayId} ({activeTicket?.name})
            </div>
            <div>
              <strong>Customer:</strong> {activeTicket?.customer_name} ({activeTicket?.email})
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              disabled={savingResolution || !resolutionText.trim()}
              onClick={handleSaveResolution}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-xs flex items-center gap-1.5 shadow-sm disabled:opacity-50 cursor-pointer"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{savingResolution ? 'Saving...' : 'Save & Mark as Resolved'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketResolutionTab;
