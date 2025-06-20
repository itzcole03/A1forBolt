import React, { useEffect, useState } from 'react';
import WebSocketManager from '@/services/unified/WebSocketManager';
import { ModelConfidenceIndicator } from './ml-status-indicators';

interface RealTimeMetricsProps {
    initialMetrics?: {
        predictions: number;
        opportunities: number;
        activeModels: number;
        totalProfit: number;
    };
}

export const RealTimeMetrics: React.FC<RealTimeMetricsProps> = ({
    initialMetrics = {
        predictions: 0,
        opportunities: 0,
        activeModels: 0,
        totalProfit: 0
    }
}) => {
    const [metrics, setMetrics] = useState(initialMetrics);

    useEffect(() => {
        WebSocketManager.instance.subscribe('metrics:update', (data) => {
            setMetrics(prev => ({
                ...prev,
                ...data
            }));
        });

        return () => {
            WebSocketManager.instance.unsubscribe('metrics:update');
        };
    }, []);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
                title="Active Predictions"
                value={metrics.predictions}
                icon="📊"
                trend={metrics.predictions > initialMetrics.predictions ? 'up' : 'down'}
            />
            <MetricCard
                title="Betting Opportunities"
                value={metrics.opportunities}
                icon="🎯"
                trend={metrics.opportunities > initialMetrics.opportunities ? 'up' : 'down'}
            />
            <MetricCard
                title="Active Models"
                value={metrics.activeModels}
                icon="🤖"
                trend={metrics.activeModels > initialMetrics.activeModels ? 'up' : 'down'}
            />
            <MetricCard
                title="Total Profit"
                value={`$${metrics.totalProfit.toFixed(2)}`}
                icon="💰"
                trend={metrics.totalProfit > initialMetrics.totalProfit ? 'up' : 'down'}
                isMonetary
            />
        </div>
    );
};

interface MetricCardProps {
    title: string;
    value: number | string;
    icon: string;
    trend: 'up' | 'down';
    isMonetary?: boolean;
}

const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    icon,
    trend,
    isMonetary
}) => {
    const getTrendColor = (t: string) => {
        return t === 'up' ? 'text-success-500' : 'text-error-500';
    };

    const getTrendIcon = (t: string) => {
        return t === 'up' ? '↑' : '↓';
    };

    return (
        <div className="glass-premium p-4 rounded-xl">
            <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">{icon}</div>
                <div className={`text-sm font-medium ${getTrendColor(trend)}`}>
                    {getTrendIcon(trend)}
                </div>
            </div>
            <div className="text-sm text-gray-500">{title}</div>
            <div className={`text-2xl font-bold ${isMonetary ? 'text-success-500' : ''}`}>
                {value}
            </div>
        </div>
    );
};

