import { UnifiedError } from '../error/types';
import { UnifiedLogger } from '../logging/types';
import { UnifiedMetrics } from '../metrics/types';
import { UnifiedConfigManager } from '../config/types';
import { PredictionRequest, PredictionResponse, LatestPredictions } from '../types/prediction';

export type RiskLevel = 'low' | 'medium' | 'high';
export type ModelType = 'historical' | 'market' | 'sentiment' | 'correlation';

export interface ModelOutput {
  type: ModelType;
  score: number;
  features: Record<string, number>;
  prediction: number;
  confidence: number;
  timestamp: number;
  metadata: {
    signalStrength: number;
    latency: number;
  };
}

export interface FeatureImpact {
  name: string;
  weight: number;
  impact: number;
}

export interface ModelWeight {
  type: ModelType;
  weight: number;
}

export interface RiskProfile {
  type: string;
  multiplier: number;
  maxStake: number;
}

export interface ModelContributions {
  [key: string]: { weight: number; confidence: number; score: number };
  historical: { weight: number; confidence: number; score: number };
  market: { weight: number; confidence: number; score: number };
  sentiment: { weight: number; confidence: number; score: number };
  correlation: { weight: number; confidence: number; score: number };
}

export interface FinalPrediction {
  id: string;
  timestamp: number;
  confidenceWindow: {
    start: number;
    end: number;
  };
  finalScore: number;
  confidence: number;
  riskLevel: RiskLevel;
  isSureOdds: boolean;
  payoutRange: {
    min: number;
    max: number;
    expected: number;
  };
  modelContributions: ModelContributions;
  topFeatures: FeatureImpact[];
  supportingFeatures: FeatureImpact[];
  metadata: {
    processingTime: number;
    dataFreshness: number;
    signalQuality: number;
    decisionPath: string[];
  };
}

export interface FinalPredictionEngineConfig {
  modelWeights: ModelWeight[];
  riskProfiles: Record<string, RiskProfile>;
  sureOddsThreshold: number;
  featureThreshold: number;
  maxFeatures: number;
}

export interface ShapValue {
  feature: string;
  value: number;
  impact: number;
  direction: 'positive' | 'negative';
  confidence?: number;
}

export interface ShapExplanation {
  baseValue: number;
  shapValues: ShapValue[];
  prediction: number;
  confidence: number;
  timestamp?: number;
}

export interface ModelExplanation {
  modelName: string;
  shapExplanation: ShapExplanation;
  featureImportance: Record<string, number>;
  confidence: number;
}

export interface PredictionWithExplanation {
  prediction: number;
  confidence: number;
  explanations: ModelExplanation[];
  timestamp: number;
}

export interface ModelMetrics {
  featureImportance: Record<string, number>;
  performance: {
    accuracy: number;
    precision: number;
    recall: number;
  };
}

export interface MetricsService {
  getModelMetrics(modelName: string): ModelMetrics;
}

export interface FinalPredictionEngineDependencies {
  logger: UnifiedLogger;
  metrics: UnifiedMetrics;
  config: UnifiedConfigManager;
  metricsService: MetricsService;
}

export interface FinalPredictionEngine {
  generatePrediction(
    modelOutputs: ModelOutput[],
    riskProfile: RiskProfile,
    context?: Record<string, any>
  ): Promise<FinalPrediction>;
  getLatestPredictions(): Promise<LatestPredictions>;
  updateModelWeights(weights: ModelWeight[]): Promise<void>;
  updateRiskProfiles(profiles: Record<string, RiskProfile>): Promise<void>;
  getEngineMetrics(): Promise<Record<string, number>>;
  validatePrediction(prediction: FinalPrediction): Promise<boolean>;
  setRiskProfile(profile: RiskProfile): Promise<void>;
}

export class FinalPredictionError extends UnifiedError {
  constructor(
    message: string,
    code: string = 'PREDICTION_ERROR',
    severity: 'ERROR' | 'WARNING' = 'ERROR',
    context?: Record<string, any>
  ) {
    super(message, code, severity, context);
  }
}
