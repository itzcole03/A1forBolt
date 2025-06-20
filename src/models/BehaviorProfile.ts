export interface BehaviorProfile {
  userId: string;
  clusterId?: number;
  bettingBehavior: {
    totalBets: number;
    totalStake: number;
    averageStake: number;
    stakeHistory: number[];
    oddsHistory: number[];
    confidenceHistory: number[];
    outcomeHistory: boolean[];
    update(stake: number, odds: number, confidence: number, outcome: boolean): void;
  };
  performanceMetrics: {
    roi: number;
    winRate: number;
    averageOdds: number;
    profitLoss: number;
    update(outcome: boolean, stake: number, odds: number): void;
  };
  riskProfile: {
    stakeVariation: number;
    oddsPreference: number;
    confidenceThreshold: number;
    update(stake: number, odds: number, confidence: number): void;
  };
  predictionPreferences: {
    modelTrust: Record<string, number>;
    marketSensitivity: number;
    temporalPreference: number;
    update(modelType: string, marketImpact: number, temporalImpact: number): void;
  };
}
