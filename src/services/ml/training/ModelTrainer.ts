import { BaseModel, TrainingConfig, ModelMetrics } from '../models/BaseModel';
import { EventEmitter } from 'events';
import * as tf from '@tensorflow/tfjs-node';

export interface TrainingProgress {
  epoch: number;
  totalEpochs: number;
  metrics: ModelMetrics;
  validationMetrics?: ModelMetrics;
}

export class ModelTrainer extends EventEmitter {
  private static instance: ModelTrainer;
  private trainingQueue: Map<string, Promise<void>> = new Map();
  private validationData: Map<string, any> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): ModelTrainer {
    if (!ModelTrainer.instance) {
      ModelTrainer.instance = new ModelTrainer();
    }
    return ModelTrainer.instance;
  }

  public async train(model: BaseModel, config: TrainingConfig): Promise<void> {
    const modelId = model.config.name;

    if (this.trainingQueue.has(modelId)) {
      throw new Error(`Model ${modelId} is already training`);
    }

    try {
      // Preprocess data
      const processedData = await this.preprocessData(config.data);

      // Split validation data if needed
      if (config.validationSplit) {
        const { trainData, validationData } = this.splitData(processedData, config.validationSplit);
        this.validationData.set(modelId, validationData);
        config.data = trainData;
      }

      // Start training
      const trainingPromise = this.executeTraining(model, config);
      this.trainingQueue.set(modelId, trainingPromise);

      await trainingPromise;

      // Post-training steps
      await this.postTraining(model);
    } catch (error) {
      this.emit('trainingError', { modelId, error });
      throw error;
    } finally {
      this.trainingQueue.delete(modelId);
      this.validationData.delete(modelId);
    }
  }

  private async executeTraining(model: BaseModel, config: TrainingConfig): Promise<void> {
    const modelId = model.config.name;
    const epochs = config.epochs || model.config.trainingConfig.epochs || 100;
    const batchSize = config.batchSize || model.config.trainingConfig.batchSize || 32;

    for (let epoch = 0; epoch < epochs; epoch++) {
      const startTime = Date.now();

      // Train on batch
      await model.train({
        ...config,
        batchSize,
        epochs: 1,
      });

      // Calculate metrics
      const metrics = await this.calculateMetrics(model, config.data);

      // Validate if validation data exists
      let validationMetrics;
      if (this.validationData.has(modelId)) {
        validationMetrics = await this.calculateMetrics(model, this.validationData.get(modelId));
      }

      // Emit progress
      this.emit('trainingProgress', {
        modelId,
        progress: {
          epoch: epoch + 1,
          totalEpochs: epochs,
          metrics,
          validationMetrics,
        },
      });

      // Check early stopping
      if (this.shouldStopEarly(model, validationMetrics)) {
        this.emit('earlyStopping', { modelId, epoch });
        break;
      }

      // Throttle training if needed
      const trainingTime = Date.now() - startTime;
      if (trainingTime < 100) {
        // Minimum 100ms between epochs
        await new Promise(resolve => setTimeout(resolve, 100 - trainingTime));
      }
    }
  }

  private async preprocessData(data: any): Promise<any> {
    // Implement common preprocessing steps
    return data;
  }

  private splitData(
    data: any,
    validationSplit: number
  ): {
    trainData: any;
    validationData: any;
  } {
    // Implement data splitting logic
    const splitIndex = Math.floor(data.length * (1 - validationSplit));
    return {
      trainData: data.slice(0, splitIndex),
      validationData: data.slice(splitIndex),
    };
  }

  private async calculateMetrics(model: BaseModel, data: any): Promise<ModelMetrics> {
    return model.evaluate(data);
  }

  private shouldStopEarly(model: BaseModel, validationMetrics?: ModelMetrics): boolean {
    if (!model.config.trainingConfig.earlyStopping || !validationMetrics) {
      return false;
    }

    // Implement early stopping logic based on validation metrics
    return false;
  }

  private async postTraining(model: BaseModel): Promise<void> {
    // Implement post-training steps like model calibration
    this.emit('trainingComplete', { modelId: model.config.name });
  }

  public isTraining(modelId: string): boolean {
    return this.trainingQueue.has(modelId);
  }

  public async cancelTraining(modelId: string): Promise<void> {
    const trainingPromise = this.trainingQueue.get(modelId);
    if (trainingPromise) {
      // Implement cancellation logic
      this.trainingQueue.delete(modelId);
      this.emit('trainingCancelled', { modelId });
    }
  }
}
