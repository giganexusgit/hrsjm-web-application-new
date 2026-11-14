import type React from 'react';
import { TICKET_TABS, type TicketTabKey } from '../types/support.types';

interface SupportStatusTabsProps {
  activeTab: TicketTabKey;
  onSelectTab: (tab: TicketTabKey) => void;
  counts: Record<TicketTabKey, number>;
}

export const SupportStatusTabs: React.FC<SupportStatusTabsProps> = ({
  activeTab,
  onSelectTab,
  counts,
}) => {
  return (
    <div style={styles.container} className="support-status-tabs-container">
      {TICKET_TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = counts[tab.key] ?? 0;

        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => onSelectTab(tab.key)}
            style={{
              ...styles.tabButton,
              backgroundColor: isActive ? '#011F39' : '#FFFFFF',
              color: isActive ? '#FFFFFF' : '#34516D',
              borderColor: isActive ? '#011F39' : '#DCE4EC',
              boxShadow: isActive
                ? '0 4px 12px rgba(1, 31, 57, 0.15)'
                : '0 1px 2px rgba(0, 0, 0, 0.03)',
            }}
            className="support-tab-btn"
          >
            <span style={styles.tabLabel}>{tab.label}</span>
            <span
              style={{
                ...styles.badge,
                backgroundColor: isActive ? '#FAD465' : '#EDF2F7',
                color: isActive ? '#011F39' : '#475569',
                fontWeight: isActive ? 800 : 700,
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflowX: 'auto',
    paddingBottom: '4px',
    marginBottom: '18px',
    scrollbarWidth: 'none',
  },
  tabButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '24px',
    borderWidth: '1px',
    borderStyle: 'solid',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    flexShrink: 0,
    outline: 'none',
  },
  tabLabel: {
    letterSpacing: '0.01em',
  },
  badge: {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '12px',
    lineHeight: 1.2,
    transition: 'all 0.15s ease',
  },
};
