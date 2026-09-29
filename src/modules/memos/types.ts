/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Memo {
  id: string;
  title?: string;
  content: string;
  tags: string[];
  pinned: boolean;
  archived: boolean;
  createdAt: string; // ISO 8601 string
  updatedAt: string; // ISO 8601 string
}

export type MemoFilterTab = 'all' | 'pinned' | 'recent';

/**
 * Extracts a displayable title for a Memo.
 * If a custom title is present and non-empty, use it.
 * Otherwise, uses the first non-empty line of the content, or falls back to a preview string.
 */
export function getMemoDisplayTitle(memo: { title?: string; content: string }): string {
  if (memo.title && memo.title.trim().length > 0) {
    return memo.title.trim();
  }
  const lines = memo.content.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length > 0) {
    const firstLine = lines[0];
    return firstLine.length > 40 ? firstLine.slice(0, 40) + '…' : firstLine;
  }
  return '未命名备忘';
}

/**
 * Extracts a multi-line snippet from the memo content, skipping the first line if it was used as the title.
 */
export function getMemoSnippet(memo: { title?: string; content: string }): string {
  const content = memo.content.trim();
  if (!content) return '无正文内容';

  const lines = content.split('\n').map((l) => l.trim()).filter(Boolean);
  // If no explicit title was given and the first line became the title, show the rest as snippet
  if (!memo.title && lines.length > 1) {
    return lines.slice(1).join('\n');
  }
  return content;
}

/**
 * Formats ISO date to human friendly Neo-Brutalism display format
 * e.g. "今天 14:32", "昨天 09:15", "09-28 16:40"
 */
export function formatMemoTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return '刚刚';

    const now = new Date();
    const isToday =
      date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    const isYesterday =
      date.getFullYear() === yesterday.getFullYear() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getDate() === yesterday.getDate();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    if (isToday) {
      return `今天 ${hours}:${minutes}`;
    }
    if (isYesterday) {
      return `昨天 ${hours}:${minutes}`;
    }

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}-${day} ${hours}:${minutes}`;
  } catch {
    return '刚刚';
  }
}
