import React from 'react';
import {
  ArrowLeft,
  Building2,
  Mail,
  Phone,
  Search,
  FileText,
} from 'lucide-react';
import { CustomerRecord, Ticket } from '../types';

export interface CustomerDetailViewProps {
  selectedCustomer: CustomerRecord;
  onBack: () => void;
  onFilterDesk: (name: string) => void;
  onClose: () => void;
  onOpenNewTicket: () => void;
  onSelectTicket: (ticketId: string) => void;
}

export const CustomerDetailView: React.FC<CustomerDetailViewProps> = ({
  selectedCustomer,
  onBack,
  onFilterDesk,
  onClose,
  onOpenNewTicket,
  onSelectTicket,
}) => {
  return (
    <div className="space-y-4">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Customer Directory</span>
      </button>

      {/* Customer Card Profile */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-xs">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-bold text-base flex items-center justify-center shadow-sm">
              {selectedCustomer.name
                .split(' ')
                .map((n: string) => n[0])
                .slice(0, 2)
                .join('')
                .toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#0F172A]">{selectedCustomer.name}</h2>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                    selectedCustomer.category === 'B2C'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}
                >
                  {selectedCustomer.category}
                </span>
              </div>
              <p className="text-xs text-gray-600 font-medium flex items-center gap-1.5 mt-0.5">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                <span>{selectedCustomer.company}</span>
              </p>
            </div>
          </div>

          <div className="text-right">
            <span
              className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold ${
                selectedCustomer.openTicketsCount > 0
                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}
            >
              {selectedCustomer.openTicketsCount > 0
                ? `${selectedCustomer.openTicketsCount} Active Ticket${selectedCustomer.openTicketsCount > 1 ? 's' : ''}`
                : 'No Active Tickets'}
            </span>
          </div>
        </div>

        {/* Contact Details Grid */}
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-100 text-xs">
          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
              Email Address
            </span>
            <a
              href={`mailto:${selectedCustomer.email}`}
              className="font-semibold text-blue-600 hover:underline break-all mt-0.5 flex items-center gap-1"
            >
              <Mail className="w-3 h-3 text-blue-500 shrink-0" />
              <span>{selectedCustomer.email}</span>
            </a>
          </div>

          <div className="p-2.5 rounded-lg bg-gray-50 border border-gray-100">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider block">
              Phone Number
            </span>
            <a
              href={`tel:${selectedCustomer.phone}`}
              className="font-semibold text-gray-800 hover:text-blue-600 mt-0.5 flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
              <span>{selectedCustomer.phone}</span>
            </a>
          </div>
        </div>

        {/* Quick Desk Action Buttons */}
        <div className="mt-4 flex items-center gap-2.5 pt-3 border-t border-gray-100">
          <button
            onClick={() => {
              onFilterDesk(selectedCustomer.name);
              onClose();
            }}
            className="flex-1 py-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Filter Customer Tickets in Desk</span>
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenNewTicket();
            }}
            className="py-1.5 px-3 rounded-lg border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span>+ Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Customer's Associated Tickets */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
          <h4 className="font-bold text-xs text-gray-900 flex items-center gap-2">
            <span>Associated Support Tickets</span>
            <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {selectedCustomer.tickets.length}
            </span>
          </h4>
        </div>

        {selectedCustomer.tickets.length === 0 ? (
          <div className="text-center py-6 text-gray-400 text-xs">
            <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="font-semibold text-gray-600">No tickets found for this customer</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Click '+ Create Ticket' to file a new issue under this contact.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {selectedCustomer.tickets.map((t: Ticket) => (
              <div
                key={t.name}
                onClick={() => {
                  onSelectTicket(t.name);
                  onClose();
                }}
                className="p-3 rounded-lg border border-gray-200 hover:border-blue-400 hover:bg-blue-50/40 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-blue-600 text-xs group-hover:underline">
                    {t.displayId}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        t.status === 'Open'
                          ? 'bg-emerald-100 text-emerald-800'
                          : t.status === 'In Review'
                          ? 'bg-blue-100 text-blue-800'
                          : t.status === 'Escalated'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {t.status}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        t.priority === 'Critical'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : t.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-gray-50 text-gray-600 border border-gray-200'
                      }`}
                    >
                      {t.priority}
                    </span>
                  </div>
                </div>

                <p className="font-semibold text-xs text-gray-900 mt-1 line-clamp-1 group-hover:text-blue-700">
                  {t.title}
                </p>

                <div className="flex items-center justify-between text-[11px] text-gray-400 mt-2 pt-1.5 border-t border-gray-100">
                  <span>Assigned: {t.assigned_to || 'Sumit Singh'}</span>
                  <span>{t.date || 'Recent'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailView;
