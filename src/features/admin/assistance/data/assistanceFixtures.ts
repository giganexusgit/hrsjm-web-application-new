import type { AssistanceRequest, AssistanceSummaryStats } from '../types/assistance.types';

export const CAUSE_OPTIONS = [
  { key: 'Medical Emergency', label: 'Medical Emergency (Healthcare)', icon: '🏥' },
  { key: 'Education Support', label: 'Education & Tuition Aid', icon: '🎓' },
  { key: 'Disaster Relief', label: 'Disaster Relief & Rehabilitation', icon: '🌊' },
  { key: 'Livelihood & Food', label: 'Livelihood & Food Support', icon: '🍲' },
  { key: 'Disability Support', label: 'Disability & Prosthetics Aid', icon: '♿' },
  { key: 'Housing / Shelter', label: 'Housing & Shelter Reconstruction', icon: '🏠' },
  { key: 'Other', label: 'General Humanitarian Aid', icon: '🤝' },
];

export const PRESET_AMOUNTS = [5000, 10000, 25000, 50000, 100000, 250000];

export const URGENCY_CONFIG = {
  NORMAL: { label: 'Normal', color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  MEDIUM: { label: 'Medium', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
  HIGH: { label: 'High Priority', color: '#F97316', bg: '#FFF7ED', border: '#FED7AA' },
  CRITICAL: { label: 'Critical Emergency', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
};

export const INITIAL_ASSISTANCE_SEEDS: AssistanceRequest[] = [];

export const INITIAL_ASSISTANCE_STATS: AssistanceSummaryStats = {
  total: 0,
  underReview: 0,
  approved: 0,
  rejected: 0,
  closed: 0,
  totalAmount: 0,
};
