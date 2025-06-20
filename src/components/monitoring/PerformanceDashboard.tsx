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
import { performanceService } from '../../services/performanceService';
import { toast } from 'react-toastify';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

interface PerformanceAlert {
  metric_name: string;
  threshold: number;
  current_value: number;
  timestamp: string;
  severity: 'warning' | 'critical';
}

const PerformanceDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('response_time');
  const [timeRange, setTimeRange] = useState<string>('1h');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch performance metrics
        const metricsData = await performanceService.getMetrics(selectedMetric);
        setMetrics(metricsData);

        // Fetch alerts
        const response = await fetch('/api/monitoring/performance/alerts');
        const alertsData = await response.json();
        setAlerts(alertsData);

        // Show toast for new critical alerts
        alertsData
          .filter((alert: PerformanceAlert) => alert.severity === 'critical')
          .forEach((alert: PerformanceAlert) => {
            toast.error(
              `Critical alert: ${alert.metric_name} exceeded threshold (${alert.current_value} > ${alert.threshold})`
            );
          });
      } catch (error) {
        console.error('Error fetching performance data:', error);
        toast.error('Failed to fetch performance data');
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000); // Refresh every minute

    return () => clearInterval(interval);
  }, [selectedMetric, timeRange]);

  const chartData = {
    labels: metrics.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: selectedMetric,
        data: metrics.map(m => m.value),
        borderColor: 'rgb(75, 192, 192)',
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
        text: `${selectedMetric} over time`,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-4">Performance Monitoring</h1>

        {/* Controls */}
        <div className="flex gap-4 mb-6">
          <select
            className="p-2 border rounded"
            value={selectedMetric}
            onChange={e => setSelectedMetric(e.target.value)}
          >
            <option value="response_time">Response Time</option>
            <option value="error_rate">Error Rate</option>
            <option value="cpu_usage">CPU Usage</option>
            <option value="memory_usage">Memory Usage</option>
          </select>

          <select
            className="p-2 border rounded"
            value={timeRange}
            onChange={e => setTimeRange(e.target.value)}
          >
            <option value="1h">Last Hour</option>
            <option value="6h">Last 6 Hours</option>
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
          </select>
        </div>

        {/* Chart */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <Line data={chartData} options={chartOptions} />
        </div>

        {/* Alerts */}
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Active Alerts</h2>
          {alerts.length === 0 ? (
            <p className="text-gray-500">No active alerts</p>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded ${
                    alert.severity === 'critical'
                      ? 'bg-red-100 border-red-500'
                      : 'bg-yellow-100 border-yellow-500'
                  } border`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{alert.metric_name}</h3>
                      <p className="text-sm text-gray-600">
                        Current: {alert.current_value.toFixed(2)} | Threshold:{' '}
                        {alert.threshold.toFixed(2)}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-sm ${
                        alert.severity === 'critical'
                          ? 'bg-red-500 text-white'
                          : 'bg-yellow-500 text-white'
                      }`}
                    >
                      {alert.severity}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(PerformanceDashboard);
