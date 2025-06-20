import { Alert } from '../hooks/useSmartAlerts';
import { useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  BookOdds,
  BettingOpportunity,
  TeaserLeg,
  TeaserStrategy,
  RiskProfileType,
} from '../types/betting';
import { Market } from '../types/sports';

export class BettingStrategyService {
  private static instance: BettingStrategyService;
  private historicalData: Map<string, BookOdds[]>;
  private activeAlerts: Alert[];

  private constructor() {
    this.historicalData = new Map();
    this.activeAlerts = [];
  }

  static getInstance(): BettingStrategyService {
    if (!BettingStrategyService.instance) {
      BettingStrategyService.instance = new BettingStrategyService();
    }
    return BettingStrategyService.instance;
  }

  private validateMarket(market: string, books: BookOdds[]): void {
    if (!market || !books || books.length < 2) {
      throw new Error('Invalid market data: Market requires at least two books for comparison');
    }

    const invalidOdds = books.find(
      book => !book.odds || book.odds <= 0 || !Number.isFinite(book.odds)
    );
    if (invalidOdds) {
      throw new Error(`Invalid odds detected for book ${invalidOdds.bookName}`);
    }
  }

  public detectArbitrage(markets: Map<string, BookOdds[]>): BettingOpportunity[] {
    const opportunities: BettingOpportunity[] = [];

    try {
      for (const [marketName, books] of markets) {
        this.validateMarket(marketName, books);

        const bestOdds = this.findBestOdds(books);
        const totalImpliedProb = this.calculateTotalImpliedProbability(bestOdds);

        if (totalImpliedProb < 1) {
          const expectedValue = (1 / totalImpliedProb - 1) * 100;
          opportunities.push({
            id: `arb_${marketName}_${Date.now()}`,
            sport: 'UNKNOWN',
            gameId: 'UNKNOWN',
            market: {
              id: marketName,
              name: marketName,
              type: 'match_winner',
              status: 'open',
              selections: [],
            },
            type: 'ARBITRAGE',
            description: `Arbitrage opportunity in ${marketName}`,
            books: bestOdds,
            expectedValue,
            confidence: 1 - totalImpliedProb,
            metadata: { timestamp: Date.now() },
            event: null as any, // Will be populated by the caller
            selection: null as any, // Will be populated by the caller
            odds: null as any, // Will be populated by the caller
            prediction: 0,
            riskLevel: RiskProfileType.MODERATE,
            timestamp: new Date().toISOString(),
            event_name: marketName,
            start_time: new Date().toISOString(),
          });
        }
      }
    } catch (error) {
      console.error('Error in arbitrage detection:', error);
      return [];
    }

    return opportunities;
  }

