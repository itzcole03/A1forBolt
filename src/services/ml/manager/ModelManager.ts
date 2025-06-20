import { ModelFactory } from '../factory/ModelFactory';
import { ModelConfig } from '../models/BaseModel';
import { AdvancedEnsembleConfig } from '../models/AdvancedEnsembleModel';
import {
  createModelConfig,
  validateModelConfig,
  validateRegularModelConfig,
} from '../config/modelConfig';
import { ModelRegistry, ModelType } from '../registry/ModelRegistry';

export class ModelManager {
  private static instance: ModelManager;
  private modelFactory: ModelFactory;
  private modelRegistry: ModelRegistry;
  private activeModels: Set<string> = new Set();
  private modelMetrics: Map<string, any> = new Map();

  private constructor() {
    this.modelFactory = ModelFactory.getInstance();
    this.modelRegistry = ModelRegistry.getInstance();
  }

  static getInstance(): ModelManager {
    if (!ModelManager.instance) {
      ModelManager.instance = new ModelManager();
    }
    return ModelManager.instance;
  }

  async initializeModel(
    modelId: string,
    type: ModelType,
    config?: Partial<ModelConfig | AdvancedEnsembleConfig>
  ): Promise<void> {
    try {
      // Get default configuration from registry
      const defaultConfig = this.modelRegistry.getDefaultConfig(type);

      // Merge with provided config if any
      const finalConfig = config ? { ...defaultConfig, ...config } : defaultConfig;

      // Validate configuration based on model type
      if (type === 'ensemble') {
        validateModelConfig(finalConfig as AdvancedEnsembleConfig);
      } else {
        validateRegularModelConfig(finalConfig as ModelConfig);
      }

      // Create model using factory
      await this.modelFactory.createModel(finalConfig, modelId);
      this.activeModels.add(modelId);

      console.log(`Model ${modelId} initialized successfully`);
    } catch (error) {
      console.error(`Failed to initialize model ${modelId}:`, error);
      throw error;
    }
  }

  async trainModel(modelId: string, data: any): Promise<void> {
    if (!this.activeModels.has(modelId)) {
      throw new Error(`Model ${modelId} is not active`);
    }

    try {
      await this.modelFactory.trainModel(modelId, data);
      console.log(`Model ${modelId} trained successfully`);
    } catch (error) {
      console.error(`Failed to train model ${modelId}:`, error);
      throw error;
    }
  }

  async predict(modelId: string, input: any): Promise<any> {
    if (!this.activeModels.has(modelId)) {
      throw new Error(`Model ${modelId} is not active`);
    }

    try {
      return await this.modelFactory.predict(modelId, input);
    } catch (error) {
      console.error(`Failed to get prediction from model ${modelId}:`, error);
      throw error;
    }
  }

  async evaluateModel(modelId: string, data: any): Promise<any> {
    if (!this.activeModels.has(modelId)) {
      throw new Error(`Model ${modelId} is not active`);
    }

    try {
      const metrics = await this.modelFactory.evaluateModel(modelId, data);
      this.modelMetrics.set(modelId, metrics);
      return metrics;
    } catch (error) {
      console.error(`Failed to evaluate model ${modelId}:`, error);
      throw error;
    }
  }

  async updateModel(modelId: string, update: any): Promise<void> {
    if (!this.activeModels.has(modelId)) {
      throw new Error(`Model ${modelId} is not active`);
    }

    try {
      await this.modelFactory.updateModel(modelId, update);
      console.log(`Model ${modelId} updated successfully`);
    } catch (error) {
      console.error(`Failed to update model ${modelId}:`, error);
      throw error;
    }
  }

  async saveModel(modelId: string, path: string): Promise<void> {
    if (!this.activeModels.has(modelId)) {
      throw new Error(`Model ${modelId} is not active`);
    }

    try {
      await this.modelFactory.saveModel(modelId, path);
      console.log(`Model ${modelId} saved successfully to ${path}`);
    } catch (error) {
      console.error(`Failed to save model ${modelId}:`, error);
      throw error;
    }
  }

  async loadModel(modelId: string, path: string): Promise<void> {
    try {
      await this.modelFactory.loadModel(modelId, path);
      this.activeModels.add(modelId);
      console.log(`Model ${modelId} loaded successfully from ${path}`);
    } catch (error) {
      console.error(`Failed to load model ${modelId}:`, error);
      throw error;
    }
  }

  deactivateModel(modelId: string): void {
    if (!this.activeModels.has(modelId)) {
      throw new Error(`Model ${modelId} is not active`);
    }

    this.activeModels.delete(modelId);
    this.modelMetrics.delete(modelId);
    console.log(`Model ${modelId} deactivated`);
  }

  getActiveModels(): string[] {
    return Array.from(this.activeModels);
  }

  getModelMetrics(modelId: string): any {
    if (!this.activeModels.has(modelId)) {
      throw new Error(`Model ${modelId} is not active`);
    }

    return this.modelMetrics.get(modelId);
  }

  isModelActive(modelId: string): boolean {
    return this.activeModels.has(modelId);
  }

  getModelInfo(modelId: string): any {
    if (!this.activeModels.has(modelId)) {
      throw new Error(`Model ${modelId} is not active`);
    }

    return this.modelFactory.getModelInfo(modelId);
  }

  isModelTrained(modelId: string): boolean {
    if (!this.activeModels.has(modelId)) {
      throw new Error(`Model ${modelId} is not active`);
    }

    return this.modelFactory.isModelTrained(modelId);
  }

  getAvailableModelTypes(): ModelType[] {
    return this.modelRegistry.getAvailableModelTypes();
  }

  getModelTypeInfo(type: ModelType): any {
    return this.modelRegistry.getModelTypeInfo(type);
  }
}
