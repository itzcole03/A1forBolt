import React from 'react';
import { EntryStatus } from '../types';
import { calculateProgressPercentage } from '../utils/odds';
import { motion, Variants } from 'framer-motion';

interface ProgressBarProps {
  current: number;
  target: number;
  status: EntryStatus;
  showPercentage?: boolean;
  className?: string;
  showGlow?: boolean;
  animated?: boolean;
}

const progressVariants: Variants = {
  initial: { width: 0 },
  animate: (percentage: number) => ({
    width: `${percentage}%`,
    transition: { duration: 1, ease: 'easeOut' },
  }),
};

const glowVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: [0.4, 1, 0.4], transition: { duration: 2, repeat: Infinity } },
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  status,
  showPercentage = false,
  className = '',
  showGlow = true,
  animated = true,
}) => {
  const percentage = calculateProgressPercentage(current, target);

  const getStatusColor = () => {
    switch (status) {
      case EntryStatus.WON:
        return {
          bar: 'bg-green-500',
          text: 'text-green-500',
          glow: 'shadow-green-500/50',
        };
      case EntryStatus.LOST:
        return {
          bar: 'bg-red-500',
          text: 'text-red-500',
          glow: 'shadow-red-500/50',
        };
      default:
        return {
          bar: 'bg-primary-500',
          text: 'text-primary-500',
          glow: 'shadow-primary-500/50',
        };
    }
  };

  const { bar, text, glow } = getStatusColor();

  return (
    <div className="relative">
      <div
        className={`
          relative h-2 rounded-full overflow-hidden
          glass-morphism
          ${className}
        `}
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700" />

        {/* Progress Bar */}
        <motion.div
          animate="animate"
          className={`absolute inset-y-0 left-0 ${bar}`}
          custom={percentage}
          initial="initial"
          variants={progressVariants}
        />

        {/* Glow Effect */}
        {showGlow && (
          <motion.div
            animate="animate"
            className={`
              absolute inset-y-0 left-0
              w-full h-full
              bg-gradient-to-r from-transparent
              ${glow}
              blur-sm
            `}
            initial="initial"
            style={{ width: `${percentage}%` }}
            variants={glowVariants}
          />
        )}

        {/* Animated Stripes */}
        {animated && percentage < 100 && status === EntryStatus.PENDING && (
          <div
            className={`
              absolute inset-y-0 left-0 
              bg-gradient-to-r from-transparent via-white/10 to-transparent
              animate-[progress-stripe_1s_linear_infinite]
            `}
            style={{
              width: `${percentage}%`,
              backgroundSize: '20px 100%',
              animation: 'progress-stripe 1s linear infinite',
            }}
          />
        )}
      </div>

      {/* Percentage Label */}
      {showPercentage && (
        <div className="absolute -top-6 right-0">
          <motion.span
            animate={{ opacity: 1, y: 0 }}
            className={`text-xs font-medium ${text}`}
            initial={{ opacity: 0, y: 10 }}
          >
            {percentage}%
          </motion.span>
        </div>
      )}
    </div>
  );
};
