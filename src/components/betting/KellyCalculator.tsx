import React, { useMemo } from 'react';

interface KellyCalculatorProps {
  prediction?: number;
  confidence?: number;
  marketEdge?: number;
}

const KellyCalculator: React.FC<KellyCalculatorProps> = ({
  prediction,
  confidence,
  marketEdge,
}) => {
  const kellyValue = useMemo(() => {
    if (!prediction || !confidence || !marketEdge) return 0;

    // Kelly Criterion formula: f* = (bp - q) / b
    // where:
    // f* = fraction of bankroll to bet
    // b = odds received on bet (decimal odds - 1)
    // p = probability of winning
    // q = probability of losing (1 - p)

    const p = prediction * confidence;
    const q = 1 - p;
    const b = marketEdge;

    const kelly = (b * p - q) / b;
    return Math.max(0, Math.min(kelly, 0.5)); // Cap at 50% of bankroll
  }, [prediction, confidence, marketEdge]);

  const getRiskLevel = (value: number) => {
    if (value <= 0.05) return 'Conservative';
    if (value <= 0.15) return 'Moderate';
    return 'Aggressive';
  };

  const getRiskColor = (value: number) => {
    if (value <= 0.05) return 'text-green-500';
    if (value <= 0.15) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="premium-input-container p-4">
          <div className="text-sm text-gray-500">Kelly Value</div>
          <div className="text-2xl font-bold text-primary-500">
            {(kellyValue * 100).toFixed(1)}%
          </div>
        </div>
        <div className="premium-input-container p-4">
          <div className="text-sm text-gray-500">Risk Level</div>
          <div className={`text-2xl font-bold ${getRiskColor(kellyValue)}`}>
            {getRiskLevel(kellyValue)}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-sm font-medium">Recommended Bet Size</div>
        <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute h-full bg-primary-500 transition-all duration-500"
            style={{ width: `${kellyValue * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>0%</span>
          <span>25%</span>
          <span>50%</span>
        </div>
      </div>

      <div className="text-sm text-gray-500">
        <p>
          The Kelly Criterion suggests betting {kellyValue.toFixed(3)} of your bankroll based on the
          prediction confidence and market edge. This is a{' '}
          <span className={getRiskColor(kellyValue)}>{getRiskLevel(kellyValue)}</span> bet size.
        </p>
        <p className="mt-2">
          Note: Always consider your risk tolerance and never bet more than you can afford to lose.
        </p>
      </div>
    </div>
  );
};

export default React.memo(KellyCalculator);
