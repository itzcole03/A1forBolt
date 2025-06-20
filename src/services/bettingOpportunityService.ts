import { EventEmitter } from 'events';
import { ArbitrageService } from './ArbitrageService';
import { LineShoppingService } from './lineShoppingService';
import { PredictionService } from './predictionService';
import { AdvancedPredictionService } from './advancedPredictionService';
import { MarketAnalysisService } from './marketAnalysisService';
import { NotificationManager, Notification } from './notification/notificationManager';
import {
  BettingOdds,
  ArbitrageOpportunity,
  LineShoppingResult,
  Sportsbook,
} from '../types/betting';
import { NotificationPreferences } from './notification/notificationManager';
import { MarketContext, BettingContext } from '../types/core';

interface VolumeData {
  totalVolume: number;
  lastUpdate: number;
  volumeHistory: Array<{ timestamp: number; volume: number }>;
}

interface MarketMetrics {
  volume: VolumeData;
  liquidity: number;
  volatility: number;
  trend: number;
}

export class BettingOpportunityService extends EventEmitter {
  private static instance: BettingOpportunityService;
  private arbitrageService: ArbitrageService;
  private lineShoppingService: LineShoppingService;
  private predictionService: PredictionService;
  private advancedPredictionService: AdvancedPredictionService;
  private marketAnalysisService: MarketAnalysisService;
  private notificationManager: NotificationManager;
  private isMonitoring: boolean = false;
  private marketMetrics: Map<string, MarketMetrics> = new Map();
  private readonly VOLUME_WINDOW = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly CLEANUP_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds

  private constructor() {
    super();
    this.arbitrageService = ArbitrageService.getInstance();
    this.lineShoppingService = new LineShoppingService();
    this.predictionService = PredictionService.getInstance();
    this.advancedPredictionService = AdvancedPredictionService.getInstance();
    this.marketAnalysisService = MarketAnalysisService.getInstance();
    this.notificationManager = new NotificationManager();

    // Set up event listeners
    this.arbitrageService.on('newOpportunity', this.handleArbitrageOpportunity.bind(this));
    this.lineShoppingService.on('oddsUpdated', this.handleOddsUpdate.bind(this));
    this.predictionService.on('newPrediction', this.handlePrediction.bind(this));
    this.advancedPredictionService.on(
      'newAdvancedPrediction',
      this.handleAdvancedPrediction.bind(this)
    );
    this.marketAnalysisService.on('marketAnomaly', this.handleMarketAnomaly.bind(this));
    this.marketAnalysisService.on('marketEfficiency', this.handleMarketEfficiency.bind(this));

    // Set up periodic cleanup
    setInterval(() => this.cleanup(), this.CLEANUP_INTERVAL);
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): BettingOpportunityService {
    if (!BettingOpportunityService.instance) {
      BettingOpportunityService.instance = new BettingOpportunityService();
    }
    return BettingOpportunityService.instance;
  }

  /**
   * Start monitoring for betting opportunities
   */
  public startMonitoring(): void {
    if (this.isMonitoring) {
      return;
    }

    this.isMonitoring = true;
    this.notificationManager.notifySystemAlert(
      'Monitoring Started',
      'Betting opportunity monitoring has been activated',
      'low'
    );
  }

  /**
   * Stop monitoring for betting opportunities
   */
  public stopMonitoring(): void {
    if (!this.isMonitoring) {
      return;
    }

    this.isMonitoring = false;
    this.notificationManager.notifySystemAlert(
      'Monitoring Stopped',
      'Betting opportunity monitoring has been deactivated',
      'low'
    );
  }

  /**
   * Handle new arbitrage opportunities
   */
  private handleArbitrageOpportunity(opportunity: ArbitrageOpportunity): void {
    if (!this.isMonitoring) {
      return;
    }

    this.notificationManager.notifyArbitrageOpportunity(opportunity);
    this.emit('arbitrageOpportunity', opportunity);
  }

