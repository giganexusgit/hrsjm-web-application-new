import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  IdCard,
  KeyRound,
  CheckCircle2,
  Lock,
  Download,
  Printer,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { useProfile } from '../store/profileStore';
import { ProfileSummaryCard } from '../components/ProfileSummaryCard';
import { PersonalInfoCard } from '../components/PersonalInfoCard';
import { AdminDetailsCard } from '../components/AdminDetailsCard';
import { IdCardSvgPreview } from '../components/IdCardSvgPreview';
import { EditPersonalInfoModal } from '../components/EditPersonalInfoModal';
import { EditAdminDetailsModal } from '../components/EditAdminDetailsModal';
import { ChangePasswordModal } from '../components/ChangePasswordModal';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { profileService } from '../services/profileService';

export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const {
    profile,
    stagedMessage,
    updatePersonalInfo,
    updateAdminDetails,
    updateAvatar,
    changePassword,
    consumeStagedMessage,
  } = useProfile();

  const [editPersonalOpen, setEditPersonalOpen] = useState(false);
  const [editAdminOpen, setEditAdminOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);

  // Consume toast if active
  const toastText = stagedMessage;
  const handleDismissToast = () => {
    consumeStagedMessage();
  };

  return (
    <div style={styles.container}>
      {/* Toast Alert Banner */}
      {toastText && (
        <div style={styles.toastBanner}>
          <div style={styles.toastContent}>
            <CheckCircle2 size={16} color="#059669" />
            <span>{toastText}</span>
          </div>
          <button type="button" onClick={handleDismissToast} style={styles.toastDismiss}>
            ✕
          </button>
        </div>
      )}

      {/* Breadcrumb & Page Header */}
      <div style={styles.header}>
        <div style={styles.breadcrumb}>
          <span style={styles.breadcrumbLink} onClick={() => navigate('/admin/dashboard')}>
            Dashboard
          </span>
          <ChevronRight size={13} color="#94A3B8" />
          <span style={styles.breadcrumbActive}>My Profile & ID Card</span>
        </div>

        <div style={styles.headerRow}>
          <div>
            <h1 style={styles.title}>My Profile & ID Card</h1>
            <p style={styles.subtitle}>
              Manage your personal credentials, administrative governance role, and official digital ID card.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              onClick={() => navigate('/admin/profile/id-card')}
              style={styles.headerActionBtn}
            >
              <IdCard size={15} color="#06294D" />
              <span>Full ID Card View</span>
              <ExternalLink size={12} color="#64748B" />
            </button>
            <button
              type="button"
              onClick={() => profileService.printIdCard(profile)}
              style={styles.headerPrimaryBtn}
            >
              <Printer size={15} color="#011F39" />
              <span>Print Badge</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Admin Summary Card */}
      <ProfileSummaryCard
        profile={profile}
        onChangeAvatar={() => setAvatarPickerOpen(true)}
        onViewIdCard={() => navigate('/admin/profile/id-card')}
        onChangePassword={() => setChangePasswordOpen(true)}
        onEditPersonal={() => setEditPersonalOpen(true)}
      />

      {/* Two Column Layout: Info Cards on Left, Official ID Card on Right */}
      <div style={styles.mainLayout}>
        <div style={styles.leftColumn}>
          {/* Personal Information */}
          <PersonalInfoCard
            profile={profile}
            onEdit={() => setEditPersonalOpen(true)}
          />

          {/* Admin & Governance Details */}
          <AdminDetailsCard
            profile={profile}
            onEdit={() => setEditAdminOpen(true)}
          />

          {/* Security & Credentials Card */}
          <div style={styles.securityCard}>
            <div style={styles.securityHeader}>
              <div style={styles.securityHeaderLeft}>
                <div style={styles.iconWrap}>
                  <Lock size={18} color="#06294D" />
                </div>
                <div>
                  <h2 style={styles.securityTitle}>Security & Credentials</h2>
                  <p style={styles.securitySubtitle}>
                    Authentication security, password management, and authorized session privileges.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setChangePasswordOpen(true)}
                style={styles.changePasswordBtn}
              >
                <KeyRound size={14} color="#06294D" />
                <span>Change Password</span>
              </button>
            </div>

            <div style={styles.securityGrid}>
              <div style={styles.securityItem}>
                <span style={styles.securityLabel}>Account Password</span>
                <span style={styles.securityVal}>••••••••••••</span>
                <span style={styles.securityNote}>Last updated 3 months ago</span>
              </div>

              <div style={styles.securityItem}>
                <span style={styles.securityLabel}>Two-Factor Authentication</span>
                <div style={styles.pillGreen}>
                  <CheckCircle2 size={12} color="#059669" />
                  <span>Enforced by Trust Policy</span>
                </div>
                <span style={styles.securityNote}>SMS & Email OTP Enabled</span>
              </div>

              <div style={styles.securityItem}>
                <span style={styles.securityLabel}>Active Role Permissions</span>
                <span style={{ ...styles.securityVal, color: '#06294D', fontWeight: 700 }}>
                  Full Central Administrator
                </span>
                <span style={styles.securityNote}>Unrestricted dashboard access</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: ID Card Preview Card */}
        <div style={styles.rightColumn}>
          <div style={styles.idCardSectionCard}>
            <div style={styles.idSectionHeader}>
              <div style={styles.idSectionHeaderTitles}>
                <h2 style={styles.idSectionTitle}>Official Digital ID Card</h2>
                <p style={styles.idSectionSub}>
                  Standard government-compliant trust identity badge with QR verification.
                </p>
              </div>
            </div>

            <div style={styles.idCardGraphicWrap}>
              <IdCardSvgPreview profile={profile} interactive={true} />
            </div>

            <div style={styles.idCardFooterRow}>
              <button
                type="button"
                onClick={() => navigate('/admin/profile/id-card')}
                style={styles.footerDetailsBtn}
              >
                <IdCard size={14} color="#06294D" />
                <span>Open Dedicated View</span>
              </button>

              <button
                type="button"
                onClick={() => profileService.printIdCard(profile)}
                style={styles.footerPrintBtn}
              >
                <Download size={14} color="#011F39" />
                <span>Save PDF</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Personal Info Modal */}
      <EditPersonalInfoModal
        isOpen={editPersonalOpen}
        onClose={() => setEditPersonalOpen(false)}
        profile={profile}
        onSave={updatePersonalInfo}
      />

      {/* Edit Admin Details Modal */}
      <EditAdminDetailsModal
        isOpen={editAdminOpen}
        onClose={() => setEditAdminOpen(false)}
        profile={profile}
        onSave={updateAdminDetails}
      />

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
        onSave={changePassword}
      />

      {/* Avatar Picker Modal */}
      <AvatarPickerModal
        isOpen={avatarPickerOpen}
        onClose={() => setAvatarPickerOpen(false)}
        currentAvatar={profile.avatar}
        onSelectAvatar={updateAvatar}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    minWidth: 0,
    padding: '24px 32px 60px',
    maxWidth: '1440px',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  toastBanner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    border: '1px solid #A7F3D0',
    color: '#065F46',
    padding: '12px 18px',
    borderRadius: '10px',
    marginBottom: '20px',
    boxShadow: '0 2px 6px rgba(5, 150, 105, 0.1)',
  },
  toastContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '13.5px',
    fontWeight: 600,
  },
  toastDismiss: {
    background: 'none',
    border: 'none',
    color: '#065F46',
    cursor: 'pointer',
    fontSize: '14px',
    padding: '2px 6px',
  },
  header: {
    marginBottom: '24px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12.5px',
    color: '#64748B',
    marginBottom: '10px',
  },
  breadcrumbLink: {
    cursor: 'pointer',
    color: '#06294D',
    fontWeight: 500,
  },
  breadcrumbActive: {
    color: '#0F172A',
    fontWeight: 600,
  },
  headerRow: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
  },
  title: {
    fontSize: '26px',
    fontWeight: 800,
    color: '#011F39',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '13.5px',
    color: '#64748B',
    margin: '4px 0 0 0',
  },
  headerActions: {
    display: 'flex',
    gap: '10px',
  },
  headerActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 16px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #CBD5E1',
    color: '#06294D',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  headerPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    borderRadius: '8px',
    backgroundColor: '#FAD465',
    border: 'none',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(250, 212, 101, 0.4)',
  },
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) minmax(360px, 1fr)',
    gap: '24px',
    alignItems: 'start',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
  },
  securityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    padding: '24px',
  },
  securityHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '18px',
    borderBottom: '1px solid #F1F5F9',
    marginBottom: '20px',
  },
  securityHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  iconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#F0F5F9',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  securityTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  securitySubtitle: {
    fontSize: '12px',
    color: '#64748B',
    margin: '2px 0 0 0',
  },
  changePasswordBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '6px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    color: '#06294D',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  securityGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '18px',
  },
  securityItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  securityLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: '0.4px',
  },
  securityVal: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#0F172A',
  },
  securityNote: {
    fontSize: '11px',
    color: '#94A3B8',
  },
  pillGreen: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#ECFDF5',
    color: '#065F46',
    fontSize: '11.5px',
    fontWeight: 600,
    padding: '2px 8px',
    borderRadius: '12px',
    width: 'fit-content',
    marginTop: '2px',
  },
  idCardSectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  idSectionHeader: {
    width: '100%',
    textAlign: 'center',
    marginBottom: '20px',
  },
  idSectionHeaderTitles: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  idSectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  idSectionSub: {
    fontSize: '12px',
    color: '#64748B',
    margin: '4px 0 0 0',
  },
  idCardGraphicWrap: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  idCardFooterRow: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    maxWidth: '440px',
  },
  footerDetailsBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '9px 14px',
    borderRadius: '8px',
    backgroundColor: '#F8FAFC',
    border: '1px solid #CBD5E1',
    color: '#06294D',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  footerPrintBtn: {
    flex: 1,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '9px 14px',
    borderRadius: '8px',
    backgroundColor: '#FAD465',
    border: 'none',
    color: '#011F39',
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
  },
};
