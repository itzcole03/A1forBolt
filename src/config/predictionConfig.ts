// betaTest4/src/config/predictionConfig.ts

export interface FeatureFlags {
  enableExperimentalOddsCalculation: boolean;
  showAdvancedAnalyticsDashboard: boolean;
  useNewSentimentModel: boolean;
  // Add more feature flags as needed
}

export interface ExperimentConfig {
  id: string;
  name: string;
  variants: { id: string; name: string; weight: number }[];
  isActive: boolean;
}

const defaultFeatureFlags: FeatureFlags = {
  enableExperimentalOddsCalculation: false,
  showAdvancedAnalyticsDashboard: true,
  useNewSentimentModel: false,
};

const activeExperiments: ExperimentConfig[] = [
  // Example experiment
  // {
  //   id: 'exp_dashboard_layout_v2',
  //   name: 'Dashboard Layout V2 Test',
  //   variants: [
  //     { id: 'control', name: 'Current Layout', weight: 50 },
  //     { id: 'variant_a', name: 'New V2 Layout', weight: 50 },
  //   ],
  //   isActive: true,
  // },
];

export const getFeatureFlag = (flagName: keyof FeatureFlags): boolean => {
  // In a real app, this could be fetched from a remote config service (e.g., LaunchDarkly)
  // or allow overrides via localStorage for development/testing.
  return defaultFeatureFlags[flagName];
};

export const getActiveExperiments = (): ExperimentConfig[] => {
  return activeExperiments.filter(exp => exp.isActive);
};

export const getAllFeatureFlags = (): FeatureFlags => {
  return defaultFeatureFlags;
};
