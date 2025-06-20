import React from 'react';
import { LiveOddsTickerProps, BookOdds } from '../types/betting';
import { motion, AnimatePresence } from 'framer-motion';

const LiveOddsTicker: React.FC<LiveOddsTickerProps> = ({ data, className = '' }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div className={`p-4 text-gray-500 ${className}`}>No live odds available</div>;
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Live Odds</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(data as Record<string, BookOdds>).map(([market, bookOdds], index) => (
          <motion.div
            key={market}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{market}</span>
            </div>
            <div className="space-y-1">
              {Object.entries(bookOdds).map(([bookmaker, odds]) => (
                <div key={bookmaker} className="flex justify-between text-sm">
                  <span className="text-gray-600">{bookmaker}</span>
                  <span className="font-medium">{odds.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default React.memo(LiveOddsTicker);
