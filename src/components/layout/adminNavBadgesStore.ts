import { useSyncExternalStore } from 'react';
import type { AdminNavItem } from './adminNavItems';
import { applicationsStore } from '@/features/admin/applications/store/applicationsStore';
import { supportStore } from '@/features/admin/support/store/supportStore';

const STORAGE_KEY = 'hrsjm_admin_cleared_badges_v1';

class AdminNavBadgesStore {
  private clearedBadges: Set<string> = new Set();
  private listeners: Set<() => void> = new Set();
  private version = 0;

  constructor() {
    this.clearedBadges = this.loadPersisted();
  }

  private loadPersisted(): Set<string> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return new Set(parsed);
          }
        }
      }
    } catch {
      // Ignore storage errors
    }
    return new Set();
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify(Array.from(this.clearedBadges))
        );
      }
    } catch {
      // Ignore storage errors
    }
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): number => {
    return this.version;
  };

  private notify(): void {
    this.version += 1;
    this.persist();
    this.listeners.forEach((l) => l());
  }

  public isBadgeCleared(itemId: string): boolean {
    return this.clearedBadges.has(itemId);
  }

  public clearBadge(itemId: string): void {
    if (!this.clearedBadges.has(itemId)) {
      this.clearedBadges.add(itemId);
      this.notify();
    }
  }

  public resetBadge(itemId: string): void {
    if (this.clearedBadges.has(itemId)) {
      this.clearedBadges.delete(itemId);
      this.notify();
    }
  }

  public clearAllBadges(): void {
    this.clearedBadges.clear();
    this.notify();
  }

  public getEffectiveBadge(
    item: AdminNavItem,
    unreadNotificationsCount: number,
    isActive = false
  ): string | undefined {
    // If the nav item is currently active or has been marked cleared, hide the badge
    if (isActive || this.isBadgeCleared(item.id)) {
      return undefined;
    }

    if (item.id === 'notifications') {
      return unreadNotificationsCount > 0 ? String(unreadNotificationsCount) : undefined;
    }

    if (item.id === 'membership_applications') {
      const stats = applicationsStore.getStats();
      return stats.underReview > 0 ? String(stats.underReview) : undefined;
    }

    if (item.id === 'complaints') {
      const stats = supportStore.getStats();
      return stats.open > 0 ? String(stats.open) : undefined;
    }

    return item.badge || undefined;
  }
}

export const adminNavBadgesStore = new AdminNavBadgesStore();

export function useAdminNavBadges() {
  useSyncExternalStore(
    adminNavBadgesStore.subscribe,
    adminNavBadgesStore.getSnapshot
  );
  useSyncExternalStore(
    applicationsStore.subscribe,
    applicationsStore.getSnapshot
  );
  useSyncExternalStore(
    supportStore.subscribe,
    supportStore.getSnapshot
  );

  return {
    isBadgeCleared: (id: string) => adminNavBadgesStore.isBadgeCleared(id),
    clearBadge: (id: string) => adminNavBadgesStore.clearBadge(id),
    resetBadge: (id: string) => adminNavBadgesStore.resetBadge(id),
    getEffectiveBadge: (
      item: AdminNavItem,
      unreadNotificationsCount: number,
      isActive = false
    ) =>
      adminNavBadgesStore.getEffectiveBadge(
        item,
        unreadNotificationsCount,
        isActive
      ),
  };
}

