import axios from 'axios';
import * as cheerio from 'cheerio';

interface SentimentConfig {
  baseUrl: string;
}

interface SentimentData {
  entity: string;
  score: number;
  confidence: number;
  sources: {
    name: string;
    score: number;
    volume: number;
  }[];
  timeline: {
    timestamp: string;
    score: number;
    volume: number;
  }[];
  aspects: {
    [key: string]: {
      score: number;
      volume: number;
    };
  };
}

interface Post {
  title: string;
  text: string;
  score: number;
  comments: number;
  created: number;
}

interface Article {
  title: string;
  summary: string;
  date: string;
  content?: string;
}

class SentimentService {
  private config: SentimentConfig;

  constructor() {
    this.config = {
      baseUrl: process.env.REACT_APP_SENTIMENT_API_URL || 'http://localhost:8000',
    };
  }

  async getSentiment(
    entity: string,
    options?: {
      startTime?: string;
      endTime?: string;
      sources?: string[];
    }
  ): Promise<SentimentData> {
    try {
      // Scrape data from multiple sources
      const [redditData, espnData, rotowireData] = await Promise.all([
        this.scrapeReddit(entity),
        this.scrapeESPN(entity),
        this.scrapeRotowire(entity),
      ]);

      // Combine and analyze the data
      const combinedData = this.combineSentimentData([
        { name: 'Reddit', data: redditData },
        { name: 'ESPN', data: espnData },
        { name: 'Rotowire', data: rotowireData },
      ]);

      return {
        entity,
        score: this.calculateOverallScore(combinedData),
        confidence: this.calculateConfidence(combinedData),
        sources: combinedData.map(source => ({
          name: source.name,
          score: source.data.score,
          volume: source.data.volume,
        })),
        timeline: this.generateTimeline(combinedData),
        aspects: this.extractAspects(combinedData),
      };
    } catch (error) {
      console.error('Failed to get sentiment:', error);
      throw error;
    }
  }

  private async scrapeReddit(entity: string): Promise<{ score: number; volume: number }> {
    try {
      const response = await axios.get(`https://www.reddit.com/search.json`, {
        params: {
          q: entity,
          sort: 'relevance',
          t: 'day',
          limit: 100,
        },
      });

      const posts = response.data.data.children.map((post: any) => ({
        title: post.data.title,
        text: post.data.selftext,
        score: post.data.score,
        comments: post.data.num_comments,
        created: post.data.created_utc,
      }));

      return this.analyzeRedditSentiment(posts);
    } catch (error) {
      console.error('Failed to scrape Reddit:', error);
      return { score: 0, volume: 0 };
    }
  }

  private async scrapeESPN(entity: string): Promise<{ score: number; volume: number }> {
    try {
      const response = await axios.get(
        `https://www.espn.com/search/_/q/${encodeURIComponent(entity)}`
      );
      const $ = cheerio.load(response.data);

      const articles = $('.article')
        .map((_: number, el: cheerio.Element) => ({
          title: $(el).find('.title').text(),
          summary: $(el).find('.summary').text(),
          date: $(el).find('.date').text(),
        }))
        .get();

      return this.analyzeESPNSentiment(articles);
    } catch (error) {
      console.error('Failed to scrape ESPN:', error);
      return { score: 0, volume: 0 };
    }
  }

  private async scrapeRotowire(entity: string): Promise<{ score: number; volume: number }> {
    try {
      const response = await axios.get(
        `https://www.rotowire.com/search.php?search=${encodeURIComponent(entity)}`
      );
      const $ = cheerio.load(response.data);

      const news = $('.news-item')
        .map((_: number, el: cheerio.Element) => ({
          title: $(el).find('.title').text(),
          content: $(el).find('.content').text(),
          date: $(el).find('.date').text(),
        }))
        .get();

      return this.analyzeRotowireSentiment(news);
    } catch (error) {
      console.error('Failed to scrape Rotowire:', error);
      return { score: 0, volume: 0 };
    }
  }

  private analyzeRedditSentiment(posts: Post[]): { score: number; volume: number } {
    const totalScore = posts.reduce((acc, post) => {
      const postScore = (post.score + post.comments) / 1000;
      return acc + postScore;
    }, 0);

    return {
      score: totalScore / posts.length,
      volume: posts.length,
    };
  }

  private analyzeESPNSentiment(articles: Article[]): { score: number; volume: number } {
    const totalScore = articles.reduce((acc, article) => {
      const positiveWords = ['win', 'great', 'excellent', 'strong', 'impressive'];
      const negativeWords = ['loss', 'poor', 'weak', 'disappointing', 'struggling'];

      const text = `${article.title} ${article.summary}`.toLowerCase();
      const positiveCount = positiveWords.filter(word => text.includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.includes(word)).length;

      return acc + (positiveCount - negativeCount);
    }, 0);

    return {
      score: totalScore / articles.length,
      volume: articles.length,
    };
  }

  private analyzeRotowireSentiment(news: Article[]): { score: number; volume: number } {
    const totalScore = news.reduce((acc, item) => {
      const positiveWords = ['upgrade', 'improving', 'healthy', 'starting', 'productive'];
      const negativeWords = ['downgrade', 'injured', 'questionable', 'limited', 'struggling'];

      const text = `${item.title} ${item.content}`.toLowerCase();
      const positiveCount = positiveWords.filter(word => text.includes(word)).length;
      const negativeCount = negativeWords.filter(word => text.includes(word)).length;

      return acc + (positiveCount - negativeCount);
    }, 0);

    return {
      score: totalScore / news.length,
      volume: news.length,
    };
  }

  private combineSentimentData(
    sources: { name: string; data: { score: number; volume: number } }[]
  ): any[] {
    return sources.map(source => ({
      ...source,
      weight: source.data.volume / sources.reduce((acc, s) => acc + s.data.volume, 0),
    }));
  }

  private calculateOverallScore(combinedData: any[]): number {
    return combinedData.reduce((acc, source) => {
      return acc + source.data.score * source.weight;
    }, 0);
  }

  private calculateConfidence(combinedData: any[]): number {
    const totalVolume = combinedData.reduce((acc, source) => acc + source.data.volume, 0);
    return Math.min(totalVolume / 100, 1); // Normalize to 0-1 range
  }

  private generateTimeline(
    combinedData: any[]
  ): { timestamp: string; score: number; volume: number }[] {
    // Implement timeline generation based on the data
    return [];
  }

  private extractAspects(combinedData: any[]): {
    [key: string]: { score: number; volume: number };
  } {
    // Implement aspect extraction from the data
    return {};
  }
}

export const sentimentService = new SentimentService();
