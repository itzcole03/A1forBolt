import React, { useState } from 'react';
import { cn } from '../../utils/classNames';
import { motion, AnimatePresence } from 'framer-motion';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
  delay?: number;
  className?: string;
  maxWidth?: string;
  arrow?: boolean;
}

const positions = {
  top: {
    tooltip: '-top-2 left-1/2 transform -translate-x-1/2 -translate-y-full',
    arrow:
      'bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-t-gray-800 dark:border-t-gray-200 border-x-transparent border-b-transparent',
  },
  right: {
    tooltip: 'top-1/2 -right-2 transform translate-x-full -translate-y-1/2',
    arrow:
      'left-0 top-1/2 transform -translate-x-full -translate-y-1/2 border-r-gray-800 dark:border-r-gray-200 border-y-transparent border-l-transparent',
  },
  bottom: {
    tooltip: '-bottom-2 left-1/2 transform -translate-x-1/2 translate-y-full',
    arrow:
      'top-0 left-1/2 transform -translate-x-1/2 -translate-y-full border-b-gray-800 dark:border-b-gray-200 border-x-transparent border-t-transparent',
  },
  left: {
    tooltip: 'top-1/2 -left-2 transform -translate-x-full -translate-y-1/2',
    arrow:
      'right-0 top-1/2 transform translate-x-full -translate-y-1/2 border-l-gray-800 dark:border-l-gray-200 border-y-transparent border-r-transparent',
  },
};

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  delay = 0,
  className,
  maxWidth = '200px',
  arrow = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  let timeout: NodeJS.Timeout;

  const showTooltip = () => {
    if (delay) {
      timeout = setTimeout(() => setIsVisible(true), delay);
    } else {
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    setIsVisible(false);
  };

  return (
    <div
      className="relative inline-block"
      onBlur={hideTooltip}
      onFocus={showTooltip}
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
              'absolute z-50 px-2 py-1 text-sm text-white bg-gray-800 dark:bg-gray-200 dark:text-gray-800 rounded shadow-lg',
              positions[position].tooltip,
              className
            )}
            exit={{ opacity: 0, scale: 0.95 }}
            initial={{ opacity: 0, scale: 0.95 }}
            style={{ maxWidth }}
            transition={{ duration: 0.1 }}
          >
            {content}
            {arrow && (
              <div className={cn('absolute w-0 h-0 border-4', positions[position].arrow)} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
