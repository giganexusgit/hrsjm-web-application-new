import { apiClient } from '@/services/apiClient';
import type {
  AdminBroadcastItem,
  CreateBroadcastInput,
  NotificationCategory,
  NotificationItem,
  NotificationPriority,
  NotificationStats,
} from '../types/notifications.types';

const NOTIFICATIONS_STORAGE_KEY = 'hrsjm_admin_notifications_v1';
const BROADCASTS_STORAGE_KEY = 'hrsjm_admin_broadcasts_v1';

function inferCategoryAndPriority(title: string, body: string): { category: NotificationCategory; priority: NotificationPriority } {
  const text = `${title} ${body}`.toLowerCase();
  if (text.includes('donation') || text.includes('contribution') || text.includes('₹') || text.includes('fund')) {
    return { category: 'DONATION', priority: 'HIGH' };
  }
  if (text.includes('grievance') || text.includes('complaint') || text.includes('ticket') || text.includes('urgent')) {
    return { category: 'SUPPORT', priority: 'URGENT' };
  }
  if (text.includes('application') || text.includes('membership') || text.includes('seeker') || text.includes('candidate')) {
    return { category: 'APPLICATION', priority: 'NORMAL' };
  }
  if (text.includes('event') || text.includes('conclave') || text.includes('seminar')) {
    return { category: 'EVENT', priority: 'NORMAL' };
  }
  if (text.includes('security') || text.includes('password') || text.includes('login') || text.includes('alert')) {
    return { category: 'SECURITY', priority: 'HIGH' };
  }
  if (text.includes('announcement') || text.includes('broadcast') || text.includes('circular')) {
    return { category: 'ANNOUNCEMENT', priority: 'NORMAL' };
  }
  return { category: 'SYSTEM', priority: 'NORMAL' };
}

export class NotificationsService {
  private static instance: NotificationsService;

  private constructor() {}

  public static getInstance(): NotificationsService {
    if (!NotificationsService.instance) {
      NotificationsService.instance = new NotificationsService();
    }
    return NotificationsService.instance;
  }

  /**
   * Fetches the current user's live notification inbox from backend GET /notifications/me
   */
  public async fetchMyNotifications(page = 1, limit = 50): Promise<NotificationItem[]> {
    try {
      const res = await apiClient.get<any>('/notifications/me', {
        params: { page, limit },
      });
      const data = (res as any)?.data || res;
      if (Array.isArray(data?.items)) {
        const normalized: NotificationItem[] = data.items.map((it: any) => {
          const title = it.notification?.title || it.title || 'System Notification';
          const body = it.notification?.body || it.body || '';
          const inferred = inferCategoryAndPriority(title, body);
          return {
            recipient_id: it.recipient_id || it.id || `rec-${Date.now()}-${Math.random()}`,
            is_read: Boolean(it.is_read || it.read_at),
            read_at: it.read_at || null,
            created_at: it.created_at || new Date().toISOString(),
            notification: {
              id: it.notification?.id || it.id || `notif-${Date.now()}`,
              title,
              body,
              target_audience: it.notification?.target_audience || 'ALL_USERS',
              sent_at: it.notification?.sent_at || it.created_at || new Date().toISOString(),
              category: it.notification?.category || inferred.category,
              priority: it.notification?.priority || inferred.priority,
              deepLinkUrl: it.notification?.deepLinkUrl,
              actionLabel: it.notification?.actionLabel,
            },
          };
        });

        this.saveNotifications(normalized);
        return normalized;
      }
    } catch (err) {
      console.warn('Could not fetch notifications from /notifications/me:', err);
    }
    return this.getNotifications();
  }

  /**
   * Marks a single notification as read on the backend PATCH /notifications/recipients/:recipientId/read
   */
  public async markReadApi(recipientId: string): Promise<NotificationItem[]> {
    try {
      await apiClient.patch(`/notifications/recipients/${encodeURIComponent(recipientId)}/read`);
    } catch (err) {
      console.warn('Backend markReadApi call failed:', err);
    }
    return this.markRead(recipientId);
  }

  /**
   * Marks all notifications as read on the backend PATCH /notifications/me/read-all
   */
  public async markAllReadApi(): Promise<NotificationItem[]> {
    try {
      await apiClient.patch('/notifications/me/read-all');
    } catch (err) {
      console.warn('Backend markAllReadApi call failed:', err);
    }
    return this.markAllRead();
  }

