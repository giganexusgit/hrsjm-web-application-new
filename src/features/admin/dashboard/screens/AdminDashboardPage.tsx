import React, { useState, useEffect, useSyncExternalStore, useMemo } from 'react';
import { Calendar, Users, FileText, MessageSquare } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { DashboardStatCard } from '../components/DashboardStatCard';
import { MembershipGrowthChart } from '../components/MembershipGrowthChart';
import { StatusDonutChart } from '../components/StatusDonutChart';
import { RecentMembersTable } from '../components/RecentMembersTable';
import { RecentApplicationsTable } from '../components/RecentApplicationsTable';
import { UpcomingEventsCard } from '../components/UpcomingEventsCard';
import { FinancialSummaryCard } from '../components/FinancialSummaryCard';
import { SkeletonCard } from '@/components/common/SkeletonCard';
import { AppErrorState } from '@/components/common/AppErrorState';
import { membersStore } from '@/features/admin/members/store/membersStore';
import { applicationsStore } from '@/features/admin/applications/store/applicationsStore';
import { supportStore } from '@/features/admin/support/store/supportStore';
import { eventsStore } from '@/features/admin/events/store/eventsStore';

interface LiveDashboardData {
  users?: { total: number; thisMonth: number; prevMonth: number };
  memberships?: { total: number; active: number; pending: number; thisMonth: number; prevMonth: number };
  renewals?: { total: number; pending: number; collectedAmount: number };
  assistance?: { total: number; pending: number; thisMonth: number; prevMonth: number };
  applications?: { total: number; memberships: number; assistance: number; thisMonth: number; prevMonth: number };
  tickets?: { total: number; open: number; thisMonth: number; prevMonth: number };
  events?: { total: number; upcoming: number; thisMonth: number; prevMonth: number };
  donations?: { total: number; successful?: number; receivedAmount: number; thisMonth: number; prevMonth: number };
  revenue?: { membershipIncome: number; donationIncome: number; total: number };
  applicationsByStatus?: Record<string, number>;
  ticketsByStatus?: Record<string, number>;
  memberGrowth?: { month: string; total: number }[];
  recentActivity?: any[];
}

