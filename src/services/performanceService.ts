import { logger } from './logger';

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

interface PerformanceReport {
  metrics: PerformanceMetric[];
  timestamp: number;
}

class PerformanceService {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private readonly MAX_METRICS = 1000;
  private readonly REPORT_INTERVAL = 60000; // 1 minute

  constructor() {
    this.initializePerformanceObserver();
    this.startReporting();
  }

  private initializePerformanceObserver() {
    if (typeof PerformanceObserver !== 'undefined') {
      // Observe long tasks
      const longTaskObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.recordMetric('longTask', entry.duration);
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });

      // Observe layout shifts
      const layoutShiftObserver = new PerformanceObserver(list => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            this.recordMetric('layoutShift', entry.value);
          }
        });
      });
      layoutShiftObserver.observe({ entryTypes: ['layout-shift'] });

      // Observe first input delay
      const firstInputObserver = new PerformanceObserver(list => {
        list.getEntries().forEach(entry => {
          this.recordMetric('firstInput', entry.duration);
        });
      });
      firstInputObserver.observe({ entryTypes: ['first-input'] });
    }
  }

  public recordMetric(name: string, value: number) {
    const metric: PerformanceMetric = {
      name,
      value,
      timestamp: Date.now(),
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;
    metrics.push(metric);

    // Keep only the last MAX_METRICS entries
    if (metrics.length > this.MAX_METRICS) {
      metrics.shift();
    }
  }

  public getMetrics(name: string): PerformanceMetric[] {
    return this.metrics.get(name) || [];
  }

  public getAverageMetric(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  private startReporting() {
    setInterval(() => {
      const report = this.generateReport();
      this.sendReport(report);
    }, this.REPORT_INTERVAL);
  }

  private generateReport(): PerformanceReport {
    const metrics: PerformanceMetric[] = [];
    this.metrics.forEach((metricList, name) => {
      const average = this.getAverageMetric(name);
      metrics.push({
        name,
        value: average,
        timestamp: Date.now(),
      });
    });

    return {
      metrics,
      timestamp: Date.now(),
    };
  }

  private sendReport(report: PerformanceReport) {
    // In production, this would send to your analytics service
    logger.info('Performance Report:', report);
  }

  public measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    return fn().finally(() => {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    });
  }

  public measureSync<T>(name: string, fn: () => T): T {
    const start = performance.now();
    try {
      return fn();
    } finally {
      const duration = performance.now() - start;
      this.recordMetric(name, duration);
    }
  }
}

export const performanceService = new PerformanceService();
