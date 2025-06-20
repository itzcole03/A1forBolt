import { v4 as uuidv4 } from 'uuid';
import {
  FinalPredictionEngine,
  FinalPredictionEngineDependencies,
  FinalPredictionEngineConfig,
  ModelOutput,
  ModelWeight,
  RiskProfile,
  FinalPrediction,
  RiskLevel,
  FeatureImpact,
  FinalPredictionError,
  ModelContributions,
  ShapValue,
  ShapExplanation,
  ModelExplanation,
  PredictionWithExplanation,
  ModelType,
} from './types';

export class FinalPredictionEngineImpl implements FinalPredictionEngine {
  private config: FinalPredictionEngineConfig;
  private modelWeights: Map<string, ModelWeight>;
  private riskProfiles: Map<string, RiskProfile>;
  private featureStats: Record<string, { mean: number; std: number }> = {};
  private confidenceWeights: number[] = [0.3, 0.3, 0.4];
  private currentPrediction: number = 0.5;

  constructor(
    private dependencies: FinalPredictionEngineDependencies,
    initialConfig: FinalPredictionEngineConfig
  ) {
    this.config = initialConfig;
    this.modelWeights = new Map(initialConfig.modelWeights.map(weight => [weight.type, weight]));
    this.riskProfiles = new Map(Object.entries(initialConfig.riskProfiles));
  }

  async generatePrediction(
    modelOutputs: ModelOutput[],
    riskProfile: RiskProfile,
    context?: Record<string, any>
  ): Promise<FinalPrediction> {
    const startTime = Date.now();
    const decisionPath: string[] = [];

    try {
      // Validate inputs
      this.validateModelOutputs(modelOutputs);
      this.validateRiskProfile(riskProfile);

      // Calculate weighted scores
      const weightedScores = this.calculateWeightedScores(modelOutputs);
      decisionPath.push('Calculated weighted scores');

      // Determine risk level
      const riskLevel = this.determineRiskLevel(weightedScores, riskProfile);
      decisionPath.push(`Determined risk level: ${riskLevel}`);

      // Calculate final score
      const finalScore = this.calculateFinalScore(weightedScores, riskProfile);
      decisionPath.push(`Calculated final score: ${finalScore}`);

      // Check for sure odds
      const isSureOdds = this.checkSureOdds(weightedScores);
      decisionPath.push(`Sure odds check: ${isSureOdds}`);

      // Calculate payout range
      const payoutRange = this.calculatePayoutRange(finalScore, riskProfile);
      decisionPath.push('Calculated payout range');

      // Aggregate features
      const { topFeatures, supportingFeatures } = this.aggregateFeatures(modelOutputs);
      decisionPath.push('Aggregated features');

      // Create final prediction
      const prediction: FinalPrediction = {
        id: uuidv4(),
        timestamp: Date.now(),
        confidenceWindow: {
          start: startTime,
          end: Date.now(),
        },
        finalScore,
        confidence: weightedScores.averageConfidence,
        riskLevel,
        isSureOdds,
        payoutRange,
        modelContributions: weightedScores.contributions,
        topFeatures,
        supportingFeatures,
        metadata: {
          processingTime: Date.now() - startTime,
          dataFreshness: this.calculateDataFreshness(modelOutputs),
          signalQuality: this.calculateSignalQuality(modelOutputs),
          decisionPath,
        },
      };

      // Log and track metrics
      this.logPrediction(prediction);
      this.trackMetrics(prediction);

      return prediction;
    } catch (error) {
      throw new FinalPredictionError('Failed to generate prediction', 'PREDICTION', 'ERROR', {
        error,
        context,
      });
    }
  }

  private validateModelOutputs(outputs: ModelOutput[]): void {
    if (!outputs.length) {
      throw new FinalPredictionError('No model outputs provided');
    }

    const uniqueTypes = new Set(outputs.map(o => o.type));
    if (uniqueTypes.size !== outputs.length) {
      throw new FinalPredictionError('Duplicate model types detected');
    }
  }

  private validateRiskProfile(profile: RiskProfile): void {
    if (!this.riskProfiles.has(profile.type)) {
      throw new FinalPredictionError(`Invalid risk profile: ${profile.type}`);
    }
  }

