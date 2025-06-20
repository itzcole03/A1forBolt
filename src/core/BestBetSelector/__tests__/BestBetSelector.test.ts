import { BestBetSelector } from '../BestBetSelector';
import { ModelOutput, RiskProfile } from '../../types/prediction';

// Mock logger and metrics
const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
};

const mockMetrics = {
  track: jest.fn(),
  increment: jest.fn(),
  gauge: jest.fn(),
  timing: jest.fn(),
  histogram: jest.fn(),
};

describe('BestBetSelector', () => {
  let selector: BestBetSelector;
  let mockPredictions: ModelOutput[];
  let mockRiskProfile: RiskProfile;

  beforeEach(() => {
    selector = new BestBetSelector(mockLogger, mockMetrics);
    mockPredictions = [
      {
        type: 'model1',
        prediction: 0.8,
        confidence: 0.9,
        features: { feature1: 1, feature2: 2 },
      },
      {
        type: 'model2',
        prediction: 0.75,
        confidence: 0.85,
        features: { feature1: 1, feature2: 2 },
      },
    ];
    mockRiskProfile = {
      type: 'moderate',
      maxStake: 1000,
      multiplier: 1,
      minConfidence: 0.7,
      maxRiskScore: 0.8,
      preferredSports: ['NBA'],
      preferredMarkets: ['moneyline'],
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('selectBestBets', () => {
    it('should filter out predictions below confidence threshold', async () => {
      const lowConfidencePrediction = {
        type: 'model3',
        prediction: 0.6,
        confidence: 0.5,
        features: { feature1: 1, feature2: 2 },
      };
      const predictions = [...mockPredictions, lowConfidencePrediction];

      const recommendations = await selector.selectBestBets(predictions, mockRiskProfile, 10000);

      expect(recommendations).toHaveLength(2);
      expect(recommendations.every(r => r.confidence >= 0.7)).toBe(true);
    });

    it('should calculate correct stake amounts', async () => {
      const recommendations = await selector.selectBestBets(
        mockPredictions,
        mockRiskProfile,
        10000
      );

      recommendations.forEach(recommendation => {
        expect(recommendation.stake).toBeLessThanOrEqual(mockRiskProfile.maxStake);
        expect(recommendation.stake).toBeGreaterThan(0);
      });
    });

    it('should include model agreement in metadata', async () => {
      const recommendations = await selector.selectBestBets(
        mockPredictions,
        mockRiskProfile,
        10000
      );

      recommendations.forEach(recommendation => {
        expect(recommendation.metadata.modelAgreement).toBeDefined();
        expect(recommendation.metadata.modelAgreement).toBeGreaterThanOrEqual(0);
        expect(recommendation.metadata.modelAgreement).toBeLessThanOrEqual(1);
      });
    });

    it('should track metrics for recommendations', async () => {
      await selector.selectBestBets(mockPredictions, mockRiskProfile, 10000);

      expect(mockMetrics.track).toHaveBeenCalledWith(
        'bet_recommendations_generated',
        expect.objectContaining({
          count: expect.any(Number),
          averageConfidence: expect.any(Number),
          totalStake: expect.any(Number),
        })
      );
    });
  });

  describe('updateModelPerformance', () => {
    it('should update model performance metrics correctly', () => {
      const modelName = 'model1';
      const result = { won: true, stake: 100, payout: 200 };

      selector.updateModelPerformance(modelName, result);

      const performance = selector.getModelPerformance().get(modelName);
      expect(performance).toBeDefined();
      expect(performance?.wins).toBe(1);
      expect(performance?.losses).toBe(0);
      expect(performance?.roi).toBe(1); // (200 - 100) / 100
    });

    it('should handle multiple updates correctly', () => {
      const modelName = 'model1';
      const results = [
        { won: true, stake: 100, payout: 200 },
        { won: false, stake: 100, payout: 0 },
      ];

      results.forEach(result => {
        selector.updateModelPerformance(modelName, result);
      });

      const performance = selector.getModelPerformance().get(modelName);
      expect(performance?.wins).toBe(1);
      expect(performance?.losses).toBe(1);
      expect(performance?.roi).toBe(0); // (200 - 100 - 100) / 200
    });
  });

  describe('updateConfig', () => {
    it('should update configuration correctly', async () => {
      const newConfig = {
        minConfidence: 0.8,
        maxStakePercentage: 0.2,
      };

      selector.updateConfig(newConfig);

      const recommendations = await selector.selectBestBets(
        mockPredictions,
        mockRiskProfile,
        10000
      );

      expect(recommendations.every(r => r.confidence >= 0.8)).toBe(true);
    });
  });
});
