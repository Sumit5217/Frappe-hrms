import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  LayoutList,
  ChevronDown,
  Briefcase,
  Cpu,
  Truck,
  Headphones,
  Building2,
  Check,
  Plus,
  FileText,
  UserPlus,
  Clock,
  Search,
  Bell,
  UserCheck,
  Info,
} from 'lucide-react';
import { Ticket, ZohoNotification, ViewMode, AgentStat } from '../types';
import { ZohoNotificationPopover } from './ZohoNotificationPopover';

export interface ZohoTopBarProps {
  onBackToDashboard?: () => void;
  onToggleHRSidebar?: () => void;
  isHRSidebarOpen?: boolean;
  tickets: Ticket[];
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  setSelectedTicketId: (id: string | null) => void;
  isCustomersDrawerOpen: boolean;
  setIsCustomersDrawerOpen: (open: boolean) => void;
  isKnowledgeDrawerOpen: boolean;
  setIsKnowledgeDrawerOpen: (open: boolean) => void;
  setIsFilterDrawerOpen: (open: boolean) => void;
  setIsNewTicketModalOpen: (open: boolean) => void;
  setIsNewContactModalOpen: (open: boolean) => void;
  setIsAgentQueueDrawerOpen?: (open: boolean) => void;
  selectedDepartment: string;
  setSelectedDepartment: (dept: string) => void;
  departmentCounts?: Record<string, number>;
  notifications?: ZohoNotification[];
  onOpenNotificationTicket?: (notif: ZohoNotification) => void;
  markAllNotificationsAsRead?: () => void;
  clearAllNotifications?: () => void;
  agentStats?: AgentStat[];
}

