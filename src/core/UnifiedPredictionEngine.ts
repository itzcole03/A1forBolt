import { AdvancedAnalysisEngine } from './AdvancedAnalysisEngine.ts';
import { AnalyticsService } from '../services/AnalyticsService.ts';
import { EventBus } from './EventBus.ts';
import { PerformanceMonitor } from './PerformanceMonitor.ts';
import { UnifiedConfigManager } from './UnifiedConfigManager.ts';

import { getPvPMatchupFeatures } from '../models/PvPMatchupModel.js';
import { getPlayerFormFeatures } from '../models/PlayerFormModel.js';
import { getVenueEffectFeatures } from '../models/VenueEffectModel.js';
import { getRefereeImpactFeatures } from '../models/RefereeImpactModel.js';
import { getLineupSynergyFeatures } from '../models/LineupSynergyModel.js';

import {
  TimestampedData,
  AnalysisResult as CoreAnalysisResult,
  BettingOpportunity,
  MarketUpdate,
  PredictionState,
} from '../types/core.ts';

export interface PredictionContext {
  playerId: string;
  metric: string;
  timestamp: number;
  marketState?: {
    line: number;
    volume: number;
    movement: 'up' | 'down' | 'stable';
  };
  historicalData?: TimestampedData[];
}

export interface PredictionFactor {
  name: string;
  weight: number;
  source: string;
  confidence: number;
}

export interface ModelPrediction {
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

export class UnifiedPredictionEngine {
  private static instance: UnifiedPredictionEngine;
  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly configManager: UnifiedConfigManager;
  private readonly advancedAnalysisEngine: AdvancedAnalysisEngine;
  private readonly analyticsService: AnalyticsService;
  private readonly models: Map<string, PredictionState>;
  private isInitialized: boolean = false;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.configManager = UnifiedConfigManager.getInstance();
    this.advancedAnalysisEngine = AdvancedAnalysisEngine.getInstance();
    this.analyticsService = AnalyticsService.getInstance();
    this.models = new Map();

    this.setupEventListeners();
  }

