import React, { useState } from 'react';
import {
  ArrowLeft,
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
} from 'lucide-react';
import { V4Button } from './v4/V4Button';
import { V4Tag } from './v4/V4Tag';
import { V4Input } from './v4/V4Input';
import { V4Badge } from './v4/V4Badge';
import { V4StatusDot } from './v4/V4StatusDot';
import { V4Section } from './v4/V4Section';
import { V4ResourceCard } from './v4/V4ResourceCard';
import { WorkbenchObject, TYPE_VISUAL_MAP, ObjectType } from '../types';

interface DesignSystemPageProps {
  onBackToWorkbench: () => void;
}

export const DesignSystemPage: React.FC<DesignSystemPageProps> = ({ onBackToWorkbench }) => {
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string>('react');
  const [inputValue, setInputValue] = useState<string>('搜索数字资产...');
  const [selectedCardId, setSelectedCardId] = useState<string>('ds-card-1');

  const copyToClipboard = (text: string, tokenName: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedToken(tokenName);
    setTimeout(() => setCopiedToken(null), 1500);
  };

  // Mock Objects for Card Demonstrations
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
    summary: 'Mac Studio M2 Ultra 私有化部署的大模型推理服务 API，支持 OpenAI 兼容格式。',
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
    title: 'PostgreSQL 核心元数据库 (PGlite / Drizzle)',
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

  // Token tables
  const baseColors = [
    { name: 'paper', hex: '#FBF7EF', desc: '全局底色 (纸质基底)' },
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
    { name: 'mint', hex: '#A9E5C3', desc: '监控/健康/正常运行' },
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

  return (
    <div className="w-full min-h-screen bg-[#FBF7EF] text-[#171717]">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#FFFFFF] border-b-2 border-[#171717] px-4 sm:px-8 py-3.5 shadow-[0_2px_0_#EDE8DC]">
        <div className="max-w-[1200px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToWorkbench}
              className="v4-btn v4-btn-default px-3 py-1.5 text-xs flex items-center gap-1.5"
              title="返回工作台"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>返回工作台</span>
            </button>
            <div className="h-5 w-[2px] bg-[#EDE8DC]" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#171717]">
                  Neo-Brutalism v4 设计规范库
                </h1>
                <span className="px-2 py-0.5 text-xs font-mono font-bold bg-[#FFD84D] border border-[#171717] rounded shadow-[2px_2px_0_#171717]">
                  权威标准
                </span>
              </div>
              <p className="text-xs text-[#5F5E5A] font-mono">
                /design-system · 纯客户端硬编码独立校验预览
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-mono font-bold bg-[#FBF7EF] border border-[#171717] rounded-md flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#A9E5C3] border border-[#171717]" />
              8 类核心组件 · 14 组 Tokens
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1200px] mx-auto px-4 sm:px-8 py-8 space-y-12">
        {/* Intro Banner */}
        <section className="bg-[#FFFFFF] border-2 border-[#171717] rounded-xl p-6 shadow-[6px_6px_0_#171717]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 text-[#171717] fill-[#FFD84D]" />
                <h2 className="text-xl font-bold tracking-tight">
                  Personal Workbench · 视觉规范总览
                </h2>
              </div>
              <p className="text-sm text-[#5F5E5A] max-w-2xl leading-relaxed">
                遵循「粗描边、硬阴影、清晰层级、零渐变、零玻璃拟态、高可读性」的 Neo-Brutalism
                v4 体系。拒绝无意义的装饰与冗余卡片，专为极客与高生产力数字工作者打造。
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <div className="px-3 py-1.5 bg-[#FBF7EF] border-2 border-[#171717] rounded-lg text-xs font-mono font-bold">
                GRID: 6 列响应式系统
              </div>
              <div className="px-3 py-1.5 bg-[#FFD84D] border-2 border-[#171717] rounded-lg text-xs font-mono font-bold shadow-[2px_2px_0_#171717]">
                BORDER: 2px 硬笔刷
              </div>
            </div>
          </div>
        </section>

        {/* 1. Design Tokens: Colors */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <h3 className="text-base font-bold tracking-tight uppercase">
                1. 颜色体系 · Color Tokens
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

        {/* 2. Shadows & Borders */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
            <div className="flex items-center gap-2">
              <Box className="w-4 h-4" />
              <h3 className="text-base font-bold tracking-tight uppercase">
                2. 阴影与圆角 · Shadows & Radii
              </h3>
            </div>
            <span className="text-xs text-[#5F5E5A] font-mono">硬边缘 0 模糊扩散度</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717]">
              <div className="font-bold text-xs font-mono text-[#171717] mb-1">默认卡片硬阴影</div>
              <div className="text-xs font-mono text-[#5F5E5A] mb-2">4px 4px 0 #171717</div>
              <div className="text-xs text-[#888780]">应用于绝大部分静态工作台卡片与常态容器</div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[6px_6px_0_#171717] -translate-x-0.5 -translate-y-0.5">
              <div className="font-bold text-xs font-mono text-[#171717] mb-1">悬停提升硬阴影</div>
              <div className="text-xs font-mono text-[#5F5E5A] mb-2">6px 6px 0 #171717</div>
              <div className="text-xs text-[#888780]">hover 状态位移反馈，赋予生动机械触感</div>
            </div>

            <div className="p-4 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[8px_8px_0_#171717] -translate-x-1 -translate-y-1">
              <div className="font-bold text-xs font-mono text-[#171717] mb-1">激活/聚焦硬阴影</div>
              <div className="text-xs font-mono text-[#5F5E5A] mb-2">8px 8px 0 #171717</div>
              <div className="text-xs text-[#888780]">模态框、激活选择项或全局突出重点模块</div>
            </div>

            <div className="p-4 bg-[#EDE8DC] border-2 border-[#171717] rounded-xl shadow-none">
              <div className="font-bold text-xs font-mono text-[#171717] mb-1">按压/静态贴地</div>
              <div className="text-xs font-mono text-[#5F5E5A] mb-2">0 0 0 (Shadow None)</div>
              <div className="text-xs text-[#888780]">active 按下或 disabled 禁用状态完全消退</div>
            </div>
          </div>
        </section>

        {/* 3. Typography & Badges */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <h3 className="text-base font-bold tracking-tight uppercase">
                3. 数字资产类型徽章 · V4Badge & StatusDot
              </h3>
            </div>
            <span className="text-xs text-[#5F5E5A] font-mono">9 种严格区分的语义色彩</span>
          </div>

          <div className="p-5 bg-[#FFFFFF] border-2 border-[#171717] rounded-xl shadow-[4px_4px_0_#171717] space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {allTypes.map((t) => (
                <div
                  key={t}
                  className="flex items-center justify-between p-2.5 bg-[#FBF7EF] border border-[#171717] rounded-lg"
                >
                  <V4Badge type={t} />
                  <span className="font-mono text-[10px] text-[#5F5E5A]">{t}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#EDE8DC] flex flex-wrap items-center gap-6">
              <div className="text-xs font-bold text-[#171717]">运行健康状态 (V4StatusDot):</div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <V4StatusDot status="ok" />
                <span>ok (正常运行 · 绿)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <V4StatusDot status="warn" />
                <span>warn (需维护 · 橙)</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-mono">
                <V4StatusDot status="off" />
                <span>off (已离线 · 灰)</span>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Interactive Components: Button, Tag, Input */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4" />
              <h3 className="text-base font-bold tracking-tight uppercase">
                4. 交互组件库 · Interactive Controls
              </h3>
            </div>
            <span className="text-xs text-[#5F5E5A] font-mono">多态交互即时响应</span>
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
                标签筛选 (V4Tag)
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
                当前选中标签: <span className="font-bold text-[#171717]">{activeTag}</span>
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
        </section>

        {/* 5. Resource Cards Matrix (Small, Wide, Large, Banner) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <h3 className="text-base font-bold tracking-tight uppercase">
                5. 卡片四种尺寸规范 · Card Sizes & Layout
              </h3>
            </div>
            <span className="text-xs text-[#5F5E5A] font-mono">Small · Wide · Large · Banner</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Small Card (2 cols) */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-2 min-h-[192px]">
              <div className="text-xs font-mono font-bold text-[#5F5E5A] mb-1.5 flex items-center justify-between">
                <span>Small (2 Cols)</span>
                <span className="text-[10px] bg-[#EDE8DC] px-1 rounded">h: 192px</span>
              </div>
              <V4ResourceCard
                object={sampleCardSmall}
                isOwner={true}
                editMode={false}
                onSelect={(obj) => setSelectedCardId(obj.id)}
              />
            </div>

            {/* Wide Card (4 cols) */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 min-h-[192px]">
              <div className="text-xs font-mono font-bold text-[#5F5E5A] mb-1.5 flex items-center justify-between">
                <span>Wide (4 Cols)</span>
                <span className="text-[10px] bg-[#EDE8DC] px-1 rounded">h: 192px</span>
              </div>
              <V4ResourceCard
                object={sampleCardWide}
                isOwner={true}
                editMode={false}
                onSelect={(obj) => setSelectedCardId(obj.id)}
              />
            </div>

            {/* Large Card (4 cols x 2 rows = min-h-[396px]) */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-4 min-h-[396px]">
              <div className="text-xs font-mono font-bold text-[#5F5E5A] mb-1.5 flex items-center justify-between">
                <span>Large (4 Cols × 2 Rows)</span>
                <span className="text-[10px] bg-[#EDE8DC] px-1 rounded">h: 396px</span>
              </div>
              <V4ResourceCard
                object={sampleCardLarge}
                isOwner={true}
                editMode={false}
                onSelect={(obj) => setSelectedCardId(obj.id)}
              />
            </div>

            {/* Aside Spec Explainer (2 cols) */}
            <div className="col-span-1 sm:col-span-1 lg:col-span-2 min-h-[396px] bg-[#FFFFFF] border-2 border-[#171717] rounded-xl p-5 shadow-[4px_4px_0_#171717] flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-bold text-[#171717] mb-2">卡片排版防溢出准则</h4>
                <ul className="text-xs text-[#5F5E5A] space-y-2 leading-relaxed">
                  <li className="flex items-start gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#171717] mt-1.5 shrink-0" />
                    <span>
                      <strong>Small:</strong> 仅显示标题与 URL Chip，省略正文摘要。
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
                      <strong>高度对齐:</strong> 2行单元高度 192px，4行单元高度 396px，杜绝重叠。
                    </span>
                  </li>
                </ul>
              </div>
              <div className="p-3 bg-[#FBF7EF] border border-[#171717] rounded-lg text-xs font-mono">
                当前选中卡片 ID: <span className="font-bold text-[#171717]">{selectedCardId}</span>
              </div>
            </div>

            {/* Banner Card (6 cols) */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-6 min-h-[192px]">
              <div className="text-xs font-mono font-bold text-[#5F5E5A] mb-1.5 flex items-center justify-between">
                <span>Banner (6 Cols - 全宽横幅通栏)</span>
                <span className="text-[10px] bg-[#EDE8DC] px-1 rounded">h: 192px</span>
              </div>
              <V4ResourceCard
                object={sampleCardBanner}
                isOwner={true}
                editMode={false}
                onSelect={(obj) => setSelectedCardId(obj.id)}
              />
            </div>
          </div>
        </section>

        {/* 6. Section Containers (V4Section) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b-2 border-[#171717] pb-2">
            <div className="flex items-center gap-2">
              <Square className="w-4 h-4" />
              <h3 className="text-base font-bold tracking-tight uppercase">
                6. 区块容器规范 · V4Section
              </h3>
            </div>
            <span className="text-xs text-[#5F5E5A] font-mono">置顶 (PINNED) · 全部 (ALL)</span>
          </div>

          <div className="bg-[#FFFFFF] border-2 border-[#171717] rounded-xl p-4 shadow-[4px_4px_0_#171717]">
            <V4Section accent="pinned" title="示例区块：高频置顶服务" count={2}>
              <div className="p-4 bg-[#FBF7EF] border-2 border-[#171717] rounded-lg">
                <div className="text-xs font-bold font-mono">置顶网格子项 1</div>
                <div className="text-xs text-[#5F5E5A]">2列自适应网格</div>
              </div>
              <div className="p-4 bg-[#FBF7EF] border-2 border-[#171717] rounded-lg">
                <div className="text-xs font-bold font-mono">置顶网格子项 2</div>
                <div className="text-xs text-[#5F5E5A]">黄色强调标识</div>
              </div>
            </V4Section>
          </div>
        </section>

        {/* Footer info */}
        <footer className="pt-8 pb-12 border-t-2 border-[#171717] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#5F5E5A]">
          <div>Neo-Brutalism v4 · Personal Workbench Design System</div>
          <button
            type="button"
            onClick={onBackToWorkbench}
            className="v4-btn v4-btn-yellow px-4 py-2 font-bold flex items-center gap-2"
          >
            <span>进入工作台</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </footer>
      </main>
    </div>
  );
};
