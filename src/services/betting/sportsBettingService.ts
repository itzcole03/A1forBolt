import { predictionOptimizationService } from '../analytics/predictionOptimizationService';
import { mlService } from '../analytics/mlService';
import { advancedMLService } from '../analytics/advancedMLService';
import { timeSeriesService } from '../analytics/timeSeriesService';
import { riskModelingService } from '../analytics/riskModelingService';
import { featureEngineeringService } from '../analytics/featureEngineeringService';

interface BettingOdds {
  homeTeam: string;
  awayTeam: string;
  homeOdds: number;
  awayOdds: number;
  drawOdds?: number;
  bookmaker: string;
  timestamp: number;
}

interface TeamStats {
  team: string;
  recentForm: string[];
  homeForm?: string[];
  awayForm?: string[];
  goalsScored: number;
  goalsConceded: number;
  xG: number;
  xGA: number;
  injuries: string[];
  rankings: {
    overall: number;
    home?: number;
    away?: number;
  };
}

interface MatchPrediction {
  homeWinProbability: number;
  awayWinProbability: number;
  drawProbability: number;
  recommendedBet: {
    type: 'home' | 'away' | 'draw' | 'none';
    stake: number;
    odds: number;
    expectedValue: number;
    confidence: number;
  };
  insights: {
    keyFactors: string[];
    riskLevel: 'low' | 'medium' | 'high';
    valueAssessment: string;
    modelConsensus: number;
  };
}

class SportsBettingService {
  private readonly API_ENDPOINTS = {
    ODDS: process.env.ODDS_API_ENDPOINT,
    STATS: process.env.STATS_API_ENDPOINT,
    HISTORICAL: process.env.HISTORICAL_DATA_ENDPOINT,
  };

  private readonly API_KEYS = {
    ODDS: process.env.ODDS_API_KEY,
    STATS: process.env.STATS_API_KEY,
    HISTORICAL: process.env.HISTORICAL_API_KEY,
  };

  constructor() {
    this.validateApiConfig();
  }

  private validateApiConfig() {
    Object.entries(this.API_ENDPOINTS).forEach(([name, endpoint]) => {
      if (!endpoint) {
        throw new Error(`Missing ${name} API endpoint configuration`);
      }
    });

    Object.entries(this.API_KEYS).forEach(([name, key]) => {
      if (!key) {
        throw new Error(`Missing ${name} API key configuration`);
      }
    });
  }

  public async getMatchPrediction(
    homeTeam: string,
    awayTeam: string,
    league: string,
    date: string
  ): Promise<MatchPrediction> {
    try {
      // Fetch all required data
      const [odds, homeStats, awayStats, historicalMatches] = await Promise.all([
        this.fetchOdds(homeTeam, awayTeam, league, date),
        this.fetchTeamStats(homeTeam, league),
        this.fetchTeamStats(awayTeam, league),
        this.fetchHistoricalMatches(homeTeam, awayTeam, league),
      ]);

      // Engineer features from raw data
      const features = await featureEngineeringService.engineerFeatures({
        odds,
        homeStats,
        awayStats,
        historicalMatches,
        league,
        date,
      });

      // Get optimized prediction using all ML models
      const optimizedPrediction = await predictionOptimizationService.getOptimizedPrediction({
        features,
        eventType: 'match',
        sport: 'football',
        league,
      });

      // Assess risk and calculate optimal stake
      const riskAssessment = await riskModelingService.assessRisk({
        prediction: optimizedPrediction.prediction,
        features,
        odds,
      });

      // Calculate probabilities
      const probabilities = this.calculateProbabilities(optimizedPrediction, odds);

      // Determine best betting opportunity
      const recommendedBet = this.determineOptimalBet(probabilities, odds, riskAssessment);

      return {
        homeWinProbability: probabilities.home,
        awayWinProbability: probabilities.away,
        drawProbability: probabilities.draw,
        recommendedBet,
        insights: {
          keyFactors: optimizedPrediction.insights.featureImportance,
          riskLevel: this.determineRiskLevel(riskAssessment),
          valueAssessment: this.assessValue(probabilities, odds),
          modelConsensus: optimizedPrediction.confidence,
        },
      };
    } catch (error) {
      console.error('Failed to generate match prediction:', error);
      throw error;
    }
  }

