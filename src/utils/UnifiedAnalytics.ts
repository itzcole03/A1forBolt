import { EventBus } from '../core/EventBus.js';
import { unifiedMonitor } from '../core/UnifiedMonitor.ts';

type AnalyticsData = Record<string, unknown>;

export interface AnalyticsEvent {
  id: string;
  type: string;
  timestamp: number;
  data: AnalyticsData;
  metadata?: AnalyticsData;
}

interface AnalyticsMetrics {
  totalEvents: number;
  eventsByType: Map<string, number>;
  averageLatency: number;
  errorRate: number;
  lastProcessed: number;
}

interface AnalyticsConfig {
  enabled: boolean;
  sampleRate: number;
  retentionPeriod: number;
  batchSize: number;
  flushInterval: number;
}

export class UnifiedAnalytics {
  private static instance: UnifiedAnalytics;
  private readonly eventBus: EventBus;
  private readonly monitor = unifiedMonitor;
  private readonly eventQueue: AnalyticsEvent[];
  private readonly metrics: AnalyticsMetrics;
  private config: AnalyticsConfig;
  private flushTimer: NodeJS.Timeout | null;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.eventQueue = [];
    this.metrics = {
      totalEvents: 0,
      eventsByType: new Map(),
      averageLatency: 0,
      errorRate: 0,
      lastProcessed: Date.now()
    };
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      retentionPeriod: 30 * 24 * 60 * 60 * 1000, // 30 days
      batchSize: 100,
      flushInterval: 5000 // 5 seconds
    };
    this.flushTimer = null;
    this.setupEventListeners();
    this.startFlushTimer();
  }

  public static getInstance(): UnifiedAnalytics {
    if (!UnifiedAnalytics.instance) {
      UnifiedAnalytics.instance = new UnifiedAnalytics();
    }
    return UnifiedAnalytics.instance;
  }

  private setupEventListeners(): void {
    // Listen for all events that need analytics tracking
    this.eventBus.on('market:update', (data: unknown) => {
      this.trackEvent('market_update', data as AnalyticsData);
    });
    this.eventBus.on('prediction:update', (data: unknown) => {
      this.trackEvent('prediction_update', data as AnalyticsData);
    });
    this.eventBus.on('risk:violation', (data: unknown) => {
      this.trackEvent('risk_violation', data as AnalyticsData);
    });
    this.eventBus.on('monitor:alert', (data: unknown) => {
      this.trackEvent('system_alert', data as AnalyticsData);
    });
  }

  private startFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }
    this.flushTimer = setInterval(() => {
      this.flushEvents();
    }, this.config.flushInterval);
  }

  public trackEvent(type: string, data: AnalyticsData, metadata?: AnalyticsData): void {
    if (!this.config.enabled) return;

    // Apply sampling
    if (Math.random() > this.config.sampleRate) return;

    const event: AnalyticsEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      data,
      metadata
    };

    this.eventQueue.push(event);
    this.updateMetrics(event);

    // Flush if queue size exceeds batch size
    if (this.eventQueue.length >= this.config.batchSize) {
      this.flushEvents();
    }
  }

  private updateMetrics(event: AnalyticsEvent): void {
    this.metrics.totalEvents++;
    
    const currentCount = this.metrics.eventsByType.get(event.type) || 0;
    this.metrics.eventsByType.set(event.type, currentCount + 1);

    const latency = Date.now() - event.timestamp;
    this.metrics.averageLatency = (
      this.metrics.averageLatency * (this.metrics.totalEvents - 1) + latency
    ) / this.metrics.totalEvents;

    this.metrics.lastProcessed = Date.now();
  }

  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue.length = 0; // Clear the queue

    try {
      // In a real implementation, this would send events to an analytics service
      await this.processEvents(events);
      
      this.eventBus.emit('analytics:flushed', {
        count: events.length,
        timestamp: Date.now()
      });
    } catch (error) {
      this.metrics.errorRate = (this.metrics.errorRate * this.metrics.totalEvents + 1) / (this.metrics.totalEvents + 1);
      this.monitor.reportError(error, {
        source: 'analytics',
        eventCount: events.length,
        firstEventTimestamp: events[0].timestamp,
        lastEventTimestamp: events[events.length - 1].timestamp
      });

      // Retry failed events
      this.eventQueue.push(...events);
    }
  }

  /**
   * Process and send analytics events to the backend analytics service.
   * Formats events, sends them via fetch, and updates metrics.
   * Falls back to local logging if the service is unavailable.
   */
  private async processEvents(events: AnalyticsEvent[]): Promise<void> {
    try {
      // Format events for backend
      const payload = { events };
      const response = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Analytics service error: ${response.status}`);
      }
      // Optionally update metrics based on response
    } catch (error) {
      // Fallback: log events locally if backend is unavailable
      console.warn('Analytics service unavailable, logging events locally.', events);
      this.monitor.reportError(error, { source: 'analytics', fallback: true, eventCount: events.length });
    }
  }

  public getMetrics(): AnalyticsMetrics {
    return { ...this.metrics };
  }

  public updateConfig(updates: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...updates };
    
    if (updates.flushInterval !== undefined) {
      this.startFlushTimer();
    }

    this.eventBus.emit('analytics:config:updated', {
      config: this.config,
      timestamp: Date.now()
    });
  }

  public async cleanup(): Promise<void> {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }

    // Flush any remaining events
    await this.flushEvents();

    // Clear metrics
    this.metrics.totalEvents = 0;
    this.metrics.eventsByType.clear();
    this.metrics.averageLatency = 0;
    this.metrics.errorRate = 0;
    this.metrics.lastProcessed = Date.now();

    this.eventBus.emit('analytics:cleanup', {
      timestamp: Date.now()
    });
  }
} 