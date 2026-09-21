import React from 'react';
import { UserIdentity } from '../../types';
import { Terminal, Shield, User, Edit3, CheckCircle2, Plus } from 'lucide-react';

interface V4HeaderProps {
  identity: UserIdentity;
  onToggleIdentity: () => void;
  editMode: boolean;
  onToggleEditMode: () => void;
  onOpenAddForm: () => void;
  totalCount: number;
  activeView?: 'workbench' | 'design-system';
  onSelectView?: (view: 'workbench' | 'design-system') => void;
}

export const V4Header: React.FC<V4HeaderProps> = ({
  identity,
  onToggleIdentity,
  editMode,
  onToggleEditMode,
  onOpenAddForm,
  totalCount,
  activeView = 'workbench',
  onSelectView,
}) => {
  const isOwner = identity.role === 'owner';

  return (
    <header className="w-full border-b-2 border-[#171717] bg-[#FFFFFF]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Left: Brand & Identity */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg border-2 border-[#171717] bg-[#FFD84D] shadow-[3px_3px_0_#171717] flex items-center justify-center font-bold text-base">
            PW
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-[#171717]">
                Personal Workbench
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-semibold bg-[#EDE8DC] border border-[#171717] rounded">
                v1.0
              </span>
            </div>
            <p className="text-xs text-[#5F5E5A] font-medium flex items-center gap-2">
              <span>我的数字入口 · 邹大炮的私人工作台</span>
              <span className="inline-block w-1 h-1 rounded-full bg-[#888780]" />
              <span className="flex items-center gap-1 text-[#171717] font-mono">
                <span className="w-2 h-2 rounded-full bg-[#A9E5C3] border border-[#171717]" />
                {totalCount} 入口在线
              </span>
            </p>
          </div>
        </div>

        {/* Center: View Switcher (Workbench vs Design System) */}
        {onSelectView && (
          <div className="flex items-center bg-[#FBF7EF] border-2 border-[#171717] rounded-lg p-0.5 shadow-[2px_2px_0_#171717]">
            <button
              type="button"
              onClick={() => onSelectView('workbench')}
              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                activeView === 'workbench'
                  ? 'bg-[#FFD84D] text-[#171717] shadow-[2px_2px_0_#171717]'
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
                  ? 'bg-[#FFD84D] text-[#171717] shadow-[2px_2px_0_#171717]'
                  : 'text-[#5F5E5A] hover:text-[#171717]'
              }`}
            >
              规范库
            </button>
          </div>
        )}

        {/* Right: Actions & Role Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          {/* System status pill */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-semibold bg-[#FBF7EF] border border-[#171717] rounded-md">
            <Terminal className="w-3.5 h-3.5 text-[#5F5E5A]" />
            <span>PGlite: OK</span>
          </div>

          {/* Role switcher toggle */}
          <button
            type="button"
            onClick={onToggleIdentity}
            className="v4-btn v4-btn-default text-xs px-3 py-1.5 flex items-center gap-1.5"
            title="点击切换访客/主人模式 (用于权限测试)"
          >
            {isOwner ? (
              <>
                <Shield className="w-3.5 h-3.5 text-[#171717]" />
                <span>Owner 权限</span>
              </>
            ) : (
              <>
                <User className="w-3.5 h-3.5 text-[#5F5E5A]" />
                <span>Guest 访客</span>
              </>
            )}
          </button>

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
