import { useSyncExternalStore } from 'react';
import type {
  CreateDonationInput,
  Donation,
  DonationCategory,
  DonationStatItem,
  DonationStatus,
  DateRange,
} from '../types/donations.types';
import {
  INITIAL_DONATIONS,
  computeDonationStats,
  computeTabCounts,
} from '../data/donationsFixtures';
import { donationsService } from '../services/donationsService';

export interface DonationsStoreState {
  donations: Donation[];
  activeTab: DonationCategory;
  search: string;
  status: DonationStatus | null;
  source: string | null;
  dateRange: DateRange;
  stats: DonationStatItem[];
  tabCounts: { all: number; oneTime: number; recurring: number; offline: number };
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
}

type Listener = () => void;

class DonationsStore {
  private donations: Donation[] = INITIAL_DONATIONS;
  private activeTab: DonationCategory = 'ALL';
  private search = '';
  private status: DonationStatus | null = null;
  private source: string | null = null;
  private dateRange: DateRange = { from: null, to: null };
  private isLoading = false;
  private isRefreshing = false;
  private error: string | null = null;

  private listeners = new Set<Listener>();
  private cachedSnapshot: DonationsStoreState;

  constructor() {
    this.cachedSnapshot = this.buildSnapshot();
  }

  private buildSnapshot(): DonationsStoreState {
    const stats = computeDonationStats(this.donations, this.dateRange);
    const tabCounts = computeTabCounts(this.donations, this.dateRange);

    return {
      donations: this.donations,
      activeTab: this.activeTab,
      search: this.search,
      status: this.status,
      source: this.source,
      dateRange: { ...this.dateRange },
      stats,
      tabCounts,
      isLoading: this.isLoading,
      isRefreshing: this.isRefreshing,
      error: this.error,
    };
  }

  private emit(): void {
    this.cachedSnapshot = this.buildSnapshot();
    for (const listener of this.listeners) {
      listener();
    }
  }

  public subscribe = (listener: Listener): (() => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  public getSnapshot = (): DonationsStoreState => {
    return this.cachedSnapshot;
  };

  public setTab(tab: DonationCategory): void {
    this.activeTab = tab;
    this.emit();
  }

  public setSearch(search: string): void {
    this.search = search;
    this.emit();
  }

  public setStatus(status: DonationStatus | null): void {
    this.status = status;
    this.emit();
  }

  public setSource(source: string | null): void {
    this.source = source;
    this.emit();
  }

  public setDateRange(range: DateRange): void {
    this.dateRange = { ...range };
    this.emit();
  }

  public resetFilters(): void {
    this.activeTab = 'ALL';
    this.search = '';
    this.status = null;
    this.source = null;
    this.dateRange = { from: null, to: null };
    this.emit();
  }

  public async fetchDonations(): Promise<void> {
    this.isLoading = true;
    this.emit();
    try {
      const items = await donationsService.getDonations();
      this.donations = items;
      this.error = null;
    } catch (err: any) {
      this.error = err.message || 'Failed to load donations';
    } finally {
      this.isLoading = false;
      this.emit();
    }
  }

  public async refresh(): Promise<void> {
    this.isRefreshing = true;
    this.emit();
    try {
      const items = await donationsService.getDonations();
      this.donations = items;
      this.error = null;
    } catch (err: any) {
      this.error = err.message || 'Failed to refresh donations';
    } finally {
      this.isRefreshing = false;
      this.emit();
    }
  }

  public async addDonation(input: CreateDonationInput): Promise<Donation> {
    const created = await donationsService.createDonation(input);
    this.donations = [created, ...this.donations];
    this.emit();
    return created;
  }

  public recordCompletedDonation(donation: Donation): void {
    this.donations = [donation, ...this.donations.filter(d => d.id !== donation.id)];
    this.emit();
  }

  public async refundDonation(id: string, reason?: string): Promise<void> {
    await donationsService.refundDonation(id, reason);
    this.donations = this.donations.map(d =>
      d.id === id ? { ...d, status: 'REFUNDED' } : d
    );
    this.emit();
  }
}

export const donationsStore = new DonationsStore();

export function useDonationsStore(): DonationsStoreState {
  return useSyncExternalStore(donationsStore.subscribe, donationsStore.getSnapshot);
}

