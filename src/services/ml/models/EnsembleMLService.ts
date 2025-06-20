import { EventEmitter } from 'events';
import { TraditionalModels } from './TraditionalModels';
import { DeepLearningModels } from './DeepLearningModels';
import { TimeSeriesModels } from './TimeSeriesModels';
import { OptimizationModels } from './OptimizationModels';

export interface PredictionConfig {
  investment: number;
  modelSet: string[];
  confidence: number;
  strategy: 'maximum' | 'balanced' | 'conservative';
  portfolio: string;
  sports: string[];
  timeHorizon?: number;
  seasonality?: boolean;
  optimization?: {
    method: string;
    constraints: Record<string, any>;
  };
}

export interface ModelPrediction {
  modelName: string;
  prediction: string;
  confidence: number;
  probability: number;
  features: Record<string, any>;
  performance: {
    accuracy: number;
  };
  modelType: 'traditional' | 'deepLearning' | 'timeSeries' | 'optimization' | 'ensemble';
}

export interface EnsemblePrediction {
  overallConfidence: number;
  projectedPayout: number;
  opportunities: BettingOpportunity[];
  modelBreakdown: Record<string, any>;
  riskAssessment: RiskAssessment;
  confidence: number;
}

export interface BettingOpportunity {
  sport: string;
  event: string;
  prediction: string;
  confidence: number;
  odds: number;
  kellyFraction: number;
  riskLevel: 'low' | 'medium' | 'high';
}

export interface RiskAssessment {
  overallRisk: 'low' | 'medium' | 'high';
  confidenceScore: number;
  modelAgreement: number;
  variance: number;
}

export interface ModelStatus {
  traditional: CollectionStatus;
  deepLearning: CollectionStatus;
  timeSeries: CollectionStatus;
  optimization: CollectionStatus;
  ensemble: CollectionStatus;
}

export interface CollectionStatus {
  active: number;
  accuracy: number;
}

export interface PerformanceMetrics {
  accuracy: number;
  profitFactor: number;
  winRate: number;
  kellyOptimal: number;
}

export interface PropAnalysis {
  confidence: number;
  expectedValue: number;
  kellyFraction: number;
  prediction?: string;
  probability?: number;
}

export class EnsembleMLService extends EventEmitter {
  private models: {
    traditional: TraditionalModels;
    deepLearning: DeepLearningModels;
    timeSeries: TimeSeriesModels;
    optimization: OptimizationModels;
  };

  constructor() {
    super();
    this.models = {
      traditional: new TraditionalModels(),
      deepLearning: new DeepLearningModels(),
      timeSeries: new TimeSeriesModels(),
      optimization: new OptimizationModels(),
    };
  }

