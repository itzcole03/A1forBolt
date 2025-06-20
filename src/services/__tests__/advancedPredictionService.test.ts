import { AdvancedPredictionService } from '../advancedPredictionService';
import { PredictionService } from '../predictionService';
import { MarketContext, BettingContext } from '../../types/core';
import { BettingOdds } from '../../types/betting';

jest.mock('../predictionService');

describe('AdvancedPredictionService', () => {
  let service: AdvancedPredictionService;
  let mockPredictionService: jest.Mocked<PredictionService>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = AdvancedPredictionService.getInstance();
    mockPredictionService = PredictionService.getInstance() as jest.Mocked<PredictionService>;
  });

  describe('generateAdvancedPrediction', () => {
    const mockOdds: BettingOdds[] = [
      {
        bookmaker: 'book1',
        selection: 'selection1',
        odds: 2.0,
        timestamp: Date.now(),
        market: 'market1',
        eventId: 'event1',
      },
    ];

    const mockMarketContext: MarketContext = {
      eventId: 'event1',
      market: 'market1',
      timestamp: Date.now(),
      odds: mockOdds,
      volume: 1000,
      liquidity: 0.8,
    };

    const mockBettingContext: BettingContext = {
      playerId: 'player1',
      propId: 'prop1',
      odds: 2.0,
      timestamp: Date.now(),
      marketContext: {
        volume: 1000,
        movement: 0.1,
        liquidity: 0.8,
      },
      historicalContext: {
        recentPerformance: [0.8, 0.7, 0.9],
        trend: 0.1,
        volatility: 0.2,
      },
    };

    const mockBasePrediction = {
      id: 'pred1',
      propId: 'prop1',
      predictedValue: 0.75,
      confidence: 0.85,
      factors: [
        {
          name: 'historical_performance',
          weight: 0.4,
          value: 0.8,
        },
      ],
      timestamp: Date.now(),
    };

    beforeEach(() => {
      mockPredictionService.generatePrediction.mockReturnValue(mockBasePrediction);
    });

    it('should generate advanced prediction when base prediction exists', async () => {
      const prediction = await service.generateAdvancedPrediction(
        mockMarketContext,
        mockBettingContext
      );

      expect(prediction).not.toBeNull();
      expect(prediction?.id).toBe('pred1_advanced');
      expect(prediction?.basePrediction).toEqual(mockBasePrediction);
      expect(prediction?.confidence).toBeGreaterThanOrEqual(0);
      expect(prediction?.confidence).toBeLessThanOrEqual(1);
      expect(prediction?.uncertaintyBounds.lower).toBeGreaterThanOrEqual(0);
      expect(prediction?.uncertaintyBounds.upper).toBeLessThanOrEqual(1);
      expect(prediction?.expectedValue).toBeGreaterThan(0);
      expect(prediction?.riskAdjustedScore).toBeGreaterThan(0);
    });

    it('should return null when base prediction is null', async () => {
      mockPredictionService.generatePrediction.mockReturnValue(null);

      const prediction = await service.generateAdvancedPrediction(
        mockMarketContext,
        mockBettingContext
      );
      expect(prediction).toBeNull();
    });

    it('should emit newAdvancedPrediction event when confidence threshold is met', async () => {
      const emitSpy = jest.spyOn(service, 'emit');

      await service.generateAdvancedPrediction(mockMarketContext, mockBettingContext);

      expect(emitSpy).toHaveBeenCalledWith('newAdvancedPrediction', expect.any(Object));
    });

    it('should not emit newAdvancedPrediction event when confidence threshold is not met', async () => {
      const emitSpy = jest.spyOn(service, 'emit');
      mockPredictionService.generatePrediction.mockReturnValue({
        ...mockBasePrediction,
        confidence: 0.5, // Below threshold
      });

      await service.generateAdvancedPrediction(mockMarketContext, mockBettingContext);

      expect(emitSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateEnsemblePerformance', () => {
    it('should update ensemble performance metrics', () => {
      const performance = {
        accuracy: 0.85,
        confidence: 0.9,
        roi: 0.15,
      };

      service.updateEnsemblePerformance('default', performance);
      const weights = service.getEnsembleWeights();

      expect(weights['default']).toBeDefined();
    });

    it('should not update non-existent ensemble', () => {
      const performance = {
        accuracy: 0.85,
        confidence: 0.9,
        roi: 0.15,
      };

      service.updateEnsemblePerformance('nonexistent', performance);
      const weights = service.getEnsembleWeights();

      expect(weights['nonexistent']).toBeUndefined();
    });
  });

  describe('getEnsembleWeights', () => {
    it('should return all ensemble weights', () => {
      const weights = service.getEnsembleWeights();

      expect(weights).toHaveProperty('default');
      expect(weights).toHaveProperty('highScoring');
      expect(weights).toHaveProperty('rivalry');
    });
  });
});
