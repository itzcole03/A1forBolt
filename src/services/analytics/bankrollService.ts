// bankrollService.ts
// Singleton service for bankroll tracking, stats, and settings

import type { Transaction, BankrollSettings, BankrollStats } from '../../types/bankroll';

class BankrollService {
  private static _instance: BankrollService;
  private transactions: Transaction[] = [];
  private settings: BankrollSettings = {
    maxBetPercentage: 0.05,
    stopLossPercentage: 0.2,
    takeProfitPercentage: 0.5,
    kellyFraction: 0.5,
  };
  private stats: BankrollStats = {
    currentBalance: 1000,
    startingBalance: 1000,
    totalWins: 0,
    totalLosses: 0,
    winRate: 0,
    averageBetSize: 0,
    largestWin: 0,
    largestLoss: 0,
    netProfit: 0,
    roi: 0,
  };

  private constructor() {}

  public static getInstance(): BankrollService {
    if (!BankrollService._instance) {
      BankrollService._instance = new BankrollService();
    }
    return BankrollService._instance;
  }

  public addTransaction(tx: Transaction) {
    this.transactions.push(tx);
    this.recalculateStats();
  }

  public getTransactions(): Transaction[] {
    return [...this.transactions];
  }

  public getSettings(): BankrollSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<BankrollSettings>) {
    this.settings = { ...this.settings, ...newSettings };
  }

  public getStats(): BankrollStats {
    return { ...this.stats };
  }

  private recalculateStats() {
    const wins = this.transactions.filter(t => t.type === 'win');
    const losses = this.transactions.filter(t => t.type === 'loss');
    const bets = this.transactions.filter(t => t.type === 'bet');
    const totalWins = wins.reduce((acc, t) => acc + t.amount, 0);
    const totalLosses = losses.reduce((acc, t) => acc + t.amount, 0);
    const netProfit = totalWins - totalLosses;
    const currentBalance = this.stats.startingBalance + netProfit;
    const winRate = bets.length ? wins.length / bets.length : 0;
    const averageBetSize = bets.length ? bets.reduce((acc, t) => acc + t.amount, 0) / bets.length : 0;
    const largestWin = wins.length ? Math.max(...wins.map(t => t.amount)) : 0;
    const largestLoss = losses.length ? Math.max(...losses.map(t => t.amount)) : 0;
    const roi = bets.length ? netProfit / bets.reduce((acc, t) => acc + t.amount, 0) : 0;
    this.stats = {
      ...this.stats,
      currentBalance,
      totalWins: wins.length,
      totalLosses: losses.length,
      winRate,
      averageBetSize,
      largestWin,
      largestLoss,
      netProfit,
      roi,
    };
  }

  public reset() {
    this.transactions = [];
    this.stats = { ...this.stats, currentBalance: this.stats.startingBalance, netProfit: 0 };
  }
}

export const bankrollService = BankrollService.getInstance();
