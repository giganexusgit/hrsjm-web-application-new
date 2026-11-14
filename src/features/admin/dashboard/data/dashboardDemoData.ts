/**
 * HRSJM Admin Dashboard Types & Empty Seeds
 * All data is loaded live from the backend API.
 */

export interface DashboardMetric {
  title: string;
  value: string | number;
  subtitle: string;
  tone: 'navy' | 'gold' | 'success' | 'warning';
  linkTo: string;
}

export const DEMO_DASHBOARD_METRICS: DashboardMetric[] = [];

export interface GrowthPoint {
  label: string;
  members: number;
}

export const DEMO_GROWTH_DATA: Record<string, GrowthPoint[]> = {
  '7d': [],
  '30d': [],
  '6m': [],
  '1y': [],
};

export interface DonutSegment {
  label: string;
  count: number;
  color: string;
}

export const DEMO_APPLICATION_STATUS: DonutSegment[] = [];

export const DEMO_COMPLAINTS_STATUS: DonutSegment[] = [];

export interface RecentMember {
  id: string;
  name: string;
  memberId: string;
  category: string;
  joinedDate: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRING';
}

export const DEMO_RECENT_MEMBERS: RecentMember[] = [];

export interface RecentApplication {
  id: string;
  applicantName: string;
  applicationId: string;
  type: string;
  submittedDate: string;
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED';
}

export const DEMO_RECENT_APPLICATIONS: RecentApplication[] = [];

export interface RecentActivity {
  id: string;
  type: 'member' | 'application' | 'donation' | 'complaint';
  description: string;
  timestamp: string;
  actor: string;
}

export const DEMO_RECENT_ACTIVITIES: RecentActivity[] = [];

export interface UpcomingEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  registeredCount: number;
  category: 'Human Rights' | 'Legal Aid' | 'National Meet';
}

export const DEMO_UPCOMING_EVENTS: UpcomingEvent[] = [];
