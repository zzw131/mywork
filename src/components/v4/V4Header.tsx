import React from 'react';
import { UserIdentity } from '../../types';
import { Edit3, Plus, LogIn, LogOut, ShieldCheck } from 'lucide-react';
import { WorkbenchLogo } from './WorkbenchLogo';

interface V4HeaderProps {
  identity: UserIdentity;
  onLogin: () => void;
  onLogout: () => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  onOpenAddForm: () => void;
  totalCount: number;
  activeView?: 'workbench' | 'design-system' | 'resource-detail';
  onSelectView?: (view: 'workbench' | 'design-system') => void;
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

  return (
    <header className="w-full bg-[#FFFFFF]">
      <div className="w-full px-4 sm:px-8 pt-3.5 pb-1.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Identity - Compact two-line typography with aligned logo */}
        <div className="flex items-center gap-3">
          <WorkbenchLogo className="w-[38px] h-[38px] sm:w-[40px] sm:h-[40px]" />
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
        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {/* PGlite 状态动态呼吸指示灯（含鼠标悬停浮动连接状态提示框） */}
          <div className="relative group flex items-center justify-center mr-1 shrink-0">
            <div
              className="flex items-center justify-center w-6 h-6 rounded-md hover:bg-[#F3EFE6] transition-colors select-none cursor-pointer"
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

          {/* View Switcher (Workbench vs Design System) */}
          {onSelectView && (
            <div className="flex items-center bg-[#FBF7EF] border-2 border-[#171717] rounded-lg p-0.5 shadow-[2px_2px_0_#171717]">
              <button
                type="button"
                onClick={() => onSelectView('workbench')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  activeView === 'workbench'
                    ? 'bg-[#FFD84D] text-[#171717] shadow-[1px_1px_0_#171717]'
                    : 'text-[#5F5E5A] hover:text-[#171717]'
                }`}
              >
                工作台
              </button>
              <button
                type="button"
                onClick={() => onSelectView('design-system')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  activeView === 'design-system'
                    ? 'bg-[#FFD84D] text-[#171717] shadow-[1px_1px_0_#171717]'
                    : 'text-[#5F5E5A] hover:text-[#171717]'
                }`}
              >
                规范库
              </button>
            </div>
          )}

          {/* Login / Logout Controls */}
          {isOwner ? (
            <div className="flex items-center gap-2">
              <div
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFF9E6] border-2 border-[#171717] rounded-lg text-xs font-bold text-[#171717] shadow-[2px_2px_0_#171717] select-none"
                title="当前状态：已登录"
              >
                <span className="text-[#10B981] font-mono text-sm leading-none">●</span>
                <span>已登录</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="v4-btn v4-btn-default text-xs px-2.5 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#171717]"
                title="退出登录"
              >
                <LogOut className="w-3.5 h-3.5 text-[#5F5E5A]" />
                <span>退出登录</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              className="v4-btn v4-btn-yellow text-xs px-3.5 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#171717] font-bold"
              title="登录后管理你的工作台"
            >
              <LogIn className="w-3.5 h-3.5 text-[#171717]" />
              <span>登录</span>
            </button>
          )}

          {/* Owner-only Edit Toggle Button (Strictly NOT rendered in DOM if Guest) */}
          {isOwner && (
            <>
              <button
                type="button"
                data-testid="toggle-edit"
                onClick={onToggleEditMode}
                className={`v4-btn text-xs px-3.5 py-1.5 flex items-center gap-1.5 ${
                  editMode ? 'v4-btn-yellow' : 'v4-btn-default'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{editMode ? '完成排版' : '编辑布局'}</span>
              </button>

              {editMode && (
                <button
                  type="button"
                  data-testid="toggle-add"
                  onClick={onOpenAddForm}
                  className="v4-btn v4-btn-yellow text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>添加资产</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </header>
  );
};
