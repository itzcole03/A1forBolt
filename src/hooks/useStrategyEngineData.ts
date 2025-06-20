import { StrategyRecommendation, UnifiedStrategyEngine } from '@/core/UnifiedStrategyEngine';
import { useEffect, useState } from 'react';

export function useStrategyEngineData() {
    const [recommendations, setRecommendations] = useState<StrategyRecommendation[]>([]);

    useEffect(() => {
        const engine = UnifiedStrategyEngine.getInstance();
        const handler = (rec: StrategyRecommendation) => {
            setRecommendations(prev => {
                // Replace if strategyId exists, else add
                const idx = prev.findIndex(r => r.strategyId === rec.strategyId);
                if (idx !== -1) {
                    const updated = [...prev];
                    updated[idx] = rec;
                    return updated;
                }
                return [rec, ...prev];
            });
        };
        engine.eventBus.on('strategy:recommendation', handler);
        return () => {
            engine.eventBus.off('strategy:recommendation', handler);
        };
    }, []);

    return recommendations;
}
