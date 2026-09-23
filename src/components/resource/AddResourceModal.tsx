import React, { useState, useEffect, useMemo } from 'react';
import { WorkbenchObject, ObjectType } from '../../types';
import { ResourceSize } from '../../types/resource';
import { detectProtocol, toResourceSize, toDatabaseCardSize } from '../../adapters/resourceAdapter';
import { ResourceCard } from './ResourceCard';
import {
  X,
  Plus,
  Edit3,
  Globe,
  Folder,
  Github,
  Pin,
  Eye,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

export interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (obj: WorkbenchObject) => void;
  initialObject?: WorkbenchObject | null;
}

const ALL_TYPES: { key: ObjectType; label: string; color: string }[] = [
  { key: 'project', label: '项目', color: '#FFD84D' },
  { key: 'tool', label: '工具', color: '#A9D0FF' },
  { key: 'website', label: '网站', color: '#FFB4C6' },
  { key: 'app', label: '应用', color: '#FFD84D' },
  { key: 'learning', label: '学习', color: '#C9B8FF' },
  { key: 'note', label: '笔记', color: '#C9B8FF' },
  { key: 'repository', label: '代码仓库', color: '#C9B8FF' },
  { key: 'service', label: '服务', color: '#A9E5C3' },
  { key: 'generic', label: '其他', color: '#EDE8DC' },
];

const ALL_SIZES: {
  key: ResourceSize;
  label: string;
  desc: string;
  colDesc: string;
  heightDesc: string;
  truncateBehavior: string;
}[] = [
  {
    key: 'small',
    label: '紧凑卡片',
    desc: '2列紧凑',
    colDesc: '2列 (宽 ~33%)',
    heightDesc: '高度 192px',
    truncateBehavior: '隐藏正文摘要，极简紧凑展示',
  },
  {
    key: 'medium',
    label: '标准卡片',
    desc: '4列标准',
    colDesc: '4列 (宽 ~66%)',
    heightDesc: '高度 192px',
    truncateBehavior: '单行截断简介 (line-clamp-1)',
  },
  {
    key: 'large',
    label: '双高卡片',
    desc: '4列双高',
    colDesc: '4列双高',
    heightDesc: '高度 396px',
    truncateBehavior: '双行简介 (line-clamp-2) 与全量标签 Chips',
  },
  {
    key: 'banner',
    label: '通栏卡片',
    desc: '6列通栏',
    colDesc: '6列 (宽 100%)',
    heightDesc: '高度 192px',
    truncateBehavior: '全宽横幅横向展开展示',
  },
];

