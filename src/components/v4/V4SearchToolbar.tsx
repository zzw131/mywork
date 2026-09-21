import React, { useEffect, useRef } from 'react';
import { Search, X, Sparkles, FolderGit2, Wrench, Globe, BookOpen, Bookmark } from 'lucide-react';
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

export const V4SearchToolbar: React.FC<V4SearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  disabled = false,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: Cmd+K / Ctrl+K to focus search, ESC to clear
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === inputRef.current) {
        onSearchChange('');
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSearchChange]);

  const filterButtons: { key: CategoryFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: '全部', icon: <Sparkles className="w-3.5 h-3.5" /> },
    { key: 'project', label: '项目', icon: <FolderGit2 className="w-3.5 h-3.5" /> },
    { key: 'tool', label: '工具', icon: <Wrench className="w-3.5 h-3.5" /> },
    { key: 'web', label: 'Web', icon: <Globe className="w-3.5 h-3.5" /> },
    { key: 'learning', label: '学习', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { key: 'reference', label: '参考', icon: <Bookmark className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="w-full bg-[#FFFFFF] border-b-2 border-[#171717] py-4 px-4 sm:px-8">
      <div className="max-w-[1200px] mx-auto space-y-3.5">
        {/* Search Input Box */}
        <div className="relative flex items-center w-full">
          <div className="absolute left-3.5 pointer-events-none text-[#5F5E5A]">
            <Search className="w-5 h-5 text-[#171717]" />
          </div>

          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            disabled={disabled}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="快速检索标题、标签、摘要或入口路径（URL、本地路径、GitHub）..."
            className={`w-full h-12 pl-11 pr-24 text-sm md:text-base font-medium text-[#171717] placeholder:text-[#888780] bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] focus:outline-none focus:ring-2 focus:ring-[#FFD84D] focus:shadow-[6px_6px_0_#171717] transition-all ${
              disabled ? 'opacity-50 cursor-not-allowed bg-[#EDE8DC]' : ''
            }`}
          />

          <div className="absolute right-3.5 flex items-center gap-1.5">
            {searchQuery ? (
              <button
                type="button"
                onClick={() => onSearchChange('')}
                className="p-1 text-[#5F5E5A] hover:text-[#171717] rounded hover:bg-[#EDE8DC]"
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

        {/* 6 Category Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
          {filterButtons.map((btn) => {
            const isActive = selectedCategory === btn.key;
            const count = categoryCounts[btn.key] || 0;
            return (
              <button
                key={btn.key}
                type="button"
                onClick={() => onSelectCategory(btn.key)}
                className={`v4-tag whitespace-nowrap ${isActive ? 'active' : ''}`}
              >
                <span className={isActive ? 'text-[#FFD84D]' : 'text-[#5F5E5A]'}>
                  {btn.icon}
                </span>
                <span className="font-bold">{btn.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[11px] font-mono font-bold ${
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
