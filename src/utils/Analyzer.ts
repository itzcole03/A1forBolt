import { AnalysisResult, IntegratedData } from './PredictionEngine';



export interface Analyzer<T = unknown, U = unknown> {
  id: string;
  name: string;
  description: string;
  analyze(data: T): Promise<U>;
  validate(data: T): boolean;
  getMetrics(): {
    accuracy: number;
    latency: number;
    errorRate: number;
  };
} 