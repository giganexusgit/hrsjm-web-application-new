import type {
  ReceiptEntryItem,
  IncomeAccountInfo,
  ReceivedInAccountInfo,
} from '../types/receipts.types';

export const STANDARD_INCOME_ACCOUNTS: IncomeAccountInfo[] = [
  {
    id: 'acc-inc-4000',
    account_code: '4000',
    account_name: 'Donation Income',
  },
  {
    id: 'acc-inc-4001',
    account_code: '4001',
    account_name: 'Membership Income',
  },
  {
    id: 'acc-inc-4002',
    account_code: '4002',
    account_name: 'Grants & Humanitarian Subsidies',
  },
  {
    id: 'acc-inc-4003',
    account_code: '4003',
    account_name: 'Conclave & Event Registration Income',
  },
  {
    id: 'acc-inc-4004',
    account_code: '4004',
    account_name: 'General Welfare Contributions',
  },
  {
    id: 'acc-inc-4005',
    account_code: '4005',
    account_name: 'Other Incidental Income',
  },
];

export const STANDARD_RECEIVED_IN_ACCOUNTS: ReceivedInAccountInfo[] = [
  {
    id: 'acc-ast-1001',
    account_code: '1001',
    account_name: 'HDFC Bank - General Main A/c (4928)',
  },
  {
    id: 'acc-ast-1002',
    account_code: '1002',
    account_name: 'State Bank of India - Humanitarian Aid A/c (1102)',
  },
  {
    id: 'acc-ast-1003',
    account_code: '1003',
    account_name: 'ICICI Bank - Operations & Field A/c (8821)',
  },
  {
    id: 'acc-ast-1010',
    account_code: '1010',
    account_name: 'Cash in Hand - Delhi Central Office',
  },
  {
    id: 'acc-ast-1020',
    account_code: '1020',
    account_name: 'Cashfree Gateway Clearing Pool',
  },
];

export const INITIAL_RECEIPT_ENTRIES: ReceiptEntryItem[] = [];
