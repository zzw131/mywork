import React, { useState } from 'react';
import { AppView } from '../../types/resource';
import { WorkbenchObject, UserIdentity } from '../../types';
import {
  LayoutGrid,
  FileText,
  Target,
  Plus,
  Search,
  ArrowLeft,
  ExternalLink,
  Copy,
  Edit3,
  Trash2,
  ChevronRight,
  ChevronLeft,
  X,
  SlidersHorizontal,
  Check,
  FolderPlus,
  Sparkles,
} from 'lucide-react';

export interface PageSidebarProps {
  currentView: AppView;
  onSelectView: (view: AppView) => void;
  identity: UserIdentity;
  isMobileOpen: boolean;
  onCloseMobile: () => void;

  // Global search
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  searchPlaceholder?: string;

  // Workbench-specific tools
  onOpenAddResource?: () => void;
  onResetFilter?: () => void;
  hasActiveFilter?: boolean;

  // Memos-specific tools
  onOpenAddMemo?: () => void;

  // Goals-specific tools
  onOpenAddGoal?: () => void;

  // Resource detail specific tools
  currentResource?: WorkbenchObject | null;
  onBackToWorkbench?: () => void;
  onOpenPrimaryEntry?: () => void;
  onCopyResourceLink?: () => void;
  onTriggerEditDetail?: () => void;
  onTriggerAddBlock?: () => void;
  onTriggerAddSecondaryEntry?: () => void;
  onTriggerDeleteResource?: () => void;
}

const COLLAPSED_STORAGE_KEY = 'workbench_sidebar_collapsed';

