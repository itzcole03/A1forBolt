import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  delay?: number;
  position?: 'top' | 'right' | 'bottom' | 'left';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  delay = 300,
  position = 'top',
  className = '',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const timeoutRef = useRef<number>();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let x = 0;
      let y = 0;
      const offset = 8;

      switch (position) {
        case 'top':
          x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          y = triggerRect.top - tooltipRect.height - offset;
          break;
        case 'right':
          x = triggerRect.right + offset;
          y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          break;
        case 'bottom':
          x = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          y = triggerRect.bottom + offset;
          break;
        case 'left':
          x = triggerRect.left - tooltipRect.width - offset;
          y = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          break;
      }

      // Ensure tooltip stays within viewport
      x = Math.max(offset, Math.min(window.innerWidth - tooltipRect.width - offset, x));
      y = Math.max(offset, Math.min(window.innerHeight - tooltipRect.height - offset, y));

      setCoords({ x, y });
    }
  };

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
      // Wait for the tooltip to be visible before calculating position
      requestAnimationFrame(updatePosition);
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    if (isVisible) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
    }

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, position]);

  const tooltipVariants = {
    hidden: { opacity: 0, y: 5, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>

      <AnimatePresence>
        {isVisible && (
          <motion.div
            ref={tooltipRef}
            className={`fixed z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none ${className}`}
            style={{
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transformOrigin: 'center',
            }}
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={tooltipVariants}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 300,
            }}
          >
            {content}
            <div 
              className="absolute w-2 h-2 bg-gray-900 transform -translate-x-1/2 -translate-y-1/2 rotate-45"
              style={{
                left: '50%',
                top: '100%',
                ...(position === 'top' && { top: '0%', transform: 'translate(-50%, -50%) rotate(45deg)' }),
                ...(position === 'right' && { left: '0%', top: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }),
                ...(position === 'bottom' && { top: '100%', transform: 'translate(-50%, -50%) rotate(45deg)' }),
                ...(position === 'left' && { left: '100%', top: '50%', transform: 'translate(-50%, -50%) rotate(45deg)' }),
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
