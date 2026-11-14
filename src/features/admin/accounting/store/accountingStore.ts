import type {
  AccountItem,
  CreateAccountPayload,
  UpdateAccountPayload,
  JournalEntryItem,
  CreateJournalPayload,
  LedgerTransaction,
  LedgerSummary,
  AccountCategory,
} from '../types/accounting.types';
import { accountingService } from '../services/accountingService';
import {
  INITIAL_ACCOUNTS,
  INITIAL_JOURNAL_ENTRIES,
  INITIAL_LEDGER_TRANSACTIONS,
} from '../data/accountingFixtures';

interface AccountingStoreState {
  accounts: AccountItem[];
  journals: JournalEntryItem[];
  transactions: LedgerTransaction[];
  summary: LedgerSummary;
  isLoading: boolean;
  error: string | null;
}

type Listener = () => void;

class AccountingStore {
  private accounts: AccountItem[] = INITIAL_ACCOUNTS;
  private journals: JournalEntryItem[] = INITIAL_JOURNAL_ENTRIES;
  private transactions: LedgerTransaction[] = INITIAL_LEDGER_TRANSACTIONS;
  private summary: LedgerSummary = {
    opening_balance: 0,
    total_debit: 0,
    total_credit: 0,
    closing_balance: 0,
    net_change: 0,
  };
  private isLoading = false;
  private error: string | null = null;
  private listeners = new Set<Listener>();
  private cachedSnapshot: AccountingStoreState;

  constructor() {
    this.cachedSnapshot = {
      accounts: this.accounts,
      journals: this.journals,
      transactions: this.transactions,
      summary: this.summary,
      isLoading: this.isLoading,
      error: this.error,
    };
  }

  private emit(): void {
    this.cachedSnapshot = {
      accounts: [...this.accounts],
      journals: [...this.journals],
      transactions: [...this.transactions],
      summary: { ...this.summary },
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

  public getSnapshot = (): AccountingStoreState => {
    return this.cachedSnapshot;
  };

  public async fetchAll(): Promise<void> {
    this.isLoading = true;
    this.emit();

    try {
      const [accs, jvRes, ldgRes] = await Promise.all([
        accountingService.listAccounts(),
        accountingService.listEntries(),
        accountingService.getGlobalLedger(),
      ]);

      if (accs && accs.length > 0) this.accounts = accs;
      if (jvRes && jvRes.items.length > 0) this.journals = jvRes.items;
      if (ldgRes) {
        this.transactions = ldgRes.transactions;
        this.summary = ldgRes.summary;
      }
      this.error = null;
    } catch (err: unknown) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch accounting data';
    } finally {
      this.isLoading = false;
      this.emit();
    }
  }

  public async createAccount(payload: CreateAccountPayload): Promise<AccountItem> {
    const created = await accountingService.createAccount(payload);
    this.accounts.push(created);
    this.emit();
    return created;
  }

  public async updateAccount(id: string, payload: UpdateAccountPayload): Promise<AccountItem> {
    const updated = await accountingService.updateAccount(id, payload);
    const idx = this.accounts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.accounts[idx] = updated;
      this.emit();
    }
    return updated;
  }

  public async toggleAccountStatus(id: string, is_active: boolean): Promise<AccountItem> {
    const updated = await accountingService.updateAccountStatus(id, is_active);
    const idx = this.accounts.findIndex((a) => a.id === id);
    if (idx !== -1) {
      this.accounts[idx] = updated;
      this.emit();
    }
    return updated;
  }

  public async createJournalEntry(payload: CreateJournalPayload): Promise<JournalEntryItem> {
    const created = await accountingService.createEntry(payload);
    this.journals.unshift(created);
    // Refresh ledger after journal creation
    const ldg = await accountingService.getGlobalLedger();
    this.transactions = ldg.transactions;
    this.summary = ldg.summary;
    this.emit();
    return created;
  }

  public async reverseJournalEntry(id: string, reason: string): Promise<JournalEntryItem> {
    const reversed = await accountingService.reverseEntry(id, reason);
    const idx = this.journals.findIndex((j) => j.id === id);
    if (idx !== -1) {
      this.journals[idx] = reversed;
    }
    const ldg = await accountingService.getGlobalLedger();
    this.transactions = ldg.transactions;
    this.summary = ldg.summary;
    this.emit();
    return reversed;
  }

  public getAccountsByCategory(category: AccountCategory): AccountItem[] {
    if (category === 'ALL') return this.accounts;
    return this.accounts.filter((a) => a.account_type === category);
  }
}

export const accountingStore = new AccountingStore();
