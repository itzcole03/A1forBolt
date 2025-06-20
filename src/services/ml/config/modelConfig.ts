import { ModelConfig, AdvancedEnsembleConfig } from '../types';

export function validateModelConfig(config: ModelConfig | AdvancedEnsembleConfig): void {
  if (!config.name) {
    throw new Error('Model name is required');
  }

  if (!config.type) {
    throw new Error('Model type is required');
  }

  if (!Array.isArray(config.features) || config.features.length === 0) {
    throw new Error('Model features must be a non-empty array');
  }

  if (!config.target) {
    throw new Error('Model target is required');
  }

  if (config.type === 'ensemble') {
    validateEnsembleConfig(config as AdvancedEnsembleConfig);
  }
}

function validateEnsembleConfig(config: AdvancedEnsembleConfig): void {
  if (!Array.isArray(config.models) || config.models.length === 0) {
    throw new Error('Ensemble model must have at least one model');
  }

  config.models.forEach((model, index) => {
    if (!model.name) {
      throw new Error(`Model at index ${index} must have a name`);
    }

    if (!model.type) {
      throw new Error(`Model at index ${index} must have a type`);
    }

    if (typeof model.weight !== 'number' || model.weight <= 0) {
      throw new Error(`Model at index ${index} must have a positive weight`);
    }

    if (!model.config) {
      throw new Error(`Model at index ${index} must have a configuration`);
    }

    validateModelConfig(model.config);
  });

  if (typeof config.dynamicWeighting !== 'boolean') {
    throw new Error('Dynamic weighting must be a boolean');
  }

  if (
    typeof config.consensusThreshold !== 'number' ||
    config.consensusThreshold < 0 ||
    config.consensusThreshold > 1
  ) {
    throw new Error('Consensus threshold must be a number between 0 and 1');
  }

  if (!['majority', 'weighted', 'best'].includes(config.fallbackStrategy)) {
    throw new Error('Fallback strategy must be one of: majority, weighted, best');
  }
}

export const defaultModelConfig: AdvancedEnsembleConfig = {
  name: 'default_ensemble',
  type: 'ensemble',
  features: [],
  target: '',
  models: [
    {
      name: 'market_intelligence',
      type: 'market_intelligence',
      weight: 0.3,
      config: {
        name: 'market_intelligence',
        type: 'market_intelligence',
        features: [],
        target: '',
        hyperparameters: {
          learningRate: 0.001,
          batchSize: 32,
          maxEpochs: 100,
          validationSplit: 0.2,
          regularization: 0.01,
          dropout: 0.2,
          optimizer: 'adam',
          loss: 'mse',
          metrics: ['accuracy', 'precision', 'recall', 'f1'],
        },
      },
    },
    {
      name: 'game_theory',
      type: 'game_theory',
      weight: 0.2,
      config: {
        name: 'game_theory',
        type: 'game_theory',
        features: [],
        target: '',
        hyperparameters: {
          learningRate: 0.001,
          batchSize: 32,
          maxEpochs: 100,
          validationSplit: 0.2,
          regularization: 0.01,
          dropout: 0.2,
          optimizer: 'adam',
          loss: 'mse',
          metrics: ['accuracy', 'precision', 'recall', 'f1'],
        },
      },
    },
    {
      name: 'temporal_pattern',
      type: 'temporal_pattern',
      weight: 0.2,
      config: {
        name: 'temporal_pattern',
        type: 'temporal_pattern',
        features: [],
        target: '',
        hyperparameters: {
          learningRate: 0.001,
          batchSize: 32,
          maxEpochs: 100,
          validationSplit: 0.2,
          regularization: 0.01,
          dropout: 0.2,
          optimizer: 'adam',
          loss: 'mse',
          metrics: ['accuracy', 'precision', 'recall', 'f1'],
        },
      },
    },
    {
      name: 'alternative_data',
      type: 'alternative_data',
      weight: 0.15,
      config: {
        name: 'alternative_data',
        type: 'alternative_data',
        features: [],
        target: '',
        hyperparameters: {
          learningRate: 0.001,
          batchSize: 32,
          maxEpochs: 100,
          validationSplit: 0.2,
          regularization: 0.01,
          dropout: 0.2,
          optimizer: 'adam',
          loss: 'mse',
          metrics: ['accuracy', 'precision', 'recall', 'f1'],
        },
      },
    },
    {
      name: 'reality_exploitation',
      type: 'reality_exploitation',
      weight: 0.1,
      config: {
        name: 'reality_exploitation',
        type: 'reality_exploitation',
        features: [],
        target: '',
        hyperparameters: {
          learningRate: 0.001,
          batchSize: 32,
          maxEpochs: 100,
          validationSplit: 0.2,
          regularization: 0.01,
          dropout: 0.2,
          optimizer: 'adam',
          loss: 'mse',
          metrics: ['accuracy', 'precision', 'recall', 'f1'],
        },
      },
    },
    {
      name: 'quantum_probability',
      type: 'quantum_probability',
      weight: 0.05,
      config: {
        name: 'quantum_probability',
        type: 'quantum_probability',
        features: [],
        target: '',
        hyperparameters: {
          learningRate: 0.001,
          batchSize: 32,
          maxEpochs: 100,
          validationSplit: 0.2,
          regularization: 0.01,
          dropout: 0.2,
          optimizer: 'adam',
          loss: 'mse',
          metrics: ['accuracy', 'precision', 'recall', 'f1'],
        },
      },
    },
  ],
  dynamicWeighting: true,
  consensusThreshold: 0.7,
  fallbackStrategy: 'weighted',
};

export const createModelConfig = (
  overrides: Partial<AdvancedEnsembleConfig> = {}
): AdvancedEnsembleConfig => {
  const config = {
    ...defaultModelConfig,
    ...overrides,
    models: {
      ...defaultModelConfig.models,
      ...(overrides.models || {}),
    },
    dynamicWeighting: overrides.dynamicWeighting
      ? {
          ...defaultModelConfig.dynamicWeighting,
          ...overrides.dynamicWeighting,
        }
      : defaultModelConfig.dynamicWeighting,
    hyperparameters: overrides.hyperparameters
      ? {
          ...defaultModelConfig.hyperparameters,
          ...overrides.hyperparameters,
        }
      : defaultModelConfig.hyperparameters,
  };

  validateModelConfig(config);
  return config;
};

export const validateRegularModelConfig = (config: ModelConfig): boolean => {
  // Validate required fields
  if (!config.name) {
    throw new Error('Model name is required');
  }
  if (!config.type) {
    throw new Error('Model type is required');
  }
  if (!config.features || config.features.length === 0) {
    throw new Error('Model features are required');
  }
  if (!config.target) {
    throw new Error('Model target is required');
  }

  // Validate hyperparameters if present
  if (config.hyperparameters) {
    if (config.learningRate && config.learningRate <= 0) {
      throw new Error('learningRate must be positive');
    }
    if (config.batchSize && config.batchSize <= 0) {
      throw new Error('batchSize must be positive');
    }
    if (config.maxEpochs && config.maxEpochs <= 0) {
      throw new Error('maxEpochs must be positive');
    }
    if (config.validationSplit && (config.validationSplit <= 0 || config.validationSplit >= 1)) {
      throw new Error('validationSplit must be between 0 and 1');
    }
    if (config.regularization) {
      if (!['l1', 'l2', 'elasticnet'].includes(config.regularization.type)) {
        throw new Error('Invalid regularization type');
      }
      if (config.regularization.strength <= 0) {
        throw new Error('Regularization strength must be positive');
      }
    }
  }

  return true;
};
