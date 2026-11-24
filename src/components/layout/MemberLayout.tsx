import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, Navigate, useLocation } from 'react-router-dom';
import { useAuth, resolveUserDestination } from '@/features/auth/store/authStore';
import { authService } from '@/features/auth/services/authService';
import { MemberSidebar } from './MemberSidebar';
import { MemberHeader } from './MemberHeader';
import { AppErrorBoundary } from '../common/AppErrorBoundary';
import { useCurrentMember } from '../../features/member/store/memberStore';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export const MemberLayout: React.FC = () => {
  const { isAuthenticated, isMember, isAdmin, user } = useAuth();
  const hasToken = Boolean(authService.getAuthToken());
  const location = useLocation();
  const navigate = useNavigate();
  const { member } = useCurrentMember();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse sidebar on smaller screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated && !hasToken) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Prevent non-members and non-admins from accessing the member area
  if (!isMember && !isAdmin) {
    const currentUser = user || authService.getCurrentUser();
    const destination = resolveUserDestination(currentUser);
    const safeDestination = destination.startsWith('/member') ? '/user/dashboard' : destination;
    return <Navigate to={safeDestination} replace />;
  }

  return (
    <div style={styles.layoutWrapper}>
      {/* Slide-in / Collapsible Sidebar */}
      <MemberSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main App Container */}
      <div style={styles.mainContainer}>
        {/* Top Header */}
        <MemberHeader
          onToggleMobileSidebar={() => setMobileOpen((o) => !o)}
          onToggleDesktopCollapse={() => setCollapsed((c) => !c)}
          collapsed={collapsed}
        />

        {/* Expiry Warning Banners (Below Header, before content) */}
        {member.isExpired ? (
          <div style={styles.expiredBanner}>
            <div style={styles.bannerInner}>
              <div style={styles.bannerLeft}>
                <AlertTriangle size={18} color="#DC2626" />
                <span style={styles.bannerText}>
                  <strong>Membership Expired:</strong> Your membership term expired on{' '}
                  {new Date(member.validUpto).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                  . Renew immediately to restore active status and member privileges.
                </span>
              </div>
              <button
                type="button"
                style={styles.bannerBtnDanger}
                onClick={() => navigate('/member/renew')}
              >
                <span>Renew Membership</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : member.isExpiringSoon ? (
          <div style={styles.expiringBanner}>
            <div style={styles.bannerInner}>
              <div style={styles.bannerLeft}>
                <AlertTriangle size={18} color="#D97706" />
                <span style={styles.bannerText}>
                  <strong>Renewal Window Open:</strong> Your membership expires in{' '}
                  <strong>{member.daysRemaining} days</strong> ({member.validUpto}). Renew today to maintain continuity.
                </span>
              </div>
              <button
                type="button"
                style={styles.bannerBtnWarning}
                onClick={() => navigate('/member/renew')}
              >
                <span>Renew Early</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        ) : null}

        {/* Dynamic Page Outlet with Responsive Container */}
        <main style={styles.contentArea}>
          <div style={styles.contentInner} className="member-content-inner">
            <AppErrorBoundary key={location.pathname}>
              <Outlet key={location.pathname} />
            </AppErrorBoundary>
          </div>
        </main>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  layoutWrapper: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: '#FAF7F0',
  },
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    minWidth: 0,
    minHeight: '100vh',
    overflowX: 'hidden',
    backgroundColor: '#FAF7F0',
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto',
  },
  contentInner: {
    maxWidth: '1440px',
    margin: '0 auto',
    width: '100%',
  },
  expiredBanner: {
    backgroundColor: '#FEF2F2',
    borderBottom: '1px solid #FCA5A5',
    padding: '10px 24px',
  },
  expiringBanner: {
    backgroundColor: '#FFFBEB',
    borderBottom: '1px solid #FCD34D',
    padding: '10px 24px',
  },
  bannerInner: {
    maxWidth: '1440px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px',
    flexWrap: 'wrap',
  },
  bannerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  bannerText: {
    fontSize: '13px',
    color: '#1F2937',
    lineHeight: 1.4,
  },
  bannerBtnDanger: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#DC2626',
    color: '#FFFFFF',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
  bannerBtnWarning: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: '#D97706',
    color: '#FFFFFF',
    border: 'none',
    padding: '6px 14px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background-color 0.15s ease',
  },
};

export default MemberLayout;