  public findMiddleOpportunities(markets: Map<string, BookOdds[]>): BettingOpportunity[] {
    const opportunities: BettingOpportunity[] = [];

    try {
      for (const [marketName, books] of markets) {
        this.validateMarket(marketName, books);

        const spreads = books
          .map(book => ({
            book,
            spread: this.oddsToSpread(book.odds),
          }))
          .filter(item => Number.isFinite(item.spread));

        if (spreads.length < 2) continue;

        const sortedSpreads = spreads.sort((a, b) => a.spread - b.spread);
        for (let i = 0; i < sortedSpreads.length - 1; i++) {
          const middleSize = sortedSpreads[i + 1].spread - sortedSpreads[i].spread;
          if (middleSize >= 1) {
            // Minimum 1 point middle
            const ev = this.calculateMiddleEV(
              middleSize,
              sortedSpreads[i].book.odds,
              sortedSpreads[i + 1].book.odds
            );

            if (ev > 0) {
              opportunities.push({
                id: `middle_${marketName}_${Date.now()}`,
                sport: 'UNKNOWN',
                gameId: 'UNKNOWN',
                market: {
                  id: marketName,
                  name: marketName,
                  type: 'match_winner',
                  status: 'open',
                  selections: [],
                },
                type: 'MIDDLE',
                description: `Middle opportunity in ${marketName}`,
                books: [sortedSpreads[i].book, sortedSpreads[i + 1].book],
                expectedValue: ev,
                confidence: middleSize / 7, // Normalized by typical spread range
                metadata: {
                  middleSize,
                  timestamp: Date.now(),
                },
                event: null as any, // Will be populated by the caller
                selection: null as any, // Will be populated by the caller
                odds: null as any, // Will be populated by the caller
                prediction: 0,
                riskLevel: RiskProfileType.MODERATE,
                timestamp: new Date().toISOString(),
                event_name: marketName,
                start_time: new Date().toISOString(),
              });
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in middle detection:', error);
      return [];
    }

    return opportunities;
  }

  public optimizeTeaserStrategy(legs: TeaserLeg[], points: number): TeaserStrategy {
    try {
      if (!legs || legs.length === 0) {
        throw new Error('No teaser legs provided');
      }

      if (points <= 0 || points > 10) {
        throw new Error('Invalid teaser points: Must be between 1 and 10');
      }

      const adjustedLegs = legs.map(leg => ({
        ...leg,
        adjustedOdds: this.adjustOddsForTeaser(leg.originalOdds ?? leg.odds ?? 0, points),
      }));

      const totalOdds = this.calculateTotalTeaserOdds(adjustedLegs);
      const expectedValue = this.calculateTeaserEV(adjustedLegs, totalOdds);

      // Validate correlation risk
      this.validateCorrelation(adjustedLegs);

      return {
        id: `teaser_${Date.now()}`,
        legs: adjustedLegs,
        totalOdds,
        expectedValue,
        riskAmount: 100, // Default risk amount
        potentialPayout: this.calculatePayout(100, totalOdds),
      };
    } catch (error) {
      console.error('Error in teaser optimization:', error);
      throw error; // Rethrow as this is a direct user action
    }
  }

  private validateCorrelation(legs: TeaserLeg[]): void {
    const correlatedGroups = new Map<string, TeaserLeg[]>();

    legs.forEach(leg => {
      if (leg.correlatedMarkets) {
        leg.correlatedMarkets.forEach(market => {
          if (!correlatedGroups.has(market)) {
            correlatedGroups.set(market, []);
          }
          correlatedGroups.get(market)?.push(leg);
        });
      }
    });

    correlatedGroups.forEach((groupLegs, market) => {
      if (groupLegs.length > 1) {
        throw new Error(`Correlated legs detected for market ${market}`);
      }
    });
  }

  private findBestOdds(books: BookOdds[]): BookOdds[] {
    return books.reduce((acc, book) => {
      const existingBook = acc.find(
        b => Math.abs(this.oddsToSpread(b.odds) - this.oddsToSpread(book.odds)) < 0.5
      );

      if (!existingBook || book.odds > existingBook.odds) {
        return [...acc.filter(b => b !== existingBook), book];
      }
      return acc;
    }, [] as BookOdds[]);
  }

  private calculateTotalImpliedProbability(books: BookOdds[]): number {
    return books.reduce((sum, book) => {
      const decimal = this.americanToDecimal(book.odds);
      return sum + 1 / decimal;
    }, 0);
  }

  private americanToDecimal(americanOdds: number): number {
    if (americanOdds > 0) {
      return americanOdds / 100 + 1;
    }
    return -100 / americanOdds + 1;
  }

  private oddsToSpread(odds: number): number {
    // Simplified conversion - would need more complex logic for real implementation
    return odds > 0 ? -odds / 20 : odds / 20;
  }

  private calculateMiddleEV(middleSize: number, odds1: number, odds2: number): number {
    const prob1 = 1 / this.americanToDecimal(odds1);
    const prob2 = 1 / this.americanToDecimal(odds2);
    const middleProb = (middleSize / 14) * (1 - (prob1 + prob2)); // Simplified model
    return middleProb * 100;
  }

  private adjustOddsForTeaser(odds: number, points: number): number {
    // Simplified adjustment - real implementation would use proper odds movement calculations
    return odds + points * 10;
  }

  private calculateTotalTeaserOdds(legs: TeaserLeg[]): number {
    return legs.reduce(
      (total, leg) =>
        total * this.americanToDecimal(leg.adjustedOdds ?? leg.originalOdds ?? leg.odds ?? 0),
      1
    );
  }

  private calculateTeaserEV(legs: TeaserLeg[], totalOdds: number): number {
    const winProb = legs.reduce((prob, leg) => {
      const individualProb =
        1 / this.americanToDecimal(leg.adjustedOdds ?? leg.originalOdds ?? leg.odds ?? 0);
      return prob * individualProb;
    }, 1);

    return (winProb * totalOdds - 1) * 100;
  }

  private calculatePayout(stake: number, odds: number): number {
    return stake * this.americanToDecimal(odds);
  }

  public addHistoricalData(market: string, odds: BookOdds): void {
    const existing = this.historicalData.get(market) || [];
    this.historicalData.set(market, [...existing, odds]);
  }

  public getHistoricalData(market: string): BookOdds[] {
    return this.historicalData.get(market) || [];
  }

  private createOpportunity(
    type: string,
    marketName: string,
    books: BookOdds[],
    expectedValue: number,
    confidence: number,
    metadata: Partial<BettingOpportunity['metadata']> = {},
    sport: string = 'UNKNOWN',
    gameId: string = uuidv4(),
    description: string = `${type} opportunity in ${marketName}`
  ): BettingOpportunity {
    return {
      id: uuidv4(),
      sport,
      gameId,
      type,
      market: {
        id: marketName,
        name: marketName,
        type: 'match_winner',
        status: 'open',
        selections: [],
      },
      description,
      books,
      expectedValue,
      confidence,
      metadata: {
        timestamp: Date.now(),
        source: 'betting-strategy',
        ...metadata,
      },
      event: null as any, // Will be populated by the caller
      selection: null as any, // Will be populated by the caller
      odds: null as any, // Will be populated by the caller
      prediction: 0,
      riskLevel: RiskProfileType.MODERATE,
      timestamp: new Date().toISOString(),
      event_name: marketName,
      start_time: new Date().toISOString(),
    };
  }
}

export default BettingStrategyService;
