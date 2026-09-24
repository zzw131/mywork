import React, { useState, useEffect } from 'react';
import {
  GoalItem,
  GoalCategory,
  GoalPriority,
  GOAL_CATEGORY_CONFIG,
  GOAL_PRIORITY_CONFIG,
} from './types';
import { WorkbenchObject } from '../../types';
import { X, Save, Plus, Target, Link as LinkIcon, Calendar, Layers, Flag, Tag, Trash2 } from 'lucide-react';
import { getCustomTags } from '../../utils/tagManager';

interface GoalFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<GoalItem, 'id' | 'createdAt' | 'updatedAt'>,
    editingId?: string
  ) => void;
  editingGoal?: GoalItem | null;
  workbenchResources: WorkbenchObject[];
  onDeleteGoal?: (goal: GoalItem) => void;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingGoal,
  workbenchResources,
  onDeleteGoal,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [link, setLink] = useState('');
  const [linkLabel, setLinkLabel] = useState('');
  const [category, setCategory] = useState<GoalCategory>('project');
  const [priority, setPriority] = useState<GoalPriority>('p1');
  const [status, setStatus] = useState<'in_progress' | 'completed'>('in_progress');
  const [startDate, setStartDate] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [linkedResourceId, setLinkedResourceId] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagsInput, setTagsInput] = useState('');

  // Native Web Audio vintage mechanical switch click sound
  const playSwitchSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(45, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // AudioContext unavailable or blocked
    }
  };

  useEffect(() => {
    if (editingGoal) {
      setTitle(editingGoal.title);
      setSummary(editingGoal.summary);
      setLink(editingGoal.link || '');
      setLinkLabel(editingGoal.linkLabel || '');
      setCategory(editingGoal.category);
      setPriority(editingGoal.priority);
      setStatus(editingGoal.status || 'in_progress');
      setStartDate(editingGoal.startDate || '');
      setTargetDate(editingGoal.targetDate || '');
      setLinkedResourceId(editingGoal.linkedResourceId || '');
      const initialTags = editingGoal.tags || [GOAL_CATEGORY_CONFIG[editingGoal.category]?.label || '工程项目'];
      setTags(initialTags);
      setTagsInput(initialTags.join(', '));
    } else {
      setTitle('');
      setSummary('');
      setLink('');
      setLinkLabel('');
      setCategory('project');
      setPriority('p1');
      setStatus('in_progress');
      setStartDate(new Date().toISOString().split('T')[0]);
      setTargetDate('');
      setLinkedResourceId('');
      const defaultTag = GOAL_CATEGORY_CONFIG['project']?.label || '工程项目';
      setTags([defaultTag]);
      setTagsInput(defaultTag);
    }
  }, [editingGoal, isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const matchedResource = workbenchResources.find((r) => r.id === linkedResourceId);

    const goalData: Omit<GoalItem, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      summary: summary.trim(),
      link: link.trim() || undefined,
      linkLabel: linkLabel.trim() || undefined,
      category,
      priority,
      status,
      tags: tags.length > 0 ? tags : [GOAL_CATEGORY_CONFIG[category]?.label || '工程项目'],
      startDate: startDate.trim() || undefined,
      targetDate: targetDate.trim() || undefined,
      linkedResourceId: linkedResourceId || undefined,
      linkedResourceTitle: matchedResource?.title || undefined,
      completedAt:
        status === 'completed'
          ? editingGoal?.completedAt || new Date().toISOString()
          : undefined,
      completionRecord:
        status === 'completed' ? editingGoal?.completionRecord : undefined,
    };

    onSave(goalData, editingGoal?.id);
    onClose();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/60 backdrop-blur-[2px] animate-in fade-in duration-150 cursor-pointer"
    >
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[8px_8px_0_#171717] overflow-hidden flex flex-col max-h-[90vh] cursor-default">
        {/* Header */}
        <div className="px-6 py-4 bg-[#FFD84D] border-b-2 border-[#171717] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border-2 border-[#171717] flex items-center justify-center shadow-[2px_2px_0_#171717]">
              <Target className="w-4 h-4 text-[#171717]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171717] font-mono leading-tight">
                {editingGoal ? '编辑目标档案 · Edit Goal' : '新建未完成目标 · New Incomplete Goal'}
              </h2>
              <p className="text-[11px] font-mono text-[#171717]/80">
                设定具体指向、动机简介与执行链接
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 hover:bg-[#FFFFFF] border border-[#171717] rounded-md transition-colors cursor-pointer"
            title="关闭 (ESC)"
          >
            <X className="w-4 h-4 text-[#171717]" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-[#171717]" />
              <span>目标标题 · Title (必填)</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例如：攻克 Rust 异步运行时、上线个人工作台第二期..."
              className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
            />
          </div>

          {/* Category & Priority Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Category (connected to Workbench categories) */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#171717]" />
                <span>联动分类 · Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as GoalCategory)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
              >
                {(Object.keys(GOAL_CATEGORY_CONFIG) as GoalCategory[]).map((cat) => (
                  <option key={cat} value={cat}>
                    {GOAL_CATEGORY_CONFIG[cat].label} ({cat})
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5 flex items-center gap-1.5">
                <Flag className="w-3.5 h-3.5 text-[#171717]" />
                <span>优先级 · Priority</span>
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as GoalPriority)}
                className="w-full px-3 py-2 text-xs font-mono font-bold bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
              >
                {(Object.keys(GOAL_PRIORITY_CONFIG) as GoalPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {GOAL_PRIORITY_CONFIG[p].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary / Description */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5">
              目标简介与动机 · Summary
            </label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="简要描述为什么要推进该目标、预期成果与衡量标准..."
              className="w-full px-3 py-2 text-xs font-sans text-[#171717] bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
            />
          </div>

          {/* Target Link & Link Label */}
          <div className="p-3 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl space-y-2.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#171717]">
              <LinkIcon className="w-3.5 h-3.5 text-[#171717]" />
              <span>具体链接配置 · Target Link</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="具体链接 (如 https://github.com/...)"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FFFFFF] border border-[#171717] rounded-lg"
              />
              <input
                type="text"
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="按钮描述 (如: 查看代码库 / 访问教程)"
                className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#FFFFFF] border border-[#171717] rounded-lg"
              />
            </div>
          </div>

          {/* Link to existing Workbench Resource */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#171717]" />
                <span>关联工作台已有资产 (可选联动)</span>
              </span>
              <span className="text-[10px] text-[#888780]">可在目标卡片一键直达</span>
            </label>
            <select
              value={linkedResourceId}
              onChange={(e) => setLinkedResourceId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
            >
              <option value="">-- 无特定资产绑定 --</option>
              {workbenchResources.map((res) => (
                <option key={res.id} value={res.id}>
                  [{res.type}] {res.title}
                </option>
              ))}
            </select>
          </div>

          {/* Date Range: Start Date & Target Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#171717]" />
                <span>起始日期 · Start Date</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#171717]" />
                <span>预计完成时间 · Target Date (可选)</span>
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
              />
            </div>
          </div>

          {/* Goal Tags (增/改/查 tags for this goal) */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#171717]" />
                <span>目标标签 · Tags</span>
              </span>
              <span className="text-[10px] text-[#888780]">逗号分隔多个标签</span>
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => {
                setTagsInput(e.target.value);
                const parsed = e.target.value
                  .split(/[,，]/)
                  .map((t) => t.trim().replace(/^#+/, ''))
                  .filter(Boolean);
                setTags(Array.from(new Set(parsed)));
              }}
              placeholder="例如: PGlite, 架构, WebAssembly"
              className="w-full px-3 py-2 text-xs font-mono bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
            />
            {/* Quick-pick tag recommendations */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[10px] font-mono text-[#888780] mr-1">快捷备选:</span>
              {Array.from(
                new Set([
                  GOAL_CATEGORY_CONFIG[category]?.label || '工程项目',
                  '全栈',
                  'PGlite',
                  'Rust',
                  'Tokio',
                  'Neo-Brutalism',
                  'CLI',
                  'Next.js',
                  ...getCustomTags(),
                ])
              )
                .slice(0, 8)
                .map((t) => {
                  const isSelected = tags.includes(t);
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => {
                        let next: string[];
                        if (isSelected) {
                          next = tags.filter((x) => x !== t);
                        } else {
                          next = [...tags, t];
                        }
                        setTags(next);
                        setTagsInput(next.join(', '));
                      }}
                      className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[11px] font-mono border border-[#171717] transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFD84D] text-[#171717] font-bold shadow-[1px_1px_0_#171717]'
                          : 'bg-[#FFFFFF] text-[#5F5E5A] hover:bg-[#FBF7EF]'
                      }`}
                    >
                      <span>#{t}</span>
                      {isSelected && <X className="w-2.5 h-2.5 ml-0.5" />}
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Footer Actions */}
          {editingGoal ? (
            <div className="pt-4 border-t-2 border-[#171717] flex items-center justify-between gap-3 shrink-0">
              {/* Vintage Industrial Light Switch Plate: Fixed Width & Rock-Solid Geometry */}
              <div className="relative p-2 sm:p-2.5 bg-[#EDE8DC] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] flex items-center justify-between gap-2.5 shrink-0 select-none">
                {/* Vintage Left Screw */}
                <span className="w-2.5 h-2.5 rounded-full border border-[#171717] bg-[#D4CEBF] flex items-center justify-center text-[7px] font-mono leading-none text-[#5F5E5A] shrink-0">
                  ⊖
                </span>

                {/* Status Label with fixed width so text never resizes the container */}
                <div className="flex flex-col w-[112px] shrink-0">
                  <span className="text-[10px] font-mono font-bold text-[#888780] tracking-wider uppercase flex items-center gap-1 whitespace-nowrap">
                    <span>⚡ 状态开关</span>
                  </span>
                  <span className="text-[11px] font-mono font-bold text-[#171717] whitespace-nowrap">
                    {status === 'completed' ? '💡 已达成 (ON)' : '⏻ 未完成 (OFF)'}
                  </span>
                </div>

                {/* The Mechanical Rocker Toggle Group */}
                <div
                  role="group"
                  aria-label="老式灯开关切换已完成与未完成"
                  className="flex items-center bg-[#171717] p-1 rounded-lg border-2 border-[#171717] shadow-inner gap-1 shrink-0"
                >
                  {/* Left: 未完成 (In Progress / OFF) - Fixed width & permanent border-2 to prevent reflow */}
                  <button
                    type="button"
                    onClick={() => {
                      playSwitchSound();
                      setStatus('in_progress');
                    }}
                    className={`w-[78px] h-[32px] rounded-md text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer select-none whitespace-nowrap shrink-0 border-2 border-[#171717] ${
                      status === 'in_progress'
                        ? 'bg-[#FFD84D] text-[#171717] shadow-[2px_2px_0_#FFFFFF]'
                        : 'bg-[#262626] text-[#A8A29E] hover:text-[#FFFFFF] hover:bg-[#333333]'
                    }`}
                    title="拨向左侧：切换为未完成状态"
                  >
                    <span
                      className={`w-2 h-2 rounded-full border border-[#171717] shrink-0 transition-all ${
                        status === 'in_progress'
                          ? 'bg-[#F59E0B] shadow-[0_0_8px_#F59E0B]'
                          : 'bg-[#525252]'
                      }`}
                    />
                    <span>未完成</span>
                  </button>

                  {/* Center Vintage Pivot Indicator */}
                  <div className="w-2.5 h-6 bg-[#D4CEBF] border border-[#171717] rounded-sm flex items-center justify-center shadow-[1px_1px_0_#171717] shrink-0">
                    <div
                      className={`w-1.5 h-3 bg-[#171717] rounded-xs transition-transform duration-150 ${
                        status === 'in_progress' ? '-rotate-25' : 'rotate-25'
                      }`}
                    />
                  </div>

                  {/* Right: 已完成 (Completed / ON) - Fixed width & permanent border-2 to prevent reflow */}
                  <button
                    type="button"
                    onClick={() => {
                      playSwitchSound();
                      setStatus('completed');
                    }}
                    className={`w-[78px] h-[32px] rounded-md text-xs font-mono font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer select-none whitespace-nowrap shrink-0 border-2 border-[#171717] ${
                      status === 'completed'
                        ? 'bg-[#A9E5C3] text-[#171717] shadow-[2px_2px_0_#FFFFFF]'
                        : 'bg-[#262626] text-[#A8A29E] hover:text-[#FFFFFF] hover:bg-[#333333]'
                    }`}
                    title="拨向右侧：切换为已完成状态"
                  >
                    <span>已完成</span>
                    <span
                      className={`w-2 h-2 rounded-full border border-[#171717] shrink-0 transition-all ${
                        status === 'completed'
                          ? 'bg-[#10B981] shadow-[0_0_8px_#10B981]'
                          : 'bg-[#525252]'
                      }`}
                    />
                  </button>
                </div>

                {/* Vintage Right Screw */}
                <span className="w-2.5 h-2.5 rounded-full border border-[#171717] bg-[#D4CEBF] flex items-center justify-center text-[7px] font-mono leading-none text-[#5F5E5A] shrink-0">
                  ⊖
                </span>
              </div>

              {/* Right Action Buttons: Delete & Save (Fixed position, never moves) */}
              <div className="flex items-center gap-2.5 justify-end shrink-0">
                {onDeleteGoal && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteGoal(editingGoal);
                    }}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-mono font-bold bg-[#FFB4C6] hover:bg-[#ff8ea8] text-[#171717] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
                    title="彻底删除此目标"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>删除目标</span>
                  </button>
                )}
                <button
                  type="submit"
                  className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-mono font-bold border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    status === 'in_progress'
                      ? 'bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717]'
                      : 'bg-[#A9E5C3] hover:bg-[#86efac] text-[#171717]'
                  }`}
                  title={status === 'in_progress' ? '保存变更（重置为未完成）' : '保存变更并维持已达成'}
                >
                  <Save className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span className="whitespace-nowrap">保存</span>
                </button>
              </div>
            </div>
          ) : (
            /* New Goal: Clean Cancel & Create Buttons */
            <div className="pt-4 border-t-2 border-[#EDE8DC] flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono font-bold bg-[#EDE8DC] hover:bg-[#E5DFD1] text-[#171717] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] cursor-pointer"
              >
                取消
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs font-mono font-bold bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Save className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="whitespace-nowrap">创建未完成目标</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
