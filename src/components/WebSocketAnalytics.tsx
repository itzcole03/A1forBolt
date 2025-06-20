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
import { WebSocketService } from '../services/webSocketService';
import { WebSocketMetrics } from '../types/websocket';
import { WebSocketConnection } from '../types/websocket';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface WebSocketAnalyticsProps {
  webSocketService: WebSocketService;
}

export const WebSocketAnalytics: React.FC<WebSocketAnalyticsProps> = ({ webSocketService }) => {
  const [metrics, setMetrics] = useState<WebSocketMetrics[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('latency');

  useEffect(() => {
    const updateMetrics = () => {
      const connections = webSocketService.getConnections();
      const currentMetrics = connections.map((conn: WebSocketConnection) => conn.metrics);
      setMetrics(currentMetrics);
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, [webSocketService]);

  const chartData = {
    labels: metrics.map((_, index) => `Time ${index}`),
    datasets: [
      {
        label: 'Latency (ms)',
        data: metrics.map(m => m.latency),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
      {
        label: 'Message Size (bytes)',
        data: metrics.map(m => m.messageSize),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
      },
      {
        label: 'Compression Ratio',
        data: metrics.map(m => m.compressionRatio),
        borderColor: 'rgb(54, 162, 235)',
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
        text: 'WebSocket Performance Metrics',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">WebSocket Analytics</h2>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Total Connections</h3>
          <p className="text-2xl">{metrics.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Average Latency</h3>
          <p className="text-2xl">
            {metrics.length > 0
              ? Math.round(metrics.reduce((acc, m) => acc + m.latency, 0) / metrics.length)
              : 0}{' '}
            ms
          </p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold">Message Rate</h3>
          <p className="text-2xl">
            {metrics.length > 0
              ? Math.round(metrics.reduce((acc, m) => acc + m.messageCount, 0) / metrics.length)
              : 0}{' '}
            /s
          </p>
        </div>
      </div>

      <div className="bg-white p-4 rounded shadow">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="mt-4">
        <h3 className="font-semibold mb-2">Connection Status</h3>
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((metric, index) => (
            <div key={index} className="bg-white p-4 rounded shadow">
              <h4 className="font-semibold">Connection {index + 1}</h4>
              <p>Status: {metric.isConnected ? 'Connected' : 'Disconnected'}</p>
              <p>Messages: {metric.messageCount}</p>
              <p>Errors: {metric.errorCount}</p>
              <p>Last Error: {metric.lastError || 'None'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
