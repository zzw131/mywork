import React from 'react';

interface WorkbenchLogoProps {
  className?: string;
  size?: number | string;
}

export const WorkbenchLogo: React.FC<WorkbenchLogoProps> = ({
  className = 'w-11 h-11',
  size,
}) => {
  return (
    <svg
      viewBox="11 11 75 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Personal Workbench Logo"
    >
      {/* 3D Neo-Brutalism Shadow */}
      <rect x="18" y="18" width="68" height="68" rx="20" fill="#171717" />
      {/* Main Yellow Card Badge */}
      <rect
        x="13.5"
        y="13.5"
        width="68"
        height="68"
        rx="20"
        fill="#FFCD29"
        stroke="#171717"
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      {/* Workbench Left Display / Monitor */}
      <rect x="25.5" y="28" width="25.5" height="18.5" rx="4.5" fill="#171717" />
      {/* Workbench Right Upper Module */}
      <rect x="54.5" y="28" width="16.5" height="7.8" rx="3" fill="#171717" />
      {/* Workbench Right Lower Module */}
      <rect x="54.5" y="38.7" width="16.5" height="7.8" rx="3" fill="#171717" />
      {/* Workbench Sturdy Tabletop */}
      <rect x="23.5" y="50" width="48.5" height="8" rx="3.5" fill="#171717" />
      {/* Workbench Left Table Leg */}
      <rect x="27.5" y="58" width="6.5" height="12" rx="1.5" fill="#171717" />
      {/* Workbench Right Table Leg */}
      <rect x="61.5" y="58" width="6.5" height="12" rx="1.5" fill="#171717" />
    </svg>
  );
};

export default WorkbenchLogo;
