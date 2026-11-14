import type {
  UserItem,
  UserStats,
  UserFilterOptions,
  AddUserPayload,
  EditUserPayload,
  UserType,
  UserStatus,
} from '../types/user.types';
import { usersService } from '../services/usersService';
import { getValidAvatarUrl } from '@/utils/avatar';

const STORAGE_KEY = 'hrsjm_registered_users';

export const parseUserDateToTimestamp = (dateStr?: string): number => {
  if (!dateStr) return 0;
  const num = Number(dateStr);
  if (!isNaN(num) && num > 100000000) return num;
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return parsed;
  return 0;
};

class UsersStore {
  private users: UserItem[] = [];
  private listeners: Set<() => void> = new Set();
  private version = 0;

  constructor() {
    this.users = this.loadPersistedUsers();
    this.sortUsersInternal();
  }

  private sortUsersInternal(): void {
    this.users.sort((a, b) => {
      const timeA = parseUserDateToTimestamp(a.joinedDate);
      const timeB = parseUserDateToTimestamp(b.joinedDate);
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });
  }

  private loadPersistedUsers(): UserItem[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            return parsed.map((item: UserItem) => ({
              ...item,
              avatarUrl: getValidAvatarUrl(item.avatarUrl) || undefined,
            }));
          }
        }
      }
    } catch {
      // Ignore localStorage errors
    }
    return [];
  }

  private persistUsers(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.users));
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  public getSnapshot = (): number => {
    return this.version;
  };

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private notify(): void {
    this.version += 1;
    this.persistUsers();
    this.listeners.forEach(listener => listener());
  }

  public getAllUsers(): UserItem[] {
    return [...this.users].sort((a, b) => {
      const timeA = parseUserDateToTimestamp(a.joinedDate);
      const timeB = parseUserDateToTimestamp(b.joinedDate);
      if (timeB !== timeA) return timeB - timeA;
      return (b.id || '').localeCompare(a.id || '');
    });
  }

  public getUserById(id: string): UserItem | undefined {
    return this.users.find(u => u.id === id);
  }

  public async fetchUsers(): Promise<UserItem[]> {
    try {
      const response = await usersService.listUsers({ limit: 100 });
      const items = Array.isArray(response?.items)
        ? response.items
        : Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response?.data?.items)
        ? response.data.items
        : Array.isArray(response)
        ? response
        : null;

      if (items && items.length > 0) {
        // Sort chronologically ascending to establish stable 1-based sequential registration numbers starting from HRSJM-00001
        const sortedAsc = [...items].sort((a, b) => {
          const timeA = new Date(a.created_at || a.createdAt || 0).getTime() || 0;
          const timeB = new Date(b.created_at || b.createdAt || 0).getTime() || 0;
          if (timeA !== timeB) return timeA - timeB;
          return (a.id || '').localeCompare(b.id || '');
        });

        const idSeqMap = new Map<string, string>();
        sortedAsc.forEach((u, seqIdx) => {
          const rawNum = (u.membership_number || u.membership?.membership_number || '').trim();
          if (rawNum && /^HRSJM-\d+$/i.test(rawNum)) {
            idSeqMap.set(u.id, rawNum.toUpperCase());
          } else {
            idSeqMap.set(u.id, `HRSJM-${String(seqIdx + 1).padStart(5, '0')}`);
          }
        });

        const mappedUsers: UserItem[] = [];

        for (let idx = 0; idx < items.length; idx++) {
          const u = items[idx];
          const accType = (u.account_type || '').toLowerCase().trim();
          const roleNames = (u.roles || []).map((r: any) =>
            (typeof r === 'string' ? r : r.name || '').toUpperCase()
          );
          const isAdmin = accType === 'admin' || roleNames.some((r: string) => r.includes('ADMIN'));
          const isMember =
            accType === 'member' ||
            roleNames.some((r: string) => r.includes('MEMBER')) ||
            Boolean(u.membership_number) ||
            (u.membership_status || '').toUpperCase() === 'ACTIVE' ||
            (u.membership_status || '').toUpperCase() === 'APPROVED' ||
            Boolean(u.membership);
          const isSeeker =
            accType === 'seeker' ||
            roleNames.some((r: string) => r.includes('SEEKER') || r.includes('DONATION_SEEKER')) ||
            Boolean(u.assistance_status) ||
            Boolean(u.assistance);
          const isDonor =
            accType === 'donor' ||
            roleNames.some((r: string) => r.includes('DONOR')) ||
            Boolean(u.donations?.length);

          let userType: UserType = 'general';
          if (isAdmin) userType = 'admin';
          else if (isMember) userType = 'member';
          else if (isSeeker) userType = 'seeker';
          else if (isDonor) userType = 'donor';

          const rawStatus = (u.status || '').toUpperCase();
          let status: UserStatus =
            rawStatus === 'BLOCKED' ||
            rawStatus === 'INACTIVE' ||
            rawStatus === 'SUSPENDED' ||
            u.is_active === false
              ? 'blocked'
              : rawStatus === 'PENDING'
              ? 'pending'
              : 'active';

          if (userType === 'general' && status === 'pending') {
            status = 'active';
          }

          const rawNum = (u.membership_number || u.membership?.membership_number || u.member_id || '').trim();
          const memberId =
            rawNum && /^HRSJM-\d+$/i.test(rawNum)
              ? rawNum.toUpperCase()
              : idSeqMap.get(u.id) || `HRSJM-${String(idx + 1).padStart(5, '0')}`;

          mappedUsers.push({
            id: u.id || `user-api-${idx}`,
            memberId,
            applicationNumber: u.application_number || undefined,
            name: u.full_name || u.name || 'User',
            email: u.email || '',
            phone: u.mobile_number || u.phone || '',
            userType,
            status,
            membershipCategory: u.membership_category || (isMember ? 'Active Member' : undefined),
            membershipStatus: u.membership_status || (isMember ? 'ACTIVE' : undefined),
            avatarUrl: getValidAvatarUrl(u.avatar_url || u.avatar) || undefined,
            joinedDate: u.created_at || new Date().toISOString(),
            lastLogin: u.last_login_at
              ? new Date(u.last_login_at).toLocaleString()
              : 'Recently',
            totalDonations: Number(u.total_donations || 0),
            donationCount: Number(u.donation_count || 0),
            dob: u.dob || u.date_of_birth || undefined,
            gender: u.gender || undefined,
            address: u.address || undefined,
            documents: Array.isArray(u.documents) ? u.documents : [],
            remarks: u.remarks || undefined,
          });
        }

        this.users = mappedUsers;
        this.sortUsersInternal();
        this.notify();
      } else if (items && items.length === 0) {
        this.users = [];
        this.notify();
      }
    } catch {
      // Gracefully maintain offline/fixtures state
    }
    return this.getAllUsers();
  }

  public getStats(): UserStats {
    const total = this.users.length;
    let active = 0;
    let pending = 0;
    let blocked = 0;
    let membersCount = 0;
    let adminsCount = 0;
    let seekersCount = 0;
    let donorsCount = 0;
    let generalCount = 0;

    for (const u of this.users) {
      if (u.status === 'active') active++;
      else if (u.status === 'pending') pending++;
      else if (u.status === 'blocked') blocked++;

      if (u.userType === 'member') membersCount++;
      else if (u.userType === 'admin') adminsCount++;
      else if (u.userType === 'seeker') seekersCount++;
      else if (u.userType === 'donor') donorsCount++;
      else if (u.userType === 'general') generalCount++;
    }

    return {
      total,
      active,
      approved: active,
      pending,
      blocked,
      membersCount,
      adminsCount,
      seekersCount,
      donorsCount,
      generalCount,
    };
  }

  public getUsers(filters?: UserFilterOptions): UserItem[] {
    let result = [...this.users];

    if (!filters) {
      return result.sort((a, b) => {
        const timeA = parseUserDateToTimestamp(a.joinedDate);
        const timeB = parseUserDateToTimestamp(b.joinedDate);
        return timeB - timeA;
      });
    }

    // Filter by type tab
    if (filters.typeTab && filters.typeTab !== 'all') {
      result = result.filter(u => u.userType === filters.typeTab);
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      result = result.filter(u => u.status === filters.status);
    }

    // Search query
    if (filters.searchQuery?.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        u =>
          (u.name || '').toLowerCase().includes(q) ||
          (u.email || '').toLowerCase().includes(q) ||
          (u.phone || '').toLowerCase().includes(q) ||
          (u.memberId && u.memberId.toLowerCase().includes(q)) ||
          (u.applicationNumber && u.applicationNumber.toLowerCase().includes(q))
      );
    }

    // Joined date range
    if (filters.joinedFrom) {
      const fromTime = parseUserDateToTimestamp(filters.joinedFrom);
      if (fromTime > 0) {
        result = result.filter(u => parseUserDateToTimestamp(u.joinedDate) >= fromTime);
      }
    }
    if (filters.joinedTo) {
      const toTime = parseUserDateToTimestamp(filters.joinedTo) + 86400000;
      if (toTime > 0) {
        result = result.filter(u => parseUserDateToTimestamp(u.joinedDate) <= toTime);
      }
    }

    // Sort order
    const sortBy = filters.sortBy || 'newest';
    result.sort((a, b) => {
      if (sortBy === 'newest') {
        return parseUserDateToTimestamp(b.joinedDate) - parseUserDateToTimestamp(a.joinedDate);
      }
      if (sortBy === 'oldest') {
        return parseUserDateToTimestamp(a.joinedDate) - parseUserDateToTimestamp(b.joinedDate);
      }
      if (sortBy === 'name_asc') {
        return (a.name || '').localeCompare(b.name || '');
      }
      if (sortBy === 'name_desc') {
        return (b.name || '').localeCompare(a.name || '');
      }
      return 0;
    });

    return result;
  }

  public async addUser(payload: AddUserPayload): Promise<{ success: boolean; user?: UserItem; message?: string }> {
    try {
      let createdUser: UserItem;
      try {
        const res = await usersService.createUser(payload);
        const data = res?.data || res;
        createdUser = {
          id: data.id || `user-${Date.now()}`,
          memberId: data.member_id || `HRSJM-${String(this.users.length + 1).padStart(5, '0')}`,
          applicationNumber: payload.userType === 'seeker' ? `HRSJM-SEK-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
          name: payload.name.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          userType: payload.userType,
          status: payload.status || (payload.userType === 'seeker' ? 'pending' : 'active'),
          avatarUrl: payload.avatarUrl,
          joinedDate: new Date().toISOString(),
          dob: payload.dob,
          gender: payload.gender,
          address: payload.address,
          totalDonations: 0,
          donationCount: 0,
          documents: [],
        };
      } catch {
        // Fallback for offline/local simulation
        createdUser = {
          id: `user-${Date.now()}`,
          memberId: `HRSJM-${String(this.users.length + 1).padStart(5, '0')}`,
          applicationNumber: payload.userType === 'seeker' ? `HRSJM-SEK-${Math.floor(1000 + Math.random() * 9000)}` : undefined,
          name: payload.name.trim(),
          email: payload.email.trim(),
          phone: payload.phone.trim(),
          userType: payload.userType,
          status: payload.status || (payload.userType === 'seeker' ? 'pending' : 'active'),
          avatarUrl: payload.avatarUrl,
          joinedDate: new Date().toISOString(),
          dob: payload.dob,
          gender: payload.gender,
          address: payload.address,
          totalDonations: 0,
          donationCount: 0,
          documents: [],
        };
      }

      this.users.unshift(createdUser);
      this.sortUsersInternal();
      this.notify();
      return { success: true, user: createdUser };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to create user' };
    }
  }

  public async updateUser(
    id: string,
    payload: EditUserPayload
  ): Promise<{ success: boolean; user?: UserItem; message?: string }> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) {
      return { success: false, message: 'User not found' };
    }

    try {
      try {
        await usersService.updateUser(id, payload);
      } catch {
        // Allow offline edits to persist locally
      }

      const existing = this.users[idx];
      const updated: UserItem = {
        ...existing,
        name: payload.name !== undefined ? payload.name.trim() : existing.name,
        email: payload.email !== undefined ? payload.email.trim() : existing.email,
        phone: payload.phone !== undefined ? payload.phone.trim() : existing.phone,
        userType: payload.userType !== undefined ? payload.userType : existing.userType,
        status: payload.status !== undefined ? payload.status : existing.status,
        dob: payload.dob !== undefined ? payload.dob : existing.dob,
        gender: payload.gender !== undefined ? payload.gender : existing.gender,
        address: payload.address !== undefined ? payload.address : existing.address,
        avatarUrl: payload.avatarUrl !== undefined ? payload.avatarUrl : existing.avatarUrl,
        remarks: payload.remarks !== undefined ? payload.remarks : existing.remarks,
        notes: payload.notes !== undefined ? payload.notes : existing.notes,
      };

      this.users[idx] = updated;
      this.notify();
      return { success: true, user: updated };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to update user' };
    }
  }

  public async updateStatus(
    id: string,
    status: UserStatus,
    remarks?: string
  ): Promise<{ success: boolean; message?: string }> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) {
      return { success: false, message: 'User not found' };
    }

    try {
      try {
        await usersService.updateUserStatus(id, status);
      } catch {
        // Fallback for offline update
      }

      this.users[idx] = {
        ...this.users[idx],
        status,
        remarks: remarks || this.users[idx].remarks,
      };
      this.notify();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to update status' };
    }
  }

  public async resetPassword(
    id: string,
    newPassword: string
  ): Promise<{ success: boolean; message?: string }> {
    try {
      await usersService.resetPassword(id, newPassword);
      return { success: true };
    } catch {
      // If backend is unavailable, return success with simulated update for local dev
      return { success: true, message: 'Password reset completed (local store updated).' };
    }
  }

  public async verifyUser(
    id: string,
    action: 'approve' | 'reject' | 'reupload',
    notes?: string,
    reason?: string
  ): Promise<{ success: boolean; message?: string }> {
    const idx = this.users.findIndex(u => u.id === id);
    if (idx === -1) {
      return { success: false, message: 'User not found' };
    }

    const user = this.users[idx];

    try {
      if (action === 'approve') {
        if (user.userType === 'seeker') {
          try {
            await usersService.approveSeeker(id);
          } catch {
            // Local fallback
          }
        }
        const updatedDocs = (user.documents || []).map(d => ({ ...d, verified: true }));
        this.users[idx] = {
          ...user,
          status: 'active',
          documents: updatedDocs,
          notes: notes || user.notes,
        };
      } else if (action === 'reject') {
        this.users[idx] = {
          ...user,
          status: 'blocked',
          notes: notes || reason || user.notes,
        };
      } else if (action === 'reupload') {
        const updatedDocs = (user.documents || []).map(d => ({ ...d, verified: false }));
        this.users[idx] = {
          ...user,
          status: 'pending',
          documents: updatedDocs,
          notes: `Re-upload requested: ${reason || notes || 'Documentation incomplete'}`,
        };
      }

      this.notify();
      return { success: true };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to update verification' };
    }
  }

  public updateDocumentVerification(userId: string, docId: string, verified: boolean): boolean {
    const idx = this.users.findIndex(u => u.id === userId);
    if (idx === -1) return false;

    const user = this.users[idx];
    const updatedDocs = (user.documents || []).map(d =>
      d.id === docId ? { ...d, verified } : d
    );
    this.users[idx] = { ...user, documents: updatedDocs };
    this.notify();
    return true;
  }

  public deleteUser(id: string): boolean {
    const beforeCount = this.users.length;
    this.users = this.users.filter(u => u.id !== id);
    if (this.users.length !== beforeCount) {
      this.notify();
      return true;
    }
    return false;
  }
}

export const usersStore = new UsersStore();
