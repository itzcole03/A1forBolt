import React from 'react';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';

export interface ProgressProps {
  value: number;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showValue?: boolean;
  valuePosition?: 'top' | 'right' | 'bottom';
  label?: string;
  className?: string;
  animate?: boolean;
}

const sizes = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

const variants = {
  default: {
    base: 'bg-gray-200 dark:bg-gray-700',
    bar: 'bg-primary-500',
  },
  success: {
    base: 'bg-green-100 dark:bg-green-800/30',
    bar: 'bg-green-500',
  },
  warning: {
    base: 'bg-yellow-100 dark:bg-yellow-800/30',
    bar: 'bg-yellow-500',
  },
  danger: {
    base: 'bg-red-100 dark:bg-red-800/30',
    bar: 'bg-red-500',
  },
};

export const Progress: React.FC<ProgressProps> = ({
  value,
  max = 100,
  size = 'md',
  variant = 'default',
  showValue = false,
  valuePosition = 'right',
  label,
  className,
  animate = true,
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const renderValue = () => (
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
      {Math.round(percentage)}%
    </span>
  );

  return (
    <div className={cn('w-full', className)}>
      {(label || (showValue && valuePosition === 'top')) && (
        <div className="mb-1 flex justify-between items-center">
          {label && (
            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
          )}
          {showValue && valuePosition === 'top' && renderValue()}
        </div>
      )}
      <div className="relative flex items-center">
        <div
          className={cn('w-full overflow-hidden rounded-full', variants[variant].base, sizes[size])}
        >
          <motion.div
            animate={{ width: `${percentage}%` }}
            className={cn('h-full rounded-full', variants[variant].bar)}
            initial={animate ? { width: 0 } : false}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          />
        </div>
        {showValue && valuePosition === 'right' && (
          <div className="ml-3 flex-shrink-0">{renderValue()}</div>
        )}
      </div>
      {showValue && valuePosition === 'bottom' && (
        <div className="mt-1 flex justify-end">{renderValue()}</div>
      )}
    </div>
  );
};
