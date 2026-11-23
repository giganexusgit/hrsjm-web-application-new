import React, { useState, useEffect } from 'react';
import { Building2, Mail, Phone, Globe, MapPin, Award, Check, Loader2 } from 'lucide-react';
import type { OrganizationSettings } from '../types/settings.types';

interface GeneralSettingsTabProps {
  organization: OrganizationSettings;
  onSave: (data: Partial<OrganizationSettings>) => Promise<void> | void;
  isSaving?: boolean;
}

export const GeneralSettingsTab: React.FC<GeneralSettingsTabProps> = ({
  organization,
  onSave,
  isSaving = false,
}) => {
  const [formData, setFormData] = useState<OrganizationSettings>({ ...organization });
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setFormData({ ...organization });
  }, [organization]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <form onSubmit={handleSubmit} style={styles.container}>
      {/* Legal & Registration Block */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>
            <Award size={18} color="#06294D" />
          </div>
          <div>
            <h3 style={styles.cardTitle}>Legal Trust Identity & Statutory Registrations</h3>
            <p style={styles.cardSubtitle}>
              Registered trust credentials under Indian Trust Act 1882 and Income Tax Department.
            </p>
          </div>
        </div>

        <div style={styles.grid2}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Official Trust Name (English)</label>
            <input
              type="text"
              value={formData.trustName}
              onChange={(e) => setFormData({ ...formData, trustName: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Official Trust Title (Hindi)</label>
            <input
              type="text"
              value={formData.hindiName}
              onChange={(e) => setFormData({ ...formData, hindiName: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Registration Number</label>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>80G Income Tax URN</label>
            <input
              type="text"
              value={formData.urn80G}
              onChange={(e) => setFormData({ ...formData, urn80G: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Permanent Account Number (PAN)</label>
            <input
              type="text"
              value={formData.panNumber}
              onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Establishment Year</label>
            <input
              type="text"
              value={formData.foundedYear}
              onChange={(e) => setFormData({ ...formData, foundedYear: e.target.value })}
              style={styles.input}
            />
          </div>
        </div>
      </div>

      {/* Secretariat Contact & Address Block */}
      <div style={styles.card}>
        <div style={styles.cardHeader}>
          <div style={styles.iconWrap}>
            <Building2 size={18} color="#06294D" />
          </div>
          <div>
            <h3 style={styles.cardTitle}>Central Secretariat & Official Communication</h3>
            <p style={styles.cardSubtitle}>
              Headquarters location, grievance desk helpline and digital contact channels.
            </p>
          </div>
        </div>

        <div style={styles.grid2}>
          <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
            <label style={styles.label}>Secretariat Street Address</label>
            <div style={styles.inputIconWrap}>
              <MapPin size={16} color="#94A3B8" style={styles.icon} />
              <input
                type="text"
                value={formData.secretariatAddress}
                onChange={(e) => setFormData({ ...formData, secretariatAddress: e.target.value })}
                style={styles.inputWithIcon}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>State / UT</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Postal Pincode</label>
            <input
              type="text"
              value={formData.pincode}
              onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>National Helpline Phone</label>
            <div style={styles.inputIconWrap}>
              <Phone size={16} color="#94A3B8" style={styles.icon} />
              <input
                type="text"
                value={formData.helplinePhone}
                onChange={(e) => setFormData({ ...formData, helplinePhone: e.target.value })}
                style={styles.inputWithIcon}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Official Contact Email</label>
            <div style={styles.inputIconWrap}>
              <Mail size={16} color="#94A3B8" style={styles.icon} />
              <input
                type="email"
                value={formData.officialEmail}
                onChange={(e) => setFormData({ ...formData, officialEmail: e.target.value })}
                style={styles.inputWithIcon}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Legal Grievance Desk Email</label>
            <div style={styles.inputIconWrap}>
              <Mail size={16} color="#94A3B8" style={styles.icon} />
              <input
                type="email"
                value={formData.grievanceEmail}
                onChange={(e) => setFormData({ ...formData, grievanceEmail: e.target.value })}
                style={styles.inputWithIcon}
              />
            </div>
          </div>

          <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
            <label style={styles.label}>Official Web Portal</label>
            <div style={styles.inputIconWrap}>
              <Globe size={16} color="#94A3B8" style={styles.icon} />
              <input
                type="text"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                style={styles.inputWithIcon}
              />
            </div>
          </div>

          <div style={{ ...styles.formGroup, gridColumn: 'span 2' }}>
            <label style={styles.label}>Mission & Core Purpose Statement</label>
            <textarea
              rows={3}
              value={formData.missionStatement}
              onChange={(e) => setFormData({ ...formData, missionStatement: e.target.value })}
              style={styles.textarea}
            />
          </div>
        </div>
      </div>

      {/* Save Action Footer */}
      <div style={styles.footerRow}>
        {savedSuccess && (
          <div style={styles.successNotice}>
            <Check size={14} color="#059669" />
            <span>Organization profile saved successfully.</span>
          </div>
        )}
        <button
          type="submit"
          disabled={isSaving}
          style={{
            ...styles.saveBtn,
            opacity: isSaving ? 0.75 : 1,
            cursor: isSaving ? 'not-allowed' : 'pointer',
          }}
        >
          {isSaving ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <Loader2 size={14} className="animate-spin" />
              <span>Saving to Database...</span>
            </span>
          ) : (
            <span>Save Organization Profile</span>
          )}
        </button>
      </div>
    </form>
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
    marginBottom: '20px',
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
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '18px 24px',
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
    color: '#0F172A',
    outline: 'none',
  },
  inputIconWrap: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    position: 'absolute',
    left: '12px',
    pointerEvents: 'none',
  },
  inputWithIcon: {
    width: '100%',
    padding: '10px 12px 10px 38px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13.5px',
    color: '#0F172A',
    outline: 'none',
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #CBD5E1',
    fontSize: '13.5px',
    color: '#0F172A',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '16px',
    marginTop: '6px',
  },
  successNotice: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#059669',
    fontWeight: 600,
  },
  saveBtn: {
    padding: '10px 24px',
    borderRadius: '8px',
    backgroundColor: '#06294D',
    color: '#FFFFFF',
    border: 'none',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(6, 41, 77, 0.25)',
  },
};
