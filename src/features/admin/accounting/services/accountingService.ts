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
import { apiClient } from '@/api/client';

const ACCOUNTS_STORAGE_KEY = 'hrsjm_local_accounts_v1';
const JOURNALS_STORAGE_KEY = 'hrsjm_local_journals_v1';
const LEDGER_STORAGE_KEY = 'hrsjm_local_ledger_v1';

function getStoredAccounts(): AccountItem[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse cached accounts:', e);
  }
  return [];
}

function saveStoredAccounts(accounts: AccountItem[]): void {
  try {
    localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
  } catch (e) {
    console.warn('Failed to save accounts to localStorage:', e);
  }
}

function getStoredJournals(): JournalEntryItem[] {
  try {
    const raw = localStorage.getItem(JOURNALS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse cached journals:', e);
  }
  return [];
}

function saveStoredJournals(journals: JournalEntryItem[]): void {
  try {
    localStorage.setItem(JOURNALS_STORAGE_KEY, JSON.stringify(journals));
  } catch (e) {
    console.warn('Failed to save journals to localStorage:', e);
  }
}

function getStoredLedger(): LedgerTransaction[] {
  try {
    const raw = localStorage.getItem(LEDGER_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.warn('Failed to parse cached ledger:', e);
  }
  return [];
}

function saveStoredLedger(ledger: LedgerTransaction[]): void {
  try {
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger));
  } catch (e) {
    console.warn('Failed to save ledger to localStorage:', e);
  }
}

