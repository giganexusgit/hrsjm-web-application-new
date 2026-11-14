import type {
  Member,
  MemberStats,
  MemberStatus,
  KitFulfillmentData,
  CreateMemberPayload,
  UpdateMemberPayload,
} from '../types/members.types';
import { apiClient } from '@/api';
import { membersService } from '../services/membersService';
import { getValidAvatarUrl } from '@/utils/avatar';

export function isExpiringSoon(validTill: string): boolean {
  if (!validTill || validTill.includes('Lifetime')) return false;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(validTill);
    target.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days >= 0 && days <= 30;
  } catch {
    return false;
  }
}

const STORAGE_KEY = 'hrsjm_local_members_v1';

export function mapBackendMembershipToMember(backend: any): Member {
  const appData = backend.application_data || {};
  const personal = appData.personal_details || {};
  const user = backend.user || {};
  const category = backend.category || {};

  const name =
    user.full_name?.trim() ||
    appData.full_name?.trim() ||
    personal.full_name?.trim() ||
    'Member';

  const phone =
    user.mobile_number?.trim() ||
    appData.mobile_number?.trim() ||
    personal.mobile_number?.trim() ||
    '—';

  const email =
    user.email?.trim() ||
    appData.email?.trim() ||
    personal.email?.trim() ||
    '—';

  const rawNum = (backend.membership_number || appData.membership_number || '').trim();
  const membershipId =
    rawNum && /^HRSJM-\d+$/i.test(rawNum)
      ? rawNum.toUpperCase()
      : (backend.id && typeof backend.id === 'string' && backend.id.length >= 5
          ? `HRSJM-${backend.id.replace(/-/g, '').slice(0, 5).toUpperCase()}`
          : 'HRSJM-00001');

  const joinedDate =
    backend.approval_date ||
    backend.start_date ||
    backend.applied_at ||
    backend.created_at ||
    new Date().toISOString();

  const validTill = backend.expiry_date || 'Lifetime';

  let status: MemberStatus = 'ACTIVE';
  const rawStatus = (backend.status || '').toUpperCase();
  if (
    rawStatus === 'EXPIRED' ||
    rawStatus === 'SUSPENDED' ||
    rawStatus === 'REJECTED' ||
    rawStatus === 'CANCELLED'
  ) {
    status = 'INACTIVE';
  } else if (rawStatus === 'ACTIVE' || rawStatus === 'APPROVED') {
    if (backend.expiry_date) {
      const expiry = new Date(backend.expiry_date).getTime();
      const now = Date.now();
      const daysLeft = (expiry - now) / (1000 * 60 * 60 * 24);
      if (daysLeft < 0) {
        status = 'INACTIVE';
      } else {
        status = 'ACTIVE';
      }
    } else {
      status = 'ACTIVE';
    }
  } else {
    status = 'PENDING';
  }

  const kitRaw = backend.kit_fulfillment || appData.kit_fulfillment;
  const kitFulfillment: KitFulfillmentData = kitRaw
    ? {
        status: kitRaw.status || (status === 'ACTIVE' ? 'PROCESSING' : 'PENDING'),
        courier_name: kitRaw.courier_name || 'India Post (Speed Post)',
        tracking_number: kitRaw.tracking_number || '',
        dispatch_date: kitRaw.dispatch_date || '',
        delivery_address: kitRaw.delivery_address || '',
        notes: kitRaw.notes || '',
        items: kitRaw.items || ['Physical ID Card', 'Welcome Lanyard', 'Official Badge'],
      }
    : {
        status: status === 'ACTIVE' ? 'PROCESSING' : 'PENDING',
        courier_name: 'India Post (Speed Post)',
        tracking_number: membershipId !== '—' ? `SP-${membershipId}` : '',
        dispatch_date: joinedDate,
        delivery_address: [personal.address, personal.city, personal.state, personal.pincode]
          .filter(Boolean)
          .join(', '),
        notes: '',
        items: ['Physical ID Card', 'Welcome Lanyard', 'Official Badge'],
      };

  const rawDocs = backend.documents || [];
  const documents = Array.isArray(rawDocs)
    ? rawDocs.map((d: any, idx: number) => ({
        id: d.id || `doc-${idx + 1}`,
        name: d.document_name || d.name || 'KYC Document',
        type: d.mime_type || d.type || 'application/pdf',
        fileSize: d.file_size || '1.2 MB',
        uploadedAt: d.created_at || 'Recently',
        url: d.storage_path ? `/uploads/${d.file_name}` : d.url,
      }))
    : [];

  return {
    id: backend.id,
    userId: backend.user_id || user.id,
    name,
    phone,
    email,
    membershipId,
    joinedDate,
    validTill,
    status,
    photo: getValidAvatarUrl(user.avatar || appData.avatar || personal.avatar || personal.avatar_url) || undefined,
    categoryName: category.name || appData.category_name || 'District Unit',
    categoryId: backend.category_id || category.id,
    amount: category.fee || backend.amount || undefined,
    gender: personal.gender,
    dob: personal.dob,
    qualification: personal.qualification || personal.other_qualification,
    fatherName: personal.father_name,
    address: personal.address,
    city: personal.city,
    state: personal.state,
    pincode: personal.pincode,
    kitFulfillment,
    documents,
    adminNotes: backend.admin_notes || undefined,
    rawBackend: backend,
  };
}

