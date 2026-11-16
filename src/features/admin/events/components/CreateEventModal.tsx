import type React from 'react';
import { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  Globe,
  Building,
  Image as ImageIcon,
  HeartHandshake,
  Loader2,
  Tag,
  Plus,
  Check,
  CheckCircle,
} from 'lucide-react';
import {
  EVENT_CATEGORIES,
  TARGET_AUDIENCE_OPTIONS,
  SAMPLE_COVER_IMAGES,
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
      coverImageUri:
        initialEvent.coverImageUrl ||
        SAMPLE_COVER_IMAGES[0] ||
        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      category: initialEvent.category || 'Seminar',
      eventType: (initialEvent.eventType as EventFormat) || 'IN_PERSON',
      eventDate: toDate(start),
      startTime: toTime(start),
      endDate: toDate(end),
      endTime: toTime(end),
      allDay: Boolean(initialEvent.allDay),
      location: initialEvent.location || '',
      address: initialEvent.address || '',
      registrationRequired: Boolean(initialEvent.capacity && initialEvent.capacity > 0),
      totalSeats: String(initialEvent.capacity || 100),
      perPersonLimit: String(initialEvent.perPersonLimit || 1),
      organizedBy: initialEvent.organizer || 'HRSJM Mission',
      targetAudience: initialEvent.targetAudience || 'Open to All',
      language: initialEvent.language || 'English, Hindi',
      shortInformation: initialEvent.shortInformation || '',
      tags: initialEvent.tags && initialEvent.tags.length > 0 ? initialEvent.tags : [],
      status: initialEvent.status === 'DRAFT' ? 'DRAFT' : 'PUBLISH',
      isDonationEnabled: Boolean(initialEvent.isDonationEnabled),
      donationMessage: initialEvent.donationMessage || '',
    };
  }

  return {
    title: '',
    description: '',
    coverImageUri:
      SAMPLE_COVER_IMAGES[0] ||
      'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
    category: 'Seminar',
    eventType: 'IN_PERSON',
    eventDate: getTodayString(),
    startTime: '10:00',
    endDate: getTodayString(),
    endTime: '16:00',
    allDay: false,
    location: '',
    address: '',
    registrationRequired: false,
    totalSeats: '100',
    perPersonLimit: '1',
    organizedBy: 'HRSJM Mission',
    targetAudience: 'Open to All',
    language: 'English, Hindi',
    shortInformation: '',
    tags: ['Community Engagement', 'Legal Awareness'],
    status: 'PUBLISH',
    isDonationEnabled: false,
    donationMessage: '',
  };
};

