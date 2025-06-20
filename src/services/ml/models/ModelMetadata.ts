export interface ModelMetadata {
  name: string;
  description: string;
  author: string;
  tags: string[];
  parameters: Record<string, any>;
  dependencies: string[];
  framework: string;
  architecture: string;
  trainingConfig: {
    epochs: number;
    batchSize: number;
    learningRate: number;
    optimizer: string;
    lossFunction: string;
    validationSplit: number;
    earlyStopping: boolean;
    earlyStoppingPatience: number;
  };
  dataConfig: {
    features: string[];
    target: string;
    preprocessing: string[];
    augmentation: string[];
    validationStrategy: string;
  };
  performanceConfig: {
    metrics: string[];
    thresholds: Record<string, number>;
    evaluationStrategy: string;
  };
  deploymentConfig: {
    environment: string;
    resources: {
      cpu: number;
      memory: number;
      gpu: boolean;
    };
    scaling: {
      minInstances: number;
      maxInstances: number;
      targetUtilization: number;
    };
  };
}

export class ModelMetadataManager {
  private metadata: ModelMetadata;

  constructor(metadata: ModelMetadata) {
    this.metadata = metadata;
  }

  public getMetadata(): ModelMetadata {
    return this.metadata;
  }

  public updateMetadata(updates: Partial<ModelMetadata>): void {
    this.metadata = {
      ...this.metadata,
      ...updates,
    };
  }

  public addTag(tag: string): void {
    if (!this.metadata.tags.includes(tag)) {
      this.metadata.tags.push(tag);
    }
  }

  public removeTag(tag: string): void {
    this.metadata.tags = this.metadata.tags.filter(t => t !== tag);
  }

  public updateParameter(key: string, value: any): void {
    this.metadata.parameters[key] = value;
  }

  public removeParameter(key: string): void {
    delete this.metadata.parameters[key];
  }

  public addDependency(dependency: string): void {
    if (!this.metadata.dependencies.includes(dependency)) {
      this.metadata.dependencies.push(dependency);
    }
  }

  public removeDependency(dependency: string): void {
    this.metadata.dependencies = this.metadata.dependencies.filter(d => d !== dependency);
  }

  public toJSON(): string {
    return JSON.stringify(this.metadata, null, 2);
  }

  public static fromJSON(json: string): ModelMetadataManager {
    const metadata = JSON.parse(json) as ModelMetadata;
    return new ModelMetadataManager(metadata);
  }
}
