import React, { useState, useEffect, useRef } from 'react';
import { Tag, Edit3, Trash2, Plus, X, AlertTriangle } from 'lucide-react';

export type TagModalMode = 'create' | 'edit' | 'delete' | null;

export interface TagEditModalProps {
  isOpen: boolean;
  mode: TagModalMode;
  targetTag: string | null;
  onClose: () => void;
  onCreateTag: (newTag: string) => void;
  onRenameTag: (oldTag: string, newTag: string) => void;
  onDeleteTag: (tagToDelete: string) => void;
  existingTags: string[];
}

export const TagEditModal: React.FC<TagEditModalProps> = ({
  isOpen,
  mode,
  targetTag,
  onClose,
  onCreateTag,
  onRenameTag,
  onDeleteTag,
  existingTags,
}) => {
  const [tagName, setTagName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && targetTag) {
        setTagName(targetTag);
      } else {
        setTagName('');
      }
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, mode, targetTag]);

  if (!isOpen || !mode) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = tagName.trim().replace(/^#+/, '');

    if (mode === 'create') {
      if (!clean) {
        setError('标签名称不能为空');
        return;
      }
      if (existingTags.some((t) => t.toLowerCase() === clean.toLowerCase())) {
        setError('该标签已存在');
        return;
      }
      onCreateTag(clean);
      onClose();
    } else if (mode === 'edit' && targetTag) {
      if (!clean) {
        setError('标签名称不能为空');
        return;
      }
      if (clean === targetTag) {
        onClose();
        return;
      }
      if (
        existingTags.some(
          (t) => t.toLowerCase() === clean.toLowerCase() && t !== targetTag
        )
      ) {
        setError('已存在同名标签');
        return;
      }
      onRenameTag(targetTag, clean);
      onClose();
    } else if (mode === 'delete' && targetTag) {
      onDeleteTag(targetTag);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="tag-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[6px_6px_0_#171717] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-2 border-[#171717] bg-[#FBF7EF]">
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-[#FFD84D] border-2 border-[#171717] flex items-center justify-center shadow-[2px_2px_0_#171717]">
              {mode === 'create' ? (
                <Plus className="w-4 h-4 text-[#171717] stroke-[3]" />
              ) : mode === 'edit' ? (
                <Edit3 className="w-4 h-4 text-[#171717] stroke-[2.5]" />
              ) : (
                <Trash2 className="w-4 h-4 text-[#171717] stroke-[2.5]" />
              )}
            </span>
            <h2 id="tag-modal-title" className="font-bold text-sm text-[#171717]">
              {mode === 'create'
                ? '新建标签'
                : mode === 'edit'
                ? `编辑标签 #${targetTag}`
                : `删除标签 #${targetTag}`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-[#EDE8DC] border border-transparent hover:border-[#171717] transition-all cursor-pointer"
            aria-label="关闭窗口"
          >
            <X className="w-4 h-4 text-[#171717]" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {mode === 'delete' ? (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3.5 bg-[#FFF1F2] border-2 border-[#E11D48] rounded-xl text-xs text-[#9F1239]">
                <AlertTriangle className="w-5 h-5 shrink-0 text-[#E11D48] mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-sm text-[#9F1239]">
                    确认删除 #{targetTag} 吗？
                  </p>
                  <p className="leading-relaxed">
                    此操作将从所有关联的工作台资源卡片与目标项中解绑并移除该标签，不可撤销。
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label
                  htmlFor="tag-name-input"
                  className="block text-xs font-mono font-bold text-[#5F5E5A] mb-1.5"
                >
                  {mode === 'create' ? '标签名称 (自动补全 # 前缀)' : '新标签名称'}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-mono font-bold text-[#73726C]">
                    #
                  </span>
                  <input
                    ref={inputRef}
                    id="tag-name-input"
                    type="text"
                    value={tagName}
                    onChange={(e) => {
                      setTagName(e.target.value.replace(/^#+/, ''));
                      setError(null);
                    }}
                    placeholder="例如: 架构设计、PGlite、工具链"
                    className="w-full pl-8 pr-3 py-2 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl text-xs font-mono font-bold text-[#171717] placeholder:text-[#888780] focus:outline-none focus:bg-[#FFFFFF] focus:shadow-[2px_2px_0_#171717] transition-all"
                  />
                </div>
                {error && (
                  <p className="mt-1.5 text-[11px] font-mono font-bold text-[#E11D48]">
                    {error}
                  </p>
                )}
              </div>

              <div className="p-3 bg-[#FBF7EF] border border-[#171717] rounded-xl text-[11px] font-mono text-[#5F5E5A] space-y-1">
                <span className="font-bold text-[#171717] flex items-center gap-1">
                  <Tag className="w-3 h-3 text-[#171717]" /> 标签联动说明：
                </span>
                <p>
                  {mode === 'create'
                    ? '新建标签后将在常用标签筛选区立即可见，并可直接在各页面卡片及编辑表单中绑定使用。'
                    : '保存修改后将自动同步更新全站所有已关联该标签的资源档案与目标项。'}
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t-2 border-[#171717]">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl border-2 border-[#171717] bg-[#FFFFFF] hover:bg-[#FBF7EF] text-xs font-mono font-bold text-[#171717] shadow-[2px_2px_0_#171717] hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              取消
            </button>
            <button
              type="submit"
              className={`px-4 py-1.5 rounded-xl border-2 border-[#171717] text-xs font-mono font-bold text-[#171717] shadow-[2px_2px_0_#171717] hover:-translate-y-0.5 transition-all cursor-pointer ${
                mode === 'delete'
                  ? 'bg-[#FFB4C6] hover:bg-[#F43F5E] hover:text-[#FFFFFF]'
                  : 'bg-[#FFD84D] hover:bg-[#FACC15]'
              }`}
            >
              {mode === 'create'
                ? '确认创建'
                : mode === 'edit'
                ? '保存修改'
                : '确认删除'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
