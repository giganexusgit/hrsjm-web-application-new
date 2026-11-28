import React, { useState, useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth, resolveUserDestination } from '@/features/auth/store/authStore';
import { authService } from '@/features/auth/services/authService';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { AppErrorBoundary } from '../common/AppErrorBoundary';
import { pushNotificationService, type PushPermissionState } from '@/features/admin/notifications/services/pushNotificationService';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, isAdmin, user } = useAuth();
  const hasToken = Boolean(authService.getAuthToken());
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 1024 : false
  );
  const [pushPermission, setPushPermission] = useState<PushPermissionState>(() =>
    pushNotificationService.getPermission()
  );
  const [dismissedPush, setDismissedPush] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('hrsjm_push_prompt_dismissed') === 'true';
    } catch {
      return false;
    }
  });

  const handleRequestPush = async () => {
    const res = await pushNotificationService.requestPermission();
    setPushPermission(res);
  };

  const handleDismissPush = () => {
    setDismissedPush(true);
    try {
      sessionStorage.setItem('hrsjm_push_prompt_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  // Auto-collapse sidebar on smaller screens & track isMobile
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
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
        {/* Browser Push Notification Permission Prompt */}
        {pushPermission === 'default' && !dismissedPush && (
          <div className="bg-[#011F39] text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 shadow-sm border-b border-[#FAD465]/30 sticky top-0 z-40 animate-fadeIn">
            <div className="flex items-center gap-2 min-w-0">
              <span className="p-1 rounded bg-[#FAD465]/20 text-[#FAD465] text-sm shrink-0">🔔</span>
              <span className="truncate sm:whitespace-normal">
                <strong>Enable Desktop Push Notifications:</strong> Receive real-time alerts for incoming donations, membership applications, and urgent grievances directly on your device.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleRequestPush}
                className="px-3 py-1 bg-[#FAD465] text-[#011F39] font-bold rounded-md hover:bg-[#ffe58f] transition-colors cursor-pointer shadow-xs"
              >
                Allow Notifications
              </button>
              <button
                type="button"
                onClick={handleDismissPush}
                className="px-2 py-1 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>
        )}

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
  },
};

export default AdminLayout;
