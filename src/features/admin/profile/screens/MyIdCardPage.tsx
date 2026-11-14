import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Printer,
  Download,
  ShieldCheck,
  QrCode,
  Calendar,
  CheckCircle2,
  FileCheck,
} from 'lucide-react';
import { useProfile } from '../store/profileStore';
import { IdCardSvgPreview } from '../components/IdCardSvgPreview';
import { profileService } from '../services/profileService';

export const MyIdCardPage: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const handlePrint = () => {
    profileService.printIdCard(profile);
  };

  return (
    <div style={styles.container}>
      {/* Top Navigation Bar */}
      <div style={styles.topBar}>
        <button
          type="button"
          onClick={() => navigate('/admin/profile')}
          style={styles.backBtn}
        >
          <ArrowLeft size={16} color="#06294D" />
          <span>Back to Profile</span>
        </button>

        <div style={styles.topActions}>
          <button
            type="button"
            onClick={handlePrint}
            style={styles.outlineBtn}
          >
            <Printer size={15} color="#06294D" />
            <span>Print Badge</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            style={styles.primaryBtn}
          >
            <Download size={15} color="#011F39" />
            <span>Download Official PDF</span>
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div style={styles.layout}>
        {/* Left Side: Interactive 3D Card Display */}
        <div style={styles.cardPreviewWrap}>
          <div style={styles.badgeHeader}>
            <span style={styles.badgeLabel}>Central Administrative ID Card</span>
            <div style={styles.activePill}>
              <CheckCircle2 size={12} color="#059669" />
              <span>{profile.accountStatus}</span>
            </div>
          </div>

          <IdCardSvgPreview profile={profile} interactive={true} />

          <p style={styles.flipHelpText}>
            Click the card or use the button above to flip between Front and Back views.
          </p>
        </div>

        {/* Right Side: Security Specs & Card Details */}
        <div style={styles.specsWrap}>
          {/* Card Overview Card */}
          <div style={styles.infoCard}>
            <div style={styles.cardSectionTitleRow}>
              <ShieldCheck size={18} color="#06294D" />
              <h2 style={styles.cardSectionTitle}>Official Credential Details</h2>
            </div>

            <div style={styles.specGrid}>
              <div style={styles.specItem}>
                <span style={styles.specLabel}>Cardholder Name</span>
                <span style={styles.specVal}>{profile.fullName}</span>
              </div>

              <div style={styles.specItem}>
                <span style={styles.specLabel}>Administrative ID</span>
                <span style={{ ...styles.specVal, color: '#06294D' }}>{profile.adminId}</span>
              </div>

              <div style={styles.specItem}>
                <span style={styles.specLabel}>Central Member ID</span>
                <span style={{ ...styles.specVal, color: '#D97706', fontWeight: 700 }}>
                  {profile.memberId}
                </span>
              </div>

              <div style={styles.specItem}>
                <span style={styles.specLabel}>Designation</span>
                <span style={styles.specVal}>{profile.designation || profile.role}</span>
              </div>

              <div style={styles.specItem}>
                <span style={styles.specLabel}>Executive Council</span>
                <span style={styles.specVal}>{profile.department || 'Central Executive Committee'}</span>
              </div>

              <div style={styles.specItem}>
                <span style={styles.specLabel}>Blood Group</span>
                <span style={{ ...styles.specVal, color: '#DC2626', fontWeight: 700 }}>
                  {profile.bloodGroup || 'O+'}
                </span>
              </div>

              <div style={styles.specItem}>
                <span style={styles.specLabel}>Date of Issuance</span>
                <span style={styles.specVal}>{profile.issueDate || '12 Oct 2024'}</span>
              </div>

              <div style={styles.specItem}>
                <span style={styles.specLabel}>Valid Through</span>
                <span style={{ ...styles.specVal, color: '#059669', fontWeight: 700 }}>
                  {profile.validTill || '31 Dec 2027'}
                </span>
              </div>
            </div>
          </div>

          {/* Verification & Legal Security Card */}
          <div style={styles.infoCard}>
            <div style={styles.cardSectionTitleRow}>
              <FileCheck size={18} color="#06294D" />
              <h2 style={styles.cardSectionTitle}>Security Specifications & Verification</h2>
            </div>

            <div style={styles.securityPoints}>
              <div style={styles.pointRow}>
                <QrCode size={18} color="#06294D" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={styles.pointTitle}>Cryptographic 2D Quick Response Pattern</strong>
                  <p style={styles.pointDesc}>
                    Embedded high-contrast verification matrix linked to central HRSJM trust servers.
                    Scannable by law enforcement and institutional authorities.
                  </p>
                </div>
              </div>

              <div style={styles.pointRow}>
                <ShieldCheck size={18} color="#C9971A" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={styles.pointTitle}>Central Trust Seal & Dual Verification</strong>
                  <p style={styles.pointDesc}>
                    Includes golden embossed watermark seal, registration registration HR/0092/2019,
                    and countersigned by the National Registrar.
                  </p>
                </div>
              </div>

              <div style={styles.pointRow}>
                <Calendar size={18} color="#059669" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <strong style={styles.pointTitle}>Statutory Validity Tenure</strong>
                  <p style={styles.pointDesc}>
                    Valid across all Indian states and Union Territories through {profile.validTill || '31 Dec 2027'}.
                    Card renewal requires annual administrative review.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 32px 60px',
    maxWidth: '1280px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '28px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: '#06294D',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '6px 0',
  },
  topActions: {
    display: 'flex',
    gap: '12px',
  },
  outlineBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    color: '#06294D',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  primaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 20px',
    borderRadius: '8px',
    backgroundColor: '#FAD465',
    border: 'none',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(250, 212, 101, 0.4)',
  },
  layout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(360px, 480px) minmax(0, 1fr)',
    gap: '32px',
    alignItems: 'start',
  },
  cardPreviewWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: '24px',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
  },
  badgeHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: '20px',
  },
  badgeLabel: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#06294D',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  activePill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#ECFDF5',
    color: '#065F46',
    fontSize: '11px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '12px',
  },
  flipHelpText: {
    fontSize: '11.5px',
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: '16px',
    marginBottom: 0,
  },
  specsWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #E2E8F0',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
  },
  cardSectionTitleRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '16px',
    borderBottom: '1px solid #F1F5F9',
    marginBottom: '18px',
  },
  cardSectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  specGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px 20px',
  },
  specItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },
  specLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  specVal: {
    fontSize: '13.5px',
    fontWeight: 600,
    color: '#0F172A',
  },
  securityPoints: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  pointRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  pointTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: '#011F39',
    display: 'block',
    marginBottom: '2px',
  },
  pointDesc: {
    fontSize: '12px',
    color: '#64748B',
    lineHeight: 1.4,
    margin: 0,
  },
};

