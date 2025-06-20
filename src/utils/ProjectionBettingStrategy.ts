
// Extend IntegratedData with optional fields, omitting required 'sentiment' to avoid conflict
type ExtendedIntegratedData = Omit<IntegratedData, 'sentiment'> & {
  projections?: Record<string, unknown>;
  odds?: Record<string, unknown>;
  sentiment?: unknown[];
  injuries?: Record<string, unknown>;
  trends?: Record<string, unknown>;
  timestamp?: number;
};

import { ProjectionAnalysis } from "../analyzers/ProjectionAnalyzer";
import { EventBus } from "../core/EventBus";
import { FeatureFlags } from "../core/FeatureFlags";
import { PerformanceMonitor } from "../core/PerformanceMonitor";
import { Decision, IntegratedData, Recommendation, Strategy } from "../core/PredictionEngine";
import { PerformanceMetrics } from "../types/core";

// Simple LRU cache for memoization
class LRUCache<K, V> {
  private cache = new Map<K, V>();
  constructor(private maxSize: number = 100) { }
  get(key: K): V | undefined {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }
  set(key: K, value: V) {
    if (this.cache.has(key)) this.cache.delete(key);
    else if (this.cache.size >= this.maxSize) this.cache.delete(this.cache.keys().next().value);
    this.cache.set(key, value);
  }
}

// Plugin interface for stat evaluation
export interface ProjectionPlugin {
  statType: string;
  evaluate: (projection: ProjectionAnalysis, config: StrategyConfig) => Recommendation[];
}

