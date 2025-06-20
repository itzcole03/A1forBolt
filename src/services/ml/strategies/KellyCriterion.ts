import * as tf from '@tensorflow/tfjs';
import { UnifiedLogger } from '../../core/UnifiedLogger';
import { UnifiedCache } from '../../services/core/UnifiedCache';

interface KellyMetrics {
  fraction: number;
  expectedValue: number;
  riskAdjustedReturn: number;
  optimalStake: number;
  confidence: number;
  uncertainty: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
}

interface KellyConfig {
  maxFraction: number;
  minConfidence: number;
  riskTolerance: number;
  volatilityThreshold: number;
  drawdownLimit: number;
  profitTarget: number;
  stopLoss: number;
  positionSizing: {
    method: 'fixed' | 'dynamic' | 'adaptive';
    baseSize: number;
    maxSize: number;
    minSize: number;
  };
  bankrollManagement: {
    method: 'fixed' | 'progressive' | 'adaptive';
    initialSize: number;
    maxRiskPerTrade: number;
    maxDrawdown: number;
  };
}

interface KellyState {
  bankroll: number;
  trades: {
    timestamp: number;
    betSize: number;
    outcome: number;
    profit: number;
    metrics: KellyMetrics;
  }[];
  performance: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    totalProfit: number;
    maxDrawdown: number;
    currentDrawdown: number;
    winRate: number;
    profitFactor: number;
    sharpeRatio: number;
  };
}

export class KellyCriterion {
  private logger: UnifiedLogger;
  private cache: UnifiedCache;
  private config: KellyConfig;
  private state: KellyState;
  private readonly CACHE_KEY = 'kelly_state';
  private readonly CACHE_TTL = 3600 * 1000; // 1 hour in milliseconds

  constructor(config?: Partial<KellyConfig>) {
    this.logger = UnifiedLogger.getInstance();
    this.cache = UnifiedCache.getInstance();
    this.config = {
      maxFraction: 0.5,
      minConfidence: 0.6,
      riskTolerance: 0.3,
      volatilityThreshold: 0.2,
      drawdownLimit: 0.1,
      profitTarget: 0.2,
      stopLoss: 0.1,
      positionSizing: {
        method: 'adaptive',
        baseSize: 0.02,
        maxSize: 0.1,
        minSize: 0.01,
      },
      bankrollManagement: {
        method: 'adaptive',
        initialSize: 1000,
        maxRiskPerTrade: 0.02,
        maxDrawdown: 0.2,
      },
      ...config,
    };
    this.state = this.initializeState();
    this.loadState();
  }

  private initializeState(): KellyState {
    return {
      bankroll: this.config.bankrollManagement.initialSize,
      trades: [],
      performance: {
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        totalProfit: 0,
        maxDrawdown: 0,
        currentDrawdown: 0,
        winRate: 0,
        profitFactor: 0,
        sharpeRatio: 0,
      },
    };
  }

  private async loadState(): Promise<void> {
    try {
      const cachedState = this.cache.get<KellyState>(this.CACHE_KEY);
      if (cachedState) {
        this.state = cachedState;
      }
    } catch (error) {
      this.logger.error('Failed to load Kelly state from cache', error as any);
    }
  }

  private async saveState(): Promise<void> {
    try {
      this.cache.set(this.CACHE_KEY, this.state, this.CACHE_TTL);
    } catch (error) {
      this.logger.error('Failed to save Kelly state to cache', error as any);
    }
  }

  public async analyze(predictions: tf.Tensor, labels: tf.Tensor): Promise<KellyMetrics> {
    try {
      const predArray = (await predictions.array()) as number[][];
      const labelArray = (await labels.array()) as number[][];

      // Calculate base metrics
      const winProb = this.calculateWinProbability(predArray, labelArray);
      const odds = this.calculateOdds(predArray);
      const kellyFraction = this.calculateKellyFraction(winProb, odds);
      const adjustedFraction = this.adjustKellyFraction(kellyFraction);

      // Calculate advanced metrics
      const uncertainty = this.calculateUncertainty(predArray);
      const volatility = this.calculateVolatility(predArray);
      const sharpeRatio = this.calculateSharpeRatio(adjustedFraction, volatility);
      const maxDrawdown = this.calculateMaxDrawdown();
      const winRate = this.calculateWinRate();
      const profitFactor = this.calculateProfitFactor();

      // Calculate expected value and risk-adjusted return
      const expectedValue = this.calculateExpectedValue(winProb, odds, adjustedFraction);
      const riskAdjustedReturn = this.calculateRiskAdjustedReturn(expectedValue, adjustedFraction);

      // Calculate optimal stake with position sizing
      const optimalStake = this.calculateOptimalStake(adjustedFraction, expectedValue);

      // Calculate confidence with uncertainty consideration
      const confidence = this.calculateConfidence(predArray, labelArray, uncertainty);

      return {
        fraction: adjustedFraction,
        expectedValue,
        riskAdjustedReturn,
        optimalStake,
        confidence,
        uncertainty,
        volatility,
        sharpeRatio,
        maxDrawdown,
        winRate,
        profitFactor,
      };
    } catch (error) {
      this.logger.error('Kelly Criterion analysis failed', error as any);
      throw error;
    }
  }

