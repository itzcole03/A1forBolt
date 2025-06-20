import { DataSource } from './PredictionEngine';
import { EventBus } from './EventBus';
import { PerformanceMonitor } from './PerformanceMonitor';



export interface PipelineMetrics {
  processedCount: number;
  errorCount: number;
  averageLatency: number;
  lastProcessed: number;
  throughput: number;
}

export interface PipelineStage<T, U> {
  id: string;
  transform(data: T): Promise<U>;
  validate?(data: T): Promise<boolean>;
  cleanup?(data: T): Promise<void>;
}

export interface DataSink<T> {
  id: string;
  write(data: T): Promise<void>;
  flush?(): Promise<void>;
}

export class DataCache<T> {
  private cache: Map<string, { data: T; timestamp: number; ttl: number }>;

  constructor(private defaultTtl: number = 5 * 60 * 1000) {
    this.cache = new Map();
  }

  set(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.defaultTtl
    });
  }

  get(key: string): T | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return undefined;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }
}

export class StreamingDataPipeline<T, U> {
  private readonly metrics: PipelineMetrics;
  private readonly cache: DataCache<T>;
  private readonly eventBus: EventBus;
  private readonly performanceMonitor: PerformanceMonitor;
  private isRunning: boolean = false;
  private processInterval: NodeJS.Timeout | null = null;

  constructor(
    private readonly source: DataSource,
    private readonly stages: PipelineStage<any, any>[],
    private readonly sink: DataSink<U>,
    private readonly options: {
      cacheEnabled: boolean;
      cacheTtl?: number;
      processingInterval?: number;
      retryAttempts?: number;
      batchSize?: number;
    } = {
      cacheEnabled: true,
      cacheTtl: 5 * 60 * 1000,
      processingInterval: 1000,
      retryAttempts: 3,
      batchSize: 100
    }
  ) {
    this.metrics = {
      processedCount: 0,
      errorCount: 0,
      averageLatency: 0,
      lastProcessed: 0,
      throughput: 0
    };
    this.cache = new DataCache<T>(options.cacheTtl);
    this.eventBus = EventBus.getInstance();
    this.performanceMonitor = PerformanceMonitor.getInstance();
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    this.processInterval = setInterval(
      () => this.process(),
      this.options.processingInterval
    );

    this.eventBus.publish({
      type: 'pipeline:started',
      payload: {
        sourceId: this.source.id,
        sinkId: this.sink.id,
        timestamp: Date.now()
      }
    });
  }

  async stop(): Promise<void> {
    if (!this.isRunning) return;
    this.isRunning = false;

    if (this.processInterval) {
      clearInterval(this.processInterval);
      this.processInterval = null;
    }

    if (this.sink.flush) {
      await this.sink.flush();
    }

    this.eventBus.publish({
      type: 'pipeline:stopped',
      payload: {
        sourceId: this.source.id,
        sinkId: this.sink.id,
        timestamp: Date.now(),
        metrics: this.metrics
      }
    });
  }

  private async process(): Promise<void> {
    const traceId = this.performanceMonitor.startTrace('pipeline-processing', {
      sourceId: this.source.id,
      sinkId: this.sink.id
    });

    try {
      const startTime = Date.now();
      const data = await this.source.fetch();

      if (this.options.cacheEnabled) {
        const cacheKey = this.generateCacheKey(data as T);
        const cached = this.cache.get(cacheKey);
        if (cached) {
          this.performanceMonitor.endTrace(traceId);
          return;
        }
        this.cache.set(cacheKey, data as T);
      }

      let transformed = data;
      for (const stage of this.stages) {
        const stageTraceId = this.performanceMonitor.startTrace(`pipeline-stage-${stage.id}`);
        
        try {
          if (stage.validate) {
            const isValid = await stage.validate(transformed);
            if (!isValid) {
              throw new Error(`Validation failed at stage ${stage.id}`);
            }
          }

          transformed = await stage.transform(transformed);
          this.performanceMonitor.endTrace(stageTraceId);
        } catch (error) {
          this.performanceMonitor.endTrace(stageTraceId, error as Error);
          throw error;
        }
      }

      await this.sink.write(transformed as U);

      const duration = Date.now() - startTime;
      this.updateMetrics(duration);

      this.eventBus.publish({
        type: 'pipeline:processed',
        payload: {
          sourceId: this.source.id,
          sinkId: this.sink.id,
          duration,
          timestamp: Date.now()
        }
      });

      this.performanceMonitor.endTrace(traceId);
    } catch (error) {
      this.metrics.errorCount++;
      this.performanceMonitor.endTrace(traceId, error as Error);

      this.eventBus.publish({
        type: 'pipeline:error',
        payload: {
          sourceId: this.source.id,
          sinkId: this.sink.id,
          error: error as Error,
          timestamp: Date.now()
        }
      });
    }
  }

  private generateCacheKey(data: T): string {
    return `${this.source.id}-${JSON.stringify(data)}`;
  }

  private updateMetrics(duration: number): void {
    this.metrics.processedCount++;
    this.metrics.lastProcessed = Date.now();
    this.metrics.averageLatency = 
      (this.metrics.averageLatency * (this.metrics.processedCount - 1) + duration) / 
      this.metrics.processedCount;
    this.metrics.throughput = this.metrics.processedCount / 
      ((Date.now() - this.metrics.lastProcessed) / 1000);
  }

  getMetrics(): PipelineMetrics {
    return { ...this.metrics };
  }
} 