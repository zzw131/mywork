import React, { useState, useEffect } from 'react';
import { WorkbenchObject, TYPE_VISUAL_MAP, ObjectType, StatusType } from '../../types';
import { Resource, EntryItem } from '../../types/resource';
import { toResource, executeEntry } from '../../adapters/resourceAdapter';
import { V4Badge } from './V4Badge';
import { V4StatusDot } from './V4StatusDot';
import { V4Button } from './V4Button';
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
  Edit3,
  Trash2,
  Code2,
  Cpu,
  Bookmark,
  Share2,
  ShieldCheck,
  AlertCircle,
  Play,
  Download,
  Info,
} from 'lucide-react';

export interface DetailModalProps {
  object: WorkbenchObject | Resource | null;
  isOwner?: boolean;
  onClose: () => void;
  onViewFullDetail?: (id: string) => void;
  onEdit?: (obj: WorkbenchObject) => void;
  onDelete?: (id: string) => void;
  onTogglePin?: (id: string) => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({
  object: rawObject,
  isOwner = false,
  onClose,
  onViewFullDetail,
  onEdit,
  onDelete,
  onTogglePin,
}) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Close modal on Escape key
  useEffect(() => {
    if (!rawObject) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [rawObject, onClose]);

  // Reset delete confirmation when object changes
  useEffect(() => {
    setConfirmDelete(false);
  }, [rawObject]);

  if (!rawObject) return null;

  const res: Resource =
    'primaryEntry' in rawObject ? rawObject : toResource(rawObject as WorkbenchObject);
  const rawDbObject: WorkbenchObject =
    'primaryEntry' in rawObject
      ? {
          id: rawObject.id,
          title: rawObject.title,
          targetUrl: rawObject.primaryEntry.target,
          type: rawObject.type,
          summary: rawObject.summary,
          status: rawObject.status,
          pinned: rawObject.pinned,
          tags: rawObject.tags,
          cardSize: 'wide',
          createdAt: rawObject.createdAt,
          updatedAt: rawObject.updatedAt,
          x: 0,
          y: 0,
          w: 2,
          h: 2,
        }
      : (rawObject as WorkbenchObject);

  const visual = TYPE_VISUAL_MAP[res.type] || TYPE_VISUAL_MAP.generic;

  const handleOpenPrimary = async () => {
    const result = await executeEntry(res.primaryEntry);
    setFeedback(result.action === 'copied' ? '已复制路径' : '已在新窗口打开');
    setTimeout(() => setFeedback(null), 1800);
  };

  const handleCopyText = async (text: string, label: string = '已复制') => {
    try {
      await navigator.clipboard?.writeText(text);
      setFeedback(label);
      setTimeout(() => setFeedback(null), 1800);
    } catch {
      setFeedback('复制失败');
      setTimeout(() => setFeedback(null), 1800);
    }
  };

  const handleDelete = () => {
    if (!isOwner || !onDelete) return;
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(res.id);
    onClose();
  };

  // Generate intelligent specialized entries based on resource type & primary target
  const getSpecializedSections = () => {
    const target = res.primaryEntry.target;
    const isLocal = res.primaryEntry.protocol === 'localPath';
    const isGithub = res.primaryEntry.protocol === 'github';
    const isWeb = res.primaryEntry.protocol === 'url';

    switch (res.type) {
      case 'project': {
        // Project: Code entry, deploy URL, repo, dev commands
        const localPath = isLocal ? target : `~/workspace/${res.title.toLowerCase().replace(/\s+/g, '-')}`;
        const devPort = isWeb && target.includes(':') ? target : 'http://localhost:3000';
        const gitRepo = isGithub ? target : `https://github.com/dapao/${res.title.toLowerCase().replace(/\s+/g, '-')}`;

        return (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#171717] border-b border-[#EDE8DC] pb-1.5">
              <Code2 className="w-3.5 h-3.5 text-[#171717]" />
              <span>项目专属接入面板 · Project Integration</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Code Workspace Entry */}
              <div className="p-3 bg-[#FBF7EF] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#5F5E5A] mb-1">
                    <span className="font-bold text-[#171717]">代码工作区 (VS Code / 本地)</span>
                    <span>本地路径</span>
                  </div>
                  <div className="font-mono text-xs text-[#171717] font-semibold truncate select-all">
                    {localPath}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#EDE8DC]">
                  <button
                    type="button"
                    onClick={() => handleCopyText(`code ${localPath}`, '已复制 VS Code 打开命令')}
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2 py-1 bg-[#FFFFFF] hover:bg-[#FFD84D] border border-[#171717] rounded shadow-[1px_1px_0_#171717] transition-all cursor-pointer"
                  >
                    <Terminal className="w-3 h-3" />
                    <span>复制 code 指令</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyText(localPath, '已复制本地路径')}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 bg-[#FFFFFF] hover:bg-[#EDE8DC] border border-[#171717] rounded transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>复制路径</span>
                  </button>
                </div>
              </div>

              {/* Dev / Deploy Port */}
              <div className="p-3 bg-[#FBF7EF] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717] flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-[#5F5E5A] mb-1">
                    <span className="font-bold text-[#171717]">本地服务 / 部署端口</span>
                    <span>HTTP 预览</span>
                  </div>
                  <div className="font-mono text-xs text-[#171717] font-semibold truncate select-all">
                    {devPort}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#EDE8DC]">
                  <a
                    href={devPort}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-mono font-bold px-2.5 py-1 bg-[#FFD84D] hover:bg-[#FACC15] border border-[#171717] rounded shadow-[1px_1px_0_#171717] transition-all cursor-pointer text-[#171717]"
                  >
                    <span>直达服务</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    type="button"
                    onClick={() => handleCopyText(devPort, '已复制端口地址')}
                    className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-1 bg-[#FFFFFF] hover:bg-[#EDE8DC] border border-[#171717] rounded transition-colors cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>复制 URL</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Quick dev command bar */}
            <div className="p-2.5 bg-[#FFFFFF] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717] flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-1.5 truncate">
                <Terminal className="w-3.5 h-3.5 text-[#5F5E5A] shrink-0" />
                <span className="text-[#5F5E5A]">快速启动:</span>
                <code className="bg-[#EDE8DC] px-1.5 py-0.5 rounded text-[#171717] font-bold">
                  npm run dev
                </code>
              </div>
              <button
                type="button"
                onClick={() => handleCopyText(`cd ${localPath} && npm run dev`, '已复制启动指令')}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 bg-[#EDE8DC] hover:bg-[#FFD84D] border border-[#171717] rounded transition-colors shrink-0 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>复制执行命令</span>
              </button>
            </div>
          </div>
        );
      }

      case 'website': {
        // Website: URL, Security, share link
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#171717] border-b border-[#EDE8DC] pb-1.5">
              <Globe className="w-3.5 h-3.5 text-[#171717]" />
              <span>网站访问规格 · Website Details</span>
            </div>

            <div className="p-3.5 bg-[#FBF7EF] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-1 text-[10px] font-mono text-[#5F5E5A]">
                  <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                  <span>
                    {target.startsWith('https') ? 'HTTPS 安全加密连接' : 'HTTP 标准超文本协议'}
                  </span>
                </div>
                <div className="font-mono text-sm font-bold text-[#171717] truncate select-all">
                  {target}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={target}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold font-mono text-[#171717] bg-[#FFD84D] hover:bg-[#FACC15] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                >
                  <span>立即访问</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => handleCopyText(target, '已复制网站链接')}
                  className="p-1.5 bg-[#FFFFFF] hover:bg-[#EDE8DC] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] transition-colors cursor-pointer"
                  title="复制完整网址"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 'tool': {
        // Tool: Install command, launch command, CLI arguments
        const installCmd = target.includes('docker')
          ? `docker pull ${target}`
          : target.includes('brew')
          ? `brew install ${res.title.toLowerCase().replace(/\s+/g, '-')}`
          : `npm install -g ${res.title.toLowerCase().replace(/\s+/g, '-')}`;

        return (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#171717] border-b border-[#EDE8DC] pb-1.5">
              <Cpu className="w-3.5 h-3.5 text-[#171717]" />
              <span>工具配置与执行指令 · Tool Commands</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Install Method */}
              <div className="p-3 bg-[#FBF7EF] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#5F5E5A] mb-1">
                  <span className="font-bold text-[#171717]">安装 / 部署指令</span>
                  <span>环境依赖</span>
                </div>
                <div className="font-mono text-xs text-[#171717] font-semibold truncate bg-[#FFFFFF] p-1.5 rounded border border-[#171717] mb-2 select-all">
                  {installCmd}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(installCmd, '已复制安装命令')}
                  className="w-full inline-flex items-center justify-center gap-1 text-[11px] font-mono font-bold py-1 bg-[#FFFFFF] hover:bg-[#FFD84D] border border-[#171717] rounded shadow-[1px_1px_0_#171717] transition-all cursor-pointer"
                >
                  <Download className="w-3 h-3" />
                  <span>复制安装命令</span>
                </button>
              </div>

              {/* Launch Method */}
              <div className="p-3 bg-[#FBF7EF] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717]">
                <div className="flex items-center justify-between text-[10px] font-mono text-[#5F5E5A] mb-1">
                  <span className="font-bold text-[#171717]">启动方式 / 执行入口</span>
                  <span>终端运行</span>
                </div>
                <div className="font-mono text-xs text-[#171717] font-semibold truncate bg-[#FFFFFF] p-1.5 rounded border border-[#171717] mb-2 select-all">
                  {target}
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(target, '已复制启动入口')}
                  className="w-full inline-flex items-center justify-center gap-1 text-[11px] font-mono font-bold py-1 bg-[#FFD84D] hover:bg-[#FACC15] border border-[#171717] rounded shadow-[1px_1px_0_#171717] transition-all cursor-pointer text-[#171717]"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>复制启动参数</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      case 'repository': {
        // Repository: GitHub URL, clone command, issue/pr entry
        const cloneCmd = `git clone ${target.replace(/\/$/, '')}.git`;

        return (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#171717] border-b border-[#EDE8DC] pb-1.5">
              <Github className="w-3.5 h-3.5 text-[#171717]" />
              <span>代码仓库与镜像克隆 · Git Repository</span>
            </div>

            <div className="p-3.5 bg-[#FBF7EF] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717] space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1 truncate">
                  <div className="text-[10px] font-mono text-[#5F5E5A] mb-0.5">仓库远端主页</div>
                  <div className="font-mono text-xs font-bold text-[#171717] truncate select-all">
                    {target}
                  </div>
                </div>
                <a
                  href={target}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold font-mono text-[#171717] bg-[#FFD84D] hover:bg-[#FACC15] border border-[#171717] rounded-lg shadow-[1px_1px_0_#171717] transition-all cursor-pointer shrink-0"
                >
                  <span>在 GitHub 打开</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <div className="pt-2 border-t border-[#EDE8DC] flex items-center justify-between gap-2 text-xs font-mono">
                <div className="min-w-0 flex-1 truncate">
                  <span className="text-[#5F5E5A] mr-1.5">克隆命令:</span>
                  <code className="text-[#171717] font-semibold select-all">{cloneCmd}</code>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopyText(cloneCmd, '已复制 Clone 命令')}
                  className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 bg-[#FFFFFF] hover:bg-[#EDE8DC] border border-[#171717] rounded transition-colors shrink-0 cursor-pointer"
                >
                  <Copy className="w-3 h-3" />
                  <span>复制命令</span>
                </button>
              </div>
            </div>
          </div>
        );
      }

      default: {
        // App, Service, Learning, Note, Generic
        return (
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-[#171717] border-b border-[#EDE8DC] pb-1.5">
              <CornerDownRight className="w-3.5 h-3.5 text-[#171717]" />
              <span>快捷调度动作 · Quick Action</span>
            </div>

            <div className="p-3 bg-[#FBF7EF] border border-[#171717] rounded-xl shadow-[1px_1px_0_#171717] flex items-center justify-between gap-2 text-xs font-mono">
              <div className="min-w-0 flex-1 truncate">
                <span className="font-bold text-[#171717] mr-2">调度端点:</span>
                <span className="text-[#5F5E5A] select-all">{target}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyText(target, '已复制调度端点')}
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 bg-[#FFFFFF] hover:bg-[#EDE8DC] border border-[#171717] rounded shadow-[1px_1px_0_#171717] transition-all shrink-0 cursor-pointer"
              >
                <Copy className="w-3 h-3" />
                <span>复制</span>
              </button>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60">
      {/* Backdrop click to dismiss */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Container: Strict Neo-Brutalism v4 specifications */}
      <div
        data-testid="preview-overlay"
        className="relative z-10 w-full max-w-2xl bg-[#FFFFFF] border-2 border-[#171717] rounded-2xl shadow-[8px_8px_0_#171717] max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 bg-[#FBF7EF] border-b-2 border-[#171717] flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <V4Badge type={res.type} showFullLabel />
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFFFFF] border border-[#171717] rounded text-xs font-mono font-bold shadow-[1px_1px_0_#171717]">
              <V4StatusDot status={res.status} />
              <span>
                {res.status === 'ok'
                  ? '运行正常'
                  : res.status === 'warn'
                  ? '待检查'
                  : '已失效'}
              </span>
            </div>

            {res.pinned && (
              <span className="inline-flex items-center gap-1 text-xs font-mono font-bold text-[#171717] bg-[#FFD84D] px-2 py-0.5 border border-[#171717] rounded shadow-[1px_1px_0_#171717]">
                <Pin className="w-3 h-3 fill-current rotate-45" />
                <span>已置顶</span>
              </span>
            )}

            <span className="text-xs font-mono text-[#888780]">
              ID: {res.id.slice(-8)}
            </span>
          </div>

          <button
            type="button"
            data-testid="overlay-close"
            onClick={onClose}
            className="p-1.5 text-[#171717] bg-[#FFFFFF] hover:bg-[#FFB4C6] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
            title="关闭详情 (ESC)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Title & Core Summary */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#171717] tracking-tight mb-2 leading-snug">
              {res.title}
            </h2>
            <div className="p-3 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl text-xs sm:text-sm text-[#171717] leading-relaxed shadow-[2px_2px_0_#171717]">
              <span className="font-bold text-[#888780] block text-[10px] font-mono uppercase mb-1">
                资产核心简介 · Core Summary
              </span>
              {res.summary || '暂无详细简介说明。该入口属于工作台登记的活跃数字入口资产。'}
            </div>
          </div>

          {/* Primary Access Entry Banner */}
          <div className="p-4 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[3px_3px_0_#171717] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-mono font-bold text-[#171717] bg-[#FFD84D] px-1.5 py-0.5 border border-[#171717] rounded shadow-[1px_1px_0_#171717]">
                  主入口 · Primary Entry
                </span>
                <span className="text-[11px] font-mono text-[#5F5E5A]">
                  协议: {res.primaryEntry.protocol === 'localPath' ? '本地路径' : res.primaryEntry.protocol === 'github' ? 'GitHub 仓库' : '网页链接'}
                </span>
              </div>
              <div className="font-mono text-xs sm:text-sm font-semibold text-[#171717] truncate select-all bg-[#FBF7EF] px-2 py-1 rounded border border-[#EDE8DC]">
                {res.primaryEntry.target}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleOpenPrimary}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold font-mono text-[#171717] bg-[#FFD84D] hover:bg-[#FACC15] border-2 border-[#171717] rounded-lg shadow-[3px_3px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer whitespace-nowrap"
              >
                {feedback ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>{feedback}</span>
                  </>
                ) : res.primaryEntry.protocol === 'localPath' ? (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>复制本地路径</span>
                  </>
                ) : (
                  <>
                    <span>打开主入口</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Type-Adapted Specialized Section (project, website, tool, repo...) */}
          {getSpecializedSections()}

          {/* Tags Chips Bar */}
          {res.tags && res.tags.length > 0 && (
            <div>
              <span className="block text-xs font-mono font-bold text-[#888780] mb-2 flex items-center gap-1">
                <Hash className="w-3.5 h-3.5 text-[#171717]" /> 关联索引标签
              </span>
              <div className="flex flex-wrap gap-1.5">
                {res.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 text-xs font-mono font-bold text-[#171717] bg-[#FFFFFF] border border-[#171717] rounded-lg shadow-[2px_2px_0_#171717]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Metadata Specifications Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 p-3.5 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl text-xs font-mono shadow-[2px_2px_0_#171717]">
            <div>
              <span className="text-[#888780] flex items-center gap-1 mb-0.5">
                <Layers className="w-3 h-3" /> 网格规格
              </span>
              <span className="font-bold text-[#171717]">
                {res.size === 'small'
                  ? '紧凑卡片 (2列)'
                  : res.size === 'medium'
                  ? '标准卡片 (4列)'
                  : res.size === 'large'
                  ? '双高卡片 (4列)'
                  : '通栏卡片 (6列)'}
              </span>
            </div>

            <div>
              <span className="text-[#888780] flex items-center gap-1 mb-0.5">
                <Clock className="w-3 h-3" /> 最近更新时间
              </span>
              <span className="font-bold text-[#171717]">
                {new Date(res.updatedAt).toLocaleDateString()}
              </span>
            </div>

            <div>
              <span className="text-[#888780] flex items-center gap-1 mb-0.5">
                <Calendar className="w-3 h-3" /> 初次登记时间
              </span>
              <span className="font-bold text-[#171717]">
                {new Date(res.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Notes / 备注长文本 */}
          <div>
            <span className="block text-xs font-mono font-bold text-[#888780] mb-1.5 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-[#171717]" /> 运行备注与环境说明
            </span>
            <div className="p-3 bg-[#EDE8DC]/40 border border-[#171717] rounded-xl text-xs font-mono text-[#5F5E5A] leading-relaxed">
              {res.notes ||
                `该入口由 Personal Workbench 本地调度层统一管理，支持零延迟直达、本地路径复制及快速协议映射。`}
            </div>
          </div>
        </div>

        {/* Footer Actions Bar - Permissions Enforced */}
        <div className="px-6 py-3.5 bg-[#FBF7EF] border-t-2 border-[#171717] flex items-center justify-between gap-3 shrink-0 flex-wrap">
          {/* Left: Role indicator and View Full Detail Button */}
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-xs font-mono text-[#5F5E5A]">
              {isOwner ? (
                <span className="inline-flex items-center gap-1 font-bold text-[#171717]">
                  <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                  管理员模式 (已授权)
                </span>
              ) : (
                <span className="text-[#888780]">访客只读模式</span>
              )}
            </span>

            {onViewFullDetail && (
              <button
                type="button"
                onClick={() => {
                  onViewFullDetail(res.id);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold bg-[#FFD84D] hover:bg-[#FACC15] text-[#171717] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                title="打开个人资源档案页"
              >
                <span>查看完整详情</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right: Owner Controls or Guest Close */}
          <div className="flex items-center gap-2.5">
            {isOwner ? (
              <>
                {/* Pin Toggle */}
                {onTogglePin && (
                  <button
                    type="button"
                    onClick={() => onTogglePin(res.id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold bg-[#FFFFFF] hover:bg-[#FFD84D] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <Pin className={`w-3.5 h-3.5 ${res.pinned ? 'fill-current' : ''}`} />
                    <span>{res.pinned ? '取消置顶' : '置顶卡片'}</span>
                  </button>
                )}

                {/* Edit Button */}
                {onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      onEdit(rawDbObject);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-mono font-bold bg-[#FFFFFF] hover:bg-[#FFD84D] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>编辑资产</span>
                  </button>
                )}

                {/* Delete Button */}
                {onDelete && (
                  <button
                    type="button"
                    onClick={handleDelete}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-mono font-bold rounded-lg border-2 border-[#171717] transition-all cursor-pointer ${
                      confirmDelete
                        ? 'bg-[#E57373] text-[#FFFFFF] shadow-[3px_3px_0_#171717] animate-pulse'
                        : 'bg-[#FFB4C6] text-[#171717] hover:bg-[#FF8FA8] shadow-[2px_2px_0_#171717]'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{confirmDelete ? '确认删除？' : '删除'}</span>
                  </button>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-xs font-mono font-bold text-[#171717] bg-[#EDE8DC] hover:bg-[#E5DFD1] border-2 border-[#171717] rounded-lg shadow-[2px_2px_0_#171717] transition-all cursor-pointer"
              >
                关闭
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
