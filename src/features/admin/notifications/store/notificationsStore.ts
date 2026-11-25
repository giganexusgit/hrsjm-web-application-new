import { useSyncExternalStore } from 'react';
import type {
  AdminBroadcastItem,
  CreateBroadcastInput,
  NotificationItem,
  NotificationStats,
} from '../types/notifications.types';
import { notificationsService } from '../services/notificationsService';
import { pushNotificationService } from '../services/pushNotificationService';

interface NotificationsStoreState {
  notifications: NotificationItem[];
  broadcasts: AdminBroadcastItem[];
  unreadCount: number;
  stats: NotificationStats;
  isRefreshing: boolean;
}

class NotificationsStore {
  private state: NotificationsStoreState;
  private listeners = new Set<() => void>();
  private pollTimer: any = null;
  private knownNotificationIds = new Set<string>();

  constructor() {
    const notifications = notificationsService.getNotifications();
    const broadcasts = notificationsService.getBroadcasts();
    const stats = notificationsService.getStats();

    notifications.forEach((n) => this.knownNotificationIds.add(n.recipient_id));

    this.state = {
      notifications,
      broadcasts,
      unreadCount: stats.unread,
      stats,
      isRefreshing: false,
    };

    // Auto-fetch and start polling in browser if authenticated
    if (typeof window !== 'undefined') {
      setTimeout(() => {
        this.refreshLiveNotifications(true);
        this.startPolling(30000);
      }, 1000);
    }
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public getSnapshot = (): NotificationsStoreState => {
    return this.state;
  };

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public startPolling(intervalMs = 30000): void {
    if (typeof window === 'undefined') return;
    if (this.pollTimer) clearInterval(this.pollTimer);

    this.pollTimer = setInterval(() => {
      const token = localStorage.getItem('hrsjm_auth_token') || localStorage.getItem('auth_token');
      if (token) {
        this.refreshLiveNotifications(false);
      }
    }, intervalMs);
  }

  public stopPolling(): void {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
    }
  }

  public refreshLiveNotifications = async (isInitial = false): Promise<void> => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('hrsjm_auth_token') || localStorage.getItem('auth_token')
      : null;

    if (!token) return;

    this.state = { ...this.state, isRefreshing: true };
    this.notify();

    try {
      const liveItems = await notificationsService.fetchMyNotifications();
      const broadcasts = notificationsService.getBroadcasts();
      const stats = notificationsService.getStats();

      // Check for newly arrived unread notifications
      if (!isInitial) {
        const newlyArrived = liveItems.filter(
          (item) => !item.is_read && !this.knownNotificationIds.has(item.recipient_id)
        );

        if (newlyArrived.length > 0) {
          const newest = newlyArrived[0];
          pushNotificationService.showNotification(newest.notification.title, {
            body: newest.notification.body,
            tag: newest.recipient_id,
            data: { url: '/admin/notifications' },
          });
        }
      }

      // Update known ids
      liveItems.forEach((n) => this.knownNotificationIds.add(n.recipient_id));

      this.state = {
        notifications: liveItems,
        broadcasts,
        unreadCount: stats.unread,
        stats,
        isRefreshing: false,
      };
    } catch (err) {
      console.warn('Failed to refresh live notifications:', err);
      this.state = { ...this.state, isRefreshing: false };
    } finally {
      this.notify();
    }
  };

  public markRead = async (recipientId: string): Promise<void> => {
    await notificationsService.markReadApi(recipientId);
    const updated = notificationsService.getNotifications();
    const stats = notificationsService.getStats();
    this.state = {
      ...this.state,
      notifications: updated,
      unreadCount: stats.unread,
      stats,
    };
    this.notify();
  };

  public markAllRead = async (): Promise<void> => {
    await notificationsService.markAllReadApi();
    const updated = notificationsService.getNotifications();
    const stats = notificationsService.getStats();
    this.state = {
      ...this.state,
      notifications: updated,
      unreadCount: stats.unread,
      stats,
    };
    this.notify();
  };

  public deleteNotification = (recipientId: string): void => {
    const updated = notificationsService.deleteNotification(recipientId);
    const stats = notificationsService.getStats();
    this.state = {
      ...this.state,
      notifications: updated,
      unreadCount: stats.unread,
      stats,
    };
    this.notify();
  };

  public createBroadcast = (input: CreateBroadcastInput): void => {
    const { broadcast, notifications } = notificationsService.createBroadcast(input);
    const broadcasts = [broadcast, ...this.state.broadcasts];
    const stats = notificationsService.getStats();
    this.state = {
      ...this.state,
      notifications,
      broadcasts,
      unreadCount: stats.unread,
      stats,
    };
    this.notify();
  };
}

export const notificationsStore = new NotificationsStore();

export function useNotificationsStore(): NotificationsStoreState & {
  markRead: (recipientId: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  deleteNotification: (recipientId: string) => void;
  createBroadcast: (input: CreateBroadcastInput) => void;
  refreshLiveNotifications: () => Promise<void>;
} {
  const state = useSyncExternalStore(
    notificationsStore.subscribe,
    notificationsStore.getSnapshot,
    notificationsStore.getSnapshot
  );

  return {
    notifications: state.notifications,
    broadcasts: state.broadcasts,
    unreadCount: state.unreadCount,
    stats: state.stats,
    isRefreshing: state.isRefreshing,
    markRead: notificationsStore.markRead,
    markAllRead: notificationsStore.markAllRead,
    deleteNotification: notificationsStore.deleteNotification,
    createBroadcast: notificationsStore.createBroadcast,
    refreshLiveNotifications: () => notificationsStore.refreshLiveNotifications(false),
  };
}

export function useUnreadCount(): number {
  const state = useSyncExternalStore(
    notificationsStore.subscribe,
    notificationsStore.getSnapshot,
    notificationsStore.getSnapshot
  );
  return state.unreadCount;
}
