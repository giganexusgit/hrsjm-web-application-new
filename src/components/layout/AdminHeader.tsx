import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { executeSignOut } from '@/features/auth/store/authStore';
import {
  Menu,
  Bell,
  ChevronDown,
  User,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { ADMIN_NAV_GROUPS } from './adminNavItems';
import { useProfile } from '@/features/admin/profile/store/profileStore';
import { useUnreadCount } from '@/features/admin/notifications/store/notificationsStore';
import { getValidAvatarUrl } from '@/utils/avatar';

interface AdminHeaderProps {
  onToggleMobileSidebar: () => void;
  onToggleDesktopCollapse: () => void;
  collapsed: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onToggleMobileSidebar,
  onToggleDesktopCollapse,
  collapsed,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const unreadCount = useUnreadCount();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const validAvatarUrl = getValidAvatarUrl(profile?.avatar);

  useEffect(() => {
    setImgError(false);
  }, [profile?.avatar]);

  // Close dropdown when clicking outside
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
    for (const group of ADMIN_NAV_GROUPS) {
      for (const item of group.items) {
        if (location.pathname.startsWith(item.path)) {
          return item.title;
        }
      }
    }
    return 'Admin Dashboard';
  }, [location.pathname]);

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    await executeSignOut(navigate);
  };

  return (
    <header style={styles.header}>
      {/* Left Section: Mobile Menu Button & Title / Breadcrumb */}
      <div style={styles.leftSection}>
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

        <div style={styles.titleWrap}>
          <div style={styles.breadcrumb}>
            <span style={styles.breadcrumbRoot}>HRSJM Admin</span>
            <span style={styles.breadcrumbSep}>/</span>
            <span style={styles.breadcrumbCurrent}>{currentTitle}</span>
          </div>
          <h1 style={styles.pageHeading}>{currentTitle}</h1>
        </div>
      </div>

      {/* Right Section: Notifications & Admin Profile */}
      <div style={styles.rightSection}>
        {/* Notifications Bell */}
        <button
          type="button"
          onClick={() => navigate('/admin/notifications')}
          style={styles.iconBtn}
          aria-label={`Notifications (${unreadCount} unread)`}
          title="Notifications"
        >
          <Bell size={20} color="#06294D" />
          {unreadCount > 0 && (
            <span style={styles.unreadDot}>{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        <div style={styles.divider} />

        {/* Profile Avatar & Dropdown */}
        <div style={styles.profileContainer} ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setProfileDropdownOpen((prev) => !prev)}
            style={styles.profileBtn}
            aria-expanded={profileDropdownOpen}
            aria-haspopup="true"
          >
            {/* Avatar with Navy & Gold Ring */}
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
                    {(profile.fullName || 'AD').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div style={styles.profileInfo}>
              <span style={styles.profileName}>{profile.fullName || 'Admin Officer'}</span>
              <span style={styles.profileRole}>{profile.role || 'Super Admin'}</span>
            </div>

            <ChevronDown size={14} color="#718096" />
          </button>

          {/* Dropdown Menu */}
          {profileDropdownOpen && (
            <div style={styles.dropdownMenu}>
              <div style={styles.dropdownHeader}>
                <p style={styles.dropdownAdminName}>{profile.fullName || 'Admin Officer'}</p>
                <p style={styles.dropdownAdminEmail}>{profile.email || 'admin@hrsjm.org'}</p>
                <div style={styles.badgeWrap}>
                  <ShieldCheck size={12} color="#047857" />
                  <span style={styles.badgeText}>Verified Administrator</span>
                </div>
              </div>

              <div style={styles.dropdownDivider} />

              <button
                type="button"
                style={styles.dropdownItem}
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/admin/profile');
                }}
              >
                <User size={16} color="#06294D" />
                <span>My Profile & ID Card</span>
              </button>

              <button
                type="button"
                style={styles.dropdownItem}
                onClick={() => {
                  setProfileDropdownOpen(false);
                  navigate('/admin/settings');
                }}
              >
                <Settings size={16} color="#06294D" />
                <span>Settings & Preferences</span>
              </button>

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
  titleWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '11.5px',
    color: '#718096',
    fontWeight: 500,
  },
  breadcrumbRoot: {
    color: '#174A78',
  },
  breadcrumbSep: {
    color: '#CBD5E1',
  },
  breadcrumbCurrent: {
    color: '#34516D',
  },
  pageHeading: {
    fontSize: '18px',
    fontWeight: 700,
    color: '#0B2F52',
    margin: 0,
    lineHeight: 1.2,
  },
  rightSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  iconBtn: {
    position: 'relative',
    background: '#FAF7F0',
    border: '1px solid #DCE4EC',
    borderRadius: '8px',
    padding: '8px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.15s',
  },
  unreadDot: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    minWidth: '16px',
    height: '16px',
    padding: '0 4px',
    backgroundColor: '#DC2626',
    borderRadius: '8px',
    border: '1.5px solid #FFFFFF',
    color: '#FFFFFF',
    fontSize: '9.5px',
    fontWeight: 700,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxSizing: 'border-box',
  },
  divider: {
    width: '1px',
    height: '28px',
    backgroundColor: '#E2E8F0',
  },
  profileContainer: {
    position: 'relative',
  },
  profileBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 6px',
    borderRadius: '8px',
    transition: 'background-color 0.15s',
  },
  avatarRing: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    padding: '2px',
    background: 'linear-gradient(135deg, #FAD465, #06294D)',
  },
  avatarCore: {
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    backgroundColor: '#06294D',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitials: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#FAD465',
    letterSpacing: '0.04em',
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column',
    textAlign: 'left',
  },
  profileName: {
    fontSize: '13px',
    fontWeight: 600,
    color: '#0B2F52',
    lineHeight: 1.2,
  },
  profileRole: {
    fontSize: '11px',
    fontWeight: 500,
    color: '#718096',
  },
  dropdownMenu: {
    position: 'absolute',
    right: 0,
    top: 'calc(100% + 8px)',
    width: '230px',
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #DCE4EC',
    boxShadow: '0 10px 25px -5px rgba(1, 31, 57, 0.15)',
    zIndex: 50,
    padding: '6px 0',
    animation: 'fadeIn 0.15s ease-out',
  },
  dropdownHeader: {
    padding: '12px 16px',
    backgroundColor: '#FAF7F0',
  },
  dropdownAdminName: {
    margin: 0,
    fontSize: '13.5px',
    fontWeight: 700,
    color: '#0B2F52',
  },
  dropdownAdminEmail: {
    margin: '2px 0 6px 0',
    fontSize: '11.5px',
    color: '#718096',
  },
  badgeWrap: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: '#ECFDF5',
    padding: '2px 8px',
    borderRadius: '999px',
  },
  badgeText: {
    fontSize: '10.5px',
    fontWeight: 600,
    color: '#047857',
  },
  dropdownDivider: {
    height: '1px',
    backgroundColor: '#E2E8F0',
    margin: '4px 0',
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '9px 16px',
    border: 'none',
    background: 'none',
    color: '#34516D',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.15s',
  },
};

