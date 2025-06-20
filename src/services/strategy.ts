import { apiService } from './api';
import { StrategyRecommendation, BettingDecision, BetRecord } from '@/types/core';

class StrategyService {
  private static instance: StrategyService;
  private activeStrategies: Map<string, StrategyRecommendation> = new Map();

  private constructor() {}

  static getInstance(): StrategyService {
    if (!StrategyService.instance) {
      StrategyService.instance = new StrategyService();
    }
    return StrategyService.instance;
  }

  async getStrategies(): Promise<StrategyRecommendation[]> {
    try {
      const response = await apiService.getStrategies();
      return response;
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
      throw error;
    }
  }

  async analyzeStrategy(strategyId: string): Promise<StrategyRecommendation> {
    try {
      const response = await apiService.analyzeStrategy(strategyId);
      return response;
    } catch (error) {
      console.error('Failed to analyze strategy:', error);
      throw error;
    }
  }

  async executeStrategy(strategyId: string): Promise<BettingDecision[]> {
    try {
      const response = await apiService.executeStrategy(strategyId);
      return response;
    } catch (error) {
      console.error('Failed to execute strategy:', error);
      throw error;
    }
  }

  async getStrategyPerformance(strategyId: string): Promise<{
    winRate: number;
    profitLoss: number;
    roi: number;
    totalBets: number;
  }> {
    try {
      const response = await apiService.getStrategyPerformance(strategyId);
      return response;
    } catch (error) {
      console.error('Failed to fetch strategy performance:', error);
      throw error;
    }
  }

  async getStrategyHistory(strategyId: string): Promise<BetRecord[]> {
    try {
      const response = await apiService.getStrategyHistory(strategyId);
      return response;
    } catch (error) {
      console.error('Failed to fetch strategy history:', error);
      throw error;
    }
  }

  activateStrategy(strategy: StrategyRecommendation): void {
    this.activeStrategies.set(strategy.id, strategy);
  }

  deactivateStrategy(strategyId: string): void {
    this.activeStrategies.delete(strategyId);
  }

  getActiveStrategies(): StrategyRecommendation[] {
    return Array.from(this.activeStrategies.values());
  }

  isStrategyActive(strategyId: string): boolean {
    return this.activeStrategies.has(strategyId);
  }

  async updateStrategySettings(strategyId: string, settings: any): Promise<void> {
    try {
      await apiService.updateStrategySettings(strategyId, settings);
    } catch (error) {
      console.error('Failed to update strategy settings:', error);
      throw error;
    }
  }

  async getStrategyRecommendations(): Promise<StrategyRecommendation[]> {
    try {
      const response = await apiService.getStrategyRecommendations();
      return response;
    } catch (error) {
      console.error('Failed to fetch strategy recommendations:', error);
      throw error;
    }
  }
}

export const strategyService = StrategyService.getInstance();
export default strategyService;