  public static getInstance(): UnifiedPredictionEngine {
    if (!UnifiedPredictionEngine.instance) {
      UnifiedPredictionEngine.instance = new UnifiedPredictionEngine();
    }
    return UnifiedPredictionEngine.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;

    const traceId = this.performanceMonitor.startTrace('prediction-engine-init');
    try {
      // Initialize prediction models
      await this.initializePredictionModels();

      this.isInitialized = true;
      this.performanceMonitor.endTrace(traceId);
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  public async generatePrediction(context: PredictionContext): Promise<BettingOpportunity> {
    const traceId = this.performanceMonitor.startTrace('generate-prediction');

    try {
      const config = await this.configManager.getConfig();
      const shapContext: any[] = [];
      const predictionInput = { ...context, features: {}, shapContext };

      // Use feature flags from config.features for model gating
      const features = config.features || {};
      if (features.enablePvPModel?.enabled && context.playerId && context.metric) {
        const playerA = context.playerId;
        const playerB = (context as any).opponentId || '';
        const sport = (context as any).sport || 'nba';
        try {
          const pvpResult = await getPvPMatchupFeatures(playerA, playerB, sport, context as any);
          predictionInput.features = { ...predictionInput.features, ...pvpResult.features };
          if (pvpResult.shapInsights?.length) shapContext.push(...pvpResult.shapInsights);
        } catch (err) {
          this.eventBus.emit('model:error', { model: 'PvPMatchupModel', error: err });
        }
      }
      if (features.enablePlayerFormModel?.enabled && context.playerId) {
        const sport = (context as any).sport || 'nba';
        try {
          const pfResult = await getPlayerFormFeatures(context.playerId, sport, context as any);
          predictionInput.features = { ...predictionInput.features, ...pfResult.features };
          if (pfResult.shapInsights?.length) shapContext.push(...pfResult.shapInsights);
        } catch (err) {
          this.eventBus.emit('model:error', { model: 'PlayerFormModel', error: err });
        }
      }
      if (features.enableVenueEffectModel?.enabled && (context as any).venueId) {
        const sport = (context as any).sport || 'nba';
        try {
          const venueResult = await getVenueEffectFeatures((context as any).venueId, sport, context as any);
          predictionInput.features = { ...predictionInput.features, ...venueResult.features };
          if (venueResult.shapInsights?.length) shapContext.push(...venueResult.shapInsights);
        } catch (err) {
          this.eventBus.emit('model:error', { model: 'VenueEffectModel', error: err });
        }
      }
      if (features.enableRefereeImpactModel?.enabled && (context as any).refereeId) {
        const sport = (context as any).sport || 'nba';
        try {
          const refResult = await getRefereeImpactFeatures((context as any).refereeId, sport, context as any);
          predictionInput.features = { ...predictionInput.features, ...refResult.features };
          if (refResult.shapInsights?.length) shapContext.push(...refResult.shapInsights);
        } catch (err) {
          this.eventBus.emit('model:error', { model: 'RefereeImpactModel', error: err });
        }
      }
      if (features.enableLineupSynergyModel?.enabled && Array.isArray((context as any).lineupIds)) {
        const sport = (context as any).sport || 'nba';
        try {
          const lineupResult = await getLineupSynergyFeatures((context as any).lineupIds, sport, context as any);
          predictionInput.features = { ...predictionInput.features, ...lineupResult.features };
          if (lineupResult.shapInsights?.length) shapContext.push(...lineupResult.shapInsights);
        } catch (err) {
          this.eventBus.emit('model:error', { model: 'LineupSynergyModel', error: err });
        }
      }
      // Get predictions from all models
      const modelPredictions = await this.getModelPredictions(predictionInput);

      // Filter out null predictions if any model failed
      const validModelPredictions = modelPredictions.filter(p => p.prediction !== null) as Array<{
        id: string;
        prediction: ModelPrediction;
        weight: number;
      }>;

      if (validModelPredictions.length === 0) {
        // Handle case where no models could generate a prediction
        this.performanceMonitor.endTrace(traceId, new Error('No valid model predictions generated.'));
        throw new Error('Failed to generate any model predictions.');
      }

      // Combine predictions using weighted ensemble
      const combinedPrediction = this.combineModelPredictions(validModelPredictions);

      // Generate analysis result
      const analysis = await this.generateAnalysis(predictionInput, validModelPredictions);

      // Create betting opportunity
      const opportunity: BettingOpportunity = {
        id: `opp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        propId: `${context.playerId}:${context.metric}`,
        type: combinedPrediction.value > (context.marketState?.line || 0) ? 'OVER' : 'UNDER',
        confidence: combinedPrediction.confidence,
        expectedValue: combinedPrediction.value,
        timestamp: Date.now(),
        marketState: context.marketState || {
          line: 0,
          volume: 0,
          movement: 'stable',
        },
        analysis: {
          historicalTrends: analysis.data.historicalTrends || [],
          marketSignals: analysis.data.marketSignals || [],
          riskFactors: combinedPrediction.analysis.risk_factors,
        },
      };

      // Emit prediction update event
      this.eventBus.emit('prediction:update', opportunity);

      this.performanceMonitor.endTrace(traceId);
      return opportunity;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  private async initializePredictionModels(): Promise<void> {
    // Initialize base models
    const baseModels = [
      {
        id: 'historical_trends',
        weight: 0.25,
        type: 'time_series',
      },
      {
        id: 'market_signals',
        weight: 0.25,
        type: 'market_analysis',
      },
      {
        id: 'player_performance',
        weight: 0.25,
        type: 'performance_analysis',
      },
      {
        id: 'espn_stats',
        weight: 0.2,
        type: 'espn',
      },
      {
        id: 'sportradar_stats',
        weight: 0.2,
        type: 'sportradar',
      },
    ];

    // Create prediction states for each model
    for (const model of baseModels) {
      this.models.set(model.id, {
        id: model.id,
        type: model.type,
        weight: model.weight,
        confidence: 0.7,
        lastUpdate: Date.now(),
        metadata: {
          predictions: 0,
          accuracy: 0,
          calibration: 0,
        },
      });
    }
  }

  public async getModelPredictions(
    context: PredictionContext
  ): Promise<Array<{ id: string; prediction: ModelPrediction | null; weight: number }>> {
    const predictions: Array<{ id: string; prediction: ModelPrediction | null; weight: number }> =
      [];

    for (const [modelId, model] of this.models) {
      const prediction = await this.generateModelPrediction(modelId, context);
      // We will push the prediction even if it's null, and handle filtering later
      predictions.push({
        id: modelId,
        prediction,
        weight: model.weight,
      });
    }

    return predictions;
  }

  private async generateModelPrediction(
    modelId: string,
    context: PredictionContext
  ): Promise<ModelPrediction | null> {
    try {
      const model = this.models.get(modelId);
      if (!model) return null;

      // Generate prediction based on model type
      switch (model.type) {
        case 'time_series':
          return this.generateTimeSeriesPrediction(context);
        case 'market_analysis':
          return this.generateMarketAnalysisPrediction(context);
        case 'performance_analysis':
          return this.generatePerformanceAnalysisPrediction(context);
        // Remove calls to non-existent ESPN and Sportradar prediction methods
        default:
          return null;
      }
    } catch (error) {
      return null;
    }
  }

  private combineModelPredictions(
    predictions: Array<{ id: string; prediction: ModelPrediction; weight: number }>
  ): ModelPrediction {
    const totalWeight = predictions.reduce((sum, p) => sum + p.weight, 0);
    if (totalWeight === 0) {
      return {
        value: 0,
        confidence: 0,
        factors: [],
        analysis: {
          risk_factors: ['No valid predictions to combine'],
          meta_analysis: { market_efficiency: 0, playerId: '', metric: '' },
        },
      };
    }
    const weightedValue =
      predictions.reduce((sum, p) => sum + p.prediction.value * p.weight, 0) / totalWeight;
    const weightedConfidence =
      predictions.reduce((sum, p) => sum + p.prediction.confidence * p.weight, 0) / totalWeight;

    // Combine risk factors
    const riskFactors = new Set<string>();
    predictions.forEach(p => p.prediction.analysis.risk_factors.forEach(rf => riskFactors.add(rf)));

    // Combine prediction factors
    const factors = predictions.flatMap(p =>
      p.prediction.factors.map(f => ({
        ...f,
        weight: f.weight * (p.weight / totalWeight),
      }))
    );

    return {
      value: weightedValue,
      confidence: weightedConfidence,
      factors,
      analysis: {
        risk_factors: Array.from(riskFactors),
        meta_analysis: {
          market_efficiency: predictions[0].prediction.analysis.meta_analysis.market_efficiency,
          playerId: predictions[0].prediction.analysis.meta_analysis.playerId,
          metric: predictions[0].prediction.analysis.meta_analysis.metric,
        },
      },
    };
  }

  private async generateAnalysis(
    context: PredictionContext,
    predictions: Array<{ id: string; prediction: ModelPrediction; weight: number }>
  ): Promise<CoreAnalysisResult> {
    const historicalTrends = await this.analyzeHistoricalTrends(context);
    const marketSignals = context.marketState ? this.analyzeMarketSignals(context.marketState) : [];

    // Ensure predictions array is not empty and totalWeight is not zero before division
    const totalWeight = predictions.reduce((sum, p) => sum + p.weight, 0);
    const confidence =
      totalWeight > 0
        ? predictions.reduce((sum, p) => sum + p.prediction.confidence * p.weight, 0) / totalWeight
        : 0;

    return {
      id: `analysis_${Date.now()}`,
      timestamp: Date.now(),
      confidence: confidence,
      risk_factors: Array.from(
        new Set(predictions.flatMap(p => p.prediction.analysis.risk_factors))
      ),
      data: {
        historicalTrends,
        marketSignals,
      },
    };
  }

  private async analyzeHistoricalTrends(
    context: PredictionContext
  ): Promise<Array<{ trend: string; strength: number }>> {
    if (!context.historicalData) return [];

    const trends: Array<{ trend: string; strength: number }> = [];
    const data = context.historicalData;

    // Calculate moving averages
    const shortMA = this.calculateMovingAverage(data, 5);
    const longMA = this.calculateMovingAverage(data, 20);

    // Detect trend
    if (shortMA > longMA) {
      trends.push({ trend: 'upward', strength: (shortMA - longMA) / longMA });
    } else {
      trends.push({ trend: 'downward', strength: (longMA - shortMA) / longMA });
    }

    return trends;
  }

  private analyzeMarketSignals(
    marketState: PredictionContext['marketState']
  ): Array<{ signal: string; strength: number }> {
    if (!marketState) return [];

    const signals: Array<{ signal: string; strength: number }> = [];

    // Analyze line movement
    if (marketState.movement === 'up') {
      signals.push({ signal: 'line_movement_up', strength: 0.7 });
    } else if (marketState.movement === 'down') {
      signals.push({ signal: 'line_movement_down', strength: 0.7 });
    }

    // Analyze volume
    if (marketState.volume > 1000) {
      signals.push({ signal: 'high_volume', strength: 0.8 });
    }

    return signals;
  }

  private calculateMovingAverage(data: TimestampedData[], period: number): number {
    if (!data || data.length < period) return 0;
    const values = data.slice(-period).map(d => d.value ?? 0);
    return values.reduce((sum, val) => (sum ?? 0) + (val ?? 0), 0) / period;
  }

  private setupEventListeners(): void {
    // Use a type assertion to fix eventBus.on signature for market:update
    this.eventBus.on('market:update', (update: unknown) => {
      const marketUpdate = update as MarketUpdate;
      (async () => {
        try {
          const context: PredictionContext = {
            playerId: marketUpdate.data.playerId,
            metric: marketUpdate.data.metric,
            timestamp: marketUpdate.timestamp,
            marketState: {
              line: marketUpdate.data.value,
              volume: marketUpdate.data.volume || 0,
              movement: marketUpdate.data.movement || 'stable',
            },
          };
          await this.generatePrediction(context);
        } catch (error) {
          // No trace for string, just log error
          // this.performanceMonitor.endTrace('market:update', error as Error);
        }
      })();
    });
  }

  private async generateTimeSeriesPrediction(
    context: PredictionContext
  ): Promise<ModelPrediction | null> {
    try {
      const timeSeriesData = this.analyticsService.getTimeSeriesData('1d');
      if (!timeSeriesData || timeSeriesData.length === 0) {
        return {
          value: 0,
          confidence: 0.1,
          factors: [
            { name: 'no_historical_data', weight: 1, source: 'time_series', confidence: 0.1 },
          ],
          analysis: {
            risk_factors: ['insufficient_data_for_time_series'],
            meta_analysis: {
              market_efficiency: 0.5,
              playerId: context.playerId,
              metric: context.metric,
            },
          },
        };
      }

      const recentData = timeSeriesData.slice(-5);
      const averageProfitLoss =
        recentData.reduce((sum, dp) => sum + dp.metrics.profitLoss, 0) / recentData.length;
      const trendValue = averageProfitLoss > 0 ? 1 : -1;

      const predictedValue = context.marketState
        ? context.marketState.line * (1 + trendValue * 0.05)
        : 50 + trendValue * 5;

      return {
        value: predictedValue,
        confidence: 0.6,
        factors: [
          {
            name: 'historical_trend_simplified',
            weight: 1,
            source: 'time_series_analytics_service',
            confidence: 0.6,
          },
        ],
        analysis: {
          risk_factors: ['time_series_model_simplicity', 'data_granularity'],
          meta_analysis: {
            market_efficiency: 0.7,
            playerId: context.playerId,
            metric: context.metric,
          },
        },
      };
    } catch (error) {
      return null;
    }
  }

  private async generateMarketAnalysisPrediction(
    context: PredictionContext
  ): Promise<ModelPrediction | null> {
    try {
      const playerAnalysis = await this.advancedAnalysisEngine.analyzePlayer(context.playerId);
      if (!playerAnalysis || !playerAnalysis.meta_analysis) {
        return {
          value: context.marketState?.line || 0,
          confidence: 0.2,
          factors: [
            {
              name: 'no_advanced_market_analysis',
              weight: 1,
              source: 'market_analysis',
              confidence: 0.2,
            },
          ],
          analysis: {
            risk_factors: ['advanced_analysis_unavailable'],
            meta_analysis: {
              market_efficiency: 0.5,
              playerId: context.playerId,
              metric: context.metric,
            },
          },
        };
      }

      const marketEfficiency = playerAnalysis.meta_analysis.market_efficiency || 0.5;
      const valueAdjustmentFactor = (marketEfficiency - 0.5) * 0.1;
      const predictedValue = (context.marketState?.line || 50) * (1 + valueAdjustmentFactor);

      return {
        value: predictedValue,
        confidence: playerAnalysis.meta_analysis.prediction_stability || 0.65,
        factors: [
          {
            name: 'market_efficiency_factor',
            weight: 0.7,
            source: 'advanced_market_analysis',
            confidence: marketEfficiency,
          },
          {
            name: 'prediction_stability_factor',
            weight: 0.3,
            source: 'advanced_market_analysis',
            confidence: playerAnalysis.meta_analysis.prediction_stability || 0.5,
          },
        ],
        analysis: {
          risk_factors: [
            'market_volatility_proxy',
            ...(playerAnalysis.risks && Object.keys(playerAnalysis.risks).length > 0
              ? Object.values(playerAnalysis.risks).flatMap(r => r.factors)
              : ['unknown_market_risks']),
          ],
          meta_analysis: {
            market_efficiency: marketEfficiency,
            playerId: context.playerId,
            metric: context.metric,
          },
        },
      };
    } catch (error) {
      return null;
    }
  }

  private async generatePerformanceAnalysisPrediction(
    context: PredictionContext
  ): Promise<ModelPrediction | null> {
    try {
      const playerAnalysis = await this.advancedAnalysisEngine.analyzePlayer(context.playerId);

      if (!playerAnalysis || !playerAnalysis.predictions[context.metric]) {
        return {
          value: 0,
          confidence: 0.2,
          factors: [
            {
              name: 'no_player_specific_prediction',
              weight: 1,
              source: 'performance_analysis',
              confidence: 0.2,
            },
          ],
          analysis: {
            risk_factors: ['player_analysis_unavailable_for_metric'],
            meta_analysis: {
              market_efficiency: 0.5,
              playerId: context.playerId,
              metric: context.metric,
            },
          },
        };
      }

      const metricPrediction = playerAnalysis.predictions[context.metric];

      return {
        value: metricPrediction.value,
        confidence: metricPrediction.confidence,
        factors: metricPrediction.factors.map(f => ({
          name: f.type,
          weight: f.impact,
          source: 'advanced_performance_analysis',
          confidence: metricPrediction.confidence,
        })),
        analysis: {
          risk_factors:
            playerAnalysis.risks && Object.keys(playerAnalysis.risks).length > 0
              ? Object.values(playerAnalysis.risks).flatMap(r => r.factors)
              : ['general_performance_variance'],
          meta_analysis: {
            market_efficiency: playerAnalysis.meta_analysis.market_efficiency || 0.7,
            playerId: context.playerId,
            metric: context.metric,
          },
        },
      };
    } catch (error) {
      return null;
    }
  }
}
