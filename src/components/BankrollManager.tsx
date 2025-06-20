import React, { useState } from 'react';
import { motion } from 'framer-motion';

export interface BankrollManagerProps {
  userId: string;
}

 
const BankrollManager: React.FC<BankrollManagerProps> = ({ userId: _userId }) => {
  const [bankroll, setBankroll] = useState(1000);
  const [riskLevel, setRiskLevel] = useState(0.02); // 2% default risk per bet

  const recommendedStake = bankroll * riskLevel;
  const maxDailyRisk = bankroll * 0.1; // 10% max daily risk
  const stopLoss = bankroll * 0.05; // 5% stop loss

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Bankroll Management</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
        >
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Bankroll ($)
            </label>
            <input
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              type="number"
              value={bankroll}
              onChange={e => setBankroll(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Risk Level (% per bet)
            </label>
            <input
              className="w-full"
              max={0.1}
              min={0.01}
              step={0.01}
              type="range"
              value={riskLevel}
              onChange={e => setRiskLevel(Number(e.target.value))}
            />
            <div className="text-sm text-gray-600 mt-1">
              {(riskLevel * 100).toFixed(1)}% per bet
            </div>
          </div>
        </motion.div>

        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg p-4 shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          transition={{ delay: 0.1 }}
        >
          <h4 className="font-medium mb-4">Recommendations</h4>
          <div className="space-y-3">
            <div>
              <div className="text-sm text-gray-600">Recommended Stake</div>
              <div className="text-xl font-bold text-blue-600">${recommendedStake.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Max Daily Risk</div>
              <div className="text-xl font-bold text-blue-600">${maxDailyRisk.toFixed(2)}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Stop Loss</div>
              <div className="text-xl font-bold text-red-600">${stopLoss.toFixed(2)}</div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default React.memo(BankrollManager);
