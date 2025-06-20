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
import { webSocketLoadBalancer } from '../services/WebSocketLoadBalancer';
import { EventBus } from '../unified/EventBus';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface ServerMetrics {
  connections: number;
  latency: number;
  errorRate: number;
  lastUpdate: number;
}

interface LoadBalancerMetrics {
  totalConnections: number;
  activeServers: number;
  serverMetrics: Map<string, ServerMetrics>;
  lastHealthCheck: number;
}

export const WebSocketLoadBalancerAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<LoadBalancerMetrics>({
    totalConnections: 0,
    activeServers: 0,
    serverMetrics: new Map(),
    lastHealthCheck: 0,
  });

  const [serverLatencies, setServerLatencies] = useState<Map<string, number[]>>(new Map());
  const [serverErrorRates, setServerErrorRates] = useState<Map<string, number[]>>(new Map());
  const [timestamps, setTimestamps] = useState<number[]>([]);

  useEffect(() => {
    const updateMetrics = () => {
      const currentMetrics = webSocketLoadBalancer.getMetrics();
      setMetrics(currentMetrics);
    };

    const interval = setInterval(updateMetrics, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleServerHealth = (event: any) => {
      const { server, metrics, timestamp } = event;

      setServerLatencies(prev => {
        const latencies = prev.get(server) || [];
        return new Map(prev).set(server, [...latencies.slice(-20), metrics.latency]);
      });

      setServerErrorRates(prev => {
        const rates = prev.get(server) || [];
        return new Map(prev).set(server, [...rates.slice(-20), metrics.errorRate]);
      });

      setTimestamps(prev => [...prev.slice(-20), timestamp]);
    };

    const eventBus = EventBus.getInstance();
    eventBus.subscribe('websocket:server:health', handleServerHealth);

    return () => {
      eventBus.unsubscribe('websocket:server:health', handleServerHealth);
    };
  }, []);

  const chartData = {
    labels: timestamps.map(t => new Date(t).toLocaleTimeString()),
    datasets: Array.from(metrics.serverMetrics.entries()).map(([server, _]) => ({
      label: `Server ${server} Latency`,
      data: serverLatencies.get(server) || [],
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      tension: 0.1,
    })),
  };

  const errorRateData = {
    labels: timestamps.map(t => new Date(t).toLocaleTimeString()),
    datasets: Array.from(metrics.serverMetrics.entries()).map(([server, _]) => ({
      label: `Server ${server} Error Rate`,
      data: serverErrorRates.get(server) || [],
      borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
      tension: 0.1,
    })),
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Server Latency',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  const errorRateOptions = {
    ...chartOptions,
    plugins: {
      ...chartOptions.plugins,
      title: {
        display: true,
        text: 'Server Error Rates',
      },
    },
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-4">WebSocket Load Balancer Analytics</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Overall Metrics</h3>
          <div className="space-y-2">
            <p>Total Connections: {metrics.totalConnections}</p>
            <p>Active Servers: {metrics.activeServers}</p>
            <p>Last Health Check: {new Date(metrics.lastHealthCheck).toLocaleTimeString()}</p>
          </div>
        </div>

        <div className="p-4 bg-gray-50 rounded">
          <h3 className="text-lg font-semibold mb-2">Server Status</h3>
          <div className="space-y-2">
            {Array.from(metrics.serverMetrics.entries()).map(([server, metrics]) => (
              <div key={server} className="border-b pb-2">
                <p className="font-medium">Server {server}</p>
                <p>Connections: {metrics.connections}</p>
                <p>Latency: {metrics.latency}ms</p>
                <p>Error Rate: {(metrics.errorRate * 100).toFixed(2)}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
        <div className="h-64">
          <Line data={errorRateData} options={errorRateOptions} />
        </div>
      </div>
    </div>
  );
};
