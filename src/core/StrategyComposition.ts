import { AnalysisResult } from './AnalysisFramework';
import { EventBus } from './EventBus';
import { IntegratedData } from './DataIntegrationHub';
import { PerformanceMonitor } from './PerformanceMonitor';

export interface StrategyContext {
  timestamp: number;
  environment: string;
  parameters: Record<string, any>;
  constraints: Record<string, any>;
  metadata: Record<string, any>;
}

export interface StrategyComponent<T, U> {
  id: string;
  name: string;
  version: string;
  priority: number;
  dependencies: string[];
  evaluate(input: T, context: StrategyContext): Promise<U>;
  validate?(input: T): Promise<boolean>;
  canHandle(input: T): boolean;
}

export interface StrategyResult<T> {
  id: string;
  timestamp: number;
  duration: number;
  data: T;
  confidence: number;
  metadata: {
    strategy: string;
    version: string;
    parameters: Record<string, string | number | boolean | object>;
  };
  metrics: {
    accuracy: number;
    reliability: number;
    performance: number;
  };
}

export class StrategyRegistry {
  private static instance: StrategyRegistry;
  private readonly strategies: Map<string, StrategyComponent<any, any>>;
  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;

  private constructor() {
    this.strategies = new Map();
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  static getInstance(): StrategyRegistry {
    if (!StrategyRegistry.instance) {
      StrategyRegistry.instance = new StrategyRegistry();
    }
    return StrategyRegistry.instance;
  }

  registerStrategy<T, U>(strategy: StrategyComponent<T, U>): void {
    if (this.strategies.has(strategy.id)) {
      throw new Error(`Strategy with ID ${strategy.id} is already registered`);
    }

    // Validate dependencies
    for (const depId of strategy.dependencies) {
      if (!this.strategies.has(depId)) {
        throw new Error(`Dependency ${depId} not found for strategy ${strategy.id}`);
      }
    }

    this.strategies.set(strategy.id, strategy);
    this.eventBus.publish({
      type: 'strategy:registered',
      payload: {
        strategyId: strategy.id,
        name: strategy.name,
        version: strategy.version,
        timestamp: Date.now(),
      },
    });
  }

  async evaluate<T, U>(
    strategyId: string,
    input: T,
    context: StrategyContext
  ): Promise<StrategyResult<U>> {
    const strategy = this.strategies.get(strategyId) as StrategyComponent<T, U>;
    if (!strategy) {
      throw new Error(`Strategy ${strategyId} not found`);
    }

    const traceId = this.performanceMonitor.startTrace(`strategy-${strategy.id}`, {
      strategyId: strategy.id,
      version: strategy.version,
    });

    try {
      if (!strategy.canHandle(input)) {
        throw new Error(`Strategy ${strategy.id} cannot handle the provided input`);
      }

      if (strategy.validate && !(await strategy.validate(input))) {
        throw new Error(`Input validation failed for strategy ${strategy.id}`);
      }

      const startTime = Date.now();
      const result = await strategy.evaluate(input, context);
      const duration = Date.now() - startTime;

      const metrics = this.calculateMetrics(result);
      const strategyResult: StrategyResult<U> = {
        id: `${strategy.id}-${startTime}`,
        timestamp: startTime,
        duration,
        data: result,
        confidence: this.calculateConfidence(result),
        metadata: {
          strategy: strategy.id,
          version: strategy.version,
          parameters: context.parameters,
        },
        metrics,
      };

      this.eventBus.publish({
        type: 'strategy:evaluated',
        payload: {
          strategyId: strategy.id,
          resultId: strategyResult.id,
          duration,
          metrics,
          timestamp: Date.now(),
        },
      });

      this.performanceMonitor.endTrace(traceId);
      return strategyResult;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  async evaluateWithPipeline<T, U>(
    strategies: string[],
    input: T,
    context: StrategyContext
  ): Promise<StrategyResult<U>> {
    const sortedStrategies = this.sortStrategiesByDependencies(strategies);
    let currentInput: any = input;
    let lastResult: StrategyResult<any> | null = null;

    for (const strategyId of sortedStrategies) {
      lastResult = await this.evaluate(strategyId, currentInput, {
        ...context,
        parameters: {
          ...context.parameters,
          previousResults: lastResult ? [lastResult] : [],
        },
      });
      currentInput = lastResult.data;
    }

    return lastResult as StrategyResult<U>;
  }

  private sortStrategiesByDependencies(strategyIds: string[]): string[] {
    const graph = new Map<string, Set<string>>();
    const visited = new Set<string>();
    const sorted: string[] = [];

    // Build dependency graph
    for (const id of strategyIds) {
      const strategy = this.strategies.get(id);
      if (!strategy) continue;

      graph.set(id, new Set(strategy.dependencies));
    }

    // Topological sort
    const visit = (id: string) => {
      if (visited.has(id)) return;
      visited.add(id);

      const deps = graph.get(id) || new Set();
      for (const dep of deps) {
        visit(dep);
      }

      sorted.push(id);
    };

    for (const id of strategyIds) {
      visit(id);
    }

    return sorted;
  }

  private calculateConfidence(result: any): number {
    if (typeof result === 'object' && result !== null) {
      if ('confidence' in result) return result.confidence;
      if ('probability' in result) return result.probability;
      if ('score' in result) return result.score;
    }
    return 1;
  }

  private calculateMetrics(result: any): StrategyResult<any>['metrics'] {
    return {
      accuracy: this.calculateAccuracy(result),
      reliability: this.calculateReliability(result),
      performance: this.calculatePerformance(result),
    };
  }

  private calculateAccuracy(result: any): number {
    if (typeof result === 'object' && result !== null) {
      if ('accuracy' in result) return result.accuracy;
      if ('confidence' in result) return result.confidence;
    }
    return 1;
  }

  private calculateReliability(result: any): number {
    if (typeof result === 'object' && result !== null) {
      if ('reliability' in result) return result.reliability;
      if ('stability' in result) return result.stability;
    }
    return 1;
  }

  private calculatePerformance(result: any): number {
    if (typeof result === 'object' && result !== null) {
      if ('performance' in result) return result.performance;
      if ('efficiency' in result) return result.efficiency;
    }
    return 1;
  }

  getStrategy<T, U>(strategyId: string): StrategyComponent<T, U> | undefined {
    return this.strategies.get(strategyId) as StrategyComponent<T, U>;
  }

  listStrategies(): Array<{ id: string; name: string; version: string }> {
    return Array.from(this.strategies.values()).map(s => ({
      id: s.id,
      name: s.name,
      version: s.version,
    }));
  }
}

export class ComposableStrategy<T, U> implements StrategyComponent<T, U> {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly version: string,
    public readonly priority: number,
    public readonly dependencies: string[],
    private readonly evaluator: (input: T, context: StrategyContext) => Promise<U>,
    private readonly validator?: (input: T) => Promise<boolean>,
    private readonly handler?: (input: T) => boolean
  ) {}

  async evaluate(input: T, context: StrategyContext): Promise<U> {
    return this.evaluator(input, context);
  }

  async validate(input: T): Promise<boolean> {
    if (this.validator) {
      return this.validator(input);
    }
    return true;
  }

  canHandle(input: T): boolean {
    if (this.handler) {
      return this.handler(input);
    }
    return true;
  }

  compose<V>(next: StrategyComponent<U, V>): StrategyComponent<T, V> {
    return new ComposableStrategy(
      `${this.id}->${next.id}`,
      `${this.name} -> ${next.name}`,
      `${this.version}+${next.version}`,
      Math.max(this.priority, next.priority),
      [...this.dependencies, ...next.dependencies],
      async (input: T, context: StrategyContext) => {
        const intermediate = await this.evaluate(input, context);
        return next.evaluate(intermediate, context);
      }
    );
  }
}
