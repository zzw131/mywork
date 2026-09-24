import React, { useState } from 'react';
import {
  GoalItem,
  GOAL_CATEGORY_CONFIG,
  GOAL_PRIORITY_CONFIG,
} from './types';
import {
  Check,
  ExternalLink,
  Copy,
  Calendar,
  Layers,
  Edit3,
  Trash2,
  Clock,
  Target,
  FileText,
  AlertCircle,
} from 'lucide-react';

interface GoalCardProps {
  goal: GoalItem;
  isOwner: boolean;
  editMode?: boolean;
  onToggleComplete: (goal: GoalItem) => void;
  onViewCompletionRecord?: (goal: GoalItem) => void;
  onEdit: (goal: GoalItem) => void;
  onDelete: (goal: GoalItem) => void;
  onNavigateToResource?: (resourceId: string) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  isOwner,
  editMode = false,
  onToggleComplete,
  onViewCompletionRecord,
  onEdit,
  onDelete,
  onNavigateToResource,
}) => {
  const isCompleted = goal.status === 'completed';
  const categoryMeta = GOAL_CATEGORY_CONFIG[goal.category] || GOAL_CATEGORY_CONFIG.project;
  const priorityMeta = GOAL_PRIORITY_CONFIG[goal.priority] || GOAL_PRIORITY_CONFIG.p1;

  const [copiedLink, setCopiedLink] = useState(false);

  const handleCopyLink = async () => {
    if (!goal.link) return;
    try {
      await navigator.clipboard.writeText(goal.link);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 1800);
    } catch {
      // fallback
    }
  };

  return (
    <article
      className={`group relative bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl transition-all ${
        isCompleted
          ? 'shadow-[3px_3px_0_#171717] bg-[#FBFDFB]'
          : 'shadow-[5px_5px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5'
      }`}
    >
      {/* Top-Right Owner Toolbar: Appears on hover (or persistent in editMode), identical to homepage ResourceCard */}
      {(isOwner || editMode) && (
        <div
          className={`absolute top-4 right-4 flex items-center gap-1 bg-[#EDE8DC] border border-[#171717] rounded px-1.5 py-0.5 shadow-[2px_2px_0_#171717] z-20 transition-opacity whitespace-nowrap shrink-0 ${
            editMode
              ? 'opacity-100'
              : 'opacity-0 group-hover:opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 1. 查看/编辑手记 (Only for completed goals) */}
          {isCompleted && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewCompletionRecord?.(goal);
              }}
              className="p-1 hover:bg-[#FFD84D] rounded text-[#171717] transition-colors cursor-pointer shrink-0"
              title="查看/编辑手记"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          )}

          {/* 2. 编辑目标 (含老式灯开关切换状态) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(goal);
            }}
            className="p-1 hover:bg-[#FFD84D] rounded text-[#171717] transition-colors cursor-pointer shrink-0"
            title="编辑目标"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          {/* 3. 删除目标 */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(goal);
            }}
            className="p-1 rounded text-[#171717] hover:bg-[#FFB4C6] transition-colors cursor-pointer shrink-0"
            title="删除目标"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="p-5 sm:p-6 flex flex-col md:flex-row items-start gap-4">
        {/* Left: Interactive Checkmark Button (点击对号直接完成，已完成状态下锁定并提示通过编辑按钮切换) */}
        <div className="shrink-0 pt-0.5">
          <button
            type="button"
            disabled={!isOwner || isCompleted}
            onClick={() => {
              if (!isCompleted) {
                onToggleComplete(goal);
              }
            }}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl border-2 flex items-center justify-center transition-all select-none shrink-0 ${
              isCompleted
                ? 'bg-[#A9E5C3] border-[#171717] text-[#171717] shadow-[2px_2px_0_#171717] cursor-default'
                : 'bg-[#FFFFFF] border-[#171717] hover:bg-[#FFD84D] shadow-[2px_2px_0_#171717] cursor-pointer active:translate-x-0.5 active:translate-y-0.5'
            } ${!isOwner ? 'opacity-80 cursor-default' : ''}`}
            title={
              isCompleted
                ? '已达成（如需切回未完成，请点击卡片右上角编辑按钮）'
                : !isOwner
                ? '仅 Owner 可标记完成状态'
                : '点击对号：标记为达成（完成状态）'
            }
          >
            {isCompleted ? (
              <Check className="w-5 h-5 stroke-[3] text-[#171717]" />
            ) : (
              <div className="w-4 h-4 rounded border-2 border-[#171717]/40 group-hover:border-[#171717] transition-colors" />
            )}
          </button>
        </div>

        {/* Center: Main Goal Content */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Header Badges */}
          <div className="flex items-center gap-2 flex-wrap text-xs font-mono pr-20 sm:pr-24">
            {/* Category Badge */}
            <span
              style={{ backgroundColor: categoryMeta.bg, color: categoryMeta.text }}
              className="px-2 py-0.5 border border-[#171717] rounded-md font-bold text-[11px] shadow-[1px_1px_0_#171717] whitespace-nowrap shrink-0"
            >
              {categoryMeta.label}
            </span>

            {/* Priority Badge */}
            <span
              style={{ backgroundColor: priorityMeta.bg }}
              className="px-2 py-0.5 border border-[#171717] rounded-md font-bold text-[11px] text-[#171717] shadow-[1px_1px_0_#171717] whitespace-nowrap shrink-0"
            >
              {priorityMeta.label}
            </span>

            {/* Status indicator */}
            {isCompleted ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#A9E5C3] border border-[#171717] rounded-md text-[11px] font-bold text-[#171717] shadow-[1px_1px_0_#171717] whitespace-nowrap shrink-0">
                <Check className="w-3 h-3 text-[#10B981] stroke-[3]" />
                <span>已达成</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#FFF9E6] border border-[#171717] rounded-md text-[11px] font-bold text-[#171717] shadow-[1px_1px_0_#171717] whitespace-nowrap shrink-0">
                <Clock className="w-3 h-3 text-[#E65100]" />
                <span>进行中</span>
              </span>
            )}

            {/* Date Span: Start Date -> Target / Completed Date */}
            {(goal.startDate || goal.targetDate) && (
              <span className="text-[#5F5E5A] text-[11px] flex items-center gap-1 whitespace-nowrap shrink-0">
                <Calendar className="w-3 h-3 text-[#171717] shrink-0" />
                <span>
                  {goal.startDate ? goal.startDate : '未定'}
                  {' → '}
                  {isCompleted
                    ? goal.completedAt
                      ? goal.completedAt.split('T')[0]
                      : goal.targetDate || '已达成'
                    : goal.targetDate || '进行中'}
                </span>
              </span>
            )}

            {/* Linked Resource Chip */}
            {goal.linkedResourceId && (
              <button
                type="button"
                onClick={() => onNavigateToResource?.(goal.linkedResourceId!)}
                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#EDE8DC] hover:bg-[#FFD84D] border border-[#171717] rounded-md text-[11px] font-bold text-[#171717] shadow-[1px_1px_0_#171717] cursor-pointer transition-colors whitespace-nowrap shrink-0"
                title="直达工作台关联资产档案"
              >
                <Layers className="w-3 h-3 shrink-0" />
                <span className="truncate max-w-[130px]">
                  {goal.linkedResourceTitle || '关联工作台资产'}
                </span>
              </button>
            )}

            {/* Associated Tags */}
            {goal.tags && goal.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap">
                {goal.tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-[#FFFFFF] border border-[#171717] rounded-md text-[11px] font-mono font-medium text-[#171717] shadow-[1px_1px_0_#171717] shrink-0"
                  >
                    <span>#{t}</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Goal Title */}
          <div>
            <h3
              className={`text-base sm:text-lg font-bold font-sans tracking-tight text-[#171717] leading-snug ${
                isCompleted ? 'line-through text-[#5F5E5A]' : ''
              }`}
            >
              {goal.title}
            </h3>
          </div>

          {/* Goal Summary */}
          {goal.summary && (
            <p className="text-xs sm:text-sm text-[#33322E] leading-relaxed font-normal">
              {goal.summary}
            </p>
          )}

          {/* Specific Link Section */}
          {goal.link && (
            <div className="pt-1 flex items-center gap-2 flex-wrap">
              <a
                href={goal.link}
                target={goal.link.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-[#FBF7EF] hover:bg-[#FFD84D] text-[#171717] border border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#171717]" />
                <span className="truncate max-w-[240px]">
                  {goal.linkLabel || goal.link}
                </span>
              </a>

              <button
                type="button"
                onClick={handleCopyLink}
                className="p-1.5 bg-[#FFFFFF] hover:bg-[#EDE8DC] border border-[#171717] rounded-lg text-xs font-mono shadow-[1px_1px_0_#171717] cursor-pointer"
                title="复制具体链接"
              >
                {copiedLink ? (
                  <Check className="w-3.5 h-3.5 text-[#10B981]" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-[#5F5E5A]" />
                )}
              </button>
            </div>
          )}

          {/* Manual Completion Record Panel (手动记录完成状态) */}
          {isCompleted && goal.completionRecord && (
            <div className="mt-3 p-3.5 bg-[#F0FDF4] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] space-y-1.5">
              <div className="flex items-center justify-between text-xs font-mono border-b border-[#BBF7D0] pb-1.5">
                <div className="flex items-center gap-1.5 font-bold text-[#166534]">
                  <Target className="w-3.5 h-3.5 text-[#16a34a] stroke-[2.5]" />
                  <span>达成手记 · Completion Record</span>
                </div>
                <div className="text-[11px] text-[#5F5E5A]">
                  {goal.completionRecord.startDate ? `${goal.completionRecord.startDate} → ` : ''}
                  达成于 {new Date(goal.completionRecord.completedAt).toLocaleDateString()}
                </div>
              </div>

              <p className="text-xs font-sans text-[#171717] leading-relaxed whitespace-pre-wrap pt-0.5">
                {goal.completionRecord.notes}
              </p>

              {goal.completionRecord.proofUrl && (
                <div className="pt-1 flex items-center gap-1 text-[11px] font-mono">
                  <span className="text-[#888780]">成果凭证：</span>
                  <a
                    href={goal.completionRecord.proofUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#15803d] font-bold hover:underline inline-flex items-center gap-0.5 truncate max-w-[260px]"
                  >
                    <span>{goal.completionRecord.proofUrl}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {isOwner && (
                <div className="pt-1 flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => onToggleComplete(goal)}
                    className="text-[11px] font-mono font-bold text-[#15803d] hover:underline cursor-pointer inline-flex items-center gap-1"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>查看 / 编辑手记</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
