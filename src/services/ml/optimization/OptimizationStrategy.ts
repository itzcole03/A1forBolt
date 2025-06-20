import { EventEmitter } from 'events';

export interface OptimizationConfig {
  name: string;
  type: 'genetic' | 'particleSwarm' | 'simulatedAnnealing' | 'bayesian';
  parameters: {
    populationSize?: number;
    generations?: number;
    mutationRate?: number;
    crossoverRate?: number;
    inertiaWeight?: number;
    cognitiveWeight?: number;
    socialWeight?: number;
    temperature?: number;
    coolingRate?: number;
    acquisitionFunction?: 'ucb' | 'ei' | 'pi';
    kernel?: 'rbf' | 'matern' | 'linear';
  };
  constraints?: {
    min?: number[];
    max?: number[];
    equality?: Array<{ coefficients: number[]; value: number }>;
    inequality?: Array<{ coefficients: number[]; value: number }>;
  };
  objective: {
    type: 'minimize' | 'maximize';
    function: (params: number[]) => Promise<number>;
  };
}

export interface OptimizationResult {
  bestParameters: number[];
  bestValue: number;
  history: Array<{
    iteration: number;
    bestValue: number;
    parameters: number[];
  }>;
  metadata: {
    iterations: number;
    timeElapsed: number;
    convergence: boolean;
    strategy: string;
  };
}

export abstract class OptimizationStrategy extends EventEmitter {
  protected config: OptimizationConfig;
  protected currentIteration: number = 0;
  protected bestParameters: number[] = [];
  protected bestValue: number = Infinity;
  protected history: OptimizationResult['history'] = [];

  constructor(config: OptimizationConfig) {
    super();
    this.config = config;
    this.validateConfig();
  }

  protected validateConfig(): void {
    if (!this.config.name) {
      throw new Error('Optimization strategy must have a name');
    }

    if (!this.config.objective || !this.config.objective.function) {
      throw new Error('Optimization strategy must have an objective function');
    }

    // Validate parameters based on strategy type
    switch (this.config.type) {
      case 'genetic':
        this.validateGeneticConfig();
        break;
      case 'particleSwarm':
        this.validateParticleSwarmConfig();
        break;
      case 'simulatedAnnealing':
        this.validateSimulatedAnnealingConfig();
        break;
      case 'bayesian':
        this.validateBayesianConfig();
        break;
      default:
        throw new Error(`Unknown optimization strategy type: ${this.config.type}`);
    }
  }

  private validateGeneticConfig(): void {
    const { parameters } = this.config;
    if (!parameters.populationSize || parameters.populationSize < 2) {
      throw new Error('Genetic algorithm requires population size >= 2');
    }
    if (!parameters.generations || parameters.generations < 1) {
      throw new Error('Genetic algorithm requires generations >= 1');
    }
    if (!parameters.mutationRate || parameters.mutationRate < 0 || parameters.mutationRate > 1) {
      throw new Error('Genetic algorithm requires mutation rate between 0 and 1');
    }
    if (!parameters.crossoverRate || parameters.crossoverRate < 0 || parameters.crossoverRate > 1) {
      throw new Error('Genetic algorithm requires crossover rate between 0 and 1');
    }
  }

  private validateParticleSwarmConfig(): void {
    const { parameters } = this.config;
    if (!parameters.populationSize || parameters.populationSize < 2) {
      throw new Error('Particle swarm requires population size >= 2');
    }
    if (!parameters.inertiaWeight || parameters.inertiaWeight < 0) {
      throw new Error('Particle swarm requires non-negative inertia weight');
    }
    if (!parameters.cognitiveWeight || parameters.cognitiveWeight < 0) {
      throw new Error('Particle swarm requires non-negative cognitive weight');
    }
    if (!parameters.socialWeight || parameters.socialWeight < 0) {
      throw new Error('Particle swarm requires non-negative social weight');
    }
  }

  private validateSimulatedAnnealingConfig(): void {
    const { parameters } = this.config;
    if (!parameters.temperature || parameters.temperature <= 0) {
      throw new Error('Simulated annealing requires positive temperature');
    }
    if (!parameters.coolingRate || parameters.coolingRate <= 0 || parameters.coolingRate >= 1) {
      throw new Error('Simulated annealing requires cooling rate between 0 and 1');
    }
  }

  private validateBayesianConfig(): void {
    const { parameters } = this.config;
    if (!parameters.acquisitionFunction) {
      throw new Error('Bayesian optimization requires an acquisition function');
    }
    if (!parameters.kernel) {
      throw new Error('Bayesian optimization requires a kernel function');
    }
  }

  public abstract optimize(): Promise<OptimizationResult>;

  protected async evaluateObjective(parameters: number[]): Promise<number> {
    const value = await this.config.objective.function(parameters);
    return this.config.objective.type === 'minimize' ? value : -value;
  }

  protected updateBest(parameters: number[], value: number): void {
    const objectiveValue = this.config.objective.type === 'minimize' ? value : -value;

    if (objectiveValue < this.bestValue) {
      this.bestValue = objectiveValue;
      this.bestParameters = [...parameters];

      this.history.push({
        iteration: this.currentIteration,
        bestValue: this.bestValue,
        parameters: [...parameters],
      });

      this.emit('bestUpdated', {
        iteration: this.currentIteration,
        bestValue: this.bestValue,
        parameters: [...parameters],
      });
    }
  }

  protected checkConstraints(parameters: number[]): boolean {
    if (!this.config.constraints) {
      return true;
    }

    const { min, max, equality, inequality } = this.config.constraints;

    // Check bounds
    if (min && parameters.some((p, i) => p < min[i])) {
      return false;
    }
    if (max && parameters.some((p, i) => p > max[i])) {
      return false;
    }

    // Check equality constraints
    if (equality) {
      for (const constraint of equality) {
        const value = parameters.reduce((sum, p, i) => sum + p * constraint.coefficients[i], 0);
        if (Math.abs(value - constraint.value) > 1e-6) {
          return false;
        }
      }
    }

    // Check inequality constraints
    if (inequality) {
      for (const constraint of inequality) {
        const value = parameters.reduce((sum, p, i) => sum + p * constraint.coefficients[i], 0);
        if (value > constraint.value) {
          return false;
        }
      }
    }

    return true;
  }

  protected getResult(): OptimizationResult {
    return {
      bestParameters: this.bestParameters,
      bestValue: this.config.objective.type === 'minimize' ? this.bestValue : -this.bestValue,
      history: this.history,
      metadata: {
        iterations: this.currentIteration,
        timeElapsed: Date.now() - this.history[0]?.timestamp,
        convergence: this.checkConvergence(),
        strategy: this.config.type,
      },
    };
  }

  protected checkConvergence(): boolean {
    if (this.history.length < 10) {
      return false;
    }

    const recentHistory = this.history.slice(-10);
    const improvements = recentHistory.map((h, i) =>
      i === 0 ? 0 : h.bestValue - recentHistory[i - 1].bestValue
    );

    const avgImprovement = improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length;
    return Math.abs(avgImprovement) < 1e-6;
  }
}
