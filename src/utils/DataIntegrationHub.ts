import { DailyFantasyAdapter, DailyFantasyData } from '../adapters/DailyFantasyAdapter';
import { DataSource } from './DataSource';
import { ESPNAdapter } from '../adapters/ESPNAdapter';
import { EventBus } from './EventBus';
import { PerformanceMonitor } from './PerformanceMonitor';
import { PrizePicksAdapter, PrizePicksData } from '../betaTest4/src/adapters/PrizePicksAdapter';
import { SocialSentimentAdapter, SocialSentimentData } from '../adapters/SocialSentimentAdapter';
import { SportsRadarAdapter, SportsRadarData } from '../adapters/SportsRadarAdapter';
import { TheOddsAdapter, TheOddsData } from '../adapters/TheOddsAdapter';



export interface IntegratedData {
  timestamp: number;
  projections: {
    [playerId: string]: {
      stats: Record<string, number>;
      confidence: number;
      lastUpdated: number;
    };
  };
  sentiment: {
    [playerId: string]: SocialSentimentData;
  };
  odds: {
    [eventId: string]: {
      markets: Record<string, number>;
      movement: {
        direction: 'up' | 'down' | 'stable';
        magnitude: number;
      };
    };
  };
  injuries: {
    [playerId: string]: {
      status: string;
      details: string;
      impact: number;
      timeline: string;
    };
  };
  trends: {
    [metric: string]: {
      value: number;
      change: number;
      significance: number;
    };
  };
}

export interface DataSourceMetrics {
  latency: number;
  reliability: number;
  accuracy: number;
  lastSync: number;
}

interface DataCorrelation {
  sourceA: string;
  sourceB: string;
  correlation: number;
  significance: number;
  timestamp: number;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  correlations: DataCorrelation[];
  confidence: number;
}

export class DataIntegrationHub {
  private static instance: DataIntegrationHub;
  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly dataSources: Map<string, DataSource<any>>;
  private readonly sourceMetrics: Map<string, DataSourceMetrics>;
  private integratedData: IntegratedData;
  private correlationCache: Map<string, DataCorrelation[]>;
  private dataCache: Map<string, CacheEntry<any>>;
  private syncInterval: number;
  private isRealTimeEnabled: boolean;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.dataSources = new Map<string, DataSource<any>>();
    this.sourceMetrics = new Map();
    this.correlationCache = new Map();
    this.dataCache = new Map();
    this.integratedData = this.initializeIntegratedData();
    this.syncInterval = 30000; // 30 seconds default
    this.isRealTimeEnabled = false;

    // Register all adapters
    const espnAdapter = new ESPNAdapter();
    this.registerDataSource(espnAdapter);

    const socialSentimentAdapter = new SocialSentimentAdapter();
    this.registerDataSource(socialSentimentAdapter);

    // Configure and register TheOddsAdapter
    const theOddsApiKey = import.meta.env.VITE_THEODDS_API_KEY;
    if (theOddsApiKey) {
      const theOddsAdapter = new TheOddsAdapter({
        apiKey: theOddsApiKey,
        baseUrl: 'https://api.the-odds-api.com/v4',
        cacheTimeout: 300000 
      });
      this.registerDataSource(theOddsAdapter);
    } else {
      console.warn('TheOddsAdapter not initialized: VITE_THEODDS_API_KEY is missing.');
    }

    // Configure and register SportsRadarAdapter
    const sportsRadarApiKey = import.meta.env.VITE_SPORTRADAR_API_KEY;
    if (sportsRadarApiKey) {
      const sportsRadarAdapter = new SportsRadarAdapter({
        apiKey: sportsRadarApiKey,
        baseUrl: 'https://api.sportradar.us',
        cacheTimeout: 300000 
      });
      this.registerDataSource(sportsRadarAdapter);
    } else {
      console.warn('SportsRadarAdapter not initialized: VITE_SPORTRADAR_API_KEY is missing.');
    }

    // Configure and register DailyFantasyAdapter
    const dailyFantasyApiKey = import.meta.env.VITE_DAILYFANTASY_API_KEY;
    if (dailyFantasyApiKey) {
      const dailyFantasyAdapter = new DailyFantasyAdapter({
        apiKey: dailyFantasyApiKey,
        baseUrl: 'https://api.example.com/dailyfantasy', 
        cacheTimeout: 300000
      });
      this.registerDataSource(dailyFantasyAdapter);
    } else {
      console.warn('DailyFantasyAdapter not initialized: VITE_DAILYFANTASY_API_KEY is missing.');
    }

