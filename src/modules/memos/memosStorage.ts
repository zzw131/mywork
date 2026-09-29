/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Memo } from './types';

// TODO: replace with Memo API
// Current implementation uses localStorage as client-side temporary state.
// When Codex implements the backend and database, replace these methods with REST/GraphQL endpoints.
const MEMOS_STORAGE_KEY = 'personal_workbench_memos_v1';

export const SEEDED_MEMOS: Memo[] = [
  {
    id: 'memo-001',
    title: 'Workbench 资产详情卡片交互细节优化',
    content:
      '首页全局搜索增加快捷拼音首字母检索。\n详情页入口目前排版略挤，下周可以把 Content Blocks 模块做成标签式折叠，方便在移动端查阅。',
    tags: ['工作台', '产品', '设计'],
    pinned: true,
    archived: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 2).toISOString(),
  },
  {
    id: 'memo-002',
    title: 'Docker 宿主机网络模式与端口映射规则备忘',
    content:
      '测试本地内网穿透时注意：\n1. 如果用 --net=host，容器无法使用 -p 暴露额外重定向端口；\n2. macOS 下 Docker Desktop 运行在 VM 虚拟机层，host.docker.internal 才能正确转发回 Mac 主机宿主端口。',
    tags: ['技术', '运维', 'Docker'],
    pinned: true,
    archived: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 12).toISOString(),
  },
  {
    id: 'memo-003',
    title: '关于 LLM 提示词工程的零样本少样本策略对比',
    content:
      'Few-shot 最好提供 3 个具有边界代表性的反例，而不仅是一味贴标准正例。负面反例往往更能约束大模型的幻觉扩散路径。',
    tags: ['AI', 'Prompt'],
    pinned: false,
    archived: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString(),
  },
  {
    id: 'memo-004',
    title: '',
    content:
      '周末去买一台新的 4K 27寸显示器支架，桌面理线管也要重新补两条，顺便给降噪耳机换一对记忆海绵耳罩。',
    tags: ['生活', '买单清单'],
    pinned: false,
    archived: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 30).toISOString(),
  },
  {
    id: 'memo-005',
    title: 'Neo-Brutalism V4 颜色 Token 清单',
    content:
      'Yellow: #FFD84D (主交互黄色)\nCream: #FBF7EF (米白底色)\nBorder: #171717 (2px 硬黑线)\nShadow: 4px 4px 0 #171717\nTag: #EDE8DC (标签底色)',
    tags: ['设计', '规范'],
    pinned: false,
    archived: false,
    createdAt: new Date(Date.now() - 3600 * 1000 * 96).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 60).toISOString(),
  },
  {
    id: 'memo-006',
    title: '已过期的旧版离线方案草稿 (归档测试)',
    content:
      '之前调研的 SQLite-WASM 方案，因为文件大小超过 12MB 且初始化慢，已由 PGlite 架构替代，保留该条目作历史备查。',
    tags: ['架构', '归档'],
    pinned: false,
    archived: true,
    createdAt: new Date(Date.now() - 3600 * 1000 * 200).toISOString(),
    updatedAt: new Date(Date.now() - 3600 * 1000 * 150).toISOString(),
  },
];

// Helper to notify other components/listeners
function notifyMemosUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('workbench:memos-updated'));
  }
}

// TODO: replace with Memo API (GET /api/memos)
export function loadMemos(): Memo[] {
  try {
    const raw = localStorage.getItem(MEMOS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[Memos] Failed to read from localStorage:', err);
  }
  // Initialize with seed memos on first run
  saveMemos(SEEDED_MEMOS, false);
  return SEEDED_MEMOS;
}

// TODO: replace with Memo API
export function saveMemos(memos: Memo[], notify = true): void {
  try {
    localStorage.setItem(MEMOS_STORAGE_KEY, JSON.stringify(memos));
    if (notify) {
      notifyMemosUpdated();
    }
  } catch (err) {
    console.error('[Memos] Failed to persist memos:', err);
  }
}

// TODO: replace with Memo API (POST /api/memos)
export function createMemo(data: {
  title?: string;
  content: string;
  tags?: string[];
  pinned?: boolean;
}): Memo {
  const all = loadMemos();
  const now = new Date().toISOString();
  const newMemo: Memo = {
    id: `memo-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    title: data.title?.trim() || undefined,
    content: data.content.trim(),
    tags: data.tags ? data.tags.map((t) => t.trim().replace(/^#+/, '')).filter(Boolean) : [],
    pinned: !!data.pinned,
    archived: false,
    createdAt: now,
    updatedAt: now,
  };

  const updated = [newMemo, ...all];
  saveMemos(updated);
  return newMemo;
}

// TODO: replace with Memo API (PUT /api/memos/:id)
export function updateMemo(
  id: string,
  updates: Partial<Omit<Memo, 'id' | 'createdAt'>>
): Memo | null {
  const all = loadMemos();
  const index = all.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const current = all[index];
  const updatedItem: Memo = {
    ...current,
    ...updates,
    tags: updates.tags
      ? updates.tags.map((t) => t.trim().replace(/^#+/, '')).filter(Boolean)
      : current.tags,
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...all];
  nextList[index] = updatedItem;
  saveMemos(nextList);
  return updatedItem;
}

// TODO: replace with Memo API (PATCH /api/memos/:id/pin)
export function togglePinMemo(id: string): Memo | null {
  const all = loadMemos();
  const index = all.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const current = all[index];
  const updatedItem: Memo = {
    ...current,
    pinned: !current.pinned,
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...all];
  nextList[index] = updatedItem;
  saveMemos(nextList);
  return updatedItem;
}

// TODO: replace with Memo API (PATCH /api/memos/:id/archive)
export function toggleArchiveMemo(id: string): Memo | null {
  const all = loadMemos();
  const index = all.findIndex((m) => m.id === id);
  if (index === -1) return null;

  const current = all[index];
  const updatedItem: Memo = {
    ...current,
    archived: !current.archived,
    updatedAt: new Date().toISOString(),
  };

  const nextList = [...all];
  nextList[index] = updatedItem;
  saveMemos(nextList);
  return updatedItem;
}

// TODO: replace with Memo API (DELETE /api/memos/:id)
export function deleteMemo(id: string): boolean {
  const all = loadMemos();
  const filtered = all.filter((m) => m.id !== id);
  if (filtered.length === all.length) return false;

  saveMemos(filtered);
  return true;
}

/**
 * Standard sorting logic:
 * 1. Pinned memos always appear first
 * 2. Within the same pinned/unpinned group, sort by updatedAt desc (most recently updated first)
 */
export function sortMemos(memos: Memo[]): Memo[] {
  return [...memos].sort((a, b) => {
    // 1. Pinned first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;

    // 2. Latest updatedAt first
    const timeA = new Date(a.updatedAt || a.createdAt).getTime();
    const timeB = new Date(b.updatedAt || b.createdAt).getTime();
    return timeB - timeA;
  });
}
