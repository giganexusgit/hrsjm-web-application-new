import type React from 'react';
import { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Users, Globe, Building, Image as ImageIcon, HeartHandshake, Loader2 } from 'lucide-react';
import {
  EVENT_CATEGORIES,
  type CreateEventFormState,
  type EventFormat,
  type EventListItem,
} from '../types/events.types';

export interface CreateEventModalProps {
  isOpen: boolean;
  initialEvent?: EventListItem | null;
  onClose: () => void;
  onSubmit: (form: CreateEventFormState, eventId?: string) => void;
  isLoading?: boolean;
}

const getTodayString = () => new Date().toISOString().slice(0, 10);

const getInitialFormData = (initialEvent?: EventListItem | null): CreateEventFormState => {
  if (initialEvent) {
    const start = initialEvent.startAt ? new Date(initialEvent.startAt) : new Date();
    const end = initialEvent.endAt ? new Date(initialEvent.endAt) : start;
    const pad = (n: number) => String(n).padStart(2, '0');
    const toDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const toTime = (d: Date) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

    return {
      title: initialEvent.title || '',
      description: initialEvent.description || '',
      coverImageUri: initialEvent.coverImageUrl || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      category: initialEvent.category || 'Legal Awareness',
      eventType: (initialEvent.eventType as EventFormat) || 'IN_PERSON',
      eventDate: toDate(start),
      startTime: toTime(start),
      endDate: toDate(end),
      endTime: toTime(end),
      allDay: Boolean(initialEvent.allDay),
      location: initialEvent.location || '',
      address: initialEvent.address || '',
      registrationRequired: true,
      totalSeats: String(initialEvent.capacity || 200),
      perPersonLimit: String(initialEvent.perPersonLimit || 2),
      organizedBy: initialEvent.organizer || 'Central Legal Aid Committee',
      targetAudience: initialEvent.targetAudience || 'Open to All',
      language: initialEvent.language || 'Hindi & English',
      shortInformation: initialEvent.shortInformation || '',
      tags: initialEvent.tags || ['Human Rights', 'Legal Aid'],
      status: initialEvent.status === 'DRAFT' ? 'DRAFT' : 'PUBLISH',
      isDonationEnabled: Boolean(initialEvent.isDonationEnabled),
      donationMessage: initialEvent.donationMessage || '',
    };
  }

  return {
    title: '',
    description: '',
    coverImageUri: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    category: 'Legal Awareness',
    eventType: 'IN_PERSON',
    eventDate: getTodayString(),
    startTime: '10:00',
    endDate: getTodayString(),
    endTime: '16:00',
    allDay: false,
    location: '',
    address: '',
    registrationRequired: true,
    totalSeats: '200',
    perPersonLimit: '2',
    organizedBy: 'Central Legal Aid Committee',
    targetAudience: 'Open to All',
    language: 'Hindi & English',
    shortInformation: '',
    tags: ['Human Rights', 'Legal Aid'],
    status: 'PUBLISH',
    isDonationEnabled: false,
    donationMessage: '',
  };
};

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  initialEvent,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<CreateEventFormState>(() => getInitialFormData(initialEvent));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isHoveredSubmit, setIsHoveredSubmit] = useState(false);
  const [isActiveSubmit, setIsActiveSubmit] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData(initialEvent));
      setErrors({});
    }
  }, [isOpen, initialEvent]);

  if (!isOpen) return null;

  const isEditMode = Boolean(initialEvent && initialEvent.id);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) {
      errs.title = 'Event title is required.';
    }
    if (!formData.location.trim()) {
      errs.location = 'Location / venue is required.';
    }
    if (!formData.description.trim()) {
      errs.description = 'Event description is required.';
    }
    if (formData.isDonationEnabled && formData.donationMessage.length > 200) {
      errs.donationMessage = 'Donation message must not exceed 200 characters.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isLoading) return;
    onSubmit(formData, initialEvent?.id);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div style={styles.header}>
          <div style={styles.headerTitleWrap}>
            <Calendar size={18} color="#06294D" />
            <h3 style={styles.headerTitle}>
              {isEditMode ? 'Edit Event or Conclave' : 'Create New Event or Conclave'}
            </h3>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <X size={18} color="#64748B" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.body}>
            {/* Title */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Event Title *</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. National Legal Aid & Fundamental Rights Conclave 2026"
                style={{
                  ...styles.input,
                  borderColor: errors.title ? '#EF4444' : '#CBD5E1',
                }}
              />
              {errors.title && <span style={styles.errorText}>{errors.title}</span>}
            </div>

            {/* Category & Format */}
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  style={styles.select}
                >
                  {EVENT_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Event Format *</label>
                <div style={styles.selectWrap}>
                  <Globe size={15} color="#94A3B8" style={styles.selectIcon} />
                  <select
                    value={formData.eventType}
                    onChange={(e) =>
                      setFormData({ ...formData, eventType: e.target.value as EventFormat })
                    }
                    style={styles.selectWithIcon}
                  >
                    <option value="IN_PERSON">In-Person (Physical Venue)</option>
                    <option value="ONLINE">Online (Virtual Conclave)</option>
                    <option value="HYBRID">Hybrid Mode</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Date, Start Time, End Time */}
            <div style={styles.row3}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Event Date *</label>
                <input
                  type="date"
                  value={formData.eventDate}
                  onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Start Time</label>
                <input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>End Time</label>
                <input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  style={styles.input}
                />
              </div>
            </div>

            {/* Location & Capacity */}
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Location / Venue Name *</label>
                <div style={styles.selectWrap}>
                  <MapPin size={15} color="#94A3B8" style={styles.selectIcon} />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Vigyan Bhavan / Zoom Webinar"
                    style={{
                      ...styles.selectWithIcon,
                      borderColor: errors.location ? '#EF4444' : '#CBD5E1',
                    }}
                  />
                </div>
                {errors.location && <span style={styles.errorText}>{errors.location}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Total Seat Capacity</label>
                <div style={styles.selectWrap}>
                  <Users size={15} color="#94A3B8" style={styles.selectIcon} />
                  <input
                    type="number"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                    placeholder="200"
                    style={styles.selectWithIcon}
                  />
                </div>
              </div>
            </div>

            {/* Organizer & Language */}
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Organizing Committee / Unit</label>
                <div style={styles.selectWrap}>
                  <Building size={15} color="#94A3B8" style={styles.selectIcon} />
                  <input
                    type="text"
                    value={formData.organizedBy}
                    onChange={(e) => setFormData({ ...formData, organizedBy: e.target.value })}
                    placeholder="e.g. State Directorate, Maharashtra"
                    style={styles.selectWithIcon}
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Primary Language</label>
                <input
                  type="text"
                  value={formData.language}
                  onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                  placeholder="Hindi, English"
                  style={styles.input}
                />
              </div>
            </div>

            {/* Target Portal Visibility & Publication Status */}
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Target Portal Visibility</label>
                <select
                  value={formData.targetAudience}
                  onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                  style={styles.select}
                >
                  <option value="ALL">All Portals (Public & All Roles)</option>
                  <option value="MEMBERS">Members Portal Only</option>
                  <option value="SEEKERS">Donation Seekers Portal Only</option>
                  <option value="USERS">General Users / Public Only</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Publication Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  style={styles.select}
                >
                  <option value="PUBLISH">Publish Immediately (Upcoming)</option>
                  <option value="DRAFT">Save as Draft (Admin Only)</option>
                </select>
              </div>
            </div>

            {/* Short Info */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Short Summary</label>
              <input
                type="text"
                value={formData.shortInformation}
                onChange={(e) => setFormData({ ...formData, shortInformation: e.target.value })}
                placeholder="One sentence overview displayed on cards..."
                style={styles.input}
              />
            </div>

            {/* Description */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Event Description *</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Comprehensive agenda, keynote speakers, delegate guidelines..."
                style={{
                  ...styles.textarea,
                  borderColor: errors.description ? '#EF4444' : '#CBD5E1',
                }}
              />
              {errors.description && <span style={styles.errorText}>{errors.description}</span>}
            </div>

            {/* Event Image Section */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Event Cover Image URL</label>
              <div style={styles.selectWrap}>
                <ImageIcon size={15} color="#94A3B8" style={styles.selectIcon} />
                <input
                  type="text"
                  value={formData.coverImageUri || ''}
                  onChange={(e) => setFormData({ ...formData, coverImageUri: e.target.value })}
                  placeholder="https://images.unsplash.com/photo-..."
                  style={styles.selectWithIcon}
                />
              </div>
            </div>

            {/* SECTION: Ask for Donation (immediately after Event Image) */}
            <div style={styles.donationSection}>
              <div style={styles.donationHeader}>
                <div style={{ flex: 1, paddingRight: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <HeartHandshake size={16} color="#011F39" />
                    <label style={styles.donationToggleLabel}>Ask for Donation</label>
                  </div>
                  <p style={styles.donationSupportingText}>
                    Allow users to support this event with a voluntary donation.
                  </p>
                </div>

                {/* ON/OFF Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isDonationEnabled}
                  aria-label="Ask for Donation Toggle"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isDonationEnabled: !prev.isDonationEnabled,
                    }))
                  }
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: formData.isDonationEnabled ? '#011F39' : '#CBD5E1',
                  }}
                >
                  <span
                    style={{
                      ...styles.toggleThumb,
                      transform: formData.isDonationEnabled ? 'translateX(20px)' : 'translateX(2px)',
                    }}
                  />
                </button>
              </div>

              {/* Donation Message (displayed only when toggle is ON) */}
              {formData.isDonationEnabled && (
                <div style={styles.donationMessageWrap}>
                  <div style={styles.donationMessageHeader}>
                    <label style={styles.label}>Donation Message (Optional)</label>
                    <span style={styles.charCounter}>
                      {formData.donationMessage.length} / 200
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    maxLength={200}
                    value={formData.donationMessage}
                    onChange={(e) =>
                      setFormData({ ...formData, donationMessage: e.target.value.slice(0, 200) })
                    }
                    placeholder="Add a short message about why donations are needed for this event..."
                    style={{
                      ...styles.textarea,
                      borderColor: errors.donationMessage ? '#EF4444' : '#CBD5E1',
                    }}
                  />
                  {errors.donationMessage && (
                    <span style={styles.errorText}>{errors.donationMessage}</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.cancelBtn} disabled={isLoading}>
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              onMouseEnter={() => setIsHoveredSubmit(true)}
              onMouseLeave={() => {
                setIsHoveredSubmit(false);
                setIsActiveSubmit(false);
              }}
              onMouseDown={() => setIsActiveSubmit(true)}
              onMouseUp={() => setIsActiveSubmit(false)}
              style={{
                ...styles.submitBtn,
                backgroundColor: isLoading
                  ? '#FCE7A6'
                  : isActiveSubmit
                  ? '#E2B22B'
                  : isHoveredSubmit
                  ? '#E9B82E'
                  : '#FAD465',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.75 : 1,
              }}
            >
              {isLoading && <Loader2 size={15} className="animate-spin" />}
              <span>{isEditMode ? 'Update Event' : 'Create Event'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const EditEventModal: React.FC<{
  isOpen: boolean;
  event: EventListItem | null;
  onClose: () => void;
  onSubmit: (form: CreateEventFormState, eventId: string) => void;
  isLoading?: boolean;
}> = ({ isOpen, event, onClose, onSubmit, isLoading }) => {
  return (
    <CreateEventModal
      isOpen={isOpen}
      initialEvent={event}
      onClose={onClose}
      onSubmit={(form) => {
        if (event) onSubmit(form, event.id);
      }}
      isLoading={isLoading}
    />
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
    maxWidth: '620px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxHeight: '90vh',
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
    fontFamily: 'serif',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '6px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  body: {
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  row3: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px',
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
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
  },
  select: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    width: '100%',
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
  selectWithIcon: {
    width: '100%',
    padding: '10px 12px 10px 32px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
    width: '100%',
  },
  donationSection: {
    backgroundColor: '#FAF7F0',
    border: '1px solid #FDE68A',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  donationHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  donationToggleLabel: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
    cursor: 'pointer',
  },
  donationSupportingText: {
    fontSize: '11px',
    color: '#64748B',
    margin: '3px 0 0 0',
    lineHeight: 1.4,
  },
  toggleBtn: {
    position: 'relative',
    width: '44px',
    height: '24px',
    borderRadius: '12px',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    outline: 'none',
    flexShrink: 0,
  },
  toggleThumb: {
    display: 'block',
    width: '20px',
    height: '20px',
    borderRadius: '10px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
    transition: 'transform 0.2s ease',
  },
  donationMessageWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingTop: '8px',
    borderTop: '1px solid #F3E8CE',
  },
  donationMessageHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCounter: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748B',
    fontFamily: 'monospace',
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
    justifyContent: 'center',
    gap: '8px',
    padding: '9px 24px',
    borderRadius: '8px',
    backgroundColor: '#FAD465',
    border: '1px solid #E9B82E',
    fontSize: '13px',
    fontWeight: 700,
    color: '#011F39',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(250, 212, 101, 0.35)',
    transition: 'all 0.15s ease',
  },
};
