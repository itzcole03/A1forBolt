import { UnifiedPredictionService } from '../UnifiedPredictionService';
import { MarketContext, BettingContext } from '../../types/core';
import { BettingOdds } from '../../types/betting';

describe('UnifiedPredictionService', () => {
  let service: UnifiedPredictionService;
  let mockMarketContext: MarketContext;
  let mockBettingContext: BettingContext;

  beforeEach(() => {
    service = UnifiedPredictionService.getInstance();

    // Reset singleton instance for testing
    (UnifiedPredictionService as any).instance = null;
    service = UnifiedPredictionService.getInstance();

    const timestamp = Date.now();

    mockMarketContext = {
      eventId: 'test-event',
      market: 'test-market',
      timestamp,
      odds: [
        {
          bookmaker: 'test',
          eventId: 'test-event',
          market: 'test-market',
          selection: 'test-selection',
          over: 2.0,
          under: 1.8,
          timestamp,
          source: 'test',
        },
      ],
      volume: 1000000,
      liquidity: 500000,
      lineMovements: [
        {
          timestamp,
          oldValue: 1.9,
          newValue: 2.0,
          velocity: 0.1,
          volume: 100000,
          source: 'test',
          confidence: 0.8,
        },
      ],
    };

    mockBettingContext = {
      playerId: 'test-player',
      propId: 'test-prop',
      timestamp,
      odds: 2.0,
      marketContext: {
        volume: 1000000,
        movement: 0.1,
        liquidity: 500000,
      },
      historicalContext: {
        recentPerformance: [
          { value: 1.8, timestamp: timestamp - 1000 },
          { value: 1.9, timestamp: timestamp - 2000 },
          { value: 2.0, timestamp: timestamp - 3000 },
        ],
        trend: 0.1,
        volatility: 0.05,
        seasonality: 0.02,
      },
    };
  });

  describe('generatePrediction', () => {
    it('should generate a prediction with all components', async () => {
      const prediction = await service.generatePrediction(mockMarketContext, mockBettingContext);

      expect(prediction).not.toBeNull();
      expect(prediction?.id).toBeDefined();
      expect(prediction?.predictedValue).toBeGreaterThan(0);
      expect(prediction?.confidence).toBeGreaterThan(0);
      expect(prediction?.confidence).toBeLessThanOrEqual(1);
      expect(prediction?.uncertaintyBounds).toBeDefined();
      expect(prediction?.context).toBeDefined();
      expect(prediction?.ensembleWeights).toBeDefined();
      expect(prediction?.expectedValue).toBeDefined();
      expect(prediction?.riskAdjustedScore).toBeDefined();
      expect(prediction?.shapExplanations).toBeDefined();
      expect(prediction?.lineMovements).toBeDefined();
    });

    it('should handle missing market data gracefully', async () => {
      const prediction = await service.generatePrediction(
        { ...mockMarketContext, odds: [] },
        mockBettingContext
      );

      expect(prediction).not.toBeNull();
      expect(prediction?.confidence).toBeLessThan(1);
    });

    it('should handle missing historical data gracefully', async () => {
      const prediction = await service.generatePrediction(mockMarketContext, {
        ...mockBettingContext,
        historicalContext: undefined,
      });

      expect(prediction).not.toBeNull();
      expect(prediction?.confidence).toBeLessThan(1);
    });

    it('should handle missing line movements gracefully', async () => {
      const prediction = await service.generatePrediction(
        { ...mockMarketContext, lineMovements: [] },
        mockBettingContext
      );

      expect(prediction).not.toBeNull();
      expect(prediction?.confidence).toBeLessThan(1);
    });
  });

  describe('getPrediction', () => {
    it('should retrieve a cached prediction', async () => {
      const prediction = await service.generatePrediction(mockMarketContext, mockBettingContext);
      expect(prediction).not.toBeNull();

      const retrieved = service.getPrediction(prediction!.id);
      expect(retrieved).toEqual(prediction);
    });

    it('should return undefined for non-existent prediction', () => {
      const retrieved = service.getPrediction('non-existent-id');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('getPredictions', () => {
    it('should return all cached predictions', async () => {
      const prediction1 = await service.generatePrediction(mockMarketContext, mockBettingContext);
      const prediction2 = await service.generatePrediction(mockMarketContext, mockBettingContext);

      const predictions = service.getPredictions();
      expect(predictions).toContainEqual(prediction1);
      expect(predictions).toContainEqual(prediction2);
    });

    it('should return empty array when no predictions exist', () => {
      const predictions = service.getPredictions();
      expect(predictions).toEqual([]);
    });
  });

  describe('clearPredictions', () => {
    it('should clear all cached predictions', async () => {
      await service.generatePrediction(mockMarketContext, mockBettingContext);
      expect(service.getPredictions().length).toBeGreaterThan(0);

      service.clearPredictions();
      expect(service.getPredictions()).toEqual([]);
    });
  });
});
