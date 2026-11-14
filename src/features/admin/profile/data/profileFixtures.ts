/**
 * Initial fixtures for HRSJM Administrator Profile & ID Card.
 * Consistent with Central HRSJM Database & Mobile Profile Store.
 */

import type { AdminProfile } from '../types/profile.types';

export const INITIAL_ADMIN_PROFILE: AdminProfile = {
  accountName: 'Administrator',
  adminId: 'ADMIN-01',
  memberId: '',
  fullName: 'Administrator',
  email: 'admin@hrsjm.org',
  phone: '',
  dateOfBirth: '',
  bloodGroup: '',
  avatar: '',
  role: 'Super Admin',
  designation: 'Central Administrator',
  department: 'Administration',
  accountStatus: 'Active',
  membershipType: 'Admin',
  memberSince: '',
  issueDate: '',
  validTill: '',
  emergencyContact: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  hasAppliedMembership: false,
  membershipStatus: 'Active',
  applicationId: '',
  appliedMembershipType: '',
};

export const BLOOD_GROUPS: string[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const ADMIN_ROLES: string[] = [
  'Super Admin',
  'Admin',
  'National Executive Member',
  'Hon\'ble State Director',
  'State President',
  'Zonal Incharge',
  'District Secretary',
  'Legal Cell Incharge',
];

export const AVATAR_PRESETS = [
  {
    id: 'avatar-1',
    label: 'Professional Male 1',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'avatar-2',
    label: 'Professional Male 2',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'avatar-3',
    label: 'Professional Male 3',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'avatar-4',
    label: 'Professional Female 1',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'avatar-5',
    label: 'Professional Female 2',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'avatar-6',
    label: 'Formal Portrait',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
];
