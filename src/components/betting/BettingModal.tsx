import { useRiskProfile } from '@/hooks/useRiskProfile';
import React, { useState } from 'react';
import { BettingStrategy, RiskProfile } from '../../types/betting';
import { Event, Market, Odds, Selection } from '../../types/sports';
import { RiskReasoningDisplay } from '../shared/RiskReasoningDisplay';
import { Badge, Button, Card, Icon, Spinner } from '../ui/UnifiedUI';

interface BettingModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event;
  market: Market;
  selection: Selection;
  odds: Odds;
  confidenceScore: number;
  expectedValue: number;
  kellyFraction: number;
  riskProfile: RiskProfile;
  selectedStrategy: BettingStrategy;
  onStrategyChange: (strategy: BettingStrategy) => void;
  stake: number;
  onStakeChange: (stake: number) => void;
  onPlaceBet: () => void;
  isLoading: boolean;
  error: string | null;
}

export const BettingModal: React.FC<BettingModalProps> = ({
  isOpen,
  onClose,
  event,
  market,
  selection,
  odds,
  confidenceScore,
  expectedValue,
  kellyFraction,
  riskProfile,
  selectedStrategy,
  onStrategyChange,
  stake,
  onStakeChange,
  onPlaceBet,
  isLoading,
  error: externalError,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { validateBet } = useRiskProfile();

  if (!isOpen) return null;

  const getStrategyDescription = (strategy: BettingStrategy): string => {
    switch (strategy) {
      case 'kelly':
        return 'Kelly Criterion: Optimal bet sizing based on edge and odds';
      case 'fixed':
        return 'Fixed Stake: Consistent bet size regardless of edge';
      case 'martingale':
        return 'Martingale: Double stake after losses';
      case 'fibonacci':
        return 'Fibonacci: Progressive stake based on Fibonacci sequence';
      default:
        return '';
    }
  };

  const getRecommendedStake = (): number => {
    switch (selectedStrategy) {
      case 'kelly':
        return kellyFraction * 100;
      case 'fixed':
        return 10; // Default fixed stake
      case 'martingale':
        return stake * 2; // Double previous stake
      case 'fibonacci':
        // Simple Fibonacci sequence implementation
        const fib = [1, 1, 2, 3, 5, 8, 13, 21];
        return fib[Math.min(fib.length - 1, Math.floor(stake / 10))] * 10;
      default:
        return stake;
    }
  };

  const handlePlaceBet = () => {
    const betData = {
      stake,
      confidence: confidenceScore,
      kellyFraction,
      sport: event.sport || '',
      market: market.name || '',
      eventId: event.id || '',
    };
    const validation = validateBet(betData);
    if (!validation.isValid) {
      setError('Bet does not meet risk profile: ' + validation.errors.join(', '));
      return;
    }
    setError(null);
    onPlaceBet();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl p-6" variant="bordered">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-semibold">Place Bet</h3>
            <p className="text-gray-600">
              {event.name} - {market.name}
            </p>
          </div>
          <Button size="small" variant="ghost" onClick={onClose}>
            <Icon className="w-5 h-5" name="x-mark" />
          </Button>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Selection</p>
              <p className="font-medium">{selection.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Odds</p>
              <p className="font-medium">{odds.value.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Confidence</p>
              <div className="flex items-center space-x-2">
                <p className="font-medium">{(confidenceScore * 100).toFixed(1)}%</p>
                <Badge
                  variant={
                    confidenceScore >= 0.7
                      ? 'success'
                      : confidenceScore >= 0.5
                        ? 'warning'
                        : 'danger'
                  }
                >
                  {confidenceScore >= 0.7 ? 'High' : confidenceScore >= 0.5 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600">Expected Value</p>
              <p
                className={`font-medium ${expectedValue >= 0 ? 'text-green-500' : 'text-red-500'}`}
              >
                {(expectedValue * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Kelly Fraction</p>
              <p className="font-medium">{(kellyFraction * 100).toFixed(1)}%</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Betting Strategy</p>
            <div className="grid grid-cols-2 gap-2">
              {(['kelly', 'fixed', 'martingale', 'fibonacci'] as BettingStrategy[]).map(
                strategy => (
                  <Button
                    key={strategy}
                    className="justify-start"
                    size="small"
                    variant={selectedStrategy === strategy ? 'primary' : 'secondary'}
                    onClick={() => onStrategyChange(strategy)}
                  >
                    <Icon
                      className="w-4 h-4 mr-2"
                      name={selectedStrategy === strategy ? 'check-circle' : 'circle'}
                    />
                    {strategy.charAt(0).toUpperCase() + strategy.slice(1)}
                  </Button>
                )
              )}
            </div>
            <p className="text-sm text-gray-600 mt-2">{getStrategyDescription(selectedStrategy)}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-2">Stake</p>
            <div className="flex items-center space-x-4">
              <input
                className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                step="0.01"
                type="number"
                value={stake}
                onChange={e => onStakeChange(Number(e.target.value))}
              />
              <Button
                size="small"
                variant="secondary"
                onClick={() => onStakeChange(getRecommendedStake())}
              >
                Use Recommended
              </Button>
            </div>
          </div>

          <div>
            <Button
              className="flex items-center"
              size="small"
              variant="ghost"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Icon className="w-4 h-4 mr-2" name={showAdvanced ? 'chevron-up' : 'chevron-down'} />
              Advanced Options
            </Button>

            {showAdvanced && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-medium mb-2">Risk Profile</p>
                    <div className="flex items-center space-x-2">
                      <Badge variant={riskProfile.riskLevel.toLowerCase() as any}>
                        {riskProfile.riskLevel}
                      </Badge>
                      <p className="text-sm text-gray-600">{riskProfile.recommendation}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Top Risk Factors</p>
                    <div className="space-y-2">
                      {riskProfile.factors.map((factor, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <p className="text-sm">{factor.name}</p>
                          <Badge variant={factor.severity.toLowerCase() as any}>
                            {factor.severity}
                          </Badge>
                        </div>
                      ))}
                    </div>
                    {/* Risk Reasoning Display (if present) */}
                    {Array.isArray((riskProfile as any).risk_reasoning) && (riskProfile as any).risk_reasoning.length > 0 && (
                      <RiskReasoningDisplay riskReasoning={(riskProfile as any).risk_reasoning} className="mt-3" />
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="text-red-500 text-center">
              <Icon className="w-5 h-5 mx-auto mb-2" name="exclamation-circle" />
              <p>{error}</p>
            </div>
          )}
          {externalError && !error && (
            <div className="text-red-500 text-center">
              <Icon className="w-5 h-5 mx-auto mb-2" name="exclamation-circle" />
              <p>{externalError}</p>
            </div>
          )}

          <div className="flex justify-end space-x-4">
            <Button disabled={isLoading} variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button disabled={isLoading || stake <= 0} variant="primary" onClick={handlePlaceBet}>
              {isLoading ? (
                <>
                  <Spinner className="mr-2" size="small" />
                  Placing Bet...
                </>
              ) : (
                'Place Bet'
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