    // Configure and register PrizePicksAdapter
    const prizePicksApiKey = import.meta.env.VITE_PRIZEPICKS_API_KEY;
    if (prizePicksApiKey) {
      const prizePicksAdapter = new PrizePicksAdapter({
        apiKey: prizePicksApiKey,
        // baseUrl can be omitted to use default from PrizePicksAdapter
        // defaultLeagueId can be set here if there's a global default, e.g., 'NBA'
        cacheTimeout: 300000 // 5 minutes cache
      });
      this.registerDataSource(prizePicksAdapter);
    } else {
      console.warn('PrizePicksAdapter not initialized: VITE_PRIZEPICKS_API_KEY is missing.');
    }

    this.setupEventListeners();
  }

  static getInstance(): DataIntegrationHub {
    if (!DataIntegrationHub.instance) {
      DataIntegrationHub.instance = new DataIntegrationHub();
    }
    return DataIntegrationHub.instance;
  }

  private initializeIntegratedData(): IntegratedData {
    return {
      timestamp: Date.now(),
      projections: {},
      sentiment: {},
      odds: {},
      injuries: {},
      trends: {}
    };
  }

  public registerDataSource(source: DataSource<any>): void {
    this.dataSources.set(source.id, source);
    this.sourceMetrics.set(source.id, {
      latency: 0,
      reliability: 1,
      accuracy: 1,
      lastSync: 0
    });
  }

  public async startRealTimeSync(): Promise<void> {
    this.isRealTimeEnabled = true;
    await this.synchronizeAll();
  }

  public stopRealTimeSync(): void {
    this.isRealTimeEnabled = false;
  }

  public setSyncInterval(milliseconds: number): void {
    this.syncInterval = milliseconds;
  }

  private async synchronizeAll(): Promise<void> {
    const traceId = this.performanceMonitor.startTrace('data-sync');

    try {
      const syncPromises = Array.from(this.dataSources.entries()).map(
        async ([id, source]) => {
          const startTime = Date.now();
          try {
            const data = await source.fetch();
            this.updateSourceMetrics(id, startTime, true, (data as any)?.accuracy);
            return { id, data, error: null } as const;
          } catch (error) {
            this.updateSourceMetrics(id, startTime, false);
            return { id, data: null, error: error instanceof Error ? error : new Error(String(error)) } as const;
          }
        }
      );

      const results = await Promise.all(syncPromises);
      await this.integrateData(results);

      if (this.isRealTimeEnabled) {
        setTimeout(() => this.synchronizeAll(), this.syncInterval);
      }

      this.performanceMonitor.endTrace(traceId);
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  private updateSourceMetrics(
    sourceId: string,
    startTime: number,
    success: boolean,
    accuracy?: number
  ): void {
    const metrics = this.sourceMetrics.get(sourceId)!;
    const latency = Date.now() - startTime;

    metrics.latency = (metrics.latency * 0.8 + latency * 0.2);
    metrics.reliability = success
      ? Math.min(1, metrics.reliability * 0.95 + 0.05)
      : metrics.reliability * 0.9;
    if (accuracy !== undefined) {
      metrics.accuracy = (metrics.accuracy * 0.9 + accuracy * 0.1);
    }
    metrics.lastSync = Date.now();

    this.sourceMetrics.set(sourceId, metrics);
    this.eventBus.emit('data-source-metric-updated', {
      sourceId,
      latency: metrics.latency,
      reliability: metrics.reliability,
      accuracy: metrics.accuracy,
      lastSync: metrics.lastSync,
    });
  }

  private async integrateData(results: Array<{ id: string; data: any; error: Error | null }>): Promise<void> {
    const newData = this.initializeIntegratedData();
    const correlations: DataCorrelation[] = [];

    for (const result of results) {
      if (result.error) continue;

      // Cache the raw data with metadata
      const confidence = this.calculateDataConfidence(result.data);
      this.dataCache.set(result.id, { 
        data: result.data, 
        timestamp: Date.now(), 
        correlations: [], // Placeholder, to be updated later if correlation analysis is run on this source
        confidence 
      });

      this.updateIntegratedDataSource(newData, result);
    }

    // After all individual sources are processed and cached, perform cross-source analysis
    // For example, calculate correlations if multiple projection sources exist
    // this.analyzeAndCacheCorrelations(results.filter(r => !r.error).map(r => ({id: r.id, data: r.data })));

    this.integratedData = newData;
    this.eventBus.emit('data:integrated', { integratedData: this.integratedData, timestamp: Date.now() });
  }

  private calculateDataConfidence(data: any): number {
    // Basic confidence: presence of data and key fields
    if (!data) return 0;
    if (data.projections && Array.isArray(data.projections) && data.projections.length > 0) return 0.75;
    if (data.sentiment && Object.keys(data.sentiment).length > 0) return 0.7;
    // Add more sophisticated checks based on data quality, recency, etc.
    return 0.5; // Default baseline confidence
  }

  // Placeholder for a more sophisticated correlation analysis if needed
  // private analyzeAndCacheCorrelations(activeDataSources: Array<{id: string, data: any }>): void {
  //   // ... implementation ...
  // }

  private updateIntegratedDataSource(newData: IntegratedData, result: { id: string; data: any; error: Error | null }): void {
    if (result.error || !result.data) return;

    switch (result.id) {
      case 'daily-fantasy': // Assuming DailyFantasyAdapter.id is 'daily-fantasy'
        this.integrateProjections(newData, result.data as DailyFantasyData);
        break;
      case 'prize-picks': // Assuming PrizePicksAdapter.id is 'prize-picks'
        this.integratePrizePicksProjections(newData, result.data as PrizePicksData);
        break;
      case 'social-sentiment': // Assuming SocialSentimentAdapter.id is 'social-sentiment'
        this.integrateSentiment(newData, result.data as SocialSentimentData[]); // Assuming it's an array
        break;
      case 'sports-radar': // Assuming SportsRadarAdapter.id is 'sports-radar'
        this.integrateSportsData(newData, result.data as SportsRadarData);
        break;
      case 'the-odds': // Assuming TheOddsAdapter.id is 'the-odds'
        this.integrateOdds(newData, result.data as TheOddsData);
        break;
      // Add cases for other adapters like ESPN if they have specific integration logic
      default:
        console.warn(`DataIntegrationHub: No specific integration logic for source ID: ${result.id}`);
        // Attempt a generic integration or log/ignore
        break;
    }
  }

  private integrateProjections(newData: IntegratedData, projectionData: DailyFantasyData): void {
    if (!projectionData || !projectionData.projections) return;

    projectionData.projections.forEach(proj => {
      if (!proj.playerId || !proj.stats) return;

      newData.projections[proj.playerId] = {
        stats: proj.stats,
        confidence: proj.confidence !== undefined ? proj.confidence : 0.7, // Default confidence for DF projections
        lastUpdated: proj.lastUpdated || Date.now(),
      };
    });
  }

  // New method to integrate PrizePicks projection data
  private integratePrizePicksProjections(newData: IntegratedData, prizePicksData: PrizePicksData): void {
    if (!prizePicksData || !prizePicksData.projections) return;

    prizePicksData.projections.forEach(proj => {
      if (!proj.playerId || !proj.statType || proj.line === undefined) return;

      // Initialize player in projections if not already present
      if (!newData.projections[proj.playerId]) {
        newData.projections[proj.playerId] = {
          stats: {},
          confidence: 0, // Will be updated
          lastUpdated: Date.now() // Will be updated
        };
      }

      // Add/update the specific stat from PrizePicks
      // Note: PrizePicks gives one stat_type per projection object (e.g., 'Points', 'Rebounds')
      // This structure is slightly different from DailyFantasyData which might have a general 'stats' object
      newData.projections[proj.playerId].stats[proj.statType] = proj.line;
      
      // Update confidence and lastUpdated for this player
      // A more sophisticated confidence model could be used here, considering data freshness, source reliability etc.
      // For now, let's use a simple model. If multiple sources contribute, confidence could be averaged or maximized.
      const existingConfidence = newData.projections[proj.playerId].confidence || 0;
      newData.projections[proj.playerId].confidence = Math.max(existingConfidence, 0.75); // PrizePicks might be considered high confidence
      newData.projections[proj.playerId].lastUpdated = Date.now();
    });
  }

  private integrateSentiment(newData: IntegratedData, sentimentDataArray: SocialSentimentData[]): void {
    sentimentDataArray.forEach(data => {
      newData.sentiment[data.player] = data;
    });
  }

  private integrateSportsData(newData: IntegratedData, sportsData: SportsRadarData): void {
    sportsData.games.forEach(game => {
      game.players.forEach(player => {
        if (player.injuries.length > 0) {
          newData.injuries[player.id] = {
            status: player.injuries[0].status,
            details: player.injuries[0].type,
            impact: this.calculateInjuryImpact(player.injuries[0]),
            timeline: player.injuries[0].startDate
          };
        }
      });
    });
  }

  private integrateOdds(newData: IntegratedData, oddsData: TheOddsData): void {
    oddsData.events.forEach(event => {
      const markets: Record<string, number> = {};
      event.bookmakers.forEach(bookmaker => {
        bookmaker.markets.forEach(market => {
          market.outcomes.forEach(outcome => {
            markets[`${market.key}_${outcome.name}`] = outcome.price;
          });
        });
      });

      newData.odds[event.id] = {
        markets,
        movement: this.calculateOddsMovement(event.id, markets)
      };
    });
  }

  private calculateInjuryImpact(injury: { status: string; type: string }): number {
    const statusImpact = {
      out: 1,
      doubtful: 0.75,
      questionable: 0.5,
      probable: 0.25
    }[injury.status.toLowerCase()] ?? 0;

    return statusImpact;
  }

  private calculateOddsMovement(
    eventId: string,
    currentMarkets: Record<string, number>
  ): { direction: 'up' | 'down' | 'stable'; magnitude: number } {
    const previousData = this.integratedData.odds[eventId];
    if (!previousData) {
      return { direction: 'stable', magnitude: 0 };
    }

    const avgCurrentPrice = Object.values(currentMarkets).reduce((a, b) => a + b, 0) / Object.values(currentMarkets).length;
    const avgPreviousPrice = Object.values(previousData.markets).reduce((a, b) => a + b, 0) / Object.values(previousData.markets).length;
    
    const difference = avgCurrentPrice - avgPreviousPrice;
    const magnitude = Math.abs(difference);
    
    if (magnitude < 0.05) return { direction: 'stable', magnitude };
    return {
      direction: difference > 0 ? 'up' : 'down',
      magnitude
    };
  }

  private analyzeTrendsWithCorrelations(newData: IntegratedData, correlations: DataCorrelation[]): void {
    // Analyze projection trends
    this.analyzeProjectionTrends(newData);
    
    // Analyze sentiment trends
    this.analyzeSentimentTrends(newData);
    
    // Analyze market trends
    this.analyzeMarketTrends(newData);
    
    // Analyze correlation trends
    this.analyzeCorrelationTrends(newData, correlations);
  }

  private analyzeProjectionTrends(newData: IntegratedData): void {
    Object.entries(newData.projections).forEach(([playerId, projection]) => {
      Object.entries(projection.stats).forEach(([metric, value]) => {
        const trendKey = `${playerId}_${metric}`;
        const previousValue = this.integratedData.projections[playerId]?.stats[metric];
        
        if (previousValue !== undefined) {
          const change = value - previousValue;
          const significance = this.calculateTrendSignificance(change, previousValue);
          
          newData.trends[trendKey] = {
            value,
            change,
            significance
          };
        }
      });
    });
  }

  private analyzeSentimentTrends(newData: IntegratedData): void {
    Object.entries(newData.sentiment).forEach(([playerId, sentiment]) => {
      const trendKey = `${playerId}_sentiment`;
      const previousSentiment = this.integratedData.sentiment[playerId];
      
      if (previousSentiment) {
        const change = sentiment.sentiment.score - previousSentiment.sentiment.score;
        const volumeChange = sentiment.sentiment.volume - previousSentiment.sentiment.volume;
        const significance = this.calculateTrendSignificance(change, previousSentiment.sentiment.score);
        
        newData.trends[trendKey] = {
          value: sentiment.sentiment.score,
          change,
          significance: significance * (1 + Math.min(1, volumeChange / 1000))
        };
      }
    });
  }

  private analyzeMarketTrends(newData: IntegratedData): void {
    Object.entries(newData.odds).forEach(([eventId, odds]) => {
      Object.entries(odds.markets).forEach(([market, price]) => {
        const trendKey = `${eventId}_${market}`;
        const previousPrice = this.integratedData.odds[eventId]?.markets[market];
        
        if (previousPrice !== undefined) {
          const change = price - previousPrice;
          const significance = this.calculateTrendSignificance(change, previousPrice);
          
          newData.trends[trendKey] = {
            value: price,
            change,
            significance
          };
        }
      });
    });
  }

  private analyzeCorrelationTrends(newData: IntegratedData, correlations: DataCorrelation[]): void {
    // Analyze correlations between different data points
    Object.entries(newData.projections).forEach(([playerId, projection]) => {
      const sentiment = newData.sentiment[playerId];
      const injuries = newData.injuries[playerId];
      
      if (sentiment && projection) {
        const correlationKey = `${playerId}_sentiment_correlation`;
        const sentimentImpact = sentiment.sentiment.score * (sentiment.sentiment.volume / 1000);
        const performanceCorrelation = this.calculateCorrelation(
          Object.values(projection.stats),
          [sentimentImpact]
        );
        
        newData.trends[correlationKey] = {
          value: performanceCorrelation,
          change: 0, // We don't track change for correlations
          significance: Math.abs(performanceCorrelation)
        };
      }
      
      if (injuries) {
        const injuryKey = `${playerId}_injury_impact`;
        newData.trends[injuryKey] = {
          value: injuries.impact,
          change: 0,
          significance: injuries.impact
        };
      }
    });

    // Analyze correlations with other data sources
    for (const correlation of correlations) {
      const sourceA = correlation.sourceA;
      const sourceB = correlation.sourceB;
      const correlationValue = correlation.correlation;
      const significance = correlation.significance;

      const trendKey = `${sourceA}_${sourceB}_correlation`;
      newData.trends[trendKey] = {
        value: correlationValue,
        change: 0,
        significance: significance
      };
    }
  }

  private calculateTrendSignificance(change: number, baseValue: number): number {
    if (baseValue === 0) return change === 0 ? 0 : 1;
    const percentageChange = Math.abs(change / baseValue);
    return Math.min(1, percentageChange);
  }

  private calculateCorrelation(series1: number[], series2: number[]): number {
    if (series1.length !== series2.length || series1.length === 0) return 0;
    
    const mean1 = series1.reduce((a, b) => a + b, 0) / series1.length;
    const mean2 = series2.reduce((a, b) => a + b, 0) / series2.length;
    
    const variance1 = series1.reduce((a, b) => a + Math.pow(b - mean1, 2), 0);
    const variance2 = series2.reduce((a, b) => a + Math.pow(b - mean2, 2), 0);
    
    if (variance1 === 0 || variance2 === 0) return 0;
    
    const covariance = series1.reduce((a, b, i) => {
      return a + ((b - mean1) * (series2[i] - mean2));
    }, 0);
    
    return covariance / Math.sqrt(variance1 * variance2);
  }

  private setupEventListeners(): void {
    this.eventBus.on('dataSource:error', async (event) => {
      const sourceId = event.sourceId;
      const metrics = this.sourceMetrics.get(sourceId);
      if (metrics) {
        metrics.reliability *= 0.9;
        this.sourceMetrics.set(sourceId, metrics);
      }
    });

    this.eventBus.on('cache:clear', (event) => {
      if (event.source === 'all' || event.source === 'dataHub') {
        this.dataCache.clear();
        this.correlationCache.clear();
        this.integratedData = this.initializeIntegratedData();
        
        this.eventBus.emit('cache:cleared', { source: 'dataHub' });
      }
    });

    this.eventBus.on('config:updated', (event) => {
      if (event.section === 'dataSources' || event.section === 'all') {
        
      }
    });
  }

  public getIntegratedData(): IntegratedData {
    return this.integratedData;
  }

  public getSourceMetrics(): Map<string, DataSourceMetrics> {
    return new Map(this.sourceMetrics);
  }
} 