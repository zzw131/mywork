import React, { useState } from 'react';
import { WorkbenchObject } from '../types';
import { ResourceSize } from '../types/resource';
import { V4ResourceCard } from './v4/V4ResourceCard';

export interface HomeGridProps {
  title?: React.ReactNode;
  objects: WorkbenchObject[];
  editMode: boolean;
  isOwner: boolean;
  onSelectObject: (obj: WorkbenchObject) => void;
  onTogglePin: (id: string) => void;
  onDeleteObject: (id: string) => void;
  onReorder: (draggedId: string, targetId: string) => void;
  onEditObject?: (obj: WorkbenchObject) => void;
  onChangeSize?: (id: string, newSize: ResourceSize) => void;
}

export const HomeGrid: React.FC<HomeGridProps> = ({
  title,
  objects,
  editMode,
  isOwner,
  onSelectObject,
  onTogglePin,
  onDeleteObject,
  onReorder,
  onEditObject,
  onChangeSize,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  const getColSpanClass = (size: string) => {
    switch (size) {
      case 'banner':
        return 'col-span-1 sm:col-span-2 lg:col-span-6 row-span-2 min-h-[192px]';
      case 'wide':
      case 'medium':
        return 'col-span-1 sm:col-span-2 lg:col-span-4 row-span-2 min-h-[192px]';
      case 'large':
        return 'col-span-1 sm:col-span-2 lg:col-span-4 row-span-4 min-h-[396px]';
      case 'small':
      default:
        return 'col-span-1 sm:col-span-1 lg:col-span-2 row-span-2 min-h-[192px]';
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (!editMode || !isOwner) return;
    setDraggedId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!editMode || !isOwner) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    if (!editMode || !isOwner) return;
    e.preventDefault();
    if (draggedId && draggedId !== targetId) {
      onReorder(draggedId, targetId);
    }
    setDraggedId(null);
  };

  if (objects.length === 0) {
    return (
      <div className="w-full md:w-[85%] lg:w-[80%] mx-auto px-4 sm:px-6 pt-5 pb-8">
        <div className="relative border-2 border-[#171717] rounded-2xl bg-[#FFFFFF] shadow-[4px_4px_0_#171717] pt-8 pb-10 px-4 sm:px-6 text-center">
          {title && (
            <div className="absolute -top-3.5 left-4 sm:left-6 flex items-center gap-2 px-3 py-1 bg-[#FFD84D] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] z-10 select-none">
              <span className="w-2 h-2 rounded-full bg-[#171717]" />
              <div className="text-xs sm:text-sm font-bold text-[#171717] tracking-tight uppercase font-mono">
                {title}
              </div>
            </div>
          )}

          <div
            data-testid="home-grid"
            data-edit-mode={editMode}
            className="react-grid-layout max-w-md mx-auto p-6 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717]"
          >
            <div className="w-12 h-12 mx-auto mb-3 bg-[#EDE8DC] border border-[#171717] rounded-xl flex items-center justify-center font-mono text-xl">
              ∅
            </div>
            <h3 className="text-base font-bold text-[#171717] mb-1">未匹配到相关入口</h3>
            <p className="text-xs text-[#5F5E5A]">
              尝试调整关键词、切换分类过滤标签，或在编辑模式下添加新的入口资产。
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full md:w-[85%] lg:w-[80%] mx-auto px-4 sm:px-6 pt-5 pb-8">
      {/* Outer Bordered Container with Title mounted directly on the top border */}
      <div className="relative border-2 border-[#171717] rounded-2xl bg-[#FFFFFF] shadow-[4px_4px_0_#171717] pt-7 pb-5 px-3 sm:px-5">
        {/* Title mounted directly on top border line */}
        {title && (
          <div className="absolute -top-3.5 left-4 sm:left-6 flex items-center gap-2 px-3 py-1 bg-[#FFD84D] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] z-10 select-none">
            <span className="w-2 h-2 rounded-full bg-[#171717]" />
            <div className="text-xs sm:text-sm font-bold text-[#171717] tracking-tight uppercase font-mono">
              {title}
            </div>
          </div>
        )}

        <div className="absolute -top-3 right-4 sm:right-6 hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-[#FFFFFF] border-2 border-[#171717] rounded-md text-[11px] font-mono text-[#5F5E5A] shadow-[2px_2px_0_#171717] z-10">
          <span>6 列 Neo-Brutalism 网格</span>
        </div>

        {/* Grid container with exact testid and layout persistence */}
        <div
          data-testid="home-grid"
          data-edit-mode={editMode}
          className={`react-grid-layout grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 auto-rows-[88px] transition-all ${
            editMode
              ? 'p-2 bg-[#FFD84D]/10 border-2 border-dashed border-[#171717] rounded-xl'
              : ''
          }`}
        >
          {objects.map((obj) => {
            const colSpan = getColSpanClass(obj.cardSize);
            const isDragging = draggedId === obj.id;

            return (
              <div
                key={obj.id}
                className={`react-grid-item ${colSpan} transition-opacity duration-150 ${
                  isDragging ? 'opacity-40 scale-98' : 'opacity-100'
                }`}
                draggable={editMode && isOwner}
                onDragStart={(e) => handleDragStart(e, obj.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, obj.id)}
              >
                <V4ResourceCard
                  object={obj}
                  isOwner={isOwner}
                  editMode={editMode}
                  onSelect={onSelectObject}
                  onTogglePin={onTogglePin}
                  onDelete={onDeleteObject}
                  onEdit={onEditObject}
                  onChangeSize={onChangeSize}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
