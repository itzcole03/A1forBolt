import { SocialSentimentAdapter } from '../SocialSentimentAdapter';

describe('SocialSentimentAdapter', () => {
  let adapter: SocialSentimentAdapter;

  beforeEach(() => {
    adapter = new SocialSentimentAdapter();
    adapter.clearCache();
  });

  it('should be available', async () => {
    expect(await adapter.isAvailable()).toBe(true);
  });

  it('should fetch sentiment data and cache it', async () => {
    const data = await adapter.fetch();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
    expect(data[0]).toHaveProperty('player');
    expect(data[0]).toHaveProperty('sentiment');
    // Should be cached
    const cached = await adapter.fetch();
    expect(cached).toBe(data);
  });

  it('should clear cache', async () => {
    await adapter.fetch();
    adapter.clearCache();
    expect(adapter['cache'].data).toBeNull();
  });
});
