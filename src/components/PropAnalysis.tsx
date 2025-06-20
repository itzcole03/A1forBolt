import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookmakerAnalysis } from './BookmakerAnalysis';
import { useBookmakerAnalysis } from '../hooks/useBookmakerAnalysis';

interface PropAnalysisProps {
  playerId: string;
  playerName: string;
  propType: string;
  projectedValue: number;
  tag: 'demon' | 'goblin' | 'normal';
  currentOdds: number;
  historicalAverage: number;
  className?: string;
}

export const PropAnalysis: React.FC<PropAnalysisProps> = ({
  playerId,
  playerName,
  propType,
  projectedValue,
  tag,
  currentOdds,
  historicalAverage,
  className = '',
}) => {
  const { isLoading, error, analysis, refreshAnalysis } = useBookmakerAnalysis({
    playerId,
    propType,
    projectedValue,
    tag,
    currentOdds,
    historicalAverage,
  });

  const getTagIcon = (tag: 'demon' | 'goblin' | 'normal') => {
    switch (tag) {
      case 'demon':
        return (
          <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
              fillRule="evenodd"
            />
          </svg>
        );
      case 'goblin':
        return (
          <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              fillRule="evenodd"
            />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path
              clipRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-2a6 6 0 100-12 6 6 0 000 12z"
              fillRule="evenodd"
            />
          </svg>
        );
    }
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-900 rounded-xl p-6 shadow-xl ${className}`}
      initial={{ opacity: 0, y: 20 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">{playerName}</h2>
          <p className="text-gray-400">{propType}</p>
        </div>
        <div className="flex items-center space-x-2">
          {getTagIcon(tag)}
          <span className="text-lg font-semibold text-white">{projectedValue}</span>
        </div>
      </div>

      {/* Analysis Section */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            key="loading"
            animate={{ opacity: 1 }}
            className="flex justify-center py-8"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white" />
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            animate={{ opacity: 1 }}
            className="bg-red-900/50 border border-red-500/50 rounded-lg p-4"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <p className="text-red-100">{error}</p>
            <button
              className="mt-2 text-red-300 hover:text-red-100 text-sm"
              onClick={refreshAnalysis}
            >
              Try Again
            </button>
          </motion.div>
        ) : analysis ? (
          <motion.div
            key="analysis"
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
          >
            <BookmakerAnalysis analysis={analysis} />

            {/* Historical Stats */}
            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg">
              <h3 className="text-lg font-semibold text-white mb-2">Historical Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-400">Average</p>
                  <p className="text-xl font-bold text-white">{historicalAverage.toFixed(1)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current Odds</p>
                  <p className="text-xl font-bold text-white">{currentOdds.toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Refresh Button */}
            <button
              className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              onClick={refreshAnalysis}
            >
              Refresh Analysis
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  );
};

export default React.memo(PropAnalysis);
