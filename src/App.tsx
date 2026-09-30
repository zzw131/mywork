/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { WorkbenchObject, UserIdentity } from './types';
import { FilterCategory, ResourceSize, AppView } from './types/resource';
import { toDatabaseCardSize } from './adapters/resourceAdapter';
import { SEED_OBJECTS } from './data/seedData';
import { V4Header } from './components/v4/V4Header';
import { PageSidebar } from './components/layout/PageSidebar';
import { V4CategoryFilter } from './components/v4/V4CategoryFilter';
import { TagPanel } from './components/layout/TagPanel';
import {
  addCustomTag,
  renameTagAcrossStorage,
  deleteTagAcrossStorage,
  getCustomTags,
} from './utils/tagManager';
import { V4PinnedSection } from './components/v4/V4PinnedSection';
import { HomeGrid } from './components/HomeGrid';
import { DetailModal } from './components/v4/DetailModal';
import { AddResourceModal } from './components/resource/AddResourceModal';
import { V4Footer } from './components/v4/V4Footer';
import { DesignSystemPage } from './components/DesignSystemPage';
import { AdminAuthModal } from './components/v4/AdminAuthModal';
import { ResourceDetailPage } from './components/v4/ResourceDetailPage';
import { GoalsPage } from './modules/goals';
import { MemosPage } from './modules/memos';
import { MemoQuickInput } from './modules/memos/MemoQuickInput';
import { X, Search } from 'lucide-react';

