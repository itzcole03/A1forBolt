export interface ShapExplanation {
  feature: string;
  value: number;
  importance: number;
  impact: number;
  confidence: number;
}

export interface ModelPerformance {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  rocAuc: number;
  confusionMatrix: {
    truePositives: number;
    falsePositives: number;
    trueNegatives: number;
    falseNegatives: number;
  };
  calibrationScore: number;
  brierScore: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  rank: number;
  correlation: number;
  stability: number;
  confidence: number;
}

export interface ModelMetrics {
  performance: ModelPerformance;
  featureImportance: FeatureImportance[];
  shapValues: ShapExplanation[];
  timestamp: number;
  version: string;
}

export interface ModelConfig {
  name: string;
  version: string;
  parameters: Record<string, any>;
  features: string[];
  target: string;
  validationSplit: number;
  testSplit: number;
  randomState: number;
}

export interface ModelEvaluation {
  config: ModelConfig;
  metrics: ModelMetrics;
  predictions: Array<{
    actual: number;
    predicted: number;
    confidence: number;
    timestamp: number;
  }>;
  errors: Array<{
    type: string;
    message: string;
    timestamp: number;
  }>;
}
