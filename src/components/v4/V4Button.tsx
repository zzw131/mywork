import React, { ButtonHTMLAttributes, ReactNode } from 'react';

export type V4ButtonVariant = 'default' | 'yellow' | 'ghost';
export type V4ButtonSize = 'md' | 'sm';

interface V4ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: V4ButtonVariant;
  size?: V4ButtonSize;
  children: ReactNode;
  icon?: ReactNode;
}

export const V4Button: React.FC<V4ButtonProps> = ({
  variant = 'default',
  size = 'md',
  children,
  icon,
  disabled,
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-bold tracking-tight rounded-lg transition-all duration-120 select-none whitespace-nowrap border-2 border-[#171717] focus:outline-none';

  const sizeClasses = {
    md: 'px-4 py-2 text-sm gap-2',
    sm: 'px-3 py-1.5 text-xs gap-1.5',
  }[size];

  const variantClasses = {
    default: disabled
      ? 'bg-[#EDE8DC] text-[#888780] border-[#888780] shadow-none cursor-not-allowed'
      : 'bg-[#FFFFFF] text-[#171717] shadow-[4px_4px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#171717]',
    yellow: disabled
      ? 'bg-[#EDE8DC] text-[#888780] border-[#888780] shadow-none cursor-not-allowed'
      : 'bg-[#FFD84D] text-[#171717] shadow-[4px_4px_0_#171717] hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#171717] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0_#171717]',
    ghost: disabled
      ? 'bg-transparent text-[#888780] border-[#888780] shadow-none cursor-not-allowed'
      : 'bg-transparent text-[#171717] border-transparent hover:border-[#171717] hover:bg-[#EDE8DC] shadow-none active:bg-[#D5D0C5]',
  }[variant];

  return (
    <button
      disabled={disabled}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
