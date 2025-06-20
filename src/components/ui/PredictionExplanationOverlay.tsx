import React from 'react';
import GlassCard from './GlassCard';

export interface PredictionExplanationData {
  sentiment?: string;
  news?: string;
  playerProps?: string;
  marketMovement?: string;
}

export interface PredictionExplanationOverlayProps {
  open: boolean;
  onClose: () => void;
  data: PredictionExplanationData;
}

const PredictionExplanationOverlay: React.FC<PredictionExplanationOverlayProps> = ({ open, onClose, data }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg mx-auto animate-scale-in">
        <GlassCard className="p-8">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-primary-500 text-2xl font-bold focus:outline-none"
            onClick={onClose}
            aria-label="Close"
          >
            &times;
          </button>
          <h2 className="text-2xl font-bold mb-4 text-primary-600">Why this prediction?</h2>
          <ul className="space-y-3">
            {data.sentiment && (
              <li>
                <span className="font-semibold text-pink-400">Sentiment:</span> {data.sentiment}
              </li>
            )}
            {data.news && (
              <li>
                <span className="font-semibold text-blue-400">News Impact:</span> {data.news}
              </li>
            )}
            {data.playerProps && (
              <li>
                <span className="font-semibold text-yellow-400">Player Props:</span> {data.playerProps}
              </li>
            )}
            {data.marketMovement && (
              <li>
                <span className="font-semibold text-green-400">Market Movement:</span> {data.marketMovement}
              </li>
            )}
          </ul>
        </GlassCard>
      </div>
    </div>
  );
};

export default PredictionExplanationOverlay;
