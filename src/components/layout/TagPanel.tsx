import React, { useState, useMemo } from 'react';
import {
  Tag,
  ChevronDown,
  ChevronUp,
  X,
  Plus,
  Edit3,
  Trash2,
  Search,
} from 'lucide-react';
import { TagEditModal, TagModalMode } from './TagEditModal';

export interface TagItem {
  tag: string;
  count: number;
}

export interface TagPanelProps {
  tags: TagItem[];
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  topLimit?: number;
  editMode?: boolean;
  isOwner?: boolean;
  onCreateTag?: (newTag: string) => void;
  onRenameTag?: (oldTag: string, newTag: string) => void;
  onDeleteTag?: (tagToDelete: string) => void;
  customClass?: string;
  title?: string;
}

export const TagPanel: React.FC<TagPanelProps> = ({
  tags,
  selectedTag,
  onSelectTag,
  topLimit = 8,
  editMode = false,
  isOwner = false,
  onCreateTag,
  onRenameTag,
  onDeleteTag,
  customClass = 'w-full md:w-[85%] lg:w-[80%] mx-auto px-4 sm:px-6 pt-2 sm:pt-3 pb-2.5',
  title = '常用标签筛选',
}) => {
  const [expanded, setExpanded] = useState(false);
  const [searchTag, setSearchTag] = useState('');
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    mode: TagModalMode;
    targetTag: string | null;
  }>({
    isOpen: false,
    mode: null,
    targetTag: null,
  });

  const canEdit = editMode && isOwner;

  // Search filter across tags
  const filteredTags = useMemo(() => {
    if (!searchTag.trim()) return tags;
    const q = searchTag.toLowerCase().trim();
    return tags.filter((t) => t.tag.toLowerCase().includes(q));
  }, [tags, searchTag]);

  const visibleTags = expanded || canEdit ? filteredTags : filteredTags.slice(0, topLimit);
  const hasMore = !canEdit && filteredTags.length > topLimit;

  const handleOpenCreate = () => {
    setModalState({ isOpen: true, mode: 'create', targetTag: null });
  };

  const handleOpenEdit = (tag: string) => {
    setModalState({ isOpen: true, mode: 'edit', targetTag: tag });
  };

  const handleOpenDelete = (tag: string) => {
    setModalState({ isOpen: true, mode: 'delete', targetTag: tag });
  };

  return (
    <div className={customClass}>
      {/* Header bar with fixed min-h-[28px] to eliminate layout jitter */}
      <div className="flex items-center justify-between gap-2 min-h-[28px] mb-2 flex-wrap">
        <div className="flex items-center gap-2 min-h-[28px] text-xs font-mono font-bold text-[#5F5E5A] flex-wrap">
          <Tag className="w-3.5 h-3.5 text-[#171717] shrink-0" />
          <span className="shrink-0">{title}</span>

          {/* Active Tag Badge (fixed height to prevent CLS) */}
          {selectedTag && (
            <span className="h-6 inline-flex items-center gap-1 px-2 bg-[#FFD84D] text-[#171717] border border-[#171717] rounded text-[11px] shadow-[1px_1px_0_#171717] shrink-0">
              <span>当前: #{selectedTag}</span>
              <button
                type="button"
                onClick={() => onSelectTag(null)}
                className="hover:opacity-75 p-0.5 cursor-pointer"
                title="清除标签过滤"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}

          {/* Quick Tag Search Input (查: instant query) */}
          {(canEdit || tags.length > 6) && (
            <div className="relative inline-flex items-center ml-1">
              <Search className="w-3 h-3 text-[#73726C] absolute left-2 pointer-events-none" />
              <input
                type="text"
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                placeholder="检索标签..."
                className="h-6 pl-6 pr-5 text-[11px] font-mono font-normal bg-[#FFFFFF] border border-[#171717] rounded-md focus:outline-none focus:ring-1 focus:ring-[#171717] placeholder:text-[#888780] w-24 sm:w-28 transition-all"
              />
              {searchTag && (
                <button
                  type="button"
                  onClick={() => setSearchTag('')}
                  className="absolute right-1 text-[#73726C] hover:text-[#171717] cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right side: Edit Controls & Expand/Collapse */}
        <div className="flex items-center gap-2">
          {/* 增: Add new tag button in edit mode */}
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="h-6 px-2.5 bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border border-[#171717] rounded-md text-[11px] font-mono font-bold inline-flex items-center gap-1 shadow-[1.5px_1.5px_0_#171717] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>新建标签</span>
            </button>
          )}

          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="inline-flex items-center gap-1 text-xs font-mono font-semibold text-[#171717] hover:underline shrink-0 cursor-pointer"
            >
              <span>{expanded ? '收起标签' : `展开全部 (${filteredTags.length})`}</span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tags List Container */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
        {/* All tags button */}
        <button
          type="button"
          onClick={() => onSelectTag(null)}
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-mono font-semibold border border-[#171717] select-none whitespace-nowrap cursor-pointer transition-[background-color,box-shadow,transform] ${
            selectedTag === null
              ? 'bg-[#FFD84D] text-[#171717] shadow-[2px_2px_0_#171717] -translate-y-0.5'
              : 'bg-[#FFFFFF] text-[#5F5E5A] hover:text-[#171717] hover:bg-[#FBF7EF] shadow-[1px_1px_0_#171717] hover:-translate-y-0.5'
          }`}
        >
          <span>#全部</span>
          <span className="text-[10px] opacity-70">
            ({tags.reduce((acc, t) => acc + t.count, 0)})
          </span>
        </button>

        {visibleTags.map(({ tag, count }) => {
          const isSelected = selectedTag === tag;
          return (
            <div
              key={tag}
              className={`group inline-flex items-center rounded-md border border-[#171717] transition-[background-color,box-shadow,transform] ${
                isSelected
                  ? 'bg-[#FFD84D] text-[#171717] shadow-[2px_2px_0_#171717] -translate-y-0.5'
                  : 'bg-[#FFFFFF] text-[#5F5E5A] hover:text-[#171717] hover:bg-[#FBF7EF] shadow-[1px_1px_0_#171717] hover:-translate-y-0.5'
              }`}
            >
              {/* Tag select button */}
              <button
                type="button"
                onClick={() => onSelectTag(isSelected ? null : tag)}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-mono font-semibold select-none whitespace-nowrap cursor-pointer"
              >
                <span>#{tag}</span>
                <span className="text-[10px] opacity-70">({count})</span>
              </button>

              {/* Edit Mode Quick Actions (改 & 删) */}
              {canEdit && (
                <div className="flex items-center pr-1.5 gap-0.5 border-l border-[#171717]/25 pl-1 my-0.5">
                  {/* 改: Rename tag */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEdit(tag);
                    }}
                    className="p-1 hover:bg-[#171717]/10 rounded text-[#171717] cursor-pointer"
                    title={`修改标签 #${tag}`}
                  >
                    <Edit3 className="w-2.5 h-2.5 stroke-[2.5]" />
                  </button>

                  {/* 删: Delete tag */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDelete(tag);
                    }}
                    className="p-1 hover:bg-[#FFF1F2] rounded text-[#E11D48] hover:text-[#BE123C] cursor-pointer"
                    title={`删除标签 #${tag}`}
                  >
                    <Trash2 className="w-2.5 h-2.5 stroke-[2.5]" />
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty state for search */}
        {visibleTags.length === 0 && searchTag && (
          <div className="text-xs font-mono text-[#888780] py-1 px-2">
            未找到匹配 &ldquo;#{searchTag}&rdquo; 的标签
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  onCreateTag?.(searchTag);
                  setSearchTag('');
                }}
                className="ml-2 underline font-bold text-[#171717] hover:text-[#B45309] cursor-pointer"
              >
                立即创建该标签
              </button>
            )}
          </div>
        )}
      </div>

      {/* CRUD Modal for Tag */}
      <TagEditModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        targetTag={modalState.targetTag}
        onClose={() =>
          setModalState({ isOpen: false, mode: null, targetTag: null })
        }
        onCreateTag={(newTag) => {
          onCreateTag?.(newTag);
        }}
        onRenameTag={(oldTag, newTag) => {
          onRenameTag?.(oldTag, newTag);
        }}
        onDeleteTag={(tagToDelete) => {
          onDeleteTag?.(tagToDelete);
        }}
        existingTags={tags.map((t) => t.tag)}
      />
    </div>
  );
};
