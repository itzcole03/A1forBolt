export interface ModelMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  auc: number;
  confusionMatrix: {
    truePositives: number;
    trueNegatives: number;
    falsePositives: number;
    falseNegatives: number;
  };
  featureImportance: Record<string, number>;
  shapValues?: Record<string, number[]>;
  predictionConfidence: {
    mean: number;
    std: number;
    distribution: number[];
  };
  trainingMetrics: {
    loss: number[];
    validationLoss: number[];
    learningRate: number[];
    gradientNorm: number[];
  };
  performanceMetrics: {
    inferenceTime: number;
    throughput: number;
    latency: number;
    memoryUsage: number;
  };
  driftMetrics?: {
    featureDrift: Record<string, number>;
    predictionDrift: number;
    dataQuality: Record<string, number>;
  };
  customMetrics?: Record<string, number>;
}

export class ModelMetricsManager {
  private metrics: ModelMetrics;

  constructor(metrics: ModelMetrics) {
    this.metrics = metrics;
  }

  public getMetrics(): ModelMetrics {
    return this.metrics;
  }

  public updateMetrics(updates: Partial<ModelMetrics>): void {
    this.metrics = {
      ...this.metrics,
      ...updates,
    };
  }

  public addCustomMetric(name: string, value: number): void {
    if (!this.metrics.customMetrics) {
      this.metrics.customMetrics = {};
    }
    this.metrics.customMetrics[name] = value;
  }

  public removeCustomMetric(name: string): void {
    if (this.metrics.customMetrics) {
      delete this.metrics.customMetrics[name];
    }
  }

  public calculateDriftMetrics(newData: any): void {
    // Implement drift detection logic here
    this.metrics.driftMetrics = {
      featureDrift: {},
      predictionDrift: 0,
      dataQuality: {},
    };
  }

  public toJSON(): string {
    return JSON.stringify(this.metrics, null, 2);
  }

  public static fromJSON(json: string): ModelMetricsManager {
    const metrics = JSON.parse(json) as ModelMetrics;
    return new ModelMetricsManager(metrics);
  }
}
