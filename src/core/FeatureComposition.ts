import { EventBus } from './EventBus';
import { PerformanceMonitor } from './PerformanceMonitor';

export interface FeatureMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  dependencies: string[];
  category: string;
  tags: string[];
}

export interface FeatureContext {
  timestamp: number;
  environment: string;
  userId?: string;
  sessionId?: string;
  metadata: Record<string, string | number | boolean | object>;
}

export interface FeatureComponent<T, U> {
  metadata: FeatureMetadata;
  process(input: T, context: FeatureContext): Promise<U>;
  combine<V>(next: FeatureComponent<U, V>): FeatureComponent<T, V>;
  validate(input: T): Promise<boolean>;
  rollback(input: T, error: Error): Promise<void>;
}

export class ComposableFeature<T, U> implements FeatureComponent<T, U> {
  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;

  constructor(
    public readonly metadata: FeatureMetadata,
    private readonly processor: (input: T, context: FeatureContext) => Promise<U>,
    private readonly validator?: (input: T) => Promise<boolean>,
    private readonly rollbackHandler?: (input: T, error: Error) => Promise<void>
  ) {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  async process(input: T, context: FeatureContext): Promise<U> {
    const traceId = this.performanceMonitor.startTrace(`feature-${this.metadata.id}`, {
      featureId: this.metadata.id,
      category: this.metadata.category,
      version: this.metadata.version,
    });

    try {
      // Validate input if validator exists
      if (this.validator && !(await this.validate(input))) {
        throw new Error(`Input validation failed for feature ${this.metadata.id}`);
      }

      // Process the input
      const startTime = Date.now();
      const result = await this.processor(input, context);
      const duration = Date.now() - startTime;

      // Emit success event
      this.eventBus.publish({
        type: 'feature:executed',
        payload: {
          featureId: this.metadata.id,
          duration,
          success: true,
          timestamp: Date.now(),
          context,
        },
      });

      this.performanceMonitor.endTrace(traceId);
      return result;
    } catch (error) {
      // Handle error and attempt rollback
      this.performanceMonitor.endTrace(traceId, error as Error);

      if (this.rollbackHandler) {
        await this.rollbackHandler(input, error as Error);
      }

      // Emit error event
      this.eventBus.publish({
        type: 'feature:error',
        payload: {
          featureId: this.metadata.id,
          error: error as Error,
          timestamp: Date.now(),
          context,
        },
      });

      throw error;
    }
  }

  combine<V>(next: FeatureComponent<U, V>): FeatureComponent<T, V> {
    return new ComposableFeature<T, V>(
      {
        id: `${this.metadata.id}->${next.metadata.id}`,
        name: `${this.metadata.name} -> ${next.metadata.name}`,
        description: `Composed feature: ${this.metadata.description} -> ${next.metadata.description}`,
        version: `${this.metadata.version}+${next.metadata.version}`,
        dependencies: [...this.metadata.dependencies, ...next.metadata.dependencies],
        category: this.metadata.category,
        tags: [...new Set([...this.metadata.tags, ...next.metadata.tags])],
      },
      async (input: T, context: FeatureContext) => {
        const intermediate = await this.process(input, context);
        return next.process(intermediate, context);
      }
    );
  }

  async validate(input: T): Promise<boolean> {
    if (this.validator) {
      return this.validator(input);
    }
    return true;
  }

  async rollback(input: T, error: Error): Promise<void> {
    if (this.rollbackHandler) {
      await this.rollbackHandler(input, error);
    }
  }
}

export class FeatureRegistry {
  private static instance: FeatureRegistry;
  private readonly features: Map<string, FeatureComponent<any, any>>;
  private readonly eventBus: EventBus;

  private constructor() {
    this.features = new Map();
    this.eventBus = EventBus.getInstance();
  }

  static getInstance(): FeatureRegistry {
    if (!FeatureRegistry.instance) {
      FeatureRegistry.instance = new FeatureRegistry();
    }
    return FeatureRegistry.instance;
  }

  registerFeature<T, U>(feature: FeatureComponent<T, U>): void {
    if (this.features.has(feature.metadata.id)) {
      throw new Error(`Feature with ID ${feature.metadata.id} is already registered`);
    }

    this.features.set(feature.metadata.id, feature);
    this.eventBus.publish({
      type: 'feature:registered',
      payload: {
        featureId: feature.metadata.id,
        metadata: feature.metadata,
        timestamp: Date.now(),
      },
    });
  }

  getFeature<T, U>(featureId: string): FeatureComponent<T, U> | undefined {
    return this.features.get(featureId) as FeatureComponent<T, U>;
  }

  listFeatures(): FeatureMetadata[] {
    return Array.from(this.features.values()).map(f => f.metadata);
  }

  composeFeatures<T, U, V>(
    firstFeatureId: string,
    secondFeatureId: string
  ): FeatureComponent<T, V> | undefined {
    const first = this.getFeature<T, U>(firstFeatureId);
    const second = this.getFeature<U, V>(secondFeatureId);

    if (!first || !second) {
      return undefined;
    }

    return first.combine(second);
  }

  async executeFeature<T, U>(featureId: string, input: T, context: FeatureContext): Promise<U> {
    const feature = this.getFeature<T, U>(featureId);
    if (!feature) {
      throw new Error(`Feature ${featureId} not found`);
    }

    return feature.process(input, context);
  }
}
