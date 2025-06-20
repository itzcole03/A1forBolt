import { ModelVersioning, ModelVersion } from '../ModelVersioning';
import { EventBus } from '../EventBus';
import { unifiedMonitor } from '../UnifiedMonitor';
import { SystemError, ErrorCategory, ErrorSeverity } from '../UnifiedError';

jest.mock('../EventBus');
jest.mock('../UnifiedMonitor');

describe('ModelVersioning', () => {
  let modelVersioning: ModelVersioning;
  let mockEventBus: jest.Mocked<EventBus>;
  const mockModelId = 'test-model';
  const mockVersions: ModelVersion[] = [
    {
      id: 'v1',
      version: '1.0.0',
      timestamp: 1000,
      metrics: {
        accuracy: 0.8,
        precision: 0.75,
        recall: 0.7,
        f1Score: 0.72,
      },
      features: ['feature1', 'feature2'],
      metadata: {
        trainingDataSize: 1000,
        trainingDuration: 3600,
        framework: 'tensorflow',
        hyperparameters: { learningRate: 0.001 },
      },
    },
    {
      id: 'v2',
      version: '1.1.0',
      timestamp: 2000,
      metrics: {
        accuracy: 0.85,
        precision: 0.8,
        recall: 0.75,
        f1Score: 0.77,
      },
      features: ['feature1', 'feature2', 'feature3'],
      metadata: {
        trainingDataSize: 1200,
        trainingDuration: 4000,
        framework: 'tensorflow',
        hyperparameters: { learningRate: 0.0008 },
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockEventBus = {
      emit: jest.fn(),
      subscribe: jest.fn(),
    } as any;
    (EventBus.getInstance as jest.Mock).mockReturnValue(mockEventBus);
    modelVersioning = ModelVersioning.getInstance();

    // Register test versions
    mockVersions.forEach(version => {
      modelVersioning['versions'].set(mockModelId, [...mockVersions]);
    });
  });

  describe('rollbackToVersion', () => {
    it('should rollback to specified version', async () => {
      await modelVersioning.rollbackToVersion(mockModelId, '1.0.0');

      const remainingVersions = modelVersioning['versions'].get(mockModelId);
      expect(remainingVersions).toHaveLength(1);
      expect(remainingVersions![0].version).toBe('1.0.0');

      expect(mockEventBus.emit).toHaveBeenCalledWith('model:version:rolled_back', {
        modelId: mockModelId,
        targetVersion: '1.0.0',
        remainingVersions: 1,
        timestamp: expect.any(Number),
      });
    });

    it('should throw error if model not found', async () => {
      await expect(modelVersioning.rollbackToVersion('non-existent', '1.0.0')).rejects.toThrow(
        'Model non-existent not found'
      );
    });

    it('should throw error if version not found', async () => {
      await expect(modelVersioning.rollbackToVersion(mockModelId, '2.0.0')).rejects.toThrow(
        'Version 2.0.0 not found for model test-model'
      );
    });
  });

  describe('compareVersions', () => {
    it('should compare two versions correctly', async () => {
      const result = await modelVersioning.compareVersions(mockModelId, '1.0.0', '1.1.0');

      expect(result.differences.metrics).toEqual({
        accuracy: { v1: 0.8, v2: 0.85, diff: 0.05 },
        precision: { v1: 0.75, v2: 0.8, diff: 0.05 },
        recall: { v1: 0.7, v2: 0.75, diff: 0.05 },
        f1Score: { v1: 0.72, v2: 0.77, diff: 0.05 },
      });

      expect(result.differences.features).toEqual({
        added: ['feature3'],
        removed: [],
        modified: ['feature1', 'feature2'],
      });

      expect(result.differences.metadata).toEqual({
        trainingDataSize: { v1: 1000, v2: 1200 },
        trainingDuration: { v1: 3600, v2: 4000 },
        hyperparameters: {
          v1: { learningRate: 0.001 },
          v2: { learningRate: 0.0008 },
        },
      });

      expect(mockEventBus.emit).toHaveBeenCalledWith('model:version:compared', {
        modelId: mockModelId,
        version1: '1.0.0',
        version2: '1.1.0',
        timestamp: expect.any(Number),
      });
    });

    it('should throw error if model not found', async () => {
      await expect(
        modelVersioning.compareVersions('non-existent', '1.0.0', '1.1.0')
      ).rejects.toThrow('Model non-existent not found');
    });

    it('should throw error if versions not found', async () => {
      await expect(modelVersioning.compareVersions(mockModelId, '2.0.0', '1.1.0')).rejects.toThrow(
        'One or both versions not found for model test-model'
      );
    });
  });

  describe('getInstance', () => {
    it('should return the same instance on multiple calls', () => {
      const instance1 = ModelVersioning.getInstance();
      const instance2 = ModelVersioning.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('registerModelVersion', () => {
    it('should successfully register a valid model version', async () => {
      await modelVersioning.registerModelVersion('test-model', mockVersions[0]);

      const latestVersion = modelVersioning.getLatestVersion('test-model');
      expect(latestVersion).toEqual(mockVersions[0]);
      expect(mockEventBus.emit).toHaveBeenCalledWith('model:version:updated', {
        modelId: 'test-model',
        version: mockVersions[0],
        totalVersions: 2,
      });
    });

    it('should reject model version with accuracy below threshold', async () => {
      const lowAccuracyVersion = {
        ...mockVersions[0],
        metrics: { ...mockVersions[0].metrics, accuracy: 0.5 },
      };

      await expect(
        modelVersioning.registerModelVersion('test-model', lowAccuracyVersion)
      ).rejects.toThrow(SystemError);

      expect(mockEventBus.emit).not.toHaveBeenCalled();
    });

    it('should maintain version limit', async () => {
      const versions = Array.from({ length: 6 }, (_, i) => ({
        ...mockVersions[0],
        version: `${i + 1}.0.0`,
        timestamp: Date.now() + i,
      }));

      for (const version of versions) {
        await modelVersioning.registerModelVersion('test-model', version);
      }

      const history = modelVersioning.getVersionHistory('test-model');
      expect(history).toHaveLength(5); // maxVersionsToKeep is 5
      expect(history[0].version).toBe('6.0.0'); // Latest version should be first
    });
  });

  describe('getLatestVersion', () => {
    it('should return null for non-existent model', () => {
      expect(modelVersioning.getLatestVersion('non-existent')).toBeNull();
    });

    it('should return the latest version for existing model', async () => {
      await modelVersioning.registerModelVersion('test-model', mockVersions[0]);
      const latest = modelVersioning.getLatestVersion('test-model');
      expect(latest).toEqual(mockVersions[0]);
    });
  });

  describe('getVersionHistory', () => {
    it('should return empty array for non-existent model', () => {
      expect(modelVersioning.getVersionHistory('non-existent')).toEqual([]);
    });

    it('should return all versions in chronological order', async () => {
      const history = modelVersioning.getVersionHistory('test-model');
      expect(history).toHaveLength(2);
      expect(history[0].version).toBe('1.1.0');
      expect(history[1].version).toBe('1.0.0');
    });
  });

  describe('validateVersion', () => {
    it('should return true for first version', async () => {
      const isValid = await modelVersioning.validateVersion('test-model', mockVersions[0]);
      expect(isValid).toBe(true);
    });

    it('should return true for better version', async () => {
      await modelVersioning.registerModelVersion('test-model', mockVersions[1]);

      const betterVersion = mockVersions[1];

      const isValid = await modelVersioning.validateVersion('test-model', betterVersion);
      expect(isValid).toBe(true);
    });

    it('should return false for worse version', async () => {
      await modelVersioning.registerModelVersion('test-model', mockVersions[0]);

      const worseVersion = mockVersions[0];

      const isValid = await modelVersioning.validateVersion('test-model', worseVersion);
      expect(isValid).toBe(false);
    });
  });

  describe('setConfig', () => {
    it('should update configuration', async () => {
      const newConfig = {
        autoUpdate: false,
        versionCheckInterval: 2000,
        minAccuracyThreshold: 0.8,
        maxVersionsToKeep: 3,
      };

      modelVersioning.setConfig(newConfig);
      // Note: We can't directly test private config, but we can test its effects
      const lowAccuracyVersion = {
        ...mockVersions[0],
        metrics: { ...mockVersions[0].metrics, accuracy: 0.75 },
      };

      await expect(
        modelVersioning.registerModelVersion('test-model', lowAccuracyVersion)
      ).rejects.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle registration errors', async () => {
      const errorContext = {
        code: 'MODEL_VERSION_REGISTRATION_FAILED',
        message: 'Failed to register model version',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        timestamp: expect.any(Number),
        component: 'ModelVersioning',
        details: expect.any(Object),
      };

      await expect(
        modelVersioning.registerModelVersion('test-model', mockVersions[0])
      ).rejects.toThrow();

      expect(unifiedMonitor.reportError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining(errorContext)
      );
    });
  });
});
