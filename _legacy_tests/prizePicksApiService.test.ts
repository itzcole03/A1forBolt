import { PrizePicksAPI } from '../api/PrizePicksAPI';
import type { PrizePicksAPIConfig } from '../api/PrizePicksAPI';

// betaTest4/src/test/api/prizePicksApiService.test.ts

// Mock UnifiedConfig to always provide a config object
jest.mock('../../core/UnifiedConfig', () => {
  const apiEndpoints = {
    users: '/api/users',
    prizepicks: '/api/prizepicks',
    predictions: '/api/predictions',
    dataScraping: '/api/data-scraping',
    config: '/api/config',
    news: '/api/news',
    sentiment: '/api/sentiment',
    live: '/api/live',
  };
  const config = {
    appName: 'Test App',
    version: '1.0.0',
    features: {},
    apiBaseUrl: 'http://localhost:8000',
    sentryDsn: '',
    websocketUrl: 'ws://localhost:8080',
    getApiEndpoint: (key: string) => (apiEndpoints as Record<string, string>)[key] || '',
  };
  return {
    ...jest.requireActual('../../core/UnifiedConfig'),
    initializeUnifiedConfig: jest.fn(() => Promise.resolve(config)),
    fetchAppConfig: jest.fn(() => Promise.resolve(config)),
    getInitializedUnifiedConfig: jest.fn(() => config),
    globalUnifiedConfig: config,
  };
});

// Mocking fetch globally for API tests
globalThis.fetch = jest.fn();

describe('PrizePicksAPI Service', () => {
  let prizePicksApi: PrizePicksAPI;
  const mockBaseUrl = 'https://mock-api.prizepicks.com';

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    const config: PrizePicksAPIConfig = {
      baseUrl: mockBaseUrl,
      // No apiKey needed due to recent changes, but can be tested if provided
    };
    prizePicksApi = new PrizePicksAPI(config);
  });

  describe('fetchProjections', () => {
    it('should fetch projections successfully', async () => {
      const mockData = { data: [], included: [] }; // Provide a valid mock response structure
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        status: 200,
        statusText: 'OK'
      });

      const data = await prizePicksApi.fetchProjections();
      expect(fetch).toHaveBeenCalledTimes(1);
      expect(fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projections?single_stat=true&league_id=NBA`,
        expect.objectContaining({ method: 'GET' })
      );
      expect(data).toEqual(mockData);
    });

    it('should fetch projections for a specific league', async () => {
      const mockData = { data: [], included: [] };
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
        status: 200,
        statusText: 'OK'
      });

      await prizePicksApi.fetchProjections('NFL');
      expect(fetch).toHaveBeenCalledWith(
        `${mockBaseUrl}/projections?single_stat=true&league_id=NFL`,
        expect.objectContaining({ method: 'GET' })
      );
    });

    it('should throw an error if the API request fails', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server Error' // Changed from json to text to match PrizePicksAPI error handling
      });

      await expect(prizePicksApi.fetchProjections()).rejects.toThrow(
        'PrizePicks API request failed to /projections: 500 Internal Server Error - Server Error'
      );
    });

    it('should handle API key if provided in config', async () => {
        const apiKey = 'test-api-key';
        const configWithKey: PrizePicksAPIConfig = {
          baseUrl: mockBaseUrl,
          apiKey: apiKey,
        };
        const apiWithKey = new PrizePicksAPI(configWithKey);
        const mockData = { data: [], included: [] };
        (fetch as jest.Mock).mockResolvedValueOnce({
          ok: true,
          json: async () => mockData,
          status: 200,
          statusText: 'OK'
        });

        await apiWithKey.fetchProjections();
        expect(fetch).toHaveBeenCalledWith(
          `${mockBaseUrl}/projections?single_stat=true&league_id=NBA`,
          expect.objectContaining({
            method: 'GET',
            headers: expect.objectContaining({
              'X-Api-Key': apiKey
            })
          })
        );
    });
  });

  // Add more describe blocks for other methods like getLeagues, getStatTypes, etc.
}); 