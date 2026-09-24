export type GoalCategory =
  | 'project'
  | 'tool'
  | 'web'
  | 'learning'
  | 'reference'
  | 'personal';

export type GoalStatus = 'in_progress' | 'completed';

export type GoalPriority = 'p0' | 'p1' | 'p2';

export interface GoalCompletionRecord {
  startDate?: string;
  completedAt: string;
  notes: string;
  proofUrl?: string;
  recordedBy?: string;
}

export interface GoalItem {
  id: string;
  title: string;
  summary: string;
  link?: string;
  linkLabel?: string;
  category: GoalCategory;
  priority: GoalPriority;
  status: GoalStatus;
  startDate?: string;
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  completionRecord?: GoalCompletionRecord;
  // Link to existing Workbench Resource
  linkedResourceId?: string;
  linkedResourceTitle?: string;
  tags?: string[];
}

export const GOAL_CATEGORY_CONFIG: Record<
  GoalCategory,
  { label: string; bg: string; text: string; border: string; desc: string }
> = {
  project: {
    label: '工程项目',
    bg: '#DBEAFE',
    text: '#1E40AF',
    border: '#171717',
    desc: '系统架构演进、核心工程交付与代码迭代',
  },
  tool: {
    label: '效能工具',
    bg: '#FFEDD5',
    text: '#9A3412',
    border: '#171717',
    desc: '本地自动化脚本、CLI 工具、编译提效链',
  },
  web: {
    label: '产品网络',
    bg: '#CCFBF1',
    text: '#115E59',
    border: '#171717',
    desc: '公网发布、域名解析、Web 服务部署上线',
  },
  learning: {
    label: '学习进阶',
    bg: '#F3E8FF',
    text: '#6B21A8',
    border: '#171717',
    desc: '新技术栈调研、权威规范研读与概念突破',
  },
  reference: {
    label: '知识沉淀',
    bg: '#E2E8F0',
    text: '#334155',
    border: '#171717',
    desc: '个人知识库、文档索引、最佳实践整理',
  },
  personal: {
    label: '个人规划',
    bg: '#FFE4E6',
    text: '#9F1239',
    border: '#171717',
    desc: '工作节奏平衡、年度/季度阶段性里程碑',
  },
};

export const GOAL_PRIORITY_CONFIG: Record<
  GoalPriority,
  { label: string; badge: string; bg: string }
> = {
  p0: { label: 'P0 紧急高优', badge: 'P0', bg: '#FFB4C6' },
  p1: { label: 'P1 重点攻坚', badge: 'P1', bg: '#FFD84D' },
  p2: { label: 'P2 日常推进', badge: 'P2', bg: '#EDE8DC' },
};
