// ESM-compliant imports with explicit .js extensions
import { BaseModel, type ModelPrediction } from '../models/BaseModel.js';
import { ARIMAModel, ProphetModel } from '../models/TimeSeriesModels.js';
import { BayesianOptimizationModel, GeneticAlgorithmModel } from '../models/OptimizationModels.js';
import { LogisticRegressionModel, RandomForestModel } from '../models/TraditionalModels.js';
import { CNNModel, LSTMModel } from '../models/DeepLearningModels.js';
import { MarketIntelligenceModel } from '../models/MarketIntelligenceModel.js';
import { TemporalPatternModel } from '../models/TemporalPatternModel.js';
import { AlternativeDataModel } from '../models/AlternativeDataModel.js';
import { GameTheoryModel } from '../models/GameTheoryModel.js';
import { QuantumProbabilityModel } from '../models/QuantumProbabilityModel.js';

interface EnsembleConfig {
  models: {
    name: string;
    type: string;
    weight: number;
    hyperparameters?: Record<string, any>;
    features: string[];
    target: string;
  }[];
  metaLearner?: {
    type: string;
    hyperparameters?: Record<string, any>;
    features: string[];
    target: string;
  };
  marketIntelligence?: {
    enabled: boolean;
    weight: number;
    features: string[];
  };
  temporalPatterns?: {
    enabled: boolean;
    weight: number;
    features: string[];
  };
  alternativeData?: {
    enabled: boolean;
    weight: number;
    features: string[];
  };
  gameTheory?: {
    enabled: boolean;
    weight: number;
    features: string[];
  };
  quantumProbability?: {
    enabled: boolean;
    weight: number;
    features: string[];
  };
  stackedGeneralization?: {
    enabled: boolean;
    metaModelType: string;
    crossValidationFolds: number;
    hyperparameters?: Record<string, any>;
  };
  bayesianInference?: {
    enabled: boolean;
    priorStrength: number;
    mcmcSamples: number;
    hyperparameters?: Record<string, any>;
  };
}

interface ModelBreakdown {
  modelName: string;
  probability: number;
  confidence: number;
  weight: number;
  factors?: string[];
}

interface FeatureAttribution {
  feature: string;
  value: number;
  impact: number;
}

interface EnsemblePrediction {
  probability: number;
  confidence: number;
  modelBreakdown: ModelBreakdown[];
  factors: string[];
  historicalAccuracy: number;
  expectedValue: number;
  riskLevel: number;
  recommendedStake: number;
  edge: number;
  uncertainty?: {
    variance: number;
    credibleInterval: [number, number];
  };
  featureAttribution?: FeatureAttribution[];
  marketIntelligence?: {
    sharpAction: number;
    bookmakerVulnerability: number;
    goblinTrapAnalysis: number;
  };
  temporalPatterns?: {
    microTrends: number;
    macroTrends: number;
    cyclicalPatterns: number;
    circadianFactors: number;
  };
  alternativeData?: {
    socialMediaSentiment: number;
    weatherImpact: number;
    injuryImpact: number;
    travelImpact: number;
    venueImpact: number;
  };
  gameTheory?: {
    strategicAdvantage: number;
    psychologicalEdge: number;
    momentumFactor: number;
    pressureHandling: number;
    adaptationScore: number;
  };
  quantumProbability?: {
    superpositionScore: number;
    entanglementFactor: number;
    interferencePattern: number;
    tunnelingProbability: number;
    decoherenceRate: number;
  };
}

export class EnsemblePredictor {
  private models: Map<string, BaseModel>;
  private marketIntelligence?: MarketIntelligenceModel;
  private temporalPatterns?: TemporalPatternModel;
  private alternativeData?: AlternativeDataModel;
  private gameTheory?: GameTheoryModel;
  private quantumProbability?: QuantumProbabilityModel;
  private historicalPredictions: Map<string, Array<{ prediction: number; actual: number }>>;
  private config: EnsembleConfig;

  constructor(config: EnsembleConfig) {
    this.models = new Map();
    this.historicalPredictions = new Map();
    this.config = config;
    this.initializeModels();
  }

