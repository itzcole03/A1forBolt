import { UnifiedBettingAnalytics, BetRecommendation } from '../UnifiedBettingAnalytics';

describe('UnifiedBettingAnalytics', () => {
  let analytics: UnifiedBettingAnalytics;

  beforeEach(() => {
    analytics = UnifiedBettingAnalytics.getInstance();
  });

  it('should be a singleton', () => {
    const analytics2 = UnifiedBettingAnalytics.getInstance();
    expect(analytics).toBe(analytics2);
  });

  it('should emit and listen to events', done => {
    analytics.once('test_event', (payload) => {
      expect(payload).toEqual({ foo: 'bar' });
      done();
    });
    analytics.emit('test_event', { foo: 'bar' });
  });

  it('should return fallback prediction if API fails', async () => {
    // Simulate API failure by passing an invalid endpoint
    const result = await analytics["generatePrediction"].call(analytics, 'invalid', {});
    expect(result).toHaveProperty('probability');
    expect(result).toHaveProperty('confidence');
    expect(result.probability).toBeGreaterThanOrEqual(0);
    expect(result.probability).toBeLessThanOrEqual(1);
  });

  it('should add and remove strategies', () => {
    const strategy = {
      id: 'test',
      name: 'Test',
      riskLevel: 'low' as const,
      stakePercentage: 0.1,
      minOdds: 1.5,
      maxOdds: 3.0,
    };
    analytics.addStrategy(strategy);
    // @ts-expect-error: private access for test
    expect(analytics.activeStrategies.has('test')).toBe(true);
    analytics.removeStrategy('test');
    // @ts-expect-error: private access for test
    expect(analytics.activeStrategies.has('test')).toBe(false);
  });
});
