import { Injectable } from '@nestjs/common';
import { User } from '../../models/User';
import { Bet } from '../../models/Bet';
import { Prediction } from '../../models/Prediction';
import { Cluster } from '../../models/Cluster';
import { BehaviorProfile } from '../../models/BehaviorProfile';
import { EventEmitter } from 'events';

@Injectable()
export class UserPersonalizationService extends EventEmitter {
  private static instance: UserPersonalizationService;

  private constructor() {
    super();
  }

  public static getInstance(): UserPersonalizationService {
    if (!UserPersonalizationService.instance) {
      UserPersonalizationService.instance = new UserPersonalizationService();
    }
    return UserPersonalizationService.instance;
  }

  public async initialize(): Promise<void> {
    // Initialize user personalization service
  }

  private userProfiles: Map<string, BehaviorProfile> = new Map();
  private clusters: Cluster[] = [];
  private readonly minClusterSize = 10;
  private readonly maxClusters = 5;

  public updateUserProfile(user: User, bet: Bet, prediction: Prediction): void {
    let profile = this.userProfiles.get(user.id);
    if (!profile) {
      profile = this.createNewProfile(user.id);
      this.userProfiles.set(user.id, profile);
    }
    // Update betting behavior
    profile.bettingBehavior.update(
      bet.amount,
      bet.odds,
      prediction.confidence,
      bet.status === 'won'
    );
    // Update performance metrics
    profile.performanceMetrics.update(bet.status === 'won', bet.amount, bet.odds);
    // Update risk profile
    profile.riskProfile.update(bet.amount, bet.odds, prediction.confidence);
    // Update prediction preferences
    profile.predictionPreferences.update(
      prediction.modelType,
      prediction.marketFactors?.movement || 0,
      prediction.temporalFactors?.timeToEvent || 0
    );
    // Update clusters
    this.updateClusters();
  }

  private createNewProfile(userId: string): BehaviorProfile {
    // Create a new profile with working update methods
    const profile: BehaviorProfile = {
      userId,
      bettingBehavior: {
        totalBets: 0,
        totalStake: 0,
        averageStake: 0,
        stakeHistory: [],
        oddsHistory: [],
        confidenceHistory: [],
        outcomeHistory: [],
        update: function (stake: number, odds: number, confidence: number, outcome: boolean) {
          this.totalBets++;
          this.totalStake += stake;
          this.averageStake = this.totalStake / this.totalBets;
          this.stakeHistory.push(stake);
          this.oddsHistory.push(odds);
          this.confidenceHistory.push(confidence);
          this.outcomeHistory.push(outcome);
        },
      },
      performanceMetrics: {
        roi: 0,
        winRate: 0,
        averageOdds: 0,
        profitLoss: 0,
        update: function (outcome: boolean, stake: number, odds: number) {
          if (outcome) {
            this.profitLoss += stake * (odds - 1);
          } else {
            this.profitLoss -= stake;
          }
          this.roi = this.profitLoss / (stake > 0 ? stake : 1);
          // winRate and averageOdds are recalculated externally
        },
      },
      riskProfile: {
        stakeVariation: 0,
        oddsPreference: 0,
        confidenceThreshold: 0.5,
        update: function (stake: number, odds: number, confidence: number) {
          // No-op for now; calculated externally
        },
      },
      predictionPreferences: {
        modelTrust: {},
        marketSensitivity: 0,
        temporalPreference: 0,
        update: function (modelType: string, marketImpact: number, temporalImpact: number) {
          // No-op for now; calculated externally
        },
      },
    };
    return profile;
  }

  private async updateClusters(): Promise<void> {
    const profiles = Array.from(this.userProfiles.values());
    // Extract features for clustering
    const features = profiles.map((profile: BehaviorProfile) => ({
      stakeVariation: profile.riskProfile.stakeVariation,
      oddsPreference: profile.riskProfile.oddsPreference,
      marketSensitivity: profile.predictionPreferences.marketSensitivity,
      temporalPreference: profile.predictionPreferences.temporalPreference,
    }));
    // Perform clustering
    const clusters = await this.performClustering(features);
    // Update cluster assignments
    profiles.forEach((profile: BehaviorProfile, index: number) => {
      profile.clusterId = clusters[index];
    });
    // Update cluster statistics
    this.updateClusterStatistics(clusters);
  }

