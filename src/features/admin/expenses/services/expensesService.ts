import { apiClient } from '@/api';
import type {
  CreateExpensePayload,
  ExpenseEntryItem,
  PaymentMethod,
  VoucherStatus,
} from '../types/expenses.types';
const API_BASE = '/expense-entries';

export interface ListExpensesParams {
  page?: number;
  limit?: number;
  status?: VoucherStatus;
  payment_method?: PaymentMethod;
  search?: string;
  expense_account_id?: string;
}

export const expensesService = {
  async list(
    params?: ListExpensesParams,
  ): Promise<{ items: ExpenseEntryItem[]; total: number; page: number; totalPages: number }> {
    try {
      const query = new URLSearchParams();
      if (params?.page) query.append('page', String(params.page));
      if (params?.limit) query.append('limit', String(params.limit));
      if (params?.status) query.append('status', params.status);
      if (params?.payment_method) query.append('payment_method', params.payment_method);
      if (params?.search?.trim()) query.append('search', params.search.trim());
      if (params?.expense_account_id) query.append('expense_account_id', params.expense_account_id);

      const qs = query.toString() ? `?${query.toString()}` : '';
      const data: any = await apiClient.get<any>(`${API_BASE}${qs}`);
      const items: ExpenseEntryItem[] = Array.isArray(data?.items)
        ? data.items
        : Array.isArray(data?.data?.items)
          ? data.data.items
          : Array.isArray(data?.data)
            ? data.data
            : Array.isArray(data)
              ? data
              : [];

      return {
        items,
        total: data?.total ?? data?.data?.total ?? items.length,
        page: data?.page ?? data?.data?.page ?? 1,
        totalPages: data?.total_pages ?? data?.data?.total_pages ?? 1,
      };
    } catch {
      return {
        items: [],
        total: 0,
        page: 1,
        totalPages: 1,
      };
    }
  },

  async getById(id: string): Promise<ExpenseEntryItem | undefined> {
    try {
      const data = await apiClient.get<any>(`${API_BASE}/${id}`);
      return data?.data ?? data;
    } catch {
      return undefined;
    }
  },

  async create(payload: CreateExpensePayload): Promise<ExpenseEntryItem> {
    const data: any = await apiClient.post<any>(API_BASE, payload);
    return data?.data ?? data;
  },

  async cancel(id: string, cancellationReason?: string): Promise<boolean> {
    try {
      await apiClient.patch<any>(`${API_BASE}/${id}/status`, {
        status: 'CANCELLED',
        cancellation_reason: cancellationReason,
      });
      return true;
    } catch {
      return true;
    }
  },
};
