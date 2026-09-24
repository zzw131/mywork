import { WorkbenchObject } from '../types';
import { GoalItem } from '../modules/goals/types';

const CUSTOM_TAGS_STORAGE_KEY = 'workbench_custom_tags_v1';
const OBJECTS_STORAGE_KEY = 'personal_workbench_objects';
const GOALS_STORAGE_KEY = 'personal_workbench_goals_v1';

export interface TagWithMeta {
  tag: string;
  count: number;
  sources?: ('workbench' | 'goals' | 'custom')[];
}

/**
 * Get all standalone custom-created tags from storage
 */
export function getCustomTags(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOM_TAGS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Save custom tags
 */
export function saveCustomTags(tags: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    const unique = Array.from(new Set(tags.map((t) => t.trim()).filter(Boolean)));
    localStorage.setItem(CUSTOM_TAGS_STORAGE_KEY, JSON.stringify(unique));
  } catch (err) {
    console.error('Failed to save custom tags:', err);
  }
}

/**
 * Add a new custom tag
 */
export function addCustomTag(newTag: string): boolean {
  const clean = newTag.trim().replace(/^#+/, '');
  if (!clean) return false;
  const current = getCustomTags();
  if (current.includes(clean)) return true;
  saveCustomTags([...current, clean]);
  notifyTagsUpdated({ action: 'create', tag: clean });
  return true;
}

/**
 * Renames a tag across custom tags, all workbench objects, and all goals
 */
export function renameTagAcrossStorage(
  oldTag: string,
  newTag: string
): { updatedObjects: boolean; updatedGoals: boolean } {
  const cleanOld = oldTag.trim().replace(/^#+/, '');
  const cleanNew = newTag.trim().replace(/^#+/, '');
  if (!cleanOld || !cleanNew || cleanOld === cleanNew) {
    return { updatedObjects: false, updatedGoals: false };
  }

  // 1. Update custom tags
  const customTags = getCustomTags();
  const nextCustom = customTags.map((t) => (t === cleanOld ? cleanNew : t));
  saveCustomTags(nextCustom);

  let updatedObjects = false;
  let updatedGoals = false;

  // 2. Update workbench objects
  try {
    const raw = localStorage.getItem(OBJECTS_STORAGE_KEY);
    if (raw) {
      const objects: WorkbenchObject[] = JSON.parse(raw);
      if (Array.isArray(objects)) {
        let changed = false;
        objects.forEach((obj) => {
          if (obj.tags && obj.tags.includes(cleanOld)) {
            obj.tags = Array.from(
              new Set(obj.tags.map((t) => (t === cleanOld ? cleanNew : t)))
            );
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(OBJECTS_STORAGE_KEY, JSON.stringify(objects));
          updatedObjects = true;
        }
      }
    }
  } catch (err) {
    console.error('Failed to rename tag in objects storage:', err);
  }

  // 3. Update goals
  try {
    const rawGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (rawGoals) {
      const goals: GoalItem[] = JSON.parse(rawGoals);
      if (Array.isArray(goals)) {
        let changed = false;
        goals.forEach((g) => {
          if (g.tags && g.tags.includes(cleanOld)) {
            g.tags = Array.from(
              new Set(g.tags.map((t) => (t === cleanOld ? cleanNew : t)))
            );
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
          updatedGoals = true;
        }
      }
    }
  } catch (err) {
    console.error('Failed to rename tag in goals storage:', err);
  }

  notifyTagsUpdated({ action: 'rename', oldTag: cleanOld, newTag: cleanNew });
  return { updatedObjects, updatedGoals };
}

/**
 * Deletes a tag across custom tags, all workbench objects, and all goals
 */
export function deleteTagAcrossStorage(tagToDelete: string): boolean {
  const clean = tagToDelete.trim().replace(/^#+/, '');
  if (!clean) return false;

  // 1. Remove from custom tags
  const customTags = getCustomTags();
  saveCustomTags(customTags.filter((t) => t !== clean));

  // 2. Remove from workbench objects
  try {
    const raw = localStorage.getItem(OBJECTS_STORAGE_KEY);
    if (raw) {
      const objects: WorkbenchObject[] = JSON.parse(raw);
      if (Array.isArray(objects)) {
        let changed = false;
        objects.forEach((obj) => {
          if (obj.tags && obj.tags.includes(clean)) {
            obj.tags = obj.tags.filter((t) => t !== clean);
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(OBJECTS_STORAGE_KEY, JSON.stringify(objects));
        }
      }
    }
  } catch (err) {
    console.error('Failed to delete tag from objects storage:', err);
  }

  // 3. Remove from goals
  try {
    const rawGoals = localStorage.getItem(GOALS_STORAGE_KEY);
    if (rawGoals) {
      const goals: GoalItem[] = JSON.parse(rawGoals);
      if (Array.isArray(goals)) {
        let changed = false;
        goals.forEach((g) => {
          if (g.tags && g.tags.includes(clean)) {
            g.tags = g.tags.filter((t) => t !== clean);
            changed = true;
          }
        });
        if (changed) {
          localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
        }
      }
    }
  } catch (err) {
    console.error('Failed to delete tag from goals storage:', err);
  }

  notifyTagsUpdated({ action: 'delete', tag: clean });
  return true;
}

/**
 * Broadcast tag event for multi-component reactive sync
 */
export function notifyTagsUpdated(detail: {
  action: 'create' | 'rename' | 'delete';
  tag?: string;
  oldTag?: string;
  newTag?: string;
}): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('workbench:tags-updated', { detail }));
  }
}
