export const DONATION_STATUSES = ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] as const;

export type DonationStatus = (typeof DONATION_STATUSES)[number];

export type DonationSource = 'Website' | 'Web App' | 'Application UI';

export type DonationCategory = 'ALL' | 'ONE_TIME' | 'RECURRING' | 'OFFLINE';

export interface Donation {
  id: string;
  donor_name: string;
  donor_mobile: string;
  donor_email: string | null;
  cause: string;
  amount: number;
  status: DonationStatus | string;
  remark: string | null;
  source?: DonationSource | string | null;
  donation_type?: 'ONE_TIME' | 'RECURRING' | 'OFFLINE';
  member_code?: string | null;
  payment_method?: string;
  transaction_id?: string | null;
  event_id?: string | null;
  event_name?: string | null;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_at?: string | null;
  deleted_by?: string | null;
}

export interface DateRange {
  from: string | null;
  to: string | null;
}

export interface CreateDonationInput {
  donor_name: string;
  donor_mobile?: string;
  donor_email?: string;
  cause?: string;
  amount: number;
  is_anonymous?: boolean;
  remark?: string;
  source?: DonationSource | string;
  donation_type?: 'ONE_TIME' | 'RECURRING' | 'OFFLINE';
  payment_method?: string;
  transaction_id?: string;
}

export interface DonationReceiptModel {
  id: string;
  receiptNumber: string;
  receiptDate: string;
  donorName: string;
  donorMobile?: string | null;
  donorEmail?: string | null;
  memberCode?: string | null;
  cause: string;
  amount: number;
  paymentMethod: string;
  transactionId?: string | null;
  status: string;
  notes?: string | null;
  source?: DonationSource | string | null;
}

export interface DonationRowModel {
  id: string;
  donorName: string;
  memberCode?: string | null;
  phone?: string | null;
  donationTitle: string;
  donationDescription?: string | null;
  amount: number;
  dateText: string;
  timeText?: string | null;
  statusLabel: string;
  statusTone: 'success' | 'warning' | 'error' | 'neutral' | 'info';
  hasReceipt: boolean;
  donationType?: 'ONE_TIME' | 'RECURRING' | 'OFFLINE';
  source?: DonationSource | string | null;
  rawStatus?: string;
  rawDonation?: Donation;
  eventId?: string | null;
  eventName?: string | null;
}

export interface DonationStatItem {
  id: string;
  label: string;
  value: string;
  supportText: string;
  indicator?: string;
  tone: 'navy' | 'warning' | 'success' | 'gold';
  subLabel?: string;
}

