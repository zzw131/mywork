import React, { useState, useMemo } from 'react';
import {
  Copy,
  Check,
  Sparkles,
  Layers,
  Palette,
  Type,
  Square,
  Box,
  Sliders,
  Terminal,
  Search,
  ExternalLink,
  Code2,
  Github,
  Globe,
  Folder,
  CornerDownRight,
  Pin,
  Clock,
  Target,
  CheckCircle2,
  Shield,
  FileText,
  Filter,
  ArrowRight,
  Hash,
  Eye,
  Info,
} from 'lucide-react';
import { V4Button } from './v4/V4Button';
import { V4Tag } from './v4/V4Tag';
import { V4Input } from './v4/V4Input';
import { V4Badge } from './v4/V4Badge';
import { V4Section } from './v4/V4Section';
import { V4ResourceCard } from './v4/V4ResourceCard';
import { V4CategoryFilter } from './v4/V4CategoryFilter';
import { WorkbenchLogo } from './v4/WorkbenchLogo';
import { GoalCard } from '../modules/goals/GoalCard';
import { GoalItem } from '../modules/goals/types';
import { MemoCard } from '../modules/memos/MemoCard';
import { Memo } from '../modules/memos/types';
import { WorkbenchObject, TYPE_VISUAL_MAP, ObjectType } from '../types';
import { FilterCategory } from '../types/resource';

interface DesignSystemPageProps {
  onBackToWorkbench?: () => void;
  searchQuery?: string;
}

