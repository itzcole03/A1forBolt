import { Badge } from '@/components/ui/badge';
import { Tooltip } from '@/components/ui/Tooltip';
import React from 'react';

export interface PrizePicksEdgeDisplayProps {
    id: string;
    playerName: string;
    statType: string;
    line: number;
    overOdds: number;
    underOdds: number;
    confidence: number;
    expectedValue: number;
    kellyFraction: number;
    modelBreakdown?: Record<string, number>;
    riskReasoning?: string[];
    traceId?: string;
    showDebug?: boolean;
}

export const PrizePicksEdgeDisplay: React.FC<PrizePicksEdgeDisplayProps> = ({
    playerName,
    statType,
    line,
    overOdds,
    underOdds,
    confidence,
    expectedValue,
    kellyFraction,
    modelBreakdown,
    riskReasoning,
    traceId,
    showDebug = false,
}) => {
    const isHighEV = expectedValue > 0.05;
    return (
        <div className="glass bg-gradient-to-br from-blue-100/60 to-green-100/40 rounded-xl p-4 shadow-lg flex flex-col gap-2 relative">
            <div className="flex items-center gap-2">
                <span className="font-bold text-lg">{playerName}</span>
                <Badge variant="secondary">{statType}</Badge>
                {isHighEV && <Badge variant="success">High EV</Badge>}
            </div>
            <div className="flex items-center gap-4 text-sm">
                <span>Line: <b>{line}</b></span>
                <span>Over: <b>{overOdds}</b></span>
                <span>Under: <b>{underOdds}</b></span>
                <Badge variant={confidence >= 0.7 ? 'success' : confidence >= 0.5 ? 'warning' : 'danger'}>
                    Confidence: {(confidence * 100).toFixed(1)}%
                </Badge>
                <Badge variant={expectedValue > 0 ? 'success' : 'danger'}>
                    EV: {(expectedValue * 100).toFixed(1)}%
                </Badge>
                <Badge variant="secondary">Kelly: {(kellyFraction * 100).toFixed(1)}%</Badge>
            </div>
            {modelBreakdown && (
                <div className="flex flex-wrap gap-2 text-xs text-gray-600">
                    {Object.entries(modelBreakdown).map(([model, value]) => (
                        <span key={model} className="bg-gray-200 rounded px-2 py-0.5">{model}: {value.toFixed(2)}</span>
                    ))}
                </div>
            )}
            {riskReasoning && riskReasoning.length > 0 && (
                <div className="mt-2">
                    <Tooltip content={<ul className="text-xs max-w-xs">{riskReasoning.map((r, i) => <li key={i}>{r}</li>)}</ul>}>
                        <Badge variant="warning" className="cursor-pointer">Risk Reasoning</Badge>
                    </Tooltip>
                </div>
            )}
            {showDebug && traceId && (
                <div className="mt-2 text-xs text-gray-400">traceId: {traceId}</div>
            )}
        </div>
    );
};
