import React, { useState, useEffect } from 'react';
import { Calendar, Users, FileText, MessageSquare } from 'lucide-react';
import { apiClient } from '@/services/apiClient';
import { DashboardStatCard } from '../components/DashboardStatCard';
import { MembershipGrowthChart } from '../components/MembershipGrowthChart';
import { StatusDonutChart } from '../components/StatusDonutChart';
import { RecentMembersTable } from '../components/RecentMembersTable';
import { RecentApplicationsTable } from '../components/RecentApplicationsTable';
import { UpcomingEventsCard } from '../components/UpcomingEventsCard';
import { FinancialSummaryCard } from '../components/FinancialSummaryCard';
import { RecentActivitiesCard } from '../components/RecentActivitiesCard';
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
  donations?: { total: number; receivedAmount: number; thisMonth: number; prevMonth: number };
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
  }, []);

  const totalMembers = dashboardData?.memberships?.total ?? membersStore.getAllMembers().length;
  const totalApps = dashboardData?.applications?.total ?? applicationsStore.getAllApplications().length;
  const pendingApps = dashboardData?.memberships?.pending ?? 0;
  const totalTickets = dashboardData?.tickets?.total ?? supportStore.getAllTickets().length;
  const openTickets = dashboardData?.tickets?.open ?? 0;
  const totalEvents = dashboardData?.events?.total ?? eventsStore.getAllEvents().length;
  const upcomingEvents = dashboardData?.events?.upcoming ?? 0;

  return (
    <div style={styles.dashboardContainer}>
      {/* Main Page Header */}
      <div style={styles.headerRow}>
        <div>
          <h1 style={styles.headingTitle}>Welcome, Administrator</h1>
          <p style={styles.headingSubtitle}>
            Human Rights Sarv Janhit Manch — National Digital Governance &amp; Membership Overview
          </p>
        </div>
        <div style={styles.dateBadge}>
          <Calendar size={15} color="#1E3A8A" />
          <span>Live FY 26-27</span>
        </div>
      </div>

      {loading && !dashboardData && (
        <div style={styles.contentGrid}>
          <div style={styles.statCardsGrid}>
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
          {/* 4 Primary Top Metrics */}
          <div style={styles.statCardsGrid}>
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
              subtitle={`${openTickets} open tickets`}
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
            />
            <StatusDonutChart
              title="Application Status Distribution"
              segments={
                dashboardData?.applicationsByStatus
                  ? [
                      { label: 'Pending', count: dashboardData.applicationsByStatus.PENDING || 0, color: '#D97706' },
                      { label: 'Under Review', count: dashboardData.applicationsByStatus.UNDER_REVIEW || 0, color: '#174A78' },
                      { label: 'Approved', count: dashboardData.applicationsByStatus.APPROVED || 0, color: '#16A34A' },
                      { label: 'Rejected', count: dashboardData.applicationsByStatus.REJECTED || 0, color: '#DC2626' },
                    ]
                  : [
                      { label: 'Pending', count: 0, color: '#D97706' },
                      { label: 'Under Review', count: 0, color: '#174A78' },
                      { label: 'Approved', count: 0, color: '#16A34A' },
                      { label: 'Rejected', count: 0, color: '#DC2626' },
                    ]
              }
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
              totalCollections={dashboardData?.revenue?.total}
              receiptsCount={dashboardData?.donations?.total}
            />
            <StatusDonutChart
              title="Complaints Resolution"
              segments={
                dashboardData?.ticketsByStatus
                  ? [
                      { label: 'Submitted', count: dashboardData.ticketsByStatus.SUBMITTED || 0, color: '#D97706' },
                      { label: 'Under Review', count: dashboardData.ticketsByStatus.UNDER_REVIEW || 0, color: '#174A78' },
                      { label: 'Resolved', count: dashboardData.ticketsByStatus.RESOLVED || 0, color: '#16A34A' },
                      { label: 'Closed', count: dashboardData.ticketsByStatus.CLOSED || 0, color: '#64748B' },
                    ]
                  : [
                      { label: 'Submitted', count: 0, color: '#D97706' },
                      { label: 'Under Review', count: 0, color: '#174A78' },
                      { label: 'Resolved', count: 0, color: '#16A34A' },
                      { label: 'Closed', count: 0, color: '#64748B' },
                    ]
              }
            />
          </div>

          {/* Real-time Activity Feed */}
          <div style={styles.fullWidthSection}>
            <RecentActivitiesCard activities={dashboardData?.recentActivity} />
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
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '16px',
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