  private async initializeModels() {
    // Initialize base models
    for (const modelConfig of this.config.models) {
      let model: BaseModel;
      switch (modelConfig.type) {
        case 'arima':
          model = new ARIMAModel(modelConfig);
          break;
        case 'prophet':
          model = new ProphetModel(modelConfig);
          break;
        case 'bayesian':
          model = new BayesianOptimizationModel(modelConfig);
          break;
        case 'genetic':
          model = new GeneticAlgorithmModel(modelConfig);
          break;
        case 'logistic':
          model = new LogisticRegressionModel(modelConfig);
          break;
        case 'random_forest':
          model = new RandomForestModel(modelConfig);
          break;
        case 'cnn':
          model = new CNNModel(modelConfig);
          break;
        case 'lstm':
          model = new LSTMModel(modelConfig);
          break;
        default:
          throw new Error(`Unknown model type: ${modelConfig.type}`);
      }
      this.models.set(modelConfig.name, model);
      this.historicalPredictions.set(modelConfig.name, []);
    }

    // Initialize advanced models if enabled
    if (this.config.marketIntelligence?.enabled) {
      this.marketIntelligence = new MarketIntelligenceModel({
        name: 'market_intelligence',
        type: 'market_intelligence',
        features: this.config.marketIntelligence.features,
        target: 'probability',
        weight: this.config.marketIntelligence.weight,
      });
    }
    if (this.config.temporalPatterns?.enabled) {
      this.temporalPatterns = new TemporalPatternModel({
        name: 'temporal_patterns',
        type: 'temporal_patterns',
        features: this.config.temporalPatterns.features,
        target: 'probability',
        weight: this.config.temporalPatterns.weight,
      });
    }
    if (this.config.alternativeData?.enabled) {
      this.alternativeData = new AlternativeDataModel({
        name: 'alternative_data',
        type: 'alternative_data',
        features: this.config.alternativeData.features,
        target: 'probability',
        weight: this.config.alternativeData.weight,
      });
    }
    if (this.config.gameTheory?.enabled) {
      this.gameTheory = new GameTheoryModel({
        name: 'game_theory',
        type: 'game_theory',
        features: this.config.gameTheory.features,
        target: 'probability',
        weight: this.config.gameTheory.weight,
      });
    }
    if (this.config.quantumProbability?.enabled) {
      this.quantumProbability = new QuantumProbabilityModel({
        name: 'quantum_probability',
        type: 'quantum_probability',
        features: this.config.quantumProbability.features,
        target: 'probability',
        weight: this.config.quantumProbability.weight,
      });
    }
  }

  async predict(features: Record<string, any>): Promise<EnsemblePrediction> {
    // Get predictions from all models
    const predictions = await Promise.all(
      Array.from(this.models.entries()).map(async ([name, model]) => {
        const pred = await model.predict(features);
        return { name, prediction: pred };
      })
    );

    // Get advanced model predictions
    const advancedPredictions = await this.getAdvancedPredictions(features);

    // Calculate weighted average
    const weightedPrediction = this.calculateWeightedPrediction(predictions, advancedPredictions);

    // Calculate confidence and risk metrics
    const { confidence, riskLevel } = this.calculateConfidenceAndRisk(
      predictions,
      advancedPredictions
    );

    // Calculate historical accuracy
    const historicalAccuracy = this.calculateHistoricalAccuracy();

    // Calculate expected value and edge
    const { expectedValue, edge } = this.calculateExpectedValueAndEdge(
      weightedPrediction,
      features
    );

    // Calculate recommended stake
    const recommendedStake = this.calculateRecommendedStake(
      expectedValue,
      riskLevel,
      historicalAccuracy
    );

    // Generate factors
    const factors = this.generateFactors(predictions, advancedPredictions);

    // Uncertainty quantification using Bayesian/MCMC if enabled
    let uncertainty: { variance: number; credibleInterval: [number, number] } | undefined =
      undefined;
    if (this.config.bayesianInference?.enabled) {
      const bayesian = await this.getBayesianPrediction(predictions, features);
      uncertainty = {
        variance: bayesian.variance,
        credibleInterval: bayesian.credibleInterval,
      };
    }

    // Feature attribution (SHAP or permutation importance proxy)
    const featureAttribution = await this.computeFeatureAttribution(features);

    return {
      probability: weightedPrediction,
      confidence,
      modelBreakdown: predictions.map(({ name, prediction }) => ({
        modelName: name,
        probability: prediction.probability,
        confidence: prediction.confidence,
        weight: prediction.weight,
        factors: prediction.metadata?.factors,
      })),
      factors,
      historicalAccuracy,
      expectedValue,
      riskLevel,
      recommendedStake,
      edge,
      uncertainty,
      featureAttribution,
      ...advancedPredictions,
    };
  }

