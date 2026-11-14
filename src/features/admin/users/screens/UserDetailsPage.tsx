import React, { useState, useSyncExternalStore, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usersStore } from '../store/usersStore';
import type { UserType, UserStatus, UserVerificationDocument } from '../types/user.types';
import { UserConfirmationModal } from '../components/UserConfirmationModal';
import { UserPasswordResetModal } from '../components/UserPasswordResetModal';
import { UserDocumentViewerModal } from '../components/UserDocumentViewerModal';
import { getValidAvatarUrl, getInitials } from '@/utils/avatar';
import {
  ChevronLeft,
  Edit3,
  Lock,
  Unlock,
  KeyRound,
  ShieldCheck,
  CreditCard,
  Clock,
  Calendar,
  IdCard,
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  FileText,
  AlertCircle,
  Copy,
  Check,
  Shield,
  Trash2,
  Users,
  CheckCircle2,
  AlertTriangle,
  HeartHandshake,
} from 'lucide-react';

type UserTab = 'profile' | 'documents' | 'security' | 'donations';

const USER_TYPE_CONFIG: Record<
  UserType,
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  admin: {
    label: 'Administrator',
    bg: '#FDF2F8',
    text: '#9D174D',
    border: '#FBCFE8',
    icon: '🛡️',
  },
  member: {
    label: 'Official Member',
    bg: '#011F39',
    text: '#FAD465',
    border: '#E9B82E',
    icon: '🎖️',
  },
  seeker: {
    label: 'Donation Seeker',
    bg: '#FEF3C7',
    text: '#B45309',
    border: '#FDE68A',
    icon: '🤝',
  },
  donor: {
    label: 'Patron Donor',
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
    icon: '💙',
  },
  general: {
    label: 'General Citizen',
    bg: '#F1F5F9',
    text: '#334155',
    border: '#CBD5E1',
    icon: '👤',
  },
};

const STATUS_CONFIG: Record<
  UserStatus,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  active: {
    label: 'Active & Verified',
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
    dot: '#10B981',
  },
  pending: {
    label: 'Pending Review',
    bg: '#FFFBEB',
    text: '#B45309',
    border: '#FDE68A',
    dot: '#F59E0B',
  },
  blocked: {
    label: 'Suspended / Blocked',
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FECACA',
    dot: '#EF4444',
  },
};

