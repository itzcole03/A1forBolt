import { ProjectionAnalysis } from "../analyzers/ProjectionAnalyzer";
import { EventBus } from "../core/EventBus";
import { FeatureFlags } from "../core/FeatureFlags";
import { PerformanceMonitor } from "../core/PerformanceMonitor";
import {
  Decision,
  IntegratedData,
  Recommendation,
  Strategy,
} from "../core/PredictionEngine";
import { AnalysisResult as CoreAnalysisResult, PerformanceMetrics } from "../types/core";

interface StrategyConfig {
  minConfidence: number;
  minEdge: number;
  maxRisk: number;
  useHistoricalData: boolean;
  useAdvancedStats: boolean;
}

interface _ProjectionAnalysisResult extends CoreAnalysisResult {
  context: {
    market: string;
    timestamp: number;
    parameters: Record<string, unknown>;
  };
  results: ProjectionAnalysis[];
}

export class ProjectionBettingStrategy implements Strategy {
  public readonly id = "projection-betting";
  public readonly name = "Projection-Based Betting Strategy";
  public readonly description =
    "Analyzes player projections to identify betting opportunities";
  public confidence = 0;

  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly featureManager: FeatureFlags;
  private readonly config: StrategyConfig;
  private metrics: PerformanceMetrics = {
    totalBets: 0,
    winRate: 0,
    averageOdds: 0,
    roi: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    betterThanExpected: 0,
    profitLoss: 0,
  };

