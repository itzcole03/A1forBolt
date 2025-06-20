import React from 'react';
import { cn } from '../../utils/classNames';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  dot?: boolean;
}

const variants = {
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-100',
  success: 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100',
  warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-100',
  danger: 'bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-100',
  info: 'bg-blue-100 text-blue-800 dark:bg-blue-700 dark:text-blue-100',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-0.5 text-sm',
  lg: 'px-3 py-1 text-base',
};

const glowColors = {
  default: 'shadow-gray-500/20',
  success: 'shadow-green-500/20',
  warning: 'shadow-yellow-500/20',
  danger: 'shadow-red-500/20',
  info: 'shadow-blue-500/20',
};

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { variant = 'default', size = 'md', glow = false, dot = false, className, children, ...props },
    ref
  ) => {
    const baseClasses = 'inline-flex items-center gap-1.5 font-medium rounded-full';
    const variantClasses = variants[variant];
    const sizeClasses = sizes[size];
    const glowClasses = glow ? `shadow-lg ${glowColors[variant]}` : '';

    return (
      <span
        ref={ref}
        className={cn(baseClasses, variantClasses, sizeClasses, glowClasses, className)}
        {...props}
      >
        {dot && (
          <span
            className={cn('h-2 w-2 rounded-full', {
              'bg-gray-500 dark:bg-gray-400': variant === 'default',
              'bg-green-500 dark:bg-green-400': variant === 'success',
              'bg-yellow-500 dark:bg-yellow-400': variant === 'warning',
              'bg-red-500 dark:bg-red-400': variant === 'danger',
              'bg-blue-500 dark:bg-blue-400': variant === 'info',
            })}
          />
        )}
        {children}
      </span>
    );
  }
);
