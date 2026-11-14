import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserAuth } from '../store/userAuthStore';
import { executeSignOut } from '@/features/auth/store/authStore';
import { Bell, User, LogOut, ChevronDown, Heart, Menu } from 'lucide-react';
import { HrsjmLogo } from '@/components/common/HrsjmLogo';
import { getValidAvatarUrl } from '@/utils/avatar';

interface UserHeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
  onOpenDonate?: () => void;
  onOpenNotifications?: () => void;
  onOpenProfile?: () => void;
}

export const UserHeader: React.FC<UserHeaderProps> = ({
  onToggleSidebar,
  isSidebarOpen,
  onOpenDonate,
  onOpenNotifications,
  onOpenProfile,
}) => {
  const navigate = useNavigate();
  const { user, unreadNotificationsCount } = useUserAuth();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [imgError, setImgError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const validAvatarUrl = getValidAvatarUrl(user?.avatar);

  useEffect(() => {
    setImgError(false);
  }, [user?.avatar]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const initials = (user?.full_name ?? user?.email ?? 'Member')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part: string) => part[0]?.toUpperCase())
    .join('') || 'U';

  const handleDonate = () => {
    if (onOpenDonate) {
      onOpenDonate();
    } else {
      navigate('/donations');
    }
  };

  const handleNotifications = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      navigate('/user/notifications');
    }
  };

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await executeSignOut(navigate);
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-xs select-none">
      {/* Primary Top Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-[68px] flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Hamburger Menu & Brand Logo & Wordmark */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onToggleSidebar && (
            <button
              type="button"
              onClick={onToggleSidebar}
              className="p-2 -ml-1.5 sm:ml-0 rounded-xl text-[#06294D] hover:bg-slate-100 hover:text-[#011F39] active:scale-95 transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#06294D]/20 shrink-0"
              aria-label="Toggle navigation menu"
              aria-expanded={isSidebarOpen}
            >
              <Menu size={22} strokeWidth={2.2} />
            </button>
          )}

          <Link
            to="/user/dashboard"
            className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer min-w-0"
            aria-label="HRSJM Home"
          >
            <HrsjmLogo size="sm" variant="dark" showWordmark={false} />
            <div className="flex flex-col min-w-0">
              <span className="text-[16px] sm:text-[18px] font-black tracking-tight text-[#06294D] leading-none shrink-0">
                HRSJM
              </span>
              <span className="text-[7.5px] sm:text-[8px] font-bold text-slate-500 uppercase tracking-wider leading-tight mt-0.5 truncate hidden min-[480px]:block">
                HUMAN RIGHTS AND SOCIAL JUSTICE MISSION
              </span>
              <span className="text-[8.5px] sm:text-[9.5px] font-semibold text-[#06294D] leading-tight truncate hidden min-[480px]:block">
                मानव अधिकार • सामाजिक न्याय
              </span>
            </div>
          </Link>
        </div>

        {/* Right Actions: Donate + Notifications + Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Gold Donate Button */}
          <button
            type="button"
            onClick={handleDonate}
            className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-[13px] font-extrabold text-[#011F39] bg-[#E9B82E] hover:bg-[#d8a825] transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
            aria-label="Donate to HRSJM"
          >
            <Heart size={14} className="fill-[#011F39]" />
            <span>Donate</span>
          </button>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={handleNotifications}
            className="relative p-2 rounded-full text-[#0B2F52] hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            aria-label={`Notifications, ${unreadNotificationsCount} unread`}
          >
            <Bell size={21} strokeWidth={2} />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center ring-2 ring-white">
                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
              </span>
            )}
          </button>

          {/* Profile Avatar & Dropdown */}
          <div className="relative shrink-0" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(prev => !prev)}
              className="flex items-center gap-1 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="User Account Menu"
              aria-expanded={dropdownOpen}
            >
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold ring-2 ring-slate-100 overflow-hidden">
                {validAvatarUrl && !imgError ? (
                  <img
                    src={validAvatarUrl}
                    alt=""
                    onError={() => setImgError(true)}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </div>
              <ChevronDown size={14} className="text-slate-500" />
            </button>

            {/* Profile Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="text-xs font-extrabold text-[#06294D] truncate">
                    {user?.full_name || 'HRSJM Member'}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate mt-0.5">
                    {user?.email || 'member@hrsjm.org'}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded text-[9.5px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200 mt-1.5">
                    {user?.account_type || 'User'}
                  </span>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    onClick={() => {
                      setDropdownOpen(false);
                      if (onOpenProfile) onOpenProfile();
                      else navigate('/user/profile');
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 text-left cursor-pointer"
                  >
                    <User size={15} className="text-blue-700" />
                    <span>View Profile</span>
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left cursor-pointer"
                  >
                    <LogOut size={15} className="text-rose-600" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