  private async getAdvancedPredictions(
    features: Record<string, any>
  ): Promise<Partial<EnsemblePrediction>> {
    const advancedPredictions: Partial<EnsemblePrediction> = {};

    if (this.marketIntelligence) {
      const prediction = await this.marketIntelligence.predict(features);
      if (prediction.metadata) {
        advancedPredictions.marketIntelligence = {
          sharpAction: prediction.metadata.sharpAction || 0,
          bookmakerVulnerability: prediction.metadata.bookmakerVulnerability || 0,
          goblinTrapAnalysis: prediction.metadata.goblinTrapAnalysis || 0,
        };
      }
    }
    if (this.temporalPatterns) {
      const prediction = await this.temporalPatterns.predict(features);
      if (prediction.metadata) {
        advancedPredictions.temporalPatterns = {
          microTrends: prediction.metadata.microTrends || 0,
          macroTrends: prediction.metadata.macroTrends || 0,
          cyclicalPatterns: prediction.metadata.cyclicalPatterns || 0,
          circadianFactors: prediction.metadata.circadianFactors || 0,
        };
      }
    }
    if (this.alternativeData) {
      const prediction = await this.alternativeData.predict(features);
      if (prediction.metadata) {
        advancedPredictions.alternativeData = {
          socialMediaSentiment: prediction.metadata.socialMediaSentiment || 0,
          weatherImpact: prediction.metadata.weatherImpact || 0,
          injuryImpact: prediction.metadata.injuryImpact || 0,
          travelImpact: prediction.metadata.travelImpact || 0,
          venueImpact: prediction.metadata.venueImpact || 0,
        };
      }
    }
    if (this.gameTheory) {
      const prediction = await this.gameTheory.predict(features);
      if (prediction.metadata) {
        advancedPredictions.gameTheory = {
          strategicAdvantage: prediction.metadata.strategicAdvantage || 0,
          psychologicalEdge: prediction.metadata.psychologicalEdge || 0,
          momentumFactor: prediction.metadata.momentumFactor || 0,
          pressureHandling: prediction.metadata.pressureHandling || 0,
          adaptationScore: prediction.metadata.adaptationScore || 0,
        };
      }
    }
    if (this.quantumProbability) {
      const prediction = await this.quantumProbability.predict(features);
      if (prediction.metadata) {
        advancedPredictions.quantumProbability = {
          superpositionScore: prediction.metadata.superpositionScore || 0,
          entanglementFactor: prediction.metadata.entanglementFactor || 0,
          interferencePattern: prediction.metadata.interferencePattern || 0,
          tunnelingProbability: prediction.metadata.tunnelingProbability || 0,
          decoherenceRate: prediction.metadata.decoherenceRate || 0,
        };
      }
    }

    return advancedPredictions;
  }

  private calculateWeightedPrediction(
    predictions: Array<{ name: string; prediction: ModelPrediction }>,
    advancedPredictions: Partial<EnsemblePrediction>
  ): number {
    let totalWeight = 0;
    let weightedSum = 0;

    // Add base model predictions
    for (const { prediction } of predictions) {
      weightedSum += prediction.probability * prediction.weight;
      totalWeight += prediction.weight;
    }

    // Add advanced model predictions
    if (advancedPredictions.marketIntelligence) {
      const weight = this.config.marketIntelligence?.weight || 0;
      weightedSum +=
        this.calculateMarketIntelligenceScore(advancedPredictions.marketIntelligence) * weight;
      totalWeight += weight;
    }
    if (advancedPredictions.temporalPatterns) {
      const weight = this.config.temporalPatterns?.weight || 0;
      weightedSum +=
        this.calculateTemporalPatternsScore(advancedPredictions.temporalPatterns) * weight;
      totalWeight += weight;
    }
    if (advancedPredictions.alternativeData) {
      const weight = this.config.alternativeData?.weight || 0;
      weightedSum +=
        this.calculateAlternativeDataScore(advancedPredictions.alternativeData) * weight;
      totalWeight += weight;
    }
    if (advancedPredictions.gameTheory) {
      const weight = this.config.gameTheory?.weight || 0;
      weightedSum += this.calculateGameTheoryScore(advancedPredictions.gameTheory) * weight;
      totalWeight += weight;
    }
    if (advancedPredictions.quantumProbability) {
      const weight = this.config.quantumProbability?.weight || 0;
      weightedSum +=
        this.calculateQuantumProbabilityScore(advancedPredictions.quantumProbability) * weight;
      totalWeight += weight;
    }

    return totalWeight > 0 ? weightedSum / totalWeight : 0.5;
  }

