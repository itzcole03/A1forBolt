import { FeatureConfig, EngineeredFeatures, FeatureSelectionResult } from './types';
import { Matrix } from 'ml-matrix';
import { FeatureLogger } from './featureLogging';

export class FeatureSelector {
  private readonly config: FeatureConfig;
  private readonly logger: FeatureLogger;

  constructor(config: FeatureConfig) {
    this.config = config;
    this.logger = new FeatureLogger();
  }

  public async selectFeatures(features: EngineeredFeatures): Promise<FeatureSelectionResult> {
    try {
      const result: FeatureSelectionResult = {
        numerical: [],
        categorical: [],
        temporal: [],
        derived: [],
        importance: {},
      };

      // Select numerical features
      result.numerical = await this.selectNumericalFeatures(features.numerical);

      // Select categorical features
      result.categorical = await this.selectCategoricalFeatures(features.categorical);

      // Select temporal features
      result.temporal = await this.selectTemporalFeatures(features.temporal);

      // Select derived features
      result.derived = await this.selectDerivedFeatures(features.derived);

      // Calculate feature importance
      result.importance = await this.calculateFeatureImportance(features, result);

      // Filter features based on importance threshold
      this.filterFeaturesByImportance(result);

      return result;
    } catch (error) {
      this.logger.error('Error in feature selection', error);
      throw error;
    }
  }

  private async selectNumericalFeatures(features: Record<string, number[]>): Promise<string[]> {
    const selectedFeatures: string[] = [];
    const featureMatrix = this.createFeatureMatrix(features);

    // Calculate correlation matrix
    const correlationMatrix = this.calculateCorrelationMatrix(featureMatrix);

    // Remove highly correlated features
    const uncorrelatedFeatures = this.removeCorrelatedFeatures(
      Object.keys(features),
      correlationMatrix
    );

    // Calculate variance
    const varianceScores = this.calculateVarianceScores(featureMatrix);

    // Select features based on variance threshold
    for (const feature of uncorrelatedFeatures) {
      if (varianceScores[feature] > this.config.featureSelectionThreshold) {
        selectedFeatures.push(feature);
      }
    }

    return selectedFeatures;
  }

  private async selectCategoricalFeatures(features: Record<string, string[]>): Promise<string[]> {
    const selectedFeatures: string[] = [];

    for (const [feature, values] of Object.entries(features)) {
      // Calculate cardinality
      const cardinality = new Set(values).size;

      // Calculate information value
      const informationValue = this.calculateInformationValue(values);

      // Select features based on cardinality and information value
      if (
        cardinality > 1 &&
        cardinality < values.length / 2 &&
        informationValue > this.config.featureSelectionThreshold
      ) {
        selectedFeatures.push(feature);
      }
    }

    return selectedFeatures;
  }

  private async selectTemporalFeatures(features: Record<string, number[]>): Promise<string[]> {
    const selectedFeatures: string[] = [];
    const featureMatrix = this.createFeatureMatrix(features);

    // Calculate autocorrelation
    const autocorrelationScores = this.calculateAutocorrelationScores(featureMatrix);

    // Calculate trend strength
    const trendScores = this.calculateTrendScores(featureMatrix);

    // Select features based on autocorrelation and trend strength
    for (const [feature, values] of Object.entries(features)) {
      const autocorrelation = autocorrelationScores[feature];
      const trendStrength = trendScores[feature];

      if (
        autocorrelation > this.config.featureSelectionThreshold ||
        trendStrength > this.config.featureSelectionThreshold
      ) {
        selectedFeatures.push(feature);
      }
    }

    return selectedFeatures;
  }

  private async selectDerivedFeatures(features: Record<string, number[]>): Promise<string[]> {
    const selectedFeatures: string[] = [];
    const featureMatrix = this.createFeatureMatrix(features);

    // Calculate mutual information
    const mutualInfoScores = this.calculateMutualInformationScores(featureMatrix);

    // Select features based on mutual information
    for (const [feature, score] of Object.entries(mutualInfoScores)) {
      if (score > this.config.featureSelectionThreshold) {
        selectedFeatures.push(feature);
      }
    }

    return selectedFeatures;
  }

