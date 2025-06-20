/**
 * Advanced ensemble model that combines multiple specialized models for improved predictions.
 */

import { BaseModel } from './BaseModel';
import { AdvancedEnsembleConfig, ModelMetrics, ModelPrediction } from '../types';
import { UnifiedLogger } from '../../core/UnifiedLogger';
import { UnifiedErrorHandler } from '../../core/UnifiedErrorHandler';
import { MarketIntelligenceModel } from './MarketIntelligenceModel';

export class AdvancedEnsembleModel extends BaseModel {
  private models: Map<string, BaseModel> = new Map();
  private weights: Map<string, number> = new Map();
  protected readonly logger: UnifiedLogger;
  protected readonly errorHandler: UnifiedErrorHandler;

  constructor(config: AdvancedEnsembleConfig) {
    super(config);
    this.logger = UnifiedLogger.getInstance();
    this.errorHandler = UnifiedErrorHandler.getInstance();
    this.initializeModels(config);
  }

  private initializeModels(config: AdvancedEnsembleConfig): void {
    try {
      config.models.forEach(modelConfig => {
        const model = this.createModel(modelConfig);
        this.models.set(modelConfig.name, model);
        this.weights.set(modelConfig.name, modelConfig.weight);
      });
      this.logger.info(`Initialized ensemble model with ${this.models.size} models`);
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'AdvancedEnsembleModel.initializeModels', {
        config,
      });
      throw error;
    }
  }

  private createModel(config: any): BaseModel {
    // For now, we'll use MarketIntelligenceModel as a concrete implementation
    // In a real implementation, this would create different model types based on config.type
    return new MarketIntelligenceModel(config);
  }

  async predict(data: any): Promise<any> {
    try {
      const predictions: Array<{ model: string; prediction: any; confidence: number }> = [];

      for (const [modelName, model] of this.models) {
        const prediction = await model.predict(data);
        predictions.push({
          model: modelName,
          prediction: prediction.output,
          confidence: prediction.confidence || 1.0,
        });
      }

      const weightedPrediction = this.combinePredictions(predictions);
      return this.createPrediction(weightedPrediction, this.calculateConfidence(predictions));
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'AdvancedEnsembleModel.predict', { data });
      throw error;
    }
  }

  private combinePredictions(
    predictions: Array<{ model: string; prediction: any; confidence: number }>
  ): any {
    const totalWeight = predictions.reduce(
      (sum, pred) => sum + (this.weights.get(pred.model) || 0),
      0
    );
    return predictions.reduce((sum, pred) => {
      const weight = (this.weights.get(pred.model) || 0) / totalWeight;
      return sum + pred.prediction * weight;
    }, 0);
  }

  private calculateConfidence(
    predictions: Array<{ model: string; prediction: any; confidence: number }>
  ): number {
    const totalWeight = predictions.reduce(
      (sum, pred) => sum + (this.weights.get(pred.model) || 0),
      0
    );
    return predictions.reduce((sum, pred) => {
      const weight = (this.weights.get(pred.model) || 0) / totalWeight;
      return sum + pred.confidence * weight;
    }, 0);
  }

  async train(data: any): Promise<void> {
    try {
      for (const [modelName, model] of this.models) {
        await model.train(data);
        this.logger.info(`Trained model: ${modelName}`);
      }
      this.isTrained = true;
      this.lastUpdate = new Date().toISOString();
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'AdvancedEnsembleModel.train', { data });
      throw error;
    }
  }

  async evaluate(data: any): Promise<ModelMetrics> {
    try {
      const metrics: ModelMetrics = {};
      let totalWeight = 0;

      for (const [modelName, model] of this.models) {
        const modelMetrics = await model.evaluate(data);
        const weight = this.weights.get(modelName) || 0;
        totalWeight += weight;

        // Combine metrics with weights
        Object.entries(modelMetrics).forEach(([key, value]) => {
          if (value !== undefined) {
            metrics[key as keyof ModelMetrics] =
              (metrics[key as keyof ModelMetrics] || 0) + value * weight;
          }
        });
      }

      // Normalize metrics by total weight
      Object.keys(metrics).forEach(key => {
        if (metrics[key as keyof ModelMetrics] !== undefined) {
          metrics[key as keyof ModelMetrics] =
            (metrics[key as keyof ModelMetrics] as number) / totalWeight;
        }
      });

      return metrics;
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'AdvancedEnsembleModel.evaluate', { data });
      throw error;
    }
  }

  async save(path: string): Promise<void> {
    try {
      for (const [modelName, model] of this.models) {
        await model.save(`${path}/${modelName}`);
      }
      this.logger.info(`Saved ensemble model to: ${path}`);
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'AdvancedEnsembleModel.save', { path });
      throw error;
    }
  }

  async load(path: string): Promise<void> {
    try {
      for (const [modelName, model] of this.models) {
        await model.load(`${path}/${modelName}`);
      }
      this.logger.info(`Loaded ensemble model from: ${path}`);
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'AdvancedEnsembleModel.load', { path });
      throw error;
    }
  }
}
