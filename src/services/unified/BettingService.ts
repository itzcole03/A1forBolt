
import axios from 'axios';
import { toast } from 'react-toastify';
import { WebSocketManager } from './WebSocketManager';
import {
  RiskProfileType,
  BettingMetrics,
  BettingHistoryEntry,
  BettingOpportunity,
  BetRecommendation,
} from '../../types/betting';

interface BettingConfig {
  minConfidence: number;
  maxStakePercentage: number;
  riskProfile: RiskProfileType;
  autoRefresh: boolean;
  refreshInterval: number;
}

class UnifiedBettingService {
  private static instance: UnifiedBettingService | null = null;
  private readonly wsService: WebSocketManager;
  private config: BettingConfig = {
    minConfidence: 0.7,
    maxStakePercentage: 0.1,
    riskProfile: RiskProfileType.MODERATE,
    autoRefresh: true,
    refreshInterval: 30000,
  };
  private readonly apiUrl: string;

  protected constructor() {
    this.apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.wsService = WebSocketManager.getInstance();
    this.initializeWebSocketHandlers();
  }

  public static getInstance(): UnifiedBettingService {
    if (!UnifiedBettingService.instance) {
      UnifiedBettingService.instance = new UnifiedBettingService();
    }
    return UnifiedBettingService.instance;
  }

  private initializeWebSocketHandlers(): void {
    this.wsService.on('odds_update', this.handleOddsUpdate.bind(this));
    this.wsService.on('betting_opportunities', this.handleBettingOpportunities.bind(this));
    this.wsService.on('bet_result', this.handleBetResult.bind(this));
  }

  private handleOddsUpdate(data: { odds: number }): void {
    this.emit('odds_update', data);
  }

  private handleBettingOpportunities(
    data: { opportunities: BettingOpportunity[] }
  ): void {
    const opportunities = this.validateBettingOpportunities(data.opportunities);
    this.emit('betting_opportunities', { opportunities });
  }

  private handleBetResult(data: { result: BettingMetrics }): void {
    this.updateBettingMetrics(data.result);
    this.emit('bet_result', data.result);
  }

  private validateBettingOpportunities(
    opportunities: BettingOpportunity[]
  ): BettingOpportunity[] {
    return opportunities.filter((opportunity) => {
      const confidence = this.calculateOpportunityConfidence(opportunity);
      return confidence >= this.config.minConfidence;
    });
  }

  private calculateOpportunityConfidence(
    opportunity: BettingOpportunity
  ): number {
    // Use only fields that exist on BettingOpportunity
    return opportunity.confidence;
  }

  private updateBettingMetrics(result: BettingMetrics): void {
    this.emit('metrics_update', this.calculateMetrics(result));
  }

  private calculateMetrics(result: BettingMetrics): BettingMetrics {
    return {
      ...result,
      totalBets: (result.totalBets ?? 0) + 1,
      winRate: this.calculateWinRate(result),
      averageOdds: this.calculateAverageOdds(result),
      roi: this.calculateROI(result),
    };
  }

  private calculateWinRate(result: BettingMetrics): number {
    const wins = result.winningBets ?? 0;
    const total = result.totalBets ?? 1;
    return total === 0 ? 0 : wins / total;
  }

  private calculateAverageOdds(result: BettingMetrics): number {
    return result.averageOdds ?? 0;
  }

  private calculateROI(result: BettingMetrics): number {
    const profit = result.totalProfit ?? 0;
    const totalStaked = result.totalStake ?? 1;
    return totalStaked === 0 ? 0 : (profit / totalStaked) * 100;
  }

  public async getBettingOpportunities(): Promise<BettingOpportunity[]> {
    try {
      const { data } = await axios.get(`${this.apiUrl}/api/betting/opportunities`) as { data: BettingOpportunity[] };
      return this.validateBettingOpportunities(data);
    } catch (error: unknown) {
      console.error('Error fetching betting opportunities:', error);
      toast.error('Failed to fetch betting opportunities');
      return [];
    }
  }

  public async placeBet(bet: BetRecommendation): Promise<boolean> {
    try {
      await axios.post(`${this.apiUrl}/api/betting/place`, bet);
      this.emit('bet_placed', bet);
      return true;
    } catch (error: unknown) {
      console.error('Error placing bet:', error);
      toast.error('Failed to place bet');
      return false;
    }
  }

  public async getBettingMetrics(): Promise<BettingMetrics> {
    try {
      const { data } = await axios.get(`${this.apiUrl}/api/betting/metrics`) as { data: BettingMetrics };
      return data;
    } catch (error: unknown) {
      console.error('Error fetching betting metrics:', error);
      return {
        totalBets: 0,
        winningBets: 0,
        losingBets: 0,
        totalStake: 0,
        totalProfit: 0,
        roi: 0,
        winRate: 0,
        averageOdds: 0,
        averageStake: 0,
        riskScore: 0,
        timestamp: new Date().toISOString(),
      };
    }
  }

  public async getBetHistory(): Promise<BettingHistoryEntry[]> {
    try {
      const { data } = await axios.get(`${this.apiUrl}/api/betting/history`) as { data: BettingHistoryEntry[] };
      return data;
    } catch (error: unknown) {
      console.error('Error fetching bet history:', error);
      return [];
    }
  }

  public setConfig(newConfig: Partial<BettingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.emit('config_updated', this.config);
  }

  public getConfig(): BettingConfig {
    return { ...this.config };
  }

  private emit(_type: string, _data: unknown): void {
    // No-op: implement as needed for your architecture.
  }

  public async get<T>(url: string): Promise<T> {
    try {
      const response = await axios.get(`${this.apiUrl}${url}`);
      return ((response as unknown) as { data: T }).data;
    } catch (error: unknown) {
      console.error(`Error fetching data from ${url}:`, error);
      toast.error(`Failed to fetch data from ${url}`);
      throw error;
    }
  }

  public async post<T>(url: string, data: unknown): Promise<T> {
    try {
      const response = await axios.post(`${this.apiUrl}${url}`, data);
      return ((response as unknown) as { data: T }).data;
    } catch (error: unknown) {
      toast.error(`Failed to post data to ${url}`);
      throw error;
    }
  }
}

export default UnifiedBettingService;
