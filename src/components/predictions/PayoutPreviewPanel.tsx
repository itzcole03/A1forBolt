import React, { useState } from 'react';
import { Prediction } from '../../types/prediction';

interface PayoutPreviewPanelProps {
  prediction: Prediction;
  stake: number;
}

const PayoutPreviewPanel: React.FC<PayoutPreviewPanelProps> = ({ prediction, stake }) => {
  const [customStake, setCustomStake] = useState(stake);

  const calculatePayout = (stakeAmount: number): number => {
    return stakeAmount * prediction.odds;
  };

  const calculateProfit = (stakeAmount: number): number => {
    return calculatePayout(stakeAmount) - stakeAmount;
  };

  const handleStakeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setCustomStake(value);
    }
  };

  return (
    <div className="modern-card p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
      <h4 className="font-medium mb-4">Payout Preview</h4>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium" htmlFor="stake">
            Stake Amount
          </label>
          <div className="flex items-center gap-2">
            <input
              className="w-24 px-2 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="stake"
              min="0"
              step="0.01"
              type="number"
              value={customStake}
              onChange={handleStakeChange}
            />
            <span className="text-sm text-gray-500">%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Potential Payout</p>
            <p className="text-lg font-semibold text-green-600 dark:text-green-400">
              ${calculatePayout(customStake).toFixed(2)}
            </p>
          </div>

          <div className="p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
            <p className="text-sm text-gray-500 dark:text-gray-400">Potential Profit</p>
            <p className="text-lg font-semibold text-blue-600 dark:text-blue-400">
              ${calculateProfit(customStake).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          <p>Odds: {prediction.odds.toFixed(2)}</p>
          <p>Risk Level: {prediction.riskLevel}</p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PayoutPreviewPanel);