  private calculateMarketIntelligenceScore(
    marketIntelligence: NonNullable<EnsemblePrediction['marketIntelligence']>
  ): number {
    return (
      marketIntelligence.sharpAction * 0.4 +
      marketIntelligence.bookmakerVulnerability * 0.3 +
      marketIntelligence.goblinTrapAnalysis * 0.3
    );
  }

  private calculateTemporalPatternsScore(
    temporalPatterns: NonNullable<EnsemblePrediction['temporalPatterns']>
  ): number {
    return (
      temporalPatterns.microTrends * 0.3 +
      temporalPatterns.macroTrends * 0.3 +
      temporalPatterns.cyclicalPatterns * 0.2 +
      temporalPatterns.circadianFactors * 0.2
    );
  }

  private calculateAlternativeDataScore(
    alternativeData: NonNullable<EnsemblePrediction['alternativeData']>
  ): number {
    return (
      alternativeData.socialMediaSentiment * 0.2 +
      alternativeData.weatherImpact * 0.2 +
      alternativeData.injuryImpact * 0.2 +
      alternativeData.travelImpact * 0.2 +
      alternativeData.venueImpact * 0.2
    );
  }

  private calculateGameTheoryScore(
    gameTheory: NonNullable<EnsemblePrediction['gameTheory']>
  ): number {
    return (
      gameTheory.strategicAdvantage * 0.3 +
      gameTheory.psychologicalEdge * 0.2 +
      gameTheory.momentumFactor * 0.2 +
      gameTheory.pressureHandling * 0.2 +
      gameTheory.adaptationScore * 0.1
    );
  }

  private calculateQuantumProbabilityScore(
    quantumProbability: NonNullable<EnsemblePrediction['quantumProbability']>
  ): number {
    return (
      quantumProbability.superpositionScore * 0.2 +
      quantumProbability.entanglementFactor * 0.2 +
      quantumProbability.interferencePattern * 0.2 +
      quantumProbability.tunnelingProbability * 0.2 +
      quantumProbability.decoherenceRate * 0.2
    );
  }

  private calculateConfidenceAndRisk(
    predictions: Array<{ name: string; prediction: ModelPrediction }>,
    advancedPredictions: Partial<EnsemblePrediction>
  ): { confidence: number; riskLevel: number } {
    // Calculate base model confidence
    const baseConfidence =
      predictions.reduce((acc, { prediction }) => acc + prediction.confidence, 0) /
      predictions.length;

    // Calculate advanced model confidence
    let advancedConfidence = 0;
    let advancedCount = 0;

    if (advancedPredictions.marketIntelligence) {
      advancedConfidence += this.calculateMarketIntelligenceScore(
        advancedPredictions.marketIntelligence
      );
      advancedCount++;
    }
    if (advancedPredictions.temporalPatterns) {
      advancedConfidence += this.calculateTemporalPatternsScore(
        advancedPredictions.temporalPatterns
      );
      advancedCount++;
    }
    if (advancedPredictions.alternativeData) {
      advancedConfidence += this.calculateAlternativeDataScore(advancedPredictions.alternativeData);
      advancedCount++;
    }
    if (advancedPredictions.gameTheory) {
      advancedConfidence += this.calculateGameTheoryScore(advancedPredictions.gameTheory);
      advancedCount++;
    }
    if (advancedPredictions.quantumProbability) {
      advancedConfidence += this.calculateQuantumProbabilityScore(
        advancedPredictions.quantumProbability
      );
      advancedCount++;
    }

    advancedConfidence = advancedCount > 0 ? advancedConfidence / advancedCount : 0;

    // Calculate overall confidence
    const confidence = (baseConfidence + advancedConfidence) / 2;

    // Calculate risk level (inverse of confidence)
    const riskLevel = 1 - confidence;

    return { confidence, riskLevel };
  }

