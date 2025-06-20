import { BaseModel, ModelConfig, ModelPrediction } from './BaseModel.js';

class ARIMAModel extends BaseModel {
  constructor(config: ModelConfig) {
    super(config);
  }

  async predict(input: unknown): Promise<ModelPrediction> {
    return {
      modelName: this.config.name,
      probability: 0.7,
      confidence: 0.8,
      weight: this.config.weight || 1,
      features: input,
      metadata: {},
    };
  }

  async train(): Promise<void> {}

  async evaluate(): Promise<unknown> {
    return {};
  }

  async save(): Promise<void> {}

  async load(): Promise<void> {}
}

class ProphetModel extends BaseModel {
  constructor(config: ModelConfig) {
    super(config);
  }

  async predict(input: unknown): Promise<ModelPrediction> {
    return {
      modelName: this.config.name,
      probability: 0.75,
      confidence: 0.82,
      weight: this.config.weight || 1,
      features: input,
      metadata: {},
    };
  }

  async train(): Promise<void> {}

  async evaluate(): Promise<unknown> {
    return {};
  }

  async save(): Promise<void> {}

  async load(): Promise<void> {}
}

export { ARIMAModel, ProphetModel };
