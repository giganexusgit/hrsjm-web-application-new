import type React from 'react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Calendar,
  Award,
  Receipt,
  MessageSquare,
  Trash2,
  CheckCheck,
} from 'lucide-react';
import { useMemberNotifications, type MemberNotice } from '../store/memberNotificationsStore';

export const MemberNotificationsPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    notices,
    unreadCount,
    markAllAsRead,
    markSingleAsRead,
    deleteNotice,
    clearAllNotices,
    syncWithBackend,
  } = useMemberNotifications();

  const [activeTab, setActiveTab] = useState<'ALL' | 'UNREAD' | 'MEMBERSHIP' | 'EVENTS'>('ALL');

  useEffect(() => {
    syncWithBackend();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const filteredNotices = notices.filter((n) => {
    if (activeTab === 'UNREAD') return !n.isRead;
    if (activeTab === 'MEMBERSHIP') return n.category === 'MEMBERSHIP';
    if (activeTab === 'EVENTS') return n.category === 'EVENT';
    return true;
  });

  const getCategoryIcon = (cat: MemberNotice['category']) => {
    switch (cat) {
      case 'MEMBERSHIP':
        return <Award size={18} color="#06294D" />;
      case 'EVENT':
        return <Calendar size={18} color="#06294D" />;
      case 'RECEIPT':
        return <Receipt size={18} color="#06294D" />;
      case 'SUPPORT':
        return <MessageSquare size={18} color="#06294D" />;
      default:
        return <Bell size={18} color="#06294D" />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <section style={styles.heroBanner}>
        <div style={styles.heroLeft}>
          <div style={styles.heroBadge}>MEMBER INBOX & BULLETINS</div>
          <h1 style={styles.heroTitle}>Notifications & Bulletins</h1>
          <p style={styles.heroSub}>
            Direct alerts regarding your membership status, physical kit dispatch, 80G tax receipts,
            and executive directives from the National Council.
          </p>
        </div>

        <div style={styles.heroRight}>
          <div style={styles.statBox}>
            <div style={styles.statValue}>{unreadCount}</div>
            <div style={styles.statLabel}>Unread Notices</div>
          </div>
          <div style={styles.statBox}>
            <div style={styles.statValue}>{notices.length}</div>
            <div style={styles.statLabel}>Total Bulletins</div>
          </div>
        </div>
      </section>

      {/* Tabs & Controls */}
      <div style={styles.controlsBar}>
        <div style={styles.tabsRow}>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'ALL' ? styles.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab('ALL')}
          >
            All Notices ({notices.length})
          </button>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'UNREAD' ? styles.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab('UNREAD')}
          >
            Unread ({unreadCount})
          </button>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'MEMBERSHIP' ? styles.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab('MEMBERSHIP')}
          >
            Membership
          </button>
          <button
            type="button"
            style={{
              ...styles.tabBtn,
              ...(activeTab === 'EVENTS' ? styles.tabBtnActive : {}),
            }}
            onClick={() => setActiveTab('EVENTS')}
          >
            Events & Conventions
          </button>
        </div>

        <div style={styles.actionsRow}>
          {unreadCount > 0 && (
            <button
              type="button"
              style={styles.markAllBtn}
              onClick={markAllAsRead}
              title="Mark all notifications as read"
            >
              <CheckCheck size={16} />
              <span>Mark All as Read</span>
            </button>
          )}

          {notices.length > 0 && (
            <button
              type="button"
              style={styles.clearAllBtn}
              onClick={clearAllNotices}
              title="Delete all notifications in 1 click"
            >
              <Trash2 size={16} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      {filteredNotices.length === 0 ? (
        <div style={styles.emptyState}>
          <Bell size={44} color="#CBD5E1" />
          <h3 style={styles.emptyTitle}>No Notifications Found</h3>
          <p style={styles.emptySub}>You are all caught up! No active notices under this filter.</p>
        </div>
      ) : (
        <div style={styles.noticesList}>
          {filteredNotices.map((n) => (
            <div
              key={n.id}
              style={{
                ...styles.noticeCard,
                ...(n.isRead ? {} : styles.noticeCardUnread),
              }}
              onClick={() => markSingleAsRead(n.id)}
            >
              <div style={styles.noticeIconCol}>
                <div style={styles.iconCircle}>
                  {getCategoryIcon(n.category)}
                </div>
                {!n.isRead && <div style={styles.unreadDot} />}
              </div>

              <div style={styles.noticeBodyCol}>
                <div style={styles.noticeMetaRow}>
                  <span style={styles.noticeCategoryBadge}>{n.category}</span>
                  <span style={styles.noticeTimestamp}>{n.timestamp}</span>
                </div>
                <h4 style={styles.noticeTitle}>{n.title}</h4>
                <p style={styles.noticeMessage}>{n.message}</p>

                {n.actionPath && (
                  <div style={styles.actionRow}>
                    <button
                      type="button"
                      style={styles.noticeActionBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        markSingleAsRead(n.id);
                        if (n.actionPath) navigate(n.actionPath);
                      }}
                    >
                      <span>{n.actionLabel || 'View Details'}</span>
                    </button>
                  </div>
                )}
              </div>

              <button
                type="button"
                style={styles.deleteBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotice(n.id);
                }}
                title="Dismiss"
              >
                <Trash2 size={16} color="#94A3B8" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    paddingBottom: '36px',
  },
  heroBanner: {
    backgroundColor: '#06294D',
    borderRadius: '16px',
    padding: '28px 32px',
    color: '#FFFFFF',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '24px',
    boxShadow: '0 6px 20px rgba(1, 31, 57, 0.15)',
  },
  heroLeft: {
    flex: 1,
    minWidth: '320px',
  },
  heroBadge: {
    display: 'inline-block',
    fontSize: '10.5px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#FAD465',
    backgroundColor: 'rgba(250, 212, 101, 0.15)',
    padding: '3px 10px',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  heroTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '26px',
    fontWeight: 700,
    color: '#FFFFFF',
    margin: '0 0 8px 0',
  },
  heroSub: {
    fontSize: '13px',
    color: '#DCE4EC',
    lineHeight: 1.5,
    margin: 0,
    maxWidth: '650px',
  },
  heroRight: {
    display: 'flex',
    gap: '16px',
  },
  statBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '16px 20px',
    textAlign: 'center',
    minWidth: '105px',
  },
  statValue: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '26px',
    fontWeight: 700,
    color: '#FAD465',
  },
  statLabel: {
    fontSize: '11px',
    color: '#CBD5E0',
    marginTop: '2px',
  },

  /* Controls */
  controlsBar: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '14px',
    padding: '14px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  tabsRow: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  tabBtn: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: '#F1F5F9',
    color: '#475569',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  tabBtnActive: {
    backgroundColor: '#06294D',
    color: '#FFFFFF',
  },
  actionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexWrap: 'wrap',
  },
  markAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FFFFFF',
    border: '1px solid #CBD5E1',
    borderRadius: '8px',
    padding: '8px 14px',
    color: '#06294D',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  clearAllBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: '#FEF2F2',
    border: '1px solid #FECACA',
    borderRadius: '8px',
    padding: '8px 14px',
    color: '#DC2626',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },

  /* List */
  noticesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  noticeCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '14px',
    padding: '20px 24px',
    display: 'flex',
    gap: '18px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  noticeCardUnread: {
    backgroundColor: '#FFFDF5',
    borderColor: '#FCD34D',
    boxShadow: '0 4px 12px rgba(245, 158, 11, 0.06)',
  },
  noticeIconCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '6px',
    position: 'relative',
  },
  iconCircle: {
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    backgroundColor: '#FEF3C7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  unreadDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    backgroundColor: '#DC2626',
    border: '1.5px solid #FFFFFF',
  },
  noticeBodyCol: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  noticeMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  noticeCategoryBadge: {
    fontSize: '10px',
    fontWeight: 700,
    color: '#06294D',
    backgroundColor: '#EDF2F7',
    padding: '2px 8px',
    borderRadius: '4px',
    letterSpacing: '0.04em',
  },
  noticeTimestamp: {
    fontSize: '11.5px',
    color: '#94A3B8',
  },
  noticeTitle: {
    margin: 0,
    fontSize: '15px',
    fontWeight: 700,
    color: '#0B2F52',
    lineHeight: 1.3,
  },
  noticeMessage: {
    margin: 0,
    fontSize: '13px',
    color: '#475569',
    lineHeight: 1.5,
  },
  actionRow: {
    marginTop: '6px',
  },
  noticeActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 14px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#FAD465',
    color: '#06294D',
    fontWeight: 700,
    fontSize: '12px',
    cursor: 'pointer',
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    alignSelf: 'flex-start',
  },

  /* Empty State */
  emptyState: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '14px',
    padding: '48px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyTitle: {
    margin: '12px 0 6px 0',
    fontSize: '17px',
    fontWeight: 700,
    color: '#0B2F52',
  },
  emptySub: {
    margin: 0,
    fontSize: '13px',
    color: '#64748B',
    maxWidth: '420px',
  },
};
