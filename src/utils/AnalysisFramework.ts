import { EventBus } from './EventBus.ts';
import { PerformanceMonitor } from './PerformanceMonitor.ts';
import { TimestampedData, AnalysisResult } from '../core/types/core.ts';
import { UnifiedMonitor } from './UnifiedMonitor.ts';



export interface AnalysisContext {
  timestamp: number;
  streamConfidence: number;
  modelDiversity: number;
  predictionStability: number;
  metadata?: Record<string, any>;
}

export interface AnalysisPlugin<TInput, TOutput> {
  id: string;
  name: string;
  version: string;
  analyze(input: TInput, context: AnalysisContext): Promise<TOutput>;
  confidence: number;
  metadata: {
    description: string;
    author: string;
    dependencies: string[];
    tags: string[];
  };
}

export class AnalysisRegistry {
  private static instance: AnalysisRegistry;
  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private readonly monitor: UnifiedMonitor;
  private readonly plugins: Map<string, AnalysisPlugin<any, any>>;
  private readonly pluginDependencies: Map<string, Set<string>>;
  private readonly pluginConfidence: Map<string, number>;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
    this.monitor = UnifiedMonitor.getInstance();
    this.plugins = new Map();
    this.pluginDependencies = new Map();
    this.pluginConfidence = new Map();
  }

  static getInstance(): AnalysisRegistry {
    if (!AnalysisRegistry.instance) {
      AnalysisRegistry.instance = new AnalysisRegistry();
    }
    return AnalysisRegistry.instance;
  }

  public registerPlugin<TInput, TOutput>(
    plugin: AnalysisPlugin<TInput, TOutput>
  ): void {
    if (this.plugins.has(plugin.id)) {
      throw new Error(`Plugin with ID ${plugin.id} already registered`);
    }

    // Validate plugin dependencies
    this.validateDependencies(plugin);

    // Register plugin
    this.plugins.set(plugin.id, plugin);
    this.pluginDependencies.set(plugin.id, new Set(plugin.metadata.dependencies));
    this.pluginConfidence.set(plugin.id, plugin.confidence);

    // Emit plugin registered event
    this.eventBus.emit('metric:recorded', {
      name: 'plugin_registered',
      value: 1,
      timestamp: Date.now(),
      labels: {
        plugin_id: plugin.id,
        plugin_name: plugin.name,
        plugin_version: plugin.version
      }
    });
  }

  public unregisterPlugin(pluginId: string): void {
    if (!this.plugins.has(pluginId)) {
      return;
    }

    // Check if any other plugins depend on this one
    for (const [id, dependencies] of this.pluginDependencies.entries()) {
      if (dependencies.has(pluginId)) {
        throw new Error(
          `Cannot unregister plugin ${pluginId} as it is required by plugin ${id}`
        );
      }
    }

    this.plugins.delete(pluginId);
    this.pluginDependencies.delete(pluginId);
    this.pluginConfidence.delete(pluginId);

    // Emit plugin unregistered event
    this.eventBus.emit('metric:recorded', {
      name: 'plugin_unregistered',
      value: 1,
      timestamp: Date.now(),
      labels: {
        plugin_id: pluginId
      }
    });
  }

  public getPlugin<TInput, TOutput>(
    pluginId: string
  ): AnalysisPlugin<TInput, TOutput> | undefined {
    return this.plugins.get(pluginId) as AnalysisPlugin<TInput, TOutput> | undefined;
  }

  public async analyze<TInput, TOutput>(
    pluginId: string,
    input: TInput,
    context: AnalysisContext
  ): Promise<TOutput> {
    const plugin = this.getPlugin<TInput, TOutput>(pluginId);
    if (!plugin) {
      throw new Error(`Plugin ${pluginId} not found`);
    }

    const traceId = this.performanceMonitor.startTrace('plugin-analysis', {
      pluginId,
      pluginName: plugin.name,
      pluginVersion: plugin.version
    });

    try {
      // Run analysis
      const result = await plugin.analyze(input, context);

      // Update plugin confidence based on result
      this.updatePluginConfidence(pluginId, context);

      this.performanceMonitor.endTrace(traceId);
      return result;
    } catch (error) {
      this.performanceMonitor.endTrace(traceId, error as Error);
      throw error;
    }
  }

  public async analyzeWithFallback<TInput, TOutput>(
    primaryPluginId: string,
    fallbackPluginId: string,
    input: TInput,
    context: AnalysisContext
  ): Promise<TOutput> {
    try {
      return await this.analyze<TInput, TOutput>(primaryPluginId, input, context);
    } catch (error) {
      this.monitor.logError('analysis', error as Error, {
        primaryPluginId,
        fallbackPluginId
      });
      return await this.analyze<TInput, TOutput>(fallbackPluginId, input, context);
    }
  }

  public getPluginsByTag(tag: string): AnalysisPlugin<any, any>[] {
    return Array.from(this.plugins.values()).filter(plugin =>
      plugin.metadata.tags.includes(tag)
    );
  }

  public getPluginConfidence(pluginId: string): number {
    return this.pluginConfidence.get(pluginId) || 0;
  }

  private validateDependencies(plugin: AnalysisPlugin<any, any>): void {
    for (const dependency of plugin.metadata.dependencies) {
      if (!this.plugins.has(dependency)) {
        throw new Error(
          `Plugin ${plugin.id} requires missing dependency ${dependency}`
        );
      }
    }
  }

  private updatePluginConfidence(pluginId: string, context: AnalysisContext): void {
    const currentConfidence = this.pluginConfidence.get(pluginId) || 0;
    const plugin = this.plugins.get(pluginId);
    if (!plugin) return;

    // Update confidence based on context and stability
    const newConfidence = this.calculatePluginConfidence(
      currentConfidence,
      plugin,
      context
    );

    this.pluginConfidence.set(pluginId, newConfidence);

    // Emit confidence update event
    this.eventBus.emit('metric:recorded', {
      name: 'plugin_confidence',
      value: newConfidence,
      timestamp: Date.now(),
      labels: {
        plugin_id: pluginId,
        plugin_name: plugin.name
      }
    });
  }

  private calculatePluginConfidence(
    currentConfidence: number,
    plugin: AnalysisPlugin<any, any>,
    context: AnalysisContext
  ): number {
    const weights = {
      streamConfidence: 0.3,
      modelDiversity: 0.2,
      predictionStability: 0.3,
      historicalConfidence: 0.2
    };

    const newConfidence =
      context.streamConfidence * weights.streamConfidence +
      context.modelDiversity * weights.modelDiversity +
      context.predictionStability * weights.predictionStability +
      currentConfidence * weights.historicalConfidence;

    return Math.max(0, Math.min(1, newConfidence));
  }
} 