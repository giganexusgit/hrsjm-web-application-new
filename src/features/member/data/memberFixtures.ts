import type {
  MemberProfile,
  MemberAnnouncement,
  MemberPassbookEntry,
  RenewalPackageOption,
} from '../types/member.types';

export const INITIAL_DEV_MEMBER: MemberProfile = {
  id: '',
  userId: '',
  membershipNumber: '',
  applicationNumber: '',
  fullName: '',
  fatherOrSpouseName: '',
  email: '',
  phone: '',
  avatarUrl: undefined,
  dob: '',
  gender: '',
  bloodGroup: '',
  occupation: '',
  address: {
    line: '',
    city: '',
    state: '',
    pincode: '',
  },
  chapter: '',
  designation: 'Member',
  category: 'annual_regular',
  categoryTitle: 'Member',
  status: 'ACTIVE',
  validFrom: '',
  validUpto: '',
  daysRemaining: 0,
  isExpiringSoon: false,
  isExpired: false,
  joiningDate: '',
  stats: {
    totalDonated: 0,
    donationCount: 0,
    eventsAttended: 0,
    ticketsCount: 0,
    activeTicketsCount: 0,
  },
  qrVerificationUrl: '',
  documents: [],
};

export const EXPIRING_DEV_MEMBER: MemberProfile = {
  ...INITIAL_DEV_MEMBER,
  status: 'EXPIRING_SOON',
  isExpiringSoon: true,
};

export const EXPIRED_DEV_MEMBER: MemberProfile = {
  ...INITIAL_DEV_MEMBER,
  status: 'EXPIRED',
  isExpired: true,
};

export const MEMBER_ANNOUNCEMENTS: MemberAnnouncement[] = [];

export const MEMBER_RENEWAL_PACKAGES: RenewalPackageOption[] = [
  {
    id: 'standard_1yr',
    name: '1-Year Standard Renewal',
    durationYears: 1,
    fee: 800,
    description: 'Renew your active membership status with all active benefits for a full 12-month term.',
    features: [
      'Digital & Physical ID Card validity extended for 1 year',
      'Accredited voting rights in Annual General Body Meeting (AGM)',
      'Direct grievance escalation desk access',
      'Official letter pad authorization for district chapter activities',
      'Instant 80G Tax-Deductible Contribution Certificate',
    ],
    recommended: true,
  },
  {
    id: 'extended_3yr',
    name: '3-Year Multi-Year Extension',
    durationYears: 3,
    fee: 2160,
    originalFee: 2400,
    discountBadge: 'Save 10%',
    description: 'Long-term commitment for dedicated human rights defenders with locked-in membership rates.',
    features: [
      'Full 3-year uninterrupted validity lock',
      'Complimentary Gold Embossed Physical Certificate by speed post',
      'Priority invitee status at National Convention',
      'All standard active membership benefits',
      'Single consolidated 80G Tax Exemption Receipt',
    ],
  },
  {
    id: 'upgrade_state',
    name: 'Upgrade to State Unit Post',
    durationYears: 2,
    fee: 2300,
    discountBadge: 'Tier Upgrade',
    description: 'Elevate your mandate to represent HRSJM at the State Directorate level with extended jurisdiction.',
    features: [
      '2 Years State Unit accreditation',
      'Official State Letter Pad with designation print',
      'Right to inspect local public offices & submit formal inquiries',
      'State Directorate Council participation',
      'Executive Gold ID Card with State badge',
    ],
  },
  {
    id: 'upgrade_life',
    name: 'National Life Patron',
    durationYears: 99,
    fee: 51000,
    discountBadge: 'Lifetime Patron',
    description: 'Lifetime permanent patron status with national leadership privileges and lifetime immunity from renewal.',
    features: [
      'Lifetime permanent accredited membership',
      'Permanent seat in Central Advisory Council',
      'Brass Framed Memento & Certificate of Honor',
      'VVIP protocol at all National Summits',
      'Permanent 80G IT exemption receipt',
    ],
  },
];

export const INITIAL_MEMBER_PASSBOOK: MemberPassbookEntry[] = [];