  private async fetchOdds(
    homeTeam: string,
    awayTeam: string,
    league: string,
    date: string
  ): Promise<BettingOdds[]> {
    try {
      const response = await fetch(`${this.API_ENDPOINTS.ODDS}/matches`, {
        headers: {
          Authorization: `Bearer ${this.API_KEYS.ODDS}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeTeam,
          awayTeam,
          league,
          date,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch odds: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching odds:', error);
      throw error;
    }
  }

  private async fetchTeamStats(team: string, league: string): Promise<TeamStats> {
    try {
      const response = await fetch(`${this.API_ENDPOINTS.STATS}/team-stats`, {
        headers: {
          Authorization: `Bearer ${this.API_KEYS.STATS}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          team,
          league,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch team stats: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching team stats:', error);
      throw error;
    }
  }

  private async fetchHistoricalMatches(
    homeTeam: string,
    awayTeam: string,
    league: string
  ): Promise<any[]> {
    try {
      const response = await fetch(`${this.API_ENDPOINTS.HISTORICAL}/matches`, {
        headers: {
          Authorization: `Bearer ${this.API_KEYS.HISTORICAL}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          homeTeam,
          awayTeam,
          league,
          limit: 50, // Last 50 matches
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch historical matches: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching historical matches:', error);
      throw error;
    }
  }

  private calculateProbabilities(
    prediction: any,
    odds: BettingOdds[]
  ): { home: number; away: number; draw: number } {
    // Convert model prediction to probabilities
    const rawProbabilities = {
      home: prediction.prediction,
      away: 1 - prediction.prediction,
      draw: prediction.drawProbability || 0,
    };

    // Adjust probabilities based on market odds
    const marketProbabilities = odds.map(odd => ({
      home: 1 / odd.homeOdds,
      away: 1 / odd.awayOdds,
      draw: odd.drawOdds ? 1 / odd.drawOdds : 0,
    }));

    // Combine model and market probabilities
    const combinedProbabilities = {
      home: (rawProbabilities.home + marketProbabilities[0].home) / 2,
      away: (rawProbabilities.away + marketProbabilities[0].away) / 2,
      draw: (rawProbabilities.draw + marketProbabilities[0].draw) / 2,
    };

    // Normalize probabilities
    const total =
      combinedProbabilities.home + combinedProbabilities.away + combinedProbabilities.draw;
    return {
      home: combinedProbabilities.home / total,
      away: combinedProbabilities.away / total,
      draw: combinedProbabilities.draw / total,
    };
  }

  private determineOptimalBet(
    probabilities: { home: number; away: number; draw: number },
    odds: BettingOdds[],
    riskAssessment: any
  ): MatchPrediction['recommendedBet'] {
    // Calculate expected value for each outcome
    const ev = {
      home: probabilities.home * odds[0].homeOdds - (1 - probabilities.home),
      away: probabilities.away * odds[0].awayOdds - (1 - probabilities.away),
      draw: odds[0].drawOdds
        ? probabilities.draw * odds[0].drawOdds - (1 - probabilities.draw)
        : -1,
    };

    // Find best opportunity
    const bestBet = Object.entries(ev).reduce(
      (best, [type, value]) => {
        return value > best.value ? { type, value } : best;
      },
      { type: 'none', value: 0 }
    );

    // Only recommend bet if there's positive expected value
    if (bestBet.value <= 0) {
      return {
        type: 'none',
        stake: 0,
        odds: 0,
        expectedValue: 0,
        confidence: 0,
      };
    }

    // Calculate optimal stake using Kelly Criterion
    const kellyFraction = this.calculateKellyStake(
      bestBet.type === 'home'
        ? odds[0].homeOdds
        : bestBet.type === 'away'
          ? odds[0].awayOdds
          : odds[0].drawOdds || 0,
      bestBet.type === 'home'
        ? probabilities.home
        : bestBet.type === 'away'
          ? probabilities.away
          : probabilities.draw
    );

    // Adjust stake based on risk assessment
    const adjustedStake = kellyFraction * riskAssessment.riskMetrics.maxStake;

    return {
      type: bestBet.type as 'home' | 'away' | 'draw' | 'none',
      stake: adjustedStake,
      odds:
        bestBet.type === 'home'
          ? odds[0].homeOdds
          : bestBet.type === 'away'
            ? odds[0].awayOdds
            : odds[0].drawOdds || 0,
      expectedValue: bestBet.value,
      confidence: riskAssessment.riskMetrics.confidence,
    };
  }

  private calculateKellyStake(odds: number, probability: number): number {
    const q = 1 - probability;
    const b = odds - 1;
    const f = (b * probability - q) / b;
    return Math.max(0, Math.min(f, 0.2)); // Cap at 20% of bankroll
  }

  private determineRiskLevel(riskAssessment: any): 'low' | 'medium' | 'high' {
    const riskScore = riskAssessment.riskMetrics.overallRisk;
    if (riskScore < 0.3) return 'low';
    if (riskScore < 0.7) return 'medium';
    return 'high';
  }

  private assessValue(
    probabilities: { home: number; away: number; draw: number },
    odds: BettingOdds[]
  ): string {
    const values = {
      home: probabilities.home * odds[0].homeOdds - 1,
      away: probabilities.away * odds[0].awayOdds - 1,
      draw: odds[0].drawOdds ? probabilities.draw * odds[0].drawOdds - 1 : -1,
    };

    const bestValue = Math.max(...Object.values(values));
    if (bestValue > 0.2) return 'Strong Value';
    if (bestValue > 0.1) return 'Moderate Value';
    if (bestValue > 0) return 'Slight Value';
    return 'No Value';
  }
}

export const sportsBettingService = new SportsBettingService();
