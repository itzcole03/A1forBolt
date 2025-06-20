// VenueEffectModel: ALPHA1-compliant modular model scaffold
import type { GameContext, ShapVector } from '../types/core.js';
import { UnifiedConfig } from '../unified/UnifiedConfig.js';

export interface VenueEffectModelOutput {
  features: Record<string, number>;
  shapInsights: ShapVector[];
  venueScore: number;
}

export async function getVenueEffectFeatures(
  venueId: string,
  sport: string,
  context: GameContext
): Promise<VenueEffectModelOutput> {
  const config = UnifiedConfig.getInstance();
  if (!config.get('enableVenueEffectModel')) {
    throw new Error('VenueEffectModel is disabled by config.');
  }
  // Example feature extraction (replace with real logic)
  const features = {
    homeAdvantage: Math.random(),
    altitudeEffect: Math.random(),
    crowdSize: Math.random(),
  };
  // Generate SHAP insights
  const { calculateShap } = await import('../utils/shap.js');
  const shap = calculateShap(features, 'venue');
  return {
    features,
    shapInsights: [shap],
    venueScore: features.homeAdvantage * 0.6 + features.altitudeEffect * 0.2 + features.crowdSize * 0.2,
  };
}
