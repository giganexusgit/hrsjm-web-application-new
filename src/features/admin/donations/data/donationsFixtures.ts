import type {
  Donation,
  DonationReceiptModel,
  DonationRowModel,
  DonationStatItem,
  DateRange,
} from '../types/donations.types';

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: '11111111-0001-4000-a000-000000000001',
    donor_name: 'Aman Shaikh',
    donor_mobile: '+91 98765 43210',
    donor_email: 'aman.shaikh@gmail.com',
    member_code: 'MEM000123',
    cause: 'General Mission Fund',
    amount: 10000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Website',
    remark: 'Support for mission activities and community outreach',
    payment_method: 'UPI (Google Pay)',
    transaction_id: 'UPI-HRSJM-20261028-101',
    receipt_number: 'HRSJM-REC-2026-10001',
    created_at: '2026-10-28T11:24:00.000Z',
    updated_at: '2026-10-28T11:24:00.000Z',
  },
  {
    id: '11111111-0002-4000-a000-000000000002',
    donor_name: 'Saniya Khan',
    donor_mobile: '+91 98765 43211',
    donor_email: 'saniya.khan@gmail.com',
    member_code: 'MEM000124',
    cause: 'Child Education Support',
    amount: 5000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Web App',
    remark: 'Help and educational material for underprivileged students',
    payment_method: 'UPI (PhonePe)',
    transaction_id: 'UPI-HRSJM-20261027-102',
    receipt_number: 'HRSJM-REC-2026-10002',
    created_at: '2026-10-27T16:15:00.000Z',
    updated_at: '2026-10-27T16:15:00.000Z',
  },
  {
    id: '11111111-0003-4000-a000-000000000003',
    donor_name: 'Rohit Verma',
    donor_mobile: '+91 98765 43212',
    donor_email: 'rohit.verma@outlook.com',
    member_code: 'MEM000125',
    cause: 'Free Legal Aid & Fundamental Rights',
    amount: 25000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Website',
    remark: 'Support for grassroots legal counselling and human rights defense',
    payment_method: 'Bank Transfer (NEFT)',
    transaction_id: 'NEFT-HRSJM-20261026-103',
    receipt_number: 'HRSJM-REC-2026-10003',
    created_at: '2026-10-26T14:40:00.000Z',
    updated_at: '2026-10-26T14:40:00.000Z',
  },
  {
    id: '11111111-0004-4000-a000-000000000004',
    donor_name: 'Faiza Ansari',
    donor_mobile: '+91 98765 43213',
    donor_email: 'faiza.ansari@gmail.com',
    member_code: 'MEM000126',
    cause: 'Women Empowerment & Legal Literacy',
    amount: 2000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Website',
    remark: 'Support for women legal awareness workshops',
    payment_method: 'UPI (Paytm)',
    transaction_id: 'UPI-HRSJM-20261025-104',
    receipt_number: 'HRSJM-REC-2026-10004',
    created_at: '2026-10-25T10:05:00.000Z',
    updated_at: '2026-10-25T10:05:00.000Z',
  },
  {
    id: '11111111-0005-4000-a000-000000000005',
    donor_name: 'Imran Qureshi',
    donor_mobile: '+91 98765 43214',
    donor_email: 'imran.qureshi@yahoo.com',
    member_code: 'MEM000127',
    cause: 'Humanitarian Relief Fund',
    amount: 50000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Web App',
    remark: 'Emergency assistance and relief support for affected families',
    payment_method: 'Bank Transfer (RTGS)',
    transaction_id: 'RTGS-HRSJM-20261024-105',
    receipt_number: 'HRSJM-REC-2026-10005',
    created_at: '2026-10-24T18:20:00.000Z',
    updated_at: '2026-10-24T18:20:00.000Z',
  },
  {
    id: '11111111-0006-4000-a000-000000000006',
    donor_name: 'Neha Kapoor',
    donor_mobile: '+91 98765 43215',
    donor_email: 'neha.kapoor@gmail.com',
    member_code: 'MEM000128',
    cause: 'Monthly Mission Sustainer',
    amount: 2500,
    status: 'SUCCESS',
    donation_type: 'RECURRING',
    source: 'Website',
    remark: 'Monthly recurring contribution for social justice defense',
    payment_method: 'UPI (Google Pay)',
    transaction_id: 'UPI-HRSJM-20261024-106',
    receipt_number: 'HRSJM-REC-2026-10006',
    created_at: '2026-10-24T09:10:00.000Z',
    updated_at: '2026-10-24T09:10:00.000Z',
  },
  {
    id: '11111111-0007-4000-a000-000000000007',
    donor_name: 'Karan Mehta',
    donor_mobile: '+91 98765 43216',
    donor_email: 'karan.mehta@gmail.com',
    member_code: 'MEM000129',
    cause: 'Infrastructure & Community Center',
    amount: 100000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Website',
    remark: 'Community centre and legal redressal clinic infrastructure',
    payment_method: 'Bank Transfer (NEFT)',
    transaction_id: 'NEFT-HRSJM-20261023-107',
    receipt_number: 'HRSJM-REC-2026-10007',
    created_at: '2026-10-23T17:30:00.000Z',
    updated_at: '2026-10-23T17:30:00.000Z',
  },
  {
    id: '11111111-0008-4000-a000-000000000008',
    donor_name: 'Shabana Taj',
    donor_mobile: '+91 98765 43217',
    donor_email: 'shabana.taj@hotmail.com',
    member_code: 'MEM000130',
    cause: 'Child Education & Nutrition Support',
    amount: 1500,
    status: 'SUCCESS',
    donation_type: 'RECURRING',
    source: 'Web App',
    remark: 'Books, learning kits, and nutrition support',
    payment_method: 'UPI (PhonePe)',
    transaction_id: 'UPI-HRSJM-20261022-108',
    receipt_number: 'HRSJM-REC-2026-10008',
    created_at: '2026-10-22T11:12:00.000Z',
    updated_at: '2026-10-22T11:12:00.000Z',
  },
  {
    id: '11111111-0009-4000-a000-000000000009',
    donor_name: 'Rajesh Sharma',
    donor_mobile: '+91 98765 43218',
    donor_email: 'rajesh.sharma@gmail.com',
    member_code: 'MEM000131',
    cause: 'Constitutional Rights Awareness Campaign',
    amount: 15000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Website',
    remark: 'Human rights seminars and public awareness materials',
    payment_method: 'UPI (Google Pay)',
    transaction_id: 'UPI-HRSJM-20261021-109',
    receipt_number: 'HRSJM-REC-2026-10009',
    created_at: '2026-10-21T15:45:00.000Z',
    updated_at: '2026-10-21T15:45:00.000Z',
  },
  {
    id: '11111111-0010-4000-a000-000000000010',
    donor_name: 'Dr. Arvind Narang',
    donor_mobile: '+91 98765 43219',
    donor_email: 'arvind.narang@gmail.com',
    member_code: 'MEM000132',
    cause: 'Healthcare & Medical Emergency Aid',
    amount: 50000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Website',
    remark: 'Free medical camps and emergency relief healthcare fund',
    payment_method: 'Bank Transfer (IMPS)',
    transaction_id: 'IMPS-HRSJM-20261020-110',
    receipt_number: 'HRSJM-REC-2026-10010',
    created_at: '2026-10-20T12:30:00.000Z',
    updated_at: '2026-10-20T12:30:00.000Z',
  },
];

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
