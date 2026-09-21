import React from 'react';
import { StatusType } from '../../types';

interface V4StatusDotProps {
  status: StatusType;
  className?: string;
}

export const V4StatusDot: React.FC<V4StatusDotProps> = ({ status, className = '' }) => {
  const colorClass =
    status === 'ok'
      ? 'bg-[#A9E5C3]'
      : status === 'warn'
      ? 'bg-[#FFD84D]'
      : 'bg-[#FFB4C6]';

  const title =
    status === 'ok'
      ? '运行正常 / 可访问'
      : status === 'warn'
      ? '待检查 / 超过30天未更新'
      : '已失效 / 离线';

  return (
    <span
      title={title}
      className={`inline-block w-2.5 h-2.5 rounded-full border-[1.5px] border-[#171717] ${colorClass} ${className}`}
    />
  );
};
