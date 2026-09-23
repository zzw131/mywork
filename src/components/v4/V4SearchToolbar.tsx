import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  X,
  Sparkles,
  FolderGit2,
  Wrench,
  Globe,
  BookOpen,
  Bookmark,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { FilterCategory } from '../../types/resource';

export type CategoryFilter = FilterCategory;

export interface V4SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  categoryCounts: Record<CategoryFilter, number>;
  disabled?: boolean;
}

const CATEGORY_ORDER: CategoryFilter[] = ['all', 'project', 'tool', 'web', 'learning', 'reference'];

export const V4SearchToolbar: React.FC<V4SearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('v4_search_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleCollapse = (collapsed: boolean) => {
    setIsCollapsed(collapsed);
    try {
      localStorage.setItem('v4_search_collapsed', String(collapsed));
    } catch {
      // ignore
    }
  };

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

    const handleCycleCategory = (e: Event) => {
      const customEvent = e as CustomEvent<{ direction?: number }>;
      const dir = customEvent.detail?.direction ?? 1;
      const curIdx = CATEGORY_ORDER.indexOf(selectedCategory);
      const nextIdx = (curIdx + dir + CATEGORY_ORDER.length) % CATEGORY_ORDER.length;
      onSelectCategory(CATEGORY_ORDER[nextIdx]);
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
    window.addEventListener('workbench:cycle-category', handleCycleCategory);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('workbench:focus-search', handleFocusSearch);
      window.removeEventListener('workbench:clear-search', handleClearSearch);
      window.removeEventListener('workbench:cycle-category', handleCycleCategory);
    };
  }, [onSearchChange, onSelectCategory, selectedCategory, isCollapsed]);

  const filterButtons: { key: CategoryFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: '全部', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'project', label: '项目', icon: <FolderGit2 className="w-4 h-4" /> },
    { key: 'tool', label: '工具', icon: <Wrench className="w-4 h-4" /> },
    { key: 'web', label: '网站', icon: <Globe className="w-4 h-4" /> },
    { key: 'learning', label: '学习', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'reference', label: '参考', icon: <Bookmark className="w-4 h-4" /> },
  ];

  const hasActiveFilter = !!searchQuery || selectedCategory !== 'all';
  const activeCategoryLabel = filterButtons.find((b) => b.key === selectedCategory)?.label || '';

  // Collapsed state: Floating icon pinned to the right edge of the screen
  if (isCollapsed) {
    return (
      <div className="fixed right-4 sm:right-6 top-20 sm:top-24 z-40">
        <button
          type="button"
          onClick={() => {
            handleToggleCollapse(false);
            setTimeout(() => inputRef.current?.focus(), 60);
          }}
          className="group relative flex items-center justify-center w-12 h-12 bg-[#FFD84D] hover:bg-[#FFE066] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] hover:shadow-[6px_6px_0_#171717] hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
          title="展开搜索与分类栏 (快捷键 ⌘K)"
          aria-label="展开搜索与分类栏"
        >
          <Search className="w-5 h-5 text-[#171717]" />
          {hasActiveFilter && (
            <span
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#171717] text-[#FFD84D] rounded-full text-[10px] font-mono font-bold flex items-center justify-center border border-[#FFFFFF] shadow-sm"
              title={searchQuery ? `检索中: ${searchQuery}` : `分类: ${activeCategoryLabel}`}
            >
              {searchQuery ? '!' : activeCategoryLabel[0] || '1'}
            </span>
          )}

          {/* Hover tooltip bubble */}
          <div className="absolute right-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#171717] text-[#FFFFFF] text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-1.5">
            <PanelRightOpen className="w-3.5 h-3.5 text-[#FFD84D]" />
            <span>展开搜索与分类</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#333333] text-[#FFD84D] rounded">⌘K</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`sticky ${
        disabled ? 'top-[46px]' : 'top-0'
      } z-30 w-full bg-[#FFFFFF]/98 backdrop-blur-xs border-b border-[#E2DDD3] shadow-[0_4px_16px_rgba(23,23,23,0.04)] pt-2 pb-3.5 px-4 sm:px-8 transition-all`}
    >
      <div className="w-full space-y-3">
        {/* Search Input Box with Collapse Trigger */}
        <div className="flex items-center gap-2.5 w-full">
          <div className="relative flex items-center flex-1">
            <div className="absolute left-3.5 pointer-events-none text-[#5F5E5A]">
              <Search className="w-5 h-5 text-[#171717]" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              disabled={disabled}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Tab') {
                  e.preventDefault();
                  const curIdx = CATEGORY_ORDER.indexOf(selectedCategory);
                  const nextIdx = e.shiftKey
                    ? (curIdx - 1 + CATEGORY_ORDER.length) % CATEGORY_ORDER.length
                    : (curIdx + 1) % CATEGORY_ORDER.length;
                  onSelectCategory(CATEGORY_ORDER[nextIdx]);
                } else if (e.key === 'Escape') {
                  e.preventDefault();
                  if (searchQuery) {
                    onSearchChange('');
                  } else {
                    inputRef.current?.blur();
                  }
                }
              }}
              placeholder="快速检索标题、标签、摘要或入口路径（URL、本地路径、GitHub）..."
              className={`w-full h-12 pl-11 pr-20 text-sm md:text-base font-medium text-[#171717] placeholder:text-[#888780] bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] focus:outline-none focus:ring-2 focus:ring-[#FFD84D] focus:shadow-[6px_6px_0_#171717] transition-all ${
                disabled ? 'opacity-50 cursor-not-allowed bg-[#EDE8DC]' : ''
              }`}
            />

            <div className="absolute right-3.5 flex items-center gap-1.5">
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="p-1 text-[#5F5E5A] hover:text-[#171717] rounded hover:bg-[#EDE8DC] cursor-pointer"
                  title="清空搜索"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold text-[#5F5E5A] bg-[#EDE8DC] border border-[#171717] rounded-md">
                  ⌘K
                </span>
              )}
            </div>
          </div>

          {/* Collapse into floating icon button */}
          <button
            type="button"
            onClick={() => handleToggleCollapse(true)}
            className="h-12 px-3 sm:px-3.5 bg-[#FFFFFF] hover:bg-[#FBF7EF] text-[#171717] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] hover:shadow-[1px_1px_0_#171717] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
            title="收起搜索栏 (转为右侧悬浮图标)"
            aria-label="收起搜索栏"
          >
            <PanelRightClose className="w-4 h-4 text-[#171717]" />
            <span className="hidden sm:inline font-mono">收起</span>
          </button>
        </div>

        {/* 6 Category Filters - Substantial height and clear touch targets */}
        <div
          role="tablist"
          aria-label="分类过滤"
          className="flex items-center gap-2.5 overflow-x-auto pt-1 pb-2 px-1 scrollbar-none"
        >
          {filterButtons.map((btn) => {
            const isActive = selectedCategory === btn.key;
            const count = categoryCounts[btn.key] || 0;
            return (
              <button
                key={btn.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                tabIndex={0}
                onClick={() => onSelectCategory(btn.key)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    const curIdx = CATEGORY_ORDER.indexOf(btn.key);
                    const nextIdx = (curIdx + 1) % CATEGORY_ORDER.length;
                    onSelectCategory(CATEGORY_ORDER[nextIdx]);
                  } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    const curIdx = CATEGORY_ORDER.indexOf(btn.key);
                    const prevIdx = (curIdx - 1 + CATEGORY_ORDER.length) % CATEGORY_ORDER.length;
                    onSelectCategory(CATEGORY_ORDER[prevIdx]);
                  }
                }}
                className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl border-2 border-[#171717] flex items-center gap-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#171717] text-[#FFFFFF] shadow-[3px_3px_0_#FFD84D] -translate-y-0.5'
                    : 'bg-[#FFFFFF] text-[#171717] hover:bg-[#FBF7EF] shadow-[3px_3px_0_#171717] hover:-translate-y-0.5'
                }`}
              >
                <span className={isActive ? 'text-[#FFD84D]' : 'text-[#5F5E5A]'}>
                  {btn.icon}
                </span>
                <span>{btn.label}</span>
                <span
                  className={`px-2 py-0.5 rounded-md text-xs font-mono font-bold ${
                    isActive
                      ? 'bg-[#FFFFFF] text-[#171717]'
                      : 'bg-[#EDE8DC] text-[#171717]'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