  private async performClustering(
    features: Array<{
      stakeVariation: number;
      oddsPreference: number;
      marketSensitivity: number;
      temporalPreference: number;
    }>
  ): Promise<number[]> {
    let k = Math.floor(features.length / this.minClusterSize);
    if (k < 1) k = 1;
    k = Math.min(this.maxClusters, k);
    const centroids = this.initializeCentroids(features, k);
    let assignments: number[] = [];
    let previousAssignments: number[] = [];
    do {
      previousAssignments = assignments;
      assignments = this.assignToClusters(features, centroids);
      for (let i = 0; i < centroids.length; i++) {
        centroids[i] = this.updateCentroid(features, assignments, i);
      }
    } while (!this.areAssignmentsEqual(assignments, previousAssignments));
    return assignments;
  }

  private initializeCentroids(
    features: Array<{
      stakeVariation: number;
      oddsPreference: number;
      marketSensitivity: number;
      temporalPreference: number;
    }>,
    k: number
  ): Array<{
    stakeVariation: number;
    oddsPreference: number;
    marketSensitivity: number;
    temporalPreference: number;
  }> {
    const centroids: Array<{
      stakeVariation: number;
      oddsPreference: number;
      marketSensitivity: number;
      temporalPreference: number;
    }> = [];
    const firstCentroid = features[Math.floor(Math.random() * features.length)];
    centroids.push({ ...firstCentroid });
    for (let i = 1; i < k; i++) {
      const distances = features.map(feature =>
        Math.min(...centroids.map(centroid => this.calculateDistance(feature, centroid)))
      );
      const sum = distances.reduce((a: number, b: number) => a + b, 0);
      const probabilities = distances.map((d: number) => d / sum);
      let cumulative = 0;
      const random = Math.random();
      let selectedIndex = 0;
      for (let j = 0; j < probabilities.length; j++) {
        cumulative += probabilities[j];
        if (random <= cumulative) {
          selectedIndex = j;
          break;
        }
      }
      centroids.push({ ...features[selectedIndex] });
    }
    return centroids;
  }

  private assignToClusters(
    features: Array<{
      stakeVariation: number;
      oddsPreference: number;
      marketSensitivity: number;
      temporalPreference: number;
    }>,
    centroids: Array<{
      stakeVariation: number;
      oddsPreference: number;
      marketSensitivity: number;
      temporalPreference: number;
    }>
  ): number[] {
    return features.map(feature => {
      const distances = centroids.map(centroid => this.calculateDistance(feature, centroid));
      return distances.indexOf(Math.min(...distances));
    });
  }

  private updateCentroid(
    features: Array<{
      stakeVariation: number;
      oddsPreference: number;
      marketSensitivity: number;
      temporalPreference: number;
    }>,
    assignments: number[],
    clusterId: number
  ): {
    stakeVariation: number;
    oddsPreference: number;
    marketSensitivity: number;
    temporalPreference: number;
  } {
    const clusterFeatures = features.filter((_, i) => assignments[i] === clusterId);
    if (clusterFeatures.length === 0) {
      return { stakeVariation: 0, oddsPreference: 0, marketSensitivity: 0, temporalPreference: 0 };
    }
    return {
      stakeVariation: this.average(clusterFeatures.map(f => f.stakeVariation)),
      oddsPreference: this.average(clusterFeatures.map(f => f.oddsPreference)),
      marketSensitivity: this.average(clusterFeatures.map(f => f.marketSensitivity)),
      temporalPreference: this.average(clusterFeatures.map(f => f.temporalPreference)),
    };
  }

  private calculateDistance(
    a: {
      stakeVariation: number;
      oddsPreference: number;
      marketSensitivity: number;
      temporalPreference: number;
    },
    b: {
      stakeVariation: number;
      oddsPreference: number;
      marketSensitivity: number;
      temporalPreference: number;
    }
  ): number {
    return Math.sqrt(
      Math.pow(a.stakeVariation - b.stakeVariation, 2) +
        Math.pow(a.oddsPreference - b.oddsPreference, 2) +
        Math.pow(a.marketSensitivity - b.marketSensitivity, 2) +
        Math.pow(a.temporalPreference - b.temporalPreference, 2)
    );
  }

