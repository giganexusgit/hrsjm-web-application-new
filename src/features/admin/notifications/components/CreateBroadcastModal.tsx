import React, { useState } from 'react';
import { X, Radio, Send, Calendar, Users, AlertTriangle } from 'lucide-react';
import type {
  CreateBroadcastInput,
  NotificationAudience,
  NotificationCategory,
  NotificationPriority,
} from '../types/notifications.types';

interface CreateBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateBroadcastInput) => void;
}

export const CreateBroadcastModal: React.FC<CreateBroadcastModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
}) => {
  const [formData, setFormData] = useState<CreateBroadcastInput>({
    title: '',
    body: '',
    target_audience: 'ALL_USERS',
    category: 'ANNOUNCEMENT',
    priority: 'NORMAL',
    scheduled_at: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) {
      errs.title = 'Announcement title is required.';
    } else if (formData.title.length < 3) {
      errs.title = 'Title must be at least 3 characters.';
    }
    if (!formData.body.trim()) {
      errs.body = 'Notification content body is required.';
    } else if (formData.body.length < 3) {
      errs.body = 'Body must be at least 3 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      ...formData,
      scheduled_at: formData.scheduled_at ? new Date(formData.scheduled_at).toISOString() : null,
    });
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerTitleWrap}>
            <Radio size={18} color="#06294D" />
            <h3 style={styles.headerTitle}>Send Push Notification / Broadcast</h3>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <X size={18} color="#64748B" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.body}>
            {/* Title */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Announcement Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Annual General Body Meeting Notice"
                style={{
                  ...styles.input,
                  borderColor: errors.title ? '#EF4444' : '#CBD5E1',
                }}
              />
              {errors.title && <span style={styles.errorText}>{errors.title}</span>}
            </div>

            {/* Target Audience & Category */}
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Target Audience *</label>
                <div style={styles.selectWrap}>
                  <Users size={15} color="#94A3B8" style={styles.selectIcon} />
                  <select
                    value={formData.target_audience}
                    onChange={(e) =>
                      setFormData({ ...formData, target_audience: e.target.value as NotificationAudience })
                    }
                    style={styles.select}
                  >
                    <option value="ALL_USERS">All Registered Users (8,450+)</option>
                    <option value="MEMBERS">Active Trust Members (1,240+)</option>
                    <option value="DONORS">Donors & CSR Partners (430+)</option>
                    <option value="DONATION_SEEKERS">Aid & Relief Seekers (150+)</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value as NotificationCategory })
                  }
                  style={styles.selectBare}
                >
                  <option value="ANNOUNCEMENT">General Announcement</option>
                  <option value="APPLICATION">Membership & Applications</option>
                  <option value="SUPPORT">Grievance & Legal Support</option>
                  <option value="DONATION">Donations & Relief</option>
                  <option value="EVENT">Conclave & Events</option>
                  <option value="SYSTEM">Administrative System Notice</option>
                </select>
              </div>
            </div>

            {/* Notification Body */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Notification Message Body *</label>
              <textarea
                rows={4}
                value={formData.body}
                onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                placeholder="Enter complete circular notice or directive details..."
                style={{
                  ...styles.textarea,
                  borderColor: errors.body ? '#EF4444' : '#CBD5E1',
                }}
              />
              {errors.body && <span style={styles.errorText}>{errors.body}</span>}
            </div>

            {/* Priority & Delivery Schedule */}
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Broadcast Priority</label>
                <div style={styles.priorityOptions}>
                  {(['NORMAL', 'HIGH', 'URGENT'] as NotificationPriority[]).map((p) => {
                    const isChosen = formData.priority === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: p })}
                        style={{
                          ...styles.priorityBtn,
                          backgroundColor: isChosen ? '#06294D' : '#F8FAFC',
                          color: isChosen ? '#FFFFFF' : '#475569',
                          borderColor: isChosen ? '#06294D' : '#CBD5E1',
                        }}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Scheduled Delivery (Optional)</label>
                <div style={styles.selectWrap}>
                  <Calendar size={15} color="#94A3B8" style={styles.selectIcon} />
                  <input
                    type="datetime-local"
                    value={formData.scheduled_at || ''}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    style={styles.select}
                  />
                </div>
                <span style={styles.hintText}>Leave blank to broadcast instantly.</span>
              </div>
            </div>

            {/* Warning banner */}
            <div style={styles.alertNotice}>
              <AlertTriangle size={15} color="#D97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <span style={styles.alertText}>
                Broadcast notifications are pushed immediately to all mobile app installations and registered device tokens in the selected audience.
              </span>
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              <Send size={14} color="#011F39" />
              <span>{formData.scheduled_at ? 'Schedule Push Notification' : 'Send Push Notification Now'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(1, 31, 57, 0.65)',
    backdropFilter: 'blur(3px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '16px',
  },
  modal: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '560px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    padding: '18px 24px',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  headerTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  body: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#334155',
  },
  input: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13.5px',
    outline: 'none',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13.5px',
    outline: 'none',
    resize: 'vertical',
    fontFamily: 'inherit',
  },
  selectWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  selectIcon: {
    position: 'absolute',
    left: '10px',
    pointerEvents: 'none',
  },
  select: {
    width: '100%',
    padding: '10px 12px 10px 32px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
  },
  selectBare: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    outline: 'none',
    backgroundColor: '#FFFFFF',
  },
  priorityOptions: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '6px',
  },
  priorityBtn: {
    padding: '8px 4px',
    borderRadius: '6px',
    border: '1px solid',
    fontSize: '11px',
    fontWeight: 700,
    cursor: 'pointer',
    textAlign: 'center',
  },
  hintText: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  alertNotice: {
    display: 'flex',
    gap: '8px',
    padding: '10px 12px',
    borderRadius: '8px',
    backgroundColor: '#FFFBEB',
    border: '1px solid #FDE68A',
  },
  alertText: {
    fontSize: '11.5px',
    color: '#92400E',
    lineHeight: 1.4,
  },
  errorText: {
    fontSize: '11px',
    color: '#DC2626',
  },
  footer: {
    padding: '16px 24px',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: '#F8FAFC',
  },
  cancelBtn: {
    padding: '9px 18px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    fontWeight: 600,
    color: '#475569',
    cursor: 'pointer',
  },
  submitBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 22px',
    borderRadius: '8px',
    backgroundColor: '#FAD465',
    border: 'none',
    fontSize: '13px',
    fontWeight: 700,
    color: '#011F39',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(250, 212, 101, 0.4)',
  },
};