export const AddResourceModal: React.FC<AddResourceModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialObject,
}) => {
  const isEditing = Boolean(initialObject);

  const [title, setTitle] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [type, setType] = useState<ObjectType>('project');
  const [size, setSize] = useState<ResourceSize>('small');
  const [tagsInput, setTagsInput] = useState('');
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    if (initialObject) {
      setTitle(initialObject.title || '');
      setTargetUrl(initialObject.targetUrl || '');
      setSummary(initialObject.summary || '');
      setType(initialObject.type || 'project');
      setSize(toResourceSize(initialObject.cardSize));
      setTagsInput((initialObject.tags || []).join(', '));
      setPinned(Boolean(initialObject.pinned));
    } else {
      setTitle('');
      setTargetUrl('');
      setSummary('');
      setType('project');
      setSize('small');
      setTagsInput('');
      setPinned(false);
    }
  }, [initialObject, isOpen]);

  // Support pressing Escape to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const detected = detectProtocol(targetUrl);

  // Real-time preview object constructed from current form values
  const previewObject = useMemo<WorkbenchObject>(() => {
    const parsedTags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const dbCardSize = toDatabaseCardSize(size);
    let w = 2;
    let h = 2;
    if (dbCardSize === 'banner') {
      w = 6;
      h = 2;
    } else if (dbCardSize === 'wide') {
      w = 4;
      h = 2;
    } else if (dbCardSize === 'large') {
      w = 4;
      h = 4;
    }

    return {
      id: initialObject?.id || 'preview-card-temp-id',
      title: title.trim() || (isEditing ? '未命名资产' : '新工作台入口资产'),
      targetUrl: targetUrl.trim() || 'http://localhost:3000',
      summary:
        summary.trim() ||
        '基于 Neo-Brutalism v4 规范构建，输入简介将根据所选卡片尺寸自动截断或完整呈现...',
      type,
      cardSize: dbCardSize,
      pinned,
      status: initialObject?.status ?? 'ok',
      tags: parsedTags.length > 0 ? parsedTags : ['主力', 'Next.js', 'Neo-Brutalism'],
      createdAt: initialObject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      x: initialObject?.x ?? 0,
      y: initialObject?.y ?? 0,
      w,
      h,
    };
  }, [initialObject, isEditing, title, targetUrl, summary, type, size, pinned, tagsInput]);

  if (!isOpen) return null;

  const currentSizeMeta = ALL_SIZES.find((s) => s.key === size) || ALL_SIZES[0];
  const currentTypeMeta = ALL_TYPES.find((t) => t.key === type) || ALL_TYPES[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !targetUrl.trim()) return;

    const dbCardSize = toDatabaseCardSize(size);
    let w = 2;
    let h = 2;
    if (dbCardSize === 'banner') {
      w = 6;
      h = 2;
    } else if (dbCardSize === 'wide') {
      w = 4;
      h = 2;
    } else if (dbCardSize === 'large') {
      w = 4;
      h = 4;
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    const savedObj: WorkbenchObject = {
      id:
        initialObject?.id ||
        `00000000-0000-4000-8000-${Date.now().toString().slice(-12).padStart(12, '0')}`,
      title: title.trim(),
      targetUrl: targetUrl.trim(),
      summary: summary.trim(),
      type,
      cardSize: dbCardSize,
      pinned,
      status: initialObject?.status ?? 'ok',
      tags,
      createdAt: initialObject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      x: initialObject?.x ?? 0,
      y: initialObject?.y ?? 999,
      w: initialObject?.w ?? w,
      h: initialObject?.h ?? h,
    };

    onSave(savedObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-[2px]">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        data-testid="add-object-form"
        className="relative z-10 w-full max-w-5xl bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[10px_10px_0_#171717] max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#171717] px-6 py-4 bg-[#FBF7EF] shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFD84D] border border-[#171717] flex items-center justify-center shadow-[2px_2px_0_#171717]">
              {isEditing ? (
                <Edit3 className="w-4 h-4 text-[#171717]" />
              ) : (
                <Plus className="w-4 h-4 text-[#171717]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#171717]">
                  {isEditing ? '编辑入口资产' : '登记新入口资产'}
                </h2>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FFFFFF] border border-[#171717] rounded shadow-[1px_1px_0_#171717]">
                  <Eye className="w-3 h-3 text-[#10B981]" />
                  右侧实时卡片预览联动
                </span>
              </div>
              <p className="text-[11px] font-mono text-[#5F5E5A]">
                {isEditing ? '修改元信息或更新访问入口' : '配置数字入口与网格卡片尺寸'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-[#EDE8DC] rounded-lg border border-[#171717] transition-colors cursor-pointer"
            title="关闭 (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body: Left Form (7 cols) + Right Live Preview (5 cols) */}
        <div className="overflow-y-auto p-4 sm:p-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Form Column */}
            <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#171717] mb-1">
                  资产标题 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="例如：个人工作台、Docker 容器控制台..."
                  className="w-full px-3 py-2 text-sm bg-[#FFFFFF] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] focus:outline-none focus:ring-2 focus:ring-[#FFD84D]"
                />
              </div>

              {/* Primary Target URL / Path with auto protocol preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-mono font-bold text-[#171717]">
                    入口地址 (URL / 本地路径 / GitHub) <span className="text-red-500">*</span>
                  </label>
                  {targetUrl && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-[#EDE8DC] border border-[#171717] rounded text-[10px] font-mono font-semibold">
                      {detected === 'github' && <Github className="w-2.5 h-2.5" />}
                      {detected === 'url' && <Globe className="w-2.5 h-2.5" />}
                      {detected === 'localPath' && <Folder className="w-2.5 h-2.5" />}
                      {detected === 'github'
                        ? 'GitHub 仓库'
                        : detected === 'url'
                        ? '网页链接'
                        : detected === 'localPath'
                        ? '本地路径'
                        : '其他协议'}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="例如：http://localhost:3000 或 ~/workspace/project 或 https://github.com/..."
                  className="w-full px-3 py-2 text-sm font-mono bg-[#FFFFFF] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] focus:outline-none focus:ring-2 focus:ring-[#FFD84D]"
                />
              </div>

              {/* 9 Resource Types */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-bold text-[#171717]">
                    资源分类 (9 类)
                  </label>
                  <span className="text-[11px] font-mono text-[#5F5E5A]">
                    已选: <span className="font-bold text-[#171717]">{currentTypeMeta.label}</span>
                  </span>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                  {ALL_TYPES.map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setType(t.key)}
                      className={`px-2 py-1.5 text-xs font-mono font-bold rounded-lg border border-[#171717] transition-all text-center cursor-pointer ${
                        type === t.key
                          ? 'shadow-[2px_2px_0_#171717] -translate-y-0.5 ring-2 ring-[#171717]'
                          : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: t.color }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4 Card Sizes (Interactive selection with live sync) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono font-bold text-[#171717]">
                    卡片尺寸 (Size)
                  </label>
                  <span className="text-[11px] font-mono font-bold text-[#171717] bg-[#FFD84D] px-1.5 py-0.5 border border-[#171717] rounded shadow-[1px_1px_0_#171717]">
                    {currentSizeMeta.label} · {currentSizeMeta.desc}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {ALL_SIZES.map((s) => (
                    <button
                      key={s.key}
                      type="button"
                      onClick={() => setSize(s.key)}
                      className={`p-2.5 rounded-lg border-2 border-[#171717] text-left transition-all cursor-pointer ${
                        size === s.key
                          ? 'bg-[#FFD84D] shadow-[3px_3px_0_#171717] -translate-y-0.5 font-bold ring-1 ring-[#171717]'
                          : 'bg-[#FFFFFF] hover:bg-[#EDE8DC] shadow-[1px_1px_0_#171717]'
                      }`}
                    >
                      <div className="text-xs font-bold text-[#171717]">{s.label}</div>
                      <div className="text-[10px] text-[#5F5E5A] font-mono mt-0.5">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#171717] mb-1">
                  简介描述
                </label>
                <textarea
                  rows={2}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="简要概括此入口的作用与调度方式..."
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] focus:outline-none focus:ring-2 focus:ring-[#FFD84D]"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-xs font-mono font-bold text-[#171717] mb-1">
                  标签（英文逗号分割）
                </label>
                <input
                  type="text"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  placeholder="主力, Next.js, 工具, 文档..."
                  className="w-full px-3 py-2 text-xs font-mono bg-[#FFFFFF] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] focus:outline-none focus:ring-2 focus:ring-[#FFD84D]"
                />
              </div>

              {/* Pinned Quick Picks Toggle */}
              <div className="flex items-center justify-between p-3 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717]">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-[#FFD84D] border border-[#171717] flex items-center justify-center shadow-[1px_1px_0_#171717]">
                    <Pin className="w-3 h-3 text-[#171717] fill-current" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#171717]">置顶高频快捷入口</div>
                    <div className="text-[10px] text-[#5F5E5A] font-mono">
                      在主页顶部快捷 Picks 区展示直达
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setPinned(!pinned)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-lg border-2 border-[#171717] transition-all cursor-pointer ${
                    pinned
                      ? 'bg-[#FFD84D] shadow-[2px_2px_0_#171717]'
                      : 'bg-[#FFFFFF] text-[#5F5E5A] shadow-[1px_1px_0_#171717]'
                  }`}
                >
                  {pinned ? '已置顶' : '未置顶'}
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#171717]">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-bold font-mono text-[#171717] bg-[#EDE8DC] hover:bg-[#E5DFD1] border border-[#171717] rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold font-mono text-[#171717] bg-[#FFD84D] hover:bg-[#FACC15] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  {isEditing ? '保存修改' : '确认登记'}
                </button>
              </div>
            </form>

            {/* Right Live Preview Column */}
            <div className="lg:col-span-5 flex flex-col gap-3 lg:sticky lg:top-0">
              {/* Preview Window Header */}
              <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
                <div className="flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[#171717]" />
                  <span className="text-xs font-bold font-mono text-[#171717]">
                    卡片样式实时预览
                  </span>
                </div>
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-[#FFD84D] border border-[#171717] rounded shadow-[1px_1px_0_#171717] flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  {currentSizeMeta.label}
                </span>
              </div>

              {/* Simulated Desktop Workbench Stage */}
              <div className="bg-[#FBF7EF] border-2 border-[#171717] rounded-xl p-4 shadow-[4px_4px_0_#171717] flex flex-col justify-between min-h-[280px]">
                {/* Stage Watermark / Spec Bar */}
                <div className="flex items-center justify-between text-[10px] font-mono text-[#5F5E5A] border-b border-[#EDE8DC] pb-2 mb-3">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#E57373] border border-[#171717]" />
                    <span className="w-2 h-2 rounded-full bg-[#FFD84D] border border-[#171717]" />
                    <span className="w-2 h-2 rounded-full bg-[#81C784] border border-[#171717]" />
                    <span className="ml-1 font-bold text-[#171717]">视窗模拟 (6 列网格)</span>
                  </div>
                  <span>{currentSizeMeta.heightDesc}</span>
                </div>

                {/* Card Container - Width and height adjust according to selected Size */}
                <div className="w-full flex items-center justify-center py-2">
                  <div
                    className={`w-full transition-all duration-200 ${
                      size === 'small'
                        ? 'max-w-[280px] h-[192px]'
                        : size === 'medium'
                        ? 'w-full h-[192px]'
                        : size === 'large'
                        ? 'w-full h-[360px]'
                        : 'w-full h-[192px]'
                    }`}
                  >
                    <ResourceCard
                      resource={previewObject}
                      isOwner={true}
                      editMode={false}
                      disabled={true}
                      onChangeSize={(_, nextSize) => setSize(nextSize)}
                    />
                  </div>
                </div>

                {/* Live Responsive Hint */}
                <div className="mt-3 pt-2.5 border-t border-[#EDE8DC] text-[10px] font-mono text-[#5F5E5A] flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Info className="w-3 h-3 text-[#171717] shrink-0" />
                    <span>排版行为:</span>
                    <strong className="text-[#171717]">{currentSizeMeta.truncateBehavior}</strong>
                  </span>
                </div>
              </div>

              {/* Dynamic Field Specs Checklist */}
              <div className="bg-[#FFFFFF] border-2 border-[#171717] rounded-xl p-3.5 shadow-[2px_2px_0_#171717] text-xs font-mono space-y-2">
                <div className="font-bold text-[#171717] flex items-center gap-1.5 pb-1 border-b border-[#EDE8DC]">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD84D]" />
                  <span>实时渲染属性监控</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div className="p-1.5 bg-[#FBF7EF] border border-[#171717] rounded">
                    <span className="text-[#5F5E5A]">分类色标: </span>
                    <span
                      className="font-bold px-1 rounded text-[#171717]"
                      style={{ backgroundColor: currentTypeMeta.color }}
                    >
                      {currentTypeMeta.label}
                    </span>
                  </div>
                  <div className="p-1.5 bg-[#FBF7EF] border border-[#171717] rounded">
                    <span className="text-[#5F5E5A]">协议类型: </span>
                    <span className="font-bold text-[#171717]">
                      {detected === 'url' ? '网页链接' : detected === 'github' ? 'GitHub 仓库' : detected === 'localPath' ? '本地路径' : '通用协议'}
                    </span>
                  </div>
                  <div className="p-1.5 bg-[#FBF7EF] border border-[#171717] rounded">
                    <span className="text-[#5F5E5A]">网格跨度: </span>
                    <span className="font-bold text-[#171717]">{currentSizeMeta.colDesc}</span>
                  </div>
                  <div className="p-1.5 bg-[#FBF7EF] border border-[#171717] rounded">
                    <span className="text-[#5F5E5A]">置顶状态: </span>
                    <span
                      className={`font-bold px-1 rounded ${
                        pinned ? 'bg-[#FFD84D] text-[#171717]' : 'text-[#888780]'
                      }`}
                    >
                      {pinned ? '★ 置顶' : '标准'}
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-[#888780] leading-tight pt-1">
                  提示：切换左侧卡片尺寸、分类徽章、标题及简介，右侧视窗将即时呈现真实的渲染与排版效果。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
