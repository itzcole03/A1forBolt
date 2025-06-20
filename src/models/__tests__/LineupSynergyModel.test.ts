import { getLineupSynergyFeatures } from '../LineupSynergyModel.js';
import { UnifiedConfig } from '../../unified/UnifiedConfig.js';

describe('LineupSynergyModel', () => {
  beforeAll(() => {
    UnifiedConfig.getInstance().set('enableLineupSynergyModel', { enabled: true });
  });

  it('returns valid features and score when enabled', async () => {
    const context = { seasonYear: 2023, gameType: 'regular' as const, metadata: { league: 'NBA' } };
    const result = await getLineupSynergyFeatures(['p1','p2','p3'], 'basketball', context);
    expect(result).toHaveProperty('features');
    expect(result).toHaveProperty('shapInsights');
    expect(typeof result.synergyScore).toBe('number');
  });

  it('throws if model is disabled', async () => {
    UnifiedConfig.getInstance().set('enableLineupSynergyModel', { enabled: false });
    const context = { seasonYear: 2023, gameType: 'regular' as const, metadata: { league: 'NBA' } };
    await expect(getLineupSynergyFeatures(['p1','p2','p3'], 'basketball', context)).rejects.toThrow('LineupSynergyModel is disabled by config.');
    UnifiedConfig.getInstance().set('enableLineupSynergyModel', { enabled: true });
  });
});
