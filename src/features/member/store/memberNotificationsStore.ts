import { useSyncExternalStore } from 'react';
import { notificationsService } from '@/features/admin/notifications/services/notificationsService';

export interface MemberNotice {
  id: string;
  category: 'MEMBERSHIP' | 'EVENT' | 'RECEIPT' | 'BULLETIN' | 'SUPPORT';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: 'HIGH' | 'NORMAL' | 'URGENT';
  actionPath?: string;
  actionLabel?: string;
}

const STORAGE_KEY = 'hrsjm_member_notifications_v2';

export const DEFAULT_MEMBER_NOTICES: MemberNotice[] = [
  {
    id: 'notif-1',
    category: 'MEMBERSHIP',
    title: 'Digital ID Card & Membership Credential Activated',
    message: 'Your accredited membership has been verified and active. You may view your 3D digital flip card or download the credential PDF.',
    timestamp: 'Today, 10:15 AM',
    isRead: false,
    priority: 'HIGH',
    actionPath: '/member/id-card',
    actionLabel: 'View Digital ID',
  },
  {
    id: 'notif-2',
    category: 'BULLETIN',
    title: 'Physical Welcome Kit Dispatched via Speed Post',
    message: 'Your official welcome kit containing embossed PVC card, badge, and constitution handbook has been processed. Tracking number: SP729104829IN.',
    timestamp: 'Yesterday, 04:30 PM',
    isRead: false,
    priority: 'NORMAL',
    actionPath: '/member/dashboard',
    actionLabel: 'Track Kit',
  },
  {
    id: 'notif-3',
    category: 'EVENT',
    title: 'Pass Confirmed: 44th Annual Human Rights Convention',
    message: 'You are registered for the National Convention at Vigyan Bhawan, New Delhi on Nov 25, 2026. Please carry your digital ID card.',
    timestamp: '2 Nov 2026',
    isRead: false,
    priority: 'HIGH',
    actionPath: '/member/events',
    actionLabel: 'View Pass',
  },
  {
    id: 'notif-4',
    category: 'RECEIPT',
    title: '80G Tax Exemption Receipt #HRSJM-80G-2026-0842 Generated',
    message: 'Your recent annual contribution of ₹2,500 has been reconciled. Formal tax exemption certificate is available for download in your Passbook.',
    timestamp: '1 Nov 2026',
    isRead: true,
    priority: 'NORMAL',
    actionPath: '/member/passbook',
    actionLabel: 'Download 80G',
  },
  {
    id: 'notif-5',
    category: 'SUPPORT',
    title: 'Helpdesk Update: Complaint #TKT-8902 in Judicial Review',
    message: 'The legal cell has reviewed your complaint regarding arbitrary worker detention. The senior panel advocate has drafted formal representation.',
    timestamp: '30 Oct 2026',
    isRead: true,
    priority: 'HIGH',
    actionPath: '/member/support',
    actionLabel: 'View Ticket',
  },
  {
    id: 'notif-6',
    category: 'BULLETIN',
    title: 'National Directive: Winter Legal Literacy Clinics',
    message: 'All district members are invited to facilitate the upcoming citizen rights outreach drives starting December 1st across 28 states.',
    timestamp: '28 Oct 2026',
    isRead: true,
    priority: 'NORMAL',
    actionPath: '/member/news',
    actionLabel: 'Read Circular',
  },
  {
    id: 'notif-7',
    category: 'EVENT',
    title: 'RTI Awareness Webinar Registration Open',
    message: 'Free interactive session with former Central Information Commissioners on drafting effective Section 6(1) RTI applications.',
    timestamp: '25 Oct 2026',
    isRead: true,
    priority: 'NORMAL',
    actionPath: '/member/events',
    actionLabel: 'Browse Events',
  },
];

interface MemberNotificationsState {
  notices: MemberNotice[];
  unreadCount: number;
}

class MemberNotificationsStore {
  private state: MemberNotificationsState;
  private listeners: Set<() => void> = new Set();
  private hasSynced = false;

