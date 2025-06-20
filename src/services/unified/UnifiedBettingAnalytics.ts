
import { EventEmitter } from 'events';
import { DataSource, UnifiedDataService } from './UnifiedDataService.js';
// BetRecommendation type is not found in types.js, so define it here for now
export interface BetRecommendation {
  id: string;
  market: string;
  odds: number;
  prediction: number;
  confidence: number;
  recommendedStake: number;
  expectedValue: number;
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  hedgingOpportunities: Array<{ market: string; odds: number; recommendedStake: number }>;
}

export interface BettingStrategy {
  id: string;
  name: string;
  riskLevel: 'low' | 'medium' | 'high';
  stakePercentage: number;
  minOdds: number;
  maxOdds: number;
}

export interface PredictionModel {
  id: string;
  name: string;
  accuracy: number;
  lastUpdated: Date;
  parameters: Record<string, unknown>;
}

export interface BettingAnalysis {
  predictionConfidence: number;
  recommendedStake: number;
  expectedValue: number;
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  hedgingOpportunities: Array<{
    market: string;
    odds: number;
    recommendedStake: number;
  }>;
  /**
   * Optional array of risk reasoning strings, propagated from strategy/model layer.
   */
  risk_reasoning?: string[];
}

interface MarketData {
  id: string;
  name: string;
  odds: number;
  data: Record<string, unknown>;
}

// Removed unused PredictionResult interface

// Ensure correct EventEmitter3 usage for TypeScript
export class UnifiedBettingAnalytics extends EventEmitter {
  private static instance: UnifiedBettingAnalytics;
  private dataService: UnifiedDataService;
  private activeStrategies: Map<string, BettingStrategy>;
  private predictionModels: Map<string, PredictionModel>;

  private constructor() {
    super();
    this.dataService = UnifiedDataService.getInstance();
    this.activeStrategies = new Map();
    this.predictionModels = new Map();
    this.initializeEventListeners();
  }

  static getInstance(): UnifiedBettingAnalytics {
    if (!UnifiedBettingAnalytics.instance) {
      UnifiedBettingAnalytics.instance = new UnifiedBettingAnalytics();
    }
    return UnifiedBettingAnalytics.instance;
  }

  private initializeEventListeners() {
    // Listen for real-time odds updates
    // @ts-expect-error: UnifiedDataService is EventEmitter
    this.dataService.on('ws:prizepicks:odds_update', (data: Record<string, unknown>) => {
      this.analyzeOddsMovement(data as { market: string; movement: number; significance: number });
    });

    // Listen for model updates
    // @ts-expect-error: UnifiedDataService is EventEmitter
    this.dataService.on('ws:odds_api:line_movement', (data: Record<string, unknown>) => {
      this.updatePredictions(data as { market: string; updates: Record<string, unknown> });
    });
  }

  private calculateKellyCriterion(probability: number, odds: number): number {
    const decimalOdds = odds;
    const q = 1 - probability;
    const b = decimalOdds - 1;
    const kelly = (probability * b - q) / b;
    return Math.max(0, Math.min(kelly, 0.1)); // Cap at 10% of bankroll
  }

  async analyzeBettingOpportunity(
    market: string,
    odds: number,
    stake: number
  ): Promise<BettingAnalysis> {
    try {
      // Fetch latest market data
      const marketData = await this.dataService.fetchData(
        DataSource.PRIZEPICKS,
        `/markets/${market}`
      );

      // Get prediction from model
      const prediction = await this.generatePrediction(market, (marketData as { data: Record<string, unknown> }).data);

      // Calculate optimal stake using Kelly Criterion
      const recommendedStake = this.calculateKellyCriterion(prediction.probability, odds);

      // Assess risk factors
      const riskFactors = this.assessRiskFactors((marketData as { data: Record<string, unknown> }).data, prediction);

      // Find hedging opportunities
      const hedging = await this.findHedgingOpportunities(market, odds);


      // Placeholder: risk_reasoning should be sourced from model/strategy or risk assessment
      // For now, derive a simple example from risk factors (replace with real source as needed)
      const risk_reasoning: string[] = riskFactors.length > 0
        ? riskFactors.map(f => `Reason: ${f}`)
        : ['No significant risk factors identified.'];

      const analysis: BettingAnalysis = {
        predictionConfidence: prediction.probability,
        recommendedStake: recommendedStake * stake,
        expectedValue: (prediction.probability * odds - 1) * stake,
        riskAssessment: {
          level: this.calculateRiskLevel(riskFactors),
          factors: riskFactors,
        },
        hedgingOpportunities: hedging,
        risk_reasoning,
      };

      this.emit('analysis_complete', analysis);
      return analysis;
    } catch (error) {
      this.emit('error', error);
      throw error;
    }
  }

