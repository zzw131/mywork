import { GoalItem, GoalCompletionRecord } from './types';

const STORAGE_KEY = 'personal_workbench_goals_v1';

const INITIAL_SEEDED_GOALS: GoalItem[] = [
  {
    id: 'goal-001',
    title: '完善 Personal Workbench 离线 PGlite 数据库架构与多端同步',
    summary:
      '为工作台引入全内嵌式 WebAssembly PostgreSQL 数据库引擎，实现离线持久化、冷启动瞬时还原与零外部服务器依赖。',
    link: 'https://github.com/electric-sql/pglite',
    linkLabel: 'PGlite 架构官方文档',
    category: 'project',
    priority: 'p0',
    status: 'in_progress',
    tags: ['工程项目', 'PGlite', '全栈'],
    startDate: '2026-09-18',
    targetDate: '2026-10-15',
    createdAt: '2026-09-18T10:00:00.000Z',
    updatedAt: '2026-09-22T08:30:00.000Z',
  },
  {
    id: 'goal-002',
    title: '系统研读并实践 Rust Async 运行时与并发模型 (Tokio/Mio)',
    summary:
      '攻克异步任务调度机制、Pin/Unpin 语义与无锁通道队列，编写一个轻量级本地端口嗅探与健康探活守护进程。',
    link: 'https://tokio.rs/tokio/tutorial',
    linkLabel: 'Tokio 官方进阶教程',
    category: 'learning',
    priority: 'p1',
    status: 'in_progress',
    tags: ['学习进阶', 'Rust', 'Tokio'],
    startDate: '2026-09-19',
    targetDate: '2026-11-01',
    createdAt: '2026-09-19T14:20:00.000Z',
    updatedAt: '2026-09-21T16:00:00.000Z',
  },
  {
    id: 'goal-003',
    title: '封装 Neo-Brutalism v4 风格的轻量化 CLI 开发者入口套件',
    summary:
      '支持从 Terminal 终端通过 `wb open [id]` 一键唤醒本地工作流或浏览器对应标签页，实现终端与图形工作台的无缝协同。',
    link: 'https://github.com',
    linkLabel: '查看 CLI 开源仓库',
    category: 'tool',
    priority: 'p2',
    status: 'in_progress',
    tags: ['效能工具', 'Neo-Brutalism', 'CLI'],
    startDate: '2026-09-20',
    targetDate: '2026-10-30',
    createdAt: '2026-09-20T09:15:00.000Z',
    updatedAt: '2026-09-20T09:15:00.000Z',
  },
  {
    id: 'goal-004',
    title: '上线工作台「资源详情档案页」与 Content Blocks 知识系统',
    summary:
      '提供类似 GitHub README 与飞书知识文档的深度档案载体，支持代码块复制、引用备忘与多协议入口矩阵。',
    link: '/resource/res-1',
    linkLabel: '查看首批资源档案',
    category: 'project',
    priority: 'p0',
    status: 'completed',
    tags: ['工程项目', 'Next.js', 'Neo-Brutalism'],
    startDate: '2026-09-15',
    targetDate: '2026-09-23',
    createdAt: '2026-09-15T08:00:00.000Z',
    updatedAt: '2026-09-22T22:30:00.000Z',
    completedAt: '2026-09-22T22:30:00.000Z',
    completionRecord: {
      startDate: '2026-09-15',
      completedAt: '2026-09-22T22:30:00.000Z',
      notes:
        '已完整实现 Hero 区域、正文多类型块系统（Heading/Text/Code/Quote/List/Image）、辅助入口集群与 Owner 原生编辑/删除流，并通过 19 项全量 QA 验证。',
      proofUrl: 'https://github.com',
      recordedBy: '邹大炮 (Owner)',
    },
  },
  {
    id: 'goal-005',
    title: '搭建个人技术全景知识雷达与高频技术选型清单',
    summary:
      '对前端工程化、分布式系统、AI 边缘计算及数据流架构进行分类收录，梳理出 50+ 项基准选型建议。',
    link: 'https://developer.mozilla.org',
    linkLabel: 'MDN Web 技术指南',
    category: 'reference',
    priority: 'p1',
    status: 'completed',
    tags: ['知识沉淀', '技术雷达', '参考'],
    startDate: '2026-09-10',
    targetDate: '2026-09-20',
    createdAt: '2026-09-10T12:00:00.000Z',
    updatedAt: '2026-09-20T18:00:00.000Z',
    completedAt: '2026-09-20T18:00:00.000Z',
    completionRecord: {
      startDate: '2026-09-10',
      completedAt: '2026-09-20T18:00:00.000Z',
      notes:
        '已在工作台完成首期知识卡片接入与标签规范设计，建立了一致性的 Neo-Brutalism v4 视觉映射。',
      recordedBy: '邹大炮 (Owner)',
    },
  },
];

/**
 * Sorts goals descending by latest activity (updatedAt || createdAt)
 */
export function sortGoalsByLatest(goals: GoalItem[]): GoalItem[] {
  return [...goals].sort((a, b) => {
    const timeA = new Date(a.updatedAt || a.createdAt || 0).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt || 0).getTime();
    return timeB - timeA;
  });
}

