import React, { memo } from 'react';
import { BettingOpportunityCardProps } from '@/types/betting';
import { ModelConfidenceIndicator } from '../ml-status-indicators';
import { PredictionConfidenceChart } from '../advanced-charts';

export const BettingOpportunityCard = memo<BettingOpportunityCardProps>(
  ({ opportunity, onPlaceBet, isActive = false }) => {
    const [betAmount, setBetAmount] = React.useState<number>(0);

    const handlePlaceBet = () => {
      if (betAmount > 0) {
        onPlaceBet(betAmount);
        setBetAmount(0);
      }
    };

    return (
      <div
        className={`glass-premium p-4 rounded-xl transition-all ${
          isActive ? 'ring-2 ring-primary-500' : ''
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-lg font-semibold">{opportunity.event}</h4>
            <p className="text-sm text-gray-500">{opportunity.market}</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Odds</p>
              <p className="text-xl font-bold text-primary-500">{opportunity.odds.toFixed(2)}</p>
            </div>
            <ModelConfidenceIndicator confidence={opportunity.confidence} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Expected Value</p>
            <p
              className={`text-lg font-semibold ${
                opportunity.expectedValue >= 0 ? 'text-success-500' : 'text-error-500'
              }`}
            >
              {opportunity.expectedValue.toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Kelly Fraction</p>
            <p className="text-lg font-semibold text-primary-500">
              {(opportunity.kellyFraction * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Model Consensus</p>
            <div className="flex items-center space-x-2">
              <PredictionConfidenceChart
                data={Object.entries(opportunity.modelBreakdown).map(([model, value]) => ({
                  model,
                  value,
                }))}
                height={40}
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <input
            className="flex-1 px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            min="0"
            placeholder="Enter bet amount"
            step="1"
            type="number"
            value={betAmount}
            onChange={e => setBetAmount(Number(e.target.value))}
          />
          <button
            className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={betAmount <= 0}
            onClick={handlePlaceBet}
          >
            Place Bet
          </button>
        </div>
      </div>
    );
  }
);

BettingOpportunityCard.displayName = 'BettingOpportunityCard';
