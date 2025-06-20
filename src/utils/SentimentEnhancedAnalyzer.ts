import { Analyzer } from '../core/Analyzer.js';
import { EventBus } from '../core/EventBus.js';
import { PerformanceMonitor } from '../core/PerformanceMonitor.js';
import { ProjectionAnalysis } from './ProjectionAnalyzer.js';
import { SocialSentimentData } from '../adapters/SocialSentimentAdapter.js';
import { SportsRadarData } from '../adapters/SportsRadarAdapter.js';
import { TheOddsData } from '../adapters/TheOddsAdapter.js';

// See roadmap for odds data type finalization
interface OddsData {
  moneyline?: number;
  spread?: number;
  total?: number;
  consensus?: {
    over?: number;
    under?: number;
  };
}




export interface EnhancedAnalysis extends ProjectionAnalysis {
  sentiment: {
    score: number;
    volume: number;
    trending: boolean;
    keywords: string[];
  };
  marketData: {
    odds: {
      moneyline?: number;
      spread?: number;
      total?: number;
    };
    consensus: {
      overPercentage: number;
      underPercentage: number;
    };
  };
  injuries: {
    player: string;
    status: string;
    impact: number;
  }[];
}

interface AnalysisInput {
  projectionAnalysis: ProjectionAnalysis[];
  sentimentData: SocialSentimentData[];
  sportsRadarData: SportsRadarData;
  oddsData: TheOddsData;
}

export class SentimentEnhancedAnalyzer implements Analyzer<AnalysisInput, EnhancedAnalysis[]> {
  public readonly id = 'sentiment-enhanced-analyzer';
  public readonly type = 'enhanced-analysis';
  public readonly name = 'Sentiment Enhanced Analyzer';
  public readonly description = 'Enhances projections with sentiment, odds, and injury data.';

  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly sentimentWeight: number;
  // _oddsWeight is reserved for future odds-based confidence logic
  // private readonly _oddsWeight: number; // Reserved for future use
  private readonly injuryWeight: number;

  constructor(
    sentimentWeight = 0.2,
    // oddsWeight = 0.3, // Reserved for future use
    injuryWeight = 0.2
  ) {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.sentimentWeight = sentimentWeight;
    // this._oddsWeight = oddsWeight; // Reserved for future use, suppress unused warning
    this.injuryWeight = injuryWeight;
  }

  public validate(data: AnalysisInput): boolean { return Array.isArray(data.projectionAnalysis); }

  public getMetrics() { return { accuracy: 1, latency: 0, errorRate: 0 }; }

  public async analyze(input: AnalysisInput): Promise<EnhancedAnalysis[]> {
    const traceId = this.performanceMonitor.startTrace('enhanced-analysis');

    try {
      const enhancedAnalyses = input.projectionAnalysis.map(projection => {
        const sentiment = this.findPlayerSentiment(projection.player, input.sentimentData);
        const injuries = this.findPlayerInjuries(projection.player, input.sportsRadarData);
        // Extract odds for the player from oddsData if available
        const odds = this.findPlayerOdds(projection.player, input.oddsData);

        const enhancedConfidence = this.calculateEnhancedConfidence(
          projection.confidence,
          sentiment,
          odds,
          injuries
        );

        return {
          ...projection,
          confidence: enhancedConfidence,
          sentiment: {
            score: sentiment?.sentiment.score ?? 0,
            volume: sentiment?.sentiment.volume ?? 0,
            trending: sentiment?.trending ?? false,
            keywords: sentiment?.keywords ?? []
          },
          marketData: {
            odds: {
              moneyline: odds?.moneyline,
              spread: odds?.spread,
              total: odds?.total
            },
            consensus: {
              overPercentage: odds?.consensus?.over ?? 50,
              underPercentage: odds?.consensus?.under ?? 50
            }
          },
          injuries: injuries.map(injury => ({
            player: injury.player,
            status: injury.status,
            impact: this.calculateInjuryImpact(injury)
          }))
        };
      });

      // Use eventBus.emit instead of non-existent publish
      this.eventBus.emit('enhanced-analysis-completed', { data: enhancedAnalyses });

      this.performanceMonitor.endTrace(traceId);
      return enhancedAnalyses;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  public async confidence(input: AnalysisInput): Promise<number> {
    const analyses = await this.analyze(input);
    return analyses.reduce((acc, analysis) => acc + analysis.confidence, 0) / analyses.length;
  }

  private findPlayerSentiment(
    player: string,
    sentimentData: SocialSentimentData[]
  ): SocialSentimentData | undefined {
    return sentimentData.find(data => data.player === player);
  }

  private findPlayerInjuries(
    player: string,
    sportsData: SportsRadarData
  ): Array<{ player: string; status: string; type: string }> {
    const injuries: Array<{ player: string; status: string; type: string }> = [];
    
    sportsData.games.forEach((game: { players: Array<{ name: string; injuries: Array<{ status: string; type: string }> }> }) => {
      game.players.forEach((p: { name: string; injuries: Array<{ status: string; type: string }> }) => {
        if (p.name === player) {
          p.injuries.forEach((injury: { status: string; type: string }) => {
            injuries.push({
              player: p.name,
              status: injury.status,
              type: injury.type
            });
          });
        }
      });
    });

    return injuries;
  }

  /**
   * Attempts to find odds for a given player from the provided odds data.
   * Returns an OddsData object or null if not found.
   */
  private findPlayerOdds(player: string, oddsData?: TheOddsData): OddsData | null {
    if (!oddsData || !oddsData.events) return null;
    for (const event of oddsData.events) {
      for (const bookmaker of event.bookmakers) {
        for (const market of bookmaker.markets) {
          for (const outcome of market.outcomes) {
            if (outcome.name === player) {
              return {
                moneyline: outcome.price,
                spread: outcome.point,
                total: undefined,
                consensus: undefined
              };
            }
          }
        }
      }
    }
    return null;
  }

  private calculateEnhancedConfidence(
    baseConfidence: number,
    sentiment?: SocialSentimentData,
    // TODO: Replace 'OddsData' with actual odds type when finalized
    // See roadmap for odds type finalization
    odds?: OddsData | null,
    injuries: Array<{ player: string; status: string; type: string }> = []
  ): number {
    let confidence = baseConfidence;

    // Apply sentiment adjustment
    if (sentiment) {
      confidence += this.sentimentWeight * sentiment.sentiment.score;
    }

    // Apply odds adjustment
    if (odds) {
      // Implement odds-based confidence adjustment
    }

    // Apply injury adjustment
    if (injuries.length > 0) {
      const injuryImpact = injuries.reduce(
        (acc, injury) => acc + this.calculateInjuryImpact(injury),
        0
      );
      confidence -= this.injuryWeight * injuryImpact;
    }

    // Ensure confidence stays within 0-1 range
    return Math.max(0, Math.min(1, confidence));
  }

  private calculateInjuryImpact(injury: { status: string; type: string }): number {
    // Implement injury impact calculation
    switch (injury.status.toLowerCase()) {
      case 'out':
        return 1;
      case 'doubtful':
        return 0.75;
      case 'questionable':
        return 0.5;
      case 'probable':
        return 0.25;
      default:
        return 0;
    }
  }
}