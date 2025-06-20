/**
 * Base model type definitions for ML models.
 */

// Minimal browser-compatible EventEmitter
class EventEmitter {
  private listeners: { [event: string]: Function[] } = {};
  on(event: string, fn: Function) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(fn);
  }
  off(event: string, fn: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  }
  emit(event: string, ...args: any[]) {
    (this.listeners[event] || []).forEach(fn => fn(...args));
  }
}
import * as tf from '@tensorflow/tfjs-node';
import { ModelConfig, ModelMetrics, ModelPrediction, ModelType } from '../types';
import { UnifiedLogger } from '../../../core/UnifiedLogger';
import { UnifiedErrorHandler } from '../../../core/UnifiedErrorHandler';
// Removed named imports from '../../../core/UnifiedError' as they do not exist.
import { ResourceManager } from '../resources/ResourceManager';

export interface TrainingConfig {
  data: any;
  validationSplit?: number;
  batchSize?: number;
  epochs?: number;
  callbacks?: any[];
}

export interface ModelUpdate {
  timestamp: string;
  type: 'training' | 'prediction' | 'evaluation';
  metrics?: ModelMetrics;
  metadata?: Record<string, any>;
}

export interface ModelError {
  code: string;
  message: string;
  details?: any;
}

export abstract class BaseModel extends EventEmitter {
  protected readonly modelId: string;
  protected readonly config: ModelConfig;
  protected isTrained: boolean;
  protected lastUpdate: string;
  protected metadata: Record<string, any>;
  protected readonly logger: UnifiedLogger;
  protected readonly errorHandler: UnifiedErrorHandler;
  protected metrics: ModelMetrics = {};
  protected model: any;
  protected isTraining: boolean = false;
  protected resourceManager: ResourceManager;

  constructor(config: ModelConfig) {
    super();
    this.modelId = config.name;
    this.config = config;
    this.isTrained = false;
    this.lastUpdate = new Date().toISOString();
    this.metadata = {};
    this.logger = UnifiedLogger.getInstance();
    this.errorHandler = UnifiedErrorHandler.getInstance();
    this.resourceManager = ResourceManager.getInstance();
  }

  public abstract predict(input: any): Promise<ModelPrediction>;

  public abstract train(data: any): Promise<void>;

  public abstract evaluate(data: any): Promise<ModelMetrics>;

  public abstract save(path: string): Promise<void>;

  public abstract load(path: string): Promise<void>;

  public getModelId(): string {
    return this.modelId;
  }

  public getConfig(): ModelConfig {
    return this.config;
  }

  public isModelTrained(): boolean {
    return this.isTrained;
  }

  public getLastUpdate(): string {
    return this.lastUpdate;
  }

  public getMetadata(): Record<string, any> {
    return { ...this.metadata };
  }

  getModelInfo(): Record<string, any> {
    return {
      modelId: this.modelId,
      type: this.config.type,
      isTrained: this.isTrained,
      lastUpdate: this.lastUpdate,
      metadata: this.metadata,
    };
  }

  protected updateLastUpdate(): void {
    this.lastUpdate = new Date().toISOString();
  }

  protected createPrediction(
    output: any,
    confidence?: number
  ): {
    output: any;
    confidence?: number;
  } {
    return {
      output,
      confidence,
    };
  }

  protected createError(message: string, error: Error): Error {
    if (error instanceof CoreModelError) {
      return error;
    }
    return new CoreModelError(message, { originalError: error });
  }

  protected async preprocessFeatures(data: any): Promise<any> {
    // Implement common preprocessing logic
    return data;
  }

  protected async validateFeatures(data: any): Promise<boolean> {
    // Implement common validation logic
    return true;
  }

  protected calculateMSE(actual: number[], predicted: number[]): number {
    return actual.reduce((acc, val, i) => acc + Math.pow(val - predicted[i], 2), 0) / actual.length;
  }

  protected calculateMAE(actual: number[], predicted: number[]): number {
    return actual.reduce((acc, val, i) => acc + Math.abs(val - predicted[i]), 0) / actual.length;
  }

