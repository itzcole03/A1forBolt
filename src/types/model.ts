export interface ModelPerformance {
  model: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  timestamp: string;
  metrics: {
    f1: number;
    accuracy: number;
    precision: number;
    recall: number;
  };
}
