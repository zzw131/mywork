import React, { useState, useEffect } from 'react';
import { WorkbenchObject, ObjectType } from '../../types';
import { ResourceSize } from '../../types/resource';
import { detectProtocol, toResourceSize, toDatabaseCardSize } from '../../adapters/resourceAdapter';
import { X, Plus, Edit3, Globe, Folder, Github, Sparkles, CornerDownRight } from 'lucide-react';

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

const ALL_SIZES: { key: ResourceSize; label: string; desc: string }[] = [
  { key: 'small', label: 'Small', desc: '2列紧凑' },
  { key: 'medium', label: 'Medium', desc: '4列标准' },
  { key: 'large', label: 'Large', desc: '4列双高' },
  { key: 'banner', label: 'Banner', desc: '6列通栏' },
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

  useEffect(() => {
    if (initialObject) {
      setTitle(initialObject.title || '');
      setTargetUrl(initialObject.targetUrl || '');
      setSummary(initialObject.summary || '');
      setType(initialObject.type || 'project');
      setSize(toResourceSize(initialObject.cardSize));
      setTagsInput((initialObject.tags || []).join(', '));
    } else {
      setTitle('');
      setTargetUrl('');
      setSummary('');
      setType('project');
      setSize('small');
      setTagsInput('');
    }
  }, [initialObject, isOpen]);

  if (!isOpen) return null;

  const detected = detectProtocol(targetUrl);

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
      id: initialObject?.id || `00000000-0000-4000-8000-${Date.now().toString().slice(-12).padStart(12, '0')}`,
      title: title.trim(),
      targetUrl: targetUrl.trim(),
      summary: summary.trim(),
      type,
      cardSize: dbCardSize,
      pinned: initialObject?.pinned ?? false,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="fixed inset-0" onClick={onClose} />

      <div
        data-testid="add-object-form"
        className="relative z-10 w-full max-w-lg bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl p-6 shadow-[8px_8px_0_#171717] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FFD84D] border border-[#171717] flex items-center justify-center shadow-[2px_2px_0_#171717]">
              {isEditing ? (
                <Edit3 className="w-4 h-4 text-[#171717]" />
              ) : (
                <Plus className="w-4 h-4 text-[#171717]" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171717]">
                {isEditing ? '编辑入口资产' : '登记新入口资产'}
              </h2>
              <p className="text-[11px] font-mono text-[#5F5E5A]">
                {isEditing ? '修改元信息或更新访问入口' : '配置数字入口与网格卡片尺寸'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#EDE8DC] rounded border border-[#171717] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                    ? 'GitHub'
                    : detected === 'url'
                    ? 'Web URL'
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
            <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5">
              资源分类 (9 类)
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {ALL_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setType(t.key)}
                  className={`px-2 py-1.5 text-xs font-mono font-bold rounded-lg border border-[#171717] transition-all text-center ${
                    type === t.key
                      ? 'shadow-[2px_2px_0_#171717] -translate-y-0.5'
                      : 'opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: t.color }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4 Card Sizes */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5">
              卡片尺寸 (Size)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {ALL_SIZES.map((s) => (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => setSize(s.key)}
                  className={`p-2 rounded-lg border-2 border-[#171717] text-left transition-all ${
                    size === s.key
                      ? 'bg-[#FFD84D] shadow-[2px_2px_0_#171717] -translate-y-0.5 font-bold'
                      : 'bg-[#FFFFFF] hover:bg-[#EDE8DC] shadow-[1px_1px_0_#171717]'
                  }`}
                >
                  <div className="text-xs font-bold text-[#171717]">{s.label}</div>
                  <div className="text-[10px] text-[#5F5E5A] font-mono">{s.desc}</div>
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

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t-2 border-[#171717]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold font-mono text-[#171717] bg-[#EDE8DC] hover:bg-[#E5DFD1] border border-[#171717] rounded-lg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold font-mono text-[#171717] bg-[#FFD84D] hover:bg-[#FACC15] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all"
            >
              {isEditing ? '保存修改' : '确认登记'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
