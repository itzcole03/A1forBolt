// confidenceService.ts
// Singleton service for prediction confidence bands and win probability analytics

import type { ConfidenceBand, WinProbability, PredictionWithConfidence } from '../../types/confidence';

class ConfidenceService {
  private static _instance: ConfidenceService;
  private cache: Map<string, PredictionWithConfidence> = new Map();

  private constructor() {}

  public static getInstance(): ConfidenceService {
    if (!ConfidenceService._instance) {
      ConfidenceService._instance = new ConfidenceService();
    }
    return ConfidenceService._instance;
  }

  // Simulate or fetch prediction with confidence
  public getPredictionWithConfidence(eventId: string, player: string, market: string): PredictionWithConfidence {
    const cacheKey = `${eventId}:${player}:${market}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }
    // Simulate (replace with real logic or API call)
    const now = new Date().toISOString();
    const confidenceBand: ConfidenceBand = {
      lower: Math.random() * 10 + 10,
      upper: Math.random() * 10 + 20,
      mean: Math.random() * 5 + 15,
      confidenceLevel: 0.95,
    };
    const winProbability: WinProbability = {
      probability: Math.random() * 0.5 + 0.25,
      impliedOdds: 1 / (Math.random() * 0.5 + 0.25),
      modelOdds: 1 / (Math.random() * 0.5 + 0.25),
      updatedAt: now,
    };
    const prediction: PredictionWithConfidence = {
      predictionId: cacheKey,
      eventId,
      predictedValue: confidenceBand.mean,
      confidenceBand,
      winProbability,
      model: 'Alpha1-ML',
      market,
      player,
      team: 'TBD',
      context: 'Simulated',
    };
    this.cache.set(cacheKey, prediction);
    return prediction;
  }

  public clearCache() {
    this.cache.clear();
  }
}

export const confidenceService = ConfidenceService.getInstance();
