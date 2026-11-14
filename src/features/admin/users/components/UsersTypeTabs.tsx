import React from 'react';
import type { UserTypeTabKey } from '../types/user.types';

interface UsersTypeTabsProps {
  activeTab: UserTypeTabKey;
  onTabChange: (tab: UserTypeTabKey) => void;
  counts: {
    all: number;
    admin: number;
    member: number;
    seeker: number;
    donor: number;
    general: number;
  };
}

export const UsersTypeTabs: React.FC<UsersTypeTabsProps> = ({
  activeTab,
  onTabChange,
  counts,
}) => {
  const tabs: { key: UserTypeTabKey; label: string; count: number }[] = [
    { key: 'all', label: 'All Users', count: counts.all },
    { key: 'admin', label: 'Admins', count: counts.admin },
    { key: 'member', label: 'Members', count: counts.member },
    { key: 'seeker', label: 'Donation Seekers', count: counts.seeker },
    { key: 'general', label: 'General Users', count: counts.general },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: '8px',
        width: '100%',
        minWidth: 0,
        paddingBottom: '4px',
        marginBottom: '16px',
      }}
    >
      {tabs.map(tab => {
        const isActive = activeTab === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onTabChange(tab.key)}
            style={{
              padding: '8px 16px',
              borderRadius: '24px',
              border: isActive ? '1px solid #06294D' : '1px solid #E2E8F0',
              backgroundColor: isActive ? '#06294D' : '#FFFFFF',
              color: isActive ? '#FFFFFF' : '#475569',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              whiteSpace: 'nowrap',
              boxShadow: isActive ? '0 2px 6px rgba(6, 41, 77, 0.2)' : '0 1px 2px rgba(0,0,0,0.03)',
              transition: 'all 0.15s ease',
            }}
            className="hover:scale-102 active:scale-98"
          >
            <span>{tab.label}</span>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '12px',
                backgroundColor: isActive ? '#FAD465' : '#F1F5F9',
                color: isActive ? '#06294D' : '#64748B',
                fontWeight: 800,
              }}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

