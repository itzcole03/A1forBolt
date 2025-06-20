import { PredictionService } from '../predictionService';
import { MarketContext } from '../../types/core';
import { BettingOdds } from '../../types/betting';

jest.mock('../predictionService');

describe('PredictionService', () => {
  let service: PredictionService;
  let mockService: jest.Mocked<PredictionService>;

  beforeEach(() => {
    jest.clearAllMocks();
    service = PredictionService.getInstance();
    mockService = service as jest.Mocked<PredictionService>;
  });

  describe('generatePrediction', () => {
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

    const mockHistoricalData: BettingOdds[] = [
      {
        bookmaker: 'book1',
        selection: 'selection1',
        odds: 1.9,
        timestamp: Date.now() - 3600000,
        market: 'market1',
        eventId: 'event1',
      },
    ];

    it('should generate prediction when confidence threshold is met', () => {
      const prediction = service.generatePrediction(mockMarketContext, mockHistoricalData);
      if (prediction) {
        expect(prediction.propId).toBe('event1_market1_selection1');
        expect(prediction.confidence).toBeGreaterThanOrEqual(0.7);
        expect(prediction.factors).toHaveLength(2);
        expect(prediction.factors[0].name).toBe('historical_performance');
        expect(prediction.factors[1].name).toBe('odds_movement');
      } else {
        fail('Prediction should not be null');
      }
    });

    it('should not generate prediction when confidence threshold is not met', () => {
      const lowConfidenceContext: MarketContext = {
        ...mockMarketContext,
        liquidity: 0.3,
      };
      const prediction = service.generatePrediction(lowConfidenceContext, mockHistoricalData);
      expect(prediction).toBeNull();
    });

    it('should emit newPrediction event when prediction is generated', () => {
      const emitSpy = jest.spyOn(service, 'emit');
      service.generatePrediction(mockMarketContext, mockHistoricalData);
      expect(emitSpy).toHaveBeenCalledWith('newPrediction', expect.any(Object));
    });
  });

  describe('getPrediction', () => {
    it('should return prediction if exists', () => {
      const mockPrediction = {
        id: 'test-id',
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

      mockService.getPrediction.mockReturnValue(mockPrediction);
      const prediction = service.getPrediction('prop1');
      expect(prediction).toEqual(mockPrediction);
    });

    it('should return null if prediction does not exist', () => {
      mockService.getPrediction.mockReturnValue(undefined);
      const prediction = service.getPrediction('nonexistent');
      expect(prediction).toBeUndefined();
    });
  });

  describe('clearPredictions', () => {
    it('should clear all predictions', () => {
      service.clearPredictions();
      expect(mockService.clearPredictions).toHaveBeenCalled();
    });
  });

  describe('analyzeFactors', () => {
    it('should analyze historical performance', () => {
      const mockHistoricalData: BettingOdds[] = [
        {
          bookmaker: 'book1',
          selection: 'selection1',
          odds: 1.9,
          timestamp: Date.now() - 3600000,
          market: 'market1',
          eventId: 'event1',
        },
      ];

      const factor = service['calculateHistoricalPerformance'](mockHistoricalData);
      expect(factor).toBeGreaterThanOrEqual(0);
      expect(factor).toBeLessThanOrEqual(1);
    });

    it('should analyze odds movement', () => {
      const mockHistoricalData: BettingOdds[] = [
        {
          bookmaker: 'book1',
          selection: 'selection1',
          odds: 1.9,
          timestamp: Date.now() - 3600000,
          market: 'market1',
          eventId: 'event1',
        },
      ];

      const factor = service['calculateOddsMovement'](mockHistoricalData);
      expect(factor).toBeGreaterThanOrEqual(0);
      expect(factor).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateConfidence', () => {
    it('should calculate confidence based on factors', () => {
      const mockFactors = [
        {
          name: 'historical_performance',
          weight: 0.4,
          value: 0.8,
        },
        {
          name: 'odds_movement',
          weight: 0.3,
          value: 0.7,
        },
      ];

      const confidence = service['calculateConfidence'](mockFactors);
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(1);
    });
  });

  describe('calculatePredictedValue', () => {
    it('should calculate predicted value based on factors', () => {
      const mockFactors = [
        {
          name: 'historical_performance',
          weight: 0.4,
          value: 0.8,
        },
        {
          name: 'odds_movement',
          weight: 0.3,
          value: 0.7,
        },
      ];

      const predictedValue = service['calculatePredictedValue'](mockFactors);
      expect(predictedValue).toBeGreaterThanOrEqual(0);
      expect(predictedValue).toBeLessThanOrEqual(1);
    });
  });
});
