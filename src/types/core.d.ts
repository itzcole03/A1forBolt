// Core type for strategy recommendations, extended for risk_reasoning propagation
export interface StrategyRecommendation {
    id: string;
    type: 'OVER' | 'UNDER';
    confidence: number;
    expectedValue: number;
    riskAssessment: {
        level: 'low' | 'medium' | 'high';
        factors: string[];
    };
    analysis?: {
        historicalTrends?: string[];
        marketSignals?: string[];
        riskFactors?: string[];
        // Add more as needed
        risk_reasoning?: string[];
    };
    propId?: string;
    // Optional risk_reasoning for direct access (legacy/compat)
    risk_reasoning?: string[];
}
