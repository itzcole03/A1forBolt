import { ModelEnsemble, AdvancedPrediction } from '../../types/prediction';
import { MarketContext, BettingContext } from '../../types/core';
import { ShapExplanation } from '../../types/ml';

export class AdvancedEnsemble {
  private static instance: AdvancedEnsemble;
  private readonly MIN_WEIGHT = 0.1;
  private readonly MAX_WEIGHT = 0.9;
  private readonly UNCERTAINTY_THRESHOLD = 0.2;

  private constructor() {}

  public static getInstance(): AdvancedEnsemble {
    if (!AdvancedEnsemble.instance) {
      AdvancedEnsemble.instance = new AdvancedEnsemble();
    }
    return AdvancedEnsemble.instance;
  }

  public calculateDynamicWeights(
    predictions: Array<{
      value: number;
      confidence: number;
      weight: number;
      metadata: Record<string, any>;
    }>,
    marketContext: MarketContext,
    bettingContext: BettingContext
  ): number[] {
    const baseWeights = predictions.map(p => p.weight);
    const confidenceScores = predictions.map(p => p.confidence);
    const marketFactors = this.calculateMarketFactors(marketContext);
    const bettingFactors = this.calculateBettingFactors(bettingContext);

    // Calculate dynamic adjustments
    const confidenceAdjustments = this.calculateConfidenceAdjustments(confidenceScores);
    const marketAdjustments = this.calculateMarketAdjustments(marketFactors);
    const bettingAdjustments = this.calculateBettingAdjustments(bettingFactors);

    // Combine adjustments with base weights
    const adjustedWeights = baseWeights.map((weight, index) => {
      const adjustment =
        confidenceAdjustments[index] * 0.4 +
        marketAdjustments[index] * 0.3 +
        bettingAdjustments[index] * 0.3;

      return this.normalizeWeight(weight * (1 + adjustment));
    });

    return this.normalizeWeights(adjustedWeights);
  }

  private calculateConfidenceAdjustments(confidenceScores: number[]): number[] {
    const meanConfidence = confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length;
    return confidenceScores.map(score => {
      const deviation = score - meanConfidence;
      return Math.tanh(deviation * 2); // Smooth adjustment using tanh
    });
  }

  private calculateMarketFactors(marketContext: MarketContext): Record<string, number> {
    return {
      liquidity: this.calculateLiquidityScore(marketContext),
      volatility: this.calculateVolatilityScore(marketContext),
      efficiency: this.calculateMarketEfficiency(marketContext),
    };
  }

  private calculateBettingFactors(bettingContext: BettingContext): Record<string, number> {
    return {
      risk: this.calculateRiskScore(bettingContext),
      value: this.calculateValueScore(bettingContext),
      edge: this.calculateEdgeScore(bettingContext),
    };
  }

  private calculateMarketAdjustments(marketFactors: Record<string, number>): number[] {
    const { liquidity, volatility, efficiency } = marketFactors;
    return [liquidity, volatility, efficiency].map(factor => Math.tanh((factor - 0.5) * 2));
  }

  private calculateBettingAdjustments(bettingFactors: Record<string, number>): number[] {
    const { risk, value, edge } = bettingFactors;
    return [risk, value, edge].map(factor => Math.tanh((factor - 0.5) * 2));
  }

  private normalizeWeight(weight: number): number {
    return Math.max(this.MIN_WEIGHT, Math.min(this.MAX_WEIGHT, weight));
  }

