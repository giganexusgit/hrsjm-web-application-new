/**
 * Events Management Module - Type Definitions
 * Exact parity with APK: hrsjm-application-ui/src/features/admin/content/events/types/events.types.ts
 * and Backend Entity: HRSJM-back-api/src/modules/events/entities/event.entity.ts
 */

export type EventUiStatus = 'UPCOMING' | 'COMPLETED' | 'CANCELLED' | 'DRAFT';

export type EventStatusFilter = 'ALL' | EventUiStatus;

export type EventFormat = 'IN_PERSON' | 'ONLINE' | 'HYBRID';

export interface EventListItem {
  id: string;
  title: string;
  category: string;
  eventType?: EventFormat | string;
  location: string;
  address?: string;
  coverImageUrl?: string | null;
  startAt: string; // ISO 8601
  endAt?: string | null; // ISO 8601
  allDay?: boolean;
  organizer?: string;
  description: string;
  shortInformation?: string | null;
  registrations: number;
  capacity?: number;
  perPersonLimit?: number;
  targetAudience?: string;
  language?: string;
  tags?: string[];
  status: EventUiStatus;
  isDonationEnabled?: boolean;
  donationMessage?: string | null;
  createdBy?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface EventStatsSummary {
  total: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  drafts: number;
}

export interface CreateEventFormState {
  title: string;
  description: string;
  coverImageUri: string | null;
  category: string;
  eventType: EventFormat;
  eventDate: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endDate?: string; // YYYY-MM-DD
  endTime: string; // HH:mm
  allDay: boolean;
  location: string;
  address: string;
  registrationRequired: boolean;
  totalSeats: string;
  perPersonLimit: string;
  organizedBy: string;
  targetAudience: string;
  language: string;
  shortInformation: string;
  tags: string[];
  status: 'DRAFT' | 'PUBLISH';
  isDonationEnabled: boolean;
  donationMessage: string;
}

export type CreateEventFieldErrors = Partial<Record<keyof CreateEventFormState, string>>;

export interface EventFilterState {
  status: EventStatusFilter;
  category: string; // 'ALL' or category name
  format: string; // 'ALL' or EventFormat
  searchQuery: string;
}

export const EVENT_CATEGORIES: string[] = [
  'Seminar',
  'Workshop',
  'Awareness Camp',
  'Health Camp',
  'Relief Activity',
  'Legal Awareness',
  'Community',
  'Youth Convention',
  'Education',
];

export const EVENT_FORMAT_OPTIONS: Array<{ id: EventFormat; label: string; icon: string }> = [
  { id: 'IN_PERSON', label: 'In-Person (Offline)', icon: '📍' },
  { id: 'ONLINE', label: 'Online (Virtual)', icon: '🌐' },
  { id: 'HYBRID', label: 'Hybrid', icon: '🔄' },
];

export const TARGET_AUDIENCE_OPTIONS: string[] = [
  'Open to All',
  'Students & Youth',
  'Women & Children',
  'Senior Citizens',
  'Volunteers & Social Workers',
  'General Public',
];

export const LANGUAGE_OPTIONS: string[] = [
  'English',
  'Hindi',
  'Marathi',
  'English, Hindi',
  'Hindi, Marathi',
];

export const SAMPLE_COVER_IMAGES = [
  'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&auto=format&fit=crop&q=80',
];

export const STATUS_META: Record<
  EventUiStatus,
  { label: string; tone: string; bg: string; border: string; description: string }
> = {
  UPCOMING: {
    label: 'Upcoming',
    tone: '#D97706',
    bg: '#FFF9E6',
    border: '#FDE68A',
    description: 'This event is scheduled and open for registration.',
  },
  COMPLETED: {
    label: 'Completed',
    tone: '#16A34A',
    bg: '#F0FDF4',
    border: '#BBF7D0',
    description: 'This event has concluded successfully.',
  },
  CANCELLED: {
    label: 'Cancelled',
    tone: '#DC2626',
    bg: '#FDEEEF',
    border: '#FECACA',
    description: 'This event was cancelled and registrations are closed.',
  },
  DRAFT: {
    label: 'Draft',
    tone: '#475569',
    bg: '#F1F5F9',
    border: '#CBD5E1',
    description: 'This event is saved as a draft and not publicly visible.',
  },
};

