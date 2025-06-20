import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'events';
import { MLPrediction } from './mlPredictions';

interface Bet {
  id: string;
  recommendationId: string;
  amount: number;
  type: 'straight' | 'parlay' | 'teaser';
  odds: number;
  timestamp: number;
  status: 'pending' | 'won' | 'lost';
  payout?: number;
}

interface Bankroll {
  initial: number;
  current: number;
  totalBets: number;
  winningBets: number;
  totalProfit: number;
  roi: number;
  averageBetSize: number;
  largestBet: number;
  largestWin: number;
  largestLoss: number;
  currentStreak: number;
  currentStreakType: 'win' | 'loss';
  winStreak: number;
  lossStreak: number;
}

interface RiskMetrics {
  kellyCriterion: number;
  recommendedStake: number;
  maxStake: number;
  riskLevel: 'low' | 'medium' | 'high';
  edge: number;
  expectedValue: number;
  variance: number;
  sharpeRatio: number;
}

@Injectable()
export class RiskManagementService extends EventEmitter {
  private static instance: RiskManagementService;
  private bankroll: Bankroll = {
    initial: 1000,
    current: 1000,
    totalBets: 0,
    winningBets: 0,
    totalProfit: 0,
    roi: 0,
    averageBetSize: 0,
    largestBet: 0,
    largestWin: 0,
    largestLoss: 0,
    currentStreak: 0,
    currentStreakType: 'win',
    winStreak: 0,
    lossStreak: 0,
  };
  private bets: Bet[] = [];
  private readonly MAX_BANKROLL_PERCENTAGE = 0.05; // 5% max bet size
  private readonly MIN_BANKROLL_PERCENTAGE = 0.01; // 1% min bet size
  private readonly KELLY_FRACTION = 0.5; // Half Kelly for conservative betting

  private constructor() {
    super();
  }

  public static getInstance(): RiskManagementService {
    if (!RiskManagementService.instance) {
      RiskManagementService.instance = new RiskManagementService();
    }
    return RiskManagementService.instance;
  }

  public async initialize(): Promise<void> {
    // Initialize risk management service
  }

  public async assessRisk(params: {
    prediction: any;
    bankroll: number;
    activeBets: any[];
  }): Promise<{
    riskLevel: 'low' | 'medium' | 'high';
    expectedValue: number;
    confidence: number;
    maxStake: number;
    recommendedStake: number;
  }> {
    // Implement risk assessment logic
    return {
      riskLevel: 'low',
      expectedValue: 0.1,
      confidence: 0.8,
      maxStake: 100,
      recommendedStake: 50,
    };
  }

  getBankroll(): Bankroll {
    return { ...this.bankroll };
  }

  getBets(): Bet[] {
    return [...this.bets];
  }

  calculateRiskMetrics(prediction: MLPrediction): RiskMetrics {
    const kellyCriterion = this.calculateKellyCriterion(prediction);
    const recommendedStake = this.calculateRecommendedStake(kellyCriterion, prediction);
    const maxStake = this.calculateMaxStake(prediction);
    const riskLevel = this.determineRiskLevel(prediction, recommendedStake);
    const edge = prediction.edge;
    const expectedValue = prediction.expectedValue;
    const variance = this.calculateVariance(prediction);
    const sharpeRatio = this.calculateSharpeRatio(expectedValue, variance);

    return {
      kellyCriterion,
      recommendedStake,
      maxStake,
      riskLevel,
      edge,
      expectedValue,
      variance,
      sharpeRatio,
    };
  }

  placeBet(params: {
    recommendationId: string;
    amount: number;
    type: Bet['type'];
    odds: number;
  }): void {
    if (params.amount > this.bankroll.current) {
      throw new Error('Insufficient bankroll');
    }

    const bet: Bet = {
      id: `bet_${Date.now()}`,
      recommendationId: params.recommendationId,
      amount: params.amount,
      type: params.type,
      odds: params.odds,
      timestamp: Date.now(),
      status: 'pending',
    };

    this.bets.push(bet);
    this.bankroll.current -= params.amount;
    this.bankroll.totalBets++;
    this.bankroll.averageBetSize =
      (this.bankroll.averageBetSize * (this.bankroll.totalBets - 1) + params.amount) /
      this.bankroll.totalBets;
    this.bankroll.largestBet = Math.max(this.bankroll.largestBet, params.amount);

    this.updateBankrollMetrics();
  }

