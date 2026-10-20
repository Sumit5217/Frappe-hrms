import React, { useState } from 'react';
import {
  Bell,
  X,
  AlertTriangle,
  Mail,
  UserCheck,
  Zap,
} from 'lucide-react';
import { ZohoNotification } from '../types';

export interface ZohoNotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: ZohoNotification[];
  onOpenTicket: (notif: ZohoNotification) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  containerRef?: any;
}

export const ZohoNotificationPopover: React.FC<ZohoNotificationPopoverProps> = ({
  isOpen,
  onClose,
  notifications,
  onOpenTicket,
  markAllAsRead,
  clearAll,
  containerRef,
}) => {
  const [notificationTab, setNotificationTab] = useState<'all' | 'unread' | 'sla'>('all');

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div
      ref={containerRef}
      className="absolute right-0 top-9 w-88 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 text-xs text-gray-800 overflow-hidden animate-fadeIn"
    >
      <div className="p-3 bg-[#1A2232] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-sm">Notifications & Radar</span>
          <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
            {unreadCount} new
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllAsRead}
            className="text-[11px] text-blue-300 hover:text-white underline cursor-pointer"
            title="Mark all as read"
          >
            Read all
          </button>
          <X
            className="w-4 h-4 cursor-pointer text-gray-400 hover:text-white"
            onClick={onClose}
          />
        </div>
      </div>

      {/* Filter Tabs inside Notifications */}
      <div className="flex items-center border-b border-gray-200 bg-gray-50 px-3 text-[11px] font-bold text-gray-600">
        <button
          onClick={() => setNotificationTab('all')}
          className={`py-2 px-2 border-b-2 cursor-pointer ${
            notificationTab === 'all' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
        >
          All ({notifications.length})
        </button>
        <button
          onClick={() => setNotificationTab('unread')}
          className={`py-2 px-2 border-b-2 cursor-pointer ${
            notificationTab === 'unread' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
        >
          Unread ({unreadCount})
        </button>
        <button
          onClick={() => setNotificationTab('sla')}
          className={`py-2 px-2 border-b-2 cursor-pointer ${
            notificationTab === 'sla' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500'
          }`}
        >
          SLA Radar ({notifications.filter((n) => n.type === 'sla').length})
        </button>
      </div>

      {/* Notifications List */}
      <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
        {notifications
          .filter((n) => {
            if (notificationTab === 'unread') return !n.read;
            if (notificationTab === 'sla') return n.type === 'sla';
            return true;
          })
          .map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                onOpenTicket(notif);
                onClose();
              }}
              className={`p-3 hover:bg-blue-50/60 cursor-pointer transition-colors flex items-start gap-3 ${
                !notif.read ? 'bg-blue-50/20' : ''
              }`}
            >
              <div className="mt-0.5 shrink-0">
                {notif.type === 'sla' && (
                  <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs shadow-2xs">
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </span>
                )}
                {notif.type === 'reply' && (
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shadow-2xs">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                )}
                {notif.type === 'assignment' && (
                  <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs shadow-2xs">
                    <UserCheck className="w-3.5 h-3.5" />
                  </span>
                )}
                {notif.type === 'system' && (
                  <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs shadow-2xs">
                    <Zap className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-900 truncate pr-1">{notif.title}</span>
                  <span className="text-[10px] text-gray-400 shrink-0">{notif.time}</span>
                </div>
                <div className="font-semibold text-blue-600 text-[11px] truncate mt-0.5">
                  {notif.ticketId} · {notif.ticketName}
                </div>
                <p className="text-gray-500 text-[11px] mt-0.5 leading-tight line-clamp-2">
                  {notif.message}
                </p>
              </div>

              {!notif.read && (
                <span className="w-2 h-2 rounded-full bg-blue-600 mt-2 shrink-0"></span>
              )}
            </div>
          ))}

        {notifications.length === 0 && (
          <div className="py-8 text-center text-gray-400">
            <Bell className="w-6 h-6 mx-auto mb-1 opacity-40" />
            <p className="text-xs">No active notifications</p>
          </div>
        )}
      </div>

      <div className="p-2.5 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
        <span>Showing real-time support radar</span>
        <button
          onClick={clearAll}
          className="hover:text-rose-600 font-semibold cursor-pointer"
        >
          Clear all
        </button>
      </div>
    </div>
  );
};

export default ZohoNotificationPopover;
