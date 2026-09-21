import React, { useState } from 'react';
import { WorkbenchObject } from '../../types';
import { Resource, ResourceSize } from '../../types/resource';
import { toResource, toDatabaseCardSize, executeEntry } from '../../adapters/resourceAdapter';
import { V4Badge } from '../v4/V4Badge';
import { V4StatusDot } from '../v4/V4StatusDot';
import {
  Pin,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  GripVertical,
  Edit3,
  Maximize2,
  CornerDownRight,
  Github,
  Globe,
  Folder,
} from 'lucide-react';

export interface ResourceCardProps {
  resource: Resource | WorkbenchObject;
  isOwner: boolean;
  editMode?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onSelect?: (resource: Resource) => void;
  onOpen?: (resource: Resource) => void;
  onEdit?: (resource: Resource) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
  onChangeSize?: (id: string, newSize: ResourceSize) => void;
}

export const ResourceCard: React.FC<ResourceCardProps> = ({
  resource: rawResource,
  isOwner,
  editMode = false,
  selected = false,
  disabled = false,
  onSelect,
  onOpen,
  onEdit,
  onDelete,
  onTogglePin,
  onChangeSize,
}) => {
  // Normalize via adapter
  const res: Resource = 'primaryEntry' in rawResource ? rawResource : toResource(rawResource as WorkbenchObject);
  const [feedback, setFeedback] = useState<string | null>(null);

  const isSmall = res.size === 'small';
  const isMedium = res.size === 'medium';
  const isLarge = res.size === 'large';
  const isBanner = res.size === 'banner';

  const legacyCardSize = toDatabaseCardSize(res.size);

  const handleOpenAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    if (onOpen) {
      onOpen(res);
      return;
    }

    const result = await executeEntry(res.primaryEntry);
    setFeedback(result.action === 'copied' ? '已复制' : '已打开');
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleCardClick = () => {
    if (disabled) return;
    onSelect?.(res);
  };

  const handleCycleSize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onChangeSize) return;
    const sizes: ResourceSize[] = ['small', 'medium', 'large', 'banner'];
    const currentIndex = sizes.indexOf(res.size);
    const nextSize = sizes[(currentIndex + 1) % sizes.length];
    onChangeSize(res.id, nextSize);
  };

  // Entry icon
  const renderProtocolIcon = () => {
    switch (res.primaryEntry.protocol) {
      case 'github':
        return <Github className="w-3 h-3 text-[#171717] shrink-0" />;
      case 'url':
        return <Globe className="w-3 h-3 text-[#171717] shrink-0" />;
      case 'localPath':
        return <Folder className="w-3 h-3 text-[#171717] shrink-0" />;
      default:
        return <CornerDownRight className="w-3 h-3 text-[#171717] shrink-0" />;
    }
  };

  return (
    <div
      data-testid="object-card"
      data-object-id={res.id}
      data-card-size={legacyCardSize}
      onClick={handleCardClick}
      className={`v4-card group relative flex flex-col justify-between p-4 cursor-pointer overflow-hidden select-none h-full bg-[#FFFFFF] border-2 border-[#171717] rounded-xl transition-all duration-150 ${
        disabled
          ? 'opacity-60 bg-[#EDE8DC] shadow-none cursor-not-allowed pointer-events-none'
          : selected
          ? '-translate-x-1 -translate-y-1 shadow-[8px_8px_0_#171717] ring-2 ring-[#FFD84D]'
          : 'shadow-[4px_4px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#171717]'
      }`}
    >
      {/* Top Header: Badge, Status, Pin, Owner Hover/Edit Toolbar */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <V4Badge type={res.type} />
          <V4StatusDot status={res.status} />
          {res.pinned && (
            <span
              title="已置顶"
              className="inline-flex items-center text-[#171717] bg-[#FFD84D] border border-[#171717] rounded px-1.5 py-0.5 text-[10px] font-bold font-mono shadow-[1px_1px_0_#171717]"
            >
              <Pin className="w-2.5 h-2.5 fill-current rotate-45 mr-0.5" />
              PIN
            </span>
          )}
        </div>

        {/* Owner Controls: STRICTLY excluded from DOM if not owner */}
        {isOwner && (
          <div
            className={`flex items-center gap-1 bg-[#EDE8DC] border border-[#171717] rounded px-1.5 py-0.5 shadow-[2px_2px_0_#171717] z-10 transition-opacity ${
              editMode
                ? 'opacity-100'
                : 'opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cycle Size Button */}
            {onChangeSize && (
              <button
                type="button"
                onClick={handleCycleSize}
                className="px-1 py-0.5 text-[10px] font-mono font-bold hover:bg-[#FFD84D] rounded text-[#171717] uppercase"
                title={`当前尺寸: ${res.size} (点击切换)`}
              >
                {res.size.charAt(0).toUpperCase()}
              </button>
            )}

            {/* Pin Toggle Button */}
            {onTogglePin && (
              <button
                type="button"
                data-testid="pin-button"
                onClick={() => onTogglePin(res.id)}
                className="p-1 hover:bg-[#FFD84D] rounded text-[#171717]"
                title={res.pinned ? '取消置顶' : '置顶'}
              >
                <Pin className={`w-3 h-3 ${res.pinned ? 'fill-current' : ''}`} />
              </button>
            )}

            {/* Edit Button */}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(res)}
                className="p-1 hover:bg-[#FFD84D] rounded text-[#171717]"
                title="编辑详情"
              >
                <Edit3 className="w-3 h-3" />
              </button>
            )}

            {/* Delete Button */}
            {onDelete && (
              <button
                type="button"
                data-testid="delete-button"
                onClick={() => onDelete(res.id)}
                className="p-1 hover:bg-[#FFB4C6] rounded text-[#171717]"
                title="删除卡片"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}

            {/* Drag Handle in edit mode */}
            {editMode && (
              <div
                data-testid="drag-handle"
                className="card__drag-handle cursor-grab active:cursor-grabbing p-1 text-[#171717] hover:bg-[#FFD84D] rounded"
                title="按住拖拽卡片"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Title & Entry Address */}
      <div className="flex-1 min-w-0">
        <h3
          className={`font-bold text-[#171717] leading-snug tracking-tight mb-1 truncate ${
            isLarge ? 'text-lg' : 'text-sm md:text-base'
          }`}
          title={res.title}
        >
          {res.title}
        </h3>

        {/* Primary Entry Target Chip with one-click action */}
        <div
          onClick={handleOpenAction}
          className="inline-flex items-center gap-1.5 max-w-full text-xs font-mono font-medium px-2 py-0.5 bg-[#FBF7EF] border border-[#EDE8DC] group-hover:border-[#171717] rounded text-[#5F5E5A] group-hover:text-[#171717] mb-2 truncate transition-colors shadow-[1px_1px_0_rgba(0,0,0,0.05)]"
          title={res.primaryEntry.protocol === 'localPath' ? '点击复制本地路径' : '点击打开入口'}
        >
          {renderProtocolIcon()}
          <span className="truncate">{res.primaryEntry.target || '未配置入口'}</span>
          {feedback ? (
            <span className="text-[10px] font-bold text-[#171717] bg-[#A9E5C3] px-1 rounded flex items-center gap-0.5">
              <Check className="w-2.5 h-2.5" /> {feedback}
            </span>
          ) : res.primaryEntry.protocol === 'localPath' ? (
            <Copy className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
          ) : (
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 shrink-0" />
          )}
        </div>

        {/* Summary: strict lines per size to prevent grid overflow */}
        {!isSmall && res.summary && (
          <p
            className={`text-xs text-[#5F5E5A] leading-relaxed line-clamp-${
              isLarge ? '3' : '1'
            } mb-2`}
          >
            {res.summary}
          </p>
        )}
      </div>

      {/* Bottom Action & Tags Bar */}
      <div className="pt-2 border-t border-[#EDE8DC] flex items-center justify-between gap-2 text-xs text-[#888780] font-mono mt-auto">
        {/* Left: Tags or type label */}
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden">
          {res.tags && res.tags.length > 0 ? (
            res.tags.slice(0, isLarge ? 4 : isMedium || isBanner ? 2 : 1).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 bg-[#EDE8DC] text-[#171717] border border-[#171717] rounded text-[10px] font-semibold whitespace-nowrap"
              >
                #{tag}
              </span>
            ))
          ) : (
            <span className="text-[11px] text-[#5F5E5A] uppercase">{res.type}</span>
          )}
        </div>

        {/* Right: High Priority Open Button */}
        <div className="flex items-center gap-1 shrink-0 ml-auto">
          <button
            type="button"
            onClick={handleOpenAction}
            className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold text-[#171717] bg-[#FFFFFF] hover:bg-[#FFD84D] border border-[#171717] rounded shadow-[1px_1px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all whitespace-nowrap"
            title={res.primaryEntry.protocol === 'localPath' ? '复制本地路径' : '打开此入口'}
          >
            <span>{res.primaryEntry.protocol === 'localPath' ? '复制' : '打开'}</span>
            {res.primaryEntry.protocol === 'localPath' ? (
              <Copy className="w-3 h-3" />
            ) : (
              <ExternalLink className="w-3 h-3" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
