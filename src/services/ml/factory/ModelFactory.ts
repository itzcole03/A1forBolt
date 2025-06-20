import { BaseModel } from '../models/BaseModel';
import { AdvancedEnsembleModel } from '../models/AdvancedEnsembleModel';
import { MarketIntelligenceModel } from '../models/MarketIntelligenceModel';
import { GameTheoryModel } from '../models/GameTheoryModel';
import { TemporalPatternModel } from '../models/TemporalPatternModel';
import { AlternativeDataModel } from '../models/AlternativeDataModel';
import { RealityExploitationEngine } from '../models/RealityExploitationEngine';
import { QuantumProbabilityModel } from '../models/QuantumProbabilityModel';
import { ModelConfig, AdvancedEnsembleConfig } from '../types';
import { validateModelConfig } from '../config/modelConfig';
import { UnifiedErrorHandler } from '../../core/UnifiedErrorHandler';
import { UnifiedLogger } from '../../core/UnifiedLogger';
import { UnifiedMonitor } from '../../core/UnifiedMonitor';
import {
  ModelError,
  ConfigurationError,
  TrainingError,
  PredictionError,
  PersistenceError,
} from '../../core/UnifiedError';

export class ModelFactory {
  private static instance: ModelFactory;
  private models: Map<string, BaseModel>;
  private configs: Map<string, ModelConfig | AdvancedEnsembleConfig>;
  private metrics: Map<string, any>;
  private predictionHistory: Array<{
    timestamp: string;
    modelId: string;
    input: any;
    output: any;
    confidence?: number;
  }>;
  private logger: UnifiedLogger;
  private errorHandler: UnifiedErrorHandler;
  private monitor: UnifiedMonitor;

  private constructor() {
    this.models = new Map();
    this.configs = new Map();
    this.metrics = new Map();
    this.predictionHistory = [];
    this.logger = UnifiedLogger.getInstance();
    this.errorHandler = UnifiedErrorHandler.getInstance();
    this.monitor = UnifiedMonitor.getInstance();
  }

  public static getInstance(): ModelFactory {
    if (!ModelFactory.instance) {
      ModelFactory.instance = new ModelFactory();
    }
    return ModelFactory.instance;
  }

