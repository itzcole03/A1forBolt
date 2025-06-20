// ConfidenceBands: Visualizes model confidence intervals for predictions
// TODO: Add tests and real data binding
import React from 'react';

export interface ConfidenceBandsProps {
  lower: number;
  upper: number;
  mean: number;
}

const ConfidenceBands: React.FC<ConfidenceBandsProps> = ({ lower, upper, mean }) => (
  <div className="confidence-bands">
    <div>Confidence Interval: {lower} - {upper}</div>
    <div>Mean: {mean}</div>
    {/* TODO: Add chart visualization */}
  </div>
);

export default ConfidenceBands;