export const DesignSystemPage: React.FC<DesignSystemPageProps> = ({
  onBackToWorkbench,
  searchQuery = '',
}) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string>('react');
  const [inputValue, setInputValue] = useState<string>('搜索数字资产...');
  const [selectedCardId, setSelectedCardId] = useState<string>('ds-card-1');
  const [demoCategory, setDemoCategory] = useState<FilterCategory>('all');

  const copyToClipboard = (text: string, tokenName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedToken(tokenName);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  // Mock Objects for Card Demonstrations (Using latest schema without status dot on cards)
  const sampleCardSmall: WorkbenchObject = {
    id: 'ds-card-1',
    title: 'Linear · 产品迭代看板',
    targetUrl: 'https://linear.app/workbench',
    type: 'tool',
    status: 'ok',
    summary: '团队当前 Sprint 燃尽图与待办需求清单',
    pinned: true,
    cardSize: 'small',
    tags: ['Product', 'PM'],
    createdAt: '2026-03-20',
    updatedAt: '10 分钟前',
    x: 0,
    y: 0,
    w: 2,
    h: 2,
  };

  const sampleCardWide: WorkbenchObject = {
    id: 'ds-card-2',
    title: 'Cloudflare Zero Trust 网关',
    targetUrl: 'https://dash.cloudflare.com/network',
    type: 'service',
    status: 'ok',
    summary: '内网穿透隧道、DNS 安全防护与全球边缘 CDN 路由状态监控',
    pinned: false,
    cardSize: 'wide',
    tags: ['DevOps', 'Network', 'DNS'],
    createdAt: '2026-03-15',
    updatedAt: '2 小时前',
    x: 2,
    y: 0,
    w: 4,
    h: 2,
  };

  const sampleCardLarge: WorkbenchObject = {
    id: 'ds-card-3',
    title: 'DeepSeek-V3 本地推理服务',
    targetUrl: 'http://192.168.1.120:11434/v1',
    type: 'app',
    status: 'warn',
    summary: 'Mac Studio M2 Ultra 私有化部署的大模型推理服务 API，支持 OpenAI 兼容格式与多并发调度。',
    pinned: true,
    cardSize: 'large',
    tags: ['LLM', 'AI', 'Self-Hosted', 'Ollama'],
    createdAt: '2026-03-10',
    updatedAt: '1 小时前',
    x: 0,
    y: 2,
    w: 4,
    h: 4,
  };

  const sampleCardBanner: WorkbenchObject = {
    id: 'ds-card-4',
    title: 'PostgreSQL 核心元数据库 (PGlite / Drizzle ORM)',
    targetUrl: 'postgres://admin@127.0.0.1:5432/workbench_core',
    type: 'repository',
    status: 'ok',
    summary: '高频读写事务节点，提供零延迟本地离线优先存储引擎与即时双向状态同步',
    pinned: false,
    cardSize: 'banner',
    tags: ['Database', 'PGlite', 'SQL'],
    createdAt: '2026-03-01',
    updatedAt: '刚刚',
    x: 0,
    y: 6,
    w: 6,
    h: 2,
  };

  // Mock Goals for Section 6 Demonstration
  const sampleGoalInProgress: GoalItem = {
    id: 'ds-goal-1',
    title: '重构工作台前端架构与 Neo-Brutalism v4 规范对齐',
    summary: '移除冗余装饰与卡片指示灯，纯化工程蓝图网格画板，统一响应式栅格系统与跨端访问。',
    category: 'project',
    priority: 'p0',
    status: 'in_progress',
    startDate: '2026-03-15',
    targetDate: '2026-04-01',
    createdAt: '2026-03-15',
    updatedAt: '刚刚',
    link: 'https://github.com/developer/personal-workbench',
    linkLabel: 'GitHub 仓库直达',
    linkedResourceId: 'ds-card-4',
    linkedResourceTitle: 'PostgreSQL 核心元数据库',
    tags: ['Architecture', 'Refactor', 'DesignSystem'],
  };

  const sampleGoalCompleted: GoalItem = {
    id: 'ds-goal-2',
    title: '构建阶段目标管理与复盘笔记闭环',
    summary: '支持 OKR 风格的目标制定、状态推进、关联工作台入口资产双向绑定以及结构化复盘沉淀。',
    category: 'tool',
    priority: 'p1',
    status: 'completed',
    startDate: '2026-03-01',
    targetDate: '2026-03-20',
    completedAt: '2026-03-22',
    createdAt: '2026-03-01',
    updatedAt: '2026-03-22',
    completionRecord: {
      startDate: '2026-03-01',
      completedAt: '2026-03-22',
      notes: '提前完成阶段目标里程碑。在多端测试中表现稳定，用户能够从目标直接跳转至对应工作台工具或系统链接，有效形成高频生产力闭环。',
      proofUrl: 'https://linear.app/workbench',
      recordedBy: 'Z75086556000@gmail.com',
    },
    tags: ['Productivity', 'OKR', 'Review'],
  };

  // Mock Memos for Section 7 Demonstration
  const sampleMemoPinned: Memo = {
    id: 'ds-memo-1',
    title: 'Workbench 顶栏与交互细节调优清单',
    content: '1. 备忘录快速记录区支持 Cmd+Enter 快速保存\n2. 状态筛选 Tab 统一 h-9~h-10 并加入防裁剪 p-1 -m-1\n3. 保持工作台、备忘录、目标管理、规范库四模块边界分明',
    tags: ['产品设计', '交互细节', 'V4规范'],
    pinned: true,
    archived: false,
    createdAt: '2026-03-29T08:00:00.000Z',
    updatedAt: '2026-03-29T08:30:00.000Z',
  };

  const sampleMemoNormal: Memo = {
    id: 'ds-memo-2',
    content: '临时备忘：本地 IndexedDB 与 PostgreSQL 模式映射，需在 Memo 模型中仅保留最简文本和标签字段，杜绝目标管理的进度或截止期混入。',
    tags: ['技术调研', '随手记'],
    pinned: false,
    archived: false,
    createdAt: '2026-03-28T14:20:00.000Z',
    updatedAt: '2026-03-28T14:20:00.000Z',
  };

  // Token tables
  const baseColors = [
    { name: 'paper', hex: '#FBF7EF', desc: '全局底色 (纸质基底 / Canvas)' },
    { name: 'surface', hex: '#FFFFFF', desc: '卡片及输入框表面纯白' },
    { name: 'ink', hex: '#171717', desc: '主文字与 2px 描边核心黑' },
    { name: 'ink-2', hex: '#5F5E5A', desc: '次级辅助正文与描述' },
    { name: 'ink-3', hex: '#888780', desc: '占位符/时间戳弱化色' },
    { name: 'line', hex: '#EDE8DC', desc: '浅灰硬质细分割线' },
  ];

  const accentColors = [
    { name: 'yellow', hex: '#FFD84D', desc: '主品牌/置顶/选中/高光' },
    { name: 'pink', hex: '#FFB4C6', desc: '代码/危险/警报强调' },
    { name: 'purple', hex: '#C9B8FF', desc: 'AI/智能引擎专属徽章' },
    { name: 'mint', hex: '#A9E5C3', desc: '已达成/监控/健康标记' },
    { name: 'blue', hex: '#A9D0FF', desc: '部署/基础设施路由' },
    { name: 'apricot', hex: '#F7C873', desc: '文档/手册/知识索引' },
  ];

  const allTypes: ObjectType[] = [
    'project',
    'tool',
    'website',
    'app',
    'learning',
    'note',
    'repository',
    'service',
    'generic',
  ];

  // Protocol definitions
  const protocolList = [
    {
      protocol: 'github',
      label: 'GitHub 仓库',
      example: 'https://github.com/org/repo',
      icon: <Github className="w-3.5 h-3.5 text-[#171717]" />,
      actionDesc: '点击在新标签页打开代码仓库',
    },
    {
      protocol: 'url',
      label: '外部 Web 链接',
      example: 'https://console.cloud.google.com',
      icon: <Globe className="w-3.5 h-3.5 text-[#171717]" />,
      actionDesc: '直接外链跳转，安全沙箱打开',
    },
    {
      protocol: 'localPath',
      label: '本地路径 / 目录',
      example: '/Users/developer/Workspace/core',
      icon: <Folder className="w-3.5 h-3.5 text-[#171717]" />,
      actionDesc: '一键复制绝对路径到系统剪贴板',
    },
    {
      protocol: 'custom',
      label: '命令 / 终端动作',
      example: 'docker compose up -d postgres',
      icon: <CornerDownRight className="w-3.5 h-3.5 text-[#171717]" />,
      actionDesc: '一键复制执行命令并提供 Toast 反馈',
    },
  ];

  // Changelog highlights
  const changelog = [
    {
      tag: 'NEW 规范更新',
      title: '全面剥离卡片指示灯 (Indicatorless Cards)',
      desc: '工作台卡片顶栏彻底取消状态指示灯，消除无效视觉噪点，卡片回归纯粹的分类徽章与内容焦点。',
      badgeColor: '#FFD84D',
    },
    {
      tag: 'CANVAS 进化',
      title: '主网格直融工程图纸画板 (Borderless Grid Canvas)',
      desc: '移除全部工作台资产外层多余的白底包装大框，卡片直接锚定在 Engineering Blueprint 栅格底布上。',
      badgeColor: '#A9E5C3',
    },
    {
      tag: 'FEATURE 集成',
      title: '阶段目标 (Goals) 与复盘笔记闭环',
      desc: '正式纳入 OKR 风格的阶段目标追踪、状态流转（进行中/已达成）及关联工作台资产一键直达。',
      badgeColor: '#C9B8FF',
    },
    {
      tag: 'SEARCH 增强',
      title: '全局智能检索工具栏 (Contextual Search Toolbar)',
      desc: '固定于页面顶部的统一搜索组件，跨工作台、阶段目标与规范库多视图动态设定占位与检索模式。',
      badgeColor: '#A9D0FF',
    },
  ];

  // Search filter helper
  const isMatch = useMemo(() => {
    if (!searchQuery.trim()) return () => true;
    const q = searchQuery.toLowerCase().trim();
    return (keywords: string[]) => keywords.some((k) => k.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="w-full min-h-screen bg-[#FBF7EF] text-[#171717] pb-16">
      {/* Main Content Area - Full width consistent with top navbar */}
      <main className="w-full px-4 sm:px-8 pt-5 pb-8 space-y-10">
        {/* Intro Banner */}
        <section className="bg-[#FFFFFF] border-2 border-[#171717] rounded-xl p-6 shadow-[6px_6px_0_#171717]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <WorkbenchLogo className="w-8 h-8" />
                <h2 className="text-xl font-bold tracking-tight">
                  Personal Workbench · 视觉与交互规范库
                </h2>
                <span className="px-2 py-0.5 bg-[#FFD84D] border border-[#171717] rounded text-[11px] font-mono font-bold shadow-[1px_1px_0_#171717]">
                  v4.2 最新规范
                </span>
              </div>
              <p className="text-sm text-[#5F5E5A] max-w-2xl leading-relaxed">
                遵循「粗黑笔触、硬边阴影、高对比排版、高信息密度、零玻璃拟态」的 Neo-Brutalism
                设计准则。拒绝无意义的装饰与冗余卡片，专为极客与高生产力数字工作者打造。
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0 flex-wrap">
              <div className="px-3 py-1.5 bg-[#FBF7EF] border-2 border-[#171717] rounded-lg text-xs font-mono font-bold">
                GRID: 6 列响应式系统
              </div>
              <div className="px-3 py-1.5 bg-[#FFD84D] border-2 border-[#171717] rounded-lg text-xs font-mono font-bold shadow-[2px_2px_0_#171717]">
                BORDER: 2px 硬笔刷
              </div>
            </div>
          </div>

          {/* Search notice if active */}
          {searchQuery && (
            <div className="mt-4 pt-4 border-t-2 border-[#171717] flex items-center justify-between gap-2 text-xs font-mono">
              <div className="flex items-center gap-2 text-[#171717]">
                <Search className="w-3.5 h-3.5" />
                <span>
                  当前正在检索: <strong className="bg-[#FFD84D] px-1.5 py-0.5 rounded border border-[#171717]">{searchQuery}</strong>
                </span>
              </div>
              <span className="text-[#5F5E5A]">已动态过滤相关规范章节</span>
            </div>
          )}
        </section>

        {/* 0. Latest Design Changelog (设计演进与最新规范更替) */}
        {isMatch(['changelog', '更新', '演进', '指示灯', '画板', '网格', '目标', '搜索']) && (
          <section className="space-y-3">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-base font-bold tracking-tight uppercase">
                  最新设计演进 · Latest Changelog & Evolution
                </h3>
              </div>
              <span className="text-xs text-[#5F5E5A] font-mono">同步当前最新页面架构</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {changelog.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] flex flex-col justify-between"
                >
                  <div>
                    <span
                      className="inline-block px-2 py-0.5 text-[10px] font-mono font-bold border border-[#171717] rounded mb-2 shadow-[1px_1px_0_#171717]"
                      style={{ backgroundColor: item.badgeColor }}
                    >
                      {item.tag}
                    </span>
                    <h4 className="text-xs font-bold text-[#171717] mb-1.5 leading-snug">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-[#5F5E5A] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 1. Design Tokens: Colors */}
        {isMatch(['color', '颜色', '色彩', 'token', 'hex', 'paper', 'yellow', 'ink']) && (
          <section id="section-colors" className="space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
              <div className="flex items-center gap-2">
                <Palette className="w-4 h-4" />
                <h3 className="text-base font-bold tracking-tight uppercase">
                  1. 颜色与材质体系 · Color Tokens & Canvas
                </h3>
              </div>
              <span className="text-xs text-[#5F5E5A] font-mono">点击色块复制 HEX 编码</span>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-mono font-bold text-[#5F5E5A] uppercase tracking-wider">
                基础中性色 (Neutral & Functional)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {baseColors.map((c) => (
                  <div
                    key={c.name}
                    onClick={() => copyToClipboard(c.hex, c.name)}
                    className="bg-[#FFFFFF] border-2 border-[#171717] rounded-lg p-3 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#171717] transition-all cursor-pointer group"
                  >
                    <div
                      className="w-full h-12 rounded border border-[#171717] mb-2 flex items-center justify-center font-mono text-xs font-bold"
                      style={{ backgroundColor: c.hex }}
                    >
                      {copiedToken === c.name ? (
                        <span className="bg-[#171717] text-[#FFFFFF] px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                          <Check className="w-3 h-3" /> 已复制
                        </span>
                      ) : null}
                    </div>
                    <div className="font-bold text-xs font-mono text-[#171717]">{c.name}</div>
                    <div className="text-[11px] font-mono text-[#5F5E5A]">{c.hex}</div>
                    <div className="text-[10px] text-[#888780] mt-1 truncate">{c.desc}</div>
                  </div>
                ))}
              </div>

              <h4 className="text-xs font-mono font-bold text-[#5F5E5A] uppercase tracking-wider pt-2">
                强调特征色 (Accent Vibrants)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                {accentColors.map((c) => (
                  <div
                    key={c.name}
                    onClick={() => copyToClipboard(c.hex, c.name)}
                    className="bg-[#FFFFFF] border-2 border-[#171717] rounded-lg p-3 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_#171717] transition-all cursor-pointer group"
                  >
                    <div
                      className="w-full h-12 rounded border border-[#171717] mb-2 flex items-center justify-center font-mono text-xs font-bold"
                      style={{ backgroundColor: c.hex }}
                    >
                      {copiedToken === c.name ? (
                        <span className="bg-[#171717] text-[#FFFFFF] px-1.5 py-0.5 rounded text-[10px] flex items-center gap-1">
                          <Check className="w-3 h-3" /> 已复制
                        </span>
                      ) : null}
                    </div>
                    <div className="font-bold text-xs font-mono text-[#171717]">{c.name}</div>
                    <div className="text-[11px] font-mono text-[#5F5E5A]">{c.hex}</div>
                    <div className="text-[10px] text-[#888780] mt-1 truncate">{c.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 2. Shadows & Borders */}
        {isMatch(['shadow', 'border', '阴影', '圆角', '边框', '触感', '位移']) && (
          <section id="section-typography" className="space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
              <div className="flex items-center gap-2">
                <Box className="w-4 h-4" />
                <h3 className="text-base font-bold tracking-tight uppercase">
                  2. 阴影、边框与物理位移 · Shadows & Tactile Feedback
                </h3>
              </div>
              <span className="text-xs text-[#5F5E5A] font-mono">硬边缘 0 模糊扩散度 · 机械按压感</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717]">
                <div className="font-bold text-xs font-mono text-[#171717] mb-1">默认卡片硬阴影</div>
                <div className="text-xs font-mono text-[#5F5E5A] mb-2">4px 4px 0 #171717</div>
                <div className="text-xs text-[#888780]">应用于绝大部分静态工作台卡片、分类胶囊与常态容器</div>
              </div>

              <div className="p-4 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[6px_6px_0_#171717] -translate-x-0.5 -translate-y-0.5">
                <div className="font-bold text-xs font-mono text-[#171717] mb-1">悬停提升硬阴影</div>
                <div className="text-xs font-mono text-[#5F5E5A] mb-2">6px 6px 0 #171717</div>
                <div className="text-xs text-[#888780]">hover 状态位移反馈，赋予生动机械触感</div>
              </div>

              <div className="p-4 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[8px_8px_0_#171717] -translate-x-1 -translate-y-1 ring-2 ring-[#FFD84D]">
                <div className="font-bold text-xs font-mono text-[#171717] mb-1">激活/聚焦硬阴影</div>
                <div className="text-xs font-mono text-[#5F5E5A] mb-2">8px 8px 0 #171717</div>
                <div className="text-xs text-[#888780]">模态框、选中高亮卡片或当前编辑焦点</div>
              </div>

              <div className="p-4 bg-[#EDE8DC] border-2 border-[#171717] rounded-xl shadow-none">
                <div className="font-bold text-xs font-mono text-[#171717] mb-1">按压/静态贴地</div>
                <div className="text-xs font-mono text-[#5F5E5A] mb-2">0 0 0 (Shadow None)</div>
                <div className="text-xs text-[#888780]">active 鼠标按下瞬态，或 disabled 禁用完全退行</div>
              </div>
            </div>
          </section>
        )}

        {/* 3. Typography, Badges & Protocol Chips */}
        {isMatch(['badge', '徽章', '协议', 'protocol', 'chip', '芯片', 'github', 'url', '指示灯']) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4" />
                <h3 className="text-base font-bold tracking-tight uppercase">
                  3. 资产分类徽章与协议芯片 · Badges & Protocol Chips
                </h3>
              </div>
              <span className="text-xs text-[#5F5E5A] font-mono">9 种严格区分的语义色彩 · 4 类入口协议</span>
            </div>

            <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] space-y-5">
              {/* Type Badges */}
              <div>
                <h4 className="text-xs font-mono font-bold text-[#5F5E5A] uppercase tracking-wider mb-2.5">
                  标准资产分类徽章 (V4Badge)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {allTypes.map((t) => (
                    <div
                      key={t}
                      className="flex items-center justify-between p-2.5 bg-[#FBF7EF] border border-[#171717] rounded-lg shadow-[1px_1px_0_#171717]"
                    >
                      <V4Badge type={t} />
                      <span className="font-mono text-[10px] text-[#5F5E5A] uppercase font-bold">{t}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Protocol Chips Showcase */}
              <div className="pt-4 border-t border-[#EDE8DC]">
                <h4 className="text-xs font-mono font-bold text-[#5F5E5A] uppercase tracking-wider mb-2.5">
                  入口协议芯片规范 (Entry Protocol Chips)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {protocolList.map((p) => (
                    <div
                      key={p.protocol}
                      className="p-3 bg-[#FBF7EF] border border-[#171717] rounded-lg space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#FFFFFF] border border-[#171717] rounded text-xs font-bold font-mono">
                          {p.icon}
                          <span>{p.label}</span>
                        </span>
                        <span className="text-[10px] font-mono text-[#5F5E5A]">{p.protocol}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#171717] truncate bg-[#FFFFFF] p-1.5 border border-[#EDE8DC] rounded">
                        {p.example}
                      </div>
                      <div className="text-[10px] text-[#888780]">{p.actionDesc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Indicatorless Card Principle Banner */}
              <div className="p-3.5 bg-[#FFF9E6] border-2 border-[#171717] rounded-xl flex items-start gap-3">
                <Info className="w-5 h-5 text-[#E65100] shrink-0 mt-0.5" />
                <div className="text-xs text-[#171717] space-y-1">
                  <div className="font-bold">设计准则更新：卡片全面取消冗余指示灯</div>
                  <div className="text-[#5F5E5A] leading-relaxed">
                    在最新版本中，主网格资产卡片与置顶卡片已全面剥离右上角状态指示灯（StatusDot）。卡片顶栏仅保留纯净的资产分类徽章与置顶标记，将注意力全面聚焦于资产名称、协议入口与标签，杜绝不必要的静态视觉噪点。
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Interactive Components: Button, Tag, Input, Filter */}
        {isMatch(['button', 'tag', 'input', 'filter', '按钮', '标签', '输入框', '分类', '交互']) && (
          <section id="section-components" className="space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4" />
                <h3 className="text-base font-bold tracking-tight uppercase">
                  4. 交互组件库 · Interactive Controls
                </h3>
              </div>
              <span className="text-xs text-[#5F5E5A] font-mono">多态交互即时响应 · 统一机械反馈</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Buttons Showcase */}
              <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] space-y-4">
                <h4 className="text-xs font-mono font-bold text-[#5F5E5A] uppercase tracking-wider">
                  按钮组件 (V4Button)
                </h4>
                <div className="flex flex-wrap gap-2.5">
                  <V4Button variant="yellow" size="md">
                    黄色重点
                  </V4Button>
                  <V4Button variant="default" size="md">
                    标准白色
                  </V4Button>
                  <V4Button variant="ghost" size="md">
                    透明幽灵
                  </V4Button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#EDE8DC]">
                  <V4Button variant="yellow" size="sm">
                    小型黄色 (sm)
                  </V4Button>
                  <V4Button variant="default" size="sm">
                    小型默认
                  </V4Button>
                  <V4Button variant="default" size="sm" disabled>
                    禁用状态
                  </V4Button>
                </div>
              </div>

              {/* Tags Showcase */}
              <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] space-y-4">
                <h4 className="text-xs font-mono font-bold text-[#5F5E5A] uppercase tracking-wider">
                  标签筛选与标签云 (V4Tag)
                </h4>
                <div className="flex flex-wrap gap-2">
                  <V4Tag
                    label="All 全部"
                    count={24}
                    active={activeTag === 'all'}
                    onClick={() => setActiveTag('all')}
                  />
                  <V4Tag
                    label="React"
                    count={8}
                    active={activeTag === 'react'}
                    onClick={() => setActiveTag('react')}
                  />
                  <V4Tag
                    label="DevOps"
                    count={5}
                    active={activeTag === 'devops'}
                    onClick={() => setActiveTag('devops')}
                  />
                  <V4Tag
                    label="Database"
                    count={3}
                    active={activeTag === 'db'}
                    onClick={() => setActiveTag('db')}
                  />
                  <V4Tag label="Disabled" disabled />
                </div>
                <p className="text-xs text-[#888780] font-mono">
                  当前选中标签: <span className="font-bold text-[#171717]">#{activeTag}</span>
                </p>
              </div>

              {/* Inputs Showcase */}
              <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] space-y-4">
                <h4 className="text-xs font-mono font-bold text-[#5F5E5A] uppercase tracking-wider">
                  搜索与输入框 (V4Input)
                </h4>
                <V4Input
                  icon={<Search className="w-4 h-4" />}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onClear={() => setInputValue('')}
                  kbdShortcut="⌘K"
                  placeholder="键入关键字过滤..."
                />
                <V4Input disabled value="只读或被锁定的输入框" />
              </div>
            </div>

            {/* Category Filter Component Live Showcase */}
            <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-[#5F5E5A] uppercase tracking-wider">
                  分类平铺筛选栏 (V4CategoryFilter)
                </h4>
                <span className="text-xs font-mono text-[#5F5E5A]">支持全局键盘方向快捷键轮转</span>
              </div>
              <div className="p-2 bg-[#FBF7EF] border-2 border-[#171717] rounded-xl">
                <V4CategoryFilter
                  selectedCategory={demoCategory}
                  onSelectCategory={setDemoCategory}
                  categoryCounts={{
                    all: 36,
                    project: 12,
                    tool: 8,
                    web: 7,
                    learning: 5,
                    reference: 4,
                  }}
                />
              </div>
            </div>
          </section>
        )}

        {/* 5. Resource Cards Matrix (Small, Wide, Large, Banner) */}
        {isMatch(['card', '卡片', '尺寸', 'size', 'matrix', 'small', 'wide', 'large', 'banner', '网格']) && (
          <section id="section-cards" className="space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4" />
                <h3 className="text-base font-bold tracking-tight uppercase">
                  5. 卡片四种尺寸规范 · Card Sizes & Layout
                </h3>
              </div>
              <span className="text-xs text-[#5F5E5A] font-mono">Small (2) · Wide (4) · Large (4x2) · Banner (6)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-6">
              {/* Small Card (2 cols) */}
              <div className="col-span-1 sm:col-span-1 lg:col-span-2 flex flex-col gap-2">
                <div className="text-xs font-mono font-bold text-[#5F5E5A] px-1 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[#171717]">
                    <span className="w-2 h-2 rounded-full bg-[#FFD84D] border border-[#171717]" />
                    Small (2 Cols 标准单元)
                  </span>
                  <span className="text-[10px] font-mono bg-[#EDE8DC] border border-[#171717] px-1.5 py-0.5 rounded shadow-[1px_1px_0_#171717]">
                    高度: 192px
                  </span>
                </div>
                <div className="h-[192px] w-full">
                  <V4ResourceCard
                    object={sampleCardSmall}
                    isOwner={true}
                    onSelect={(obj) => setSelectedCardId(obj.id)}
                  />
                </div>
              </div>

              {/* Wide Card (4 cols) */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex flex-col gap-2">
                <div className="text-xs font-mono font-bold text-[#5F5E5A] px-1 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[#171717]">
                    <span className="w-2 h-2 rounded-full bg-[#FFD84D] border border-[#171717]" />
                    Wide (4 Cols 双倍宽卡片)
                  </span>
                  <span className="text-[10px] font-mono bg-[#EDE8DC] border border-[#171717] px-1.5 py-0.5 rounded shadow-[1px_1px_0_#171717]">
                    高度: 192px
                  </span>
                </div>
                <div className="h-[192px] w-full">
                  <V4ResourceCard
                    object={sampleCardWide}
                    isOwner={true}
                    onSelect={(obj) => setSelectedCardId(obj.id)}
                  />
                </div>
              </div>

              {/* Large Card (4 cols x 2 rows) */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-4 flex flex-col gap-2">
                <div className="text-xs font-mono font-bold text-[#5F5E5A] px-1 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[#171717]">
                    <span className="w-2 h-2 rounded-full bg-[#FFD84D] border border-[#171717]" />
                    Large (4 Cols × 2 Rows 大尺寸)
                  </span>
                  <span className="text-[10px] font-mono bg-[#EDE8DC] border border-[#171717] px-1.5 py-0.5 rounded shadow-[1px_1px_0_#171717]">
                    高度: 396px
                  </span>
                </div>
                <div className="h-[396px] w-full">
                  <V4ResourceCard
                    object={sampleCardLarge}
                    isOwner={true}
                    onSelect={(obj) => setSelectedCardId(obj.id)}
                  />
                </div>
              </div>

              {/* Aside Spec Explainer (2 cols) */}
              <div className="col-span-1 sm:col-span-1 lg:col-span-2 flex flex-col gap-2">
                <div className="text-xs font-mono font-bold text-[#5F5E5A] px-1 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[#171717]">
                    <span className="w-2 h-2 rounded-full bg-[#A9E5C3] border border-[#171717]" />
                    排版规格防溢出准则
                  </span>
                  <span className="text-[10px] font-mono bg-[#EDE8DC] border border-[#171717] px-1.5 py-0.5 rounded shadow-[1px_1px_0_#171717]">
                    规范定义
                  </span>
                </div>
                <div className="h-[396px] w-full bg-[#FFFFFF] border-2 border-[#171717] rounded-xl p-5 shadow-[4px_4px_0_#171717] flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-[#171717] mb-2">卡片排版防溢出准则</h4>
                    <ul className="text-xs text-[#5F5E5A] space-y-2 leading-relaxed">
                      <li className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 shrink-0" />
                        <span>
                          <strong>Small:</strong> 显示标题与协议 Chip，省略正文摘要。
                        </span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 shrink-0" />
                        <span>
                          <strong>Wide:</strong> 单行截断描述 (line-clamp-1)。
                        </span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 shrink-0" />
                        <span>
                          <strong>Large:</strong> 双行描述 (line-clamp-2) 并展示完整标签 Chips。
                        </span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 shrink-0" />
                        <span>
                          <strong>Banner:</strong> 6 列通栏扩展，全景横向展示。
                        </span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 shrink-0" />
                        <span>
                          <strong>高度对齐:</strong> 2行单元高度 192px，4行单元高度 396px，杜绝重叠。
                        </span>
                      </li>
                    </ul>
                  </div>
                  <div className="p-3 bg-[#FBF7EF] border border-[#171717] rounded-lg text-xs font-mono">
                    演示卡片 ID: <span className="font-bold text-[#171717]">{selectedCardId}</span>
                  </div>
                </div>
              </div>

              {/* Banner Card (6 cols) */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-6 flex flex-col gap-2">
                <div className="text-xs font-mono font-bold text-[#5F5E5A] px-1 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 text-[#171717]">
                    <span className="w-2 h-2 rounded-full bg-[#FFD84D] border border-[#171717]" />
                    Banner (6 Cols 全宽通栏卡片)
                  </span>
                  <span className="text-[10px] font-mono bg-[#EDE8DC] border border-[#171717] px-1.5 py-0.5 rounded shadow-[1px_1px_0_#171717]">
                    高度: 192px
                  </span>
                </div>
                <div className="h-[192px] w-full">
                  <V4ResourceCard
                    object={sampleCardBanner}
                    isOwner={true}
                    onSelect={(obj) => setSelectedCardId(obj.id)}
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 6. Goals & Milestone System (阶段目标与复盘规范) */}
        {isMatch(['goal', '目标', 'milestone', '复盘', 'okr', '完成', '已达成', '进行中']) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <h3 className="text-base font-bold tracking-tight uppercase">
                  6. 阶段目标与复盘体系 · Goals & Milestones
                </h3>
              </div>
              <span className="text-xs text-[#5F5E5A] font-mono">状态流转 · 关联入口资产 · 结构化复盘</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* In Progress Goal Showcase */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono px-1">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#171717]">
                    <Clock className="w-3.5 h-3.5 text-[#E65100]" />
                    状态示例 1：进行中目标 (In Progress)
                  </span>
                  <span className="text-[#5F5E5A]">P0 核心优先级</span>
                </div>
                <GoalCard
                  goal={sampleGoalInProgress}
                  isOwner={true}
                  editMode={false}
                  onToggleComplete={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onNavigateToResource={() => {}}
                />
              </div>

              {/* Completed Goal Showcase with Review */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono px-1">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#171717]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
                    状态示例 2：已达成目标与复盘记录 (Completed)
                  </span>
                  <span className="text-[#5F5E5A]">自动展示完成复盘笔记</span>
                </div>
                <GoalCard
                  goal={sampleGoalCompleted}
                  isOwner={true}
                  editMode={false}
                  onToggleComplete={() => {}}
                  onEdit={() => {}}
                  onDelete={() => {}}
                  onNavigateToResource={() => {}}
                />
              </div>
            </div>
          </section>
        )}

        {/* 7. Memos & Quick Capture (备忘录随想与极速记录规范) */}
        {isMatch(['memo', 'memos', '备忘', '备忘录', '便签', '随手记', '速记']) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                <h3 className="text-base font-bold tracking-tight uppercase">
                  7. 备忘录体系与极速记录 · Memos & Quick Capture
                </h3>
              </div>
              <span className="text-xs text-[#5F5E5A] font-mono">3~5秒捕获灵感 · 无冗余假大屏 · 单级即时编辑</span>
            </div>

            <div className="p-4 bg-[#FFF9E6] border-2 border-[#171717] rounded-xl text-xs font-mono text-[#171717] leading-relaxed">
              <span className="font-bold">页面总体流向原则：</span>
              Header → 搜索栏 → 快速记录区 → 状态筛选 → 常用标签 → Memo 卡片列表。
              <strong>严禁在备忘录放置虚假大数据看板或多余的宣传 Hero Banner</strong>，首屏必须直奔灵感捕捉。点击卡片直接展开居中大型编辑弹层，免去查看模式与编辑模式之间的来回切换。
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Pinned Memo Showcase */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono px-1">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#171717]">
                    <Pin className="w-3.5 h-3.5 text-[#B45309]" />
                    卡片示例 1：重要置顶备忘 (Pinned Memo)
                  </span>
                  <span className="text-[#B45309] font-bold">优先排序置顶</span>
                </div>
                <MemoCard
                  memo={sampleMemoPinned}
                  onClick={() => {}}
                  onTogglePin={() => {}}
                  onToggleArchive={() => {}}
                  onDeleteRequest={() => {}}
                  onTagClick={() => {}}
                />
              </div>

              {/* Normal Memo Showcase */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-mono px-1">
                  <span className="inline-flex items-center gap-1.5 font-bold text-[#171717]">
                    <Clock className="w-3.5 h-3.5 text-[#5F5E5A]" />
                    卡片示例 2：普通随手记录 (Standard Memo)
                  </span>
                  <span className="text-[#5F5E5A]">按更新时间倒序</span>
                </div>
                <MemoCard
                  memo={sampleMemoNormal}
                  onClick={() => {}}
                  onTogglePin={() => {}}
                  onToggleArchive={() => {}}
                  onDeleteRequest={() => {}}
                  onTagClick={() => {}}
                />
              </div>
            </div>
          </section>
        )}

        {/* 8. Tab Anti-Clipping Standards (状态筛选 Tab 防裁剪铁律) */}
        {isMatch(['tab', 'clip', 'overflow', 'filter', '裁剪', '筛选', '阴影', '微位移']) && (
          <section id="section-layout" className="space-y-4 scroll-mt-20">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4" />
                <h3 className="text-base font-bold tracking-tight uppercase">
                  8. 状态筛选 Tab 防裁剪铁律 · Tab Anti-Clipping
                </h3>
              </div>
              <span className="text-xs text-[#5F5E5A] font-mono">Padding Cushion · Icon shrink-0 · Whitespace</span>
            </div>

            <div className="p-4 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] space-y-3">
              <div className="text-xs font-mono font-bold text-[#171717]">
                防裁剪演示交互（容器预留 p-1 -m-1，图标 shrink-0，文字 whitespace-nowrap leading-none，统一高度 h-9 sm:h-10）：
              </div>

              {/* Demo tabs */}
              <div className="flex items-center gap-2.5 flex-wrap p-1 -m-1">
                <button
                  type="button"
                  className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl border-2 border-[#171717] inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-bold whitespace-nowrap bg-[#FFD84D] text-[#171717] shadow-[3px_3px_0_#171717] -translate-y-0.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-[#171717]" />
                  <span className="leading-none">全部</span>
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] text-[11px] font-mono font-bold rounded-md border border-[#171717] bg-[#FFFFFF] text-[#171717] leading-none shrink-0">
                    5
                  </span>
                </button>

                <button
                  type="button"
                  className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl border-2 border-[#171717] inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-bold whitespace-nowrap bg-[#FFFFFF] text-[#5F5E5A] hover:text-[#171717] shadow-[3px_3px_0_#171717] hover:-translate-y-0.5 cursor-pointer"
                >
                  <Pin className="w-4 h-4 shrink-0 text-[#73726C]" />
                  <span className="leading-none">置顶</span>
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] text-[11px] font-mono font-bold rounded-md border border-[#171717] bg-[#EDE8DC] text-[#171717] leading-none shrink-0">
                    2
                  </span>
                </button>

                <button
                  type="button"
                  className="h-9 sm:h-10 px-3.5 sm:px-4 rounded-xl border-2 border-[#171717] inline-flex items-center gap-2 text-xs sm:text-sm font-mono font-bold whitespace-nowrap bg-[#FFFFFF] text-[#5F5E5A] hover:text-[#171717] shadow-[3px_3px_0_#171717] hover:-translate-y-0.5 cursor-pointer"
                >
                  <Clock className="w-4 h-4 shrink-0 text-[#73726C]" />
                  <span className="leading-none">最近</span>
                  <span className="inline-flex items-center justify-center px-1.5 py-0.5 min-w-[20px] text-[11px] font-mono font-bold rounded-md border border-[#171717] bg-[#EDE8DC] text-[#171717] leading-none shrink-0">
                    5
                  </span>
                </button>
              </div>

              <div className="text-[11px] font-mono text-[#5F5E5A] pt-1">
                ✓ 彻底杜绝向上浮起与右下 3px 硬阴影在横向滚动或内边距紧缩容器中被剪切破损的问题。
              </div>
            </div>
          </section>
        )}

        {/* 9. Architecture & Permissions (权限与视图体系) */}
        {isMatch(['auth', 'permission', 'owner', 'guest', '权限', '访客', '管理员', '架构', '视图']) && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                <h3 className="text-base font-bold tracking-tight uppercase">
                  9. 页面架构与权限模式 · Architecture & Authorization
                </h3>
              </div>
              <span className="text-xs text-[#5F5E5A] font-mono">访客只读 · 管理员授权 · 详情弹窗与全页档案</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#171717]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]" />
                  管理员模式 (Admin Mode)
                </div>
                <p className="text-xs text-[#5F5E5A] leading-relaxed">
                  通过输入管理员授权口令解锁。享有资产的增删改查、尺寸切换、全局拖拽网格重排、置顶切换以及阶段目标结转。
                </p>
              </div>

              <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#171717]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#888780]" />
                  访客只读模式 (Guest Read-Only)
                </div>
                <p className="text-xs text-[#5F5E5A] leading-relaxed">
                  未授权时的安全呈现状态。隐藏所有破坏性与编辑按钮，仅保留高频检索、分类过滤、详情阅读与协议入口跳转。
                </p>
              </div>

              <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] space-y-2">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#171717]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#FFD84D]" />
                  双层详情规范 (Modal & Page)
                </div>
                <p className="text-xs text-[#5F5E5A] leading-relaxed">
                  提供模态弹窗（DetailModal，快速聚焦）与独立资源档案页（ResourceDetailPage，完整历史记录与深层笔记）双层触达。
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Footer info */}
        <footer className="pt-8 pb-12 border-t-2 border-[#171717] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#5F5E5A]">
          <div>Neo-Brutalism v4 · Personal Workbench Design System</div>
          <button
            type="button"
            onClick={onBackToWorkbench}
            className="v4-btn v4-btn-yellow px-4 py-2 font-bold flex items-center gap-2"
          >
            <span>返回工作台主页</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </footer>
      </main>
    </div>
  );
};
