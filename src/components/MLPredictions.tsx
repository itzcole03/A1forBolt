import React, { useState, useEffect } from "react";
import { usePredictions } from "../store/unified/UnifiedStoreManager";
import { mlEngine } from "../services/ml/UnifiedMLEngine";
import type {
  PredictionInput,
  EnsemblePrediction,
} from "../services/ml/UnifiedMLEngine";

interface MLPredictionsProps {
  eventId?: string;
  sport?: string;
}

export const MLPredictions: React.FC<MLPredictionsProps> = ({
  eventId,
  sport = "basketball_nba",
}) => {
  const { predictions, latestPredictions, updatePrediction } = usePredictions();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState(eventId || "");

  const generatePrediction = async () => {
    if (!selectedEventId) return;

    setIsGenerating(true);
    try {
      const input: PredictionInput = {
        eventId: selectedEventId,
        sport,
        homeTeam: "Team A",
        awayTeam: "Team B",
        features: {
          elo_difference: 50,
          player_recent_form: 0.8,
          home_court_advantage: 2.5,
          rest_days: 1,
          injury_impact: 0.1,
        },
        market: "moneyline",
        timestamp: Date.now(),
      };

      const prediction = await mlEngine.generatePrediction(input);

      updatePrediction(selectedEventId, {
        id: selectedEventId,
        confidence: prediction.confidence,
        predictedValue: prediction.finalPrediction,
        factors: prediction.factors,
        timestamp: Date.now(),
        metadata: {
          modelVersion: "ensemble_v1.0",
          features: input.features,
        },
      });
    } catch (error) {
      console.error("Failed to generate prediction:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatConfidence = (confidence: number) => {
    return (confidence * 100).toFixed(1);
  };

  const formatPrediction = (value: number) => {
    return (value * 100).toFixed(1);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          ML Predictions
        </h2>

        {/* Generate New Prediction */}
        <div className="mb-6">
          <div className="flex space-x-4 mb-4">
            <input
              type="text"
              placeholder="Enter Event ID"
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={generatePrediction}
              disabled={!selectedEventId || isGenerating}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Generating..." : "Generate Prediction"}
            </button>
          </div>
        </div>

        {/* Current Prediction */}
        {selectedEventId && predictions[selectedEventId] && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Event: {selectedEventId}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {formatPrediction(
                    predictions[selectedEventId].predictedValue,
                  )}
                  %
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Win Probability
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {formatConfidence(predictions[selectedEventId].confidence)}%
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Confidence
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {predictions[selectedEventId].factors.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Key Factors
                </div>
              </div>
            </div>

            {/* Key Factors */}
            {predictions[selectedEventId].factors.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Key Factors
                </h4>
                <div className="space-y-2">
                  {predictions[selectedEventId].factors
                    .slice(0, 5)
                    .map((factor, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {factor.name
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-16 h-2 rounded-full ${
                              factor.direction === "positive"
                                ? "bg-green-200"
                                : "bg-red-200"
                            }`}
                          >
                            <div
                              className={`h-full rounded-full ${
                                factor.direction === "positive"
                                  ? "bg-green-500"
                                  : "bg-red-500"
                              }`}
                              style={{
                                width: `${Math.abs(factor.impact) * 100}%`,
                              }}
                            />
                          </div>
                          <span
                            className={`text-sm font-medium ${
                              factor.direction === "positive"
                                ? "text-green-600"
                                : "text-red-600"
                            }`}
                          >
                            {factor.direction === "positive" ? "+" : "-"}
                            {(Math.abs(factor.impact) * 100).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Recent Predictions */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Predictions
          </h3>
          {latestPredictions.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400 text-center py-8">
              No predictions yet. Generate your first prediction above.
            </p>
          ) : (
            <div className="space-y-3">
              {latestPredictions.slice(0, 10).map((prediction) => (
                <div
                  key={prediction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      Event {prediction.id}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(prediction.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-blue-600">
                      {formatPrediction(prediction.predictedValue)}%
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatConfidence(prediction.confidence)}% confidence
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MLPredictions;
