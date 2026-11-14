import { useSyncExternalStore } from 'react';
import type {
  MemberProfile,
  MemberStatus,
  MemberPassbookEntry,
} from '../types/member.types';
import {
  INITIAL_DEV_MEMBER,
  EXPIRING_DEV_MEMBER,
  EXPIRED_DEV_MEMBER,
  MEMBER_RENEWAL_PACKAGES,
  INITIAL_MEMBER_PASSBOOK,
} from '../data/memberFixtures';
import { memberService, type UpdateProfilePayload } from '../services/memberService';

const STORAGE_KEY = 'hrsjm_active_member';
const PASSBOOK_STORAGE_KEY = 'hrsjm_member_passbook_data';

export const calculateDaysRemaining = (validUptoStr: string): number => {
  if (!validUptoStr) return 0;
  const target = new Date(validUptoStr).getTime();
  const now = new Date().getTime();
  const diffDays = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diffDays;
};

class MemberStore {
  private member: MemberProfile;
  private passbook: MemberPassbookEntry[];
  private listeners: Set<() => void> = new Set();
  private version = 0;
  private isLoading = false;
  private error: string | null = null;
  private hasFetched = false;
  private isFetching = false;

  constructor() {
    this.member = this.loadPersistedMember();
    this.passbook = this.loadPersistedPassbook();
    this.recalculateValidity();
  }

