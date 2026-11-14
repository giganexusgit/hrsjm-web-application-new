import type React from 'react';
import { useSyncExternalStore } from 'react';
import { Activity, UserCheck, FileText, Gift, MessageSquare } from 'lucide-react';
import { applicationsStore } from '@/features/admin/applications/store/applicationsStore';
import type { MembershipApplicationItem } from '@/features/admin/applications/types/applications.types';

export interface AdminActivityItem {
  id: string;
  type: 'member' | 'application' | 'donation' | 'complaint';
  description: string;
  timestamp: string;
  actor: string;
}

interface RecentActivitiesCardProps {
  activities?: AdminActivityItem[];
}

export const RecentActivitiesCard: React.FC<RecentActivitiesCardProps> = ({ activities }) => {
  useSyncExternalStore(applicationsStore.subscribe, applicationsStore.getSnapshot);
  const applications = applicationsStore.getAllApplications();

  // If no backend activities provided, derive live from applicationsStore
  const displayActivities: AdminActivityItem[] =
    activities && activities.length > 0
      ? activities
      : applications.slice(0, 4).map((app: MembershipApplicationItem) => ({
          id: `app-act-${app.id}`,
          type: 'application' as const,
          description: `${app.applicantName} submitted ${app.membershipType || 'Application'} (${app.applicationId}) - Status: ${app.status.toUpperCase()}`,
          timestamp: app.submittedAt || 'Recently',
          actor: 'Central Registry',
        }));

  const getActivityIcon = (type: AdminActivityItem['type']) => {
    switch (type) {
      case 'member':
        return <UserCheck size={14} color="#16A34A" />;
      case 'application':
        return <FileText size={14} color="#174A78" />;
      case 'donation':
        return <Gift size={14} color="#D97706" />;
      case 'complaint':
        return <MessageSquare size={14} color="#06294D" />;
      default:
        return <Activity size={14} color="#718096" />;
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <div style={styles.iconWrap}>
            <Activity size={18} color="#06294D" />
          </div>
          <div>
            <h4 style={styles.title}>Recent Administrative Activities</h4>
            <p style={styles.subtitle}>Audit trail of recent platform actions</p>
          </div>
        </div>
      </div>

      {displayActivities.length === 0 ? (
        <div style={styles.emptyContainer}>
          <p style={styles.emptyText}>No recent administrative activities recorded.</p>
        </div>
      ) : (
        <div style={styles.timeline}>
          {displayActivities.map((act, index) => (
            <div key={act.id} style={styles.timelineItem}>
              <div style={styles.iconNode}>{getActivityIcon(act.type)}</div>
              {index < displayActivities.length - 1 && <div style={styles.timelineLine} />}
              <div style={styles.timelineContent}>
                <p style={styles.activityDesc}>{act.description}</p>
                <div style={styles.metaRow}>
                  <span style={styles.actorText}>By {act.actor}</span>
                  <span style={styles.dot}>•</span>
                  <span style={styles.timestamp}>{act.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '12px',
    padding: '22px',
    boxShadow: '0 2px 8px -2px rgba(1, 31, 57, 0.05)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  iconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#EDF2F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#0B2F52',
    margin: 0,
  },
  subtitle: {
    fontSize: '12px',
    color: '#718096',
    margin: '2px 0 0 0',
  },
  emptyContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 16px',
    backgroundColor: '#F8FAFC',
    borderRadius: '8px',
    border: '1px dashed #CBD5E1',
  },
  emptyText: {
    fontSize: '13px',
    color: '#64748B',
    margin: 0,
  },
  timeline: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    paddingLeft: '4px',
  },
  timelineItem: {
    display: 'flex',
    position: 'relative',
    paddingBottom: '20px',
    gap: '16px',
  },
  iconNode: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#FAF7F0',
    border: '1px solid #DCE4EC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
    flexShrink: 0,
  },
  timelineLine: {
    position: 'absolute',
    left: '14px',
    top: '28px',
    bottom: 0,
    width: '1px',
    backgroundColor: '#E2E8F0',
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
    paddingTop: '2px',
  },
  activityDesc: {
    fontSize: '13.5px',
    color: '#1E293B',
    margin: '0 0 4px 0',
    lineHeight: 1.4,
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    color: '#64748B',
  },
  actorText: {
    fontWeight: 500,
  },
  dot: {
    color: '#CBD5E1',
  },
  timestamp: {
    color: '#94A3B8',
  },
};
