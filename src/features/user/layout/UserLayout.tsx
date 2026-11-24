import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { UserHeader } from './UserHeader';
import { UserSidebar } from './UserSidebar';
import { UserBottomNav } from './UserBottomNav';
import { AppErrorBoundary } from '../../../components/common/AppErrorBoundary';

export const UserLayout: React.FC = () => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Auto-collapse sidebar on smaller laptop/tablet screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 1024) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
      if (window.innerWidth >= 768) {
        setMobileOpen(false);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 768) {
      setMobileOpen(prev => !prev);
    } else {
      setCollapsed(prev => !prev);
    }
  };

  return (
    <div className="min-h-screen flex bg-[#FAF7F0] text-slate-800 antialiased">
      {/* User Sidebar Navigation (Fixed on viewport) */}
      <UserSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(prev => !prev)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* Main Content Area (Dynamically margins away from fixed sidebar) */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-[margin] duration-300 ease-in-out ${
          collapsed ? 'md:ml-[74px]' : 'md:ml-[268px]'
        }`}
      >
        {/* Top Header with Hamburger Toggle */}
        <UserHeader
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={mobileOpen || !collapsed}
        />

        {/* Dynamic Page Outlet with Error Boundary */}
        <main className="flex-1 pb-16 md:pb-8">
          <AppErrorBoundary key={location.pathname}>
            <Outlet key={location.pathname} />
          </AppErrorBoundary>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Preserved for < 768px viewports) */}
      <UserBottomNav />
    </div>
  );
};
