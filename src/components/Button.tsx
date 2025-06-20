import React from 'react';
import { cn } from '../../utils/classNames';
import { motion, MotionProps } from 'framer-motion';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const variants = {
  primary: 'bg-primary-500 hover:bg-primary-600 text-white',
  secondary: 'bg-gray-500 hover:bg-gray-600 text-white',
  success: 'bg-green-500 hover:bg-green-600 text-white',
  danger: 'bg-red-500 hover:bg-red-600 text-white',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

function splitMotionProps(props: Record<string, unknown>) {
  const motionKeys = [
    'animate',
    'initial',
    'exit',
    'whileHover',
    'whileTap',
    'whileFocus',
    'whileDrag',
    'drag',
    'dragConstraints',
    'dragElastic',
    'dragMomentum',
    'dragPropagation',
    'onAnimationStart',
    'onAnimationComplete',
    'onUpdate',
    'onDrag',
    'onDragEnd',
    'onDragStart',
    'onDragTransitionEnd',
    'layout',
    'layoutId',
    'transition',
    'variants',
    'custom',
    'style',
    'transformTemplate',
    'transformValues',
  ]; const motionProps: Record<string, unknown> = {};
  const rest: Record<string, unknown> = {};
  Object.entries(props).forEach(([key, value]) => {
    if (motionKeys.includes(key)) {
      motionProps[key] = value;
    } else {
      rest[key] = value;
    }
  });
  return [motionProps, rest];
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps & MotionProps>(
  (allProps, ref) => {
    const {
      variant = 'primary',
      size = 'md',
      loading = false,
      icon,
      fullWidth = false,
      className,
      children,
      disabled,
      ...props
    } = allProps;
    const baseClasses =
      'rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    const variantClasses = variants[variant];
    const sizeClasses = sizes[size];
    const widthClasses = fullWidth ? 'w-full' : '';
    const [motionProps, buttonProps] = splitMotionProps(props);
    return (
      <motion.button
        ref={ref}
        className={cn(baseClasses, variantClasses, sizeClasses, widthClasses, className)}
        disabled={disabled || loading}
        {...motionProps}
        {...buttonProps}
      >
        <div className="flex items-center justify-center gap-2">
          {loading ? (
            <svg
              className="animate-spin h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                fill="currentColor"
              />
            </svg>
          ) : icon ? (
            <span className="w-5 h-5">{icon}</span>
          ) : null}
          {children}
        </div>
      </motion.button>
    );
  }
);
