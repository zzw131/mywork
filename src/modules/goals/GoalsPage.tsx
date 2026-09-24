import React, { useState, useEffect, useMemo } from 'react';
import {
  GoalItem,
  GoalCategory,
  GoalCompletionRecord,
  GOAL_CATEGORY_CONFIG,
} from './types';
import {
  loadGoals,
  createGoal,
  updateGoal,
  completeGoal,
  toggleGoalCompletion,
  deleteGoal,
  sortGoalsByLatest,
} from './goalsStorage';
import { GoalCard } from './GoalCard';
import { GoalFormModal } from './GoalFormModal';
import { GoalCompletionModal } from './GoalCompletionModal';
import { TagPanel } from '../../components/layout/TagPanel';
import {
  addCustomTag,
  renameTagAcrossStorage,
  deleteTagAcrossStorage,
  getCustomTags,
} from '../../utils/tagManager';
import { UserIdentity, WorkbenchObject } from '../../types';
import {
  Target,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Sparkles,
  Layers,
  Filter,
  Check,
  RotateCcw,
  FolderGit2,
  Wrench,
  Globe,
  BookOpen,
  Bookmark,
  Tag,
  X,
  Trash2,
} from 'lucide-react';

export interface GoalsPageProps {
  identity: UserIdentity;
  editMode?: boolean;
  workbenchResources: WorkbenchObject[];
  onBackToWorkbench: () => void;
  onNavigateToResource: (resourceId: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
}

export const GoalsPage: React.FC<GoalsPageProps> = ({
  identity,
  editMode = false,
  workbenchResources,
  onBackToWorkbench,
  onNavigateToResource,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
}) => {
  const isOwner = identity.role === 'owner';

  // Goals State
  const [goals, setGoals] = useState<GoalItem[]>([]);
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const activeSearchQuery = externalSearchQuery !== undefined ? externalSearchQuery : internalSearchQuery;
  const handleSearchChange = externalOnSearchChange || setInternalSearchQuery;

  const [statusFilter, setStatusFilter] = useState<'all' | 'in_progress' | 'completed'>('all');
  const [selectedGoalTag, setSelectedGoalTag] = useState<string | null>(null);
  const [customTags, setCustomTags] = useState<string[]>(() => getCustomTags());

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<GoalItem | null>(null);
  const [completingGoal, setCompletingGoal] = useState<GoalItem | null>(null);
  const [deletingGoal, setDeletingGoal] = useState<GoalItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setGoals(loadGoals());
  }, []);

  // Listen to tag updates across pages
  useEffect(() => {
    const handleTagsUpdated = () => {
      setCustomTags(getCustomTags());
      setGoals(loadGoals());
    };
    window.addEventListener('workbench:tags-updated', handleTagsUpdated);
    return () => window.removeEventListener('workbench:tags-updated', handleTagsUpdated);
  }, []);

  // Listen to goal updates across pages
  useEffect(() => {
    const handleGoalsUpdated = () => {
      setGoals(loadGoals());
    };
    window.addEventListener('workbench:goals-updated', handleGoalsUpdated);
    return () => window.removeEventListener('workbench:goals-updated', handleGoalsUpdated);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2200);
  };

  // Stats calculation
  const totalCount = goals.length;
  const inProgressCount = goals.filter((g) => g.status === 'in_progress').length;
  const completedCount = goals.filter((g) => g.status === 'completed').length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Compute goal tags with counts (categories + goal custom tags + global custom tags)
  const allGoalTagsWithCount = useMemo(() => {
    const map = new Map<string, number>();

    const standardCategories: { key: GoalCategory; label: string }[] = [
      { key: 'project', label: '工程项目' },
      { key: 'tool', label: '效能工具' },
      { key: 'web', label: '产品网络' },
      { key: 'learning', label: '学习进阶' },
      { key: 'reference', label: '知识沉淀' },
      { key: 'personal', label: '个人规划' },
    ];

    // 1. Initial count for standard categories
    standardCategories.forEach(({ key, label }) => {
      const cnt = goals.filter(
        (g) => g.category === key || (g.tags && g.tags.includes(label))
      ).length;
      map.set(label, cnt);
    });

    // 2. Custom standalone tags
    customTags.forEach((t) => {
      const clean = t.trim();
      if (clean && !map.has(clean)) {
        map.set(clean, 0);
      }
    });

    // 3. Goal-specific custom tags
    goals.forEach((g) => {
      (g.tags || []).forEach((t) => {
        const clean = t.trim();
        if (clean && !standardCategories.some((sc) => sc.label === clean)) {
          map.set(clean, (map.get(clean) || 0) + 1);
        }
      });
    });

    return Array.from(map.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [goals, customTags]);

  // Filtered goals
  const filteredGoals = useMemo(() => {
    const list = goals.filter((goal) => {
      // 1. Status Filter
      if (statusFilter !== 'all' && goal.status !== statusFilter) {
        return false;
      }

      // 2. Tag / Category Filter
      if (selectedGoalTag) {
        const categoryMap: Record<string, GoalCategory> = {
          '工程项目': 'project',
          '效能工具': 'tool',
          '产品网络': 'web',
          '学习进阶': 'learning',
          '知识沉淀': 'reference',
          '个人规划': 'personal',
        };
        const mappedCategory = categoryMap[selectedGoalTag];
        const matchByCat = mappedCategory && goal.category === mappedCategory;
        const matchByTag = goal.tags && goal.tags.includes(selectedGoalTag);
        if (!matchByCat && !matchByTag) {
          return false;
        }
      }

      // 3. Search Query
      if (activeSearchQuery.trim()) {
        const query = activeSearchQuery.trim().toLowerCase();
        const inTitle = goal.title.toLowerCase().includes(query);
        const inSummary = goal.summary?.toLowerCase().includes(query);
        const inLink = goal.link?.toLowerCase().includes(query);
        const inNotes = goal.completionRecord?.notes?.toLowerCase().includes(query);
        const inCategory = GOAL_CATEGORY_CONFIG[goal.category]?.label.toLowerCase().includes(query);
        const inTags = goal.tags?.some((t) => t.toLowerCase().includes(query));
        if (!inTitle && !inSummary && !inLink && !inNotes && !inCategory && !inTags) {
          return false;
        }
      }

      return true;
    });

    // Always sort with newest/most recently updated goal first
    return sortGoalsByLatest(list);
  }, [goals, statusFilter, selectedGoalTag, activeSearchQuery]);

  // Goal Tag CRUD Handlers in Edit Mode
  const handleCreateGoalTag = (newTag: string) => {
    addCustomTag(newTag);
    setCustomTags(getCustomTags());
    showToast(`已创建新标签 #${newTag}`);
  };

  const handleRenameGoalTag = (oldTag: string, newTag: string) => {
    renameTagAcrossStorage(oldTag, newTag);
    setCustomTags(getCustomTags());
    setGoals(loadGoals());
    if (selectedGoalTag === oldTag) setSelectedGoalTag(newTag);
    showToast(`标签 #${oldTag} 已更新为 #${newTag}`);
  };

  const handleDeleteGoalTag = (tagToDelete: string) => {
    deleteTagAcrossStorage(tagToDelete);
    setCustomTags(getCustomTags());
    setGoals(loadGoals());
    if (selectedGoalTag === tagToDelete) setSelectedGoalTag(null);
    showToast(`标签 #${tagToDelete} 已删除`);
  };

  // Handlers
  const handleSaveGoal = (
    data: Omit<GoalItem, 'id' | 'createdAt' | 'updatedAt'>,
    editingId?: string
  ) => {
    if (editingId) {
      const next = updateGoal(editingId, data);
      setGoals(next);
      showToast('目标已成功更新并置于首位！');
    } else {
      createGoal(data);
      setGoals(loadGoals());
      showToast('已新增未完成目标并置于首位！');
    }
  };

  const handleToggleComplete = (goal: GoalItem) => {
    if (!isOwner) return;

    if (goal.status === 'in_progress') {
      const next = updateGoal(goal.id, {
        status: 'completed',
        completedAt: new Date().toISOString(),
      });
      setGoals(next);
      showToast('🎉 目标已达成！已切换为已完成状态');
    }
  };

  const handleOpenCompletionRecord = (goal: GoalItem) => {
    if (!isOwner) return;
    setCompletingGoal(goal);
  };

  const handleConfirmCompletion = (record: GoalCompletionRecord) => {
    if (!completingGoal) return;
    const next = completeGoal(completingGoal.id, record);
    setGoals(next);
    setCompletingGoal(null);
    showToast('已确认达成并归档完成手记！');
  };

  const handleRevertToIncomplete = (goalId: string) => {
    if (!isOwner) return;
    const next = updateGoal(goalId, {
      status: 'in_progress',
      completedAt: undefined,
    });
    setGoals(next);
    setCompletingGoal(null);
    showToast('目标状态已重置为未完成（进行中）');
  };

  const handleDeleteGoal = (id: string) => {
    const next = deleteGoal(id);
    setGoals(next);
    if (editingGoal?.id === id) {
      setEditingGoal(null);
      setIsFormOpen(false);
    }
    if (completingGoal?.id === id) {
      setCompletingGoal(null);
    }
    setDeletingGoal(null);
    showToast('目标已彻底删除！');
  };

  return (
    <div className="min-h-screen bg-[#FBF7EF] text-[#171717] pb-20 flex flex-col">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-[#FFD84D] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 0. Owner Goals Edit Toolbar (Matching V4EditToolbar, visible only in editMode) */}
      {isOwner && editMode && (
        <div
          data-testid="goals-edit-toolbar"
          className="sticky top-0 z-30 w-full bg-[#FFD84D] border-b-2 border-[#171717] py-2.5 px-4 sm:px-8 shadow-[0_4px_0_#171717]"
        >
          <div className="w-full flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-bold text-[#171717]">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-5 h-5 bg-[#171717] text-[#FFFFFF] rounded-full text-xs">
                !
              </span>
              <span>目标编辑模式生效中</span>
              <span className="hidden md:inline font-normal text-xs text-[#171717]/80">
                — 可在此快速创建新目标，或对卡片进行编辑与清理
              </span>
            </div>

            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                data-testid="goals-toolbar-add-btn"
                onClick={() => {
                  setEditingGoal(null);
                  setIsFormOpen(true);
                }}
                className="v4-btn v4-btn-default text-xs px-3 py-1.5 flex items-center gap-1.5 cursor-pointer shadow-[2px_2px_0_#171717]"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>新增目标</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full md:w-[90%] lg:w-[85%] mx-auto px-4 sm:px-6 pt-6 flex-1 space-y-6">
        {/* ===================== HERO STATS PANEL ===================== */}
        <header className="p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[6px_6px_0_#171717]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Title & Slogan */}
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#171717]">
                  设定明确目标，打对号记录每一次达成
                </h1>
                <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-[#FBF7EF] border border-[#171717] rounded-lg text-xs font-mono font-bold shadow-[1px_1px_0_#171717]">
                  <Target className="w-3.5 h-3.5 text-[#171717]" />
                  <span>目标管理模块 · OBJECTIVES</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm font-mono text-[#5F5E5A] leading-relaxed whitespace-nowrap overflow-x-auto scrollbar-none">
                连接工程项目、效能工具、学习突破与产品发布。可以打对号增加未完成的目标，达成后手动记录成果复盘手记。
              </p>
            </div>

            {/* Owner Action: Add Incomplete Goal (Only in Edit Mode) */}
            {isOwner && editMode && (
              <div className="shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditingGoal(null);
                    setIsFormOpen(true);
                  }}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-mono font-bold bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>+ 新建未完成目标</span>
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats Strip (Height reduced, top border removed, short & subtle vertical dividers) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 mt-2 sm:mt-2.5 pt-0.5 sm:pt-1">
            {/* 1. 总记录目标 */}
            <div className="relative flex flex-col items-center justify-center text-center px-2 sm:px-4 py-1">
              <span className="text-[11px] sm:text-xs font-mono text-[#73726C] font-bold mb-0.5 flex items-center justify-center gap-1">
                <span>总记录目标</span>
              </span>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#171717] leading-tight">
                {totalCount}
              </span>
              {/* Short, subtle vertical divider on the right */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-px sm:w-[1.5px] bg-[#171717]/20" />
            </div>

            {/* 2. 进行中 (未完成) */}
            <div className="relative flex flex-col items-center justify-center text-center px-2 sm:px-4 py-1">
              <span className="text-[11px] sm:text-xs font-mono text-[#B45309] font-bold mb-0.5 flex items-center justify-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#B45309]" />
                <span>进行中 (未完成)</span>
              </span>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#B45309] leading-tight">
                {inProgressCount}
              </span>
              {/* Short, subtle vertical divider on desktop (hidden on 2-col mobile) */}
              <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-px sm:w-[1.5px] bg-[#171717]/20" />
            </div>

            {/* 3. 已达成 (已打对号) */}
            <div className="relative flex flex-col items-center justify-center text-center px-2 sm:px-4 py-1">
              <span className="text-[11px] sm:text-xs font-mono text-[#15803d] font-bold mb-0.5 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#15803d]" />
                <span>已达成 (已打对号)</span>
              </span>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#15803d] leading-tight">
                {completedCount}
              </span>
              {/* Short, subtle vertical divider on the right */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-px sm:w-[1.5px] bg-[#171717]/20" />
            </div>

            {/* 4. 目标达成率 */}
            <div className="relative flex flex-col items-center justify-center text-center px-2 sm:px-4 py-1">
              <span className="text-[11px] sm:text-xs font-mono text-[#73726C] font-bold mb-0.5 flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>目标达成率</span>
              </span>
              <span className="text-xl sm:text-2xl font-extrabold font-mono text-[#171717] leading-tight">
                {completionRate}%
              </span>
            </div>
          </div>
        </header>

        {/* ===================== FILTER / SWITCHER AREA (Synced with Workbench style) ===================== */}
        <div className="space-y-3">
          {/* Status Switcher Tabs */}
          <div
            role="tablist"
            aria-label="目标状态筛选"
            className="flex items-center gap-2 sm:gap-2.5 overflow-x-auto py-1 scrollbar-none"
          >
            {[
              { key: 'all' as const, label: '全部', count: totalCount, icon: <Sparkles className="w-4 h-4" /> },
              { key: 'in_progress' as const, label: '未完成', count: inProgressCount, icon: <Clock className="w-4 h-4" /> },
              { key: 'completed' as const, label: '已达成', count: completedCount, icon: <CheckCircle2 className="w-4 h-4" /> },
            ].map((tab) => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setStatusFilter(tab.key)}
                  className={`h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl border-2 border-[#171717] flex items-center gap-2 text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#171717] text-[#FFFFFF] shadow-[3px_3px_0_#FFD84D] -translate-y-0.5'
                      : 'bg-[#FFFFFF] text-[#171717] hover:bg-[#FBF7EF] shadow-[3px_3px_0_#171717] hover:-translate-y-0.5'
                  }`}
                >
                  <span className={isActive ? 'text-[#FFD84D]' : 'text-[#5F5E5A]'}>
                    {tab.icon}
                  </span>
                  <span>{tab.label}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold ${
                      isActive
                        ? 'bg-[#FFFFFF] text-[#171717]'
                        : 'bg-[#EDE8DC] text-[#171717]'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Container 2: 常用标签筛选 synced from homepage TagPanel with full CRUD in editMode */}
          <TagPanel
            tags={allGoalTagsWithCount}
            selectedTag={selectedGoalTag}
            onSelectTag={setSelectedGoalTag}
            topLimit={8}
            editMode={editMode}
            isOwner={isOwner}
            onCreateTag={handleCreateGoalTag}
            onRenameTag={handleRenameGoalTag}
            onDeleteTag={handleDeleteGoalTag}
            customClass="pt-0.5"
            title="常用标签筛选"
          />
        </div>

        {/* ===================== GOALS CARD LIST ===================== */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold text-[#5F5E5A] flex items-center gap-1.5">
              <span>目标清单 ({filteredGoals.length})</span>
            </h2>

            {/* Quick tips */}
            <span className="text-[11px] font-mono text-[#888780]">
              提示：点击左侧方框即可打对号记录达成状态
            </span>
          </div>

          {filteredGoals.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {filteredGoals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  isOwner={isOwner}
                  editMode={editMode}
                  onToggleComplete={handleToggleComplete}
                  onViewCompletionRecord={handleOpenCompletionRecord}
                  onEdit={(g) => {
                    setEditingGoal(g);
                    setIsFormOpen(true);
                  }}
                  onDelete={(g) => {
                    setDeletingGoal(g);
                  }}
                  onNavigateToResource={onNavigateToResource}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="p-12 bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[4px_4px_0_#171717] text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-[#FFD84D] border-2 border-[#171717] mx-auto flex items-center justify-center font-mono font-bold text-xl shadow-[2px_2px_0_#171717]">
                🎯
              </div>
              <h3 className="text-base font-bold text-[#171717]">暂无匹配的目标项</h3>
              <p className="text-xs font-mono text-[#5F5E5A] max-w-sm mx-auto">
                没有找到符合当前状态或分类筛选的目标。可以清除筛选条件或在编辑模式下新建目标。
              </p>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('all');
                    setSelectedGoalTag(null);
                    handleSearchChange('');
                  }}
                  className="px-3.5 py-1.5 text-xs font-mono font-bold bg-[#EDE8DC] hover:bg-[#E5DFD1] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] cursor-pointer"
                >
                  重置筛选条件
                </button>
                {isOwner && editMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingGoal(null);
                      setIsFormOpen(true);
                    }}
                    className="px-3.5 py-1.5 text-xs font-mono font-bold bg-[#FFD84D] hover:bg-[#FACC15] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] cursor-pointer"
                  >
                    + 新建目标
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* ===================== MODALS ===================== */}
      {/* 1. Goal Form Modal */}
      <GoalFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        editingGoal={editingGoal}
        workbenchResources={workbenchResources}
        onDeleteGoal={(g) => {
          setIsFormOpen(false);
          setEditingGoal(null);
          setDeletingGoal(g);
        }}
      />

      {/* 2. Goal Completion / Milestone Record Modal */}
      {completingGoal && (
        <GoalCompletionModal
          goal={completingGoal}
          isOpen={!!completingGoal}
          onClose={() => setCompletingGoal(null)}
          onConfirm={handleConfirmCompletion}
          onRevertToIncomplete={handleRevertToIncomplete}
        />
      )}

      {/* 3. Goal Delete Confirmation Modal */}
      {deletingGoal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/60 backdrop-blur-xs animate-in fade-in"
        >
          <div className="w-full max-w-md bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[6px_6px_0_#171717] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#171717]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#FFB4C6] border-2 border-[#171717] flex items-center justify-center text-sm shadow-[1.5px_1.5px_0_#171717]">
                  <Trash2 className="w-4 h-4 text-[#171717]" />
                </div>
                <h3 className="text-base font-extrabold text-[#171717]">
                  彻底删除该目标
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setDeletingGoal(null)}
                className="p-1 hover:bg-[#EDE8DC] rounded-md border border-transparent hover:border-[#171717] transition-all cursor-pointer"
              >
                <X className="w-4 h-4 text-[#171717]" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717]">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-mono font-bold text-[#888780] uppercase tracking-wider">
                    目标档案
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border border-[#171717] ${
                    deletingGoal.status === 'completed'
                      ? 'bg-[#A9E5C3] text-[#171717]'
                      : 'bg-[#FFD84D] text-[#171717]'
                  }`}>
                    {deletingGoal.status === 'completed' ? '已达成' : '进行中'}
                  </span>
                </div>
                <p className="text-xs font-mono font-bold text-[#171717] line-clamp-2">
                  {deletingGoal.title}
                </p>
                {deletingGoal.summary && (
                  <p className="text-[11px] font-mono text-[#5F5E5A] mt-1.5 line-clamp-2">
                    {deletingGoal.summary}
                  </p>
                )}
              </div>

              <p className="text-xs font-mono text-[#E11D48] font-bold bg-[#FFE4E8] border border-[#FFB4C6] p-2.5 rounded-xl">
                ⚠️ 注意：删除后不可撤销，关联的达成手记与历史记录将一并清除。
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeletingGoal(null)}
                className="px-4 py-2 text-xs font-mono font-bold bg-[#EDE8DC] hover:bg-[#E5DFD1] text-[#171717] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] cursor-pointer"
              >
                取消
              </button>
              <button
                type="button"
                onClick={() => handleDeleteGoal(deletingGoal.id)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold bg-[#E11D48] hover:bg-[#BE123C] text-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5 text-[#FFFFFF]" />
                <span>确认彻底删除</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