  private loadPersistedMember(): MemberProfile {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.membershipNumber) {
            return parsed;
          }
        }
      }
    } catch {
      // LocalStorage error fallback
    }

    const base = { ...INITIAL_DEV_MEMBER };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const userRaw = window.localStorage.getItem('hrsjm_user_profile');
        if (userRaw) {
          const u = JSON.parse(userRaw);
          if (u.full_name) base.fullName = u.full_name;
          if (u.email) base.email = u.email;
          if (u.mobile_number) base.phone = u.mobile_number;
          base.membershipNumber = u.membership_number || 'PENDING VERIFICATION';
          if (u.state || u.city) {
            base.address = {
              ...base.address,
              ...(u.state ? { state: u.state } : {}),
              ...(u.city ? { city: u.city } : {}),
            };
          }
        }
      }
    } catch {
      // ignore
    }

    return base;
  }

  private persistMember(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.member));
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  private loadPersistedPassbook(): MemberPassbookEntry[] {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem(PASSBOOK_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      }
    } catch {
      // Fallback
    }
    return [...INITIAL_MEMBER_PASSBOOK];
  }

  private persistPassbook(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(PASSBOOK_STORAGE_KEY, JSON.stringify(this.passbook));
      }
    } catch {
      // Ignore
    }
  }

  private recalculateValidity(): void {
    const days = calculateDaysRemaining(this.member.validUpto);
    this.member.daysRemaining = days;
    this.member.isExpired = days <= 0;
    this.member.isExpiringSoon = days > 0 && days <= 30;

    if (this.member.isExpired) {
      this.member.status = 'EXPIRED';
    } else if (this.member.isExpiringSoon) {
      this.member.status = 'EXPIRING_SOON';
    } else if (this.member.status === 'EXPIRED' || this.member.status === 'EXPIRING_SOON') {
      this.member.status = 'ACTIVE';
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
    this.recalculateValidity();
    this.persistMember();
    this.persistPassbook();
    this.listeners.forEach((listener) => listener());
  }

  public getMember(): MemberProfile {
    return this.member;
  }

  public getPassbook(): MemberPassbookEntry[] {
    return this.passbook;
  }

  public getLoading(): boolean {
    return this.isLoading;
  }

  public getError(): string | null {
    return this.error;
  }

  /**
   * Fetches latest member and profile state from backend API (with single-flight guard)
   */
  public fetchMember = async (force = false): Promise<MemberProfile> => {
    if (this.isFetching) return this.member;
    if (this.hasFetched && !force) return this.member;

    this.isFetching = true;
    this.isLoading = true;
    this.error = null;

    try {
      const [membershipRes, userRes, impactRes] = await Promise.allSettled([
        memberService.getOwnMembership(),
        memberService.getOwnProfile(),
        memberService.getOwnImpact(),
      ]);

      let changed = false;

      if (membershipRes.status === 'fulfilled' && membershipRes.value) {
        const memData = membershipRes.value.data || membershipRes.value;
        if (memData) {
          const rawJoinDate =
            memData.start_date ||
            memData.applied_at ||
            memData.created_at ||
            memData.valid_from;
          const rawValidUpto =
            memData.expiry_date ||
            memData.valid_until ||
            memData.valid_upto;

          this.member = {
            ...this.member,
            id: memData.id || this.member.id,
            membershipNumber: memData.membership_number || this.member.membershipNumber,
            applicationNumber: memData.application_number || this.member.applicationNumber,
            validFrom: rawJoinDate || this.member.validFrom,
            validUpto: rawValidUpto || this.member.validUpto,
            joiningDate: rawJoinDate || this.member.joiningDate,
            categoryTitle:
              memData.category?.name ||
              memData.application_data?.post_title ||
              memData.application_data?.category_title ||
              memData.category_title ||
              this.member.categoryTitle,
            status: (memData.status || this.member.status).toUpperCase() as MemberStatus,
          };
          changed = true;
        }
      }

      if (userRes.status === 'fulfilled' && userRes.value) {
        const uData = userRes.value.data || userRes.value;
        if (uData) {
          this.member = {
            ...this.member,
            fullName: uData.full_name || this.member.fullName,
            email: uData.email || this.member.email,
            phone: uData.mobile_number || uData.phone || this.member.phone,
            avatarUrl: uData.avatar || uData.avatar_url || this.member.avatarUrl,
            bloodGroup: uData.blood_group || this.member.bloodGroup,
          };
          changed = true;
        }
      }

      if (impactRes.status === 'fulfilled' && impactRes.value) {
        const impact = impactRes.value.data || impactRes.value;
        if (impact) {
          this.member = {
            ...this.member,
            stats: {
              ...this.member.stats,
              totalDonated: impact.totalDonations !== undefined ? Number(impact.totalDonations) : this.member.stats.totalDonated,
              donationCount: impact.causesSupported !== undefined ? Number(impact.causesSupported) : this.member.stats.donationCount,
              eventsAttended: impact.eventsAttended !== undefined ? Number(impact.eventsAttended) : this.member.stats.eventsAttended,
              ticketsCount: impact.complaintsSubmitted !== undefined ? Number(impact.complaintsSubmitted) : this.member.stats.ticketsCount,
            },
          };
          changed = true;
        }
      }

      this.hasFetched = true;
      if (changed) {
        this.notify();
      }
    } catch (err: any) {
      this.error = err?.message || 'Could not sync with backend';
    } finally {
      this.isFetching = false;
      this.isLoading = false;
    }

    return this.member;
  };

  /**
   * Updates personal profile information
   */
  public updateProfile = async (payload: UpdateProfilePayload): Promise<boolean> => {
    try {
      try {
        await memberService.updateOwnProfile(payload);
      } catch {
        // Fallback for offline simulation
      }

      this.member = {
        ...this.member,
        fullName: payload.full_name !== undefined ? payload.full_name : this.member.fullName,
        email: payload.email !== undefined ? payload.email : this.member.email,
        phone: payload.phone !== undefined ? payload.phone : this.member.phone,
        avatarUrl: payload.avatar !== undefined ? payload.avatar : this.member.avatarUrl,
        bloodGroup: payload.blood_group !== undefined ? payload.blood_group : this.member.bloodGroup,
      };

      this.notify();
      return true;
    } catch {
      return false;
    }
  };

  /**
   * Extends membership validity (e.g. after renewal payment)
   */
  public extendValidity = (yearsToAdd: number = 1): void => {
    const currentEnd = new Date(this.member.validUpto);
    const baseDate = currentEnd.getTime() > Date.now() ? currentEnd : new Date();
    baseDate.setFullYear(baseDate.getFullYear() + yearsToAdd);

    this.member = {
      ...this.member,
      validUpto: baseDate.toISOString().split('T')[0],
      status: 'ACTIVE',
    };
    this.notify();
  };

  /**
   * Complete Membership Renewal workflow:
   * Extends validity, records passbook entry, updates status
   */
  public processRenewal = async (
    packageId: string,
    paymentMethod: 'UPI' | 'NET_BANKING' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASHFREE',
    gatewayTxnId?: string
  ): Promise<{ success: boolean; receipt: MemberPassbookEntry }> => {
    const pkg = MEMBER_RENEWAL_PACKAGES.find((p) => p.id === packageId) || MEMBER_RENEWAL_PACKAGES[0];
    
    // Extend validity
    this.extendValidity(pkg.durationYears);

    // If upgrading tier
    if (pkg.id === 'upgrade_state') {
      this.member.categoryTitle = 'State Unit Post Member';
      this.member.designation = 'State Executive Delegate';
    } else if (pkg.id === 'upgrade_life') {
      this.member.categoryTitle = 'National Life Patron';
      this.member.designation = 'National Life Patron';
    }

    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `HRSJM/REC/${currentYear}/${randomSuffix}`;
    const txnId = gatewayTxnId || `CF_REN_${Date.now()}`;

    const newReceipt: MemberPassbookEntry = {
      id: `tx-${Date.now()}`,
      receiptNumber,
      date: new Date().toISOString(),
      type: 'MEMBERSHIP_RENEWAL',
      title: `Membership Renewal - ${pkg.name}`,
      description: `Term extension of ${pkg.durationYears} year(s) for ${this.member.fullName} (${this.member.membershipNumber})`,
      amount: pkg.fee,
      paymentMethod,
      transactionId: txnId,
      status: 'SUCCESS',
      has80GReceipt: false,
    };

    this.passbook.unshift(newReceipt);
    this.notify();

    return { success: true, receipt: newReceipt };
  };

  /**
   * Records a Cause Donation and adds to member stats and passbook
   */
  public processDonation = async (
    causeTitle: string,
    amount: number,
    paymentMethod: 'UPI' | 'NET_BANKING' | 'CREDIT_CARD' | 'DEBIT_CARD' | 'CASHFREE',
    donorPan?: string,
    gatewayTxnId?: string
  ): Promise<{ success: boolean; receipt: MemberPassbookEntry }> => {
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const receiptNumber = `HRSJM/REC/${currentYear}/${randomSuffix}`;
    const txnId = gatewayTxnId || `CF_DON_${Date.now()}`;

    const newReceipt: MemberPassbookEntry = {
      id: `tx-${Date.now()}`,
      receiptNumber,
      date: new Date().toISOString(),
      type: 'DONATION',
      title: `Contribution to ${causeTitle}`,
      description: `Philanthropic donation towards human rights advocacy and victim relief`,
      amount,
      paymentMethod,
      transactionId: txnId,
      status: 'SUCCESS',
      has80GReceipt: true,
      donorPan: donorPan || 'ABCDE1234F',
      section80GRef: `AAATH1234F${currentYear}${randomSuffix}`,
    };

    this.member.stats.totalDonated += amount;
    this.member.stats.donationCount += 1;
    this.passbook.unshift(newReceipt);
    this.notify();

    return { success: true, receipt: newReceipt };
  };

  /**
   * Developer helper to switch between Active, Expiring, and Expired states
   */
  public setDevMemberState = (mode: 'active' | 'expiring' | 'expired'): void => {
    if (mode === 'active') {
      this.member = { ...INITIAL_DEV_MEMBER };
    } else if (mode === 'expiring') {
      this.member = { ...EXPIRING_DEV_MEMBER };
    } else if (mode === 'expired') {
      this.member = { ...EXPIRED_DEV_MEMBER };
    }
    this.notify();
  };
}

export const memberStore = new MemberStore();

/**
 * Custom React hook to subscribe to member state
 */
export const useCurrentMember = () => {
  useSyncExternalStore(memberStore.subscribe, memberStore.getSnapshot, memberStore.getSnapshot);
  return {
    member: memberStore.getMember(),
    passbook: memberStore.getPassbook(),
    loading: memberStore.getLoading(),
    error: memberStore.getError(),
    fetchMember: memberStore.fetchMember,
    updateProfile: memberStore.updateProfile,
    extendValidity: memberStore.extendValidity,
    processRenewal: memberStore.processRenewal,
    processDonation: memberStore.processDonation,
    setDevMemberState: memberStore.setDevMemberState,
  };
};
