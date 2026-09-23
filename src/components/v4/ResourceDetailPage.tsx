import React, { useState, useEffect } from 'react';
import {
  WorkbenchObject,
  TYPE_VISUAL_MAP,
  UserIdentity,
  DetailBlock,
  DetailBlockType,
  SecondaryEntry,
} from '../../types';
import { executeEntry, detectProtocol } from '../../adapters/resourceAdapter';
import {
  getEffectiveDetailBlocks,
  getEffectiveSecondaryEntries,
} from '../../adapters/detailAdapter';
import { V4Badge } from './V4Badge';
import { V4StatusDot } from './V4StatusDot';
import { V4Button } from './V4Button';
import {
  ArrowLeft,
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
  Edit3,
  Trash2,
  Save,
  Plus,
  ArrowUp,
  ArrowDown,
  X,
  Code2,
  Quote as QuoteIcon,
  List,
  Type,
  Image as ImageIcon,
  Share2,
  AlertTriangle,
  Bookmark,
  ShieldCheck,
} from 'lucide-react';

export interface ResourceDetailPageProps {
  object: WorkbenchObject;
  identity: UserIdentity;
  onBackToHome: () => void;
  onSaveObject: (updated: WorkbenchObject) => void;
  onDeleteObject: (id: string) => void;
}