  private calculateHistoricalAccuracy(): number {
    let totalAccuracy = 0;
    let totalModels = 0;

    for (const [_, predictions] of this.historicalPredictions) {
      if (predictions.length > 0) {
        const accuracy =
          predictions.reduce(
            (acc, { prediction, actual }) => acc + (Math.abs(prediction - actual) < 0.1 ? 1 : 0),
            0
          ) / predictions.length;
        totalAccuracy += accuracy;
        totalModels++;
      }
    }

    return totalModels > 0 ? totalAccuracy / totalModels : 0.5;
  }

  private calculateExpectedValueAndEdge(
    prediction: number,
    features: Record<string, any>
  ): { expectedValue: number; edge: number } {
    const odds = features.odds || 2.0;
    const impliedProbability = 1 / odds;
    const edge = prediction - impliedProbability;
    const expectedValue = edge * odds;

    return { expectedValue, edge };
  }

  private calculateRecommendedStake(
    expectedValue: number,
    riskLevel: number,
    historicalAccuracy: number
  ): number {
    // Kelly Criterion with risk adjustment
    const kellyFraction = expectedValue / (1 - expectedValue);
    const riskAdjustedFraction = kellyFraction * (1 - riskLevel) * historicalAccuracy;
    return Math.max(0, Math.min(riskAdjustedFraction, 0.1)); // Cap at 10% of bankroll
  }

  private generateFactors(
    predictions: Array<{ name: string; prediction: ModelPrediction }>,
    advancedPredictions: Partial<EnsemblePrediction>
  ): string[] {
    const factors: string[] = [];

    // Add base model factors
    for (const { prediction } of predictions) {
      if (prediction.metadata?.factors) {
        factors.push(...prediction.metadata.factors);
      }
    }

    // Add advanced model factors
    if (advancedPredictions.marketIntelligence) {
      if (advancedPredictions.marketIntelligence.sharpAction > 0.7) {
        factors.push('Strong sharp money signal');
      }
      if (advancedPredictions.marketIntelligence.bookmakerVulnerability > 0.7) {
        factors.push('High bookmaker vulnerability');
      }
      if (advancedPredictions.marketIntelligence.goblinTrapAnalysis > 0.7) {
        factors.push('Potential goblin trap detected');
      }
    }

    if (advancedPredictions.temporalPatterns) {
      if (advancedPredictions.temporalPatterns.microTrends > 0.7) {
        factors.push('Strong micro-trends');
      }
      if (advancedPredictions.temporalPatterns.macroTrends > 0.7) {
        factors.push('Strong macro-trends');
      }
      if (advancedPredictions.temporalPatterns.cyclicalPatterns > 0.7) {
        factors.push('Clear cyclical patterns');
      }
      if (advancedPredictions.temporalPatterns.circadianFactors > 0.7) {
        factors.push('Significant circadian impact');
      }
    }

    if (advancedPredictions.alternativeData) {
      if (advancedPredictions.alternativeData.socialMediaSentiment > 0.7) {
        factors.push('Strong social media sentiment');
      }
      if (advancedPredictions.alternativeData.weatherImpact > 0.7) {
        factors.push('Significant weather impact');
      }
      if (advancedPredictions.alternativeData.injuryImpact > 0.7) {
        factors.push('Major injury impact');
      }
      if (advancedPredictions.alternativeData.travelImpact > 0.7) {
        factors.push('Significant travel impact');
      }
      if (advancedPredictions.alternativeData.venueImpact > 0.7) {
        factors.push('Strong venue impact');
      }
    }

    if (advancedPredictions.gameTheory) {
      if (advancedPredictions.gameTheory.strategicAdvantage > 0.7) {
        factors.push('Strong strategic advantage');
      }
      if (advancedPredictions.gameTheory.psychologicalEdge > 0.7) {
        factors.push('Significant psychological edge');
      }
      if (advancedPredictions.gameTheory.momentumFactor > 0.7) {
        factors.push('Strong momentum');
      }
      if (advancedPredictions.gameTheory.pressureHandling > 0.7) {
        factors.push('Excellent pressure handling');
      }
      if (advancedPredictions.gameTheory.adaptationScore > 0.7) {
        factors.push('High adaptation capability');
      }
    }

    if (advancedPredictions.quantumProbability) {
      if (advancedPredictions.quantumProbability.superpositionScore > 0.7) {
        factors.push('Strong superposition state');
      }
      if (advancedPredictions.quantumProbability.entanglementFactor > 0.7) {
        factors.push('High entanglement factor');
      }
      if (advancedPredictions.quantumProbability.interferencePattern > 0.7) {
        factors.push('Clear interference pattern');
      }
      if (advancedPredictions.quantumProbability.tunnelingProbability > 0.7) {
        factors.push('High tunneling probability');
      }
      if (advancedPredictions.quantumProbability.decoherenceRate > 0.7) {
        factors.push('Low decoherence rate');
      }
    }

    return [...new Set(factors)]; // Remove duplicates
  }

