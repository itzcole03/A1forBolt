import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rectangular' | 'circular';
  height?: number | string;
  width?: number | string;
  animate?: boolean;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'text',
  height,
  width,
  animate = true,
}) => {
  const baseClasses = 'bg-gray-200 dark:bg-gray-700';
  const variantClasses = {
    text: 'rounded',
    rectangular: 'rounded-md',
    circular: 'rounded-full',
  };

  const style: React.CSSProperties = {
    height: height || (variant === 'text' ? '1em' : '100%'),
    width: width || '100%',
  };

  if (!animate) {
    return (
      <div className={`${baseClasses} ${variantClasses[variant]} ${className}`} style={style} />
    );
  }

  return (
    <motion.div
      className={`${baseClasses} ${variantClasses[variant]} ${className} overflow-hidden relative`}
      style={style}
    >
      <motion.div
        animate={{
          translateX: ['-100%', '100%'],
        }}
        className="absolute inset-0 -translate-x-full"
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'linear',
        }}
      >
        <div className="w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      </motion.div>
    </motion.div>
  );
};

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
    <div className="p-4 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
      <Skeleton height={200} variant="rectangular" />
      <SkeletonText lines={rows} />
    </div>
  );
};
