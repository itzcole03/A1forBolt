import React from 'react';
import { ShapValue } from '../../types/explainability';

interface ShapValueDisplayProps {
  shapValues: ShapValue[];
}

const ShapValueDisplay: React.FC<ShapValueDisplayProps> = ({ shapValues }) => {
  const sortedValues = [...shapValues].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));

  return (
    <div className="space-y-2">
      {sortedValues.map((item, index) => (
        <div key={index} className="flex items-center justify-between">
          <span className="text-sm truncate max-w-[60%]">{item.feature}</span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${item.impact > 0 ? 'bg-green-500' : 'bg-red-500'}`}
                style={{
                  width: `${Math.min(Math.abs(item.value) * 100, 100)}%`,
                  marginLeft: item.impact < 0 ? 'auto' : '0',
                }}
              />
            </div>
            <span
              className={`text-sm font-medium ${
                item.impact > 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {item.value.toFixed(2)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(ShapValueDisplay);