  /**
   * Generate a prediction for a given market and data by calling the backend ML/analytics API.
   * Emits 'error' event on failure.
   */
  private async generatePrediction(
    market: string,
    data: Record<string, unknown>
  ): Promise<{ probability: number; confidence: number }> {
    // Real model integration: Call backend ML/analytics API
    try {
      const response = await fetch('/api/prediction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ market, data }),
      });
      if (!response.ok) {
        throw new Error(`Prediction API error: ${response.statusText}`);
      }
      const result = await response.json();
      return {
        probability: result.probability ?? 0,
        confidence: result.confidence ?? 0,
      };
    } catch (err) {
      if (typeof (this.emit) === 'function') {
        this.emit('error', err);
      }
      // Fallback: return neutral prediction
      return { probability: 0.5, confidence: 0.5 };
    }
  }

  private assessRiskFactors(marketData: Record<string, unknown>, prediction: { confidence: number }): string[] {
    const factors: string[] = [];
    // Market volatility check
    if ((marketData as { volatility?: number }).volatility && (marketData as { volatility: number }).volatility > 0.1) {
      factors.push('High market volatility');
    }
    // Prediction confidence check
    if (prediction.confidence < 0.7) {
      factors.push('Low prediction confidence');
    }
    // Time to event check
    if ((marketData as { timeToEvent?: number }).timeToEvent && (marketData as { timeToEvent: number }).timeToEvent < 3600) {
      factors.push('Close to event start');
    }
    return factors;
  }

  private calculateRiskLevel(factors: string[]): 'low' | 'medium' | 'high' {
    if (factors.length === 0) return 'low';
    if (factors.length <= 2) return 'medium';
    return 'high';
  }

  private async findHedgingOpportunities(
    market: string,
    originalOdds: number
  ): Promise<Array<{ market: string; odds: number; recommendedStake: number }>> {
    try {
      const relatedMarkets = await this.dataService.fetchData<{ data: Array<{ id: string; odds: number }> }>(
        DataSource.ODDS_API,
        `/related-markets/${market}`
      );
      const markets: Array<{ id: string; odds: number }> = relatedMarkets.data;

      return markets
        .filter((m: { id: string; odds: number }) => m.odds < originalOdds)
        .map((m: { id: string; odds: number }) => ({
          market: m.id,
          odds: m.odds,
          recommendedStake: this.calculateHedgeStake(originalOdds, m.odds),
        }));
    } catch (error) {
      this.emit('error', error);
      return [];
    }
  }

  private calculateHedgeStake(originalOdds: number, hedgeOdds: number): number {
    // Implement hedging stake calculation logic
    // For now, return 0. This can be replaced with a real formula.
    void originalOdds;
    void hedgeOdds;
    return 0;
  }

  private analyzeOddsMovement(data: { market: string; movement: number; significance: number }) {
    // Implement odds movement analysis
    if (typeof (this.emit) === 'function') {
      this.emit('odds_movement', {
        market: data.market,
        movement: data.movement,
        significance: data.significance,
      });
    }
  }

  private updatePredictions(data: { market: string; updates: Record<string, unknown> }) {
    // Update prediction models based on new data
    if (typeof (this.emit) === 'function') {
      this.emit('predictions_updated', {
        market: data.market,
        updates: data.updates,
      });
    }
  }

  // Strategy management methods
  addStrategy(strategy: BettingStrategy) {
    this.activeStrategies.set(strategy.id, strategy);
    if (typeof (this.emit) === 'function') {
      this.emit('strategy_added', strategy);
    }
  }

  removeStrategy(strategyId: string) {
    this.activeStrategies.delete(strategyId);
    if (typeof (this.emit) === 'function') {
      this.emit('strategy_removed', strategyId);
    }
  }

  // Prediction model management methods
  addPredictionModel(model: PredictionModel) {
    this.predictionModels.set(model.id, model);
    if (typeof (this.emit) === 'function') {
      this.emit('model_added', model);
    }
  }

  removePredictionModel(modelId: string) {
    this.predictionModels.delete(modelId);
    if (typeof (this.emit) === 'function') {
      this.emit('model_removed', modelId);
    }
  }

  async getBettingOpportunities(minConfidence: number = 0.7): Promise<BetRecommendation[]> {
    try {
      // Fetch all active markets
      const markets = await this.dataService.fetchData<{ data: MarketData[] }>(
        DataSource.PRIZEPICKS,
        '/markets/active'
      );
      // Filter and analyze opportunities
      const opportunities: BetRecommendation[] = [];
      for (const market of markets.data) {
        const prediction = await this.generatePrediction(market.id, market.data);
        if (prediction.probability >= minConfidence) {
          const analysis = await this.analyzeBettingOpportunity(
            market.id,
            market.odds,
            this.calculateKellyCriterion(prediction.probability, market.odds)
          );
          opportunities.push({
            id: market.id,
            market: market.name,
            odds: market.odds,
            prediction: prediction.probability,
            confidence: analysis.predictionConfidence,
            recommendedStake: analysis.recommendedStake,
            expectedValue: analysis.expectedValue,
            riskLevel: analysis.riskAssessment.level,
            riskFactors: analysis.riskAssessment.factors,
            hedgingOpportunities: analysis.hedgingOpportunities,
          });
        }
      }
      return opportunities;
    } catch (error) {
      if (typeof (this.emit) === 'function') {
        this.emit('error', error);
      }
      throw error;
    }
  }

  async getPerformanceMetrics() {
    try {
      const metrics = await this.dataService.fetchData<{
        data: {
          winRate: number;
          roi: number;
          edgeRetention: number;
          totalBets: number;
          averageOdds: number;
          profitLoss: number;
        };
      }>(DataSource.PRIZEPICKS, '/metrics/performance');
      return {
        winRate: metrics.data.winRate || 0,
        roi: metrics.data.roi || 0,
        edgeRetention: metrics.data.edgeRetention || 0,
        totalBets: metrics.data.totalBets || 0,
        averageOdds: metrics.data.averageOdds || 0,
        profitLoss: metrics.data.profitLoss || 0,
      };
    } catch (error) {
      if (typeof (this.emit) === 'function') {
        this.emit('error', error);
      }
      throw error;
    }
  }
}