export const ResourceDetailPage: React.FC<ResourceDetailPageProps> = ({
  object,
  identity,
  onBackToHome,
  onSaveObject,
  onDeleteObject,
}) => {
  const isOwner = identity.role === 'owner';

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Form states for editing
  const [title, setTitle] = useState(object.title);
  const [summary, setSummary] = useState(object.summary);
  const [targetUrl, setTargetUrl] = useState(object.targetUrl);
  const [tagsInput, setTagsInput] = useState(object.tags.join(', '));
  const [status, setStatus] = useState(object.status);
  const [notes, setNotes] = useState(object.notes || '');
  const [blocks, setBlocks] = useState<DetailBlock[]>(() =>
    getEffectiveDetailBlocks(object)
  );
  const [secondaryEntries, setSecondaryEntries] = useState<SecondaryEntry[]>(() =>
    getEffectiveSecondaryEntries(object)
  );

  // Sync state if object changes
  useEffect(() => {
    setTitle(object.title);
    setSummary(object.summary);
    setTargetUrl(object.targetUrl);
    setTagsInput(object.tags.join(', '));
    setStatus(object.status);
    setNotes(object.notes || '');
    setBlocks(getEffectiveDetailBlocks(object));
    setSecondaryEntries(getEffectiveSecondaryEntries(object));
    setIsEditing(false);
    setConfirmDelete(false);
  }, [object]);

  const visual = TYPE_VISUAL_MAP[object.type] || TYPE_VISUAL_MAP.generic;
  const protocol = detectProtocol(targetUrl);

  const showFeedback = (msg: string) => {
    setCopiedFeedback(msg);
    setTimeout(() => setCopiedFeedback(null), 2000);
  };

  const handleOpenPrimary = async () => {
    const result = await executeEntry({
      id: `${object.id}-primary`,
      label: '主入口',
      target: targetUrl,
      protocol,
    });
    showFeedback(result.action === 'copied' ? '已复制本地路径' : '已在新标签页打开');
  };

  const handleCopyText = async (text: string, label: string = '已复制') => {
    try {
      await navigator.clipboard?.writeText(text);
      showFeedback(label);
    } catch {
      showFeedback('复制失败');
    }
  };

  // Block management
  const handleAddBlock = (type: DetailBlockType) => {
    const newBlock: DetailBlock = {
      id: `blk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type,
      content:
        type === 'heading'
          ? '## 新增小节标题'
          : type === 'code'
          ? '// 在此输入配置代码或脚本命令\nconsole.log("ready");'
          : type === 'quote'
          ? '在此输入经验体会或关键备忘引用。'
          : type === 'list'
          ? '• 步骤 1：准备工作\n• 步骤 2：启动服务\n• 步骤 3：验证输出'
          : '输入段落正文内容...',
      meta: type === 'code' ? { language: 'bash' } : type === 'heading' ? { level: 2 } : {},
    };
    setBlocks((prev) => [...prev, newBlock]);
  };

  const handleUpdateBlockContent = (id: string, newContent: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: newContent } : b))
    );
  };

  const handleUpdateBlockType = (id: string, newType: DetailBlockType) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, type: newType } : b))
    );
  };

  const handleRemoveBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleMoveBlock = (index: number, direction: 'up' | 'down') => {
    setBlocks((prev) => {
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const copy = [...prev];
      const [moved] = copy.splice(index, 1);
      copy.splice(targetIndex, 0, moved);
      return copy;
    });
  };

  // Secondary entry management in edit mode
  const handleAddSecondaryEntry = () => {
    const newEntry: SecondaryEntry = {
      id: `sec-${Date.now()}`,
      label: '新入口名称',
      target: 'https://',
      protocol: 'url',
    };
    setSecondaryEntries((prev) => [...prev, newEntry]);
  };

  const handleUpdateSecondaryEntry = (
    id: string,
    field: keyof SecondaryEntry,
    value: string
  ) => {
    setSecondaryEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const handleRemoveSecondaryEntry = (id: string) => {
    setSecondaryEntries((prev) => prev.filter((e) => e.id !== id));
  };

  // Save all changes
  const handleSave = () => {
    if (!isOwner) return;

    const parsedTags = tagsInput
      .split(/[,，]/)
      .map((t) => t.trim())
      .filter(Boolean);

    const updatedObject: WorkbenchObject = {
      ...object,
      title: title.trim() || '未命名资源',
      summary: summary.trim(),
      targetUrl: targetUrl.trim(),
      tags: parsedTags,
      status,
      notes: notes.trim(),
      updatedAt: new Date().toISOString(),
      detailBlocks: blocks,
      secondaryEntries,
    };

    onSaveObject(updatedObject);
    setIsEditing(false);
    showFeedback('档案已保存更新！');
  };

  // Cancel edits
  const handleCancelEdit = () => {
    setTitle(object.title);
    setSummary(object.summary);
    setTargetUrl(object.targetUrl);
    setTagsInput(object.tags.join(', '));
    setStatus(object.status);
    setNotes(object.notes || '');
    setBlocks(getEffectiveDetailBlocks(object));
    setSecondaryEntries(getEffectiveSecondaryEntries(object));
    setIsEditing(false);
  };

  // Delete resource
  const handleDelete = () => {
    if (!isOwner) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDeleteObject(object.id);
    onBackToHome();
  };

  return (
    <div className="min-h-screen bg-[#FBF7EF] text-[#171717] pb-16 flex flex-col">
      {/* Toast Notification */}
      {copiedFeedback && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-[#FFD84D] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] font-mono text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-top-3">
          <Check className="w-4 h-4 text-[#10B981]" />
          <span>{copiedFeedback}</span>
        </div>
      )}

      {/* Top Breadcrumb & Navigation Bar */}
      <div className="w-full bg-[#FFFFFF] border-b-2 border-[#171717]">
        <div className="w-full md:w-[90%] lg:w-[85%] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-[#EDE8DC] hover:bg-[#FFD84D] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>返回工作台</span>
            </button>

            <nav className="hidden sm:flex items-center gap-2 text-xs font-mono text-[#5F5E5A]">
              <span>首页</span>
              <span className="text-[#888780]">/</span>
              <span>数字资产档案</span>
              <span className="text-[#888780]">/</span>
              <span className="font-bold text-[#171717] truncate max-w-[200px]">
                {object.title}
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <button
              type="button"
              onClick={() => handleCopyText(window.location.href, '已复制档案链接')}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#FFFFFF] hover:bg-[#EDE8DC] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] cursor-pointer"
              title="复制当前档案直达 URL"
            >
              <Share2 className="w-3.5 h-3.5 text-[#5F5E5A]" />
              <span>分享档案</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="w-full md:w-[90%] lg:w-[85%] mx-auto px-4 sm:px-6 pt-6 flex-1">
        {/* ===================== HERO SECTION ===================== */}
        <header className="p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[6px_6px_0_#171717] mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Left: Title, Badges, Meta */}
            <div className="min-w-0 flex-1 space-y-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <V4Badge type={object.type} showFullLabel />

                {isEditing ? (
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="px-2 py-1 text-xs font-mono font-bold bg-[#FFFFFF] border-2 border-[#171717] rounded shadow-[1px_1px_0_#171717]"
                  >
                    <option value="ok">● 正常运行</option>
                    <option value="warn">● 待检查</option>
                    <option value="off">● 已离线</option>
                  </select>
                ) : (
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#FBF7EF] border border-[#171717] rounded-md text-xs font-mono font-bold shadow-[1px_1px_0_#171717]">
                    <V4StatusDot status={status} />
                    <span>
                      {status === 'ok'
                        ? '运行正常'
                        : status === 'warn'
                        ? '待检查'
                        : '已离线'}
                    </span>
                  </div>
                )}

                {object.pinned && (
                  <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#171717] bg-[#FFD84D] px-2 py-1 border border-[#171717] rounded shadow-[1px_1px_0_#171717]">
                    <Pin className="w-3 h-3 fill-current rotate-45" />
                    <span>置顶高频资产</span>
                  </span>
                )}

                <span className="text-xs font-mono text-[#5F5E5A] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>更新于 {new Date(object.updatedAt).toLocaleDateString()}</span>
                </span>
              </div>

              {/* Title display or edit */}
              {isEditing ? (
                <div>
                  <label className="block text-[10px] font-mono font-bold text-[#888780] uppercase mb-1">
                    资源名称 / TITLE
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xl sm:text-2xl font-bold font-sans text-[#171717] px-3 py-2 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
                  />
                </div>
              ) : (
                <h1 className="text-2xl sm:text-4xl font-extrabold text-[#171717] tracking-tight leading-tight">
                  {title}
                </h1>
              )}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              {/* Primary Entry Button */}
              <button
                type="button"
                onClick={handleOpenPrimary}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold font-mono text-[#171717] bg-[#FFD84D] hover:bg-[#FACC15] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>
                  {protocol === 'localPath'
                    ? '复制本地路径'
                    : protocol === 'github'
                    ? '访问 GitHub 仓库'
                    : '打开主入口'}
                </span>
                {protocol === 'localPath' ? (
                  <Copy className="w-4 h-4" />
                ) : (
                  <ExternalLink className="w-4 h-4" />
                )}
              </button>

              {/* Owner Edit Button */}
              {isOwner && (
                <>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleSave}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold font-mono text-[#FFFFFF] bg-[#10B981] hover:bg-[#059669] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>保存档案</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleCancelEdit}
                        className="inline-flex items-center gap-1.5 px-3 py-2.5 text-sm font-bold font-mono text-[#171717] bg-[#EDE8DC] hover:bg-[#E5DFD1] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                        <span>取消</span>
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-bold font-mono text-[#171717] bg-[#FFFFFF] hover:bg-[#FFD84D] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                    >
                      <Edit3 className="w-4 h-4" />
                      <span>编辑档案</span>
                    </button>
                  )}

                  {/* Owner Delete Button */}
                  <button
                    type="button"
                    onClick={handleDelete}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 text-sm font-bold font-mono border-2 border-[#171717] rounded-xl transition-all cursor-pointer ${
                      confirmDelete
                        ? 'bg-[#E57373] text-[#FFFFFF] shadow-[3px_3px_0_#171717] animate-pulse'
                        : 'bg-[#FFB4C6] text-[#171717] hover:bg-[#FF8FA8] shadow-[3px_3px_0_#171717]'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>{confirmDelete ? '确认删除？' : '删除'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </header>

        {/* ===================== SUMMARY SECTION ===================== */}
        <section className="p-4 sm:p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[4px_4px_0_#171717] mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase text-[#888780] tracking-wider flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#171717]" />
              <span>一句话简介 · Core Summary</span>
            </span>
          </div>

          {isEditing ? (
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              rows={2}
              className="w-full text-sm font-sans text-[#171717] p-3 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] focus:outline-none focus:bg-[#FFFFFF]"
              placeholder="输入一句话定位简介..."
            />
          ) : (
            <p className="text-sm sm:text-base text-[#171717] leading-relaxed font-medium">
              {summary || '暂无一句话简介。'}
            </p>
          )}
        </section>

        {/* ===================== TWO COLUMN CONTENT LAYOUT ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 8 COLUMNS: Content Blocks (The Document / Post Body) */}
          <div className="lg:col-span-8 space-y-6">
            <section className="p-6 sm:p-8 bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[6px_6px_0_#171717]">
              <div className="flex items-center justify-between border-b-2 border-[#171717] pb-3 mb-6">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-5 bg-[#FFD84D] border border-[#171717] rounded-xs" />
                  <h2 className="text-base sm:text-lg font-bold font-mono text-[#171717] tracking-tight">
                    档案正文 · Documentation Blocks
                  </h2>
                </div>
                <span className="text-xs font-mono text-[#5F5E5A]">
                  {blocks.length} 个内容块
                </span>
              </div>

              {/* Blocks list */}
              <div className="space-y-6">
                {blocks.map((block, index) => (
                  <div
                    key={block.id}
                    className={`relative group transition-all ${
                      isEditing
                        ? 'p-4 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717]'
                        : ''
                    }`}
                  >
                    {/* Block Toolbar in Edit Mode */}
                    {isEditing && (
                      <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-[#EDE8DC] text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 bg-[#EDE8DC] border border-[#171717] rounded font-bold text-[10px]">
                            #{index + 1}
                          </span>
                          <select
                            value={block.type}
                            onChange={(e) =>
                              handleUpdateBlockType(block.id, e.target.value as DetailBlockType)
                            }
                            className="px-2 py-0.5 bg-[#FFFFFF] border border-[#171717] rounded text-xs font-bold"
                          >
                            <option value="heading">小标题 (Heading)</option>
                            <option value="text">段落正文 (Text)</option>
                            <option value="code">代码命令块 (Code)</option>
                            <option value="quote">重要引用/备忘 (Quote)</option>
                            <option value="list">条目列表 (List)</option>
                            <option value="image">插图/架构图 (Image)</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(index, 'up')}
                            disabled={index === 0}
                            className="p-1 bg-[#FFFFFF] hover:bg-[#EDE8DC] border border-[#171717] rounded disabled:opacity-30 cursor-pointer"
                            title="上移"
                          >
                            <ArrowUp className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveBlock(index, 'down')}
                            disabled={index === blocks.length - 1}
                            className="p-1 bg-[#FFFFFF] hover:bg-[#EDE8DC] border border-[#171717] rounded disabled:opacity-30 cursor-pointer"
                            title="下移"
                          >
                            <ArrowDown className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveBlock(block.id)}
                            className="p-1 bg-[#FFB4C6] hover:bg-[#FF8FA8] border border-[#171717] rounded cursor-pointer"
                            title="删除此块"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Block Render or Editor */}
                    {isEditing ? (
                      <textarea
                        value={block.content}
                        onChange={(e) => handleUpdateBlockContent(block.id, e.target.value)}
                        rows={block.type === 'code' || block.type === 'list' ? 4 : 2}
                        className="w-full text-sm font-mono text-[#171717] p-2.5 bg-[#FFFFFF] border border-[#171717] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#171717]"
                      />
                    ) : (
                      // Render Read-Only View
                      <div>
                        {block.type === 'heading' && (
                          <div className="pt-2 pb-1 border-b border-[#EDE8DC]">
                            <h3 className="text-lg sm:text-xl font-extrabold text-[#171717] tracking-tight">
                              {block.content.replace(/^#+\s*/, '')}
                            </h3>
                          </div>
                        )}

                        {block.type === 'text' && (
                          <p className="text-sm sm:text-base text-[#33322E] leading-relaxed whitespace-pre-wrap">
                            {block.content}
                          </p>
                        )}

                        {block.type === 'code' && (
                          <div className="rounded-xl border-2 border-[#171717] bg-[#1E1E1E] text-[#F3EFE6] overflow-hidden shadow-[3px_3px_0_#171717]">
                            <div className="px-4 py-2 bg-[#2D2D2D] border-b border-[#3D3D3D] flex items-center justify-between text-xs font-mono">
                              <span className="text-[#A9E5C3] font-bold">
                                {block.meta?.language || 'bash'}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyText(block.content, '已复制代码块')}
                                className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#1E1E1E] hover:bg-[#3D3D3D] text-[#F3EFE6] rounded border border-[#5F5E5A] text-[11px] cursor-pointer"
                              >
                                <Copy className="w-3 h-3" />
                                <span>复制</span>
                              </button>
                            </div>
                            <pre className="p-4 text-xs sm:text-sm font-mono overflow-x-auto whitespace-pre leading-relaxed">
                              {block.content}
                            </pre>
                          </div>
                        )}

                        {block.type === 'quote' && (
                          <blockquote className="p-4 bg-[#FBF7EF] border-l-4 border-[#171717] border-y border-r rounded-r-xl text-sm font-medium text-[#171717] leading-relaxed shadow-[1px_1px_0_#171717]">
                            <div className="flex items-start gap-2">
                              <QuoteIcon className="w-4 h-4 text-[#FFD84D] shrink-0 mt-0.5" />
                              <span className="whitespace-pre-wrap">{block.content}</span>
                            </div>
                          </blockquote>
                        )}

                        {block.type === 'list' && (
                          <div className="p-4 bg-[#FBF7EF] border border-[#171717] rounded-xl text-sm font-mono text-[#171717] space-y-1.5 shadow-[1px_1px_0_#171717]">
                            {block.content.split('\n').map((line, i) => (
                              <div key={i} className="flex items-start gap-2">
                                <span className="text-[#FFD84D] font-bold shrink-0">▸</span>
                                <span className="leading-snug">{line.replace(/^[-•*]\s*/, '')}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {block.type === 'image' && (
                          <div className="border-2 border-[#171717] rounded-xl overflow-hidden bg-[#EDE8DC]/50 shadow-[3px_3px_0_#171717]">
                            <img
                              src={block.content}
                              alt="资源附图"
                              className="w-full max-h-[400px] object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200"><rect width="400" height="200" fill="%23EDE8DC"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="monospace" font-size="14" fill="%23888780">无法加载图片资源</text></svg>';
                              }}
                            />
                            {block.meta?.caption && (
                              <div className="p-2 text-center text-xs font-mono text-[#5F5E5A] bg-[#FFFFFF] border-t border-[#171717]">
                                {block.meta.caption}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Block Controls in Edit Mode */}
              {isEditing && (
                <div className="mt-8 pt-4 border-t-2 border-dashed border-[#171717]">
                  <span className="block text-xs font-mono font-bold text-[#888780] uppercase mb-3">
                    + 添加新文档块 (Append Block)
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddBlock('heading')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold bg-[#FFFFFF] hover:bg-[#FFD84D] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] cursor-pointer"
                    >
                      <Type className="w-3.5 h-3.5" />
                      <span>小标题</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('text')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold bg-[#FFFFFF] hover:bg-[#FFD84D] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] cursor-pointer"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>段落正文</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('code')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold bg-[#FFFFFF] hover:bg-[#FFD84D] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] cursor-pointer"
                    >
                      <Code2 className="w-3.5 h-3.5" />
                      <span>代码块</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('list')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold bg-[#FFFFFF] hover:bg-[#FFD84D] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] cursor-pointer"
                    >
                      <List className="w-3.5 h-3.5" />
                      <span>条目列表</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddBlock('quote')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold bg-[#FFFFFF] hover:bg-[#FFD84D] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] cursor-pointer"
                    >
                      <QuoteIcon className="w-3.5 h-3.5" />
                      <span>引用备忘</span>
                    </button>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT 4 COLUMNS: Fixed Info, Entry List, Meta Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* 1. Entry List Card */}
            <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[4px_4px_0_#171717]">
              <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2.5 mb-4">
                <div className="flex items-center gap-1.5">
                  <CornerDownRight className="w-4 h-4 text-[#171717]" />
                  <h3 className="text-sm font-bold font-mono text-[#171717]">
                    访问入口集群 · Entrypoints
                  </h3>
                </div>
              </div>

              {/* Primary Entry */}
              <div className="p-3 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl shadow-[2px_2px_0_#171717] mb-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#5F5E5A] mb-1">
                  <span className="font-bold text-[#171717] bg-[#FFD84D] px-1 rounded border border-[#171717]">
                    主入口
                  </span>
                  <span>{protocol === 'localPath' ? '本地路径' : '网络链接'}</span>
                </div>

                {isEditing ? (
                  <input
                    type="text"
                    value={targetUrl}
                    onChange={(e) => setTargetUrl(e.target.value)}
                    className="w-full text-xs font-mono p-1.5 bg-[#FFFFFF] border border-[#171717] rounded mb-2"
                  />
                ) : (
                  <div className="font-mono text-xs font-semibold text-[#171717] truncate select-all mb-2">
                    {targetUrl}
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenPrimary}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-1 px-2 text-xs font-bold font-mono bg-[#FFD84D] hover:bg-[#FACC15] border border-[#171717] rounded shadow-[1px_1px_0_#171717] cursor-pointer"
                  >
                    <span>{protocol === 'localPath' ? '复制路径' : '立即直达'}</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyText(targetUrl, '已复制主入口地址')}
                    className="p-1 bg-[#FFFFFF] hover:bg-[#EDE8DC] border border-[#171717] rounded shadow-[1px_1px_0_#171717] cursor-pointer"
                    title="复制主入口"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Secondary Entries */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-[#888780] pt-1">
                  <span>辅助入口与指令 ({secondaryEntries.length})</span>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={handleAddSecondaryEntry}
                      className="text-[11px] text-[#171717] hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>新增</span>
                    </button>
                  )}
                </div>

                {secondaryEntries.map((sec) => (
                  <div
                    key={sec.id}
                    className="p-2.5 bg-[#FFFFFF] border border-[#171717] rounded-xl text-xs font-mono shadow-[1px_1px_0_#171717] space-y-1.5"
                  >
                    {isEditing ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between gap-1">
                          <input
                            type="text"
                            value={sec.label}
                            onChange={(e) =>
                              handleUpdateSecondaryEntry(sec.id, 'label', e.target.value)
                            }
                            className="w-1/2 p-1 border border-[#171717] rounded text-xs font-bold"
                            placeholder="标签名称"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveSecondaryEntry(sec.id)}
                            className="p-1 text-[#E57373] hover:bg-[#FFB4C6] rounded"
                            title="删除"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={sec.target}
                          onChange={(e) =>
                            handleUpdateSecondaryEntry(sec.id, 'target', e.target.value)
                          }
                          className="w-full p-1 border border-[#171717] rounded text-xs"
                          placeholder="目标地址或指令"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1 truncate">
                          <div className="font-bold text-[#171717] truncate">{sec.label}</div>
                          <div className="text-[#5F5E5A] text-[11px] truncate select-all">
                            {sec.target}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {sec.target.startsWith('http') && (
                            <a
                              href={sec.target}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1 hover:bg-[#FFD84D] border border-[#171717] rounded text-[#171717]"
                              title="打开"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                          <button
                            type="button"
                            onClick={() => handleCopyText(sec.target, `已复制 ${sec.label}`)}
                            className="p-1 hover:bg-[#EDE8DC] border border-[#171717] rounded text-[#171717]"
                            title="复制"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Fixed Metadata Info Card */}
            <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[4px_4px_0_#171717] space-y-4">
              <div className="border-b-2 border-[#171717] pb-2.5">
                <h3 className="text-sm font-bold font-mono text-[#171717] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#171717]" />
                  <span>元数据档案 · Metadata</span>
                </h3>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="flex items-center justify-between pb-2 border-b border-[#EDE8DC]">
                  <span className="text-[#888780]">资产标识 (ID)</span>
                  <span className="font-bold text-[#171717] truncate max-w-[140px]">
                    {object.id}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#EDE8DC]">
                  <span className="text-[#888780]">分类类型</span>
                  <span className="font-bold text-[#171717]">{visual.label}</span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#EDE8DC]">
                  <span className="text-[#888780]">网格尺寸</span>
                  <span className="font-bold text-[#171717]">
                    {object.cardSize === 'small'
                      ? '紧凑 (2列)'
                      : object.cardSize === 'large'
                      ? '双高 (4列)'
                      : object.cardSize === 'banner'
                      ? '通栏 (6列)'
                      : '标准 (4列)'}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-2 border-b border-[#EDE8DC]">
                  <span className="text-[#888780]">初次收录</span>
                  <span className="font-bold text-[#171717]">
                    {new Date(object.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#888780]">最近修订</span>
                  <span className="font-bold text-[#171717]">
                    {new Date(object.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Tags Section */}
              <div className="pt-2 border-t border-[#EDE8DC]">
                <span className="block text-xs font-mono font-bold text-[#888780] mb-2 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-[#171717]" />
                  <span>关联索引标签</span>
                </span>

                {isEditing ? (
                  <div>
                    <input
                      type="text"
                      value={tagsInput}
                      onChange={(e) => setTagsInput(e.target.value)}
                      placeholder="逗号分隔，如: React, Tool"
                      className="w-full text-xs font-mono p-2 bg-[#FBF7EF] border border-[#171717] rounded-lg"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {object.tags.length > 0 ? (
                      object.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 text-xs font-mono font-bold bg-[#FBF7EF] border border-[#171717] rounded-md shadow-[1px_1px_0_#171717]"
                        >
                          #{tag}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-[#888780] font-mono">暂无标签</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 3. Long Notes Card */}
            <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[4px_4px_0_#171717]">
              <div className="border-b-2 border-[#171717] pb-2.5 mb-3">
                <h3 className="text-sm font-bold font-mono text-[#171717] flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#171717]" />
                  <span>长期备忘与环境配置 · Notes</span>
                </h3>
              </div>

              {isEditing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full text-xs font-mono p-2.5 bg-[#FBF7EF] border border-[#171717] rounded-lg focus:outline-none"
                  placeholder="记录环境依赖、启动注意事项或账号配置..."
                />
              ) : (
                <div className="p-3 bg-[#EDE8DC]/40 border border-[#171717] rounded-xl text-xs font-mono text-[#5F5E5A] leading-relaxed">
                  {notes ||
                    '该资源属于个人数字入口体系，就绪状态正常。支持多端一键同步与直达。'}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
