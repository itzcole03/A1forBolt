// RiskHeatMap: Visualizes risk levels for bets or predictions
// TODO: Add tests and real data binding
import React from 'react';

export interface RiskHeatMapProps {
  riskScores: number[];
}

const RiskHeatMap: React.FC<RiskHeatMapProps> = ({ riskScores }) => (
  <div className="risk-heatmap">
    <div>Risk Heat Map:</div>
    <div style={{ display: 'flex' }}>
      {riskScores.map((score, idx) => (
        <div
          key={idx}
          style={{
            width: 20,
            height: 20,
            background: `rgba(255,0,0,${score})`,
            margin: 2,
          }}
          title={`Risk: ${score}`}
        />
      ))}
    </div>
  </div>
);

export default RiskHeatMap;
