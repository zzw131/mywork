import React, { useState, useRef, useEffect } from 'react';
import { WorkbenchObject, TYPE_VISUAL_MAP } from '../../types';
import { Resource, ResourceSize } from '../../types/resource';
import { toResource, toDatabaseCardSize, executeEntry } from '../../adapters/resourceAdapter';
import { V4Badge } from '../v4/V4Badge';
import {
  Pin,
  Trash2,
  ExternalLink,
  Copy,
  Check,
  GripVertical,
  Edit3,
  MoreHorizontal,
  CornerDownRight,
  Github,
  Globe,
  Folder,
  Maximize2,
  Layers,
} from 'lucide-react';

export interface ResourceCardProps {
  resource: Resource | WorkbenchObject;
  isOwner: boolean;
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
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isSmall = res.size === 'small';
  const isMedium = res.size === 'medium';
  const isLarge = res.size === 'large';
  const isBanner = res.size === 'banner';

  const legacyCardSize = toDatabaseCardSize(res.size);

  // Close more menu on click outside or ESC
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMoreMenuOpen(false);
        setConfirmDelete(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMoreMenuOpen(false);
        setConfirmDelete(false);
      }
    };

    if (moreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [moreMenuOpen]);

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

  // Entry protocol icon
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

  const sizeLabels: { size: ResourceSize; label: string; desc: string }[] = [
    { size: 'small', label: '紧凑 (小)', desc: '2列' },
    { size: 'medium', label: '标准 (中)', desc: '4列' },
    { size: 'large', label: '双高 (大)', desc: '4列 x 2高' },
    { size: 'banner', label: '通栏 (横幅)', desc: '6列' },
  ];

  return (
    <div
      data-testid="object-card"
      data-object-id={res.id}
      data-card-size={legacyCardSize}
      onClick={handleCardClick}
      className={`v4-card group relative flex flex-col justify-between p-4 cursor-pointer select-none h-full bg-[#FFFFFF] border-2 border-[#171717] rounded-xl transition-all duration-150 ${
        disabled
          ? 'opacity-60 bg-[#EDE8DC] shadow-none cursor-not-allowed pointer-events-none'
          : selected
          ? '-translate-x-1 -translate-y-1 shadow-[8px_8px_0_#171717] ring-2 ring-[#FFD84D]'
          : 'shadow-[4px_4px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0_#171717]'
      }`}
    >
      {/* Top Header: Badge, Status, Pin, Owner Action Group (Pencil + More Menu) */}
      <div className="flex items-start justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2 flex-wrap">
          <V4Badge type={res.type} />
          {res.pinned && (
            <span
              title="已置顶"
              className="inline-flex items-center text-[#171717] bg-[#FFD84D] border border-[#171717] rounded px-1.5 py-0.5 text-[10px] font-bold font-mono shadow-[1px_1px_0_#171717]"
            >
              <Pin className="w-2.5 h-2.5 fill-current rotate-45 mr-0.5" />
              置顶
            </span>
          )}
        </div>

        {/* Owner Controls: STRICTLY excluded from DOM if visitor. Visible on hover for Admin */}
        {isOwner && (
          <div
            className="flex items-center gap-1.5 z-20 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity"
            onClick={(e) => e.stopPropagation()}
            ref={menuRef}
          >
            {/* 1. Drag Handle for easy reordering */}
            <div
              data-testid="drag-handle"
              className="card__drag-handle cursor-grab active:cursor-grabbing p-1 text-[#5F5E5A] hover:text-[#171717] bg-[#EDE8DC] hover:bg-[#FFD84D] border border-[#171717] rounded transition-colors shadow-[1px_1px_0_#171717]"
              title="按住拖拽排序卡片"
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>

            {/* 2. Pencil Edit Button: Direct Edit Resource */}
            {onEdit && (
              <button
                type="button"
                data-testid="edit-card-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(res);
                }}
                className="p-1 bg-[#FFFFFF] hover:bg-[#FFD84D] border border-[#171717] rounded text-[#171717] shadow-[1px_1px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                title="编辑卡片 (名称、简介、网址、标签)"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* 3. More Menu Button: Dropdown for Pin, Size, Delete */}
            <div className="relative">
              <button
                type="button"
                data-testid="more-card-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setMoreMenuOpen((prev) => !prev);
                }}
                className={`p-1 border border-[#171717] rounded text-[#171717] shadow-[1px_1px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer ${
                  moreMenuOpen ? 'bg-[#FFD84D]' : 'bg-[#FFFFFF] hover:bg-[#EDE8DC]'
                }`}
                title="更多操作 (置顶、调整尺寸、删除)"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* More Dropdown Menu */}
              {moreMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1.5 w-48 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] p-2 z-50 animate-in fade-in zoom-in-95 duration-100 font-mono text-xs text-left"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Pin / Unpin Action */}
                  {onTogglePin && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onTogglePin(res.id);
                        setMoreMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-[#FFF9E6] text-[#171717] font-bold transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-1.5">
                        <Pin className={`w-3.5 h-3.5 ${res.pinned ? 'fill-current' : ''}`} />
                        <span>{res.pinned ? '取消置顶' : '置顶卡片'}</span>
                      </span>
                      {res.pinned && (
                        <span className="text-[10px] bg-[#FFD84D] px-1 rounded border border-[#171717]">
                          PINNED
                        </span>
                      )}
                    </button>
                  )}

                  {/* Adjust Size Section */}
                  {onChangeSize && (
                    <div className="my-1.5 pt-1.5 border-t border-[#171717]/15">
                      <div className="text-[10px] font-bold text-[#888780] uppercase px-2 mb-1 flex items-center gap-1">
                        <Maximize2 className="w-3 h-3" />
                        <span>调整卡片尺寸</span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 px-1">
                        {sizeLabels.map((sz) => {
                          const isCurrent = res.size === sz.size;
                          return (
                            <button
                              key={sz.size}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onChangeSize(res.id, sz.size);
                                setMoreMenuOpen(false);
                              }}
                              className={`px-1.5 py-1 text-[11px] rounded border text-center transition-all cursor-pointer font-medium ${
                                isCurrent
                                  ? 'bg-[#171717] text-[#FFD84D] border-[#171717] font-bold'
                                  : 'bg-[#FBF7EF] hover:bg-[#FFD84D] text-[#171717] border-[#171717]/20'
                              }`}
                              title={`${sz.label} (${sz.desc})`}
                            >
                              {sz.size === 'small'
                                ? '小 2列'
                                : sz.size === 'medium'
                                ? '中 4列'
                                : sz.size === 'large'
                                ? '大 双高'
                                : '横幅 6列'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Delete Section */}
                  {onDelete && (
                    <div className="mt-1.5 pt-1.5 border-t border-[#171717]/15">
                      {confirmDelete ? (
                        <div className="space-y-1 p-1 bg-[#FFE2E2] border border-[#B91C1C] rounded-lg">
                          <div className="text-[10px] text-[#B91C1C] font-bold text-center">
                            确定删除此卡片？
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDelete(res.id);
                                setMoreMenuOpen(false);
                                setConfirmDelete(false);
                              }}
                              className="flex-1 py-1 bg-[#B91C1C] text-[#FFFFFF] text-[10px] font-bold rounded hover:bg-[#991B1B] text-center cursor-pointer"
                            >
                              确定
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDelete(false);
                              }}
                              className="flex-1 py-1 bg-[#EDE8DC] text-[#171717] text-[10px] font-bold rounded hover:bg-[#D3D1C7] text-center cursor-pointer"
                            >
                              取消
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          type="button"
                          data-testid="delete-card-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDelete(true);
                          }}
                          className="w-full flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-[#FFE2E2] text-[#B91C1C] font-bold transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>删除卡片</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
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

        {/* Primary Entry Target Chip with one-click action (hidden on small to keep card uncluttered) */}
        {!isSmall && (
          <div
            onClick={handleOpenAction}
            className="inline-flex items-center gap-1.5 max-w-full text-xs font-mono font-medium px-2 py-0.5 bg-[#FBF7EF] border border-[#EDE8DC] group-hover:border-[#171717] rounded text-[#5F5E5A] group-hover:text-[#171717] mb-2 truncate transition-colors shadow-[1px_1px_0_rgba(0,0,0,0.05)] cursor-pointer"
            title={res.primaryEntry.protocol === 'localPath' ? '点击复制本地路径' : '点击直接打开主入口'}
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
        )}

        {/* Summary (shown on standard, large, banner) */}
        {!isSmall && res.summary && (
          <p
            className={`text-xs text-[#5F5E5A] leading-relaxed line-clamp-2 ${
              isLarge ? 'line-clamp-4' : 'line-clamp-2'
            }`}
          >
            {res.summary}
          </p>
        )}
      </div>

      {/* Footer: Tags & Update info */}
      <div className="mt-3 pt-2.5 border-t border-[#EDE8DC] flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 flex-wrap overflow-hidden max-h-6">
          {(res.tags || []).slice(0, isSmall ? 1 : 3).map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-mono text-[#5F5E5A] bg-[#FBF7EF] border border-[#EDE8DC] px-1.5 py-0.2 rounded truncate max-w-[90px]"
            >
              #{tag}
            </span>
          ))}
          {(res.tags || []).length > (isSmall ? 1 : 3) && (
            <span className="text-[10px] font-mono text-[#888780]">
              +{(res.tags || []).length - (isSmall ? 1 : 3)}
            </span>
          )}
        </div>

        <span className="text-[10px] font-mono text-[#888780] shrink-0">
          {res.updatedAt}
        </span>
      </div>
    </div>
  );
};
