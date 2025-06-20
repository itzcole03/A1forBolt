import { EventBus } from './EventBus';
import { unifiedMonitor } from './UnifiedMonitor';
import { SystemError, ErrorCategory, ErrorSeverity, ErrorContext } from './UnifiedError';
import { EventMap } from '../types/core';

export interface ModelVersion {
  id: string;
  version: string;
  timestamp: number;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1Score: number;
  };
  features: string[];
  metadata: {
    trainingDataSize: number;
    trainingDuration: number;
    framework: string;
    hyperparameters: Record<string, any>;
  };
}

export interface ModelVersionConfig {
  autoUpdate: boolean;
  versionCheckInterval: number;
  minAccuracyThreshold: number;
  maxVersionsToKeep: number;
}

export class ModelVersioning {
  private static instance: ModelVersioning;
  private versions: Map<string, ModelVersion[]> = new Map();
  private config: ModelVersionConfig;
  private eventBus: EventBus;
  private versionCheckInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.config = {
      autoUpdate: true,
      versionCheckInterval: 1000 * 60 * 60, // 1 hour
      minAccuracyThreshold: 0.7,
      maxVersionsToKeep: 5,
    };
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(): ModelVersioning {
    if (!ModelVersioning.instance) {
      ModelVersioning.instance = new ModelVersioning();
    }
    return ModelVersioning.instance;
  }

  private setupEventListeners(): void {
    this.eventBus.subscribe('model:update', (data: EventMap['model:update']) => {
      this.handleModelUpdate(data.modelId, data.version);
    });
  }

  public async registerModelVersion(modelId: string, version: ModelVersion): Promise<void> {
    try {
      if (!this.versions.has(modelId)) {
        this.versions.set(modelId, []);
      }

      const modelVersions = this.versions.get(modelId)!;

      // Validate version metrics
      if (version.metrics.accuracy < this.config.minAccuracyThreshold) {
        const errorContext: Partial<ErrorContext> = {
          code: 'MODEL_VERSION_REJECTED',
          message: 'Model version does not meet minimum accuracy threshold',
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          timestamp: Date.now(),
          component: 'ModelVersioning',
          details: {
            modelId,
            version: version.version,
            accuracy: version.metrics.accuracy,
            threshold: this.config.minAccuracyThreshold,
          },
        };
        throw new SystemError('MODEL_VERSION_REJECTED', errorContext);
      }

      // Add new version
      modelVersions.push(version);

      // Sort versions by timestamp
      modelVersions.sort((a, b) => b.timestamp - a.timestamp);

      // Keep only the latest versions
      if (modelVersions.length > this.config.maxVersionsToKeep) {
        modelVersions.splice(this.config.maxVersionsToKeep);
      }

      // Emit version update event
      this.eventBus.emit('model:version:updated', {
        modelId,
        version,
        totalVersions: modelVersions.length,
      });

      // Record metrics
      unifiedMonitor.recordMetric('model_version_registered', 1);
      unifiedMonitor.recordMetric('model_accuracy', version.metrics.accuracy);
    } catch (error) {
      const errorContext: Partial<ErrorContext> = {
        code: 'MODEL_VERSION_REGISTRATION_FAILED',
        message: 'Failed to register model version',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.HIGH,
        timestamp: Date.now(),
        component: 'ModelVersioning',
        details: { modelId, version },
      };
      unifiedMonitor.reportError(error as Error, errorContext);
      throw error;
    }
  }

  public getLatestVersion(modelId: string): ModelVersion | null {
    const versions = this.versions.get(modelId);
    return versions && versions.length > 0 ? versions[0] : null;
  }

  public getVersionHistory(modelId: string): ModelVersion[] {
    return this.versions.get(modelId) || [];
  }

  public async validateVersion(modelId: string, version: ModelVersion): Promise<boolean> {
    try {
      const latestVersion = this.getLatestVersion(modelId);

      if (!latestVersion) {
        return true; // First version is always valid
      }

      // Check if new version is better than current
      const isBetter = version.metrics.accuracy > latestVersion.metrics.accuracy;

      if (!isBetter) {
        unifiedMonitor.recordMetric('model_version_rejected', 1);
      }

      return isBetter;
    } catch (error) {
      const errorContext: Partial<ErrorContext> = {
        code: 'MODEL_VERSION_VALIDATION_FAILED',
        message: 'Failed to validate model version',
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.MEDIUM,
        timestamp: Date.now(),
        component: 'ModelVersioning',
        details: { modelId, version },
      };
      unifiedMonitor.reportError(error as Error, errorContext);
      return false;
    }
  }

  public setConfig(config: Partial<ModelVersionConfig>): void {
    this.config = { ...this.config, ...config };

    // Update version check interval if changed
    if (config.versionCheckInterval) {
      if (this.versionCheckInterval) {
        clearInterval(this.versionCheckInterval);
      }
      this.startVersionChecking();
    }
  }

  private startVersionChecking(): void {
    if (this.config.autoUpdate) {
      this.versionCheckInterval = setInterval(() => {
        this.checkForUpdates();
      }, this.config.versionCheckInterval);
    }
  }

