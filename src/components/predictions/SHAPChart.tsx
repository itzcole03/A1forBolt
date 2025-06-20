import { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface SHAPValue {
  feature: string;
  value: number;
}

interface SHAPChartProps {
  shapValues: SHAPValue[];
  className?: string;
}

export function SHAPChart({ shapValues, className = '' }: SHAPChartProps) {
  const sortedValues = useMemo(() => {
    return [...shapValues].sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [shapValues]);

  const chartData = useMemo(() => {
    return {
      labels: sortedValues.map(v => v.feature),
      datasets: [
        {
          label: 'Feature Impact',
          data: sortedValues.map(v => v.value),
          backgroundColor: sortedValues.map(v =>
            v.value >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)'
          ),
          borderColor: sortedValues.map(v =>
            v.value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)'
          ),
          borderWidth: 1,
        },
      ],
    };
  }, [sortedValues]);

  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Feature Impact on Prediction',
        color: 'rgb(107, 114, 128)',
        font: {
          size: 16,
          weight: '500' as const,
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw;
            return `Impact: ${value > 0 ? '+' : ''}${value.toFixed(3)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(107, 114, 128, 0.1)',
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
        },
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: 'rgb(107, 114, 128)',
          callback: (value: any) => {
            const label = chartData.labels[value];
            return label.length > 20 ? label.substring(0, 17) + '...' : label;
          },
        },
      },
    },
  };

  return (
    <div className={`h-[400px] w-full ${className}`}>
      <Bar data={chartData} options={options} />
    </div>
  );
}
