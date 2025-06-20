import { apiService } from '../services/api/ApiService.js';

interface TwitterConfig {
  apiKey: string;
  baseUrl: string;
}

interface Tweet {
  id: string;
  text: string;
  author: {
    id: string;
    username: string;
    followers: number;
    verified: boolean;
  };
  metrics: {
    likes: number;
    retweets: number;
    replies: number;
  };
  sentiment: {
    score: number;
    confidence: number;
    aspects: {
      [key: string]: number;
    };
  };
  createdAt: string;
}

interface SentimentAnalysis {
  overall: {
    score: number;
    confidence: number;
    volume: number;
  };
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
  influencers: {
    author: {
      id: string;
      username: string;
      followers: number;
    };
    impact: number;
    sentiment: number;
  }[];
}

class TwitterService {
  private config: TwitterConfig;

  constructor() {
    this.config = {
      apiKey: process.env.REACT_APP_TWITTER_API_KEY || '',
      baseUrl: process.env.REACT_APP_TWITTER_API_URL || 'https://api.twitter.com',
    };
  }

  async searchTweets(
    query: string,
    options?: {
      startTime?: string;
      endTime?: string;
      maxResults?: number;
    }
  ): Promise<Tweet[]> {
    try {
      const params: Record<string, string | number | boolean | string[] | undefined> = {
        apiKey: this.config.apiKey,
        query,
        ...(options || {}),
      };

      const response = await apiService.get<Tweet[]>('/twitter/search', params);
      return response;
    } catch (error) {
      console.error('Failed to search tweets:', error);
      throw error;
    }
  }

  async getSentimentAnalysis(
    entity: string,
    options?: {
      startTime?: string;
      endTime?: string;
      aspects?: string[];
    }
  ): Promise<SentimentAnalysis> {
    try {
      const params: Record<string, string | number | boolean | string[] | undefined> = {
        apiKey: this.config.apiKey,
        entity,
        ...(options || {}),
      };

      const response = await apiService.get<SentimentAnalysis>('/twitter/sentiment', params);
      return response;
    } catch (error) {
      console.error('Failed to get sentiment analysis:', error);
      throw error;
    }
  }

  async getTrendingTopics(sport: string): Promise<string[]> {
    try {
      const response = await apiService.get<string[]>(`/twitter/trends/${sport}`, {
        apiKey: this.config.apiKey,
      });
      return response;
    } catch (error) {
      console.error('Failed to get trending topics:', error);
      throw error;
    }
  }

  async getUserSentiment(username: string): Promise<{
    overall: number;
    recent: number;
    topics: {
      [key: string]: number;
    };
  }> {
    try {
      const response = await apiService.get(`/twitter/users/${username}/sentiment`, {
        apiKey: this.config.apiKey,
      });
      return response;
    } catch (error) {
      console.error('Failed to get user sentiment:', error);
      throw error;
    }
  }
}

export const twitterService = new TwitterService();
