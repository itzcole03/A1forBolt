// RefereeImpactModel: ALPHA1-compliant modular model scaffold
import type { GameContext, ShapVector } from '../types/core.js';
import { UnifiedConfig } from '../unified/UnifiedConfig.js';

export interface RefereeImpactModelOutput {
  features: Record<string, number>;
  shapInsights: ShapVector[];
  refereeScore: number;
}

export async function getRefereeImpactFeatures(
  refereeId: string,
  sport: string,
  context: GameContext
): Promise<RefereeImpactModelOutput> {
  const config = UnifiedConfig.getInstance();
  if (!config.get('enableRefereeImpactModel')) {
    throw new Error('RefereeImpactModel is disabled by config.');
  }
  // Example feature extraction (replace with real logic)
  const features = {
    foulRate: Math.random(),
    cardRate: Math.random(),
    homeBias: Math.random(),
  };
  // Generate SHAP insights
  const { calculateShap } = await import('../utils/shap.js');
  const shap = calculateShap(features, 'referee');
  return {
    features,
    shapInsights: [shap],
    refereeScore: features.foulRate * 0.5 + features.cardRate * 0.3 + features.homeBias * 0.2,
  };
}
