export type ObjectType =
  | 'project'
  | 'tool'
  | 'website'
  | 'app'
  | 'learning'
  | 'note'
  | 'repository'
  | 'service'
  | 'generic';

export type CardSize = 'small' | 'wide' | 'banner' | 'large';

export type StatusType = 'ok' | 'warn' | 'off';

export interface WorkbenchObject {
  id: string;
  title: string;
  type: ObjectType;
  cardSize: CardSize;
  pinned: boolean;
  summary: string;
  targetUrl: string;
  tags: string[];
  status: StatusType;
  updatedAt: string;
  createdAt: string;
  // Layout coordinates in 6-column grid
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UserIdentity {
  role: 'owner' | 'guest';
  username: string;
}

export interface TypeVisualConfig {
  label: string;
  shortLabel: string;
  accentColor: string;
  cssVar: string;
  group: 'project' | 'tool' | 'web' | 'learning' | 'reference' | 'work';
}

export const TYPE_VISUAL_MAP: Record<ObjectType, TypeVisualConfig> = {
  project: {
    label: '项目',
    shortLabel: 'PRJ',
    accentColor: '#FFD84D',
    cssVar: '--v4-yellow',
    group: 'project',
  },
  app: {
    label: '应用',
    shortLabel: 'APP',
    accentColor: '#FFD84D',
    cssVar: '--v4-yellow',
    group: 'project',
  },
  tool: {
    label: '工具',
    shortLabel: 'TOOL',
    accentColor: '#A9D0FF',
    cssVar: '--v4-blue',
    group: 'tool',
  },
  website: {
    label: '网站',
    shortLabel: 'WEB',
    accentColor: '#FFB4C6',
    cssVar: '--v4-pink',
    group: 'web',
  },
  learning: {
    label: '学习',
    shortLabel: 'LEARN',
    accentColor: '#C9B8FF',
    cssVar: '--v4-purple',
    group: 'learning',
  },
  note: {
    label: '笔记',
    shortLabel: 'NOTE',
    accentColor: '#C9B8FF',
    cssVar: '--v4-purple',
    group: 'reference',
  },
  repository: {
    label: '代码仓库',
    shortLabel: 'REPO',
    accentColor: '#C9B8FF',
    cssVar: '--v4-purple',
    group: 'reference',
  },
  service: {
    label: '服务',
    shortLabel: 'SVC',
    accentColor: '#A9E5C3',
    cssVar: '--v4-mint',
    group: 'work',
  },
  generic: {
    label: '其他',
    shortLabel: 'GEN',
    accentColor: '#EDE8DC',
    cssVar: '--v4-line',
    group: 'reference',
  },
};

export const GRID_CONSTANTS = {
  COLS: 6,
  ROW_HEIGHT: 88,
  MARGIN: [16, 16] as [number, number],
  CONTENT_MAX: 1200,
};
