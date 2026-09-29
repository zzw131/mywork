/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Plus, Tag as TagIcon, X, CornerDownLeft, Sparkles } from 'lucide-react';
import { createMemo } from './memosStorage';
import { Memo } from './types';

interface MemoQuickInputProps {
  onMemoCreated?: (memo: Memo) => void;
  availableTags?: string[];
  onClose?: () => void;
}

export const MemoQuickInput: React.FC<MemoQuickInputProps> = ({
  onMemoCreated,
  availableTags = [],
  onClose,
}) => {
  const [showTitleInput, setShowTitleInput] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Close on ESC key if onClose is provided
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Auto-resize textarea as content grows
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(88, textareaRef.current.scrollHeight)}px`;
    }
  }, [content]);

  const handleAddTag = (rawTag: string) => {
    const clean = rawTag.trim().replace(/^#+/, '');
    if (clean && !tags.includes(clean)) {
      setTags((prev) => [...prev, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ' ' || e.key === ',') {
      e.preventDefault();
      handleAddTag(tagInput);
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    const trimmedContent = content.trim();
    if (!trimmedContent) {
      textareaRef.current?.focus();
      return;
    }

    setIsSubmitting(true);

    // If tagInput has pending text, include it as well
    const finalTags = [...tags];
    if (tagInput.trim()) {
      const clean = tagInput.trim().replace(/^#+/, '');
      if (clean && !finalTags.includes(clean)) {
        finalTags.push(clean);
      }
    }

    // TODO: replace with Memo API (POST /api/memos)
    const newMemo = createMemo({
      title: title.trim() || undefined,
      content: trimmedContent,
      tags: finalTags,
      pinned: false,
    });

    setIsSubmitting(false);
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);

    // Reset inputs
    setTitle('');
    setContent('');
    setTags([]);
    setTagInput('');
    setShowTitleInput(false);

    if (textareaRef.current) {
      textareaRef.current.style.height = '88px';
    }

    onMemoCreated?.(newMemo);
  };

  const handleContentKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Windows: Ctrl + Enter, Mac: Cmd + Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full bg-transparent">
      {/* Top Header Bar: 无描边容器，已移除“记点什么”前面的 icon */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#EDE8DC]">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-[#171717] tracking-tight">记点什么？</span>
          <span className="text-[11px] font-mono text-[#888780] hidden sm:inline">
            想到什么，快速记下
          </span>
        </div>

        {/* Collapsible "添加标题" toggle */}
        <div className="flex items-center gap-2.5">
          {!showTitleInput ? (
            <button
              type="button"
              onClick={() => setShowTitleInput(true)}
              className="text-xs font-mono text-[#5F5E5A] hover:text-[#171717] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" />
              <span>添加标题</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setShowTitleInput(false);
                setTitle('');
              }}
              className="text-xs font-mono text-[#888780] hover:text-[#171717] flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>收起标题</span>
            </button>
          )}
        </div>
      </div>

      {/* Optional Title Input */}
      {showTitleInput && (
        <div className="mb-2.5 animate-in fade-in slide-in-from-top-1 duration-150">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="标题（可选，留空将自动提取首行作为标题）"
            className="w-full px-3 py-1.5 text-sm font-bold text-[#171717] bg-[#FBF7EF] border border-[#171717] rounded-lg placeholder-[#888780] focus:bg-[#FFFFFF] focus:outline-none focus:ring-1 focus:ring-[#171717]"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleContentKeyDown}
          placeholder="输入一个想法、临时信息、工作记录……"
          rows={3}
          className="w-full text-xs sm:text-sm font-mono text-[#171717] placeholder-[#888780] bg-transparent border-none outline-none resize-none leading-relaxed min-h-[88px]"
        />
      </div>

      {/* Bottom Action Area: Tags & Submit Button */}
      <div className="mt-3 pt-3 border-t border-[#EDE8DC] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tag Input & Pills */}
        <div className="flex items-center flex-wrap gap-1.5 flex-1 min-w-0">
          <TagIcon className="w-3.5 h-3.5 text-[#888780] shrink-0 mr-0.5" />

          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono font-bold bg-[#EDE8DC] text-[#171717] border border-[#171717] rounded shadow-[1px_1px_0_#171717]"
            >
              <span>#{t}</span>
              <button
                type="button"
                onClick={() => handleRemoveTag(t)}
                className="hover:text-[#FF3B30] cursor-pointer"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}

          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder={tags.length === 0 ? '添加 #标签 (按回车)...' : '+ 标签'}
            className="text-xs font-mono px-2 py-0.5 bg-transparent border border-dashed border-[#888780] hover:border-[#171717] focus:border-solid focus:border-[#171717] focus:bg-[#FBF7EF] rounded outline-none placeholder-[#888780] min-w-[110px]"
          />

          {/* Quick recommendations if available and not added */}
          {availableTags.length > 0 && tags.length === 0 && (
            <div className="hidden lg:flex items-center gap-1 text-[11px] font-mono text-[#888780] ml-1">
              <span>常用:</span>
              {availableTags.slice(0, 3).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="hover:text-[#171717] hover:underline cursor-pointer"
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Submit & Shortcut hints */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <span className="text-[11px] font-mono text-[#888780] flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[#EDE8DC] border border-[#171717] rounded text-[10px] font-bold text-[#171717]">
              {typeof navigator !== 'undefined' && /Mac|iPhone|iPad/i.test(navigator.userAgent)
                ? '⌘'
                : 'Ctrl'}
              +Enter
            </kbd>
            <span className="hidden sm:inline">快捷保存</span>
          </span>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!content.trim() || isSubmitting}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-mono font-bold rounded-xl border-2 border-[#171717] transition-all cursor-pointer shadow-[3px_3px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 ${
              justSaved
                ? 'bg-[#A9E5C3] text-[#171717]'
                : !content.trim()
                ? 'bg-[#EDE8DC] text-[#888780] cursor-not-allowed shadow-none border-[#888780]'
                : 'bg-[#FFD84D] text-[#171717] hover:bg-[#FACC15]'
            }`}
          >
            {justSaved ? (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>已保存 ✓</span>
              </>
            ) : (
              <>
                <CornerDownLeft className="w-3.5 h-3.5" />
                <span>保存备忘</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
