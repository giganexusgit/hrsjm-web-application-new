import type React from 'react';
import { MessageSquare, Clock, CheckCircle2, Archive, AlertCircle } from 'lucide-react';
import type { TicketStatsData } from '../types/support.types';

interface SupportStatsCardsProps {
  stats: TicketStatsData;
  activeTab: string;
  onSelectTab: (tabKey: any) => void;
}

export const SupportStatsCards: React.FC<SupportStatsCardsProps> = ({
  stats,
  activeTab,
  onSelectTab,
}) => {
  const cards = [
    {
      id: 'ALL',
      title: 'Total Tickets',
      count: stats.total,
      subtitle: 'All support grievances',
      icon: MessageSquare,
      accentColor: '#011F39',
      bgColor: '#EDF2F7',
      borderColor: '#DCE4EC',
      activeBorder: '#011F39',
      activeBg: '#F8FAFC',
    },
    {
      id: 'SUBMITTED',
      title: 'Open / Submitted',
      count: stats.open,
      subtitle: 'Awaiting triage or review',
      icon: AlertCircle,
      accentColor: '#D97706',
      bgColor: '#FFF9E6',
      borderColor: '#FDE68A',
      activeBorder: '#D97706',
      activeBg: '#FFFDF7',
    },
    {
      id: 'UNDER_REVIEW',
      title: 'In Progress',
      count: stats.inProgress,
      subtitle: 'Under active investigation',
      icon: Clock,
      accentColor: '#0284C7',
      bgColor: '#EFF6FF',
      borderColor: '#BAE6FD',
      activeBorder: '#0284C7',
      activeBg: '#F0F9FF',
    },
    {
      id: 'RESOLVED',
      title: 'Resolved',
      count: stats.resolved,
      subtitle: 'Delivered solutions',
      icon: CheckCircle2,
      accentColor: '#16A34A',
      bgColor: '#F0FDF4',
      borderColor: '#BBF7D0',
      activeBorder: '#16A34A',
      activeBg: '#F0FDF4',
    },
    {
      id: 'CLOSED',
      title: 'Closed',
      count: stats.closed,
      subtitle: 'Archived resolved cases',
      icon: Archive,
      accentColor: '#475569',
      bgColor: '#F1F5F9',
      borderColor: '#CBD5E1',
      activeBorder: '#475569',
      activeBg: '#F8FAFC',
    },
  ];

  return (
    <div className="support-stats-grid" style={styles.grid}>
      {cards.map((c) => {
        const Icon = c.icon;
        const isActive = activeTab === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onSelectTab(c.id)}
            style={{
              ...styles.card,
              backgroundColor: isActive ? c.activeBg : '#FFFFFF',
              borderColor: isActive ? c.activeBorder : '#E2E8F0',
              boxShadow: isActive
                ? `0 6px 18px -4px ${c.accentColor}26, 0 2px 4px rgba(0, 0, 0, 0.04)`
                : '0 1px 3px rgba(0, 0, 0, 0.04)',
              transform: isActive ? 'translateY(-1px)' : 'none',
            }}
            className="support-stat-card"
          >
            {/* Top Accent Strip for Active Card */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                backgroundColor: isActive ? c.activeBorder : 'transparent',
                borderRadius: '12px 12px 0 0',
                transition: 'all 0.2s ease',
              }}
            />

            <div style={styles.topRow}>
              <div style={styles.textCol}>
                <span style={styles.cardTitle}>{c.title}</span>
                <div style={{ ...styles.countText, color: c.accentColor }}>{c.count}</div>
              </div>
              <div
                style={{
                  ...styles.iconBadge,
                  backgroundColor: c.bgColor,
                  color: c.accentColor,
                  border: `1px solid ${c.borderColor}`,
                }}
              >
                <Icon size={19} />
              </div>
            </div>

            <div style={styles.subtitleRow}>
              <span style={styles.subtitleText}>{c.subtitle}</span>
              {isActive && (
                <span
                  style={{
                    ...styles.activeIndicator,
                    backgroundColor: c.accentColor,
                  }}
                />
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '14px',
    marginBottom: '20px',
  },
  card: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    borderRadius: '12px',
    borderWidth: '1px',
    borderStyle: 'solid',
    padding: '16px 18px',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    minHeight: '110px',
    overflow: 'hidden',
    outline: 'none',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
    marginBottom: '8px',
  },
  textCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  cardTitle: {
    fontSize: '11.5px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#64748B',
    marginBottom: '4px',
  },
  countText: {
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    fontSize: '28px',
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },
  iconBadge: {
    width: '38px',
    height: '38px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'transform 0.2s ease',
  },
  subtitleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '6px',
    marginTop: 'auto',
  },
  subtitleText: {
    fontSize: '11.5px',
    color: '#64748B',
    lineHeight: 1.3,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  activeIndicator: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    flexShrink: 0,
  },
};
