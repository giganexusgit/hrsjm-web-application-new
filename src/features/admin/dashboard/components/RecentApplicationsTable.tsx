import type React from 'react';
import { useEffect, useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ArrowRight } from 'lucide-react';
import { applicationsStore } from '@/features/admin/applications/store/applicationsStore';

export const RecentApplicationsTable: React.FC = () => {
  const navigate = useNavigate();
  useSyncExternalStore(
    applicationsStore.subscribe,
    applicationsStore.getSnapshot
  );
  const applications = applicationsStore.getAllApplications().slice(0, 5);

  useEffect(() => {
    if (applicationsStore.getAllApplications().length === 0) {
      applicationsStore.fetchApplications().catch(() => {});
    }
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: '#EAF7EE', color: '#16A34A', label: 'Approved' };
      case 'under_review':
        return { bg: '#FFF9E6', color: '#D97706', label: 'Under Review' };
      case 'submitted':
      default:
        return { bg: '#EDF2F7', color: '#174A78', label: 'Submitted' };
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <div style={styles.iconWrap}>
            <FileText size={18} color="#06294D" />
          </div>
          <div>
            <h4 style={styles.title}>Pending Membership Applications</h4>
            <p style={styles.subtitle}>Awaiting identity and governance verification</p>
          </div>
        </div>

        <Link to="/admin/membership-applications" style={styles.viewAllLink}>
          <span>View All Inbox</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Applicant</th>
              <th style={styles.th}>Application ID</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Review Status</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ ...styles.td, textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
                  No applications currently pending.
                </td>
              </tr>
            ) : (
              applications.map((app) => {
                const badge = getStatusBadge(app.status);
                return (
                  <tr key={app.id} style={styles.tr}>
                    <td style={styles.td}>
                      <span style={styles.applicantName}>{app.applicantName}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.codeBadge}>{app.applicationId}</span>
                    </td>
                    <td style={styles.td}>{app.membershipType}</td>
                    <td style={styles.td}>{app.submittedAt}</td>
                    <td style={styles.td}>
                      <span
                        style={{
                          ...styles.statusBadge,
                          backgroundColor: badge.bg,
                          color: badge.color,
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td style={{ ...styles.td, textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => navigate(`/admin/membership-applications/${app.id}`)}
                        style={styles.reviewBtn}
                      >
                        Review
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
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
    marginBottom: '16px',
    gap: '12px',
    flexWrap: 'wrap',
  },
  titleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconWrap: {
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    backgroundColor: 'rgba(6, 41, 77, 0.08)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  title: {
    margin: 0,
    fontSize: '16px',
    fontWeight: 600,
    color: '#06294D',
  },
  subtitle: {
    margin: '2px 0 0',
    fontSize: '12px',
    color: '#64748B',
  },
  viewAllLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    fontWeight: 600,
    color: '#174A78',
    textDecoration: 'none',
  },
  tableWrap: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  theadRow: {
    borderBottom: '1px solid #E2E8F0',
  },
  th: {
    padding: '10px 12px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  tr: {
    borderBottom: '1px solid #F1F5F9',
  },
  td: {
    padding: '12px',
    fontSize: '13px',
    color: '#1E293B',
  },
  applicantName: {
    fontWeight: 600,
    color: '#06294D',
  },
  codeBadge: {
    padding: '3px 8px',
    backgroundColor: '#F1F5F9',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#334155',
    fontFamily: 'monospace',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
  reviewBtn: {
    padding: '5px 12px',
    backgroundColor: '#06294D',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
};