  resolveBet(betId: string, won: boolean): void {
    const bet = this.bets.find(b => b.id === betId);
    if (!bet || bet.status !== 'pending') {
      throw new Error('Invalid bet');
    }

    bet.status = won ? 'won' : 'lost';
    if (won) {
      const payout = bet.amount * bet.odds;
      bet.payout = payout;
      this.bankroll.current += payout;
      this.bankroll.winningBets++;
      this.bankroll.totalProfit += payout - bet.amount;
      this.bankroll.largestWin = Math.max(this.bankroll.largestWin, payout - bet.amount);

      if (this.bankroll.currentStreakType === 'win') {
        this.bankroll.currentStreak++;
      } else {
        this.bankroll.currentStreak = 1;
        this.bankroll.currentStreakType = 'win';
      }
      this.bankroll.winStreak = Math.max(this.bankroll.winStreak, this.bankroll.currentStreak);
    } else {
      this.bankroll.largestLoss = Math.max(this.bankroll.largestLoss, bet.amount);

      if (this.bankroll.currentStreakType === 'loss') {
        this.bankroll.currentStreak++;
      } else {
        this.bankroll.currentStreak = 1;
        this.bankroll.currentStreakType = 'loss';
      }
      this.bankroll.lossStreak = Math.max(this.bankroll.lossStreak, this.bankroll.currentStreak);
    }

    this.updateBankrollMetrics();
  }

  private calculateKellyCriterion(prediction: MLPrediction): number {
    const winProbability = prediction.probability;
    const lossProbability = 1 - winProbability;
    const winAmount = prediction.expectedValue - 1;
    const lossAmount = 1;

    return (winProbability * winAmount - lossProbability * lossAmount) / winAmount;
  }

  private calculateRecommendedStake(kellyCriterion: number, prediction: MLPrediction): number {
    const kellyStake = this.bankroll.current * kellyCriterion * this.KELLY_FRACTION;
    const maxStake = this.calculateMaxStake(prediction);
    return Math.min(kellyStake, maxStake);
  }

  private calculateMaxStake(prediction: MLPrediction): number {
    return this.bankroll.current * this.MAX_BANKROLL_PERCENTAGE;
  }

  private determineRiskLevel(prediction: MLPrediction, stake: number): 'low' | 'medium' | 'high' {
    const stakePercentage = stake / this.bankroll.current;
    const confidence = prediction.confidence;
    const edge = prediction.edge;

    if (stakePercentage <= this.MIN_BANKROLL_PERCENTAGE && confidence >= 80 && edge >= 0.1) {
      return 'low';
    } else if (
      stakePercentage <= this.MAX_BANKROLL_PERCENTAGE &&
      confidence >= 60 &&
      edge >= 0.05
    ) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  private calculateVariance(prediction: MLPrediction): number {
    const winProbability = prediction.probability;
    const lossProbability = 1 - winProbability;
    const winAmount = prediction.expectedValue - 1;
    const lossAmount = 1;

    const expectedValue = winProbability * winAmount - lossProbability * lossAmount;
    const variance =
      winProbability * Math.pow(winAmount - expectedValue, 2) +
      lossProbability * Math.pow(-lossAmount - expectedValue, 2);

    return variance;
  }

  private calculateSharpeRatio(expectedValue: number, variance: number): number {
    return expectedValue / Math.sqrt(variance);
  }

  private updateBankrollMetrics(): void {
    this.bankroll.roi = (this.bankroll.totalProfit / this.bankroll.initial) * 100;
  }

  resetBankroll(initialAmount: number): void {
    this.bankroll = {
      initial: initialAmount,
      current: initialAmount,
      totalBets: 0,
      winningBets: 0,
      totalProfit: 0,
      roi: 0,
      averageBetSize: 0,
      largestBet: 0,
      largestWin: 0,
      largestLoss: 0,
      currentStreak: 0,
      currentStreakType: 'win',
      winStreak: 0,
      lossStreak: 0,
    };
    this.bets = [];
  }
}

export const riskManagementService = RiskManagementService.getInstance();
