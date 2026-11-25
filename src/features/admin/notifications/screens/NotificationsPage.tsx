import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Radio, RefreshCw, Bell, BellRing } from 'lucide-react';
import { useNotificationsStore } from '../store/notificationsStore';
import { NotificationsStatsCards } from '../components/NotificationsStatsCards';
import {
  NotificationsFilterTabs,
  type MainTabType,
  type InboxSubTab,
} from '../components/NotificationsFilterTabs';
import { NotificationsSearchBar } from '../components/NotificationsSearchBar';
import { NotificationRow } from '../components/NotificationRow';
import { NotificationDetailsModal } from '../components/NotificationDetailsModal';
import { CreateBroadcastModal } from '../components/CreateBroadcastModal';
import { BroadcastsTable } from '../components/BroadcastsTable';
import type { NotificationItem } from '../types/notifications.types';

export const NotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notifications,
    broadcasts,
    unreadCount,
    stats,
    markRead,
    markAllRead,
    deleteNotification,
    createBroadcast,
  } = useNotificationsStore();

  const [mainTab, setMainTab] = useState<MainTabType>('INBOX');
  const [inboxTab, setInboxTab] = useState<InboxSubTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');

  // Modals state
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [createBroadcastOpen, setCreateBroadcastOpen] = useState(false);

  // Filter inbox notifications based on active tab, search query, priority
  const filteredNotifications = notifications.filter((item) => {
    // 1. Sub-tab filter
    if (inboxTab === 'UNREAD' && item.is_read) return false;
    if (inboxTab === 'APPLICATIONS' && item.notification.category !== 'APPLICATION') return false;
    if (inboxTab === 'SUPPORT' && item.notification.category !== 'SUPPORT') return false;
    if (inboxTab === 'FINANCE' && item.notification.category !== 'DONATION') return false;

    // 2. Priority filter
    if (priorityFilter !== 'ALL' && item.notification.priority !== priorityFilter) return false;

    // 3. Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.notification.title.toLowerCase().includes(q);
      const bodyMatch = item.notification.body.toLowerCase().includes(q);
      if (!titleMatch && !bodyMatch) return false;
    }

    return true;
  });

  const handleOpenNotification = (item: NotificationItem) => {
    // Mark as read automatically
    markRead(item.recipient_id);
    setSelectedNotification(item);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header & Breadcrumb */}
      <div className="space-y-2">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <button
            type="button"
            onClick={() => navigate('/admin/dashboard')}
            className="hover:text-[#011F39] font-medium transition-colors cursor-pointer"
          >
            Dashboard
          </button>
          <ChevronRight size={13} className="text-slate-400" />
          <span className="text-slate-900 font-semibold">Notifications & Announcements</span>
        </div>

        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FFF9E6] text-[#011F39] border border-[#FDE68A] mb-2 tracking-wide uppercase">
              <Bell size={12} className="text-[#B45309]" />
              <span>Central Dispatch & System Notifications</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#011F39]">
              Notifications & Announcements
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Monitor real-time system alerts, member applications, grievance tickets, and broadcast central circulars.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <button
              type="button"
              onClick={() => setCreateBroadcastOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#011F39] hover:bg-[#022c50] text-[#FAD465] shadow-xs transition-colors cursor-pointer"
            >
              <BellRing size={15} strokeWidth={2.5} />
              <span>Push Notification</span>
            </button>
            <button
              type="button"
              onClick={() => setCreateBroadcastOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold bg-[#FAD465] hover:bg-[#e9bf36] text-[#011F39] shadow-xs transition-colors cursor-pointer"
            >
              <Radio size={15} strokeWidth={2.5} />
              <span>Broadcast Announcement</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards (Balanced 4-column grid) */}
      <NotificationsStatsCards stats={stats} />

      {/* Module Navigation Tabs */}
      <NotificationsFilterTabs
        mainTab={mainTab}
        onSelectMainTab={setMainTab}
        inboxTab={inboxTab}
        onSelectInboxTab={setInboxTab}
        unreadCount={unreadCount}
      />

      {/* Search Bar & Actions */}
      <NotificationsSearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        onMarkAllRead={markAllRead}
        unreadCount={unreadCount}
        isBroadcastView={mainTab === 'BROADCASTS'}
        totalFilteredCount={
          mainTab === 'INBOX' ? filteredNotifications.length : broadcasts.length
        }
      />

      {/* Main View Area */}
      {mainTab === 'INBOX' ? (
        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                <RefreshCw size={28} className="text-slate-400" />
              </div>
              <h4 className="font-serif font-bold text-lg text-slate-800 mb-1">
                {inboxTab === 'UNREAD' ? 'You are all caught up!' : 'No Notifications Found'}
              </h4>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                {inboxTab === 'UNREAD'
                  ? 'There are no pending unread notifications in your inbox.'
                  : 'No alerts match your current filter criteria.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((item) => (
              <NotificationRow
                key={item.recipient_id}
                item={item}
                onOpen={handleOpenNotification}
                onDelete={deleteNotification}
              />
            ))
          )}
        </div>
      ) : (
        <BroadcastsTable
          broadcasts={broadcasts}
          searchQuery={searchQuery}
        />
      )}

      {/* Notification Details Modal */}
      <NotificationDetailsModal
        item={selectedNotification}
        onClose={() => setSelectedNotification(null)}
      />

      {/* Create Broadcast Modal */}
      <CreateBroadcastModal
        isOpen={createBroadcastOpen}
        onClose={() => setCreateBroadcastOpen(false)}
        onSubmit={createBroadcast}
      />
    </div>
  );
};
