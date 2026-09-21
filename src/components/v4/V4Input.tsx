import React, { InputHTMLAttributes, ReactNode } from 'react';
import { X } from 'lucide-react';

interface V4InputProps extends InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
  kbdShortcut?: string;
  onClear?: () => void;
  containerClassName?: string;
}

export const V4Input: React.FC<V4InputProps> = ({
  icon,
  kbdShortcut,
  onClear,
  value,
  disabled,
  containerClassName = '',
  className = '',
  ...props
}) => {
  const showClear = Boolean(onClear && value && !disabled);

  return (
    <div
      className={`relative flex items-center bg-[#FFFFFF] border-2 border-[#171717] rounded-lg transition-all duration-120 ${
        disabled
          ? 'bg-[#EDE8DC] opacity-70 cursor-not-allowed border-[#888780]'
          : 'focus-within:shadow-[4px_4px_0_#171717] hover:border-[#171717]'
      } ${containerClassName}`}
    >
      {icon && <div className="pl-3 text-[#5F5E5A] pointer-events-none shrink-0">{icon}</div>}

      <input
        value={value}
        disabled={disabled}
        className={`w-full bg-transparent px-3 py-2 text-sm text-[#171717] placeholder:text-[#888780] font-medium outline-none disabled:cursor-not-allowed ${className}`}
        {...props}
      />

      <div className="flex items-center gap-1.5 pr-2.5 shrink-0">
        {showClear && (
          <button
            type="button"
            onClick={onClear}
            className="p-1 text-[#888780] hover:text-[#171717] hover:bg-[#EDE8DC] rounded transition-colors"
            title="清空"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {kbdShortcut && (
          <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#EDE8DC] border border-[#171717] rounded text-[#5F5E5A]">
            {kbdShortcut}
          </span>
        )}
      </div>
    </div>
  );
};
