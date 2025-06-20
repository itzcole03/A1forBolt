import { EventBus } from "../../core/EventBus";
import { ErrorHandler } from "../../core/ErrorHandler";
import { PerformanceMonitor } from "../../core/PerformanceMonitor";
import { UnifiedConfig } from "../../core/UnifiedConfig";
import { WebSocketManager } from "./WebSocketManager";
import { RiskProfile } from "../../types/core";

export interface PredictionResult {
  id: string;
  event: string;
  market: string;
  prediction: number;
  confidence: number;
  riskScore: number;
  timestamp: number;
  metadata: {
    modelVersion: string;
    features: Record<string, number>;
    shapValues?: Record<string, number>;
    performanceMetrics?: Record<string, number>;
  };
}

export class UnifiedPredictionService {
  private static instance: UnifiedPredictionService;
  private readonly eventBus: EventBus;
  private readonly errorHandler: ErrorHandler;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly config: UnifiedConfig;
  private readonly wsService: WebSocketManager;
  private activePredictions: Map<string, PredictionResult>;
  private predictionSubscribers: Set<(prediction: PredictionResult) => void>;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.config = UnifiedConfig.getInstance();
    this.wsService = WebSocketManager.getInstance();
    this.activePredictions = new Map();
    this.predictionSubscribers = new Set();
    this.initialize();
  }

  public static getInstance(): UnifiedPredictionService {
    if (!UnifiedPredictionService.instance) {
      UnifiedPredictionService.instance = new UnifiedPredictionService();
    }
    return UnifiedPredictionService.instance;
  }

  private initialize(): void {
    this.setupWebSocketHandlers();
    this.setupEventListeners();
  }

  private setupWebSocketHandlers(): void {
    this.wsService.on("prediction:update", (data: PredictionResult) => {
      this.handlePredictionUpdate(data);
    });

    this.wsService.on("prediction:error", (error: any) => {
      this.errorHandler.handleError(error, "UnifiedPredictionService", "high");
    });
  }

  private setupEventListeners(): void {
    this.eventBus.on("risk:profile:updated", (profile: RiskProfile) => {
      this.recalculatePredictions(profile);
    });
  }

  private handlePredictionUpdate(prediction: PredictionResult): void {
    try {
      this.activePredictions.set(prediction.id, prediction);
      this.predictionSubscribers.forEach((callback) => callback(prediction));
      this.performanceMonitor.trackMetric("prediction:update", {
        predictionId: prediction.id,
        confidence: prediction.confidence,
        riskScore: prediction.riskScore,
      });
    } catch (error) {
      this.errorHandler.handleError(
        error,
        "UnifiedPredictionService",
        "medium",
        {
          action: "handlePredictionUpdate",
          predictionId: prediction.id,
        },
      );
    }
  }

  private async recalculatePredictions(profile: RiskProfile): Promise<void> {
    try {
      const predictions = Array.from(this.activePredictions.values());
      for (const prediction of predictions) {
        const updatedPrediction = await this.recalculatePrediction(
          prediction,
          profile,
        );
        this.handlePredictionUpdate(updatedPrediction);
      }
    } catch (error) {
      this.errorHandler.handleError(error, "UnifiedPredictionService", "high", {
        action: "recalculatePredictions",
        profileId: profile.id,
      });
    }
  }

  private async recalculatePrediction(
    prediction: PredictionResult,
    profile: RiskProfile,
  ): Promise<PredictionResult> {
    const startTime = performance.now();
    try {
      // Implement prediction recalculation logic based on risk profile
      const updatedPrediction = {
        ...prediction,
        riskScore: this.calculateRiskScore(prediction, profile),
        confidence: this.adjustConfidence(prediction, profile),
      };

      this.performanceMonitor.trackMetric("prediction:recalculation", {
        predictionId: prediction.id,
        duration: performance.now() - startTime,
      });

      return updatedPrediction;
    } catch (error) {
      this.errorHandler.handleError(
        error,
        "UnifiedPredictionService",
        "medium",
        {
          action: "recalculatePrediction",
          predictionId: prediction.id,
        },
      );
      return prediction;
    }
  }

  private calculateRiskScore(
    prediction: PredictionResult,
    profile: RiskProfile,
  ): number {
    // Implement risk score calculation based on prediction and profile
    const confidence =
      typeof prediction.confidence === "number" ? prediction.confidence : 0;
    const riskToleranceLevel =
      typeof profile.riskToleranceLevel === "number"
        ? profile.riskToleranceLevel
        : 0;
    const maxRiskScore =
      typeof profile.maxRiskScore === "number" ? profile.maxRiskScore : 1;
    return Math.min(confidence * riskToleranceLevel, maxRiskScore);
  }

  private adjustConfidence(
    prediction: PredictionResult,
    profile: RiskProfile,
  ): number {
    // Implement confidence adjustment based on risk profile
    const confidence =
      typeof prediction.confidence === "number" ? prediction.confidence : 0;
    const riskToleranceLevel =
      typeof profile.riskToleranceLevel === "number"
        ? profile.riskToleranceLevel
        : 0;
    const minConfidenceThreshold =
      typeof profile.minConfidenceThreshold === "number"
        ? profile.minConfidenceThreshold
        : 0;
    return Math.max(
      confidence * (1 - riskToleranceLevel * 0.2),
      minConfidenceThreshold,
    );
  }

  public subscribeToPredictions(
    callback: (prediction: PredictionResult) => void,
  ): () => void {
    this.predictionSubscribers.add(callback);
    return () => this.predictionSubscribers.delete(callback);
  }

  public getActivePredictions(): PredictionResult[] {
    return Array.from(this.activePredictions.values());
  }

  public getPrediction(id: string): PredictionResult | undefined {
    return this.activePredictions.get(id);
  }
}
