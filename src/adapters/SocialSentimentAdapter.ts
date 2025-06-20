import { DataSource } from '../unified/DataSource.ts';
import { EventBus } from '../unified/EventBus.ts';
import { PerformanceMonitor } from '../unified/PerformanceMonitor.ts';
import { newsService } from '../services/newsService.js';

export interface SocialSentimentData {
  player: string;
  sentiment: {
    score: number; // -1 to 1
    volume: number; // number of mentions
    sources: {
      twitter: number;
      reddit: number;
      news: number;
    };
  };
  trending: boolean;
  keywords: string[];
  timestamp: number;
}

export class SocialSentimentAdapter implements DataSource<SocialSentimentData[]> {
  public readonly id = 'social-sentiment';
  public readonly type = 'sentiment-analysis';

  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private cache: {
    data: SocialSentimentData[] | null;
    timestamp: number;
  };

  constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.cache = {
      data: null,
      timestamp: 0,
    };
  }

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async fetch(): Promise<SocialSentimentData[]> {
    const traceId = this.performanceMonitor.startTrace('social-sentiment-fetch');

    try {
      if (this.isCacheValid()) {
        return this.cache.data!;
      }

      // Implement social media scraping and sentiment analysis
      const sentimentData = await this.gatherSocialSentiment();

      this.cache = {
        data: sentimentData,
        timestamp: Date.now(),
      };

      this.eventBus.publish({
        type: 'social-sentiment-updated',
        payload: { data: sentimentData },
      });

      this.performanceMonitor.endTrace(traceId);
      return sentimentData;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  private async gatherSocialSentiment(): Promise<SocialSentimentData[]> {
    // --- Twitter scraping (public search, no API key) ---
    async function fetchTwitterMentions(
      player: string
    ): Promise<{ score: number; volume: number }> {
      // TODO: Replace with real scraping or Twitter API if key is available
      // For now, use a public search endpoint (e.g., nitter.net or snscrape)
      // Example: fetch from nitter.net search page and parse tweets
      // This is a placeholder for demonstration using the player parameter
      const searchQuery = encodeURIComponent(player);
      console.log(`Searching Twitter for: ${searchQuery}`);
      return { score: Math.random() * 2 - 1, volume: Math.floor(Math.random() * 100) };
    }

    // --- Reddit scraping (public API) ---
    async function fetchRedditMentions(player: string): Promise<{ score: number; volume: number }> {
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(player)}&limit=20`;
      try {
        const res = await fetch(url);
        const json = await res.json();
        let score = 0;
        let volume = 0;
        for (const post of json.data.children) {
          const text = post.data.title + ' ' + post.data.selftext;
          // Simple sentiment: +1 for 'good', -1 for 'bad', 0 otherwise
          if (/good|win|hot|underrated|must/i.test(text)) score += 1;
          if (/bad|cold|overrated|injured|avoid/i.test(text)) score -= 1;
          volume++;
        }
        return { score: Math.max(-1, Math.min(1, score / (volume || 1))), volume };
      } catch {
        return { score: 0, volume: 0 };
      }
    }

    // --- News scraping (Google News RSS) ---
    async function fetchNewsMentions(player: string): Promise<{ score: number, volume: number }> {
      let score = 0;
      try {
        // Use newsService to fetch headlines and filter for the player
        const headlines: Array<{ title?: string; summary?: string }> = await newsService.fetchHeadlines('espn', 10);
        let volume = 0;
        for (const h of headlines) {
          const text = `${h.title || ''} ${h.summary || ''}`;
          // Only analyze headlines that mention the player
          if (text.toLowerCase().includes(player.toLowerCase())) {
            if (/good|win|hot|underrated|must/i.test(text)) score += 1;
            if (/bad|cold|overrated|injured|avoid/i.test(text)) score -= 1;
            volume++;
          }
        }
        return { score: Math.max(-1, Math.min(1, score / (volume || 1))), volume };
      } catch {
        return { score: 0, volume: 0 };
      }
    }

    // --- Main aggregation logic ---
    // TODO: Replace with real player list from projections or integration hub
    const players = ['LeBron James', 'Stephen Curry', 'Anthony Davis', 'Nikola Jokic'];
    const results: SocialSentimentData[] = [];
    for (const player of players) {
      const [twitter, reddit, news] = await Promise.all([
        fetchTwitterMentions(player),
        fetchRedditMentions(player),
        fetchNewsMentions(player),
      ]);
      const totalVolume = twitter.volume + reddit.volume + news.volume;
      const avgScore = (twitter.score + reddit.score + news.score) / 3;
      results.push({
        player,
        sentiment: {
          score: avgScore,
          volume: totalVolume,
          sources: {
            twitter: twitter.volume,
            reddit: reddit.volume,
            news: news.volume,
          },
        },
        trending: avgScore > 0.5 || avgScore < -0.5,
        keywords: [], // TODO: Extract keywords from posts
        timestamp: Date.now(),
      });
    }
    return results;
  }

  private isCacheValid(): boolean {
    const cacheTimeout = 5 * 60 * 1000; // 5 minutes
    return this.cache.data !== null && Date.now() - this.cache.timestamp < cacheTimeout;
  }

  public clearCache(): void {
    this.cache = {
      data: null,
      timestamp: 0,
    };
  }

  public async connect(): Promise<void> { }
  public async disconnect(): Promise<void> { }
  public async getData(): Promise<SocialSentimentData[]> {
    return this.cache.data as SocialSentimentData[];
  }

  public async fetchData(): Promise<SocialSentimentData[]> {
    return this.fetch();
  }
  public isConnected(): boolean {
    return true;
  }
  public getMetadata(): Record<string, unknown> {
    return { id: this.id, type: this.type };
  }
}

// TODO: Update EventMap in ../types/core.js to include 'social-sentiment-updated' event type for type safety.
