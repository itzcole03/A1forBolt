/**
 * Service for comparing model predictions and performance.
 */

import type { ModelPrediction } from '../ml/models/BaseModel';
import type { ModelEvaluation } from './ModelEvaluationService';
import type { ModelComparisonResult } from './types';

export interface ModelPredictionInput {
  name: string;
  prediction: number;
  confidence: number;
  performance?: ModelEvaluation;
}

export interface ComparisonRequest {
  predictions: ModelPredictionInput[];
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface ComparisonError extends Error {
  code: string;
  details?: Record<string, unknown>;
  timestamp: string;
}

export type ComparisonResponse =
  | {
      success: true;
      data: ModelComparisonResult;
    }
  | {
      success: false;
      error: ComparisonError;
    };

export class ModelComparisonService {
  private comparisons: Map<string, ModelComparisonResult[]> = new Map();

  async compareModels(request: ComparisonRequest): Promise<ComparisonResponse> {
    try {
      // Calculate consensus prediction using weighted average
      const weightedSum = request.predictions.reduce((sum, model) => {
        return sum + model.prediction * (model.performance?.accuracy || 0.5);
      }, 0);

      const totalWeight = request.predictions.reduce((sum, model) => {
        return sum + (model.performance?.accuracy || 0.5);
      }, 0);

      const consensusPrediction = weightedSum / totalWeight;

      // Calculate model agreement
      const agreement = this.calculateModelAgreement(request.predictions);

      // Calculate consensus confidence
      const consensusConfidence = this.calculateConsensusConfidence(request.predictions);

      const result: ModelComparisonResult = {
        models: request.predictions.map(model => ({
          name: model.name,
          prediction: model.prediction,
          confidence: model.confidence,
          performance: model.performance || {
            accuracy: 0.5,
            precision: 0.5,
            recall: 0.5,
            f1Score: 0.5,
          },
        })),
        consensus: {
          prediction: consensusPrediction,
          confidence: consensusConfidence,
          agreement,
        },
        timestamp: request.timestamp,
      };

      // Store comparison result
      const comparisonKey = request.timestamp;
      const comparisons = this.comparisons.get(comparisonKey) || [];
      comparisons.push(result);
      this.comparisons.set(comparisonKey, comparisons);

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      const comparisonError: ComparisonError = {
        name: 'ModelComparisonError',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
        code: 'COMP_ERROR',
        details: { request },
        timestamp: new Date().toISOString(),
      };

      return {
        success: false,
        error: comparisonError,
      };
    }
  }

  private calculateModelAgreement(predictions: ModelPredictionInput[]): number {
    if (predictions.length <= 1) return 1;

    const threshold = 0.1; // Consider predictions within 10% as agreeing
    let agreementCount = 0;
    let totalComparisons = 0;

    for (let i = 0; i < predictions.length; i++) {
      for (let j = i + 1; j < predictions.length; j++) {
        const diff = Math.abs(predictions[i].prediction - predictions[j].prediction);
        const avg = (predictions[i].prediction + predictions[j].prediction) / 2;
        if (diff / avg <= threshold) {
          agreementCount++;
        }
        totalComparisons++;
      }
    }

    return totalComparisons > 0 ? agreementCount / totalComparisons : 1;
  }

  private calculateConsensusConfidence(predictions: ModelPredictionInput[]): number {
    if (predictions.length === 0) return 0;

    const weightedConfidence = predictions.reduce((sum, model) => {
      return sum + model.confidence * (model.performance?.accuracy || 0.5);
    }, 0);

    const totalWeight = predictions.reduce((sum, model) => {
      return sum + (model.performance?.accuracy || 0.5);
    }, 0);

    return totalWeight > 0 ? weightedConfidence / totalWeight : 0;
  }

  async getComparisonHistory(timestamp: string): Promise<ModelComparisonResult[]> {
    return this.comparisons.get(timestamp) || [];
  }

  async getLatestComparison(): Promise<ModelComparisonResult | null> {
    const timestamps = Array.from(this.comparisons.keys()).sort();
    if (timestamps.length === 0) return null;

    const latestTimestamp = timestamps[timestamps.length - 1];
    const comparisons = this.comparisons.get(latestTimestamp) || [];
    return comparisons.length > 0 ? comparisons[comparisons.length - 1] : null;
  }
}
