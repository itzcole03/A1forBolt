import React from 'react';
import { motion } from 'framer-motion';

interface BookmakerAnalysisProps {
  analysis: {
    suspiciousLevel: number;
    warning?: string;
    adjustedProbability: number;
    riskScore: number;
  };
  className?: string;
}

export const BookmakerAnalysis: React.FC<BookmakerAnalysisProps> = ({
  analysis,
  className = '',
}) => {
  const getSuspiciousLevelColor = (level: number): string => {
    if (level > 0.8) return 'text-red-500';
    if (level > 0.6) return 'text-orange-500';
    if (level > 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };

  const getRiskScoreColor = (score: number): string => {
    if (score > 0.8) return 'text-red-500';
    if (score > 0.6) return 'text-orange-500';
    if (score > 0.4) return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gray-800 rounded-lg p-4 shadow-lg ${className}`}
      initial={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <h3 className="text-xl font-bold mb-4 text-white">Bookmaker Analysis</h3>

      <div className="space-y-4">
        {/* Suspicious Level */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-300">Suspicious Level</span>
            <span className={`font-bold ${getSuspiciousLevelColor(analysis.suspiciousLevel)}`}>
              {Math.round(analysis.suspiciousLevel * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              animate={{ width: `${analysis.suspiciousLevel * 100}%` }}
              className={`h-full rounded-full ${getSuspiciousLevelColor(analysis.suspiciousLevel)}`}
              initial={{ width: 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Adjusted Probability */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-300">Adjusted Win Probability</span>
            <span className="text-blue-400 font-bold">
              {Math.round(analysis.adjustedProbability * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              animate={{ width: `${analysis.adjustedProbability * 100}%` }}
              className="h-full rounded-full bg-blue-400"
              initial={{ width: 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Risk Score */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-300">Risk Score</span>
            <span className={`font-bold ${getRiskScoreColor(analysis.riskScore)}`}>
              {Math.round(analysis.riskScore * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <motion.div
              animate={{ width: `${analysis.riskScore * 100}%` }}
              className={`h-full rounded-full ${getRiskScoreColor(analysis.riskScore)}`}
              initial={{ width: 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Warning Message */}
        {analysis.warning && (
          <motion.div
            animate={{ opacity: 1 }}
            className="mt-4 p-3 bg-red-900/50 border border-red-500/50 rounded-lg"
            initial={{ opacity: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-500 mr-2 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                />
              </svg>
              <p className="text-red-100 text-sm">{analysis.warning}</p>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default React.memo(BookmakerAnalysis);
