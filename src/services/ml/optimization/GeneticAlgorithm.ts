import {
  OptimizationStrategy,
  OptimizationConfig,
  OptimizationResult,
} from './OptimizationStrategy';

export class GeneticAlgorithm extends OptimizationStrategy {
  private population: number[][] = [];
  private fitness: number[] = [];
  private velocities: number[][] = [];

  constructor(config: OptimizationConfig) {
    super(config);
    if (config.type !== 'genetic') {
      throw new Error('GeneticAlgorithm requires genetic optimization type');
    }
  }

  public async optimize(): Promise<OptimizationResult> {
    const startTime = Date.now();
    this.initializePopulation();

    for (let generation = 0; generation < this.config.parameters.generations!; generation++) {
      this.currentIteration = generation;

      // Evaluate fitness for all individuals
      await this.evaluatePopulation();

      // Select parents
      const parents = this.selectParents();

      // Create new population through crossover and mutation
      this.population = await this.createNewPopulation(parents);

      // Check for convergence
      if (this.checkConvergence()) {
        break;
      }

      this.emit('generationComplete', {
        generation,
        bestValue: this.bestValue,
        bestParameters: this.bestParameters,
      });
    }

    return this.getResult();
  }

  private initializePopulation(): void {
    const { populationSize } = this.config.parameters;
    const dimension = this.getDimension();

    this.population = Array(populationSize)
      .fill(null)
      .map(() => this.generateRandomIndividual(dimension));

    this.velocities = Array(populationSize)
      .fill(null)
      .map(() => Array(dimension).fill(0));
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

  private generateRandomIndividual(dimension: number): number[] {
    const individual = Array(dimension).fill(0);
    const { min, max } = this.config.constraints!;

    for (let i = 0; i < dimension; i++) {
      const minVal = min?.[i] ?? -10;
      const maxVal = max?.[i] ?? 10;
      individual[i] = minVal + Math.random() * (maxVal - minVal);
    }

    return individual;
  }

  private async evaluatePopulation(): Promise<void> {
    this.fitness = await Promise.all(
      this.population.map(async individual => {
        if (!this.checkConstraints(individual)) {
          return Infinity;
        }
        return await this.evaluateObjective(individual);
      })
    );

    // Update best solution
    const bestIndex = this.fitness.indexOf(Math.min(...this.fitness));
    if (this.fitness[bestIndex] < this.bestValue) {
      this.updateBest(this.population[bestIndex], this.fitness[bestIndex]);
    }
  }

  private selectParents(): number[][] {
    const { populationSize } = this.config.parameters;
    const parents: number[][] = [];

    // Tournament selection
    for (let i = 0; i < populationSize; i++) {
      const tournamentSize = 3;
      const tournament = Array(tournamentSize)
        .fill(null)
        .map(() => Math.floor(Math.random() * populationSize));

      const winner = tournament.reduce((best, current) =>
        this.fitness[current] < this.fitness[best] ? current : best
      );

      parents.push([...this.population[winner]]);
    }

    return parents;
  }

  private async createNewPopulation(parents: number[][]): Promise<number[][]> {
    const { populationSize, crossoverRate, mutationRate } = this.config.parameters;
    const newPopulation: number[][] = [];

    // Elitism: Keep the best individual
    const bestIndex = this.fitness.indexOf(Math.min(...this.fitness));
    newPopulation.push([...this.population[bestIndex]]);

    // Create rest of the population
    while (newPopulation.length < populationSize) {
      // Select two parents
      const parent1 = parents[Math.floor(Math.random() * parents.length)];
      const parent2 = parents[Math.floor(Math.random() * parents.length)];

      // Crossover
      let child1: number[], child2: number[];
      if (Math.random() < crossoverRate!) {
        [child1, child2] = this.crossover(parent1, parent2);
      } else {
        child1 = [...parent1];
        child2 = [...parent2];
      }

      // Mutation
      if (Math.random() < mutationRate!) {
        this.mutate(child1);
      }
      if (Math.random() < mutationRate!) {
        this.mutate(child2);
      }

      newPopulation.push(child1);
      if (newPopulation.length < populationSize) {
        newPopulation.push(child2);
      }
    }

    return newPopulation;
  }

  private crossover(parent1: number[], parent2: number[]): [number[], number[]] {
    const dimension = parent1.length;
    const crossoverPoint = Math.floor(Math.random() * dimension);

    const child1 = [...parent1.slice(0, crossoverPoint), ...parent2.slice(crossoverPoint)];

    const child2 = [...parent2.slice(0, crossoverPoint), ...parent1.slice(crossoverPoint)];

    return [child1, child2];
  }

  private mutate(individual: number[]): void {
    const { min, max } = this.config.constraints!;
    const dimension = individual.length;

    for (let i = 0; i < dimension; i++) {
      if (Math.random() < 0.1) {
        // 10% chance of mutation per gene
        const minVal = min?.[i] ?? -10;
        const maxVal = max?.[i] ?? 10;
        individual[i] = minVal + Math.random() * (maxVal - minVal);
      }
    }
  }
}
