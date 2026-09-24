/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { WorkbenchObject, UserIdentity } from './types';
import { FilterCategory, ResourceSize } from './types/resource';
import { toDatabaseCardSize } from './adapters/resourceAdapter';
import { SEED_OBJECTS } from './data/seedData';
import { V4Header } from './components/v4/V4Header';
import { V4SearchToolbar } from './components/v4/V4SearchToolbar';
import { V4CategoryFilter } from './components/v4/V4CategoryFilter';
import { TagPanel } from './components/layout/TagPanel';
import {
  addCustomTag,
  renameTagAcrossStorage,
  deleteTagAcrossStorage,
  getCustomTags,
} from './utils/tagManager';
import { V4PinnedSection } from './components/v4/V4PinnedSection';
import { V4EditToolbar } from './components/v4/V4EditToolbar';
import { HomeGrid } from './components/HomeGrid';
import { DetailModal } from './components/v4/DetailModal';
import { AddResourceModal } from './components/resource/AddResourceModal';
import { V4Footer } from './components/v4/V4Footer';
import { DesignSystemPage } from './components/DesignSystemPage';
import { AdminAuthModal } from './components/v4/AdminAuthModal';
import { ResourceDetailPage } from './components/v4/ResourceDetailPage';
import { GoalsPage } from './modules/goals';

export type AppView = 'workbench' | 'goals' | 'design-system' | 'resource-detail';

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

  // 3. Goals management
  if (path.includes('goals') || hash.includes('goals')) {
    return { view: 'goals', resourceId: null };
  }

  // 4. Design system
  if (path.includes('design-system') || hash.includes('design-system')) {
    return { view: 'design-system', resourceId: null };
  }

  return { view: 'workbench', resourceId: null };
}

