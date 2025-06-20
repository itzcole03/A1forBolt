// bankrollSlice.ts
// Zustand slice for bankroll state and actions

import { create } from 'zustand';
import type { Transaction, BankrollSettings, BankrollStats } from '../../types/bankroll';

interface BankrollState {
  transactions: Transaction[];
  addTransaction: (tx: Transaction) => void;
  settings: BankrollSettings;
  updateSettings: (s: Partial<BankrollSettings>) => void;
  stats: BankrollStats;
  refreshStats: () => void;
  reset: () => void;
}

export const useBankrollStore = create<BankrollState>((set, get) => ({
  transactions: [],
  addTransaction: (tx) => set((state) => ({ transactions: [...state.transactions, tx] })),
  settings: {
    maxBetPercentage: 0.05,
    stopLossPercentage: 0.2,
    takeProfitPercentage: 0.5,
    kellyFraction: 0.5,
  },
  updateSettings: (s) => set((state) => ({ settings: { ...state.settings, ...s } })),
  stats: {
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
  },
  refreshStats: () => {
    // In production, sync with bankrollService.getStats()
    // For now, recalc from local state
    const { transactions, stats } = get();
    const wins = transactions.filter(t => t.type === 'win');
    const losses = transactions.filter(t => t.type === 'loss');
    const bets = transactions.filter(t => t.type === 'bet');
    const totalWins = wins.reduce((acc, t) => acc + t.amount, 0);
    const totalLosses = losses.reduce((acc, t) => acc + t.amount, 0);
    const netProfit = totalWins - totalLosses;
    const currentBalance = stats.startingBalance + netProfit;
    const winRate = bets.length ? wins.length / bets.length : 0;
    const averageBetSize = bets.length ? bets.reduce((acc, t) => acc + t.amount, 0) / bets.length : 0;
    const largestWin = wins.length ? Math.max(...wins.map(t => t.amount)) : 0;
    const largestLoss = losses.length ? Math.max(...losses.map(t => t.amount)) : 0;
    const roi = bets.length ? netProfit / bets.reduce((acc, t) => acc + t.amount, 0) : 0;
    set({
      stats: {
        ...stats,
        currentBalance,
        totalWins: wins.length,
        totalLosses: losses.length,
        winRate,
        averageBetSize,
        largestWin,
        largestLoss,
        netProfit,
        roi,
      },
    });
  },
  reset: () => set({ transactions: [], stats: { ...get().stats, currentBalance: get().stats.startingBalance, netProfit: 0 } }),
}));