  private updateMarketMetrics(eventId: string, odds: BettingOdds[]): void {
    const currentMetrics = this.marketMetrics.get(eventId) || {
      volume: {
        totalVolume: 0,
        lastUpdate: Date.now(),
        volumeHistory: [],
      },
      liquidity: 0,
      volatility: 0,
      trend: 0,
    };

    // Update volume
    const newVolume = odds.reduce((sum, odd) => sum + (odd.volume || 0), 0);
    currentMetrics.volume.totalVolume += newVolume;
    currentMetrics.volume.lastUpdate = Date.now();
    currentMetrics.volume.volumeHistory.push({
      timestamp: Date.now(),
      volume: newVolume,
    });

    // Calculate liquidity (based on odds spread and available stakes)
    const liquidity = this.calculateLiquidity(odds);
    currentMetrics.liquidity = liquidity;

    // Calculate volatility
    currentMetrics.volatility = this.calculateVolatility(currentMetrics.volume.volumeHistory);

    // Calculate trend
    currentMetrics.trend = this.calculateTrend(currentMetrics.volume.volumeHistory);

    this.marketMetrics.set(eventId, currentMetrics);
  }

  private calculateLiquidity(odds: BettingOdds[]): number {
    if (odds.length < 2) return 0;

    const bestBack = Math.max(...odds.map(o => o.odds));
    const bestLay = Math.min(...odds.map(o => o.odds));
    const spread = bestBack - bestLay;
    const totalStake = odds.reduce((sum, odd) => sum + (odd.maxStake || 0), 0);

    return totalStake / (spread || 1);
  }

  private calculateVolatility(volumeHistory: Array<{ timestamp: number; volume: number }>): number {
    if (volumeHistory.length < 2) return 0;

    const volumes = volumeHistory.map(v => v.volume);
    const mean = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length;
    const variance =
      volumes.reduce((sum, vol) => sum + Math.pow(vol - mean, 2), 0) / volumes.length;
    return Math.sqrt(variance);
  }