  constructor() {
    const loaded = this.loadPersistedNotices();
    this.state = {
      notices: loaded,
      unreadCount: loaded.filter((n) => !n.isRead).length,
    };
  }

  private loadPersistedNotices(): MemberNotice[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // LocalStorage error fallback
    }
    return [...DEFAULT_MEMBER_NOTICES];
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.notices));
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public getSnapshot = (): MemberNotificationsState => {
    return this.state;
  };

  private notify(): void {
    this.listeners.forEach((listener) => listener());
  }

  public async syncWithBackend(): Promise<void> {
    if (this.hasSynced) return;
    this.hasSynced = true;
    try {
      const liveItems = await notificationsService.fetchMyNotifications();
      if (Array.isArray(liveItems) && liveItems.length > 0) {
        const mappedLive: MemberNotice[] = liveItems.map((item) => ({
          id: item.recipient_id || item.notification.id,
          category: (item.notification.category?.toUpperCase() as any) || 'BULLETIN',
          title: item.notification.title,
          message: item.notification.body,
          timestamp: item.created_at
            ? new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
            : 'Recent',
          isRead: Boolean(item.is_read),
          priority: (item.notification.priority as any) || 'NORMAL',
          actionPath: item.notification.deepLinkUrl || '/member/dashboard',
          actionLabel: item.notification.actionLabel || 'View Details',
        }));

        this.state = {
          notices: mappedLive,
          unreadCount: mappedLive.filter((n) => !n.isRead).length,
        };
        this.persist();
        this.notify();
      }
    } catch {
      // Keep local state
    }
  }

  public markAllAsRead = async (): Promise<void> => {
    const updated = this.state.notices.map((n) => ({ ...n, isRead: true }));
    this.state = {
      notices: updated,
      unreadCount: 0,
    };
    this.persist();
    this.notify();

    try {
      await notificationsService.markAllReadApi();
    } catch {
      // local mark all as read succeeded
    }
  };

  public markSingleAsRead = async (id: string): Promise<void> => {
    const notice = this.state.notices.find((n) => n.id === id);
    if (!notice || notice.isRead) return;

    const updated = this.state.notices.map((n) =>
      n.id === id ? { ...n, isRead: true } : n
    );
    this.state = {
      notices: updated,
      unreadCount: updated.filter((n) => !n.isRead).length,
    };
    this.persist();
    this.notify();

    try {
      await notificationsService.markReadApi(id);
    } catch {
      // local mark read succeeded
    }
  };

  public deleteNotice = (id: string): void => {
    const updated = this.state.notices.filter((n) => n.id !== id);
    this.state = {
      notices: updated,
      unreadCount: updated.filter((n) => !n.isRead).length,
    };
    this.persist();
    this.notify();
  };

  public clearAllNotices = (): void => {
    this.state = {
      notices: [],
      unreadCount: 0,
    };
    this.persist();
    this.notify();

    try {
      notificationsService.markAllReadApi();
    } catch {
      // ignore
    }
  };
}

export const memberNotificationsStore = new MemberNotificationsStore();

export function useMemberNotifications() {
  const state = useSyncExternalStore(
    memberNotificationsStore.subscribe,
    memberNotificationsStore.getSnapshot,
    memberNotificationsStore.getSnapshot
  );

  return {
    notices: state.notices,
    unreadCount: state.unreadCount,
    markAllAsRead: memberNotificationsStore.markAllAsRead,
    markSingleAsRead: memberNotificationsStore.markSingleAsRead,
    deleteNotice: memberNotificationsStore.deleteNotice,
    clearAllNotices: memberNotificationsStore.clearAllNotices,
    syncWithBackend: () => memberNotificationsStore.syncWithBackend(),
  };
}

export function useMemberUnreadCount(): number {
  const state = useSyncExternalStore(
    memberNotificationsStore.subscribe,
    memberNotificationsStore.getSnapshot,
    memberNotificationsStore.getSnapshot
  );
  return state.unreadCount;
}

