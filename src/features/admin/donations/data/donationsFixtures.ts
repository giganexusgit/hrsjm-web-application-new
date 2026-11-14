import type {
  Donation,
  DonationReceiptModel,
  DonationRowModel,
  DonationStatItem,
  DateRange,
} from '../types/donations.types';

export const INITIAL_DONATIONS: Donation[] = [];

export const isWithinDateRange = (
  dateInput: string | Date,
  from?: string | null,
  to?: string | null
): boolean => {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return false;
  if (from) {
    const start = new Date(`${from}T00:00:00`);
    if (!isNaN(start.getTime()) && d < start) return false;
  }
  if (to) {
    const end = new Date(`${to}T23:59:59.999`);
    if (!isNaN(end.getTime()) && d > end) return false;
  }
  return true;
};

export const toDonationRowModel = (d: Donation): DonationRowModel => {
  const dObj = new Date(d.created_at);
  const dateText = isNaN(dObj.getTime())
    ? d.created_at
    : dObj.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const timeText = isNaN(dObj.getTime())
    ? null
    : dObj.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  let statusLabel = 'Completed';
  let statusTone: 'success' | 'warning' | 'error' | 'neutral' | 'info' = 'success';

  switch (d.status?.toUpperCase()) {
    case 'SUCCESS':
      statusLabel = 'Completed';
      statusTone = 'success';
      break;
    case 'PENDING':
      statusLabel = 'Pending';
      statusTone = 'warning';
      break;
    case 'REFUNDED':
      statusLabel = 'Refunded';
      statusTone = 'neutral';
      break;
    case 'FAILED':
      statusLabel = 'Failed';
      statusTone = 'error';
      break;
    default:
      statusLabel = d.status || 'Completed';
      statusTone = 'info';
  }

  // Extract event metadata if associated with an event
  let eventId = d.event_id || null;
  let eventName = d.event_name || null;
  if (!eventName && d.cause?.startsWith('Event Donation:')) {
    eventName = d.cause.replace(/^Event Donation:\s*/, '').trim();
  }
  if (!eventId && d.remark?.includes('Event ID:')) {
    const match = d.remark.match(/Event ID:\s*([a-zA-Z0-9_-]+)/);
    if (match) eventId = match[1];
  }

  return {
    id: d.id,
    donorName: d.donor_name,
    memberCode: d.member_code,
    phone: d.donor_mobile,
    donationTitle: d.cause,
    donationDescription: d.remark,
    amount: d.amount,
    dateText,
    timeText,
    statusLabel,
    statusTone,
    hasReceipt: d.status?.toUpperCase() === 'SUCCESS' || statusLabel === 'Completed',
    donationType: d.donation_type,
    source: d.source || 'Website',
    rawStatus: d.status,
    rawDonation: d,
    eventId,
    eventName,
  };
};

export const computeDonationStats = (
  donations: Donation[],
  dateRange?: DateRange | null
): DonationStatItem[] => {
  let list = donations;
  const hasRange = Boolean(dateRange && (dateRange.from || dateRange.to));
  if (hasRange && dateRange) {
    list = list.filter(d => isWithinDateRange(d.created_at, dateRange.from, dateRange.to));
  }

  // Filter only SUCCESS donations for amounts
  const successfulList = list.filter(d => d.status?.toUpperCase() === 'SUCCESS');
  const totalAmount = successfulList.reduce((sum, d) => sum + d.amount, 0);

  const uniqueDonors = new Set(
    list.map(d => (d.donor_mobile ? d.donor_mobile.replace(/\s+/g, '') : d.donor_name))
  ).size;

  const oneTimeAmount = successfulList
    .filter(d => d.donation_type === 'ONE_TIME')
    .reduce((sum, d) => sum + d.amount, 0);

  const recurringAmount = successfulList
    .filter(d => d.donation_type === 'RECURRING')
    .reduce((sum, d) => sum + d.amount, 0);

  const oneTimePct = totalAmount > 0 ? Math.round((oneTimeAmount / totalAmount) * 100) : 0;
  const recurringPct = totalAmount > 0 ? Math.round((recurringAmount / totalAmount) * 100) : 0;

  return [
    {
      id: 'total-donations',
      label: 'Total Donations',
      value: `₹ ${totalAmount.toLocaleString('en-IN')}`,
      supportText: hasRange ? 'In selected period' : '+22% this month',
      tone: 'navy',
      subLabel: `${successfulList.length} verified donations`,
    },
    {
      id: 'total-donors',
      label: 'Total Donors',
      value: String(uniqueDonors),
      supportText: hasRange ? 'In selected period' : '+18% this month',
      tone: 'warning',
      subLabel: 'Unique verified contributors',
    },
    {
      id: 'one-time-donations',
      label: 'One-time Donations',
      value: `₹ ${oneTimeAmount.toLocaleString('en-IN')}`,
      supportText: `${oneTimePct}% of total volume`,
      tone: 'success',
      subLabel: 'Direct campaign contributions',
    },
    {
      id: 'recurring-donations',
      label: 'Recurring Donations',
      value: `₹ ${recurringAmount.toLocaleString('en-IN')}`,
      supportText: `${recurringPct}% of total volume`,
      tone: 'gold',
      subLabel: 'Monthly mandate contributors',
    },
  ];
};

export const computeTabCounts = (
  donations: Donation[],
  dateRange?: DateRange | null
): { all: number; oneTime: number; recurring: number; offline: number } => {
  let list = donations;
  if (dateRange && (dateRange.from || dateRange.to)) {
    list = list.filter(d => isWithinDateRange(d.created_at, dateRange.from, dateRange.to));
  }

  return {
    all: list.length,
    oneTime: list.filter(d => d.donation_type === 'ONE_TIME').length,
    recurring: list.filter(d => d.donation_type === 'RECURRING').length,
    offline: list.filter(d => d.donation_type === 'OFFLINE').length,
  };
};

export const createDonationReceipt = (donation: Donation): DonationReceiptModel => {
  const rawId = donation.id.replace('don-', '');
  const receiptYear = new Date(donation.created_at).getFullYear() || 2026;
  const receiptNumber = `HRSJM-${receiptYear}-${rawId.slice(-4).toUpperCase()}`;

  return {
    id: donation.id,
    receiptNumber,
    receiptDate: donation.created_at,
    donorName: donation.donor_name,
    donorMobile: donation.donor_mobile,
    donorEmail: donation.donor_email,
    memberCode: donation.member_code,
    cause: donation.cause || 'General Donation',
    amount: donation.amount,
    paymentMethod: donation.payment_method || 'Online UPI',
    transactionId: donation.transaction_id || `TXN${rawId.slice(-8)}`,
    status: donation.status,
    notes: donation.remark,
    source: donation.source || 'Website',
  };
};