  private calculateTrend(volumeHistory: Array<{ timestamp: number; volume: number }>): number {
    if (volumeHistory.length < 2) return 0;

    const recentVolumes = volumeHistory.slice(-5);
    const xMean = (recentVolumes.length - 1) / 2;
    const yMean = recentVolumes.reduce((sum, v) => sum + v.volume, 0) / recentVolumes.length;

    let numerator = 0;
    let denominator = 0;

    recentVolumes.forEach((v, i) => {
      const xDiff = i - xMean;
      const yDiff = v.volume - yMean;
      numerator += xDiff * yDiff;
      denominator += xDiff * xDiff;
    });

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Handle odds updates from line shopping service
   */
  private handleOddsUpdate(data: { bookmakerId: string; odds: BettingOdds[] }): void {
    if (!this.isMonitoring) {
      return;
    }

    // Update market analysis
    this.marketAnalysisService.updateMarketMetrics(data.odds[0].eventId, data.odds);

    // Get market metrics and efficiency
    const metrics = this.marketAnalysisService.getMarketMetrics(data.odds[0].eventId);
    const efficiency = this.marketAnalysisService.getMarketEfficiency(data.odds[0].eventId);

    if (!metrics || !efficiency) return;

    // Update arbitrage service with new odds
    this.arbitrageService.monitorOpportunities(
      new Map([[data.bookmakerId, new Map([[data.odds[0].market, data.odds]])]])
    );

    // Check for line shopping opportunities with enhanced market context
    data.odds.forEach(odd => {
      const result = this.lineShoppingService.findBestOdds(odd.eventId, odd.market, odd.selection);

      if (result) {
        // Add market context to line shopping result
        result.marketContext = {
          volume: metrics.volume.totalVolume,
          movement: metrics.trend,
          liquidity: metrics.liquidity,
        };

        this.notificationManager.notifyLineShoppingOpportunity(result);
        this.emit('lineShoppingOpportunity', result);
      }
    });

    // Generate predictions with enhanced market context
    const marketContext: MarketContext = {
      eventId: data.odds[0].eventId,
      market: data.odds[0].market,
      timestamp: Date.now(),
      odds: data.odds,
      volume: metrics.volume.totalVolume,
      liquidity: metrics.liquidity,
    };

    const bettingContext: BettingContext = {
      playerId: 'system',
      propId: data.odds[0].eventId,
      odds: data.odds[0].odds,
      timestamp: Date.now(),
      marketContext: {
        volume: metrics.volume.totalVolume,
        movement: metrics.trend,
        liquidity: metrics.liquidity,
      },
      historicalContext: {
        recentPerformance: metrics.volume.volumeHistory.slice(-5).map(v => v.volume),
        trend: metrics.trend,
        volatility: metrics.volatility,
      },
    };

    // Generate both basic and advanced predictions
    this.predictionService.generatePrediction(marketContext, []);
    this.advancedPredictionService.generateAdvancedPrediction(marketContext, bettingContext);
  }

  private handlePrediction(prediction: any): void {
    if (!this.isMonitoring) {
      return;
    }

    this.notificationManager.notifyModelUpdate(
      `New prediction for ${prediction.propId}`,
      `Confidence: ${(prediction.confidence * 100).toFixed(1)}%`
    );
    this.emit('prediction', prediction);
  }

  private handleAdvancedPrediction(prediction: any): void {
    if (!this.isMonitoring) {
      return;
    }

    const message = [
      `Advanced prediction for ${prediction.basePrediction.propId}`,
      `Confidence: ${(prediction.confidence * 100).toFixed(1)}%`,
      `Expected Value: ${(prediction.expectedValue * 100).toFixed(1)}%`,
      `Risk Score: ${(prediction.riskAdjustedScore * 100).toFixed(1)}%`,
    ].join('\n');

    this.notificationManager.notifyModelUpdate('New Advanced Prediction', message);
    this.emit('advancedPrediction', prediction);
  }

  private handleMarketAnomaly(data: { eventId: string; anomalies: any[] }): void {
    if (!this.isMonitoring) return;

    data.anomalies.forEach(anomaly => {
      this.notificationManager.notifySystemAlert(
        'Market Anomaly Detected',
        `${anomaly.type.toUpperCase()} anomaly: ${anomaly.description}`,
        anomaly.severity
      );
    });

    this.emit('marketAnomaly', data);
  }

  private handleMarketEfficiency(data: { eventId: string; metrics: any }): void {
    if (!this.isMonitoring) return;

    // Only notify for significant efficiency changes
    if (data.metrics.spreadEfficiency < 0.8) {
      this.notificationManager.notifySystemAlert(
        'Low Market Efficiency',
        `Spread efficiency is below 80% for event ${data.eventId}`,
        'medium'
      );
    }

    this.emit('marketEfficiency', data);
  }

  /**
   * Register a sportsbook for line shopping
   */
  public registerSportsbook(sportsbook: Sportsbook): void {
    this.lineShoppingService.registerSportsbook(sportsbook);
  }

  /**
   * Update notification preferences
   */
  public updateNotificationPreferences(preferences: Partial<NotificationPreferences>): void {
    this.notificationManager.updatePreferences(preferences);
  }

  /**
   * Get all current notifications
   */
  public getNotifications(): Notification[] {
    return this.notificationManager.getNotifications();
  }

  /**
   * Mark notification as read
   */
  public markNotificationAsRead(notificationId: string): void {
    this.notificationManager.markAsRead(notificationId);
  }

  /**
   * Clear expired opportunities and notifications
   */
  public cleanup(): void {
    const now = Date.now();

    // Clean up expired market metrics
    for (const [eventId, metrics] of this.marketMetrics.entries()) {
      // Remove old volume history entries
      metrics.volume.volumeHistory = metrics.volume.volumeHistory.filter(
        v => now - v.timestamp < this.VOLUME_WINDOW
      );

      // Remove metrics for events with no recent updates
      if (now - metrics.volume.lastUpdate > this.VOLUME_WINDOW) {
        this.marketMetrics.delete(eventId);
      }
    }

    // Clean up other services
    this.arbitrageService.clearExpiredOpportunities();
    this.lineShoppingService.clearExpiredOdds();
    this.predictionService.clearPredictions();
  }

  /**
   * Get current monitoring status
   */
  public isActive(): boolean {
    return this.isMonitoring;
  }

  public getMarketMetrics(eventId: string): MarketMetrics | undefined {
    return this.marketMetrics.get(eventId);
  }
}
