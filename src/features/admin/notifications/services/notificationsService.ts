import { apiClient } from '@/services/apiClient';
import type {
  AdminBroadcastItem,
  CreateBroadcastInput,
  NotificationItem,
  NotificationStats,
} from '../types/notifications.types';

const NOTIFICATIONS_STORAGE_KEY = 'hrsjm_admin_notifications_v1';
const BROADCASTS_STORAGE_KEY = 'hrsjm_admin_broadcasts_v1';

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
        this.saveNotifications(data.items);
        return data.items;
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