  private average(numbers: number[]): number {
    return numbers.length > 0
      ? numbers.reduce((a: number, b: number) => a + b, 0) / numbers.length
      : 0;
  }

  private areAssignmentsEqual(a: number[], b: number[]): boolean {
    if (a.length !== b.length) return false;
    return a.every((value, index) => value === b[index]);
  }

  private updateClusterStatistics(clusters: number[]): void {
    const clusterProfiles = new Map<number, BehaviorProfile[]>();
    this.userProfiles.forEach((profile: BehaviorProfile) => {
      if (profile.clusterId !== undefined) {
        const clusterProfilesList = clusterProfiles.get(profile.clusterId) || [];
        clusterProfilesList.push(profile);
        clusterProfiles.set(profile.clusterId, clusterProfilesList);
      }
    });
    this.clusters.length = 0;
    clusterProfiles.forEach((profiles: BehaviorProfile[], clusterId: number) => {
      this.clusters.push({
        id: clusterId,
        size: profiles.length,
        averageROI: this.average(profiles.map(p => p.performanceMetrics.roi)),
        averageWinRate: this.average(profiles.map(p => p.performanceMetrics.winRate)),
        averageStake: this.average(profiles.map(p => p.bettingBehavior.averageStake)),
        riskProfile: {
          stakeVariation: this.average(profiles.map(p => p.riskProfile.stakeVariation)),
          oddsPreference: this.average(profiles.map(p => p.riskProfile.oddsPreference)),
          confidenceThreshold: this.average(profiles.map(p => p.riskProfile.confidenceThreshold)),
        },
      });
    });
  }

  async getPersonalizedPrediction(userId: string, prediction: Prediction): Promise<Prediction> {
    const profile = this.userProfiles.get(userId);
    if (!profile) {
      return prediction;
    }

    // Adjust prediction based on user's cluster
    const cluster = this.clusters.find(c => c.id === profile.clusterId);
    if (cluster) {
      prediction = this.adjustPredictionForCluster(prediction, cluster);
    }

    // Adjust prediction based on user's preferences
    prediction = this.adjustPredictionForUser(prediction, profile);

    return prediction;
  }

  private adjustPredictionForCluster(prediction: Prediction, cluster: Cluster): Prediction {
    // Adjust confidence based on cluster's risk profile
    const confidenceAdjustment = cluster.riskProfile.confidenceThreshold - 0.5;
    prediction.confidence = Math.max(0, Math.min(1, prediction.confidence + confidenceAdjustment));

    // Adjust stake recommendation based on cluster's average stake
    if (prediction.recommendedStake) {
      prediction.recommendedStake *= cluster.averageStake;
    }

    return prediction;
  }

  private adjustPredictionForUser(prediction: Prediction, profile: BehaviorProfile): Prediction {
    // Adjust based on user's model trust
    const modelTrust = profile.predictionPreferences.modelTrust;
    if (modelTrust[prediction.modelType]) {
      prediction.confidence *= modelTrust[prediction.modelType];
    }

    // Adjust based on user's market sensitivity
    const marketSensitivity = profile.predictionPreferences.marketSensitivity;
    if (prediction.marketFactors) {
      Object.keys(prediction.marketFactors).forEach((key: string) => {
        (prediction.marketFactors as any)[key] *= marketSensitivity;
      });
    }

    // Adjust based on user's temporal preference
    const temporalPreference = profile.predictionPreferences.temporalPreference;
    if (prediction.temporalFactors) {
      Object.keys(prediction.temporalFactors).forEach((key: string) => {
        (prediction.temporalFactors as any)[key] *= temporalPreference;
      });
    }

    return prediction;
  }

  private calculateROI(bettingBehavior: BehaviorProfile['bettingBehavior']): number {
    const totalProfit = bettingBehavior.outcomeHistory.reduce((sum, outcome, index) => {
      const stake = bettingBehavior.stakeHistory[index];
      const odds = bettingBehavior.oddsHistory[index];
      return sum + (outcome ? stake * (odds - 1) : -stake);
    }, 0);

    const totalStake = bettingBehavior.totalStake;
    return totalStake > 0 ? totalProfit / totalStake : 0;
  }

  private calculateWinRate(bettingBehavior: BehaviorProfile['bettingBehavior']): number {
    const wins = bettingBehavior.outcomeHistory.filter(outcome => outcome).length;
    return bettingBehavior.totalBets > 0 ? wins / bettingBehavior.totalBets : 0;
  }

