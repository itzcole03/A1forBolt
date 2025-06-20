import { FeatureConfig, EngineeredFeatures, FeatureStoreConfig } from './types';
import { FeatureLogger } from './featureLogging';
import * as fs from 'fs';
import * as path from 'path';

export class FeatureStore {
  private readonly config: FeatureStoreConfig;
  private readonly logger: FeatureLogger;
  private readonly storePath: string;

  constructor(config: FeatureStoreConfig) {
    this.config = config;
    this.logger = new FeatureLogger();
    this.storePath = this.config.path || path.join(process.cwd(), 'feature-store');
    this.initializeStore();
  }

  private initializeStore(): void {
    try {
      if (!fs.existsSync(this.storePath)) {
        fs.mkdirSync(this.storePath, { recursive: true });
        this.logger.info(`Created feature store directory at ${this.storePath}`);
      }

      // Create subdirectories for different feature types
      const subdirs = ['numerical', 'categorical', 'temporal', 'derived', 'metadata'];
      for (const dir of subdirs) {
        const dirPath = path.join(this.storePath, dir);
        if (!fs.existsSync(dirPath)) {
          fs.mkdirSync(dirPath);
          this.logger.info(`Created subdirectory for ${dir} features`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to initialize feature store', error);
      throw error;
    }
  }

  public async saveFeatures(features: EngineeredFeatures, version: string): Promise<void> {
    try {
      const timestamp = new Date().toISOString();
      const versionDir = path.join(this.storePath, version);

      // Create version directory
      if (!fs.existsSync(versionDir)) {
        fs.mkdirSync(versionDir, { recursive: true });
      }

      // Save numerical features
      await this.saveFeatureType(
        features.numerical,
        path.join(versionDir, 'numerical'),
        'numerical'
      );

      // Save categorical features
      await this.saveFeatureType(
        features.categorical,
        path.join(versionDir, 'categorical'),
        'categorical'
      );

      // Save temporal features
      await this.saveFeatureType(features.temporal, path.join(versionDir, 'temporal'), 'temporal');

      // Save derived features
      await this.saveFeatureType(features.derived, path.join(versionDir, 'derived'), 'derived');

      // Save metadata
      await this.saveMetadata(features.metadata, versionDir);

      // Create version info file
      const versionInfo = {
        version,
        timestamp,
        featureCounts: {
          numerical: Object.keys(features.numerical).length,
          categorical: Object.keys(features.categorical).length,
          temporal: Object.keys(features.temporal).length,
          derived: Object.keys(features.derived).length,
        },
      };

      fs.writeFileSync(
        path.join(versionDir, 'version-info.json'),
        JSON.stringify(versionInfo, null, 2)
      );

      this.logger.info(`Saved features version ${version}`, versionInfo);
    } catch (error) {
      this.logger.error('Failed to save features', error);
      throw error;
    }
  }

  private async saveFeatureType(
    features: Record<string, any[]>,
    dirPath: string,
    type: string
  ): Promise<void> {
    try {
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      for (const [feature, values] of Object.entries(features)) {
        const filePath = path.join(dirPath, `${feature}.json`);
        fs.writeFileSync(filePath, JSON.stringify(values, null, 2));
      }

      this.logger.debug(`Saved ${type} features to ${dirPath}`);
    } catch (error) {
      this.logger.error(`Failed to save ${type} features`, error);
      throw error;
    }
  }

  private async saveMetadata(
    metadata: EngineeredFeatures['metadata'],
    versionDir: string
  ): Promise<void> {
    try {
      const metadataPath = path.join(versionDir, 'metadata.json');
      fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
      this.logger.debug('Saved feature metadata');
    } catch (error) {
      this.logger.error('Failed to save feature metadata', error);
      throw error;
    }
  }

  public async loadFeatures(version: string): Promise<EngineeredFeatures> {
    try {
      const versionDir = path.join(this.storePath, version);
      if (!fs.existsSync(versionDir)) {
        throw new Error(`Feature version ${version} not found`);
      }

      const features: EngineeredFeatures = {
        numerical: {},
        categorical: {},
        temporal: {},
        derived: {},
        metadata: {
          featureNames: [],
          featureTypes: {},
          scalingParams: {},
          encodingMaps: {},
          lastUpdated: new Date().toISOString(),
        },
      };

      // Load numerical features
      features.numerical = await this.loadFeatureType(
        path.join(versionDir, 'numerical'),
        'numerical'
      );

      // Load categorical features
      features.categorical = await this.loadFeatureType(
        path.join(versionDir, 'categorical'),
        'categorical'
      );

      // Load temporal features
      features.temporal = await this.loadFeatureType(path.join(versionDir, 'temporal'), 'temporal');

      // Load derived features
      features.derived = await this.loadFeatureType(path.join(versionDir, 'derived'), 'derived');

      // Load metadata
      features.metadata = await this.loadMetadata(versionDir);

      this.logger.info(`Loaded features version ${version}`);
      return features;
    } catch (error) {
      this.logger.error('Failed to load features', error);
      throw error;
    }
  }

  private async loadFeatureType(dirPath: string, type: string): Promise<Record<string, any[]>> {
    try {
      const features: Record<string, any[]> = {};
      const files = fs.readdirSync(dirPath);

      for (const file of files) {
        if (file.endsWith('.json')) {
          const feature = path.basename(file, '.json');
          const filePath = path.join(dirPath, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          features[feature] = JSON.parse(content);
        }
      }

      this.logger.debug(`Loaded ${type} features from ${dirPath}`);
      return features;
    } catch (error) {
      this.logger.error(`Failed to load ${type} features`, error);
      throw error;
    }
  }

  private async loadMetadata(versionDir: string): Promise<EngineeredFeatures['metadata']> {
    try {
      const metadataPath = path.join(versionDir, 'metadata.json');
      const content = fs.readFileSync(metadataPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Failed to load feature metadata', error);
      throw error;
    }
  }

  public async listVersions(): Promise<string[]> {
    try {
      const versions = fs
        .readdirSync(this.storePath)
        .filter(dir => fs.statSync(path.join(this.storePath, dir)).isDirectory())
        .filter(dir => fs.existsSync(path.join(this.storePath, dir, 'version-info.json')));

      return versions;
    } catch (error) {
      this.logger.error('Failed to list feature versions', error);
      throw error;
    }
  }

  public async getVersionInfo(version: string): Promise<any> {
    try {
      const versionInfoPath = path.join(this.storePath, version, 'version-info.json');
      if (!fs.existsSync(versionInfoPath)) {
        throw new Error(`Version info for ${version} not found`);
      }

      const content = fs.readFileSync(versionInfoPath, 'utf-8');
      return JSON.parse(content);
    } catch (error) {
      this.logger.error('Failed to get version info', error);
      throw error;
    }
  }

  public async deleteVersion(version: string): Promise<void> {
    try {
      const versionDir = path.join(this.storePath, version);
      if (!fs.existsSync(versionDir)) {
        throw new Error(`Feature version ${version} not found`);
      }

      fs.rmSync(versionDir, { recursive: true, force: true });
      this.logger.info(`Deleted feature version ${version}`);
    } catch (error) {
      this.logger.error('Failed to delete feature version', error);
      throw error;
    }
  }

  public async cleanupOldVersions(maxVersions: number): Promise<void> {
    try {
      const versions = await this.listVersions();
      if (versions.length <= maxVersions) {
        return;
      }

      // Sort versions by timestamp
      const versionInfos = await Promise.all(
        versions.map(async version => ({
          version,
          info: await this.getVersionInfo(version),
        }))
      );

      versionInfos.sort(
        (a, b) => new Date(b.info.timestamp).getTime() - new Date(a.info.timestamp).getTime()
      );

      // Delete oldest versions
      const versionsToDelete = versionInfos.slice(maxVersions);
      for (const { version } of versionsToDelete) {
        await this.deleteVersion(version);
      }

      this.logger.info(`Cleaned up ${versionsToDelete.length} old feature versions`);
    } catch (error) {
      this.logger.error('Failed to cleanup old versions', error);
      throw error;
    }
  }
}
