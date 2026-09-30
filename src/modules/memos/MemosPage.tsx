/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Memo, MemoFilterTab } from './types';
import {
  loadMemos,
  createMemo,
  togglePinMemo,
  toggleArchiveMemo,
  deleteMemo,
  sortMemos,
} from './memosStorage';
import { MemoCard } from './MemoCard';
import { MemoListItem } from './MemoListItem';
import { MemoEditorModal } from './MemoEditorModal';
import { MemoDeleteModal } from './MemoDeleteModal';
import { TagPanel } from '../../components/layout/TagPanel';
import { UserIdentity } from '../../types';
import {
  FileText,
  Pin,
  Clock,
  Archive,
  RotateCcw,
  Sparkles,
  Tag,
  Search,
  X,
  Plus,
  Inbox,
  Filter,
  PenLine,
  LayoutGrid,
  List,
} from 'lucide-react';

export interface MemosPageProps {
  identity: UserIdentity;
  editMode?: boolean;
  onBackToWorkbench: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const MemosPage: React.FC<MemosPageProps> = ({
  identity,
  onBackToWorkbench,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
}) => {
  const isOwner = identity.role === 'owner';
  const [memos, setMemos] = useState<Memo[]>([]);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const activeSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const handleSearchChange = externalOnSearchChange || setInternalSearchQuery;

  // Filter tab: 'all' | 'pinned' | 'recent'
  const [activeTab, setActiveTab] = useState<MemoFilterTab>('all');
  // Selected tag filter
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  // View archived toggle
  const [showArchivedOnly, setShowArchivedOnly] = useState(false);

  // Layout view mode: 'card' | 'list'
  const [viewMode, setViewMode] = useState<'card' | 'list'>(() => {
    try {
      const saved = localStorage.getItem('memos_view_mode');
      if (saved === 'card' || saved === 'list') {
        return saved;
      }
      return 'card';
    } catch {
      return 'card';
    }
  });

  const handleViewModeChange = (mode: 'card' | 'list') => {
    setViewMode(mode);
    try {
      localStorage.setItem('memos_view_mode', mode);
    } catch {
      // ignore
    }
  };

  // Modals state
  const [editingMemo, setEditingMemo] = useState<Memo | null>(null);
  const [deletingMemo, setDeletingMemo] = useState<Memo | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load memos initially
  useEffect(() => {
    setMemos(loadMemos());
  }, []);

  // Sync across tabs/windows
  useEffect(() => {
    const handleMemosUpdated = () => {
      setMemos(loadMemos());
    };
    const handleOpenCreateMemo = () => {
      const newMemo = createMemo({ content: '', title: '' });
      setEditingMemo(newMemo);
    };
    window.addEventListener('workbench:memos-updated', handleMemosUpdated);
    window.addEventListener('workbench:open-create-memo', handleOpenCreateMemo);
    window.addEventListener('workbench:open-write-memo', handleOpenCreateMemo);
    return () => {
      window.removeEventListener('workbench:memos-updated', handleMemosUpdated);
      window.removeEventListener('workbench:open-create-memo', handleOpenCreateMemo);
      window.removeEventListener('workbench:open-write-memo', handleOpenCreateMemo);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Dynamic tags computed from all non-archived memos (or current visible scope)
  const dynamicTags = useMemo(() => {
    const tagCountMap = new Map<string, number>();
    memos
      .filter((m) => !m.archived)
      .forEach((m) => {
        m.tags?.forEach((t) => {
          tagCountMap.set(t, (tagCountMap.get(t) || 0) + 1);
        });
      });

    return Array.from(tagCountMap.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([name, count]) => ({ name, count }));
  }, [memos]);

  // Counts for tabs
  const activeMemos = useMemo(() => memos.filter((m) => !m.archived), [memos]);
  const archivedMemos = useMemo(() => memos.filter((m) => m.archived), [memos]);
  const pinnedMemosCount = useMemo(() => activeMemos.filter((m) => m.pinned).length, [activeMemos]);

  // "最近" (updated within last 3 days or top 10 recent)
  const recentMemosCount = useMemo(() => {
    const threeDaysAgo = Date.now() - 3 * 24 * 3600 * 1000;
    return activeMemos.filter((m) => new Date(m.updatedAt || m.createdAt).getTime() >= threeDaysAgo).length;
  }, [activeMemos]);

  // Filtered and sorted memos
  const filteredMemos = useMemo(() => {
    let list = showArchivedOnly ? archivedMemos : activeMemos;

    // 1. Tab filter (only applies when not in archived view)
    if (!showArchivedOnly) {
      if (activeTab === 'pinned') {
        list = list.filter((m) => m.pinned);
      } else if (activeTab === 'recent') {
        const threeDaysAgo = Date.now() - 3 * 24 * 3600 * 1000;
        list = list.filter((m) => new Date(m.updatedAt || m.createdAt).getTime() >= threeDaysAgo);
      }
    }

    // 2. Tag filter
    if (selectedTag) {
      list = list.filter((m) => m.tags?.includes(selectedTag));
    }

    // 3. Search query filter (title, content, tags)
    const q = activeSearchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter((m) => {
        const titleMatch = m.title?.toLowerCase().includes(q);
        const contentMatch = m.content.toLowerCase().includes(q);
        const tagsMatch = m.tags?.some((t) => t.toLowerCase().includes(q));
        return titleMatch || contentMatch || tagsMatch;
      });
    }

    // 4. Default Sort: Pinned first, then updatedAt desc
    return sortMemos(list);
  }, [showArchivedOnly, archivedMemos, activeMemos, activeTab, selectedTag, activeSearchQuery]);

  // Action handlers
  const handleTogglePin = (id: string) => {
    const updated = togglePinMemo(id);
    if (updated) {
      setMemos(loadMemos());
      showToast(updated.pinned ? '📌 备忘已置顶' : '已取消置顶');
      if (editingMemo && editingMemo.id === id) {
        setEditingMemo(updated);
      }
    }
  };

  const handleToggleArchive = (id: string) => {
    const updated = toggleArchiveMemo(id);
    if (updated) {
      setMemos(loadMemos());
      showToast(updated.archived ? '📦 已移入归档' : '已移出归档');
      if (editingMemo && editingMemo.id === id) {
        setEditingMemo(updated);
      }
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingMemo) return;
    const ok = deleteMemo(deletingMemo.id);
    if (ok) {
      setMemos(loadMemos());
      showToast('🗑️ 备忘已删除');
      if (editingMemo && editingMemo.id === deletingMemo.id) {
        setEditingMemo(null);
      }
    }
    setDeletingMemo(null);
  };

  const handleEditorUpdated = (updated: Memo) => {
    setMemos(loadMemos());
  };

  return (
    <div className="w-full bg-[#FBF7EF] text-[#171717] pb-20 flex flex-col flex-1">
      {/* Toast floating indicator */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-[#FFD84D] text-[#171717] border-2 border-[#171717] font-mono font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-[4px_4px_0_#171717] animate-in fade-in slide-in-from-top-2 duration-150">
          {toastMessage}
        </div>
      )}

      {/* ===================== FILTER TABS & ARCHIVE ACCESS (Sticky Container 2) ===================== */}
      <div
        className="sticky z-20 bg-[#FBF7EF]/95 backdrop-blur-md pt-3.5 pb-4 sm:pt-4.5 sm:pb-5 border-b border-[#171717]/10"
        style={{ top: 'var(--search-bar-height, 0px)' }}
      >
        <div className="w-full px-4 sm:px-8 space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[40px]">
          {/* Main Filter Tabs: 全部, 置顶, 最近 (Anti-clipping with padding & flex-wrap) */}
          <div
            role="tablist"
            aria-label="备忘录筛选"
            className="flex items-center gap-2 sm:gap-2.5 flex-wrap p-1 -m-1"
          >
            {[
              {
                key: 'all' as const,
                label: '全部',
                count: activeMemos.length,
                icon: <Sparkles className="w-4 h-4 shrink-0" />,
              },
              {
                key: 'pinned' as const,
                label: '置顶',
                count: pinnedMemosCount,
                icon: <Pin className="w-4 h-4 shrink-0" />,
              },
              {
                key: 'recent' as const,
                label: '最近',
                count: recentMemosCount,
                icon: <Clock className="w-4 h-4 shrink-0" />,
              },
            ].map((tab) => {
              const isActive = !showArchivedOnly && activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => {
                    setShowArchivedOnly(false);
                    setActiveTab(tab.key);
                    setSelectedTag(null);
                  }}
                  className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl border-2 border-[#171717] inline-flex items-center gap-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer select-none ${
                    isActive
                      ? 'bg-[#171717] text-[#FFFFFF] shadow-[3px_3px_0_#FFD84D]'
                      : 'bg-[#FFFFFF] text-[#171717] hover:bg-[#FBF7EF] shadow-[3px_3px_0_#171717]'
                  }`}
                >
                  <span className={`shrink-0 flex items-center ${isActive ? 'text-[#FFD84D]' : 'text-[#5F5E5A]'}`}>
                    {tab.icon}
                  </span>
                  <span className="leading-none">{tab.label}</span>
                  <span
                    className={`inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] rounded-md text-[11px] font-mono font-bold leading-none shrink-0 ${
                      isActive ? 'bg-[#FFFFFF] text-[#171717]' : 'bg-[#EDE8DC] text-[#171717]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right Side: Layout Switcher & Lightweight Archive Switcher */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0 p-1 -m-1 flex-wrap">
            {/* 布局切换器：卡片模式 / 列表模式 */}
            <div
              role="group"
              aria-label="备忘录展示布局"
              className="flex items-center bg-[#EDE8DC] p-0.5 border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717]"
            >
              <button
                type="button"
                onClick={() => handleViewModeChange('card')}
                className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer select-none ${
                  viewMode === 'card'
                    ? 'bg-[#171717] text-[#FFFFFF] shadow-[1px_1px_0_#FFD84D]'
                    : 'text-[#5F5E5A] hover:text-[#171717]'
                }`}
                title="切换为卡片模式"
                aria-pressed={viewMode === 'card'}
              >
                <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">卡片</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('list')}
                className={`h-8 sm:h-9 px-2.5 sm:px-3 rounded-lg flex items-center gap-1.5 text-xs font-mono font-bold transition-all cursor-pointer select-none ${
                  viewMode === 'list'
                    ? 'bg-[#171717] text-[#FFFFFF] shadow-[1px_1px_0_#FFD84D]'
                    : 'text-[#5F5E5A] hover:text-[#171717]'
                }`}
                title="切换为列表模式"
                aria-pressed={viewMode === 'list'}
              >
                <List className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">列表</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowArchivedOnly((prev) => !prev);
                setSelectedTag(null);
              }}
              className={`h-9 sm:h-10 px-3.5 sm:px-4 inline-flex items-center gap-2 text-xs sm:text-sm font-bold rounded-xl border-2 border-[#171717] transition-all cursor-pointer whitespace-nowrap shadow-[3px_3px_0_#171717] hover:-translate-y-0.5 ${
                showArchivedOnly
                  ? 'bg-[#171717] text-[#FFFFFF] shadow-[3px_3px_0_#FFD84D]'
                  : 'bg-[#FFFFFF] text-[#171717] hover:bg-[#FBF7EF]'
              }`}
            >
              <Archive className={`w-4 h-4 shrink-0 ${showArchivedOnly ? 'text-[#FFD84D]' : 'text-[#5F5E5A]'}`} />
              <span className="leading-none">{showArchivedOnly ? '正在查看归档' : '已归档'}</span>
              <span
                className={`inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] rounded-md text-[11px] font-mono font-bold leading-none shrink-0 ${
                  showArchivedOnly ? 'bg-[#FFFFFF] text-[#171717]' : 'bg-[#EDE8DC] text-[#171717]'
                }`}
              >
                {archivedMemos.length}
              </span>
            </button>

            {/* Admin Add Memo Button */}
            {isOwner && (
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('workbench:open-write-memo'));
                }}
                className="h-9 sm:h-10 px-3.5 sm:px-4 inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] hover:-translate-y-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>新建备忘</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Common Tag Cloud (使用统一样式 TagPanel) */}
        {dynamicTags.length > 0 && !showArchivedOnly && (
          <TagPanel
            tags={dynamicTags.map((t) => ({ tag: t.name, count: t.count }))}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            topLimit={8}
            title="常用标签"
          />
        )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="w-full px-4 sm:px-8 pt-6 sm:pt-8 pb-12 space-y-6 flex-1">
      {(activeSearchQuery || selectedTag) && (
        <div className="flex items-center justify-between px-4 py-2 bg-[#FFF9E6] border-2 border-[#171717] rounded-xl text-xs font-mono text-[#171717]">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold">当前筛选条件:</span>
            {activeSearchQuery && (
              <span className="px-2 py-0.5 bg-[#FFFFFF] border border-[#171717] rounded">
                关键词: &quot;{activeSearchQuery}&quot;
              </span>
            )}
            {selectedTag && (
              <span className="px-2 py-0.5 bg-[#FFD84D] border border-[#171717] rounded">
                标签: #{selectedTag}
              </span>
            )}
            <span className="text-[#5F5E5A]">找到 {filteredMemos.length} 条备忘</span>
          </div>

          <button
            type="button"
            onClick={() => {
              handleSearchChange('');
              setSelectedTag(null);
            }}
            className="hover:underline text-[#171717] font-bold cursor-pointer"
          >
            重置全部筛选
          </button>
        </div>
      )}

      {/* ===================== MEMO ITEMS (CARD OR LIST VIEW) ===================== */}
      {filteredMemos.length > 0 ? (
        viewMode === 'card' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-150">
            {filteredMemos.map((memo) => (
              <MemoCard
                key={memo.id}
                memo={memo}
                onClick={(m) => setEditingMemo(m)}
                onTogglePin={handleTogglePin}
                onToggleArchive={handleToggleArchive}
                onDeleteRequest={(m) => setDeletingMemo(m)}
                onTagClick={(t) => setSelectedTag(t)}
                isOwner={isOwner}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col space-y-3 animate-in fade-in duration-150">
            {filteredMemos.map((memo) => (
              <MemoListItem
                key={memo.id}
                memo={memo}
                onClick={(m) => setEditingMemo(m)}
                onTogglePin={handleTogglePin}
                onToggleArchive={handleToggleArchive}
                onDeleteRequest={(m) => setDeletingMemo(m)}
                onTagClick={(t) => setSelectedTag(t)}
                isOwner={isOwner}
              />
            ))}
          </div>
        )
      ) : (
        /* ===================== EMPTY STATE ===================== */
        <div className="p-12 bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[6px_6px_0_#171717] text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#EDE8DC] border-2 border-[#171717] flex items-center justify-center mx-auto shadow-[3px_3px_0_#171717]">
            <Inbox className="w-7 h-7 text-[#5F5E5A]" />
          </div>

          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base font-bold text-[#171717]">
              {activeSearchQuery || selectedTag
                ? '未检索到匹配的备忘内容'
                : showArchivedOnly
                ? '归档箱暂无备忘'
                : activeTab === 'pinned'
                ? '暂无置顶备忘'
                : '暂无备忘条目'}
            </h3>
            <p className="text-xs font-mono text-[#5F5E5A] leading-relaxed">
              {activeSearchQuery || selectedTag
                ? '尝试修改搜索关键词或清空当前标签筛选。'
                : showArchivedOnly
                ? '完成处理的备忘可以随时在此归档保存。'
                : isOwner
                ? '在页面上方点击“写备忘录”，随手展开浮动卡片记下第一条闪念。'
                : '当前系统暂无公开的备忘记录。'}
            </p>
          </div>

          {(activeSearchQuery || selectedTag) && (
            <button
              type="button"
              onClick={() => {
                handleSearchChange('');
                setSelectedTag(null);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold bg-[#FFD84D] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] cursor-pointer"
            >
              清空搜索与筛选
            </button>
          )}

          {isOwner && !activeSearchQuery && !selectedTag && !showArchivedOnly && (
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('workbench:open-write-memo'));
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold bg-[#FFD84D] hover:bg-[#FFE066] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] cursor-pointer"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>写第一条备忘录</span>
            </button>
          )}
        </div>
      )}
      </div>

      {/* ===================== EDIT MODAL ===================== */}
      <MemoEditorModal
        memo={editingMemo}
        isOpen={!!editingMemo}
        onClose={() => setEditingMemo(null)}
        onUpdated={handleEditorUpdated}
        onTogglePin={handleTogglePin}
        onToggleArchive={handleToggleArchive}
        onDeleteRequest={(m) => {
          setDeletingMemo(m);
        }}
        isOwner={isOwner}
      />

      {/* ===================== DELETE CONFIRM MODAL ===================== */}
      <MemoDeleteModal
        memo={deletingMemo}
        isOpen={!!deletingMemo}
        onClose={() => setDeletingMemo(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