  private async calculateFeatureImportance(
    features: EngineeredFeatures,
    selectedFeatures: FeatureSelectionResult
  ): Promise<Record<string, number>> {
    const importance: Record<string, number> = {};
    const allFeatures = {
      ...features.numerical,
      ...features.temporal,
      ...features.derived,
    };

    // Calculate feature importance using multiple methods
    const varianceImportance = this.calculateVarianceImportance(allFeatures);
    const correlationImportance = this.calculateCorrelationImportance(allFeatures);
    const mutualInfoImportance = this.calculateMutualInfoImportance(allFeatures);

    // Combine importance scores
    for (const feature of selectedFeatures.numerical) {
      importance[feature] = this.combineImportanceScores(
        varianceImportance[feature],
        correlationImportance[feature],
        mutualInfoImportance[feature]
      );
    }

    return importance;
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

  private calculateCorrelationMatrix(matrix: Matrix): Matrix {
    const centered = matrix.sub(matrix.mean('column'));
    const covariance = centered
      .transpose()
      .mmul(centered)
      .div(matrix.rows - 1);
    const stdDevs = matrix.std('column');
    const correlation = new Matrix(matrix.columns, matrix.columns);

    for (let i = 0; i < matrix.columns; i++) {
      for (let j = 0; j < matrix.columns; j++) {
        correlation.set(i, j, covariance.get(i, j) / (stdDevs[i] * stdDevs[j]));
      }
    }

    return correlation;
  }

  private removeCorrelatedFeatures(features: string[], correlationMatrix: Matrix): string[] {
    const selectedFeatures: string[] = [];
    const correlationThreshold = 0.8;

    for (let i = 0; i < features.length; i++) {
      let isCorrelated = false;
      for (const selectedFeature of selectedFeatures) {
        const j = features.indexOf(selectedFeature);
        if (Math.abs(correlationMatrix.get(i, j)) > correlationThreshold) {
          isCorrelated = true;
          break;
        }
      }
      if (!isCorrelated) {
        selectedFeatures.push(features[i]);
      }
    }

    return selectedFeatures;
  }

  private calculateVarianceScores(matrix: Matrix): Record<string, number> {
    const varianceScores: Record<string, number> = {};
    const variances = matrix.variance('column');

    for (let i = 0; i < matrix.columns; i++) {
      varianceScores[`feature_${i}`] = variances[i];
    }

    return varianceScores;
  }

  private calculateInformationValue(values: string[]): number {
    const valueCounts = new Map<string, number>();
    for (const value of values) {
      valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
    }

    let informationValue = 0;
    const totalCount = values.length;

    for (const [_, count] of valueCounts) {
      const probability = count / totalCount;
      informationValue -= probability * Math.log2(probability);
    }

    return informationValue;
  }

  private calculateAutocorrelationScores(matrix: Matrix): Record<string, number> {
    const scores: Record<string, number> = {};
    const lag = 1;

    for (let i = 0; i < matrix.columns; i++) {
      const column = matrix.getColumn(i);
      let numerator = 0;
      let denominator = 0;
      const mean = column.reduce((a, b) => a + b, 0) / column.length;

      for (let j = 0; j < column.length - lag; j++) {
        numerator += (column[j] - mean) * (column[j + lag] - mean);
        denominator += Math.pow(column[j] - mean, 2);
      }

      scores[`feature_${i}`] = numerator / denominator;
    }

    return scores;
  }

  private calculateTrendScores(matrix: Matrix): Record<string, number> {
    const scores: Record<string, number> = {};

    for (let i = 0; i < matrix.columns; i++) {
      const column = matrix.getColumn(i);
      const x = Array.from({ length: column.length }, (_, i) => i);
      const slope = this.calculateLinearRegressionSlope(x, column);
      scores[`feature_${i}`] = Math.abs(slope);
    }

    return scores;
  }

  private calculateMutualInformationScores(matrix: Matrix): Record<string, number> {
    const scores: Record<string, number> = {};
    const numBins = 10;

    for (let i = 0; i < matrix.columns; i++) {
      let totalMI = 0;
      const columnI = matrix.getColumn(i);

      for (let j = 0; j < matrix.columns; j++) {
        if (i !== j) {
          const columnJ = matrix.getColumn(j);
          const mi = this.calculateMutualInformation(columnI, columnJ, numBins);
          totalMI += mi;
        }
      }

      scores[`feature_${i}`] = totalMI / (matrix.columns - 1);
    }

    return scores;
  }

  private calculateMutualInformation(x: number[], y: number[], numBins: number): number {
    const xBins = this.discretize(x, numBins);
    const yBins = this.discretize(y, numBins);
    const jointCounts = new Map<string, number>();
    const xCounts = new Map<number, number>();
    const yCounts = new Map<number, number>();
    const n = x.length;

    for (let i = 0; i < n; i++) {
      const key = `${xBins[i]},${yBins[i]}`;
      jointCounts.set(key, (jointCounts.get(key) || 0) + 1);
      xCounts.set(xBins[i], (xCounts.get(xBins[i]) || 0) + 1);
      yCounts.set(yBins[i], (yCounts.get(yBins[i]) || 0) + 1);
    }

    let mi = 0;
    for (const [key, count] of jointCounts) {
      const [xBin, yBin] = key.split(',').map(Number);
      const pxy = count / n;
      const px = xCounts.get(xBin)! / n;
      const py = yCounts.get(yBin)! / n;
      mi += pxy * Math.log2(pxy / (px * py));
    }

    return mi;
  }

  private discretize(values: number[], numBins: number): number[] {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / numBins;

    return values.map(value => {
      const bin = Math.floor((value - min) / binSize);
      return Math.min(bin, numBins - 1);
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

  private calculateVarianceImportance(features: Record<string, number[]>): Record<string, number> {
    const importance: Record<string, number> = {};
    for (const [feature, values] of Object.entries(features)) {
      const mean = values.reduce((a, b) => a + b, 0) / values.length;
      const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
      importance[feature] = variance;
    }
    return this.normalizeScores(importance);
  }

  private calculateCorrelationImportance(
    features: Record<string, number[]>
  ): Record<string, number> {
    const importance: Record<string, number> = {};
    const featureMatrix = this.createFeatureMatrix(features);
    const correlationMatrix = this.calculateCorrelationMatrix(featureMatrix);

    for (let i = 0; i < featureMatrix.columns; i++) {
      const correlations = correlationMatrix.getColumn(i);
      importance[`feature_${i}`] =
        correlations.reduce((a, b) => a + Math.abs(b), 0) / correlations.length;
    }

    return this.normalizeScores(importance);
  }

  private calculateMutualInfoImportance(
    features: Record<string, number[]>
  ): Record<string, number> {
    const importance: Record<string, number> = {};
    const featureMatrix = this.createFeatureMatrix(features);
    const mutualInfoScores = this.calculateMutualInformationScores(featureMatrix);

    for (const [feature, score] of Object.entries(mutualInfoScores)) {
      importance[feature] = score;
    }

    return this.normalizeScores(importance);
  }

  private combineImportanceScores(
    varianceScore: number,
    correlationScore: number,
    mutualInfoScore: number
  ): number {
    return (varianceScore + correlationScore + mutualInfoScore) / 3;
  }

  private normalizeScores(scores: Record<string, number>): Record<string, number> {
    const values = Object.values(scores);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    return Object.fromEntries(
      Object.entries(scores).map(([key, value]) => [key, range === 0 ? 0 : (value - min) / range])
    );
  }

  private filterFeaturesByImportance(result: FeatureSelectionResult): void {
    const threshold = this.config.featureSelectionThreshold;
    const maxFeatures = this.config.maxFeatures;

    // Sort features by importance
    const sortedFeatures = Object.entries(result.importance)
      .sort(([, a], [, b]) => b - a)
      .slice(0, maxFeatures);

    // Update selected features
    result.numerical = result.numerical.filter(feature =>
      sortedFeatures.some(([f]) => f === feature)
    );
    result.categorical = result.categorical.filter(feature =>
      sortedFeatures.some(([f]) => f === feature)
    );
    result.temporal = result.temporal.filter(feature =>
      sortedFeatures.some(([f]) => f === feature)
    );
    result.derived = result.derived.filter(feature => sortedFeatures.some(([f]) => f === feature));
  }
}
