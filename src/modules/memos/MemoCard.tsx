/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Memo, getMemoDisplayTitle, getMemoSnippet, formatMemoTime } from './types';
import { Pin, MoreHorizontal, Archive, Trash2, RotateCcw, Copy, Check } from 'lucide-react';

interface MemoCardProps {
  memo: Memo;
  onClick: (memo: Memo) => void;
  onTogglePin: (id: string) => void;
  onToggleArchive: (id: string) => void;
  onDeleteRequest: (memo: Memo) => void;
  onTagClick?: (tag: string) => void;
  isOwner?: boolean;
}

export const MemoCard: React.FC<MemoCardProps> = ({
  memo,
  onClick,
  onTogglePin,
  onToggleArchive,
  onDeleteRequest,
  onTagClick,
  isOwner = true,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const displayTitle = getMemoDisplayTitle(memo);
  const snippet = getMemoSnippet(memo);
  const timeDisplay = formatMemoTime(memo.updatedAt || memo.createdAt);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [menuOpen]);

  const handleCopyContent = (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      navigator.clipboard.writeText(`${memo.title ? memo.title + '\n\n' : ''}${memo.content}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
      setMenuOpen(false);
    } catch {
      // ignore
    }
  };

  return (
    <div
      onClick={() => onClick(memo)}
      className={`v4-card group relative flex flex-col justify-between p-4 sm:p-5 cursor-pointer select-none bg-[#FFFFFF] border-2 border-[#171717] rounded-xl transition-all duration-150 min-h-[175px] ${
        memo.pinned
          ? 'bg-[#FFFDF5] shadow-[5px_5px_0_#171717] hover:shadow-[7px_7px_0_#171717]'
          : 'shadow-[4px_4px_0_#171717] hover:shadow-[6px_6px_0_#171717]'
      } hover:-translate-x-0.5 hover:-translate-y-0.5`}
    >
      {/* Top Bar: Pin Indicator & Title & Menu Button */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {memo.pinned && (
            <span
              title="已置顶"
              className="inline-flex items-center justify-center w-5 h-5 rounded-md bg-[#FFD84D] border border-[#171717] text-[#171717] shrink-0 text-xs shadow-[1px_1px_0_#171717] mt-0.5"
            >
              📌
            </span>
          )}
          <h3 className="text-sm sm:text-base font-bold text-[#171717] tracking-tight leading-snug break-words line-clamp-2">
            {displayTitle}
          </h3>
        </div>

        {/* More Actions Menu Button */}
        <div className="relative shrink-0" ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            aria-label="更多操作"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="w-7 h-7 rounded-lg border border-transparent hover:border-[#171717] hover:bg-[#EDE8DC] flex items-center justify-center text-[#5F5E5A] hover:text-[#171717] transition-all cursor-pointer"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>

          {/* Dropdown Menu */}
          {menuOpen && (
            <div className="absolute right-0 top-full mt-1 w-36 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] p-1.5 z-40 animate-in fade-in zoom-in-95 duration-100 font-mono text-xs">
              {isOwner && (
                <button
                  type="button"
                  onClick={() => {
                    onTogglePin(memo.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FBF7EF] text-[#171717] flex items-center gap-2 cursor-pointer font-bold"
                >
                  <Pin className="w-3.5 h-3.5" />
                  <span>{memo.pinned ? '取消置顶' : '置顶备忘'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyContent}
                className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FBF7EF] text-[#171717] flex items-center gap-2 cursor-pointer font-bold"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '已复制内容' : '复制正文'}</span>
              </button>

              {isOwner && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onToggleArchive(memo.id);
                      setMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FBF7EF] text-[#171717] flex items-center gap-2 cursor-pointer font-bold"
                  >
                    {memo.archived ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>移出归档</span>
                      </>
                    ) : (
                      <>
                        <Archive className="w-3.5 h-3.5" />
                        <span>归档备忘</span>
                      </>
                    )}
                  </button>

                  <div className="my-1 border-t border-[#EDE8DC]" />

                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onDeleteRequest(memo);
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-[#FFB4C6] text-[#9F1239] flex items-center gap-2 cursor-pointer font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除备忘</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Middle: Truncated Content Snippet */}
      <div className="flex-1 my-2">
        <p className="text-xs sm:text-sm text-[#5F5E5A] font-mono leading-relaxed line-clamp-3 sm:line-clamp-4 whitespace-pre-wrap break-words">
          {snippet}
        </p>
      </div>

      {/* Bottom Area: Tags & Timestamp */}
      <div className="pt-2.5 mt-1 border-t border-[#EDE8DC] flex flex-col gap-2">
        {/* Tags Row */}
        {memo.tags && memo.tags.length > 0 && (
          <div className="flex items-center flex-wrap gap-1.5">
            {memo.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onTagClick?.(tag);
                }}
                className="inline-flex items-center text-[11px] font-mono font-bold px-1.5 py-0.5 bg-[#EDE8DC] hover:bg-[#FFD84D] text-[#171717] border border-[#171717] rounded shadow-[1px_1px_0_#171717] transition-colors cursor-pointer"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}

        {/* Footer: Time & Archived Flag */}
        <div className="flex items-center justify-between text-[11px] font-mono text-[#888780]">
          <span className="flex items-center gap-1.5">
            <span>{timeDisplay}</span>
            {memo.archived && (
              <span className="px-1.5 py-0.2 bg-[#EDE8DC] border border-[#888780] rounded text-[10px] text-[#5F5E5A]">
                已归档
              </span>
            )}
          </span>

          <span className="text-[10px] text-[#888780] opacity-0 group-hover:opacity-100 transition-opacity">
            点击编辑 ↗
          </span>
        </div>
      </div>
    </div>
  );
};
