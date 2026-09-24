import React, { useState, useEffect } from 'react';
import { GoalItem, GoalCompletionRecord } from './types';
import { Check, X, Calendar, FileText, Link as LinkIcon, Award, Target } from 'lucide-react';

interface GoalCompletionModalProps {
  goal: GoalItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (record: GoalCompletionRecord) => void;
  onRevertToIncomplete?: (goalId: string) => void;
}

export const GoalCompletionModal: React.FC<GoalCompletionModalProps> = ({
  goal,
  isOpen,
  onClose,
  onConfirm,
  onRevertToIncomplete,
}) => {
  if (!isOpen) return null;

  const todayStr = new Date().toISOString().split('T')[0];
  const [status, setStatus] = useState<'in_progress' | 'completed'>(goal.status);
  const [startDate, setStartDate] = useState(
    goal.startDate || goal.completionRecord?.startDate || goal.createdAt?.split('T')[0] || todayStr
  );
  const [completedDate, setCompletedDate] = useState(
    goal.completedAt ? goal.completedAt.split('T')[0] : todayStr
  );
  const [notes, setNotes] = useState(
    goal.completionRecord?.notes ||
      '达成关键里程碑，已完成预期验证与落地交付。'
  );
  const [proofUrl, setProofUrl] = useState(goal.completionRecord?.proofUrl || '');

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (status === 'in_progress') {
      onRevertToIncomplete?.(goal.id);
      onClose();
      return;
    }
    const record: GoalCompletionRecord = {
      startDate: startDate || undefined,
      completedAt: new Date(completedDate).toISOString(),
      notes: notes.trim() || '已手动标记为完成。',
      proofUrl: proofUrl.trim() || undefined,
      recordedBy: '邹大炮 (Owner)',
    };
    onConfirm(record);
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#171717]/60 backdrop-blur-[2px] animate-in fade-in duration-150 cursor-pointer"
    >
      <div className="relative w-full max-w-[560px] bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[8px_8px_0_#171717] overflow-hidden flex flex-col cursor-default">
        {/* Header - Target Icon (靶子形态) */}
        <div className="px-6 py-4 bg-[#A9E5C3] border-b-2 border-[#171717] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FFFFFF] border-2 border-[#171717] flex items-center justify-center shadow-[2px_2px_0_#171717]">
              <Target className="w-4 h-4 text-[#10B981] stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#171717] font-mono leading-tight">
                手动记录完成状态 · Milestone Log
              </h2>
              <p className="text-[11px] font-mono text-[#171717]/80">
                记录达成瞬间的经验心得与产出凭证
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Target Title Snapshot */}
          <div className="p-3 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl text-xs font-mono">
            <div className="text-[10px] text-[#888780] font-bold uppercase mb-1">
              目标内容 · TARGET
            </div>
            <div className="font-bold text-[#171717] leading-snug">{goal.title}</div>
          </div>

          {/* Date Range: Start Date & Completed Date Grid */}
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
                required
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#10B981]" />
                <span>达成日期 · Completed Date</span>
              </label>
              <input
                type="date"
                value={completedDate}
                onChange={(e) => setCompletedDate(e.target.value)}
                className="w-full px-3 py-2 text-xs font-mono bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
                required
              />
            </div>
          </div>

          {/* Notes / Retrospective */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#10B981]" />
              <span>完成手记与总结 · Completion Notes</span>
            </label>
            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="记录本次目标达成的关键举措、踩坑经验、心得体会..."
              className="w-full px-3 py-2 text-xs font-sans text-[#171717] bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
              required
            />
          </div>

          {/* Proof / Output URL */}
          <div>
            <label className="block text-xs font-mono font-bold text-[#171717] mb-1.5 flex items-center gap-1.5">
              <LinkIcon className="w-3.5 h-3.5 text-[#5F5E5A]" />
              <span>产出成果链接 · Output / PR / Doc (可选)</span>
            </label>
            <input
              type="url"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3 py-2 text-xs font-mono bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
            />
          </div>

          {/* Actions: For completed goals, vintage light switch toggle group */}
          {goal.status === 'completed' ? (
            <div className="pt-4 border-t-2 border-[#171717] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              {/* Vintage Industrial Light Switch Plate */}
              <div className="relative p-2 sm:p-2.5 bg-[#EDE8DC] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] flex items-center justify-between gap-2 shrink-0">
                {/* Left Screw */}
                <span className="w-2.5 h-2.5 rounded-full border border-[#171717] bg-[#D4CEBF] flex items-center justify-center text-[7px] font-mono leading-none select-none text-[#5F5E5A] shrink-0">
                  ⊖
                </span>

                <div className="flex flex-col shrink-0">
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
                  {/* Left: 未完成 (In Progress / OFF) */}
                  <button
                    type="button"
                    onClick={() => {
                      playSwitchSound();
                      setStatus('in_progress');
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap shrink-0 ${
                      status === 'in_progress'
                        ? 'bg-[#FFD84D] text-[#171717] border-2 border-[#171717] shadow-[2px_2px_0_#FFFFFF] -translate-x-0.5'
                        : 'bg-[#262626] text-[#A8A29E] hover:text-[#FFFFFF] hover:bg-[#333333]'
                    }`}
                    title="拨向左侧：重置为未完成状态"
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

                  {/* Right: 已完成 (Completed / ON) */}
                  <button
                    type="button"
                    onClick={() => {
                      playSwitchSound();
                      setStatus('completed');
                    }}
                    className={`px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer select-none whitespace-nowrap shrink-0 ${
                      status === 'completed'
                        ? 'bg-[#A9E5C3] text-[#171717] border-2 border-[#171717] shadow-[2px_2px_0_#FFFFFF] translate-x-0.5'
                        : 'bg-[#262626] text-[#A8A29E] hover:text-[#FFFFFF] hover:bg-[#333333]'
                    }`}
                    title="拨向右侧：保持已完成状态"
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

                {/* Right Screw */}
                <span className="w-2.5 h-2.5 rounded-full border border-[#171717] bg-[#D4CEBF] flex items-center justify-center text-[7px] font-mono leading-none select-none text-[#5F5E5A] shrink-0">
                  ⊖
                </span>
              </div>

              {/* Confirm / Save Button */}
              <div className="flex items-center justify-end shrink-0">
                <button
                  type="submit"
                  className={`inline-flex items-center justify-center gap-1.5 px-5 py-2.5 text-xs font-mono font-bold border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    status === 'in_progress'
                      ? 'bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717]'
                      : 'bg-[#A9E5C3] hover:bg-[#86efac] text-[#171717]'
                  }`}
                  title={status === 'in_progress' ? '保存变更（重置为未完成）' : '保存手记并维持达成'}
                >
                  <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                  <span className="whitespace-nowrap">保存</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-3 flex items-center justify-end">
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-1.5 px-6 py-2.5 text-xs font-mono font-bold bg-[#A9E5C3] hover:bg-[#86efac] text-[#171717] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap shrink-0"
              >
                <Check className="w-4 h-4 stroke-[2.5] shrink-0" />
                <span className="whitespace-nowrap">保存</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