  private calculateWeightedScores(modelOutputs: ModelOutput[]) {
    const contributions: ModelContributions = {
      historical: { weight: 0, confidence: 0, score: 0 },
      market: { weight: 0, confidence: 0, score: 0 },
      sentiment: { weight: 0, confidence: 0, score: 0 },
      correlation: { weight: 0, confidence: 0, score: 0 },
    };
    let totalWeight = 0;
    let weightedScore = 0;
    let totalConfidence = 0;

    for (const output of modelOutputs) {
      const weight = this.modelWeights.get(output.type);
      if (!weight) continue;

      const contribution = {
        weight: weight.weight,
        confidence: output.confidence,
        score: output.score,
      };

      contributions[output.type] = contribution;
      totalWeight += weight.weight;
      weightedScore += output.score * weight.weight;
      totalConfidence += output.confidence * weight.weight;
    }

    return {
      weightedScore: weightedScore / totalWeight,
      averageConfidence: totalConfidence / totalWeight,
      contributions,
    };
  }

  private determineRiskLevel(
    weightedScores: { weightedScore: number; averageConfidence: number },
    riskProfile: RiskProfile
  ): RiskLevel {
    const { weightedScore, averageConfidence } = weightedScores;
    const riskScore = (1 - averageConfidence) * (1 + Math.abs(weightedScore - 0.5));

    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.6) return 'medium';
    return 'high';
  }

  private calculateFinalScore(
    weightedScores: { weightedScore: number; averageConfidence: number },
    riskProfile: RiskProfile
  ): number {
    const { weightedScore, averageConfidence } = weightedScores;
    const riskMultiplier = riskProfile.multiplier;

    return weightedScore * (averageConfidence * riskMultiplier);
  }

  private checkSureOdds(weightedScores: { averageConfidence: number }): boolean {
    return weightedScores.averageConfidence >= this.config.sureOddsThreshold;
  }

  private calculatePayoutRange(
    finalScore: number,
    riskProfile: RiskProfile
  ): { min: number; max: number; expected: number } {
    const baseMultiplier = riskProfile.multiplier;
    const confidenceRange = 0.2; // 20% range

    return {
      min: finalScore * (1 - confidenceRange) * baseMultiplier,
      max: finalScore * (1 + confidenceRange) * baseMultiplier,
      expected: finalScore * baseMultiplier,
    };
  }

  private aggregateFeatures(modelOutputs: ModelOutput[]): {
    topFeatures: FeatureImpact[];
    supportingFeatures: FeatureImpact[];
  } {
    const featureMap = new Map<string, FeatureImpact>();

    // Convert features to FeatureImpact objects
    for (const output of modelOutputs) {
      Object.entries(output.features).forEach(([name, value]) => {
        const existing = featureMap.get(name);
        if (existing) {
          existing.weight = (existing.weight + value) / 2;
          existing.impact = (existing.impact + value) / 2;
        } else {
          featureMap.set(name, {
            name,
            weight: value,
            impact: value,
          });
        }
      });
    }

    // Sort by impact
    const sortedFeatures = Array.from(featureMap.values()).sort(
      (a, b) => Math.abs(b.impact) - Math.abs(a.impact)
    );

    return {
      topFeatures: sortedFeatures.slice(0, this.config.maxFeatures),
      supportingFeatures: sortedFeatures.slice(
        this.config.maxFeatures,
        this.config.maxFeatures * 2
      ),
    };
  }

  private calculateDataFreshness(modelOutputs: ModelOutput[]): number {
    const now = Date.now();
    const freshnessScores = modelOutputs.map(output => {
      const age = now - output.timestamp;
      return Math.max(0, 1 - age / (24 * 60 * 60 * 1000)); // 24 hours max
    });
    return freshnessScores.reduce((a, b) => a + b, 0) / freshnessScores.length;
  }

  private calculateSignalQuality(modelOutputs: ModelOutput[]): number {
    return modelOutputs.reduce((quality, output) => {
      return (
        quality * (output.metadata.signalStrength * (1 - output.metadata.latency / 1000)) // Normalize latency
      );
    }, 1);
  }

  private logPrediction(prediction: FinalPrediction): void {
    this.dependencies.logger.info('Generated final prediction', {
      predictionId: prediction.id,
      finalScore: prediction.finalScore,
      confidence: prediction.confidence,
      riskLevel: prediction.riskLevel,
      isSureOdds: prediction.isSureOdds,
      processingTime: prediction.metadata.processingTime,
    });
  }

  private trackMetrics(prediction: FinalPrediction): void {
    this.dependencies.metrics.track('prediction_generated', {
      predictionId: prediction.id,
      confidence: prediction.confidence,
      riskLevel: prediction.riskLevel,
      processingTime: prediction.metadata.processingTime,
    });
  }

  async updateModelWeights(weights: ModelWeight[]): Promise<void> {
    this.modelWeights = new Map(weights.map(weight => [weight.type, weight]));
    await this.dependencies.config.set('modelWeights', weights);
  }

  async updateRiskProfiles(profiles: Record<string, RiskProfile>): Promise<void> {
    this.riskProfiles = new Map(Object.entries(profiles));
    await this.dependencies.config.set('riskProfiles', profiles);
  }

  async getEngineMetrics(): Promise<Record<string, number>> {
    return {
      modelCount: this.modelWeights.size,
      riskProfileCount: this.riskProfiles.size,
      sureOddsThreshold: this.config.sureOddsThreshold,
      featureThreshold: this.config.featureThreshold,
    };
  }

  async validatePrediction(prediction: FinalPrediction): Promise<boolean> {
    try {
      // Validate required fields
      if (!prediction.id || !prediction.timestamp || !prediction.finalScore) {
        return false;
      }

      // Validate confidence window
      if (prediction.confidenceWindow.start > prediction.confidenceWindow.end) {
        return false;
      }

      // Validate risk level
      if (!['low', 'medium', 'high'].includes(prediction.riskLevel)) {
        return false;
      }

      // Validate payout range
      if (
        prediction.payoutRange.min > prediction.payoutRange.max ||
        prediction.payoutRange.expected < prediction.payoutRange.min ||
        prediction.payoutRange.expected > prediction.payoutRange.max
      ) {
        return false;
      }

      return true;
    } catch (error) {
      this.dependencies.logger.error('Failed to validate prediction', { error });
      return false;
    }
  }

  private calculateShapValues(
    modelName: string,
    features: Record<string, number>,
    prediction: number
  ): ShapExplanation {
    const baseValue = 0.5; // Default base value
    const shapValues: ShapValue[] = [];

    // Get feature importance for this model
    const featureImportance = this.getFeatureImportance(modelName);

    // Calculate SHAP values based on feature importance and prediction
    Object.entries(features).forEach(([feature, value]) => {
      const importance = featureImportance[feature] || 0;
      const normalizedValue =
        (value - this.featureStats[feature]?.mean || 0.5) / (this.featureStats[feature]?.std || 1);
      const impact = importance * normalizedValue;

      shapValues.push({
        feature,
        value,
        impact,
        direction: impact > 0 ? 'positive' : 'negative',
        confidence: this.calculateFeatureConfidence(feature, value),
      });
    });

    // Sort by absolute impact
    shapValues.sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

    return {
      baseValue,
      shapValues,
      prediction,
      confidence: this.calculateConfidence(shapValues),
      timestamp: Date.now(),
    };
  }

  private calculateFeatureConfidence(feature: string, value: number): number {
    const stats = this.featureStats[feature];
    if (!stats) return 0.5;

    // Calculate how far the value is from the mean in terms of standard deviations
    const zScore = Math.abs((value - stats.mean) / stats.std);

    // Convert to confidence score (higher confidence for values closer to mean)
    return Math.max(0, 1 - zScore / 3); // 3 standard deviations = 0 confidence
  }

  private calculateConfidence(shapValues: ShapValue[]): number {
    // Calculate confidence based on multiple factors
    const factors = [
      this.calculateShapConsistency(shapValues),
      this.calculateFeatureConfidence(shapValues),
      this.calculateModelAgreement(shapValues),
    ];

    // Weighted average of confidence factors
    return factors.reduce((sum, factor, index) => sum + factor * this.confidenceWeights[index], 0);
  }

  private calculateShapConsistency(shapValues: ShapValue[]): number {
    // Calculate how consistent the SHAP values are in their direction
    const positiveImpacts = shapValues.filter(sv => sv.impact > 0).length;
    const negativeImpacts = shapValues.filter(sv => sv.impact < 0).length;
    const totalImpacts = shapValues.length;

    if (totalImpacts === 0) return 0.5;

    // Higher confidence when impacts are more consistent in direction
    return Math.max(positiveImpacts, negativeImpacts) / totalImpacts;
  }

  private calculateModelAgreement(shapValues: ShapValue[]): number {
    // Calculate how well the features agree with the model's prediction
    const predictionDirection = this.currentPrediction > 0.5 ? 1 : -1;
    const agreeingFeatures = shapValues.filter(
      sv => (sv.impact > 0 && predictionDirection > 0) || (sv.impact < 0 && predictionDirection < 0)
    ).length;

    return agreeingFeatures / shapValues.length;
  }

  private getFeatureImportance(modelName: string): Record<string, number> {
    // Get feature importance from model metrics
    const modelMetrics = this.dependencies.metricsService.getModelMetrics(modelName);
    return modelMetrics.featureImportance || {};
  }

  private async generatePredictions(
    features: Record<string, number>
  ): Promise<Record<string, ModelOutput>> {
    const predictions: Record<string, ModelOutput> = {};

    // Generate predictions from each model
    for (const [modelName, weight] of this.modelWeights.entries()) {
      try {
        const modelOutputs: ModelOutput[] = [
          {
            type: modelName as ModelType,
            score: 0,
            features,
            prediction: 0,
            confidence: 0,
            timestamp: Date.now(),
            metadata: {
              signalStrength: 1,
              latency: 0,
            },
          },
        ];

        const output = await this.generatePrediction(
          modelOutputs,
          this.riskProfiles.get('default')!
        );
        predictions[modelName] = {
          type: modelName as ModelType,
          score: output.finalScore,
          features,
          prediction: output.finalScore,
          confidence: output.confidence,
          timestamp: Date.now(),
          metadata: {
            signalStrength: output.metadata.signalQuality,
            latency: output.metadata.processingTime,
          },
        };
      } catch (error) {
        this.dependencies.logger.error(`Error generating prediction for model ${modelName}:`, {
          error: error instanceof Error ? error.message : 'Unknown error',
          modelName,
        });
      }
    }

    return predictions;
  }

  private combinePredictions(predictions: Record<string, ModelOutput>): {
    prediction: number;
    confidence: number;
  } {
    let weightedSum = 0;
    let totalWeight = 0;

    for (const [modelName, output] of Object.entries(predictions)) {
      const weight = this.modelWeights.get(modelName)?.weight || 0;
      weightedSum += output.prediction * weight;
      totalWeight += weight;
    }

    const finalPrediction = totalWeight > 0 ? weightedSum / totalWeight : 0;
    const confidence = this.calculateOverallConfidence(predictions);

    return { prediction: finalPrediction, confidence };
  }

  private calculateOverallConfidence(predictions: Record<string, ModelOutput>): number {
    const confidences = Object.values(predictions).map(p => p.confidence);
    return confidences.length > 0 ? confidences.reduce((a, b) => a + b, 0) / confidences.length : 0;
  }

  public async generatePredictionWithExplanation(
    features: Record<string, number>,
    riskLevel: RiskLevel = 'medium'
  ): Promise<PredictionWithExplanation> {
    const modelOutputs = await this.generatePredictions(features);
    const explanations: ModelExplanation[] = [];

    // Calculate SHAP values for each model
    for (const [modelName, output] of Object.entries(modelOutputs)) {
      const shapExplanation = this.calculateShapValues(modelName, features, output.prediction);

      explanations.push({
        modelName,
        shapExplanation,
        featureImportance: this.getFeatureImportance(modelName),
        confidence: output.confidence,
      });
    }

    // Combine predictions with explanations
    const finalPrediction = this.combinePredictions(modelOutputs);

    return {
      prediction: finalPrediction.prediction,
      confidence: finalPrediction.confidence,
      explanations,
      timestamp: Date.now(),
    };
  }
}
