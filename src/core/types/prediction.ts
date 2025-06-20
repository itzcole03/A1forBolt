export interface ShapValue {
  feature: string;
  value: number;
  impact: number;
  direction: 'positive' | 'negative';
}

export interface ShapExplanation {
  baseValue: number;
  shapValues: ShapValue[];
  prediction: number;
  confidence: number;
}

export interface ModelExplanation {
  modelName: string;
  shapExplanation: ShapExplanation;
  featureImportance: Record<string, number>;
  confidence: number;
}

export interface PredictionWithExplanation {
  prediction: number;
  confidence: number;
  explanations: ModelExplanation[];
  timestamp: number;
}

export interface PredictionRequest {
  sport: string;
  eventId: string;
  riskProfile?: {
    level: 'low' | 'medium' | 'high';
    maxStake?: number;
  };
  features?: Record<string, number>;
}

export interface PredictionResponse {
  prediction: number;
  confidence: number;
  explanations: ModelExplanation[];
  timestamp: number;
  eventId: string;
  sport: string;
  riskAdjustedStake?: number;
}

export interface LatestPredictions {
  predictions: PredictionResponse[];
  timestamp: number;
}
