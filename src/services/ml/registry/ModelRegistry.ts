import { BaseModel } from '../models/BaseModel';
import { ModelConfig, ModelMetrics, ModelType } from '../types';
import { EventEmitter } from 'events';

export class ModelRegistry extends EventEmitter {
  private static instance: ModelRegistry;
  private models: Map<string, BaseModel> = new Map();
  private modelMetrics: Map<string, ModelMetrics> = new Map();
  private modelWeights: Map<string, number> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): ModelRegistry {
    if (!ModelRegistry.instance) {
      ModelRegistry.instance = new ModelRegistry();
    }
    return ModelRegistry.instance;
  }

  public registerModel(model: BaseModel): void {
    const config = model.getConfig();
    this.models.set(config.name, model);
    this.modelMetrics.set(config.name, {});
    this.modelWeights.set(config.name, 1.0);
    this.emit('modelRegistered', config.name);
  }

  public unregisterModel(modelName: string): void {
    this.models.delete(modelName);
    this.modelMetrics.delete(modelName);
    this.modelWeights.delete(modelName);
    this.emit('modelUnregistered', modelName);
  }

  public getModel(modelName: string): BaseModel | undefined {
    return this.models.get(modelName);
  }

  public getModelsByType(type: ModelType): BaseModel[] {
    return Array.from(this.models.values()).filter(model => model.getType() === type);
  }

  public getAllModels(): BaseModel[] {
    return Array.from(this.models.values());
  }

  public updateModelMetrics(modelName: string, metrics: ModelMetrics): void {
    this.modelMetrics.set(modelName, metrics);
    this.emit('metricsUpdated', modelName, metrics);
  }

  public getModelMetrics(modelName: string): ModelMetrics | undefined {
    return this.modelMetrics.get(modelName);
  }

  public updateModelWeights(): void {
    let totalAccuracy = 0;
    let modelCount = 0;

    // Calculate total accuracy
    for (const [name, metrics] of this.modelMetrics.entries()) {
      if (metrics.accuracy !== undefined) {
        totalAccuracy += metrics.accuracy;
        modelCount++;
      }
    }

    if (modelCount === 0) return;

    const averageAccuracy = totalAccuracy / modelCount;

    // Update weights based on relative accuracy
    for (const [name, metrics] of this.modelMetrics.entries()) {
      if (metrics.accuracy !== undefined) {
        const weight = metrics.accuracy / averageAccuracy;
        this.modelWeights.set(name, weight);
      }
    }

    this.emit('weightsUpdated', Object.fromEntries(this.modelWeights));
  }

  public getModelWeight(modelName: string): number {
    return this.modelWeights.get(modelName) || 1.0;
  }

  public async trainAllModels(data: any): Promise<void> {
    const trainingPromises = Array.from(this.models.values()).map(model => model.train(data));
    await Promise.all(trainingPromises);
    this.emit('allModelsTrained');
  }

  public async evaluateAllModels(data: any): Promise<void> {
    const evaluationPromises = Array.from(this.models.values()).map(async model => {
      const metrics = await model.evaluate(data);
      this.updateModelMetrics(model.getName(), metrics);
    });
    await Promise.all(evaluationPromises);
    this.updateModelWeights();
    this.emit('allModelsEvaluated');
  }

  public async saveAllModels(basePath: string): Promise<void> {
    const savePromises = Array.from(this.models.values()).map(model =>
      model.save(`${basePath}/${model.getName()}`)
    );
    await Promise.all(savePromises);
    this.emit('allModelsSaved');
  }

  public async loadAllModels(basePath: string): Promise<void> {
    const loadPromises = Array.from(this.models.values()).map(model =>
      model.load(`${basePath}/${model.getName()}`)
    );
    await Promise.all(loadPromises);
    this.emit('allModelsLoaded');
  }
}
