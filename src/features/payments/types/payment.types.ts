export type PaymentPurpose = 'donation' | 'membership';

export type PaymentMethodType = 'UPI' | 'CARD' | 'NETBANKING' | 'WALLET' | 'CASHFREE';

export interface CashfreeOrderSession {
  order_id: string;
  payment_session_id: string;
  cf_order_id?: number | string;
  order_status?: string;
  amount: number;
  currency: string;
  purpose: PaymentPurpose;
  reference_id?: string;
  environment?: 'SANDBOX' | 'PRODUCTION';
}

export interface CashfreeVerifyResponse {
  verified: boolean;
  status: 'SUCCESS' | 'PAID' | 'PENDING' | 'FAILED' | 'USER_DROPPED' | 'CANCELLED';
  latest_status?: string;
  order_id: string;
  amount?: number;
  currency?: string;
  purpose?: PaymentPurpose;
  reference_id?: string;
  receipt_id?: string;
  receipt_number?: string;
  payment_method?: string;
  transaction_id?: string;
  paid_at?: string;
  message?: string;
  donation?: {
    id: string;
    donor_name: string;
    amount: number;
    cause: string;
    receipt_id?: string;
    is_80g_eligible?: boolean;
  };
  membership?: {
    id: string;
    membership_number?: string;
    post_name?: string;
    valid_upto?: string;
  };
}

export interface PaymentPayload {
  purpose: PaymentPurpose;
  amount: number;
  title: string;
  subtitle?: string;
  entityId?: string; // Cause ID, Application ID, or Membership Payment ID
  referenceId?: string; // Reference ID or order reference
  applicationId?: string; // Explicit application ID if applicable
  userId?: string; // Authenticated user ID
  donorName?: string;
  donorMobile?: string;
  donorEmail?: string;
  panNumber?: string;
  need80GReceipt?: boolean;
}

export interface PaymentReceiptDetails {
  receiptNumber: string;
  orderId: string;
  transactionId: string;
  amount: number;
  purpose: PaymentPurpose;
  purposeTitle: string;
  donorName: string;
  donorMobile?: string;
  donorEmail?: string;
  panNumber?: string;
  userId?: string;
  applicationId?: string;
  membershipNumber?: string;
  paymentMethod?: string;
  paidAt: string;
  is80GEligible?: boolean;
  status: 'SUCCESS' | 'PENDING' | 'FAILED';
}

export interface CreateDonationOrderParams {
  cause: string;
  amount: number;
  donorName: string;
  donorMobile?: string;
  donorEmail?: string;
  userId?: string;
  panNumber?: string;
  need80G?: boolean;
  eventId?: string;
  idempotencyKey?: string;
}

export interface CreateMembershipOrderParams {
  applicationId?: string;
  membershipPaymentId?: string;
  amount: number;
  customerName: string;
  customerMobile?: string;
  customerEmail?: string;
  userId?: string;
  membershipType?: string;
  idempotencyKey?: string;
}

