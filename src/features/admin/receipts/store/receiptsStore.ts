import type {
  ReceiptEntryItem,
  CreateReceiptPayload,
  UpdateReceiptPayload,
} from '../types/receipts.types';
import { receiptsService } from '../services/receiptsService';

const STORAGE_KEY = 'hrsjm_local_receipts_v1';

interface ReceiptsStoreState {
  vouchers: ReceiptEntryItem[];
  isLoading: boolean;
  error: string | null;
}

type Listener = () => void;

class ReceiptsStore {
  private vouchers: ReceiptEntryItem[] = [];
  private isLoading = false;
  private error: string | null = null;
  private listeners = new Set<Listener>();
  private cachedSnapshot: ReceiptsStoreState;

  constructor() {
    this.vouchers = this.loadInitial();
    this.cachedSnapshot = {
      vouchers: this.vouchers,
      isLoading: this.isLoading,
      error: this.error,
    };
  }

  private loadInitial(): ReceiptEntryItem[] {
    return [];
  }

  private save(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.vouchers));
    } catch (e) {
      console.warn('ReceiptsStore failed to save to localStorage:', e);
    }
  }

  private emit(): void {
    this.cachedSnapshot = {
      vouchers: [...this.vouchers],
      isLoading: this.isLoading,
      error: this.error,
    };
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

  public getSnapshot = (): ReceiptsStoreState => {
    return this.cachedSnapshot;
  };

  public async fetchVouchers(): Promise<void> {
    this.isLoading = true;
    this.emit();

    try {
      const res = await receiptsService.listReceipts({ limit: 100 });
      if (res.items && res.items.length > 0) {
        this.vouchers = res.items;
        this.save();
      }
      this.error = null;
    } catch (err: unknown) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch receipt vouchers';
    } finally {
      this.isLoading = false;
      this.emit();
    }
  }

  public getVoucher(id: string): ReceiptEntryItem | undefined {
    return this.vouchers.find((v) => v.id === id);
  }

  public async createVoucher(payload: CreateReceiptPayload): Promise<ReceiptEntryItem> {
    const created = await receiptsService.createReceipt(payload);
    // ensure item is in list
    const exists = this.vouchers.some((v) => v.id === created.id);
    if (!exists) {
      this.vouchers.unshift(created);
      this.save();
      this.emit();
    }
    return created;
  }

  public async updateVoucher(id: string, payload: UpdateReceiptPayload): Promise<ReceiptEntryItem> {
    const updated = await receiptsService.updateReceipt(id, payload);
    const idx = this.vouchers.findIndex((v) => v.id === id);
    if (idx !== -1) {
      this.vouchers[idx] = updated;
      this.save();
      this.emit();
    }
    return updated;
  }

  public async cancelVoucher(id: string, reason: string): Promise<ReceiptEntryItem> {
    const cancelled = await receiptsService.updateReceiptStatus(id, 'CANCELLED', reason);
    const idx = this.vouchers.findIndex((v) => v.id === id);
    if (idx !== -1) {
      this.vouchers[idx] = cancelled;
      this.save();
      this.emit();
    }
    return cancelled;
  }
}

export const receiptsStore = new ReceiptsStore();
