import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

interface PerformanceChartProps {
  metrics: PerformanceMetric[];
  title: string;
  yAxisLabel?: string;
  showLegend?: boolean;
  height?: number;
  width?: number;
  color?: string;
  tension?: number;
  fill?: boolean;
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({
  metrics,
  title,
  yAxisLabel = 'Value',
  showLegend = true,
  height = 300,
  width = 600,
  color = 'rgb(75, 192, 192)',
  tension = 0.1,
  fill = false,
}) => {
  const data = {
    labels: metrics.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: title,
        data: metrics.map(m => m.value),
        borderColor: color,
        backgroundColor: fill ? `${color}33` : undefined,
        tension,
        fill,
      },
    ],
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: showLegend,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title,
      },
      tooltip: {
        callbacks: {
          label: context => {
            const value = context.parsed.y;
            return `${yAxisLabel}: ${value.toFixed(2)}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: yAxisLabel,
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time',
        },
      },
    },
    interaction: {
      mode: 'index',
      intersect: false,
    },
    elements: {
      point: {
        radius: 2,
        hitRadius: 10,
        hoverRadius: 4,
      },
    },
  };

  return (
    <div style={{ height, width }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default React.memo(PerformanceChart);
