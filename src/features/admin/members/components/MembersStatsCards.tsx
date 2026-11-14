import type React from 'react';
import { Users, UserCheck, Clock, UserX } from 'lucide-react';
import type { MemberStats, MemberFilterTab } from '../types/members.types';

interface MembersStatsCardsProps {
  stats: MemberStats;
  selectedTab: MemberFilterTab;
  onSelectTab: (tab: MemberFilterTab) => void;
}

export const MembersStatsCards: React.FC<MembersStatsCardsProps> = ({
  stats,
  selectedTab,
  onSelectTab,
}) => {
  const cards = [
    {
      id: 'ALL' as MemberFilterTab,
      title: 'Total Members',
      count: stats.total,
      description: 'Registered organization directory',
      icon: Users,
      color: '#011F39',
      bgColor: '#F0F4F8',
      borderColor: '#D0DBE5',
      isActive: selectedTab === 'ALL',
    },
    {
      id: 'ACTIVE' as MemberFilterTab,
      title: 'Active Members',
      count: stats.active,
      description: 'Valid, in-good-standing credentials',
      icon: UserCheck,
      color: '#00A859',
      bgColor: '#E8F8EE',
      borderColor: '#B7EB8F',
      isActive: selectedTab === 'ACTIVE',
    },
    {
      id: 'EXPIRING_SOON' as MemberFilterTab,
      title: 'Expiring Soon',
      count: stats.expiringSoon,
      description: '≤ 30 days remaining on validity',
      icon: Clock,
      color: '#D97706',
      bgColor: '#FEF7E6',
      borderColor: '#FDE68A',
      isActive: selectedTab === 'EXPIRING_SOON',
    },
    {
      id: 'INACTIVE' as MemberFilterTab,
      title: 'Inactive',
      count: stats.inactive,
      description: 'Lapsed validity or suspended',
      icon: UserX,
      color: '#DC2626',
      bgColor: '#FEF2F2',
      borderColor: '#FECACA',
      isActive: selectedTab === 'INACTIVE',
    },
  ];

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      style={{
        marginBottom: '20px',
      }}
    >
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            onClick={() => onSelectTab(card.id)}
            style={{
              minWidth: 0,
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '18px 20px',
              border: card.isActive
                ? `2px solid ${card.color}`
                : '1px solid #E5E7EB',
              boxShadow: card.isActive
                ? '0 6px 16px rgba(1, 31, 57, 0.08)'
                : '0 1px 3px rgba(0, 0, 0, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '12px',
              }}
            >
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#4B5563',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                }}
              >
                {card.title}
              </span>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: card.bgColor,
                  border: `1px solid ${card.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon size={19} color={card.color} strokeWidth={2.2} />
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  color: '#011F39',
                  lineHeight: 1.1,
                  marginBottom: '6px',
                }}
              >
                {card.count.toLocaleString('en-IN')}
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  lineHeight: 1.3,
                }}
              >
                {card.description}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

