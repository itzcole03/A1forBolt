import { BettingOpportunity } from '../../types/betting';
import axios from 'axios';
import type { ModelPrediction } from '../../types/prediction';
import { toast } from 'react-toastify';

// Core interfaces
export interface WeatherCondition {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  humidity: number;
  windDirection: number;
}

export interface InjuryReport {
  playerId: string;
  playerName: string;
  position: string;
  status: 'OUT' | 'DOUBTFUL' | 'QUESTIONABLE' | 'PROBABLE';
  details: string;
  impactScore: number;
}

export interface SentimentData {
  source: 'TWITTER' | 'NEWS' | 'REDDIT';
  sentiment: number;
  volume: number;
  keywords: string[];
  timestamp: number;
}

export interface PredictionResult {
  predictedValue: number;
  confidence: number;
  factors: PredictionFactor[];
  metadata: Record<string, unknown>;
  kellyValue: number;
  marketEdge: number;
  shapValues: Record<string, number>;
}

export interface PredictionFactor {
  name: string;
  impact: number;
  confidence: number;
  description: string;
  metadata: Record<string, unknown>;
}

export interface WeatherData {
  temperature: number;
  windSpeed: number;
  precipitation: number;
  humidity: number;
  conditions: string;
}

export interface HistoricalPattern {
  pattern: string;
  similarity: number;
  outcome: string;
  confidence: number;
  metadata: {
    matchCount: number;
    winRate: number;
    averageOddsMovement: number;
  };
}

interface ModelWeights {
  [key: string]: number;
}

interface PredictionConfig {
  minConfidence: number;
  maxStakePercentage: number;
  riskProfile: 'conservative' | 'moderate' | 'aggressive';
  autoRefresh: boolean;
  refreshInterval: number;
}

interface ModelOutput {
  type: string;
  prediction: number;
  confidence: number;
  shapValues: Record<string, number>;
}

interface Prediction {
  id: string;
  timestamp: string;
  prediction: number;
  confidence: number;
  shapValues: Record<string, number>;
  kellyValue: number;
  marketEdge: number;
}

class UnifiedPredictionService {
  private static instance: UnifiedPredictionService | null = null;
  private weatherCache: Map<string, WeatherData>;
  private injuryCache: Map<string, InjuryReport[]>;
  private sentimentCache: Map<string, SentimentData[]>;
  private modelWeights: ModelWeights = {
    xgboost: 0.3,
    lightgbm: 0.25,
    catboost: 0.2,
    neuralNetwork: 0.15,
    randomForest: 0.1,
  };

  private config: PredictionConfig = {
    minConfidence: 0.7,
    maxStakePercentage: 0.1,
    riskProfile: 'moderate',
    autoRefresh: true,
    refreshInterval: 30000,
  };

  private readonly apiUrl: string;
  private readonly wsUrl: string;

  protected constructor() {
    this.weatherCache = new Map();
    this.injuryCache = new Map();
    this.sentimentCache = new Map();
    this.apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    this.wsUrl = import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:8000';
  }

  public static getInstance(): UnifiedPredictionService {
    if (!UnifiedPredictionService.instance) {
      UnifiedPredictionService.instance = new UnifiedPredictionService();
    }
    return UnifiedPredictionService.instance;
  }

  public async analyzePredictionFactors(
    opportunity: BettingOpportunity
  ): Promise<PredictionFactor[]> {
    const factors: PredictionFactor[] = [];

    // Parallel execution of factor analysis
    const [injuryFactors, weatherFactor, sentimentFactor, patternFactors] = await Promise.all([
      this.analyzeInjuryImpact(opportunity),
      this.analyzeWeatherImpact(opportunity),
      this.analyzeSentiment(opportunity),
      this.findHistoricalPatterns(opportunity),
    ]);

    factors.push(...injuryFactors);
    if (weatherFactor) factors.push(weatherFactor);
    factors.push(sentimentFactor);
    factors.push(...patternFactors);

    return this.normalizePredictionFactors(factors);
  }

