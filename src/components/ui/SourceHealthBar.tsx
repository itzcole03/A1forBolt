// SourceHealthBar: Shows health/availability of data sources
// TODO: Add tests and real-time status polling
import React from 'react';

export interface SourceHealthBarProps {
  sources: { name: string; healthy: boolean }[];
}

const SourceHealthBar: React.FC<SourceHealthBarProps> = ({ sources }) => (
  <div className="source-health-bar">
    <div>Source Health:</div>
    <div style={{ display: 'flex' }}>
      {sources.map((src, idx) => (
        <div
          key={idx}
          style={{
            width: 60,
            height: 12,
            background: src.healthy ? 'green' : 'red',
            margin: 3,
            color: '#fff',
            textAlign: 'center',
            fontSize: 10,
          }}
        >
          {src.name}
        </div>
      ))}
    </div>
  </div>
);

export default SourceHealthBar;
