export interface PerformanceMetrics {
  accuracy: number;
  profitLoss: number;
  precision: number;
  recall: number;
  timestamp: string;
}

export interface TrendDelta {
  accuracyDelta: number;
  precisionDelta: number;
  recallDelta: number;
  profitLossDelta: number;
  period: string;
  timestamp: string;
}

export interface RiskFactor {
  name: string;
  severity: 'low' | 'medium' | 'high';
  impact: number;
  description: string;
}

export interface RiskProfile {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  recommendation: string;
  factors: string[];
  timestamp: string;
  severity: number;
}

export interface ExplainabilityMap {
  featureName: string;
  importance: number;
  impact: number;
  direction: 'positive' | 'negative';
  description: string;
}

export interface ModelMetadata {
  modelId: string;
  version: string;
  trainingDate: string;
  features: string[];
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
}

export interface AnalyticsState {
  metrics: PerformanceMetrics | null;
  trendDelta: TrendDelta | null;
  riskProfile: RiskProfile | null;
  explainabilityMap: ExplainabilityMap[] | null;
  modelMetadata: ModelMetadata | null;
  isLoading: boolean;
  error: string | null;
}
