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
  customClass = '',
  title = '常用标签',
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
  const hasMore = filteredTags.length > topLimit;

  const displayTitle = title.replace(/[:：]$/, '').trim();

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
    <div className={`w-full mt-3 sm:mt-4 ${customClass}`}>
      {/* Neo-brutalist card container: 相对定位，右上角锚定无边框展开按钮 */}
      <div className="relative p-3 sm:p-3.5 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] min-h-[50px] transition-all">
        {/* 标签流动排布区：右侧保留内边距 pr-24，确保标签换行不遮挡右上角展开按钮 */}
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0 pr-24 sm:pr-28">
          {/* 标头 */}
          <span className="text-xs font-mono font-bold text-[#5F5E5A] flex items-center gap-1 mr-1 shrink-0">
            <Tag className="w-3.5 h-3.5 text-[#171717]" />
            <span>{displayTitle}:</span>
          </span>

          {/* 全部按钮 */}
          <button
            type="button"
            onClick={() => onSelectTag(null)}
            className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-[#171717] transition-all cursor-pointer whitespace-nowrap shrink-0 select-none ${
              selectedTag === null
                ? 'bg-[#171717] text-[#FFFFFF] shadow-[2px_2px_0_#FFD84D]'
                : 'bg-[#EDE8DC] hover:bg-[#FFD84D] text-[#171717]'
            }`}
          >
            #全部
          </button>

          {/* 标签胶囊列表 */}
          {visibleTags.map(({ tag, count }) => {
            const isSelected = selectedTag === tag;
            return (
              <div
                key={tag}
                className="inline-flex items-center"
              >
                <button
                  type="button"
                  onClick={() => onSelectTag(isSelected ? null : tag)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg border border-[#171717] transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 select-none ${
                    isSelected
                      ? 'bg-[#FFD84D] text-[#171717] shadow-[2px_2px_0_#171717]'
                      : 'bg-[#FBF7EF] hover:bg-[#EDE8DC] text-[#171717]'
                  }`}
                >
                  <span>#{tag}</span>
                  <span className="text-[10px] text-[#5F5E5A]">({count})</span>
                </button>

                {/* Edit Mode Quick Actions (改 & 删) */}
                {canEdit && (
                  <div className="flex items-center ml-1 gap-0.5 border-l border-[#171717]/30 pl-1">
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenDelete(tag);
                      }}
                      className="p-1 hover:bg-[#FFF1F2] rounded text-[#E11D48] cursor-pointer"
                      title={`删除标签 #${tag}`}
                    >
                      <Trash2 className="w-2.5 h-2.5 stroke-[2.5]" />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* 增: 新建标签按钮（仅编辑模式展示） */}
          {canEdit && (
            <button
              type="button"
              onClick={handleOpenCreate}
              className="px-2.5 py-1 bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border border-[#171717] rounded-lg text-xs font-mono font-bold inline-flex items-center gap-1 shadow-[1.5px_1.5px_0_#171717] hover:-translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-3 h-3 stroke-[3]" />
              <span>新建标签</span>
            </button>
          )}

          {/* 空状态 */}
          {visibleTags.length === 0 && (
            <span className="text-xs font-mono text-[#888780] py-0.5">
              {searchTag ? `未找到匹配 "#${searchTag}" 的标签` : '暂无标签'}
            </span>
          )}
        </div>

        {/* 始终保持在边框右上角：无边框只保留文字的展开按钮 & 清除筛选 */}
        <div className="absolute top-2.5 sm:top-3 right-3 sm:right-3.5 flex items-center gap-2 select-none z-10">
          {/* Quick Tag Search Input (仅当展开且标签较多时提供微型检索) */}
          {expanded && tags.length > 8 && (
            <div className="relative inline-flex items-center">
              <Search className="w-3 h-3 text-[#73726C] absolute left-1.5 pointer-events-none" />
              <input
                type="text"
                value={searchTag}
                onChange={(e) => setSearchTag(e.target.value)}
                placeholder="检索..."
                className="h-6 pl-5 pr-4 text-[11px] font-mono bg-[#FFFFFF] border border-[#171717] rounded focus:outline-none placeholder:text-[#888780] w-16 sm:w-20 transition-all"
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

          {/* 清除标签筛选 */}
          {selectedTag && (
            <button
              type="button"
              onClick={() => onSelectTag(null)}
              className="text-xs font-mono font-bold text-[#9F1239] hover:underline inline-flex items-center gap-0.5 cursor-pointer whitespace-nowrap mr-1"
              title="清除当前标签筛选"
            >
              <X className="w-3 h-3" />
              <span>清除</span>
            </button>
          )}

          {/* 展开全部 / 收起：无边框只保留文字，始终保持在边框右上角 */}
          {hasMore && (
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-mono font-bold text-[#5F5E5A] hover:text-[#171717] hover:underline cursor-pointer select-none transition-colors inline-flex items-center gap-0.5 border-none bg-transparent shadow-none p-0.5 whitespace-nowrap"
              title={expanded ? '收起多余标签' : `展开全部 (${filteredTags.length})`}
            >
              <span>{expanded ? '收起' : '展开全部'}</span>
              {expanded ? (
                <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
              )}
            </button>
          )}
        </div>
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