  private async analyzeInjuryImpact(opportunity: BettingOpportunity): Promise<PredictionFactor[]> {
    const injuries = this.injuryCache.get(opportunity.event_name) || [];
    return injuries
      .filter(injury => injury.impactScore > 0.3)
      .map(injury => ({
        name: 'Injury Impact',
        impact: -injury.impactScore,
        confidence: this.calculateInjuryConfidence(injury),
        description: `${injury.playerName} (${injury.position}) - ${injury.status}`,
        metadata: {
          playerId: injury.playerId,
          status: injury.status,
          position: injury.position,
        },
      }));
  }

  private calculateInjuryConfidence(injury: InjuryReport): number {
    const statusConfidence = {
      OUT: 1,
      DOUBTFUL: 0.75,
      QUESTIONABLE: 0.5,
      PROBABLE: 0.25,
    };

    return statusConfidence[injury.status] * injury.impactScore;
  }

  private async analyzeWeatherImpact(
    opportunity: BettingOpportunity
  ): Promise<PredictionFactor | null> {
    const weather = this.weatherCache.get(opportunity.event_name);
    if (!weather) return null;

    const impact = this.calculateWeatherImpact(weather);
    if (Math.abs(impact) < 0.2) return null;

    return {
      name: 'Weather Conditions',
      impact,
      confidence: 0.8,
      description: `${weather.conditions} - ${weather.temperature}°F, Wind: ${weather.windSpeed}mph`,
      metadata: { ...weather },
    };
  }

  private calculateWeatherImpact(weather: WeatherData): number {
    let impact = 0;

    if (weather.windSpeed > 15) {
      impact -= (weather.windSpeed - 15) / 30;
    }

    if (weather.precipitation > 0) {
      impact -= weather.precipitation / 10;
    }

    const optimalTemp = 70;
    const tempDiff = Math.abs(weather.temperature - optimalTemp);
    if (tempDiff > 30) {
      impact -= (tempDiff - 30) / 50;
    }

    return Math.max(-1, Math.min(1, impact));
  }

  private async analyzeSentiment(opportunity: BettingOpportunity): Promise<PredictionFactor> {
    const sentimentData = this.sentimentCache.get(opportunity.event_name) || [];

    if (sentimentData.length === 0) {
      return {
        name: 'Market Sentiment',
        impact: 0,
        confidence: 0,
        description: 'No sentiment data available',
        metadata: { dataPoints: 0 },
      };
    }

    const recentSentiment = sentimentData
      .filter(data => Date.now() - data.timestamp < 24 * 60 * 60 * 1000)
      .reduce((acc, data) => acc + data.sentiment * data.volume, 0);

    const totalVolume = sentimentData.reduce((acc, data) => acc + data.volume, 0);
    const averageSentiment = totalVolume > 0 ? recentSentiment / totalVolume : 0;

    return {
      name: 'Market Sentiment',
      impact: averageSentiment,
      confidence: Math.min(1, totalVolume / 1000),
      description: `Average sentiment: ${averageSentiment.toFixed(2)}`,
      metadata: {
        dataPoints: sentimentData.length,
        keywords: this.aggregateKeywords(sentimentData),
      },
    };
  }

  private aggregateKeywords(sentimentData: SentimentData[]): string[] {
    const keywordCounts = new Map<string, number>();
    sentimentData.forEach(data => {
      data.keywords.forEach(keyword => {
        keywordCounts.set(keyword, (keywordCounts.get(keyword) || 0) + 1);
      });
    });

    return Array.from(keywordCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([keyword]) => keyword);
  }

  private async findHistoricalPatterns(
    opportunity: BettingOpportunity
  ): Promise<PredictionFactor[]> {
    const patterns = await this.findSimilarHistoricalScenarios(opportunity);
    return patterns.map(pattern => ({
      name: 'Historical Pattern',
      impact: this.calculatePatternImpact(pattern),
      confidence: pattern.confidence,
      description: `Pattern: ${pattern.pattern} (${(pattern.similarity * 100).toFixed(1)}% similar)`,
      metadata: pattern.metadata,
    }));
  }

  private async findSimilarHistoricalScenarios(
    opportunity: BettingOpportunity
  ): Promise<HistoricalPattern[]> {
    try {
      const response = await axios.post(`${this.apiUrl}/api/predictions/historical-patterns`, {
        market: opportunity.event_name,
        odds: opportunity.odds,
        timestamp: opportunity.start_time,
      });
      return response.data.patterns;
    } catch (error) {
      console.error('Error finding historical patterns:', error);
      return [];
    }
  }

