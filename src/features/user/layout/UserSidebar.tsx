import type React from 'react';
import { NavLink } from 'react-router-dom';
import { ChevronLeft, ChevronRight, X, LogOut } from 'lucide-react';
import { USER_NAV_GROUPS } from './userNavItems';
import { useUserAuth } from '../store/userAuthStore';
import { executeSignOut } from '@/features/auth/store/authStore';
import { useNavigate } from 'react-router-dom';

interface UserSidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const UserSidebar: React.FC<UserSidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const { unreadNotificationsCount } = useUserAuth();

  return (
    <>
      {/* Mobile Drawer Backdrop Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-[#011F39]/65 backdrop-blur-xs z-[45] md:hidden transition-opacity duration-300"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container: Fully Fixed on Viewport */}
      <aside
        className={`fixed top-0 left-0 h-screen h-[100dvh] bg-[#06294D] text-white flex flex-col border-r border-[#123F68] select-none transition-all duration-300 ease-in-out shrink-0 ${
          mobileOpen
            ? 'z-50 translate-x-0 w-[270px]'
            : '-translate-x-full md:translate-x-0 z-30'
        } ${collapsed ? 'md:w-[74px]' : 'md:w-[268px]'}`}
        aria-label="User navigation sidebar"
      >
        {/* Top Header / Brand Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#123F68] shrink-0">
          <div className="flex items-center gap-3 overflow-hidden">
            {(!collapsed || mobileOpen) ? (
              <div className="flex flex-col truncate">
                <span className="text-base font-black tracking-tight text-white leading-tight">
                  HRSJM
                </span>
                <span className="text-[9.5px] font-bold text-[#FAD465] uppercase tracking-wider leading-tight">
                  User Portal
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full">
                <span className="text-sm font-black tracking-wider text-white">HRSJM</span>
                <span className="text-[8px] font-bold text-[#FAD465] uppercase">Portal</span>
              </div>
            )}
          </div>

          {/* Mobile Close Button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close Sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Navigation Groups */}
        <div data-sidebar="true" className="flex-1 overflow-y-auto py-3 px-2 space-y-4 scrollbar-thin scrollbar-thumb-white/10">
          {USER_NAV_GROUPS.map(group => (
            <div key={group.groupTitle} className="space-y-1">
              {(!collapsed || mobileOpen) ? (
                <div className="px-3 py-1 text-[10px] font-bold text-[#FAD465]/80 uppercase tracking-widest">
                  {group.groupTitle}
                </div>
              ) : (
                <div className="h-px bg-white/10 my-2 mx-1" />
              )}

              <div className="space-y-0.5">
                {group.items.map(item => {
                  const Icon = item.icon;
                  const effectiveBadge =
                    item.id === 'user-notifications' && unreadNotificationsCount > 0
                      ? String(unreadNotificationsCount)
                      : item.badge;

                  return (
                    <NavLink
                      key={item.id}
                      to={item.path}
                      end={item.exact}
                      onClick={() => {
                        if (mobileOpen) onCloseMobile();
                      }}
                      className={({ isActive }) =>
                        `relative flex items-center gap-3 rounded-xl transition-all duration-150 cursor-pointer ${
                          collapsed && !mobileOpen
                            ? 'justify-center p-2.5'
                            : 'px-3 py-2.5'
                        } ${
                          isActive
                            ? 'bg-[#FAD465]/15 text-white font-bold'
                            : 'text-slate-200 hover:bg-white/10 hover:text-white'
                        }`
                      }
                      title={collapsed && !mobileOpen ? item.title : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          {/* Active Indicator Bar on Left */}
                          {isActive && (
                            <div className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r bg-[#FAD465]" />
                          )}

                          <Icon
                            size={18}
                            className={`shrink-0 ${
                              isActive ? 'text-[#FAD465]' : 'text-slate-300'
                            }`}
                            strokeWidth={isActive ? 2.3 : 1.8}
                          />

                          {(!collapsed || mobileOpen) && (
                            <span className="text-[12.5px] whitespace-nowrap flex-1">
                              {item.title}
                            </span>
                          )}

                          {(!collapsed || mobileOpen) && effectiveBadge && (
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-[10px] font-black shrink-0 ${
                                isActive
                                  ? 'bg-[#FAD465] text-[#06294D]'
                                  : 'bg-red-500 text-white'
                              }`}
                            >
                              {effectiveBadge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Sign Out + Desktop Collapse Button */}
        <div className="p-2 border-t border-[#123F68] bg-[#041D37]/70 shrink-0 space-y-1">
          {/* Sign Out Option */}
          <button
            type="button"
            onClick={async () => {
              try {
                if (mobileOpen) onCloseMobile();
                await executeSignOut(navigate);
              } catch (err) {
                console.error('Sign out error:', err);
                localStorage.clear();
                sessionStorage.clear();
                window.location.href = '/login?logout=success';
              }
            }}
            className={`w-full flex items-center gap-3 rounded-xl text-rose-300 hover:bg-rose-500/15 hover:text-rose-200 transition-colors cursor-pointer ${
              collapsed && !mobileOpen ? 'justify-center p-2.5' : 'px-3 py-2 text-xs font-semibold'
            }`}
            title="Sign Out"
          >
            <LogOut size={17} className="shrink-0 text-rose-400" />
            {(!collapsed || mobileOpen) && <span>Sign Out</span>}
          </button>

          {/* Desktop Collapse / Expand Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`hidden md:flex w-full items-center gap-2.5 rounded-xl text-[#FAD465] hover:bg-white/10 transition-colors cursor-pointer ${
              collapsed ? 'justify-center p-2' : 'px-3 py-2 text-xs font-bold'
            }`}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <ChevronRight size={18} />
            ) : (
              <>
                <ChevronLeft size={18} />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};

