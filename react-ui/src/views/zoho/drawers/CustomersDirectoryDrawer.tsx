import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  X,
  User,
  Building2,
  Search,
  Mail,
  Phone,
  ExternalLink,
} from 'lucide-react';
import { CustomerRecord, AccountRecord } from '../types';
import { CustomerDetailView } from './CustomerDetailView';

export interface CustomersDirectoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  allCustomers: CustomerRecord[];
  allAccounts: AccountRecord[];
  onOpenNewContact: () => void;
  onOpenNewTicket: () => void;
  onFilterDesk: (query: string) => void;
  onSelectTicket: (ticketId: string) => void;
}

export const CustomersDirectoryDrawer: React.FC<CustomersDirectoryDrawerProps> = ({
  isOpen,
  onClose,
  allCustomers,
  allAccounts,
  onOpenNewContact,
  onOpenNewTicket,
  onFilterDesk,
  onSelectTicket,
}) => {
  const [customerTab, setCustomerTab] = useState<'contacts' | 'accounts'>('contacts');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerRecord | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilterCategory, setCustomerFilterCategory] = useState<'All' | 'Open' | 'B2B' | 'B2C'>('All');

  if (!isOpen) return null;

  const filteredCustomers = allCustomers.filter((c) => {
    if (customerFilterCategory !== 'All') {
      if (customerFilterCategory === 'Open' && c.openTicketsCount === 0) return false;
      if (customerFilterCategory === 'B2B' && c.category !== 'B2B') return false;
      if (customerFilterCategory === 'B2C' && c.category !== 'B2C') return false;
    }
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
      );
    }
    return true;
  });

  const filteredAccounts = allAccounts.filter((a) => {
    if (customerSearch.trim()) {
      const q = customerSearch.toLowerCase();
      return (
        a.name.toLowerCase().includes(q) ||
        a.contacts.some((c) => c.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity animate-fadeIn cursor-pointer"
        onClick={onClose}
      />
      <div className="absolute inset-y-0 right-0 w-[580px] max-w-full bg-white shadow-2xl z-10 flex flex-col border-l border-[#E2E8F0] animate-slideInRight font-sans">
        {/* Drawer Header */}
        <div className="h-14 bg-[#1A2232] text-white px-5 flex items-center justify-between shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
                <span>Customers & Accounts</span>
                <span className="text-[10px] font-semibold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-400/20">
                  Directory
                </span>
              </h3>
              <p className="text-[11px] text-[#94A3B8]">
                {allCustomers.length} Verified Contacts • {allAccounts.length} Organizations
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              onClick={onOpenNewContact}
              className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Add Contact</span>
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Close (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs (Contacts vs Accounts) */}
        <div className="bg-[#F8FAFC] border-b border-[#E2E8F0] px-5 pt-2 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-6 text-xs">
            <button
              onClick={() => {
                setCustomerTab('contacts');
                setSelectedCustomer(null);
              }}
              className={`pb-2.5 font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                customerTab === 'contacts' && !selectedCustomer
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Contacts ({allCustomers.length})</span>
            </button>
            <button
              onClick={() => {
                setCustomerTab('accounts');
                setSelectedCustomer(null);
              }}
              className={`pb-2.5 font-semibold transition-colors cursor-pointer border-b-2 flex items-center gap-1.5 ${
                customerTab === 'accounts' && !selectedCustomer
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-800'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Accounts / Organizations ({allAccounts.length})</span>
            </button>
            {selectedCustomer && (
              <button
                className="pb-2.5 font-semibold border-b-2 border-blue-600 text-blue-600 flex items-center gap-1.5 text-xs"
              >
                <span>{selectedCustomer.name} Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Quick Filters Bar */}
        {!selectedCustomer && (
          <div className="p-3.5 bg-white border-b border-[#E2E8F0] space-y-2.5 shrink-0">
            <div className="relative">
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder={
                  customerTab === 'contacts'
                    ? 'Search contacts by name, company, email, phone...'
                    : 'Search accounts by organization name or contact...'
                }
                className="w-full pl-8 pr-8 py-1.5 rounded-lg border border-[#CBD5E1] text-xs outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 bg-white"
              />
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
              {customerSearch && (
                <button
                  onClick={() => setCustomerSearch('')}
                  className="absolute right-2.5 top-2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-[11px] overflow-x-auto pb-0.5">
              <span className="text-gray-400 font-medium mr-1">Filter:</span>
              {(['All', 'Open', 'B2B', 'B2C'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCustomerFilterCategory(cat)}
                  className={`px-2.5 py-0.5 rounded-full font-medium transition-colors cursor-pointer border ${
                    customerFilterCategory === cat
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {cat === 'All'
                    ? 'All'
                    : cat === 'Open'
                    ? 'Has Active Tickets'
                    : cat === 'B2B'
                    ? 'B2B Enterprise'
                    : 'B2C Consumer'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 bg-[#F8FAFC] space-y-3">
          {/* DETAIL VIEW: Single Customer Selected */}
          {selectedCustomer ? (
            <CustomerDetailView
              selectedCustomer={selectedCustomer}
              onBack={() => setSelectedCustomer(null)}
              onFilterDesk={onFilterDesk}
              onClose={onClose}
              onOpenNewTicket={onOpenNewTicket}
              onSelectTicket={onSelectTicket}
            />
          ) : customerTab === 'contacts' ? (
            /* CONTACTS LIST VIEW */
            filteredCustomers.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                <User className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-600">No matching contacts found</p>
                <p className="text-[11px] text-gray-400 mt-1">
                  Try adjusting your search query or filter chip.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredCustomers.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-3.5 hover:border-blue-400 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                          {c.name
                            .split(' ')
                            .map((n: string) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4
                              className="font-bold text-xs text-gray-900 hover:text-blue-600 cursor-pointer"
                              onClick={() => setSelectedCustomer(c)}
                            >
                              {c.name}
                            </h4>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${
                                c.category === 'B2C'
                                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {c.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 font-medium mt-0.5">{c.company}</p>

                          <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1.5">
                            <span className="flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{c.email}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span className="text-gray-600">{c.phone}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            c.openTicketsCount > 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {c.openTicketsCount > 0
                            ? `${c.openTicketsCount} Open`
                            : `${c.tickets.length} Total`}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                      <button
                        onClick={() => setSelectedCustomer(c)}
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>View Profile & History</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => {
                          onFilterDesk(c.name);
                          onClose();
                        }}
                        className="text-gray-500 hover:text-gray-900 font-medium hover:underline text-[11px] cursor-pointer"
                      >
                        Filter Desk ({c.tickets.length} tickets)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            /* ACCOUNTS / COMPANIES LIST VIEW */
            filteredAccounts.length === 0 ? (
              <div className="text-center py-12 text-gray-400 text-xs">
                <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="font-semibold text-gray-600">No matching accounts found</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredAccounts.map((a) => (
                  <div
                    key={a.id}
                    className="bg-white rounded-xl border border-[#E2E8F0] p-4 hover:border-blue-400 hover:shadow-xs transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-xs text-gray-900">{a.name}</h4>
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                              {a.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-500 mt-1">
                            Contacts: <strong className="text-gray-700">{a.contacts.join(', ')}</strong>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            a.openTicketsCount > 0
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {a.openTicketsCount > 0 ? `${a.openTicketsCount} Open` : 'Resolved'}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-[11px] text-gray-400">
                        {a.tickets.length} total enterprise ticket{a.tickets.length !== 1 ? 's' : ''}
                      </span>

                      <button
                        onClick={() => {
                          onFilterDesk(a.name);
                          onClose();
                        }}
                        className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer text-xs"
                      >
                        <span>Filter Company Tickets</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
};