export const ZohoTopBar: React.FC<ZohoTopBarProps> = ({
  onBackToDashboard,
  onToggleHRSidebar,
  isHRSidebarOpen = false,
  tickets,
  viewMode,
  setViewMode,
  setSelectedTicketId,
  isCustomersDrawerOpen,
  setIsCustomersDrawerOpen,
  isKnowledgeDrawerOpen,
  setIsKnowledgeDrawerOpen,
  setIsFilterDrawerOpen,
  setIsNewTicketModalOpen,
  setIsNewContactModalOpen,
  setIsAgentQueueDrawerOpen,
  selectedDepartment,
  setSelectedDepartment,
  departmentCounts: propDepartmentCounts,
  notifications = [],
  onOpenNotificationTicket = (notif) => setSelectedTicketId(notif.ticketId || notif.ticketName),
  markAllNotificationsAsRead = () => {},
  clearAllNotifications = () => {},
  agentStats = [],
}) => {
  const departmentCounts = propDepartmentCounts || {
    'All Departments': tickets.length,
    'Enterprise Support (B2B)': tickets.filter((t) => t.complaint_category === 'B2B').length,
    'Hardware & IoT Telemetry': tickets.filter((t) => t.complaint_type === 'Technical Issue' || t.title.toLowerCase().includes('sensor')).length,
    'Logistics & Fulfilment': tickets.filter((t) => t.complaint_type === 'Delivery Issue' || t.title.toLowerCase().includes('delivery')).length,
    'Customer Care (B2C)': tickets.filter((t) => t.complaint_category === 'B2C').length,
  };
  const [isDepartmentDropdownOpen, setIsDepartmentDropdownOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [agentStatus, setAgentStatus] = useState('Online');

  const departmentRef = useRef<HTMLDivElement>(null);
  const quickAddRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (departmentRef.current && !departmentRef.current.contains(target)) {
        setIsDepartmentDropdownOpen(false);
      }
      if (quickAddRef.current && !quickAddRef.current.contains(target)) {
        setIsQuickAddOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(target)) {
        setIsNotificationOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-11 bg-[#1A2232] text-white flex items-center justify-between px-4 text-[13px] z-30 shrink-0 border-b border-[#2D3748]">
      {/* Left: Brand Mark & Modules */}
      <div className="flex items-center gap-4">
        {onBackToDashboard && (
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#243046] hover:bg-[#2D3D59] text-[#94A3B8] hover:text-white transition-colors text-xs font-medium border border-white/5 cursor-pointer"
            title="Return to HRMS Workspace"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>HRMS</span>
          </button>
        )}

        {onToggleHRSidebar && (
          <button
            onClick={onToggleHRSidebar}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border cursor-pointer transition-colors ${
              isHRSidebarOpen
                ? 'bg-blue-600/30 text-blue-300 border-blue-500/40'
                : 'bg-[#243046] hover:bg-[#2D3D59] text-[#94A3B8] hover:text-white border-white/5'
            }`}
            title={isHRSidebarOpen ? 'Hide HR Navigation Sidebar' : 'Show HR Navigation Sidebar'}
          >
            <LayoutList className="w-3.5 h-3.5" />
            <span>{isHRSidebarOpen ? 'Hide Sidebar' : 'HR Sidebar'}</span>
          </button>
        )}

        <div
          onClick={() => {
            setSelectedTicketId(null);
            setViewMode('table');
          }}
          className="flex items-center gap-1.5 cursor-pointer font-bold text-sm tracking-wide text-white mr-2"
        >
          <span className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-xs font-black italic">
            /
          </span>
          <span>Desk</span>
        </div>

        <nav className="flex items-center gap-5 text-[#CBD5E1] font-normal text-[13px]">
          <button
            onClick={() => {
              setSelectedTicketId(null);
              setViewMode('table');
              setIsCustomersDrawerOpen(false);
              setIsKnowledgeDrawerOpen(false);
            }}
            className={
              !isCustomersDrawerOpen && !isKnowledgeDrawerOpen && viewMode !== 'status'
                ? 'text-white border-b-2 border-white pb-2.5 pt-2.5 font-medium cursor-pointer'
                : 'hover:text-white transition-colors py-2.5 text-[#CBD5E1] cursor-pointer'
            }
          >
            Tickets
          </button>
          <button
            onClick={() => {
              setIsKnowledgeDrawerOpen(true);
              setIsCustomersDrawerOpen(false);
            }}
            className={
              isKnowledgeDrawerOpen
                ? 'text-white border-b-2 border-white pb-2.5 pt-2.5 font-medium cursor-pointer'
                : 'hover:text-white transition-colors py-2.5 text-[#CBD5E1] cursor-pointer'
            }
          >
            Knowledge Base
          </button>
          <button
            onClick={() => {
              setIsCustomersDrawerOpen(true);
              setIsKnowledgeDrawerOpen(false);
            }}
            className={
              isCustomersDrawerOpen
                ? 'text-white border-b-2 border-white pb-2.5 pt-2.5 font-medium cursor-pointer'
                : 'hover:text-white transition-colors hidden md:inline-block py-2.5 text-[#CBD5E1] cursor-pointer'
            }
          >
            Customers
          </button>
          <button
            onClick={() => {
              setViewMode('status');
              setIsCustomersDrawerOpen(false);
              setIsKnowledgeDrawerOpen(false);
            }}
            className={
              viewMode === 'status' && !isCustomersDrawerOpen && !isKnowledgeDrawerOpen
                ? 'text-white border-b-2 border-white pb-2.5 pt-2.5 font-medium cursor-pointer hidden lg:inline-block'
                : 'hover:text-white transition-colors hidden lg:inline-block py-2.5 text-[#CBD5E1] cursor-pointer'
            }
          >
            Analytics
          </button>
        </nav>
      </div>

      {/* Right: Department, Quick Add & Icons */}
      <div className="flex items-center gap-5">
        {/* Department Switcher */}
        <div className="relative" ref={departmentRef}>
          <button
            onClick={() => setIsDepartmentDropdownOpen(!isDepartmentDropdownOpen)}
            className="px-3.5 py-1.5 rounded-full bg-[#243046] text-[#CBD5E1] hover:text-white text-sm font-semibold flex items-center gap-2 cursor-pointer hover:bg-[#2D3D59] transition-colors border border-white/5"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
            <span>{selectedDepartment}</span>
            <ChevronDown className="w-4 h-4 text-[#94A3B8]" />
          </button>

          {isDepartmentDropdownOpen && (
            <div className="absolute right-0 top-8 w-68 bg-white rounded-lg shadow-2xl border border-gray-200 py-1.5 z-50 text-xs text-gray-800 animate-fadeIn">
              <div className="px-3 py-1.5 border-b border-gray-100 flex items-center justify-between text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                <span>Switch Department</span>
                <span className="text-[10px] text-blue-600 font-semibold">{tickets.length} Total</span>
              </div>
              <div className="py-1">
                {[
                  { id: 'Enterprise Support (B2B)', name: 'Enterprise Support (B2B)', desc: 'Corporate SLA Accounts & Utilities', icon: <Briefcase className="w-3.5 h-3.5 text-indigo-600" />, iconBg: 'bg-indigo-50', count: departmentCounts['Enterprise Support (B2B)'] },
                  { id: 'Hardware & IoT Telemetry', name: 'Hardware & IoT Telemetry', desc: 'Sensors, RTU Gateways & Controllers', icon: <Cpu className="w-3.5 h-3.5 text-purple-600" />, iconBg: 'bg-purple-50', count: departmentCounts['Hardware & IoT Telemetry'] },
                  { id: 'Logistics & Fulfilment', name: 'Logistics & Fulfilment', desc: 'Orders, Shipments & Dispatch', icon: <Truck className="w-3.5 h-3.5 text-amber-600" />, iconBg: 'bg-amber-50', count: departmentCounts['Logistics & Fulfilment'] },
                  { id: 'Customer Care (B2C)', name: 'Customer Care (B2C)', desc: 'Direct Retail & Inquiries', icon: <Headphones className="w-3.5 h-3.5 text-blue-600" />, iconBg: 'bg-blue-50', count: departmentCounts['Customer Care (B2C)'] },
                  { id: 'All Departments', name: 'All Departments', desc: 'Global multi-dept view', icon: <Building2 className="w-3.5 h-3.5 text-emerald-600" />, iconBg: 'bg-emerald-50', count: departmentCounts['All Departments'] },
                ].map((dept) => (
                  <button
                    key={dept.id}
                    onClick={() => {
                      setSelectedDepartment(dept.id);
                      setIsDepartmentDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 hover:bg-blue-50/70 flex items-center justify-between transition-colors cursor-pointer ${
                      selectedDepartment === dept.id ? 'bg-blue-50/90 text-blue-700 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-7 h-7 rounded-md ${dept.iconBg} flex items-center justify-center shrink-0`}>
                        {dept.icon}
                      </div>
                      <div>
                        <div className="font-bold text-xs leading-none mb-0.5">{dept.name}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{dept.desc}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600">
                        {dept.count}
                      </span>
                      {selectedDepartment === dept.id && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </div>
                  </button>
                ))}
              </div>
              <div className="pt-1.5 border-t border-gray-100 px-3 pb-1">
                <button
                  onClick={() => {
                    setIsDepartmentDropdownOpen(false);
                    const name = window.prompt('Enter new department name:');
                    if (name && name.trim()) {
                      setSelectedDepartment(name.trim());
                      alert(`Switched to department "${name.trim()}"`);
                    }
                  }}
                  className="w-full text-left text-[11px] text-blue-600 hover:text-blue-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add New Department</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Add Menu */}
        <div className="relative" ref={quickAddRef}>
          <button
            onClick={() => setIsQuickAddOpen(!isQuickAddOpen)}
            className="h-6.5 px-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold flex items-center gap-1 text-xs transition-colors cursor-pointer shadow-sm"
            title="Quick Add"
          >
            <Plus className="w-3.5 h-3.5" />
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>
          {isQuickAddOpen && (
            <div className="absolute right-0 top-8 w-44 bg-white rounded-md shadow-xl border border-gray-200 py-1 z-50 text-xs text-gray-800">
              <button
                onClick={() => {
                  setIsQuickAddOpen(false);
                  setIsNewTicketModalOpen(true);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-blue-600" />
                <span>+ New Ticket</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickAddOpen(false);
                  setIsNewContactModalOpen(true);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ New Contact</span>
              </button>
              <button
                onClick={() => {
                  setIsQuickAddOpen(false);
                  alert('Log Work Session: Quick time entry tracker launched');
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-blue-50 flex items-center gap-2 cursor-pointer"
              >
                <Clock className="w-3.5 h-3.5 text-purple-600" />
                <span>+ Log Time Entry</span>
              </button>
            </div>
          )}
        </div>

        {/* Icons: Search, Notifications, Knowledge, Profile */}
        <div className="flex items-center gap-5 text-[#94A3B8]">
          <button
            onClick={() => setIsFilterDrawerOpen(true)}
            className="p-1.5 rounded hover:bg-[#243046] hover:text-white transition-colors cursor-pointer"
            title="Search Tickets"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="p-1.5 rounded hover:bg-[#243046] text-[#94A3B8] hover:text-white transition-colors relative flex items-center justify-center cursor-pointer"
              title="Ticket Alerts & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 px-1 min-w-[15px] h-[15px] rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center ring-2 ring-[#1A2232]">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            <ZohoNotificationPopover
              isOpen={isNotificationOpen}
              onClose={() => setIsNotificationOpen(false)}
              notifications={notifications}
              onOpenTicket={onOpenNotificationTicket}
              markAllAsRead={markAllNotificationsAsRead}
              clearAll={clearAllNotifications}
            />
          </div>

          <button
            onClick={() => setIsKnowledgeDrawerOpen(true)}
            className="p-1.5 rounded hover:bg-[#243046] text-[#94A3B8] hover:text-white transition-colors flex items-center justify-center cursor-pointer"
            title="Knowledge Base & Guides"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Profile Menu */}
          <div className="relative ml-0.5" ref={profileMenuRef}>
            <button
              onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
              className="w-7 h-7 rounded-full bg-[#7C3AED] text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/20 hover:ring-white cursor-pointer transition-transform hover:scale-105"
              title="Agent Profile: Sumit Singh"
            >
              S
            </button>

            {isProfileMenuOpen && (
              <div className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50 text-xs text-gray-800">
                <div className="px-3 py-2 border-b border-gray-100">
                  <div className="font-bold text-sm text-gray-900">Sumit Singh</div>
                  <div className="text-[11px] text-gray-500">Tier 2 Lead Support Engineer</div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-[10px] font-bold text-emerald-700">{agentStatus}</span>
                  </div>
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      setAgentStatus('Online');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <span>Set status: Online</span>
                    </span>
                    {agentStatus === 'Online' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setAgentStatus('Away');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <span>Set status: Away</span>
                    </span>
                    {agentStatus === 'Away' && <Check className="w-3.5 h-3.5 text-amber-600" />}
                  </button>
                  <button
                    onClick={() => {
                      setAgentStatus('Busy');
                      setIsProfileMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-gray-50 flex items-center justify-between cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      <span>Set status: In Meeting</span>
                    </span>
                    {agentStatus === 'Busy' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                  </button>
                </div>
                <div className="border-t border-gray-100 pt-1">
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(false);
                      setIsAgentQueueDrawerOpen?.(true);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-blue-50 text-blue-600 font-semibold cursor-pointer flex items-center gap-2"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>My Tickets Queue ({agentStats[0]?.openCount || 0})</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
