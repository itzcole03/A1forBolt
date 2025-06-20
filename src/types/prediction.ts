export interface ShapValue {
  feature: string;
  value: number;
  impact: 'positive' | 'negative';
}

export interface Prediction {
  id: string;
  eventId: string;
  eventName: string;
  sport: string;
  betType: string;
  odds: number;
  confidence: number;
  recommendedStake: number;
  riskLevel: 'low' | 'medium' | 'high';
  timestamp: string;
  shapValues: ShapValue[];
  modelWeights: {
    xgboost: number;
    lightgbm: number;
    catboost: number;
  };
  features: {
    [key: string]: number;
  };
  metadata: {
    lastUpdated: string;
    modelVersion: string;
    predictionSource: string;
  };
}

export interface PredictionResponse {
  predictions: Prediction[];
  metadata: {
    total: number;
    page: number;
    pageSize: number;
  };
  timestamp: string;
  eventId: string;
  odds: {
    home: number;
    away: number;
    draw?: number;
  };
  marketMovement: {
    initial: number;
    current: number;
    change: number;
  };
}

export interface PredictionError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ModelPrediction
  extends Omit<
    Prediction,
    | 'id'
    | 'eventName'
    | 'sport'
    | 'betType'
    | 'odds'
    | 'recommendedStake'
    | 'riskLevel'
    | 'shapValues'
    | 'modelWeights'
    | 'features'
    | 'metadata'
  > {
  modelName: string;
  prediction: number;
  features: Feature[];
  lastUpdated: Date;
  performance: ModelPerformance;
}

export interface Feature {
  name: string;
  importance: number;
}

export interface ModelPerformance {
  accuracy: number;
  roi: number;
  winRate: number;
}

export interface PredictionConfig {
  minConfidence: number;
  maxStakePercentage: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
}

export interface ModelWeights {
  [key: string]: number;
}

export interface ModelOutput {
  prediction: number;
  confidenceScore: number;
  confidenceColor: string;
  modelMeta: ModelMetadata;
  featureImportance: FeatureImportance[];
  timestamp: string;
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

export interface FeatureImportance {
  name: string;
  importance: number;
  impact: number;
  direction: 'positive' | 'negative';
  description: string;
}

export interface PredictionState {
  predictions: Map<string, ModelOutput>;
  isLoading: boolean;
  error: string | null;
}

export interface PredictionConfig {
  modelType: 'xgboost' | 'lightgbm' | 'catboost' | 'ensemble';
  features: string[];
  target: string;
  threshold: number;
  confidenceThreshold: number;
  updateInterval: number;
}

export interface PredictionMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  confusionMatrix: number[][];
  rocCurve: {
    fpr: number[];
    tpr: number[];
    thresholds: number[];
  };
  featureImportance: FeatureImportance[];
}

export interface PredictionRequest {
  eventId: string;
  marketId: string;
  selectionId: string;
  features: Record<string, number>;
  config?: Partial<PredictionConfig>;
}

export interface PredictionResponse {
  prediction: ModelOutput;
  metrics: PredictionMetrics;
  timestamp: string;
}

export interface PredictionValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface PredictionCache {
  predictions: Map<string, ModelOutput>;
  lastUpdate: Map<string, string>;
  ttl: number;
}

export interface PredictionSubscription {
  eventId: string;
  marketId: string;
  selectionId: string;
  callback: (prediction: ModelOutput) => void;
  config?: Partial<PredictionConfig>;
}

export interface PredictionModel {
  id: string;
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  predictionType: 'win' | 'spread' | 'total';
  predictedValue: number;
  confidenceScore: number;
  kellyCriterion: number;
  odds: number;
  timestamp: string;
  modelVersion: string;
  shapValues?: Record<string, number>;
}

export interface PredictionResponse {
  prediction: PredictionModel;
  metrics: ModelMetrics;
  explanation: PredictionExplanation;
}

export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  lastUpdated: string;
  winRate: number;
  profitFactor: number;
  averageOdds: number;
  averageConfidence: number;
  totalPredictions: number;
  successfulPredictions: number;
}

export interface PredictionExplanation {
  shapValues: Record<string, number>;
  featureImportance: Record<string, number>;
  confidenceBreakdown: {
    modelConfidence: number;
    dataQuality: number;
    featureReliability: number;
    temporalStability: number;
  };
  riskFactors: {
    marketVolatility: number;
    lineMovement: number;
    bookmakerConsistency: number;
  };
}

export interface PredictionRequest {
  eventId: string;
  sport: string;
  predictionType: 'win' | 'spread' | 'total';
  features: Record<string, any>;
  odds: number;
  riskProfile?: string;
}

export interface ModelPerformance {
  totalPredictions: number;
  successfulPredictions: number;
  averageConfidence: number;
  averageError: number;
  recentPerformance: number[];
  lastUpdated: string;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  reliability: number;
  lastUpdated: string;
}

export interface RiskProfile {
  id: string;
  name: string;
  maxStake: number;
  maxDailyLoss: number;
  kellyFraction: number;
  confidenceThreshold: number;
  riskTolerance: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}
