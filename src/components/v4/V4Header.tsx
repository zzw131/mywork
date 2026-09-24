import React, { useState, useEffect, useRef } from 'react';
import { UserIdentity } from '../../types';
import { Edit3, LogIn, LogOut, User, UserCheck, ChevronDown } from 'lucide-react';
import { WorkbenchLogo } from './WorkbenchLogo';

interface V4HeaderProps {
  identity: UserIdentity;
  onLogin: () => void;
  onLogout: () => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  onOpenAddForm?: () => void;
  totalCount: number;
  activeView?: 'workbench' | 'goals' | 'design-system' | 'resource-detail';
  onSelectView?: (view: 'workbench' | 'goals' | 'design-system') => void;
}

export const V4Header: React.FC<V4HeaderProps> = ({
  identity,
  onLogin,
  onLogout,
  editMode,
  onToggleEditMode,
  onOpenAddForm,
  totalCount,
  activeView = 'workbench',
  onSelectView,
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
    <header className="w-full bg-[#FFFFFF] border-b border-[#E2DDD3]">
      <div className="w-full px-4 sm:px-8 py-3 sm:py-3.5 min-h-[66px] flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Identity - Compact two-line typography with aligned logo */}
        <div className="flex items-center gap-3">
          <WorkbenchLogo className="w-[40px] h-[40px] sm:w-[44px] sm:h-[44px]" />
          <div className="flex flex-col justify-center gap-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#171717] leading-tight">
                Personal Workbench
              </h1>
              <span className="px-1.5 py-0.5 text-[11px] font-mono font-bold bg-[#EDE8DC] border border-[#171717] rounded leading-none">
                v1.0
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#5F5E5A] font-medium leading-tight">
              <span>邹大炮的个人工作台</span>
              <span className="text-[#888780]">·</span>
              <span className="inline-flex items-center gap-1.5 font-mono text-[#171717]">
                <span className="w-2 h-2 rounded-full bg-[#A9E5C3] border border-[#171717]" />
                <span className="font-semibold">{totalCount}</span> 个入口在线
              </span>
            </div>
          </div>
        </div>

        {/* Right: Actions & Role Indicator Group - Grouped tightly together on the right */}
        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
          {/* PGlite 状态动态呼吸指示灯（含鼠标悬停浮动连接状态提示框） */}
          <div className="relative group flex items-center justify-center mr-1 shrink-0">
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
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 hidden group-hover:flex group-focus-within:flex flex-col gap-1 px-3 py-2 bg-[#FFFFFF] border-2 border-[#171717] rounded-lg shadow-[3px_3px_0_#171717] z-50 pointer-events-none whitespace-nowrap text-left animate-in fade-in zoom-in-95 duration-100">
              {/* Arrow Triangle Accent */}
              <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#FFFFFF] border-t-2 border-l-2 border-[#171717] rotate-45" />

              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] inline-block animate-pulse" />
                <span className="text-xs font-bold text-[#171717]">PGlite 数据库：已连接</span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-[#A9E5C3] border border-[#171717] rounded leading-none">
                  正常运行
                </span>
              </div>
              <div className="text-[11px] font-mono text-[#5F5E5A] flex items-center gap-1.5 pt-1 border-t border-[#EDE8DC]">
                <span>状态: 在线 (Active)</span>
                <span className="text-[#888780]">·</span>
                <span>本地零延迟响应</span>
              </div>
            </div>
          </div>

          {/* View Switcher (Workbench vs Goals vs Design System) */}
          {onSelectView && (
            <div className="flex items-center bg-[#FBF7EF] border-2 border-[#171717] rounded-xl p-1 shadow-[2px_2px_0_#171717]">
              <button
                type="button"
                onClick={() => onSelectView('workbench')}
                className={`px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  activeView === 'workbench'
                    ? 'bg-[#FFD84D] text-[#171717] shadow-[1px_1px_0_#171717]'
                    : 'text-[#5F5E5A] hover:text-[#171717]'
                }`}
              >
                工作台
              </button>
              <button
                type="button"
                onClick={() => onSelectView('goals')}
                className={`px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  activeView === 'goals'
                    ? 'bg-[#FFD84D] text-[#171717] shadow-[1px_1px_0_#171717]'
                    : 'text-[#5F5E5A] hover:text-[#171717]'
                }`}
              >
                目标管理
              </button>
              <button
                type="button"
                onClick={() => onSelectView('design-system')}
                className={`px-3 sm:px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  activeView === 'design-system'
                    ? 'bg-[#FFD84D] text-[#171717] shadow-[1px_1px_0_#171717]'
                    : 'text-[#5F5E5A] hover:text-[#171717]'
                }`}
              >
                规范库
              </button>
            </div>
          )}

          {/* User Avatar "小人" Menu & Expandable Actions Group */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              data-testid="user-menu-btn"
              onClick={() => setMenuOpen((prev) => !prev)}
              aria-label="用户与设置中心"
              title={isOwner ? '邹大炮 (Owner) · 点击展开菜单' : '访客 (Guest) · 点击展开菜单'}
              className={`relative h-10 px-3 flex items-center gap-2 rounded-xl border-2 border-[#171717] transition-all cursor-pointer shadow-[3px_3px_0_#171717] hover:shadow-[4px_4px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 ${
                isOwner
                  ? 'bg-[#FFF9E6] hover:bg-[#FFD84D]'
                  : 'bg-[#FFFFFF] hover:bg-[#FBF7EF]'
              } ${menuOpen ? 'translate-x-0.5 translate-y-0.5 shadow-[1px_1px_0_#171717]' : ''}`}
            >
              <div className="relative flex items-center justify-center">
                {isOwner ? (
                  <UserCheck className="w-5 h-5 text-[#171717] stroke-[2.5]" />
                ) : (
                  <User className="w-5 h-5 text-[#171717] stroke-[2]" />
                )}
                {/* Online status indicator dot for logged-in user */}
                {isOwner && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#10B981] border border-[#171717] rounded-full" />
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
                <div className="px-2.5 py-2 mb-1.5 bg-[#FBF7EF] border border-[#171717] rounded-lg">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#171717]">
                    <span
                      className={`w-2 h-2 rounded-full border border-[#171717] ${
                        isOwner ? 'bg-[#10B981]' : 'bg-[#D3D1C7]'
                      }`}
                    />
                    <span>{isOwner ? '邹大炮 (Owner)' : '访客模式 (Guest)'}</span>
                  </div>
                  <div className="text-[10px] text-[#5F5E5A] mt-0.5">
                    {isOwner
                      ? '拥有全站资产与目标管理权限'
                      : '浏览模式，登录后开启管理权限'}
                  </div>
                </div>

                {/* Actions Group */}
                <div className="space-y-1">
                  {isOwner ? (
                    <>
                      {/* Button 1: Edit Mode Toggle */}
                      <button
                        type="button"
                        data-testid="toggle-edit"
                        onClick={() => {
                          onToggleEditMode();
                          setMenuOpen(false);
                        }}
                        className={`w-full text-xs px-2.5 py-2 rounded-lg border border-[#171717] flex items-center justify-between transition-all cursor-pointer ${
                          editMode
                            ? 'bg-[#FFD84D] font-bold shadow-[1px_1px_0_#171717]'
                            : 'bg-[#FFFFFF] hover:bg-[#FFF9E6] text-[#171717]'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>{editMode ? '退出编辑模式' : '编辑模式'}</span>
                        </span>
                        {editMode && (
                          <span className="text-[10px] font-bold bg-[#171717] text-[#FFFFFF] px-1 rounded">
                            ON
                          </span>
                        )}
                      </button>

                      {/* Button 2: Logout */}
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
                    </>
                  ) : (
                    /* Guest Mode: Shows Login, DOES NOT show Edit Mode */
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
