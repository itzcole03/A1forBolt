import { BaseModel } from '../models/BaseModel';
// Minimal browser-compatible EventEmitter
class EventEmitter {
  private listeners: { [event: string]: Function[] } = {};
  on(event: string, fn: Function) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(fn);
  }
  off(event: string, fn: Function) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(f => f !== fn);
  }
  emit(event: string, ...args: any[]) {
    (this.listeners[event] || []).forEach(fn => fn(...args));
  }
}
// import * as tf from '@tensorflow/tfjs-node'; // Disabled for browser compatibility

interface ResourceAllocation {
  modelId: string;
  gpuMemory: number;
  cpuMemory: number;
  startTime: number;
}

export class ResourceManager extends EventEmitter {
  private static instance: ResourceManager;
  private allocations: Map<string, ResourceAllocation> = new Map();
  private totalGPUMemory: number = 0;
  private totalCPUMemory: number = 0;
  private gpuMemoryLimit: number = 0;
  private cpuMemoryLimit: number = 0;

  private constructor() {
    super();
    this.initializeResources();
  }

  public static getInstance(): ResourceManager {
    if (!ResourceManager.instance) {
      ResourceManager.instance = new ResourceManager();
    }
    return ResourceManager.instance;
  }

  private async initializeResources(): Promise<void> {
    try {
      // GPU/CPU info collection disabled for browser build
      this.totalGPUMemory = 0;
      this.gpuMemoryLimit = 0;
      this.totalCPUMemory = 0;
      this.cpuMemoryLimit = 0;
    } catch (error) {
      console.error('Failed to initialize resources:', error);
      // Fallback to conservative limits
      this.totalGPUMemory = 4 * 1024 * 1024 * 1024; // 4GB
      this.gpuMemoryLimit = this.totalGPUMemory * 0.5;
      this.totalCPUMemory = 8 * 1024 * 1024 * 1024; // 8GB
      this.cpuMemoryLimit = this.totalCPUMemory * 0.5;
    }
  }

  public async allocateResources(model: BaseModel): Promise<void> {
    const modelId = model.config.name;

    if (this.allocations.has(modelId)) {
      throw new Error(`Resources already allocated for model ${modelId}`);
    }

    try {
      // Get model resource requirements
      const requirements = await this.getModelRequirements(model);

      // Check if resources are available
      await this.checkResourceAvailability(requirements);

      // Allocate resources
      this.allocations.set(modelId, {
        modelId,
        gpuMemory: requirements.gpuMemory,
        cpuMemory: requirements.cpuMemory,
        startTime: Date.now(),
      });

      this.emit('resourcesAllocated', {
        modelId,
        allocation: this.allocations.get(modelId),
      });
    } catch (error) {
      this.emit('allocationError', { modelId, error });
      throw error;
    }
  }

  public async releaseResources(modelId: string): Promise<void> {
    const allocation = this.allocations.get(modelId);
    if (allocation) {
      this.allocations.delete(modelId);
      this.emit('resourcesReleased', { modelId, allocation });
    }
  }

  private async getModelRequirements(model: BaseModel): Promise<{
    gpuMemory: number;
    cpuMemory: number;
  }> {
    // Estimate resource requirements based on model type and configuration
    const baseMemory = 100 * 1024 * 1024; // 100MB base memory

    let gpuMemory = baseMemory;
    let cpuMemory = baseMemory;

    switch (model.config.type) {
      case 'deepLearning':
        gpuMemory *= 4; // Deep learning models need more GPU memory
        break;
      case 'timeSeries':
        cpuMemory *= 2; // Time series models need more CPU memory
        break;
      case 'optimization':
        cpuMemory *= 3; // Optimization models need more CPU memory
        break;
    }

    return { gpuMemory, cpuMemory };
  }

  private async checkResourceAvailability(requirements: {
    gpuMemory: number;
    cpuMemory: number;
  }): Promise<void> {
    const currentGPUUsage = this.getCurrentGPUUsage();
    const currentCPUUsage = this.getCurrentCPUUsage();

    if (currentGPUUsage + requirements.gpuMemory > this.gpuMemoryLimit) {
      throw new Error('Insufficient GPU memory available');
    }

    if (currentCPUUsage + requirements.cpuMemory > this.cpuMemoryLimit) {
      throw new Error('Insufficient CPU memory available');
    }
  }

  private getCurrentGPUUsage(): number {
    return Array.from(this.allocations.values()).reduce(
      (total, allocation) => total + allocation.gpuMemory,
      0
    );
  }

  private getCurrentCPUUsage(): number {
    return Array.from(this.allocations.values()).reduce(
      (total, allocation) => total + allocation.cpuMemory,
      0
    );
  }

  public getResourceUtilization(): {
    gpu: { used: number; total: number; percentage: number };
    cpu: { used: number; total: number; percentage: number };
  } {
    const gpuUsed = this.getCurrentGPUUsage();
    const cpuUsed = this.getCurrentCPUUsage();

    return {
      gpu: {
        used: gpuUsed,
        total: this.totalGPUMemory,
        percentage: (gpuUsed / this.totalGPUMemory) * 100,
      },
      cpu: {
        used: cpuUsed,
        total: this.totalCPUMemory,
        percentage: (cpuUsed / this.totalCPUMemory) * 100,
      },
    };
  }

  public async cleanup(): Promise<void> {
    // Release all allocated resources
    const modelIds = Array.from(this.allocations.keys());
    await Promise.all(modelIds.map(id => this.releaseResources(id)));

    // Clear GPU memory
    await tf.disposeVariables();

    this.emit('cleanupComplete');
  }
}
