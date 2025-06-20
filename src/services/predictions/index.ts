import { getLogger } from '../../core/logging/logger.js';
import { getMetrics } from '../../core/metrics/metrics.js';
import { PredictionAlgorithms } from './algorithms.js';
import { wrapWithRateLimit } from '../rateLimit/wrapWithRateLimit.js';

const logger = getLogger('PredictionService');
const metrics = getMetrics();

interface PredictionModel {
  name: string;
  version: string;
  type: 'ml' | 'statistical' | 'hybrid';
  parameters: Record<string, unknown>;
}

/**
 * PlayerData type for backend player API response.
 */
export interface PlayerData {
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

export interface PredictionResult {
  playerId: string;
  playerName: string;
  predictedWinProbability: number;
  predictedScore: number;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export class PredictionService {
  private models: Map<string, PredictionModel> = new Map();

  constructor() {
    // Initialize with default models
    this.models.set('default', {
      name: 'Default Model',
      version: '1.0.0',
      type: 'hybrid',
      parameters: {
        winProbabilityWeight: 0.6,
        scoreWeight: 0.4,
        confidenceThreshold: 0.7,
      },
    });
  }

  /**
   * Generates predictions for all players using the specified model and date.
   * Fetches player data from the backend API and applies the selected prediction algorithm.
   * Rate-limited for backend API calls.
   */
  async generatePredictions(modelName: string, date: string): Promise<PredictionResult[]> {
    const model = this.models.get(modelName);
    if (!model) {
      throw new Error(`Model ${modelName} not found`);
    }

    // Fetch player data from backend API
    // The endpoint and response type should be aligned with backend documentation
    // Example endpoint: /api/v1/players?date=YYYY-MM-DD
    const fetchPlayerData = async (): Promise<PlayerData[]> => {
      const response = await fetch(`/api/v1/players?date=${encodeURIComponent(date)}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch player data: ${response.statusText}`);
      }
      return (await response.json()) as PlayerData[];
    };

    const rateLimitedFetchPlayerData = wrapWithRateLimit(fetchPlayerData, 5, 1000);

    try {
      const playerData = await rateLimitedFetchPlayerData();
      const predictions = playerData.map((player: PlayerData) => {
        let result: PredictionResult;
        switch (model.type) {
          case 'statistical':
            result = {
              ...PredictionAlgorithms.statisticalModel(player),
              playerId: player.playerId,
              playerName: player.playerName,
            };
            break;
          case 'ml':
            result = {
              ...PredictionAlgorithms.mlModel(player),
              playerId: player.playerId,
              playerName: player.playerName,
            };
            break;
          case 'hybrid':
          default:
            result = {
              ...PredictionAlgorithms.hybridModel(player),
              playerId: player.playerId,
              playerName: player.playerName,
            };
        }
        return result;
      });

      logger.info('Generated predictions', {
        modelName,
        date,
        predictionCount: predictions.length,
      });

      metrics.track('predictions_generated', predictions.length, {
        modelName,
        modelType: model.type,
      });

      return predictions;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('Error generating predictions', {
        error: errorMessage,
        modelName,
        date,
      });
      metrics.increment('prediction_generation_error', 1, {
        modelName,
        error: errorMessage,
      });
      throw error;
    }
  }

  async addModel(model: PredictionModel): Promise<void> {
    if (this.models.has(model.name)) {
      throw new Error(`Model ${model.name} already exists`);
    }

    this.models.set(model.name, model);
    logger.info('Added new prediction model', { modelName: model.name });
    metrics.increment('prediction_model_added', 1, { modelType: model.type });
  }

  async removeModel(modelName: string): Promise<void> {
    if (!this.models.has(modelName)) {
      throw new Error(`Model ${modelName} not found`);
    }

    this.models.delete(modelName);
    logger.info('Removed prediction model', { modelName });
    metrics.increment('prediction_model_removed', 1);
  }

  getAvailableModels(): PredictionModel[] {
    return Array.from(this.models.values());
  }
}

// Export a singleton instance
export const predictionService = new PredictionService();
