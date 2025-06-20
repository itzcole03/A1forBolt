import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useUnifiedAnalytics } from '@/hooks/useUnifiedAnalytics';

const EnsembleInsights: React.FC = () => {
  // Use unified analytics for model performance
  const { performance } = useUnifiedAnalytics({ performance: true });

  if (performance.loading) {
    return <div className="p-4">Loading model performance...</div>;
  }
  if (performance.error) {
    return <div className="p-4 text-red-600">Error: {performance.error}</div>;
  }
  if (!performance.data) {
    return <div className="p-4 text-gray-500">No model performance data available.</div>;
  }

  // Example: Show a bar chart of model performance metrics
  const data = performance.data.map(item => ({
    name: item.model,
    accuracy: item.metrics.accuracy,
    precision: item.metrics.precision,
    recall: item.metrics.recall,
    f1: item.metrics.f1,
    roc_auc: item.metrics.roc_auc,
    mae: item.metrics.mae,
    rmse: item.metrics.rmse,
  }));

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold mb-4">Model Performance</h2>
        <ResponsiveContainer height={400} width="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="accuracy" fill="#3B82F6" name="Accuracy" />
            <Bar dataKey="f1" fill="#10B981" name="F1 Score" />
            <Bar dataKey="roc_auc" fill="#6366F1" name="ROC AUC" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </div>
  );
};

export default React.memo(EnsembleInsights);
