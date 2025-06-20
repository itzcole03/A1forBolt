import Chart from 'chart.js/auto';
import React, { useEffect, useRef } from 'react';
import { aggregatePerformanceData } from '../../utils/analyticsHelpers'; 
import { useAppStore } from '../../store/useAppStore';


const PerformanceChart: React.FC = () => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstanceRef = useRef<Chart | null>(null);
  const entries = useAppStore(state => state.entries);

  useEffect(() => {
    if (!chartRef.current) return;

    const { labels, profitData } = aggregatePerformanceData(entries);
    // Placeholder data removed
    // const placeholderData = {
    //     labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    //     datasets: [{
    //         label: 'Profit Over Time',
    //         data: [0, 10, 5, 2, 20, 30, 45],
    //         fill: true,
    //         borderColor: 'rgb(52, 211, 153)', // emerald-400
    //         backgroundColor: 'rgba(52, 211, 153, 0.2)',
    //         tension: 0.3,
    //     }]
    // };

    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
    }
    
    if ((labels?.length ?? 0) === 0 && (profitData?.length ?? 0) === 0 && Array.isArray(entries) && entries.length > 0) {
        // This case can happen if entries exist but are all pending/active leading to no chartable profit data yet.
        // Or if aggregatePerformanceData returns empty for other reasons despite entries existing.
        console.warn("[PerformanceChart] Entries exist but no chartable data was generated.");
        // Optionally render a message here or let the "No betting history" message handle it if entries array itself becomes empty after filtering.
    }

    chartInstanceRef.current = new Chart(chartRef.current, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
            label: 'Profit Over Time',
            data: profitData,
            fill: true,
            borderColor: 'rgb(52, 211, 153)', // emerald-400
            backgroundColor: 'rgba(52, 211, 153, 0.2)',
            tension: 0.3,
        }]
      }, 
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            ticks: { color: '#9ca3af' }, // text-gray-400
            grid: { color: 'rgba(107, 114, 128, 0.2)'}
          },
          x: {
            ticks: { color: '#9ca3af' }, // text-gray-400
            grid: { color: 'rgba(107, 114, 128, 0.2)'}
          }
        },
        plugins: {
          legend: {
            labels: { color: '#e5e7eb' } // text-gray-200
          }
        }
      }
    });

    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [entries]); // Re-enabled entries dependency

  return (
    <div className="glass modern-card rounded-2xl shadow-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/10 p-6 animate-fade-in" style={{ height: '320px' }}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-lg font-bold text-emerald-700 dark:text-emerald-200">📈 Profit Over Time</h4>
        {/* Stat callouts (optional, can be replaced with real stats) */}
        <div className="flex gap-4">
          <span className="text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full">+12.4% ROI</span>
          <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded-full">68.4% Win Rate</span>
        </div>
      </div>
      {(!Array.isArray(entries) || entries.length === 0) && <p className="text-text-muted text-center mt-10">No betting history to display chart.</p>}
      <div className="h-60 w-full">
        <canvas ref={chartRef}></canvas>
      </div>
    </div>
  );
};

export default PerformanceChart; 