export const PageSidebar: React.FC<PageSidebarProps> = ({
  currentView,
  onSelectView,
  identity,
  isMobileOpen,
  onCloseMobile,

  // Global search
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = '搜索标题/简介/标签...',

  // Workbench tools
  onOpenAddResource,
  onResetFilter,
  hasActiveFilter = false,

  // Memos tools
  onOpenAddMemo,

  // Goals tools
  onOpenAddGoal,

  // Resource detail tools
  currentResource,
  onBackToWorkbench,
  onOpenPrimaryEntry,
  onCopyResourceLink,
  onTriggerEditDetail,
  onTriggerAddBlock,
  onTriggerAddSecondaryEntry,
  onTriggerDeleteResource,
}) => {
  const isOwner = identity.role === 'owner';
  const [copiedLink, setCopiedLink] = useState(false);

  // Default is COLLAPSED mode (true) unless explicitly saved as 'false'
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    try {
      const saved = localStorage.getItem(COLLAPSED_STORAGE_KEY);
      if (saved === 'false') return false;
      return true; // default collapsed
    } catch {
      return true;
    }
  });

  const handleSetCollapsed = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem(COLLAPSED_STORAGE_KEY, String(collapsed));
    } catch {
      // ignore
    }
  };

  const handleToggleCollapsed = () => {
    handleSetCollapsed(!isCollapsed);
  };

  const navItems: { view: AppView; label: string; icon: React.ReactNode; short: string }[] = [
    { view: 'workbench', label: '工作台', short: '工作台', icon: <LayoutGrid className="w-4 h-4" /> },
    { view: 'memos', label: '备忘录', short: '备忘', icon: <FileText className="w-4 h-4" /> },
    { view: 'goals', label: '目标管理', short: '目标', icon: <Target className="w-4 h-4" /> },
  ];

  const handleCopyLink = () => {
    if (onCopyResourceLink) {
      onCopyResourceLink();
    } else {
      try {
        navigator.clipboard?.writeText(window.location.href);
      } catch {
        // ignore
      }
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1500);
  };

  const handleTriggerAddMemo = () => {
    if (onOpenAddMemo) {
      onOpenAddMemo();
    } else {
      window.dispatchEvent(new CustomEvent('workbench:open-write-memo'));
    }
    onCloseMobile();
  };

  const handleTriggerAddGoal = () => {
    if (onOpenAddGoal) {
      onOpenAddGoal();
    } else {
      window.dispatchEvent(new CustomEvent('workbench:open-create-goal'));
    }
    onCloseMobile();
  };

  // Sleek Neo-Brutalism tooltip that gracefully appears when staying/hovering for a short while (~300ms)
  const renderTooltip = (text: string) => (
    <div className="absolute left-[calc(100%+10px)] top-1/2 -translate-y-1/2 z-50 pointer-events-none opacity-0 translate-x-1 group-hover/tip:opacity-100 group-hover/tip:translate-x-0 transition-all duration-150 delay-300 px-2.5 py-1 bg-[#171717] text-white text-[11px] font-mono font-bold rounded-lg shadow-[2px_2px_0_#FFD84D] whitespace-nowrap flex items-center">
      <span>{text}</span>
      <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-[#171717] rotate-45 pointer-events-none" />
    </div>
  );

  // 1. COLLAPSED (Icon-only) Mini View with Delay Hover Tooltips
  const collapsedDesktopContent = (
    <div className="flex flex-col items-center h-full w-[64px] py-3.5 px-2 text-[#171717] font-mono select-none bg-white">
      {/* Global Search Trigger in Mini mode */}
      {onSearchChange && (
        <div className="relative group/tip flex items-center justify-center mb-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSetCollapsed(false);
              setTimeout(() => {
                const el = document.getElementById('global-sidebar-search-input');
                el?.focus();
              }, 50);
            }}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              searchQuery
                ? 'bg-[#FFD84D] border-[#171717] shadow-[2px_2px_0_#171717]'
                : 'bg-[#FFFFFF] border-[#171717]/20 hover:bg-[#FFF9E6] shadow-[1px_1px_0_#171717]'
            }`}
            aria-label="全局检索 (⌘K)"
          >
            <Search className="w-4 h-4 text-[#171717]" />
          </button>
          {renderTooltip(searchQuery ? `当前搜索: ${searchQuery}` : '全局检索 (⌘K)')}
        </div>
      )}

      {/* Nav Icons */}
      <div className="w-full space-y-1.5 flex flex-col items-center">
        {currentView === 'resource-detail' ? (
          <div className="relative group/tip flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (onBackToWorkbench) onBackToWorkbench();
              }}
              className="p-2 bg-[#FFD84D] hover:bg-[#FACC15] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717] cursor-pointer"
              aria-label="返回工作台"
            >
              <ArrowLeft className="w-4 h-4 text-[#171717]" />
            </button>
            {renderTooltip('返回工作台')}
          </div>
        ) : (
          navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <div key={item.view} className="relative group/tip flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectView(item.view);
                  }}
                  aria-label={item.label}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center relative ${
                    isActive
                      ? 'bg-[#171717] text-[#FFD84D] border-[#171717] shadow-[2px_2px_0_#FFD84D]'
                      : 'bg-[#FFFFFF] text-[#171717] border-[#171717]/20 hover:border-[#171717] hover:bg-[#FFF9E6] shadow-[1px_1px_0_#171717]'
                  }`}
                >
                  {item.icon}
                  {isActive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#FFD84D] border border-[#171717]" />
                  )}
                </button>
                {renderTooltip(item.label)}
              </div>
            );
          })
        )}
      </div>

      {/* Refined Thin Divider */}
      <div className="w-8 border-t border-[#171717]/10 my-3" />

      {/* Current View Icon Quick Tools */}
      <div className="w-full space-y-2 flex flex-col items-center flex-1">
        {/* Workbench Quick Action */}
        {currentView === 'workbench' && (
          <>
            {isOwner && onOpenAddResource && (
              <div className="relative group/tip flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenAddResource();
                  }}
                  className="p-2 bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  aria-label="新增入口资产"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
                {renderTooltip('新增入口资产')}
              </div>
            )}

            {hasActiveFilter && onResetFilter && (
              <div className="relative group/tip flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onResetFilter();
                  }}
                  className="p-1.5 bg-[#FFE2E2] text-[#B91C1C] hover:bg-[#FFB4C6] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717] cursor-pointer"
                  aria-label="重置工作台筛选"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                {renderTooltip('重置工作台筛选')}
              </div>
            )}
          </>
        )}

        {/* Memos Quick Action */}
        {currentView === 'memos' && (
          <>
            {isOwner && (
              <div className="relative group/tip flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerAddMemo();
                  }}
                  className="p-2 bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  aria-label="新建备忘录"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
                {renderTooltip('新建备忘录')}
              </div>
            )}
          </>
        )}

        {/* Goals Quick Action */}
        {currentView === 'goals' && (
          <>
            {isOwner && (
              <div className="relative group/tip flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTriggerAddGoal();
                  }}
                  className="p-2 bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  aria-label="新建目标"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                </button>
                {renderTooltip('新建目标')}
              </div>
            )}
          </>
        )}

        {/* Resource Detail Quick Action */}
        {currentView === 'resource-detail' && (
          <>
            {onOpenPrimaryEntry && (
              <div className="relative group/tip flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenPrimaryEntry();
                  }}
                  className="p-2 bg-[#FFD84D] hover:bg-[#FACC15] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717] cursor-pointer"
                  aria-label="打开主入口"
                >
                  <ExternalLink className="w-4 h-4 text-[#171717]" />
                </button>
                {renderTooltip('打开主入口')}
              </div>
            )}
            <div className="relative group/tip flex items-center justify-center">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCopyLink();
                }}
                className="p-2 bg-[#FFFFFF] hover:bg-[#F9FAFB] border border-[#171717]/25 rounded-xl shadow-[1px_1px_0_#171717] cursor-pointer"
                aria-label="复制档案链接"
              >
                {copiedLink ? (
                  <Check className="w-4 h-4 text-[#10B981]" />
                ) : (
                  <Copy className="w-4 h-4 text-[#5F5E5A]" />
                )}
              </button>
              {renderTooltip(copiedLink ? '已复制链接' : '复制档案链接')}
            </div>
            {isOwner && onTriggerEditDetail && (
              <div className="relative group/tip flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerEditDetail();
                  }}
                  className="p-2 bg-[#FFFFFF] hover:bg-[#FFF9E6] border border-[#171717]/30 rounded-xl shadow-[1px_1px_0_#171717] cursor-pointer"
                  aria-label="编辑档案资料"
                >
                  <Edit3 className="w-4 h-4 text-[#171717]" />
                </button>
                {renderTooltip('编辑档案资料')}
              </div>
            )}
            {isOwner && onTriggerAddBlock && (
              <div className="relative group/tip flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerAddBlock();
                  }}
                  className="p-2 bg-[#FFFFFF] hover:bg-[#FFF9E6] border border-[#171717]/30 rounded-xl shadow-[1px_1px_0_#171717] cursor-pointer"
                  aria-label="新增内容块"
                >
                  <FolderPlus className="w-4 h-4 text-[#171717]" />
                </button>
                {renderTooltip('新增内容块')}
              </div>
            )}
            {isOwner && onTriggerDeleteResource && (
              <div className="relative group/tip flex items-center justify-center">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerDeleteResource();
                  }}
                  className="p-2 bg-[#FFE2E2] hover:bg-[#FFB4C6] text-[#B91C1C] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717] cursor-pointer"
                  aria-label="删除此资源"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                {renderTooltip('删除此资源')}
              </div>
            )}
          </>
        )}
      </div>

      {/* Mini Role Indicator */}
      <div className="mt-auto pt-2 relative group/tip flex items-center justify-center">
        <span
          className={`w-2.5 h-2.5 rounded-full border border-[#171717] inline-block ${
            isOwner ? 'bg-[#10B981]' : 'bg-[#D3D1C7]'
          }`}
          aria-label={isOwner ? '管理员模式' : '访客浏览模式'}
        />
        {renderTooltip(isOwner ? '管理员模式' : '访客浏览模式')}
      </div>
    </div>
  );

  // 2. EXPANDED Full View
  const fullContent = (
    <div className="flex flex-col h-full w-[240px] lg:w-[250px] shrink-0 overflow-y-auto px-4 py-4 text-[#171717] font-mono select-none bg-white">
      {/* Header bar: Clean Title (No pin button, no top button) */}
      <div className="hidden md:flex items-center justify-between pb-3 mb-3 border-b border-[#171717]/10">
        <div className="text-xs font-bold text-[#171717]">
          <span>页面工具栏</span>
        </div>
      </div>

      {/* Global Search Input */}
      {onSearchChange && (
        <div className="mb-4">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#888780] pointer-events-none" />
            <input
              id="global-sidebar-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full pl-8 pr-7 py-1.5 bg-[#FFFFFF] border border-[#171717]/25 focus:border-[#171717] rounded-xl text-xs font-medium placeholder:text-[#888780] focus:outline-none focus:bg-[#FFF9E6] shadow-[1px_1px_0_#171717]"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[#888780] hover:text-[#171717] p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-[#888780] border border-[#171717]/20 px-1 rounded pointer-events-none">
                ⌘K
              </span>
            )}
          </div>
        </div>
      )}

      {/* 1. Page Navigation Section */}
      {currentView === 'resource-detail' ? (
        <div className="mb-4">
          <button
            type="button"
            onClick={() => {
              if (onBackToWorkbench) onBackToWorkbench();
              onCloseMobile();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 bg-[#FFD84D] hover:bg-[#FACC15] border border-[#171717] rounded-xl text-xs font-bold shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回工作台</span>
          </button>
        </div>
      ) : (
        <div className="space-y-1.5 mb-4">
          <div className="text-[11px] font-bold text-[#888780] uppercase tracking-wider px-1 mb-1.5">
            <span>页面导航</span>
          </div>
          {navItems.map((item) => {
            const isActive = currentView === item.view;
            return (
              <button
                key={item.view}
                type="button"
                onClick={() => {
                  onSelectView(item.view);
                  onCloseMobile();
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#171717] text-[#FFFFFF] border-[#171717] shadow-[2px_2px_0_#FFD84D]'
                    : 'bg-[#FFFFFF] text-[#171717] border-[#171717]/20 hover:border-[#171717] hover:bg-[#FFF9E6] shadow-[1px_1px_0_#171717]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className={isActive ? 'text-[#FFD84D]' : 'text-[#5F5E5A]'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FFD84D]" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Refined Thin Divider */}
      <div className="w-full border-t border-[#171717]/10 my-1.5 mb-4" />

      {/* 2. Dynamic Tool Content based on current page view */}
      
      {/* ===== Workbench Tools ===== */}
      {currentView === 'workbench' && (
        <div className="space-y-3.5 flex-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-[#888780] uppercase tracking-wider">
              工作台工具
            </span>
            {hasActiveFilter && onResetFilter && (
              <button
                type="button"
                onClick={onResetFilter}
                className="text-[10px] text-[#B91C1C] hover:underline font-bold cursor-pointer"
              >
                重置筛选
              </button>
            )}
          </div>

          {/* Admin Add Resource Entry Button (Owner only) */}
          {isOwner && onOpenAddResource && (
            <button
              type="button"
              onClick={() => {
                onOpenAddResource();
                onCloseMobile();
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border border-[#171717] rounded-xl text-xs font-bold shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>新增入口资产</span>
            </button>
          )}
        </div>
      )}

      {/* ===== Memos Tools ===== */}
      {currentView === 'memos' && (
        <div className="space-y-3.5 flex-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-[#888780] uppercase tracking-wider">
              备忘录工具
            </span>
          </div>

          {/* Admin Add Memo Button */}
          {isOwner && (
            <button
              type="button"
              onClick={handleTriggerAddMemo}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border border-[#171717] rounded-xl text-xs font-bold shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>新建备忘录</span>
            </button>
          )}

          <div className="p-3 bg-[#F9FAFB] border border-[#171717]/20 rounded-xl shadow-[1px_1px_0_#171717] text-xs space-y-1.5">
            <div className="font-bold text-[#171717] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FFD84D]" />
              <span>多维记事特性</span>
            </div>
            <div className="text-[11px] text-[#5F5E5A] leading-relaxed">
              • 卡片 / 列表双模式排版<br />
              • 支持自由指定历史与未来日期<br />
              • 标签归类与置顶高频记事
            </div>
          </div>
        </div>
      )}

      {/* ===== Goals Tools ===== */}
      {currentView === 'goals' && (
        <div className="space-y-3.5 flex-1">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-bold text-[#888780] uppercase tracking-wider">
              目标管理工具
            </span>
          </div>

          {/* Admin Add Goal Button */}
          {isOwner && (
            <button
              type="button"
              onClick={handleTriggerAddGoal}
              className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border border-[#171717] rounded-xl text-xs font-bold shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>新建目标</span>
            </button>
          )}

          <div className="p-3 bg-[#F9FAFB] border border-[#171717]/20 rounded-xl shadow-[1px_1px_0_#171717] text-xs space-y-1.5">
            <div className="font-bold text-[#171717] flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#FFD84D]" />
              <span>目标执行引擎</span>
            </div>
            <div className="text-[11px] text-[#5F5E5A] leading-relaxed">
              • OKR 目标分解与关键结果<br />
              • 关联工作台资产卡片<br />
              • 里程碑复盘与达成激励
            </div>
          </div>
        </div>
      )}

      {/* ===== Resource Detail Tools ===== */}
      {currentView === 'resource-detail' && (
        <div className="space-y-4 flex-1">
          {/* Resource Title Box */}
          <div className="p-3 bg-[#F9FAFB] border border-[#171717]/25 rounded-xl shadow-[2px_2px_0_#171717] space-y-1">
            <span className="text-[10px] font-bold text-[#888780] uppercase tracking-wider block">
              资源档案
            </span>
            <div className="text-xs font-bold text-[#171717] truncate" title={currentResource?.title}>
              {currentResource?.title || '当前资源'}
            </div>
            {currentResource?.summary && (
              <div className="text-[11px] text-[#5F5E5A] line-clamp-2 leading-relaxed">
                {currentResource.summary}
              </div>
            )}
          </div>

          {/* Common Actions */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#888780] uppercase tracking-wider block px-1">
              常用操作
            </span>
            <div className="space-y-1.5">
              {onOpenPrimaryEntry && (
                <button
                  type="button"
                  onClick={onOpenPrimaryEntry}
                  className="w-full flex items-center justify-between px-3 py-2 bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border border-[#171717] rounded-xl text-xs font-bold shadow-[2px_2px_0_#171717] cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>打开主入口</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-between px-3 py-2 bg-[#FFFFFF] hover:bg-[#F9FAFB] text-[#171717] border border-[#171717]/25 rounded-xl text-xs font-bold shadow-[1px_1px_0_#171717] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  {copiedLink ? (
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-[#5F5E5A]" />
                  )}
                  <span>{copiedLink ? '已复制链接' : '复制档案链接'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Admin Detail Actions (Owner only) */}
          {isOwner && (
            <div className="space-y-2 pt-3 border-t border-[#171717]/10">
              <span className="text-[11px] font-bold text-[#888780] uppercase tracking-wider block px-1">
                管理资源
              </span>
              <div className="space-y-1.5">
                {onTriggerEditDetail && (
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerEditDetail();
                      onCloseMobile();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] hover:bg-[#FFF9E6] border border-[#171717]/25 rounded-xl text-xs font-bold shadow-[1px_1px_0_#171717] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-[#171717]" />
                    <span>编辑档案资料</span>
                  </button>
                )}

                {onTriggerAddBlock && (
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerAddBlock();
                      onCloseMobile();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] hover:bg-[#FFF9E6] border border-[#171717]/25 rounded-xl text-xs font-bold shadow-[1px_1px_0_#171717] cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5 text-[#171717]" />
                    <span>新增内容块</span>
                  </button>
                )}

                {onTriggerAddSecondaryEntry && (
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerAddSecondaryEntry();
                      onCloseMobile();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-[#FFFFFF] hover:bg-[#FFF9E6] border border-[#171717]/25 rounded-xl text-xs font-bold shadow-[1px_1px_0_#171717] cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#171717]" />
                    <span>新增辅助入口</span>
                  </button>
                )}

                {onTriggerDeleteResource && (
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerDeleteResource();
                      onCloseMobile();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 bg-[#FFE2E2] hover:bg-[#FFB4C6] text-[#B91C1C] border border-[#171717] rounded-xl text-xs font-bold shadow-[1px_1px_0_#171717] cursor-pointer mt-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-[#B91C1C]" />
                    <span>删除此资源</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* User Role Indicator Footer in Sidebar */}
      <div className="mt-auto pt-3 border-t border-[#171717]/10 text-[11px] text-[#5F5E5A] flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 rounded-full border border-[#171717] ${
              isOwner ? 'bg-[#10B981]' : 'bg-[#D3D1C7]'
            }`}
          />
          <span>{isOwner ? '管理员模式' : '访客浏览模式'}</span>
        </div>
        <span className="font-bold text-[#171717]">v1.0</span>
      </div>
    </div>
  );

  const isExpanded = !isCollapsed;

  return (
    <>
      {/* Desktop Sticky Unified Sidebar (Fixed frame on every page, persistent toggle button, 100% synchronized animation) */}
      <aside
        className={`hidden md:block sticky top-0 h-screen shrink-0 z-40 bg-white border-r border-[#171717]/10 transition-[width] duration-300 ease-[cubic-bezier(0.25,1,0.5,1)] select-none ${
          isExpanded ? 'w-[240px] lg:w-[250px]' : 'w-[64px]'
        }`}
      >
        {/* Seamless Integrated Sidebar Toggle Tab (Directly attached to the right border of the aside - only clicking toggles expand/collapse) */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            handleToggleCollapsed();
          }}
          className="group absolute -right-[15px] top-1/2 -translate-y-1/2 z-50 w-[15px] h-[56px] flex items-center justify-center cursor-pointer select-none focus:outline-none"
          title={isCollapsed ? '点击展开左侧栏' : '点击收起左侧栏'}
          aria-label={isCollapsed ? '展开左侧栏' : '收起左侧栏'}
        >
          {/* SVG for seamless integrated curved tab matching the image */}
          <svg
            className="absolute inset-0 w-[15px] h-[56px] overflow-visible pointer-events-none"
            viewBox="0 0 15 56"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background fill connecting seamlessly with the white sidebar */}
            <path
              d="M -1,0 C -1,10 4,15 9,18 C 13.5,20.5 15,24 15,28 C 15,32 13.5,35.5 9,38 C 4,41 -1,46 -1,56 L -1,0 Z"
              fill="#FFFFFF"
            />
            {/* Seamless outer contour stroke matching the sidebar border */}
            <path
              d="M 0,0 C 0,10 4,15 9,18 C 13.5,20.5 15,24 15,28 C 15,32 13.5,35.5 9,38 C 4,41 0,46 0,56"
              stroke="rgba(23, 23, 23, 0.15)"
              strokeWidth="1.2"
              strokeLinecap="round"
              className="group-hover:stroke-[#171717] transition-colors"
            />
          </svg>

          {/* Centered Chevron Icon */}
          <div className="relative z-10 pl-0.5 text-[#5F5E5A] group-hover:text-[#171717] transition-colors">
            {isCollapsed ? (
              <ChevronRight className="w-3 h-3 stroke-[2.2] group-hover:translate-x-0.5 transition-transform" />
            ) : (
              <ChevronLeft className="w-3 h-3 stroke-[2.2] group-hover:-translate-x-0.5 transition-transform" />
            )}
          </div>
        </button>

        {/* Content Container (Overflow-visible when collapsed so tooltips float cleanly outside, overflow-hidden when expanded) */}
        <div className={`w-full h-full relative ${isExpanded ? 'overflow-hidden' : 'overflow-visible'}`}>
          {isExpanded ? fullContent : collapsedDesktopContent}
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="页面工具抽屉"
          className="fixed inset-0 z-50 md:hidden bg-[#171717]/50 backdrop-blur-xs flex animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) onCloseMobile();
          }}
        >
          <div className="w-[280px] max-w-[85vw] h-full bg-white border-r border-[#171717]/20 shadow-[4px_0_0_#171717] flex flex-col animate-in slide-in-from-left duration-200">
            {/* Mobile Drawer Header */}
            <div className="p-3 border-b border-[#171717]/10 flex items-center justify-between bg-white">
              <div className="flex items-center gap-2 font-mono font-bold text-xs">
                <SlidersHorizontal className="w-4 h-4 text-[#171717]" />
                <span>页面工具栏</span>
              </div>
              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1 hover:bg-[#F3F4F6] rounded-lg border border-[#171717]/25 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto bg-white">{fullContent}</div>
          </div>
        </div>
      )}
    </>
  );
};
