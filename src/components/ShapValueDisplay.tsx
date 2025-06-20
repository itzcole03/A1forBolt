import React, { useState } from 'react';
import { ShapBreakdownModal } from './ShapBreakdownModal';
import { ShapValue } from '../types/explainability';

interface ShapValueDisplayProps {
  feature: ShapValue;
}

export function ShapValueDisplay({ feature }: ShapValueDisplayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getColor = (value: number) => {
    if (value > 0) return 'bg-green-500';
    if (value < 0) return 'bg-red-500';
    return 'bg-gray-500';
  };

  const getBarWidth = (value: number) => {
    // Normalize the value to a percentage between 0 and 100
    const normalizedValue = Math.abs(value) * 100;
    return Math.min(normalizedValue, 100);
  };

  return (
    <>
      <div
        className="space-y-1 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">{feature.feature}</span>
          <span className="font-medium">{feature.value.toFixed(3)}</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`${getColor(feature.value)} h-full transition-all duration-300 ease-in-out`}
            style={{
              width: `${getBarWidth(feature.value)}%`,
              marginLeft: feature.value < 0 ? 'auto' : '0',
            }}
          />
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>Weight: {feature.weight?.toFixed(2) ?? 'N/A'}</span>
          <span>
            {feature.value > 0
              ? 'Positive Impact'
              : feature.value < 0
                ? 'Negative Impact'
                : 'Neutral'}
          </span>
        </div>
      </div>

      <ShapBreakdownModal
        feature={feature}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