  async update(newData: any[]): Promise<void> {
    // Update base models
    await Promise.all(Array.from(this.models.values()).map(model => model.train(newData)));

    // Update advanced models
    if (this.marketIntelligence) {
      await this.marketIntelligence.update(newData);
    }
    if (this.temporalPatterns) {
      await this.temporalPatterns.update(newData);
    }
    if (this.alternativeData) {
      await this.alternativeData.update(newData);
    }
    if (this.gameTheory) {
      await this.gameTheory.update(newData);
    }
    if (this.quantumProbability) {
      await this.quantumProbability.update(newData);
    }

    // Update historical predictions
    for (const [name, model] of this.models.entries()) {
      const predictions = await Promise.all(
        newData.map(async data => {
          const prediction = await model.predict(data);
          return {
            prediction: prediction.probability,
            actual: data.target,
          };
        })
      );
      this.historicalPredictions.set(name, predictions);
    }
  }

  async evaluate(testData: any[]): Promise<Record<string, number>> {
    const metrics: Record<string, number> = {};

    // Evaluate base models
    for (const [name, model] of this.models.entries()) {
      const predictions = await Promise.all(testData.map(data => model.predict(data)));
      const actual = testData.map(data => data.target);
      const predicted = predictions.map(p => p.probability);

      metrics[`${name}_mse`] = this.calculateMSE(actual, predicted);
      metrics[`${name}_mae`] = this.calculateMAE(actual, predicted);
      metrics[`${name}_mape`] = this.calculateMAPE(actual, predicted);
    }

    // Evaluate advanced models
    if (this.marketIntelligence) {
      const predictions = await Promise.all(
        testData.map(data => this.marketIntelligence!.predict(data))
      );
      const actual = testData.map(data => data.target);
      const predicted = predictions.map(p => p.probability);

      metrics.market_intelligence_mse = this.calculateMSE(actual, predicted);
      metrics.market_intelligence_mae = this.calculateMAE(actual, predicted);
      metrics.market_intelligence_mape = this.calculateMAPE(actual, predicted);
    }

    if (this.temporalPatterns) {
      const predictions = await Promise.all(
        testData.map(data => this.temporalPatterns!.predict(data))
      );
      const actual = testData.map(data => data.target);
      const predicted = predictions.map(p => p.probability);

      metrics.temporal_patterns_mse = this.calculateMSE(actual, predicted);
      metrics.temporal_patterns_mae = this.calculateMAE(actual, predicted);
      metrics.temporal_patterns_mape = this.calculateMAPE(actual, predicted);
    }

    if (this.alternativeData) {
      const predictions = await Promise.all(
        testData.map(data => this.alternativeData!.predict(data))
      );
      const actual = testData.map(data => data.target);
      const predicted = predictions.map(p => p.probability);

      metrics.alternative_data_mse = this.calculateMSE(actual, predicted);
      metrics.alternative_data_mae = this.calculateMAE(actual, predicted);
      metrics.alternative_data_mape = this.calculateMAPE(actual, predicted);
    }

    if (this.gameTheory) {
      const predictions = await Promise.all(testData.map(data => this.gameTheory!.predict(data)));
      const actual = testData.map(data => data.target);
      const predicted = predictions.map(p => p.probability);

      metrics.game_theory_mse = this.calculateMSE(actual, predicted);
      metrics.game_theory_mae = this.calculateMAE(actual, predicted);
      metrics.game_theory_mape = this.calculateMAPE(actual, predicted);
    }

    if (this.quantumProbability) {
      const predictions = await Promise.all(
        testData.map(data => this.quantumProbability!.predict(data))
      );
      const actual = testData.map(data => data.target);
      const predicted = predictions.map(p => p.probability);

      metrics.quantum_probability_mse = this.calculateMSE(actual, predicted);
      metrics.quantum_probability_mae = this.calculateMAE(actual, predicted);
      metrics.quantum_probability_mape = this.calculateMAPE(actual, predicted);
    }

    return metrics;
  }