const CreateEventModalContent: React.FC<{
  initialEvent?: EventListItem | null;
  onClose: () => void;
  onSubmit: (form: CreateEventFormState, eventId?: string) => void;
  isLoading?: boolean;
}> = ({ initialEvent, onClose, onSubmit, isLoading = false }) => {
  const [formData, setFormData] = useState<CreateEventFormState>(() =>
    getInitialFormData(initialEvent),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topicInput, setTopicInput] = useState('');
  const [isHoveredSubmit, setIsHoveredSubmit] = useState(false);
  const [isActiveSubmit, setIsActiveSubmit] = useState(false);

  const isEditMode = Boolean(initialEvent && initialEvent.id);

  const handleAddTopic = () => {
    const trimmed = topicInput.trim();
    if (!trimmed) return;
    if (formData.tags.includes(trimmed)) {
      setTopicInput('');
      return;
    }
    if (formData.tags.length >= 8) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      tags: [...prev.tags, trimmed],
    }));
    setTopicInput('');
  };

  const handleRemoveTopic = (topicToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== topicToRemove),
    }));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!formData.title.trim()) {
      errs.title = 'Event title is required.';
    }
    if (!formData.location.trim()) {
      errs.location = 'City / Area location is required.';
    }
    if (!formData.description.trim()) {
      errs.description = 'Event description is required.';
    }
    if (!formData.eventDate) {
      errs.eventDate = 'Event date is required.';
    }
    if (!formData.startTime) {
      errs.startTime = 'Start time is required.';
    }
    if (!formData.endTime) {
      errs.endTime = 'End time is required.';
    }
    if (formData.startTime && formData.endTime && formData.endTime <= formData.startTime) {
      errs.endTime = 'End time must be after start time.';
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
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleWrap}>
            <div style={styles.headerIconCircle}>
              <Calendar size={18} color="#06294D" />
            </div>
            <div>
              <h3 style={styles.headerTitle}>
                {isEditMode ? 'Edit Event or Conclave' : 'Create New Event or Conclave'}
              </h3>
              <p style={styles.headerSubtitle}>
                {isEditMode
                  ? 'Update event details, timing, registrations and donation settings'
                  : 'Configure all event details, registration controls and donation appeals'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <X size={18} color="#64748B" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.body}>
            {/* CARD 1: Basic Information */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h4 style={styles.cardTitle}>Basic Information</h4>
              </div>

              {/* Title */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Event Title <span style={styles.requiredAsterisk}>*</span>
                </label>
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
                  <label style={styles.label}>
                    Category <span style={styles.requiredAsterisk}>*</span>
                  </label>
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
                  <label style={styles.label}>
                    Event Format <span style={styles.requiredAsterisk}>*</span>
                  </label>
                  <div style={styles.selectWrap}>
                    <Globe size={15} color="#94A3B8" style={styles.selectIcon} />
                    <select
                      value={formData.eventType}
                      onChange={(e) =>
                        setFormData({ ...formData, eventType: e.target.value as EventFormat })
                      }
                      style={styles.selectWithIcon}
                    >
                      <option value="IN_PERSON">In-Person (Offline)</option>
                      <option value="ONLINE">Online (Virtual)</option>
                      <option value="HYBRID">Hybrid Mode</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Short Summary */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Short Summary / Subtitle <span style={styles.optionalHint}>(Optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.shortInformation}
                  onChange={(e) => setFormData({ ...formData, shortInformation: e.target.value })}
                  placeholder="Short 1-line subtitle shown on cards (e.g. Interactive legal workshop...)"
                  maxLength={500}
                  style={styles.input}
                />
              </div>

              {/* Description */}
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Full Event Description <span style={styles.requiredAsterisk}>*</span>
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Write full event details, agenda, and background..."
                  style={{
                    ...styles.textarea,
                    borderColor: errors.description ? '#EF4444' : '#CBD5E1',
                  }}
                />
                {errors.description && <span style={styles.errorText}>{errors.description}</span>}
              </div>
            </div>

            {/* CARD 2: Date & Time */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h4 style={styles.cardTitle}>Date &amp; Time</h4>
              </div>

              <div style={styles.row3}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Event Date <span style={styles.requiredAsterisk}>*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) =>
                      setFormData({ ...formData, eventDate: e.target.value, endDate: e.target.value })
                    }
                    style={{
                      ...styles.input,
                      borderColor: errors.eventDate ? '#EF4444' : '#CBD5E1',
                    }}
                  />
                  {errors.eventDate && <span style={styles.errorText}>{errors.eventDate}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    Start Time <span style={styles.requiredAsterisk}>*</span>
                  </label>
                  <div style={styles.selectWrap}>
                    <Clock size={14} color="#94A3B8" style={styles.selectIcon} />
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      style={{
                        ...styles.selectWithIcon,
                        borderColor: errors.startTime ? '#EF4444' : '#CBD5E1',
                      }}
                    />
                  </div>
                  {errors.startTime && <span style={styles.errorText}>{errors.startTime}</span>}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>
                    End Time <span style={styles.requiredAsterisk}>*</span>
                  </label>
                  <div style={styles.selectWrap}>
                    <Clock size={14} color="#94A3B8" style={styles.selectIcon} />
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      style={{
                        ...styles.selectWithIcon,
                        borderColor: errors.endTime ? '#EF4444' : '#CBD5E1',
                      }}
                    />
                  </div>
                  {errors.endTime && <span style={styles.errorText}>{errors.endTime}</span>}
                </div>
              </div>
            </div>

            {/* CARD 3: Location & Venue */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h4 style={styles.cardTitle}>Location &amp; Venue</h4>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  City / Area Location <span style={styles.requiredAsterisk}>*</span>
                </label>
                <div style={styles.selectWrap}>
                  <MapPin size={15} color="#94A3B8" style={styles.selectIcon} />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Vigyan Bhavan, New Delhi"
                    style={{
                      ...styles.selectWithIcon,
                      borderColor: errors.location ? '#EF4444' : '#CBD5E1',
                    }}
                  />
                </div>
                {errors.location && <span style={styles.errorText}>{errors.location}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Venue / Detailed Address <span style={styles.optionalHint}>(Optional)</span>
                </label>
                <div style={styles.selectWrap}>
                  <Building size={15} color="#94A3B8" style={styles.selectIcon} />
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="e.g. Community Hall, Near Metro Station, Central Avenue"
                    style={styles.selectWithIcon}
                  />
                </div>
              </div>
            </div>

            {/* CARD 4: Organizer & Specifications */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h4 style={styles.cardTitle}>Organizer &amp; Specifications</h4>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Organized By <span style={styles.optionalHint}>(Optional)</span>
                </label>
                <div style={styles.selectWrap}>
                  <Users size={15} color="#94A3B8" style={styles.selectIcon} />
                  <input
                    type="text"
                    value={formData.organizedBy}
                    onChange={(e) => setFormData({ ...formData, organizedBy: e.target.value })}
                    placeholder="e.g. HRSJM Mission / Central Legal Aid Committee"
                    style={styles.selectWithIcon}
                  />
                </div>
              </div>

              <div style={styles.row}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Target Audience</label>
                  <select
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    style={styles.select}
                  >
                    {TARGET_AUDIENCE_OPTIONS.map((aud) => (
                      <option key={aud} value={aud}>
                        {aud}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Primary Language</label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    placeholder="Hindi & English"
                    style={styles.input}
                  />
                </div>
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

            {/* CARD 5: Key Topics */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h4 style={styles.cardTitle}>Key Topics</h4>
                <p style={styles.cardSubtitle}>
                  Add key topics displayed with checkmarks on the event details page.
                </p>
              </div>

              <div style={styles.tagInputRow}>
                <div style={styles.selectWrap}>
                  <Tag size={15} color="#94A3B8" style={styles.selectIcon} />
                  <input
                    type="text"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTopic();
                      }
                    }}
                    placeholder="Add topic and press enter..."
                    style={styles.selectWithIcon}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddTopic}
                  style={styles.addTopicBtn}
                  disabled={!topicInput.trim() || formData.tags.length >= 8}
                >
                  <Plus size={14} />
                  <span>Add</span>
                </button>
              </div>

              {/* Helper text */}
              <p style={styles.helperText}>
                e.g. Community Engagement, Legal Awareness &amp; Protection, Fundamental Rights
              </p>

              {/* Tag Chips */}
              {formData.tags.length > 0 && (
                <div style={styles.tagChipWrap}>
                  {formData.tags.map((tag) => (
                    <span key={tag} style={styles.tagChip}>
                      <Check size={12} color="#06294D" style={{ marginRight: '4px' }} />
                      <span style={styles.tagChipText}>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveTopic(tag)}
                        style={styles.tagRemoveBtn}
                        aria-label={`Remove topic ${tag}`}
                      >
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* CARD 6: Registration Required (Toggle Section) */}
            <div style={styles.toggleCard}>
              <div style={styles.toggleRow}>
                <div style={{ flex: 1, paddingRight: '12px' }}>
                  <h4 style={styles.toggleTitle}>Registration Required</h4>
                  <p style={styles.toggleSubtitle}>
                    {formData.registrationRequired
                      ? 'Attendees must register to attend this event'
                      : 'Free Entry — Open to all attendees without prior registration'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.registrationRequired}
                  aria-label="Registration Required Toggle"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      registrationRequired: !prev.registrationRequired,
                    }))
                  }
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: formData.registrationRequired ? '#06294D' : '#CBD5E1',
                  }}
                >
                  <span
                    style={{
                      ...styles.toggleThumb,
                      transform: formData.registrationRequired ? 'translateX(20px)' : 'translateX(2px)',
                    }}
                  />
                </button>
              </div>

              {formData.registrationRequired && (
                <div style={styles.toggleCardContent}>
                  <div style={styles.row}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Total Seating Capacity</label>
                      <div style={styles.selectWrap}>
                        <Users size={15} color="#94A3B8" style={styles.selectIcon} />
                        <input
                          type="number"
                          value={formData.totalSeats}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              totalSeats: e.target.value.replace(/[^0-9]/g, ''),
                            })
                          }
                          placeholder="e.g. 100"
                          style={styles.selectWithIcon}
                        />
                      </div>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>Per-Person Ticket Limit</label>
                      <input
                        type="number"
                        value={formData.perPersonLimit}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            perPersonLimit: e.target.value.replace(/[^0-9]/g, ''),
                          })
                        }
                        placeholder="e.g. 2"
                        style={styles.input}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CARD 7: Event Donation & Support (Allow Event Donations Toggle Section) */}
            <div style={styles.donationCard}>
              <div style={styles.toggleRow}>
                <div style={{ flex: 1, paddingRight: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                    <HeartHandshake size={16} color="#011F39" />
                    <h4 style={styles.toggleTitle}>Allow Event Donations</h4>
                  </div>
                  <p style={styles.toggleSubtitle}>
                    {formData.isDonationEnabled
                      ? 'Attendees and supporters can make a contribution to this event'
                      : 'Donations disabled — Event is strictly non-contribution'}
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formData.isDonationEnabled}
                  aria-label="Allow Event Donations Toggle"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      isDonationEnabled: !prev.isDonationEnabled,
                    }))
                  }
                  style={{
                    ...styles.toggleBtn,
                    backgroundColor: formData.isDonationEnabled ? '#06294D' : '#CBD5E1',
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

              {formData.isDonationEnabled && (
                <div style={styles.donationMessageWrap}>
                  <div style={styles.donationMessageHeader}>
                    <label style={styles.label}>Donation Appeal Message (Optional)</label>
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

            {/* CARD 8: Event Image */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h4 style={styles.cardTitle}>Event Cover Image</h4>
                <p style={styles.cardSubtitle}>
                  Provide an image URL or pick one from approved presets.
                </p>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Cover Image URL</label>
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

              {/* Preset cover images */}
              <div style={{ marginTop: '4px' }}>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 500 }}>
                  Preset Cover Options:
                </span>
                <div style={styles.presetImagesRow}>
                  {SAMPLE_COVER_IMAGES.map((imgUrl, idx) => {
                    const isSelected = formData.coverImageUri === imgUrl;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImageUri: imgUrl })}
                        style={{
                          ...styles.presetImgThumbWrap,
                          borderColor: isSelected ? '#06294D' : '#E2E8F0',
                          outline: isSelected ? '2px solid #FAD465' : 'none',
                        }}
                      >
                        <img
                          src={imgUrl}
                          alt={`Preset ${idx + 1}`}
                          style={styles.presetImgThumb}
                        />
                        {isSelected && (
                          <div style={styles.presetSelectedBadge}>
                            <CheckCircle size={12} color="#FFFFFF" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
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

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  initialEvent,
  onClose,
  onSubmit,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <CreateEventModalContent
      key={`${isOpen ? 'open' : 'closed'}-${initialEvent?.id || 'new'}`}
      initialEvent={initialEvent}
      onClose={onClose}
      onSubmit={onSubmit}
      isLoading={isLoading}
    />
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
    backgroundColor: '#F8FAFC',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '680px',
    boxShadow: '0 20px 45px rgba(0,0,0,0.28)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    maxHeight: '92vh',
    border: '1px solid #E2E8F0',
  },
  header: {
    padding: '16px 20px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitleWrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  headerIconCircle: {
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: '#F1F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: '17px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
    fontFamily: 'serif',
  },
  headerSubtitle: {
    fontSize: '11px',
    color: '#64748B',
    margin: '2px 0 0 0',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  body: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    overflowY: 'auto',
  },
  card: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    paddingBottom: '4px',
    borderBottom: '1px solid #F1F5F9',
  },
  cardTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
    letterSpacing: '-0.2px',
  },
  cardSubtitle: {
    fontSize: '11px',
    color: '#64748B',
    margin: 0,
    lineHeight: 1.4,
  },
  row: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '14px',
  },
  row3: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr 1fr',
    gap: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },
  label: {
    fontSize: '12px',
    fontWeight: 600,
    color: '#334155',
  },
  requiredAsterisk: {
    color: '#EF4444',
    marginLeft: '2px',
  },
  optionalHint: {
    fontSize: '11px',
    color: '#94A3B8',
    fontWeight: 400,
    marginLeft: '4px',
  },
  input: {
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  select: {
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    width: '100%',
    boxSizing: 'border-box',
  },
  selectWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  selectIcon: {
    position: 'absolute',
    left: '10px',
    pointerEvents: 'none',
  },
  selectWithIcon: {
    width: '100%',
    padding: '9px 12px 9px 32px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    backgroundColor: '#FFFFFF',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '9px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    color: '#0F172A',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: '#FFFFFF',
  },
  tagInputRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  addTopicBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '9px 14px',
    borderRadius: '8px',
    backgroundColor: '#06294D',
    border: 'none',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    flexShrink: 0,
  },
  helperText: {
    fontSize: '11px',
    color: '#64748B',
    margin: '2px 0 0 0',
  },
  tagChipWrap: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '6px',
  },
  tagChip: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 10px',
    borderRadius: '16px',
    backgroundColor: '#F1F5F9',
    border: '1px solid #CBD5E1',
    fontSize: '12px',
    color: '#0F172A',
  },
  tagChipText: {
    marginRight: '6px',
    fontWeight: 500,
  },
  tagRemoveBtn: {
    background: 'none',
    border: 'none',
    color: '#64748B',
    cursor: 'pointer',
    padding: 0,
    fontSize: '12px',
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
  },
  toggleCard: {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  donationCard: {
    backgroundColor: '#FAF7F0',
    border: '1px solid #FDE68A',
    borderRadius: '12px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
  },
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  toggleTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  toggleSubtitle: {
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
  toggleCardContent: {
    paddingTop: '12px',
    borderTop: '1px solid #F1F5F9',
  },
  donationMessageWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    paddingTop: '10px',
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
  presetImagesRow: {
    display: 'flex',
    gap: '8px',
    marginTop: '6px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  presetImgThumbWrap: {
    position: 'relative',
    width: '64px',
    height: '42px',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1.5px solid #CBD5E1',
    cursor: 'pointer',
    padding: 0,
    background: 'none',
    flexShrink: 0,
  },
  presetImgThumb: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  presetSelectedBadge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    backgroundColor: '#06294D',
    borderRadius: '50%',
    width: '14px',
    height: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    fontSize: '11px',
    color: '#DC2626',
  },
  footer: {
    padding: '14px 20px',
    borderTop: '1px solid #E2E8F0',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    backgroundColor: '#FFFFFF',
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
