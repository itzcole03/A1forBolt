import { EventBus } from './EventBus.ts';
import { PerformanceMonitor } from './PerformanceMonitor.ts';
import { UnifiedConfigManager } from './UnifiedConfigManager.ts';
import { unifiedDataEngine } from './UnifiedDataEngine.ts';
import { unifiedMonitor } from './UnifiedMonitor.ts';
import { UnifiedPredictionEngine, PredictionFactor } from './UnifiedPredictionEngine.ts';
import {
  UnifiedPredictionService,
  PredictionResult,
} from '../services/unified/UnifiedPredictionService.ts';
import {
  StrategyRecommendation,
  AnalysisResult,
  RiskToleranceEnum,
  MarketUpdate,
  TimestampedData,
  BettingOpportunity,
  BetRecord,
} from '../types/core.ts';

interface PredictionContext {
  playerId: string;
  metric: string;
  timestamp: number;
}

interface ModelPrediction {
  value: number;
  confidence: number;
  factors: PredictionFactor[];
  analysis: {
    risk_factors: string[];
    meta_analysis: {
      market_efficiency: number;
      playerId: string;
      metric: string;
    };
  };
}

interface MarketState {
  value_gap: number;
  movement: 'stable' | 'trending' | 'significant';
  current_line: number;
}

export interface StrategyConfig {
  riskTolerance: number;
  maxExposure: number;
  minConfidence: number;
  hedgingEnabled: boolean;
  adaptiveStaking: boolean;
  profitTarget: number;
  stopLoss: number;
  confidenceThreshold: number;
  maxRiskPerBet: number;
  kellyMultiplier: number;
}

interface StrategyPerformance {
  wins: number;
  losses: number;
  totalBets: number;
  profitLoss: number;
  roi: number;
  lastUpdate: number;
}

interface RiskProfile {
  tolerance: RiskToleranceEnum;
  maxExposure: number;
  stopLoss: number;
  profitTarget: number;
  hedgingEnabled: boolean;
}

export interface StrategyMetrics {
  totalRecommendations: number;
  successfulRecommendations: number;
  averageConfidence: number;
  lastUpdate: number;
}

export interface RiskAssessment {
  riskScore: number;
  factors: string[];
  timestamp: number;
}

export interface StrategyContext {
  playerId: string;
  metric: string;
  timestamp: number;
  marketState: {
    line: number;
    volume: number;
    movement: 'up' | 'down' | 'stable';
  };
  predictionState: {
    value: number;
    confidence: number;
    factors: string[];
  };
}

export interface StrategyInput {
  id: string;
  prediction: {
    value: number;
    confidence: number;
    factors: PredictionFactor[];
    analysis: AnalysisResult;
  };
  weight: number;
}

export interface StrategyRecommendation {
  strategyId: string;
  type: 'OVER' | 'UNDER';
  confidence: number;
  expectedValue: number;
  riskAssessment: RiskAssessment;
  timestamp: number;
  success: boolean;
}

export class UnifiedStrategyEngine {
  private static instance: UnifiedStrategyEngine;
  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly dataEngine: UnifiedDataEngine;
  private readonly predictionEngine: UnifiedPredictionEngine;
  private readonly configManager: UnifiedConfigManager;
  private readonly monitor: UnifiedMonitor;
  private readonly predictionService: UnifiedPredictionService;
  private strategyConfig: StrategyConfig;
  private readonly performance: Map<string, StrategyPerformance>;
  private readonly riskProfiles: Map<string, RiskProfile>;
  private readonly activeStrategies: Map<string, StrategyRecommendation>;
  private readonly hedgingOpportunities: Map<string, string[]>;
  private readonly strategies: Map<
    string,
    (context: StrategyContext) => Promise<StrategyRecommendation>
  >;
  private readonly metrics: Map<string, StrategyMetrics>;
  private isInitialized: boolean = false;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.dataEngine = unifiedDataEngine;
    this.predictionEngine = UnifiedPredictionEngine.getInstance();
    this.configManager = UnifiedConfigManager.getInstance();
    this.monitor = unifiedMonitor;
    this.predictionService = new UnifiedPredictionService({
      minConfidence: 0.65,
      maxRiskPerBet: 0.05,
      bankrollPercentage: 0.02,
    });
    this.performance = new Map();
    this.riskProfiles = new Map();
    this.activeStrategies = new Map();
    this.hedgingOpportunities = new Map();
    this.strategies = new Map();
    this.metrics = new Map();

