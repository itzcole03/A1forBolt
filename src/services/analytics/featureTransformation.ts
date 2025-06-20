import { FeatureConfig, FeatureTransformationResult } from './types';
import { FeatureLogger } from './featureLogging';
import { Matrix } from 'ml-matrix';

export class FeatureTransformer {
  private readonly config: FeatureConfig;
  private readonly logger: FeatureLogger;

  constructor(config: FeatureConfig) {
    this.config = config;
    this.logger = new FeatureLogger();
  }

  public async transformNumerical(
    features: Record<string, number[]>
  ): Promise<Record<string, number[]>> {
    try {
      const transformed: Record<string, number[]> = {};
      const featureMatrix = this.createFeatureMatrix(features);

      // Apply transformations
      const normalized = this.normalizeFeatures(featureMatrix);
      const scaled = this.scaleFeatures(normalized);
      const transformedMatrix = this.applyNonlinearTransformations(scaled);

      // Convert back to record format
      for (let i = 0; i < Object.keys(features).length; i++) {
        const featureName = Object.keys(features)[i];
        transformed[featureName] = transformedMatrix.getColumn(i);
      }

      return transformed;
    } catch (error) {
      this.logger.error('Error transforming numerical features', error);
      throw error;
    }
  }

  public async transformCategorical(
    features: Record<string, string[]>
  ): Promise<Record<string, string[]>> {
    try {
      const transformed: Record<string, string[]> = {};

      for (const [feature, values] of Object.entries(features)) {
        // Apply categorical transformations
        transformed[feature] = this.applyCategoricalTransformations(values);
      }

      return transformed;
    } catch (error) {
      this.logger.error('Error transforming categorical features', error);
      throw error;
    }
  }

  public async transformTemporal(
    features: Record<string, number[]>
  ): Promise<Record<string, number[]>> {
    try {
      const transformed: Record<string, number[]> = {};
      const featureMatrix = this.createFeatureMatrix(features);

      // Apply temporal transformations
      const detrended = this.detrendFeatures(featureMatrix);
      const deseasonalized = this.deseasonalizeFeatures(detrended);
      const transformedMatrix = this.applyTemporalTransformations(deseasonalized);

      // Convert back to record format
      for (let i = 0; i < Object.keys(features).length; i++) {
        const featureName = Object.keys(features)[i];
        transformed[featureName] = transformedMatrix.getColumn(i);
      }

      return transformed;
    } catch (error) {
      this.logger.error('Error transforming temporal features', error);
      throw error;
    }
  }

  public async transformDerived(
    features: Record<string, number[]>
  ): Promise<Record<string, number[]>> {
    try {
      const transformed: Record<string, number[]> = {};
      const featureMatrix = this.createFeatureMatrix(features);

      // Apply derived feature transformations
      const normalized = this.normalizeFeatures(featureMatrix);
      const transformedMatrix = this.applyDerivedTransformations(normalized);

      // Convert back to record format
      for (let i = 0; i < Object.keys(features).length; i++) {
        const featureName = Object.keys(features)[i];
        transformed[featureName] = transformedMatrix.getColumn(i);
      }

      return transformed;
    } catch (error) {
      this.logger.error('Error transforming derived features', error);
      throw error;
    }
  }

  private createFeatureMatrix(features: Record<string, number[]>): Matrix {
    const featureNames = Object.keys(features);
    const numSamples = features[featureNames[0]].length;
    const matrix = new Matrix(numSamples, featureNames.length);

    for (let i = 0; i < featureNames.length; i++) {
      const feature = features[featureNames[i]];
      for (let j = 0; j < numSamples; j++) {
        matrix.set(j, i, feature[j]);
      }
    }

    return matrix;
  }

  private normalizeFeatures(matrix: Matrix): Matrix {
    const normalized = new Matrix(matrix.rows, matrix.columns);
    const means = matrix.mean('column');
    const stds = matrix.std('column');

    for (let i = 0; i < matrix.columns; i++) {
      const column = matrix.getColumn(i);
      const mean = means[i];
      const std = stds[i];

      for (let j = 0; j < matrix.rows; j++) {
        normalized.set(j, i, (column[j] - mean) / std);
      }
    }

    return normalized;
  }

  private scaleFeatures(matrix: Matrix): Matrix {
    const scaled = new Matrix(matrix.rows, matrix.columns);
    const mins = matrix.min('column');
    const maxs = matrix.max('column');

    for (let i = 0; i < matrix.columns; i++) {
      const column = matrix.getColumn(i);
      const min = mins[i];
      const max = maxs[i];
      const range = max - min;

      for (let j = 0; j < matrix.rows; j++) {
        scaled.set(j, i, (column[j] - min) / range);
      }
    }

    return scaled;
  }

  private applyNonlinearTransformations(matrix: Matrix): Matrix {
    const transformed = new Matrix(matrix.rows, matrix.columns);

    // Apply various nonlinear transformations
    for (let i = 0; i < matrix.columns; i++) {
      const column = matrix.getColumn(i);
      const transformedColumn = column.map(value => {
        // Apply multiple transformations and combine them
        const logTransformed = Math.log1p(Math.abs(value)) * Math.sign(value);
        const sqrtTransformed = Math.sqrt(Math.abs(value)) * Math.sign(value);
        const cubeRootTransformed = Math.cbrt(value);
        const sigmoidTransformed = 1 / (1 + Math.exp(-value));

        // Combine transformations with weights
        return (
          0.3 * logTransformed +
          0.3 * sqrtTransformed +
          0.2 * cubeRootTransformed +
          0.2 * sigmoidTransformed
        );
      });

      for (let j = 0; j < matrix.rows; j++) {
        transformed.set(j, i, transformedColumn[j]);
      }
    }

    return transformed;
  }

