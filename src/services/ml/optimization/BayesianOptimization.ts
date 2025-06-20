import {
  OptimizationStrategy,
  OptimizationConfig,
  OptimizationResult,
} from './OptimizationStrategy';
import { GaussianProcess } from '../models/GaussianProcess';

export class BayesianOptimization extends OptimizationStrategy {
  private gp: GaussianProcess;
  private observedPoints: number[][] = [];
  private observedValues: number[] = [];
  private acquisitionFunction: (mean: number, std: number) => number;

  constructor(config: OptimizationConfig) {
    super(config);
    if (config.type !== 'bayesian') {
      throw new Error('BayesianOptimization requires bayesian optimization type');
    }

    // Initialize Gaussian Process
    this.gp = new GaussianProcess({
      kernel: config.parameters.kernel!,
      noise: 1e-6,
    });

    // Set up acquisition function
    this.acquisitionFunction = this.getAcquisitionFunction(config.parameters.acquisitionFunction!);
  }

  public async optimize(): Promise<OptimizationResult> {
    const startTime = Date.now();
    this.initializeRandomPoints();

    const maxIterations = this.config.parameters.generations || 100;
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      this.currentIteration = iteration;

      // Update Gaussian Process
      this.gp.fit(this.observedPoints, this.observedValues);

      // Find next point to evaluate
      const nextPoint = this.findNextPoint();

      // Evaluate the point
      if (this.checkConstraints(nextPoint)) {
        const value = await this.evaluateObjective(nextPoint);

        // Update observed points and values
        this.observedPoints.push(nextPoint);
        this.observedValues.push(value);

        // Update best solution if needed
        if (value < this.bestValue) {
          this.updateBest(nextPoint, value);
        }
      }

      // Check for convergence
      if (this.checkConvergence()) {
        break;
      }

      this.emit('iterationComplete', {
        iteration,
        bestValue: this.bestValue,
        bestParameters: this.bestParameters,
      });
    }

    return this.getResult();
  }

  private initializeRandomPoints(): void {
    const dimension = this.getDimension();
    const numInitialPoints = Math.min(10, this.config.parameters.populationSize || 10);

    for (let i = 0; i < numInitialPoints; i++) {
      const point = this.generateRandomPoint(dimension);
      if (this.checkConstraints(point)) {
        this.evaluateObjective(point).then(value => {
          this.observedPoints.push(point);
          this.observedValues.push(value);
          if (value < this.bestValue) {
            this.updateBest(point, value);
          }
        });
      }
    }
  }

  private getDimension(): number {
    if (this.config.constraints?.min) {
      return this.config.constraints.min.length;
    }
    if (this.config.constraints?.max) {
      return this.config.constraints.max.length;
    }
    throw new Error('Cannot determine parameter dimension from constraints');
  }

  private generateRandomPoint(dimension: number): number[] {
    const point = Array(dimension).fill(0);
    const { min, max } = this.config.constraints!;

    for (let i = 0; i < dimension; i++) {
      const minVal = min?.[i] ?? -10;
      const maxVal = max?.[i] ?? 10;
      point[i] = minVal + Math.random() * (maxVal - minVal);
    }

    return point;
  }

  private getAcquisitionFunction(type: 'ucb' | 'ei' | 'pi'): (mean: number, std: number) => number {
    switch (type) {
      case 'ucb':
        return (mean: number, std: number) => mean - 2 * std; // Lower confidence bound
      case 'ei':
        return (mean: number, std: number) => {
          const bestValue = Math.min(...this.observedValues);
          const z = (bestValue - mean) / std;
          return (bestValue - mean) * this.normalCDF(z) + std * this.normalPDF(z);
        };
      case 'pi':
        return (mean: number, std: number) => {
          const bestValue = Math.min(...this.observedValues);
          const z = (bestValue - mean) / std;
          return this.normalCDF(z);
        };
      default:
        throw new Error(`Unknown acquisition function type: ${type}`);
    }
  }

  private findNextPoint(): number[] {
    const dimension = this.getDimension();
    const numCandidates = 1000;
    let bestPoint: number[] = [];
    let bestAcquisition = -Infinity;

    // Generate random candidates
    for (let i = 0; i < numCandidates; i++) {
      const candidate = this.generateRandomPoint(dimension);
      if (this.checkConstraints(candidate)) {
        const [mean, std] = this.gp.predict(candidate);
        const acquisition = this.acquisitionFunction(mean, std);

        if (acquisition > bestAcquisition) {
          bestAcquisition = acquisition;
          bestPoint = candidate;
        }
      }
    }

    return bestPoint;
  }

  private normalCDF(x: number): number {
    return 0.5 * (1 + Math.erf(x / Math.sqrt(2)));
  }

  private normalPDF(x: number): number {
    return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
  }

  protected checkConvergence(): boolean {
    if (this.history.length < 10) {
      return false;
    }

    // Check if the improvement in the last few iterations is small
    const recentHistory = this.history.slice(-10);
    const valueConvergence = super.checkConvergence();

    // Check if the uncertainty in the GP is small
    const lastPoint = this.observedPoints[this.observedPoints.length - 1];
    const [_, std] = this.gp.predict(lastPoint);
    const uncertaintyConvergence = std < 1e-3;

    return valueConvergence || uncertaintyConvergence;
  }
}
