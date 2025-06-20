import React, { useState } from 'react';
import { Chart } from 'react-chartjs-2';
import { AdvancedMLDashboardPanels } from './AdvancedMLDashboardPanels';

interface ModelStatus {
    id: string;
    name: string;
    status: 'active' | 'training' | 'error';
    confidence: number;
    lastUpdate: string;
}

interface ModelPerformanceHistory {
    date: string;
    accuracy: number;
    f1: number;
}

interface AdvancedMLDashboardProps {
    models: ModelStatus[];
}

const mockPerformanceHistory: ModelPerformanceHistory[] = [
    { date: '2025-06-01', accuracy: 0.89, f1: 0.85 },
    { date: '2025-06-02', accuracy: 0.91, f1: 0.88 },
    { date: '2025-06-03', accuracy: 0.93, f1: 0.90 },
    { date: '2025-06-04', accuracy: 0.92, f1: 0.89 },
    { date: '2025-06-05', accuracy: 0.94, f1: 0.91 },
];

export const AdvancedMLDashboard: React.FC<AdvancedMLDashboardProps> = ({ models }) => {
    const [selectedModelId, setSelectedModelId] = useState(models[0]?.id || '');
    const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
    const eventId = 'event-123'; // Replace with real event ID as needed

    const activeModels = models.filter(m => m.status === 'active');
    const trainingModels = models.filter(m => m.status === 'training');
    const errorModels = models.filter(m => m.status === 'error');

    const chartData = {
        labels: models.map(m => m.name),
        datasets: [{
            label: 'Model Confidence',
            data: models.map(m => m.confidence),
            backgroundColor: models.map(m =>
                m.status === 'active' ? 'rgba(16, 185, 129, 0.5)' :
                    m.status === 'training' ? 'rgba(245, 158, 11, 0.5)' :
                        'rgba(239, 68, 68, 0.5)'
            ),
            borderColor: models.map(m =>
                m.status === 'active' ? 'rgb(16, 185, 129)' :
                    m.status === 'training' ? 'rgb(245, 158, 11)' :
                        'rgb(239, 68, 68)'
            ),
            borderWidth: 1
        }]
    };

    return (
        <div className="advanced-ml-dashboard">
            <h2 className="text-2xl font-bold mb-4">ML Model Status</h2>
            <div className="flex gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Model</label>
                    <select
                        value={selectedModelId}
                        onChange={e => setSelectedModelId(e.target.value)}
                        className="rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
                    >
                        {models.map(m => (
                            <option key={m.id} value={m.id}>{m.name}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Time Range</label>
                    <select
                        value={timeRange}
                        onChange={e => setTimeRange(e.target.value as '7d' | '30d' | '90d')}
                        className="rounded border px-2 py-1 dark:bg-gray-800 dark:text-white"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="glass-premium p-4 rounded-xl">
                    <div className="text-sm text-gray-500">Active Models</div>
                    <div className="text-2xl font-bold text-success-500">{activeModels.length}</div>
                </div>
                <div className="glass-premium p-4 rounded-xl">
                    <div className="text-sm text-gray-500">Training</div>
                    <div className="text-2xl font-bold text-warning-500">{trainingModels.length}</div>
                </div>
                <div className="glass-premium p-4 rounded-xl">
                    <div className="text-sm text-gray-500">Errors</div>
                    <div className="text-2xl font-bold text-error-500">{errorModels.length}</div>
                </div>
            </div>

            <div className="glass-premium p-4 rounded-xl mb-6">
                <h3 className="text-lg font-semibold mb-2">Model Confidence Distribution</h3>
                <div className="h-64">
                    <Chart type="bar" data={chartData} options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            y: {
                                beginAtZero: true,
                                max: 1
                            }
                        }
                    }} />
                </div>
            </div>

            <AdvancedMLDashboardPanels
                eventId={eventId}
                modelId={selectedModelId}
                modelPerformanceHistory={mockPerformanceHistory}
            />
        </div>
    );
}