export default function App() {
  // View routing: 'workbench' | 'design-system' | 'resource-detail'
  const [currentRoute, setCurrentRoute] = useState(parseCurrentRoute);
  const currentView = currentRoute.view;
  const currentResourceId = currentRoute.resourceId;

  const navigateToResource = (id: string) => {
    setCurrentRoute({ view: 'resource-detail', resourceId: id });
    setSelectedObject(null);
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
    try {
      window.history.pushState({ view: 'workbench' }, '', '/');
    } catch {
      window.location.hash = '#';
    }
  };

  const navigateToGoals = () => {
    setCurrentRoute({ view: 'goals', resourceId: null });
    try {
      window.history.pushState({ view: 'goals' }, '', '/goals');
    } catch {
      window.location.hash = '#goals';
    }
  };

  const navigateToDesignSystem = () => {
    setCurrentRoute({ view: 'design-system', resourceId: null });
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

  // Identity state: defaults to guest (未登录状态), login as owner requires password (123456)
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

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<WorkbenchObject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search & filter state (4-dimensional: Title, Tags, Summary, Entry path)
  const [searchQuery, setSearchQuery] = useState('');
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

  // Detail overlay state
  const [selectedObject, setSelectedObject] = useState<WorkbenchObject | null>(null);

  // Admin password authentication modal state
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);

  // Login flow: open password verification modal
  const handleOpenLogin = () => {
    setIsAdminAuthModalOpen(true);
  };

  // On successful password input: elevate to owner and persist in session
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

  // Logout flow: directly exit to guest with no password required
  const handleLogout = () => {
    setIdentity({
      role: 'guest',
    });
    setEditMode(false);
    setIsAddModalOpen(false);
    setEditingObject(null);
    try {
      sessionStorage.removeItem('workbench_is_owner');
    } catch {
      // ignore
    }
  };

  const handleToggleEditMode = () => {
    if (identity.role !== 'owner') return;
    setEditMode((prev) => !prev);
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

  // Save layout & objects
  const handleSaveLayout = () => {
    setIsSaving(true);
    try {
      localStorage.setItem('personal_workbench_objects', JSON.stringify(objects));
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setIsSaving(false);
      }, 1000);
    } catch {
      setIsSaving(false);
    }
  };

  // Global footer and hotkey triggers: ⌘K (search), ESC (close modals/clear filters), Tab (category navigation)
  const handleTriggerSearch = () => {
    if (currentView !== 'workbench') {
      navigateToWorkbench();
    }
    window.dispatchEvent(new CustomEvent('workbench:focus-search'));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTriggerCloseOrClear = () => {
    if (selectedObject) {
      setSelectedObject(null);
      return;
    }
    if (isAddModalOpen) {
      setIsAddModalOpen(false);
      setEditingObject(null);
      return;
    }
    if (isAdminAuthModalOpen) {
      setIsAdminAuthModalOpen(false);
      return;
    }
    if (searchQuery) {
      setSearchQuery('');
      window.dispatchEvent(new CustomEvent('workbench:clear-search'));
      return;
    }
    if (selectedCategory !== 'all') {
      setSelectedCategory('all');
      return;
    }
    if (editMode) {
      setEditMode(false);
    }
  };

  const handleTriggerTabNavigate = (direction: number = 1) => {
    if (currentView !== 'workbench') {
      navigateToWorkbench();
    }
    const categories: FilterCategory[] = ['all', 'project', 'tool', 'web', 'learning', 'reference'];
    const curIdx = categories.indexOf(selectedCategory);
    const nextIdx = (curIdx + direction + categories.length) % categories.length;
    setSelectedCategory(categories[nextIdx]);
  };

  // Global keydown handler for ⌘K and Escape across the entire app
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toUpperCase();
      const isEditingText = targetTag === 'INPUT' || targetTag === 'TEXTAREA';

      // 1. ⌘K or Ctrl+K or '/' (when not typing in form inputs): Focus search
      if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (!isEditingText && e.key === '/')) {
        e.preventDefault();
        handleTriggerSearch();
        return;
      }

      // 2. Escape: Close topmost modal or clear search/filter
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
          window.dispatchEvent(new CustomEvent('workbench:clear-search'));
          return;
        }
        if (selectedCategory !== 'all') {
          e.preventDefault();
          setSelectedCategory('all');
          return;
        }
        if (editMode) {
          e.preventDefault();
          setEditMode(false);
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
    editMode,
    currentView,
  ]);

  // Reset to seed data
  const handleResetLayout = () => {
    if (window.confirm('确定要重置并恢复默认 20 个初始入口排版吗？')) {
      setObjects(SEED_OBJECTS);
      try {
        localStorage.removeItem('personal_workbench_objects');
      } catch {
        // ignore
      }
    }
  };

  // All extracted tags with frequency counts (including custom tags)
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

  // Tag CRUD Handlers
  const handleCreateTag = (newTag: string) => {
    addCustomTag(newTag);
    setCustomTags(getCustomTags());
  };

  const handleRenameTag = (oldTag: string, newTag: string) => {
    renameTagAcrossStorage(oldTag, newTag);
    setCustomTags(getCustomTags());
    setObjects((prev) => {
      const next = prev.map((obj) =>
        obj.tags?.includes(oldTag)
          ? {
              ...obj,
              tags: Array.from(
                new Set(obj.tags.map((t) => (t === oldTag ? newTag : t)))
              ),
            }
          : obj
      );
      try {
        localStorage.setItem('personal_workbench_objects', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    if (selectedTag === oldTag) {
      setSelectedTag(newTag);
    }
  };

  const handleDeleteTag = (tagToDelete: string) => {
    deleteTagAcrossStorage(tagToDelete);
    setCustomTags(getCustomTags());
    setObjects((prev) => {
      const next = prev.map((obj) => ({
        ...obj,
        tags: (obj.tags || []).filter((t) => t !== tagToDelete),
      }));
      try {
        localStorage.setItem('personal_workbench_objects', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });
    if (selectedTag === tagToDelete) {
      setSelectedTag(null);
    }
  };

  // Calculate 6 standard category counts
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

  // 4-Dimensional Filtered objects based on search query, category, and selected tag
  const filteredObjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    return objects.filter((obj) => {
      // Category filter (6 standard categories)
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

      // 4-Dimensional Search query filter: Title, Summary, Target/Path, Tags
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

  return (
    <div className="min-h-screen flex flex-col workbench-bg selection:bg-[#FFD84D] selection:text-[#171717]">
      {/* 1. Header: Persistent across both views, zero jumping */}
      <V4Header
        identity={identity}
        onLogin={handleOpenLogin}
        onLogout={handleLogout}
        editMode={editMode}
        onToggleEditMode={handleToggleEditMode}
        onOpenAddForm={() => {
          setEditingObject(null);
          setIsAddModalOpen(true);
        }}
        totalCount={objects.length}
        activeView={currentView}
        onSelectView={(v) => {
          if (v === 'workbench') {
            navigateToWorkbench();
          } else if (v === 'goals') {
            navigateToGoals();
          } else {
            navigateToDesignSystem();
          }
        }}
      />

      {/* Owner Edit Toolbar for Workbench (Only in workbench view and editMode) */}
      {isOwner && editMode && currentView === 'workbench' && (
        <V4EditToolbar
          onSave={handleSaveLayout}
          onOpenAdd={() => {
            setEditingObject(null);
            setIsAddModalOpen(true);
          }}
          onReset={handleResetLayout}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
        />
      )}

      {/* Global Unified Search Toolbar: Persistent across all pages, searching the current page */}
      <V4SearchToolbar
        searchQuery={
          currentView === 'workbench'
            ? searchQuery
            : currentView === 'goals'
            ? goalsSearchQuery
            : currentView === 'design-system'
            ? dsSearchQuery
            : searchQuery
        }
        onSearchChange={(q) => {
          if (currentView === 'workbench') {
            setSearchQuery(q);
          } else if (currentView === 'goals') {
            setGoalsSearchQuery(q);
          } else if (currentView === 'design-system') {
            setDsSearchQuery(q);
          } else {
            setSearchQuery(q);
          }
        }}
        selectedCategory={currentView === 'workbench' ? selectedCategory : undefined}
        placeholder={
          currentView === 'goals'
            ? '搜索目标标题、简介、具体链接、复盘笔记...'
            : currentView === 'design-system'
            ? '搜索设计规范 Tokens、色彩、组件与阴影规范...'
            : '快速检索工作台标题、标签、摘要或入口路径（URL、本地路径、GitHub）...'
        }
        disabled={isOwner && editMode && currentView === 'workbench'}
      />

      {/* View routing: Workbench vs Goals vs Design System vs Resource Detail */}
      {currentView === 'design-system' ? (
        <main className="flex-1">
          <DesignSystemPage
            onBackToWorkbench={navigateToWorkbench}
            searchQuery={dsSearchQuery}
          />
        </main>
      ) : currentView === 'goals' ? (
        <main className="flex-1">
          <GoalsPage
            identity={identity}
            editMode={editMode}
            workbenchResources={objects}
            onBackToWorkbench={navigateToWorkbench}
            onNavigateToResource={navigateToResource}
            searchQuery={goalsSearchQuery}
            onSearchChange={setGoalsSearchQuery}
          />
        </main>
      ) : currentView === 'resource-detail' ? (
        <main className="flex-1">
          {objects.find((o) => o.id === currentResourceId) ? (
            <ResourceDetailPage
              object={objects.find((o) => o.id === currentResourceId)!}
              identity={identity}
              onBackToHome={navigateToWorkbench}
              onSaveObject={handleSaveObject}
              onDeleteObject={(id) => {
                handleDeleteObject(id);
                navigateToWorkbench();
              }}
            />
          ) : (
            <div className="w-full md:w-[85%] mx-auto px-6 py-16 text-center">
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
        <>
          {/* 3. Workbench Category Filters (Placed directly above Tag Panel) */}
          <div className="w-full md:w-[85%] lg:w-[80%] mx-auto px-4 sm:px-6 pt-5 pb-1">
            <V4CategoryFilter
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              categoryCounts={categoryCounts}
              disabled={isOwner && editMode}
            />
          </div>

          {/* 4. Tag Panel (Popular tags & expandable full cloud with CRUD in editMode) */}
          <TagPanel
            tags={allTagsWithCount}
            selectedTag={selectedTag}
            onSelectTag={setSelectedTag}
            topLimit={8}
            editMode={editMode}
            isOwner={isOwner}
            onCreateTag={handleCreateTag}
            onRenameTag={handleRenameTag}
            onDeleteTag={handleDeleteTag}
          />

          {/* 4. Pinned Quick Picks Section (Only on clean home page) */}
          {!searchQuery && selectedCategory === 'all' && !selectedTag && (
            <V4PinnedSection
              pinnedObjects={pinnedObjects}
              onSelect={(obj) => setSelectedObject(obj)}
            />
          )}

          {/* Section Title Bar */}
          <div className="w-full md:w-[85%] lg:w-[80%] mx-auto px-4 sm:px-6 pt-4 pb-1 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-4 bg-[#171717] rounded-xs" />
              <h2 className="text-sm font-bold text-[#171717] tracking-tight uppercase">
                {searchQuery
                  ? `检索结果 (${filteredObjects.length})`
                  : selectedTag
                  ? `标签 #${selectedTag} (${filteredObjects.length})`
                  : selectedCategory !== 'all'
                  ? `分类筛选 (${filteredObjects.length})`
                  : `全部工作台入口资产 (${filteredObjects.length})`}
              </h2>
            </div>
            <span className="text-xs font-mono text-[#5F5E5A]">
              6 列 Neo-Brutalism 网格
            </span>
          </div>

          {/* 5. Main Resource Grid Canvas (with data-testid="home-grid") */}
          <main className="flex-1">
            <HomeGrid
              objects={filteredObjects}
              editMode={isOwner && editMode}
              isOwner={isOwner}
              onSelectObject={(obj) => setSelectedObject(obj)}
              onTogglePin={handleTogglePin}
              onDeleteObject={handleDeleteObject}
              onReorder={handleReorder}
              onEditObject={handleOpenEdit}
              onChangeSize={handleChangeSize}
            />
          </main>
        </>
      )}

      {/* 6. Detail Modal Overlay */}
      <DetailModal
        object={selectedObject}
        isOwner={isOwner}
        onClose={() => setSelectedObject(null)}
        onViewFullDetail={navigateToResource}
        onEdit={isOwner ? handleOpenEdit : undefined}
        onDelete={isOwner ? handleDeleteObject : undefined}
        onTogglePin={isOwner ? handleTogglePin : undefined}
      />

      {/* 7. Add / Edit Resource Modal (Strictly omitted from DOM if Guest) */}
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

      {/* 8. Admin Password Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => setIsAdminAuthModalOpen(false)}
        onSuccess={handleAdminAuthSuccess}
      />

      {/* 9. Global Status Footer */}
      <V4Footer />
    </div>
  );
}
