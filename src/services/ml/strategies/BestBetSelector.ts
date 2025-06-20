import * as tf from '@tensorflow/tfjs';
import { UnifiedLogger } from '../../core/UnifiedLogger';
import { KellyCriterion } from './KellyCriterion';

interface BetMetrics {
  accuracy: number;
  roi: number;
  expectedValue: number;
  confidence: number;
  riskLevel: number;
  edge: number;
}

interface BetSelection {
  selectedBets: number[];
  metrics: BetMetrics;
  confidenceThreshold: number;
  edgeThreshold: number;
}

export class BestBetSelector {
  private logger: UnifiedLogger;
  private kellyCriterion: KellyCriterion;
  private readonly minConfidence: number = 0.7;
  private readonly minEdge: number = 0.05;
  private readonly maxRiskLevel: number = 0.3;

  constructor() {
    this.logger = UnifiedLogger.getInstance();
    this.kellyCriterion = new KellyCriterion();
  }

  public async selectBets(predictions: tf.Tensor, labels: tf.Tensor): Promise<BetSelection> {
    try {
      const predArray = await predictions.array();
      const labelArray = await labels.array();

      // Calculate bet metrics
      const metrics = await this.calculateBetMetrics(predArray, labelArray);

      // Select best bets based on criteria
      const selectedBets = this.filterBets(predArray, metrics);

      return {
        selectedBets,
        metrics,
        confidenceThreshold: this.minConfidence,
        edgeThreshold: this.minEdge,
      };
    } catch (error) {
      this.logger.error('Bet selection failed', error);
      throw error;
    }
  }

  private async calculateBetMetrics(
    predictions: number[][],
    labels: number[][]
  ): Promise<BetMetrics> {
    // Calculate accuracy
    const accuracy = this.calculateAccuracy(predictions, labels);

    // Calculate ROI
    const roi = this.calculateROI(predictions, labels);

    // Calculate expected value
    const expectedValue = this.calculateExpectedValue(predictions, labels);

    // Calculate confidence
    const confidence = this.calculateConfidence(predictions);

    // Calculate risk level
    const riskLevel = this.calculateRiskLevel(predictions);

    // Calculate edge
    const edge = this.calculateEdge(predictions, labels);

    return {
      accuracy,
      roi,
      expectedValue,
      confidence,
      riskLevel,
      edge,
    };
  }

  private calculateAccuracy(predictions: number[][], labels: number[][]): number {
    let correct = 0;
    let total = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i].indexOf(Math.max(...predictions[i]));
      const label = labels[i].indexOf(Math.max(...labels[i]));

      if (pred === label) {
        correct++;
      }
      total++;
    }

    return total > 0 ? correct / total : 0;
  }

  private calculateROI(predictions: number[][], labels: number[][]): number {
    let totalInvestment = 0;
    let totalReturn = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i].indexOf(Math.max(...predictions[i]));
      const label = labels[i].indexOf(Math.max(...labels[i]));
      const confidence = Math.max(...predictions[i]);

      totalInvestment += confidence;
      if (pred === label) {
        totalReturn += confidence * (1 / confidence);
      }
    }

    return totalInvestment > 0 ? (totalReturn - totalInvestment) / totalInvestment : 0;
  }

  private calculateExpectedValue(predictions: number[][], labels: number[][]): number {
    let totalEV = 0;
    let count = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i].indexOf(Math.max(...predictions[i]));
      const label = labels[i].indexOf(Math.max(...labels[i]));
      const confidence = Math.max(...predictions[i]);

      if (pred === label) {
        totalEV += confidence * (1 / confidence) - 1;
      } else {
        totalEV -= 1;
      }
      count++;
    }

    return count > 0 ? totalEV / count : 0;
  }

  private calculateConfidence(predictions: number[][]): number {
    const confidences = predictions.map(p => Math.max(...p));
    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  private calculateRiskLevel(predictions: number[][]): number {
    const confidences = predictions.map(p => Math.max(...p));
    const std = this.calculateStandardDeviation(confidences);
    const mean = confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;

    return std / mean;
  }

  private calculateEdge(predictions: number[][], labels: number[][]): number {
    let totalEdge = 0;
    let count = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i].indexOf(Math.max(...predictions[i]));
      const label = labels[i].indexOf(Math.max(...labels[i]));
      const confidence = Math.max(...predictions[i]);

      if (pred === label) {
        const impliedProb = 1 / confidence;
        const actualProb = this.calculateActualProbability(predictions, labels, pred);
        totalEdge += actualProb - impliedProb;
      }
      count++;
    }

    return count > 0 ? totalEdge / count : 0;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((sum, val) => sum + val, 0) / squareDiffs.length;
    return Math.sqrt(avgSquareDiff);
  }

  private calculateActualProbability(
    predictions: number[][],
    labels: number[][],
    outcome: number
  ): number {
    let correct = 0;
    let total = 0;

    for (let i = 0; i < predictions.length; i++) {
      const pred = predictions[i].indexOf(Math.max(...predictions[i]));
      const label = labels[i].indexOf(Math.max(...labels[i]));

      if (pred === outcome) {
        if (label === outcome) {
          correct++;
        }
        total++;
      }
    }

    return total > 0 ? correct / total : 0;
  }

  private filterBets(predictions: number[][], metrics: BetMetrics): number[] {
    const selectedBets: number[] = [];

    for (let i = 0; i < predictions.length; i++) {
      const confidence = Math.max(...predictions[i]);
      const edge = this.calculateEdgeForBet(predictions[i], metrics);

      if (
        confidence >= this.minConfidence &&
        edge >= this.minEdge &&
        metrics.riskLevel <= this.maxRiskLevel
      ) {
        selectedBets.push(i);
      }
    }

    return selectedBets;
  }

  private calculateEdgeForBet(prediction: number[], metrics: BetMetrics): number {
    const confidence = Math.max(...prediction);
    const impliedProb = 1 / confidence;
    return metrics.accuracy - impliedProb;
  }

  public getBetRecommendations(
    selection: BetSelection,
    bankroll: number
  ): Array<{
    betIndex: number;
    stake: number;
    confidence: number;
    expectedValue: number;
  }> {
    return selection.selectedBets.map(betIndex => {
      const confidence = Math.max(...selection.metrics.confidence);
      const stake = this.kellyCriterion.getBetSize(
        {
          fraction: confidence,
          expectedValue: selection.metrics.expectedValue,
          riskAdjustedReturn: selection.metrics.roi,
          optimalStake: bankroll * confidence,
          confidence: confidence,
        },
        bankroll
      );

      return {
        betIndex,
        stake,
        confidence,
        expectedValue: selection.metrics.expectedValue,
      };
    });
  }
}
