import { ModelManager } from '../manager/ModelManager';
import { ModelConfig } from '../models/BaseModel';
import { AdvancedEnsembleConfig } from '../models/AdvancedEnsembleModel';
import { ModelType } from '../registry/ModelRegistry';

export class ModelService {
  private static instance: ModelService;
  private modelManager: ModelManager;

  private constructor() {
    this.modelManager = ModelManager.getInstance();
  }

  static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  async createModel(
    modelId: string,
    type: ModelType,
    config?: Partial<ModelConfig | AdvancedEnsembleConfig>
  ): Promise<void> {
    await this.modelManager.initializeModel(modelId, type, config);
  }

  async trainModel(modelId: string, data: any): Promise<void> {
    await this.modelManager.trainModel(modelId, data);
  }

  async predict(modelId: string, input: any): Promise<any> {
    return await this.modelManager.predict(modelId, input);
  }

  async evaluateModel(modelId: string, data: any): Promise<any> {
    return await this.modelManager.evaluateModel(modelId, data);
  }

  async updateModel(modelId: string, update: any): Promise<void> {
    await this.modelManager.updateModel(modelId, update);
  }

  async saveModel(modelId: string, path: string): Promise<void> {
    await this.modelManager.saveModel(modelId, path);
  }

  async loadModel(modelId: string, path: string): Promise<void> {
    await this.modelManager.loadModel(modelId, path);
  }

  deactivateModel(modelId: string): void {
    this.modelManager.deactivateModel(modelId);
  }

  getActiveModels(): string[] {
    return this.modelManager.getActiveModels();
  }

  getModelMetrics(modelId: string): any {
    return this.modelManager.getModelMetrics(modelId);
  }

  isModelActive(modelId: string): boolean {
    return this.modelManager.isModelActive(modelId);
  }

  getModelInfo(modelId: string): any {
    return this.modelManager.getModelInfo(modelId);
  }

  isModelTrained(modelId: string): boolean {
    return this.modelManager.isModelTrained(modelId);
  }

  getAvailableModelTypes(): ModelType[] {
    return this.modelManager.getAvailableModelTypes();
  }

  getModelTypeInfo(type: ModelType): any {
    return this.modelManager.getModelTypeInfo(type);
  }
}
