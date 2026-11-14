import type {
  CreateExpensePayload,
  ExpenseEntryItem,
  ExpenseStatsSummary,
} from '../types/expenses.types';
import { expensesService } from '../services/expensesService';

const STORAGE_KEY = 'hrsjm_local_expenses_v1';

class ExpensesStore {
  private vouchers: ExpenseEntryItem[] = [];
  private listeners: Set<() => void> = new Set();
  private version = 0;
  private cachedSnapshot: { vouchers: ExpenseEntryItem[]; version: number };

  constructor() {
    this.vouchers = this.loadPersisted();
    this.sortInternal();
    this.cachedSnapshot = {
      vouchers: this.vouchers,
      version: this.version,
    };
    this.syncFromBackend();
  }

  private sortInternal(): void {
    this.vouchers.sort((a, b) => {
      const timeB = new Date(b.created_at || b.expense_date || 0).getTime() || 0;
      const timeA = new Date(a.created_at || a.expense_date || 0).getTime() || 0;
      if (timeB !== timeA) return timeB - timeA;
      return (b.voucher_number || '').localeCompare(a.voucher_number || '');
    });
  }

  private loadPersisted(): ExpenseEntryItem[] {
    return [];
  }

  private persist(): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(this.vouchers));
      }
    } catch {
      // Ignore quota errors
    }
  }

  private notify(): void {
    this.version += 1;
    this.cachedSnapshot = {
      vouchers: [...this.vouchers],
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

  public getSnapshot = (): { vouchers: ExpenseEntryItem[]; version: number } => {
    return this.cachedSnapshot;
  };

  public getAll(): ExpenseEntryItem[] {
    return [...this.vouchers];
  }

  public getById(id: string): ExpenseEntryItem | undefined {
    return this.vouchers.find((v) => v.id === id || v.voucher_number === id);
  }

  public getStats(): ExpenseStatsSummary {
    const all = this.vouchers.length;
    const posted = this.vouchers.filter((v) => v.status === 'POSTED').length;
    const cancelled = this.vouchers.filter((v) => v.status === 'CANCELLED').length;
    const totalAmount = this.vouchers
      .filter((v) => v.status === 'POSTED')
      .reduce((sum, v) => sum + (Number(v.amount) || 0), 0);

    return { all, posted, cancelled, totalAmount };
  }

  public async syncFromBackend(): Promise<void> {
    try {
      const { items } = await expensesService.list({ limit: 100 });
      if (Array.isArray(items)) {
        this.vouchers = items;
        this.sortInternal();
        this.notify();
      }
    } catch (e) {
      console.warn('Could not sync expenses from backend:', e);
    }
  }

  public async create(payload: CreateExpensePayload): Promise<ExpenseEntryItem> {
    const created = await expensesService.create(payload);
    await this.syncFromBackend();
    return created;
  }

  public async cancel(id: string, reason?: string): Promise<boolean> {
    const idx = this.vouchers.findIndex((v) => v.id === id);
    if (idx === -1) return false;

    this.vouchers[idx] = {
      ...this.vouchers[idx],
      status: 'CANCELLED',
      cancellation_reason: reason || 'Cancelled by administrator',
      updated_at: new Date().toISOString(),
    };
    this.notify();

    expensesService.cancel(id, reason).catch(() => {});
    return true;
  }

  public async delete(id: string): Promise<boolean> {
    this.vouchers = this.vouchers.filter((v) => v.id !== id);
    this.notify();
    return true;
  }
}

export const expensesStore = new ExpensesStore();
