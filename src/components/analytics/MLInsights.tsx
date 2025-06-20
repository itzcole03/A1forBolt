import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { useUnifiedAnalytics } from '@/hooks/useUnifiedAnalytics';

const safeNumber = (n: unknown) => (typeof n === 'number' && !isNaN(n) ? n : 0);

const exportToJson = (data: any) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ml-insights.json';
  a.click();
  URL.revokeObjectURL(url);
};

interface MLInsightsProps {
  autoUpdateInterval?: number;
  showFeatureImportance?: boolean;
  showPerformance?: boolean;
}

const MLInsights: React.FC<MLInsightsProps> = ({
  autoUpdateInterval = 60000,
  showFeatureImportance = true,
  showPerformance = true,
}) => {
  const { ml } = useUnifiedAnalytics({
    ml: { autoUpdate: true, updateInterval: autoUpdateInterval },
  });
  const [showInfo, setShowInfo] = useState(false);

  if (ml.loading) {
    return (
      <div aria-live="polite" className="flex items-center justify-center h-96" role="status">
        <div
          aria-label="Loading"
          className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"
        />
      </div>
    );
  }

  if (ml.error) {
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded" role="alert">
        <h3 className="font-bold">Error</h3>
        <p>{ml.error}</p>
        <button
          className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          data-testid="mlinsights-retry"
          onClick={() => ml.refetch()}
        >
          Retry
        </button>
      </div>
    );
  }

  const mlResult = ml.data;
  if (!mlResult) {
    return (
      <div className="p-4 text-gray-500" role="status">
        No ML analytics available.
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="mlinsights-root">
      {/* ML Predictions Section */}
      {showPerformance && (
        <section
          aria-labelledby="ml-performance-heading"
          className="bg-white rounded-lg shadow p-6"
        >
          <h2 className="text-2xl font-bold mb-4" id="ml-performance-heading">
            ML Predictions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Model Performance</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Accuracy:</span>
                  <span className="font-mono" data-testid="mlinsights-accuracy">
                    {safeNumber(mlResult.metrics?.accuracy).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Precision:</span>
                  <span className="font-mono">
                    {safeNumber(mlResult.metrics?.precision).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Recall:</span>
                  <span className="font-mono">
                    {safeNumber(mlResult.metrics?.recall).toFixed(4)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>F1 Score:</span>
                  <span className="font-mono">
                    {safeNumber(mlResult.metrics?.f1Score).toFixed(4)}
                  </span>
                </div>
              </div>
            </div>
            {showFeatureImportance && (
              <div>
                <div className="flex items-center mb-2">
                  <h3 className="text-lg font-semibold mr-2">Feature Importance</h3>
                  <button
                    aria-label="What is feature importance?"
                    className="ml-1 text-blue-500 hover:underline"
                    type="button"
                    onClick={() => setShowInfo(v => !v)}
                  >
                    ?
                  </button>
                  {showInfo && (
                    <span
                      className="ml-2 text-xs bg-blue-100 text-blue-800 rounded px-2 py-1"
                      role="note"
                    >
                      Feature importance shows which input variables most influenced the model’s
                      predictions (e.g., via SHAP values).
                    </span>
                  )}
                </div>
                <div style={{ width: 300, height: 200 }}>
                  <BarChart
                    data={Object.entries(mlResult.insights?.featureImportance || {}).map(
                      ([key, value]) => ({ name: key, value: safeNumber(value) })
                    )}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </div>
              </div>
            )}
          </div>
          <div className="flex justify-end mt-4 gap-2">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              data-testid="mlinsights-refresh"
              onClick={() => ml.refetch()}
            >
              Refresh Analysis
            </button>
            <button
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              data-testid="mlinsights-export"
              onClick={() => exportToJson(mlResult)}
            >
              Export JSON
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default React.memo(MLInsights);
