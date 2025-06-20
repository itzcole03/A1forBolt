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
    hyperparameters: Record<string, string | number | boolean | null>;
  };
}

export class ModelVersioning {
  private static instance: ModelVersioning;
  private versions: Map<string, ModelVersion[]>;

  private constructor() {
    this.versions = new Map();
  }

  public static getInstance(): ModelVersioning {
    if (!ModelVersioning.instance) {
      ModelVersioning.instance = new ModelVersioning();
    }
    return ModelVersioning.instance;
  }

  public addVersion(modelId: string, version: ModelVersion): void {
    if (!this.versions.has(modelId)) {
      this.versions.set(modelId, []);
    }
    this.versions.get(modelId)!.push(version);
  }

  public getLatestVersion(modelId: string): ModelVersion | undefined {
    const versions = this.versions.get(modelId);
    if (!versions || versions.length === 0) return undefined;
    return versions[versions.length - 1];
  }

  public getVersion(modelId: string, versionId: string): ModelVersion | undefined {
    const versions = this.versions.get(modelId);
    if (!versions) return undefined;
    return versions.find(v => v.id === versionId);
  }

  public getAllVersions(modelId: string): ModelVersion[] {
    return this.versions.get(modelId) || [];
  }

  public rollbackToVersion(modelId: string, versionId: string): boolean {
    const versions = this.versions.get(modelId);
    if (!versions) return false;

    const targetIndex = versions.findIndex(v => v.id === versionId);
    if (targetIndex === -1) return false;

    this.versions.set(modelId, versions.slice(0, targetIndex + 1));
    return true;
  }

  public compareVersions(
    modelId: string,
    version1Id: string,
    version2Id: string
  ):
    | {
      version1: ModelVersion;
      version2: ModelVersion;
      differences: Record<string, { v1: string | number | boolean | string[] | number[] | null | undefined | Record<string, string | number | boolean | null>; v2: string | number | boolean | string[] | number[] | null | undefined | Record<string, string | number | boolean | null> }>;
    }
    | undefined {
    const versions = this.versions.get(modelId);
    if (!versions) return undefined;

    const v1 = versions.find(v => v.id === version1Id);
    const v2 = versions.find(v => v.id === version2Id);
    if (!v1 || !v2) return undefined;

    const differences: Record<string, { v1: string | number | boolean | string[] | number[] | null | undefined | Record<string, string | number | boolean | null>; v2: string | number | boolean | string[] | number[] | null | undefined | Record<string, string | number | boolean | null> }> = {};

    // Compare metrics
    Object.keys(v1.metrics).forEach(key => {
      if (
        v1.metrics[key as keyof typeof v1.metrics] !== v2.metrics[key as keyof typeof v2.metrics]
      ) {
        differences[`metrics.${key}`] = {
          v1: v1.metrics[key as keyof typeof v1.metrics],
          v2: v2.metrics[key as keyof typeof v2.metrics],
        };
      }
    });

    // Compare features
    if (JSON.stringify(v1.features) !== JSON.stringify(v2.features)) {
      differences.features = {
        v1: v1.features,
        v2: v2.features,
      };
    }

    // Compare metadata
    Object.keys(v1.metadata).forEach(key => {
      if (
        JSON.stringify(v1.metadata[key as keyof typeof v1.metadata]) !==
        JSON.stringify(v2.metadata[key as keyof typeof v2.metadata])
      ) {
        differences[`metadata.${key}`] = {
          v1: v1.metadata[key as keyof typeof v1.metadata],
          v2: v2.metadata[key as keyof typeof v2.metadata],
        };
      }
    });

    return {
      version1: v1,
      version2: v2,
      differences,
    };
  }
}
