import { useState } from 'react';
import { useBettingAnalytics } from '../../hooks/useBettingAnalytics';
import { BettingStrategy } from '../../services/unified/UnifiedBettingAnalytics';
import { RiskReasoningDisplay } from '../shared/RiskReasoningDisplay';

interface BettingAnalyticsProps {
  market: string;
  initialOdds: number;
  initialStake: number;
  className?: string;
}

export function BettingAnalytics({
  market,
  initialOdds,
  initialStake,
  className = '',
}: BettingAnalyticsProps) {
  const [odds, setOdds] = useState(initialOdds);
  const [stake, setStake] = useState(initialStake);

  const {
    analysis,
    isLoading,
    error,
    strategies,
    addStrategy,
    removeStrategy,
    calculatePotentialProfit,
    getRecommendedStake,
    getRiskAssessment,
  } = useBettingAnalytics({
    market,
    odds,
    stake,
    autoRefresh: true,
  });

  const handleAddStrategy = () => {
    const newStrategy: BettingStrategy = {
      id: crypto.randomUUID(),
      name: 'Custom Strategy',
      riskLevel: 'medium',
      stakePercentage: 5,
      minOdds: 1.5,
      maxOdds: 3.0,
    };
    addStrategy(newStrategy);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        <p>Error loading analysis: {error.message}</p>
      </div>
    );
  }

  const riskAssessment = getRiskAssessment();
  const recommendedStake = getRecommendedStake();
  const potentialProfit = calculatePotentialProfit(stake);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Market Information */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Market Analysis</h2>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Odds</label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                step="0.01"
                type="number"
                value={odds}
                onChange={e => setOdds(Number(e.target.value))}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">Stake</label>
              <input
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="0"
                step="1"
                type="number"
                value={stake}
                onChange={e => setStake(Number(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Risk Assessment */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900">Risk Assessment</h2>
          <div
            className={`p-4 rounded-lg ${riskAssessment.level === 'low'
                ? 'bg-green-50 text-green-700'
                : riskAssessment.level === 'medium'
                  ? 'bg-yellow-50 text-yellow-700'
                  : 'bg-red-50 text-red-700'
              }`}
          >
            <p className="font-semibold capitalize">Risk Level: {riskAssessment.level}</p>
            <ul className="mt-2 space-y-1">
              {riskAssessment.factors.map((factor, index) => (
                <li key={index}>2 {factor}</li>
              ))}
            </ul>
            {/* Risk Reasoning Display */}
            {analysis?.risk_reasoning && (
              <RiskReasoningDisplay riskReasoning={analysis.risk_reasoning} className="mt-3" />
            )}
          </div>
        </div>

        {/* Analytics */}
        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900">Recommended Stake</h3>
            <p className="text-2xl font-bold text-blue-600">${recommendedStake.toFixed(2)}</p>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900">Potential Profit</h3>
            <p className="text-2xl font-bold text-green-600">${potentialProfit.toFixed(2)}</p>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-purple-900">Prediction Confidence</h3>
            <p className="text-2xl font-bold text-purple-600">
              {analysis?.predictionConfidence
                ? `${(analysis.predictionConfidence * 100).toFixed(1)}%`
                : 'N/A'}
            </p>
          </div>
        </div>

        {/* Strategies */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Active Strategies</h2>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              onClick={handleAddStrategy}
            >
              Add Strategy
            </button>
          </div>
          <div className="space-y-4">
            {strategies.map(strategy => (
              <div
                key={strategy.id}
                className="flex items-center justify-between bg-gray-50 rounded-lg p-4"
              >
                <div>
                  <h3 className="font-semibold">{strategy.name}</h3>
                  <p className="text-sm text-gray-600">
                    Risk: {strategy.riskLevel} | Stake: {strategy.stakePercentage}%
                  </p>
                </div>
                <button
                  className="text-red-600 hover:text-red-800"
                  onClick={() => removeStrategy(strategy.id)}
                >
                  Remove
                </button>
              </div>
            ))}
            {strategies.length === 0 && (
              <p className="text-gray-500 text-center py-4">No active strategies</p>
            )}
          </div>
        </div>

        {/* Hedging Opportunities */}
        {analysis?.hedgingOpportunities && analysis.hedgingOpportunities.length > 0 && (
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Hedging Opportunities</h2>
            <div className="space-y-4">
              {analysis.hedgingOpportunities.map((opportunity, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-lg p-4 flex items-center justify-between"
                >
                  <div>
                    <h3 className="font-semibold">{opportunity.market}</h3>
                    <p className="text-sm text-gray-600">
                      Odds: {opportunity.odds} | Recommended Stake: $
                      {opportunity.recommendedStake.toFixed(2)}
                    </p>
                  </div>
                  <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600">
                    Place Hedge
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