  constructor(config: StrategyConfig) {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.featureManager = FeatureFlags.getInstance();
    this.config = config;
  }
  public async analyze(data: IntegratedData): Promise<Decision> {
    const traceId = this.performanceMonitor.startTrace("betting-strategy", {
      strategy: this.id,
      timestamp: (
        ((data as Record<string, unknown>).timestamp as number) ?? Date.now()
      ).toFixed(0),
    });

    try {
      const recommendations: Recommendation[] = [];
      let overallConfidence = 0;

      // Process projections
      const projections = this.processProjections(
        (data as Record<string, unknown>).projections ?? {},
      );

      for (const projection of projections) {
        const spanId = this.performanceMonitor.startSpan(
          traceId,
          "projection-evaluation",
          {
            player: projection.player,
            confidence: String(projection.confidence),
          },
        );

        try {
          const playerRecommendations = this.evaluateProjection(projection);
          recommendations.push(...playerRecommendations);
          this.performanceMonitor.endSpan(spanId);
        } catch (error) {
          this.performanceMonitor.endSpan(spanId, error as Error);
          console.error(
            `Error evaluating projection for ${projection.player}:`,
            error,
          );
        }
      }

      // Calculate overall confidence based on recommendation quality
      if (recommendations.length > 0) {
        overallConfidence =
          recommendations.reduce((sum, rec) => sum + rec.confidence, 0) /
          recommendations.length;
      }

      // Filter recommendations based on confidence and edge
      const filteredRecommendations = recommendations.filter(
        (rec) =>
          rec.confidence >= this.config.minConfidence &&
          this.calculateEdge(rec) >= this.config.minEdge,
      );

      // Sort recommendations by confidence
      filteredRecommendations.sort((a, b) => b.confidence - a.confidence);

      const decision: Decision = {
        id: `decision-${Date.now()}`,
        timestamp: Date.now(),
        confidence: overallConfidence,
        recommendations: filteredRecommendations,
        analysis: {
          meta_analysis: {
            data_quality: this.calculateDataQuality(data),
            prediction_stability:
              this.calculatePredictionStability(recommendations),
            market_efficiency: this.calculateMarketEfficiency(
              (data as Record<string, unknown>).odds ?? {},
            ),
            playerId:
              Object.keys(
                (data as Record<string, unknown>).projections ?? {},
              )[0] || "",
            metric: "combined",
          },
          confidence_factors: this.calculateConfidenceFactors(
            data as Record<string, unknown>,
          ),
          risk_factors: this.calculateRiskFactors(
            data as Record<string, unknown>,
          ),
        },
      };

      this.performanceMonitor.endTrace(traceId);
      return decision;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }
  public validate(data: IntegratedData): boolean {
    const dataRecord = data as Record<string, unknown>;
    return (
      dataRecord.projections !== undefined &&
      dataRecord.sentiment !== undefined &&
      dataRecord.odds !== undefined &&
      dataRecord.timestamp !== undefined
    );
  }

  public getMetrics(): PerformanceMetrics {
    return this.metrics;
  }
  private processProjections(
    projections: Record<string, unknown>,
  ): ProjectionAnalysis[] {
    return Object.entries(projections).map(([playerId, data]) => {
      const d = data as Record<string, unknown>;
      // Ensure all stats are strings
      const stats = {
        team: String((d.stats as Record<string, unknown>)?.team || ""),
        position: String((d.stats as Record<string, unknown>)?.position || ""),
        opponent: String((d.stats as Record<string, unknown>)?.opponent || ""),
        isHome: Boolean((d.stats as Record<string, unknown>)?.isHome || false),
        points: Number((d.stats as Record<string, unknown>)?.points || 0),
        rebounds: Number((d.stats as Record<string, unknown>)?.rebounds || 0),
        assists: Number((d.stats as Record<string, unknown>)?.assists || 0),
        steals: Number((d.stats as Record<string, unknown>)?.steals || 0),
        blocks: Number((d.stats as Record<string, unknown>)?.blocks || 0),
        threes: Number((d.stats as Record<string, unknown>)?.threes || 0),
        minutes: Number((d.stats as Record<string, unknown>)?.minutes || 0),
      };

      return {
        player: playerId,
        confidence: d.confidence,
        predictions: {
          points: {
            predicted: stats.points,
            confidence: d.confidence,
            range: { min: 0, max: 0 },
          },
          rebounds: {
            predicted: stats.rebounds,
            confidence: d.confidence,
            range: { min: 0, max: 0 },
          },
          assists: {
            predicted: stats.assists,
            confidence: d.confidence,
            range: { min: 0, max: 0 },
          },
          steals: {
            predicted: stats.steals,
            confidence: d.confidence,
            range: { min: 0, max: 0 },
          },
          blocks: {
            predicted: stats.blocks,
            confidence: d.confidence,
            range: { min: 0, max: 0 },
          },
          threes: {
            predicted: stats.threes,
            confidence: d.confidence,
            range: { min: 0, max: 0 },
          },
          minutes: {
            predicted: stats.minutes,
            confidence: d.confidence,
            range: { min: 0, max: 0 },
          },
        },
        metadata: {
          team: stats.team,
          position: stats.position,
          opponent: stats.opponent,
          isHome: stats.isHome,
        },
      };
    });
  }

  private calculateDataQuality(data: IntegratedData): number {
    // Calculate data quality based on completeness and recency
    const completeness = this.calculateDataCompleteness(data);
    const recency = this.calculateDataRecency(data);
    return (completeness + recency) / 2;
  }

  private calculateDataCompleteness(data: IntegratedData): number {
    const requiredFields = [
      "projections",
      "sentiment",
      "odds",
      "injuries",
      "trends",
    ];
    const presentFields = requiredFields.filter(
      (field) =>
        data[field as keyof IntegratedData] !== undefined &&
        Object.keys(data[field as keyof IntegratedData]).length > 0,
    );
    return presentFields.length / requiredFields.length;
  }
  private calculateDataRecency(data: IntegratedData): number {
    const now = Date.now();
    const age = now - ((data as Record<string, unknown>).timestamp as number);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    return Math.max(0, 1 - age / maxAge);
  }

  private calculatePredictionStability(
    recommendations: Recommendation[],
  ): number {
    if (recommendations.length === 0) return 0;

    const confidences = recommendations.map((r) => r.confidence);
    const mean = confidences.reduce((a, b) => a + b, 0) / confidences.length;
    const variance =
      confidences.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      confidences.length;

    return 1 - Math.min(1, Math.sqrt(variance));
  }
  private calculateMarketEfficiency(odds: Record<string, unknown>): number {
    const markets = Object.values(odds);
    if (markets.length === 0) return 0;

    const movements = markets.map(
      (m: Record<string, unknown>) =>
        ((m.movement as Record<string, unknown>)?.magnitude as number) || 0,
    );
    const volatility = this.calculateVolatility(movements);
    const liquidity = markets.length / 100; // Normalize by expected max markets

    return (volatility + liquidity) / 2;
  }

  private calculateVolatility(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance =
      values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;

    return Math.min(1, Math.sqrt(variance));
  }
  private calculateConfidenceFactors(
    data: IntegratedData,
  ): Record<string, number> {
    const dataRecord = data as Record<string, unknown>;
    return {
      projection_confidence: this.calculateProjectionConfidence(
        dataRecord.projections,
      ),
      sentiment_confidence: this.calculateSentimentConfidence(
        dataRecord.sentiment,
      ),
      market_confidence: this.calculateMarketConfidence(dataRecord.odds),
    };
  }

  private calculateProjectionConfidence(projections: unknown): number {
    const projectionsRecord = projections as Record<string, unknown>;
    const confidences = Object.values(projectionsRecord).map(
      (p: unknown) =>
        ((p as Record<string, unknown>).confidence as number) || 0,
    );
    return confidences.length > 0
      ? confidences.reduce((a, b) => a + b, 0) / confidences.length
      : 0;
  }

  private calculateSentimentConfidence(
    sentiment: IntegratedData["sentiment"],
  ): number {
    return Object.keys(sentiment).length > 0 ? 0.7 : 0; // Simplified for now
  }
  private calculateMarketConfidence(odds: unknown): number {
    return Object.values(odds as Record<string, unknown>).length > 0 ? 0.8 : 0; // Simplified for now
  }

  private calculateRiskFactors(
    data: Record<string, unknown>,
  ): Record<string, number> {
    return {
      data_sparsity: 1 - this.calculateDataCompleteness(data),
      market_volatility: this.calculateMarketVolatility(data.odds),
      injury_risk: this.calculateInjuryRisk(data.injuries),
    };
  }
  private calculateMarketVolatility(odds: unknown): number {
    const oddsRecord = odds as Record<string, unknown>;
    return (
      Object.values(oddsRecord)
        .map(
          (m: unknown) =>
            ((
              (m as Record<string, unknown>).movement as Record<string, unknown>
            )?.magnitude as number) || 0,
        )
        .reduce((acc, mag) => acc + mag, 0) / Object.keys(oddsRecord).length ||
      0
    );
  }

  private calculateInjuryRisk(injuries: unknown): number {
    const injuriesRecord = injuries as Record<string, unknown>;
    return (
      Object.values(injuriesRecord)
        .map(
          (i: unknown) =>
            ((i as Record<string, unknown>).impact as number) || 0,
        )
        .reduce((acc, impact) => acc + impact, 0) /
      Object.keys(injuriesRecord).length || 0
    );
  }

  private evaluateProjection(projection: ProjectionAnalysis): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Check if advanced stats feature is enabled
    const useAdvancedStats = this.featureManager.isEnabled("advanced-stats", {
      id: "system",
      groups: ["betting-strategy"],
      attributes: {},
    });

    // Process each stat type
    const statTypes = [
      "points",
      "rebounds",
      "assists",
      "steals",
      "blocks",
      "threes",
    ] as const;

    for (const stat of statTypes) {
      const metrics = projection.predictions[stat];
      if (metrics.confidence >= this.config.minConfidence) {
        const predictedValue = metrics.predicted;
        const targetValue = metrics.range.min; // Use min range as target
        const type = predictedValue > targetValue ? "OVER" : "UNDER";

        const edge = this.calculateEdge({
          id: `rec-${Date.now()}`,
          type,
          confidence: metrics.confidence,
          reasoning: this.generateReasoning(
            projection,
            stat,
            metrics,
            useAdvancedStats,
          ),
          supporting_data: {
            historical_data: [],
            market_data: [],
            correlation_data: [],
          },
        });

        if (edge >= this.config.minEdge) {
          recommendations.push({
            id: `rec-${Date.now()}`,
            type,
            confidence: metrics.confidence,
            reasoning: this.generateReasoning(
              projection,
              stat,
              metrics,
              useAdvancedStats,
            ),
            supporting_data: {
              historical_data: [],
              market_data: [],
              correlation_data: [],
            },
          });
        }
      }
    }

    return recommendations;
  }