  private async checkForUpdates(): Promise<void> {
    try {
      for (const [modelId, versions] of Array.from(this.versions.entries())) {
        const latestVersion = versions[0];
        if (latestVersion) {
          // Emit check event
          this.eventBus.emit('model:version:check', {
            modelId,
            currentVersion: latestVersion,
          });
        }
      }
    } catch (error) {
      const errorContext: Partial<ErrorContext> = {
        code: 'MODEL_VERSION_CHECK_FAILED',
        message: 'Failed to check for model updates',
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.LOW,
        timestamp: Date.now(),
        component: 'ModelVersioning',
      };
      unifiedMonitor.reportError(error as Error, errorContext);
    }
  }

  private handleModelUpdate(modelId: string, version: ModelVersion): void {
    this.registerModelVersion(modelId, version).catch(error => {
      console.error(`Failed to handle model update for ${modelId}:`, error);
    });
  }

  public async rollbackToVersion(modelId: string, targetVersion: string): Promise<void> {
    try {
      const versions = this.versions.get(modelId);
      if (!versions) {
        throw new SystemError('MODEL_NOT_FOUND', {
          code: 'MODEL_NOT_FOUND',
          message: `Model ${modelId} not found`,
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.HIGH,
          timestamp: Date.now(),
          component: 'ModelVersioning',
        });
      }

      const targetVersionIndex = versions.findIndex(v => v.version === targetVersion);
      if (targetVersionIndex === -1) {
        throw new SystemError('VERSION_NOT_FOUND', {
          code: 'VERSION_NOT_FOUND',
          message: `Version ${targetVersion} not found for model ${modelId}`,
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.HIGH,
          timestamp: Date.now(),
          component: 'ModelVersioning',
        });
      }

      // Remove all versions after the target version
      const rolledBackVersions = versions.slice(targetVersionIndex);
      this.versions.set(modelId, rolledBackVersions);

      // Emit rollback event
      this.eventBus.emit('model:version:rolled_back', {
        modelId,
        targetVersion,
        remainingVersions: rolledBackVersions.length,
        timestamp: Date.now(),
      });

      // Record metrics
      unifiedMonitor.recordMetric('model_version_rollback', 1);
      unifiedMonitor.recordMetric('model_versions_after_rollback', rolledBackVersions.length);
    } catch (error) {
      unifiedMonitor.reportError(error as Error, {
        component: 'ModelVersioning',
        context: { modelId, targetVersion },
      });
      throw error;
    }
  }

  public async compareVersions(
    modelId: string,
    version1: string,
    version2: string
  ): Promise<{
    differences: {
      metrics: Record<string, { v1: number; v2: number; diff: number }>;
      features: { added: string[]; removed: string[]; modified: string[] };
      metadata: Record<string, { v1: any; v2: any }>;
    };
    timestamp: number;
  }> {
    try {
      const versions = this.versions.get(modelId);
      if (!versions) {
        throw new SystemError('MODEL_NOT_FOUND', {
          code: 'MODEL_NOT_FOUND',
          message: `Model ${modelId} not found`,
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.HIGH,
          timestamp: Date.now(),
          component: 'ModelVersioning',
        });
      }

      const v1 = versions.find(v => v.version === version1);
      const v2 = versions.find(v => v.version === version2);

      if (!v1 || !v2) {
        throw new SystemError('VERSION_NOT_FOUND', {
          code: 'VERSION_NOT_FOUND',
          message: `One or both versions not found for model ${modelId}`,
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.HIGH,
          timestamp: Date.now(),
          component: 'ModelVersioning',
        });
      }

      // Compare metrics
      const metricDiffs: Record<string, { v1: number; v2: number; diff: number }> = {};
      const metricKeys = ['accuracy', 'precision', 'recall', 'f1Score'] as const;
      metricKeys.forEach(metric => {
        metricDiffs[metric] = {
          v1: v1.metrics[metric],
          v2: v2.metrics[metric],
          diff: v2.metrics[metric] - v1.metrics[metric],
        };
      });

      // Compare features
      const features = {
        added: v2.features.filter(f => !v1.features.includes(f)),
        removed: v1.features.filter(f => !v2.features.includes(f)),
        modified: v1.features.filter(f => v2.features.includes(f)),
      };

      // Compare metadata
      const metadataDiffs: Record<string, { v1: any; v2: any }> = {};
      const metadataKeys = [
        'trainingDataSize',
        'trainingDuration',
        'framework',
        'hyperparameters',
      ] as const;
      metadataKeys.forEach(key => {
        if (JSON.stringify(v1.metadata[key]) !== JSON.stringify(v2.metadata[key])) {
          metadataDiffs[key] = {
            v1: v1.metadata[key],
            v2: v2.metadata[key],
          };
        }
      });

      // Emit comparison event
      this.eventBus.emit('model:version:compared', {
        modelId,
        version1,
        version2,
        timestamp: Date.now(),
      });

      return {
        differences: {
          metrics: metricDiffs,
          features,
          metadata: metadataDiffs,
        },
        timestamp: Date.now(),
      };
    } catch (error) {
      unifiedMonitor.reportError(error as Error, {
        component: 'ModelVersioning',
        context: { modelId, version1, version2 },
      });
      throw error;
    }
  }
}

export const modelVersioning = ModelVersioning.getInstance();
