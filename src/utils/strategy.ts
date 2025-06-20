import { DataPoint } from './core';



export type BetType = 'OVER' | 'UNDER';

export interface StrategyMetrics {
  totalRecommendations: number;
  successfulRecommendations: number;
  averageConfidence: number;
  lastUpdate: number;
}

export interface RiskAssessment {
  riskScore: number;
  factors: string[];
  timestamp: number;
}

export interface PredictionUpdate {
  propId: string;
  prediction: {
    value: number;
    confidence: number;
    factors: string[];
  };
  timestamp: number;
}

export interface StrategyRecommendation {
  strategyId: string;
  type: BetType;
  confidence: number;
  expectedValue: number;
  riskAssessment: RiskAssessment;
  timestamp: number;
  success: boolean;
}

export interface MarketData {
  line: number;
  volume: number;
  movement: 'up' | 'down' | 'stable';
}

// Add to EventTypes
export interface StrategyEvents {
  'strategy:recommendation': StrategyRecommendation;
  'strategy:opportunities': DataPoint[];
} 