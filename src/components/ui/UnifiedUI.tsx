import { motion } from 'framer-motion';
import React from 'react';
import { twMerge } from 'tailwind-merge';
import { UnifiedSettingsService } from '../../services/unified/UnifiedSettingsService';
// (icons removed, not used)

// (animation variants removed, not used)

// Common button component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  disabled = false,
  onClick,
  className = '',
  ariaLabel,
  ...props
}) => {
  // const settings = UnifiedSettingsService.getInstance();
  // const theme = settings.getSettingValue<'light' | 'dark'>('theme');

  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 active:bg-green-800',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800',
    ghost:
      'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-800',
  };

  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  };

  const classes = twMerge(baseClasses, variantClasses[variant], sizeClasses[size], className);

  return (
    <motion.button
      aria-busy={isLoading}
      aria-label={ariaLabel}
      className={classes}
      disabled={disabled || isLoading}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2">
          <Spinner size="small" />
        </span>
      ) : null}
      {children}
    </motion.button>
  );
};

// Card component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 ${className}`}>
    {children}
  </div>
);

// Input component
interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  type?: string;
  label?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  value,
  onChange,
  error,
  disabled = false,
  placeholder,
  className = '',
  helperText,
  required = false,
  ...props
}) => {
  const settings = UnifiedSettingsService.getInstance();
  const theme = settings.getSettingValue<'light' | 'dark'>('theme');
  const id = React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={twMerge('w-full', className)}>
      {label && (
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          htmlFor={id}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <motion.div transition={{ duration: 0.2 }} whileFocus={{ scale: 1.01 }}>
        <input
          aria-describedby={error ? `${id}-error` : helperText ? `${id}-helper` : undefined}
          aria-invalid={!!error}
          className={twMerge(
            'w-full rounded-lg border transition-colors duration-200',
            theme === 'dark'
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900',
            error ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500',
            disabled ? 'opacity-50 cursor-not-allowed' : '',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'px-4 py-2'
          )}
          disabled={disabled}
          id={id}
          placeholder={placeholder}
          required={required}
          type={type}
          value={value}
          onChange={handleChange}
          {...props}
        />
      </motion.div>
      {error && (
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
          id={`${id}-error`}
          initial={{ opacity: 0, y: -10 }}
          role="alert"
        >
          {error}
        </motion.p>
      )}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400" id={`${id}-helper`}>
          {helperText}
        </p>
      )}
    </div>
  );
};

// Select component
interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  error?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
  error,
  disabled = false,
  className = '',
}) => {
  const settings = UnifiedSettingsService.getInstance();
  const theme = settings.getSettingValue<'light' | 'dark'>('theme');
  const id = React.useId();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className={twMerge('w-full', className)}>
      {label && (
        <label
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          htmlFor={id}
        >
          {label}
        </label>
      )}
      <select
        aria-invalid={!!error}
        className={twMerge(
          'w-full rounded-lg border transition-colors duration-200',
          theme === 'dark'
            ? 'bg-gray-700 border-gray-600 text-white'
            : 'bg-white border-gray-300 text-gray-900',
          error ? 'border-red-500 focus:border-red-500' : 'focus:border-blue-500',
          disabled ? 'opacity-50 cursor-not-allowed' : '',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'px-4 py-2'
        )}
        disabled={disabled}
        id={id}
        value={value}
        onChange={handleChange}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <motion.p
          animate={{ opacity: 1, y: 0 }}
          className="mt-1 text-sm text-red-500"
          id={`${id}-error`}
          initial={{ opacity: 0, y: -10 }}
          role="alert"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
};

// Modal component
export const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}> = ({ isOpen, onClose, title, children, className = '' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div aria-hidden="true" className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span aria-hidden="true" className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div
          className={`
            inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full
            ${className}
          `}
        >
          {title && (
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          )}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
};

// Toast component
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose: () => void;
  duration?: number;
}


