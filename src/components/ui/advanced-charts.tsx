import React from 'react';
import { Chart } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface ChartData {
    labels: string[];
    datasets: {
        label: string;
        data: number[];
        backgroundColor?: string | string[];
        borderColor?: string | string[];
        fill?: boolean;
        tension?: number;
    }[];
}

interface AdvancedChartsProps {
    data: ChartData;
    type: 'line' | 'bar';
    title?: string;
    height?: number;
    options?: any;
}

/**
 * AdvancedCharts renders a high-performance, accessible chart using Chart.js.
 * - Wrapped in <figure> with <figcaption> for semantic context
 * - ARIA label and role for screen readers
 * - Keyboard accessible (tabIndex)
 */
export const AdvancedCharts: React.FC<AdvancedChartsProps> = React.memo(({
    data,
    type,
    title,
    height = 300,
    options = {}
}) => {
    const defaultOptions = React.useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top' as const,
                labels: {
                    color: '#fff',
                    font: {
                        family: 'Inter'
                    }
                }
            },
            title: {
                display: !!title,
                text: title,
                color: '#fff',
                font: {
                    family: 'Inter',
                    size: 16
                }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                borderColor: 'rgba(255, 255, 255, 0.1)',
                borderWidth: 1
            }
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#fff'
                }
            },
            y: {
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)'
                },
                ticks: {
                    color: '#fff'
                }
            }
        }
    }), []);

    return (
        <figure style={{ height }}>
            {title && <figcaption style={{ color: '#fff', fontFamily: 'Inter', fontSize: 16 }}>{title}</figcaption>}
            <Chart
                type={type}
                data={data}
                options={{ ...defaultOptions, ...options }}
                aria-label={title || 'Chart'}
                role="img"
                tabIndex={0}
            />
        </figure>
    );
});

export const PredictionConfidenceChart = React.memo(({ predictions }: { predictions: { confidence: number; label: string; }[] }) => {
    const data = React.useMemo(() => ({
        labels: predictions.map(p => p.label),
        datasets: [{
            label: 'Confidence',
            data: predictions.map(p => p.confidence),
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            borderColor: 'rgb(16, 185, 129)',
            borderWidth: 2
        }]
    }), [predictions]);

    return <AdvancedCharts data={data} type="bar" title="Prediction Confidence" />;
});

export const ModelPerformanceChart = React.memo(({ models }: { models: { name: string; performance: number; }[] }) => {
    const data = React.useMemo(() => ({
        labels: models.map(m => m.name),
        datasets: [{
            label: 'Performance',
            data: models.map(m => m.performance),
            backgroundColor: 'rgba(59, 130, 246, 0.5)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2
        }]
    }), [models]);

    return <AdvancedCharts data={data} type="bar" title="Model Performance" />;
});

export const BettingPerformanceChart = React.memo(({ performance }: { performance: { date: string; value: number; }[] }) => {
    const data = React.useMemo(() => ({
        labels: performance.map(p => p.date),
        datasets: [{
            label: 'Betting Performance',
            data: performance.map(p => p.value),
            backgroundColor: 'rgba(245, 158, 11, 0.5)',
            borderColor: 'rgb(245, 158, 11)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    }), [performance]);
    return <AdvancedCharts data={data} type="line" title="Betting Performance" />;
});
