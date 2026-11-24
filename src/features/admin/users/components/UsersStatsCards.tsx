import React from 'react';
import type { UserStats, UserStatus } from '../types/user.types';
import { Users, UserCheck, Clock, ShieldAlert } from 'lucide-react';

interface UsersStatsCardsProps {
  stats: UserStats;
  selectedStatus: 'all' | UserStatus;
  onSelectStatus: (status: 'all' | UserStatus) => void;
  activeRole?: string;
}

export const UsersStatsCards: React.FC<UsersStatsCardsProps> = ({
  stats,
  selectedStatus,
  onSelectStatus,
  activeRole = 'all',
}) => {
  const totalTitle =
    activeRole === 'member'
      ? 'Total Members'
      : activeRole === 'seeker'
      ? 'Total Seekers'
      : activeRole === 'admin'
      ? 'Total Admins'
      : activeRole === 'general'
      ? 'General Users'
      : activeRole === 'donor'
      ? 'Total Donors'
      : 'Total Users';

  const totalSubtitle =
    activeRole === 'member'
      ? `${stats.active} active, ${stats.pending} pending`
      : activeRole === 'seeker'
      ? `${stats.active} approved, ${stats.pending} awaiting review`
      : activeRole === 'admin'
      ? `${stats.active} active administrators`
      : activeRole === 'general'
      ? `${stats.active} active citizen accounts`
      : activeRole === 'donor'
      ? `${stats.active} registered donors`
      : `${stats.membersCount} members, ${stats.seekersCount} seekers`;

  const activeSubtitle =
    activeRole === 'seeker'
      ? 'Approved donation seekers'
      : activeRole === 'member'
      ? 'Verified active members'
      : 'Verified accounts in good standing';

  const pendingSubtitle =
    activeRole === 'seeker'
      ? 'Awaiting seeker verification'
      : activeRole === 'member'
      ? 'Awaiting membership approval'
      : 'Awaiting KYC / seeker approval';

  const cards = [
    {
      key: 'all' as const,
      title: totalTitle,
      count: stats.total,
      subtitle: totalSubtitle,
      icon: Users,
      color: '#06294D',
      bgLight: '#FAF7F0',
      borderActive: '#FAD465',
    },
    {
      key: 'active' as const,
      title: 'Active / Approved',
      count: stats.active,
      subtitle: activeSubtitle,
      icon: UserCheck,
      color: '#059669',
      bgLight: '#ECFDF5',
      borderActive: '#059669',
    },
    {
      key: 'pending' as const,
      title: 'Pending Review',
      count: stats.pending,
      subtitle: pendingSubtitle,
      icon: Clock,
      color: '#D97706',
      bgLight: '#FFFBEB',
      borderActive: '#D97706',
    },
    {
      key: 'blocked' as const,
      title: 'Blocked Users',
      count: stats.blocked,
      subtitle: 'Suspended or restricted access',
      icon: ShieldAlert,
      color: '#DC2626',
      bgLight: '#FEF2F2',
      borderActive: '#DC2626',
    },
  ];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
      style={{
        width: '100%',
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      {cards.map(card => {
        const isSelected = selectedStatus === card.key;
        const Icon = card.icon;

        return (
          <div
            key={card.key}
            onClick={() => onSelectStatus(isSelected && card.key !== 'all' ? 'all' : card.key)}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              padding: '18px 20px',
              border: isSelected ? `2px solid ${card.borderActive}` : '1px solid #E2E8F0',
              boxShadow: isSelected
                ? '0 6px 18px rgba(6, 41, 77, 0.08)'
                : '0 1px 3px rgba(0, 0, 0, 0.03)',
              cursor: 'pointer',
              transition: 'all 0.15s ease-in-out',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              position: 'relative',
              overflow: 'hidden',
              minWidth: 0,
              boxSizing: 'border-box',
            }}
            className="hover:shadow-md transition-all"
          >
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  color: '#64748B',
                  marginBottom: '6px',
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  color: '#06294D',
                  lineHeight: 1.1,
                  marginBottom: '4px',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                }}
              >
                {card.count.toLocaleString()}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#64748B',
                  fontWeight: 500,
                }}
              >
                {card.subtitle}
              </div>
            </div>

            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                backgroundColor: card.bgLight,
                color: card.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: `1px solid ${card.borderActive}30`,
              }}
            >
              <Icon size={20} strokeWidth={2.5} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