  private calculateEdge(recommendation: Recommendation): number {
    // Calculate edge based on confidence and type
    const baseEdge = recommendation.confidence - 0.5;
    return Math.max(0, baseEdge * (1 - this.config.maxRisk));
  }

  private generateReasoning(
    projection: ProjectionAnalysis,
    stat: string,
    metrics: ProjectionAnalysis["predictions"][keyof ProjectionAnalysis["predictions"]],
    useAdvancedStats: boolean,
  ): string[] {
    const reasoning: string[] = [];

    // Base projection confidence
    reasoning.push(
      `${projection.player} has a ${(metrics.confidence * 100).toFixed(1)}% confidence projection for ${stat}`,
    );

    // Minutes-based reasoning
    const minutes = projection.predictions.minutes;
    if (minutes.predicted >= 30) {
      reasoning.push(
        `Expected to play significant minutes (${minutes.predicted.toFixed(1)})`,
      );
    }

    // Matchup-based reasoning
    reasoning.push(
      `${projection.metadata.isHome ? "Home" : "Away"} game against ${projection.metadata.opponent}`,
    );

    // Advanced stats reasoning if enabled
    if (useAdvancedStats) {
      reasoning.push(
        `Projection range: ${metrics.range.min.toFixed(1)} - ${metrics.range.max.toFixed(1)}`,
      );
    }

    return reasoning;
  }
}