  private calculateWinProbability(predictions: number[][], labels: number[][]): number {
    let correctPredictions = 0;
    let totalPredictions = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i].indexOf(Math.max(...predictions[i]));
      const label = labels[i].indexOf(Math.max(...labels[i]));

      if (pred === label) {
        correctPredictions++;
      }
      totalPredictions++;
    }

    return correctPredictions / totalPredictions;
  }

  private calculateOdds(predictions: number[][]): number {
    // Calculate average odds from predictions
    const avgOdds =
      predictions.reduce((sum, pred) => {
        const maxProb = Math.max(...pred);
        return sum + 1 / maxProb;
      }, 0) / predictions.length;

    return avgOdds;
  }

  private calculateKellyFraction(winProb: number, odds: number): number {
    // Kelly Criterion formula: f* = (bp - q) / b
    // where b = odds - 1, p = win probability, q = 1 - p
    const b = odds - 1;
    const q = 1 - winProb;
    const kellyFraction = (b * winProb - q) / b;

    return Math.max(0, kellyFraction); // Ensure non-negative fraction
  }

  private adjustKellyFraction(kellyFraction: number): number {
    // Apply dynamic adjustments based on performance and risk metrics
    const { maxDrawdown, winRate } = this.state.performance;
    const volatility = this.calculateVolatility([]);

    // Reduce fraction based on volatility
    let adjustedFraction = kellyFraction * (1 - volatility);

    // Reduce fraction based on drawdown
    if (maxDrawdown > this.config.drawdownLimit) {
      adjustedFraction *= 1 - maxDrawdown;
    }

    // Adjust based on win rate
    if (winRate < 0.5) {
      adjustedFraction *= winRate;
    }

    // Apply position sizing method
    switch (this.config.positionSizing.method) {
      case 'fixed':
        adjustedFraction = this.config.positionSizing.baseSize;
        break;
      case 'dynamic':
        adjustedFraction *= 1 + winRate - 0.5;
        break;
      case 'adaptive':
        adjustedFraction *= this.calculateAdaptiveMultiplier();
        break;
    }

    return Math.min(
      Math.max(adjustedFraction, this.config.positionSizing.minSize),
      this.config.positionSizing.maxSize
    );
  }

  private calculateAdaptiveMultiplier(): number {
    const { winRate, profitFactor, sharpeRatio } = this.state.performance;
    const volatility = this.calculateVolatility([]);

    // Combine multiple factors for adaptive sizing
    const confidenceMultiplier = winRate * profitFactor;
    const riskMultiplier = 1 / (1 + volatility);
    const performanceMultiplier = Math.max(0, sharpeRatio);

    return (confidenceMultiplier + riskMultiplier + performanceMultiplier) / 3;
  }

  private calculateExpectedValue(winProb: number, odds: number, fraction: number): number {
    // Expected value = (winProb * (odds - 1) * fraction) - ((1 - winProb) * fraction)
    return winProb * (odds - 1) * fraction - (1 - winProb) * fraction;
  }

  private calculateRiskAdjustedReturn(expectedValue: number, fraction: number): number {
    // Risk-adjusted return = expected value / fraction
    return expectedValue / fraction;
  }

  private calculateOptimalStake(fraction: number, expectedValue: number): number {
    // Optimal stake = fraction * expected value
    return fraction * expectedValue;
  }

  private calculateUncertainty(predictions: number[][]): number {
    // Calculate prediction uncertainty using entropy
    const entropy = predictions.map(pred => {
      const probs = pred.map(p => p + 1e-10); // Add small epsilon to avoid log(0)
      const sum = probs.reduce((a, b) => a + b, 0);
      const normalized = probs.map(p => p / sum);
      return -normalized.reduce((a, b) => a + b * Math.log(b), 0);
    });
    return entropy.reduce((a, b) => a + b, 0) / entropy.length;
  }

  private calculateVolatility(predictions: number[][]): number {
    // Calculate prediction volatility
    const maxProbs = predictions.map(pred => Math.max(...pred));
    const mean = maxProbs.reduce((a, b) => a + b, 0) / maxProbs.length;
    const variance = maxProbs.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / maxProbs.length;
    return Math.sqrt(variance);
  }

  private calculateSharpeRatio(fraction: number, volatility: number): number {
    if (volatility === 0) return 0;
    const riskFreeRate = 0.02; // 2% annual risk-free rate
    return (fraction - riskFreeRate) / volatility;
  }

  private calculateMaxDrawdown(): number {
    let peak = this.state.bankroll;
    let maxDrawdown = 0;

    for (const trade of this.state.trades) {
      peak = Math.max(peak, trade.profit);
      const drawdown = (peak - trade.profit) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown;
  }

  private calculateWinRate(): number {
    const { winningTrades, totalTrades } = this.state.performance;
    return totalTrades > 0 ? winningTrades / totalTrades : 0;
  }

  private calculateProfitFactor(): number {
    const { trades } = this.state;
    const grossProfit = trades.filter(t => t.profit > 0).reduce((sum, t) => sum + t.profit, 0);
    const grossLoss = Math.abs(
      trades.filter(t => t.profit < 0).reduce((sum, t) => sum + t.profit, 0)
    );
    return grossLoss > 0 ? grossProfit / grossLoss : 0;
  }

  private calculateConfidence(
    predictions: number[][],
    labels: number[][],
    uncertainty: number
  ): number {
    let totalConfidence = 0;
    let correctPredictions = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i].indexOf(Math.max(...predictions[i]));
      const label = labels[i].indexOf(Math.max(...labels[i]));

      if (pred === label) {
        correctPredictions++;
        totalConfidence += Math.max(...predictions[i]);
      }
    }

    return correctPredictions > 0 ? totalConfidence / correctPredictions : 0;
  }

  public shouldPlaceBet(metrics: KellyMetrics): boolean {
    const { confidence, expectedValue, riskAdjustedReturn, uncertainty, volatility, maxDrawdown } =
      metrics;

    // Basic criteria
    if (confidence < this.config.minConfidence || expectedValue <= 0 || riskAdjustedReturn <= 0) {
      return false;
    }

    // Risk management criteria
    if (uncertainty > this.config.riskTolerance || volatility > this.config.volatilityThreshold) {
      return false;
    }

    // Drawdown protection
    if (maxDrawdown > this.config.drawdownLimit) {
      return false;
    }

    // Performance-based criteria
    const { winRate, profitFactor } = this.state.performance;
    if (winRate < 0.4 || profitFactor < 1.2) {
      return false;
    }

    return true;
  }

  public getBetSize(metrics: KellyMetrics, bankroll: number): number {
    if (!this.shouldPlaceBet(metrics)) {
      return 0;
    }

    let betSize: number;

    switch (this.config.bankrollManagement.method) {
      case 'fixed':
        betSize = bankroll * this.config.positionSizing.baseSize;
        break;
      case 'progressive':
        betSize = bankroll * metrics.fraction * (1 + this.state.performance.winRate);
        break;
      case 'adaptive':
        betSize = this.calculateAdaptiveBetSize(metrics, bankroll);
        break;
      default:
        betSize = bankroll * metrics.fraction;
    }

    // Apply risk limits
    const maxRiskAmount = bankroll * this.config.bankrollManagement.maxRiskPerTrade;
    betSize = Math.min(betSize, maxRiskAmount);

    // Apply position size limits
    betSize = Math.min(
      Math.max(betSize, bankroll * this.config.positionSizing.minSize),
      bankroll * this.config.positionSizing.maxSize
    );

    return betSize;
  }

  private calculateAdaptiveBetSize(metrics: KellyMetrics, bankroll: number): number {
    const { confidence, uncertainty, volatility, sharpeRatio } = metrics;

    // Calculate base size from Kelly fraction
    let betSize = bankroll * metrics.fraction;

    // Adjust for confidence
    betSize *= confidence;

    // Adjust for uncertainty
    betSize *= 1 - uncertainty;

    // Adjust for volatility
    betSize *= 1 - volatility;

    // Adjust for Sharpe ratio
    if (sharpeRatio > 0) {
      betSize *= 1 + sharpeRatio;
    }

    return betSize;
  }

  public updateState(
    betSize: number,
    outcome: number,
    profit: number,
    metrics: KellyMetrics
  ): void {
    // Update trade history
    this.state.trades.push({
      timestamp: Date.now(),
      betSize,
      outcome,
      profit,
      metrics,
    });

    // Update bankroll
    this.state.bankroll += profit;

    // Update performance metrics
    this.state.performance.totalTrades++;
    if (profit > 0) {
      this.state.performance.winningTrades++;
    } else {
      this.state.performance.losingTrades++;
    }
    this.state.performance.totalProfit += profit;
    this.state.performance.winRate = this.calculateWinRate();
    this.state.performance.profitFactor = this.calculateProfitFactor();
    this.state.performance.maxDrawdown = this.calculateMaxDrawdown();

    // Save updated state
    this.saveState();
  }
}
