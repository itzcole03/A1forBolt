import { ModelMetadata } from './ModelMetadata';
import { ModelMetrics } from '../types/ModelMetrics';

export class ModelVersion {
  private readonly major: number;
  private readonly minor: number;
  private readonly patch: number;
  private readonly metadata: ModelMetadata;
  private readonly metrics: ModelMetrics;
  private readonly createdAt: Date;
  private readonly updatedAt: Date;

  constructor(
    major: number,
    minor: number,
    patch: number,
    metadata: ModelMetadata,
    metrics: ModelMetrics
  ) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.metadata = metadata;
    this.metrics = metrics;
    this.createdAt = new Date();
    this.updatedAt = new Date();
  }

  public getVersion(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }

  public getMetadata(): ModelMetadata {
    return this.metadata;
  }

  public getMetrics(): ModelMetrics {
    return this.metrics;
  }

  public getCreatedAt(): Date {
    return this.createdAt;
  }

  public getUpdatedAt(): Date {
    return this.updatedAt;
  }

  public isCompatible(other: ModelVersion): boolean {
    return this.major === other.major;
  }

  public isNewerThan(other: ModelVersion): boolean {
    if (this.major !== other.major) return this.major > other.major;
    if (this.minor !== other.minor) return this.minor > other.minor;
    return this.patch > other.patch;
  }

  public incrementPatch(): ModelVersion {
    return new ModelVersion(this.major, this.minor, this.patch + 1, this.metadata, this.metrics);
  }

  public incrementMinor(): ModelVersion {
    return new ModelVersion(this.major, this.minor + 1, 0, this.metadata, this.metrics);
  }

  public incrementMajor(): ModelVersion {
    return new ModelVersion(this.major + 1, 0, 0, this.metadata, this.metrics);
  }

  public toJSON(): object {
    return {
      version: this.getVersion(),
      metadata: this.metadata,
      metrics: this.metrics,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }

  public static fromJSON(json: any): ModelVersion {
    return new ModelVersion(
      json.version.split('.')[0],
      json.version.split('.')[1],
      json.version.split('.')[2],
      json.metadata,
      json.metrics
    );
  }
}
