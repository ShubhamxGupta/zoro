import React from 'react';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  height?: string | number;
  width?: string | number;
  borderRadius?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  height = '18px',
  width = '100%',
  borderRadius = 'var(--radius-md)',
  style,
  className = '',
  ...props
}) => {
  const baseStyle: React.CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
    backgroundColor: 'var(--border-default)',
    borderRadius,
    ...style,
  };

  return <div style={baseStyle} className={`animate-pulse ${className}`} {...props} />;
};