interface StrategyConfig {
  minConfidence: number;
  minEdge: number;
  maxRisk: number;
  useHistoricalData: boolean;
  useAdvancedStats: boolean;
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
    roi: 0,
    profitLoss: 0,
    clvAverage: 0,
    edgeRetention: 0,
    kellyMultiplier: 0,
    marketEfficiencyScore: 0,
    averageOdds: 0,
    maxDrawdown: 0,
    sharpeRatio: 0,
    betterThanExpected: 0,
    timestamp: Date.now(),
    cpu: { usage: 0, cores: 0, temperature: 0 },
    memory: { total: 0, used: 0, free: 0, swap: 0 },
    network: { bytesIn: 0, bytesOut: 0, connections: 0, latency: 0 },
    disk: { total: 0, used: 0, free: 0, iops: 0 },
    responseTime: { avg: 0, p95: 0, p99: 0 },
    throughput: { requestsPerSecond: 0, transactionsPerSecond: 0 },
    errorRate: 0,
    uptime: 0,
    predictionId: '',
    confidence: 0,
    riskScore: 0,
    // Add any additional required properties with default values if the type changes in the future
  };

  private edgeCache = new LRUCache<string, number>(200);
  private stabilityCache = new LRUCache<string, number>(100);
  private confidenceCache = new LRUCache<string, number>(100);
  private plugins: ProjectionPlugin[] = [];

  constructor(config: StrategyConfig, plugins?: ProjectionPlugin[]) {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.featureManager = FeatureFlags.getInstance();
    this.config = config;
    if (plugins) this.plugins = plugins;
    // Register default stat plugins
    this.registerDefaultPlugins();
  }
  validate(data: IntegratedData): boolean {
    throw new Error("Method not implemented.");
  }
  getMetrics() {
    throw new Error("Method not implemented.");
  }

  private registerDefaultPlugins() {
    // Default stat types
    const statTypes = ["points", "rebounds", "assists", "steals", "blocks", "threes"] as const;
    for (const stat of statTypes) {
      this.plugins.push({
        statType: stat,
        evaluate: (projection, config) => {
          const metrics = projection.predictions[stat];
          if (metrics.confidence >= config.minConfidence) {
            const predictedValue = metrics.predicted;
            const targetValue = metrics.range.min;
            const type = predictedValue > targetValue ? "OVER" : "UNDER";
            return [{
              id: `rec-${Date.now()}`,
              type,
              confidence: metrics.confidence,
              reasoning: this.generateReasoning(projection, stat, metrics, false),
              supporting_data: {
                historical_data: [],
                market_data: [],
                correlation_data: [],
              },
            }];
          }
          return [];
        },
      });
    }
  }

  public async analyze(data: ExtendedIntegratedData): Promise<Decision> {
    // Enhanced tracing with tags
    const traceId = this.performanceMonitor.startTrace("betting-strategy", {
      strategy: this.id,
      timestamp: (typeof data.timestamp === 'number' ? data.timestamp : Date.now()).toFixed(0),
    });
    // Add tags for trace analytics (simulate span.addTag)
    // Type-safe check for addTag method
    const pm = this.performanceMonitor as PerformanceMonitor & { addTag?: (traceId: string, key: string, value: string) => void };
    if (typeof pm.addTag === 'function') {
      pm.addTag(traceId, 'strategy', this.id);
      pm.addTag(traceId, 'dataFields', Object.keys(data).join(','));
    }

    try {
      const recommendations: Recommendation[] = [];
      let overallConfidence = 0;

      // Process projections
      const projections = this.processProjections(
        (typeof data.projections === 'object' && data.projections !== null)
          ? data.projections
          : {},
      );

      for (const projection of projections) {
        try {
          // Plugin-based evaluation
          for (const plugin of this.plugins) {
            const pluginRecs = plugin.evaluate(projection, this.config);
            recommendations.push(...pluginRecs);
          }
        } catch (error) {
          console.error(
            `Error evaluating projection for ${projection.player}:`,
            error,
          );
        }
      }

      if (recommendations.length > 0) {
        overallConfidence =
          recommendations.reduce((sum, rec) => sum + rec.confidence, 0) /
          recommendations.length;
      }

      const filteredRecommendations = recommendations.filter(
        (rec) =>
          rec.confidence >= this.config.minConfidence &&
          this.calculateEdge(rec) >= this.config.minEdge,
      );

      filteredRecommendations.sort((a, b) => b.confidence - a.confidence);

      const decision: Decision = {
        id: `decision-${Date.now()}`,
        timestamp: Date.now(),
        confidence: overallConfidence,
        recommendations: filteredRecommendations,
        analysis: {
          meta_analysis: {
            data_quality: this.calculateDataQuality({
              ...data,
              sentiment: Array.isArray(data.sentiment) ? data.sentiment : [],
            }),
            prediction_stability:
              this.calculatePredictionStability(recommendations),
            market_efficiency: this.calculateMarketEfficiency(
              (typeof data.odds === 'object' && data.odds !== null)
                ? data.odds
                : {},
            ),
            playerId: Object.keys((typeof data.projections === 'object' && data.projections !== null ? data.projections : {}))[0] || "",
            metric: "combined",
          },
          confidence_factors: this.calculateConfidenceFactors(data),
          risk_factors: this.calculateRiskFactors(data),
          // @ts-expect-error: risk_reasoning is an extension for future-proofing
          risk_reasoning: this.generateRiskReasoning(filteredRecommendations, data),
        },
      };

  // Risk reasoning layer (scaffold)
  private generateRiskReasoning(recommendations: Recommendation[], data: ExtendedIntegratedData): string[] {
    // Example: produce human-readable summaries for each rec
    return recommendations.map(rec => {
      let reasons = [];
      if (rec.confidence < 0.6) reasons.push("Low model confidence");
      if (this.calculateDataCompleteness(data) < 0.7) reasons.push("Incomplete data");
      if (this.calculateMarketVolatility(data.odds ?? {}) > 0.5) reasons.push("High market volatility");
      if (this.calculateInjuryRisk(data.injuries ?? {}) > 0.3) reasons.push("Elevated injury risk");
      if (reasons.length === 0) reasons.push("No major risk factors detected");
      return `Pick ${rec.id}: ${reasons.join('; ')}`;
    });
  }

      this.performanceMonitor.endTrace(traceId);
return decision;
    } catch (error) {
  this.performanceMonitor.endTrace(traceId, error as Error);
  throw error;
}
  }

  public validate(data: ExtendedIntegratedData): boolean {
  return (
    data.projections !== undefined &&
    data.sentiment !== undefined &&
    data.odds !== undefined &&
    data.timestamp !== undefined
  );
}

  public getMetrics(): PerformanceMetrics {
  return this.metrics;
}

  private processProjections(projections: Record<string, unknown>): ProjectionAnalysis[] {
  return Object.entries(projections).map(([playerId, data]) => {
    const d = data as Record<string, unknown> & { stats?: Record<string, unknown>; confidence?: number };
    // Ensure all stats are strings
    const stats = {
      team: String(d.stats?.team || ""),
      position: String(d.stats?.position || ""),
      opponent: String(d.stats?.opponent || ""),
      isHome: Boolean(d.stats?.isHome || false),
      points: Number(d.stats?.points || 0),
      rebounds: Number(d.stats?.rebounds || 0),
      assists: Number(d.stats?.assists || 0),
      steals: Number(d.stats?.steals || 0),
      blocks: Number(d.stats?.blocks || 0),
      threes: Number(d.stats?.threes || 0),
      minutes: Number(d.stats?.minutes || 0),
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

  private calculateDataCompleteness(data: ExtendedIntegratedData): number {
  const requiredFields = [
    "projections",
    "sentiment",
    "odds",
    "injuries",
    "trends",
  ] as const;
  const presentFields = requiredFields.filter((field) => {
    const value = data[field];
    if (Array.isArray(value)) {
      return value.length > 0;
    }
    if (typeof value === 'object' && value !== null) {
      return Object.keys(value).length > 0;
    }
    return value !== undefined && value !== null;
  });
  return presentFields.length / requiredFields.length;
}

  private calculateDataRecency(data: ExtendedIntegratedData): number {
  const now = Date.now();
  const timestamp = data.timestamp;
  const age = now - (typeof timestamp === 'number' ? timestamp : now);
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

  const movements = markets.map((m) => {
    if (m && typeof m === 'object' && 'movement' in m && (m as { movement?: { magnitude: number } }).movement) {
      return (m as { movement: { magnitude: number } }).movement.magnitude;
    }
    return 0;
  });
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
  data: ExtendedIntegratedData,
): Record < string, number > {
  const projections = (typeof data.projections === 'object' && data.projections !== null)
    ? data.projections
    : {};
  const sentiment = Array.isArray(data.sentiment)
    ? data.sentiment
    : [];
  const odds = (typeof data.odds === 'object' && data.odds !== null)
    ? data.odds
    : {};
  return {
    projection_confidence: this.calculateProjectionConfidence(projections),
    sentiment_confidence: this.calculateSentimentConfidence(sentiment),
    market_confidence: this.calculateMarketConfidence(odds),
  };
}

  private calculateProjectionConfidence(projections: Record<string, unknown>): number {
  const confidences = Object.values(projections).map(
    (p) => (p && typeof p === 'object' && 'confidence' in p ? (p as { confidence?: number }).confidence ?? 0 : 0),
  );
  return confidences.length > 0
    ? confidences.reduce((a, b) => a + b, 0) / confidences.length
    : 0;
}

  private calculateSentimentConfidence(
  sentiment: unknown[],
): number {
  return sentiment.length > 0 ? 0.7 : 0; // Simplified for now
}

  private calculateMarketConfidence(odds: Record<string, unknown>): number {
  return Object.values(odds).length > 0 ? 0.8 : 0; // Simplified for now
}

  private calculateRiskFactors(data: ExtendedIntegratedData): Record < string, number > {
  return {
    data_sparsity: 1 - this.calculateDataCompleteness(data),
    market_volatility: this.calculateMarketVolatility(data.odds ?? {}),
    injury_risk: this.calculateInjuryRisk(data.injuries ?? {}),
  };
}

  private calculateMarketVolatility(odds: Record<string, unknown>): number {
  return (
    Object.values(odds)
      .map((m) => (m && typeof m === 'object' && 'movement' in m && (m as { movement?: { magnitude: number } }).movement ? (m as { movement: { magnitude: number } }).movement.magnitude : 0))
      .reduce((acc, mag) => acc + mag, 0) / Object.keys(odds).length || 0
  );
}

  private calculateInjuryRisk(injuries: Record<string, unknown>): number {
  return (
    Object.values(injuries)
      .map((i) => (i && typeof i === 'object' && 'impact' in i ? (i as { impact?: number }).impact ?? 0 : 0))
      .reduce((acc, impact) => acc + impact, 0) /
    Object.keys(injuries).length || 0
  );
}

  private evaluateProjection(projection: ProjectionAnalysis): Recommendation[] {
  const recommendations: Recommendation[] = [];

  // Check if advanced stats feature is enabled
  // FeatureFlags.isEnabled is not available, so default to false
  const useAdvancedStats = false;

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