  protected calculateMAPE(actual: number[], predicted: number[]): number {
    return (
      (actual.reduce((acc, val, i) => acc + Math.abs((val - predicted[i]) / val), 0) /
        actual.length) *
      100
    );
  }

  protected calculateF1Score(predictions: number[], actuals: number[]): number {
    const precision = this.calculatePrecision(predictions, actuals);
    const recall = this.calculateRecall(predictions, actuals);
    return (2 * (precision * recall)) / (precision + recall);
  }

  async evaluate(testData: any[]): Promise<ModelMetrics> {
    const startTime = Date.now();
    const predictions = await Promise.all(testData.map(d => this.predict(d)));

    const actual = testData.map(d => Object.values(this.preprocessFeatures(d))[0] as number);
    const predicted = predictions.map(p => p.probability);

    this.metrics.mse = this.calculateMSE(actual, predicted);
    this.metrics.mae = this.calculateMAE(actual, predicted);
    this.metrics.mape = this.calculateMAPE(actual, predicted);
    this.metrics.responseTime = Date.now() - startTime;

    return this.metrics;
  }

  protected async ensureGPU(): Promise<void> {
    await this.resourceManager.allocateResources(this);
  }

  protected calculateMetrics(predictions: number[], actuals: number[]): ModelMetrics {
    const metrics: ModelMetrics = {};

    // Calculate common metrics
    if (this.isClassification()) {
      metrics.accuracy = this.calculateAccuracy(predictions, actuals);
      metrics.precision = this.calculatePrecision(predictions, actuals);
      metrics.recall = this.calculateRecall(predictions, actuals);
      metrics.f1Score = this.calculateF1Score(predictions, actuals);
    } else {
      metrics.rmse = this.calculateRMSE(predictions, actuals);
      metrics.mae = this.calculateMAE(predictions, actuals);
      metrics.r2 = this.calculateR2(predictions, actuals);
    }

    return metrics;
  }

  protected isClassification(): boolean {
    return this.config.type === 'traditional' || this.config.type === 'deepLearning';
  }

  protected calculateAccuracy(predictions: number[], actuals: number[]): number {
    let correct = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === actuals[i]) correct++;
    }
    return correct / predictions.length;
  }

  protected calculatePrecision(predictions: number[], actuals: number[]): number {
    let truePositives = 0;
    let falsePositives = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === 1 && actuals[i] === 1) truePositives++;
      if (predictions[i] === 1 && actuals[i] === 0) falsePositives++;
    }
    return truePositives / (truePositives + falsePositives);
  }

  protected calculateRecall(predictions: number[], actuals: number[]): number {
    let truePositives = 0;
    let falseNegatives = 0;
    for (let i = 0; i < predictions.length; i++) {
      if (predictions[i] === 1 && actuals[i] === 1) truePositives++;
      if (predictions[i] === 0 && actuals[i] === 1) falseNegatives++;
    }
    return truePositives / (truePositives + falseNegatives);
  }

  protected calculateRMSE(predictions: number[], actuals: number[]): number {
    let sum = 0;
    for (let i = 0; i < predictions.length; i++) {
      sum += Math.pow(predictions[i] - actuals[i], 2);
    }
    return Math.sqrt(sum / predictions.length);
  }

  protected calculateR2(predictions: number[], actuals: number[]): number {
    const mean = actuals.reduce((a, b) => a + b, 0) / actuals.length;
    const ssTotal = actuals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    const ssResidual = predictions.reduce(
      (sum, pred, i) => sum + Math.pow(pred - actuals[i], 2),
      0
    );
    return 1 - ssResidual / ssTotal;
  }

  public getMetrics(): ModelMetrics {
    return this.metrics;
  }

  public getType(): ModelType {
    return this.config.type;
  }

  public getName(): string {
    return this.config.name;
  }

  public isModelTraining(): boolean {
    return this.isTraining;
  }
}

// Only export BaseModel once to avoid duplicate export errors
// Only export BaseModel once to avoid duplicate export errors
export type { ModelConfig, ModelPrediction };
// export { BaseModel }; // Removed duplicate export