  private calculateMSE(actual: number[], predicted: number[]): number {
    return actual.reduce((acc, val, i) => acc + Math.pow(val - predicted[i], 2), 0) / actual.length;
  }

  private calculateMAE(actual: number[], predicted: number[]): number {
    return actual.reduce((acc, val, i) => acc + Math.abs(val - predicted[i]), 0) / actual.length;
  }

  private calculateMAPE(actual: number[], predicted: number[]): number {
    return (
      actual.reduce((acc, val, i) => acc + Math.abs((val - predicted[i]) / val), 0) / actual.length
    );
  }

  private async getBayesianPrediction(
    basePredictions: Array<{ name: string; prediction: ModelPrediction }>,
    features: Record<string, any>
  ): Promise<{ mean: number; variance: number; credibleInterval: [number, number] }> {
    if (!this.config.bayesianInference?.enabled) {
      const mean = this.calculateWeightedPrediction(basePredictions, {});
      return {
        mean,
        variance: 0,
        credibleInterval: [mean, mean],
      };
    }

    // Sample from posterior distribution
    const samples = await this.performMCMCSampling(basePredictions, features);

    // Calculate statistics
    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / samples.length;

    // Calculate 95% credible interval
    const sortedSamples = samples.sort((a, b) => a - b);
    const lowerIndex = Math.floor(samples.length * 0.025);
    const upperIndex = Math.floor(samples.length * 0.975);

    return {
      mean,
      variance,
      credibleInterval: [sortedSamples[lowerIndex], sortedSamples[upperIndex]],
    };
  }

  private async performMCMCSampling(
    predictions: Array<{ name: string; prediction: ModelPrediction }>,
    features: Record<string, any>
  ): Promise<number[]> {
    const samples: number[] = [];
    const numSamples = this.config.bayesianInference?.mcmcSamples || 1000;

    // Initialize with weighted average
    let currentSample = this.calculateWeightedPrediction(predictions, {});

    for (let i = 0; i < numSamples; i++) {
      // Propose new sample
      const proposal = currentSample + (Math.random() - 0.5) * 0.1;

      // Calculate acceptance ratio
      const currentLikelihood = this.calculateLikelihood(currentSample, predictions, features);
      const proposalLikelihood = this.calculateLikelihood(proposal, predictions, features);
      const acceptanceRatio = proposalLikelihood / currentLikelihood;

      // Accept or reject
      if (Math.random() < acceptanceRatio) {
        currentSample = proposal;
      }

      samples.push(currentSample);
    }

    return samples;
  }

  private calculateLikelihood(
    sample: number,
    predictions: Array<{ name: string; prediction: ModelPrediction }>,
    features: Record<string, any>
  ): number {
    // Calculate likelihood based on model predictions and prior
    const priorStrength = this.config.bayesianInference?.priorStrength || 1;

    // Model likelihood
    const modelLikelihood = predictions.reduce((acc, { prediction }) => {
      const diff = prediction.probability - sample;
      return acc * Math.exp((-0.5 * diff * diff) / (prediction.confidence || 0.1));
    }, 1);

    // Prior likelihood (assuming uniform prior)
    const priorLikelihood = 1;

    return modelLikelihood * Math.pow(priorLikelihood, priorStrength);
  }

