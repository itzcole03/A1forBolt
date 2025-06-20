import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from 'recharts';
import ShapVisualization from '../ShapVisualization';
import { useShapData } from '../../hooks/useShapData';

interface FeatureInsightsProps {
  features: {
    name: string;
    importance: number;
    correlation: number;
    entropy: number;
    uniqueness: number;
    missing: number;
    stats: {
      mean: number;
      std: number;
      min: number;
      max: number;
      q25: number;
      q50: number;
      q75: number;
    };
  }[];
  interactions: {
    feature1: string;
    feature2: string;
    strength: number;
    type: 'linear' | 'nonlinear' | 'categorical';
  }[];
  embeddings: {
    feature: string;
    vector: number[];
  }[];
  signals: {
    source: string;
    features: {
      name: string;
      value: number;
      impact: number;
    }[];
  }[];
  eventId?: string; // Optional, for SHAP
  modelType?: string;
}

const FeatureInsights: React.FC<FeatureInsightsProps> = ({
  features,
  interactions,
  embeddings,
  signals,
  eventId,
  modelType,
}) => {
  // Sort features by importance
  const sortedFeatures = [...features].sort((a, b) => b.importance - a.importance);

  // Prepare data for visualizations
  const featureMetrics = sortedFeatures.map(feature => ({
    name: feature.name,
    importance: feature.importance,
    correlation: Math.abs(feature.correlation),
    entropy: feature.entropy,
    uniqueness: feature.uniqueness,
    missing: feature.missing,
  }));

  const featureStats = sortedFeatures.map(feature => ({
    name: feature.name,
    ...feature.stats,
  }));

  const interactionData = interactions.map(interaction => ({
    name: `${interaction.feature1} × ${interaction.feature2}`,
    strength: interaction.strength,
    type: interaction.type,
  }));

  // SHAP integration
  const {
    features: shapFeatures,
    loading: shapLoading,
    error: shapError,
  } = eventId ? useShapData({ eventId, modelType }) : { features: [], loading: false, error: null };

  return (
    <div className="space-y-8">
      {/* SHAP Feature Importance Section */}
      {eventId && (
        <section className="bg-white rounded-lg shadow p-6">
          <h2 className="text-2xl font-bold mb-4">Model Feature Importance (SHAP)</h2>
          {shapLoading ? (
            <div className="text-gray-500">Loading SHAP values...</div>
          ) : shapError ? (
            <div className="text-red-500">{shapError}</div>
          ) : shapFeatures.length > 0 ? (
            <ShapVisualization
              features={shapFeatures.map(f => ({
                name: f.feature,
                value: f.value,
                impact: f.impact,
              }))}
              maxFeatures={10}
              title="SHAP Feature Impact"
            />
          ) : (
            <div className="text-gray-400">No SHAP data available for this event/model.</div>
          )}
        </section>
      )}

      {/* Feature Importance Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Feature Importance</h2>
        <div className="h-96">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart data={featureMetrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis angle={-45} dataKey="name" height={100} textAnchor="end" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="importance" fill="#3B82F6" name="Importance Score" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Feature Metrics Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Feature Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Correlation Analysis</h3>
            <ResponsiveContainer height={300} width="100%">
              <RadarChart data={featureMetrics}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis />
                <Radar
                  dataKey="correlation"
                  fill="#93C5FD"
                  fillOpacity={0.6}
                  name="Correlation"
                  stroke="#3B82F6"
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Feature Quality</h3>
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={featureMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="entropy" fill="#10B981" name="Entropy" />
                <Bar dataKey="uniqueness" fill="#6366F1" name="Uniqueness" />
                <Bar dataKey="missing" fill="#EF4444" name="Missing Values" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Feature Statistics Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Feature Statistics</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Feature
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Mean
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Std Dev
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Min
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Q25
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Median
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Q75
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Max
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {featureStats.map(stat => (
                <tr key={stat.name}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {stat.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.mean.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.std.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.min.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.q25.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.q50.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.q75.toFixed(4)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {stat.max.toFixed(4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Feature Interactions Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Feature Interactions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Interaction Strength</h3>
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={interactionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis angle={-45} dataKey="name" height={100} textAnchor="end" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="strength" fill="#3B82F6" name="Interaction Strength" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Interaction Types</h3>
            <div className="space-y-2">
              {interactionData.map((interaction, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-gray-600">{interaction.name}</span>
                  <span
                    className={`px-2 py-1 rounded text-white ${
                      interaction.type === 'linear'
                        ? 'bg-blue-500'
                        : interaction.type === 'nonlinear'
                          ? 'bg-purple-500'
                          : 'bg-green-500'
                    }`}
                  >
                    {interaction.type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* External Signals Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">External Signals</h2>
        <div className="space-y-6">
          {signals.map((signal, index) => (
            <div key={index}>
              <h3 className="text-lg font-semibold mb-2">{signal.source} Features</h3>
              <ResponsiveContainer height={200} width="100%">
                <BarChart data={signal.features}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#3B82F6" name="Value" />
                  <Bar dataKey="impact" fill="#10B981" name="Impact" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default React.memo(FeatureInsights);
