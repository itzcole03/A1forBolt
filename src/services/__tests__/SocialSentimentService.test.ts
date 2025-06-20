import { SocialSentimentService } from '../SocialSentimentService';
import { UnifiedConfig } from '../../unified/UnifiedConfig';

describe('SocialSentimentService', () => {
  beforeEach(() => {
    UnifiedConfig.getInstance().set('enableSocialSentiment', true);
  });

  it('is a singleton', () => {
    const a = SocialSentimentService.getInstance();
    const b = SocialSentimentService.getInstance();
    expect(a).toBe(b);
  });

  it('throws if feature is disabled', async () => {
    UnifiedConfig.getInstance().set('enableSocialSentiment', false);
    const service = SocialSentimentService.getInstance();
    await expect(service.getSentimentAnalysis()).rejects.toThrow('Social Sentiment feature is disabled by config.');
  });

  it('throws not implemented if enabled', async () => {
    UnifiedConfig.getInstance().set('enableSocialSentiment', true);
    const service = SocialSentimentService.getInstance();
    await expect(service.getSentimentAnalysis()).rejects.toThrow('not implemented');
  });
});