export const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  useSyncExternalStore(usersStore.subscribe, usersStore.getSnapshot);

  const user = id ? usersStore.getUserById(id) : undefined;

  // Active Tab
  const [activeTab, setActiveTab] = useState<UserTab>('profile');

  // Modals state
  const [confirmAction, setConfirmAction] = useState<'block' | 'unblock' | 'delete' | null>(null);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [viewingDoc, setViewingDoc] = useState<UserVerificationDocument | null>(null);

  // Avatar state
  const [imgError, setImgError] = useState(false);
  const validAvatarUrl = useMemo(() => getValidAvatarUrl(user?.avatarUrl), [user?.avatarUrl]);

  // Copy feedback state
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    setImgError(false);
  }, [user?.avatarUrl]);

  const handleCopy = (text: string, key: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  if (!user) {
    return (
      <div style={styles.notFoundWrapper}>
        <AlertCircle size={44} color="#DC2626" style={{ margin: '0 auto 16px' }} />
        <h2 style={styles.notFoundTitle}>User Account Not Found</h2>
        <p style={styles.notFoundText}>
          The requested user record #{id} does not exist in the active organization directory.
        </p>
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          style={styles.returnBtn}
        >
          <ChevronLeft size={16} />
          <span>Return to Users Directory</span>
        </button>
      </div>
    );
  }

  const handleConfirmAction = async () => {
    if (!confirmAction) return;
    const action = confirmAction;
    setConfirmAction(null);

    if (action === 'delete') {
      usersStore.deleteUser(user.id);
      navigate('/admin/users');
    } else if (action === 'block') {
      await usersStore.updateStatus(user.id, 'blocked');
    } else if (action === 'unblock') {
      await usersStore.updateStatus(user.id, 'active');
    }
  };

  const isMember = user.userType === 'member';
  const typeConfig = USER_TYPE_CONFIG[user.userType] || USER_TYPE_CONFIG.general;
  const statusConfig = STATUS_CONFIG[user.status] || STATUS_CONFIG.active;
  const initials = getInitials(user.name, 'U');

  const formatJoined = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        return {
          date: d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          }),
          time: d.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          }),
        };
      }
    } catch {
      // Fallback
    }
    return { date: dateStr.split('T')[0] || dateStr, time: '' };
  };

  const joinedInfo = formatJoined(user.joinedDate);
  const shortId = user.id.replace(/-/g, '').slice(-8).toUpperCase();
  const docCount = (user.documents || []).length;

  return (
    <div style={styles.pageContainer}>
      {/* Top Header & Breadcrumb Bar */}
      <div style={styles.topBar}>
        <button
          type="button"
          onClick={() => navigate('/admin/users')}
          style={styles.backBtn}
          title="Return to Users Management Directory"
        >
          <ChevronLeft size={18} />
          <span>Back to Users Directory</span>
        </button>

        <div style={styles.topActions}>
          <button
            type="button"
            onClick={() => setShowPasswordResetModal(true)}
            style={styles.topSecondaryBtn}
            title="Reset user security credentials"
          >
            <KeyRound size={15} color="#011F39" />
            <span>Reset Password</span>
          </button>

          <button
            type="button"
            onClick={() => navigate(`/admin/users/${user.id}/edit`)}
            style={styles.topPrimaryBtn}
            title="Edit user profile information"
          >
            <Edit3 size={15} color="#011F39" />
            <span>Edit Profile</span>
          </button>
        </div>
      </div>

      {/* Primary User Identity Hero Card with Banner */}
      <div style={styles.heroCard}>
        {/* Subtle Decorative Navy Gradient Banner */}
        <div style={styles.heroBanner}>
          <div style={styles.bannerBadge}>
            <Shield size={13} color="#FAD465" />
            <span>HRSJM CITIZEN REGISTRY</span>
          </div>
        </div>

        {/* Hero Card Body */}
        <div style={styles.heroBody}>
          <div style={styles.heroLeft}>
            {/* Avatar Container with Gold Accent Ring */}
            <div style={styles.avatarWrapper}>
              {validAvatarUrl && !imgError ? (
                <img
                  src={validAvatarUrl}
                  alt=""
                  onError={() => setImgError(true)}
                  style={styles.avatarImg}
                />
              ) : (
                <div style={styles.avatarInitials} aria-label={user.name}>
                  {initials}
                </div>
              )}
              <span
                style={{
                  ...styles.avatarStatusDot,
                  backgroundColor: statusConfig.dot,
                }}
                title={`Account Status: ${statusConfig.label}`}
              />
            </div>

            {/* User Title & Badges */}
            <div style={styles.heroInfo}>
              <div style={styles.nameRow}>
                <h1 style={styles.userName}>{user.name}</h1>
                <button
                  type="button"
                  style={styles.idPill}
                  onClick={() => handleCopy(user.id, 'id')}
                  title="Click to copy full User UUID"
                >
                  <span>ID: #{shortId}</span>
                  {copiedKey === 'id' ? (
                    <Check size={12} color="#16A34A" />
                  ) : (
                    <Copy size={12} color="#64748B" />
                  )}
                </button>
              </div>

              {/* Contact Information Row */}
              <div style={styles.contactRow}>
                {user.email ? (
                  <button
                    type="button"
                    style={styles.contactItem}
                    onClick={() => handleCopy(user.email!, 'email')}
                    title="Click to copy email address"
                  >
                    <Mail size={14} color="#64748B" />
                    <span>{user.email}</span>
                    {copiedKey === 'email' ? (
                      <Check size={11} color="#16A34A" />
                    ) : (
                      <Copy size={11} color="#94A3B8" />
                    )}
                  </button>
                ) : (
                  <span style={styles.contactMissing}>No email registered</span>
                )}

                {user.phone ? (
                  <button
                    type="button"
                    style={styles.contactItem}
                    onClick={() => handleCopy(user.phone!, 'phone')}
                    title="Click to copy phone number"
                  >
                    <Phone size={14} color="#64748B" />
                    <span>{user.phone}</span>
                    {copiedKey === 'phone' ? (
                      <Check size={11} color="#16A34A" />
                    ) : (
                      <Copy size={11} color="#94A3B8" />
                    )}
                  </button>
                ) : (
                  <span style={styles.contactMissing}>No phone registered</span>
                )}
              </div>

              {/* Badges Row */}
              <div style={styles.badgesRow}>
                <span
                  style={{
                    ...styles.roleBadge,
                    backgroundColor: typeConfig.bg,
                    color: typeConfig.text,
                    borderColor: typeConfig.border,
                  }}
                >
                  <span>{typeConfig.icon}</span>
                  <span>{typeConfig.label}</span>
                </span>

                <span
                  style={{
                    ...styles.statusBadge,
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.text,
                    borderColor: statusConfig.border,
                  }}
                >
                  <span
                    style={{
                      ...styles.statusDot,
                      backgroundColor: statusConfig.dot,
                    }}
                  />
                  <span>{statusConfig.label}</span>
                </span>

                {isMember && user.memberId && (
                  <span style={styles.memberIdBadge}>
                    <span>🎖️ {user.memberId}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Header Right Actions */}
          <div style={styles.heroRightActions}>
            <button
              type="button"
              onClick={() => navigate(`/admin/users/${user.id}/edit`)}
              style={styles.heroEditBtn}
              title="Edit profile information"
            >
              <Edit3 size={15} />
              <span>Edit Details</span>
            </button>

            <button
              type="button"
              onClick={() => setConfirmAction(user.status === 'blocked' ? 'unblock' : 'block')}
              style={{
                ...styles.heroStatusBtn,
                backgroundColor: user.status === 'blocked' ? '#ECFDF5' : '#FEF2F2',
                borderColor: user.status === 'blocked' ? '#BBF7D0' : '#FECACA',
                color: user.status === 'blocked' ? '#047857' : '#DC2626',
              }}
              title={user.status === 'blocked' ? 'Unblock user account' : 'Suspend / block user account'}
            >
              {user.status === 'blocked' ? (
                <>
                  <Unlock size={14} />
                  <span>Unblock</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>Suspend</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards in Balanced Row */}
      <div style={styles.metricsGrid} className="user-metrics-grid">
        {/* Metric 1: System Identifier */}
        <div style={{ ...styles.metricCard, borderTop: '3px solid #0284C7' }}>
          <div style={styles.metricTopRow}>
            <span style={styles.metricLabel}>User System ID</span>
            <div style={{ ...styles.metricIconBox, backgroundColor: '#EFF6FF', color: '#0284C7' }}>
              <IdCard size={18} />
            </div>
          </div>
          <div style={styles.metricValue}>
            {isMember && user.memberId
              ? user.memberId
              : user.applicationNumber
              ? user.applicationNumber
              : `#${shortId}`}
          </div>
          <span style={styles.metricSub}>Official Identifier</span>
        </div>

        {/* Metric 2: Registration Date */}
        <div style={{ ...styles.metricCard, borderTop: '3px solid #D97706' }}>
          <div style={styles.metricTopRow}>
            <span style={styles.metricLabel}>Registration Date</span>
            <div style={{ ...styles.metricIconBox, backgroundColor: '#FFFBEB', color: '#D97706' }}>
              <Calendar size={18} />
            </div>
          </div>
          <div style={styles.metricValue}>{joinedInfo.date}</div>
          <span style={styles.metricSub}>
            {joinedInfo.time ? `${joinedInfo.time} IST` : 'Enrolled date'}
          </span>
        </div>

        {/* Metric 3: Last Active Session */}
        <div style={{ ...styles.metricCard, borderTop: '3px solid #011F39' }}>
          <div style={styles.metricTopRow}>
            <span style={styles.metricLabel}>Last Active</span>
            <div style={{ ...styles.metricIconBox, backgroundColor: '#F0F9FF', color: '#0369A1' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={styles.metricValue}>{user.lastLogin || 'Recently'}</div>
          <span style={styles.metricSub}>Account access log</span>
        </div>

        {/* Metric 4: Total Donations */}
        <div style={{ ...styles.metricCard, borderTop: '3px solid #16A34A' }}>
          <div style={styles.metricTopRow}>
            <span style={styles.metricLabel}>Total Donations</span>
            <div style={{ ...styles.metricIconBox, backgroundColor: '#F0FDF4', color: '#16A34A' }}>
              <CreditCard size={18} />
            </div>
          </div>
          <div style={styles.metricValue}>
            ₹ {(user.totalDonations ?? 0).toLocaleString('en-IN')}
          </div>
          <span style={styles.metricSub}>
            {user.donationCount ?? 0} {user.donationCount === 1 ? 'donation' : 'donations'}
          </span>
        </div>
      </div>

      {/* Navigation Tabs for Profile Sections */}
      <div style={styles.tabsBar}>
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'profile' ? '#011F39' : '#FFFFFF',
            color: activeTab === 'profile' ? '#FFFFFF' : '#334155',
            borderColor: activeTab === 'profile' ? '#011F39' : '#DCE4EC',
          }}
        >
          <UserIcon size={15} />
          <span>Profile & Account</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('documents')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'documents' ? '#011F39' : '#FFFFFF',
            color: activeTab === 'documents' ? '#FFFFFF' : '#334155',
            borderColor: activeTab === 'documents' ? '#011F39' : '#DCE4EC',
          }}
        >
          <ShieldCheck size={15} />
          <span>KYC Documents</span>
          {docCount > 0 && (
            <span
              style={{
                ...styles.tabCountBadge,
                backgroundColor: activeTab === 'documents' ? '#FAD465' : '#EDF2F7',
                color: activeTab === 'documents' ? '#011F39' : '#475569',
              }}
            >
              {docCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'security' ? '#011F39' : '#FFFFFF',
            color: activeTab === 'security' ? '#FFFFFF' : '#334155',
            borderColor: activeTab === 'security' ? '#011F39' : '#DCE4EC',
          }}
        >
          <KeyRound size={15} />
          <span>Security & Controls</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('donations')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'donations' ? '#011F39' : '#FFFFFF',
            color: activeTab === 'donations' ? '#FFFFFF' : '#334155',
            borderColor: activeTab === 'donations' ? '#011F39' : '#DCE4EC',
          }}
        >
          <HeartHandshake size={15} />
          <span>Donations History</span>
        </button>
      </div>

      {/* Tab 1: Profile & Account Information */}
      {activeTab === 'profile' && (
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionHeaderTitle}>
              <UserIcon size={18} color="#011F39" />
              <h2 style={styles.sectionTitle}>Account & Personal Information</h2>
            </div>
          </div>

          <div style={styles.fieldsGrid}>
            {/* Full Name */}
            <div style={styles.fieldTile}>
              <span style={styles.fieldLabel}>Full Legal Name</span>
              <div style={styles.fieldValueRow}>
                <UserIcon size={15} color="#123F68" />
                <span style={{ ...styles.fieldValueText, textTransform: 'capitalize' }}>
                  {user.name}
                </span>
              </div>
            </div>

            {/* Email */}
            <div style={styles.fieldTile}>
              <span style={styles.fieldLabel}>Email Address</span>
              <div style={styles.fieldValueRow}>
                <Mail size={15} color="#123F68" />
                <span style={styles.fieldValueText}>{user.email || '—'}</span>
              </div>
            </div>

            {/* Phone */}
            <div style={styles.fieldTile}>
              <span style={styles.fieldLabel}>Mobile Phone Number</span>
              <div style={styles.fieldValueRow}>
                <Phone size={15} color="#123F68" />
                <span style={styles.fieldValueText}>{user.phone || '—'}</span>
              </div>
            </div>

            {/* Role */}
            <div style={styles.fieldTile}>
              <span style={styles.fieldLabel}>Account Role & Privileges</span>
              <div style={styles.fieldValueRow}>
                <Shield size={15} color="#123F68" />
                <span style={styles.fieldValueText}>{typeConfig.label}</span>
              </div>
            </div>

            {/* Date of Birth */}
            <div style={styles.fieldTile}>
              <span style={styles.fieldLabel}>Date of Birth</span>
              <div style={styles.fieldValueRow}>
                <Calendar size={15} color="#123F68" />
                <span style={styles.fieldValueText}>{user.dob || 'Not specified'}</span>
              </div>
            </div>

            {/* Gender */}
            <div style={styles.fieldTile}>
              <span style={styles.fieldLabel}>Gender</span>
              <div style={styles.fieldValueRow}>
                <Users size={15} color="#123F68" />
                <span style={styles.fieldValueText}>{user.gender || 'Not specified'}</span>
              </div>
            </div>

            {/* Residential Address */}
            <div style={{ ...styles.fieldTile, gridColumn: '1 / -1' }}>
              <span style={styles.fieldLabel}>Residential Address</span>
              <div style={styles.fieldValueRow}>
                <MapPin size={16} color="#123F68" style={{ flexShrink: 0 }} />
                <span style={styles.fieldValueText}>
                  {user.address || 'No residential address on file'}
                </span>
              </div>
            </div>

            {/* Administrative Remarks */}
            {user.remarks && (
              <div style={{ ...styles.fieldTile, gridColumn: '1 / -1' }}>
                <span style={styles.fieldLabel}>Administrative Remarks & Notes</span>
                <div style={styles.remarksBox}>
                  <span>{user.remarks}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: KYC & Identity Documents */}
      {activeTab === 'documents' && (
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionHeaderTitle}>
              <ShieldCheck size={18} color="#011F39" />
              <h2 style={styles.sectionTitle}>Verification & Identity Documents</h2>
            </div>

            <button
              type="button"
              onClick={() => navigate(`/admin/users/${user.id}/verification`)}
              style={styles.verificationBtn}
            >
              <ShieldCheck size={15} />
              <span>Open Verification Portal</span>
            </button>
          </div>

          {user.documents && user.documents.length > 0 ? (
            <div style={styles.docsGrid}>
              {user.documents.map((doc) => (
                <div key={doc.id} style={styles.docCard}>
                  <div style={styles.docLeft}>
                    <div style={styles.docIconBox}>
                      <FileText size={20} color="#011F39" />
                    </div>
                    <div style={styles.docMeta}>
                      <span style={styles.docTitle}>{doc.title}</span>
                      <span style={styles.docSub}>
                        {doc.fileName} • {doc.fileSize || '1.2 MB'}
                      </span>
                    </div>
                  </div>

                  <div style={styles.docActions}>
                    <span
                      style={{
                        ...styles.docBadge,
                        backgroundColor: doc.verified ? '#ECFDF5' : '#FFFBEB',
                        color: doc.verified ? '#059669' : '#D97706',
                        borderColor: doc.verified ? '#BBF7D0' : '#FDE68A',
                      }}
                    >
                      {doc.verified ? 'Verified' : 'Pending'}
                    </span>

                    <button
                      type="button"
                      onClick={() => setViewingDoc(doc)}
                      style={styles.viewDocBtn}
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.docsEmptyBox}>
              <FileText size={34} color="#94A3B8" />
              <span style={styles.docsEmptyTitle}>No Verification Documents Attached</span>
              <span style={styles.docsEmptySub}>
                This user account has not yet submitted Aadhaar, PAN card, or authorized organization identity credentials.
              </span>
              <button
                type="button"
                onClick={() => navigate(`/admin/users/${user.id}/verification`)}
                style={styles.emptyVerificationBtn}
              >
                <ShieldCheck size={15} />
                <span>Request or Upload Verification Documents</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Security & Permissions */}
      {activeTab === 'security' && (
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionHeaderTitle}>
              <KeyRound size={18} color="#011F39" />
              <h2 style={styles.sectionTitle}>Security Credentials & Access Governance</h2>
            </div>
          </div>

          <div style={styles.securityGrid}>
            {/* Password Reset Card */}
            <div style={styles.securityCard}>
              <div style={styles.securityCardLeft}>
                <div style={{ ...styles.securityIconCircle, backgroundColor: '#EFF6FF', color: '#1D4ED8' }}>
                  <KeyRound size={20} />
                </div>
                <div>
                  <h3 style={styles.securityCardTitle}>Account Password</h3>
                  <p style={styles.securityCardDesc}>
                    Issue a temporary password or dispatch a password reset link to user's registered email.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPasswordResetModal(true)}
                style={styles.securityActionBtn}
              >
                Reset Password
              </button>
            </div>

            {/* Account Status Card */}
            <div style={styles.securityCard}>
              <div style={styles.securityCardLeft}>
                <div
                  style={{
                    ...styles.securityIconCircle,
                    backgroundColor: user.status === 'blocked' ? '#FEF2F2' : '#ECFDF5',
                    color: user.status === 'blocked' ? '#DC2626' : '#059669',
                  }}
                >
                  {user.status === 'blocked' ? <Lock size={20} /> : <CheckCircle2 size={20} />}
                </div>
                <div>
                  <h3 style={styles.securityCardTitle}>
                    Account Status: <span style={{ textTransform: 'capitalize' }}>{user.status}</span>
                  </h3>
                  <p style={styles.securityCardDesc}>
                    {user.status === 'blocked'
                      ? 'Account is currently suspended. User cannot log in or submit applications.'
                      : 'Account is fully active with normal portal access.'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmAction(user.status === 'blocked' ? 'unblock' : 'block')}
                style={{
                  ...styles.securityActionBtn,
                  backgroundColor: user.status === 'blocked' ? '#ECFDF5' : '#FEF2F2',
                  borderColor: user.status === 'blocked' ? '#BBF7D0' : '#FECACA',
                  color: user.status === 'blocked' ? '#047857' : '#DC2626',
                }}
              >
                {user.status === 'blocked' ? 'Unblock User' : 'Suspend Account'}
              </button>
            </div>

            {/* Danger Zone: Delete User */}
            <div style={{ ...styles.securityCard, borderColor: '#FEE2E2', backgroundColor: '#FFFDFD' }}>
              <div style={styles.securityCardLeft}>
                <div style={{ ...styles.securityIconCircle, backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ ...styles.securityCardTitle, color: '#991B1B' }}>Danger Zone: Delete User Record</h3>
                  <p style={styles.securityCardDesc}>
                    Permanently delete this citizen profile and associated access tokens. This action is irreversible.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmAction('delete')}
                style={styles.securityDangerBtn}
              >
                <Trash2 size={14} />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Donations & Aid History */}
      {activeTab === 'donations' && (
        <div style={styles.sectionCard}>
          <div style={styles.sectionHeader}>
            <div style={styles.sectionHeaderTitle}>
              <HeartHandshake size={18} color="#011F39" />
              <h2 style={styles.sectionTitle}>Donation & Payment Records</h2>
            </div>
          </div>

          <div style={styles.donationsSummaryBox}>
            <div style={styles.donationStatItem}>
              <span style={styles.donationStatLabel}>Lifetime Total</span>
              <span style={styles.donationStatValue}>
                ₹ {(user.totalDonations ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
            <div style={styles.donationStatDivider} />
            <div style={styles.donationStatItem}>
              <span style={styles.donationStatLabel}>Completed Donations</span>
              <span style={styles.donationStatValue}>{user.donationCount ?? 0}</span>
            </div>
            <div style={styles.donationStatDivider} />
            <div style={styles.donationStatItem}>
              <span style={styles.donationStatLabel}>80G Tax Exemption Status</span>
              <span style={styles.donationStatValue}>
                {user.totalDonations && user.totalDonations > 0 ? 'Eligible' : 'No Receipts'}
              </span>
            </div>
          </div>

          <div style={{ marginTop: '20px' }}>
            <div style={styles.docsEmptyBox}>
              <CreditCard size={32} color="#94A3B8" />
              <span style={styles.docsEmptyTitle}>No Recent Payment Transactions</span>
              <span style={styles.docsEmptySub}>
                Transaction receipts from payment gateway will automatically synchronize under this profile.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Footer Bar */}
      <div style={styles.footerBar}>
        <div style={styles.footerLeft}>
          <button
            type="button"
            onClick={() => setConfirmAction(user.status === 'blocked' ? 'unblock' : 'block')}
            style={{
              ...styles.footerActionBtn,
              backgroundColor: user.status === 'blocked' ? '#ECFDF5' : '#FEF2F2',
              borderColor: user.status === 'blocked' ? '#BBF7D0' : '#FECACA',
              color: user.status === 'blocked' ? '#047857' : '#DC2626',
            }}
          >
            {user.status === 'blocked' ? (
              <>
                <Unlock size={15} />
                <span>Unblock Account</span>
              </>
            ) : (
              <>
                <Lock size={15} />
                <span>Suspend Account</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShowPasswordResetModal(true)}
            style={styles.footerSecondaryBtn}
          >
            <KeyRound size={15} color="#011F39" />
            <span>Reset Password</span>
          </button>

          <button
            type="button"
            onClick={() => setConfirmAction('delete')}
            style={styles.footerDangerGhostBtn}
          >
            <Trash2 size={15} color="#DC2626" />
            <span>Delete User</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => navigate(`/admin/users/${user.id}/edit`)}
          style={styles.footerPrimaryBtn}
        >
          <Edit3 size={15} color="#011F39" />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* Modals */}
      <UserConfirmationModal
        isOpen={Boolean(confirmAction)}
        user={user}
        action={confirmAction}
        onConfirm={handleConfirmAction}
        onCancel={() => setConfirmAction(null)}
      />

      <UserPasswordResetModal
        isOpen={showPasswordResetModal}
        user={user}
        onClose={() => setShowPasswordResetModal(false)}
      />

      <UserDocumentViewerModal
        isOpen={Boolean(viewingDoc)}
        document={viewingDoc}
        onClose={() => setViewingDoc(null)}
        onVerify={(docId) => {
          usersStore.updateDocumentVerification(user.id, docId, true);
        }}
      />
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  pageContainer: {
    maxWidth: '1240px',
    margin: '0 auto',
    paddingBottom: '40px',
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '20px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '8px',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '8px 14px',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.15s ease',
  },
  topActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  topSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 15px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '8px',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.15s ease',
  },
  topPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '8px 18px',
    backgroundColor: '#FAD465',
    border: '1px solid #E9B82E',
    borderRadius: '8px',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(250, 212, 101, 0.35)',
    transition: 'all 0.15s ease',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 2px 8px rgba(1, 31, 57, 0.04)',
    marginBottom: '20px',
    overflow: 'hidden',
  },
  heroBanner: {
    height: '60px',
    background: 'linear-gradient(135deg, #011F39 0%, #06294D 60%, #123F68 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 24px',
  },
  bannerBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.08em',
    color: '#FAD465',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    padding: '4px 10px',
    borderRadius: '12px',
    border: '1px solid rgba(250, 212, 101, 0.25)',
  },
  heroBody: {
    padding: '0 28px 24px 28px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '20px',
    marginTop: '-36px',
  },
  heroLeft: {
    display: 'flex',
    alignItems: 'flex-end',
    flexWrap: 'wrap',
    gap: '22px',
  },
  avatarWrapper: {
    position: 'relative',
    width: '92px',
    height: '92px',
    flexShrink: 0,
  },
  avatarImg: {
    width: '92px',
    height: '92px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #FFFFFF',
    boxShadow: '0 4px 14px rgba(1, 31, 57, 0.12)',
    backgroundColor: '#F8FAFC',
  },
  avatarInitials: {
    width: '92px',
    height: '92px',
    borderRadius: '50%',
    backgroundColor: '#011F39',
    color: '#FAD465',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: '32px',
    border: '4px solid #FFFFFF',
    boxShadow: '0 6px 16px rgba(1, 31, 57, 0.18)',
    letterSpacing: '0.04em',
    fontFamily: '"Inter", system-ui, sans-serif',
  },
  avatarStatusDot: {
    position: 'absolute',
    bottom: '4px',
    right: '4px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: '2.5px solid #FFFFFF',
  },
  heroInfo: {
    flex: 1,
    minWidth: '260px',
    paddingBottom: '2px',
  },
  nameRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '12px',
    marginBottom: '8px',
  },
  userName: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '26px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
    lineHeight: 1.2,
    textTransform: 'capitalize',
  },
  idPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontFamily: 'monospace',
    fontSize: '12px',
    fontWeight: 700,
    color: '#011F39',
    backgroundColor: '#EDF2F7',
    border: '1px solid #DCE4EC',
    padding: '3px 9px',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  contactRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '14px',
    marginBottom: '12px',
  },
  contactItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#475569',
    backgroundColor: 'transparent',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    transition: 'color 0.15s ease',
  },
  contactMissing: {
    fontSize: '13px',
    color: '#94A3B8',
    fontStyle: 'italic',
  },
  badgesRow: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  roleBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid',
  },
  statusBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    border: '1px solid',
  },
  statusDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
  },
  memberIdBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 700,
    backgroundColor: '#FFF9E6',
    color: '#B45309',
    border: '1px solid #FDE68A',
  },
  heroRightActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    paddingBottom: '2px',
  },
  heroEditBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #E9B82E',
    backgroundColor: '#FAD465',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(250, 212, 101, 0.35)',
    transition: 'all 0.15s ease',
  },
  heroStatusBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 14px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '14px',
    marginBottom: '20px',
  },
  metricCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    borderLeft: '1px solid #E2E8F0',
    borderRight: '1px solid #E2E8F0',
    borderBottom: '1px solid #E2E8F0',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.2s ease',
  },
  metricTopRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '6px',
  },
  metricIconBox: {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  metricLabel: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: '#64748B',
  },
  metricValue: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: '18px',
    fontWeight: 800,
    color: '#011F39',
    lineHeight: 1.2,
    margin: '2px 0 4px',
  },
  metricSub: {
    fontSize: '11.5px',
    color: '#94A3B8',
  },
  tabsBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    overflowX: 'auto',
    marginBottom: '20px',
    paddingBottom: '2px',
  },
  tabBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '9px 18px',
    borderRadius: '24px',
    borderWidth: '1px',
    borderStyle: 'solid',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
  },
  tabCountBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '1px 6px',
    borderRadius: '10px',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #E2E8F0',
    padding: '22px 24px',
    marginBottom: '20px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '12px',
    borderBottom: '1px solid #F1F5F9',
    paddingBottom: '14px',
    marginBottom: '18px',
  },
  sectionHeaderTitle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '18px',
    fontWeight: 700,
    color: '#011F39',
    margin: 0,
  },
  fieldsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '14px',
  },
  fieldTile: {
    backgroundColor: '#FAF7F0',
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '12px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fieldLabel: {
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: '#64748B',
  },
  fieldValueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#011F39',
  },
  fieldValueText: {
    wordBreak: 'break-word',
  },
  remarksBox: {
    marginTop: '4px',
    fontSize: '13px',
    color: '#334155',
    lineHeight: 1.5,
  },
  verificationBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '7px 14px',
    borderRadius: '8px',
    border: '1px solid #BFDBFE',
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  docsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '14px',
  },
  docCard: {
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '14px 16px',
    backgroundColor: '#FAF7F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  docLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
  docIconBox: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  docMeta: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
  },
  docTitle: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#011F39',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  docSub: {
    fontSize: '11px',
    color: '#64748B',
  },
  docActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flexShrink: 0,
  },
  docBadge: {
    fontSize: '11px',
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: '8px',
    border: '1px solid',
  },
  viewDocBtn: {
    padding: '6px 12px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #DCE4EC',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#011F39',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  docsEmptyBox: {
    padding: '36px 24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#FAF7F0',
    borderRadius: '12px',
    border: '1px dashed #CBD5E1',
  },
  docsEmptyTitle: {
    fontSize: '14.5px',
    fontWeight: 700,
    color: '#1E293B',
  },
  docsEmptySub: {
    fontSize: '12.5px',
    color: '#64748B',
    maxWidth: '460px',
    lineHeight: 1.4,
  },
  emptyVerificationBtn: {
    marginTop: '6px',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #BFDBFE',
    backgroundColor: '#EFF6FF',
    color: '#1D4ED8',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
  },
  securityGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  securityCard: {
    border: '1px solid #E2E8F0',
    borderRadius: '10px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '16px',
    backgroundColor: '#FAF7F0',
  },
  securityCardLeft: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '14px',
    flex: 1,
    minWidth: '260px',
  },
  securityIconCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  securityCardTitle: {
    fontSize: '14px',
    fontWeight: 700,
    color: '#011F39',
    margin: '0 0 3px 0',
  },
  securityCardDesc: {
    fontSize: '12px',
    color: '#64748B',
    margin: 0,
    lineHeight: 1.4,
  },
  securityActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  securityDangerBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid #FECACA',
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  donationsSummaryBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: '16px',
    backgroundColor: '#FAF7F0',
    border: '1px solid #E2E8F0',
    borderRadius: '12px',
    padding: '18px 24px',
  },
  donationStatItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  donationStatLabel: {
    fontSize: '11.5px',
    fontWeight: 600,
    textTransform: 'uppercase',
    color: '#64748B',
    letterSpacing: '0.04em',
  },
  donationStatValue: {
    fontFamily: '"Inter", system-ui, sans-serif',
    fontSize: '20px',
    fontWeight: 800,
    color: '#011F39',
  },
  donationStatDivider: {
    width: '1px',
    height: '36px',
    backgroundColor: '#DCE4EC',
  },
  footerBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: '14px',
    border: '1px solid #E2E8F0',
    padding: '16px 22px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '14px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
  },
  footerLeft: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
  },
  footerActionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    borderRadius: '8px',
    border: '1px solid',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  footerSecondaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FFFFFF',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
    transition: 'all 0.15s ease',
  },
  footerDangerGhostBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '9px 16px',
    borderRadius: '8px',
    border: '1px solid #FEE2E2',
    backgroundColor: '#FFF5F5',
    color: '#DC2626',
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  footerPrimaryBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px',
    padding: '9px 20px',
    borderRadius: '8px',
    border: '1px solid #E9B82E',
    backgroundColor: '#FAD465',
    color: '#011F39',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(250, 212, 101, 0.35)',
    transition: 'all 0.15s ease',
  },
  notFoundWrapper: {
    maxWidth: '560px',
    margin: '60px auto',
    textAlign: 'center',
    backgroundColor: '#FFFFFF',
    padding: '40px 30px',
    borderRadius: '16px',
    border: '1px solid #E2E8F0',
    boxShadow: '0 4px 16px rgba(1, 31, 57, 0.06)',
  },
  notFoundTitle: {
    fontFamily: '"Playfair Display", Georgia, serif',
    fontSize: '22px',
    color: '#011F39',
    margin: '0 0 8px',
  },
  notFoundText: {
    fontSize: '14px',
    color: '#64748B',
    margin: '0 0 24px',
  },
  returnBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '10px 22px',
    backgroundColor: '#011F39',
    color: '#FFFFFF',
    borderRadius: '8px',
    border: 'none',
    fontWeight: 600,
    fontSize: '14px',
    cursor: 'pointer',
  },
};
