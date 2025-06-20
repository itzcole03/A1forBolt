import React from 'react';
import { Card, Badge, Button, Icon } from '../ui/UnifiedUI';
import { PredictionModelOutput } from '../../hooks/usePredictions';

interface MoneyMakerResultsProps {
  event: string;
  market: string;
  selection: string;
  odds: number;
  modelOutput: PredictionModelOutput;
  kellyFraction: number;
  expectedValue: number;
  timestamp: number;
  onPlaceBet: () => void;
  className?: string;
}

export const MoneyMakerResults: React.FC<MoneyMakerResultsProps> = ({
  event,
  market,
  selection,
  odds,
  modelOutput,
  kellyFraction,
  expectedValue,
  timestamp,
  onPlaceBet,
  className = '',
}) => {
  const { confidenceScore, confidenceColor, modelMeta } = modelOutput;

  const getKellyColor = (fraction: number): 'success' | 'warning' | 'danger' => {
    if (fraction >= 0.1) return 'success';
    if (fraction >= 0.05) return 'warning';
    return 'danger';
  };

  const getEVColor = (ev: number): 'success' | 'warning' | 'danger' => {
    if (ev >= 0.1) return 'success';
    if (ev >= 0) return 'warning';
    return 'danger';
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{event}</h3>
          <p className="text-sm text-gray-600">
            {market} - {selection}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <Badge variant={confidenceColor}>{confidenceScore.toFixed(2)}</Badge>
          <Badge variant={getEVColor(expectedValue)}>EV: {expectedValue.toFixed(2)}</Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-600">Odds</p>
          <p className="text-lg font-semibold">{odds.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Kelly Fraction</p>
          <div className="flex items-center space-x-2">
            <p className="text-lg font-semibold">{(kellyFraction * 100).toFixed(1)}%</p>
            <Badge variant={getKellyColor(kellyFraction)}>
              {kellyFraction >= 0.1 ? 'Strong' : kellyFraction >= 0.05 ? 'Moderate' : 'Weak'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <Icon className="w-4 h-4" name="info" />
          <span>
            Model: {modelMeta.type} v{modelMeta.version}
          </span>
        </div>
        <Button
          aria-label="Place Bet"
          disabled={kellyFraction < 0.05 || expectedValue < 0}
          variant="primary"
          onClick={onPlaceBet}
        >
          Place Bet
        </Button>
      </div>
    </Card>
  );
};
