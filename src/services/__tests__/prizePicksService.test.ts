import {
  fetchPrizePicksProps,
  fetchPrizePicksPlayer,
  fetchPrizePicksLines,
  optimizePortfolio,
} from '../prizePicksService';
import { unifiedMonitor } from '../../core/UnifiedMonitor';
import { AppError } from '../../core/UnifiedError';
import { apiClient } from '../api/client';

// Mock apiClient
jest.mock('../api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

// Mock unifiedMonitor
jest.mock('../../core/UnifiedMonitor', () => ({
  unifiedMonitor: {
    reportError: jest.fn(),
    startTrace: jest.fn(),
    endTrace: jest.fn(),
  },
}));

describe('PrizePicksService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchPrizePicksProps', () => {
    const mockResponse = {
      data: {
        data: [
          {
            id: '1',
            type: 'projection',
            attributes: {
              description: 'LeBron James Points',
              stat_type: 'points',
              line_score: 25.5,
              projection_type: 'over_under',
              start_time: '2024-03-20T19:30:00Z',
            },
            relationships: {
              new_player: {
                data: {
                  id: '1',
                  type: 'new_player',
                },
              },
              league: {
                data: {
                  id: 'NBA',
                },
              },
            },
          },
        ],
        included: [
          {
            id: '1',
            type: 'new_player',
            attributes: {
              name: 'LeBron James',
              team_name: 'LAL',
              position: 'SF',
            },
          },
        ],
      },
    };

    it('should fetch props successfully', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: mockResponse,
      });

      const props = await fetchPrizePicksProps('NBA', 'points');

      expect(props).toHaveLength(1);
      expect(props[0]).toMatchObject({
        id: '1',
        playerName: 'LeBron James',
        propType: 'points',
        line: 25.5,
        overOdds: 1.91,
        underOdds: 1.91,
        gameTime: expect.any(Date),
        sport: 'NBA',
      });
    });

    it('should handle API errors', async () => {
      (apiClient.get as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

      await expect(fetchPrizePicksProps()).rejects.toThrow(AppError);
      expect(unifiedMonitor.reportError).toHaveBeenCalled();
    });

    it('should handle missing data in response', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { data: {} },
      });

      const props = await fetchPrizePicksProps();
      expect(props).toEqual([]);
      expect(unifiedMonitor.reportError).toHaveBeenCalled();
    });

    it('should apply filters correctly', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: mockResponse,
      });

      await fetchPrizePicksProps('NBA', 'points');

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('/projections'),
        expect.objectContaining({
          params: {
            league_id: 'NBA',
            stat_type: 'points',
          },
        })
      );
    });
  });

  describe('fetchPrizePicksPlayer', () => {
    const mockPlayerResponse = {
      data: {
        data: {
          id: '1',
          type: 'new_player',
          attributes: {
            name: 'LeBron James',
            team_name: 'LAL',
            position: 'SF',
          },
        },
      },
    };

    it('should fetch player details successfully', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: mockPlayerResponse,
      });

      const player = await fetchPrizePicksPlayer('1');

      expect(player).toMatchObject({
        id: '1',
        name: 'LeBron James',
        team: 'LAL',
        position: 'SF',
        stats: {},
      });
    });

    it('should handle missing player data', async () => {
      (apiClient.get as jest.Mock).mockResolvedValueOnce({
        status: 200,
        data: { data: {} },
      });

      const player = await fetchPrizePicksPlayer('1');
      expect(player).toBeUndefined();
      expect(unifiedMonitor.reportError).toHaveBeenCalled();
    });
  });

  describe('optimizePortfolio', () => {
    const mockProps = [
      {
        id: '1',
        playerName: 'LeBron James',
        propType: 'points',
        line: 25.5,
        overOdds: 1.91,
        underOdds: 1.91,
        gameTime: new Date('2024-03-20T19:30:00Z'),
        sport: 'NBA',
      },
    ];

    const mockConfig = {
      investmentAmount: 1000,
      mlModelSet: 'balanced' as const,
      confidenceThreshold: 0.8,
      strategyMode: 'value' as const,
      portfolioSize: 2,
      sportsUniverse: ['NBA'] as ('NBA' | 'NFL' | 'MLB' | 'NHL' | 'WNBA' | 'SOCCER')[],
      timeWindow: 'today' as const,
    };

    it('should optimize portfolio successfully', async () => {
      const result = await optimizePortfolio(mockConfig, mockProps);

      expect(result).toMatchObject({
        props: expect.any(Array),
        expectedValue: expect.any(Number),
        riskScore: expect.any(Number),
        confidenceScore: expect.any(Number),
        kellyCriterion: expect.any(Number),
      });
    });

    it('should filter props by time window', async () => {
      const futureProps = [
        {
          ...mockProps[0],
          gameTime: new Date('2024-03-21T19:30:00Z'), // Tomorrow
          id: '1', // Ensure id is present and not possibly undefined
          playerName: 'LeBron James',
          propType: 'points',
          line: 25.5,
          overOdds: 1.91,
          underOdds: 1.91,
          sport: 'NBA',
        },
      ];

      const result = await optimizePortfolio(mockConfig, futureProps);
      expect(result.props).toHaveLength(0);
    });

    it('should respect portfolio size limit', async () => {
      const manyProps = Array(5).fill(mockProps[0]);
      const result = await optimizePortfolio(mockConfig, manyProps);
      expect(result.props.length).toBeLessThanOrEqual(mockConfig.portfolioSize);
    });
  });
});