function parseCurrentRoute(): { view: AppView; resourceId: string | null } {
  if (typeof window === 'undefined') return { view: 'workbench', resourceId: null };

  const path = window.location.pathname;
  const hash = window.location.hash;

  // 1. Path match: /resource/:id
  const pathMatch = path.match(/^\/resource\/([^/?#]+)/);
  if (pathMatch) {
    return { view: 'resource-detail', resourceId: decodeURIComponent(pathMatch[1]) };
  }

  // 2. Hash match: #/resource/:id or #resource/:id
  const hashMatch = hash.match(/^#\/?resource\/([^/?#]+)/);
  if (hashMatch) {
    return { view: 'resource-detail', resourceId: decodeURIComponent(hashMatch[1]) };
  }

  // 3. Memos management
  if (path.includes('memos') || hash.includes('memos') || path.includes('memo') || hash.includes('memo')) {
    return { view: 'memos', resourceId: null };
  }

  // 4. Goals management
  if (path.includes('goals') || hash.includes('goals')) {
    return { view: 'goals', resourceId: null };
  }

  // 5. Design system
  if (path.includes('design-system') || hash.includes('design-system')) {
    return { view: 'design-system', resourceId: null };
  }

  return { view: 'workbench', resourceId: null };
}

export default function App() {
  // View routing: 'workbench' | 'memos' | 'goals' | 'design-system' | 'resource-detail'
  const [currentRoute, setCurrentRoute] = useState(parseCurrentRoute);
  const currentView = currentRoute.view;
  const currentResourceId = currentRoute.resourceId;

  // Mobile sidebar drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const navigateToResource = (id: string) => {
    setCurrentRoute({ view: 'resource-detail', resourceId: id });
    setSelectedObject(null);
    setIsMobileSidebarOpen(false);
    try {
      window.history.pushState(
        { view: 'resource-detail', id },
        '',
        `/resource/${encodeURIComponent(id)}`
      );
    } catch {
      window.location.hash = `#/resource/${encodeURIComponent(id)}`;
    }
  };

  const navigateToWorkbench = () => {
    setCurrentRoute({ view: 'workbench', resourceId: null });
    setIsMobileSidebarOpen(false);
    try {
      window.history.pushState({ view: 'workbench' }, '', '/');
    } catch {
      window.location.hash = '#';
    }
  };

  const navigateToMemos = () => {
    setCurrentRoute({ view: 'memos', resourceId: null });
    setIsMobileSidebarOpen(false);
    try {
      window.history.pushState({ view: 'memos' }, '', '/memos');
    } catch {
      window.location.hash = '#memos';
    }
  };

  const navigateToGoals = () => {
    setCurrentRoute({ view: 'goals', resourceId: null });
    setIsMobileSidebarOpen(false);
    try {
      window.history.pushState({ view: 'goals' }, '', '/goals');
    } catch {
      window.location.hash = '#goals';
    }
  };

  const navigateToDesignSystem = () => {
    setCurrentRoute({ view: 'design-system', resourceId: null });
    setIsMobileSidebarOpen(false);
    try {
      window.history.pushState({ view: 'design-system' }, '', '/#design-system');
    } catch {
      window.location.hash = '#design-system';
    }
  };

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentRoute(parseCurrentRoute());
    };
    window.addEventListener('popstate', handleRouteChange);
    window.addEventListener('hashchange', handleRouteChange);
    return () => {
      window.removeEventListener('popstate', handleRouteChange);
      window.removeEventListener('hashchange', handleRouteChange);
    };
  }, []);

  // Load objects with local persistence
  const [objects, setObjects] = useState<WorkbenchObject[]>(() => {
    try {
      const stored = localStorage.getItem('personal_workbench_objects');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // fallback to seed
    }
    return SEED_OBJECTS;
  });

  // Identity state: defaults to guest, login as owner requires password
  const [identity, setIdentity] = useState<UserIdentity>(() => {
    try {
      const isAuth = sessionStorage.getItem('workbench_is_owner') === 'true';
      if (isAuth) {
        return { role: 'owner' };
      }
    } catch {
      // ignore
    }
    return {
      role: 'guest',
    };
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<WorkbenchObject | null>(null);
  const [isQuickMemoOpen, setIsQuickMemoOpen] = useState(false);

  // Search & filter state (Workbench)
  const [searchQuery, setSearchQuery] = useState('');
  const [memosSearchQuery, setMemosSearchQuery] = useState('');
  const [goalsSearchQuery, setGoalsSearchQuery] = useState('');
  const [dsSearchQuery, setDsSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [customTags, setCustomTags] = useState<string[]>(() => getCustomTags());

  // Listen to tag changes across the app
  useEffect(() => {
    const handleTagsUpdated = () => {
      setCustomTags(getCustomTags());
      try {
        const raw = localStorage.getItem('personal_workbench_objects');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) setObjects(parsed);
        }
      } catch {
        // ignore
      }
    };
    window.addEventListener('workbench:tags-updated', handleTagsUpdated);
    return () => window.removeEventListener('workbench:tags-updated', handleTagsUpdated);
  }, []);

  // Listen to open write memo event
  useEffect(() => {
    const handleOpenWriteMemo = () => {
      setIsQuickMemoOpen(true);
    };
    window.addEventListener('workbench:open-write-memo', handleOpenWriteMemo);
    return () => window.removeEventListener('workbench:open-write-memo', handleOpenWriteMemo);
  }, []);

  // Detail overlay state
  const [selectedObject, setSelectedObject] = useState<WorkbenchObject | null>(null);

  // Admin password authentication modal state
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Login flow
  const handleOpenLogin = () => {
    setIsAdminAuthModalOpen(true);
  };

  // On successful password input
  const handleAdminAuthSuccess = () => {
    setIdentity({
      role: 'owner',
    });
    try {
      sessionStorage.setItem('workbench_is_owner', 'true');
    } catch {
      // ignore
    }
  };

  // Logout flow
  const handleLogout = () => {
    setIdentity({
      role: 'guest',
    });
    setIsAddModalOpen(false);
    setEditingObject(null);
    try {
      sessionStorage.removeItem('workbench_is_owner');
    } catch {
      // ignore
    }
  };

  // Toggle pinned state
  const handleTogglePin = (id: string) => {
    if (identity.role !== 'owner') return;
    setObjects((prev) => {
      const updated = prev.map((obj) => (obj.id === id ? { ...obj, pinned: !obj.pinned } : obj));
      try {
        localStorage.setItem('personal_workbench_objects', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setSelectedObject((prev) => (prev && prev.id === id ? { ...prev, pinned: !prev.pinned } : prev));
  };

  // Delete an object
  const handleDeleteObject = (id: string) => {
    if (identity.role !== 'owner') return;
    setObjects((prev) => {
      const updated = prev.filter((obj) => obj.id !== id);
      try {
        localStorage.setItem('personal_workbench_objects', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
    setSelectedObject((prev) => (prev && prev.id === id ? null : prev));
  };

  // Adjust card size
  const handleChangeSize = (id: string, newSize: ResourceSize) => {
    if (identity.role !== 'owner') return;
    const dbCardSize = toDatabaseCardSize(newSize);
    let w = 2;
    let h = 2;
    if (dbCardSize === 'banner') {
      w = 6;
      h = 2;
    } else if (dbCardSize === 'wide') {
      w = 4;
      h = 2;
    } else if (dbCardSize === 'large') {
      w = 4;
      h = 4;
    }

    setObjects((prev) => {
      const updated = prev.map((obj) =>
        obj.id === id ? { ...obj, cardSize: dbCardSize, w, h } : obj
      );
      try {
        localStorage.setItem('personal_workbench_objects', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Reorder objects on drag and drop
  const handleReorder = (draggedId: string, targetId: string) => {
    if (identity.role !== 'owner') return;
    setObjects((prev) => {
      const draggedIndex = prev.findIndex((o) => o.id === draggedId);
      const targetIndex = prev.findIndex((o) => o.id === targetId);
      if (draggedIndex === -1 || targetIndex === -1) return prev;

      const updated = [...prev];
      const [removed] = updated.splice(draggedIndex, 1);
      updated.splice(targetIndex, 0, removed);
      try {
        localStorage.setItem('personal_workbench_objects', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  // Add or edit object
  const handleSaveObject = (savedObj: WorkbenchObject) => {
    if (identity.role !== 'owner') return;

    setObjects((prev) => {
      const existsIndex = prev.findIndex((o) => o.id === savedObj.id);
      let updated: WorkbenchObject[];
      if (existsIndex >= 0) {
        updated = [...prev];
        updated[existsIndex] = savedObj;
      } else {
        updated = [savedObj, ...prev];
      }
      try {
        localStorage.setItem('personal_workbench_objects', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });

    setEditingObject(null);
    setIsAddModalOpen(false);
  };

  const handleOpenEdit = (obj: WorkbenchObject) => {
    if (identity.role !== 'owner') return;
    setEditingObject(obj);
    setIsAddModalOpen(true);
  };

  const handleCreateTag = (newTag: string) => {
    addCustomTag(newTag);
    setCustomTags(getCustomTags());
  };

  const handleRenameTag = (oldTag: string, newTag: string) => {
    renameTagAcrossStorage(oldTag, newTag);
    setCustomTags(getCustomTags());
    setObjects((prev) =>
      prev.map((obj) => ({
        ...obj,
        tags: (obj.tags || []).map((t) => (t === oldTag ? newTag : t)),
      }))
    );
  };

  const handleDeleteTag = (tagToDelete: string) => {
    deleteTagAcrossStorage(tagToDelete);
    setCustomTags(getCustomTags());
    setObjects((prev) =>
      prev.map((obj) => ({
        ...obj,
        tags: (obj.tags || []).filter((t) => t !== tagToDelete),
      }))
    );
  };

  // Global hotkeys: ⌘K (search), ESC (close modals/clear filters)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      const isEditingText = targetTag === 'INPUT' || targetTag === 'TEXTAREA';

      // 1. ⌘K or Ctrl+K or '/'
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (!isEditingText && e.key === '/')) {
        e.preventDefault();
        if (currentView !== 'workbench') {
          navigateToWorkbench();
        }
        return;
      }

      // 2. Escape
      if (e.key === 'Escape') {
        if (selectedObject) {
          e.preventDefault();
          setSelectedObject(null);
          return;
        }
        if (isAddModalOpen) {
          e.preventDefault();
          setIsAddModalOpen(false);
          setEditingObject(null);
          return;
        }
        if (isAdminAuthModalOpen) {
          e.preventDefault();
          setIsAdminAuthModalOpen(false);
          return;
        }
        if (searchQuery) {
          e.preventDefault();
          setSearchQuery('');
          return;
        }
        if (selectedTag) {
          e.preventDefault();
          setSelectedTag(null);
          return;
        }
        if (selectedCategory !== 'all') {
          e.preventDefault();
          setSelectedCategory('all');
          return;
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    selectedObject,
    isAddModalOpen,
    isAdminAuthModalOpen,
    searchQuery,
    selectedCategory,
    selectedTag,
    currentView,
  ]);

  // All tags with counts
  const allTagsWithCount = useMemo(() => {
    const map = new Map<string, number>();
    customTags.forEach((t) => {
      const clean = t.trim();
      if (clean) map.set(clean, 0);
    });
    objects.forEach((obj) => {
      (obj.tags || []).forEach((t) => {
        const clean = t.trim();
        if (clean) {
          map.set(clean, (map.get(clean) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [objects, customTags]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = {
      all: objects.length,
      project: 0,
      tool: 0,
      web: 0,
      learning: 0,
      reference: 0,
    };

    objects.forEach((obj) => {
      if (obj.type === 'project' || obj.type === 'app') {
        counts.project++;
      } else if (obj.type === 'tool') {
        counts.tool++;
      } else if (obj.type === 'website' || obj.type === 'service') {
        counts.web++;
      } else if (obj.type === 'learning') {
        counts.learning++;
      } else if (
        obj.type === 'note' ||
        obj.type === 'repository' ||
        obj.type === 'generic'
      ) {
        counts.reference++;
      }
    });

    return counts;
  }, [objects]);

  // Filtered objects
  const filteredObjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return objects.filter((obj) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'project' && obj.type !== 'project' && obj.type !== 'app') {
          return false;
        }
        if (selectedCategory === 'tool' && obj.type !== 'tool') {
          return false;
        }
        if (selectedCategory === 'web' && obj.type !== 'website' && obj.type !== 'service') {
          return false;
        }
        if (selectedCategory === 'learning' && obj.type !== 'learning') {
          return false;
        }
        if (
          selectedCategory === 'reference' &&
          obj.type !== 'note' &&
          obj.type !== 'repository' &&
          obj.type !== 'generic'
        ) {
          return false;
        }
      }

      // Tag filter
      if (selectedTag && !obj.tags?.includes(selectedTag)) {
        return false;
      }

      // Search query
      if (!q) return true;

      const titleMatch = obj.title.toLowerCase().includes(q);
      const summaryMatch = obj.summary.toLowerCase().includes(q);
      const targetMatch = obj.targetUrl.toLowerCase().includes(q);
      const tagsMatch = obj.tags?.some((t) => t.toLowerCase().includes(q));

      return titleMatch || summaryMatch || targetMatch || tagsMatch;
    });
  }, [objects, searchQuery, selectedCategory, selectedTag]);

  // Pinned items
  const pinnedObjects = useMemo(() => {
    return objects.filter((obj) => obj.pinned);
  }, [objects]);

  const isOwner = identity.role === 'owner';
  const hasActiveFilter = Boolean(searchQuery || selectedCategory !== 'all' || selectedTag);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setSelectedTag(null);
  };

  const currentResourceObject = currentResourceId
    ? objects.find((o) => o.id === currentResourceId) || null
    : null;

  // Global search dispatcher across current active views
  const currentSearchQuery =
    currentView === 'memos'
      ? memosSearchQuery
      : currentView === 'goals'
      ? goalsSearchQuery
      : searchQuery;

  const handleCurrentSearchChange = (q: string) => {
    if (currentView === 'memos') {
      setMemosSearchQuery(q);
    } else if (currentView === 'goals') {
      setGoalsSearchQuery(q);
    } else {
      setSearchQuery(q);
    }
  };

  const searchPlaceholder =
    currentView === 'memos'
      ? '搜索备忘录/标签/内容...'
      : currentView === 'goals'
      ? '搜索目标/KR/周期...'
      : '搜索标题/简介/标签...';

  return (
    <div className="min-h-screen flex flex-col workbench-bg selection:bg-[#FFD84D] selection:text-[#171717]">
      {/* 1. Header: Persistent & Clean (no edit mode buttons, no avatar green dot) */}
      <V4Header
        identity={identity}
        onLogin={handleOpenLogin}
        onLogout={handleLogout}
        totalCount={objects.length}
        activeView={currentView}
        onSelectView={(v) => {
          if (v === 'workbench') navigateToWorkbench();
          else if (v === 'memos') navigateToMemos();
          else if (v === 'goals') navigateToGoals();
          else navigateToWorkbench();
        }}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen((prev) => !prev)}
      />

      {/* 2. Main Page Split Layout: Left PageSidebar + Right Content Canvas */}
      <div className="flex-1 flex flex-row min-w-0">
        {/* Left Sidebar Toolbar (Sticky on Desktop, Drawer on Mobile, Mini Icon Mode Support) */}
        <PageSidebar
          currentView={currentView}
          onSelectView={(v) => {
            if (v === 'workbench') navigateToWorkbench();
            else if (v === 'memos') navigateToMemos();
            else if (v === 'goals') navigateToGoals();
            else navigateToWorkbench();
          }}
          identity={identity}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          // Global search pervasive across all pages
          searchQuery={currentSearchQuery}
          onSearchChange={handleCurrentSearchChange}
          searchPlaceholder={searchPlaceholder}
          // Workbench tools
          onOpenAddResource={() => {
            setEditingObject(null);
            setIsAddModalOpen(true);
          }}
          onResetFilter={handleResetFilters}
          hasActiveFilter={hasActiveFilter}
          // Memos tools
          onOpenAddMemo={() => {
            setIsQuickMemoOpen(true);
          }}
          // Goals tools
          onOpenAddGoal={() => {
            window.dispatchEvent(new CustomEvent('workbench:open-create-goal'));
          }}
          // Resource detail tools
          currentResource={currentResourceObject}
          onBackToWorkbench={navigateToWorkbench}
          onOpenPrimaryEntry={() => {
            window.dispatchEvent(new CustomEvent('workbench:detail-open-primary'));
          }}
          onCopyResourceLink={() => {
            try {
              navigator.clipboard?.writeText(window.location.href);
            } catch {
              // ignore
            }
          }}
          onTriggerEditDetail={() => {
            window.dispatchEvent(new CustomEvent('workbench:detail-edit'));
          }}
          onTriggerAddBlock={() => {
            window.dispatchEvent(new CustomEvent('workbench:detail-add-block'));
          }}
          onTriggerAddSecondaryEntry={() => {
            window.dispatchEvent(new CustomEvent('workbench:detail-add-secondary'));
          }}
          onTriggerDeleteResource={() => {
            window.dispatchEvent(new CustomEvent('workbench:detail-delete'));
          }}
        />

        {/* Right Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-[calc(100vh-60px)]">
          {/* View routing: Workbench vs Memos vs Goals vs Resource Detail */}
          {currentView === 'memos' ? (
            <main key="memos" className="flex-1 flex flex-col page-fade-in">
              <MemosPage
                identity={identity}
                onBackToWorkbench={navigateToWorkbench}
                searchQuery={memosSearchQuery}
                onSearchChange={setMemosSearchQuery}
              />
            </main>
          ) : currentView === 'goals' ? (
            <main key="goals" className="flex-1 flex flex-col page-fade-in">
              <GoalsPage
                identity={identity}
                workbenchResources={objects}
                onBackToWorkbench={navigateToWorkbench}
                onNavigateToResource={navigateToResource}
                searchQuery={goalsSearchQuery}
                onSearchChange={setGoalsSearchQuery}
              />
            </main>
          ) : currentView === 'resource-detail' ? (
            <main key="resource-detail" className="flex-1 flex flex-col page-fade-in">
              {currentResourceObject ? (
                <ResourceDetailPage
                  object={currentResourceObject}
                  identity={identity}
                  onBackToHome={navigateToWorkbench}
                  onSaveObject={handleSaveObject}
                  onDeleteObject={(id) => {
                    handleDeleteObject(id);
                    navigateToWorkbench();
                  }}
                />
              ) : (
                <div className="w-full px-4 sm:px-8 py-16 text-center">
                  <div className="max-w-md mx-auto p-8 bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[6px_6px_0_#171717] space-y-4">
                    <div className="w-12 h-12 bg-[#FFB4C6] border-2 border-[#171717] rounded-xl mx-auto flex items-center justify-center font-bold text-xl">
                      !
                    </div>
                    <h2 className="text-xl font-bold text-[#171717]">未找到该资源档案</h2>
                    <p className="text-xs font-mono text-[#5F5E5A]">
                      资源档案可能已被移除或 ID 路径不存在。
                    </p>
                    <button
                      type="button"
                      onClick={navigateToWorkbench}
                      className="px-4 py-2 bg-[#FFD84D] hover:bg-[#FACC15] border-2 border-[#171717] rounded-lg text-xs font-mono font-bold shadow-[2px_2px_0_#171717] cursor-pointer"
                    >
                      返回工作台首页
                    </button>
                  </div>
                </div>
              )}
            </main>
          ) : (
            <main key="workbench" className="flex-1 flex flex-col page-fade-in">
              {/* Frozen Sticky Category & Tag Filter Top Bar */}
              <div className="sticky top-0 z-20 bg-[#FBF7EF]/95 backdrop-blur-md pt-3.5 pb-4 sm:pt-4.5 sm:pb-5 border-b border-[#171717]/10">
                <div className="w-full px-4 sm:px-8 space-y-3.5">
                  {/* Category Switcher Row */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-h-[40px]">
                    <V4CategoryFilter
                      selectedCategory={selectedCategory}
                      onSelectCategory={setSelectedCategory}
                      categoryCounts={categoryCounts}
                    />
                    {hasActiveFilter && (
                      <button
                        type="button"
                        onClick={handleResetFilters}
                        className="text-xs font-mono font-bold text-[#B91C1C] hover:underline cursor-pointer flex items-center gap-1 self-start sm:self-auto"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>重置筛选 ({filteredObjects.length}/{objects.length})</span>
                      </button>
                    )}
                  </div>

                  {/* Tag Filter Row */}
                  <TagPanel
                    tags={allTagsWithCount}
                    selectedTag={selectedTag}
                    onSelectTag={setSelectedTag}
                    topLimit={8}
                    isOwner={isOwner}
                    onCreateTag={handleCreateTag}
                    onRenameTag={handleRenameTag}
                    onDeleteTag={handleDeleteTag}
                    customClass="mt-0"
                  />
                </div>
              </div>

              {/* Pinned Quick Picks Section (Only on clean workbench root) */}
              {!searchQuery && selectedCategory === 'all' && !selectedTag && pinnedObjects.length > 0 && (
                <V4PinnedSection
                  pinnedObjects={pinnedObjects}
                  onSelect={(obj) => setSelectedObject(obj)}
                />
              )}

              {/* Section Title Bar */}
              <div className="w-full px-4 sm:px-8 pt-5 pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-4 bg-[#171717] rounded-xs" />
                  <h2 className="text-sm font-bold text-[#171717] tracking-tight uppercase font-mono">
                    {searchQuery
                      ? `检索结果 (${filteredObjects.length})`
                      : selectedTag
                      ? `标签 #${selectedTag} (${filteredObjects.length})`
                      : selectedCategory !== 'all'
                      ? `分类筛选 (${filteredObjects.length})`
                      : `全部工作台入口资产 (${filteredObjects.length})`}
                  </h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-[#5F5E5A]">
                  {isOwner && (
                    <span className="hidden sm:inline text-[#10B981] font-bold">
                      ✓ 可直接拖动卡片排序
                    </span>
                  )}
                  <span>6 列网格</span>
                </div>
              </div>

              {/* Main Resource Grid Canvas */}
              <div className="flex-1">
                <HomeGrid
                  objects={filteredObjects}
                  isOwner={isOwner}
                  onSelectObject={(obj) => setSelectedObject(obj)}
                  onTogglePin={handleTogglePin}
                  onDeleteObject={handleDeleteObject}
                  onReorder={handleReorder}
                  onEditObject={handleOpenEdit}
                  onChangeSize={handleChangeSize}
                />
              </div>
            </main>
          )}

          {/* Global Status Footer */}
          <V4Footer />
        </div>
      </div>

      {/* 3. Detail Modal Overlay (Quick Preview on click) */}
      <DetailModal
        object={selectedObject}
        isOwner={isOwner}
        onClose={() => setSelectedObject(null)}
        onViewFullDetail={navigateToResource}
        onEdit={isOwner ? handleOpenEdit : undefined}
        onDelete={isOwner ? handleDeleteObject : undefined}
        onTogglePin={isOwner ? handleTogglePin : undefined}
      />

      {/* 4. Add / Edit Resource Modal (Admin Only) */}
      {isOwner && (
        <AddResourceModal
          isOpen={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditingObject(null);
          }}
          onSave={handleSaveObject}
          initialObject={editingObject}
        />
      )}

      {/* 5. Admin Password Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* 6. Floating Quick Memo Modal */}
      {isOwner && isQuickMemoOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="写备忘录 · 记点什么"
          className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-[#171717]/40 backdrop-blur-xs animate-in fade-in duration-150"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsQuickMemoOpen(false);
            }
          }}
        >
          <div className="w-full max-w-2xl bg-[#FFFFFF] border-3 border-[#171717] rounded-2xl shadow-[8px_8px_0_#171717] p-5 sm:p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3">
              <h3 className="font-bold text-base text-[#171717]">写备忘录</h3>
              <button
                type="button"
                onClick={() => setIsQuickMemoOpen(false)}
                className="p-1 hover:bg-[#EDE8DC] rounded-lg transition-all cursor-pointer text-[#171717]"
                title="关闭 (ESC)"
              >
                <X className="w-5 h-5 text-[#171717]" />
              </button>
            </div>

            <MemoQuickInput
              onMemoCreated={() => {
                setIsQuickMemoOpen(false);
                window.dispatchEvent(new CustomEvent('workbench:memos-updated'));
              }}
              onClose={() => setIsQuickMemoOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
