// ConfidenceBandChart.tsx
// Visualizes the confidence band for a prediction

import React from 'react';
import type { ConfidenceBand } from '../../types/confidence';

interface ConfidenceBandChartProps {
  band: ConfidenceBand | null;
}

export const ConfidenceBandChart: React.FC<ConfidenceBandChartProps> = ({ band }) => {
  if (!band) return <div className="text-gray-400">No confidence data</div>;
  const { lower, upper, mean, confidenceLevel } = band;
  // Simple horizontal bar visualization
  return (
    <div className="w-full flex flex-col items-center my-2">
      <div className="w-3/4 h-4 bg-gray-200 rounded relative">
        <div
          className="absolute bg-blue-400 h-4 rounded"
          style={{ left: `${((lower - lower) / (upper - lower)) * 100}%`, width: `${((upper - lower) / (upper - lower)) * 100}%` }}
        />
        <div
          className="absolute left-1/2 top-0 h-4 w-1 bg-black"
          style={{ left: `${((mean - lower) / (upper - lower)) * 100}%` }}
        />
      </div>
      <div className="text-xs mt-1 text-gray-700">
        {`[${lower.toFixed(2)} - ${upper.toFixed(2)}]`} (mean: {mean.toFixed(2)}, {Math.round(confidenceLevel * 100)}% CI)
      </div>
    </div>
  );
};
