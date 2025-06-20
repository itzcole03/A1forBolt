export interface Cluster {
  id: number;
  size: number;
  averageROI: number;
  averageWinRate: number;
  averageStake: number;
  riskProfile: {
    stakeVariation: number;
    oddsPreference: number;
    confidenceThreshold: number;
  };
  characteristics?: {
    bettingStyle: 'conservative' | 'moderate' | 'aggressive';
    riskLevel: 'low' | 'medium' | 'high';
    preferredMarkets: string[];
    timePreference: 'early' | 'mid' | 'late';
  };
}
