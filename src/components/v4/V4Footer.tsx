import React from 'react';
import { Shield, GitBranch, Cpu } from 'lucide-react';
import { WorkbenchLogo } from './WorkbenchLogo';

export const V4Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-[#171717]/15 bg-[#FFFFFF] mt-16 py-6 px-4 sm:px-8">
      <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#5F5E5A]">
        {/* Left: Branding */}
        <div className="flex items-center gap-2.5 shrink-0">
          <WorkbenchLogo className="w-6 h-6" />
          <div className="whitespace-nowrap flex items-center">
            <span className="font-bold text-[#171717]">Personal Workbench</span>
            <span className="mx-2 text-[#888780]">·</span>
            <span className="text-[#888780]">高效个人资产与目标工作台</span>
          </div>
        </div>

        {/* Center: System specs */}
        <div className="flex items-center gap-3 lg:gap-4 flex-wrap justify-center text-[11px] font-mono">
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Cpu className="w-3.5 h-3.5 shrink-0" /> Client Engine: React 19 + PGlite
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <GitBranch className="w-3.5 h-3.5 shrink-0" /> Branch: main
          </span>
          <span className="inline-flex items-center gap-1 whitespace-nowrap">
            <Shield className="w-3.5 h-3.5 shrink-0" /> Local Storage Persistent
          </span>
        </div>

        {/* Right: Quick shortcuts tips */}
        <div className="flex items-center gap-3 shrink-0 whitespace-nowrap text-xs font-mono text-[#5F5E5A]">
          <span className="inline-flex items-center gap-1.5 select-none" title="快捷键提示：⌘K / Ctrl+K 聚焦搜索">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#EDE8DC] border border-[#171717] rounded shadow-[1px_1px_0_#171717] text-[#171717]">
              ⌘K
            </kbd>
            <span>全局搜索</span>
          </span>
          <span className="inline-flex items-center gap-1.5 select-none" title="快捷键提示：ESC 清空筛选或关闭模态框">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[#EDE8DC] border border-[#171717] rounded shadow-[1px_1px_0_#171717] text-[#171717]">
              ESC
            </kbd>
            <span>关闭/清空</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
