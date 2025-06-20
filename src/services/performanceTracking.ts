import { BookOdds, BettingOpportunity } from './bettingStrategy';

export interface BetRecord {
  id: string;
  sportId: string;
  gameId: string;
  market: string;
  placedOdds: number;
  closingOdds: number;
  stake: number;
  result: 'WIN' | 'LOSS' | 'PUSH' | 'PENDING';
  timestamp: number;
  book: string;
  metadata: {
    line?: number;
    closingLine?: number;
    predictionConfidence?: number;
    tags?: string[];
  };
}

export interface BetResult {
  id: string;
  opportunityId: string;
  market: string;
  placedOdds: number;
  closingOdds: number;
  stake: number;
  result: 'WIN' | 'LOSS' | 'PUSH';
  payout: number;
  timestamp: number;
  metadata: {
    type: BettingOpportunity['type'];
    books: string[];
    clv?: number;
    edgeRetention?: number;
  };
}

export interface PerformanceMetrics {
  totalBets: number;
  winRate: number;
  roi: number;
  clvAverage: number;
  edgeRetention: number;
  kellyMultiplier: number;
  marketEfficiencyScore: number;
  profitByStrategy: Record<BettingOpportunity['type'], number>;
  variance: number;
  sharpeRatio: number;
  averageClv: number;
  sharpnessScore: number;
}

export interface ClvAnalysis {
  clvValue: number;
  edgeRetained: number;
  marketEfficiency: number;
  timeValue: number;
  factors: {
    name: string;
    impact: number;
    description: string;
  }[];
}

export class PerformanceTrackingService {
  private static instance: PerformanceTrackingService;
  private betHistory: BetResult[];
  private readonly RISK_FREE_RATE = 0.02; // 2% annual risk-free rate
  private readonly CACHE_DURATION = 1000 * 60 * 5; // 5 minutes
  private metricsCache: Map<string, { metrics: PerformanceMetrics; timestamp: number }> = new Map();
  private readonly MAX_HISTORY_SIZE = 10000;

  private constructor() {
    this.betHistory = [];
  }

  static getInstance(): PerformanceTrackingService {
    if (!PerformanceTrackingService.instance) {
      PerformanceTrackingService.instance = new PerformanceTrackingService();
    }
    return PerformanceTrackingService.instance;
  }

  public addBetResult(result: BetResult): void {
    this.betHistory.unshift(result);
    if (this.betHistory.length > this.MAX_HISTORY_SIZE) {
      this.betHistory = this.betHistory.slice(0, this.MAX_HISTORY_SIZE);
    }
    this.metricsCache.clear(); // Invalidate cache when new data is added
  }

  public getPerformanceMetrics(timeframe?: { start: number; end: number }): PerformanceMetrics {
    const cacheKey = timeframe ? `${timeframe.start}-${timeframe.end}` : 'all';
    const cached = this.metricsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.metrics;
    }

    const filteredBets = timeframe
      ? this.betHistory.filter(
          bet => bet.timestamp >= timeframe.start && bet.timestamp <= timeframe.end
        )
      : this.betHistory;

    const metrics = {
      totalBets: filteredBets.length,
      winRate: this.calculateWinRate(filteredBets),
      roi: this.calculateROI(filteredBets),
      clvAverage: this.calculateAverageClv(filteredBets),
      edgeRetention: this.calculateAverageEdgeRetention(filteredBets),
      kellyMultiplier: this.calculateOptimalKellyMultiplier(filteredBets),
      marketEfficiencyScore: this.calculateMarketEfficiencyScore(filteredBets),
      profitByStrategy: this.calculateProfitByStrategy(filteredBets),
      variance: this.calculateVariance(filteredBets),
      sharpeRatio: this.calculateSharpeRatio(filteredBets, this.calculateROI(filteredBets)),
      averageClv: this.calculateAverageClv(filteredBets),
      sharpnessScore: this.calculateSharpnessScore(filteredBets),
    };

