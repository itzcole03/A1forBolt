import { BaseService } from './BaseService';
import { UnifiedServiceRegistry } from './UnifiedServiceRegistry';
import { UnifiedStateService } from './UnifiedStateService';
import { UnifiedBettingService } from './UnifiedBettingService';
import { UnifiedPredictionService } from './UnifiedPredictionService';
import { UnifiedErrorService } from './UnifiedErrorService';
import {
  PerformanceMetrics,
  TrendDelta,
  RiskProfile,
  ExplainabilityMap,
  ModelMetadata,
} from '../../types/analytics';

export interface RecentActivity {
  id: string;
  type: 'bet' | 'prediction' | 'opportunity';
  description: string;
  amount?: number;
  odds?: number;
  timestamp: number;
  status: 'success' | 'pending' | 'failed';
}

export class UnifiedAnalyticsService extends BaseService {
  private stateService: UnifiedStateService;
  private bettingService: UnifiedBettingService;
  private predictionService: UnifiedPredictionService;
  private errorService: UnifiedErrorService;

  constructor(registry: UnifiedServiceRegistry) {
    super('analytics', registry);
    this.stateService = registry.getService<UnifiedStateService>('state');
    this.bettingService = registry.getService<UnifiedBettingService>('betting');
    this.predictionService = registry.getService<UnifiedPredictionService>('prediction');
    this.errorService = registry.getService<UnifiedErrorService>('error');
  }

  // Renamed to avoid duplicate member error
  async getPerformanceMetricsApi(
    eventId: string,
    marketId: string,
    selectionId: string
  ): Promise<PerformanceMetrics> {
    const response = await this.api.get(`/analytics/performance`, {
      params: { eventId, marketId, selectionId },
    });
    return response.data;
  }

  async getTrendDelta(
    eventId: string,
    marketId: string,
    selectionId: string,
    period: 'day' | 'week' | 'month'
  ): Promise<TrendDelta> {
    const response = await this.api.get(`/analytics/trend`, {
      params: { eventId, marketId, selectionId, period },
    });
    return response.data;
  }

  async getRiskProfile(
    eventId: string,
    marketId: string,
    selectionId: string
  ): Promise<RiskProfile> {
    const response = await this.api.get(`/analytics/risk`, {
      params: { eventId, marketId, selectionId },
    });
    return response.data;
  }

  async getExplainabilityMap(
    eventId: string,
    marketId: string,
    selectionId: string
  ): Promise<ExplainabilityMap[]> {
    const response = await this.api.get(`/analytics/explainability`, {
      params: { eventId, marketId, selectionId },
    });
    return response.data;
  }

  async getModelMetadata(
    eventId: string,
    marketId: string,
    selectionId: string
  ): Promise<ModelMetadata> {
    const response = await this.api.get(`/analytics/model`, {
      params: { eventId, marketId, selectionId },
    });
    return response.data;
  }

  // Renamed to avoid duplicate member error
  async getRecentActivityApi(
    eventId: string,
    marketId: string,
    selectionId: string,
    limit: number = 10
  ): Promise<
    Array<{
      type: 'prediction' | 'bet' | 'alert';
      timestamp: string;
      data: any;
    }>
  > {
    const response = await this.api.get(`/analytics/activity`, {
      params: { eventId, marketId, selectionId, limit },
    });
    return response.data;
  }

  async getFeatureImportance(
    eventId: string,
    marketId: string,
    selectionId: string
  ): Promise<
    Array<{
      feature: string;
      importance: number;
      direction: 'positive' | 'negative';
    }>
  > {
    const response = await this.api.get(`/analytics/features`, {
      params: { eventId, marketId, selectionId },
    });
    return response.data;
  }

  async getConfidenceInterval(
    eventId: string,
    marketId: string,
    selectionId: string
  ): Promise<{
    lower: number;
    upper: number;
    confidence: number;
  }> {
    const response = await this.api.get(`/analytics/confidence`, {
      params: { eventId, marketId, selectionId },
    });
    return response.data;
  }

  async getModelPerformance(
    eventId: string,
    marketId: string,
    selectionId: string
  ): Promise<{
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
    confusionMatrix: number[][];
  }> {
    const response = await this.api.get(`/analytics/model-performance`, {
      params: { eventId, marketId, selectionId },
    });
    return response.data;
  }

  async getBettingStats(
    eventId: string,
    marketId: string,
    selectionId: string
  ): Promise<{
    totalBets: number;
    wonBets: number;
    lostBets: number;
    winRate: number;
    profitLoss: number;
    averageOdds: number;
    averageStake: number;
  }> {
    const response = await this.api.get(`/analytics/betting-stats`, {
      params: { eventId, marketId, selectionId },
    });
    return response.data;
  }

