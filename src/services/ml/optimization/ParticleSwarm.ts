import {
  OptimizationStrategy,
  OptimizationConfig,
  OptimizationResult,
} from './OptimizationStrategy';

export class ParticleSwarm extends OptimizationStrategy {
  private particles: number[][] = [];
  private velocities: number[][] = [];
  private personalBests: number[][] = [];
  private personalBestValues: number[] = [];
  private globalBest: number[] = [];
  private globalBestValue: number = Infinity;

  constructor(config: OptimizationConfig) {
    super(config);
    if (config.type !== 'particleSwarm') {
      throw new Error('ParticleSwarm requires particleSwarm optimization type');
    }
  }

  public async optimize(): Promise<OptimizationResult> {
    const startTime = Date.now();
    this.initializeSwarm();

    const maxIterations = this.config.parameters.generations || 100;
    for (let iteration = 0; iteration < maxIterations; iteration++) {
      this.currentIteration = iteration;

      // Update particles
      await this.updateParticles();

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

  private initializeSwarm(): void {
    const { populationSize } = this.config.parameters;
    const dimension = this.getDimension();

    // Initialize particles
    this.particles = Array(populationSize)
      .fill(null)
      .map(() => this.generateRandomParticle(dimension));

    // Initialize velocities
    this.velocities = Array(populationSize)
      .fill(null)
      .map(() => Array(dimension).fill(0));

    // Initialize personal bests
    this.personalBests = this.particles.map(p => [...p]);
    this.personalBestValues = Array(populationSize).fill(Infinity);

    // Initialize global best
    this.globalBest = [...this.particles[0]];
    this.globalBestValue = Infinity;
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

  private generateRandomParticle(dimension: number): number[] {
    const particle = Array(dimension).fill(0);
    const { min, max } = this.config.constraints!;

    for (let i = 0; i < dimension; i++) {
      const minVal = min?.[i] ?? -10;
      const maxVal = max?.[i] ?? 10;
      particle[i] = minVal + Math.random() * (maxVal - minVal);
    }

    return particle;
  }

  private async updateParticles(): Promise<void> {
    const { populationSize } = this.config.parameters;
    const { inertiaWeight, cognitiveWeight, socialWeight } = this.config.parameters;

    for (let i = 0; i < populationSize; i++) {
      // Update velocity
      for (let j = 0; j < this.particles[i].length; j++) {
        const r1 = Math.random();
        const r2 = Math.random();

        this.velocities[i][j] =
          inertiaWeight! * this.velocities[i][j] +
          cognitiveWeight! * r1 * (this.personalBests[i][j] - this.particles[i][j]) +
          socialWeight! * r2 * (this.globalBest[j] - this.particles[i][j]);
      }

      // Update position
      for (let j = 0; j < this.particles[i].length; j++) {
        this.particles[i][j] += this.velocities[i][j];

        // Apply bounds
        const { min, max } = this.config.constraints!;
        if (min) {
          this.particles[i][j] = Math.max(this.particles[i][j], min[j]);
        }
        if (max) {
          this.particles[i][j] = Math.min(this.particles[i][j], max[j]);
        }
      }

      // Evaluate new position
      if (this.checkConstraints(this.particles[i])) {
        const value = await this.evaluateObjective(this.particles[i]);

        // Update personal best
        if (value < this.personalBestValues[i]) {
          this.personalBestValues[i] = value;
          this.personalBests[i] = [...this.particles[i]];

          // Update global best
          if (value < this.globalBestValue) {
            this.globalBestValue = value;
            this.globalBest = [...this.particles[i]];
            this.updateBest(this.particles[i], value);
          }
        }
      }
    }
  }

  protected checkConvergence(): boolean {
    if (this.history.length < 10) {
      return false;
    }

    // Check if particles have converged to a small region
    const recentHistory = this.history.slice(-10);
    const positionVariances = this.calculatePositionVariances();

    const avgVariance =
      positionVariances.reduce((sum, variance) => sum + variance, 0) / positionVariances.length;
    const valueConvergence = super.checkConvergence();

    return avgVariance < 1e-6 || valueConvergence;
  }

  private calculatePositionVariances(): number[] {
    const dimension = this.particles[0].length;
    const variances: number[] = [];

    for (let j = 0; j < dimension; j++) {
      const positions = this.particles.map(p => p[j]);
      const mean = positions.reduce((sum, pos) => sum + pos, 0) / positions.length;
      const variance =
        positions.reduce((sum, pos) => sum + Math.pow(pos - mean, 2), 0) / positions.length;
      variances.push(variance);
    }

    return variances;
  }
}
