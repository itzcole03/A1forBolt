export interface ModelMetadata {
  id: string;
  name: string;
  description: string;
  type: string;
  version: string;
  createdAt: Date;
  updatedAt: Date;
  parameters: Record<string, any>;
  tags: string[];
  owner: string;
  status: 'active' | 'archived' | 'deprecated';
}

export interface ModelVersion {
  version: string;
  modelId: string;
  createdAt: Date;
  metrics: ModelEvaluation;
  artifacts: {
    modelPath: string;
    configPath: string;
    metadataPath: string;
  };
  trainingConfig: {
    algorithm: string;
    hyperparameters: Record<string, any>;
    features: string[];
    target: string;
    validationSplit: number;
  };
}

export interface ModelEvaluation {
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
  featureImportance: Record<string, number>;
  performanceMetrics: {
    trainingTime: number;
    inferenceTime: number;
    memoryUsage: number;
  };
  customMetrics: Record<string, number>;
}

export interface ModelRegistryConfig {
  storagePath: string;
  maxVersions: number;
  backupEnabled: boolean;
  backupInterval: number;
}

export interface ModelEvaluatorConfig {
  metrics: string[];
  validationSplit: number;
  crossValidation: number;
  customMetrics?: Record<string, (yTrue: any[], yPred: any[]) => number>;
}

export interface ModelTrainingConfig {
  algorithm: string;
  hyperparameters: Record<string, any>;
  features: string[];
  target: string;
  validationSplit: number;
  earlyStopping?: {
    patience: number;
    minDelta: number;
  };
  callbacks?: Array<(epoch: number, metrics: any) => void>;
}
