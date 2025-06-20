import { logLiveData } from '../../../services/integrations/liveDataLogger';
describe('Analytics Logging', () => {
  it('logs data without throwing', () => {
    expect(() => logLiveData('test log')).not.toThrow();
  });
});
