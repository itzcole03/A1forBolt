export interface Prediction {
  id: string;
  eventId: string;
  modelType: string;
  probability: number;
  confidence: number;
  timestamp: Date;
  recommendedStake?: number;
  marketFactors?: {
    odds: number;
    volume: number;
    movement: number;
  };
  temporalFactors?: {
    timeToEvent: number;
    restDays: number;
    travelDistance: number;
  };
  environmentalFactors?: {
    weather: number;
    venue: number;
    crowd: number;
  };
  metadata: {
    modelVersion: string;
    features: string[];
    shapValues?: Record<string, number>;
    predictionBreakdown?: {
      market: number;
      temporal: number;
      environmental: number;
      base: number;
    };
  };
}
