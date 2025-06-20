import type { BettingOdds, LineMovement } from './betting';

export interface MarketData {
  line: number;
  volume: number;
  movement: 'up' | 'down' | 'stable';
  timestamp: number;
}

export interface MarketUpdate {
  propId: string;
  odds: {
    over: number;
    under: number;
  };
  timestamp: number;
  volume: number;
  movement: number;
}

export interface ClvAnalysis {
  clvValue: number;
  edgeRetained: number;
  marketEfficiency: number;
  timeValue: number;
  factors: Array<{
    name: string;
    impact: number;
  }>;
}

export interface MarketContext {
  marketId: string;
  timestamp: number;
  odds: BettingOdds[];
  lineMovements: LineMovement[];
  orderBook: OrderBook;
  marketEfficiency: number;
  liquidity: number;
  volatility: number;
  volume: number;
  metadata: Record<string, any>;
}

export interface OrderBook {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
  spread: number;
  depth: number;
  metadata: Record<string, any>;
}

export interface OrderBookEntry {
  price: number;
  size: number;
  timestamp: number;
  source: string;
  metadata: Record<string, any>;
}

export interface MarketMetrics {
  volume: VolumeData;
  liquidity: number;
  volatility: number;
  trend: number;
}

export interface VolumeData {
  totalVolume: number;
  lastUpdate: number;
  volumeHistory: Array<{ timestamp: number; volume: number }>;
}

export interface MarketEfficiencyMetrics {
  spreadEfficiency: number;
  volumeEfficiency: number;
  priceDiscovery: number;
  marketDepth: number;
}

export interface MarketAnomaly {
  type: 'volume' | 'price' | 'spread' | 'liquidity';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: number;
  metrics: {
    current: number;
    expected: number;
    deviation: number;
  };
}
