import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface TimeSeriesInsightsProps {
  forecast: number[];
  confidence: {
    lower: number[];
    upper: number[];
  };
  metrics: {
    mse: number;
    mae: number;
    mape: number;
    r2: number;
  };
  seasonality: {
    trend: number[];
    seasonal: number[];
    residual: number[];
  };
  changePoints: {
    index: number;
    value: number;
    type: 'trend' | 'level' | 'volatility';
  }[];
  anomalies: {
    index: number;
    value: number;
    score: number;
  }[];
}

const TimeSeriesInsights: React.FC<TimeSeriesInsightsProps> = ({
  forecast,
  confidence,
  metrics,
  seasonality,
  changePoints,
  anomalies,
}) => {
  // Prepare data for visualization
  const forecastData = forecast.map((value, index) => ({
    x: index,
    value,
    lower: confidence.lower[index],
    upper: confidence.upper[index],
  }));

  const seasonalityData = seasonality.trend.map((trend, index) => ({
    x: index,
    trend,
    seasonal: seasonality.seasonal[index],
    residual: seasonality.residual[index],
  }));

  const anomalyData = anomalies.map(anomaly => ({
    x: anomaly.index,
    value: anomaly.value,
    score: anomaly.score,
  }));

  return (
    <div className="space-y-8">
      {/* Time Series Metrics Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Time Series Metrics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Mean Squared Error</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.mse.toFixed(4)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Mean Absolute Error</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.mae.toFixed(4)}</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Mean Absolute Percentage Error</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.mape.toFixed(2)}%</p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">R-squared</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.r2.toFixed(4)}</p>
          </div>
        </div>
      </section>

      {/* Forecast Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Forecast</h2>
        <div className="h-96">
          <ResponsiveContainer height="100%" width="100%">
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                dataKey="value"
                dot={false}
                name="Forecast"
                stroke="#3B82F6"
                strokeWidth={2}
                type="monotone"
              />
              <Line
                dataKey="lower"
                dot={false}
                name="Lower Bound"
                stroke="#93C5FD"
                strokeDasharray="3 3"
                type="monotone"
              />
              <Line
                dataKey="upper"
                dot={false}
                name="Upper Bound"
                stroke="#93C5FD"
                strokeDasharray="3 3"
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Seasonality Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Seasonality Decomposition</h2>
        <div className="grid grid-cols-1 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Trend</h3>
            <ResponsiveContainer height={200} width="100%">
              <LineChart data={seasonalityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Line dataKey="trend" dot={false} stroke="#3B82F6" type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Seasonal Pattern</h3>
            <ResponsiveContainer height={200} width="100%">
              <LineChart data={seasonalityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Line dataKey="seasonal" dot={false} stroke="#10B981" type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Residuals</h3>
            <ResponsiveContainer height={200} width="100%">
              <LineChart data={seasonalityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Line dataKey="residual" dot={false} stroke="#EF4444" type="monotone" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Change Points Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Change Points</h2>
        <div className="space-y-4">
          {changePoints.map((point, index) => (
            <div
              key={index}
              className="p-4 bg-gray-50 rounded-lg flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold">
                  {point.type.charAt(0).toUpperCase() + point.type.slice(1)} Change
                </h3>
                <p className="text-sm text-gray-500">At time index: {point.index}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-gray-900">{point.value.toFixed(4)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Anomalies Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Anomaly Detection</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Anomaly Scores</h3>
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={anomalyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="x" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="score" fill="#3B82F6" name="Anomaly Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Anomaly Points</h3>
            <div className="space-y-2">
              {anomalies.map((anomaly, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-gray-600">Time Index: {anomaly.index}</span>
                  <div className="text-right">
                    <span className="block font-mono">Value: {anomaly.value.toFixed(4)}</span>
                    <span className="block text-sm text-gray-500">
                      Score: {anomaly.score.toFixed(4)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default React.memo(TimeSeriesInsights);