  async generateEnsemblePrediction(config: PredictionConfig): Promise<EnsemblePrediction> {
    try {
      // Get predictions from all model collections
      const [
        traditionalPredictions,
        deepLearningPredictions,
        timeSeriesPredictions,
        optimizationPredictions,
      ] = await Promise.all([
        this.models.traditional.predict(config),
        this.models.deepLearning.predict(config),
        this.models.timeSeries.predict(config),
        this.models.optimization.predict(config),
      ]);

      // Combine all predictions
      const allPredictions = [
        ...traditionalPredictions,
        ...deepLearningPredictions,
        ...timeSeriesPredictions,
        ...optimizationPredictions,
      ];

      // Calculate model weights based on accuracy
      const weights = this.calculateModelWeights(allPredictions);

      // Generate ensemble prediction
      const ensemblePrediction = this.combinePredictions(allPredictions, weights);

      // Identify betting opportunities
      const opportunities = this.identifyBettingOpportunities(ensemblePrediction, config);

      // Assess risk
      const riskAssessment = this.assessRisk(ensemblePrediction, opportunities);

      // Calculate projected payout
      const projectedPayout = this.calculateProjectedPayout(opportunities, config.investment);

      // Create model breakdown
      const modelBreakdown = this.createModelBreakdown(allPredictions);

      const result: EnsemblePrediction = {
        overallConfidence: ensemblePrediction.confidence,
        projectedPayout,
        opportunities,
        modelBreakdown,
        riskAssessment,
        confidence: ensemblePrediction.confidence,
      };

      this.emit('prediction', result);
      return result;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  private calculateModelWeights(predictions: ModelPrediction[]): Record<string, number> {
    const weights: Record<string, number> = {};
    const totalAccuracy = predictions.reduce((sum, pred) => sum + pred.performance.accuracy, 0);

    predictions.forEach(prediction => {
      weights[prediction.modelName] = prediction.performance.accuracy / totalAccuracy;
    });

    return weights;
  }

  private combinePredictions(
    predictions: ModelPrediction[],
    weights: Record<string, number>
  ): ModelPrediction {
    const weightedConfidence = predictions.reduce((sum, pred) => {
      return sum + pred.confidence * weights[pred.modelName];
    }, 0);

    const weightedProbability = predictions.reduce((sum, pred) => {
      return sum + pred.probability * weights[pred.modelName];
    }, 0);

    return {
      modelName: 'ensemble',
      prediction: this.determineMajorityPrediction(predictions),
      confidence: weightedConfidence,
      probability: weightedProbability,
      features: this.combineFeatures(predictions),
      performance: {
        accuracy: this.calculateEnsembleAccuracy(predictions, weights),
      },
      modelType: 'ensemble',
    };
  }

  private determineMajorityPrediction(predictions: ModelPrediction[]): string {
    const predictionCounts = predictions.reduce(
      (counts, pred) => {
        counts[pred.prediction] = (counts[pred.prediction] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    return Object.entries(predictionCounts).sort(([, a], [, b]) => b - a)[0][0];
  }

  private combineFeatures(predictions: ModelPrediction[]): Record<string, any> {
    const combinedFeatures: Record<string, any> = {};
    predictions.forEach(prediction => {
      Object.entries(prediction.features).forEach(([key, value]) => {
        if (!combinedFeatures[key]) {
          combinedFeatures[key] = value;
        }
      });
    });
    return combinedFeatures;
  }

  private calculateEnsembleAccuracy(
    predictions: ModelPrediction[],
    weights: Record<string, number>
  ): number {
    return predictions.reduce((sum, pred) => {
      return sum + pred.performance.accuracy * weights[pred.modelName];
    }, 0);
  }

  private identifyBettingOpportunities(
    ensemblePrediction: ModelPrediction,
    config: PredictionConfig
  ): BettingOpportunity[] {
    const opportunities: BettingOpportunity[] = [];

    if (ensemblePrediction.confidence >= config.confidence) {
      const odds = this.calculateOdds(ensemblePrediction);
      const kellyFraction = this.calculateKellyFraction(ensemblePrediction);
      const riskLevel = this.determineRiskLevel(ensemblePrediction);

      opportunities.push({
        sport: 'all',
        event: 'ensemble_prediction',
        prediction: ensemblePrediction.prediction,
        confidence: ensemblePrediction.confidence,
        odds,
        kellyFraction,
        riskLevel,
      });
    }

    return opportunities;
  }

  private calculateOdds(prediction: ModelPrediction | PropAnalysis | EnsemblePrediction): number {
    if ('probability' in prediction && prediction.probability !== undefined) {
      return 1 / prediction.probability;
    }
    const baseOdds = 2.0;
    const confidenceMultiplier =
      'overallConfidence' in prediction ? prediction.overallConfidence : prediction.confidence;
    return baseOdds * confidenceMultiplier;
  }

  private calculateKellyFraction(
    prediction: ModelPrediction | PropAnalysis | EnsemblePrediction
  ): number {
    const odds = this.calculateOdds(prediction);
    const winProb =
      'probability' in prediction && prediction.probability !== undefined
        ? prediction.probability
        : 'overallConfidence' in prediction
          ? prediction.overallConfidence
          : prediction.confidence;
    const lossProb = 1 - winProb;
    return (winProb * odds - 1) / (odds - 1);
  }

  private determineRiskLevel(
    prediction: ModelPrediction | PropAnalysis | EnsemblePrediction
  ): 'low' | 'medium' | 'high' {
    const confidence =
      'overallConfidence' in prediction ? prediction.overallConfidence : prediction.confidence;
    if (confidence >= 0.9) return 'low';
    if (confidence >= 0.8) return 'medium';
    return 'high';
  }

  private assessRisk(
    ensemblePrediction: ModelPrediction,
    opportunities: BettingOpportunity[]
  ): RiskAssessment {
    const modelAgreement = this.calculateModelAgreement(ensemblePrediction);
    const variance = this.calculatePredictionVariance(ensemblePrediction);

    return {
      overallRisk: this.determineOverallRisk(ensemblePrediction, modelAgreement, variance),
      confidenceScore: ensemblePrediction.confidence,
      modelAgreement,
      variance,
    };
  }

  private calculateModelAgreement(prediction: ModelPrediction): number {
    // Implementation would compare predictions across all models
    return 0.85; // Placeholder
  }

  private calculatePredictionVariance(prediction: ModelPrediction): number {
    // Implementation would calculate variance of predictions
    return 0.1; // Placeholder
  }

  private determineOverallRisk(
    prediction: ModelPrediction,
    modelAgreement: number,
    variance: number
  ): 'low' | 'medium' | 'high' {
    if (prediction.confidence >= 0.9 && modelAgreement >= 0.8 && variance <= 0.1) return 'low';
    if (prediction.confidence >= 0.8 && modelAgreement >= 0.7 && variance <= 0.2) return 'medium';
    return 'high';
  }

  private calculateProjectedPayout(
    opportunities: BettingOpportunity[],
    investment: number
  ): number {
    return opportunities.reduce((total, opp) => {
      const betAmount = investment * opp.kellyFraction;
      return total + betAmount * (opp.odds - 1);
    }, 0);
  }

  private createModelBreakdown(predictions: ModelPrediction[]): Record<string, any> {
    const breakdown: Record<string, any> = {};
    predictions.forEach(prediction => {
      if (!breakdown[prediction.modelType]) {
        breakdown[prediction.modelType] = [];
      }
      breakdown[prediction.modelType].push({
        modelName: prediction.modelName,
        prediction: prediction.prediction,
        confidence: prediction.confidence,
        accuracy: prediction.performance.accuracy,
      });
    });
    return breakdown;
  }

  async getModelStatus(): Promise<Record<string, any>> {
    const [traditional, deepLearning, timeSeries, optimization] = await Promise.all([
      this.models.traditional.getPerformanceMetrics(),
      this.models.deepLearning.getPerformanceMetrics(),
      this.models.timeSeries.getPerformanceMetrics(),
      this.models.optimization.getPerformanceMetrics(),
    ]);

    return {
      traditional,
      deepLearning,
      timeSeries,
      optimization,
    };
  }

  async getPerformanceMetrics(): Promise<Record<string, any>> {
    return this.getModelStatus();
  }

  async analyzeProp(config: {
    player: string;
    statType: string;
    line: number;
    opponent: string;
    venue: string;
  }): Promise<PropAnalysis> {
    const prediction = await this.generateEnsemblePrediction({
      investment: 1000,
      modelSet: ['ensemble'],
      confidence: 90,
      strategy: 'maximum',
      portfolio: 'all',
      sports: ['all'],
    });

    return {
      confidence: prediction.overallConfidence,
      expectedValue: this.calculateExpectedValue(prediction),
      kellyFraction: this.calculateKellyFraction(prediction),
    };
  }

  private calculateExpectedValue(prediction: EnsemblePrediction): number {
    return prediction.opportunities.reduce((sum, opp) => {
      return sum + (opp.odds * opp.confidence - 1);
    }, 0);
  }
}
