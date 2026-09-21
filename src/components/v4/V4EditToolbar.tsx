import React from 'react';
import { Save, Plus, RotateCcw, AlertCircle, Check } from 'lucide-react';

interface V4EditToolbarProps {
  onSave: () => void;
  onOpenAdd: () => void;
  onReset: () => void;
  isSaving?: boolean;
  saveSuccess?: boolean;
}

export const V4EditToolbar: React.FC<V4EditToolbarProps> = ({
  onSave,
  onOpenAdd,
  onReset,
  isSaving = false,
  saveSuccess = false,
}) => {
  return (
    <div
      data-testid="edit-toolbar"
      className="sticky top-0 z-30 w-full bg-[#FFD84D] border-b-2 border-[#171717] py-2.5 px-4 sm:px-8 shadow-[0_4px_0_#171717]"
    >
      <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-3 text-xs md:text-sm font-bold text-[#171717]">
        <div className="flex items-center gap-2">
          <span className="flex items-center justify-center w-5 h-5 bg-[#171717] text-[#FFFFFF] rounded-full text-xs">
            !
          </span>
          <span>布局编辑模式生效中</span>
          <span className="hidden md:inline font-normal text-xs text-[#171717]/80">
            — 拖拽把手可调整卡片排版位置，点击置顶/删除按钮可快速调度
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            data-testid="toggle-add"
            onClick={onOpenAdd}
            className="v4-btn v4-btn-default text-xs px-3 py-1.5 flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>新增卡片</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="v4-btn v4-btn-default text-xs px-3 py-1.5 flex items-center gap-1.5"
            title="放弃未保存修改并重载初始排版"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置</span>
          </button>

          <button
            type="button"
            data-testid="save-layout"
            onClick={onSave}
            disabled={isSaving}
            className="v4-btn bg-[#171717] text-[#FFFFFF] hover:bg-black text-xs px-4 py-1.5 flex items-center gap-1.5 shadow-[3px_3px_0_#FFD84D]"
          >
            {saveSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#A9E5C3]" />
                <span>已持久化</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>{isSaving ? '正在保存...' : '保存布局'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
