import axios from "axios";
import { toast } from "react-toastify";
import UnifiedPredictionService from "./predictionService";
import UnifiedBettingService from "./bettingService";
import type {
  BettingMetrics,
  ModelPerformance,
  BettingStats,
  LineMovement,
  ArbitrageOpportunity,
} from "../../types/betting";

interface AnalyticsConfig {
  autoRefresh: boolean;
  refreshInterval: number;
  metricsWindow: "day" | "week" | "month" | "year";
  includeArbitrage: boolean;
  includeLineMovement: boolean;
}

class UnifiedAnalyticsService {
  private static instance: UnifiedAnalyticsService | null = null;
  private readonly predictionService: UnifiedPredictionService;
  private readonly bettingService: UnifiedBettingService;
  private config: AnalyticsConfig = {
    autoRefresh: true,
    refreshInterval: 30000,
    metricsWindow: "week",
    includeArbitrage: true,
    includeLineMovement: true,
  };

  private readonly apiUrl: string;
  private metricsCache: Map<string, any> = new Map();
  private lastUpdate: number = 0;

  protected constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";
    this.predictionService = UnifiedPredictionService.getInstance();
    this.bettingService = UnifiedBettingService.getInstance();
  }

  public static getInstance(): UnifiedAnalyticsService {
    if (!UnifiedAnalyticsService.instance) {
      UnifiedAnalyticsService.instance = new UnifiedAnalyticsService();
    }
    return UnifiedAnalyticsService.instance;
  }

  public async getBettingMetrics(): Promise<BettingMetrics> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/analytics/metrics`, {
        params: { window: this.config.metricsWindow },
      });
      this.metricsCache.set("metrics", response.data);
      this.lastUpdate = Date.now();
      return response.data;
    } catch (error) {
      console.error("Error fetching betting metrics:", error);
      toast.error("Failed to fetch betting metrics");
      return this.metricsCache.get("metrics") || this.getDefaultMetrics();
    }
  }

  private getDefaultMetrics(): BettingMetrics {
    return {
      total_bets: 0,
      winning_bets: 0,
      losing_bets: 0,
      total_stake: 0,
      total_profit: 0,
      roi: 0,
      win_rate: 0,
      average_odds: 0,
      average_stake: 0,
      risk_score: 0,
      timestamp: new Date().toISOString(),
    };
  }

  public async getModelPerformance(): Promise<ModelPerformance[]> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/analytics/model-performance`,
      );
      this.metricsCache.set("modelPerformance", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching model performance:", error);
      return this.metricsCache.get("modelPerformance") || [];
    }
  }

  public async getBettingStats(): Promise<BettingStats> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/analytics/stats`, {
        params: { window: this.config.metricsWindow },
      });
      this.metricsCache.set("stats", response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching betting stats:", error);
      return this.metricsCache.get("stats") || this.getDefaultStats();
    }
  }

  private getDefaultStats(): BettingStats {
    return {
      total_bets: 0,
      win_rate: 0,
      average_odds: 0,
      total_profit: 0,
      roi: 0,
      best_performing_model: "",
      worst_performing_model: "",
      time_period: this.config.metricsWindow,
    };
  }

  public async getLineMovements(marketId: string): Promise<LineMovement[]> {
    if (!this.config.includeLineMovement) {
      return [];
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/api/analytics/line-movements`,
        {
          params: { market_id: marketId },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching line movements:", error);
      return [];
    }
  }

  public async getArbitrageOpportunities(): Promise<ArbitrageOpportunity[]> {
    if (!this.config.includeArbitrage) {
      return [];
    }

    try {
      const response = await axios.get(
        `${this.apiUrl}/api/analytics/arbitrage`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching arbitrage opportunities:", error);
      return [];
    }
  }

  public async getPerformanceBreakdown(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/analytics/performance-breakdown`,
        {
          params: { window: this.config.metricsWindow },
        },
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching performance breakdown:", error);
      return {
        bySport: {},
        byMarket: {},
        byTimeOfDay: {},
        byDayOfWeek: {},
      };
    }
  }

  public async getRiskAnalysis(): Promise<any> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/analytics/risk-analysis`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching risk analysis:", error);
      return {
        volatility: 0,
        sharpeRatio: 0,
        maxDrawdown: 0,
        valueAtRisk: 0,
        riskAdjustedReturn: 0,
      };
    }
  }

  public setConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.clearCache();
  }

  public getConfig(): AnalyticsConfig {
    return { ...this.config };
  }

  private clearCache(): void {
    this.metricsCache.clear();
    this.lastUpdate = 0;
  }

  public isCacheValid(): boolean {
    if (!this.lastUpdate) return false;
    return Date.now() - this.lastUpdate < this.config.refreshInterval;
  }

  public async refreshData(): Promise<void> {
    await Promise.all([
      this.getBettingMetrics(),
      this.getModelPerformance(),
      this.getBettingStats(),
      this.getPerformanceBreakdown(),
      this.getRiskAnalysis(),
    ]);
  }
}

export default UnifiedAnalyticsService;
