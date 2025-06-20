// Service for aggregating and providing historical performance data
import type { UserPerformanceHistory, ModelPerformanceHistory } from '../../types/history';

export class PerformanceHistoryService {
  private static instance: PerformanceHistoryService;
  private userHistories: Map<string, UserPerformanceHistory> = new Map();
  private modelHistories: Map<string, ModelPerformanceHistory> = new Map();

  private constructor() {}

  public static getInstance(): PerformanceHistoryService {
    if (!PerformanceHistoryService.instance) {
      PerformanceHistoryService.instance = new PerformanceHistoryService();
    }
    return PerformanceHistoryService.instance;
  }

  public getUserHistory(userId: string): UserPerformanceHistory | undefined {
    return this.userHistories.get(userId);
  }

  public getModelHistory(model: string, market: string): ModelPerformanceHistory | undefined {
    return this.modelHistories.get(`${model}:${market}`);
  }

  public addUserHistoryEntry(userId: string, entry: UserPerformanceHistory['entries'][0]): void {
    if (!this.userHistories.has(userId)) {
      this.userHistories.set(userId, { userId, entries: [] });
    }
    this.userHistories.get(userId)!.entries.push(entry);
  }

  public addModelHistoryEntry(model: string, market: string, entry: ModelPerformanceHistory['entries'][0]): void {
    const key = `${model}:${market}`;
    if (!this.modelHistories.has(key)) {
      this.modelHistories.set(key, { model, market, entries: [] });
    }
    this.modelHistories.get(key)!.entries.push(entry);
  }

  public getUserStats(userId: string) {
    const history = this.getUserHistory(userId);
    if (!history) return null;
    const wins = history.entries.filter(e => e.result === 'win').length;
    const losses = history.entries.filter(e => e.result === 'loss').length;
    const roi = history.entries.reduce((sum, e) => sum + e.payout - e.stake, 0) / (history.entries.reduce((sum, e) => sum + e.stake, 0) || 1);
    return { wins, losses, roi };
  }
}
