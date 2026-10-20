import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronRight,
  Home,
  LayoutDashboard,
  User,
  Network,
  Settings,
  FileText,
  Clock,
  Calendar,
  DollarSign,
  Receipt,
  Star,
  Shield,
  Layers,
  ExternalLink,
  PanelLeftClose,
} from 'lucide-react';
import { NavItem, WORKSPACE_SIDEBARS } from '../config/workspaceNav';
import { ModuleTab } from '../types';

interface SubSidebarProps {
  isOpen?: boolean;
  activeTab: ModuleTab;
  activeSubItem: string;
  onSelectSubItem: (item: NavItem) => void;
  onClose?: () => void;
  totalEmployees?: number;
}

// Icon mapper for Frappe sidebar icon names
const getIcon = (name?: string, linkType?: string) => {
  if (!name) {
    if (linkType === 'Report') return FileText;
    if (linkType === 'Dashboard') return LayoutDashboard;
    return Layers;
  }

  const lower = name.toLowerCase();
  if (lower.includes('house') || lower.includes('home')) return Home;
  if (lower.includes('dashboard')) return LayoutDashboard;
  if (lower.includes('user') || lower.includes('employee')) return User;
  if (lower.includes('building') || lower.includes('chart') || lower.includes('organization')) return Network;
  if (lower.includes('setting')) return Settings;
  if (lower.includes('calendar') || lower.includes('date')) return Calendar;
  if (lower.includes('clock') || lower.includes('time') || lower.includes('shift')) return Clock;
  if (lower.includes('receipt') || lower.includes('expense') || lower.includes('claim')) return Receipt;
  if (lower.includes('star') || lower.includes('goal') || lower.includes('performance')) return Star;
  if (lower.includes('coin') || lower.includes('salary') || lower.includes('payroll')) return DollarSign;
  if (lower.includes('shield') || lower.includes('tax')) return Shield;
  if (lower.includes('file') || lower.includes('doc') || lower.includes('note')) return FileText;

  return Layers;
};

export const SubSidebar: React.FC<SubSidebarProps> = ({
  isOpen = true,
  activeTab,
  activeSubItem,
  onSelectSubItem,
  onClose,
  totalEmployees,
}) => {
  const sidebarData = WORKSPACE_SIDEBARS[activeTab] || WORKSPACE_SIDEBARS.hr_setup;
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (label: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setCollapsedSections((prev) => ({
      ...prev,
      [label]: !prev[label],
    }));
  };

  // Group items properly: section breaks only take child === 1 items
  type SectionGroup = {
    title?: string;
    isSectionBreak: boolean;
    items: NavItem[];
  };

  const groups: SectionGroup[] = [];
  let currentGroup: SectionGroup = {
    title: undefined,
    isSectionBreak: false,
    items: [],
  };

  for (const item of sidebarData.items) {
    if (item.type === 'Section Break') {
      if (currentGroup.items.length > 0 || currentGroup.title) {
        groups.push(currentGroup);
      }
      currentGroup = {
        title: item.label,
        isSectionBreak: true,
        items: [],
      };
    } else if (currentGroup.isSectionBreak && item.child === 0) {
      // Standalone item following a section break (e.g. Settings)
      if (currentGroup.items.length > 0 || currentGroup.title) {
        groups.push(currentGroup);
      }
      currentGroup = {
        title: undefined,
        isSectionBreak: false,
        items: [item],
      };
    } else {
      currentGroup.items.push(item);
    }
  }
  if (currentGroup.items.length > 0 || currentGroup.title) {
    groups.push(currentGroup);
  }

  return (
    <aside
      className={`bg-white/95 backdrop-blur-[20px] flex flex-col flex-shrink-0 select-none transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen
          ? 'w-56 opacity-100 border-r border-[rgba(140,150,175,0.14)]'
          : 'w-0 opacity-0 border-r-0 pointer-events-none'
      }`}
    >
      <div className="w-56 h-full flex flex-col flex-shrink-0">
        {/* SubSidebar Header with Close Button */}
        <div className="h-16 px-3.5 flex items-center justify-between border-b border-[rgba(140,150,175,0.10)] bg-transparent">
          <div className="flex items-center gap-2 truncate">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse flex-shrink-0"></div>
            <h2 className="font-serif text-sm font-bold text-content-main tracking-tight truncate">
              {sidebarData.title}
            </h2>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              title="Hide Sub-menu Bar"
              className="p-1.5 rounded-btn text-content-muted hover:text-content-main hover:bg-surface-low transition-colors cursor-pointer flex-shrink-0 group"
            >
              <PanelLeftClose className="w-4 h-4 text-content-muted group-hover:text-primary transition-colors" />
            </button>
          )}
        </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
        {groups.map((group, groupIdx) => {
          const isCollapsed = group.title ? Boolean(collapsedSections[group.title]) : false;

          return (
            <div key={groupIdx} className="mb-2">
              {/* Section Header (Clickable to expand / collapse) */}
              {group.isSectionBreak && group.title && (
                <button
                  type="button"
                  onClick={(e) => toggleSection(group.title!, e)}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-semibold text-content-muted hover:text-content-main hover:bg-surface-low rounded-btn transition-colors cursor-pointer select-none group"
                >
                  <span className="font-label uppercase text-[10px] tracking-wider font-bold text-content-subtle group-hover:text-primary transition-colors">
                    {group.title}
                  </span>
                  {isCollapsed ? (
                    <ChevronRight className="w-3.5 h-3.5 text-content-subtle group-hover:text-primary transition-colors" />
                  ) : (
                    <ChevronDown className="w-3.5 h-3.5 text-content-subtle group-hover:text-primary transition-colors" />
                  )}
                </button>
              )}

              {/* Items in Section */}
              {!isCollapsed && (
                <div className={`space-y-0.5 ${group.isSectionBreak ? 'mt-1 pl-1' : ''}`}>
                  {group.items.map((item, itemIdx) => {
                    const isSelected =
                      activeSubItem.toLowerCase() === item.label.toLowerCase() ||
                      (activeSubItem === 'dashboard' && item.label.toLowerCase() === 'dashboard') ||
                      (activeSubItem === 'home' && item.label.toLowerCase() === 'home') ||
                      (activeSubItem === 'organizational-chart' &&
                        item.label.toLowerCase().includes('organizational'));

                    const Icon = getIcon(item.icon, item.link_type);

                    return (
                      <button
                        key={itemIdx}
                        type="button"
                        onClick={() => onSelectSubItem(item)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-btn text-xs font-medium transition-all group text-left cursor-pointer ${
                          isSelected
                            ? 'bg-[#EAEDF2] text-[#094cb2] font-semibold border-l-2 border-[#094cb2] pl-2'
                            : 'text-content-muted hover:text-content-main hover:bg-surface-low'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Icon
                            className={`w-3.5 h-3.5 flex-shrink-0 transition-transform group-hover:scale-110 ${
                              isSelected ? 'text-[#094cb2]' : 'text-content-muted opacity-80'
                            }`}
                          />
                          <span className="truncate font-sans">{item.label}</span>
                        </div>

                        {item.link_type === 'URL' && (
                          <ExternalLink className="w-3 h-3 text-content-muted opacity-60 flex-shrink-0" />
                        )}
                        {(item.label === 'Employee' || item.link_to === 'Employee') && (
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EDF3FF] text-[#3E5ECC] border border-[#BFDBFE] ml-auto flex-shrink-0">
                            {totalEmployees || 14}
                          </span>
                        )}
                        {item.link_type === 'Page' && item.label.includes('Organizational') && (
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  </aside>
);
};
