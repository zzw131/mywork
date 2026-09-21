import React, { useState } from 'react';
import { WorkbenchObject, TYPE_VISUAL_MAP } from '../../types';
import { Resource } from '../../types/resource';
import { toResource, executeEntry } from '../../adapters/resourceAdapter';
import { V4Badge } from '../v4/V4Badge';
import { V4StatusDot } from '../v4/V4StatusDot';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Clock,
  Calendar,
  Pin,
  Hash,
  Layers,
  FileText,
  Terminal,
  Folder,
  Github,
  Globe,
  CornerDownRight,
} from 'lucide-react';

export interface DetailModalProps {
  object: WorkbenchObject | Resource | null;
  onClose: () => void;
  onEdit?: (obj: WorkbenchObject) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  object: rawObject,
  onClose,
  onEdit,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!rawObject) return null;

  const res: Resource = 'primaryEntry' in rawObject ? rawObject : toResource(rawObject as WorkbenchObject);
  const visual = TYPE_VISUAL_MAP[res.type] || TYPE_VISUAL_MAP.generic;

  const handleOpenPrimary = async () => {
    const result = await executeEntry(res.primaryEntry);
    setFeedback(result.action === 'copied' ? '已复制' : '已打开');
    setTimeout(() => setFeedback(null), 1500);
  };

  const handleCopySecondary = async (target: string) => {
    await navigator.clipboard?.writeText(target);
    setFeedback('已复制');
    setTimeout(() => setFeedback(null), 1500);
  };

  // Generate suggested secondary entries based on primary target
  const secondaryEntries = [...(res.secondaryEntries || [])];
  if (secondaryEntries.length === 0) {
    if (res.primaryEntry.protocol === 'localPath') {
      secondaryEntries.push({
        id: 'sec-term',
        label: '终端进入路径',
        target: `cd ${res.primaryEntry.target}`,
        protocol: 'other',
      });
      secondaryEntries.push({
        id: 'sec-code',
        label: 'VS Code 打开',
        target: `code ${res.primaryEntry.target}`,
        protocol: 'other',
      });
    } else if (res.primaryEntry.protocol === 'github') {
      secondaryEntries.push({
        id: 'sec-git-clone',
        label: 'Git Clone 镜像',
        target: `git clone ${res.primaryEntry.target}.git`,
        protocol: 'other',
      });
    } else if (res.primaryEntry.protocol === 'url') {
      secondaryEntries.push({
        id: 'sec-curl',
        label: 'cURL 探测端点',
        target: `curl -I ${res.primaryEntry.target}`,
        protocol: 'other',
      });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      {/* Backdrop click */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Dialog container with exact testid */}
      <div
        data-testid="preview-overlay"
        className="relative z-10 w-full max-w-xl bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl p-6 shadow-[8px_8px_0_#171717] flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-start justify-between gap-4 border-b-2 border-[#171717] pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <V4Badge type={res.type} showFullLabel />
            <V4StatusDot status={res.status} />
            <span className="text-xs font-mono font-medium text-[#5F5E5A]">
              UUID: {res.id.slice(-8)}
            </span>
            {res.pinned && (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-[#171717] bg-[#FFD84D] px-2 py-0.5 border border-[#171717] rounded shadow-[1px_1px_0_#171717]">
                <Pin className="w-3 h-3 fill-current rotate-45" />
                已置顶
              </span>
            )}
          </div>

          <button
            type="button"
            data-testid="overlay-close"
            onClick={onClose}
            className="p-1.5 text-[#171717] hover:bg-[#FFB4C6] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] transition-all cursor-pointer"
            title="关闭详情 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Title & Summary */}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#171717] tracking-tight mb-2">
            {res.title}
          </h2>
          <p className="text-xs md:text-sm text-[#5F5E5A] leading-relaxed">
            {res.summary || '暂无简介描述信息。'}
          </p>
        </div>

        {/* Primary Entry Banner */}
        <div className="p-3.5 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-mono font-bold text-[#888780] uppercase tracking-wider">
                主入口 · Primary Entry
              </span>
              <span className="px-1 py-0.2 bg-[#EDE8DC] border border-[#171717] rounded text-[10px] font-mono font-semibold">
                {res.primaryEntry.protocol === 'localPath'
                  ? '本地路径'
                  : res.primaryEntry.protocol === 'github'
                  ? 'GitHub'
                  : 'Web URL'}
              </span>
            </div>
            <div className="font-mono text-xs md:text-sm font-semibold text-[#171717] truncate select-all">
              {res.primaryEntry.target}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleOpenPrimary}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-mono text-[#171717] bg-[#FFD84D] hover:bg-[#FACC15] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              {feedback ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{feedback}</span>
                </>
              ) : res.primaryEntry.protocol === 'localPath' ? (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>复制路径</span>
                </>
              ) : (
                <>
                  <span>立即直达</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Secondary Entries List */}
        {secondaryEntries.length > 0 && (
          <div>
            <span className="block text-xs font-mono font-bold text-[#888780] mb-2 flex items-center gap-1">
              <CornerDownRight className="w-3.5 h-3.5" /> 辅助快捷动作 / 扩展命令
            </span>
            <div className="space-y-1.5">
              {secondaryEntries.map((sec) => (
                <div
                  key={sec.id}
                  className="flex items-center justify-between gap-2 p-2 bg-[#FFFFFF] border border-[#171717] rounded-lg text-xs font-mono shadow-[1px_1px_0_#171717]"
                >
                  <div className="min-w-0 flex-1 truncate">
                    <span className="font-bold text-[#171717] mr-2">{sec.label}:</span>
                    <span className="text-[#5F5E5A] select-all">{sec.target}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySecondary(sec.target)}
                    className="p-1 hover:bg-[#EDE8DC] border border-[#171717] rounded text-[#171717] shrink-0"
                    title="复制"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Notes & Remark */}
        <div>
          <span className="block text-xs font-mono font-bold text-[#888780] mb-1.5 flex items-center gap-1">
            <FileText className="w-3.5 h-3.5" /> 运行备注与配置
          </span>
          <div className="p-3 bg-[#EDE8DC]/30 border border-[#171717] rounded-xl text-xs font-mono text-[#5F5E5A] leading-relaxed">
            {res.notes || '该入口已通过 Neo-Brutalism v4 规范接入本地调度层，就绪状态正常。'}
          </div>
        </div>

        {/* Metadata Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3 bg-[#EDE8DC]/50 border border-[#171717] rounded-xl text-xs font-mono">
          <div>
            <span className="text-[#888780] flex items-center gap-1 mb-0.5">
              <Layers className="w-3 h-3" /> 卡片规格
            </span>
            <span className="font-bold text-[#171717] uppercase">
              {res.size}
            </span>
          </div>

          <div>
            <span className="text-[#888780] flex items-center gap-1 mb-0.5">
              <Clock className="w-3 h-3" /> 最近更新
            </span>
            <span className="font-bold text-[#171717]">
              {new Date(res.updatedAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-[#888780] flex items-center gap-1 mb-0.5">
              <Calendar className="w-3 h-3" /> 登记时间
            </span>
            <span className="font-bold text-[#171717]">
              {new Date(res.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Tags */}
        {res.tags && res.tags.length > 0 && (
          <div>
            <span className="block text-xs font-mono font-bold text-[#888780] mb-2 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5" /> 关联标签
            </span>
            <div className="flex flex-wrap gap-1.5">
              {res.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 text-xs font-mono font-bold text-[#171717] bg-[#FFFFFF] border border-[#171717] rounded-md shadow-[1px_1px_0_#171717]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