  public createModel(config: ModelConfig | AdvancedEnsembleConfig): BaseModel {
    try {
      validateModelConfig(config);
      this.configs.set(config.name, config);

      let model: BaseModel;
      switch (config.type) {
        case 'ensemble':
          model = new AdvancedEnsembleModel(config as AdvancedEnsembleConfig);
          break;
        case 'market_intelligence':
          model = new MarketIntelligenceModel(config);
          break;
        case 'game_theory':
          model = new GameTheoryModel(config, config.name);
          break;
        case 'temporal_pattern':
          model = new TemporalPatternModel(config, config.name);
          break;
        case 'alternative_data':
          model = new AlternativeDataModel(config, config.name);
          break;
        case 'reality_exploitation':
          model = new RealityExploitationEngine(config, config.name);
          break;
        case 'quantum_probability':
          model = new QuantumProbabilityModel(config, config.name);
          break;
        default:
          throw new ConfigurationError(`Unsupported model type: ${config.type}`);
      }

      this.models.set(config.name, model);
      this.logger.info(`Model ${config.name} created successfully`);
      this.monitor.setMetric(`model_${config.name}_created`, true);
      return model;
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'ModelFactory.createModel', { config });
      throw error;
    }
  }

  public trainModel(modelId: string, data: any): Promise<void> {
    try {
      const model = this.getModel(modelId);
      if (!model) {
        throw new ModelError(`Model ${modelId} not found`);
      }

      this.logger.info(`Training model ${modelId}`);
      this.monitor.setMetric(`model_${modelId}_training_started`, true);
      return model
        .train(data)
        .then(() => {
          this.logger.info(`Model ${modelId} trained successfully`);
          this.monitor.setMetric(`model_${modelId}_training_completed`, true);
        })
        .catch(error => {
          this.errorHandler.handleError(error as Error, 'ModelFactory.trainModel', {
            modelId,
            data,
          });
          throw new TrainingError(`Failed to train model ${modelId}`, { error });
        });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'ModelFactory.trainModel', { modelId, data });
      throw error;
    }
  }

  public predict(modelId: string, input: any): Promise<any> {
    try {
      const model = this.getModel(modelId);
      if (!model) {
        throw new ModelError(`Model ${modelId} not found`);
      }

      this.logger.info(`Making prediction with model ${modelId}`);
      this.monitor.setMetric(`model_${modelId}_prediction_started`, true);
      return model
        .predict(input)
        .then(result => {
          this.predictionHistory.push({
            timestamp: new Date().toISOString(),
            modelId,
            input,
            output: result.output,
            confidence: result.confidence,
          });
          this.logger.info(`Prediction completed for model ${modelId}`);
          this.monitor.setMetric(`model_${modelId}_prediction_completed`, true);
          return result;
        })
        .catch(error => {
          this.errorHandler.handleError(error as Error, 'ModelFactory.predict', { modelId, input });
          throw new PredictionError(`Failed to make prediction with model ${modelId}`, { error });
        });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'ModelFactory.predict', { modelId, input });
      throw error;
    }
  }

  public getModel(modelId: string): BaseModel | undefined {
    return this.models.get(modelId);
  }

  public getModelConfig(modelId: string): ModelConfig | AdvancedEnsembleConfig | undefined {
    return this.configs.get(modelId);
  }

  public getModelMetrics(modelId: string): any {
    return this.metrics.get(modelId);
  }

  public getPredictionHistory(modelId?: string): Array<{
    timestamp: string;
    modelId: string;
    input: any;
    output: any;
    confidence?: number;
  }> {
    if (modelId) {
      return this.predictionHistory.filter(entry => entry.modelId === modelId);
    }
    return [...this.predictionHistory];
  }

  public saveModel(modelId: string, path: string): Promise<void> {
    try {
      const model = this.getModel(modelId);
      if (!model) {
        throw new ModelError(`Model ${modelId} not found`);
      }

      this.logger.info(`Saving model ${modelId} to ${path}`);
      this.monitor.setMetric(`model_${modelId}_save_started`, true);
      return model
        .save(path)
        .then(() => {
          this.logger.info(`Model ${modelId} saved successfully`);
          this.monitor.setMetric(`model_${modelId}_save_completed`, true);
        })
        .catch(error => {
          this.errorHandler.handleError(error as Error, 'ModelFactory.saveModel', {
            modelId,
            path,
          });
          throw new PersistenceError(`Failed to save model ${modelId}`, { error });
        });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'ModelFactory.saveModel', { modelId, path });
      throw error;
    }
  }

  public loadModel(modelId: string, path: string): Promise<void> {
    try {
      const model = this.getModel(modelId);
      if (!model) {
        throw new ModelError(`Model ${modelId} not found`);
      }

      this.logger.info(`Loading model ${modelId} from ${path}`);
      this.monitor.setMetric(`model_${modelId}_load_started`, true);
      return model
        .load(path)
        .then(() => {
          this.logger.info(`Model ${modelId} loaded successfully`);
          this.monitor.setMetric(`model_${modelId}_load_completed`, true);
        })
        .catch(error => {
          this.errorHandler.handleError(error as Error, 'ModelFactory.loadModel', {
            modelId,
            path,
          });
          throw new PersistenceError(`Failed to load model ${modelId}`, { error });
        });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'ModelFactory.loadModel', { modelId, path });
      throw error;
    }
  }

  public removeModel(modelId: string): void {
    try {
      if (!this.models.has(modelId)) {
        throw new ModelError(`Model ${modelId} not found`);
      }

      this.models.delete(modelId);
      this.configs.delete(modelId);
      this.metrics.delete(modelId);
      this.predictionHistory = this.predictionHistory.filter(entry => entry.modelId !== modelId);
      this.logger.info(`Model ${modelId} removed successfully`);
      this.monitor.setMetric(`model_${modelId}_removed`, true);
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'ModelFactory.removeModel', { modelId });
      throw error;
    }
  }

  public listModels(): string[] {
    return Array.from(this.models.keys());
  }

  public getModelInfo(modelId: string):
    | {
        config: ModelConfig | AdvancedEnsembleConfig;
        isTrained: boolean;
        lastUpdate: string;
        metrics: any;
      }
    | undefined {
    const model = this.getModel(modelId);
    const config = this.getModelConfig(modelId);
    if (!model || !config) {
      return undefined;
    }

    return {
      config,
      isTrained: model.isModelTrained(),
      lastUpdate: model.getLastUpdate(),
      metrics: this.getModelMetrics(modelId),
    };
  }

  public isModelTrained(modelId: string): boolean {
    const model = this.getModel(modelId);
    return model ? model.isModelTrained() : false;
  }
}
