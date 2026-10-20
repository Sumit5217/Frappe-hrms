import React, { useState } from 'react';
import { Edit2, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Ticket } from '../types';
import { formatZohoDate } from '../constants';
import { ZohoStatusDropdown } from '../components/ZohoStatusDropdown';

export interface TicketPropertiesPaneProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  onOpenEditModal: () => void;
  handleStatusChange: (ticketName: string, newStatus: string) => void;
}

export const TicketPropertiesPane: React.FC<TicketPropertiesPaneProps> = ({
  isOpen,
  onClose,
  ticket,
  onOpenEditModal,
  handleStatusChange,
}) => {
  const [accordionContact, setAccordionContact] = useState(true);
  const [accordionKeyInfo, setAccordionKeyInfo] = useState(true);

  if (!isOpen || !ticket) return null;

  return (
    <div className="w-64 border-r border-[#E2E8F0] flex flex-col bg-white shrink-0 overflow-y-auto animate-fadeIn">
      <div className="py-3 px-3 space-y-3.5 text-xs">
        <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
          <h3 className="font-bold text-xs text-[#0F172A]">Ticket Properties</h3>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onOpenEditModal}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-blue-600 transition-colors cursor-pointer"
              title="Edit Properties"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
              title="Hide Properties"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Accordion 1: Contact Info */}
        <div>
          <button
            onClick={() => setAccordionContact(!accordionContact)}
            className="w-full flex items-center justify-between font-bold text-xs text-[#334155] mb-1.5 cursor-pointer"
          >
            <span>Contact Info</span>
            {accordionContact ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {accordionContact && (
            <div className="space-y-1.5 pl-1 text-xs text-[#475569]">
              <div className="font-bold text-xs text-[#0F172A] truncate">
                {ticket.customer_name}
              </div>
              <div className="text-gray-600 font-medium truncate">{ticket.company_name}</div>
              <div className="text-blue-600 font-medium truncate">{ticket.email}</div>
              <div className="text-gray-600">{ticket.phone}</div>
            </div>
          )}
        </div>

        {/* Accordion 2: Key Information */}
        <div className="pt-2 border-t border-gray-100">
          <button
            onClick={() => setAccordionKeyInfo(!accordionKeyInfo)}
            className="w-full flex items-center justify-between font-bold text-xs text-[#334155] mb-1.5 cursor-pointer"
          >
            <span>Key Information</span>
            {accordionKeyInfo ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {accordionKeyInfo && (
            <div className="space-y-2.5 pl-1 text-xs">
              <div>
                <span className="text-gray-500 block text-[11px] uppercase font-bold">
                  Ticket Owner
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-[10px]">
                    S
                  </span>
                  <span className="font-bold text-xs text-[#1E293B] truncate">
                    {ticket.assigned_to}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] uppercase font-bold mb-1">
                  Status
                </span>
                <ZohoStatusDropdown
                  status={ticket.status}
                  onChange={(newStatus) => handleStatusChange(ticket.name, newStatus)}
                  align="left"
                  size="sm"
                />
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] uppercase font-bold">
                  Due Date
                </span>
                <span className="text-gray-800 font-medium text-xs mt-0.5 block">
                  {ticket.sla_deadline
                    ? formatZohoDate(ticket.sla_deadline)
                    : 'No Due Date set'}
                </span>
              </div>

              <div>
                <span className="text-gray-500 block text-[11px] uppercase font-bold">
                  Priority
                </span>
                <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                  {ticket.priority}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
