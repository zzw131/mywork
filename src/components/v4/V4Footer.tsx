import React from 'react';
import { Shield, GitBranch, Cpu } from 'lucide-react';
import { WorkbenchLogo } from './WorkbenchLogo';

export interface V4FooterProps {
  onOpenDesignSystem?: () => void;
}

export const V4Footer: React.FC<V4FooterProps> = ({ onOpenDesignSystem }) => {
  const handleOpenDesignSystem = (e: React.MouseEvent) => {
    e.preventDefault();
    if (onOpenDesignSystem) {
      onOpenDesignSystem();
    } else {
      try {
        window.history.pushState({ view: 'design-system' }, '', '/#design-system');
        window.dispatchEvent(new PopStateEvent('popstate'));
      } catch {
        window.location.hash = '#design-system';
      }
    }
  };

  return (
    <footer className="w-full border-t-2 border-[#171717] bg-[#FFFFFF] mt-16 py-6 px-4 sm:px-8">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#5F5E5A]">
        {/* Left: Branding & 规范库文字链接 */}
        <div className="flex items-center gap-2.5 shrink-0">
          <WorkbenchLogo className="w-6 h-6" />
          <div className="whitespace-nowrap flex items-center">
            <span className="font-bold text-[#171717]">Personal Workbench</span>
            <span className="mx-2 text-[#888780]">·</span>
            {/* 页面底部规范库文字链接 */}
            <a
              href="#design-system"
              onClick={handleOpenDesignSystem}
              className="text-[#171717] hover:text-[#B45309] font-bold underline underline-offset-4 cursor-pointer transition-colors"
              title="查看视觉与交互设计规范库"
            >
              规范库
            </a>
          </div>
        </div>

        {/* Center: System specs */}
        <div className="flex items-center gap-3 lg:gap-4 flex-wrap justify-center text-[11px] font-mono">
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Cpu className="w-3.5 h-3.5 shrink-0" /> Client Engine: React 19 + PGlite
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <GitBranch className="w-3.5 h-3.5 shrink-0" /> Branch: feature-v4-design-system
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Shield className="w-3.5 h-3.5 shrink-0" /> Schema: 11 Tables Checked
          </span>
        </div>

        {/* Right: Quick shortcuts tips */}
        <div className="flex items-center gap-3 shrink-0 whitespace-nowrap text-xs font-mono text-[#5F5E5A]">
          <span className="inline-flex items-center gap-1.5 select-none" title="快捷键提示：⌘K / Ctrl+K 搜索">
            <kbd className="font-bold font-mono bg-[#EDE8DC] text-[#171717] px-1.5 py-0.5 rounded text-[11px] leading-none">
              ⌘K
            </kbd>
            <span>搜索</span>
          </span>
          <span className="text-[#888780]">·</span>
          <span className="inline-flex items-center gap-1.5 select-none" title="快捷键提示：ESC 关闭弹窗或清空">
            <kbd className="font-bold font-mono bg-[#EDE8DC] text-[#171717] px-1.5 py-0.5 rounded text-[11px] leading-none">
              ESC
            </kbd>
            <span>关闭 / 清空</span>
          </span>
          <span className="text-[#888780]">·</span>
          <span className="inline-flex items-center gap-1.5 select-none" title="快捷键提示：Tab 切换分类">
            <kbd className="font-bold font-mono bg-[#EDE8DC] text-[#171717] px-1.5 py-0.5 rounded text-[11px] leading-none">
              Tab
            </kbd>
            <span>切换分类</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