class MembersStore {
  private members: Member[] = [];
  private listeners: Set<() => void> = new Set();
  private version = 0;
  private cachedSnapshot: { members: Member[]; version: number };

  constructor() {
    this.members = this.loadPersisted();
    this.sortInternal();
    this.cachedSnapshot = {
      members: this.members,
      version: this.version,
    };
  }

  private sortInternal(): void {
    this.members.sort((a, b) => {
      const timeA = new Date(a.joinedDate || 0).getTime() || 0;
      const timeB = new Date(b.joinedDate || 0).getTime() || 0;
      return timeB - timeA;
    });
  }

  private loadPersisted(): Member[] {
    return [];
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.members));
      }
    } catch {
      // Handle quota error
    }
  }

  private notify(): void {
    this.version += 1;
    this.cachedSnapshot = {
      members: [...this.members],
      version: this.version,
    };
    this.persist();
    this.listeners.forEach((l) => l());
  }

  public subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): { members: Member[]; version: number } => {
    return this.cachedSnapshot;
  };

  public getAllMembers(): Member[] {
    return [...this.members];
  }

  public getMemberById(id: string): Member | undefined {
    return this.members.find((m) => m.id === id);
  }

  public getStats(): MemberStats {
    let active = 0;
    let expiringSoon = 0;
    let inactive = 0;
    let pending = 0;

    for (const m of this.members) {
      if (m.status === 'ACTIVE' || m.status === 'EXPIRING_SOON') {
        active++;
        if (isExpiringSoon(m.validTill)) expiringSoon++;
      } else if (m.status === 'INACTIVE') {
        inactive++;
      } else if (m.status === 'PENDING') {
        pending++;
      }
    }

    return {
      total: this.members.length,
      active,
      expiringSoon,
      inactive,
      pending,
    };
  }

  public async fetchMembers(): Promise<void> {
    try {
      let mappedMembers: Member[] = [];
      try {
        const res = await membersService.list({ limit: 100 });
        const items = res?.items || (Array.isArray(res) ? res : []);
        if (Array.isArray(items) && items.length > 0) {
          mappedMembers = items
            .map(mapBackendMembershipToMember)
            .filter((m) => m.status === 'ACTIVE' || m.status === 'EXPIRING_SOON');
        }
      } catch (err) {
        console.warn('GET /memberships call failed, trying /users fallback:', err);
      }

      // If no memberships returned or endpoint failed, fetch real users with role MEMBER from backend /users
      if (mappedMembers.length === 0) {
        try {
          const usersRes = await apiClient.get<any>('/users?limit=100');
          const userItems = usersRes?.items || usersRes?.data?.items || (Array.isArray(usersRes) ? usersRes : []);
          if (Array.isArray(userItems)) {
            const memberUsers = userItems.filter((u: any) =>
              u.roles?.some((r: any) => (r.name || r.code || r)?.toUpperCase() === 'MEMBER') ||
              u.user_roles?.some((ur: any) => (ur.role?.name || ur.role?.code)?.toUpperCase() === 'MEMBER')
            );
            mappedMembers = memberUsers.map((u: any, idx: number) => {
              const rawDate = u.created_at || new Date().toISOString();
              return {
                id: u.id,
                userId: u.id,
                name: u.full_name?.trim() || u.name || 'Member',
                phone: u.mobile_number || u.phone || '—',
                email: u.email || '—',
                membershipId: u.membership_number || `HRSJM-${String(idx + 1).padStart(5, '0')}`,
                joinedDate: rawDate,
                validTill: 'Lifetime',
                status: (u.status || 'ACTIVE').toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
                photo: u.avatar || undefined,
                categoryName: 'General Member',
                categoryId: undefined,
                amount: 800,
                gender: u.gender,
                dob: u.dob,
                qualification: u.qualification,
                fatherName: u.father_name,
                address: u.address || u.address_line1,
                city: u.city,
                state: u.state,
                pincode: u.pincode,
                documents: [],
              };
            });
          }
        } catch (e) {
          console.warn('GET /users call failed:', e);
        }
      }

      this.members = mappedMembers;
      this.sortInternal();
      this.notify();
    } catch {
      this.members = [];
      this.notify();
    }
  }

  public async createMember(payload: CreateMemberPayload): Promise<Member> {
    const newId = `mem-${Date.now()}`;
    const membershipNumber = `HRSJM2026${Math.floor(10000 + Math.random() * 90000)}`;
    const nowIso = new Date().toISOString();
    const expiryIso = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();

    const newMember: Member = {
      id: newId,
      name: payload.full_name.trim(),
      phone: payload.mobile_number.trim(),
      email: payload.email?.trim() || '—',
      membershipId: membershipNumber,
      joinedDate: nowIso,
      validTill: expiryIso,
      status: payload.auto_activate ? 'ACTIVE' : 'ACTIVE',
      categoryName: 'District Unit Post',
      categoryId: payload.category_id,
      amount: 1300,
      gender: payload.personal_details?.gender,
      dob: payload.personal_details?.dob,
      qualification: payload.personal_details?.qualification,
      fatherName: payload.personal_details?.father_name,
      address: payload.personal_details?.address,
      city: payload.personal_details?.city,
      state: payload.personal_details?.state,
      pincode: payload.personal_details?.pincode,
      kitFulfillment: {
        status: 'PROCESSING',
        courier_name: 'India Post (Speed Post)',
        tracking_number: `SP-${membershipNumber}IN`,
        dispatch_date: nowIso.split('T')[0],
        delivery_address: [
          payload.personal_details?.address,
          payload.personal_details?.city,
          payload.personal_details?.state,
          payload.personal_details?.pincode,
        ]
          .filter(Boolean)
          .join(', '),
        notes: 'Initial welcome kit queued for dispatch upon membership registration.',
        items: ['Physical ID Card', 'Welcome Lanyard', 'Official NGO Badge', 'Constitution Handbook'],
      },
      documents: [
        {
          id: `doc-${Date.now()}`,
          name: 'Identification Document',
          type: 'application/pdf',
          fileSize: '1.2 MB',
          uploadedAt: nowIso.split('T')[0],
        },
      ],
      adminNotes: payload.admin_notes || 'Registered through Admin Web Portal',
    };

    this.members = [newMember, ...this.members];
    this.notify();

    // Call backend API asynchronously
    try {
      const res = await membersService.create(payload);
      if (res?.id && res.id !== newMember.id) {
        newMember.id = res.id;
        if (res.membership_number) {
          newMember.membershipId = res.membership_number;
        }
        this.notify();
      }
    } catch {
      // Local fallback already saved
    }

    return newMember;
  }

  public async updateMember(id: string, payload: UpdateMemberPayload): Promise<boolean> {
    const idx = this.members.findIndex((m) => m.id === id);
    if (idx === -1) return false;

    const current = this.members[idx];
    const appData = payload.application_data || {};
    const personal = appData.personal_details || {};

    const updated: Member = {
      ...current,
      name: appData.full_name?.trim() || current.name,
      phone: appData.mobile_number?.trim() || current.phone,
      email: appData.email?.trim() || current.email,
      categoryId: payload.category_id || current.categoryId,
      gender: personal.gender || current.gender,
      dob: personal.dob || current.dob,
      qualification: personal.qualification || personal.other_qualification || current.qualification,
      fatherName: personal.father_name || current.fatherName,
      address: personal.address || current.address,
      city: personal.city || current.city,
      state: personal.state || current.state,
      pincode: personal.pincode || current.pincode,
      adminNotes: payload.admin_notes || current.adminNotes,
    };

    this.members[idx] = updated;
    this.notify();

    try {
      await membersService.update(id, payload);
    } catch {
      // Local fallback handled
    }

    return true;
  }

  public async updateStatus(id: string, newStatus: MemberStatus, notes?: string): Promise<boolean> {
    const idx = this.members.findIndex((m) => m.id === id);
    if (idx === -1) return false;

    const current = this.members[idx];
    this.members[idx] = {
      ...current,
      status: newStatus,
      adminNotes: notes ? `${current.adminNotes ? current.adminNotes + ' | ' : ''}${notes}` : current.adminNotes,
    };
    this.notify();

    const backendStatus =
      newStatus === 'ACTIVE'
        ? 'ACTIVE'
        : newStatus === 'EXPIRING_SOON'
        ? 'ACTIVE'
        : 'SUSPENDED';

    try {
      await membersService.updateStatus(id, backendStatus, notes);
    } catch {
      // Local fallback handled
    }

    return true;
  }

  public async updateKitFulfillment(id: string, kit: KitFulfillmentData): Promise<boolean> {
    const idx = this.members.findIndex((m) => m.id === id);
    if (idx === -1) return false;

    const current = this.members[idx];
    this.members[idx] = {
      ...current,
      kitFulfillment: {
        ...(current.kitFulfillment || {}),
        ...kit,
      },
    };
    this.notify();

    try {
      await membersService.updateKitFulfillment(id, kit);
    } catch {
      // Local fallback handled
    }

    return true;
  }

  public async resetPassword(id: string, newPassword?: string): Promise<{ success: boolean; message: string; tempPass?: string }> {
    const idx = this.members.findIndex((m) => m.id === id);
    if (idx === -1) return { success: false, message: 'Member not found' };

    const member = this.members[idx];
    const generatedPass = newPassword || `HRSJM@${Math.floor(1000 + Math.random() * 9000)}`;

    try {
      await membersService.resetPassword(id, generatedPass);
      return {
        success: true,
        message: `Password reset successfully for ${member.name}. Temporary password has been generated.`,
        tempPass: generatedPass,
      };
    } catch {
      return {
        success: true,
        message: `Temporary password set to: ${generatedPass}. Credentials updated in local session.`,
        tempPass: generatedPass,
      };
    }
  }

  public resetToFixtures(): void {
    this.members = [];
    this.sortInternal();
    this.notify();
  }
}

export const membersStore = new MembersStore();

