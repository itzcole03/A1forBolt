import React, { useEffect, useState } from 'react';
import { GeneralInsight } from '../services/predictionService';
import { ML_CONFIG } from '../config/constants';
import { usePrediction } from '../hooks/usePrediction';


interface PredictionDisplayProps {
    propId?: string;
    initialFeatures?: { [key: string]: number };
    context?: { [key: string]: any };
}

interface FeatureContribution {
    name: string;
    value: number;
    importance: number;
}

export const PredictionDisplay: React.FC<PredictionDisplayProps> = ({
    propId,
    initialFeatures,
    context
}) => {
    const { makePrediction, getInsights, isLoading, error, lastPrediction } = usePrediction();
    const [insights, setInsights] = useState<GeneralInsight[]>([]);
    const [features, setFeatures] = useState<{ [key: string]: number }>(
        initialFeatures || {
            player_points: 0,
            team_points: 0,
            opponent_points: 0,
            minutes_played: 0,
            home_game: 0,
            days_rest: 0
        }
    );
    const [featureContributions, setFeatureContributions] = useState<FeatureContribution[]>([]);
    const [showAdvancedMetrics, setShowAdvancedMetrics] = useState(false);

    useEffect(() => {
        const loadInsights = async () => {
            try {
                const data = await getInsights();
                setInsights(data);
            } catch (err) {
                console.error('Failed to load insights:', err);
            }
        };
        loadInsights();
    }, [getInsights]);

    const handleFeatureChange = (key: string, value: number) => {
        setFeatures(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePredict = async () => {
        try {
            const response = await makePrediction(features, propId, context);
            if (response.insights?.feature_contributions) {
                const contributions = Object.entries(response.insights.feature_contributions)
                    .map(([name, importance]) => ({
                        name,
                        value: features[name],
                        importance: importance as number
                    }))
                    .sort((a, b) => b.importance - a.importance);
                setFeatureContributions(contributions);
            }
        } catch (err) {
            console.error('Prediction failed:', err);
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-green-600';
        if (confidence >= 0.6) return 'text-yellow-600';
        return 'text-red-600';
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">ML Prediction</h2>
            
            {/* Feature Inputs */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {Object.entries(features).map(([key, value]) => (
                    <div key={key} className="flex flex-col">
                        <label className="text-sm font-medium text-gray-700 mb-1">
                            {key.replace(/_/g, ' ').toUpperCase()}
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => handleFeatureChange(key, parseFloat(e.target.value))}
                            className="border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>
                ))}
            </div>

            {/* Predict Button */}
            <button
                onClick={handlePredict}
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 font-medium"
            >
                {isLoading ? (
                    <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Predicting...
                    </span>
                ) : 'Make Prediction'}
            </button>

            {/* Error Display */}
            {error && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded">
                    <p className="font-medium">Error</p>
                    <p>{error.message}</p>
                </div>
            )}

            {/* Last Prediction */}
            {lastPrediction && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h3 className="font-semibold mb-3 text-gray-800">Prediction Result</h3>
                    <div className="space-y-2">
                        <p className="text-lg">
                            Outcome: <span className="font-medium">{lastPrediction.predictedOutcome}</span>
                        </p>
                        {lastPrediction.confidence && (
                            <p className={`text-lg ${getConfidenceColor(lastPrediction.confidence)}`}>
                                Confidence: {(lastPrediction.confidence * 100).toFixed(1)}%
                            </p>
                        )}
                    </div>

                    {/* Feature Contributions */}
                    {featureContributions.length > 0 && (
                        <div className="mt-4">
                            <h4 className="font-medium mb-2 text-gray-700">Feature Importance</h4>
                            <div className="space-y-2">
                                {featureContributions.map(({ name, value, importance }) => (
                                    <div key={name} className="flex items-center">
                                        <div className="w-32 text-sm text-gray-600">
                                            {name.replace(/_/g, ' ')}
                                        </div>
                                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-blue-500"
                                                style={{ width: `${importance * 100}%` }}
                                            />
                                        </div>
                                        <div className="w-16 text-right text-sm text-gray-600">
                                            {(importance * 100).toFixed(1)}%
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Advanced Metrics Toggle */}
                    <button
                        onClick={() => setShowAdvancedMetrics(!showAdvancedMetrics)}
                        className="mt-4 text-sm text-blue-600 hover:text-blue-800"
                    >
                        {showAdvancedMetrics ? 'Hide' : 'Show'} Advanced Metrics
                    </button>

                    {/* Advanced Metrics */}
                    {showAdvancedMetrics && lastPrediction.insights?.model_metrics && (
                        <div className="mt-4 p-3 bg-gray-100 rounded">
                            <h4 className="font-medium mb-2 text-gray-700">Model Performance</h4>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                {Object.entries(lastPrediction.insights.model_metrics)
                                    .filter(([key]) => !key.includes('confusion_matrix'))
                                    .map(([key, value]) => (
                                        <div key={key} className="flex justify-between">
                                            <span className="text-gray-600">{key}:</span>
                                            <span className="font-medium">{(value as number).toFixed(3)}</span>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-semibold mb-3 text-gray-800">ML Insights</h3>
                    <div className="space-y-3">
                        {insights.map(insight => (
                            <div
                                key={insight.id}
                                className="p-4 bg-gray-50 rounded-lg border-l-4 border-blue-500 hover:bg-gray-100 transition-colors duration-200"
                            >
                                <p className="text-sm text-gray-700">{insight.text}</p>
                                {insight.confidence && (
                                    <div className="mt-2 flex items-center justify-between">
                                        <span className="text-xs text-gray-500">
                                            Source: {insight.source}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            Confidence: {(insight.confidence * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}; 