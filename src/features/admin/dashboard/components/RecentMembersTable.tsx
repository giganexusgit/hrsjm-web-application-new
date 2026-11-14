import type React from 'react';
import { useEffect, useSyncExternalStore } from 'react';
import { Link } from 'react-router-dom';
import { UsersRound, ArrowRight } from 'lucide-react';
import { membersStore } from '@/features/admin/members/store/membersStore';

export const RecentMembersTable: React.FC = () => {
  const storeSnapshot = useSyncExternalStore(
    membersStore.subscribe,
    membersStore.getSnapshot
  );
  const members = storeSnapshot.members.slice(0, 5);

  useEffect(() => {
    if (storeSnapshot.members.length === 0) {
      membersStore.fetchMembers().catch(() => {});
    }
  }, [storeSnapshot.members.length]);

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div style={styles.titleWrap}>
          <div style={styles.iconWrap}>
            <UsersRound size={18} color="#06294D" />
          </div>
          <div>
            <h4 style={styles.title}>Recently Enrolled Members</h4>
            <p style={styles.subtitle}>Verified & approved active members</p>
          </div>
        </div>

        <Link to="/admin/members" style={styles.viewAllLink}>
          <span>View Directory</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.theadRow}>
              <th style={styles.th}>Member Name</th>
              <th style={styles.th}>Member ID</th>
              <th style={styles.th}>Category</th>
              <th style={styles.th}>Joined Date</th>
              <th style={{ ...styles.th, textAlign: 'right' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ ...styles.td, textAlign: 'center', padding: '32px 16px', color: '#64748B' }}>
                  No members found in directory.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} style={styles.tr}>
                  <td style={styles.td}>
                    <div style={styles.memberCell}>
                      <div style={styles.avatar}>
                        {(member.name || 'Member')
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </div>
                      <span style={styles.memberName}>{member.name}</span>
                    </div>
                  </td>
                  <td style={styles.td}>
                    <span style={styles.codeBadge}>{member.membershipId}</span>
                  </td>
                  <td style={styles.td}>{member.categoryName || 'General Member'}</td>
                  <td style={styles.td}>
                    {member.joinedDate ? new Date(member.joinedDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                  </td>
                  <td style={{ ...styles.td, textAlign: 'right' }}>
                    <span style={styles.activePill}>{member.status || 'Active'}</span>
                  </td>
                </tr>
              ))
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
  memberCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: '#06294D',
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    fontWeight: 700,
    flexShrink: 0,
  },
  memberName: {
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
  activePill: {
    display: 'inline-block',
    padding: '3px 10px',
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
    color: '#16A34A',
    borderRadius: '9999px',
    fontSize: '11px',
    fontWeight: 600,
    textTransform: 'capitalize',
  },
};
