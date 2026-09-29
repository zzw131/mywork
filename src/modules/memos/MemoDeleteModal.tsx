/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Memo, getMemoDisplayTitle } from './types';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface MemoDeleteModalProps {
  memo: Memo | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const MemoDeleteModal: React.FC<MemoDeleteModalProps> = ({
  memo,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !memo) return null;

  const title = getMemoDisplayTitle(memo);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/60 backdrop-blur-[2px] animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[8px_8px_0_#171717] p-6 space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FFB4C6] border-2 border-[#171717] flex items-center justify-center shrink-0 shadow-[2px_2px_0_#171717]">
            <AlertTriangle className="w-5 h-5 text-[#9F1239]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#171717]">确认删除此条备忘？</h3>
            <p className="text-xs font-mono text-[#5F5E5A]">删除操作不可撤销，请谨慎确认。</p>
          </div>
        </div>

        <div className="p-3 bg-[#FBF7EF] border border-[#171717] rounded-xl">
          <div className="text-xs font-bold text-[#171717] truncate">{title}</div>
          <p className="text-xs font-mono text-[#5F5E5A] mt-1 line-clamp-2">
            {memo.content}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono font-bold bg-[#FFFFFF] hover:bg-[#EDE8DC] text-[#171717] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] cursor-pointer transition-all"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-mono font-bold bg-[#FF3B30] hover:bg-[#DC2626] text-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] cursor-pointer transition-all active:translate-x-0.5 active:translate-y-0.5"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>确认删除</span>
          </button>
        </div>
      </div>
    </div>
  );
};
