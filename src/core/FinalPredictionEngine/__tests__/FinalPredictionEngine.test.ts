import { FinalPredictionEngineImpl } from '../FinalPredictionEngine';
import {
  FinalPredictionEngineConfig,
  ModelOutput,
  RiskProfile,
  ModelType,
  RiskLevel,
  FinalPrediction,
} from '../types';

describe('FinalPredictionEngine', () => {
  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  const mockMetrics = {
    track: jest.fn(),
    increment: jest.fn(),
    gauge: jest.fn(),
    timing: jest.fn(),
  };

  const mockConfig = {
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    has: jest.fn(),
  };

  const initialConfig: FinalPredictionEngineConfig = {
    modelWeights: [
      { type: 'historical', weight: 0.4 },
      { type: 'market', weight: 0.3 },
      { type: 'sentiment', weight: 0.2 },
      { type: 'correlation', weight: 0.1 },
    ],
    riskProfiles: {
      safe: {
        type: 'safe',
        multiplier: 1.2,
        maxStake: 100,
      },
      aggressive: {
        type: 'aggressive',
        multiplier: 2.0,
        maxStake: 500,
      },
    },
    sureOddsThreshold: 0.8,
    featureThreshold: 0.1,
    maxFeatures: 5,
  };

  const engine = new FinalPredictionEngineImpl(
    {
      logger: mockLogger,
      metrics: mockMetrics,
      config: mockConfig,
    },
    initialConfig
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePrediction', () => {
    const mockModelOutputs: ModelOutput[] = [
      {
        type: 'historical',
        score: 0.8,
        confidence: 0.9,
        timestamp: Date.now(),
        features: [
          { name: 'win_rate', weight: 0.6, impact: 0.4 },
          { name: 'form', weight: 0.4, impact: 0.3 },
        ],
        metadata: {
          signalStrength: 0.9,
          latency: 100,
        },
      },
      {
        type: 'market',
        score: 0.7,
        confidence: 0.8,
        timestamp: Date.now(),
        features: [
          { name: 'odds', weight: 0.7, impact: 0.5 },
          { name: 'volume', weight: 0.3, impact: 0.2 },
        ],
        metadata: {
          signalStrength: 0.8,
          latency: 150,
        },
      },
    ];

    const mockRiskProfile: RiskProfile = {
      type: 'safe',
      multiplier: 1.2,
      maxStake: 100,
    };

    it('should generate a valid prediction', async () => {
      const prediction = await engine.generatePrediction(mockModelOutputs, mockRiskProfile);

      expect(prediction).toMatchObject({
        finalScore: expect.any(Number),
        confidence: expect.any(Number),
        riskLevel: expect.any(String),
        isSureOdds: expect.any(Boolean),
        payoutRange: {
          min: expect.any(Number),
          max: expect.any(Number),
          expected: expect.any(Number),
        },
        modelContributions: expect.any(Object),
        topFeatures: expect.any(Array),
        supportingFeatures: expect.any(Array),
      });

      expect(mockLogger.info).toHaveBeenCalled();
      expect(mockMetrics.track).toHaveBeenCalled();
    });

    it('should throw error for empty model outputs', async () => {
      await expect(engine.generatePrediction([], mockRiskProfile)).rejects.toThrow();
    });

    it('should throw error for invalid risk profile', async () => {
      const invalidProfile: RiskProfile = {
        type: 'invalid',
        multiplier: 1.0,
        maxStake: 100,
      };

      await expect(engine.generatePrediction(mockModelOutputs, invalidProfile)).rejects.toThrow();
    });
  });

  describe('updateModelWeights', () => {
    it('should update model weights', async () => {
      const newWeights = [
        { type: 'historical' as ModelType, weight: 0.5 },
        { type: 'market' as ModelType, weight: 0.3 },
        { type: 'sentiment' as ModelType, weight: 0.1 },
        { type: 'correlation' as ModelType, weight: 0.1 },
      ];

      await engine.updateModelWeights(newWeights);
      expect(mockConfig.set).toHaveBeenCalledWith('modelWeights', newWeights);
    });
  });

  describe('updateRiskProfiles', () => {
    it('should update risk profiles', async () => {
      const newProfiles = {
        safe: {
          type: 'safe',
          multiplier: 1.5,
          maxStake: 200,
        },
        aggressive: {
          type: 'aggressive',
          multiplier: 2.5,
          maxStake: 1000,
        },
      };

      await engine.updateRiskProfiles(newProfiles);
      expect(mockConfig.set).toHaveBeenCalledWith('riskProfiles', newProfiles);
    });
  });

  describe('getEngineMetrics', () => {
    it('should return engine metrics', async () => {
      const metrics = await engine.getEngineMetrics();
      expect(metrics).toMatchObject({
        modelCount: expect.any(Number),
        riskProfileCount: expect.any(Number),
        sureOddsThreshold: expect.any(Number),
        featureThreshold: expect.any(Number),
      });
    });
  });

  describe('validatePrediction', () => {
    it('should validate a correct prediction', async () => {
      const validPrediction: FinalPrediction = {
        id: 'test-id',
        timestamp: Date.now(),
        confidenceWindow: {
          start: Date.now() - 1000,
          end: Date.now(),
        },
        finalScore: 0.8,
        confidence: 0.9,
        riskLevel: 'low' as RiskLevel,
        isSureOdds: true,
        payoutRange: {
          min: 0.7,
          max: 0.9,
          expected: 0.8,
        },
        modelContributions: {
          historical: { weight: 0.4, confidence: 0.9, score: 0.8 },
          market: { weight: 0.3, confidence: 0.8, score: 0.7 },
          sentiment: { weight: 0.2, confidence: 0.7, score: 0.6 },
          correlation: { weight: 0.1, confidence: 0.6, score: 0.5 },
        },
        topFeatures: [],
        supportingFeatures: [],
        metadata: {
          processingTime: 100,
          dataFreshness: 0.9,
          signalQuality: 0.8,
          decisionPath: [],
        },
      };

      const isValid = await engine.validatePrediction(validPrediction);
      expect(isValid).toBe(true);
    });

    it('should reject an invalid prediction', async () => {
      const invalidPrediction: FinalPrediction = {
        id: 'test-id',
        timestamp: Date.now(),
        confidenceWindow: {
          start: Date.now() + 1000, // Invalid: start after end
          end: Date.now(),
        },
        finalScore: 0.8,
        confidence: 0.9,
        riskLevel: 'high' as RiskLevel, // Changed from 'invalid' to valid RiskLevel
        isSureOdds: true,
        payoutRange: {
          min: 0.9, // Invalid: min > max
          max: 0.7,
          expected: 0.8,
        },
        modelContributions: {
          historical: { weight: 0.4, confidence: 0.9, score: 0.8 },
          market: { weight: 0.3, confidence: 0.8, score: 0.7 },
          sentiment: { weight: 0.2, confidence: 0.7, score: 0.6 },
          correlation: { weight: 0.1, confidence: 0.6, score: 0.5 },
        },
        topFeatures: [],
        supportingFeatures: [],
        metadata: {
          processingTime: 100,
          dataFreshness: 0.9,
          signalQuality: 0.8,
          decisionPath: [],
        },
      };

      const isValid = await engine.validatePrediction(invalidPrediction);
      expect(isValid).toBe(false);
    });
  });
});
