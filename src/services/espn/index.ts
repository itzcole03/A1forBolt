import { adapterManager } from '../adapters';
import { ESPNAdapter } from '../adapters';
import { measurePerformance, handleApiError, transformData } from '../utils';
import { Headline, GameSummary, PlayerNews } from '../../types';

class ESPNService {
  private adapter: ESPNAdapter;

  constructor() {
    this.adapter = adapterManager.getAdapter<ESPNAdapter>('espn')!;
  }

  async fetchHeadlines(): Promise<Headline[]> {
    return measurePerformance(async () => {
      try {
        const data = await this.adapter.fetchHeadlines();
        return transformData(data, this.transformHeadlines, 'espn.fetchHeadlines');
      } catch (error) {
        handleApiError(error, 'espn.fetchHeadlines');
      }
    }, 'espn.fetchHeadlines');
  }

  async fetchGameSummary(gameId: string): Promise<GameSummary> {
    return measurePerformance(async () => {
      try {
        const data = await this.adapter.fetchGameSummary(gameId);
        return transformData(data, this.transformGameSummary, 'espn.fetchGameSummary');
      } catch (error) {
        handleApiError(error, 'espn.fetchGameSummary');
      }
    }, 'espn.fetchGameSummary');
  }

  async fetchPlayerNews(playerId: string): Promise<PlayerNews[]> {
    return measurePerformance(async () => {
      try {
        const data = await this.adapter.fetchPlayerNews(playerId);
        return transformData(data, this.transformPlayerNews, 'espn.fetchPlayerNews');
      } catch (error) {
        handleApiError(error, 'espn.fetchPlayerNews');
      }
    }, 'espn.fetchPlayerNews');
  }

  private transformHeadlines(data: any): Headline[] {
    return data.map((headline: any) => ({
      id: headline.id,
      title: headline.title,
      description: headline.description,
      url: headline.url,
      imageUrl: headline.image_url,
      publishedAt: headline.published_at,
      author: headline.author,
      category: headline.category,
      tags: headline.tags,
    }));
  }

  private transformGameSummary(data: any): GameSummary {
    return {
      id: data.id,
      homeTeam: {
        id: data.home_team.id,
        name: data.home_team.name,
        score: data.home_team.score,
        record: data.home_team.record,
      },
      awayTeam: {
        id: data.away_team.id,
        name: data.away_team.name,
        score: data.away_team.score,
        record: data.away_team.record,
      },
      status: data.status,
      startTime: data.start_time,
      endTime: data.end_time,
      league: data.league,
      venue: data.venue,
      summary: data.summary,
      highlights: data.highlights,
      stats: data.stats,
      boxScore: data.box_score,
      playByPlay: data.play_by_play,
    };
  }

  private transformPlayerNews(data: any): PlayerNews[] {
    return data.map((news: any) => ({
      id: news.id,
      title: news.title,
      content: news.content,
      url: news.url,
      imageUrl: news.image_url,
      publishedAt: news.published_at,
      author: news.author,
      source: news.source,
      category: news.category,
      tags: news.tags,
      playerId: news.player_id,
      playerName: news.player_name,
      team: news.team,
    }));
  }
}

// Export a singleton instance
export const espnService = new ESPNService();
