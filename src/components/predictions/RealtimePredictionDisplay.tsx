import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Prediction } from '../../types/prediction';
import ConfidenceIndicator from './ConfidenceIndicator';
import ShapValueDisplay from './ShapValueDisplay';
import PayoutPreviewPanel from './PayoutPreviewPanel';

interface RealtimePredictionDisplayProps {
  sport: string;
  eventId: string;
}

const RealtimePredictionDisplay: React.FC<RealtimePredictionDisplayProps> = ({
  sport,
  eventId,
}) => {
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { lastMessage, connectionStatus } = useWebSocket(
    `${import.meta.env.VITE_WEBSOCKET_URL}/predictions/${sport}/${eventId}`
  );

  useEffect(() => {
    if (lastMessage) {
      try {
        const data = JSON.parse(lastMessage);
        setPrediction(data);
        setError(null);
      } catch (err) {
        setError('Failed to parse prediction data');
      }
      setIsLoading(false);
    }
  }, [lastMessage]);

  if (isLoading) {
    return (
      <div className="modern-card p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="modern-card p-6 bg-red-50 dark:bg-red-900/20">
        <p className="text-red-600 dark:text-red-400">{error}</p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="modern-card p-6">
        <p className="text-gray-500 dark:text-gray-400">No prediction available</p>
      </div>
    );
  }

  return (
    <div className="modern-card p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">{prediction.eventName}</h3>
        <span
          className={`px-2 py-1 rounded text-sm ${
            connectionStatus === 'Connected'
              ? 'bg-green-100 text-green-800'
              : 'bg-yellow-100 text-yellow-800'
          }`}
        >
          {connectionStatus}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium mb-2">Prediction Details</h4>
          <div className="space-y-2">
            <p>Bet Type: {prediction.betType}</p>
            <p>Recommended Stake: {prediction.recommendedStake}%</p>
            <ConfidenceIndicator confidence={prediction.confidence} />
          </div>
        </div>

        <div>
          <h4 className="font-medium mb-2">Feature Impact</h4>
          <ShapValueDisplay shapValues={prediction.shapValues} />
        </div>
      </div>

      <PayoutPreviewPanel prediction={prediction} stake={prediction.recommendedStake} />
    </div>
  );
};

export default React.memo(RealtimePredictionDisplay);
