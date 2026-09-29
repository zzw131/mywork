import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  X,
  PenLine,
  ChevronLeft,
} from 'lucide-react';
import { FilterCategory } from '../../types/resource';

export type CategoryFilter = FilterCategory;

export interface V4SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory?: CategoryFilter;
  disabled?: boolean;
  placeholder?: string;
  isOwner?: boolean;
  currentView?: string;
  onOpenWriteMemo?: () => void;
}

export const V4SearchToolbar: React.FC<V4SearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory = 'all',
  disabled = false,
  placeholder = '快速检索标题、标签、摘要或入口路径（URL、本地路径、GitHub）...',
  isOwner = false,
  currentView,
  onOpenWriteMemo,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const toolbarContainerRef = useRef<HTMLDivElement>(null);
  const [isDockHovered, setIsDockHovered] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('v4_search_collapsed_v3');
      if (saved !== null) {
        return saved === 'true';
      }
      return true; // 默认两个浮动 icon 为独立初始状态
    } catch {
      return true;
    }
  });

  const handleToggleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem('v4_search_collapsed_v3', String(collapsed));
    } catch {
      // ignore
    }
  };

  // Sync toolbar height to CSS variable --search-bar-height so sticky containers freeze underneath
  useEffect(() => {
    const updateHeight = () => {
      if (isCollapsed) {
        document.documentElement.style.setProperty('--search-bar-height', '0px');
      } else if (toolbarContainerRef.current) {
        const h = toolbarContainerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--search-bar-height', `${h}px`);
      } else {
        const defaultH = window.innerWidth >= 640 ? 88 : 76;
        document.documentElement.style.setProperty('--search-bar-height', `${defaultH}px`);
      }
    };

    updateHeight();
    window.addEventListener('resize', updateHeight);

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && toolbarContainerRef.current) {
      ro = new ResizeObserver(() => updateHeight());
      ro.observe(toolbarContainerRef.current);
    }

    return () => {
      window.removeEventListener('resize', updateHeight);
      ro?.disconnect();
    };
  }, [isCollapsed]);

  // Keyboard shortcut & Custom event integrations
  useEffect(() => {
    const handleFocusSearch = () => {
      if (isCollapsed) {
        handleToggleCollapse(false);
      }
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    };

    const handleClearSearch = () => {
      onSearchChange('');
      inputRef.current?.blur();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        handleFocusSearch();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('workbench:focus-search', handleFocusSearch);
    window.addEventListener('workbench:clear-search', handleClearSearch);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('workbench:focus-search', handleFocusSearch);
      window.removeEventListener('workbench:clear-search', handleClearSearch);
    };
  }, [onSearchChange, isCollapsed]);

  const hasActiveFilter = !!searchQuery || selectedCategory !== 'all';

  return (
    <>
      {/* 1. 展开态全局检索栏：吸附在右上角，搜索与收起结合为一体，点击文案收起，点击搜索栏搜索 */}
      {!isCollapsed && (
        <div
          ref={toolbarContainerRef}
          className={`sticky ${
            disabled ? 'top-[50px]' : 'top-0'
          } z-30 w-full bg-[#FBF7EF]/95 backdrop-blur-md pt-3.5 pb-2.5 sm:pt-4 sm:pb-3 px-4 sm:px-8 transition-all animate-in fade-in slide-in-from-top-2 duration-150 flex justify-end`}
        >
          {/* 结合在一起的一体化检索栏：右上角吸附 */}
          <div className="w-full sm:max-w-xl md:max-w-2xl bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] focus-within:shadow-[5px_5px_0_#171717] transition-all flex items-center pr-2 pl-3.5 h-11">
            {/* 搜索图标 */}
            <Search className="w-4 h-4 text-[#171717] shrink-0 mr-2.5 pointer-events-none" />

            {/* 搜索输入区域（点击搜索栏搜索） */}
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              disabled={disabled}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  e.preventDefault();
                  if (searchQuery) {
                    onSearchChange('');
                  } else {
                    handleToggleCollapse(true);
                  }
                }
              }}
              placeholder={placeholder}
              className="flex-1 bg-transparent text-sm md:text-base font-medium text-[#171717] placeholder:text-[#888780] focus:outline-none min-w-0 cursor-text"
            />

            {/* 清空输入按钮 */}
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  onSearchChange('');
                  inputRef.current?.focus();
                }}
                className="p-1 text-[#5F5E5A] hover:text-[#171717] rounded hover:bg-[#EDE8DC] cursor-pointer mr-1.5"
                title="清空搜索"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* 微型垂直分割线 */}
            <div className="h-5 w-[1.5px] bg-[#171717]/20 mx-1 shrink-0" />

            {/* 点击文案收起（结合在同一个框内，点击文案收起） */}
            <button
              type="button"
              onClick={() => handleToggleCollapse(true)}
              className="px-2.5 py-1 text-xs font-mono font-bold text-[#5F5E5A] hover:text-[#171717] hover:bg-[#EDE8DC] rounded-lg transition-colors flex items-center gap-1 shrink-0 cursor-pointer select-none"
              title="收起检索栏 (快捷键 ESC)"
              aria-label="收起检索栏"
            >
              <span>收起</span>
              <span className="text-[10px] text-[#888780] hidden sm:inline">(ESC)</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. 屏幕右侧果冻吸附悬浮按钮组（屏幕右侧上下居中，鼠标滑过滑出展开） */}
      <aside
        aria-label="快捷工具悬浮组"
        className="fixed right-0 top-1/2 -translate-y-1/2 z-40 select-none"
        onMouseEnter={() => setIsDockHovered(true)}
        onMouseLeave={() => setIsDockHovered(false)}
      >
        <div
          className={`flex items-center border-2 border-r-0 border-[#171717] rounded-l-2xl shadow-[-4px_4px_0_#171717] transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDockHovered
              ? 'translate-x-0 pl-2.5 pr-3 py-2 bg-[#FBF7EF]'
              : 'translate-x-[calc(100%-28px)] sm:translate-x-[calc(100%-32px)] pl-2 pr-1.5 py-3.5 bg-[#FFD84D] hover:translate-x-[calc(100%-36px)] cursor-pointer'
          }`}
          onClick={(e) => {
            if (!isDockHovered) {
              e.stopPropagation();
              setIsDockHovered(true);
            }
          }}
        >
          {/* 果冻左侧吸附提手与向左箭头 */}
          <div
            className={`flex items-center justify-center shrink-0 cursor-pointer ${
              isDockHovered ? 'pr-2' : ''
            }`}
            title={isDockHovered ? '收起快捷组' : '展开快捷工具 (搜索 / 写备忘录)'}
            onClick={(e) => {
              if (isDockHovered) {
                e.stopPropagation();
                setIsDockHovered(false);
              }
            }}
          >
            <ChevronLeft
              className={`w-4 h-4 text-[#171717] transition-transform duration-300 ${
                isDockHovered ? 'rotate-180 text-[#888780]' : 'animate-pulse'
              }`}
            />
            {!isDockHovered && hasActiveFilter && (
              <span className="w-2 h-2 rounded-full bg-[#171717] absolute top-1.5 left-1.5" />
            )}
          </div>

          {/* 按钮组（鼠标滑过才展开显示） */}
          <div
            className={`flex items-center gap-2 transition-all duration-200 ${
              isDockHovered
                ? 'opacity-100 pointer-events-auto'
                : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* 1. 搜索按钮 */}
            <div className="relative group/btn">
              <button
                type="button"
                onClick={() => {
                  if (isCollapsed) {
                    handleToggleCollapse(false);
                  }
                  setTimeout(() => inputRef.current?.focus(), 60);
                }}
                className={`flex items-center justify-center w-10 h-10 rounded-xl border-2 border-[#171717] transition-all cursor-pointer shadow-[2px_2px_0_#171717] hover:shadow-[3px_3px_0_#171717] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 ${
                  !isCollapsed
                    ? 'bg-[#171717] text-[#FFD84D]'
                    : 'bg-[#FFD84D] hover:bg-[#FFE066] text-[#171717]'
                }`}
                title="搜索 (快捷键 ⌘K)"
                aria-label="搜索"
              >
                <Search className="w-4 h-4" />
                {hasActiveFilter && isCollapsed && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-0.5 bg-[#171717] text-[#FFD84D] rounded-full text-[9px] font-mono font-bold flex items-center justify-center border border-[#FFFFFF]">
                    !
                  </span>
                )}
              </button>

              {/* Hover Tooltip */}
              <div className="absolute right-12 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#171717] text-[#FFFFFF] text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-1.5 font-mono z-50">
                <span>搜索</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-[#333333] text-[#FFD84D] rounded">
                  ⌘K
                </span>
              </div>
            </div>

            {/* 2. 写备忘录按钮 */}
            {isOwner && onOpenWriteMemo && (
              <div className="relative group/btn">
                <button
                  type="button"
                  onClick={onOpenWriteMemo}
                  className="flex items-center justify-center w-10 h-10 bg-[#FFD84D] hover:bg-[#FFE066] text-[#171717] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] hover:shadow-[3px_3px_0_#171717] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  title="写备忘录"
                  aria-label="写备忘录"
                >
                  <PenLine className="w-4 h-4 text-[#171717]" />
                </button>

                {/* Hover Tooltip */}
                <div className="absolute right-12 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#171717] text-[#FFFFFF] text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-1.5 font-mono z-50">
                  <PenLine className="w-3.5 h-3.5 text-[#FFD84D]" />
                  <span>写备忘录</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

