import React, { useState } from 'react';
import { X, User, Mail, Phone, Calendar, Heart, MapPin } from 'lucide-react';
import type { AdminProfile, PersonalInfoInput, ValidationErrors } from '../types/profile.types';
import { BLOOD_GROUPS } from '../data/profileFixtures';

interface EditPersonalInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: AdminProfile;
  onSave: (data: PersonalInfoInput) => void;
}

export const EditPersonalInfoModal: React.FC<EditPersonalInfoModalProps> = ({
  isOpen,
  onClose,
  profile,
  onSave,
}) => {
  const [formData, setFormData] = useState<PersonalInfoInput>({
    fullName: profile.fullName || '',
    email: profile.email || '',
    phone: profile.phone || '',
    dateOfBirth: profile.dateOfBirth || '',
    bloodGroup: profile.bloodGroup || 'O+',
    address: profile.address || '',
    city: profile.city || '',
    state: profile.state || '',
    pincode: profile.pincode || '',
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: ValidationErrors = {};
    if (!formData.fullName.trim()) {
      errs.fullName = 'Full Name is required.';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errs.email = 'Please enter a valid email address.';
    }
    const cleanPhone = formData.phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone) {
      errs.phone = 'Phone number is required.';
    } else if (cleanPhone.length !== 10) {
      errs.phone = 'Phone number must be exactly 10 digits.';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSave(formData);
    onClose();
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.headerTitleWrap}>
            <User size={18} color="#06294D" />
            <h3 style={styles.headerTitle}>Edit Personal Information</h3>
          </div>
          <button type="button" onClick={onClose} style={styles.closeBtn} aria-label="Close">
            <X size={18} color="#64748B" />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.body}>
            {/* Full Name */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Full Legal Name *</label>
              <div style={styles.inputWrap}>
                <User size={16} color="#94A3B8" style={styles.inputIcon} />
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  style={{ ...styles.input, ...(errors.fullName ? styles.inputError : {}) }}
                  placeholder="e.g. Aman Shaikh"
                />
              </div>
              {errors.fullName && <span style={styles.errorText}>{errors.fullName}</span>}
            </div>

            {/* Email & Phone */}
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email Address *</label>
                <div style={styles.inputWrap}>
                  <Mail size={16} color="#94A3B8" style={styles.inputIcon} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ ...styles.input, ...(errors.email ? styles.inputError : {}) }}
                    placeholder="admin@hrsjm.org"
                  />
                </div>
                {errors.email && <span style={styles.errorText}>{errors.email}</span>}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Contact Phone *</label>
                <div style={styles.inputWrap}>
                  <Phone size={16} color="#94A3B8" style={styles.inputIcon} />
                  <input
                    type="tel"
                    maxLength={10}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    style={{ ...styles.input, ...(errors.phone ? styles.inputError : {}) }}
                    placeholder="9876543210"
                  />
                </div>
                {errors.phone && <span style={styles.errorText}>{errors.phone}</span>}
              </div>
            </div>

            {/* Date of Birth & Blood Group */}
            <div style={styles.row}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Date of Birth</label>
                <div style={styles.inputWrap}>
                  <Calendar size={16} color="#94A3B8" style={styles.inputIcon} />
                  <input
                    type="text"
                    value={formData.dateOfBirth || ''}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    style={styles.input}
                    placeholder="e.g. 15 Aug 1988"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Blood Group</label>
                <div style={styles.inputWrap}>
                  <Heart size={16} color="#EF4444" style={styles.inputIcon} />
                  <select
                    value={formData.bloodGroup || 'O+'}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    style={styles.select}
                  >
                    {BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>
                        {bg}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Address */}
            <div style={styles.formGroup}>
              <label style={styles.label}>Residential / Official Address</label>
              <div style={styles.inputWrap}>
                <MapPin size={16} color="#94A3B8" style={styles.inputIcon} />
                <input
                  type="text"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={styles.input}
                  placeholder="Plot No. 14, Human Rights Bhavan, Institutional Area, Lodhi Road"
                />
              </div>
            </div>

            {/* City, State, Pincode */}
            <div style={styles.row3}>
              <div style={styles.formGroup}>
                <label style={styles.label}>City</label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={styles.inputBare}
                  placeholder="New Delhi"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>State</label>
                <input
                  type="text"
                  value={formData.state || ''}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  style={styles.inputBare}
                  placeholder="Delhi"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Pincode</label>
                <input
                  type="text"
                  value={formData.pincode || ''}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  style={styles.inputBare}
                  placeholder="110003"
                />
              </div>
            </div>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={onClose} style={styles.cancelBtn}>
              Cancel
            </button>
            <button type="submit" style={styles.submitBtn}>
              Save Changes
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
  inputWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  input: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13.5px',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
  },
  inputBare: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13.5px',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
  },
  select: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13.5px',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#EF4444',
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
    padding: '9px 22px',
    borderRadius: '8px',
    backgroundColor: '#06294D',
    border: 'none',
    fontSize: '13px',
    fontWeight: 700,
    color: '#FFFFFF',
    cursor: 'pointer',
  },
};
