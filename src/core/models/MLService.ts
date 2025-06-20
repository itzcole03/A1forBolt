import { ModelMetadata, ModelVersion, ModelEvaluation, ModelTrainingConfig } from './types';

export interface MLService {
  // Model Management
  createModel(metadata: ModelMetadata): Promise<string>;
  getModel(modelId: string): Promise<ModelMetadata>;
  updateModel(modelId: string, metadata: Partial<ModelMetadata>): Promise<void>;
  deleteModel(modelId: string): Promise<void>;

  // Version Management
  getVersions(modelId: string): Promise<ModelVersion[]>;
  getVersion(modelId: string, version: string): Promise<ModelVersion>;
  deleteVersion(modelId: string, version: string): Promise<void>;

  // Training
  train(modelId: string, data: any, config: ModelTrainingConfig): Promise<ModelVersion>;
  retrain(modelId: string, data: any, config: ModelTrainingConfig): Promise<ModelVersion>;

  // Prediction
  predict(modelId: string, data: any): Promise<any>;
  predictBatch(modelId: string, data: any[]): Promise<any[]>;

  // Evaluation
  evaluate(modelId: string, data: any): Promise<ModelEvaluation>;
  evaluateVersion(modelId: string, version: string, data: any): Promise<ModelEvaluation>;

  // Performance
  getPerformanceMetrics(modelId: string): Promise<{
    trainingTime: number;
    inferenceTime: number;
    memoryUsage: number;
  }>;

  // Feature Management
  getFeatureImportance(modelId: string): Promise<Record<string, number>>;
  updateFeatures(modelId: string, features: string[]): Promise<void>;

  // Model Registry
  registerModel(modelId: string): Promise<void>;
  unregisterModel(modelId: string): Promise<void>;

  // Model State
  saveModel(modelId: string): Promise<void>;
  loadModel(modelId: string): Promise<void>;
  exportModel(modelId: string, format: string): Promise<any>;
  importModel(data: any, format: string): Promise<string>;

  // Model Monitoring
  getModelStatus(modelId: string): Promise<{
    status: 'active' | 'archived' | 'deprecated';
    lastUpdated: Date;
    performance: {
      accuracy: number;
      latency: number;
      throughput: number;
    };
  }>;

  // Model Optimization
  optimize(modelId: string, config: any): Promise<void>;
  tuneHyperparameters(modelId: string, config: any): Promise<ModelVersion>;

  // Model Validation
  validateModel(modelId: string): Promise<{
    isValid: boolean;
    issues: string[];
    recommendations: string[];
  }>;

  // Model Documentation
  getModelDocumentation(modelId: string): Promise<{
    description: string;
    architecture: string;
    parameters: Record<string, any>;
    examples: any[];
  }>;

  // Model Lifecycle
  archiveModel(modelId: string): Promise<void>;
  restoreModel(modelId: string): Promise<void>;
  deprecateModel(modelId: string): Promise<void>;
}
