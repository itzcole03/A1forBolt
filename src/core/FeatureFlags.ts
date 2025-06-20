import { EventBus } from "./EventBus";
import { PerformanceMonitor } from "./PerformanceMonitor";
import { UnifiedConfigManager } from "./UnifiedConfigManager";
import { UnifiedMonitor } from "./UnifiedMonitor";

export interface Feature {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  rolloutPercentage: number;
  dependencies: string[];
  tags: string[];
  metadata: Record<string, any>;
}

export interface Experiment {
  id: string;
  name: string;
  description: string;
  status: "active" | "inactive" | "completed";
  variants: Array<{
    id: string;
    name: string;
    weight: number;
  }>;
  audience: {
    percentage: number;
    filters?: Record<string, any>;
  };
  startDate: number;
  endDate?: number;
  metadata: Record<string, any>;
}

export interface UserContext {
  userId: string;
  userGroups: string[];
  attributes: Record<string, any>;
}

export class FeatureFlags {
  private static instance: FeatureFlags;
  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly monitor: UnifiedMonitor;
  private readonly configManager: UnifiedConfigManager;
  private readonly features: Map<string, Feature>;
  private readonly experiments: Map<string, Experiment>;
  private readonly userAssignments: Map<string, Record<string, string>>;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.monitor = UnifiedMonitor.getInstance();
    this.configManager = UnifiedConfigManager.getInstance();
    this.features = new Map();
    this.experiments = new Map();
    this.userAssignments = new Map();
  }

  public static getInstance(): FeatureFlags {
    if (!FeatureFlags.instance) {
      FeatureFlags.instance = new FeatureFlags();
    }
    return FeatureFlags.instance;
  }

  public async initialize(): Promise<void> {
    const traceId = this.performanceMonitor.startTrace("feature-flags-init");
    try {
      const config = await this.configManager.getConfig();

      // Initialize features
      if (config.features) {
        for (const feature of config.features) {
          this.features.set(feature.id, feature);
        }
      }

      // Initialize experiments
      if (config.experiments) {
        for (const experiment of config.experiments) {
          this.experiments.set(experiment.id, experiment);
        }
      }

      this.performanceMonitor.endTrace(traceId);
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  public isFeatureEnabled(featureId: string, context: UserContext): boolean {
    const feature = this.features.get(featureId);
    if (!feature) return false;

    // Check if feature is globally enabled
    if (!feature.enabled) return false;

    // Check dependencies
    if (!this.areDependenciesSatisfied(feature, context)) return false;

    // Check rollout percentage
    if (!this.isUserInRollout(context.userId, feature.rolloutPercentage))
      return false;

    return true;
  }

  public getExperimentVariant(
    experimentId: string,
    context: UserContext,
  ): string | null {
    const experiment = this.experiments.get(experimentId);
    if (!experiment || experiment.status !== "active") return null;

    // Check if user is in experiment audience
    if (!this.isUserInAudience(context, experiment.audience)) return null;

    // Get or assign variant
    const userAssignments = this.userAssignments.get(context.userId) || {};
    if (userAssignments[experimentId]) {
      return userAssignments[experimentId];
    }

    // Assign new variant
    const variant = this.assignVariant(experiment, context);
    if (variant) {
      this.userAssignments.set(context.userId, {
        ...userAssignments,
        [experimentId]: variant.id,
      });
      return variant.id;
    }

    return null;
  }

  private areDependenciesSatisfied(
    feature: Feature,
    context: UserContext,
  ): boolean {
    return feature.dependencies.every((depId) =>
      this.isFeatureEnabled(depId, context),
    );
  }

  private isUserInRollout(userId: string, percentage: number): boolean {
    const hash = this.hashString(userId);
    const normalized = hash / Math.pow(2, 32);
    return normalized <= percentage / 100;
  }

  private isUserInAudience(
    context: UserContext,
    audience: Experiment["audience"],
  ): boolean {
    // Check percentage rollout
    if (!this.isUserInRollout(context.userId, audience.percentage))
      return false;

    // Check filters if they exist
    if (audience.filters) {
      for (const [key, value] of Object.entries(audience.filters)) {
        if (context.attributes[key] !== value) return false;
      }
    }

    return true;
  }

  private assignVariant(
    experiment: Experiment,
    context: UserContext,
  ): Experiment["variants"][0] | null {
    const totalWeight = experiment.variants.reduce(
      (sum, v) => sum + v.weight,
      0,
    );
    const hash = this.hashString(`${context.userId}:${experiment.id}`);
    const normalized = (hash / Math.pow(2, 32)) * totalWeight;

    let cumulative = 0;
    for (const variant of experiment.variants) {
      cumulative += variant.weight;
      if (normalized <= cumulative) {
        return variant;
      }
    }

    return null;
  }

  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  public registerFeature(feature: Feature): void {
    if (this.features.has(feature.id)) {
      throw new Error(`Feature ${feature.id} already exists`);
    }
    this.features.set(feature.id, feature);
  }

  public updateFeature(featureId: string, updates: Partial<Feature>): void {
    const feature = this.features.get(featureId);
    if (!feature) {
      throw new Error(`Feature ${featureId} not found`);
    }

    this.features.set(featureId, {
      ...feature,
      ...updates,
    });

    this.eventBus.emit("feature:updated", {
      featureId,
      updates,
      timestamp: Date.now(),
    });
  }

  public registerExperiment(experiment: Experiment): void {
    if (this.experiments.has(experiment.id)) {
      throw new Error(`Experiment ${experiment.id} already exists`);
    }
    this.experiments.set(experiment.id, experiment);
  }

  public updateExperiment(
    experimentId: string,
    updates: Partial<Experiment>,
  ): void {
    const experiment = this.experiments.get(experimentId);
    if (!experiment) {
      throw new Error(`Experiment ${experimentId} not found`);
    }

    this.experiments.set(experimentId, {
      ...experiment,
      ...updates,
    });

    this.eventBus.emit("experiment:updated", {
      experimentId,
      timestamp: Date.now(),
    });
  }

  public getAllFeatures(): Feature[] {
    return Array.from(this.features.values());
  }

  public getAllExperiments(): Experiment[] {
    return Array.from(this.experiments.values());
  }

  public getUserAssignments(userId: string): Record<string, string> {
    return this.userAssignments.get(userId) || {};
  }

  public clearUserAssignments(userId: string): void {
    this.userAssignments.delete(userId);
  }
}