export const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<LiveDashboardData | null>(null);

  // Subscribe to live client stores for instantaneous real-time reactivity
  const appsVersion = useSyncExternalStore(applicationsStore.subscribe, applicationsStore.getSnapshot);
  const eventsSnapshot = useSyncExternalStore(eventsStore.subscribe, eventsStore.getSnapshot);
  const membersSnapshot = useSyncExternalStore(membersStore.subscribe, membersStore.getSnapshot);
  const supportSnapshot = useSyncExternalStore(supportStore.subscribe, supportStore.getSnapshot);

  const fetchAdminDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get<any>('/admin/dashboard');
      const data = (res as any)?.data || res;
      if (data) {
        setDashboardData(data);
      }
    } catch (err: any) {
      console.warn('Could not fetch live admin dashboard metrics:', err);
      // Graceful local store fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
    applicationsStore.fetchApplications().catch(() => {});
    eventsStore.fetchEvents().catch(() => {});
    membersStore.fetchMembers().catch(() => {});
    supportStore.fetchTickets().catch(() => {});
  }, []);

  const liveMembers = membersSnapshot.members;
  const totalMembers = dashboardData?.memberships?.total ?? liveMembers.length;

  const allApps = applicationsStore.getAllApplications();
  const totalApps = Math.max(dashboardData?.applications?.total ?? 0, allApps.length);
  const storePendingCount = allApps.filter(
    (a) => a.status === 'submitted' || (a.status as string) === 'pending'
  ).length;
  const pendingApps = Math.max(dashboardData?.memberships?.pending ?? 0, storePendingCount);

  const liveTickets = supportSnapshot.tickets;
  const totalTickets = Math.max(dashboardData?.tickets?.total ?? 0, liveTickets.length);
  const openTickets = dashboardData?.tickets?.open ?? liveTickets.filter(t => t.status === 'SUBMITTED' || t.status === 'UNDER_REVIEW').length;

  // Real admin-created events from eventsStore (excludes seeded database fixture stubs)
  const liveEvents = eventsSnapshot.events;
  const totalEvents = liveEvents.length;
  const upcomingEvents = liveEvents.filter(e => e.status === 'UPCOMING' || !e.status).length;

  // Dynamically compute Application Status Distribution segments matching Card 2
  const applicationSegments = useMemo(() => {
    const apps = applicationsStore.getAllApplications();
    if (apps.length > 0) {
      let pending = 0;
      let underReview = 0;
      let approved = 0;
      let rejected = 0;

      for (const app of apps) {
        const st = (app.status || '').toLowerCase();
        if (st === 'approved' || st === 'active') {
          approved += 1;
        } else if (st === 'under_review') {
          underReview += 1;
        } else if (st === 'rejected' || st === 'cancelled') {
          rejected += 1;
        } else {
          pending += 1;
        }
      }

      return [
        { label: 'Pending', count: pending, color: '#D97706' },
        { label: 'Under Review', count: underReview, color: '#174A78' },
        { label: 'Approved', count: approved, color: '#16A34A' },
        { label: 'Rejected', count: rejected, color: '#DC2626' },
      ];
    }

    const pendingCount = (dashboardData?.applicationsByStatus?.PENDING || 0) + (dashboardData?.memberships?.pending || 0);
    const underReviewCount = dashboardData?.applicationsByStatus?.UNDER_REVIEW || 0;
    const approvedCount = (dashboardData?.applicationsByStatus?.APPROVED || 0) + (dashboardData?.memberships?.active || 0);
    const rejectedCount = dashboardData?.applicationsByStatus?.REJECTED || 0;

    return [
      { label: 'Pending', count: pendingCount, color: '#D97706' },
      { label: 'Under Review', count: underReviewCount, color: '#174A78' },
      { label: 'Approved', count: approvedCount, color: '#16A34A' },
      { label: 'Rejected', count: rejectedCount, color: '#DC2626' },
    ];
  }, [appsVersion, dashboardData]);

  // Dynamically compute Support Ticket Resolution segments
  const ticketSegments = useMemo(() => {
    const tickets = supportSnapshot.tickets;
    if (tickets.length > 0) {
      let submitted = 0;
      let underReview = 0;
      let resolved = 0;
      let closed = 0;

      for (const t of tickets) {
        const st = (t.status || '').toUpperCase();
        if (st === 'RESOLVED') resolved += 1;
        else if (st === 'CLOSED') closed += 1;
        else if (st === 'IN_PROGRESS' || st === 'UNDER_REVIEW') underReview += 1;
        else submitted += 1;
      }

      return [
        { label: 'Submitted', count: submitted, color: '#D97706' },
        { label: 'Under Review', count: underReview, color: '#174A78' },
        { label: 'Resolved', count: resolved, color: '#16A34A' },
        { label: 'Closed', count: closed, color: '#64748B' },
      ];
    }

    return [
      { label: 'Submitted', count: dashboardData?.ticketsByStatus?.SUBMITTED ?? dashboardData?.tickets?.open ?? 0, color: '#D97706' },
      { label: 'Under Review', count: dashboardData?.ticketsByStatus?.UNDER_REVIEW ?? 0, color: '#174A78' },
      { label: 'Resolved', count: dashboardData?.ticketsByStatus?.RESOLVED ?? 0, color: '#16A34A' },
      { label: 'Closed', count: dashboardData?.ticketsByStatus?.CLOSED ?? 0, color: '#64748B' },
    ];
  }, [supportSnapshot, dashboardData]);

  return (
    <div style={styles.dashboardContainer}>
      {/* Main Page Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.headingTitle}>Welcome, Administrator</h1>
          <p style={styles.headingSubtitle}>
            Human Rights &amp; Social Justice Mission — National Digital Governance &amp; Membership Overview
          </p>
        </div>
        <div style={styles.dateBadge}>
          <Calendar size={15} color="#1E3A8A" />
          <span>Live FY 26-27</span>
        </div>
      </div>

      {loading && !dashboardData && (
        <div style={styles.contentGrid}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <SkeletonCard height={120} />
            <SkeletonCard height={120} />
            <SkeletonCard height={120} />
            <SkeletonCard height={120} />
          </div>
          <div style={styles.twoColumnGrid}>
            <SkeletonCard height={320} />
            <SkeletonCard height={320} />
          </div>
        </div>
      )}

      {error && (
        <div style={styles.errorContainer}>
          <AppErrorState
            title="Unable to Synchronize Governance Metrics"
            message={error}
            onRetry={fetchAdminDashboard}
          />
        </div>
      )}

      {(!loading || dashboardData) && (
        <div style={styles.normalViewWrapper}>
          {/* 4 Primary Top Metrics - All 4 in 1 line on desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <DashboardStatCard
              title="Total Members"
              value={totalMembers.toLocaleString('en-IN')}
              subtitle={dashboardData?.memberships ? `+${dashboardData.memberships.thisMonth} this month` : 'Active Roster'}
              tone="navy"
              linkTo="/admin/members"
              icon={Users}
            />
            <DashboardStatCard
              title="Total Applications"
              value={totalApps.toLocaleString('en-IN')}
              subtitle={`${pendingApps} pending review`}
              tone="gold"
              linkTo="/admin/applications"
              icon={FileText}
            />
            <DashboardStatCard
              title="Total Complaints"
              value={totalTickets.toLocaleString('en-IN')}
              subtitle={`${openTickets} ${openTickets === 1 ? 'open ticket' : 'open tickets'}`}
              tone="success"
              linkTo="/admin/support"
              icon={MessageSquare}
            />
            <DashboardStatCard
              title="Total Events"
              value={totalEvents.toLocaleString('en-IN')}
              subtitle={`${upcomingEvents} upcoming`}
              tone="warning"
              linkTo="/admin/events"
              icon={Calendar}
            />
          </div>

          {/* Interactive Trends & Breakdowns */}
          <div style={styles.twoColumnGrid}>
            <MembershipGrowthChart
              growthData={dashboardData?.memberGrowth}
              currentCount={totalMembers}
              totalMembers={totalMembers}
              activeMembers={totalMembers}
            />
            <StatusDonutChart
              title="Application Status Distribution"
              segments={applicationSegments}
            />
          </div>

          {/* Data Tables: Members & Applications */}
          <div style={styles.twoColumnGrid}>
            <RecentMembersTable />
            <RecentApplicationsTable />
          </div>

          {/* Secondary Row: Complaints breakdown, Financial Summary, Upcoming events */}
          <div style={styles.threeColumnGrid}>
            <UpcomingEventsCard />
            <FinancialSummaryCard
              totalCollections={dashboardData?.revenue?.donationIncome ?? dashboardData?.revenue?.total ?? 0}
              receiptsCount={dashboardData?.donations?.successful ?? dashboardData?.donations?.total ?? 0}
              averageDonation={
                (dashboardData?.donations?.successful ?? 0) > 0
                  ? Math.round((dashboardData?.revenue?.donationIncome || 0) / (dashboardData?.donations?.successful || 1))
                  : ((dashboardData?.donations?.total ?? 0) > 0 && (dashboardData?.revenue?.donationIncome ?? 0) > 0
                      ? Math.round((dashboardData?.revenue?.donationIncome || 0) / (dashboardData?.donations?.total || 1))
                      : 0)
              }
            />
            <StatusDonutChart
              title="Complaints Resolution"
              segments={ticketSegments}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  headerRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  },
  headingTitle: {
    fontSize: '24px',
    fontWeight: 800,
    color: '#06294D',
    letterSpacing: '-0.02em',
    margin: 0,
  },
  headingSubtitle: {
    fontSize: '13px',
    color: '#64748B',
    margin: '4px 0 0 0',
  },
  dateBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#EEF2FF',
    color: '#1E3A8A',
    padding: '8px 14px',
    borderRadius: '8px',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid #C7D2FE',
  },
  contentGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  normalViewWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  statCardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: '16px',
    width: '100%',
  },
  twoColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
    gap: '20px',
  },
  threeColumnGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  fullWidthSection: {
    width: '100%',
  },
  errorContainer: {
    padding: '40px 0',
  },
};