  private normalizeWeights(weights: number[]): number[] {
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => w / sum);
  }

  private calculateLiquidityScore(marketContext: MarketContext): number {
    const { volume, spread, depth } = marketContext;
    const volumeScore = Math.min(volume / 1000000, 1); // Normalize to 0-1
    const spreadScore = 1 - spread / 10; // Normalize to 0-1
    const depthScore = Math.min(depth / 100000, 1); // Normalize to 0-1

    return volumeScore * 0.4 + spreadScore * 0.3 + depthScore * 0.3;
  }

  private calculateVolatilityScore(marketContext: MarketContext): number {
    const { priceHistory, impliedVolatility } = marketContext;
    const priceVolatility = this.calculatePriceVolatility(priceHistory);
    const impliedVolScore = Math.min(impliedVolatility / 100, 1);

    return priceVolatility * 0.6 + impliedVolScore * 0.4;
  }

  private calculateMarketEfficiency(marketContext: MarketContext): number {
    const { arbitrageOpportunities, priceDiscrepancies, marketDepth } = marketContext;
    const arbScore = 1 - Math.min(arbitrageOpportunities / 10, 1);
    const discrepancyScore = 1 - Math.min(priceDiscrepancies / 5, 1);
    const depthScore = Math.min(marketDepth / 1000000, 1);

    return arbScore * 0.4 + discrepancyScore * 0.3 + depthScore * 0.3;
  }

  private calculateRiskScore(bettingContext: BettingContext): number {
    const { bankroll, exposure, historicalRisk } = bettingContext;
    const bankrollScore = Math.min(bankroll / 100000, 1);
    const exposureScore = 1 - Math.min(exposure / bankroll, 1);
    const historicalScore = 1 - Math.min(historicalRisk / 100, 1);

    return bankrollScore * 0.3 + exposureScore * 0.4 + historicalScore * 0.3;
  }

  private calculateValueScore(bettingContext: BettingContext): number {
    const { edge, odds, marketEfficiency } = bettingContext;
    const edgeScore = Math.min(edge / 0.1, 1); // Normalize to 0-1
    const oddsScore = this.calculateOddsValue(odds);
    const efficiencyScore = marketEfficiency;

    return edgeScore * 0.4 + oddsScore * 0.3 + efficiencyScore * 0.3;
  }

  private calculateEdgeScore(bettingContext: BettingContext): number {
    const { modelEdge, marketEdge, historicalEdge } = bettingContext;
    const modelScore = Math.min(modelEdge / 0.1, 1);
    const marketScore = Math.min(marketEdge / 0.1, 1);
    const historicalScore = Math.min(historicalEdge / 0.1, 1);

    return modelScore * 0.4 + marketScore * 0.3 + historicalScore * 0.3;
  }

  private calculatePriceVolatility(priceHistory: number[]): number {
    if (priceHistory.length < 2) return 0;

    const returns = priceHistory
      .slice(1)
      .map((price, i) => (price - priceHistory[i]) / priceHistory[i]);

    const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
    const variance = returns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / returns.length;

    return Math.min(Math.sqrt(variance) * 100, 1); // Normalize to 0-1
  }

  private calculateOddsValue(odds: number): number {
    const impliedProbability = 1 / odds;
    const fairProbability = 0.5; // Assuming 50% is fair value
    const value = Math.abs(impliedProbability - fairProbability);

    return Math.max(0, 1 - value * 2); // Normalize to 0-1
  }

  public calculateUncertainty(
    predictions: Array<{
      value: number;
      confidence: number;
      weight: number;
      metadata: Record<string, any>;
    }>,
    weights: number[]
  ): { lower: number; upper: number } {
    const weightedValues = predictions.map((p, i) => p.value * weights[i]);
    const weightedConfidences = predictions.map((p, i) => p.confidence * weights[i]);

    const meanValue = weightedValues.reduce((a, b) => a + b, 0);
    const meanConfidence = weightedConfidences.reduce((a, b) => a + b, 0);

    const variance = this.calculateVariance(weightedValues);
    const confidenceVariance = this.calculateVariance(weightedConfidences);

    const uncertaintyFactor = Math.sqrt(variance * confidenceVariance);
    const confidenceFactor = 1 - meanConfidence;

    const uncertainty = uncertaintyFactor * confidenceFactor;

    return {
      lower: meanValue - uncertainty,
      upper: meanValue + uncertainty,
    };
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  public generateShapExplanations(
    prediction: AdvancedPrediction,
    marketContext: MarketContext,
    bettingContext: BettingContext
  ): ShapExplanation[] {
    const explanations: ShapExplanation[] = [];

    // Market impact explanation
    const marketImpact = this.calculateMarketImpact(marketContext);
    const marketImportance = this.calculateFeatureImportance('market_impact', prediction);
    explanations.push({
      feature: 'market_impact',
      value: marketImpact,
      importance: marketImportance,
      impact: marketImpact * marketImportance,
      confidence: this.calculateConfidence(marketImpact, marketImportance),
    });

    // Betting context explanation
    const bettingImpact = this.calculateBettingContextImpact(bettingContext);
    const bettingImportance = this.calculateFeatureImportance('betting_context', prediction);
    explanations.push({
      feature: 'betting_context',
      value: bettingImpact,
      importance: bettingImportance,
      impact: bettingImpact * bettingImportance,
      confidence: this.calculateConfidence(bettingImpact, bettingImportance),
    });

    // Ensemble weight explanation
    const ensembleImpact = this.calculateEnsembleWeightImpact(prediction);
    const ensembleImportance = this.calculateFeatureImportance('ensemble_weights', prediction);
    explanations.push({
      feature: 'ensemble_weights',
      value: ensembleImpact,
      importance: ensembleImportance,
      impact: ensembleImpact * ensembleImportance,
      confidence: this.calculateConfidence(ensembleImpact, ensembleImportance),
    });

    return explanations;
  }

  private calculateMarketImpact(marketContext: MarketContext): number {
    const { volume, spread, depth, priceHistory, impliedVolatility } = marketContext;

    // Calculate market impact based on multiple factors
    const volumeImpact = Math.min(volume / 1000000, 1);
    const spreadImpact = 1 - spread / 10;
    const depthImpact = Math.min(depth / 100000, 1);
    const volatilityImpact = this.calculatePriceVolatility(priceHistory);
    const impliedVolImpact = Math.min(impliedVolatility / 100, 1);

    // Weighted combination of impacts
    return (
      volumeImpact * 0.25 +
      spreadImpact * 0.2 +
      depthImpact * 0.2 +
      volatilityImpact * 0.2 +
      impliedVolImpact * 0.15
    );
  }

  private calculateBettingContextImpact(bettingContext: BettingContext): number {
    const { edge, odds, marketEfficiency, modelEdge, marketEdge, historicalEdge } = bettingContext;

    // Calculate betting impact based on multiple factors
    const edgeImpact = Math.min(edge / 0.1, 1);
    const oddsImpact = this.calculateOddsValue(odds);
    const efficiencyImpact = marketEfficiency;
    const modelEdgeImpact = Math.min(modelEdge / 0.1, 1);
    const marketEdgeImpact = Math.min(marketEdge / 0.1, 1);
    const historicalEdgeImpact = Math.min(historicalEdge / 0.1, 1);

    // Weighted combination of impacts
    return (
      edgeImpact * 0.2 +
      oddsImpact * 0.15 +
      efficiencyImpact * 0.15 +
      modelEdgeImpact * 0.2 +
      marketEdgeImpact * 0.15 +
      historicalEdgeImpact * 0.15
    );
  }

  private calculateEnsembleWeightImpact(prediction: AdvancedPrediction): number {
    const { modelContributions, confidence } = prediction;

    // Calculate weighted impact of model contributions
    const weightedImpact = Object.entries(modelContributions).reduce(
      (sum, [model, contribution]) => sum + (contribution as number) * (confidence || 0.5),
      0
    );

    return Math.min(weightedImpact, 1);
  }

  private calculateFeatureImportance(feature: string, prediction: AdvancedPrediction): number {
    const { featureImportance } = prediction;
    return featureImportance[feature] || 0.5;
  }

  private calculateConfidence(impact: number, importance: number): number {
    // Calculate confidence based on impact and importance
    const baseConfidence = (impact + importance) / 2;

    // Adjust confidence based on data quality
    const dataQualityFactor = this.calculateDataQualityFactor();

    return baseConfidence * dataQualityFactor;
  }

  private calculateDataQualityFactor(): number {
    // This would typically be based on data quality metrics
    // For now, return a constant value
    return 0.9;
  }
}
