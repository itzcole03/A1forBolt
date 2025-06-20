export interface AutomationConfig {
  updateInterval: number;
  riskManagement: {
    maxActiveBets: number;
    minConfidence: number;
    maxStakePercentage: number;
    stopLossPercentage: number;
    takeProfitPercentage: number;
  };
  prediction: {
    minSampleSize: number;
    maxTrials: number;
    explorationRate: number;
    recalibrationThreshold: number;
  };
  userPersonalization: {
    minClusterSize: number;
    maxClusters: number;
    confidenceThreshold: number;
  };
  notification: {
    enabled: boolean;
    channels: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
    priorityLevels: {
      info: boolean;
      warning: boolean;
      error: boolean;
      success: boolean;
    };
  };
}

export const defaultConfig: AutomationConfig = {
  updateInterval: 5 * 60 * 1000, // 5 minutes
  riskManagement: {
    maxActiveBets: 5,
    minConfidence: 0.7,
    maxStakePercentage: 0.05, // 5% of bankroll
    stopLossPercentage: 0.1, // 10% of bankroll
    takeProfitPercentage: 0.2, // 20% of bankroll
  },
  prediction: {
    minSampleSize: 1000,
    maxTrials: 100,
    explorationRate: 0.1,
    recalibrationThreshold: 0.1,
  },
  userPersonalization: {
    minClusterSize: 10,
    maxClusters: 5,
    confidenceThreshold: 0.7,
  },
  notification: {
    enabled: true,
    channels: {
      email: true,
      push: true,
      sms: false,
    },
    priorityLevels: {
      info: true,
      warning: true,
      error: true,
      success: true,
    },
  },
};
