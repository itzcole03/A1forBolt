/**
 * Type definitions for the prediction service.
 */

import type { ModelPrediction } from '../ml/models/BaseModel';
import type { ModelEvaluation } from './ModelEvaluationService';

export interface PredictionRequest {
  eventId: string;
  sport: string;
  homeTeam: string;
  awayTeam: string;
  timestamp: string;
  venue: string;
  includeDailyFantasy?: boolean;
  metadata?: Record<string, unknown>;
  realTimeData?: any;
  unifiedData?: any;
  weatherData?: any;
  sentimentData?: any;
  marketData?: any;
  riskAssessment?: any;
}

export interface PredictionResponse {
  realityExploitation: ModelPrediction;
  statisticalModel: ModelPrediction;
  machineLearningModel: ModelPrediction;
  hybridModel: ModelPrediction;
  dailyFantasy?: DailyFantasyRecommendation[];
  modelComparison: ModelComparisonResult;
  performanceMetrics: PerformanceMetrics;
  analytics?: any;
  riskAssessment?: any;
  marketAnalysis?: any;
  sentimentAnalysis?: any;
  weatherImpact?: any;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ModelComparisonResult {
  models: Array<{
    name: string;
    prediction: number;
    confidence: number;
    performance: ModelEvaluation;
  }>;
  consensus: {
    prediction: number;
    confidence: number;
    agreement: number;
  };
  timestamp: string;
}

export interface PerformanceMetrics {
  overall: ModelEvaluation;
  byModel: Record<string, ModelEvaluation>;
  trends: {
    accuracy: number[];
    precision: number[];
    recall: number[];
    f1Score: number[];
  };
  metadata?: Record<string, unknown>;
}

export interface DailyFantasyRecommendation {
  player: string;
  position: string;
  expectedPoints: number;
  confidence: number;
  value: number;
  salary: number;
  projectedOwnership: number;
  leverage: number;
  metadata?: Record<string, unknown>;
}

export interface ModelUpdateRequest {
  data: unknown;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ModelEvaluationRequest {
  startDate: string;
  endDate: string;
  metrics: Array<keyof ModelEvaluation>;
  metadata?: Record<string, unknown>;
}

export interface PredictionError extends Error {
  code: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export type PredictionResult =
  | {
      success: true;
      data: PredictionResponse;
    }
  | {
      success: false;
      error: PredictionError;
    };

export interface ModelEnsemble {
  models: Array<{
    id: string;
    type: string;
    weight: number;
    performance: number;
  }>;
  method: 'stacking' | 'voting' | 'blending' | 'bagging';
  metaLearner?: string;
}

export interface AdvancedPrediction {
  value: number;
  confidence: number;
  uncertainty: number;
  metadata: Record<string, any>;
  modelContributions: Record<string, number>;
  featureImportance: Record<string, number>;
}

export interface MarketContext {
  volume: number;
  spread: number;
  depth: number;
  priceHistory: number[];
  impliedVolatility: number;
  arbitrageOpportunities: number;
  priceDiscrepancies: number;
  marketDepth: number;
}

export interface BettingContext {
  bankroll: number;
  exposure: number;
  historicalRisk: number;
  edge: number;
  odds: number;
  marketEfficiency: number;
  modelEdge: number;
  marketEdge: number;
  historicalEdge: number;
}

export interface ShapExplanation {
  feature: string;
  value: number;
  importance: number;
  impact: number;
  confidence: number;
}

export interface ModelPrediction {
  value: number;
  confidence: number;
  features: Record<string, number>;
  metadata: Record<string, any>;
}

export interface PredictionResult {
  success: boolean;
  data?: PredictionResponse;
  error?: {
    name: string;
    message: string;
    code: string;
    details: any;
    timestamp: string;
  };
}