  public getNotifications(): NotificationItem[] {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }

  public saveNotifications(items: NotificationItem[]): void {
    try {
      localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  public getBroadcasts(): AdminBroadcastItem[] {
    try {
      const stored = localStorage.getItem(BROADCASTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // ignore
    }
    return [];
  }

  public saveBroadcasts(items: AdminBroadcastItem[]): void {
    try {
      localStorage.setItem(BROADCASTS_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }

  public getUnreadCount(): number {
    const items = this.getNotifications();
    return items.filter((n) => !n.is_read).length;
  }

  public markRead(recipientId: string): NotificationItem[] {
    const items = this.getNotifications();
    const updated = items.map((item) => {
      if (item.recipient_id === recipientId) {
        return {
          ...item,
          is_read: true,
          read_at: new Date().toISOString(),
        };
      }
      return item;
    });
    this.saveNotifications(updated);
    return updated;
  }

  public markAllRead(): NotificationItem[] {
    const items = this.getNotifications();
    const updated = items.map((item) => ({
      ...item,
      is_read: true,
      read_at: item.read_at || new Date().toISOString(),
    }));
    this.saveNotifications(updated);
    return updated;
  }

  public deleteNotification(recipientId: string): NotificationItem[] {
    const items = this.getNotifications();
    const updated = items.filter((item) => item.recipient_id !== recipientId);
    this.saveNotifications(updated);
    return updated;
  }

  public createBroadcast(input: CreateBroadcastInput): { broadcast: AdminBroadcastItem; notifications: NotificationItem[] } {
    const broadcasts = this.getBroadcasts();
    const isScheduled = Boolean(input.scheduled_at && new Date(input.scheduled_at) > new Date());

    const newBroadcast: AdminBroadcastItem = {
      id: `bc-${String(broadcasts.length + 1).padStart(3, '0')}`,
      title: input.title.trim(),
      body: input.body.trim(),
      target_audience: input.target_audience,
      status: isScheduled ? 'SCHEDULED' : 'SENT',
      created_at: new Date().toISOString(),
      sent_at: isScheduled ? null : new Date().toISOString(),
      scheduled_at: input.scheduled_at || null,
      category: input.category,
      priority: input.priority,
      total_recipients:
        input.target_audience === 'ALL_USERS'
          ? 8450
          : input.target_audience === 'MEMBERS'
          ? 1240
          : input.target_audience === 'DONORS'
          ? 430
          : 150,
      read_count: 0,
      recipient_user_ids: input.recipient_user_ids,
    };

    const updatedBroadcasts = [newBroadcast, ...broadcasts];
    this.saveBroadcasts(updatedBroadcasts);

    // Also push notification to backend API if available
    try {
      apiClient.post('/notifications', {
        title: input.title.trim(),
        body: input.body.trim(),
        target_audience: input.target_audience,
        category: input.category,
        priority: input.priority,
        scheduled_at: input.scheduled_at || undefined,
      }).catch((err) => {
        console.warn('Backend push notification dispatch warning:', err);
      });
    } catch {
      // ignore
    }

    // If sent immediately, also push to current admin notifications inbox
    const notifications = this.getNotifications();
    let updatedNotifications = notifications;
    if (!isScheduled) {
      const inboxEntry: NotificationItem = {
        recipient_id: `rec-${Date.now()}`,
        is_read: false,
        read_at: null,
        created_at: new Date().toISOString(),
        notification: {
          id: newBroadcast.id,
          title: newBroadcast.title,
          body: newBroadcast.body,
          target_audience: newBroadcast.target_audience,
          sent_at: newBroadcast.sent_at,
          category: newBroadcast.category,
          priority: newBroadcast.priority,
        },
      };
      updatedNotifications = [inboxEntry, ...notifications];
      this.saveNotifications(updatedNotifications);
    }

    return { broadcast: newBroadcast, notifications: updatedNotifications };
  }

  public getStats(): NotificationStats {
    const items = this.getNotifications();
    const broadcasts = this.getBroadcasts();
    const unread = items.filter((n) => !n.is_read).length;
    const highPriority = items.filter((n) => n.notification.priority === 'URGENT' || n.notification.priority === 'HIGH').length;
    const broadcastsSent = broadcasts.filter((b) => b.status === 'SENT').length;

    return {
      total: items.length,
      unread,
      highPriority,
      broadcastsSent,
    };
  }
}

export const notificationsService = NotificationsService.getInstance();

