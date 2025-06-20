import { BaseModel } from '../models/BaseModel';
import { ModelRegistry } from '../registry/ModelRegistry';
import { EventEmitter } from 'events';

interface EnsembleConfig {
  name: string;
  models: string[];
  weights?: { [modelName: string]: number };
  votingStrategy: 'weighted' | 'majority' | 'confidence';
  minConfidence: number;
  minModels: number;
}

interface EnsemblePrediction {
  prediction: any;
  confidence: number;
  modelContributions: {
    [modelName: string]: {
      prediction: any;
      confidence: number;
      weight: number;
    };
  };
  metadata: {
    timestamp: number;
    modelCount: number;
    votingStrategy: string;
  };
}

export class EnsembleManager extends EventEmitter {
  private static instance: EnsembleManager;
  private ensembles: Map<string, EnsembleConfig> = new Map();
  private modelRegistry: ModelRegistry;

  private constructor() {
    super();
    this.modelRegistry = ModelRegistry.getInstance();
  }

  public static getInstance(): EnsembleManager {
    if (!EnsembleManager.instance) {
      EnsembleManager.instance = new EnsembleManager();
    }
    return EnsembleManager.instance;
  }

  public async createEnsemble(config: EnsembleConfig): Promise<void> {
    // Validate models exist
    for (const modelName of config.models) {
      if (!this.modelRegistry.getModel(modelName)) {
        throw new Error(`Model ${modelName} not found in registry`);
      }
    }

    // Initialize weights if not provided
    if (!config.weights) {
      config.weights = {};
      const weight = 1 / config.models.length;
      config.models.forEach(model => {
        config.weights![model] = weight;
      });
    }

    this.ensembles.set(config.name, config);
    this.emit('ensembleCreated', { name: config.name, config });
  }

  public async getEnsemblePrediction(
    ensembleName: string,
    input: any
  ): Promise<EnsemblePrediction> {
    const ensemble = this.ensembles.get(ensembleName);
    if (!ensemble) {
      throw new Error(`Ensemble ${ensembleName} not found`);
    }

    // Get predictions from all models
    const predictions = await Promise.all(
      ensemble.models.map(async modelName => {
        const model = this.modelRegistry.getModel(modelName);
        if (!model) {
          throw new Error(`Model ${modelName} not found`);
        }
        const prediction = await model.predict(input);
        return {
          modelName,
          prediction,
          weight: ensemble.weights![modelName],
        };
      })
    );

    // Combine predictions based on voting strategy
    const combinedPrediction = this.combinePredictions(predictions, ensemble);

    // Create ensemble prediction object
    const ensemblePrediction: EnsemblePrediction = {
      prediction: combinedPrediction.prediction,
      confidence: combinedPrediction.confidence,
      modelContributions: {},
      metadata: {
        timestamp: Date.now(),
        modelCount: predictions.length,
        votingStrategy: ensemble.votingStrategy,
      },
    };

    // Add individual model contributions
    predictions.forEach(({ modelName, prediction, weight }) => {
      ensemblePrediction.modelContributions[modelName] = {
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        weight,
      };
    });

    this.emit('predictionGenerated', {
      ensembleName,
      prediction: ensemblePrediction,
    });

    return ensemblePrediction;
  }

  private combinePredictions(
    predictions: Array<{
      modelName: string;
      prediction: any;
      weight: number;
    }>,
    ensemble: EnsembleConfig
  ): { prediction: any; confidence: number } {
    switch (ensemble.votingStrategy) {
      case 'weighted':
        return this.weightedVoting(predictions);
      case 'majority':
        return this.majorityVoting(predictions);
      case 'confidence':
        return this.confidenceVoting(predictions);
      default:
        throw new Error(`Unknown voting strategy: ${ensemble.votingStrategy}`);
    }
  }

  private weightedVoting(
    predictions: Array<{
      modelName: string;
      prediction: any;
      weight: number;
    }>
  ): { prediction: any; confidence: number } {
    const weightedSum = predictions.reduce(
      (sum, { prediction, weight }) => sum + prediction.prediction * weight,
      0
    );

    const confidence = predictions.reduce(
      (sum, { prediction, weight }) => sum + prediction.confidence * weight,
      0
    );

    return {
      prediction: weightedSum,
      confidence,
    };
  }

  private majorityVoting(
    predictions: Array<{
      modelName: string;
      prediction: any;
      weight: number;
    }>
  ): { prediction: any; confidence: number } {
    const votes = new Map<any, number>();
    let totalConfidence = 0;

    predictions.forEach(({ prediction }) => {
      const vote = Math.round(prediction.prediction);
      votes.set(vote, (votes.get(vote) || 0) + 1);
      totalConfidence += prediction.confidence;
    });

    let maxVotes = 0;
    let majorityPrediction = null;

    votes.forEach((count, prediction) => {
      if (count > maxVotes) {
        maxVotes = count;
        majorityPrediction = prediction;
      }
    });

    return {
      prediction: majorityPrediction,
      confidence: totalConfidence / predictions.length,
    };
  }

  private confidenceVoting(
    predictions: Array<{
      modelName: string;
      prediction: any;
      weight: number;
    }>
  ): { prediction: any; confidence: number } {
    const sortedPredictions = [...predictions].sort(
      (a, b) => b.prediction.confidence - a.prediction.confidence
    );

    return {
      prediction: sortedPredictions[0].prediction.prediction,
      confidence: sortedPredictions[0].prediction.confidence,
    };
  }

  public async updateEnsembleWeights(
    ensembleName: string,
    weights: { [modelName: string]: number }
  ): Promise<void> {
    const ensemble = this.ensembles.get(ensembleName);
    if (!ensemble) {
      throw new Error(`Ensemble ${ensembleName} not found`);
    }

    // Validate weights
    const totalWeight = Object.values(weights).reduce((sum, weight) => sum + weight, 0);
    if (Math.abs(totalWeight - 1) > 0.0001) {
      throw new Error('Weights must sum to 1');
    }

    ensemble.weights = weights;
    this.emit('weightsUpdated', { ensembleName, weights });
  }

  public getEnsembleConfig(ensembleName: string): EnsembleConfig | undefined {
    return this.ensembles.get(ensembleName);
  }

  public getAllEnsembles(): Map<string, EnsembleConfig> {
    return new Map(this.ensembles);
  }

  public async removeEnsemble(ensembleName: string): Promise<void> {
    if (this.ensembles.delete(ensembleName)) {
      this.emit('ensembleRemoved', { name: ensembleName });
    }
  }
}