/**
 * Loads goals from LocalStorage or returns pre-seeded defaults
 */
export function loadGoals(): GoalItem[] {
  if (typeof window === 'undefined') return sortGoalsByLatest(INITIAL_SEEDED_GOALS);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      const sortedSeed = sortGoalsByLatest(INITIAL_SEEDED_GOALS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sortedSeed));
      return sortedSeed;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const cleaned = parsed.map((item: GoalItem, idx: number) => ({
        ...item,
        id: item.id || `goal-restored-${Date.now()}-${idx}`,
        tags:
          Array.isArray(item.tags) && item.tags.length > 0
            ? item.tags
            : ['工程项目'],
      }));
      return sortGoalsByLatest(cleaned);
    }
    return sortGoalsByLatest(INITIAL_SEEDED_GOALS);
  } catch (err) {
    console.warn('[GoalsStorage] Failed to read goals from localStorage, using fallback:', err);
    return sortGoalsByLatest(INITIAL_SEEDED_GOALS);
  }
}

/**
 * Saves current goals array into LocalStorage
 */
export function saveGoals(goals: GoalItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    const sorted = sortGoalsByLatest(goals);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    window.dispatchEvent(new CustomEvent('workbench:goals-updated'));
  } catch (err) {
    console.error('[GoalsStorage] Failed to write goals to localStorage:', err);
  }
}

/**
 * Creates a new unfinished or initialized goal
 */
export function createGoal(
  data: Omit<GoalItem, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
    status?: 'in_progress' | 'completed';
    completionRecord?: GoalCompletionRecord;
  }
): GoalItem {
  const now = new Date().toISOString();
  const newGoal: GoalItem = {
    ...data,
    id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    status: data.status || 'in_progress',
    createdAt: now,
    updatedAt: now,
  };

  const existing = loadGoals();
  const nextGoals = [newGoal, ...existing.filter((g) => g.id !== newGoal.id)];
  saveGoals(nextGoals);
  return newGoal;
}

/**
 * Updates an existing goal and places it at the very top of the list as the latest
 */
export function updateGoal(id: string, patch: Partial<GoalItem>): GoalItem[] {
  const existing = loadGoals();
  const now = new Date().toISOString();
  let updatedItem: GoalItem | null = null;
  const remaining: GoalItem[] = [];

  for (const g of existing) {
    if (g.id === id) {
      updatedItem = {
        ...g,
        ...patch,
        updatedAt: now,
      };
    } else {
      remaining.push(g);
    }
  }

  const nextGoals = updatedItem ? [updatedItem, ...remaining] : existing;
  const sorted = sortGoalsByLatest(nextGoals);
  saveGoals(sorted);
  return sorted;
}

/**
 * Manually records completion (or updates completion record if already completed)
 * Never accidentally reverts completion state when saving record.
 */
export function completeGoal(
  id: string,
  record?: GoalCompletionRecord
): GoalItem[] {
  const existing = loadGoals();
  const now = new Date().toISOString();
  let completedItem: GoalItem | null = null;
  const remaining: GoalItem[] = [];

  for (const g of existing) {
    if (g.id === id) {
      completedItem = {
        ...g,
        status: 'completed' as const,
        startDate: record?.startDate || g.startDate,
        completedAt: record?.completedAt || g.completedAt || now,
        updatedAt: now,
        completionRecord: record || g.completionRecord || {
          startDate: g.startDate,
          completedAt: now,
          notes: '已达成该目标，手动记录完成状态。',
          recordedBy: 'Owner',
        },
      };
    } else {
      remaining.push(g);
    }
  }

  const nextGoals = completedItem ? [completedItem, ...remaining] : existing;
  const sorted = sortGoalsByLatest(nextGoals);
  saveGoals(sorted);
  return sorted;
}

/**
 * Explicitly reopens a completed goal back to in_progress
 */
export function reopenGoal(id: string): GoalItem[] {
  const existing = loadGoals();
  const now = new Date().toISOString();
  let reopenedItem: GoalItem | null = null;
  const remaining: GoalItem[] = [];

  for (const g of existing) {
    if (g.id === id) {
      reopenedItem = {
        ...g,
        status: 'in_progress' as const,
        completedAt: undefined,
        completionRecord: undefined,
        updatedAt: now,
      };
    } else {
      remaining.push(g);
    }
  }

  const nextGoals = reopenedItem ? [reopenedItem, ...remaining] : existing;
  const sorted = sortGoalsByLatest(nextGoals);
  saveGoals(sorted);
  return sorted;
}

/**
 * Backward compatible toggle
 */
export function toggleGoalCompletion(
  id: string,
  record?: GoalCompletionRecord
): GoalItem[] {
  const existing = loadGoals();
  const target = existing.find((g) => g.id === id);
  if (!target) return existing;

  if (target.status === 'in_progress') {
    return completeGoal(id, record);
  } else {
    return reopenGoal(id);
  }
}

/**
 * Deletes a goal by ID
 */
export function deleteGoal(id: string): GoalItem[] {
  const existing = loadGoals();
  const nextGoals = existing.filter((g) => g.id !== id);
  saveGoals(nextGoals);
  return nextGoals;
}
