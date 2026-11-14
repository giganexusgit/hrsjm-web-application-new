export const VOUCHER_PAYMENT_METHODS = [
  'CASH',
  'BANK_TRANSFER',
  'CHEQUE',
  'UPI',
  'CARD',
  'OTHER',
] as const;

export type PaymentMethod = (typeof VOUCHER_PAYMENT_METHODS)[number];

export type VoucherStatus = 'POSTED' | 'CANCELLED';

export interface OfficialExpenseType {
  code: string;
  id?: string;
  name: string;
  description: string;
}

export interface AccountingEntryLine {
  id: string;
  account: {
    id: string;
    account_name: string;
    account_code: string | null;
  } | null;
  debit?: number;
  credit?: number;
  debit_amount?: number;
  credit_amount?: number;
}

export interface AccountingEntrySummary {
  id: string;
  entry_number?: string | null;
  reference_type?: string | null;
  reference_id?: string | null;
  narration?: string | null;
  entry_date?: string | null;
  lines?: AccountingEntryLine[];
}

export interface ExpenseEntryItem {
  id: string;
  voucher_number: string;
  expense_date: string;
  paid_to: string;
  expense_account_id: string;
  paid_from_account_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number: string | null;
  description: string | null;
  attachment_url: string | null;
  status: VoucherStatus;
  cancellation_reason?: string | null;
  accounting_entry_id: string | null;
  created_at: string;
  updated_at: string;
  expense_account?: {
    id: string;
    account_name: string;
    account_code: string | null;
  } | null;
  paid_from_account?: {
    id: string;
    account_name: string;
    account_code: string | null;
  } | null;
  accounting_entry?: AccountingEntrySummary | null;
}

export interface ExpenseStatsSummary {
  all: number;
  posted: number;
  cancelled: number;
  totalAmount: number;
}

export interface CreateExpensePayload {
  expense_date: string;
  paid_to: string;
  expense_account_id: string;
  paid_from_account_id?: string;
  amount: number;
  payment_method: PaymentMethod;
  reference_number?: string;
  description?: string;
  attachment_url?: string;
}

export const formatINR = (
  amount: number | string | null | undefined,
  options?: {
    noDecimals?: boolean;
    compact?: boolean;
  },
): string => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '₹ 0.00';
  }

  const num = Number(amount);

  if (options?.compact) {
    if (Math.abs(num) >= 10000000) {
      return `₹ ${(num / 10000000).toFixed(2)} Cr`;
    }
    if (Math.abs(num) >= 100000) {
      return `₹ ${(num / 100000).toFixed(2)} L`;
    }
    if (Math.abs(num) >= 1000) {
      return `₹ ${(num / 1000).toFixed(1)} K`;
    }
  }

  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: options?.noDecimals ? 0 : 2,
    maximumFractionDigits: options?.noDecimals ? 0 : 2,
  }).format(num);

  return formatted.replace('₹', '₹ ');
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  BANK_TRANSFER: 'Bank Transfer',
  CHEQUE: 'Cheque',
  UPI: 'UPI',
  CARD: 'Debit/Credit Card',
  OTHER: 'Other',
};
