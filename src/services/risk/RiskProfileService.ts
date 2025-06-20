import { EventBus } from '../../unified/EventBus';
import { ErrorHandler } from '../../core/ErrorHandler';
import { PerformanceMonitor } from '../../unified/PerformanceMonitor';
import { UnifiedConfig } from '../../unified/UnifiedConfig';
import { RiskProfile, Prediction, EventMap } from '../../types/core';

export class RiskProfileService {
  private static instance: RiskProfileService;
  private readonly eventBus: EventBus;
  private readonly errorHandler: ErrorHandler;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly config: UnifiedConfig;
  private activeProfile!: RiskProfile;
  private profiles: Map<string, RiskProfile>;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.errorHandler = ErrorHandler.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.config = UnifiedConfig.getInstance();
    this.profiles = new Map();
    this.initializeDefaultProfiles();
    this.setupEventListeners();
  }

  public static getInstance(): RiskProfileService {
    if (!RiskProfileService.instance) {
      RiskProfileService.instance = new RiskProfileService();
    }
    return RiskProfileService.instance;
  }

  private initializeDefaultProfiles(): void {
    const defaultProfiles: RiskProfile[] = [
      {
        id: 'conservative',
        name: 'Conservative',
        maxStake: 100,
        minStake: 10,
        maxExposure: 1000,
        confidenceThreshold: 0.8,
        volatilityThreshold: 0.2,
        stopLossPercentage: 0.05,
        takeProfitPercentage: 0.1,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'moderate',
        name: 'Moderate',
        maxStake: 250,
        minStake: 25,
        maxExposure: 2500,
        confidenceThreshold: 0.7,
        volatilityThreshold: 0.3,
        stopLossPercentage: 0.1,
        takeProfitPercentage: 0.2,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
      {
        id: 'aggressive',
        name: 'Aggressive',
        maxStake: 500,
        minStake: 50,
        maxExposure: 5000,
        confidenceThreshold: 0.6,
        volatilityThreshold: 0.4,
        stopLossPercentage: 0.15,
        takeProfitPercentage: 0.3,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ];

    defaultProfiles.forEach(profile => {
      this.profiles.set(profile.id, profile);
    });

    // Set default active profile
    this.activeProfile = defaultProfiles[0];
  }

  private setupEventListeners(): void {
    this.eventBus.on('prediction:update', (prediction: Prediction) => {
      this.handlePredictionUpdate(prediction);
    });

    this.eventBus.on('risk:update', (data: EventMap['risk:update']) => {
      const profile = this.profiles.get(data.profileId);
      if (!profile) {
        this.errorHandler.handleError(
          new Error(`Risk profile with ID ${data.profileId} not found`),
          'risk_profile_update'
        );
        return;
      }
      this.handleRiskProfileUpdate(profile);
    });
  }

  private handlePredictionUpdate(prediction: Prediction): void {
    try {
      const riskAssessment = this.assessPredictionRisk(prediction);
      this.eventBus.emit('risk:assessment', riskAssessment);
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'prediction_risk_assessment');
    }
  }

  private handleRiskProfileUpdate(profile: RiskProfile): void {
    try {
      this.updateProfile(profile);
      this.eventBus.emit('risk:profile:updated', { profileId: profile.id });
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'risk_profile_update');
    }
  }

  private assessPredictionRisk(prediction: Prediction): EventMap['risk:assessment'] {
    const startTime = Date.now();
    try {
      const riskAssessment: EventMap['risk:assessment'] = {
        predictionId: prediction.id,
        confidence: prediction.confidence,
        riskLevel: this.calculateRiskLevel(prediction),
        maxStake: this.calculateMaxStake(prediction),
        timestamp: Date.now(),
      };

      const duration = Date.now() - startTime;
      this.performanceMonitor.trackMetric('risk_assessment_duration', duration);
      return riskAssessment;
    } catch (error) {
      this.errorHandler.handleError(error as Error, 'risk_assessment');
      throw error;
    }
  }

  private calculateRiskLevel(prediction: Prediction): 'low' | 'medium' | 'high' {
    const { confidence } = prediction;
    const { confidenceThreshold } = this.activeProfile;

    if (confidence >= confidenceThreshold) {
      return 'low';
    } else if (confidence >= confidenceThreshold * 0.8) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  private calculateMaxStake(prediction: Prediction): number {
    const { confidence } = prediction;
    const { maxStake, minStake } = this.activeProfile;

    // Calculate stake based on confidence and risk profile
    const stake = Math.floor(maxStake * confidence);
    return Math.max(minStake, Math.min(stake, maxStake));
  }

  public getActiveProfile(): RiskProfile {
    return this.activeProfile;
  }

  public getProfile(id: string): RiskProfile | undefined {
    return this.profiles.get(id);
  }

  public getAllProfiles(): RiskProfile[] {
    return Array.from(this.profiles.values());
  }

  public updateProfile(profile: RiskProfile): void {
    if (!this.profiles.has(profile.id)) {
      throw new Error(`Risk profile with ID ${profile.id} not found`);
    }

    // Validate profile updates
    if (profile.maxStake < profile.minStake) {
      throw new Error('Maximum stake cannot be less than minimum stake');
    }

    profile.updatedAt = Date.now();
    this.profiles.set(profile.id, profile);

    if (profile.id === this.activeProfile.id) {
      this.activeProfile = profile;
    }
  }

  public setActiveProfile(id: string): void {
    const profile = this.profiles.get(id);
    if (!profile) {
      throw new Error(`Risk profile with ID ${id} not found`);
    }
    this.activeProfile = profile;
    this.eventBus.emit('risk:profile:activated', { profileId: id });
  }
}
