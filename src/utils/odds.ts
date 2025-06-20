import type { EntryStatus, LineupType, PropType } from './common';
import type { PlayerProp, Entry } from './core';



/**
 * Convert American odds to decimal format
 */
export const oddsToDecimal = (odds: string): number => {
  const numOdds = parseInt(odds);
  if (numOdds > 0) {
    return (numOdds / 100) + 1;
  } else {
    return (-100 / numOdds) + 1;
  }
};

/**
 * Calculate potential payout for a parlay bet
 */
export const calculatePotentialPayout = (entry: number, odds: string[]): number => {
  const decimalOdds = odds.map(oddsToDecimal);
  const totalOdds = decimalOdds.reduce((acc, curr) => acc * curr, 1);
  return Math.round(entry * totalOdds * 100) / 100;
};

/**
 * Calculate win probability based on historical percentages
 */
export const calculateWinProbability = (percentages: number[]): number => {
  if (!percentages.length) return 0;
  const combinedProbability = percentages.reduce((acc, curr) => acc * (curr / 100), 1);
  return Math.round(combinedProbability * 100);
};

/**
 * Generate a random odds change for simulation
 */
export const generateRandomOddsChange = (currentOdds: string): string => {
  const change = Math.random() > 0.5 ? 5 : -5;
  const numOdds = parseInt(currentOdds);
  
  if (numOdds > 0) {
    return Math.max(100, numOdds + change).toString();
  } else {
    return Math.min(-100, numOdds - change).toString();
  }
};

/**
 * Format currency values
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Calculate progress percentage
 */
export const calculateProgressPercentage = (current: number, target: number): number => {
  if (target === 0) return 0;
  const percentage = (current / target) * 100;
  return Math.min(100, Math.max(0, percentage));
};

/**
 * Calculate implied probability from odds
 */
export const calculateImpliedProbability = (odds: string): number => {
  const numOdds = parseInt(odds);
  if (numOdds > 0) {
    return Math.round((100 / (numOdds + 100)) * 100);
  } else {
    return Math.round((-numOdds / (-numOdds + 100)) * 100);
  }
};

/**
 * Calculate Kelly Criterion bet size
 */
export const calculateKellyBet = (
  bankroll: number,
  probability: number,
  odds: string
): number => {
  const decimalOdds = oddsToDecimal(odds);
  const impliedProb = 1 / decimalOdds;
  const edge = (probability / 100) - impliedProb;
  
  if (edge <= 0) return 0;
  
  const fraction = (edge * decimalOdds) / (decimalOdds - 1);
  const kellyBet = bankroll * Math.min(fraction, 0.1); // Cap at 10% of bankroll
  
  return Math.round(kellyBet * 100) / 100;
};

// Convert American odds to decimal odds
export const americanToDecimal = (americanOdds: number): number => {
  if (americanOdds > 0) {
    return (americanOdds / 100) + 1;
  } else {
    return (100 / Math.abs(americanOdds)) + 1;
  }
};

// Convert decimal odds to American odds
export const decimalToAmerican = (decimalOdds: number): number => {
  if (decimalOdds >= 2) {
    return (decimalOdds - 1) * 100;
  } else {
    return -100 / (decimalOdds - 1);
  }
};

// Calculate implied probability from decimal odds
export const calculateImpliedProbabilityDecimal = (decimalOdds: number): number => {
  return 1 / decimalOdds;
};

interface WinFactors {
  form?: number;
  weather?: number;
  rest?: number;
}

// Calculate win probability based on various factors
export const calculateWinProbabilityFactors = (
  prop: PlayerProp,
  factors: WinFactors
): number => {
  const baseProb = prop.confidence / 100;
  
  // Apply weights to different factors
  let adjustedProb = baseProb;
  
  if (factors.form) {
    adjustedProb *= (1 + (factors.form - 0.5) * 0.2);
  }
  
  if (factors.weather) {
    adjustedProb *= (1 + factors.weather * 0.1);
  }
  
  if (factors.rest) {
    adjustedProb *= (1 + factors.rest * 0.15);
  }
  
  // Ensure probability is between 0 and 1
  return Math.min(Math.max(adjustedProb, 0), 1);
};

// Calculate Kelly Criterion bet size
export const calculateKellyCriterion = (
  probability: number,
  decimalOdds: number,
  bankroll: number,
  fraction: number = 1
): number => {
  const q = 1 - probability;
  const b = decimalOdds - 1;
  
  const kelly = (b * probability - q) / b;
  
  // Apply fractional Kelly (default: full Kelly)
  return Math.max(0, kelly * fraction * bankroll);
};

// Calculate parlay odds
export const calculateParlayOdds = (decimalOdds: number[]): number => {
  return decimalOdds.reduce((acc, odds) => acc * odds, 1);
};

// Calculate potential payout
export const calculatePotentialPayoutDecimal = (
  stake: number,
  odds: number,
  type: 'american' | 'decimal' = 'american'
): number => {
  const decimalOdds = type === 'american' ? americanToDecimal(odds) : odds;
  return stake * decimalOdds;
};

// Format currency
export const formatCurrencyDecimal = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Format percentage
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`;
};

// Calculate risk level multiplier
export const getRiskMultiplier = (type: LineupType): number => {
  switch (type) {
    case LineupType.SINGLE:
      return 0.5;
    case LineupType.PARLAY:
      return 2;
    case LineupType.TEASER:
    default:
      return 1;
  }
};

// Calculate entry progress
export const calculateEntryProgress = (entry: Entry): number => {
  if (entry.status !== EntryStatus.PENDING) {
    return entry.status === EntryStatus.WON ? 100 : 0;
  }

  const totalProgress = entry.props.reduce((acc, prop) => {
    // In a real app, this would use live game data
    // For now, we'll generate a random progress
    const progress = Math.random() * 100;
    return acc + progress;
  }, 0);

  return Math.round(totalProgress / entry.props.length);
};

// Format odds for display
export const formatOdds = (odds: number, format: 'american' | 'decimal' = 'american'): string => {
  if (format === 'decimal') {
    return odds.toFixed(2);
  }
  
  const oddsString = odds > 0 ? `+${odds}` : odds.toString();
  return oddsString;
};

// Calculate arbitrage opportunity
export const calculateArbitrage = (
  odds1: number,
  odds2: number,
  stake: number
): { profit: number; split: [number, number] } | null => {
  const decimal1 = americanToDecimal(odds1);
  const decimal2 = americanToDecimal(odds2);
  
  const prob1 = 1 / decimal1;
  const prob2 = 1 / decimal2;
  
  const totalProb = prob1 + prob2;
  
  if (totalProb < 1) {
    const stake1 = (stake * prob1) / totalProb;
    const stake2 = (stake * prob2) / totalProb;
    
    const payout1 = stake1 * decimal1;
    const payout2 = stake2 * decimal2;
    
    const profit = Math.min(payout1, payout2) - stake;
    
    return {
      profit,
      split: [stake1, stake2],
    };
  }
  
  return null;
};

// Calculate value rating (0-100)
export const calculateValueRating = (
  impliedProbability: number,
  modelProbability: number
): number => {
  const edge = modelProbability - impliedProbability;
  // Convert edge to 0-100 scale with diminishing returns
  return Math.min(100, Math.round(edge * 200));
}; 