import React, { useState, useRef, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  House,
  FileText,
  Scale,
  Calendar,
  MessageSquare,
  User,
  Bell,
  Phone,
  LogOut,
  CreditCard,
  PlusCircle,
  AlertCircle,
  ChevronLeft,
  ShieldCheck,
} from 'lucide-react';
import { AppErrorBoundary } from '../../../components/common/AppErrorBoundary';
import { useAuth, executeSignOut, resolveUserDestination } from '../../auth/store/authStore';
import { authService } from '../../auth/services/authService';
import { Navigate } from 'react-router-dom';
import { useSeekerStore } from '../store/seekerStore';
import { SeekerBottomNav } from './SeekerBottomNav';

interface NavItem {
  name: string;
  path: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string; strokeWidth?: number; color?: string }>;
}

const SEEKER_SIDEBAR_ITEMS: NavItem[] = [
  { name: 'home', path: '/seeker/home', label: 'Home Dashboard', icon: House },
  { name: 'requests', path: '/seeker/requests', label: 'My Aid Tracker', icon: FileText },
  { name: 'apply', path: '/seeker/apply', label: 'Apply for Aid', icon: PlusCircle },
  { name: 'rights', path: '/seeker/rights', label: 'Know Your Rights', icon: Scale },
  { name: 'events', path: '/seeker/events', label: 'Events & Camps', icon: Calendar },
  { name: 'support', path: '/seeker/support', label: 'Helpdesk & Support', icon: MessageSquare },
  { name: 'complaint', path: '/seeker/complaint', label: 'File Grievance', icon: AlertCircle },
  { name: 'profile', path: '/seeker/profile', label: 'My Profile & Settings', icon: User },
  { name: 'id-card', path: '/seeker/profile/id-card', label: 'Digital Seeker ID', icon: CreditCard },
  { name: 'notifications', path: '/seeker/notifications', label: 'Notifications', icon: Bell },
];