  async getMarketEfficiency(
    eventId: string,
    marketId: string,
    selectionId: string
  ): Promise<{
    efficiency: number;
    bias: number;
    volatility: number;
    liquidity: number;
  }> {
    const response = await this.api.get(`/analytics/market-efficiency`, {
      params: { eventId, marketId, selectionId },
    });
    return response.data;
  }

  async getPerformanceMetrics(
    timeRange: 'day' | 'week' | 'month' = 'week'
  ): Promise<PerformanceMetrics> {
    try {
      const [bets, predictions] = await Promise.all([
        this.bettingService.getBets(timeRange),
        this.predictionService.getPredictions(timeRange),
      ]);

      const totalBets = bets.length;
      const activeBets = bets.filter(bet => bet.status === 'active').length;
      const winRate = this.calculateWinRate(bets);
      const profitLoss = this.calculateProfitLoss(bets);
      const roi = this.calculateROI(bets);
      const { bestStreak, currentStreak } = this.calculateStreaks(bets);
      const averageOdds = this.calculateAverageOdds(bets);
      const averageStake = this.calculateAverageStake(bets);
      const totalPredictions = predictions.length;
      const predictionAccuracy = this.calculatePredictionAccuracy(predictions);
      const opportunities = this.calculateOpportunities(predictions);

      return {
        totalBets,
        activeBets,
        winRate,
        profitLoss,
        roi,
        bestStreak,
        currentStreak,
        averageOdds,
        averageStake,
        totalPredictions,
        predictionAccuracy,
        opportunities,
        timestamp: Date.now(),
      };
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'ANALYTICS_ERROR',
        source: 'UnifiedAnalyticsService',
        details: { method: 'getPerformanceMetrics', timeRange },
      });
      throw error;
    }
  }

  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    try {
      const [bets, predictions, opportunities] = await Promise.all([
        this.bettingService.getRecentBets(limit),
        this.predictionService.getRecentPredictions(limit),
        this.predictionService.getRecentOpportunities(limit),
      ]);

      const activities: RecentActivity[] = [
        ...bets.map(bet => ({
          id: bet.id,
          type: 'bet' as const,
          description: `Bet placed on ${bet.event}`,
          amount: bet.amount,
          odds: bet.odds,
          timestamp: bet.timestamp,
          status: bet.status,
        })),
        ...predictions.map(pred => ({
          id: pred.id,
          type: 'prediction' as const,
          description: `Prediction for ${pred.event}`,
          timestamp: pred.timestamp,
          status: pred.status,
        })),
        ...opportunities.map(opp => ({
          id: opp.id,
          type: 'opportunity' as const,
          description: `Opportunity detected for ${opp.event}`,
          timestamp: opp.timestamp,
          status: opp.status,
        })),
      ];

      return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
    } catch (error) {
      this.errorService.handleError(error, {
        code: 'ANALYTICS_ERROR',
        source: 'UnifiedAnalyticsService',
        details: { method: 'getRecentActivity', limit },
      });
      throw error;
    }
  }

  private calculateWinRate(bets: any[]): number {
    if (bets.length === 0) return 0;
    const wonBets = bets.filter(bet => bet.status === 'won').length;
    return (wonBets / bets.length) * 100;
  }

  private calculateProfitLoss(bets: any[]): number {
    return bets.reduce((total, bet) => {
      if (bet.status === 'won') {
        return total + (bet.amount * bet.odds - bet.amount);
      } else if (bet.status === 'lost') {
        return total - bet.amount;
      }
      return total;
    }, 0);
  }

  private calculateROI(bets: any[]): number {
    if (bets.length === 0) return 0;
    const totalStaked = bets.reduce((sum, bet) => sum + bet.amount, 0);
    const profitLoss = this.calculateProfitLoss(bets);
    return (profitLoss / totalStaked) * 100;
  }

  private calculateStreaks(bets: any[]): { bestStreak: number; currentStreak: number } {
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    bets.forEach(bet => {
      if (bet.status === 'won') {
        tempStreak++;
        currentStreak = tempStreak;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else if (bet.status === 'lost') {
        tempStreak = 0;
        currentStreak = 0;
      }
    });

    return { bestStreak, currentStreak };
  }

  private calculateAverageOdds(bets: any[]): number {
    if (bets.length === 0) return 0;
    const totalOdds = bets.reduce((sum, bet) => sum + bet.odds, 0);
    return totalOdds / bets.length;
  }

  private calculateAverageStake(bets: any[]): number {
    if (bets.length === 0) return 0;
    const totalStaked = bets.reduce((sum, bet) => sum + bet.amount, 0);
    return totalStaked / bets.length;
  }

  private calculatePredictionAccuracy(predictions: any[]): number {
    if (predictions.length === 0) return 0;
    const correctPredictions = predictions.filter(pred => pred.status === 'correct').length;
    return (correctPredictions / predictions.length) * 100;
  }

  private calculateOpportunities(predictions: any[]): number {
    return predictions.filter(pred => pred.status === 'opportunity').length;
  }
}