const toastTypeStyles = {
  success: 'from-green-500/90 to-green-700/90',
  error: 'from-red-500/90 to-red-700/90',
  warning: 'from-yellow-400/90 to-yellow-600/90',
  info: 'from-blue-500/90 to-blue-700/90',
};

export const Toast: React.FC<ToastProps & { index?: number }> = ({
  message,
  type = 'info',
  onClose,
  duration = 4000,
  index = 0,
}) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  // Responsive position: bottom-center on mobile, bottom-right on desktop
  // Stacking: offset by index
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 40 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onClick={onClose}
      className={`
        fixed z-50
        sm:right-4 sm:bottom-4 left-1/2 sm:left-auto sm:translate-x-0 -translate-x-1/2 bottom-4
        min-w-[220px] max-w-xs px-6 py-3 rounded-2xl shadow-2xl cursor-pointer select-none
        bg-gradient-to-br ${toastTypeStyles[type]} backdrop-blur-lg
        text-white font-semibold flex items-center gap-3
        border border-white/10
        glass-morphism
      `}
      style={{ marginBottom: `${index * 72}px` }}
      role="alert"
      tabIndex={0}
      aria-live="polite"
      aria-atomic="true"
      title="Click to dismiss"
    >
      {message}
    </motion.div>
  );
};

// Loading spinner component
interface SpinnerProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ size = 'medium', className = '' }) => {
  const sizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
  };

  return (
    <div className={`animate-spin ${sizes[size]} ${className}`}>
      <svg
        className="w-full h-full text-primary"
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
    </div>
  );
};

// Badge component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'info', className = '' }) => {
  const colors = {
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// Slider component
interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  label?: string;
  className?: string;
}

export const Slider: React.FC<SliderProps> = ({
  value,
  onChange,
  min,
  max,
  step = 1,
  label,
  className,
}) => {
  return (
    <div className={twMerge('w-full', className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
        </label>
      )}
      <input
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
        max={max}
        min={min}
        step={step}
        type="range"
        value={value}
        onChange={e => onChange(Number(e.target.value))}
      />
      <div className="flex justify-between text-sm text-gray-500 mt-1">
        <span>{min}</span>
        <span>{value}</span>
        <span>{max}</span>
      </div>
    </div>
  );
};

// Progress component
interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ value, max = 100, className }) => {
  const percentage = (value / max) * 100;

  return (
    <div
      className={twMerge(
        'w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-gray-700',
        className
      )}
    >
      <div
        className="h-full bg-primary-500 transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// Tabs component
interface TabsProps {
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ value, onChange, children, className }) => {
  return (
    <div
      className={twMerge('flex space-x-2 border-b border-gray-200 dark:border-gray-700', className)}
    >
      {children}
    </div>
  );
};

// Tab component
interface TabProps {
  value: string;
  label: string;
  className?: string;
}

export const Tab: React.FC<TabProps> = ({ value, label, className }) => {
  return (
    <button
      className={twMerge(
        'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500',
        'border-transparent hover:border-gray-300 dark:hover:border-gray-600',
        'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
        className
      )}
      onClick={() => onChange(value)}
    >
      {label}
    </button>
  );
};

// Icon component
interface IconProps {
  name: string;
  className?: string;
}

export const Icon: React.FC<IconProps> = ({ name, className = '' }) => {
  const icons: Record<string, string> = {
    info: 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'exclamation-circle': 'M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
    'chevron-up': 'M5 15l7-7 7 7',
    'chevron-down': 'M19 9l-7 7-7-7',
  };

  return (
    <svg
      className={`w-5 h-5 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={icons[name] || ''} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  );
};

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Tooltip: React.FC<TooltipProps> = ({ children, content, position = 'top' }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  const positions = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      <motion.div
        animate={{ opacity: isVisible ? 1 : 0, scale: isVisible ? 1 : 0.95 }}
        className={`absolute z-50 px-2 py-1 text-sm text-white bg-gray-900 rounded shadow-lg whitespace-nowrap ${positions[position]}`}
        initial={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.15 }}
      >
        {content}
      </motion.div>
    </div>
  );
};
