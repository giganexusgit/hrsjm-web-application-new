import type {
  Donation,
  DonationReceiptModel,
  DonationRowModel,
  DonationStatItem,
  DateRange,
} from '../types/donations.types';

export const INITIAL_DONATIONS: Donation[] = [
  {
    id: 'don-1001',
    donor_name: 'Aman Shaikh',
    donor_mobile: '+91 98765 43210',
    donor_email: 'aman.shaikh@example.com',
    member_code: 'MEM000123',
    cause: 'General Donation',
    remark: 'Support for mission activities & humanitarian aid',
    amount: 10000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Website',
    payment_method: 'UPI (Google Pay)',
    transaction_id: 'UPI1234567890',
    created_at: '2026-10-28T11:24:00Z',
    updated_at: '2026-10-28T11:24:00Z',
  },
  {
    id: 'don-1002',
    donor_name: 'Saniya Khan',
    donor_mobile: '+91 98765 43211',
    donor_email: 'saniya.khan@example.com',
    member_code: 'MEM000124',
    cause: 'Education Support',
    remark: 'Books, uniforms and fees for underprivileged children',
    amount: 5000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Application UI',
    payment_method: 'UPI (PhonePe)',
    transaction_id: 'UPI987654321102',
    created_at: '2026-10-27T16:15:00Z',
    updated_at: '2026-10-27T16:15:00Z',
  },
  {
    id: 'don-1003',
    donor_name: 'Rohit Verma',
    donor_mobile: '+91 98765 43212',
    donor_email: 'rohit.v@example.com',
    member_code: 'MEM000125',
    cause: 'Medical Support',
    remark: 'Critical emergency relief and medicine distribution',
    amount: 25000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Web App',
    payment_method: 'Bank Transfer (NEFT)',
    transaction_id: 'NEFT2026092612',
    created_at: '2026-10-26T14:40:00Z',
    updated_at: '2026-10-26T14:40:00Z',
  },
  {
    id: 'don-1004',
    donor_name: 'Faiza Ansari',
    donor_mobile: '+91 98765 43213',
    donor_email: 'faiza.a@example.com',
    member_code: 'MEM000126',
    cause: 'General Donation',
    remark: 'Mission operations and volunteer support',
    amount: 2000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Website',
    payment_method: 'UPI (Paytm)',
    transaction_id: 'UPI8811224455',
    created_at: '2026-10-25T10:05:00Z',
    updated_at: '2026-10-25T10:05:00Z',
  },
  {
    id: 'don-1005',
    donor_name: 'Imran Qureshi',
    donor_mobile: '+91 98765 43214',
    donor_email: 'imran.q@example.com',
    member_code: 'MEM000127',
    cause: 'Relief Support',
    remark: 'Emergency rations & blankets distribution in flood areas',
    amount: 50000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Application UI',
    payment_method: 'Bank Transfer (RTGS)',
    transaction_id: 'RTGS2026092401',
    created_at: '2026-10-24T18:20:00Z',
    updated_at: '2026-10-24T18:20:00Z',
  },
  {
    id: 'don-1006',
    donor_name: 'Neha Kapoor',
    donor_mobile: '+91 98765 43215',
    donor_email: 'neha.k@example.com',
    member_code: 'MEM000128',
    cause: 'Recurring Donation',
    remark: 'Standing monthly donation (₹ 2,000 / month)',
    amount: 2000,
    status: 'SUCCESS',
    donation_type: 'RECURRING',
    source: 'Web App',
    payment_method: 'UPI (Google Pay)',
    transaction_id: 'UPI7788990011',
    created_at: '2026-10-24T09:10:00Z',
    updated_at: '2026-10-24T09:10:00Z',
  },
  {
    id: 'don-1007',
    donor_name: 'Karan Mehta',
    donor_mobile: '+91 98765 43216',
    donor_email: 'karan.m@example.com',
    member_code: 'MEM000129',
    cause: 'Building Fund',
    remark: 'HRSJM Legal Aid & Community Resource Centre building construction',
    amount: 100000,
    status: 'SUCCESS',
    donation_type: 'ONE_TIME',
    source: 'Website',
    payment_method: 'Bank Transfer (NEFT)',
    transaction_id: 'NEFT2026092317',
    created_at: '2026-10-23T17:30:00Z',
    updated_at: '2026-10-23T17:30:00Z',
  },
  {
    id: 'don-1008',
    donor_name: 'Shabana Taj',
    donor_mobile: '+91 98765 43217',
    donor_email: 'shabana.t@example.com',
    member_code: 'MEM000130',
    cause: 'Recurring Donation',
    remark: 'Monthly standing order (₹ 1,000 / month)',
    amount: 1000,
    status: 'SUCCESS',
    donation_type: 'RECURRING',
    source: 'Application UI',
    payment_method: 'UPI (PhonePe)',
    transaction_id: 'UPI5566778899',
    created_at: '2026-10-22T11:12:00Z',
    updated_at: '2026-10-22T11:12:00Z',
  },
  {
    id: 'don-1009',
    donor_name: 'Rajesh Gupta',
    donor_mobile: '+91 98765 43218',
    donor_email: 'rajesh.g@example.com',
    member_code: 'MEM000131',
    cause: 'Offline Donation',
    remark: 'Cash collection at Annual Human Rights Conclave reception',
    amount: 15000,
    status: 'SUCCESS',
    donation_type: 'OFFLINE',
    source: 'Web App',
    payment_method: 'Cash / Cheque',
    transaction_id: 'CHQ-541289-SBI',
    created_at: '2026-10-21T13:45:00Z',
    updated_at: '2026-10-21T13:45:00Z',
  },
  {
    id: 'don-1010',
    donor_name: 'Kavita Verma',
    donor_mobile: '+91 98765 43219',
    donor_email: 'kavita.v@example.com',
    member_code: 'MEM000132',
    cause: 'Recurring Donation',
    remark: 'Monthly legal aid sponsorship (₹ 3,000 / month)',
    amount: 3000,
    status: 'SUCCESS',
    donation_type: 'RECURRING',
    source: 'Website',
    payment_method: 'Net Banking (HDFC)',
    transaction_id: 'NB9988221100',
    created_at: '2026-10-20T10:15:00Z',
    updated_at: '2026-10-20T10:15:00Z',
  },
  {
    id: 'don-1011',
    donor_name: 'Anita Deshmukh',
    donor_mobile: '+91 98765 43220',
    donor_email: 'anita.d@example.com',
    member_code: null,
    cause: 'Women Legal Aid Fund',
    remark: 'Dedicated sponsorship for domestic violence legal cell',
    amount: 7500,
    status: 'PENDING',
    donation_type: 'ONE_TIME',
    source: 'Website',
    payment_method: 'Payment Gateway (Razorpay)',
    transaction_id: 'PAY_PENDING_8819',
    created_at: '2026-10-19T15:20:00Z',
    updated_at: '2026-10-19T15:20:00Z',
  },
  {
    id: 'don-1012',
    donor_name: 'Tariq Siddiqui',
    donor_mobile: '+91 98765 43221',
    donor_email: 'tariq.s@example.com',
    member_code: 'MEM000133',
    cause: 'General Donation',
    remark: 'Donation reversal requested — double debited by bank',
    amount: 5000,
    status: 'REFUNDED',
    donation_type: 'ONE_TIME',
    source: 'Application UI',
    payment_method: 'UPI (Google Pay)',
    transaction_id: 'UPI9922110033',
    created_at: '2026-10-18T12:00:00Z',
    updated_at: '2026-10-19T09:30:00Z',
  },
  {
    id: 'don-1013',
    donor_name: 'Suresh Patel',
    donor_mobile: '+91 98765 43222',
    donor_email: null,
    member_code: null,
    cause: 'Child Welfare Aid',
    remark: 'Gateway timeout during card authorization',
    amount: 1500,
    status: 'FAILED',
    donation_type: 'ONE_TIME',
    source: 'Website',
    payment_method: 'Credit Card',
    transaction_id: 'TXN_FAIL_0991',
    created_at: '2026-10-17T11:45:00Z',
    updated_at: '2026-10-17T11:45:00Z',
  },
  {
    id: 'don-1014',
    donor_name: 'Meera Nambiar',
    donor_mobile: '+91 98765 43223',
    donor_email: 'meera.n@example.com',
    member_code: 'MEM000134',
    cause: 'Offline Donation',
    remark: 'Direct cash handed to district coordinator with signed acknowledgment',
    amount: 8000,
    status: 'SUCCESS',
    donation_type: 'OFFLINE',
    source: 'Web App',
    payment_method: 'Cash',
    transaction_id: 'CSH-REC-2026-104',
    created_at: '2026-10-16T14:10:00Z',
    updated_at: '2026-10-16T14:10:00Z',
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
