import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { webSocketBatching } from '../services/WebSocketBatching';
import { EventBus } from '../unified/EventBus';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface BatchMetrics {
  totalBatches: number;
  totalMessages: number;
  averageBatchSize: number;
  compressionRatio: number;
  lastBatchTime: number;
}

export const WebSocketBatchingAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<BatchMetrics>({
    totalBatches: 0,
    totalMessages: 0,
    averageBatchSize: 0,
    compressionRatio: 1,
    lastBatchTime: 0,
  });

  const [batchSizes, setBatchSizes] = useState<number[]>([]);
  const [compressionRatios, setCompressionRatios] = useState<number[]>([]);
  const [timestamps, setTimestamps] = useState<number[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = webSocketBatching.getMetrics();
      setMetrics(currentMetrics);
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleBatchSent = (event: { batchSize: number; compressionRatio: number; timestamp: number }) => {
      setBatchSizes(prev => [...prev.slice(-20), event.batchSize]);
      setCompressionRatios(prev => [...prev.slice(-20), event.compressionRatio]);
      setTimestamps(prev => [...prev.slice(-20), event.timestamp]);
    };

    const eventBus = EventBus.getInstance();
    eventBus.subscribe('websocket:batch:sent', handleBatchSent);

    return () => {
      eventBus.unsubscribe('websocket:batch:sent', handleBatchSent);
    };
  }, []);

  const chartData = {
    labels: timestamps.map(t => new Date(t).toLocaleTimeString()),
    datasets: [
      {
        label: 'Batch Size',
        data: batchSizes,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Compression Ratio',
        data: compressionRatios,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'WebSocket Batching Metrics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">WebSocket Batching Analytics</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Total Metrics</h3>
          <div className="space-y-2">
            <p>Total Batches: {metrics.totalBatches}</p>
            <p>Total Messages: {metrics.totalMessages}</p>
            <p>Average Batch Size: {metrics.averageBatchSize.toFixed(2)}</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Performance Metrics</h3>
          <div className="space-y-2">
            <p>Compression Ratio: {metrics.compressionRatio.toFixed(2)}x</p>
            <p>Last Batch Time: {new Date(metrics.lastBatchTime).toLocaleTimeString()}</p>
          </div>
        </div>
      </div>

      <div className="h-64">
        <Line data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};