export const accountingService = {
  // ================= Chart of Accounts =================
  async listAccounts(category?: AccountCategory): Promise<AccountItem[]> {
    try {
      const res = await apiClient.get<any>('/accounts', {
        params: category && category !== 'ALL' ? { account_type: category } : undefined,
      });
      const items = Array.isArray(res) ? res : res?.items || res?.data?.items || res?.data;
      if (Array.isArray(items)) return items;
    } catch {
      // Offline fallback
    }

    const all = getStoredAccounts();
    if (!category || category === 'ALL') return all;
    return all.filter((a) => a.account_type === category);
  },

  async getAccountById(id: string): Promise<AccountItem | null> {
    try {
      const data = await apiClient.get<AccountItem>(`/accounts/${id}`);
      if (data && data.id) return data;
    } catch {
      // Offline fallback
    }

    const all = getStoredAccounts();
    return all.find((a) => a.id === id) || null;
  },

  async createAccount(payload: CreateAccountPayload): Promise<AccountItem> {
    try {
      const created = await apiClient.post<AccountItem>('/accounts', payload);
      if (created && created.id) {
        const all = getStoredAccounts();
        all.push(created);
        saveStoredAccounts(all);
        return created;
      }
    } catch {
      // Offline fallback
    }

    const all = getStoredAccounts();
    const newId = `acc-${payload.account_type.toLowerCase().slice(0, 3)}-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const newAcc: AccountItem = {
      id: newId,
      account_code: payload.account_code || String(1000 + all.length),
      account_name: payload.account_name,
      account_type: payload.account_type,
      parent_account_id: payload.parent_account_id || null,
      description: payload.description || null,
      is_active: true,
      balance: 0,
      created_at: nowIso,
      updated_at: nowIso,
    };

    all.push(newAcc);
    saveStoredAccounts(all);
    return newAcc;
  },

  async updateAccount(id: string, payload: UpdateAccountPayload): Promise<AccountItem> {
    try {
      const updated = await apiClient.patch<AccountItem>(`/accounts/${id}`, payload);
      if (updated && updated.id) {
        const all = getStoredAccounts();
        const idx = all.findIndex((a) => a.id === id);
        if (idx !== -1) {
          all[idx] = updated;
          saveStoredAccounts(all);
        }
        return updated;
      }
    } catch {
      // Offline fallback
    }

    const all = getStoredAccounts();
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Account not found');

    all[idx] = {
      ...all[idx],
      account_name: payload.account_name ?? all[idx].account_name,
      account_code: payload.account_code ?? all[idx].account_code,
      parent_account_id: payload.parent_account_id ?? all[idx].parent_account_id,
      description: payload.description ?? all[idx].description,
      updated_at: new Date().toISOString(),
    };

    saveStoredAccounts(all);
    return all[idx];
  },

  async updateAccountStatus(id: string, is_active: boolean): Promise<AccountItem> {
    try {
      const updated = await apiClient.patch<AccountItem>(`/accounts/${id}/status`, { is_active });
      if (updated && updated.id) {
        const all = getStoredAccounts();
        const idx = all.findIndex((a) => a.id === id);
        if (idx !== -1) {
          all[idx] = updated;
          saveStoredAccounts(all);
        }
        return updated;
      }
    } catch {
      // Offline fallback
    }

    const all = getStoredAccounts();
    const idx = all.findIndex((a) => a.id === id);
    if (idx === -1) throw new Error('Account not found');

    all[idx].is_active = is_active;
    all[idx].updated_at = new Date().toISOString();
    saveStoredAccounts(all);
    return all[idx];
  },

  // ================= Journal Entries =================
  async listEntries(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: JournalEntryItem[]; total: number }> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params?.status && params.status !== 'ALL') queryParams.status = params.status;
      if (params?.search) queryParams.search = params.search;
      if (params?.page) queryParams.page = params.page;
      queryParams.limit = params?.limit ? Math.min(params.limit, 100) : 100;

      const res = await apiClient.get<any>('/accounting/entries', {
        params: queryParams,
      });

      const rawList = res && Array.isArray(res.items) ? res.items : Array.isArray(res) ? res : [];
      if (rawList.length > 0) {
        const normalized: JournalEntryItem[] = rawList.map((e: any) => {
          const lines = (e.lines || []).map((l: any, i: number) => ({
            id: l.id || `jel-${e.id}-${i + 1}`,
            account_id: l.account_id || l.account?.id,
            account: l.account
              ? {
                  id: l.account.id,
                  account_name: l.account.account_name,
                  account_code: l.account.account_code,
                  account_type: l.account.account_type,
                }
              : null,
            debit: Number(l.debit_amount ?? l.debit ?? 0),
            credit: Number(l.credit_amount ?? l.credit ?? 0),
            narration: l.narration || l.line_description || '',
          }));

          let totalDebit = Number(e.total_debit ?? 0);
          let totalCredit = Number(e.total_credit ?? 0);
          if (totalDebit === 0 && totalCredit === 0 && lines.length > 0) {
            lines.forEach((l: any) => {
              totalDebit += l.debit;
              totalCredit += l.credit;
            });
          }

          return {
            id: e.id,
            entry_number: e.entry_number,
            reference_type: e.reference_type,
            reference_id: e.reference_id,
            entry_type: e.entry_type || 'STANDARD',
            narration: e.narration || e.description || '',
            entry_date: e.entry_date,
            is_reversed: Boolean(e.is_reversed),
            reversal_entry_id: e.reversal_entry_id,
            reversed_by_id: e.reversed_by_id,
            reversal_reason: e.reversal_reason,
            total_debit: totalDebit,
            total_credit: totalCredit,
            lines,
            created_at: e.created_at,
          };
        });

        return { items: normalized, total: res.total || normalized.length };
      }
    } catch {
      // Offline fallback
    }

    const all = getStoredJournals();
    let filtered = [...all];

    if (params?.status === 'POSTED') {
      filtered = filtered.filter((j) => !j.is_reversed);
    } else if (params?.status === 'REVERSED') {
      filtered = filtered.filter((j) => j.is_reversed || j.entry_type === 'REVERSAL');
    }

    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (j) =>
          j.entry_number.toLowerCase().includes(q) ||
          (j.narration || '').toLowerCase().includes(q)
      );
    }

    return { items: filtered, total: filtered.length };
  },

  async getEntryById(id: string): Promise<JournalEntryItem | null> {
    try {
      const data = await apiClient.get<JournalEntryItem>(`/accounting/entries/${id}`);
      if (data && data.id) return data;
    } catch {
      // Offline fallback
    }

    const all = getStoredJournals();
    return all.find((j) => j.id === id) || null;
  },

  async createEntry(payload: CreateJournalPayload): Promise<JournalEntryItem> {
    const all = getStoredJournals();
    const accounts = getStoredAccounts();
    const seq = all.length + 1;
    const entryNumber = `JV-2026-${String(seq).padStart(4, '0')}`;
    const newId = `je-local-${Date.now()}`;
    const nowIso = new Date().toISOString();

    let totalDebit = 0;
    let totalCredit = 0;

    const lines = payload.lines.map((l, i) => {
      const acc = accounts.find((a) => a.id === l.account_id);
      totalDebit += Number(l.debit) || 0;
      totalCredit += Number(l.credit) || 0;
      return {
        id: `jel-${newId}-${i + 1}`,
        account_id: l.account_id,
        account: acc
          ? {
              id: acc.id,
              account_name: acc.account_name,
              account_code: acc.account_code,
              account_type: acc.account_type,
            }
          : null,
        debit: Number(l.debit) || 0,
        credit: Number(l.credit) || 0,
        narration: l.narration,
      };
    });

    const newEntry: JournalEntryItem = {
      id: newId,
      entry_number: entryNumber,
      entry_date: payload.entry_date,
      entry_type: 'STANDARD',
      narration: payload.narration,
      is_reversed: false,
      total_debit: totalDebit,
      total_credit: totalCredit,
      lines,
      created_at: nowIso,
    };

    all.unshift(newEntry);
    saveStoredJournals(all);

    // Also append corresponding transactions to ledger
    const ledger = getStoredLedger();
    lines.forEach((line) => {
      if (line.account) {
        const isDebit = (line.debit || 0) > 0;
        const currentBal = ledger.length > 0 ? ledger[0].running_balance : 500000;
        const newBal = isDebit ? currentBal + (line.debit || 0) : currentBal - (line.credit || 0);

        ledger.unshift({
          id: `ltx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          entry_id: newId,
          entry_number: entryNumber,
          entry_date: payload.entry_date,
          entry_type: 'STANDARD',
          account_id: line.account.id,
          account_name: line.account.account_name,
          account_code: line.account.account_code,
          account_type: line.account.account_type || 'ASSET',
          reference_type: 'JOURNAL_VOUCHER',
          reference_id: newId,
          narration: line.narration || payload.narration,
          debit: line.debit || 0,
          credit: line.credit || 0,
          running_balance: newBal,
          category_tag: 'RECEIPT',
        });
      }
    });
    saveStoredLedger(ledger);

    return newEntry;
  },

  async reverseEntry(id: string, reason: string): Promise<JournalEntryItem> {
    try {
      const data = await apiClient.post<JournalEntryItem>(`/accounting/entries/${id}/reverse`, { reason });
      if (data && data.id) return data;
    } catch {
      // Offline fallback
    }

    const all = getStoredJournals();
    const idx = all.findIndex((j) => j.id === id);
    if (idx === -1) throw new Error('Journal entry not found');

    const original = all[idx];
    original.is_reversed = true;
    original.reversal_reason = reason;

    // Create opposite reversal journal entry
    const seq = all.length + 1;
    const reversalNumber = `JV-2026-${String(seq).padStart(4, '0')}`;
    const reversalId = `je-rev-${Date.now()}`;

    const reversedLines = (original.lines || []).map((l, i) => ({
      id: `jel-${reversalId}-${i + 1}`,
      account_id: l.account_id,
      account: l.account,
      debit: l.credit || 0, // Swapped
      credit: l.debit || 0, // Swapped
      narration: `Reversal of line in ${original.entry_number}`,
    }));

    const reversalEntry: JournalEntryItem = {
      id: reversalId,
      entry_number: reversalNumber,
      entry_date: new Date().toISOString().slice(0, 10),
      entry_type: 'REVERSAL',
      narration: `[REVERSED] Correction of ${original.entry_number}: ${reason}`,
      is_reversed: false,
      reversal_entry_id: original.id,
      reversal_reason: reason,
      total_debit: original.total_credit,
      total_credit: original.total_debit,
      lines: reversedLines,
      created_at: new Date().toISOString(),
    };

    all.unshift(reversalEntry);
    saveStoredJournals(all);

    return original;
  },

  // ================= General Ledger & Passbook =================
  async getGlobalLedger(params?: {
    from_date?: string;
    to_date?: string;
    search?: string;
    account_id?: string;
    stream?: string;
    source?: string;
  }): Promise<{
    transactions: LedgerTransaction[];
    summary: LedgerSummary;
  }> {
    // Helper classification functions for stream and source
    const detectStreamCategory = (
      tag: string,
      refType: string,
      desc: string,
      isExpense: boolean
    ): string => {
      const d = (desc || '').toLowerCase();
      const r = (refType || '').toUpperCase();
      if (isExpense || r.includes('EXPENSE')) return 'EXPENSE';
      if (
        tag === 'CAUSE_FUND' ||
        d.includes('cause:') ||
        d.includes('emergency') ||
        d.includes('seeker') ||
        d.includes('relief') ||
        d.includes('medical')
      ) {
        return 'CAUSE_DONATION';
      }
      if (d.includes('renew')) return 'RENEWAL';
      if (r.includes('MEMBERSHIP') || d.includes('membership') || d.includes('member/user')) {
        return 'MEMBERSHIP';
      }
      if (r.includes('DONATION') || d.includes('donation')) return 'DONATION';
      return 'DONATION';
    };

    const detectSourceChannel = (
      isWebApp: boolean,
      voucherNo: string,
      refNo: string,
      desc: string,
      party: string
    ): string => {
      const text = `${desc} ${voucherNo} ${refNo} ${party}`.toLowerCase();
      if (isWebApp || text.includes('web-app') || text.includes('[source: web app]')) {
        return 'WEB_APP';
      }
      if (
        text.includes('application') ||
        text.includes('applicaition') ||
        text.includes('mobile') ||
        text.includes('apk') ||
        text.includes('member/user')
      ) {
        return 'APPLICATION';
      }
      if (
        text.includes('website') ||
        text.includes('cashfree') ||
        text.includes('online') ||
        text.includes('gateway') ||
        text.includes('public/guest')
      ) {
        return 'WEBSITE';
      }
      return 'WEBSITE';
    };

    // Helper to fetch paginated backend lists safely within backend validation limit (max 100)
    const fetchPagedItems = async (
      endpoint: string,
      queryParams: Record<string, string | number> = {}
    ): Promise<any[]> => {
      try {
        let allItems: any[] = [];
        let page = 1;
        const maxPages = 5; // Up to 500 records
        while (page <= maxPages) {
          const res = await apiClient.get<any>(endpoint, {
            params: { ...queryParams, page, limit: 100 },
          });
          const items =
            res && Array.isArray(res.items)
              ? res.items
              : res && Array.isArray(res.data?.items)
              ? res.data.items
              : Array.isArray(res)
              ? res
              : [];
          allItems = allItems.concat(items);
          const total =
            res?.total ?? res?.meta?.total ?? res?.data?.total ?? allItems.length;
          if (allItems.length >= total || items.length === 0 || items.length < 100) {
            break;
          }
          page++;
        }
        return allItems;
      } catch (err) {
        console.warn(`Failed to fetch items from ${endpoint}:`, err);
        return [];
      }
    };

    try {
      // 1. Fetch real accounting entries, expense vouchers, receipt entries, and raw ledger in parallel
      const fromDate = params?.from_date || '2025-01-01';
      const toDate = params?.to_date || '2027-12-31';

      const [rawEntries, rawExpenses, rawReceipts, rawLedgerItems] = await Promise.all([
        fetchPagedItems('/accounting/entries'),
        fetchPagedItems('/expense-entries'),
        fetchPagedItems('/receipt-entries'),
        fetchPagedItems('/accounting/ledger', {
          from_date: fromDate,
          to_date: toDate,
        }),
      ]);

      // Create quick lookup maps for enrichment
      const expensesById = new Map<string, any>();
      const expensesByVoucher = new Map<string, any>();
      rawExpenses.forEach((exp: any) => {
        if (exp?.id) expensesById.set(exp.id, exp);
        if (exp?.voucher_number) expensesByVoucher.set(exp.voucher_number, exp);
      });

      const receiptsById = new Map<string, any>();
      const receiptsByVoucher = new Map<string, any>();
      rawReceipts.forEach((rec: any) => {
        if (rec?.id) receiptsById.set(rec.id, rec);
        if (rec?.voucher_number) receiptsByVoucher.set(rec.voucher_number, rec);
      });

      const processedEntryNumbers = new Set<string>();
      const consolidatedList: LedgerTransaction[] = [];

      // 2. Process real journal entries into unified single-row transactions
      for (const entry of rawEntries) {
        if (!entry || !entry.entry_number) continue;
        processedEntryNumbers.add(entry.entry_number);

        const lines: any[] = Array.isArray(entry.lines) ? entry.lines : [];
        const isReversed = Boolean(entry.is_reversed || entry.entry_type === 'REVERSAL');
        const refType = String(entry.reference_type || '').toUpperCase();
        const refId = entry.reference_id;

        // Find Expense head, Income head, and Asset/Bank lines
        const expenseLine = lines.find((l) => {
          const type = String(l?.account?.account_type || '').toUpperCase();
          const debit = Number(l?.debit_amount ?? l?.debit ?? 0);
          return type === 'EXPENSE' || (debit > 0 && type !== 'ASSET');
        });

        const incomeLine = lines.find((l) => {
          const type = String(l?.account?.account_type || '').toUpperCase();
          const credit = Number(l?.credit_amount ?? l?.credit ?? 0);
          return type === 'INCOME' || (credit > 0 && type !== 'ASSET');
        });

        const assetLine = lines.find((l) => {
          const type = String(l?.account?.account_type || '').toUpperCase();
          const name = String(l?.account?.account_name || '').toLowerCase();
          return type === 'ASSET' || name.includes('bank') || name.includes('cash');
        });

        // Determine stream tag
        let streamTag: string = 'RECEIPT';
        let isExpense = false;

        if (refType.includes('EXPENSE') || expenseLine) {
          streamTag = 'EXPENSE';
          isExpense = true;
        } else if (
          refType.includes('DONATION') ||
          (entry.description || '').toLowerCase().includes('donation')
        ) {
          streamTag = 'DONATION';
        } else if (refType.includes('MEMBERSHIP') || refType.includes('RENEWAL')) {
          streamTag = 'MEMBERSHIP_FEE';
        } else if (incomeLine || refType.includes('RECEIPT')) {
          streamTag = 'RECEIPT';
        }

        // Amount calculation
        let amount = 0;
        if (isExpense) {
          amount = Number(
            entry.total_debit ||
            (expenseLine ? expenseLine.debit_amount ?? expenseLine.debit : 0) ||
            (assetLine ? assetLine.credit_amount ?? assetLine.credit : 0) ||
            0
          );
        } else {
          amount = Number(
            entry.total_credit ||
            (incomeLine ? incomeLine.credit_amount ?? incomeLine.credit : 0) ||
            (assetLine ? assetLine.debit_amount ?? assetLine.debit : 0) ||
            0
          );
        }

        // Account Head & Details
        const nominalLine = isExpense ? expenseLine : incomeLine;
        const accountName =
          nominalLine?.account?.account_name ||
          (isExpense ? 'Office & Administration' : 'General Society Income');
        const accountCode = nominalLine?.account?.account_code || (isExpense ? '5002' : '4001');
        const accountId = nominalLine?.account?.id || nominalLine?.account_id || (isExpense ? '5002' : '4001');

        // Asset Disbursing / Receiving Account
        const disbursingAsset =
          assetLine?.account?.account_name ||
          (assetLine?.account?.account_code ? `A/c #${assetLine.account.account_code}` : 'Bank Account');

        // Enrich with matching expense voucher or receipt if available
        const matchedExpense = refId ? expensesById.get(refId) : null;
        const matchedReceipt = refId ? receiptsById.get(refId) : null;

        const voucherNumber =
          matchedExpense?.voucher_number ||
          matchedReceipt?.voucher_number ||
          entry.entry_number;

        const isWebApp = Boolean(
          matchedExpense?.reference_number?.toUpperCase().startsWith('WEB-APP') ||
          matchedExpense?.description?.includes('[Source: Web App]') ||
          entry.description?.includes('[Source: Web App]') ||
          entry.description?.includes('WEB-APP') ||
          (entry.reference_type === 'MANUAL_EXPENSE' &&
            matchedExpense &&
            !matchedExpense.reference_number?.startsWith('REF-EXP'))
        );

        // Payment method detection
        let paymentMethod =
          matchedExpense?.payment_method || matchedReceipt?.payment_method || null;
        if (!paymentMethod) {
          const lineDesc = lines.map((l) => l.line_description || '').join(' ');
          const fullDesc = `${lineDesc} ${entry.description || ''}`;
          if (/cashfree/i.test(fullDesc)) paymentMethod = 'Online (Cashfree)';
          else if (/\bupi\b/i.test(fullDesc)) paymentMethod = 'UPI';
          else if (/\bcash\b/i.test(fullDesc)) paymentMethod = 'Cash';
          else if (/bank|transfer|neft|rtgs|imps/i.test(fullDesc)) paymentMethod = 'Bank Transfer';
          else if (/cheque/i.test(fullDesc)) paymentMethod = 'Cheque';
        }

        const paidTo =
          matchedExpense?.paid_to ||
          (expenseLine?.line_description?.startsWith('Expense: ')
            ? expenseLine.line_description.replace('Expense: ', '').trim()
            : null);
        const receivedFrom = matchedReceipt?.received_from || null;

        const narrationText =
          entry.description ||
          matchedExpense?.description ||
          matchedReceipt?.notes ||
          'Official Society Transaction';

        const streamCategory = detectStreamCategory(
          streamTag,
          refType,
          narrationText,
          isExpense
        );

        const sourceChannel = detectSourceChannel(
          isWebApp,
          voucherNumber,
          matchedExpense?.reference_number || '',
          narrationText,
          paidTo || receivedFrom || ''
        );

        consolidatedList.push({
          id: `ltx-consolidated-${entry.id}`,
          entry_id: entry.id,
          entry_number: entry.entry_number,
          voucher_number: voucherNumber,
          entry_date: entry.entry_date || entry.created_at || new Date().toISOString(),
          created_at: entry.created_at,
          entry_type: entry.entry_type || 'STANDARD',
          account_id: accountId,
          account_name: accountName,
          account_code: accountCode,
          account_type: isExpense ? 'EXPENSE' : 'INCOME',
          reference_type: entry.reference_type || null,
          reference_id: entry.reference_id || null,
          narration: narrationText,
          debit: isExpense ? amount : 0,
          credit: !isExpense ? amount : 0,
          running_balance: 0,
          category_tag: streamTag,
          payment_method: paymentMethod,
          disbursing_account_name: disbursingAsset,
          paid_to: paidTo,
          received_from: receivedFrom,
          status: isReversed ? 'REVERSED' : 'POSTED',
          is_web_app: isWebApp,
          stream_category: streamCategory,
          source_channel: sourceChannel,
        });
      }

      // 3. Process raw ledger lines (group by entry_number if not already included)
      if (rawLedgerItems.length > 0) {
        const ledgerGroups = new Map<string, any[]>();
        for (const item of rawLedgerItems) {
          const num = item?.entry_number || item?.entry?.entry_number;
          if (!num || processedEntryNumbers.has(num)) continue;
          if (!ledgerGroups.has(num)) ledgerGroups.set(num, []);
          ledgerGroups.get(num)!.push(item);
        }

        for (const [entryNum, lines] of ledgerGroups.entries()) {
          processedEntryNumbers.add(entryNum);
          const firstLine = lines[0];
          const entryDate =
            firstLine?.entry_date || firstLine?.entry?.entry_date || new Date().toISOString();
          const createdAt = firstLine?.entry?.created_at || firstLine?.created_at;
          const desc =
            firstLine?.description ||
            firstLine?.entry?.description ||
            firstLine?.line_description ||
            'General transaction';
          const refType = String(
            firstLine?.reference_type || firstLine?.entry?.reference_type || ''
          ).toUpperCase();
          const refId = firstLine?.reference_id || firstLine?.entry?.reference_id;

          // Find nominal line and asset line
          const expenseLine = lines.find((l) => {
            const type = String(l?.account?.account_type || '').toUpperCase();
            const debit = Number(l?.debit_amount ?? l?.debit ?? 0);
            return type === 'EXPENSE' || (debit > 0 && type !== 'ASSET');
          });

          const incomeLine = lines.find((l) => {
            const type = String(l?.account?.account_type || '').toUpperCase();
            const credit = Number(l?.credit_amount ?? l?.credit ?? 0);
            return type === 'INCOME' || (credit > 0 && type !== 'ASSET');
          });

          const assetLine = lines.find((l) => {
            const type = String(l?.account?.account_type || '').toUpperCase();
            const name = String(l?.account?.account_name || '').toLowerCase();
            return type === 'ASSET' || name.includes('bank') || name.includes('cash');
          });

          let streamTag = 'RECEIPT';
          let isExpense = false;
          if (refType.includes('EXPENSE') || expenseLine) {
            streamTag = 'EXPENSE';
            isExpense = true;
          } else if (refType.includes('DONATION') || desc.toLowerCase().includes('donation')) {
            streamTag = 'DONATION';
          } else if (refType.includes('MEMBERSHIP') || refType.includes('RENEWAL')) {
            streamTag = 'MEMBERSHIP_FEE';
          } else if (incomeLine || refType.includes('RECEIPT')) {
            streamTag = 'RECEIPT';
          }

          let amount = 0;
          if (isExpense) {
            amount = Number(
              (expenseLine ? expenseLine.debit_amount ?? expenseLine.debit : 0) ||
              (assetLine ? assetLine.credit_amount ?? assetLine.credit : 0) ||
              firstLine?.debit_amount ||
              0
            );
          } else {
            amount = Number(
              (incomeLine ? incomeLine.credit_amount ?? incomeLine.credit : 0) ||
              (assetLine ? assetLine.debit_amount ?? assetLine.debit : 0) ||
              firstLine?.credit_amount ||
              0
            );
          }

          const nominalLine = isExpense ? expenseLine : incomeLine;
          const accountName =
            nominalLine?.account?.account_name ||
            (isExpense ? 'Office & Administration' : 'Donation Income');
          const accountCode =
            nominalLine?.account?.account_code || (isExpense ? '5002' : '4003');
          const accountId = nominalLine?.account?.id || (isExpense ? '5002' : '4003');
          const disbursingAsset = assetLine?.account?.account_name || 'Bank Account';

          const matchedExpense = refId ? expensesById.get(refId) : null;
          const matchedReceipt = refId ? receiptsById.get(refId) : null;

          const rawIsWebApp = Boolean(
            matchedExpense?.reference_number?.toUpperCase().startsWith('WEB-APP') ||
            desc.includes('WEB-APP')
          );
          const rawStreamCategory = detectStreamCategory(streamTag, refType, desc, isExpense);
          const rawSourceChannel = detectSourceChannel(
            rawIsWebApp,
            matchedExpense?.voucher_number || matchedReceipt?.voucher_number || entryNum,
            matchedExpense?.reference_number || '',
            desc,
            matchedExpense?.paid_to || matchedReceipt?.received_from || ''
          );

          consolidatedList.push({
            id: `ltx-grp-${entryNum}`,
            entry_id: firstLine?.entry_id || entryNum,
            entry_number: entryNum,
            voucher_number:
              matchedExpense?.voucher_number || matchedReceipt?.voucher_number || entryNum,
            entry_date: entryDate,
            created_at: createdAt,
            entry_type: 'STANDARD',
            account_id: accountId,
            account_name: accountName,
            account_code: accountCode,
            account_type: isExpense ? 'EXPENSE' : 'INCOME',
            reference_type: refType,
            reference_id: refId,
            narration: desc,
            debit: isExpense ? amount : 0,
            credit: !isExpense ? amount : 0,
            running_balance: 0,
            category_tag: streamTag,
            payment_method:
              matchedExpense?.payment_method || matchedReceipt?.payment_method || null,
            disbursing_account_name: disbursingAsset,
            paid_to: matchedExpense?.paid_to || null,
            received_from: matchedReceipt?.received_from || null,
            status: 'POSTED',
            is_web_app: rawIsWebApp,
            stream_category: rawStreamCategory,
            source_channel: rawSourceChannel,
          });
        }
      }

      // 4. Ensure any posted expense vouchers from /expense-entries are included
      for (const exp of rawExpenses) {
        if (!exp || exp.status === 'CANCELLED') continue;
        const alreadyIncluded = consolidatedList.some(
          (t) =>
            (exp.id && t.reference_id === exp.id) ||
            (exp.voucher_number && t.voucher_number === exp.voucher_number)
        );
        if (!alreadyIncluded) {
          const isWebApp = Boolean(
            exp.reference_number?.toUpperCase().startsWith('WEB-APP') ||
            exp.description?.includes('[Source: Web App]') ||
            !exp.reference_number?.startsWith('REF-EXP')
          );
          consolidatedList.push({
            id: `ltx-exp-${exp.id || Date.now()}`,
            entry_id: exp.id || `exp-${Date.now()}`,
            entry_number: exp.voucher_number || `EXP-${Date.now()}`,
            voucher_number: exp.voucher_number || `EXP-${Date.now()}`,
            entry_date: exp.expense_date || exp.created_at || new Date().toISOString(),
            created_at: exp.created_at,
            entry_type: 'STANDARD',
            account_id: exp.expense_account_id || exp.expense_account?.id || '5002',
            account_name: exp.expense_account?.account_name || 'Office & Administration',
            account_code: exp.expense_account?.account_code || '5002',
            account_type: 'EXPENSE',
            reference_type: 'MANUAL_EXPENSE',
            reference_id: exp.id,
            narration: exp.description || `Disbursement to ${exp.paid_to}`,
            debit: Number(exp.amount) || 0,
            credit: 0,
            running_balance: 0,
            category_tag: 'EXPENSE',
            payment_method: exp.payment_method || 'UPI',
            disbursing_account_name: exp.paid_from_account?.account_name || 'Bank Account',
            paid_to: exp.paid_to,
            received_from: null,
            status: 'POSTED',
            is_web_app: isWebApp,
            stream_category: 'EXPENSE',
            source_channel: isWebApp
              ? 'WEB_APP'
              : detectSourceChannel(
                  false,
                  exp.voucher_number || '',
                  exp.reference_number || '',
                  exp.description || '',
                  exp.paid_to || ''
                ),
          });
        }
      }

      // 5. Ensure any posted receipts from /receipt-entries are included
      for (const rec of rawReceipts) {
        if (!rec || rec.status === 'CANCELLED') continue;
        const alreadyIncluded = consolidatedList.some(
          (t) =>
            (rec.id && t.reference_id === rec.id) ||
            (rec.voucher_number && t.voucher_number === rec.voucher_number)
        );
        if (!alreadyIncluded) {
          const recDesc = `${rec.notes || ''} ${rec.category || ''} ${rec.received_from || ''}`;
          const recStreamCategory = detectStreamCategory('RECEIPT', 'MANUAL_RECEIPT', recDesc, false);
          const recSourceChannel = detectSourceChannel(
            false,
            rec.voucher_number || '',
            rec.reference_number || '',
            recDesc,
            rec.received_from || ''
          );

          consolidatedList.push({
            id: `ltx-rec-${rec.id || Date.now()}`,
            entry_id: rec.id || `rec-${Date.now()}`,
            entry_number: rec.voucher_number || `REC-${Date.now()}`,
            voucher_number: rec.voucher_number || `REC-${Date.now()}`,
            entry_date: rec.receipt_date || rec.created_at || new Date().toISOString(),
            created_at: rec.created_at,
            entry_type: 'STANDARD',
            account_id: rec.income_account_id || '4001',
            account_name: rec.category || 'Donation Income',
            account_code: '4001',
            account_type: 'INCOME',
            reference_type: 'MANUAL_RECEIPT',
            reference_id: rec.id,
            narration: rec.notes || `Received from ${rec.received_from}`,
            debit: 0,
            credit: Number(rec.amount) || 0,
            running_balance: 0,
            category_tag: 'RECEIPT',
            payment_method: rec.payment_method || 'Online',
            disbursing_account_name: rec.deposit_account?.account_name || 'Bank Account',
            paid_to: null,
            received_from: rec.received_from,
            status: 'POSTED',
            is_web_app: false,
            stream_category: recStreamCategory,
            source_channel: recSourceChannel,
          });
        }
      }

      // 6. Chronological running balance calculation (oldest -> newest)
      consolidatedList.sort((a, b) => {
        const tA = new Date(a.entry_date).getTime() || 0;
        const tB = new Date(b.entry_date).getTime() || 0;
        if (tA !== tB) return tA - tB;
        return String(a.entry_number || '').localeCompare(String(b.entry_number || ''));
      });

      const openingBalance = 0;
      let running = openingBalance;
      let totalInflows = 0;
      let totalOutflows = 0;

      for (const tx of consolidatedList) {
        const inflow = Number(tx.credit) || 0;
        const outflow = Number(tx.debit) || 0;
        totalInflows += inflow;
        totalOutflows += outflow;
        running += inflow - outflow;
        tx.running_balance = running;
      }

      const closingBalance = running;

      // 7. Sort reverse-chronologically so LATEST TRANSACTIONS ARE ON TOP
      consolidatedList.sort((a, b) => {
        const tA = new Date(a.created_at || a.entry_date).getTime() || 0;
        const tB = new Date(b.created_at || b.entry_date).getTime() || 0;
        if (tB !== tA) return tB - tA; // Newest timestamp first
        return String(b.voucher_number || b.entry_number || '').localeCompare(
          String(a.voucher_number || a.entry_number || '')
        );
      });

      // Filter by params if provided
      let resultList = consolidatedList;
      if (params?.account_id && params.account_id !== 'ALL') {
        resultList = resultList.filter((t) => t.account_id === params.account_id);
      }
      if (params?.stream && params.stream !== 'ALL') {
        resultList = resultList.filter((t) => t.stream_category === params.stream);
      }
      if (params?.source && params.source !== 'ALL') {
        resultList = resultList.filter((t) => t.source_channel === params.source);
      }
      if (params?.search) {
        const q = params.search.toLowerCase().trim();
        resultList = resultList.filter(
          (t) =>
            String(t.entry_number || '').toLowerCase().includes(q) ||
            String(t.voucher_number || '').toLowerCase().includes(q) ||
            String(t.narration || '').toLowerCase().includes(q) ||
            String(t.account_name || '').toLowerCase().includes(q) ||
            String(t.received_from || '').toLowerCase().includes(q) ||
            String(t.paid_to || '').toLowerCase().includes(q) ||
            String(t.payment_method || '').toLowerCase().includes(q)
        );
      }

      return {
        transactions: resultList,
        summary: {
          opening_balance: openingBalance,
          total_debit: totalInflows, // Total Inflows (Income / Receipts)
          total_credit: totalOutflows, // Total Outflows (Expenses / Disbursements)
          closing_balance: closingBalance,
          net_change: totalInflows - totalOutflows,
        },
      };
    } catch (err) {
      console.warn('getGlobalLedger error, using offline store:', err);
    }

    const ledger = getStoredLedger();
    let filtered = [...ledger];

    if (params?.from_date) {
      filtered = filtered.filter((t) => t.entry_date >= params.from_date!);
    }
    if (params?.to_date) {
      filtered = filtered.filter((t) => t.entry_date <= params.to_date!);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (t) =>
          t.entry_number.toLowerCase().includes(q) ||
          (t.narration || '').toLowerCase().includes(q) ||
          t.account_name.toLowerCase().includes(q) ||
          (t.received_from || '').toLowerCase().includes(q) ||
          (t.paid_to || '').toLowerCase().includes(q)
      );
    }

    let totalDebit = 0;
    let totalCredit = 0;
    filtered.forEach((t) => {
      totalDebit += Number(t.debit) || 0;
      totalCredit += Number(t.credit) || 0;
    });

    const closingBal = filtered.length > 0 ? filtered[0].running_balance : 0;
    const openingBal = closingBal - totalDebit + totalCredit;

    return {
      transactions: filtered,
      summary: {
        opening_balance: Math.max(0, openingBal),
        total_debit: totalDebit,
        total_credit: totalCredit,
        closing_balance: closingBal,
        net_change: totalDebit - totalCredit,
      },
    };
  },

  async getAccountLedger(
    accountId: string,
    params?: { from_date?: string; to_date?: string }
  ): Promise<{
    account: AccountItem | null;
    transactions: LedgerTransaction[];
    summary: LedgerSummary;
  }> {
    try {
      const queryParams: Record<string, string> = {};
      if (params?.from_date) queryParams.from_date = params.from_date;
      if (params?.to_date) queryParams.to_date = params.to_date;

      const remote = await apiClient.get<{
        account: AccountItem | null;
        transactions: LedgerTransaction[];
        summary: LedgerSummary;
      }>(`/accounts/${accountId}/ledger`, { params: queryParams });
      if (remote && Array.isArray(remote.transactions)) {
        return remote;
      }
    } catch {
      // Offline fallback
    }

    const accounts = getStoredAccounts();
    const account = accounts.find((a) => a.id === accountId) || null;
    const ledger = getStoredLedger();

    let filtered = ledger.filter((t) => t.account_id === accountId);
    if (params?.from_date) {
      filtered = filtered.filter((t) => t.entry_date >= params.from_date!);
    }
    if (params?.to_date) {
      filtered = filtered.filter((t) => t.entry_date <= params.to_date!);
    }

    let totalDebit = 0;
    let totalCredit = 0;
    filtered.forEach((t) => {
      totalDebit += Number(t.debit) || 0;
      totalCredit += Number(t.credit) || 0;
    });

    const closingBal = account?.balance || 0;
    const openingBal = closingBal - totalDebit + totalCredit;

    return {
      account,
      transactions: filtered,
      summary: {
        opening_balance: openingBal,
        total_debit: totalDebit,
        total_credit: totalCredit,
        closing_balance: closingBal,
        net_change: totalDebit - totalCredit,
      },
    };
  },
};