  private applyCategoricalTransformations(values: string[]): string[] {
    // Apply various categorical transformations
    return values.map(value => {
      // Convert to lowercase
      const lowercased = value.toLowerCase();

      // Remove special characters
      const cleaned = lowercased.replace(/[^a-z0-9]/g, '');

      // Apply stemming (simplified version)
      const stemmed = this.stemWord(cleaned);

      return stemmed;
    });
  }

  private stemWord(word: string): string {
    // Simple stemming implementation
    // In a real application, use a proper stemming library
    if (word.endsWith('ing')) {
      return word.slice(0, -3);
    }
    if (word.endsWith('ed')) {
      return word.slice(0, -2);
    }
    if (word.endsWith('s')) {
      return word.slice(0, -1);
    }
    return word;
  }

  private detrendFeatures(matrix: Matrix): Matrix {
    const detrended = new Matrix(matrix.rows, matrix.columns);

    for (let i = 0; i < matrix.columns; i++) {
      const column = matrix.getColumn(i);
      const x = Array.from({ length: column.length }, (_, i) => i);
      const slope = this.calculateLinearRegressionSlope(x, column);
      const intercept = this.calculateLinearRegressionIntercept(x, column, slope);

      const detrendedColumn = column.map((value, index) => {
        const trend = slope * index + intercept;
        return value - trend;
      });

      for (let j = 0; j < matrix.rows; j++) {
        detrended.set(j, i, detrendedColumn[j]);
      }
    }

    return detrended;
  }

  private deseasonalizeFeatures(matrix: Matrix): Matrix {
    const deseasonalized = new Matrix(matrix.rows, matrix.columns);

    for (let i = 0; i < matrix.columns; i++) {
      const column = matrix.getColumn(i);
      const seasonality = this.calculateSeasonality(column);

      const deseasonalizedColumn = column.map((value, index) => {
        return value - seasonality[index % seasonality.length];
      });

      for (let j = 0; j < matrix.rows; j++) {
        deseasonalized.set(j, i, deseasonalizedColumn[j]);
      }
    }

    return deseasonalized;
  }

  private calculateSeasonality(values: number[]): number[] {
    // Calculate seasonal pattern
    const period = this.findSeasonalPeriod(values);
    const seasonalPattern = new Array(period).fill(0);
    const counts = new Array(period).fill(0);

    for (let i = 0; i < values.length; i++) {
      const position = i % period;
      seasonalPattern[position] += values[i];
      counts[position]++;
    }

    // Calculate average seasonal pattern
    for (let i = 0; i < period; i++) {
      seasonalPattern[i] /= counts[i];
    }

    // Center the pattern
    const mean = seasonalPattern.reduce((a, b) => a + b, 0) / period;
    return seasonalPattern.map(value => value - mean);
  }

  private findSeasonalPeriod(values: number[]): number {
    // Find the period with highest autocorrelation
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

    return bestPeriod;
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

  private applyTemporalTransformations(matrix: Matrix): Matrix {
    const transformed = new Matrix(matrix.rows, matrix.columns);

    for (let i = 0; i < matrix.columns; i++) {
      const column = matrix.getColumn(i);
      const transformedColumn = this.applyTemporalTransformationsToColumn(column);

      for (let j = 0; j < matrix.rows; j++) {
        transformed.set(j, i, transformedColumn[j]);
      }
    }

    return transformed;
  }

  private applyTemporalTransformationsToColumn(values: number[]): number[] {
    // Apply various temporal transformations
    return values.map((value, index) => {
      // Calculate moving average
      const windowSize = 5;
      const start = Math.max(0, index - windowSize + 1);
      const window = values.slice(start, index + 1);
      const movingAvg = window.reduce((a, b) => a + b, 0) / window.length;

      // Calculate exponential smoothing
      const alpha = 0.3;
      const smoothed = index === 0 ? value : alpha * value + (1 - alpha) * values[index - 1];

      // Combine transformations
      return 0.5 * (value - movingAvg) + 0.5 * smoothed;
    });
  }

  private applyDerivedTransformations(matrix: Matrix): Matrix {
    const transformed = new Matrix(matrix.rows, matrix.columns);

    for (let i = 0; i < matrix.columns; i++) {
      const column = matrix.getColumn(i);
      const transformedColumn = this.applyDerivedTransformationsToColumn(column);

      for (let j = 0; j < matrix.rows; j++) {
        transformed.set(j, i, transformedColumn[j]);
      }
    }

    return transformed;
  }

  private applyDerivedTransformationsToColumn(values: number[]): number[] {
    // Apply various derived feature transformations
    return values.map((value, index) => {
      // Calculate rate of change
      const rateOfChange = index === 0 ? 0 : value - values[index - 1];

      // Calculate acceleration
      const acceleration = index < 2 ? 0 : rateOfChange - (values[index - 1] - values[index - 2]);

      // Calculate cumulative sum
      const cumulativeSum = values.slice(0, index + 1).reduce((a, b) => a + b, 0);

      // Combine transformations
      return 0.4 * value + 0.3 * rateOfChange + 0.2 * acceleration + 0.1 * cumulativeSum;
    });
  }

  private calculateLinearRegressionSlope(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  }

  private calculateLinearRegressionIntercept(x: number[], y: number[], slope: number): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);

    return (sumY - slope * sumX) / n;
  }
}
