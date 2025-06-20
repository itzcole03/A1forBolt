import React from 'react';
import { RealtimeData } from '../types/betting';
import { motion } from 'framer-motion';

export interface ArbitrageDetectorProps {
  data: RealtimeData | null;
}

interface BookOdds {
  [bookmaker: string]: number;
}

const ArbitrageDetector: React.FC<ArbitrageDetectorProps> = ({ data }) => {
  if (!data) {
    return <div className="p-4 text-gray-500">Waiting for market data...</div>;
  }

  // Simple arbitrage detection logic (to be expanded)
  const opportunities = Object.entries(data.odds).filter(([_, value]) => {
    if (typeof value === 'object' && value !== null) {
      const odds = Object.values(value as BookOdds);
      if (odds.length > 1) {
        const validOdds = odds.filter((odd): odd is number => typeof odd === 'number');
        return validOdds.length > 1 && Math.max(...validOdds) - Math.min(...validOdds) > 0.15;
      }
    }
    return false;
  });

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Arbitrage Opportunities</h3>
      <div className="grid grid-cols-1 gap-4">
        {opportunities.map(([key, value], index) => (
          <motion.div
            key={key}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between items-center">
              <span className="font-medium">{key}</span>
              <span className="text-lg font-bold text-green-600">
                {typeof value === 'object' && value !== null
                  ? (() => {
                      const odds = Object.values(value as BookOdds).filter(
                        (odd): odd is number => typeof odd === 'number'
                      );
                      return odds.length > 1
                        ? `${((Math.max(...odds) - Math.min(...odds)) * 100).toFixed(1)}% spread`
                        : 'N/A';
                    })()
                  : 'N/A'}
              </span>
            </div>
            {typeof value === 'object' && value !== null && (
              <div className="mt-2 text-sm text-gray-600">
                {Object.entries(value as BookOdds).map(([book, odds]) => (
                  <div key={book} className="flex justify-between">
                    <span>{book}</span>
                    <span>{typeof odds === 'number' ? odds.toFixed(2) : 'N/A'}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        ))}
        {opportunities.length === 0 && (
          <div className="text-center py-8 text-gray-500">No arbitrage opportunities found</div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ArbitrageDetector);
