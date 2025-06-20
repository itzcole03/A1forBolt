import { getVenueEffectFeatures } from '../VenueEffectModel';
import { UnifiedConfig } from '../../unified/UnifiedConfig';

describe('VenueEffectModel', () => {
  beforeAll(() => {
    UnifiedConfig.getInstance().set('enableVenueEffectModel', true);
  });

  it('returns valid features and score when enabled', async () => {
    const result = await getVenueEffectFeatures('venue1', 'soccer', { season: '2023', league: 'EPL' } as any);
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('shapInsights');
    expect(typeof result.venueScore).toBe('number');
  });

  it('throws if model is disabled', async () => {
    UnifiedConfig.getInstance().set('enableVenueEffectModel', false);
    await expect(getVenueEffectFeatures('venue1', 'soccer', { season: '2023', league: 'EPL' } as any)).rejects.toThrow('VenueEffectModel is disabled by config.');
    UnifiedConfig.getInstance().set('enableVenueEffectModel', true);
  });
});
