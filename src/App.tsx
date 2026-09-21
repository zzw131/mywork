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
import { TagPanel } from './components/layout/TagPanel';
import { V4PinnedSection } from './components/v4/V4PinnedSection';
import { V4EditToolbar } from './components/v4/V4EditToolbar';
import { HomeGrid } from './components/HomeGrid';
import { DetailModal } from './components/resource/DetailModal';
import { AddResourceModal } from './components/resource/AddResourceModal';
import { V4Footer } from './components/v4/V4Footer';
import { DesignSystemPage } from './components/DesignSystemPage';

export default function App() {
  // View toggle: 'workbench' | 'design-system'
  const [currentView, setCurrentView] = useState<'workbench' | 'design-system'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      const hash = window.location.hash;
      if (path.includes('design-system') || hash.includes('design-system')) {
        return 'design-system';
      }
    }
    return 'workbench';
  });

  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash.includes('design-system')) {
        setCurrentView('design-system');
      } else if (!window.location.hash || window.location.hash === '#') {
        setCurrentView('workbench');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
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

  // Identity state: defaults to owner, can switch to guest
  const [identity, setIdentity] = useState<UserIdentity>({
    role: 'owner',
    username: '邹大炮',
  });

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<WorkbenchObject | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Search & filter state (4-dimensional: Title, Tags, Summary, Entry path)
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Detail overlay state
  const [selectedObject, setSelectedObject] = useState<WorkbenchObject | null>(null);

  // If role changes to guest, immediately turn off edit mode and modal
  const handleToggleIdentity = () => {
    setIdentity((prev) => {
      const newRole = prev.role === 'owner' ? 'guest' : 'owner';
      if (newRole === 'guest') {
        setEditMode(false);
        setIsAddModalOpen(false);
        setEditingObject(null);
      }
      return {
        role: newRole,
        username: newRole === 'owner' ? '邹大炮' : '访客 (Guest)',
      };
    });
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

  // All extracted tags with frequency counts
  const allTagsWithCount = useMemo(() => {
    const map = new Map<string, number>();
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
      .sort((a, b) => b.count - a.count);
  }, [objects]);

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

  if (currentView === 'design-system') {
    return <DesignSystemPage onBackToWorkbench={() => setCurrentView('workbench')} />;
  }

  return (
    <div className="min-h-screen flex flex-col workbench-bg selection:bg-[#FFD84D] selection:text-[#171717]">
      {/* 1. Header: Product title, Owner toggle, Edit trigger */}
      <V4Header
        identity={identity}
        onToggleIdentity={handleToggleIdentity}
        editMode={editMode}
        onToggleEditMode={handleToggleEditMode}
        onOpenAddForm={() => {
          setEditingObject(null);
          setIsAddModalOpen(true);
        }}
        totalCount={objects.length}
        activeView={currentView}
        onSelectView={(v) => setCurrentView(v)}
      />

      {/* Owner Edit Toolbar (Strictly omitted from DOM if guest or !editMode) */}
      {isOwner && editMode && (
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

      {/* 2. Search & 6-Category Filters */}
      <V4SearchToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
        categoryCounts={categoryCounts}
        disabled={isOwner && editMode}
      />

      {/* 3. Tag Panel (Popular tags & expandable full cloud) */}
      <TagPanel
        tags={allTagsWithCount}
        selectedTag={selectedTag}
        onSelectTag={setSelectedTag}
        topLimit={8}
      />

      {/* 4. Pinned Quick Picks Section (Only on clean home page) */}
      {!searchQuery && selectedCategory === 'all' && !selectedTag && (
        <V4PinnedSection
          pinnedObjects={pinnedObjects}
          onSelect={(obj) => setSelectedObject(obj)}
        />
      )}

      {/* Section Title Bar */}
      <div className="w-full max-w-[1200px] mx-auto px-4 sm:px-8 pt-4 pb-1 flex items-center justify-between">
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

      {/* 6. Detail Modal Overlay */}
      <DetailModal
        object={selectedObject}
        onClose={() => setSelectedObject(null)}
        onEdit={isOwner ? handleOpenEdit : undefined}
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

      {/* 8. Global Status Footer */}
      <V4Footer />
    </div>
  );
}
