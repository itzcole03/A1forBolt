import React from 'react';
import { cn } from '../../utils/classNames';

export interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  height?: number | string;
  width?: number | string;
  animate?: boolean;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  height,
  width,
  animate = true,
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const animationClasses = animate ? 'animate-pulse' : '';
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
  };

  const style: React.CSSProperties = {
    height: typeof height === 'number' ? `${height}px` : height,
    width: typeof width === 'number' ? `${width}px` : width,
  };

  return (
    <div
      className={cn(baseClasses, animationClasses, variantClasses[variant], className)}
      style={style}
    />
  );
};

export default React.memo(Skeleton);

export const SkeletonText: React.FC<{ lines?: number } & Omit<SkeletonProps, 'variant'>> = ({
  lines = 1,
  ...props
}) => {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" width={i === lines - 1 ? '75%' : '100%'} {...props} />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ rows?: number }> = ({ rows = 3 }) => {
  return (
    <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <Skeleton height={200} variant="rectangular" />
      <SkeletonText lines={rows} />
    </div>
  );
};
