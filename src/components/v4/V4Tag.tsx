import React from 'react';

interface V4TagProps {
  label: string;
  count?: number;
  active?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const V4Tag: React.FC<V4TagProps> = ({
  label,
  count,
  active = false,
  disabled = false,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold rounded-md border-2 transition-all duration-120 select-none ${
        disabled
          ? 'bg-[#EDE8DC] text-[#888780] border-[#888780] cursor-not-allowed opacity-60'
          : active
          ? 'bg-[#FFD84D] text-[#171717] border-[#171717] shadow-[2px_2px_0_#171717] -translate-y-0.5'
          : 'bg-[#FFFFFF] text-[#5F5E5A] border-[#171717] hover:text-[#171717] hover:bg-[#FBF7EF] hover:border-[#171717]'
      } ${className}`}
    >
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`px-1 rounded text-[10px] font-semibold ${
            active ? 'bg-[#171717] text-[#FFD84D]' : 'bg-[#EDE8DC] text-[#5F5E5A]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
