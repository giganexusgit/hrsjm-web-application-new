import React from 'react';
import { Bell, Mail, MessageSquare, AlertTriangle, FileText, HeartHandshake, CheckCircle2 } from 'lucide-react';
import type { NotificationPreferences } from '../types/settings.types';

interface NotificationPreferencesTabProps {
  notifications: NotificationPreferences;
  onUpdate: (prefs: Partial<NotificationPreferences>) => void;
}

export const NotificationPreferencesTab: React.FC<NotificationPreferencesTabProps> = ({
  notifications,
  onUpdate,
}) => {
  const toggleItem = (key: keyof NotificationPreferences) => {
    onUpdate({ [key]: !notifications[key] });
  };

  return (
    <div style={styles.container}>
      {/* Real-time Alerts Block */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>
            <Bell size={18} color="#06294D" />
          </div>
          <div>
            <h3 style={styles.cardTitle}>Real-time Operational & Desk Notifications</h3>
            <p style={styles.cardSubtitle}>
              Configure which administrative events push live banners and notifications to your devices.
            </p>
          </div>
        </div>

        <div style={styles.list}>
          {/* In-app push */}
          <div style={styles.itemRow}>
            <div style={styles.itemLeft}>
              <div style={styles.itemIconBadge}>
                <Bell size={16} color="#06294D" />
              </div>
              <div>
                <span style={styles.itemTitle}>In-App Notifications</span>
                <p style={styles.itemDesc}>Display unread notification badge counters and desktop alerts.</p>
              </div>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.inAppAlerts}
                onChange={() => toggleItem('inAppAlerts')}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  ...styles.slider,
                  backgroundColor: notifications.inAppAlerts ? '#06294D' : '#CBD5E1',
                }}
              >
                <span
                  style={{
                    ...styles.knob,
                    transform: notifications.inAppAlerts ? 'translateX(18px)' : 'translateX(0)',
                  }}
                />
              </span>
            </label>
          </div>

          <div style={styles.divider} />

          {/* Urgent Grievances */}
          <div style={styles.itemRow}>
            <div style={styles.itemLeft}>
              <div style={{ ...styles.itemIconBadge, backgroundColor: '#FEE2E2' }}>
                <AlertTriangle size={16} color="#DC2626" />
              </div>
              <div>
                <span style={styles.itemTitle}>Urgent Grievance & Complaint Alerts</span>
                <p style={styles.itemDesc}>Instant priority alerts when serious rights violations are logged.</p>
              </div>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.urgentGrievancePush}
                onChange={() => toggleItem('urgentGrievancePush')}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  ...styles.slider,
                  backgroundColor: notifications.urgentGrievancePush ? '#06294D' : '#CBD5E1',
                }}
              >
                <span
                  style={{
                    ...styles.knob,
                    transform: notifications.urgentGrievancePush ? 'translateX(18px)' : 'translateX(0)',
                  }}
                />
              </span>
            </label>
          </div>

          <div style={styles.divider} />

          {/* Membership Applications */}
          <div style={styles.itemRow}>
            <div style={styles.itemLeft}>
              <div style={{ ...styles.itemIconBadge, backgroundColor: '#ECFDF5' }}>
                <FileText size={16} color="#059669" />
              </div>
              <div>
                <span style={styles.itemTitle}>Membership & Seeker Submissions</span>
                <p style={styles.itemDesc}>Notify when new candidate documents or aid requests are submitted.</p>
              </div>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.membershipApplicationAlerts}
                onChange={() => toggleItem('membershipApplicationAlerts')}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  ...styles.slider,
                  backgroundColor: notifications.membershipApplicationAlerts ? '#06294D' : '#CBD5E1',
                }}
              >
                <span
                  style={{
                    ...styles.knob,
                    transform: notifications.membershipApplicationAlerts ? 'translateX(18px)' : 'translateX(0)',
                  }}
                />
              </span>
            </label>
          </div>

          <div style={styles.divider} />

          {/* Donation Receipts */}
          <div style={styles.itemRow}>
            <div style={styles.itemLeft}>
              <div style={{ ...styles.itemIconBadge, backgroundColor: '#FEF3C7' }}>
                <HeartHandshake size={16} color="#D97706" />
              </div>
              <div>
                <span style={styles.itemTitle}>Donation Inflow & Receipt Receipts</span>
                <p style={styles.itemDesc}>Notify on successful online contributions and CSR grant receipts.</p>
              </div>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.donationReceiptEmails}
                onChange={() => toggleItem('donationReceiptEmails')}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  ...styles.slider,
                  backgroundColor: notifications.donationReceiptEmails ? '#06294D' : '#CBD5E1',
                }}
              >
                <span
                  style={{
                    ...styles.knob,
                    transform: notifications.donationReceiptEmails ? 'translateX(18px)' : 'translateX(0)',
                  }}
                />
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Dispatch Channels Block */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>
            <Mail size={18} color="#06294D" />
          </div>
          <div>
            <h3 style={styles.cardTitle}>Communication & Dispatch Channels</h3>
            <p style={styles.cardSubtitle}>
              Control outbound communication methods delivered to administrator mailboxes.
            </p>
          </div>
        </div>

        <div style={styles.list}>
          {/* Push Notifications */}
          <div style={styles.itemRow}>
            <div style={styles.itemLeft}>
              <div style={styles.itemIconBadge}>
                <Bell size={16} color="#06294D" />
              </div>
              <div>
                <span style={styles.itemTitle}>Push Notifications</span>
                <p style={styles.itemDesc}>Deliver real-time mobile push notifications to active devices and member portals.</p>
              </div>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.pushAlerts !== false}
                onChange={() => toggleItem('pushAlerts' as any)}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  ...styles.slider,
                  backgroundColor: notifications.pushAlerts !== false ? '#06294D' : '#CBD5E1',
                }}
              >
                <span
                  style={{
                    ...styles.knob,
                    transform: notifications.pushAlerts !== false ? 'translateX(18px)' : 'translateX(0)',
                  }}
                />
              </span>
            </label>
          </div>

          <div style={styles.divider} />

          {/* Email alerts */}
          <div style={styles.itemRow}>
            <div style={styles.itemLeft}>
              <div style={styles.itemIconBadge}>
                <Mail size={16} color="#06294D" />
              </div>
              <div>
                <span style={styles.itemTitle}>Email Notifications</span>
                <p style={styles.itemDesc}>Forward critical administrative notices to registered admin email.</p>
              </div>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.emailAlerts}
                onChange={() => toggleItem('emailAlerts')}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  ...styles.slider,
                  backgroundColor: notifications.emailAlerts ? '#06294D' : '#CBD5E1',
                }}
              >
                <span
                  style={{
                    ...styles.knob,
                    transform: notifications.emailAlerts ? 'translateX(18px)' : 'translateX(0)',
                  }}
                />
              </span>
            </label>
          </div>

          <div style={styles.divider} />

          {/* SMS Alerts */}
          <div style={styles.itemRow}>
            <div style={styles.itemLeft}>
              <div style={styles.itemIconBadge}>
                <MessageSquare size={16} color="#06294D" />
              </div>
              <div>
                <span style={styles.itemTitle}>SMS Text Notifications</span>
                <p style={styles.itemDesc}>Receive urgent OTPs and emergency broadcasts on registered phone.</p>
              </div>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.smsAlerts}
                onChange={() => toggleItem('smsAlerts')}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  ...styles.slider,
                  backgroundColor: notifications.smsAlerts ? '#06294D' : '#CBD5E1',
                }}
              >
                <span
                  style={{
                    ...styles.knob,
                    transform: notifications.smsAlerts ? 'translateX(18px)' : 'translateX(0)',
                  }}
                />
              </span>
            </label>
          </div>

          <div style={styles.divider} />

          {/* Weekly Digest */}
          <div style={styles.itemRow}>
            <div style={styles.itemLeft}>
              <div style={styles.itemIconBadge}>
                <CheckCircle2 size={16} color="#06294D" />
              </div>
              <div>
                <span style={styles.itemTitle}>Weekly Executive Summary Digest</span>
                <p style={styles.itemDesc}>Receive weekly analytics report on cases resolved, members registered, and funds collected.</p>
              </div>
            </div>
            <label style={styles.switch}>
              <input
                type="checkbox"
                checked={notifications.weeklyDigestEmail}
                onChange={() => toggleItem('weeklyDigestEmail')}
                style={{ display: 'none' }}
              />
              <span
                style={{
                  ...styles.slider,
                  backgroundColor: notifications.weeklyDigestEmail ? '#06294D' : '#CBD5E1',
                }}
              >
                <span
                  style={{
                    ...styles.knob,
                    transform: notifications.weeklyDigestEmail ? 'translateX(18px)' : 'translateX(0)',
                  }}
                />
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #E2E8F0',
    padding: '24px',
    boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '16px',
    borderBottom: '1px solid #F1F5F9',
    marginBottom: '16px',
  },
  iconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#EEF2F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  cardSubtitle: {
    fontSize: '12px',
    color: '#64748B',
    margin: '3px 0 0 0',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 0',
    gap: '16px',
  },
  itemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  itemIconBadge: {
    width: '34px',
    height: '34px',
    borderRadius: '8px',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  itemTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0F172A',
    display: 'block',
  },
  itemDesc: {
    fontSize: '12px',
    color: '#64748B',
    margin: '2px 0 0 0',
  },
  divider: {
    height: '1px',
    backgroundColor: '#F1F5F9',
  },
  switch: {
    position: 'relative',
    display: 'inline-block',
    width: '42px',
    height: '24px',
    cursor: 'pointer',
    flexShrink: 0,
  },
  slider: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: '24px',
    transition: '0.2s',
  },
  knob: {
    position: 'absolute',
    height: '18px',
    width: '18px',
    left: '3px',
    bottom: '3px',
    backgroundColor: '#FFFFFF',
    borderRadius: '50%',
    transition: '0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
  },
};
