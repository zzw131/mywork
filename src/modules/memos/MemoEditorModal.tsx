/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Memo, formatMemoTime } from './types';
import { updateMemo } from './memosStorage';
import {
  X,
  Pin,
  Archive,
  RotateCcw,
  Trash2,
  Tag as TagIcon,
  Sparkles,
  Loader2,
  Copy,
  Check,
  Calendar,
  Clock,
  Save,
} from 'lucide-react';

interface MemoEditorModalProps {
  memo: Memo | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated: (memo: Memo) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDeleteRequest: (memo: Memo) => void;
  isOwner?: boolean;
}

export const MemoEditorModal: React.FC<MemoEditorModalProps> = ({
  memo,
  isOpen,
  onClose,
  onUpdated,
  onTogglePin,
  onToggleArchive,
  onDeleteRequest,
  isOwner = true,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [copied, setCopied] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isInitialMount = useRef(true);

  // Sync state when incoming memo changes
  useEffect(() => {
    if (memo) {
      setTitle(memo.title || '');
      setContent(memo.content || '');
      setTags(memo.tags || []);
      setTagInput('');
      setSaveStatus('idle');
      isInitialMount.current = true;
    }
  }, [memo]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Auto-save logic (debounced 600ms)
  const triggerAutoSave = (newTitle: string, newContent: string, newTags: string[]) => {
    if (!memo || !isOwner) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    setSaveStatus('saving');

    debounceTimerRef.current = setTimeout(() => {
      // TODO: replace with Memo API (PUT /api/memos/:id)
      const updated = updateMemo(memo.id, {
        title: newTitle.trim() || undefined,
        content: newContent,
        tags: newTags,
      });

      if (updated) {
        onUpdated(updated);
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('idle');
      }
    }, 600);
  };

  const handleManualSave = () => {
    if (!memo || !isOwner) return;
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    const finalTags = [...tags];
    if (tagInput.trim()) {
      const clean = tagInput.trim().replace(/^#+/, '');
      if (clean && !finalTags.includes(clean)) {
        finalTags.push(clean);
        setTags(finalTags);
        setTagInput('');
      }
    }

    setSaveStatus('saving');

    // TODO: replace with Memo API (PUT /api/memos/:id)
    const updated = updateMemo(memo.id, {
      title: title.trim() || undefined,
      content,
      tags: finalTags,
    });

    if (updated) {
      onUpdated(updated);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('idle');
    }
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerAutoSave(val, content, tags);
  };

  const handleContentChange = (val: string) => {
    setContent(val);
    triggerAutoSave(title, val, tags);
  };

  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.trim().replace(/^#+/, '');
    if (clean && !tags.includes(clean)) {
      const nextTags = [...tags, clean];
      setTags(nextTags);
      triggerAutoSave(title, content, nextTags);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    triggerAutoSave(title, content, nextTags);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      handleRemoveTag(tags[tags.length - 1]);
    }
  };

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleManualSave();
    }
  };

  const handleCopy = () => {
    if (!memo) return;
    try {
      navigator.clipboard.writeText(`${title ? title + '\n\n' : ''}${content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // ignore
    }
  };

  if (!isOpen || !memo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#171717]/60 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[8px_8px_0_#171717] flex flex-col max-h-[90vh] overflow-hidden select-text animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-[#171717] bg-[#FBF7EF] shrink-0">
          <div className="flex items-center gap-2">
            {isOwner ? (
              <>
                <button
                  type="button"
                  onClick={() => onTogglePin(memo.id)}
                  title={memo.pinned ? '取消置顶' : '置顶备忘'}
                  className={`p-1.5 rounded-lg border-2 border-[#171717] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 ${
                    memo.pinned
                      ? 'bg-[#FFD84D] text-[#171717]'
                      : 'bg-[#FFFFFF] text-[#5F5E5A] hover:bg-[#EDE8DC]'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{memo.pinned ? '已置顶' : '置顶'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleArchive(memo.id)}
                  title={memo.archived ? '移出归档' : '放入归档'}
                  className={`p-1.5 rounded-lg border-2 border-[#171717] text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 ${
                    memo.archived
                      ? 'bg-[#A9E5C3] text-[#171717]'
                      : 'bg-[#FFFFFF] text-[#5F5E5A] hover:bg-[#EDE8DC]'
                  }`}
                >
                  {memo.archived ? (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>已归档</span>
                    </>
                  ) : (
                    <>
                      <Archive className="w-3.5 h-3.5" />
                      <span>归档</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <span className="px-2.5 py-1 rounded-lg border border-[#171717] bg-[#EDE8DC] text-xs font-mono font-bold text-[#5F5E5A]">
                访客只读模式
              </span>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-lg border-2 border-[#171717] bg-[#FFFFFF] text-[#5F5E5A] hover:bg-[#EDE8DC] text-xs font-mono font-bold flex items-center gap-1 transition-all cursor-pointer shadow-[2px_2px_0_#171717]"
              title="复制全部正文"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制' : '复制'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {isOwner && (
              <button
                type="button"
                onClick={() => onDeleteRequest(memo)}
                title="删除此备忘"
                className="p-1.5 rounded-lg border-2 border-[#171717] bg-[#FFFFFF] hover:bg-[#FFB4C6] text-[#9F1239] transition-all cursor-pointer shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              title="关闭 (ESC)"
              className="p-1.5 rounded-lg border-2 border-[#171717] bg-[#FFFFFF] hover:bg-[#EDE8DC] text-[#171717] transition-all cursor-pointer shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Editor Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Title Input */}
          <div>
            <input
              type="text"
              value={title}
              readOnly={!isOwner}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder={isOwner ? "添加备忘标题（留空自动使用第一行）" : "无标题备忘"}
              className={`w-full text-base sm:text-lg font-bold text-[#171717] placeholder-[#888780] bg-transparent outline-none pb-1.5 ${
                isOwner ? "border-b-2 border-transparent hover:border-[#EDE8DC] focus:border-[#171717] transition-colors" : "cursor-default"
              }`}
            />
          </div>

          {/* Content Textarea */}
          <div>
            <textarea
              value={content}
              readOnly={!isOwner}
              onChange={(e) => handleContentChange(e.target.value)}
              onKeyDown={handleContentKeyDown}
              placeholder={isOwner ? "输入一个想法、临时信息、工作记录……" : "暂无正文内容"}
              rows={12}
              className={`w-full text-xs sm:text-sm font-mono text-[#171717] placeholder-[#888780] bg-transparent border-none outline-none resize-none leading-relaxed min-h-[220px] ${
                !isOwner ? "cursor-default" : ""
              }`}
            />
          </div>

          {/* Tags Editor */}
          <div className="pt-3 border-t border-[#EDE8DC]">
            <div className="flex items-center flex-wrap gap-1.5">
              <TagIcon className="w-3.5 h-3.5 text-[#888780] shrink-0 mr-1" />

              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold bg-[#EDE8DC] text-[#171717] border border-[#171717] rounded shadow-[1px_1px_0_#171717]"
                >
                  <span>#{t}</span>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-[#FF3B30] cursor-pointer"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  )}
                </span>
              ))}

              {isOwner && (
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="+ 添加标签 (回车保存)"
                  className="text-xs font-mono px-2 py-0.5 bg-transparent border border-dashed border-[#888780] hover:border-[#171717] focus:border-solid focus:border-[#171717] focus:bg-[#FBF7EF] rounded outline-none placeholder-[#888780] min-w-[120px]"
                />
              )}
            </div>
          </div>
        </div>

        {/* Footer: Metadata & Save Status & Manual Action */}
        <div className="px-5 py-3 border-t-2 border-[#171717] bg-[#FBF7EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono text-[#5F5E5A] shrink-0">
          {/* Timestamps */}
          <div className="flex items-center gap-3 text-[11px] flex-wrap">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[#888780]" />
              <span>创建: {formatMemoTime(memo.createdAt)}</span>
            </span>
            <span className="text-[#888780]">·</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#888780]" />
              <span>更新: {formatMemoTime(memo.updatedAt)}</span>
            </span>
          </div>

          {/* Save Status & Action */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            {isOwner ? (
              <>
                {/* Live save indicator */}
                <div className="flex items-center gap-1.5 text-xs">
                  {saveStatus === 'saving' && (
                    <span className="inline-flex items-center gap-1 text-[#B45309] font-bold">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>保存中…</span>
                    </span>
                  )}
                  {saveStatus === 'saved' && (
                    <span className="inline-flex items-center gap-1 text-[#15803d] font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                      <span>已保存 ✓</span>
                    </span>
                  )}
                  {saveStatus === 'idle' && (
                    <span className="text-[#888780] text-[11px]">
                      自动保存中 · 随时修改
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleManualSave}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-mono font-bold bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>保存 (⌘+Enter)</span>
                </button>
              </>
            ) : (
              <span className="text-xs font-mono text-[#888780]">
                访客只读模式 · 无编辑保存权限
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
