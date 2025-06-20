import React, { useState, useMemo } from 'react';
import { FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';
import { Lineup, LineupType } from '../types';
import { fadeIn } from '../hooks/useAnimation';
import { formatCurrency } from '../utils/odds';
import { motion, Variants } from 'framer-motion';

interface LineupComparisonTableProps {
  lineups: Lineup[];
  onSelect?: (lineup: Lineup) => void;
}

type SortField = 'name' | 'type' | 'winProbability' | 'projectedPayout';
type SortDirection = 'asc' | 'desc';

const tableVariants: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const rowVariants: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
};

export const LineupComparisonTable: React.FC<LineupComparisonTableProps> = ({
  lineups,
  onSelect,
}) => {
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const getTypeColor = (type: Lineup['type']) => {
    switch (type) {
      case LineupType.SINGLE:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-400';
      case LineupType.TEASER:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-400';
      case LineupType.PARLAY:
        return 'bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-400';
    }
  };

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) return <FaSort className="w-4 h-4 text-gray-400" />;
    return sortDirection === 'asc' ? (
      <FaSortUp className="w-4 h-4 text-primary-500" />
    ) : (
      <FaSortDown className="w-4 h-4 text-primary-500" />
    );
  };

  const filteredAndSortedLineups = useMemo(() => {
    let result = [...lineups];
    if (typeFilter !== 'all') {
      result = result.filter(lineup => lineup.type === typeFilter);
    }
    result.sort((a, b) => a.name.localeCompare(b.name));
    return result;
  }, [lineups, typeFilter]);

  return (
    <motion.div
      animate="animate"
      className="glass-morphism rounded-xl overflow-hidden"
      exit="exit"
      initial="initial"
      variants={tableVariants}
    >
      {/* Filter Bar */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-4">
          <FaFilter className="w-4 h-4 text-primary-500" />
          <select
            className="bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-1.5 text-sm"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value={LineupType.SINGLE}>Single</option>
            <option value={LineupType.TEASER}>Teaser</option>
            <option value={LineupType.PARLAY}>Parlay</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center space-x-2">
                  <span>Name</span>
                  {getSortIcon('name')}
                </div>
              </th>
              <th className="px-6 py-3 text-left cursor-pointer" onClick={() => handleSort('type')}>
                <div className="flex items-center space-x-2">
                  <span>Type</span>
                  {getSortIcon('type')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left cursor-pointer"
                onClick={() => handleSort('winProbability')}
              >
                <div className="flex items-center space-x-2">
                  <span>Win Probability</span>
                  {getSortIcon('winProbability')}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left cursor-pointer"
                onClick={() => handleSort('projectedPayout')}
              >
                <div className="flex items-center space-x-2">
                  <span>Projected Payout</span>
                  {getSortIcon('projectedPayout')}
                </div>
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedLineups.map((lineup, index) => (
              <motion.tr
                key={lineup.id}
                animate="animate"
                className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                custom={index}
                initial="initial"
                variants={rowVariants}
                onClick={() => onSelect?.(lineup)}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <span className="font-medium text-gray-900 dark:text-white">{lineup.name}</span>
                    <span className="text-xs text-gray-500">
                      {new Date(lineup.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`font-medium ${getTypeColor(lineup.type)}`}>{lineup.type}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm font-medium">{lineup.status}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
