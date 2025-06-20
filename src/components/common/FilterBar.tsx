import React from 'react';
import type { Sport, PropType } from '../types';
import { motion, Variants } from 'framer-motion';
import {
  FaFilter,
  FaChartBar,
  FaPercentage,
  FaMoneyBillWave,
  FaFire,
  FaHistory,
  FaTimes
} from 'react-icons/fa';
// import { useStore } from '../store/useStore';

const filterVariants: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const sportFilters: { id: Sport; label: string }[] = [
  { id: 'NBA', label: 'NBA' },
  { id: 'NFL', label: 'NFL' },
  { id: 'MLB', label: 'MLB' },
  { id: 'NHL', label: 'NHL' }
];

const propTypeFilters: { id: PropType; label: string }[] = [
  { id: 'POINTS', label: 'Points' },
  { id: 'REBOUNDS', label: 'Rebounds' },
  { id: 'ASSISTS', label: 'Assists' },
  { id: 'THREES', label: '3-Pointers' },
  { id: 'STEALS', label: 'Steals' },
  { id: 'BLOCKS', label: 'Blocks' }
];

const confidenceFilters = [
  { id: 'high', label: 'High Confidence (65%+)', icon: FaFire },
  { id: 'medium', label: 'Medium Confidence (55-65%)', icon: FaChartBar },
  { id: 'low', label: 'Low Confidence (<55%)', icon: FaPercentage }
];

const payoutFilters = [
  { id: 'high', label: 'High Payout (5x+)', icon: FaMoneyBillWave },
  { id: 'medium', label: 'Medium Payout (2-5x)', icon: FaMoneyBillWave },
  { id: 'low', label: 'Low Payout (<2x)', icon: FaMoneyBillWave }
];

export const FilterBar: React.FC = () => {
  // const { activeFilters, toggleFilter } = useStore();

  const isFilterActive = (filterId: string) => {
    // if (activeFilters) {
    //   return activeFilters.has(filterId);
    // }
    return false;
  };

  const FilterButton: React.FC<{
    id: string;
    label: string;
    icon?: React.ElementType;
  }> = ({ id, label, icon: Icon }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      // onClick={() => toggleFilter(id)}
      className={`
        inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium
        transition-colors duration-200
        ${
          isFilterActive(id)
            ? 'bg-primary-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
        }
      `}
    >
      {Icon && <Icon className="w-4 h-4 mr-2" />}
      {label}
    </motion.button>
  );

  return (
    <motion.div
      variants={filterVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="glass-morphism rounded-xl p-6 mb-6 space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <FaFilter className="w-5 h-5 text-primary-500" />
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Filters
          </h2>
        </div>
        {/* activeFilters.size > 0 && (
          <button
            // onClick={() => activeFilters.forEach(filter => toggleFilter(filter))}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex items-center space-x-1"
          >
            <FaTimes className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        ) */}
      </div>

      {/* Sports */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Sports
        </h3>
        <div className="flex flex-wrap gap-2">
          {sportFilters.map(({ id, label }) => (
            <FilterButton key={id} id={id} label={label} />
          ))}
        </div>
      </div>

      {/* Prop Types */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Prop Types
        </h3>
        <div className="flex flex-wrap gap-2">
          {propTypeFilters.map(({ id, label }) => (
            <FilterButton key={id} id={id} label={label} />
          ))}
        </div>
      </div>

      {/* Confidence Levels */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Confidence Level
        </h3>
        <div className="flex flex-wrap gap-2">
          {confidenceFilters.map(({ id, label, icon }) => (
            <FilterButton key={id} id={`confidence_${id}`} label={label} icon={icon} />
          ))}
        </div>
      </div>

      {/* Payout Ranges */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Potential Payout
        </h3>
        <div className="flex flex-wrap gap-2">
          {payoutFilters.map(({ id, label, icon }) => (
            <FilterButton key={id} id={`payout_${id}`} label={label} icon={icon} />
          ))}
        </div>
      </div>

      {/* Active Filters Summary */}
      {/* activeFilters.size > 0 && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <FaHistory className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {activeFilters.size} active filter{activeFilters.size !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      ) */}
    </motion.div>
  );
}; 