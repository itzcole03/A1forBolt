import { adapterManager } from '../adapters';
import { SportsRadarAdapter } from '../adapters';
import { measurePerformance, handleApiError, transformData } from '../utils';
import { LiveScore, GameDetails, PlayerStats } from '../../types';

class SportsRadarService {
  private adapter: SportsRadarAdapter;

  constructor() {
    this.adapter = adapterManager.getAdapter<SportsRadarAdapter>('sportsradar')!;
  }

  async fetchLiveScores(): Promise<LiveScore[]> {
    return measurePerformance(async () => {
      try {
        const data = await this.adapter.fetchLiveScores();
        return transformData(data, this.transformLiveScores, 'sportsradar.fetchLiveScores');
      } catch (error) {
        handleApiError(error, 'sportsradar.fetchLiveScores');
      }
    }, 'sportsradar.fetchLiveScores');
  }

  async fetchGameDetails(gameId: string): Promise<GameDetails> {
    return measurePerformance(async () => {
      try {
        const data = await this.adapter.fetchGameDetails(gameId);
        return transformData(data, this.transformGameDetails, 'sportsradar.fetchGameDetails');
      } catch (error) {
        handleApiError(error, 'sportsradar.fetchGameDetails');
      }
    }, 'sportsradar.fetchGameDetails');
  }

  async fetchPlayerStats(playerId: string): Promise<PlayerStats> {
    return measurePerformance(async () => {
      try {
        const data = await this.adapter.fetchPlayerStats(playerId);
        return transformData(data, this.transformPlayerStats, 'sportsradar.fetchPlayerStats');
      } catch (error) {
        handleApiError(error, 'sportsradar.fetchPlayerStats');
      }
    }, 'sportsradar.fetchPlayerStats');
  }

  private transformLiveScores(data: any): LiveScore[] {
    return data.map((game: any) => ({
      id: game.id,
      homeTeam: {
        id: game.home_team.id,
        name: game.home_team.name,
        score: game.home_team.score,
      },
      awayTeam: {
        id: game.away_team.id,
        name: game.away_team.name,
        score: game.away_team.score,
      },
      status: game.status,
      startTime: game.start_time,
      league: game.league,
      period: game.period,
      clock: game.clock,
    }));
  }

  private transformGameDetails(data: any): GameDetails {
    return {
      id: data.id,
      homeTeam: {
        id: data.home_team.id,
        name: data.home_team.name,
        score: data.home_team.score,
        stats: data.home_team.stats,
      },
      awayTeam: {
        id: data.away_team.id,
        name: data.away_team.name,
        score: data.away_team.score,
        stats: data.away_team.stats,
      },
      status: data.status,
      startTime: data.start_time,
      endTime: data.end_time,
      league: data.league,
      venue: data.venue,
      officials: data.officials,
      period: data.period,
      clock: data.clock,
      boxScore: data.box_score,
      playByPlay: data.play_by_play,
    };
  }

  private transformPlayerStats(data: any): PlayerStats {
    return {
      id: data.id,
      name: data.name,
      team: data.team,
      position: data.position,
      stats: {
        gamesPlayed: data.stats.games_played,
        minutesPlayed: data.stats.minutes_played,
        points: data.stats.points,
        rebounds: data.stats.rebounds,
        assists: data.stats.assists,
        steals: data.stats.steals,
        blocks: data.stats.blocks,
        turnovers: data.stats.turnovers,
        fouls: data.stats.fouls,
        fieldGoals: {
          made: data.stats.field_goals.made,
          attempted: data.stats.field_goals.attempted,
          percentage: data.stats.field_goals.percentage,
        },
        threePointers: {
          made: data.stats.three_pointers.made,
          attempted: data.stats.three_pointers.attempted,
          percentage: data.stats.three_pointers.percentage,
        },
        freeThrows: {
          made: data.stats.free_throws.made,
          attempted: data.stats.free_throws.attempted,
          percentage: data.stats.free_throws.percentage,
        },
      },
      season: data.season,
      lastUpdated: data.last_updated,
    };
  }
}

// Export a singleton instance
export const sportsRadarService = new SportsRadarService();
