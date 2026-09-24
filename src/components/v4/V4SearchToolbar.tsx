import React, { useEffect, useRef, useState } from 'react';
import {
  Search,
  X,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { FilterCategory } from '../../types/resource';

export type CategoryFilter = FilterCategory;

export interface V4SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory?: CategoryFilter;
  disabled?: boolean;
  placeholder?: string;
}

export const V4SearchToolbar: React.FC<V4SearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory = 'all',
  disabled = false,
  placeholder = '快速检索标题、标签、摘要或入口路径（URL、本地路径、GitHub）...',
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
          title="展开检索栏 (快捷键 ⌘K)"
          aria-label="展开检索栏"
        >
          <Search className="w-5 h-5 text-[#171717]" />
          {hasActiveFilter && (
            <span
              className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-[#171717] text-[#FFD84D] rounded-full text-[10px] font-mono font-bold flex items-center justify-center border border-[#FFFFFF] shadow-sm"
              title={searchQuery ? `检索中: ${searchQuery}` : `分类已筛选`}
            >
              !
            </span>
          )}

          {/* Hover tooltip bubble */}
          <div className="absolute right-14 top-1/2 -translate-y-1/2 px-2.5 py-1.5 bg-[#171717] text-[#FFFFFF] text-xs font-bold rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none flex items-center gap-1.5">
            <PanelRightOpen className="w-3.5 h-3.5 text-[#FFD84D]" />
            <span>展开检索栏</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#333333] text-[#FFD84D] rounded">⌘K</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div
      className={`sticky ${
        disabled ? 'top-[50px]' : 'top-0'
      } z-30 w-full bg-[#FBF7EF]/95 backdrop-blur-md pt-5 pb-3 sm:pt-7 sm:pb-4 px-4 sm:px-8 transition-all`}
    >
      <div className="w-full">
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
                if (e.key === 'Escape') {
                  e.preventDefault();
                  if (searchQuery) {
                    onSearchChange('');
                  } else {
                    inputRef.current?.blur();
                  }
                }
              }}
              placeholder={placeholder}
              className={`w-full h-11 pl-11 pr-20 text-sm md:text-base font-medium text-[#171717] placeholder:text-[#888780] bg-transparent border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] focus:outline-none focus:ring-2 focus:ring-[#FFD84D] focus:shadow-[5px_5px_0_#171717] transition-all ${
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
            className="h-11 px-3 sm:px-3.5 bg-[#EDE8DC] hover:bg-[#FFD84D] text-[#171717] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] hover:shadow-[1px_1px_0_#171717] hover:translate-x-0.5 hover:translate-y-0.5 transition-all flex items-center gap-1.5 text-xs font-bold shrink-0 cursor-pointer"
            title="收起检索栏 (转为右侧悬浮图标)"
            aria-label="收起检索栏"
          >
            <PanelRightClose className="w-4 h-4 text-[#171717]" />
            <span className="hidden sm:inline font-mono">收起</span>
          </button>
        </div>
      </div>
    </div>
  );
};

