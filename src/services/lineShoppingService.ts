import { BettingOdds, LineShoppingResult, Sportsbook } from '../types/betting';
import { EventEmitter } from 'events';

export class LineShoppingService extends EventEmitter {
  private sportsbooks: Map<string, Sportsbook> = new Map();
  private oddsCache: Map<string, Map<string, BettingOdds[]>> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
  }

  /**
   * Register a sportsbook for line shopping
   */
  public registerSportsbook(sportsbook: Sportsbook): void {
    this.sportsbooks.set(sportsbook.id, sportsbook);
  }

  /**
   * Update odds for a specific sportsbook
   */
  public updateOdds(bookmakerId: string, odds: BettingOdds[]): void {
    if (!this.sportsbooks.has(bookmakerId)) {
      throw new Error(`Sportsbook ${bookmakerId} not registered`);
    }

    odds.forEach(odd => {
      const eventKey = `${odd.eventId}-${odd.market}`;
      if (!this.oddsCache.has(eventKey)) {
        this.oddsCache.set(eventKey, new Map());
      }

      const marketOdds = this.oddsCache.get(eventKey)!;
      if (!marketOdds.has(odd.selection)) {
        marketOdds.set(odd.selection, []);
      }

      const selectionOdds = marketOdds.get(odd.selection)!;
      const existingIndex = selectionOdds.findIndex(o => o.bookmaker === bookmakerId);

      if (existingIndex >= 0) {
        selectionOdds[existingIndex] = odd;
      } else {
        selectionOdds.push(odd);
      }
    });

    this.emit('oddsUpdated', { bookmakerId, odds });
  }

  /**
   * Find the best odds for a specific selection
   */
  public findBestOdds(
    eventId: string,
    market: string,
    selection: string
  ): LineShoppingResult | null {
    const eventKey = `${eventId}-${market}`;
    const marketOdds = this.oddsCache.get(eventKey);

    if (!marketOdds) {
      return null;
    }

    const selectionOdds = marketOdds.get(selection);
    if (!selectionOdds || selectionOdds.length === 0) {
      return null;
    }

    // Filter out expired odds
    const now = Date.now();
    const validOdds = selectionOdds.filter(odd => now - odd.timestamp < this.CACHE_TTL);

    if (validOdds.length === 0) {
      return null;
    }

    // Find best odds
    const bestOdd = validOdds.reduce((prev, current) =>
      prev.odds > current.odds ? prev : current
    );

    // Calculate price improvement
    const averageOdds = validOdds.reduce((sum, odd) => sum + odd.odds, 0) / validOdds.length;
    const priceImprovement = ((bestOdd.odds - averageOdds) / averageOdds) * 100;

    // Calculate confidence based on:
    // 1. Number of books offering the selection
    // 2. Time since last odds update
    // 3. Odds consistency across books
    const confidence = this.calculateConfidence(validOdds);

    return {
      eventId,
      market,
      selection,
      bestOdds: {
        bookmaker: bestOdd.bookmaker,
        odds: bestOdd.odds,
        timestamp: bestOdd.timestamp,
      },
      allOdds: validOdds.map(odd => ({
        bookmaker: odd.bookmaker,
        odds: odd.odds,
        timestamp: odd.timestamp,
      })),
      priceImprovement,
      confidence,
    };
  }

  /**
   * Calculate confidence score for odds
   */
  private calculateConfidence(odds: BettingOdds[]): number {
    const now = Date.now();

    // Time factor (0-1)
    const timeFactor =
      odds.reduce((sum, odd) => {
        const age = now - odd.timestamp;
        return sum + Math.max(0, 1 - age / this.CACHE_TTL);
      }, 0) / odds.length;

    // Consistency factor (0-1)
    const averageOdds = odds.reduce((sum, odd) => sum + odd.odds, 0) / odds.length;
    const variance =
      odds.reduce((sum, odd) => {
        const diff = odd.odds - averageOdds;
        return sum + diff * diff;
      }, 0) / odds.length;
    const consistencyFactor = Math.max(0, 1 - Math.sqrt(variance) / averageOdds);

    // Coverage factor (0-1)
    const coverageFactor = Math.min(1, odds.length / this.sportsbooks.size);

    // Weighted combination
    return timeFactor * 0.4 + consistencyFactor * 0.3 + coverageFactor * 0.3;
  }

  /**
   * Get all available odds for a specific event and market
   */
  public getMarketOdds(eventId: string, market: string): Map<string, BettingOdds[]> | null {
    const eventKey = `${eventId}-${market}`;
    return this.oddsCache.get(eventKey) || null;
  }

  /**
   * Clear expired odds from cache
   */
  public clearExpiredOdds(): void {
    const now = Date.now();
    this.oddsCache.forEach((marketOdds, eventKey) => {
      marketOdds.forEach((selectionOdds, selection) => {
        const validOdds = selectionOdds.filter(odd => now - odd.timestamp < this.CACHE_TTL);
        if (validOdds.length === 0) {
          marketOdds.delete(selection);
        } else {
          marketOdds.set(selection, validOdds);
        }
      });

      if (marketOdds.size === 0) {
        this.oddsCache.delete(eventKey);
      }
    });
  }
}
