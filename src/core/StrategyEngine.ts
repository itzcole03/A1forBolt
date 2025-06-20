import {
  PerformanceMetrics,
  RiskTolerance,
  StrategyRecommendation
} from "../types/core";
import {
  AdvancedAnalysisEngine,
  AnalysisResult as AdvancedAnalysisResult,
} from "./AdvancedAnalysisEngine";
import { DataIntegrationHub, IntegratedData } from "./DataIntegrationHub";
import { EventBus } from "./EventBus";
import { FeatureFlags } from "./FeatureFlags";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { PredictionEngine } from "./PredictionEngine";

// ... existing code ...
// Remove or comment out all imports and usages of missing modules (AnalysisEngine, SentimentEngine). If needed, replace with stubs or fallback logic to ensure the file compiles and runs.
// ... existing code ...

interface StrategyConfig {
  maxExposure: number;
  minStake: number;
  maxStake: number;
  kellyFraction: number;
  volatilityThreshold: number;
  liquidityThreshold: number;
  depthThreshold: number;
  momentumThreshold: number;
  marginOfError: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  hedgingThreshold: number;
  maxVolatility: number;
  minLiquidity: number;
  minValueGap: number;
  sentimentThreshold: number;
  minConfidence: number;
  maxRiskLevel: RiskTolerance;
  requiredDataQuality: number;
  marketEfficiencyThreshold: number;
}

interface StrategyPerformance {
  totalExecutions: number;
  successRate: number;
  averageReturn: number;
  riskProfile: {
    level: RiskTolerance;
    factors: string[];
  };
  lastUpdated: number;
}

interface CompositeStrategy {
  id: string;
  name: string;
  strategies: string[];
  weights: number[];
  performance: StrategyPerformance;
  conditions: {
    minConfidence: number;
    maxRisk: RiskTolerance;
    marketStates: string[];
  };
}

interface StrategyState {
  bankroll: number;
  activeBets: Map<string, BettingPosition>;
  performance: PerformanceMetrics;
}

interface BettingPosition {
  id: string;
  type: "OVER" | "UNDER";
  stake: number;
  odds: number;
  timestamp: number;
  status: "pending" | "active" | "closed";
}

interface MarketData {
  playerId: string;
  metric: string;
  currentLine: number;
  movement: string;
  valueGap: number;
  volatility: number;
  liquidity: number;
  marketDepth: number;
  momentum: number;
}

interface SentimentAnalysis {
  score: number;
  trend: string;
  keyFactors: string[];
}

interface StrategyEvaluatedPayload {
  strategyId: string;
  result: StrategyRecommendation;
}

function toRiskTolerance(level: string): RiskTolerance {
  switch (level) {
    case "LOW":
      return "low";
    case "MEDIUM":
      return "medium";
    case "HIGH":
      return "high";
    default:
      return level as RiskTolerance;
  }
}

