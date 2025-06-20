import { ModelPerformanceTracker } from '../ModelPerformanceTracker';
import { ModelOutput, BetRecommendation } from '../../types/prediction';
import { UnifiedLogger } from '../../logging/types';
import { UnifiedMetrics } from '../../metrics/types';

describe('ModelPerformanceTracker', () => {
  let tracker: ModelPerformanceTracker;
  let mockLogger: jest.Mocked<UnifiedLogger>;
  let mockMetrics: jest.Mocked<UnifiedMetrics>;

  const mockPrediction: ModelOutput = {
    type: 'test-model',
    prediction: 0.8,
    confidence: 0.9,
    features: { feature1: 1, feature2: 2 },
  };

  const mockRecommendation: BetRecommendation = {
    id: '1',
    prediction: mockPrediction,
    confidence: 0.9,
    stake: 100,
    riskLevel: 'low',
    expectedValue: 0.2,
    timestamp: new Date(),
    metadata: {
      modelAgreement: 0.8,
      riskProfile: 'moderate',
      bankrollPercentage: 0.1,
    },
  };

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      trace: jest.fn(),
    };

    mockMetrics = {
      gauge: jest.fn(),
      increment: jest.fn(),
      timing: jest.fn(),
      track: jest.fn(),
      histogram: jest.fn(),
    };

    tracker = new ModelPerformanceTracker(mockLogger, mockMetrics);
  });

  describe('trackPrediction', () => {
    it('should track a new prediction', () => {
      tracker.trackPrediction('test-model', mockPrediction, mockRecommendation);

      const performance = tracker.getModelPerformance('test-model');
      expect(performance).toBeDefined();
      expect(performance?.totalPredictions).toBe(1);
      expect(performance?.totalStake).toBe(100);
      expect(performance?.averageConfidence).toBe(0.9);
    });

    it('should update metrics for existing model', () => {
      tracker.trackPrediction('test-model', mockPrediction, mockRecommendation);
      tracker.trackPrediction('test-model', mockPrediction, mockRecommendation);

      const performance = tracker.getModelPerformance('test-model');
      expect(performance?.totalPredictions).toBe(2);
      expect(performance?.totalStake).toBe(200);
    });
  });

  describe('recordOutcome', () => {
    it('should record a winning outcome', () => {
      tracker.trackPrediction('test-model', mockPrediction, mockRecommendation);
      tracker.recordOutcome('test-model', 100, 200, 2.0);

      const performance = tracker.getModelPerformance('test-model');
      expect(performance?.correctPredictions).toBe(1);
      expect(performance?.totalPayout).toBe(200);
      expect(performance?.roi).toBe(1.0);
      expect(performance?.winRate).toBe(1.0);
    });

    it('should record a losing outcome', () => {
      tracker.trackPrediction('test-model', mockPrediction, mockRecommendation);
      tracker.recordOutcome('test-model', 100, 0, 2.0);

      const performance = tracker.getModelPerformance('test-model');
      expect(performance?.correctPredictions).toBe(0);
      expect(performance?.totalPayout).toBe(0);
      expect(performance?.roi).toBe(-1.0);
      expect(performance?.winRate).toBe(0);
    });
  });

  describe('getPerformanceHistory', () => {
    it('should return history within timeframe', () => {
      tracker.trackPrediction('test-model', mockPrediction, mockRecommendation);
      tracker.recordOutcome('test-model', 100, 200, 2.0);

      const history = tracker.getPerformanceHistory('test-model', 'day');
      expect(history.length).toBeGreaterThan(0);
      expect(history[0].metrics.roi).toBe(1.0);
    });

    it('should filter history by timeframe', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 2);

      tracker.trackPrediction('test-model', mockPrediction, mockRecommendation);
      tracker.recordOutcome('test-model', 100, 200, 2.0);

      const history = tracker.getPerformanceHistory('test-model', 'day');
      expect(history).toHaveLength(1);
    });
  });

  describe('getTopPerformingModels', () => {
    it('should return top models by specified metric', () => {
      tracker.trackPrediction('model1', mockPrediction, mockRecommendation);
      tracker.trackPrediction('model2', mockPrediction, mockRecommendation);
      tracker.recordOutcome('model1', 100, 200, 2.0);
      tracker.recordOutcome('model2', 100, 150, 2.0);

      const topModels = tracker.getTopPerformingModels('roi', 2);
      expect(topModels).toHaveLength(2);
      expect(topModels[0].modelName).toBe('model1');
      expect(topModels[0].metrics.roi).toBe(1.0);
    });
  });

  describe('advanced metrics', () => {
    it('should calculate profit factor correctly', () => {
      tracker.trackPrediction('test-model', mockPrediction, mockRecommendation);
      tracker.recordOutcome('test-model', 100, 200, 2.0);
      tracker.recordOutcome('test-model', 100, 0, 2.0);

      const performance = tracker.getModelPerformance('test-model');
      expect(performance?.profitFactor).toBe(1.0);
    });

    it('should calculate Sharpe ratio for multiple outcomes', () => {
      tracker.trackPrediction('test-model', mockPrediction, mockRecommendation);
      tracker.recordOutcome('test-model', 100, 200, 2.0);
      tracker.recordOutcome('test-model', 100, 150, 2.0);

      const performance = tracker.getModelPerformance('test-model');
      expect(performance?.sharpeRatio).toBeGreaterThan(0);
    });

    it('should calculate max drawdown', () => {
      tracker.trackPrediction('test-model', mockPrediction, mockRecommendation);
      tracker.recordOutcome('test-model', 100, 200, 2.0);
      tracker.recordOutcome('test-model', 100, 50, 2.0);

      const performance = tracker.getModelPerformance('test-model');
      expect(performance?.maxDrawdown).toBeGreaterThan(0);
    });
  });
});
