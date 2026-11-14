import type {
  ExpenseEntryItem,
  OfficialExpenseType,
} from '../types/expenses.types';

export const OFFICIAL_EXPENSE_TYPES: OfficialExpenseType[] = [
  {
    code: '5001',
    id: '99347081-b9eb-4491-8f10-a109f750f097',
    name: 'Employee & Staff Expenses',
    description: 'Salaries, wages, staff allowances, bonuses, medical benefits and employee welfare.',
  },
  {
    code: '5002',
    id: 'b8cbe676-5f17-4d9a-9499-92937a84d7a1',
    name: 'Office & Administration',
    description: 'Office stationery, printing, courier, utilities, pantry, cleaning and general admin expenses.',
  },
  {
    code: '5003',
    id: '06a284fe-65b5-484b-937a-65339a559d8d',
    name: 'Program / Project Expenses',
    description: 'Field campaigns, human rights workshops, awareness drives, survey & research projects.',
  },
  {
    code: '5004',
    id: 'c0ceb082-c107-4900-bda0-8cac5135d354',
    name: 'Travel & Transportation',
    description: 'Conveyance, fuel, bus/train/flight tickets, local transit, lodging and travel allowances.',
  },
  {
    code: '5005',
    id: '31d41746-9226-443e-a139-11f7c0394c9c',
    name: 'Communication & Awareness',
    description: 'Pamphlets, brochures, banners, social media marketing, advertising, press releases and public relations.',
  },
  {
    code: '5006',
    id: 'd6976fbc-4715-4817-90fd-74d6527dd32f',
    name: 'Events & Activities',
    description: 'Venue booking, stage setup, audio/visual equipment, catering, guest honorariums and certificates.',
  },
  {
    code: '5007',
    id: '4fb0513e-262a-4f10-bce7-383fa82d0a06',
    name: 'IT & Technology',
    description: 'Software licenses, domain/hosting, cloud servers, mobile app/portal maintenance, IT support.',
  },
  {
    code: '5008',
    id: 'b2477a86-432a-4a3d-a47f-36ea337b0d8f',
    name: 'Assets & Equipment',
    description: 'Office furniture, computers, cameras, printers, projectors and electronic apparatus purchases/maintenance.',
  },
  {
    code: '5009',
    id: 'ce81e87f-7943-4e6d-a732-098169ccaa71',
    name: 'Beneficiary Assistance',
    description: 'Direct humanitarian aid, medical relief funds, legal aid subsidies, emergency distress grants.',
  },
  {
    code: '5010',
    id: '40c8a274-a754-4d5b-a8b4-e94c523b6aae',
    name: 'Compliance & Governance',
    description: 'Auditor fees, legal consultancy, ROC filings, 80G/12A renewals, society registration & compliance fees.',
  },
  {
    code: '5011',
    id: '0b3fc924-83e9-41fd-b0ce-d31bba25b57d',
    name: 'Fundraising Expenses',
    description: 'Donation collection drives, fundraising campaigns, donor engagement material, crowdfunding charges.',
  },
  {
    code: '5012',
    id: 'f136b707-0103-439e-9a30-5f05ba561b87',
    name: 'Volunteer Expenses',
    description: 'Volunteer stipends, refreshment, volunteer badges/t-shirts, training kits and appreciation awards.',
  },
  {
    code: '5013',
    id: 'f0284b69-e6f1-4cb8-aaf7-1ed556fb40fe',
    name: 'Premises Expenses',
    description: 'Office rent, society maintenance charges, electricity, water bills, property repair and lease costs.',
  },
  {
    code: '5014',
    id: '4c45f6e8-d700-46b2-b2fe-66b014f7ed3b',
    name: 'Financial Expenses',
    description: 'Bank transaction charges, payment gateway processing fees, cheque bounce fees, interest/charges.',
  },
  {
    code: '5015',
    id: 'a3926783-846a-4126-ac30-9e3e0ab71830',
    name: 'Miscellaneous',
    description: 'Sundry and ad-hoc minor expenses not covered under other defined heads.',
  },
];

export const ASSET_PAYMENT_ACCOUNTS = [
  { id: 'acc-bank-01', account_code: '1001', account_name: 'State Bank of India — Current A/c (Ending 4092)' },
  { id: 'acc-bank-02', account_code: '1002', account_name: 'HDFC Bank — Operational A/c (Ending 1184)' },
  { id: 'acc-cash-01', account_code: '1010', account_name: 'Central Cash Drawer (Petty Cash)' },
  { id: 'acc-upi-01', account_code: '1020', account_name: 'HRSJM Digital UPI Merchant (sbi.hrsjm@upi)' },
];

export const INITIAL_EXPENSE_FIXTURES: ExpenseEntryItem[] = [];
