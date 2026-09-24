import React, { useEffect } from 'react';
import {
  Sparkles,
  FolderGit2,
  Wrench,
  Globe,
  BookOpen,
  Bookmark,
} from 'lucide-react';
import { FilterCategory } from '../../types/resource';

export type CategoryFilter = FilterCategory;

export interface V4CategoryFilterProps {
  selectedCategory: CategoryFilter;
  onSelectCategory: (cat: CategoryFilter) => void;
  categoryCounts: Record<CategoryFilter, number>;
  disabled?: boolean;
}

export const CATEGORY_ORDER: CategoryFilter[] = [
  'all',
  'project',
  'tool',
  'web',
  'learning',
  'reference',
];

export const V4CategoryFilter: React.FC<V4CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
  disabled = false,
}) => {
  const filterButtons: { key: CategoryFilter; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: '全部', icon: <Sparkles className="w-4 h-4" /> },
    { key: 'project', label: '项目', icon: <FolderGit2 className="w-4 h-4" /> },
    { key: 'tool', label: '工具', icon: <Wrench className="w-4 h-4" /> },
    { key: 'web', label: '网页', icon: <Globe className="w-4 h-4" /> },
    { key: 'learning', label: '学习', icon: <BookOpen className="w-4 h-4" /> },
    { key: 'reference', label: '参考', icon: <Bookmark className="w-4 h-4" /> },
  ];

  // Cycle category event listener
  useEffect(() => {
    const handleCycleCategory = (e: Event) => {
      const customEvent = e as CustomEvent<{ direction?: number }>;
      const dir = customEvent.detail?.direction ?? 1;
      const curIdx = CATEGORY_ORDER.indexOf(selectedCategory);
      const nextIdx = (curIdx + dir + CATEGORY_ORDER.length) % CATEGORY_ORDER.length;
      onSelectCategory(CATEGORY_ORDER[nextIdx]);
    };

    window.addEventListener('workbench:cycle-category', handleCycleCategory);
    return () => {
      window.removeEventListener('workbench:cycle-category', handleCycleCategory);
    };
  }, [onSelectCategory, selectedCategory]);

  return (
    <div
      role="tablist"
      aria-label="工作台分类筛选"
      className={`flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1 scrollbar-none ${
        disabled ? 'opacity-50 pointer-events-none' : ''
      }`}
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
                const prevIdx =
                  (curIdx - 1 + CATEGORY_ORDER.length) % CATEGORY_ORDER.length;
                onSelectCategory(CATEGORY_ORDER[prevIdx]);
              }
            }}
            className={`h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl border-2 border-[#171717] flex items-center gap-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
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
              className={`px-1.5 py-0.2 rounded-md text-[11px] font-mono font-bold ${
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
  );
};
