import { UnifiedMetrics } from './types';

class Metrics implements UnifiedMetrics {
  private metrics: Map<string, number> = new Map();
  private tags: Map<string, Record<string, string>> = new Map();

  track(name: string, value?: number, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    this.metrics.set(key, value || 1);
    if (tags) {
      this.tags.set(key, tags);
    }
  }

  increment(name: string, value?: number, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    const currentValue = this.metrics.get(key) || 0;
    this.metrics.set(key, currentValue + (value || 1));
    if (tags) {
      this.tags.set(key, tags);
    }
  }

  gauge(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    this.metrics.set(key, value);
    if (tags) {
      this.tags.set(key, tags);
    }
  }

  timing(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    this.metrics.set(key, value);
    if (tags) {
      this.tags.set(key, tags);
    }
  }

  histogram(name: string, value: number, tags?: Record<string, string>): void {
    const key = this.getMetricKey(name, tags);
    this.metrics.set(key, value);
    if (tags) {
      this.tags.set(key, tags);
    }
  }

  private getMetricKey(name: string, tags?: Record<string, string>): string {
    if (!tags) return name;
    const sortedTags = Object.entries(tags)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k}:${v}`)
      .join(',');
    return `${name}{${sortedTags}}`;
  }

  getMetrics(): Map<string, number> {
    return new Map(this.metrics);
  }

  getTags(): Map<string, Record<string, string>> {
    return new Map(this.tags);
  }

  clear(): void {
    this.metrics.clear();
    this.tags.clear();
  }
}

const metricsInstance = new Metrics();

export function getMetrics(): UnifiedMetrics {
  return metricsInstance;
}
