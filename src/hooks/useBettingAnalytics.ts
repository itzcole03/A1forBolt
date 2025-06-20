import { useMemo } from 'react';
import { useBettingStore } from '../stores/bettingStore';

interface BettingStats {
  totalBets: number;
  totalStake: number;
  totalWinnings: number;
  winRate: number;
  averageOdds: number;
  profitLoss: number;
  roi: number;
  bestBet: {
    selection: string;
    odds: number;
    stake: number;
    winnings: number;
  } | null;
  worstBet: {
    selection: string;
    odds: number;
    stake: number;
    loss: number;
  } | null;
  // New fields for historical analysis
  performanceBySport: {
    [sport: string]: {
      totalBets: number;
      winRate: number;
      profitLoss: number;
    };
  };
  performanceByMarket: {
    [market: string]: {
      totalBets: number;
      winRate: number;
      profitLoss: number;
    };
  };
  recentPerformance: {
    date: string;
    profitLoss: number;
    bets: number;
  }[];
  riskMetrics: {
    averageStake: number;
    maxStake: number;
    stakeToBalanceRatio: number;
    volatility: number;
  };
}

export const useBettingAnalytics = (): BettingStats => {
  const { activeBets } = useBettingStore();

  return useMemo(() => {
    const stats: BettingStats = {
      totalBets: activeBets.length,
      totalStake: 0,
      totalWinnings: 0,
      winRate: 0,
      averageOdds: 0,
      profitLoss: 0,
      roi: 0,
      bestBet: null,
      worstBet: null,
      performanceBySport: {},
      performanceByMarket: {},
      recentPerformance: [],
      riskMetrics: {
        averageStake: 0,
        maxStake: 0,
        stakeToBalanceRatio: 0,
        volatility: 0,
      },
    };

    if (activeBets.length === 0) {
      return stats;
    }

    // Calculate basic statistics
    let totalOdds = 0;
    let wonBets = 0;
    const stakes: number[] = [];
    const dailyPerformance: { [date: string]: { profitLoss: number; bets: number } } = {};

    activeBets.forEach(bet => {
      if (!bet.selection?.name || !bet.sportName || !bet.marketType) {
        return; // Skip invalid bets
      }

      stats.totalStake += bet.stake;
      totalOdds += bet.odds;
      stakes.push(bet.stake);

      // Track performance by sport
      const sportStats = stats.performanceBySport[bet.sportName] || {
        totalBets: 0,
        winRate: 0,
        profitLoss: 0,
      };
      sportStats.totalBets++;
      stats.performanceBySport[bet.sportName] = sportStats;

      // Track performance by market
      const marketStats = stats.performanceByMarket[bet.marketType] || {
        totalBets: 0,
        winRate: 0,
        profitLoss: 0,
      };
      marketStats.totalBets++;
      stats.performanceByMarket[bet.marketType] = marketStats;

      // Track daily performance
      const date = new Date(bet.timestamp).toISOString().split('T')[0];
      const dailyStats = dailyPerformance[date] || { profitLoss: 0, bets: 0 };
      dailyStats.bets++;
      dailyPerformance[date] = dailyStats;

      if (bet.status === 'won') {
        wonBets++;
        stats.totalWinnings += bet.potentialWinnings;
        sportStats.profitLoss += bet.potentialWinnings - bet.stake;
        marketStats.profitLoss += bet.potentialWinnings - bet.stake;
        dailyStats.profitLoss += bet.potentialWinnings - bet.stake;
      } else if (bet.status === 'lost') {
        sportStats.profitLoss -= bet.stake;
        marketStats.profitLoss -= bet.stake;
        dailyStats.profitLoss -= bet.stake;
      }

      // Track best and worst bets
      if (bet.status === 'won') {
        if (!stats.bestBet || bet.potentialWinnings > stats.bestBet.winnings) {
          stats.bestBet = {
            selection: bet.selection.name,
            odds: bet.odds,
            stake: bet.stake,
            winnings: bet.potentialWinnings,
          };
        }
      } else if (bet.status === 'lost') {
        if (!stats.worstBet || bet.stake > stats.worstBet.stake) {
          stats.worstBet = {
            selection: bet.selection.name,
            odds: bet.odds,
            stake: bet.stake,
            loss: bet.stake,
          };
        }
      }
    });

    // Calculate derived statistics
    stats.winRate = (wonBets / activeBets.length) * 100;
    stats.averageOdds = totalOdds / activeBets.length;
    stats.profitLoss = stats.totalWinnings - stats.totalStake;
    stats.roi = (stats.profitLoss / stats.totalStake) * 100;

    // Calculate performance by sport and market
    Object.keys(stats.performanceBySport).forEach(sport => {
      const sportStats = stats.performanceBySport[sport];
      sportStats.winRate = (sportStats.totalBets / activeBets.length) * 100;
    });

    Object.keys(stats.performanceByMarket).forEach(market => {
      const marketStats = stats.performanceByMarket[market];
      marketStats.winRate = (marketStats.totalBets / activeBets.length) * 100;
    });

    // Calculate risk metrics
    stats.riskMetrics.averageStake = stats.totalStake / activeBets.length;
    stats.riskMetrics.maxStake = Math.max(...stakes);
    stats.riskMetrics.stakeToBalanceRatio = stats.totalStake / (stats.totalWinnings || 1);

    // Calculate volatility (standard deviation of daily returns)
    const dailyReturns = Object.values(dailyPerformance).map(d => d.profitLoss);
    const mean = dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length;
    const variance =
      dailyReturns.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / dailyReturns.length;
    stats.riskMetrics.volatility = Math.sqrt(variance);

    // Sort and limit recent performance to last 30 days
    stats.recentPerformance = Object.entries(dailyPerformance)
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 30);

    return stats;
  }, [activeBets]);
};
