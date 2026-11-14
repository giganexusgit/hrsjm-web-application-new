import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth, resolveUserDestination } from '@/features/auth/store/authStore';
import { authService } from '@/features/auth/services/authService';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AppErrorBoundary } from '../common/AppErrorBoundary';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const hasToken = Boolean(authService.getAuthToken());
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  // Auto-collapse sidebar on smaller screens & track isMobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!isAuthenticated && !hasToken) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Prevent non-admin users from accessing the admin portal; route to their designated portal
  if (!isAdmin) {
    const currentUser = user || authService.getCurrentUser();
    const destination = resolveUserDestination(currentUser);
    const safeDestination = destination.startsWith('/admin') ? '/user/dashboard' : destination;
    return <Navigate to={safeDestination} replace />;
  }

  const sidebarWidth = isMobile ? 0 : collapsed ? 74 : 268;

  return (
    <div style={styles.layoutWrapper}>
      {/* Slide-in / Collapsible Sidebar - Truly Fixed */}
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main App Container with fixed sidebar offset */}
      <div
        style={{
          ...styles.mainContainer,
          marginLeft: `${sidebarWidth}px`,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`,
          transition: 'margin-left 0.22s cubic-bezier(0.4, 0, 0.2, 1), width 0.22s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {/* Top Header */}
        <AdminHeader
          onToggleMobileSidebar={() => setMobileOpen((o) => !o)}
          onToggleDesktopCollapse={() => setCollapsed((c) => !c)}
          collapsed={collapsed}
        />

        {/* Dynamic Page Outlet with Responsive Container */}
        <main style={styles.contentArea}>
          <div style={styles.contentInner} className="admin-content-inner">
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
    minHeight: '100vh',
    backgroundColor: '#FAF7F0',
    width: '100%',
    position: 'relative',
  },
  mainContainer: {
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    backgroundColor: '#FAF7F0',
    minHeight: '100vh',
    overflowX: 'clip',
  },
  contentArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 'calc(100vh - 68px)',
    minWidth: 0,
  },
  contentInner: {
    flex: 1,
    maxWidth: '1600px',
    width: '100%',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    minWidth: 0,
    padding: '1.25rem 1.5rem',
  },
};

export default AdminLayout;
