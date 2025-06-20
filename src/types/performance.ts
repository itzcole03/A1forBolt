export interface PerformanceMetrics {
  winRate: number;
  roi: number;
  profitLoss: number;
  totalBets: number;
  averageOdds: number;
  maxDrawdown: number;
  sharpeRatio: number;
  betterThanExpected: number;
  clvAverage: number;
  edgeRetention: number;
  kellyMultiplier: number;
  marketEfficiencyScore: number;
  profitByStrategy: Record<string, number>;
  variance: number;
  sharpnessScore: number;
}

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

export interface TimestampedData {
  timestamp: number;
  value: number;
}