    this.strategyConfig = {
      riskTolerance: 0.5,
      maxExposure: 1000,
      minConfidence: 0.7,
      hedgingEnabled: false,
      adaptiveStaking: true,
      profitTarget: 0.1,
      stopLoss: 0.05,
      confidenceThreshold: 0.8,
      maxRiskPerBet: 0.05,
      kellyMultiplier: 1.0,
    };

    this.setupEventListeners();
    this.initializeStrategies();
  }

  public static getInstance(): UnifiedStrategyEngine {
    if (!UnifiedStrategyEngine.instance) {
      UnifiedStrategyEngine.instance = new UnifiedStrategyEngine();
    }
    return UnifiedStrategyEngine.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const traceId = this.performanceMonitor.startTrace('strategy-engine-init');
    try {
      // Load configuration
      const config = await this.configManager.getConfig();

      // Initialize strategy configuration
      this.strategyConfig = {
        ...this.strategyConfig,
        ...config.strategy,
      };

      this.isInitialized = true;
      this.performanceMonitor.endTrace(traceId);
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    this.eventBus.on('market:update', this.handleMarketUpdate.bind(this));
    this.eventBus.on('prediction:update', this.handlePredictionUpdate.bind(this));

    this.eventBus.on('data:updated', async ({ data }) => {
      try {
        const opportunities = await this.analyzeOpportunities(data);
        this.eventBus.emit('strategy:opportunities', { opportunities });
      } catch (error) {
        console.error('Error analyzing opportunities:', error);
      }
    });
  }

  private async handleMarketUpdate(update: MarketUpdate): Promise<void> {
    const traceId = this.performanceMonitor.startTrace('strategy-market-update');
    try {
      const context: StrategyContext = {
        playerId: update.data.playerId,
        metric: update.data.metric,
        timestamp: update.timestamp,
        marketState: {
          line: update.data.value,
          volume: update.data.volume || 0,
          movement: update.data.movement || 'stable',
        },
        predictionState: await this.getPredictionState(update.data.playerId, update.data.metric),
      };

      const recommendation = await this.generateRecommendation(context);
      this.eventBus.emit('strategy:recommendation', recommendation);

      this.performanceMonitor.endTrace(traceId);
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      this.monitor.reportError('strategy', error as Error);
    }
  }

  private async handlePredictionUpdate(update: BettingOpportunity): Promise<void> {
    const traceId = this.performanceMonitor.startTrace('strategy-prediction-update');
    try {
      const context: StrategyContext = {
        playerId: update.propId.split(':')[0],
        metric: update.propId.split(':')[1],
        timestamp: update.timestamp,
        marketState: update.marketState,
        predictionState: {
          value: update.expectedValue,
          confidence: update.confidence,
          factors: update.analysis.marketSignals.map(s => s.signal),
        },
      };

      const recommendation = await this.generateRecommendation(context);
      this.eventBus.emit('strategy:recommendation', recommendation);

      this.performanceMonitor.endTrace(traceId);
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      this.monitor.reportError('strategy', error as Error);
    }
  }

  private async generateRecommendation(context: StrategyContext): Promise<StrategyRecommendation> {
    const traceId = this.performanceMonitor.startTrace('generate-recommendation');

    try {
      // Execute all registered strategies
      const recommendations = await Promise.all(
        Array.from(this.strategies.entries()).map(async ([id, strategy]) => {
          const strategyTraceId = this.performanceMonitor.startTrace(`strategy-${id}`);
          try {
            const result = await strategy(context);
            this.updateMetrics(id, result);
            this.performanceMonitor.endTrace(strategyTraceId);
            return result;
          } catch (error) {
            this.performanceMonitor.endTrace(strategyTraceId, error as Error);
            return null;
          }
        })
      );

      // Filter out failed strategies and combine recommendations
      const validRecommendations = recommendations.filter(
        r => r !== null
      ) as StrategyRecommendation[];
      const combinedRecommendation = this.combineRecommendations(validRecommendations);

      this.performanceMonitor.endTrace(traceId);
      return combinedRecommendation;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  private async getPredictionState(
    playerId: string,
    metric: string
  ): Promise<StrategyContext['predictionState']> {
    const prediction = await this.predictionEngine.generatePrediction({
      playerId,
      metric,
      timestamp: Date.now(),
    });

    return {
      value: prediction.expectedValue,
      confidence: prediction.confidence,
      factors: prediction.analysis.marketSignals.map(s => s.signal),
    };
  }

  private async getMarketState(propId: string): Promise<StrategyContext['marketState']> {
    const marketData = await this.dataEngine.getMarketData(propId);
    return {
      line: marketData.line,
      volume: marketData.volume,
      movement: marketData.movement,
    };
  }

  private updateMetrics(strategyId: string, recommendation: StrategyRecommendation): void {
    const currentMetrics = this.metrics.get(strategyId) || {
      totalRecommendations: 0,
      successfulRecommendations: 0,
      averageConfidence: 0,
      lastUpdate: 0,
    };

    this.metrics.set(strategyId, {
      totalRecommendations: currentMetrics.totalRecommendations + 1,
      successfulRecommendations:
        currentMetrics.successfulRecommendations + (recommendation.success ? 1 : 0),
      averageConfidence:
        (currentMetrics.averageConfidence * currentMetrics.totalRecommendations +
          recommendation.confidence) /
        (currentMetrics.totalRecommendations + 1),
      lastUpdate: Date.now(),
    });
  }

  private combineRecommendations(
    recommendations: StrategyRecommendation[]
  ): StrategyRecommendation {
    if (recommendations.length === 0) {
      throw new Error('No valid recommendations to combine');
    }

    // Weight recommendations by strategy performance and confidence
    const weightedRecommendations = recommendations.map(rec => {
      const metrics = this.metrics.get(rec.strategyId);
      const successRate = metrics
        ? metrics.successfulRecommendations / metrics.totalRecommendations
        : 0.5;
      return {
        ...rec,
        weight: rec.confidence * successRate,
      };
    });

    const totalWeight = weightedRecommendations.reduce((sum, rec) => sum + rec.weight, 0);

    return {
      strategyId: 'combined',
      type: this.getMostCommonType(weightedRecommendations),
      confidence:
        weightedRecommendations.reduce((sum, rec) => sum + rec.confidence * rec.weight, 0) /
        totalWeight,
      expectedValue:
        weightedRecommendations.reduce((sum, rec) => sum + rec.expectedValue * rec.weight, 0) /
        totalWeight,
      riskAssessment: this.combineRiskAssessments(
        weightedRecommendations.map(r => r.riskAssessment)
      ),
      timestamp: Date.now(),
      success: false, // Will be updated when outcome is known
    };
  }

  private getMostCommonType(
    recommendations: Array<StrategyRecommendation & { weight: number }>
  ): 'OVER' | 'UNDER' {
    const typeWeights = recommendations.reduce(
      (acc, rec) => {
        acc[rec.type] = (acc[rec.type] || 0) + rec.weight;
        return acc;
      },
      {} as Record<'OVER' | 'UNDER', number>
    );

    return typeWeights.OVER > (typeWeights.UNDER || 0) ? 'OVER' : 'UNDER';
  }

  private combineRiskAssessments(assessments: RiskAssessment[]): RiskAssessment {
    const riskFactors = new Set<string>();
    let totalRiskScore = 0;

    assessments.forEach(assessment => {
      assessment.factors.forEach(factor => riskFactors.add(factor));
      totalRiskScore += assessment.riskScore;
    });

    return {
      riskScore: totalRiskScore / assessments.length,
      factors: Array.from(riskFactors),
      timestamp: Date.now(),
    };
  }

  private initializeStrategies(): void {
    // Register default strategies
    this.registerStrategy('momentum', async (context: StrategyContext) => {
      const momentum = this.calculateMomentum(context);
      return {
        strategyId: 'momentum',
        type: momentum > 0 ? 'OVER' : 'UNDER',
        confidence: Math.abs(momentum),
        expectedValue: context.marketState.line * (1 + momentum),
        riskAssessment: {
          riskScore: 1 - Math.abs(momentum),
          factors: ['market_momentum'],
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
        success: false,
      };
    });

    this.registerStrategy('value', async (context: StrategyContext) => {
      const edge =
        (context.predictionState.value - context.marketState.line) / context.marketState.line;
      return {
        strategyId: 'value',
        type: edge > 0 ? 'OVER' : 'UNDER',
        confidence: context.predictionState.confidence,
        expectedValue: context.predictionState.value,
        riskAssessment: {
          riskScore: 1 - context.predictionState.confidence,
          factors: ['prediction_edge'],
          timestamp: Date.now(),
        },
        timestamp: Date.now(),
        success: false,
      };
    });
  }

  private calculateMomentum(context: StrategyContext): number {
    switch (context.marketState.movement) {
      case 'up':
        return context.marketState.volume > 1000 ? 0.8 : 0.4;
      case 'down':
        return context.marketState.volume > 1000 ? -0.8 : -0.4;
      default:
        return 0;
    }
  }

  public registerStrategy(
    id: string,
    strategy: (context: StrategyContext) => Promise<StrategyRecommendation>
  ): void {
    if (this.strategies.has(id)) {
      throw new Error(`Strategy with ID ${id} is already registered`);
    }
    this.strategies.set(id, strategy);
  }

  public getMetrics(): Map<string, StrategyMetrics> {
    return new Map(this.metrics);
  }

  public async evaluateOpportunity(opportunity: BettingOpportunity): Promise<RiskAssessment> {
    const context: StrategyContext = {
      playerId: opportunity.propId.split(':')[0],
      metric: opportunity.propId.split(':')[1],
      timestamp: Date.now(),
      marketState: opportunity.marketState,
      predictionState: await this.getPredictionState(
        opportunity.propId.split(':')[0],
        opportunity.propId.split(':')[1]
      ),
    };

    const recommendation = await this.generateRecommendation(context);
    return recommendation.riskAssessment;
  }

  public async updatePerformance(bet: BetRecord): Promise<void> {
    const key = bet.id.split('_')[0];
    let performance = this.performance.get(key);

    if (!performance) {
      performance = {
        wins: 0,
        losses: 0,
        totalBets: 0,
        profitLoss: 0,
        roi: 0,
        lastUpdate: Date.now(),
      };
      this.performance.set(key, performance);
    }

    // Update performance metrics
    performance.totalBets++;
    if (bet.result === 'WIN') {
      performance.wins++;
      performance.profitLoss += bet.payout - bet.stake;
    } else {
      performance.losses++;
      performance.profitLoss -= bet.stake;
    }

    performance.roi = performance.profitLoss / (performance.totalBets * bet.stake);
    performance.lastUpdate = Date.now();

    // Emit performance update event
    this.eventBus.emit('metric:recorded', {
      name: 'strategy_performance',
      value: performance.roi,
      timestamp: Date.now(),
      labels: {
        strategy: key,
        wins: String(performance.wins),
        losses: String(performance.losses),
        profit_loss: String(performance.profitLoss),
      },
    });
  }

  public async analyzeOpportunities(data: DataPoint[]): Promise<BettingOpportunity[]> {
    const opportunities: BettingOpportunity[] = [];

    // Group props by game
    const propsByGame = this.groupPropsByGame(data);

    // Analyze single props
    for (const prop of data) {
      if (prop.type === 'prop') {
        const opportunity = await this.analyzeSingleProp(prop);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      }
    }

    // Analyze potential parlays
    for (const [, gameProps] of propsByGame) {
      const parlayOpportunities = await this.analyzeParlayOpportunities(gameProps);
      opportunities.push(...parlayOpportunities);
    }

    // Sort by expected value
    return opportunities.sort((a, b) => b.expectedValue - a.expectedValue);
  }

  private groupPropsByGame(data: DataPoint[]): Map<string, DataPoint[]> {
    const propsByGame = new Map<string, DataPoint[]>();

    for (const point of data) {
      if (point.type === 'prop' && point.metadata?.gameId) {
        const gameId = point.metadata.gameId;
        if (!propsByGame.has(gameId)) {
          propsByGame.set(gameId, []);
        }
        propsByGame.get(gameId)!.push(point);
      }
    }

    return propsByGame;
  }

  private async analyzeSingleProp(prop: DataPoint): Promise<BettingOpportunity | null> {
    const prediction = await this.predictionService.analyzeProp(
      prop.value,
      prop.metadata?.playerStats,
      prop.metadata?.gameDetails
    );

    if (prediction.confidence < this.strategyConfig.minConfidence) {
      return null;
    }

    const risk = this.calculateRiskLevel(prediction.confidence);
    const stake = this.calculateOptimalStake(prediction.confidence, risk);
    const expectedValue = this.calculateExpectedValue(prediction.confidence, prop.value.odds);

    return {
      id: `single_${prop.id}`,
      type: 'prop',
      confidence: prediction.confidence,
      expectedValue,
      risk,
      recommendedStake: stake,
      maxStake: this.calculateMaxStake(risk),
      props: [
        {
          id: prop.id,
          prediction,
          odds: prop.value.odds,
        },
      ],
    };
  }

  private async analyzeParlayOpportunities(props: DataPoint[]): Promise<BettingOpportunity[]> {
    const opportunities: BettingOpportunity[] = [];
    const maxLegs = 4; // Maximum number of legs in a parlay

    // Generate combinations of 2-4 legs
    for (let legs = 2; legs <= maxLegs; legs++) {
      const combinations = this.generateCombinations(props, legs);

      for (const combo of combinations) {
        const opportunity = await this.analyzeParlay(combo);
        if (opportunity) {
          opportunities.push(opportunity);
        }
      }
    }

    return opportunities;
  }

  private async analyzeParlay(props: DataPoint[]): Promise<BettingOpportunity | null> {
    const predictions = await Promise.all(
      props.map(prop =>
        this.predictionService.analyzeProp(
          prop.value,
          prop.metadata?.playerStats,
          prop.metadata?.gameDetails
        )
      )
    );

    // Calculate combined confidence
    const combinedConfidence = predictions.reduce((acc, pred) => acc * pred.confidence, 1);

    if (combinedConfidence < this.strategyConfig.minConfidence) {
      return null;
    }

    const risk = this.calculateRiskLevel(combinedConfidence);
    const stake = this.calculateOptimalStake(combinedConfidence, risk);

    // Calculate combined odds and expected value
    const combinedOdds = props.reduce((acc, prop) => acc * prop.value.odds, 1);
    const expectedValue = this.calculateExpectedValue(combinedConfidence, combinedOdds);

    return {
      id: `parlay_${props.map(p => p.id).join('_')}`,
      type: 'parlay',
      confidence: combinedConfidence,
      expectedValue,
      risk,
      recommendedStake: stake,
      maxStake: this.calculateMaxStake(risk),
      props: props.map((prop, i) => ({
        id: prop.id,
        prediction: predictions[i],
        odds: prop.value.odds,
      })),
    };
  }

  private calculateRiskLevel(confidence: number): 'low' | 'medium' | 'high' {
    if (confidence >= 0.8) return 'low';
    if (confidence >= 0.7) return 'medium';
    return 'high';
  }

  private calculateOptimalStake(confidence: number, risk: 'low' | 'medium' | 'high'): number {
    // Kelly Criterion calculation with risk adjustment
    const riskMultiplier = risk === 'low' ? 1 : risk === 'medium' ? 0.75 : 0.5;
    const kellyStake =
      (confidence - (1 - confidence)) * this.strategyConfig.kellyMultiplier * riskMultiplier;

    return Math.min(kellyStake, this.strategyConfig.maxRiskPerBet, this.calculateMaxStake(risk));
  }

  private calculateMaxStake(risk: 'low' | 'medium' | 'high'): number {
    const baseMax = this.strategyConfig.maxRiskPerBet;
    switch (risk) {
      case 'low':
        return baseMax;
      case 'medium':
        return baseMax * 0.75;
      case 'high':
        return baseMax * 0.5;
    }
  }

  private calculateExpectedValue(confidence: number, odds: number): number {
    return confidence * (odds - 1) - (1 - confidence);
  }

  private generateCombinations<T>(items: T[], size: number): T[][] {
    if (size === 0) return [[]];
    if (items.length === 0) return [];

    const first = items[0];
    const rest = items.slice(1);

    const combosWithoutFirst = this.generateCombinations(rest, size);
    const combosWithFirst = this.generateCombinations(rest, size - 1).map(combo => [
      first,
      ...combo,
    ]);

    return [...combosWithoutFirst, ...combosWithFirst];
  }

  public assessRisk(currentBets: BettingOpportunity[]): RiskAssessment {
    const currentExposure = currentBets.reduce((total, bet) => total + bet.recommendedStake, 0);

    const maxAllowedStake = Math.max(0, this.strategyConfig.maxExposure - currentExposure);

    const riskLevel = this.calculatePortfolioRisk(currentBets);
    const factors = this.identifyRiskFactors(currentBets, currentExposure);

    return {
      currentExposure,
      maxAllowedStake,
      riskLevel,
      factors,
    };
  }

  private calculatePortfolioRisk(bets: BettingOpportunity[]): 'low' | 'medium' | 'high' {
    const totalExposure = bets.reduce((sum, bet) => sum + bet.recommendedStake, 0);
    const exposureRatio = totalExposure / this.strategyConfig.maxExposure;

    if (exposureRatio >= 0.8) return 'high';
    if (exposureRatio >= 0.5) return 'medium';
    return 'low';
  }

  private identifyRiskFactors(bets: BettingOpportunity[], exposure: number): string[] {
    const factors: string[] = [];

    // Check exposure
    if (exposure > this.strategyConfig.maxExposure * 0.8) {
      factors.push('High total exposure');
    }

    // Check concentration
    const gameConcentration = new Map<string, number>();
    for (const bet of bets) {
      for (const prop of bet.props) {
        const gameId = prop.id.split('_')[0];
        gameConcentration.set(gameId, (gameConcentration.get(gameId) || 0) + bet.recommendedStake);
      }
    }

    const maxGameExposure = Math.max(...Array.from(gameConcentration.values()));
    if (maxGameExposure > this.strategyConfig.maxExposure * 0.4) {
      factors.push('High game concentration');
    }

    // Check correlation
    const correlatedBets = this.findCorrelatedBets(bets);
    if (correlatedBets.length > 0) {
      factors.push('Correlated bets detected');
    }

    return factors;
  }

  private findCorrelatedBets(bets: BettingOpportunity[]): [string, string][] {
    const correlated: [string, string][] = [];

    for (let i = 0; i < bets.length; i++) {
      for (let j = i + 1; j < bets.length; j++) {
        if (this.areCorrelated(bets[i], bets[j])) {
          correlated.push([bets[i].id, bets[j].id]);
        }
      }
    }

    return correlated;
  }

  private areCorrelated(bet1: BettingOpportunity, bet2: BettingOpportunity): boolean {
    // Check if bets are from the same game
    const game1 = new Set(bet1.props.map(p => p.id.split('_')[0]));
    const game2 = new Set(bet2.props.map(p => p.id.split('_')[0]));

    const sameGame = Array.from(game1).some(g => game2.has(g));
    if (!sameGame) return false;

    // Check if bets involve the same player
    const players1 = new Set(bet1.props.map(p => p.id.split('_')[1]));
    const players2 = new Set(bet2.props.map(p => p.id.split('_')[1]));

    return Array.from(players1).some(p => players2.has(p));
  }
}

function isMarketUpdate(payload: unknown): payload is MarketUpdate {
  if (!payload || typeof payload !== 'object') return false;
  const update = payload as MarketUpdate;
  return (
    typeof update.data.playerId === 'string' &&
    typeof update.data.metric === 'string' &&
    typeof update.data.value === 'number' &&
    typeof update.data.timestamp === 'number'
  );
}

function isStrategyRecommendation(payload: unknown): payload is StrategyRecommendation {
  if (!payload || typeof payload !== 'object') return false;
  const rec = payload as StrategyRecommendation;
  return (
    typeof rec.id === 'string' &&
    typeof rec.propId === 'string' &&
    typeof rec.confidence === 'number' &&
    typeof rec.expectedValue === 'number' &&
    Array.isArray(rec.analysis?.historicalTrends) &&
    Array.isArray(rec.analysis?.marketSignals) &&
    Array.isArray(rec.analysis?.riskFactors)
  );
}
