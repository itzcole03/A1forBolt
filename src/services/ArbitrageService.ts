import { BettingOpportunity, MarketUpdate, OddsUpdate } from '../types/core';
import { EventBus } from '../core/EventBus';
import { UnifiedConfigManager } from '../core/UnifiedConfigManager.ts';



export interface ArbitrageConfig {
  minProfitMargin: number;
  maxExposure: number;
  minOdds: number;
  maxOdds: number;
  maxBetDelay: number;
  refreshInterval: number;
}

export interface ArbitrageOpportunity {
  id: string;
  timestamp: number;
  profitMargin: number;
  totalStake: number;
  expectedProfit: number;
  legs: Array<{
    bookId: string;
    propId: string;
    odds: number;
    stake: number;
    maxStake: number;
  }>;
  risk: {
    exposure: number;
    confidence: number;
    timeSensitivity: number;
  };
  status: 'pending' | 'executed' | 'expired' | 'failed';
}

export class ArbitrageService {
  private static instance: ArbitrageService;
  private readonly eventBus: EventBus;
  private readonly configManager: UnifiedConfigManager;
  private readonly config: ArbitrageConfig;
  private readonly opportunities: Map<string, ArbitrageOpportunity>;
  private readonly marketData: Map<string, {
    odds: Map<string, OddsUpdate>;
    lastUpdate: number;
  }>;
  private isScanning: boolean = false;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.configManager = UnifiedConfigManager.getInstance();
    this.config = this.initializeConfig();
    this.opportunities = new Map();
    this.marketData = new Map();
    this.setupEventListeners();
    this.startScanning();
  }

  public static getInstance(): ArbitrageService {
    if (!ArbitrageService.instance) {
      ArbitrageService.instance = new ArbitrageService();
    }
    return ArbitrageService.instance;
  }

  private initializeConfig(): ArbitrageConfig {
    const config = this.configManager.getConfig();
    return {
      minProfitMargin: 0.02, // 2%
      maxExposure: 1000,
      minOdds: 1.1,
      maxOdds: 10.0,
      maxBetDelay: 5000, // 5 seconds
      refreshInterval: 1000 // 1 second
    };
  }

  private setupEventListeners(): void {
    this.eventBus.on('odds:update', async (event) => {
      try {
        const { propId, bookId, odds } = event.data;
        this.updateMarketData(propId, bookId, odds);
        await this.checkForArbitrage(propId);
      } catch (error) {
        console.error('Error handling odds update:', error);
      }
    });

    this.eventBus.on('market:update', async (event) => {
      try {
        const { id: propId, books } = event.data;
        for (const [bookId, odds] of Object.entries(books)) {
          this.updateMarketData(propId, bookId, odds as OddsUpdate);
        }
        await this.checkForArbitrage(propId);
      } catch (error) {
        console.error('Error handling market update:', error);
      }
    });

    this.eventBus.on('bet:placed', (event) => {
      const { bet } = event.data;
      this.updateOpportunityStatus(bet.opportunity.id, 'executed');
    });
  }

  private updateMarketData(propId: string, bookId: string, odds: OddsUpdate): void {
    if (!this.marketData.has(propId)) {
      this.marketData.set(propId, {
        odds: new Map(),
        lastUpdate: Date.now()
      });
    }

    const market = this.marketData.get(propId)!;
    market.odds.set(bookId, odds);
    market.lastUpdate = Date.now();

    // Clean up old market data
    for (const [id, data] of this.marketData) {
      if (Date.now() - data.lastUpdate > 3600000) { // 1 hour
        this.marketData.delete(id);
      }
    }
  }

  private startScanning(): void {
    setInterval(async () => {
      if (this.isScanning) return;
      this.isScanning = true;

      try {
        await this.scanAllMarkets();
      } catch (error) {
        console.error('Error scanning markets:', error);
      } finally {
        this.isScanning = false;
      }
    }, this.config.refreshInterval);
  }

  private async scanAllMarkets(): Promise<void> {
    const startTime = Date.now();
    let opportunitiesFound = 0;

    for (const [propId, market] of this.marketData) {
      if (Date.now() - market.lastUpdate > 60000) continue; // Skip stale markets
      await this.checkForArbitrage(propId);
      opportunitiesFound += this.opportunities.size;
    }

    // Emit metrics
    this.eventBus.emit('metric:recorded', {
      name: 'arbitrage_scan_duration',
      value: Date.now() - startTime,
      timestamp: Date.now(),
      labels: {
        markets_scanned: String(this.marketData.size),
        opportunities_found: String(opportunitiesFound)
      }
    });
  }

  private async checkForArbitrage(propId: string): Promise<void> {
    const market = this.marketData.get(propId);
    if (!market || market.odds.size < 2) return;

    const opportunities = this.findArbitrageOpportunities(market.odds);
    for (const opportunity of opportunities) {
      if (this.isValidOpportunity(opportunity)) {
        this.opportunities.set(opportunity.id, opportunity);
        
        // Emit opportunity found event
        this.eventBus.emit('data:updated', {
          sourceId: 'arbitrage',
          data: [opportunity]
        });
      }
    }

    // Clean up expired opportunities
    for (const [id, opportunity] of this.opportunities) {
      if (Date.now() - opportunity.timestamp > this.config.maxBetDelay) {
        this.updateOpportunityStatus(id, 'expired');
      }
    }
  }

  private findArbitrageOpportunities(odds: Map<string, OddsUpdate>): ArbitrageOpportunity[] {
    const opportunities: ArbitrageOpportunity[] = [];
    const oddsArray = Array.from(odds.entries());

    for (let i = 0; i < oddsArray.length; i++) {
      for (let j = i + 1; j < oddsArray.length; j++) {
        const [book1Id, odds1] = oddsArray[i];
        const [book2Id, odds2] = oddsArray[j];

        if (
          odds1.odds < this.config.minOdds ||
          odds1.odds > this.config.maxOdds ||
          odds2.odds < this.config.minOdds ||
          odds2.odds > this.config.maxOdds
        ) {
          continue;
        }

        const arbitrage = this.calculateArbitrage(odds1, odds2);
        if (arbitrage) {
          opportunities.push({
            id: `${book1Id}-${book2Id}-${Date.now()}`,
            timestamp: Date.now(),
            profitMargin: arbitrage.profitMargin,
            totalStake: arbitrage.totalStake,
            expectedProfit: arbitrage.expectedProfit,
            legs: [
              {
                bookId: book1Id,
                propId: odds1.propId,
                odds: odds1.odds,
                stake: arbitrage.stake1,
                maxStake: odds1.maxStake
              },
              {
                bookId: book2Id,
                propId: odds2.propId,
                odds: odds2.odds,
                stake: arbitrage.stake2,
                maxStake: odds2.maxStake
              }
            ],
            risk: {
              exposure: arbitrage.totalStake,
              confidence: this.calculateConfidence(odds1, odds2),
              timeSensitivity: this.calculateTimeSensitivity(odds1, odds2)
            },
            status: 'pending'
          });
        }
      }
    }

    return opportunities;
  }

  private calculateArbitrage(odds1: OddsUpdate, odds2: OddsUpdate): {
    profitMargin: number;
    totalStake: number;
    expectedProfit: number;
    stake1: number;
    stake2: number;
  } | null {
    const impliedProb1 = 1 / odds1.odds;
    const impliedProb2 = 1 / odds2.odds;
    const totalImpliedProb = impliedProb1 + impliedProb2;

    if (totalImpliedProb >= 1) return null; // No arbitrage opportunity

    const profitMargin = 1 - totalImpliedProb;
    if (profitMargin < this.config.minProfitMargin) return null;

    // Calculate optimal stakes for a $100 total stake
    const totalStake = Math.min(
      this.config.maxExposure,
      Math.min(odds1.maxStake, odds2.maxStake)
    );

    const stake1 = (totalStake * impliedProb1) / totalImpliedProb;
    const stake2 = (totalStake * impliedProb2) / totalImpliedProb;

    return {
      profitMargin,
      totalStake,
      expectedProfit: totalStake * profitMargin,
      stake1,
      stake2
    };
  }

  private calculateConfidence(odds1: OddsUpdate, odds2: OddsUpdate): number {
    // Calculate confidence based on:
    // 1. Time since last odds update
    // 2. Historical odds volatility
    // 3. Book reliability
    const timeSinceUpdate = Math.max(
      Date.now() - odds1.timestamp,
      Date.now() - odds2.timestamp
    );
    
    const timeWeight = Math.max(0, 1 - timeSinceUpdate / this.config.maxBetDelay);
    return timeWeight; // Simplified confidence calculation
  }

  private calculateTimeSensitivity(odds1: OddsUpdate, odds2: OddsUpdate): number {
    // Calculate time sensitivity based on:
    // 1. Historical odds movement speed
    // 2. Market liquidity
    // 3. Time until event
    return 0.5; // Simplified time sensitivity calculation
  }

  private isValidOpportunity(opportunity: ArbitrageOpportunity): boolean {
    // Check if the opportunity is still valid
    return (
      opportunity.profitMargin >= this.config.minProfitMargin &&
      opportunity.totalStake <= this.config.maxExposure &&
      opportunity.risk.confidence >= 0.5 &&
      Date.now() - opportunity.timestamp <= this.config.maxBetDelay &&
      opportunity.legs.every(leg => 
        leg.odds >= this.config.minOdds &&
        leg.odds <= this.config.maxOdds &&
        leg.stake <= leg.maxStake
      )
    );
  }

  private updateOpportunityStatus(id: string, status: ArbitrageOpportunity['status']): void {
    const opportunity = this.opportunities.get(id);
    if (opportunity) {
      opportunity.status = status;
      if (status === 'expired' || status === 'executed' || status === 'failed') {
        this.opportunities.delete(id);
      }
    }
  }

  public getOpportunities(): ArbitrageOpportunity[] {
    return Array.from(this.opportunities.values());
  }

  public getOpportunity(id: string): ArbitrageOpportunity | undefined {
    return this.opportunities.get(id);
  }

  public clearOpportunities(): void {
    this.opportunities.clear();
  }

  public isMarketActive(propId: string): boolean {
    const market = this.marketData.get(propId);
    return !!market && Date.now() - market.lastUpdate <= 60000;
  }

  public getMarketData(propId: string): Map<string, OddsUpdate> | undefined {
    return this.marketData.get(propId)?.odds;
  }

  public clearMarketData(): void {
    this.marketData.clear();
  }
} 