  private calculateAverageOdds(bettingBehavior: BehaviorProfile['bettingBehavior']): number {
    return bettingBehavior.oddsHistory.length > 0
      ? bettingBehavior.oddsHistory.reduce((sum, odds) => sum + odds, 0) /
          bettingBehavior.oddsHistory.length
      : 0;
  }

  private calculateStakeVariation(bettingBehavior: BehaviorProfile['bettingBehavior']): number {
    if (bettingBehavior.stakeHistory.length < 2) return 0;

    const mean = bettingBehavior.averageStake;
    const variance =
      bettingBehavior.stakeHistory.reduce((sum, stake) => sum + Math.pow(stake - mean, 2), 0) /
      bettingBehavior.stakeHistory.length;

    return Math.sqrt(variance) / mean; // Coefficient of variation
  }

  private calculateOddsPreference(bettingBehavior: BehaviorProfile['bettingBehavior']): number {
    if (bettingBehavior.oddsHistory.length === 0) return 0;

    const averageOdds = this.calculateAverageOdds(bettingBehavior);
    const preferredOdds = 2.0; // Base preferred odds

    return Math.max(0, Math.min(1, 1 - Math.abs(averageOdds - preferredOdds) / preferredOdds));
  }

  private calculateConfidenceThreshold(
    bettingBehavior: BehaviorProfile['bettingBehavior']
  ): number {
    if (bettingBehavior.confidenceHistory.length === 0) return 0.5;

    // Calculate optimal confidence threshold based on historical performance
    const successfulPredictions = bettingBehavior.confidenceHistory.filter(
      (confidence, index) => confidence > 0.5 && bettingBehavior.outcomeHistory[index]
    );

    return successfulPredictions.length > 0
      ? successfulPredictions.reduce((sum, conf) => sum + conf, 0) / successfulPredictions.length
      : 0.5;
  }

  private calculateModelTrust(
    bettingBehavior: BehaviorProfile['bettingBehavior'],
    prediction: Prediction
  ): Record<string, number> {
    const modelTrust: Record<string, number> = {};

    // Calculate trust based on historical performance with this model type
    const modelPredictions = bettingBehavior.confidenceHistory.filter(
      (_, index) => prediction.modelType === 'modelType' // Replace with actual model type comparison
    );

    const successfulPredictions = modelPredictions.filter(
      (confidence, index) => confidence > 0.5 && bettingBehavior.outcomeHistory[index]
    );

    modelTrust[prediction.modelType] =
      successfulPredictions.length > 0
        ? successfulPredictions.length / modelPredictions.length
        : 0.5;

    return modelTrust;
  }

  private calculateMarketSensitivity(bettingBehavior: BehaviorProfile['bettingBehavior']): number {
    if (bettingBehavior.totalBets === 0) return 0.5;

    // Calculate how well the user responds to market movements
    const marketResponses = bettingBehavior.outcomeHistory.filter((outcome, index) => {
      const confidence = bettingBehavior.confidenceHistory[index];
      return confidence > 0.7 && outcome; // High confidence bets that won
    });

    return marketResponses.length / bettingBehavior.totalBets;
  }

  private calculateTemporalPreference(bettingBehavior: BehaviorProfile['bettingBehavior']): number {
    if (bettingBehavior.totalBets === 0) return 0.5;

    // Calculate how well the user performs with time-based predictions
    const temporalBets = bettingBehavior.outcomeHistory.filter((outcome, index) => {
      const confidence = bettingBehavior.confidenceHistory[index];
      return confidence > 0.6 && outcome; // Medium-high confidence bets that won
    });

    return temporalBets.length / bettingBehavior.totalBets;
  }

  private calculateFactorImpact(factor: number, weight: number): number {
    return factor * weight;
  }

  private calculateClusterImpact(cluster: Cluster, weight: number): number {
    return cluster.averageROI * weight + cluster.averageWinRate * (1 - weight);
  }

  private calculateTotalImpact(factors: number[]): number {
    return factors.reduce((sum: number, factor: number) => sum + factor, 0);
  }
}

export const userPersonalizationService = UserPersonalizationService.getInstance();
// TODO: Inject userPersonalizationService overlays into DashboardPage, BetsPage, AnalyticsPage and prediction overlays.
