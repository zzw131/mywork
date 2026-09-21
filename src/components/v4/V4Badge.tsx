import React from 'react';
import { ObjectType, TYPE_VISUAL_MAP } from '../../types';

interface V4BadgeProps {
  type: ObjectType;
  showFullLabel?: boolean;
}

export const V4Badge: React.FC<V4BadgeProps> = ({ type, showFullLabel = false }) => {
  const visual = TYPE_VISUAL_MAP[type] || TYPE_VISUAL_MAP.generic;

  return (
    <span
      className="v4-badge"
      style={{ backgroundColor: visual.accentColor }}
      title={`类型: ${visual.label}`}
    >
      {showFullLabel ? visual.label : visual.shortLabel}
    </span>
  );
};
