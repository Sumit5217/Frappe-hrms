import React from 'react';
import {
  Briefcase,
  UserCheck,
  Users,
  Clock,
  Calendar,
  Receipt,
  Star,
  Wallet,
  Percent,
  AlertCircle,
  Search,
  Bell,
  Sparkles,
  LogOut,
  PanelLeftClose,
} from 'lucide-react';
import { ModuleTab, UserSession } from '../types';

interface SidebarProps {
  activeTab: ModuleTab;
  onTabChange: (tab: ModuleTab) => void;
  user: UserSession;
  onLogout?: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sidebarCounts?: { leaves: number; recruitment: number; totalEmployees?: number };
  totalEmployees?: number;
  isOpen?: boolean;
  onToggleCollapse?: () => void;
}

interface NavItem {
  id: ModuleTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
}

const NAV_ITEMS: NavItem[] = [
  {
    id: 'hr_setup',
    label: 'HR Setup',
    icon: Briefcase,
    iconColor: 'text-[#3E5ECC]',
    iconBg: 'bg-[#EDF3FF]',
  },
  {
    id: 'tenure',
    label: 'Tenure',
    icon: UserCheck,
    iconColor: 'text-[#059669]',
    iconBg: 'bg-[#ECFDF5]',
  },
  {
    id: 'recruitment',
    label: 'Recruitment',
    icon: Users,
    iconColor: 'text-[#9333EA]',
    iconBg: 'bg-[#FAF5FF]',
  },
  {
    id: 'shift_and_attendance',
    label: 'Shift & Attendance',
    icon: Clock,
    iconColor: 'text-[#D97706]',
    iconBg: 'bg-[#FFFBEB]',
  },
  {
    id: 'leaves',
    label: 'Leaves',
    icon: Calendar,
    iconColor: 'text-[#E11D48]',
    iconBg: 'bg-[#FFF1F2]',
  },
  {
    id: 'expenses',
    label: 'Expenses',
    icon: Receipt,
    iconColor: 'text-[#0D9488]',
    iconBg: 'bg-[#F0FDFA]',
  },
  {
    id: 'performance',
    label: 'Performance',
    icon: Star,
    iconColor: 'text-[#D97706]',
    iconBg: 'bg-[#FEFCE8]',
  },
  {
    id: 'payroll',
    label: 'Payroll',
    icon: Wallet,
    iconColor: 'text-[#16A34A]',
    iconBg: 'bg-[#F0FDF4]',
  },
  {
    id: 'tax_and_benefits',
    label: 'Tax & Benefits',
    icon: Percent,
    iconColor: 'text-[#0284C7]',
    iconBg: 'bg-[#F0F9FF]',
  },
  {
    id: 'complaints',
    label: 'Complaints',
    icon: AlertCircle,
    iconColor: 'text-[#DC2626]',
    iconBg: 'bg-[#FEF2F2]',
  },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  user,
  onLogout,
  searchTerm,
  onSearchChange,
  sidebarCounts,
  totalEmployees: _totalEmployees,
  isOpen = true,
  onToggleCollapse,
}) => {
  const filteredNav = NAV_ITEMS.filter((item) =>
    item.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <aside
      style={{
        background: 'linear-gradient(180deg, #0C1220 0%, #0A0F1A 100%)',
        borderRight: isOpen ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
      }}
      className={`h-screen flex flex-col justify-between flex-shrink-0 sticky top-0 select-none text-[#CBD5E1] transition-all duration-300 ease-in-out overflow-hidden z-30 ${
        isOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 pointer-events-none'
      }`}
    >
      {/* Top Section */}
      <div className="w-64 flex flex-col h-full overflow-hidden">
        {/* Brand Header */}
        <div
          style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}
          className="p-4 pb-3.5 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div
              style={{ background: 'linear-gradient(135deg, #1E40AF 0%, #0284C7 100%)' }}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
            >
              <Sparkles className="w-4.5 h-4.5 text-[#38BDF8]" />
            </div>
            <div>
              <div className="font-serif font-bold text-sm tracking-tight text-white leading-tight flex items-center gap-1.5">
                Nimble Vision
                <span className="font-label bg-[#38BDF8]/15 text-[#38BDF8] text-[10px] font-semibold px-1.5 py-0.5 rounded border border-[#38BDF8]/30">
                  HR
                </span>
              </div>
              <div className="text-[11px] font-label text-[#94A3B8] mt-0.5 tracking-wide">
                Enterprise Curator
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              title="Notifications"
              className="p-1.5 text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[rgba(255,255,255,0.07)] rounded-lg transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#38BDF8] absolute top-1 right-1 ring-2 ring-[#0C1220]"></span>
            </button>
            {onToggleCollapse && (
              <button
                type="button"
                onClick={onToggleCollapse}
                title="Hide Sidebar"
                className="p-1.5 text-[#94A3B8] hover:text-[#38BDF8] hover:bg-[rgba(56,189,248,0.12)] rounded-lg transition-colors cursor-pointer"
              >
                <PanelLeftClose className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-3 pb-2">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-[#94A3B8] absolute left-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search module..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
              className="w-full text-xs h-8.5 pl-9 pr-3 rounded-lg text-[#E2E8F0] placeholder-[#64748B] focus:outline-none focus:border-[rgba(56,189,248,0.5)] focus:bg-[rgba(255,255,255,0.08)] transition-all font-sans"
            />
          </div>
        </div>

        {/* Section Heading: MAIN WORKSPACE */}
        <div className="px-3.5 pt-2 pb-1 text-[10px] font-label font-bold text-[#64748B] uppercase tracking-wider">
          Main Workspace
        </div>

        {/* Navigation Items with Dark Midnight Navy & Ocean Blue Palette */}
        <div className="flex-1 overflow-y-auto px-2.5 py-1 space-y-1">
          {filteredNav.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={
                  isActive
                    ? {
                        background: 'linear-gradient(135deg, #1E40AF 0%, #2563EB 100%)',
                        border: '1px solid rgba(56, 189, 248, 0.4)',
                        borderLeft: '3px solid #38BDF8',
                        boxShadow: '0 4px 14px rgba(29, 78, 216, 0.35)',
                      }
                    : {}
                }
                className={`group w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'text-white font-bold'
                    : 'text-[#CBD5E1] hover:text-[#E2E8F0] hover:bg-[rgba(255,255,255,0.07)]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive
                        ? 'text-[#38BDF8]'
                        : 'text-[#94A3B8] group-hover:text-[#E2E8F0]'
                    }`}
                  />
                  <span className={isActive ? 'text-white font-bold' : 'text-[#CBD5E1] group-hover:text-[#E2E8F0]'}>
                    {item.label}
                  </span>
                </div>

                {item.id === 'leaves' && (sidebarCounts?.leaves || 0) > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-label ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                    }`}
                  >
                    {sidebarCounts?.leaves}
                  </span>
                )}
                {item.id === 'recruitment' && (sidebarCounts?.recruitment || 0) > 0 && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold font-label ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30'
                    }`}
                  >
                    {sidebarCounts?.recruitment}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Profile Footer */}
      <div
        style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'linear-gradient(135deg, rgba(29,78,216,0.18) 0%, rgba(2,132,199,0.08) 100%)',
        }}
        className="p-3 flex items-center justify-between"
      >
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div
            style={{
              background: 'linear-gradient(135deg, #1E40AF 0%, #0284C7 100%)',
            }}
            className="w-8 h-8 rounded-full text-white flex items-center justify-center font-serif font-bold text-xs flex-shrink-0 shadow-sm"
          >
            {user.full_name?.charAt(0) || 'A'}
          </div>
          <div className="overflow-hidden">
            <div className="text-xs font-semibold text-white truncate">
              {user.full_name || 'Administrator'}
            </div>
            <div className="text-[10px] font-label text-[#94A3B8] truncate">
              {user.email || 'admin@nimblevision.io'}
            </div>
          </div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            title="Log Out"
            className="p-1.5 text-[#94A3B8] hover:text-[#EF4444] rounded-lg hover:bg-[rgba(255,255,255,0.08)] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
};
