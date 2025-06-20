import { FeatureConfig, EngineeredFeatures, FeatureMonitoringConfig } from './types';
import { FeatureLogger } from './featureLogging';

interface MonitoringMetrics {
  timestamp: string;
  featureCounts: {
    numerical: number;
    categorical: number;
    temporal: number;
    derived: number;
  };
  qualityMetrics: {
    completeness: number;
    consistency: number;
    relevance: number;
    stability: number;
  };
  performanceMetrics: {
    processingTime: number;
    memoryUsage: number;
    errorRate: number;
  };
}

export class FeatureMonitor {
  private readonly config: FeatureMonitoringConfig;
  private readonly logger: FeatureLogger;
  private readonly metrics: MonitoringMetrics[];
  private monitoringInterval: NodeJS.Timeout | null;

  constructor(config: FeatureMonitoringConfig) {
    this.config = config;
    this.logger = new FeatureLogger();
    this.metrics = [];
    this.monitoringInterval = null;
    this.initializeMonitoring();
  }

  private initializeMonitoring(): void {
    if (this.config.enabled) {
      this.startMonitoring();
      this.logger.info('Initialized feature monitoring');
    }
  }

  private startMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      this.collectMetrics();
    }, this.config.metricsInterval);
  }

  private async collectMetrics(): Promise<void> {
    try {
      const latestMetrics = this.getLatestMetrics();
      if (latestMetrics) {
        // Recalculate metrics based on the latest data
        await this.monitorFeatures(
          {
            numerical: {},
            categorical: {},
            temporal: {},
            derived: {},
            metadata: {
              featureNames: [],
              featureTypes: {},
              scalingParams: {},
              encodingMaps: {},
              lastUpdated: new Date().toISOString(),
            },
          },
          0
        );
      }
    } catch (error) {
      this.logger.error('Failed to collect metrics', error);
    }
  }

  public async monitorFeatures(
    features: EngineeredFeatures,
    processingTime: number
  ): Promise<void> {
    try {
      if (!this.config.enabled) {
        return;
      }

      const metrics = await this.calculateMetrics(features, processingTime);
      this.metrics.push(metrics);

      // Check for alerts
      this.checkAlerts(metrics);

      // Trim metrics history if needed
      if (this.metrics.length > this.config.maxMetricsHistory) {
        this.metrics.splice(0, this.metrics.length - this.config.maxMetricsHistory);
      }

      this.logger.debug('Collected feature monitoring metrics', metrics);
    } catch (error) {
      this.logger.error('Failed to monitor features', error);
    }
  }

  private async calculateMetrics(
    features: EngineeredFeatures,
    processingTime: number
  ): Promise<MonitoringMetrics> {
    const timestamp = new Date().toISOString();
    const featureCounts = {
      numerical: Object.keys(features.numerical).length,
      categorical: Object.keys(features.categorical).length,
      temporal: Object.keys(features.temporal).length,
      derived: Object.keys(features.derived).length,
    };

    const qualityMetrics = await this.calculateQualityMetrics(features);
    const performanceMetrics = this.calculatePerformanceMetrics(processingTime);

    return {
      timestamp,
      featureCounts,
      qualityMetrics,
      performanceMetrics,
    };
  }

  private async calculateQualityMetrics(
    features: EngineeredFeatures
  ): Promise<MonitoringMetrics['qualityMetrics']> {
    const completeness = this.calculateCompleteness(features);
    const consistency = this.calculateConsistency(features);
    const relevance = this.calculateRelevance(features);
    const stability = this.calculateStability(features);

    return {
      completeness,
      consistency,
      relevance,
      stability,
    };
  }

  private calculateCompleteness(features: EngineeredFeatures): number {
    let totalValues = 0;
    let missingValues = 0;

    // Check numerical features
    for (const values of Object.values(features.numerical)) {
      totalValues += values.length;
      missingValues += values.filter(v => v === null || v === undefined || isNaN(v)).length;
    }

    // Check categorical features
    for (const values of Object.values(features.categorical)) {
      totalValues += values.length;
      missingValues += values.filter(v => v === null || v === undefined || v === '').length;
    }

    // Check temporal features
    for (const values of Object.values(features.temporal)) {
      totalValues += values.length;
      missingValues += values.filter(v => v === null || v === undefined || isNaN(v)).length;
    }

    // Check derived features
    for (const values of Object.values(features.derived)) {
      totalValues += values.length;
      missingValues += values.filter(v => v === null || v === undefined || isNaN(v)).length;
    }

    return totalValues > 0 ? 1 - missingValues / totalValues : 0;
  }

  private calculateConsistency(features: EngineeredFeatures): number {
    let consistencyScore = 0;
    let totalChecks = 0;

    // Check numerical features
    for (const [feature, values] of Object.entries(features.numerical)) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);

      // Check for outliers
      const outliers = values.filter(v => Math.abs(v - mean) > 3 * std).length;
      consistencyScore += 1 - outliers / values.length;
      totalChecks++;
    }

    // Check categorical features
    for (const [feature, values] of Object.entries(features.categorical)) {
      const uniqueValues = new Set(values).size;
      const expectedUnique = Math.min(values.length, 10); // Assuming max 10 categories
      consistencyScore += 1 - Math.abs(uniqueValues - expectedUnique) / expectedUnique;
      totalChecks++;
    }

    return totalChecks > 0 ? consistencyScore / totalChecks : 0;
  }

  private calculateRelevance(features: EngineeredFeatures): number {
    let relevanceScore = 0;
    let totalFeatures = 0;

    // Check numerical features
    for (const [feature, values] of Object.entries(features.numerical)) {
      const variance = this.calculateVariance(values);
      relevanceScore += variance > 0 ? 1 : 0;
      totalFeatures++;
    }

    // Check categorical features
    for (const [feature, values] of Object.entries(features.categorical)) {
      const uniqueValues = new Set(values).size;
      relevanceScore += uniqueValues > 1 ? 1 : 0;
      totalFeatures++;
    }

    // Check temporal features
    for (const [feature, values] of Object.entries(features.temporal)) {
      const trend = this.calculateTrend(values);
      relevanceScore += Math.abs(trend) > 0.01 ? 1 : 0;
      totalFeatures++;
    }

    // Check derived features
    for (const [feature, values] of Object.entries(features.derived)) {
      const variance = this.calculateVariance(values);
      relevanceScore += variance > 0 ? 1 : 0;
      totalFeatures++;
    }

    return totalFeatures > 0 ? relevanceScore / totalFeatures : 0;
  }

  private calculateStability(features: EngineeredFeatures): number {
    let stabilityScore = 0;
    let totalFeatures = 0;

    // Check numerical features
    for (const [feature, values] of Object.entries(features.numerical)) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
      stabilityScore += std / (Math.abs(mean) + 1e-10);
      totalFeatures++;
    }

    // Check categorical features
    for (const [feature, values] of Object.entries(features.categorical)) {
      const valueCounts = values.reduce(
        (acc, val) => {
          acc[val] = (acc[val] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const maxCount = Math.max(...Object.values(valueCounts));
      const minCount = Math.min(...Object.values(valueCounts));
      stabilityScore += 1 - (maxCount - minCount) / (maxCount + 1e-10);
      totalFeatures++;
    }

    // Check temporal features
    for (const [feature, values] of Object.entries(features.temporal)) {
      const seasonality = this.calculateSeasonality(values);
      stabilityScore += seasonality.strength;
      totalFeatures++;
    }

    // Check derived features
    for (const [feature, values] of Object.entries(features.derived)) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
      stabilityScore += std / (Math.abs(mean) + 1e-10);
      totalFeatures++;
    }

    return totalFeatures > 0 ? stabilityScore / totalFeatures : 0;
  }

  private calculatePerformanceMetrics(
    processingTime: number
  ): MonitoringMetrics['performanceMetrics'] {
    const memoryUsage = process.memoryUsage().heapUsed / 1024 / 1024; // MB
    const errorRate = this.calculateErrorRate();

    return {
      processingTime,
      memoryUsage,
      errorRate,
    };
  }

  private calculateErrorRate(): number {
    const recentMetrics = this.metrics.slice(-10);
    if (recentMetrics.length === 0) {
      return 0;
    }

    const errorCount = recentMetrics.filter(m => m.performanceMetrics.errorRate > 0).length;
    return errorCount / recentMetrics.length;
  }

  private calculateVariance(values: number[]): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    return values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
  }

  private calculateTrend(values: number[]): number {
    const x = Array.from({ length: values.length }, (_, i) => i);
    return this.calculateLinearRegressionSlope(x, values);
  }

  private calculateLinearRegressionSlope(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateSeasonality(values: number[]): {
    hasSeasonality: boolean;
    period: number;
    strength: number;
  } {
    const maxLag = Math.min(50, Math.floor(values.length / 2));
    let bestPeriod = 1;
    let maxAutocorr = -1;

    for (let lag = 1; lag <= maxLag; lag++) {
      const autocorr = this.calculateAutocorrelation(values, lag);
      if (autocorr > maxAutocorr) {
        maxAutocorr = autocorr;
        bestPeriod = lag;
      }
    }

    return {
      hasSeasonality: maxAutocorr > 0.5,
      period: bestPeriod,
      strength: maxAutocorr,
    };
  }

  private calculateAutocorrelation(values: number[], lag: number): number {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < values.length - lag; i++) {
      numerator += (values[i] - mean) * (values[i + lag] - mean);
      denominator += Math.pow(values[i] - mean, 2);
    }

    return numerator / denominator;
  }

  private checkAlerts(metrics: MonitoringMetrics): void {
    // Check quality metrics
    if (metrics.qualityMetrics.completeness < this.config.alertThresholds.completeness) {
      this.logger.warn(
        `Low feature completeness: ${metrics.qualityMetrics.completeness.toFixed(2)}`
      );
    }

    if (metrics.qualityMetrics.consistency < this.config.alertThresholds.consistency) {
      this.logger.warn(`Low feature consistency: ${metrics.qualityMetrics.consistency.toFixed(2)}`);
    }

    if (metrics.qualityMetrics.relevance < this.config.alertThresholds.relevance) {
      this.logger.warn(`Low feature relevance: ${metrics.qualityMetrics.relevance.toFixed(2)}`);
    }

    if (metrics.qualityMetrics.stability < this.config.alertThresholds.stability) {
      this.logger.warn(`Low feature stability: ${metrics.qualityMetrics.stability.toFixed(2)}`);
    }

    // Check performance metrics
    if (metrics.performanceMetrics.processingTime > this.config.alertThresholds.processingTime) {
      this.logger.warn(
        `High processing time: ${metrics.performanceMetrics.processingTime.toFixed(2)}ms`
      );
    }

    if (metrics.performanceMetrics.memoryUsage > this.config.alertThresholds.memoryUsage) {
      this.logger.warn(`High memory usage: ${metrics.performanceMetrics.memoryUsage.toFixed(2)}MB`);
    }

    if (metrics.performanceMetrics.errorRate > this.config.alertThresholds.errorRate) {
      this.logger.warn(`High error rate: ${metrics.performanceMetrics.errorRate.toFixed(2)}`);
    }
  }

  public getMetrics(): MonitoringMetrics[] {
    return [...this.metrics];
  }

  public getLatestMetrics(): MonitoringMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
  }

  public isEnabled(): boolean {
    return this.config.enabled;
  }

  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    if (enabled) {
      this.startMonitoring();
    } else if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
  }

  public getMetricsInterval(): number {
    return this.config.metricsInterval;
  }

  public setMetricsInterval(interval: number): void {
    this.config.metricsInterval = interval;
    if (this.config.enabled) {
      this.startMonitoring();
    }
  }
}