  private async computeFeatureAttribution(
    features: Record<string, any>
  ): Promise<FeatureAttribution[]> {
    // Proxy for SHAP: permutation feature importance
    // For each feature, shuffle its value and measure the change in ensemble prediction
    const basePrediction = await this.predictSingle(features);
    const attributions: FeatureAttribution[] = [];
    for (const key of Object.keys(features)) {
      const shuffled = { ...features, [key]: this.shuffleValue(features[key]) };
      const shuffledPrediction = await this.predictSingle(shuffled);
      attributions.push({
        feature: key,
        value: features[key],
        impact: Math.abs(basePrediction - shuffledPrediction),
      });
    }
    // Sort by impact descending and return top 10
    return attributions.sort((a, b) => b.impact - a.impact).slice(0, 10);
  }

  private shuffleValue(value: any): any {
    // Simple shuffle for numeric/categorical
    if (typeof value === 'number') {
      return value + (Math.random() - 0.5) * value * 0.1;
    }
    if (Array.isArray(value)) {
      return value.slice().sort(() => Math.random() - 0.5);
    }
    if (typeof value === 'string') {
      return value
        .split('')
        .sort(() => Math.random() - 0.5)
        .join('');
    }
    return value;
  }

  private async predictSingle(features: Record<string, any>): Promise<number> {
    // Use the ensemble to get a single probability prediction for feature attribution
    // This should be a lightweight version of the main predict logic
    // ... implement a simplified ensemble prediction ...
    return 0.5; // Placeholder, replace with actual logic
  }

  /**
   * Update ensemble configuration at runtime (e.g., weights, enabled models, meta-learning, risk profile)
   */
  public updateConfig(newConfig: Partial<EnsembleConfig>): void {
    this.config = { ...this.config, ...newConfig };
    // Optionally re-initialize models if structure changes
    // this.initializeModels();
  }

  /**
   * Update model weights at runtime
   */
  public updateModelWeights(weights: { [modelName: string]: number }): void {
    for (const model of this.config.models) {
      if (weights[model.name] !== undefined) {
        model.weight = weights[model.name];
      }
    }
  }

  /**
   * Update risk profile parameters at runtime
   */
  public updateRiskProfile(riskParams: { [key: string]: any }): void {
    // Example: adjust risk calculation logic or thresholds
    // Extend as needed for your risk model
    (this as any).riskProfileParams = { ...(this as any).riskProfileParams, ...riskParams };
  }

  /**
   * Enable or disable meta-learning (stacked generalization) at runtime
   */
  public setMetaLearning(enabled: boolean, metaModelType?: string): void {
    if (!this.config.stackedGeneralization) this.config.stackedGeneralization = { enabled, metaModelType: metaModelType || 'logistic', crossValidationFolds: 5 };
    else {
      this.config.stackedGeneralization.enabled = enabled;
      if (metaModelType) this.config.stackedGeneralization.metaModelType = metaModelType;
    }
  }

  /**
   * Enable or disable Bayesian inference at runtime
   */
  public setBayesianInference(enabled: boolean, priorStrength?: number, mcmcSamples?: number): void {
    if (!this.config.bayesianInference) this.config.bayesianInference = { enabled, priorStrength: priorStrength || 1, mcmcSamples: mcmcSamples || 1000 };
    else {
      this.config.bayesianInference.enabled = enabled;
      if (priorStrength) this.config.bayesianInference.priorStrength = priorStrength;
      if (mcmcSamples) this.config.bayesianInference.mcmcSamples = mcmcSamples;
    }
  }

  private async getMetaModel(): Promise<BaseModel> {
    // TODO: Implement meta-model selection and instantiation
    // For now, return a dummy model that returns a fixed probability
    return {
      async predict() { return { probability: 0.5, confidence: 0.5, weight: 1, features: {}, metadata: {} }; },
      train: async () => {},
      evaluate: async () => ({}),
      save: async () => {},
      load: async () => {},
      getModelId: () => 'meta',
      getConfig: () => ({} as any),
      isModelTrained: () => true,
      getLastUpdate: () => new Date().toISOString(),
      getMetadata: () => ({}),
      getModelInfo: () => ({}),
      on: () => {},
      emit: () => {},
      addListener: () => {},
      removeListener: () => {},
      once: () => {},
      off: () => {},
      listeners: () => [],
      removeAllListeners: () => {},
      setMaxListeners: () => {},
      getMaxListeners: () => 10,
      rawListeners: () => [],
      eventNames: () => [],
    } as unknown as BaseModel;
  }
}
