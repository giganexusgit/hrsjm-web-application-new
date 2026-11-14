import { apiClient } from '@/api';
import type {
  ReceiptEntryItem,
  ReceiptEntryDetail,
  CreateReceiptPayload,
  UpdateReceiptPayload,
} from '../types/receipts.types';
import {
  STANDARD_INCOME_ACCOUNTS,
  STANDARD_RECEIVED_IN_ACCOUNTS,
} from '../data/receiptsFixtures';

const STORAGE_KEY = 'hrsjm_local_receipts_v1';
const API_BASE = '/receipt-entries';

function getStoredReceipts(): ReceiptEntryItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Failed to parse cached receipts from localStorage:', err);
  }
  return [];
}

function saveStoredReceipts(receipts: ReceiptEntryItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
  } catch (err) {
    console.warn('Failed to save receipts to localStorage:', err);
  }
}

export const receiptsService = {
  /**
   * Fetch paginated list of receipt vouchers.
   */
  async listReceipts(params?: {
    status?: string;
    payment_method?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ items: ReceiptEntryItem[]; total: number; page: number; limit: number; totalPages: number }> {
    const queryParams: Record<string, any> = {};
    if (params?.status && params.status !== 'ALL') queryParams.status = params.status;
    if (params?.payment_method && params.payment_method !== 'ALL') queryParams.payment_method = params.payment_method;
    if (params?.search) queryParams.search = params.search;
    if (params?.page) queryParams.page = params.page;
    if (params?.limit) queryParams.limit = params.limit;

    try {
      const res: any = await apiClient.get<any>(API_BASE, queryParams);
      const data = res?.data ?? res;
      if (data && Array.isArray(data.items)) {
        return {
          items: data.items,
          total: data.meta?.total ?? data.total ?? data.items.length,
          page: data.meta?.page ?? data.page ?? 1,
          limit: data.meta?.limit ?? data.limit ?? 25,
          totalPages: data.meta?.totalPages ?? data.total_pages ?? 1,
        };
      }
    } catch {
      // Backend offline or errored, fall through to local cache
    }

    // Local in-memory filtering fallback
    const all = getStoredReceipts();
    let filtered = [...all];

    if (params?.status && params.status !== 'ALL') {
      filtered = filtered.filter((r) => r.status === params.status);
    }
    if (params?.payment_method && params.payment_method !== 'ALL') {
      filtered = filtered.filter((r) => r.payment_method === params.payment_method);
    }
    if (params?.search) {
      const q = params.search.toLowerCase().trim();
      filtered = filtered.filter(
        (r) =>
          r.voucher_number.toLowerCase().includes(q) ||
          r.received_from.toLowerCase().includes(q) ||
          (r.reference_number || '').toLowerCase().includes(q) ||
          (r.description || '').toLowerCase().includes(q)
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 25;
    const start = (page - 1) * limit;
    const paginated = filtered.slice(start, start + limit);

    return {
      items: paginated,
      total: filtered.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(filtered.length / limit)),
    };
  },

  /**
   * Get a single receipt voucher by ID with accounting lines.
   */
  async getReceiptById(id: string): Promise<ReceiptEntryDetail | null> {
    try {
      const res: any = await apiClient.get<any>(`${API_BASE}/${id}`);
      const data = res?.data ?? res;
      if (data && data.id) {
        return data;
      }
    } catch {
      // Backend offline, fallback to local cache
    }

    const list = getStoredReceipts();
    return list.find((r) => r.id === id) || null;
  },

  /**
   * Create a new receipt voucher (POST /api/v1/receipt-entries).
   */
  async createReceipt(payload: CreateReceiptPayload): Promise<ReceiptEntryItem> {
    try {
      const res: any = await apiClient.post<any>(API_BASE, payload);
      const created = res?.data ?? res;
      if (created && created.id) {
        // Sync with local storage
        const list = getStoredReceipts();
        list.unshift(created);
        saveStoredReceipts(list);
        return created;
      }
    } catch {
      // Backend offline, create locally
    }

    const list = getStoredReceipts();
    const sequenceNum = list.length + 1;
    const voucherNumber = `RCP-2026-${String(sequenceNum).padStart(4, '0')}`;
    const newId = `rcp-local-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const incomeAccount =
      STANDARD_INCOME_ACCOUNTS.find((a) => a.id === payload.income_account_id) ||
      STANDARD_INCOME_ACCOUNTS[0];

    const receivedInAccount =
      STANDARD_RECEIVED_IN_ACCOUNTS.find((a) => a.id === payload.received_in_account_id) ||
      STANDARD_RECEIVED_IN_ACCOUNTS[0];

    const newVoucher: ReceiptEntryItem = {
      id: newId,
      voucher_number: voucherNumber,
      receipt_date: payload.receipt_date,
      received_from: payload.received_from,
      income_account_id: payload.income_account_id,
      received_in_account_id: payload.received_in_account_id,
      amount: Number(payload.amount),
      payment_method: payload.payment_method,
      reference_number: payload.reference_number || null,
      description: payload.description || null,
      attachment_url: null,
      status: 'POSTED',
      accounting_entry_id: `je-local-${Date.now()}`,
      created_at: nowIso,
      updated_at: nowIso,
      income_account: incomeAccount,
      received_in_account: receivedInAccount,
      accounting_entry: {
        id: `je-local-${Date.now()}`,
        entry_number: `JV-2026-${String(sequenceNum + 10).padStart(4, '0')}`,
        entry_date: payload.receipt_date,
        reference_type: 'DONATION_PAYMENT',
        reference_id: newId,
        narration: `Receipt voucher ${voucherNumber}: Dr ${receivedInAccount.account_name} / Cr ${incomeAccount.account_name}`,
        lines: [
          {
            id: `line-${newId}-dr`,
            account: {
              id: receivedInAccount.id,
              account_name: receivedInAccount.account_name,
              account_code: receivedInAccount.account_code,
            },
            debit: Number(payload.amount),
            credit: 0,
          },
          {
            id: `line-${newId}-cr`,
            account: {
              id: incomeAccount.id,
              account_name: incomeAccount.account_name,
              account_code: incomeAccount.account_code,
            },
            debit: 0,
            credit: Number(payload.amount),
          },
        ],
      },
    };

    list.unshift(newVoucher);
    saveStoredReceipts(list);
    return newVoucher;
  },

  /**
   * Update receipt voucher metadata (PATCH /api/v1/receipt-entries/:id).
   */
  async updateReceipt(id: string, payload: UpdateReceiptPayload): Promise<ReceiptEntryItem> {
    try {
      const res: any = await apiClient.patch<any>(`${API_BASE}/${id}`, payload);
      const updated = res?.data ?? res;
      if (updated && updated.id) {
        const list = getStoredReceipts();
        const idx = list.findIndex((r) => r.id === id);
        if (idx !== -1) {
          list[idx] = updated;
          saveStoredReceipts(list);
        }
        return updated;
      }
    } catch {
      // Backend offline, fallback to local update
    }

    const list = getStoredReceipts();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`Receipt voucher ${id} not found.`);
    }

    const current = list[idx];
    const incomeAccount = payload.income_account_id
      ? STANDARD_INCOME_ACCOUNTS.find((a) => a.id === payload.income_account_id) || current.income_account
      : current.income_account;

    const receivedInAccount = payload.received_in_account_id
      ? STANDARD_RECEIVED_IN_ACCOUNTS.find((a) => a.id === payload.received_in_account_id) || current.received_in_account
      : current.received_in_account;

    const updated: ReceiptEntryItem = {
      ...current,
      receipt_date: payload.receipt_date ?? current.receipt_date,
      received_from: payload.received_from ?? current.received_from,
      income_account_id: payload.income_account_id ?? current.income_account_id,
      received_in_account_id: payload.received_in_account_id ?? current.received_in_account_id,
      amount: payload.amount !== undefined ? Number(payload.amount) : current.amount,
      payment_method: payload.payment_method ?? current.payment_method,
      reference_number: payload.reference_number !== undefined ? payload.reference_number : current.reference_number,
      description: payload.description !== undefined ? payload.description : current.description,
      income_account: incomeAccount,
      received_in_account: receivedInAccount,
      updated_at: new Date().toISOString(),
    };

    list[idx] = updated;
    saveStoredReceipts(list);
    return updated;
  },

  /**
   * Cancel/Void receipt voucher and reverse journal (PATCH /api/v1/receipt-entries/:id/status).
   */
  async updateReceiptStatus(
    id: string,
    status: 'CANCELLED' | 'POSTED',
    cancellation_reason?: string
  ): Promise<ReceiptEntryItem> {
    try {
      const res: any = await apiClient.patch<any>(`${API_BASE}/${id}/status`, { status, cancellation_reason });
      const updated = res?.data ?? res;
      if (updated && updated.id) {
        const list = getStoredReceipts();
        const idx = list.findIndex((r) => r.id === id);
        if (idx !== -1) {
          list[idx] = updated;
          saveStoredReceipts(list);
        }
        return updated;
      }
    } catch {
      // Backend offline, fallback to local
    }

    const list = getStoredReceipts();
    const idx = list.findIndex((r) => r.id === id);
    if (idx === -1) {
      throw new Error(`Receipt voucher ${id} not found.`);
    }

    const current = list[idx];
    const updated: ReceiptEntryItem = {
      ...current,
      status,
      cancellation_reason: cancellation_reason || current.cancellation_reason,
      updated_at: new Date().toISOString(),
      accounting_entry: current.accounting_entry
        ? {
            ...current.accounting_entry,
            is_reversed: status === 'CANCELLED',
            narration: `${current.accounting_entry.narration || ''} [VOIDED: ${cancellation_reason || 'Reversed'}]`,
          }
        : null,
    };

    list[idx] = updated;
    saveStoredReceipts(list);
    return updated;
  },
};
