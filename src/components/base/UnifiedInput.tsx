import React, { ChangeEvent, useState, useEffect } from 'react';
import { FaExclamationCircle, FaCheckCircle, FaInfoCircle } from 'react-icons/fa';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';

type InputAttributes = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>;

export interface UnifiedInputProps extends InputAttributes {
  // Appearance
  variant?: 'default' | 'premium';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  // Labels and Messages
  label?: string;
  error?: string;
  info?: string;

  // Validation
  validation?: {
    required?: boolean;
    pattern?: string;
    min?: number;
    max?: number;
    validateOnBlur?: boolean;
  };

  // Animation
  animate?: boolean;

  // Callbacks
  onValidationChange?: (isValid: boolean) => void;
}

const variants = {
  label: {
    initial: { y: -10, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: 10, opacity: 0 },
  },
  error: {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  },
};

const sizeClasses = {
  sm: 'h-8 text-sm',
  md: 'h-10 text-base',
  lg: 'h-12 text-lg',
};

export const UnifiedInput = React.forwardRef<HTMLInputElement, UnifiedInputProps>(
  (
    {
      // Appearance props
      variant = 'default',
      size = 'md',
      leftIcon,
      rightIcon,
      className,

      // Labels and messages
      label,
      error,
      info,

      // Validation
      validation,

      // Animation
      animate = true,

      // Callbacks
      onValidationChange,
      onChange,
      onBlur,

      // Rest
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [localError, setLocalError] = useState<string | undefined>(error);
    const [isValid, setIsValid] = useState(true);

    useEffect(() => {
      setLocalError(error);
    }, [error]);

    const validate = (value: string) => {
      if (!validation) return true;

      if (validation.required && !value) {
        setLocalError('This field is required');
        setIsValid(false);
        return false;
      }

      if (validation.pattern && value) {
        const regex = new RegExp(validation.pattern);
        if (!regex.test(value)) {
          setLocalError('Invalid format');
          setIsValid(false);
          return false;
        }
      }

      if (props.type === 'number' && value) {
        const num = parseFloat(value);
        if (validation.min !== undefined && num < validation.min) {
          setLocalError(`Value must be at least ${validation.min}`);
          setIsValid(false);
          return false;
        }
        if (validation.max !== undefined && num > validation.max) {
          setLocalError(`Value must be at most ${validation.max}`);
          setIsValid(false);
          return false;
        }
      }

      setLocalError(undefined);
      setIsValid(true);
      return true;
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      setIsDirty(true);
      if (validation && !validation.validateOnBlur) {
        const isValid = validate(e.target.value);
        onValidationChange?.(isValid);
      }
      onChange?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      if (validation?.validateOnBlur && isDirty) {
        const isValid = validate(e.target.value);
        onValidationChange?.(isValid);
      }
      onBlur?.(e);
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const baseClasses = cn(
      'w-full rounded-lg border px-4 transition-all duration-200',
      'focus:outline-none focus:ring-2 focus:ring-offset-2',
      sizeClasses[size],
      {
        'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800': variant === 'default',
        'border-primary-200 dark:border-primary-800 bg-primary-50/50 dark:bg-primary-900/20':
          variant === 'premium',
        'border-red-500 focus:border-red-500 focus:ring-red-500': localError,
        'pl-10': leftIcon,
        'pr-10': rightIcon,
      },
      className
    );

    return (
      <div className="space-y-1">
        <AnimatePresence>
          {label && (
            <motion.label
              className="block text-sm font-medium text-gray-700 dark:text-gray-200"
              {...(animate ? variants.label : {})}
            >
              {label}
            </motion.label>
          )}
        </AnimatePresence>

        <div className="relative">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            className={baseClasses}
            onBlur={handleBlur}
            onChange={handleChange}
            onFocus={handleFocus}
            {...props}
          />

          {rightIcon && (
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        <AnimatePresence>
          {localError && (
            <motion.p
              className="text-sm text-red-600 dark:text-red-500 flex items-center gap-1"
              {...(animate ? variants.error : {})}
            >
              <FaExclamationCircle />
              {localError}
            </motion.p>
          )}
          {!localError && info && (
            <motion.p
              className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1"
              {...(animate ? variants.error : {})}
            >
              <FaInfoCircle />
              {info}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

UnifiedInput.displayName = 'UnifiedInput';
