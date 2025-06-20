import React from 'react';

const ConfidenceIndicator = ({ confidence }) => {
  const getColor = () => {
    if (confidence >= 0.85) return 'bg-green-500';
    if (confidence >= 0.7) return 'bg-yellow-400';
    return 'bg-red-400';
  };

  return (
    <div
      className={`mt-2 text-sm font-medium px-2 py-1 rounded-full text-white inline-block ${getColor()}`}
      title={`Confidence: ${(confidence * 100).toFixed(1)}%`}
    >
      {(confidence * 100).toFixed(0)}%
    </div>
  );
};

export default ConfidenceIndicator;