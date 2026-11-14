import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Heart,
  Scale,
  CreditCard,
  ShieldAlert,
  ArrowRight,
  Loader2,
  Search,
  X,
  Clock,
  Megaphone,
  CheckCheck,
  ExternalLink,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { notificationsService } from '../../admin/notifications/services/notificationsService';
import type { NotificationItem } from '../../admin/notifications/types/notifications.types';
import { filterBroadcastsForRole } from '@/features/content';
import { useUserAuth } from '../store/userAuthStore';

type FilterType = 'ALL' | 'UNREAD' | 'ANNOUNCEMENT' | 'EVENT' | 'DONATION' | 'APPLICATION' | 'SUPPORT';

export const UserNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUnreadNotificationsCount } = useUserAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<FilterType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);

  useEffect(() => {
    let isMounted = true;
    const loadLiveNotifications = async () => {
      try {
        const liveItems = await notificationsService.fetchMyNotifications();
        if (isMounted) {
          const rawBroadcasts = notificationsService.getBroadcasts() || [];
          const authorizedBroadcasts = filterBroadcastsForRole(rawBroadcasts, 'USER');
          const mappedBroadcasts: NotificationItem[] = authorizedBroadcasts.map((b) => ({
            recipient_id: `bc-${b.id}`,
            is_read: false,
            read_at: null,
            created_at: b.created_at,
            notification: {
              id: b.id,
              title: b.title,
              body: b.body,
              target_audience: b.target_audience,
              sent_at: b.sent_at,
              category: b.category,
              priority: b.priority,
              deepLinkUrl: b.category === 'EVENT' ? '/events' : b.category === 'DONATION' ? '/donations' : '/user/notifications',
              actionLabel: b.category === 'EVENT' ? 'View Conclave Details' : b.category === 'DONATION' ? 'View Tax Summary' : 'View Update',
            },
          }));

          // Deduplicate items
          const combined = [...mappedBroadcasts, ...liveItems];
          const seen = new Set();
          const unique = combined.filter((item) => {
            const key = item.notification.id || item.recipient_id;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          setNotifications(unique);
          setLoading(false);
        }
      } catch {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadLiveNotifications();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const unread = notifications.filter((n) => !n.is_read).length;
    setUnreadNotificationsCount(unread);
  }, [notifications, setUnreadNotificationsCount]);

  const handleMarkAllRead = async () => {
    const updated = notifications.map((n) => ({
      ...n,
      is_read: true,
      read_at: new Date().toISOString(),
    }));
    setNotifications(updated);
    await notificationsService.markAllReadApi();
  };

  const handleClearAll = async () => {
    setNotifications([]);
    setUnreadNotificationsCount(0);
    await notificationsService.markAllReadApi();
  };

  const handleToggleItemRead = async (e: React.MouseEvent, item: NotificationItem) => {
    e.stopPropagation();
    const willBeRead = !item.is_read;
    const updated = notifications.map((n) =>
      (n.notification.id === item.notification.id || n.recipient_id === item.recipient_id)
        ? { ...n, is_read: willBeRead, read_at: willBeRead ? new Date().toISOString() : null }
        : n
    );
    setNotifications(updated);
    if (willBeRead) {
      await notificationsService.markReadApi(item.recipient_id);
    }
  };

  const resolveUserDeepLink = (url?: string, category?: string) => {
    if (!url) {
      if (category === 'EVENT') return '/events';
      if (category === 'DONATION') return '/donations';
      if (category === 'APPLICATION') return '/membership';
      if (category === 'SUPPORT') return '/support';
      return undefined;
    }
    // Translate admin routes to user portal routes
    if (url.startsWith('/admin/support') || url.startsWith('/admin/complaints')) return '/support';
    if (url.startsWith('/admin/membership') || url.startsWith('/admin/applications')) return '/membership';
    if (url.startsWith('/admin/donations') || url.startsWith('/admin/receipts') || url.startsWith('/admin/accounting')) return '/user/transactions';
    if (url.startsWith('/admin/events')) return '/events';
    if (url.startsWith('/admin/rights')) return '/rights';
    if (url.startsWith('/admin/news')) return '/news';
    if (url.startsWith('/admin/blogs')) return '/blogs';
    if (url.startsWith('/admin/profile')) return '/user/profile';
    return url;
  };

  const handleItemClick = async (item: NotificationItem) => {
    // mark item as read if unread
    if (!item.is_read) {
      const updated = notifications.map((n) =>
        (n.notification.id === item.notification.id || n.recipient_id === item.recipient_id)
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      );
      setNotifications(updated);
      await notificationsService.markReadApi(item.recipient_id);
    }
    // Open details modal
    setSelectedNotification(item);
  };

  const handleNavigateDeepLink = (e: React.MouseEvent, item: NotificationItem) => {
    e.stopPropagation();
    if (!item.is_read) {
      const updated = notifications.map((n) =>
        (n.notification.id === item.notification.id || n.recipient_id === item.recipient_id)
          ? { ...n, is_read: true, read_at: new Date().toISOString() }
          : n
      );
      setNotifications(updated);
      notificationsService.markReadApi(item.recipient_id);
    }
    const targetUrl = resolveUserDeepLink(item.notification.deepLinkUrl, item.notification.category);
    if (targetUrl) {
      navigate(targetUrl);
    }
  };

  const formatNotificationDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24 && date.toDateString() === now.toDateString()) {
      return `Today • ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    if (diffDays === 1) {
      return `Yesterday • ${date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
    }
    if (diffDays < 7) {
      return `${diffDays} days ago`;
    }
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCategoryTheme = (category?: string) => {
    const cat = (category || 'ANNOUNCEMENT').toUpperCase();
    switch (cat) {
      case 'DONATION':
        return {
          label: 'Cause & Donation',
          badge: 'bg-[#FFF9E6] text-[#9A7410] border-[#FAD465]/70',
          iconBox: 'bg-[#FFF9E6] text-[#C9971A] border-[#FAD465]/50',
          icon: <Heart size={16} className="text-[#C9971A]" />,
        };
      case 'APPLICATION':
      case 'MEMBERSHIP':
        return {
          label: 'Membership & Review',
          badge: 'bg-sky-50 text-sky-800 border-sky-200',
          iconBox: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <CreditCard size={16} className="text-sky-700" />,
        };
      case 'EVENT':
        return {
          label: 'Conclave & Event',
          badge: 'bg-blue-50 text-[#06294D] border-blue-200',
          iconBox: 'bg-blue-50 text-[#06294D] border-blue-200',
          icon: <Calendar size={16} className="text-[#06294D]" />,
        };
      case 'SUPPORT':
      case 'GRIEVANCE':
        return {
          label: 'Support & Legal Desk',
          badge: 'bg-rose-50 text-rose-800 border-rose-200',
          iconBox: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: <Scale size={16} className="text-rose-700" />,
        };
      case 'SYSTEM':
      case 'SECURITY':
        return {
          label: 'System & Security',
          badge: 'bg-slate-100 text-slate-700 border-slate-200',
          iconBox: 'bg-slate-100 text-slate-600 border-slate-200',
          icon: <ShieldAlert size={16} className="text-slate-600" />,
        };
      default:
        return {
          label: 'Official Announcement',
          badge: 'bg-[#EDF2F7] text-[#174A78] border-[#DBE5EE]',
          iconBox: 'bg-[#EDF2F7] text-[#06294D] border-[#DBE5EE]',
          icon: <Megaphone size={16} className="text-[#06294D]" />,
        };
    }
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  // Filtered & Searched List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((item) => {
      // Type filter
      if (filter === 'UNREAD' && item.is_read) return false;
      if (filter !== 'ALL' && filter !== 'UNREAD') {
        const cat = (item.notification.category || 'ANNOUNCEMENT').toUpperCase();
        if (filter === 'ANNOUNCEMENT' && cat !== 'ANNOUNCEMENT' && cat !== 'SYSTEM' && cat !== 'SECURITY') return false;
        if (filter === 'EVENT' && cat !== 'EVENT') return false;
        if (filter === 'DONATION' && cat !== 'DONATION') return false;
        if (filter === 'APPLICATION' && cat !== 'APPLICATION' && cat !== 'MEMBERSHIP') return false;
        if (filter === 'SUPPORT' && cat !== 'SUPPORT' && cat !== 'GRIEVANCE') return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const titleMatch = item.notification.title.toLowerCase().includes(q);
        const bodyMatch = item.notification.body.toLowerCase().includes(q);
        const catMatch = (item.notification.category || '').toLowerCase().includes(q);
        return titleMatch || bodyMatch || catMatch;
      }

      return true;
    });
  }, [notifications, filter, searchQuery]);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Editorial Hero Header Banner */}
      <div className="rounded-2xl border border-[#123F68] bg-gradient-to-r from-[#06294D] via-[#0B2F52] to-[#123F68] text-white p-6 sm:p-7 shadow-sm relative overflow-hidden">
        {/* Subtle decorative glow watermark */}
        <div className="absolute -right-12 -bottom-12 w-56 h-56 rounded-full bg-[#FAD465]/5 blur-3xl pointer-events-none" />
        <div className="absolute right-6 top-6 opacity-10 pointer-events-none hidden sm:block">
          <Bell size={110} />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#FAD465] text-[11px] font-bold tracking-wider uppercase">
              <Sparkles size={12} className="text-[#FAD465]" />
              <span>Official Activity & Alerts Stream</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold font-['Playfair_Display',Georgia,serif] text-white tracking-tight">
              Notifications & Announcements
            </h1>
            <p className="text-xs sm:text-sm text-[#DBE5EE] leading-relaxed">
              Real-time updates regarding your membership applications, filed grievances, humanitarian relief drives, and national conclave passes.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-stretch sm:self-auto justify-end">
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="px-4 py-2.5 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] text-[#06294D] text-xs font-bold transition-all duration-150 shadow-xs flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
              >
                <CheckCheck size={15} />
                <span>Mark All as Read ({unreadCount})</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-white/10 border border-white/15 text-xs font-medium text-emerald-300 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>All caught up!</span>
              </div>
            )}

            {notifications.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="px-3.5 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-rose-200 text-xs font-bold transition-all duration-150 shadow-xs flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
                title="Delete all notifications in 1 click"
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Control Toolbar: Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl border border-[#DCE4EC] p-3 sm:p-4 shadow-xs space-y-3">
        {/* Search Input Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#718096]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notifications, references, announcements..."
              className="w-full pl-9 pr-9 py-2 rounded-xl border border-[#DCE4EC] bg-[#FAF7F0]/40 text-xs sm:text-sm text-[#0B2F52] placeholder-[#718096] focus:outline-none focus:border-[#06294D] focus:bg-white transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider pl-1 hidden md:inline">
              Filter:
            </span>
            <button
              type="button"
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                filter === 'ALL'
                  ? 'bg-[#06294D] text-[#FAD465] shadow-xs'
                  : 'bg-[#EDF2F7] text-[#34516D] hover:bg-[#DBE5EE]'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('UNREAD')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                filter === 'UNREAD'
                  ? 'bg-[#06294D] text-[#FAD465] shadow-xs'
                  : 'bg-[#EDF2F7] text-[#34516D] hover:bg-[#DBE5EE]'
              }`}
            >
              <span>Unread</span>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-[#DC2626] text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Category Pills Strip */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-[#718096] uppercase tracking-wider pl-1 shrink-0">
            Category:
          </span>
          {[
            { id: 'ALL', label: 'All Categories' },
            { id: 'ANNOUNCEMENT', label: 'Announcements' },
            { id: 'EVENT', label: 'Events' },
            { id: 'DONATION', label: 'Donations' },
            { id: 'APPLICATION', label: 'Membership' },
            { id: 'SUPPORT', label: 'Support & Grievances' },
          ].map((catTab) => {
            const isSelected = filter === catTab.id;
            return (
              <button
                key={catTab.id}
                type="button"
                onClick={() => setFilter(catTab.id as FilterType)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-[#06294D] text-white font-semibold'
                    : 'text-[#718096] hover:text-[#06294D] hover:bg-slate-100'
                }`}
              >
                {catTab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notification Stream List */}
      {loading ? (
        <div className="p-14 text-center bg-white rounded-2xl border border-[#DCE4EC] text-[#718096] flex flex-col items-center justify-center space-y-2">
          <Loader2 size={32} className="animate-spin text-[#06294D]" />
          <p className="text-sm font-semibold text-[#0B2F52]">Loading notifications...</p>
          <p className="text-xs text-[#718096]">Retrieving your secure alerts from the registry.</p>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="p-14 text-center bg-white rounded-2xl border border-[#DCE4EC] text-[#718096] space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#FAF7F0] border border-[#DCE4EC] flex items-center justify-center mx-auto text-[#06294D]">
            <Bell size={22} className="text-slate-400" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#0B2F52]">No notifications found</h3>
            <p className="text-xs text-[#718096] max-w-sm mx-auto">
              {searchQuery
                ? `No notifications matched your search "${searchQuery}". Try a different keyword or reset filters.`
                : filter === 'UNREAD'
                ? 'You have read all your alerts! No unread notifications remaining.'
                : 'There are currently no alerts or bulletins under this category.'}
            </p>
          </div>
          {(searchQuery || filter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setFilter('ALL');
              }}
              className="px-3.5 py-1.5 rounded-xl border border-[#DCE4EC] bg-[#FAF7F0] hover:bg-slate-100 text-xs font-semibold text-[#06294D] transition cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifications.map((item) => {
            const theme = getCategoryTheme(item.notification.category);
            const deepLink = resolveUserDeepLink(item.notification.deepLinkUrl, item.notification.category);

            return (
              <div
                key={item.notification.id || item.recipient_id}
                onClick={() => handleItemClick(item)}
                className={`group rounded-xl border transition-all duration-200 cursor-pointer p-4 sm:p-5 relative ${
                  !item.is_read
                    ? 'bg-white border-l-4 border-l-[#06294D] border-t-[#DCE4EC] border-r-[#DCE4EC] border-b-[#DCE4EC] shadow-xs hover:shadow-md'
                    : 'bg-[#FAF7F0]/40 hover:bg-white border-[#E2E8F0] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-start gap-3.5 sm:gap-4">
                  {/* Category Themed Icon Box */}
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${theme.iconBox}`}
                  >
                    {theme.icon}
                  </div>

                  {/* Main Content Area */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    {/* Top Row: Category Badge, Unread Dot, Timestamp */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${theme.badge}`}
                        >
                          {item.notification.category || 'ANNOUNCEMENT'}
                        </span>

                        {!item.is_read && (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold uppercase bg-red-100 text-red-700 border border-red-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-600 inline-block" />
                            New
                          </span>
                        )}

                        {item.notification.priority === 'URGENT' && (
                          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold uppercase bg-amber-100 text-amber-800 border border-amber-200">
                            Urgent
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[#718096] text-[11px]">
                        <Clock size={12} className="text-slate-400" />
                        <span>{formatNotificationDate(item.created_at)}</span>
                      </div>
                    </div>

                    {/* Headline */}
                    <h3
                      className={`text-sm sm:text-base font-semibold leading-snug transition-colors ${
                        !item.is_read
                          ? 'text-[#0B2F52] group-hover:text-[#06294D]'
                          : 'text-slate-700 group-hover:text-[#0B2F52]'
                      }`}
                    >
                      {item.notification.title}
                    </h3>

                    {/* Body Text */}
                    <p className="text-xs sm:text-sm text-[#34516D] leading-relaxed line-clamp-2">
                      {item.notification.body}
                    </p>

                    {/* Bottom Action Footer (if deepLink or actionLabel exists) */}
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100/80">
                      {deepLink ? (
                        <button
                          type="button"
                          onClick={(e) => handleNavigateDeepLink(e, item)}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#06294D] hover:text-[#C9971A] group/btn transition cursor-pointer"
                        >
                          <span>{item.notification.actionLabel || 'View Full Record'}</span>
                          <ArrowRight size={13} className="transition-transform group-hover/btn:translate-x-0.5" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#718096]">General Secretariat Directive</span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleToggleItemRead(e, item)}
                          title={item.is_read ? 'Mark as Unread' : 'Mark as Read'}
                          className="p-1 rounded-lg text-slate-400 hover:text-[#06294D] hover:bg-slate-100 transition cursor-pointer text-[11px] flex items-center gap-1"
                        >
                          <CheckCircle2 size={13} className={item.is_read ? 'text-emerald-600' : 'text-slate-400'} />
                          <span className="hidden sm:inline">{item.is_read ? 'Mark Unread' : 'Mark Read'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detailed Modal for Full Notification Inspection */}
      {selectedNotification && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-[#031B31]/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedNotification(null)}
        >
          <div
            className="bg-white rounded-2xl border border-[#DCE4EC] max-w-lg w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-[#06294D] text-white p-5 flex items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#FAD465] text-[10px] font-bold uppercase tracking-wider">
                  <Bell size={11} />
                  <span>{selectedNotification.notification.category || 'NOTICE'}</span>
                </div>
                <h3 className="text-lg font-bold font-['Playfair_Display',Georgia,serif] text-white leading-snug">
                  {selectedNotification.notification.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedNotification(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center shrink-0 transition cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-[#718096] pb-3 border-b border-slate-100">
                <div className="flex items-center gap-1.5">
                  <Clock size={13} />
                  <span>
                    {new Date(selectedNotification.created_at).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </span>
                </div>
                <span className="font-semibold text-[#06294D]">
                  Priority: {selectedNotification.notification.priority || 'NORMAL'}
                </span>
              </div>

              <div className="text-sm text-[#34516D] leading-relaxed whitespace-pre-wrap">
                {selectedNotification.notification.body}
              </div>

              {/* Modal Footer Controls */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 rounded-xl border border-[#DCE4EC] hover:bg-slate-50 text-xs font-semibold text-[#34516D] transition cursor-pointer"
                >
                  Close
                </button>
                {resolveUserDeepLink(
                  selectedNotification.notification.deepLinkUrl,
                  selectedNotification.notification.category
                ) && (
                  <button
                    type="button"
                    onClick={(e) => handleNavigateDeepLink(e, selectedNotification)}
                    className="px-4 py-2 rounded-xl bg-[#06294D] hover:bg-[#123F68] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>{selectedNotification.notification.actionLabel || 'Proceed to Section'}</span>
                    <ExternalLink size={13} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