  private calculatePatternImpact(pattern: HistoricalPattern): number {
    return pattern.similarity * (pattern.metadata.winRate - 0.5) * 2;
  }

  private normalizePredictionFactors(factors: PredictionFactor[]): PredictionFactor[] {
    const totalConfidence = factors.reduce((sum, factor) => sum + factor.confidence, 0);
    return factors.map(factor => ({
      ...factor,
      impact: factor.impact * (factor.confidence / totalConfidence),
    }));
  }

  public async getPredictions(eventId: string): Promise<ModelPrediction[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/predictions/${eventId}`);
      return this.processPredictions(response.data);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      toast.error('Failed to fetch predictions');
      return [];
    }
  }

  private processPredictions(rawPredictions: ModelPrediction[]): ModelPrediction[] {
    return rawPredictions.map(prediction => ({
      ...prediction,
      confidence: this.calculateConfidence(prediction),
      timeDecay: this.calculateTimeDecay(prediction.timestamp),
      performanceFactor: this.calculatePerformanceFactor(prediction.performance),
    }));
  }

  private calculateConfidence(prediction: ModelPrediction): number {
    const baseConfidence = prediction.confidence || 0.5;
    const modelWeight = this.modelWeights[prediction.modelType] || 0.2;
    return baseConfidence * modelWeight;
  }

  private calculateTimeDecay(timestamp: string): number {
    const age = Date.now() - new Date(timestamp).getTime();
    return Math.exp(-age / (24 * 60 * 60 * 1000)); // 24-hour decay
  }

  private calculatePerformanceFactor(performance: Record<string, unknown>): number {
    return performance?.accuracy || 0.5;
  }

  public async updateModelWeights(performance: { [key: string]: number }): Promise<void> {
    const totalPerformance = Object.values(performance).reduce((sum, val) => sum + val, 0);
    Object.keys(performance).forEach(model => {
      this.modelWeights[model] = performance[model] / totalPerformance;
    });
  }

  public setConfig(newConfig: Partial<PredictionConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): PredictionConfig {
    return { ...this.config };
  }

  public async getRecentPredictions(): Promise<Prediction[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/predictions/recent`);
      return response.data;
    } catch (error) {
      console.error('Error fetching recent predictions:', error);
      return [];
    }
  }

  public async generatePrediction(modelOutputs: ModelOutput[]): Promise<Prediction | null> {
    try {
      const response = await axios.post(`${this.apiUrl}/api/predictions/generate`, {
        modelOutputs,
        config: this.config,
      });
      return response.data;
    } catch (error) {
      console.error('Error generating prediction:', error);
      return null;
    }
  }

  public async getEngineMetrics(): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/predictions/metrics`);
      return response.data;
    } catch (error) {
      console.error('Error fetching engine metrics:', error);
      return null;
    }
  }

  public async getModelPerformance(modelType: string): Promise<Record<string, unknown>> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/predictions/model-performance/${modelType}`
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching model performance:', error);
      return null;
    }
  }

  public async getFeatureImportance(modelType: string): Promise<Record<string, number>> {
    try {
      const response = await axios.get(
        `${this.apiUrl}/api/predictions/feature-importance/${modelType}`
      );
      return response.data;
    } catch (error) {
      console.error('Failed to fetch feature importance:', error);
      return {};
    }
  }

  public async getShapValues(eventId: string): Promise<Record<string, number>> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/predictions/shap-values/${eventId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch SHAP values:', error);
      return {};
    }
  }

  // Cache management methods
  public updateWeatherData(market: string, data: WeatherData): void {
    this.weatherCache.set(market, data);
  }

  public updateInjuryData(market: string, data: InjuryReport[]): void {
    this.injuryCache.set(market, data);
  }

  public updateSentimentData(market: string, data: SentimentData): void {
    const existingData = this.sentimentCache.get(market) || [];
    this.sentimentCache.set(market, [...existingData, data]);
  }

  public clearCaches(): void {
    this.weatherCache.clear();
    this.injuryCache.clear();
    this.sentimentCache.clear();
  }
}

export default UnifiedPredictionService;
