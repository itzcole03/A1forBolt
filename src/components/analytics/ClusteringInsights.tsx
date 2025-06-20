import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface ClusteringInsightsProps {
  clusters: number[];
  embedding?: number[][];
  metrics: {
    silhouetteScore: number;
    daviesBouldinScore: number;
    calinskiHarabaszScore: number;
  };
  clusterStats: {
    size: number[];
    centroid: number[][];
    variance: number[];
    density: number[];
  };
}

const ClusteringInsights: React.FC<ClusteringInsightsProps> = ({
  clusters,
  embedding,
  metrics,
  clusterStats,
}) => {
  // Calculate cluster colors
  const clusterColors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#6366F1', // Indigo
    '#EC4899', // Pink
    '#8B5CF6', // Purple
    '#14B8A6', // Teal
    '#F97316', // Orange
    '#06B6D4', // Cyan
  ];

  // Prepare data for visualization
  const embeddingData = embedding?.map((point, index) => ({
    x: point[0],
    y: point[1],
    cluster: clusters[index],
  }));

  const clusterSizeData = clusterStats.size.map((size, index) => ({
    cluster: `Cluster ${index + 1}`,
    size,
  }));

  const clusterDensityData = clusterStats.density.map((density, index) => ({
    cluster: `Cluster ${index + 1}`,
    density,
  }));

  return (
    <div className="space-y-8">
      {/* Clustering Metrics Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Clustering Metrics</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Silhouette Score</h3>
            <p className="text-2xl font-bold text-gray-900">{metrics.silhouetteScore.toFixed(4)}</p>
            <p className="text-sm text-gray-500">
              Measures how similar points are to their own cluster compared to other clusters
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Davies-Bouldin Score</h3>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.daviesBouldinScore.toFixed(4)}
            </p>
            <p className="text-sm text-gray-500">
              Evaluates intra-cluster similarity and inter-cluster differences
            </p>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="text-sm font-medium text-gray-500">Calinski-Harabasz Score</h3>
            <p className="text-2xl font-bold text-gray-900">
              {metrics.calinskiHarabaszScore.toFixed(4)}
            </p>
            <p className="text-sm text-gray-500">
              Ratio of between-cluster variance to within-cluster variance
            </p>
          </div>
        </div>
      </section>

      {/* Cluster Visualization Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Cluster Visualization</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">2D Embedding</h3>
            {embedding && (
              <ResponsiveContainer height={300} width="100%">
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="x" domain={['auto', 'auto']} name="Component 1" type="number" />
                  <YAxis dataKey="y" domain={['auto', 'auto']} name="Component 2" type="number" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Legend />
                  {Array.from(new Set(clusters)).map((cluster, index) => (
                    <Scatter
                      key={cluster}
                      data={embeddingData?.filter(point => point.cluster === cluster)}
                      fill={clusterColors[index % clusterColors.length]}
                      name={`Cluster ${cluster}`}
                    />
                  ))}
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Cluster Sizes</h3>
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={clusterSizeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cluster" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="size" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      {/* Cluster Statistics Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Cluster Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">Cluster Density</h3>
            <ResponsiveContainer height={300} width="100%">
              <BarChart data={clusterDensityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cluster" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="density" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-2">Cluster Variance</h3>
            <div className="space-y-2">
              {clusterStats.variance.map((variance, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded"
                >
                  <span className="text-gray-600">Cluster {index + 1}</span>
                  <span className="font-mono">{variance.toFixed(4)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Cluster Details Section */}
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Cluster Details</h2>
        <div className="space-y-4">
          {clusterStats.centroid.map((centroid, index) => (
            <div key={index} className="p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Cluster {index + 1}</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Size</h4>
                  <p className="text-xl font-bold text-gray-900">{clusterStats.size[index]}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Density</h4>
                  <p className="text-xl font-bold text-gray-900">
                    {clusterStats.density[index].toFixed(4)}
                  </p>
                </div>
                <div className="col-span-2">
                  <h4 className="text-sm font-medium text-gray-500">Centroid</h4>
                  <p className="font-mono text-sm">
                    [{centroid.map(c => c.toFixed(4)).join(', ')}]
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default React.memo(ClusteringInsights);
