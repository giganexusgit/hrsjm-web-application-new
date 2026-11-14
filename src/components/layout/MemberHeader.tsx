import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { executeSignOut, useAuth } from '@/features/auth/store/authStore';
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  IdCard,
  Award,
  RefreshCw,
  LogOut,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ExternalLink,
  Heart,
} from 'lucide-react';
import { MEMBER_NAV_GROUPS } from './memberNavItems';
import { useCurrentMember } from '../../features/member/store/memberStore';
import { useMemberUnreadCount } from '../../features/member/store/memberNotificationsStore';
import { HrsjmLogo } from '../common/HrsjmLogo';
import { getValidAvatarUrl } from '@/utils/avatar';

interface MemberHeaderProps {
  onToggleMobileSidebar: () => void;
  onToggleDesktopCollapse: () => void;
  collapsed: boolean;
}

export const MemberHeader: React.FC<MemberHeaderProps> = ({
  onToggleMobileSidebar,
  onToggleDesktopCollapse,
  collapsed,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin } = useAuth();
  const { member } = useCurrentMember();
  const unreadCount = useMemberUnreadCount();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const validAvatarUrl = getValidAvatarUrl(member.avatarUrl);

  useEffect(() => {
    setImgError(false);
  }, [member.avatarUrl]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute current page title from route
  const currentTitle = React.useMemo(() => {
    for (const group of MEMBER_NAV_GROUPS) {
      for (const item of group.items) {
        if (location.pathname.startsWith(item.path)) {
          return item.title;
        }
      }
    }
    return 'Member Dashboard';
  }, [location.pathname]);

  // Compute status pill
  const getStatusBadge = () => {
    if (member.isExpired) {
      return {
        label: 'EXPIRED',
        color: '#DC2626',
        bg: '#FDEEEF',
        border: '#F87171',
        icon: AlertTriangle,
      };
    }
    if (member.isExpiringSoon) {
      return {
        label: `${member.daysRemaining}d LEFT`,
        color: '#D97706',
        bg: '#FEF6E7',
        border: '#FBBF24',
        icon: Clock,
      };
    }
    return {
      label: 'ACTIVE',
      color: '#16A34A',
      bg: '#EAF7EE',
      border: '#86EFAC',
      icon: CheckCircle2,
    };
  };

  const statusBadge = getStatusBadge();
  const StatusIcon = statusBadge.icon;

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    await executeSignOut(navigate);
  };

  return (
    <header style={styles.header}>
      {/* Left Section: Menu Toggle, Brand Logo (mobile only) & Title */}
      <div style={styles.leftSection}>
        {/* Responsive single menu toggle button */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== 'undefined' && window.innerWidth < 1024) {
              onToggleMobileSidebar();
            } else {
              onToggleDesktopCollapse();
            }
          }}
          style={styles.toggleBtn}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu size={19} color="#06294D" />
        </button>

        {/* Brand logo in header for mobile when sidebar is hidden */}
        <div style={styles.mobileLogo}>
          <HrsjmLogo size="sm" variant="dark" showWordmark={true} subtitle="" />
        </div>

        <div style={styles.titleWrap}>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbRoot}>HRSJM Member</span>
            <span style={styles.breadcrumbSep}>/</span>
            <span style={styles.breadcrumbCurrent}>{currentTitle}</span>
          </div>
          <h1 style={styles.pageHeading}>{currentTitle}</h1>
        </div>
      </div>

      {/* Right Section: Donate Now, Status, Bell & Profile */}
      <div style={styles.rightSection}>
        {/* Member Status Pill */}
        <div
          style={{
            ...styles.statusPill,
            backgroundColor: statusBadge.bg,
            color: statusBadge.color,
            borderColor: statusBadge.border,
          }}
          title={`Valid until ${member.validUpto}`}
        >
          <StatusIcon size={13} color={statusBadge.color} />
          <span>{statusBadge.label}</span>
        </div>

        {/* Donate Now Button */}
        <button
          type="button"
          style={styles.donateBtn}
          onClick={() => navigate('/member/donate')}
          aria-label="Donate Now to Social Causes"
        >
          <Heart size={14} color="#0B2F52" fill="#0B2F52" />
          <span>Donate Now</span>
        </button>

        {/* Notifications Bell with Dynamic Unread Badge */}
        <button
          type="button"
          style={styles.bellBtn}
          onClick={() => navigate('/member/notifications')}
          aria-label={`Member Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
          title="Notifications & Bulletins"
        >
          <Bell size={18} color="#0B2F52" />
          {unreadCount > 0 && (
            <span style={styles.bellBadge}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {/* Member Profile Menu */}
        <div style={styles.profileWrapper} ref={dropdownRef}>
          <button
            type="button"
            style={styles.profileTrigger}
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            aria-expanded={profileDropdownOpen}
            aria-haspopup="true"
          >
            {/* Avatar */}
            <div style={styles.avatarRing}>
              <div style={styles.avatarCore}>
                {validAvatarUrl && !imgError ? (
                  <img
                    src={validAvatarUrl}
                    alt=""
                    onError={() => setImgError(true)}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={styles.avatarInitials}>
                    {(member.fullName || 'MB').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div style={styles.profileInfo}>
              <span style={styles.profileName}>{member.fullName}</span>
              <span style={styles.profileRole}>{member.categoryTitle}</span>
            </div>

            <ChevronDown size={14} color="#718096" />
          </button>

          {/* Profile Dropdown Menu */}
          {profileDropdownOpen && (
            <div style={styles.dropdownMenu}>
              <div style={styles.dropdownHeader}>
                <p style={styles.dropdownMemberName}>{member.fullName}</p>
                <p style={styles.dropdownMemberNumber}>{member.membershipNumber}</p>
                <div style={styles.chapterBadge}>
                  <span>{member.chapter}</span>
                </div>
              </div>

              <div style={styles.dropdownDivider} />

              <button
                type="button"
                style={styles.dropdownItem}
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/member/id-card');
                }}
              >
                <IdCard size={16} color="#06294D" />
                <span>Digital ID Card</span>
              </button>

              <button
                type="button"
                style={styles.dropdownItem}
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/member/certificate');
                }}
              >
                <Award size={16} color="#06294D" />
                <span>Membership Certificate</span>
              </button>

              <button
                type="button"
                style={styles.dropdownItem}
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/member/renew');
                }}
              >
                <RefreshCw size={16} color="#06294D" />
                <span>Renewal Center</span>
              </button>

              <button
                type="button"
                style={styles.dropdownItem}
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/member/profile');
                }}
              >
                <User size={16} color="#06294D" />
                <span>My Profile & KYC Vault</span>
              </button>

              <div style={styles.dropdownDivider} />

              {isAdmin && (
<button
                type="button"
                style={styles.dropdownItem}
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/admin/dashboard');
                }}
              >
                <ExternalLink size={16} color="#06294D" />
                <span>Switch to Admin Portal</span>
              </button>
              )}

              <div style={styles.dropdownDivider} />

              <button
                type="button"
                style={{ ...styles.dropdownItem, color: '#DC2626' }}
                onClick={handleSignOut}
              >
                <LogOut size={16} color="#DC2626" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    height: '68px',
    backgroundColor: '#FFFFFF',
    borderBottom: '1px solid #DCE4EC',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 24px',
    position: 'sticky',
    top: 0,
    zIndex: 30,
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  toggleBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FAF7F0',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  mobileLogo: {
    display: 'none',
    alignItems: 'center',
  },
  titleWrap: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11px',
    lineHeight: 1.2,
    color: '#718096',
    fontWeight: 500,
  },
  breadcrumbRoot: {
    color: '#4A5568',
  },
  breadcrumbSep: {
    color: '#CBD5E0',
  },
  breadcrumbCurrent: {
    color: '#06294D',
    fontWeight: 600,
  },
  pageHeading: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: '#06294D',
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statusPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '5px 12px',
    borderRadius: '999px',
    fontSize: '11.5px',
    fontWeight: 700,
    letterSpacing: '0.04em',
    border: '1px solid',
    textTransform: 'uppercase',
  },
  donateBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#FAD465',
    color: '#0B2F52',
    border: 'none',
    borderRadius: '8px',
    padding: '7px 14px',
    fontSize: '12.5px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(250, 212, 101, 0.3)',
    transition: 'all 0.15s ease',
  },
  bellBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    height: '38px',
    borderRadius: '8px',
    border: '1px solid #DCE4EC',
    backgroundColor: '#FAF7F0',
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  bellBadge: {
    position: 'absolute',
    top: '-3px',
    right: '-3px',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: 700,
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid #FFFFFF',
  },
  profileWrapper: {
    position: 'relative',
  },
  profileTrigger: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '4px 8px 4px 4px',
    borderRadius: '24px',
    border: '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
  },
  avatarRing: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    padding: '1.5px',
    backgroundColor: '#FAD465',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarCore: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: '#06294D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarInitials: {
    color: '#FAD465',
    fontWeight: 700,
    fontSize: '12px',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  profileName: {
    fontSize: '12.5px',
    fontWeight: 600,
    color: '#06294D',
    lineHeight: 1.2,
    maxWidth: '140px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  profileRole: {
    fontSize: '10.5px',
    color: '#718096',
    lineHeight: 1.2,
  },
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    width: '260px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    boxShadow: '0 12px 28px rgba(1, 31, 57, 0.15), 0 2px 6px rgba(0, 0, 0, 0.05)',
    border: '1px solid #DCE4EC',
    padding: '8px',
    zIndex: 50,
  },
  dropdownHeader: {
    padding: '10px 12px 8px',
  },
  dropdownMemberName: {
    margin: 0,
    fontSize: '13.5px',
    fontWeight: 700,
    color: '#06294D',
  },
  dropdownMemberNumber: {
    margin: '2px 0 6px',
    fontSize: '11px',
    color: '#718096',
  },
  chapterBadge: {
    display: 'inline-block',
    fontSize: '10px',
    fontWeight: 600,
    padding: '2px 8px',
    backgroundColor: '#FAF7F0',
    color: '#06294D',
    borderRadius: '4px',
    border: '1px solid #DCE4EC',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#EDF2F7',
    margin: '6px 0',
  },
  dropdownItem: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '8px 12px',
    border: 'none',
    backgroundColor: 'transparent',
    borderRadius: '6px',
    fontSize: '12.5px',
    color: '#34516D',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.12s ease',
  },
};