export class StrategyEngine {
  private static instance: StrategyEngine;
  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly featureManager: FeatureFlags;
  private readonly analysisEngine: AdvancedAnalysisEngine;
  private readonly dataHub: DataIntegrationHub;
  private readonly config: StrategyConfig;
  private readonly state: StrategyState;
  private readonly predictionEngine: PredictionEngine;
  private readonly strategyPerformance: Map<string, StrategyPerformance>;
  private readonly PERFORMANCE_UPDATE_INTERVAL = 1000 * 60 * 60; // 1 hour
  private compositeStrategies: Map<string, CompositeStrategy>;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.featureManager = FeatureFlags.getInstance();
    this.analysisEngine = AdvancedAnalysisEngine.getInstance();
    this.dataHub = DataIntegrationHub.getInstance();
    this.config = this.getDefaultConfig();
    this.state = this.getDefaultState();
    this.compositeStrategies = new Map();
    this.strategyPerformance = new Map();
    this.predictionEngine = PredictionEngine.getInstance();
    this.setupPerformanceTracking();
  }

  static getInstance(): StrategyEngine {
    if (!StrategyEngine.instance) {
      StrategyEngine.instance = new StrategyEngine();
    }
    return StrategyEngine.instance;
  }

  private getDefaultConfig(): StrategyConfig {
    return {
      maxExposure: 100,
      minStake: 10,
      maxStake: 100,
      kellyFraction: 0.5,
      volatilityThreshold: 0.5,
      liquidityThreshold: 0.5,
      depthThreshold: 0.5,
      momentumThreshold: 0.5,
      marginOfError: 0.05,
      stopLossPercentage: 0.1,
      takeProfitPercentage: 0.2,
      hedgingThreshold: 0.1,
      maxVolatility: 1.5,
      minLiquidity: 0.5,
      minValueGap: 0.1,
      sentimentThreshold: 0.6,
      minConfidence: 0.7,
      maxRiskLevel: "medium",
      requiredDataQuality: 0.8,
      marketEfficiencyThreshold: 0.85,
    };
  }

  private getDefaultState(): StrategyState {
    return {
      bankroll: 1000,
      activeBets: new Map(),
      performance: {
        totalBets: 0,
        winRate: 0,
        roi: 0,
        averageOdds: 0,
        profitLoss: 0,
        latency: [],
        throughput: 0,
        errorRate: 0,
        resourceUsage: {
          cpu: 0,
          memory: 0,
          network: 0,
        },
        streakData: {
          current: 0,
          longest: {
            wins: 0,
            losses: 0,
          },
        },
      },
    };
  }

  private setupPerformanceTracking(): void {
    setInterval(
      () => this.updateStrategyPerformance(),
      this.PERFORMANCE_UPDATE_INTERVAL,
    );

    this.eventBus.subscribe("strategy:execution-completed", (event) => {
      const { strategyId, result } =
        event.payload as unknown as StrategyEvaluatedPayload;
      this.updateStrategyResult(strategyId, result);
    });
  }

  public createCompositeStrategy(
    name: string,
    strategies: string[],
    weights: number[],
    conditions: CompositeStrategy["conditions"],
  ): string {
    if (strategies.length !== weights.length) {
      throw new Error(
        "Strategies and weights arrays must have the same length",
      );
    }

    if (Math.abs(weights.reduce((a, b) => a + b, 0) - 1) > 0.0001) {
      throw new Error("Weights must sum to 1");
    }

    const id = `composite-${Date.now()}`;
    this.compositeStrategies.set(id, {
      id,
      name,
      strategies,
      weights,
      conditions,
      performance: {
        totalExecutions: 0,
        successRate: 0,
        averageReturn: 0,
        riskProfile: {
          level: "low",
          factors: [],
        },
        lastUpdated: Date.now(),
      },
    });

    return id;
  }

  public async analyzeOpportunity(
    playerId: string,
    metric: string,
  ): Promise<StrategyRecommendation | null> {
    const traceId = this.performanceMonitor.startTrace("strategy-analysis");

    try {
      const analysis = await this.analysisEngine.analyzePlayer(playerId);
      if (!this.meetsQualityThresholds(analysis)) {
        return null;
      }

      const data = this.dataHub.getIntegratedData();
      const baseRecommendation = await this.generateRecommendation(
        playerId,
        metric,
        analysis,
        data,
      );

      if (!baseRecommendation) {
        return null;
      }

      // Apply composite strategies if available
      const enhancedRecommendation = await this.applyCompositeStrategies(
        baseRecommendation,
        analysis,
        data,
      );

      this.performanceMonitor.endTrace(traceId);
      return enhancedRecommendation;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  private meetsQualityThresholds(analysis: AdvancedAnalysisResult): boolean {
    return (
      analysis.meta_analysis.data_quality >= this.config.requiredDataQuality &&
      analysis.meta_analysis.market_efficiency >=
      this.config.marketEfficiencyThreshold
    );
  }

  private async generateRecommendation(
    playerId: string,
    metric: string,
    analysis: AdvancedAnalysisResult,
    data: IntegratedData,
  ): Promise<StrategyRecommendation | null> {
    const prediction = analysis.predictions[metric];
    if (!prediction || prediction.confidence < this.config.minConfidence) {
      return null;
    }

    const marketData = this.analyzeMarketData(playerId, metric, data);
    const sentiment = this.analyzeSentiment(playerId, data);
    const valueGap = this.calculateValueGap(marketData);

    if (Math.abs(valueGap) < this.config.minValueGap) {
      return null;
    }

    const position = valueGap > 0 ? "over" : "under";
    const riskAssessment = this.assessRisk(marketData, analysis);

    if (
      this.getRiskLevel(toRiskTolerance(riskAssessment.level)) >
      this.getRiskLevel(toRiskTolerance(this.config.maxRiskLevel))
    ) {
      return null;
    }

    // Compose risk_reasoning from riskAssessment and analysis
    const risk_reasoning: string[] = [
      ...(riskAssessment.factors || []),
      ...(analysis.risks ? Object.values(analysis.risks).flatMap(r => r.factors || []) : []),
    ];
    return {
      id: `strategy-${Date.now()}`,
      type: position.toUpperCase() as "OVER" | "UNDER",
      confidence: prediction.confidence,
      expectedValue: this.calculateExpectedValue(
        valueGap,
        prediction.confidence,
      ),
      riskAssessment,
      analysis: {
        historicalTrends: [], // Placeholder
        marketSignals: [], // Placeholder
        riskFactors: [], // Placeholder
        risk_reasoning,
      },
      risk_reasoning, // direct field for legacy/compat
      propId: `${playerId}:${metric}`,
    };
  }

  private analyzeMarketData(
    playerId: string,
    metric: string,
    data: IntegratedData,
  ): MarketData {
    const relevantMarkets = this.findRelevantMarkets(playerId, metric, data);
    let currentLine = 0;
    let movement = "stable";
    let valueGap = 0;
    if (relevantMarkets && Object.keys(relevantMarkets).length > 0) {
      currentLine = this.calculateWeightedLine(relevantMarkets);
      movement = this.analyzeMarketMovement(relevantMarkets, data);
      valueGap = this.calculateMarketValueGap(
        currentLine,
        data.projections[playerId]?.stats[metric],
      );
    }
    return {
      playerId,
      metric,
      currentLine,
      movement,
      valueGap,
      volatility: 0,
      liquidity: 0,
      marketDepth: 0,
      momentum: 0,
    };
  }

  private findRelevantMarkets(
    playerId: string,
    metric: string,
    data: IntegratedData,
  ): Record<string, number> | null {
    const markets: Record<string, number> = {};

    Object.entries(data.odds).forEach(([eventId, odds]) => {
      Object.entries(odds.markets).forEach(([market, price]) => {
        if (this.isMarketRelevant(market, playerId, metric)) {
          markets[market] = price;
        }
      });
    });

    return Object.keys(markets).length > 0 ? markets : null;
  }

  private isMarketRelevant(
    market: string,
    playerId: string,
    metric: string,
  ): boolean {
    const marketLower = market.toLowerCase();
    const metricLower = metric.toLowerCase();
    const playerLower = playerId.toLowerCase();

    return (
      marketLower.includes(playerLower) && marketLower.includes(metricLower)
    );
  }

  private calculateWeightedLine(markets: Record<string, number>): number {
    const prices = Object.values(markets);
    if (prices.length === 0) return 0;

    // Simple average for now, could be enhanced with volume-weighted average
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  }

  private analyzeMarketMovement(
    markets: Record<string, number>,
    data: IntegratedData,
  ): string {
    const movements = Object.keys(markets).map((market) => {
      const eventId = this.findEventIdForMarket(market, data);
      if (!eventId) return "stable";

      const odds = data.odds[eventId];
      return odds?.movement.direction ?? "stable";
    });

    const upCount = movements.filter((m) => m === "up").length;
    const downCount = movements.filter((m) => m === "down").length;

    if (Math.abs(upCount - downCount) < 2) return "stable";
    return upCount > downCount ? "increasing" : "decreasing";
  }

  private findEventIdForMarket(
    market: string,
    data: IntegratedData,
  ): string | null {
    for (const [eventId, odds] of Object.entries(data.odds)) {
      if (market in odds.markets) {
        return eventId;
      }
    }
    return null;
  }

  private calculateMarketValueGap(
    currentLine: number,
    projectedValue?: number,
  ): number {
    if (!projectedValue) return 0;
    return projectedValue - currentLine;
  }

  private analyzeSentiment(playerId: string, data: IntegratedData): string {
    const sentiment = data.sentiment[playerId];
    if (!sentiment) {
      return `${playerId}:unknown:0:neutral:[]`;
    }
    return `${playerId}:${sentiment.sentiment.score}:${this.determineSentimentTrend(sentiment)}:${sentiment.keywords.join(",")}`;
  }

  private calculateValueGap(marketData: MarketData): number {
    return marketData.valueGap;
  }

  private assessRisk(
    marketData: MarketData,
    analysis: AdvancedAnalysisResult,
  ): StrategyRecommendation["riskAssessment"] {
    const riskLevel = this.calculateRiskLevel(marketData, analysis);
    const riskFactors = this.identifyRiskFactors(marketData, analysis);

    return {
      level: riskLevel as any,
      factors: riskFactors,
    };
  }

  private calculateRiskLevel(
    marketData: MarketData,
    analysis: AdvancedAnalysisResult,
  ): RiskTolerance {
    const volatility = marketData.volatility;
    const liquidity = marketData.liquidity;
    const marketDepth = marketData.marketDepth;

    const riskScore =
      volatility * 0.4 + (1 - liquidity) * 0.3 + (1 - marketDepth) * 0.3;

    if (riskScore < 0.3) return "low";
    if (riskScore < 0.7) return "medium";
    return "high";
  }

  private identifyRiskFactors(
    marketData: MarketData,
    analysis: AdvancedAnalysisResult,
  ): string[] {
    const factors: string[] = [];

    if (marketData.volatility > this.config.volatilityThreshold) {
      factors.push("High market volatility");
    }
    if (marketData.liquidity < this.config.liquidityThreshold) {
      factors.push("Low market liquidity");
    }
    if (marketData.marketDepth < this.config.depthThreshold) {
      factors.push("Insufficient market depth");
    }
    if (marketData.momentum < this.config.momentumThreshold) {
      factors.push("Weak market momentum");
    }

    // Add risks from analysis
    Object.entries(analysis.risks).forEach(([type, risk]) => {
      if (toRiskTolerance(risk.level) !== "low") {
        factors.push(...risk.factors);
      }
    });

    return factors;
  }

  private calculateExpectedValue(valueGap: number, confidence: number): number {
    return Math.abs(valueGap) * confidence * (1 - this.config.marginOfError);
  }

  private determineSentimentTrend(
    sentiment: IntegratedData["sentiment"][string],
  ): string {
    const score = sentiment.sentiment.score;
    const volume = sentiment.sentiment.volume;

    if (volume < 100) return "insufficient data";

    if (Math.abs(score) < 0.2) return "neutral";
    if (Math.abs(score) < 0.5)
      return score > 0 ? "slightly positive" : "slightly negative";
    if (Math.abs(score) < 0.8) return score > 0 ? "positive" : "negative";
    return score > 0 ? "strongly positive" : "strongly negative";
  }

  private getRiskLevel(level: RiskTolerance): number {
    switch (level) {
      case "low":
        return 1;
      case "medium":
        return 2;
      case "high":
        return 3;
    }
  }

  private async applyCompositeStrategies(
    baseRecommendation: StrategyRecommendation,
    analysis: AdvancedAnalysisResult,
    data: IntegratedData,
  ): Promise<StrategyRecommendation> {
    const finalRecommendation = { ...baseRecommendation };
    const totalConfidence = 0;
    let totalWeight = 0;

    for (const [, composite] of this.compositeStrategies) {
      if (this.shouldApplyStrategy(composite, analysis, data)) {
        const strategyResults = await Promise.all(
          composite.strategies.map(async (strategyId, index) => {
            const result = await this.executeStrategy(
              strategyId,
              baseRecommendation,
              analysis,
              data,
            );
            return {
              result,
              weight: composite.weights[index],
            };
          }),
        );

        // Combine strategy results
        strategyResults.forEach(({ result, weight }) => {
          if (result) {
            finalRecommendation.confidence =
              (finalRecommendation.confidence * totalWeight +
                result.confidence * weight) /
              (totalWeight + weight);
            finalRecommendation.expectedValue =
              (finalRecommendation.expectedValue * totalWeight +
                result.expectedValue * weight) /
              (totalWeight + weight);
            totalWeight += weight;
          }
        });
      }
    }

    return finalRecommendation;
  }

  private shouldApplyStrategy(
    strategy: CompositeStrategy,
    analysis: AdvancedAnalysisResult,
    data: IntegratedData,
  ): boolean {
    // Check confidence threshold
    if (
      analysis.meta_analysis.prediction_stability <
      strategy.conditions.minConfidence
    ) {
      return false;
    }

    // Check risk level
    const maxRiskLevel = this.getRiskLevel(
      toRiskTolerance(strategy.conditions.maxRisk),
    );
    const currentRisk = Object.values(analysis.risks).some(
      (risk) => this.getRiskLevel(toRiskTolerance(risk.level)) > maxRiskLevel,
    );
    if (currentRisk) {
      return false;
    }

    // Check market state conditions
    const marketState = this.determineMarketState(data);
    if (!strategy.conditions.marketStates.includes(marketState)) {
      return false;
    }

    return true;
  }

  private async executeStrategy(
    strategyId: string,
    baseRecommendation: StrategyRecommendation,
    analysis: AdvancedAnalysisResult,
    data: IntegratedData,
  ): Promise<StrategyRecommendation | null> {
    // Implementation for individual strategy execution
    return baseRecommendation; // Placeholder
  }

  private determineMarketState(data: IntegratedData): string {
    // Analyze market conditions to determine state
    // Example states: 'stable', 'volatile', 'trending', etc.
    return "stable"; // Placeholder
  }

  private updateStrategyResult(
    strategyId: string,
    result: StrategyRecommendation,
  ): void {
    const performance = this.strategyPerformance.get(strategyId) || {
      totalExecutions: 0,
      successRate: 0,
      averageReturn: 0,
      riskProfile: {
        level: "low",
        factors: [],
      },
      lastUpdated: Date.now(),
    };

    // Update performance metrics
    performance.totalExecutions++;
    performance.lastUpdated = Date.now();

    this.strategyPerformance.set(strategyId, performance);

    // Adjust composite strategy weights based on performance
    this.adjustStrategyWeights();
  }

  private adjustStrategyWeights(): void {
    for (const [id, composite] of this.compositeStrategies) {
      const performances = composite.strategies.map((strategyId) =>
        this.strategyPerformance.get(strategyId),
      );

      if (performances.some((p) => !p)) continue;

      // Calculate new weights based on relative performance
      const totalPerformance = performances.reduce(
        (sum, p) => sum + p!.averageReturn * p!.successRate,
        0,
      );

      const newWeights = performances.map(
        (p) => (p!.averageReturn * p!.successRate) / totalPerformance,
      );

      // Update weights
      this.compositeStrategies.set(id, {
        ...composite,
        weights: newWeights,
      });
    }
  }

  private updateStrategyPerformance(): void {
    for (const [strategyId, performance] of this.strategyPerformance) {
      if (
        Date.now() - performance.lastUpdated >
        this.PERFORMANCE_UPDATE_INTERVAL
      ) {
        // Recalculate long-term performance metrics
        this.recalculatePerformanceMetrics(strategyId);
      }
    }
  }

  private recalculatePerformanceMetrics(strategyId: string): void {
    // Implementation for recalculating long-term performance metrics
    // This would typically involve fetching historical data and updating the metrics
  }

  private validateRecommendation(recommendation: StrategyRecommendation): void {
    if (!recommendation.id) {
      throw new Error("Strategy recommendation must have an ID");
    }
    if (!recommendation.type) {
      throw new Error("Strategy recommendation must have a type");
    }
    if (
      typeof recommendation.confidence !== "number" ||
      recommendation.confidence < 0 ||
      recommendation.confidence > 1
    ) {
      throw new Error("Invalid confidence value");
    }
    if (
      typeof recommendation.expectedValue !== "number" ||
      recommendation.expectedValue <= 0
    ) {
      throw new Error("Invalid expected value");
    }
    if (
      !recommendation.riskAssessment ||
      !recommendation.riskAssessment.level
    ) {
      throw new Error("Invalid risk assessment");
    }
  }

  private async generateStrategy(
    marketData: MarketData,
  ): Promise<StrategyRecommendation> {
    const traceId = this.performanceMonitor.startTrace("strategy-generation");

    try {
      const analysis = await this.analysisEngine.analyzePlayer(
        marketData.playerId,
      );
      const valueGap = this.calculateValueGap(marketData);

      if (Math.abs(valueGap) < this.config.minValueGap) {
        throw new Error("Value gap below minimum threshold");
      }

      if (!this.meetsQualityThresholds(analysis)) {
        throw new Error("Analysis quality below required threshold");
      }

      const position = this.determinePosition(valueGap);
      const riskAssessment = this.assessRisk(marketData, analysis);

      if (
        this.getRiskLevel(toRiskTolerance(riskAssessment.level)) >
        this.getRiskLevel(toRiskTolerance(this.config.maxRiskLevel))
      ) {
        throw new Error("Risk level exceeds maximum threshold");
      }

      const prediction = analysis.predictions[marketData.metric];
      if (!prediction || prediction.confidence < this.config.minConfidence) {
        throw new Error("Prediction confidence below minimum threshold");
      }

      const historicalTrends = Object.entries(analysis.trends)
        .map(([metric, trend]) => {
          const trendData = trend as {
            direction: string;
            strength: number;
            supporting_data: string[];
          };
          return [
            `${metric}: ${trendData.direction} (${trendData.strength})`,
            ...(trendData.supporting_data || []),
          ];
        })
        .flat();

      const recommendation: StrategyRecommendation = {
        id: `strategy-${Date.now()}`,
        type: position.toUpperCase() as "OVER" | "UNDER",
        confidence: prediction.confidence,
        expectedValue: this.calculateExpectedValue(
          valueGap,
          prediction.confidence,
        ),
        riskAssessment,
        analysis: {
          historicalTrends,
          marketSignals: analysis.opportunities
            .map((opp) => opp.rationale)
            .flat(),
          riskFactors: Object.entries(analysis.risks)
            .map(([type, risk]) => [`${type}: ${risk.level}`, ...risk.factors])
            .flat(),
        },
        propId: `${marketData.playerId}:${marketData.metric}`,
      };

      this.validateRecommendation(recommendation);
      this.performanceMonitor.endTrace(traceId);
      return recommendation;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  private calculateExposure(valueGap: number, confidence: number): number {
    return Math.min(valueGap * confidence, this.config.maxExposure);
  }

  private calculateStake(valueGap: number, confidence: number): number {
    const kellyFraction = this.config.kellyFraction;
    const bankroll = this.state.bankroll;
    const odds = 1 + valueGap;

    const kellyStake =
      bankroll *
      ((odds * confidence - (1 - confidence)) / odds) *
      kellyFraction;

    return Math.min(
      Math.max(kellyStake, this.config.minStake),
      this.config.maxStake,
    );
  }

  private determineExecutionTiming(
    marketData: MarketData,
    sentiment: SentimentAnalysis,
  ): "immediate" | "wait" | "monitor" {
    if (marketData.volatility > this.config.volatilityThreshold) {
      return "monitor";
    }
    if (sentiment.score < this.config.sentimentThreshold) {
      return "wait";
    }
    return "immediate";
  }

  private determineExecutionConditions(marketData: MarketData): string[] {
    const conditions: string[] = [];

    if (marketData.volatility > this.config.volatilityThreshold) {
      conditions.push(
        `Wait for volatility to drop below ${this.config.volatilityThreshold}`,
      );
    }
    if (marketData.liquidity < this.config.liquidityThreshold) {
      conditions.push(
        `Wait for liquidity to increase above ${this.config.liquidityThreshold}`,
      );
    }
    if (marketData.valueGap < this.config.minValueGap) {
      conditions.push(
        `Wait for value gap to increase above ${this.config.minValueGap}`,
      );
    }

    return conditions;
  }

  private determineExitCriteria(marketData: MarketData): string[] {
    return [
      `Stop loss at ${this.calculateStopLoss(marketData)}`,
      `Take profit at ${this.calculateTakeProfit(marketData)}`,
      `Exit if volatility exceeds ${this.config.maxVolatility}`,
      `Exit if liquidity drops below ${this.config.minLiquidity}`,
    ];
  }

  private findHedgingOpportunities(marketData: MarketData): string[] {
    return [
      `Consider opposite position if value gap reverses by ${this.config.hedgingThreshold}%`,
      `Look for correlated markets with inverse movement`,
      `Monitor alternative betting lines for arbitrage`,
    ];
  }

  private calculateStopLoss(marketData: MarketData): number {
    return marketData.currentLine * (1 - this.config.stopLossPercentage);
  }

  private calculateTakeProfit(marketData: MarketData): number {
    return marketData.currentLine * (1 + this.config.takeProfitPercentage);
  }

  private determinePosition(valueGap: number): "over" | "under" {
    return valueGap > 0 ? "over" : "under";
  }
}
