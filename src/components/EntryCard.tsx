import React from 'react';
import type { Entry } from '../types';
import { EntryStatus } from '../types';
import { FaChartLine, FaCheckCircle, FaTimesCircle, FaSpinner } from 'react-icons/fa';
import { motion, Variants } from 'framer-motion';

interface EntryCardProps {
  entry: Entry;
  onClick?: () => void;
}

const cardVariants: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 },
};

const progressVariants: Variants = {
  initial: { width: 0 },
  animate: (percentage: number) => ({
    width: `${percentage}%`,
    transition: { duration: 1, ease: 'easeOut' },
  }),
};

export const EntryCard: React.FC<EntryCardProps> = ({ entry, onClick }) => {
  const handleClick = () => {
    if (onClick) onClick();
  };

  const getStatusColor = (status: Entry['status']) => {
    switch (status) {
      case EntryStatus.WON:
        return 'text-green-500';
      case EntryStatus.LOST:
        return 'text-red-500';
      default:
        return 'text-amber-500';
    }
  };

  const getStatusIcon = (status: Entry['status']) => {
    switch (status) {
      case EntryStatus.WON:
        return <FaCheckCircle className="w-5 h-5" />;
      case EntryStatus.LOST:
        return <FaTimesCircle className="w-5 h-5" />;
      default:
        return <FaSpinner className="w-5 h-5 animate-spin" />;
    }
  };

  return (
    <motion.div
      animate="animate"
      className={`
        glass-morphism
        relative overflow-hidden rounded-xl p-6 cursor-pointer
        hover:ring-1 hover:ring-primary-400
        transition-all duration-300 ease-in-out
      `}
      exit="exit"
      initial="initial"
      variants={cardVariants}
      onClick={handleClick}
    >
      {/* Status Indicator */}
      <div className="absolute top-0 left-0 w-full h-1">
        <motion.div
          animate="animate"
          className={`h-full ${getStatusColor(entry.status)}`}
          custom={0}
          initial="initial"
          variants={progressVariants}
        />
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {entry.type} Entry
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {new Date(entry.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`${getStatusColor(entry.status)}`}>{getStatusIcon(entry.status)}</span>
          <span className="text-lg font-bold text-primary-600 dark:text-primary-400">
            {formatCurrency(entry.stake)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <FaChartLine className="w-4 h-4 text-primary-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Potential Winnings</span>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatCurrency(entry.potentialWinnings)}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
