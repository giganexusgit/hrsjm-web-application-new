import { useSyncExternalStore } from 'react';
import type { UserProfile } from '../types/userHome.types';
import { usersStore } from '../../admin/users/store/usersStore';
import { applicationsStore } from '../../admin/applications/store/applicationsStore';

const STORAGE_KEY = 'hrsjm_user_profile';
const TOKEN_KEY = 'hrsjm_auth_token';

interface UserAuthState {
  user: UserProfile | null;
  status: 'authenticated' | 'unauthenticated';
  unreadNotificationsCount: number;
}

class UserAuthStore {
  private state: UserAuthState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    const user = this.loadPersistedUser();
    this.state = {
      user,
      status: user ? 'authenticated' : 'unauthenticated',
      unreadNotificationsCount: user ? 3 : 0,
    };
  }

  private loadPersistedUser(): UserProfile | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const token = window.localStorage.getItem(TOKEN_KEY) || window.localStorage.getItem('auth_token');
        if (!token) {
          // Strictly reject user session hydration without valid auth token
          window.localStorage.removeItem(STORAGE_KEY);
          return null;
        }
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          return JSON.parse(raw);
        }
      }
    } catch {
      // ignore
    }
    return null;
  }

  private persistUser(user: UserProfile | null): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (user) {
          window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
        } else {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // ignore
    }
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  public getSnapshot = (): UserAuthState => {
    return this.state;
  };

  private notify(): void {
    this.listeners.forEach(fn => fn());
  }

  public setUser = (user: UserProfile | null): void => {
    this.state = {
      ...this.state,
      user,
      status: user ? 'authenticated' : 'unauthenticated',
    };
    this.persistUser(user);
    this.notify();
  };

  public signOut = (): void => {
    this.setUser(null);
  };

  public setUnreadNotificationsCount = (count: number): void => {
    this.state = {
      ...this.state,
      unreadNotificationsCount: Math.max(0, count),
    };
    this.notify();
  };

  public updateAssistanceStatus = (status: 'PENDING' | 'APPROVED' | 'REJECTED' | null): void => {
    if (!this.state.user) return;
    const updated: UserProfile = {
      ...this.state.user,
      assistance_status: status,
      account_type: status === 'APPROVED' ? 'seeker' : this.state.user.account_type,
    };
    this.setUser(updated);
  };

  public updateMembershipStatus = (status: 'PENDING' | 'ACTIVE' | 'REJECTED' | null): void => {
    if (!this.state.user) return;
    const updated: UserProfile = {
      ...this.state.user,
      membership_status: status,
      account_type: status === 'ACTIVE' ? 'member' : this.state.user.account_type,
    };
    this.setUser(updated);
  };

  public getMatchedSeekerApplication = () => {
    const user = this.state.user;
    if (!user) return undefined;
    const phone = user.mobile_number?.replace(/\D/g, '').slice(-10);
    const email = user.email?.toLowerCase().trim();
    const appNo = user.assistance_application_number;

    try {
      const allUsers = usersStore.getAllUsers();
      const matched = allUsers.find((u: any) => {
        if (u.userType !== 'seeker') return false;
        if (appNo && u.applicationNumber === appNo) return true;
        if (phone && u.phone && u.phone.replace(/\D/g, '').includes(phone)) return true;
        if (email && u.email && u.email.toLowerCase().trim() === email) return true;
        return false;
      });
      if (matched) return matched;
    } catch {
      // fallback
    }

    try {
      const storeApps = applicationsStore.getAllApplications();
      const matchedApp = storeApps.find(
        (a: any) =>
          a.accountType === 'seeker' &&
          ((appNo && a.applicationId === appNo) ||
            (email && a.email && a.email.toLowerCase().trim() === email) ||
            (phone && a.phone && a.phone.replace(/\D/g, '').includes(phone)))
      );
      if (matchedApp) {
        return {
          id: matchedApp.id,
          name: matchedApp.applicantName,
          email: matchedApp.email || '',
          phone: matchedApp.phone || '',
          userType: 'seeker' as const,
          status: matchedApp.status === 'approved' ? ('active' as const) : matchedApp.status === 'rejected' ? ('blocked' as const) : ('pending' as const),
          applicationNumber: matchedApp.applicationId,
          joinedDate: matchedApp.submittedAt || new Date().toISOString(),
          remarks: (matchedApp as any).rejectionReason || '',
          documents: [],
        };
      }
    } catch {
      // fallback
    }

    return undefined;
  };
}

export const userAuthStore = new UserAuthStore();

export const useUserAuth = () => {
  const state = useSyncExternalStore(
    userAuthStore.subscribe,
    userAuthStore.getSnapshot,
    userAuthStore.getSnapshot
  );

  return {
    ...state,
    setUser: userAuthStore.setUser,
    signOut: userAuthStore.signOut,
    setUnreadNotificationsCount: userAuthStore.setUnreadNotificationsCount,
    updateAssistanceStatus: userAuthStore.updateAssistanceStatus,
    updateMembershipStatus: userAuthStore.updateMembershipStatus,
    getMatchedSeekerApplication: userAuthStore.getMatchedSeekerApplication,
  };
};
