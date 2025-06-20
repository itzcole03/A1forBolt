import EventEmitter from 'eventemitter3';
import { PredictionResult } from './UnifiedPredictionService';



export interface BetResult {
  propId: string;
  prediction: PredictionResult;
  actualValue: number;
  isWin: boolean;
  stakeAmount: number;
  profitLoss: number;
  timestamp: number;
}

export interface PerformanceMetrics {
  winRate: number;
  roi: number;
  totalBets: number;
  profitLoss: number;
  averageStake: number;
  streaks: {
    current: number;
    longest: number;
  };
  byConfidence: {
    [key: string]: {
      winRate: number;
      totalBets: number;
    };
  };
}

export interface SystemMetrics {
  apiLatency: number;
  predictionAccuracy: number;
  errorRate: number;
  processingTime: number;
}

export class PerformanceTrackingService extends EventEmitter {
  private betHistory: BetResult[] = [];
  private systemMetrics: SystemMetrics = {
    apiLatency: 0,
    predictionAccuracy: 0,
    errorRate: 0,
    processingTime: 0,
  };

  // User Performance Tracking
  public recordBetResult(result: BetResult): void {
    this.betHistory.push(result);
    this.emit('betRecorded', result);
    this.updateMetrics();
  }

  public getPerformanceMetrics(
    timeRange?: { start: number; end: number }
  ): PerformanceMetrics {
    let relevantBets = this.betHistory;
    if (timeRange) {
      relevantBets = this.betHistory.filter(
        bet =>
          bet.timestamp >= timeRange.start && bet.timestamp <= timeRange.end
      );
    }

    const metrics: PerformanceMetrics = {
      winRate: this.calculateWinRate(relevantBets),
      roi: this.calculateROI(relevantBets),
      totalBets: relevantBets.length,
      profitLoss: this.calculateTotalProfitLoss(relevantBets),
      averageStake: this.calculateAverageStake(relevantBets),
      streaks: this.calculateStreaks(relevantBets),
      byConfidence: this.calculateMetricsByConfidence(relevantBets),
    };

    return metrics;
  }

  // System Performance Tracking
  public updateSystemMetrics(metrics: Partial<SystemMetrics>): void {
    this.systemMetrics = { ...this.systemMetrics, ...metrics };
    this.emit('systemMetricsUpdated', this.systemMetrics);
  }

  public getSystemMetrics(): SystemMetrics {
    return this.systemMetrics;
  }

  // Private helper methods
  private calculateWinRate(bets: BetResult[]): number {
    if (bets.length === 0) return 0;
    const wins = bets.filter(bet => bet.isWin).length;
    return (wins / bets.length) * 100;
  }

  private calculateROI(bets: BetResult[]): number {
    if (bets.length === 0) return 0;
    const totalStake = bets.reduce((sum, bet) => sum + bet.stakeAmount, 0);
    const totalProfit = this.calculateTotalProfitLoss(bets);
    return (totalProfit / totalStake) * 100;
  }

  private calculateTotalProfitLoss(bets: BetResult[]): number {
    return bets.reduce((sum, bet) => sum + bet.profitLoss, 0);
  }

  private calculateAverageStake(bets: BetResult[]): number {
    if (bets.length === 0) return 0;
    const totalStake = bets.reduce((sum, bet) => sum + bet.stakeAmount, 0);
    return totalStake / bets.length;
  }

  private calculateStreaks(bets: BetResult[]): {
    current: number;
    longest: number;
  } {
    let current = 0;
    let longest = 0;
    let isWinStreak = false;

    bets.forEach((bet, index) => {
      if (index === 0) {
        current = 1;
        longest = 1;
        isWinStreak = bet.isWin;
      } else if (bet.isWin === isWinStreak) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
        isWinStreak = bet.isWin;
      }
    });

    return { current, longest };
  }

  private calculateMetricsByConfidence(
    bets: BetResult[]
  ): PerformanceMetrics['byConfidence'] {
    const confidenceBuckets: PerformanceMetrics['byConfidence'] = {};

    bets.forEach(bet => {
      const confidenceLevel = Math.floor(bet.prediction.confidence * 10) * 10;
      const key = `${confidenceLevel}-${confidenceLevel + 9}`;

      if (!confidenceBuckets[key]) {
        confidenceBuckets[key] = {
          winRate: 0,
          totalBets: 0,
        };
      }

      confidenceBuckets[key].totalBets++;
      if (bet.isWin) {
        confidenceBuckets[key].winRate =
          ((confidenceBuckets[key].winRate *
            (confidenceBuckets[key].totalBets - 1) +
            100) /
          confidenceBuckets[key].totalBets);
      }
    });

    return confidenceBuckets;
  }

  private updateMetrics(): void {
    const metrics = this.getPerformanceMetrics();
    this.emit('metricsUpdated', metrics);
  }
} 