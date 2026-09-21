import React from 'react';
import { Terminal, Shield, GitBranch, Cpu, ArrowUpRight } from 'lucide-react';

export const V4Footer: React.FC = () => {
  return (
    <footer className="w-full border-t-2 border-[#171717] bg-[#FFFFFF] mt-16 py-8 px-4 sm:px-8">
      <div className="max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono text-[#5F5E5A]">
        {/* Left: Branding & philosophy */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-6 h-6 rounded bg-[#171717] text-[#FFFFFF] flex items-center justify-center font-bold text-xs shrink-0">
            PW
          </div>
          <div className="whitespace-nowrap">
            <span className="font-bold text-[#171717]">Personal Workbench</span>
            <span className="mx-2 text-[#888780]">·</span>
            <span className="text-[#5F5E5A]">Neo-Brutalism v4 Design System</span>
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

        {/* Right: Quick shortcuts (prevent text wrapping) */}
        <div className="flex items-center gap-2 shrink-0 whitespace-nowrap">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EDE8DC] border border-[#171717] rounded text-xs font-mono font-medium whitespace-nowrap select-none shadow-[1px_1px_0_#171717]">
            <kbd className="font-bold font-mono">⌘K</kbd>
            <span>搜索</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EDE8DC] border border-[#171717] rounded text-xs font-mono font-medium whitespace-nowrap select-none shadow-[1px_1px_0_#171717]">
            <kbd className="font-bold font-mono">ESC</kbd>
            <span>清空</span>
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#EDE8DC] border border-[#171717] rounded text-xs font-mono font-medium whitespace-nowrap select-none shadow-[1px_1px_0_#171717]">
            <kbd className="font-bold font-mono">Tab</kbd>
            <span>导航</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
