import { ObjectType, StatusType, WorkbenchObject, CardSize } from '../types';

export type ResourceType = ObjectType;

export type ResourceSize = 'small' | 'medium' | 'large' | 'banner';

export type ResourceStatus = StatusType;

export type EntryProtocol = 'url' | 'github' | 'localPath' | 'other';

export interface EntryItem {
  id: string;
  label: string;
  target: string;
  protocol: EntryProtocol;
  isPrimary?: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: ResourceType;
  primaryEntry: EntryItem;
  secondaryEntries: EntryItem[];
  summary: string;
  notes?: string;
  tags: string[];
  size: ResourceSize;
  pinned: boolean;
  status: ResourceStatus;
  createdAt: string;
  updatedAt: string;
  layout?: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
}

/**
 * Filter categories for Workbench navigation
 */
export type FilterCategory = 'all' | 'project' | 'tool' | 'web' | 'learning' | 'reference';

export interface FilterCategoryItem {
  key: FilterCategory;
  label: string;
  types?: ResourceType[];
}
