/**
 * Accounting & Ledger Types
 * Exact parity with APK: hrsjm-application-ui/src/features/admin/accounting/types/accounting.types.ts
 * and backend: HRSJM-back-api/src/modules/accounting/
 */

export type AccountType =
  | 'ASSET'
  | 'LIABILITY'
  | 'INCOME'
  | 'EXPENSE'
  | 'FUND_EQUITY';

export type AccountCategory = 'ALL' | AccountType;

export interface AccountItem {
  id: string;
  account_code: string | null;
  account_name: string;
  account_type: AccountType;
  parent_account_id: string | null;
  description: string | null;
  is_active: boolean;
  balance?: number;
  parent?: AccountItem | null;
  children?: AccountItem[];
  created_at: string;
  updated_at: string;
}

export interface AccountTreeNode extends AccountItem {
  children: AccountTreeNode[];
  level: number;
}

export interface CreateAccountPayload {
  account_name: string;
  account_type: AccountType;
  account_code?: string;
  parent_account_id?: string | null;
  description?: string;
}

export interface UpdateAccountPayload {
  account_name?: string;
  account_code?: string;
  parent_account_id?: string | null;
  description?: string;
}

export interface AccountingEntryLine {
  id: string;
  account_id?: string;
  account: {
    id: string;
    account_name: string;
    account_code: string | null;
    account_type?: AccountType;
  } | null;
  debit?: number;
  credit?: number;
  debit_amount?: number;
  credit_amount?: number;
  narration?: string | null;
}

export interface JournalEntryItem {
  id: string;
  entry_number: string;
  reference_type?: string | null;
  reference_id?: string | null;
  entry_type: 'STANDARD' | 'REVERSAL' | 'CLOSING' | 'ADJUSTMENT';
  narration?: string | null;
  entry_date: string;
  is_reversed?: boolean;
  reversal_entry_id?: string | null;
  reversed_by_id?: string | null;
  reversal_reason?: string | null;
  total_debit: number;
  total_credit: number;
  lines?: AccountingEntryLine[];
  created_at: string;
}

export interface CreateJournalPayload {
  entry_date: string;
  narration: string;
  lines: Array<{
    account_id: string;
    debit: number;
    credit: number;
    narration?: string;
  }>;
}

export interface LedgerTransaction {
  id: string;
  entry_id: string;
  entry_number: string;
  entry_date: string;
  entry_type: string;
  account_id: string;
  account_name: string;
  account_code: string | null;
  account_type: AccountType;
  reference_type: string | null;
  reference_id: string | null;
  narration: string | null;
  debit: number;
  credit: number;
  running_balance: number;
  opening_balance?: number;
  closing_balance?: number;
  category_tag?: string;
  payment_method?: string | null;
  paid_to?: string | null;
  received_from?: string | null;
  status?: string | null;
  disbursing_account_name?: string | null;
  voucher_number?: string | null;
  is_web_app?: boolean;
  created_at?: string;
  stream_category?: 'DONATION' | 'CAUSE_DONATION' | 'MEMBERSHIP' | 'RENEWAL' | 'EXPENSE' | 'RECEIPT' | string;
  source_channel?: 'WEB_APP' | 'WEBSITE' | 'APPLICATION' | string;
}

export interface LedgerSummary {
  opening_balance: number;
  total_debit: number;
  total_credit: number;
  closing_balance: number;
  net_change?: number;
  credit_growth_pct?: number;
  debit_growth_pct?: number;
}

export type MainAccountingMode =
  | 'PASSBOOK'
  | 'CREDIT'
  | 'EXPENSE'
  | 'LEDGER'
  | 'ANALYTICS';

export type DimensionTab =
  | 'Date Wise'
  | 'Category Wise'
  | 'Member Wise'
  | 'Support Type';

export type DatePresetKey =
  | 'ALL_TIME'
  | 'THIS_MONTH'
  | 'LAST_MONTH'
  | 'THIS_QUARTER'
  | 'THIS_FY';

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  ASSET: 'Assets (Cash, Bank & Receivables)',
  LIABILITY: 'Liabilities & Payables',
  INCOME: 'Income & Revenue Streams',
  EXPENSE: 'Expenditures & Operating Costs',
  FUND_EQUITY: 'Capital & Reserve Funds',
};

export function formatINR(amount: number | string | null | undefined): string {
  const numeric = typeof amount === 'string' ? parseFloat(amount) : Number(amount);
  if (isNaN(numeric) || numeric === null || numeric === undefined) return '₹0.00';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numeric);
}
