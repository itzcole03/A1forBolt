/**
 * Utility functions for custom performance and metric tracking using Sentry.
 * Provides tracing, custom metrics, and tagging for frontend observability.
 */
/**
 * Utility functions for custom performance and metric tracking using Sentry.
 * Provides tracing, custom metrics, and tagging for frontend observability.
 */
import * as Sentry from "@sentry/react";

/**
 * Type for Sentry Span (compatible with Sentry v7+).
 */
type Span = ReturnType<typeof Sentry.startTransaction> | Sentry.Span | undefined;

/**
 * PerformanceTrackingService
 *
 * Provides utility functions to instrument custom performance monitoring
 * using Sentry. This allows for detailed tracing of application-specific
 * operations and collection of custom metrics.
 */
class PerformanceTrackingService {
  /**
   * Tracks currently active spans by name.
   * Used to manage and finish spans that are started via startTrace.
   */
  private activeSpans: Map<string, Sentry.Span> = new Map();

  /**
   * Starts a new Sentry transaction/span for a specific operation.
   * In Sentry v7+, transactions are used for top-level traces.
   *
   * The created span is stored in the `activeSpans` map by its `name`.
   * If a span with the same name already exists, it will be overwritten.
   *
   * @param name A descriptive name for the span (e.g., 'user_login_flow', 'load_dashboard_data').
   * @param op An operation name, often a category (e.g., 'ui.load', 'api.request', 'function').
   * @param description Optional longer description for the span.
   */
  public startTrace(name: string, op: string, description?: string): Sentry.Span | undefined {
    try {
      const transaction = Sentry.startTransaction({
        name,
        op,
        description,
      });

      if (transaction) {
        this.activeSpans.set(name, transaction);
      }

      return transaction;
    } catch (error) {
      console.warn('[PerformanceTrackingService] Could not start trace:', error);
      return undefined;
    }
  }

  /**
   * Adds a child span to an active Sentry span.
   * Spans can be nested to measure individual operations.
   * @param parentSpan The parent Sentry Span object.
   * @param op The operation name for the child span.
   * @param description Optional description for the span.
   * @param data Optional data to attach as span attributes (key-value pairs for additional context).
   * @returns The Sentry Span object, or undefined if the parent span is invalid.
   */
  public addSpanToTrace(
    parentSpan: Sentry.Span | undefined,
    op: string,
    description?: string,
    data?: Record<string, unknown>
  ): Sentry.Span | undefined {
    if (!parentSpan) {
      console.warn('[PerformanceTrackingService] No parent span provided. Cannot add child span.');
      return undefined;
    }

    try {
      const childSpan = parentSpan.startChild({
        op,
        description,
        data,
      });

      return childSpan;
    } catch (error) {
      console.warn('[PerformanceTrackingService] Could not add child span:', error);
      return undefined;
    }
  }

  /**
   * Ends a Sentry span and removes it from the activeSpans map if present.
   * @param span The Sentry Span object to finish.
   */
  public endTrace(span: Sentry.Span | undefined): void {
    if (span) {
      try {
        span.finish();
        // Remove from active map if it was stored by name
        for (const [name, storedSpan] of this.activeSpans.entries()) {
          if (storedSpan === span) {
            this.activeSpans.delete(name);
            break;
          }
        }
      } catch (error) {
        console.warn('[PerformanceTrackingService] Error ending trace:', error);
      }
    } else {
      console.warn('[PerformanceTrackingService] Attempted to end an undefined trace.');
    }
  }

  /**
   * Ends a Sentry span (alias for endTrace, for semantic clarity).
   * @param span The Sentry Span object to finish.
   */
  public endSpan(span: Sentry.Span | undefined): void {
    this.endTrace(span);
  }

  /**
   * Records a custom metric using Sentry's custom measurement API.
   * @param params.name The metric name.
   * @param params.value The value of the metric.
   * @param params.unit The unit of the metric (e.g., 'millisecond', 'byte').
   * @param params.tags Optional tags to attach to the metric.
   * @param params.type The type of metric (e.g., 'increment', 'distribution', 'gauge', 'set').
   */
  public recordMetric({
    name,
    value,
    unit,
    tags,
    type = 'increment'
  }: {
    name: string;
    value: number;
    unit?: string;
    tags?: { [key: string]: string | number | boolean };
    type?: 'increment' | 'distribution' | 'gauge' | 'set';
  }): void {
    try {
      // Sentry v7+ does not have a public metrics API in the browser SDK as of 2024.
      // Instead, record as a custom measurement on the current active span/transaction.
      const activeSpan = Array.from(this.activeSpans.values())[0];
      if (activeSpan) {
        if (!activeSpan.data) activeSpan.data = {};
        activeSpan.setMeasurement?.(name, value, unit);
        // Attach tags as extra data if provided
        if (tags) {
          Object.entries(tags).forEach(([tagKey, tagValue]) => {
            activeSpan.setTag?.(tagKey, String(tagValue));
          });
        }
      } else {
        // Fallback: Attach to the current scope (not as a metric, but as extra context)
        Sentry.setContext('metric', { name, value, unit, tags, type });
      }
    } catch (error) {
      console.warn('[PerformanceTrackingService] Error recording metric:', error);
    }
  }

  /**
   * Sets a tag on the current Sentry scope.
   * @param key The tag key.
   * @param value The tag value.
   */
  public setTag(key: string, value: string | number | boolean): void {
    try {
      Sentry.setTag(key, String(value));
    } catch (error) {
      console.warn('[PerformanceTrackingService] Error setting tag:', error);
    }
  }

  /**
   * Sets extra context data on the current Sentry scope.
   * @param key The context key.
   * @param data The context data.
   */
  public setExtra(key: string, data: unknown): void {
    try {
      Sentry.setExtra(key, data);
    } catch (error) {
      console.warn('[PerformanceTrackingService] Error setting extra data:', error);
    }
  }
}

/**
 * Singleton instance of PerformanceTrackingService.
 * Use this for all custom performance and metric tracking in the frontend.
 */
export const performanceTrackingService = new PerformanceTrackingService();

/**
 * Example Usage (conceptual):
 *     // ... await Promise.all([...]) ...
 *     performanceTrackingService.recordMetric({ name: 'dashboard.data.items_loaded', value: 100 });
 *   } catch (e) {
 *     Sentry.captureException(e); // Capture error if something goes wrong
 *   } finally {
 *     if(fetchDataSpan) performanceTrackingService.endSpan(fetchDataSpan);
 *     if(trace) performanceTrackingService.endTrace(trace);
 *   }
 * }
 */
