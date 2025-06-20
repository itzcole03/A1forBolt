// Enhanced PredictionService: attaches confidence bands, win probability, and contextual info to predictions
import type { PredictionWithConfidence, ConfidenceBand, WinProbability } from '../../types/confidence';
import type { ContextualInput } from '../../types/filters';

export class PredictionService {
  private static instance: PredictionService;
  private constructor() {}

  public static getInstance(): PredictionService {
    if (!PredictionService.instance) {
      PredictionService.instance = new PredictionService();
    }
    return PredictionService.instance;
  }

  // Main interface for frontend: get prediction with confidence band and win probability
  public async getPredictionWithConfidence(eventId: string, model: string, market: string, context?: ContextualInput): Promise<PredictionWithConfidence> {
    // Simulate call to backend/model for prediction, confidence, and win probability
    // In production, replace with real API/model call
    const predictedValue = Math.random() * 100;
    const confidenceLevel = 0.95;
    const stdDev = Math.random() * 10;
    const mean = predictedValue;
    const confidenceBand: ConfidenceBand = {
      lower: mean - 1.96 * stdDev,
      upper: mean + 1.96 * stdDev,
      mean,
      confidenceLevel,
    };
    const winProbability: WinProbability = {
      probability: Math.random(),
      impliedOdds: Math.random() * 2 + 1,
      modelOdds: Math.random() * 2 + 1,
      updatedAt: new Date().toISOString(),
    };
    return {
      predictionId: `${eventId}-${model}-${market}`,
      eventId,
      predictedValue,
      confidenceBand,
      winProbability,
      model,
      market,
      player: context?.player,
      team: context?.team,
      context: JSON.stringify(context),
    };
  }
}
