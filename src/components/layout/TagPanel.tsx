import React, { useState } from 'react';
import { Tag, ChevronDown, ChevronUp, X } from 'lucide-react';

interface TagItem {
  tag: string;
  count: number;
}

export interface TagPanelProps {
  tags: TagItem[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  topLimit?: number;
}

export const TagPanel: React.FC<TagPanelProps> = ({
  tags,
  selectedTag,
  onSelectTag,
  topLimit = 8,
}) => {
  const [expanded, setExpanded] = useState(false);

  if (!tags || tags.length === 0) return null;

  const visibleTags = expanded ? tags : tags.slice(0, topLimit);
  const hasMore = tags.length > topLimit;

  return (
    <div className="w-full md:w-[85%] lg:w-[80%] mx-auto px-4 sm:px-6 pt-6 sm:pt-7 pb-2.5">
      <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#5F5E5A]">
          <Tag className="w-3.5 h-3.5 text-[#171717]" />
          <span>常用标签筛选</span>
          {selectedTag && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFD84D] text-[#171717] border border-[#171717] rounded text-[11px] shadow-[1px_1px_0_#171717]">
              <span>当前: #{selectedTag}</span>
              <button
                type="button"
                onClick={() => onSelectTag(null)}
                className="hover:opacity-75 p-0.5"
                title="清除标签过滤"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {hasMore && (
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#171717] hover:underline"
          >
            <span>{expanded ? '收起标签' : `展开全部 (${tags.length})`}</span>
            {expanded ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        )}
      </div>

      {/* Tags List Container - flex-wrap with a small gap for compact, balanced wrapping */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {visibleTags.map(({ tag, count }) => {
          const isSelected = selectedTag === tag;
          return (
            <button
              key={tag}
              type="button"
              onClick={() => onSelectTag(isSelected ? null : tag)}
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-medium border border-[#171717] transition-all select-none whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#FFD84D] text-[#171717] font-bold shadow-[2px_2px_0_#171717] -translate-y-0.5'
                  : 'bg-[#FFFFFF] text-[#5F5E5A] hover:text-[#171717] hover:bg-[#FBF7EF] shadow-[1px_1px_0_#171717] hover:-translate-y-0.5'
              }`}
            >
              <span>#{tag}</span>
              <span className="text-[10px] opacity-70">({count})</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
