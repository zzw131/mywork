import React, { useState, useEffect, useRef } from 'react';
import { UserIdentity } from '../../types';
import { LogIn, LogOut, User, UserCheck, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { WorkbenchLogo } from './WorkbenchLogo';
import { AppView } from '../../types/resource';

interface V4HeaderProps {
  identity: UserIdentity;
  onLogin: () => void;
  onLogout: () => void;
  totalCount: number;
  activeView?: AppView;
  onSelectView?: (view: AppView) => void;
  onToggleMobileSidebar?: () => void;
}

export const V4Header: React.FC<V4HeaderProps> = ({
  identity,
  onLogin,
  onLogout,
  totalCount,
  activeView = 'workbench',
  onSelectView,
  onToggleMobileSidebar,
}) => {
  const isOwner = identity.role === 'owner';
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside or ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="w-full bg-[#FFFFFF] border-b-2 border-[#171717] sticky top-0 z-40">
      <div className="w-full px-4 sm:px-6 py-2.5 sm:py-3 min-h-[60px] flex items-center justify-between gap-3">
        {/* Left: Brand & Mobile Sidebar Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Mobile Sidebar Toggle Button */}
          {onToggleMobileSidebar && (
            <button
              type="button"
              onClick={onToggleMobileSidebar}
              className="md:hidden flex items-center justify-center p-2 bg-[#FBF7EF] hover:bg-[#FFD84D] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              title="展开页面工具栏"
              aria-label="展开页面工具栏"
            >
              <SlidersHorizontal className="w-4 h-4 text-[#171717]" />
            </button>
          )}

          <div
            onClick={() => onSelectView?.('workbench')}
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer select-none group"
          >
            <WorkbenchLogo className="w-[36px] h-[36px] sm:w-[40px] sm:h-[40px] group-hover:rotate-6 transition-transform" />
            <div className="flex flex-col justify-center gap-0.5">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold tracking-tight text-[#171717] leading-tight font-sans">
                  Personal Workbench
                </h1>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#EDE8DC] border border-[#171717] rounded leading-none">
                  v1.0
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-[#5F5E5A] font-medium leading-tight font-mono">
                <span>邹大炮的工作台</span>
                <span className="text-[#888780]">·</span>
                <span className="inline-flex items-center gap-1 text-[#171717]">
                  <span className="font-bold">{totalCount}</span> 个入口
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: User Avatar Menu (No green dot on avatar) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* PGlite Connection Status Indicator */}
          <div className="relative group flex items-center justify-center shrink-0">
            <div
              className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-[#F3EFE6] transition-colors select-none cursor-pointer"
              tabIndex={0}
              role="status"
              aria-label="连接状态：正常运行"
            >
              <span className="relative flex h-2.5 w-2.5 items-center justify-center">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10B981]" />
              </span>
            </div>

            {/* Hover Tooltip - Popover */}
            <div className="absolute top-full right-0 mt-2 hidden group-hover:flex group-focus-within:flex flex-col gap-1 px-3 py-2 bg-[#FFFFFF] border-2 border-[#171717] rounded-lg shadow-[3px_3px_0_#171717] z-50 pointer-events-none whitespace-nowrap text-left animate-in fade-in zoom-in-95 duration-100 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse" />
                <span className="text-xs font-bold text-[#171717]">PGlite 数据库：已连接</span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-[#A9E5C3] border border-[#171717] rounded leading-none">
                  正常
                </span>
              </div>
              <div className="text-[11px] text-[#5F5E5A] flex items-center gap-1.5 pt-1 border-t border-[#EDE8DC]">
                <span>本地零延迟极速响应</span>
              </div>
            </div>
          </div>

          {/* User Avatar Menu (No green light on avatar) */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              data-testid="user-menu-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="用户与设置中心"
              title={isOwner ? '邹大炮 (Owner) · 点击展开菜单' : '访客 (Guest) · 点击展开菜单'}
              className={`relative h-9 sm:h-10 px-3 flex items-center gap-2 rounded-xl border-2 border-[#171717] transition-all cursor-pointer shadow-[2px_2px_0_#171717] hover:shadow-[3px_3px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 ${
                isOwner
                  ? 'bg-[#FFF9E6] hover:bg-[#FFD84D]'
                  : 'bg-[#FFFFFF] hover:bg-[#FBF7EF]'
              } ${menuOpen ? 'translate-x-0.5 translate-y-0.5 shadow-[1px_1px_0_#171717]' : ''}`}
            >
              <div className="relative flex items-center justify-center">
                {isOwner ? (
                  <UserCheck className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#171717] stroke-[2.5]" />
                ) : (
                  <User className="w-4 h-4 sm:w-4.5 sm:h-4.5 text-[#171717] stroke-[2]" />
                )}
              </div>
              <span className="text-xs sm:text-sm font-mono font-bold text-[#171717]">
                {isOwner ? '邹大炮' : '访客'}
              </span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#5F5E5A] transition-transform duration-150 ${
                  menuOpen ? 'rotate-180 text-[#171717]' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {menuOpen && (
              <div
                data-testid="user-dropdown-menu"
                className="absolute right-0 top-full mt-2 w-56 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] p-2.5 z-50 animate-in fade-in zoom-in-95 duration-100 font-mono"
              >
                {/* User Info Header */}
                <div className="px-2.5 py-2 mb-2 bg-[#FBF7EF] border border-[#171717] rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717]">
                    <span
                      className={`w-2 h-2 rounded-full border border-[#171717] ${
                        isOwner ? 'bg-[#10B981]' : 'bg-[#D3D1C7]'
                      }`}
                    />
                    <span>{isOwner ? '邹大炮 (管理员)' : '访客模式 (Guest)'}</span>
                  </div>
                  <div className="text-[10px] text-[#5F5E5A] mt-0.5">
                    {isOwner
                      ? '已解锁全局新增、编辑、置顶与排序权限'
                      : '浏览模式，登录后开启管理权限'}
                  </div>
                </div>

                {/* Actions Group */}
                <div className="space-y-1">
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setMenuOpen(false);
                      }}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#171717] bg-[#FFFFFF] hover:bg-[#FFE2E2] text-[#B91C1C] flex items-center gap-2 transition-all cursor-pointer font-bold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>退出登录</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        onLogin();
                        setMenuOpen(false);
                      }}
                      className="w-full text-xs px-2.5 py-2 rounded-lg border border-[#171717] bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] flex items-center justify-center gap-2 transition-all cursor-pointer font-bold shadow-[2px_2px_0_#171717]"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>管理员登录</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