    this.metricsCache.set(cacheKey, { metrics, timestamp: Date.now() });
    return metrics;
  }

  private calculateWinRate(bets: BetResult[]): number {
    if (bets.length === 0) return 0;
    const wins = bets.filter(bet => bet.result === 'WIN').length;
    return wins / bets.length;
  }

  private calculateROI(bets: BetResult[]): number {
    if (bets.length === 0) return 0;
    const totalStake = bets.reduce((sum, bet) => sum + bet.stake, 0);
    const totalReturn = bets.reduce((sum, bet) => sum + (bet.result === 'WIN' ? bet.payout : 0), 0);
    return (totalReturn - totalStake) / totalStake;
  }

  private calculateAverageEdgeRetention(bets: BetResult[]): number {
    if (bets.length === 0) return 0;
    const edgeRetentions = bets
      .map(bet => bet.metadata.edgeRetention ?? 0)
      .filter(edge => edge !== 0);
    return edgeRetentions.length > 0
      ? edgeRetentions.reduce((sum, edge) => sum + edge, 0) / edgeRetentions.length
      : 0;
  }

  private calculateOptimalKellyMultiplier(bets: BetResult[]): number {
    const winRate = this.calculateWinRate(bets);
    const avgWinOdds =
      bets.filter(bet => bet.result === 'WIN').reduce((sum, bet) => sum + bet.placedOdds, 0) /
      (bets.filter(bet => bet.result === 'WIN').length || 1);

    // Kelly Criterion calculation with safety factor
    const edge = winRate * avgWinOdds - 1;
    const variance = this.calculateVariance(bets);
    const safetyFactor = Math.min(1, 1 / (1 + variance));

    return Math.max(0, Math.min(1, (edge / avgWinOdds) * safetyFactor));
  }

  private getEmptyMetrics(): PerformanceMetrics {
    return {
      totalBets: 0,
      winRate: 0,
      roi: 0,
      clvAverage: 0,
      edgeRetention: 0,
      kellyMultiplier: 0,
      marketEfficiencyScore: 0,
      profitByStrategy: {
        ARBITRAGE: 0,
        MIDDLE: 0,
        LINE_VALUE: 0,
      },
      variance: 0,
      sharpeRatio: 0,
      averageClv: 0,
      sharpnessScore: 0,
    };
  }

  private calculateProfitByStrategy(bets: BetResult[]): Record<BettingOpportunity['type'], number> {
    const initial: Record<BettingOpportunity['type'], number> = {
      ARBITRAGE: 0,
      MIDDLE: 0,
      LINE_VALUE: 0,
    };

    return bets.reduce((acc, bet) => {
      const profit = bet.payout - bet.stake;
      acc[bet.metadata.type] += profit;
      return acc;
    }, initial);
  }

  private calculateVariance(bets: BetResult[]): number {
    const returns = bets.map(bet => (bet.payout - bet.stake) / bet.stake);
    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length;

    return returns.reduce((sum, ret) => sum + Math.pow(ret - mean, 2), 0) / returns.length;
  }

  private calculateSharpeRatio(bets: BetResult[], roi: number): number {
    if (bets.length < 2) return 0;

    const variance = this.calculateVariance(bets);
    const excessReturn = roi / 100 - this.RISK_FREE_RATE;

    return variance === 0 ? 0 : excessReturn / Math.sqrt(variance);
  }

  private calculateAverageClv(bets: BetResult[]): number {
    const clvValues = bets
      .filter(bet => bet.metadata.clv !== undefined)
      .map(bet => bet.metadata.clv!);
    return clvValues.length > 0
      ? clvValues.reduce((sum, clv) => sum + clv, 0) / clvValues.length
      : 0;
  }

  private calculateMarketEfficiencyScore(bets: BetResult[]): number {
    if (bets.length === 0) return 0;

    const clvScores = bets
      .filter(bet => bet.metadata.clv !== undefined)
      .map(bet => Math.abs(bet.metadata.clv!));

    if (clvScores.length === 0) return 0;

    const avgAbsoluteCLV = clvScores.reduce((sum, clv) => sum + clv, 0) / clvScores.length;
    return Math.max(0, 100 - avgAbsoluteCLV * 10); // Higher score means more efficient market
  }

  private calculateSharpnessScore(bets: BetResult[]): number {
    const clv = this.calculateAverageClv(bets);
    const wins = bets.filter(bet => bet.result === 'WIN').length;
    const winRate = wins / bets.length;

    // Weighted combination of CLV and win rate
    return clv * 0.6 + winRate * 0.4;
  }

  public getBetHistory(filters?: {
    type?: BettingOpportunity['type'];
    market?: string;
    timeframe?: { start: number; end: number };
  }): BetResult[] {
    let filteredBets = this.betHistory;

    if (filters?.type) {
      filteredBets = filteredBets.filter(bet => bet.metadata.type === filters.type);
    }

    if (filters?.market) {
      filteredBets = filteredBets.filter(bet => bet.market === filters.market);
    }

    if (filters?.timeframe) {
      filteredBets = filteredBets.filter(
        bet => bet.timestamp >= filters.timeframe!.start && bet.timestamp <= filters.timeframe!.end
      );
    }

    return filteredBets;
  }

  public calculateCLV(placedOdds: number, closingOdds: number): number {
    const placedDecimal = this.americanToDecimal(placedOdds);
    const closingDecimal = this.americanToDecimal(closingOdds);

    return ((placedDecimal - closingDecimal) / closingDecimal) * 100;
  }

  private americanToDecimal(americanOdds: number): number {
    if (americanOdds > 0) {
      return americanOdds / 100 + 1;
    }
    return -100 / americanOdds + 1;
  }

  // Calculate comprehensive performance metrics
  static calculateMetrics(bets: BetRecord[]): PerformanceMetrics {
    const completedBets = bets.filter(bet => bet.result !== 'PENDING');
    const wins = completedBets.filter(bet => bet.result === 'WIN');

    const totalStake = completedBets.reduce((sum, bet) => sum + bet.stake, 0);
    const totalReturn = completedBets.reduce((sum, bet) => {
      if (bet.result === 'WIN') {
        return sum + bet.stake * this.calculatePayout(bet.placedOdds);
      }
      return sum;
    }, 0);

    const roi = ((totalReturn - totalStake) / totalStake) * 100;
    const winRate = (wins.length / completedBets.length) * 100;

    const averageClv = this.calculateAverageClv(completedBets);
    const sharpnessScore = this.calculateSharpnessScore(completedBets);

    return {
      roi,
      winRate,
      averageClv,
      totalBets: completedBets.length,
      kellyMultiplier: this.calculateKellyMultiplier(roi, winRate),
      sharpnessScore,
      clvAverage: averageClv,
      edgeRetention: 0,
      marketEfficiencyScore: 0,
      profitByStrategy: {},
      variance: 0,
      sharpeRatio: 0,
    };
  }

  // Calculate payout for American odds
  private static calculatePayout(odds: number): number {
    if (odds > 0) {
      return odds / 100 + 1;
    } else {
      return 100 / Math.abs(odds) + 1;
    }
  }

  // Calculate average CLV across all bets
  private static calculateAverageClv(bets: BetRecord[]): number {
    const clvValues = bets.map(bet => this.calculateSingleBetClv(bet));
    return clvValues.reduce((sum, clv) => sum + clv, 0) / clvValues.length;
  }

  // Calculate CLV for a single bet
  private static calculateSingleBetClv(bet: BetRecord): number {
    const placedProb = this.oddsToProb(bet.placedOdds);
    const closingProb = this.oddsToProb(bet.closingOdds);
    return ((closingProb - placedProb) / placedProb) * 100;
  }

  // Convert odds to probability
  private static oddsToProb(odds: number): number {
    if (odds > 0) {
      return 100 / (odds + 100);
    } else {
      return Math.abs(odds) / (Math.abs(odds) + 100);
    }
  }

  // Calculate average odds
  private static calculateAverageOdds(bets: BetRecord[]): number {
    return bets.reduce((sum, bet) => sum + bet.placedOdds, 0) / bets.length;
  }

  // Calculate Kelly Criterion multiplier
  private static calculateKellyMultiplier(roi: number, winRate: number): number {
    const edge = roi / 100;
    const lossRate = 1 - winRate / 100;
    return Math.max(0, edge / lossRate);
  }

  // Calculate sharpness score based on CLV and win rate
  private static calculateSharpnessScore(bets: BetRecord[]): number {
    const clv = this.calculateAverageClv(bets);
    const wins = bets.filter(bet => bet.result === 'WIN').length;
    const winRate = wins / bets.length;

    // Weighted combination of CLV and win rate
    return clv * 0.6 + winRate * 0.4;
  }

  // Analyze CLV patterns and market efficiency
  static analyzeClv(bet: BetRecord): ClvAnalysis {
    const clvValue = this.calculateSingleBetClv(bet);
    const timeToClose = bet.metadata.closingLine
      ? (bet.metadata.closingLine - bet.timestamp) / 3600000
      : 0; // Convert to hours

    const edgeRetained = this.calculateEdgeRetention(bet);
    const marketEfficiency = this.calculateMarketEfficiency(bet);

    return {
      clvValue,
      edgeRetained,
      marketEfficiency,
      timeValue: this.calculateTimeValue(clvValue, timeToClose),
      factors: [
        {
          name: 'Timing Impact',
          impact: this.calculateTimingImpact(timeToClose),
          description: 'Impact of bet timing relative to market close',
        },
        {
          name: 'Market Efficiency',
          impact: marketEfficiency,
          description: 'Measure of market pricing efficiency',
        },
        {
          name: 'Edge Retention',
          impact: edgeRetained,
          description: 'Percentage of theoretical edge retained',
        },
      ],
    };
  }

  // Calculate edge retention
  private static calculateEdgeRetention(bet: BetRecord): number {
    const placedEdge = this.calculateTheoreticalEdge(bet.placedOdds);
    const closingEdge = this.calculateTheoreticalEdge(bet.closingOdds);
    return (placedEdge / closingEdge) * 100;
  }

  // Calculate theoretical edge
  private static calculateTheoreticalEdge(odds: number): number {
    const impliedProb = this.oddsToProb(odds);
    return Math.max(0, 1 - impliedProb);
  }

  // Calculate market efficiency
  private static calculateMarketEfficiency(bet: BetRecord): number {
    const movement = Math.abs(bet.closingOdds - bet.placedOdds);
    const timeToClose = bet.metadata.closingLine
      ? (bet.metadata.closingLine - bet.timestamp) / 3600000
      : 0;

    return 1 - movement / (timeToClose + 1);
  }

  // Calculate time value of CLV
  private static calculateTimeValue(clv: number, timeToClose: number): number {
    return clv / (timeToClose + 1);
  }

  // Calculate timing impact
  private static calculateTimingImpact(timeToClose: number): number {
    // Normalize to 0-1 scale, assuming max time is 48 hours
    return Math.min(1, timeToClose / 48);
  }
}
