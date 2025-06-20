import { getLogger } from '../../core/logging/logger';
import { getMetrics } from '../../core/metrics/metrics';

const logger = getLogger('PredictionAlgorithms');
const metrics = getMetrics();

interface PredictionInput {
  playerId: string;
  playerName: string;
  historicalData: {
    wins: number;
    losses: number;
    averageScore: number;
    recentPerformance: number[];
  };
  opponentData?: {
    wins: number;
    losses: number;
    averageScore: number;
  };
  fantasyData?: {
    projectedPoints: number;
    salary: number;
    value: number;
  };
}

interface PredictionOutput {
  predictedWinProbability: number;
  predictedScore: number;
  confidence: number;
  metadata: {
    algorithm: string;
    factors: string[];
    weights: Record<string, number>;
  };
}

export class PredictionAlgorithms {
  // Statistical model using historical performance
  static statisticalModel(input: PredictionInput): PredictionOutput {
    const { historicalData, opponentData } = input;
    const totalGames = historicalData.wins + historicalData.losses;
    const winRate = historicalData.wins / totalGames;

    // Calculate recent form (weighted average of last 5 games)
    const recentForm =
      historicalData.recentPerformance.slice(-5).reduce((sum, perf, i) => sum + perf * (i + 1), 0) /
      15;

    // Calculate opponent strength if available
    const opponentStrength = opponentData
      ? (opponentData.wins / (opponentData.wins + opponentData.losses)) * 0.3
      : 0.5;

    const predictedWinProbability =
      (winRate * 0.5 + recentForm * 0.3 + (1 - opponentStrength) * 0.2) * 100;
    const predictedScore = historicalData.averageScore * (1 + recentForm * 0.2);
    const confidence = Math.min(100, Math.max(50, predictedWinProbability));

    return {
      predictedWinProbability,
      predictedScore,
      confidence,
      metadata: {
        algorithm: 'statistical',
        factors: ['win_rate', 'recent_form', 'opponent_strength'],
        weights: {
          winRate: 0.5,
          recentForm: 0.3,
          opponentStrength: 0.2,
        },
      },
    };
  }

  // Machine learning model using fantasy data
  static mlModel(input: PredictionInput): PredictionOutput {
    const { historicalData, fantasyData } = input;

    if (!fantasyData) {
      throw new Error('Fantasy data required for ML model');
    }

    // Calculate value score (projected points per salary)
    const valueScore = fantasyData.projectedPoints / (fantasyData.salary / 1000);

    // Calculate consistency score from historical data
    const consistencyScore =
      historicalData.recentPerformance
        .slice(-5)
        .reduce((sum, perf) => sum + Math.abs(perf - historicalData.averageScore), 0) / 5;

    const predictedWinProbability = (valueScore * 0.4 + (1 - consistencyScore) * 0.6) * 100;
    const predictedScore = fantasyData.projectedPoints * (1 + (1 - consistencyScore) * 0.2);
    const confidence = Math.min(100, Math.max(50, predictedWinProbability));

    return {
      predictedWinProbability,
      predictedScore,
      confidence,
      metadata: {
        algorithm: 'ml',
        factors: ['value_score', 'consistency_score'],
        weights: {
          valueScore: 0.4,
          consistencyScore: 0.6,
        },
      },
    };
  }

  // Hybrid model combining statistical and ML approaches
  static hybridModel(input: PredictionInput): PredictionOutput {
    const statistical = this.statisticalModel(input);
    const ml = input.fantasyData ? this.mlModel(input) : null;

    if (!ml) {
      return statistical;
    }

    const predictedWinProbability =
      statistical.predictedWinProbability * 0.6 + ml.predictedWinProbability * 0.4;
    const predictedScore = statistical.predictedScore * 0.6 + ml.predictedScore * 0.4;
    const confidence = statistical.confidence * 0.6 + ml.confidence * 0.4;

    return {
      predictedWinProbability,
      predictedScore,
      confidence,
      metadata: {
        algorithm: 'hybrid',
        factors: ['statistical', 'ml'],
        weights: {
          statistical: 0.6,
          ml: 0.4,
        },
      },
    };
  }
}
