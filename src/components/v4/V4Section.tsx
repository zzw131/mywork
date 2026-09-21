import React, { ReactNode } from 'react';

export type V4SectionAccent = 'pinned' | 'recent' | 'all';

interface V4SectionProps {
  accent: V4SectionAccent;
  title: string;
  count?: number;
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const V4Section: React.FC<V4SectionProps> = ({
  accent,
  title,
  count,
  aside,
  children,
  className = '',
}) => {
  const badgeConfig = {
    pinned: { label: '置顶', bg: '#FFD84D' },
    recent: { label: '最近', bg: '#A9E5C3' },
    all: { label: '全部', bg: '#C9B8FF' },
  }[accent];

  return (
    <section className={`w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-5 ${className}`}>
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-2 border-b-2 border-[#171717]">
        <div className="flex items-center gap-2.5">
          <span
            className="px-2 py-0.5 text-xs font-mono font-bold text-[#171717] border border-[#171717] rounded shadow-[2px_2px_0_#171717]"
            style={{ backgroundColor: badgeConfig.bg }}
          >
            {badgeConfig.label}
          </span>
          <h2 className="text-base md:text-lg font-bold text-[#171717] tracking-tight">
            {title}
          </h2>
          {count !== undefined && (
            <span className="text-xs font-mono font-semibold px-2 py-0.5 bg-[#EDE8DC] border border-[#171717] rounded-md text-[#5F5E5A]">
              {count} 项
            </span>
          )}
        </div>

        {aside && <div className="text-xs font-medium text-[#5F5E5A]">{aside}</div>}
      </div>

      {/* Grid content */}
      <div
        className={`grid gap-4 ${
          accent === 'pinned'
            ? 'grid-cols-1 md:grid-cols-2'
            : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
        }`}
      >
        {children}
      </div>
    </section>
  );
};
