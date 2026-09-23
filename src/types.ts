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

export type DetailBlockType = 'heading' | 'text' | 'code' | 'quote' | 'list' | 'image';

export interface DetailBlock {
  id: string;
  type: DetailBlockType;
  content: string;
  meta?: {
    language?: string;
    level?: 2 | 3;
    caption?: string;
  };
}

export interface SecondaryEntry {
  id: string;
  label: string;
  target: string;
  protocol: 'url' | 'github' | 'localPath' | 'other';
}

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
  // Extended Detail Page content blocks & entries
  detailBlocks?: DetailBlock[];
  notes?: string;
  secondaryEntries?: SecondaryEntry[];
}

export interface UserIdentity {
  role: 'owner' | 'guest';
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
    shortLabel: '项目',
    accentColor: '#FFD84D',
    cssVar: '--v4-yellow',
    group: 'project',
  },
  app: {
    label: '应用',
    shortLabel: '应用',
    accentColor: '#FFD84D',
    cssVar: '--v4-yellow',
    group: 'project',
  },
  tool: {
    label: '工具',
    shortLabel: '工具',
    accentColor: '#A9D0FF',
    cssVar: '--v4-blue',
    group: 'tool',
  },
  website: {
    label: '网站',
    shortLabel: '网站',
    accentColor: '#FFB4C6',
    cssVar: '--v4-pink',
    group: 'web',
  },
  learning: {
    label: '学习',
    shortLabel: '学习',
    accentColor: '#C9B8FF',
    cssVar: '--v4-purple',
    group: 'learning',
  },
  note: {
    label: '笔记',
    shortLabel: '笔记',
    accentColor: '#C9B8FF',
    cssVar: '--v4-purple',
    group: 'reference',
  },
  repository: {
    label: '代码仓库',
    shortLabel: '代码仓库',
    accentColor: '#C9B8FF',
    cssVar: '--v4-purple',
    group: 'reference',
  },
  service: {
    label: '服务',
    shortLabel: '服务',
    accentColor: '#A9E5C3',
    cssVar: '--v4-mint',
    group: 'work',
  },
  generic: {
    label: '其他',
    shortLabel: '其他',
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