export const SeekerLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, isSeeker, isAdmin } = useAuth();
  const hasToken = Boolean(authService.getAuthToken());
  const { notifications, loadAll } = useSeekerStore();

  const [desktopCollapsed, setDesktopCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadAll();
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Close mobile drawer on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSignOut = async () => {
    setProfileDropdownOpen(false);
    setMobileDrawerOpen(false);
    await executeSignOut(navigate);
  };

  const openWhatsAppHelpline = () => {
    const phone = '919888880004';
    const text = encodeURIComponent('Hello HRSJM, I need emergency social & legal assistance.');
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank');
  };

  const handleToggleHamburger = () => {
    if (window.innerWidth < 1024) {
      setMobileDrawerOpen((prev) => !prev);
    } else {
      setDesktopCollapsed((prev) => !prev);
    }
  };

  const isItemActive = (path: string) => {
    if (path === '/seeker/home') {
      return location.pathname === '/seeker/home' || location.pathname === '/seeker';
    }
    if (path === '/seeker/profile') {
      return location.pathname === '/seeker/profile';
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  if (!isAuthenticated && !hasToken) {
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Prevent non-seekers and non-admins from entering the seeker portal
  if (!isSeeker && !isAdmin) {
    const currentUser = user || authService.getCurrentUser();
    const destination = resolveUserDestination(currentUser);
    const safeDestination = destination.startsWith('/seeker') ? '/user/dashboard' : destination;
    return <Navigate to={safeDestination} replace />;
  }

  const userInitial = user?.full_name?.charAt(0)?.toUpperCase() || 'S';

  return (
    <div className="min-h-screen bg-[#FAF7F0] flex flex-col font-['Inter',sans-serif]">
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileDrawerOpen && (
        <div
          className="fixed inset-0 bg-[#011F39]/65 backdrop-blur-xs z-40 transition-opacity"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* LEFT SIDEBAR (Desktop Fixed/Collapsible + Mobile Slide-Out Drawer) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-[#06294D] text-white flex flex-col border-r border-[#123F68] shadow-xl transition-all duration-200 ease-in-out ${
          mobileDrawerOpen
            ? 'sidebar-mobile-open translate-x-0 w-72'
            : '-translate-x-full lg:translate-x-0 w-64'
        } ${desktopCollapsed ? 'lg:w-20' : 'lg:w-64'}`}
        aria-label="Donation Seeker Sidebar Navigation"
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-3.5 border-b border-[#123F68] flex items-center justify-between shrink-0 bg-[#06294D]">
          {desktopCollapsed && !mobileDrawerOpen ? (
            <div className="w-full flex items-center justify-center">
              <button
                type="button"
                onClick={() => setDesktopCollapsed(false)}
                className="p-1 rounded-xl hover:bg-white/10 transition cursor-pointer flex flex-col items-center justify-center"
                title="Click to expand sidebar"
              >
                <span className="text-sm font-black tracking-wider text-white">HRSJM</span>
                <span className="text-[7.5px] font-bold text-[#FAD465] uppercase">Seeker</span>
              </button>
            </div>
          ) : (
            <>
              <NavLink
                to="/seeker/home"
                onClick={() => {
                  if (mobileDrawerOpen) setMobileDrawerOpen(false);
                }}
                className="flex items-center gap-3 overflow-hidden flex-1 min-w-0 group cursor-pointer"
                title="HRSJM Donation Seeker Portal"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-white font-['Playfair_Display',Georgia,serif] leading-tight tracking-wide truncate group-hover:text-[#FAD465] transition">
                    HRSJM
                  </div>
                  <div className="text-[10px] font-bold tracking-wider text-[#FAD465] uppercase truncate">
                    Seeker Portal
                  </div>
                </div>
              </NavLink>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="lg:hidden p-1.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Close Sidebar"
              >
                <X size={20} />
              </button>

              {/* Desktop Collapse Arrow Button */}
              <button
                type="button"
                onClick={() => setDesktopCollapsed(true)}
                className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition cursor-pointer shrink-0 ml-1"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}
        </div>

        {/* Navigation Links List */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1">
          {(!desktopCollapsed || mobileDrawerOpen) && (
            <div className="text-[10px] font-bold text-[#A0AEC0] uppercase px-3 py-1 tracking-wider">
              Navigation
            </div>
          )}

          {SEEKER_SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item.path);

            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => {
                  if (mobileDrawerOpen) setMobileDrawerOpen(false);
                }}
                title={desktopCollapsed && !mobileDrawerOpen ? item.label : undefined}
                className={`relative flex items-center rounded-xl text-xs font-semibold cursor-pointer transition select-none ${
                  desktopCollapsed && !mobileDrawerOpen
                    ? 'justify-center p-3'
                    : 'justify-between px-3.5 py-2.5'
                } ${
                  active
                    ? 'bg-[#123F68] text-[#FAD465] font-bold shadow-xs'
                    : 'text-[#DBE5EE] hover:text-white hover:bg-white/10'
                }`}
              >
                {/* Active Indicator Left Strip */}
                {active && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#FAD465] rounded-r" />
                )}

                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    size={18}
                    className={`shrink-0 ${
                      active ? 'text-[#FAD465]' : 'text-[#DBE5EE]'
                    }`}
                  />
                  {(!desktopCollapsed || mobileDrawerOpen) && (
                    <span
                      className={`truncate ${
                        active ? 'text-[#FAD465] font-bold' : 'text-[#DBE5EE]'
                      }`}
                    >
                      {item.label}
                    </span>
                  )}
                </div>

                {(!desktopCollapsed || mobileDrawerOpen) && (
                  <div className="flex items-center gap-1.5 shrink-0 ml-2">
                    {item.name === 'notifications' && unreadCount > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                        {unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}

          {/* 24x7 Helpline Box (Expanded Only) */}
          {(!desktopCollapsed || mobileDrawerOpen) && (
            <div className="pt-3 px-1">
              <div className="bg-[#0B2F52] border border-[#174A78] rounded-xl p-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#FAD465]">
                  <Phone size={13} />
                  <span>24x7 Helpline</span>
                </div>
                <div className="text-[11px] text-gray-300 mt-1 leading-relaxed">
                  Urgent humanitarian, medical or legal relief.
                </div>
                <button
                  type="button"
                  onClick={openWhatsAppHelpline}
                  className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <Phone size={12} />
                  <span>+91 98888 80004</span>
                </button>
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer / Sign Out */}
        <div className="p-2 border-t border-[#123F68] bg-[#041D35] shrink-0">
          <button
            type="button"
            onClick={handleSignOut}
            title={desktopCollapsed && !mobileDrawerOpen ? 'Sign Out' : undefined}
            className={`w-full flex items-center rounded-xl text-rose-300 hover:text-white hover:bg-rose-900/40 text-xs font-bold transition cursor-pointer ${
              desktopCollapsed && !mobileDrawerOpen
                ? 'justify-center p-3'
                : 'justify-center gap-2 py-2 px-3'
            }`}
          >
            <LogOut size={16} />
            {(!desktopCollapsed || mobileDrawerOpen) && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT WRAPPER */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-200 ease-in-out ${
          desktopCollapsed ? 'lg:ml-20' : 'lg:ml-64'
        }`}
      >
        {/* TOP HEADER (Exact APK AdminHeader Replication: White bar, 56px, Brand in center, Bell & Avatar right) */}
        <header className="bg-white border-b border-[#DCE4EC] sticky top-0 z-30 shadow-xs min-h-[56px] flex items-center">
          <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14">
              {/* Left Section: Hamburger Bar Button */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleToggleHamburger}
                  className="p-2 -ml-2 rounded-xl text-[#06294D] hover:bg-[#EDF2F7] active:bg-[#DBE5EE] transition cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#FAD465]"
                  aria-label="Toggle Navigation Menu"
                  title="Toggle Navigation Menu"
                >
                  <Menu size={22} className="text-[#06294D]" />
                </button>

                <NavLink to="/seeker/home" className="flex items-center gap-2.5">
                  <div>
                    <div className="text-[10px] font-bold tracking-widest text-[#06294D] uppercase">
                      HUMANITARIAN ASSISTANCE
                    </div>
                    <div className="text-sm font-bold text-[#0B2F52] font-['Playfair_Display',Georgia,serif] leading-tight">
                      Donation Seeker Portal
                    </div>
                  </div>
                </NavLink>

                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-[#EDF2F7] text-[#06294D] border border-[#DBE5EE]">
                  Beneficiary
                </span>
              </div>

              {/* Right Section: 24x7 Helpline CTA, Notification Bell & User Profile Menu */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Emergency Helpline CTA */}
                <button
                  type="button"
                  onClick={openWhatsAppHelpline}
                  className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF9E6] border border-[#FAD465] text-[#06294D] text-xs font-bold hover:bg-[#FEF08A] transition cursor-pointer"
                  title="24x7 Social & Legal Helpline on WhatsApp"
                >
                  <Phone size={13} className="text-[#0D47A1]" />
                  <span>24x7 Helpline: +91 98888 80004</span>
                </button>

                {/* Apply For Aid Quick Button */}
                <NavLink
                  to="/seeker/apply"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAD465] hover:bg-[#E9B82E] active:bg-[#C9971A] text-[#011F39] text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <PlusCircle size={14} />
                  <span className="hidden sm:inline">Apply for Aid</span>
                  <span className="sm:hidden">Apply</span>
                </NavLink>

                {/* Notification Bell with Badge */}
                <NavLink
                  to="/seeker/notifications"
                  className="relative p-2 rounded-xl text-[#0B2F52] hover:bg-[#EDF2F7] transition cursor-pointer"
                  aria-label="View notifications"
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 min-w-[16px] h-4 bg-[#DC2626] text-white rounded-full text-[9px] font-bold px-1 flex items-center justify-center border-1.5 border-white">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>

                {/* Profile Avatar & Dropdown (APK AdminHeader style) */}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#EDF2F7] transition cursor-pointer"
                    aria-expanded={profileDropdownOpen}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#06294D] text-[#FAD465] flex items-center justify-center font-bold text-xs shadow-xs border border-[#FAD465]/40">
                      {userInitial}
                    </div>
                    <span className="text-xs font-semibold text-[#0B2F52] hidden lg:block max-w-[120px] truncate">
                      {user?.full_name || 'Seeker'}
                    </span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#DCE4EC] py-2 z-50 text-xs">
                      <div className="px-4 py-3 border-b border-[#DBE5EE]">
                        <div className="font-bold text-[#0B2F52] text-sm truncate">
                          {user?.full_name || 'HRSJM Seeker'}
                        </div>
                        <div className="text-[#718096] text-[11px] truncate mt-0.5">
                          {user?.email || user?.mobile_number || 'seeker@hrsjm.org'}
                        </div>
                        <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-[#ECFDF5] text-[#10B981] border border-[#A7F3D0]">
                          <ShieldCheck size={11} />
                          <span>Assistance Seeker Account</span>
                        </div>
                      </div>

                      <div className="py-1">
                        <NavLink
                          to="/seeker/profile"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#EDF2F7] text-[#34516D] cursor-pointer"
                        >
                          <User size={15} className="text-[#06294D]" />
                          <span>My Profile & Settings</span>
                        </NavLink>

                        <NavLink
                          to="/seeker/profile/id-card"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#EDF2F7] text-[#34516D] cursor-pointer"
                        >
                          <CreditCard size={15} className="text-[#06294D]" />
                          <span>View Seeker ID Card</span>
                        </NavLink>

                        <NavLink
                          to="/seeker/requests"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#EDF2F7] text-[#34516D] cursor-pointer"
                        >
                          <FileText size={15} className="text-[#06294D]" />
                          <span>My Applications Tracker</span>
                        </NavLink>

                        <NavLink
                          to="/seeker/support"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#EDF2F7] text-[#34516D] cursor-pointer"
                        >
                          <MessageSquare size={15} className="text-[#06294D]" />
                          <span>Helpdesk & Support</span>
                        </NavLink>
                      </div>

                      <div className="border-t border-[#DBE5EE] pt-1">
                        <button
                          type="button"
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold cursor-pointer text-left"
                        >
                          <LogOut size={15} />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Body with Error Boundary */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-24 lg:pb-12">
          <AppErrorBoundary key={location.pathname}>
            <Outlet key={location.pathname} />
          </AppErrorBoundary>
        </main>

        {/* Footer */}
        <footer className="bg-[#011F39] text-white border-t border-[#123F68] py-8 text-xs text-gray-400">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div>
                <div className="text-white font-bold text-sm">Human Rights & Social Justice Mission</div>
                <div className="text-[11px] text-gray-400">
                  Registered Social Welfare NGO • Dedicated to Constitutional Liberties & Humanitarian Aid
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-gray-300">
              <NavLink to="/seeker/rights" className="hover:text-[#FAD465] cursor-pointer">
                Know Your Rights
              </NavLink>
              <NavLink to="/seeker/support" className="hover:text-[#FAD465] cursor-pointer">
                Helpdesk & Grievance
              </NavLink>
              <button
                type="button"
                onClick={openWhatsAppHelpline}
                className="text-[#FAD465] font-semibold hover:underline cursor-pointer"
              >
                24x7 Helpline: +91 98888 80004
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Exact APK SeekerTabNavigator Parity) */}
      <SeekerBottomNav />
    </div>
  );
};
