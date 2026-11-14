import type React from 'react';
import { HeartHandshake, Clock, AlertCircle, CheckCircle2, IndianRupee } from 'lucide-react';
import type { AssistanceSummaryStats, AssistanceTabKey } from '../types/assistance.types';

interface AssistanceStatsCardsProps {
  stats: AssistanceSummaryStats;
  selectedTab: AssistanceTabKey;
  onSelectTab: (tab: AssistanceTabKey) => void;
}

export const AssistanceStatsCards: React.FC<AssistanceStatsCardsProps> = ({
  stats,
  selectedTab,
  onSelectTab,
}) => {
  const cards = [
    {
      id: 'ALL' as AssistanceTabKey,
      title: 'Approved Causes',
      count: stats.total || 0,
      description: 'Verified causes open for aid',
      icon: HeartHandshake,
      color: '#011F39',
      bgColor: '#F0F4F8',
      borderColor: '#D0DBE5',
      isActive: selectedTab === 'ALL',
      isCurrency: false,
    },
    {
      id: 'ACTIVE' as AssistanceTabKey,
      title: 'Active Fundraising',
      count: stats.active || 0,
      description: 'Ongoing citizen aid campaigns',
      icon: Clock,
      color: '#1D4ED8',
      bgColor: '#EFF6FF',
      borderColor: '#BFDBFE',
      isActive: selectedTab === 'ACTIVE',
      isCurrency: false,
    },
    {
      id: 'URGENT' as AssistanceTabKey,
      title: 'Urgent Relief',
      count: stats.urgent || 0,
      description: 'Critical & emergency aid causes',
      icon: AlertCircle,
      color: '#DC2626',
      bgColor: '#FEF2F2',
      borderColor: '#FECACA',
      isActive: selectedTab === 'URGENT',
      isCurrency: false,
    },
    {
      id: 'COMPLETED' as AssistanceTabKey,
      title: 'Fully Funded / Disbursed',
      count: stats.completed || 0,
      description: 'Completed humanitarian grants',
      icon: CheckCircle2,
      color: '#059669',
      bgColor: '#ECFDF5',
      borderColor: '#A7F3D0',
      isActive: selectedTab === 'COMPLETED',
      isCurrency: false,
    },
    {
      id: 'ALL' as AssistanceTabKey,
      title: 'Aid Raised / Disbursed',
      count: stats.totalAmount || 0,
      description: 'Cumulative humanitarian support',
      icon: IndianRupee,
      color: '#B45309',
      bgColor: '#FFFBEB',
      borderColor: '#FDE68A',
      isActive: false,
      isCurrency: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 mb-5">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        const isLast = idx === cards.length - 1;
        return (
          <div
            key={`${card.title}-${idx}`}
            onClick={() => {
              if (!card.isCurrency) {
                onSelectTab(card.id);
              }
            }}
            className={isLast ? 'sm:col-span-2 lg:col-span-1' : ''}
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '12px',
              padding: '14px 16px',
              border: card.isActive
                ? `2px solid ${card.color}`
                : '1px solid #E5E7EB',
              boxShadow: card.isActive
                ? '0 6px 16px rgba(1, 31, 57, 0.08)'
                : '0 1px 3px rgba(0, 0, 0, 0.05)',
              cursor: card.isCurrency ? 'default' : 'pointer',
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
                marginBottom: '10px',
                gap: '8px',
              }}
            >
              <span
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#4B5563',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  lineHeight: 1.2,
                }}
              >
                {card.title}
              </span>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  backgroundColor: card.bgColor,
                  border: `1px solid ${card.borderColor}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={16} color={card.color} strokeWidth={2.2} />
              </div>
            </div>

            <div>
              <div
                style={{
                  fontSize: card.isCurrency ? '20px' : '24px',
                  fontWeight: 700,
                  color: '#011F39',
                  lineHeight: 1.1,
                  marginBottom: '4px',
                }}
              >
                {card.isCurrency
                  ? `₹${card.count.toLocaleString('en-IN')}`
                  : card.count.toLocaleString('en-IN')}
              </div>
              <div
                style={{
                  fontSize: '11px',
                  color: '#6B7280',
                  lineHeight: 1.25,
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

