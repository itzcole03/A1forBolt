import { FeatureConfig, EngineeredFeatures, FeatureValidationResult } from './types';
import { FeatureLogger } from './featureLogging';
import { Matrix } from 'ml-matrix';

export class FeatureValidator {
  private readonly config: FeatureConfig;
  private readonly logger: FeatureLogger;

  constructor(config: FeatureConfig) {
    this.config = config;
    this.logger = new FeatureLogger();
  }

  public async validate(features: EngineeredFeatures): Promise<FeatureValidationResult> {
    try {
      const result: FeatureValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
      };

      // Validate numerical features
      const numericalValidation = await this.validateNumericalFeatures(features.numerical);
      this.mergeValidationResults(result, numericalValidation);

      // Validate categorical features
      const categoricalValidation = await this.validateCategoricalFeatures(features.categorical);
      this.mergeValidationResults(result, categoricalValidation);

      // Validate temporal features
      const temporalValidation = await this.validateTemporalFeatures(features.temporal);
      this.mergeValidationResults(result, temporalValidation);

      // Validate derived features
      const derivedValidation = await this.validateDerivedFeatures(features.derived);
      this.mergeValidationResults(result, derivedValidation);

      // Validate feature metadata
      const metadataValidation = await this.validateFeatureMetadata(features.metadata);
      this.mergeValidationResults(result, metadataValidation);

      // Check overall validation threshold
      result.isValid = this.checkValidationThreshold(result);

      return result;
    } catch (error) {
      this.logger.error('Error in feature validation', error);
      throw error;
    }
  }

  private async validateNumericalFeatures(
    features: Record<string, number[]>
  ): Promise<FeatureValidationResult> {
    const result: FeatureValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    for (const [feature, values] of Object.entries(features)) {
      // Check for missing values
      const missingCount = values.filter(v => v === null || v === undefined || isNaN(v)).length;
      if (missingCount > 0) {
        result.errors.push(`Feature ${feature} has ${missingCount} missing values`);
      }

      // Check for infinite values
      const infiniteCount = values.filter(v => !isFinite(v)).length;
      if (infiniteCount > 0) {
        result.errors.push(`Feature ${feature} has ${infiniteCount} infinite values`);
      }

      // Check for constant values
      const uniqueValues = new Set(values).size;
      if (uniqueValues === 1) {
        result.warnings.push(`Feature ${feature} is constant`);
      }

      // Check for outliers
      const outliers = this.detectOutliers(values);
      if (outliers.length > 0) {
        result.warnings.push(`Feature ${feature} has ${outliers.length} outliers`);
      }

      // Check for distribution
      const distributionCheck = this.checkDistribution(values);
      if (!distributionCheck.isValid) {
        result.warnings.push(
          `Feature ${feature} has non-normal distribution: ${distributionCheck.reason}`
        );
      }
    }

    return result;
  }

  private async validateCategoricalFeatures(
    features: Record<string, string[]>
  ): Promise<FeatureValidationResult> {
    const result: FeatureValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    for (const [feature, values] of Object.entries(features)) {
      // Check for missing values
      const missingCount = values.filter(v => v === null || v === undefined || v === '').length;
      if (missingCount > 0) {
        result.errors.push(`Feature ${feature} has ${missingCount} missing values`);
      }

      // Check cardinality
      const uniqueValues = new Set(values).size;
      if (uniqueValues === 1) {
        result.warnings.push(`Feature ${feature} has only one unique value`);
      } else if (uniqueValues === values.length) {
        result.warnings.push(`Feature ${feature} has too many unique values`);
      }

      // Check value distribution
      const distribution = this.calculateValueDistribution(values);
      const imbalancedCategories = this.detectImbalancedCategories(distribution);
      if (imbalancedCategories.length > 0) {
        result.warnings.push(
          `Feature ${feature} has imbalanced categories: ${imbalancedCategories.join(', ')}`
        );
      }
    }

    return result;
  }

  private async validateTemporalFeatures(
    features: Record<string, number[]>
  ): Promise<FeatureValidationResult> {
    const result: FeatureValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    for (const [feature, values] of Object.entries(features)) {
      // Check for missing values
      const missingCount = values.filter(v => v === null || v === undefined || isNaN(v)).length;
      if (missingCount > 0) {
        result.errors.push(`Feature ${feature} has ${missingCount} missing values`);
      }

      // Check for temporal consistency
      const consistencyCheck = this.checkTemporalConsistency(values);
      if (!consistencyCheck.isValid) {
        result.errors.push(
          `Feature ${feature} has temporal inconsistency: ${consistencyCheck.reason}`
        );
      }

      // Check for seasonality
      const seasonalityCheck = this.checkSeasonality(values);
      if (seasonalityCheck.hasSeasonality) {
        result.warnings.push(
          `Feature ${feature} shows seasonality with period ${seasonalityCheck.period}`
        );
      }

      // Check for trend
      const trendCheck = this.checkTrend(values);
      if (trendCheck.hasTrend) {
        result.warnings.push(`Feature ${feature} shows ${trendCheck.trendType} trend`);
      }
    }

    return result;
  }

  private async validateDerivedFeatures(
    features: Record<string, number[]>
  ): Promise<FeatureValidationResult> {
    const result: FeatureValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    for (const [feature, values] of Object.entries(features)) {
      // Check for missing values
      const missingCount = values.filter(v => v === null || v === undefined || isNaN(v)).length;
      if (missingCount > 0) {
        result.errors.push(`Feature ${feature} has ${missingCount} missing values`);
      }

      // Check for infinite values
      const infiniteCount = values.filter(v => !isFinite(v)).length;
      if (infiniteCount > 0) {
        result.errors.push(`Feature ${feature} has ${infiniteCount} infinite values`);
      }

      // Check for correlation with original features
      const correlationCheck = this.checkFeatureCorrelation(feature, values);
      if (correlationCheck.hasHighCorrelation) {
        result.warnings.push(
          `Feature ${feature} has high correlation with ${correlationCheck.correlatedFeatures.join(', ')}`
        );
      }
    }

    return result;
  }

  private async validateFeatureMetadata(
    metadata: EngineeredFeatures['metadata']
  ): Promise<FeatureValidationResult> {
    const result: FeatureValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
    };

    // Check feature names
    if (metadata.featureNames.length === 0) {
      result.errors.push('No feature names provided');
    }

    // Check feature types
    for (const [feature, type] of Object.entries(metadata.featureTypes)) {
      if (!['numerical', 'categorical', 'temporal', 'derived'].includes(type)) {
        result.errors.push(`Invalid feature type for ${feature}: ${type}`);
      }
    }

    // Check scaling parameters
    for (const [feature, params] of Object.entries(metadata.scalingParams)) {
      if (isNaN(params.mean) || isNaN(params.std) || params.std <= 0) {
        result.errors.push(`Invalid scaling parameters for ${feature}`);
      }
    }

    // Check encoding maps
    for (const [feature, encodingMap] of Object.entries(metadata.encodingMaps)) {
      if (Object.keys(encodingMap).length === 0) {
        result.warnings.push(`Empty encoding map for ${feature}`);
      }
    }

    return result;
  }

  private mergeValidationResults(
    target: FeatureValidationResult,
    source: FeatureValidationResult
  ): void {
    target.errors.push(...source.errors);
    target.warnings.push(...source.warnings);
    target.isValid = target.isValid && source.isValid;
  }

  private checkValidationThreshold(result: FeatureValidationResult): boolean {
    const totalChecks = result.errors.length + result.warnings.length;
    const errorRatio = result.errors.length / totalChecks;
    return errorRatio <= 1 - this.config.validationThreshold;
  }

  private detectOutliers(values: number[]): number[] {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);
    const threshold = 3; // 3 standard deviations

    return values.filter(value => Math.abs(value - mean) > threshold * std);
  }

  private checkDistribution(values: number[]): { isValid: boolean; reason: string } {
    // Simple normality test using skewness and kurtosis
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);

    const skewness =
      values.reduce((a, b) => a + Math.pow(b - mean, 3), 0) / (values.length * Math.pow(std, 3));
    const kurtosis =
      values.reduce((a, b) => a + Math.pow(b - mean, 4), 0) / (values.length * Math.pow(std, 4)) -
      3;

    if (Math.abs(skewness) > 1) {
      return { isValid: false, reason: `High skewness (${skewness.toFixed(2)})` };
    }
    if (Math.abs(kurtosis) > 1) {
      return { isValid: false, reason: `High kurtosis (${kurtosis.toFixed(2)})` };
    }

    return { isValid: true, reason: '' };
  }

  private calculateValueDistribution(values: string[]): Record<string, number> {
    const distribution: Record<string, number> = {};
    const total = values.length;

    for (const value of values) {
      distribution[value] = (distribution[value] || 0) + 1;
    }

    for (const key of Object.keys(distribution)) {
      distribution[key] /= total;
    }

    return distribution;
  }

  private detectImbalancedCategories(distribution: Record<string, number>): string[] {
    const threshold = 0.1; // 10% threshold for imbalance
    return Object.entries(distribution)
      .filter(([_, ratio]) => ratio < threshold)
      .map(([category]) => category);
  }

  private checkTemporalConsistency(values: number[]): {
    isValid: boolean;
    reason: string;
  } {
    // Check for gaps in the sequence
    const gaps = this.findTemporalGaps(values);
    if (gaps.length > 0) {
      return {
        isValid: false,
        reason: `Found ${gaps.length} temporal gaps`,
      };
    }

    // Check for sudden changes
    const changes = this.detectSuddenChanges(values);
    if (changes.length > 0) {
      return {
        isValid: false,
        reason: `Found ${changes.length} sudden changes`,
      };
    }

    return { isValid: true, reason: '' };
  }

  private findTemporalGaps(values: number[]): number[] {
    const gaps: number[] = [];
    for (let i = 1; i < values.length; i++) {
      if (values[i] - values[i - 1] > 1) {
        gaps.push(i);
      }
    }
    return gaps;
  }

  private detectSuddenChanges(values: number[]): number[] {
    const changes: number[] = [];
    const threshold = 3; // 3 standard deviations

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const std = Math.sqrt(values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length);

    for (let i = 1; i < values.length; i++) {
      const change = Math.abs(values[i] - values[i - 1]);
      if (change > threshold * std) {
        changes.push(i);
      }
    }

    return changes;
  }

  private checkSeasonality(values: number[]): {
    hasSeasonality: boolean;
    period: number;
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
    };
  }

  private checkTrend(values: number[]): {
    hasTrend: boolean;
    trendType: string;
  } {
    const x = Array.from({ length: values.length }, (_, i) => i);
    const slope = this.calculateLinearRegressionSlope(x, values);

    if (Math.abs(slope) < 0.01) {
      return { hasTrend: false, trendType: '' };
    }

    return {
      hasTrend: true,
      trendType: slope > 0 ? 'increasing' : 'decreasing',
    };
  }

  private checkFeatureCorrelation(
    feature: string,
    values: number[]
  ): {
    hasHighCorrelation: boolean;
    correlatedFeatures: string[];
  } {
    // This is a placeholder implementation
    // In a real application, calculate correlation with other features
    return {
      hasHighCorrelation: false,
      correlatedFeatures: [],
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

  private calculateLinearRegressionSlope(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }
}
