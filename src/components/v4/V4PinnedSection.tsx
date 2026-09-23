import React from 'react';
import { WorkbenchObject, TYPE_VISUAL_MAP } from '../../types';
import { Pin, ArrowUpRight, Copy, Check } from 'lucide-react';
import { V4StatusDot } from './V4StatusDot';

interface V4PinnedSectionProps {
  pinnedObjects: WorkbenchObject[];
  onSelect: (obj: WorkbenchObject) => void;
}

export const V4PinnedSection: React.FC<V4PinnedSectionProps> = ({
  pinnedObjects,
  onSelect,
}) => {
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  if (pinnedObjects.length === 0) return null;

  const handleCopy = (e: React.MouseEvent, obj: WorkbenchObject) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(obj.targetUrl);
    setCopiedId(obj.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <section className="w-full md:w-[85%] lg:w-[80%] mx-auto px-4 sm:px-6 pt-6 pb-2">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-5 h-5 bg-[#FFD84D] border border-[#171717] rounded shadow-[2px_2px_0_#171717]">
            <Pin className="w-3 h-3 text-[#171717] fill-current" />
          </div>
          <h2 className="text-sm font-bold text-[#171717] tracking-tight">
            置顶高频快捷入口
          </h2>
        </div>
        <span className="text-xs font-mono font-semibold text-[#5F5E5A]">
          {pinnedObjects.length} 个核心直达
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {pinnedObjects.map((obj) => {
          const visual = TYPE_VISUAL_MAP[obj.type] || TYPE_VISUAL_MAP.generic;
          const isCopied = copiedId === obj.id;
          const isHttp = obj.targetUrl.startsWith('http');

          return (
            <div
              key={obj.id}
              onClick={() => onSelect(obj)}
              className="v4-card p-3 flex flex-col justify-between bg-[#FFFFFF] border-2 border-[#171717] rounded-xl hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#171717] transition-all cursor-pointer group"
            >
              <div>
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <span
                    className="px-1.5 py-0.5 text-[10px] font-mono font-bold rounded border border-[#171717]"
                    style={{ backgroundColor: visual.accentColor }}
                  >
                    {visual.label}
                  </span>
                  <V4StatusDot status={obj.status} />
                </div>

                <h3 className="font-bold text-sm text-[#171717] group-hover:text-black line-clamp-1 mb-1">
                  {obj.title}
                </h3>
                <p className="text-xs text-[#5F5E5A] line-clamp-1 mb-2 font-mono">
                  {obj.targetUrl}
                </p>
              </div>

              <div className="pt-2 border-t border-[#EDE8DC] flex items-center justify-between text-xs text-[#5F5E5A]">
                <button
                  type="button"
                  onClick={(e) => handleCopy(e, obj)}
                  className="flex items-center gap-1 hover:text-[#171717] font-mono text-[11px]"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-[#171717]" />
                      <span>已复制</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>复制</span>
                    </>
                  )}
                </button>

                {isHttp && (
                  <a
                    href={obj.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-0.5 font-bold hover:underline text-[#171717]"
                  >
                    <span>打开</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
