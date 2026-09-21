import { WorkbenchObject, CardSize } from '../types';
import {
  Resource,
  ResourceSize,
  EntryItem,
  EntryProtocol,
  FilterCategory,
} from '../types/resource';

/**
 * Detect protocol based on entry string
 */
export function detectProtocol(target: string): EntryProtocol {
  if (!target) return 'other';
  const trimmed = target.trim();
  if (/^https?:\/\/(www\.)?github\.com\//i.test(trimmed)) {
    return 'github';
  }
  if (/^https?:\/\//i.test(trimmed)) {
    return 'url';
  }
  if (
    trimmed.startsWith('~/') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('./') ||
    /^[A-Za-z]:\\/.test(trimmed)
  ) {
    return 'localPath';
  }
  return 'other';
}

/**
 * Legacy CardSize to ResourceSize mapping
 * DB model uses 'wide' | 'small' | 'large' | 'banner'
 * UI model uses 'medium' | 'small' | 'large' | 'banner'
 */
export function toResourceSize(dbSize: CardSize | string): ResourceSize {
  switch (dbSize) {
    case 'wide':
      return 'medium';
    case 'medium':
      return 'medium';
    case 'large':
      return 'large';
    case 'banner':
      return 'banner';
    case 'small':
    default:
      return 'small';
  }
}

/**
 * ResourceSize to legacy CardSize mapping (for non-destructive DB storage)
 */
export function toDatabaseCardSize(uiSize: ResourceSize): CardSize {
  switch (uiSize) {
    case 'medium':
      return 'wide';
    case 'large':
      return 'large';
    case 'banner':
      return 'banner';
    case 'small':
    default:
      return 'small';
  }
}

/**
 * Convert Database WorkbenchObject to Resource UI Model
 */
export function toResource(dbObj: WorkbenchObject): Resource {
  const primaryProtocol = detectProtocol(dbObj.targetUrl || '');

  const primaryEntry: EntryItem = {
    id: `${dbObj.id}-primary`,
    label: primaryProtocol === 'localPath' ? '本地路径' : primaryProtocol === 'github' ? 'GitHub 仓库' : '主入口',
    target: dbObj.targetUrl || '',
    protocol: primaryProtocol,
    isPrimary: true,
  };

  // Extract any secondary entries if present in tags or targetUrl conventions
  const secondaryEntries: EntryItem[] = [];

  // Default notes extraction (can be extended in the future from DB or metadata)
  return {
    id: dbObj.id,
    title: dbObj.title || '未命名资源',
    type: dbObj.type || 'generic',
    primaryEntry,
    secondaryEntries,
    summary: dbObj.summary || '',
    notes: '',
    tags: Array.isArray(dbObj.tags) ? [...dbObj.tags] : [],
    size: toResourceSize(dbObj.cardSize),
    pinned: Boolean(dbObj.pinned),
    status: dbObj.status || 'ok',
    createdAt: dbObj.createdAt || new Date().toISOString(),
    updatedAt: dbObj.updatedAt || new Date().toISOString(),
    layout: {
      x: typeof dbObj.x === 'number' ? dbObj.x : 0,
      y: typeof dbObj.y === 'number' ? dbObj.y : 0,
      w: typeof dbObj.w === 'number' ? dbObj.w : 2,
      h: typeof dbObj.h === 'number' ? dbObj.h : 2,
    },
  };
}

/**
 * Convert Resource UI Model back to Database WorkbenchObject
 */
export function fromResource(resource: Resource, existingDbObj?: WorkbenchObject): WorkbenchObject {
  const targetUrl = resource.primaryEntry?.target || '';
  const cardSize = toDatabaseCardSize(resource.size);

  // Default width and height based on size
  let w = 2;
  let h = 2;
  if (cardSize === 'banner') {
    w = 6;
    h = 2;
  } else if (cardSize === 'wide') {
    w = 4;
    h = 2;
  } else if (cardSize === 'large') {
    w = 4;
    h = 4;
  } else {
    w = 2;
    h = 2;
  }

  return {
    id: resource.id,
    title: resource.title,
    type: resource.type,
    cardSize,
    pinned: resource.pinned,
    summary: resource.summary,
    targetUrl,
    tags: [...resource.tags],
    status: resource.status,
    createdAt: resource.createdAt,
    updatedAt: new Date().toISOString(),
    x: existingDbObj?.x ?? resource.layout?.x ?? 0,
    y: existingDbObj?.y ?? resource.layout?.y ?? 0,
    w: existingDbObj?.w ?? resource.layout?.w ?? w,
    h: existingDbObj?.h ?? resource.layout?.h ?? h,
  };
}

/**
 * Convert an array of DB objects to Resource UI Models
 */
export function toResourceList(dbObjs: WorkbenchObject[]): Resource[] {
  return dbObjs.map(toResource);
}

/**
 * Convert an array of Resource UI Models back to DB objects
 */
export function fromResourceList(
  resources: Resource[],
  existingMap?: Map<string, WorkbenchObject>
): WorkbenchObject[] {
  return resources.map((res) => fromResource(res, existingMap?.get(res.id)));
}

/**
 * Lightweight Entry Open Strategy (Phase 1 constraint):
 * - URL / GitHub: Open in new tab
 * - localPath: Copy to clipboard
 * - other: Copy to clipboard
 */
export async function executeEntry(entry: EntryItem): Promise<{
  action: 'opened' | 'copied';
  success: boolean;
  message: string;
}> {
  if (!entry || !entry.target) {
    return { action: 'copied', success: false, message: '无效的目标入口' };
  }

  const target = entry.target.trim();
  const protocol = entry.protocol || detectProtocol(target);

  if (protocol === 'url' || protocol === 'github') {
    try {
      window.open(target, '_blank', 'noopener,noreferrer');
      return { action: 'opened', success: true, message: `已打开: ${target}` };
    } catch {
      // Fallback to copy if popup blocked
      await navigator.clipboard?.writeText(target);
      return { action: 'copied', success: true, message: `已复制网址: ${target}` };
    }
  }

  // Local path or other: Copy to clipboard with instant feedback
  try {
    await navigator.clipboard?.writeText(target);
    return {
      action: 'copied',
      success: true,
      message: protocol === 'localPath' ? `已复制本地路径: ${target}` : `已复制: ${target}`,
    };
  } catch {
    return { action: 'copied', success: false, message: '复制失败，请手动选择' };
  }
}

/**
 * Category filtering helper
 */
export const CATEGORY_TYPE_MAPPING: Record<FilterCategory, string[]> = {
  all: [],
  project: ['project', 'app'],
  tool: ['tool'],
  web: ['website', 'service'],
  learning: ['learning'],
  reference: ['note', 'repository', 'generic'],
};
