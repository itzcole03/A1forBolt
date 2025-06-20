import { BettingOpportunity, BetRecord } from '../types/core';
import { EventBus } from '../core/EventBus';
import { UnifiedConfigManager } from '../core/UnifiedConfigManager.ts';



export interface RiskConfig {
  maxExposure: number;
  maxExposurePerBet: number;
  maxExposurePerPlayer: number;
  maxExposurePerMetric: number;
  maxActiveBets: number;
  minBankroll: number;
  maxBankrollPercentage: number;
  stopLossPercentage: number;
  takeProfitPercentage: number;
  confidenceThresholds: {
    low: number;
    medium: number;
    high: number;
  };
  volatilityThresholds: {
    low: number;
    medium: number;
    high: number;
  };
}

export interface RiskAssessment {
  id: string;
  timestamp: number;
  opportunity: BettingOpportunity;
  riskLevel: 'low' | 'medium' | 'high';
  maxStake: number;
  factors: {
    exposure: number;
    confidence: number;
    volatility: number;
    correlation: number;
    timeToEvent: number;
  };
  limits: {
    maxExposure: number;
    maxStake: number;
    minOdds: number;
    maxOdds: number;
  };
  warnings: string[];
  recommendations: string[];
}

export interface RiskMetrics {
  totalExposure: number;
  exposureByPlayer: Record<string, number>;
  exposureByMetric: Record<string, number>;
  activeBets: number;
  bankroll: number;
  profitLoss: number;
  roi: number;
  winRate: number;
  averageStake: number;
  maxDrawdown: number;
  sharpeRatio: number;
  kellyMultiplier: number;
}

export class RiskManagerService {
  private static instance: RiskManagerService;
  private readonly eventBus: EventBus;
  private readonly configManager: UnifiedConfigManager;
  private readonly config: RiskConfig;
  private readonly activeBets: Map<string, BetRecord>;
  private readonly riskAssessments: Map<string, RiskAssessment>;
  private metrics: RiskMetrics;

  private constructor() {
    this.eventBus = EventBus.getInstance();
    this.configManager = UnifiedConfigManager.getInstance();
    this.config = this.initializeConfig();
    this.activeBets = new Map();
    this.riskAssessments = new Map();
    this.metrics = this.initializeMetrics();
    this.setupEventListeners();
  }

  public static getInstance(): RiskManagerService {
    if (!RiskManagerService.instance) {
      RiskManagerService.instance = new RiskManagerService();
    }
    return RiskManagerService.instance;
  }

  private initializeConfig(): RiskConfig {
    const config = this.configManager.getConfig();
    return {
      maxExposure: 10000,
      maxExposurePerBet: 1000,
      maxExposurePerPlayer: 2000,
      maxExposurePerMetric: 5000,
      maxActiveBets: 50,
      minBankroll: 1000,
      maxBankrollPercentage: 0.1,
      stopLossPercentage: 0.2,
      takeProfitPercentage: 0.5,
      confidenceThresholds: {
        low: 0.3,
        medium: 0.6,
        high: 0.8
      },
      volatilityThresholds: {
        low: 0.1,
        medium: 0.3,
        high: 0.5
      }
    };
  }

  private initializeMetrics(): RiskMetrics {
    return {
      totalExposure: 0,
      exposureByPlayer: {},
      exposureByMetric: {},
      activeBets: 0,
      bankroll: 0,
      profitLoss: 0,
      roi: 0,
      winRate: 0,
      averageStake: 0,
      maxDrawdown: 0,
      sharpeRatio: 0,
      kellyMultiplier: 1
    };
  }

  private setupEventListeners(): void {
    // Listen for new betting opportunities
    this.eventBus.on('prediction:update', async (event) => {
      try {
        const assessment = await this.assessRisk(event.data);
        this.riskAssessments.set(assessment.id, assessment);
        
        this.eventBus.emit('data:updated', {
          sourceId: 'risk-manager',
          data: [assessment]
        });
      } catch (error) {
        console.error('Error assessing risk:', error);
      }
    });

    // Listen for placed bets
    this.eventBus.on('bet:placed', (event) => {
      const { bet } = event.data;
      this.updateExposure(bet);
      this.updateMetrics();
    });

    // Listen for settled bets
    this.eventBus.on('bet:settled', (event) => {
      const { bet, result } = event.data;
      this.handleBetSettlement(bet.id, result);
      this.updateMetrics();
    });

    // Listen for bankroll updates
    this.eventBus.on('bankroll:update', (event) => {
      const { state } = event.data;
      this.metrics.bankroll = state.balance;
      this.updateMetrics();
    });
  }

  private async assessRisk(opportunity: BettingOpportunity): Promise<RiskAssessment> {
    const assessment: RiskAssessment = {
      id: `risk_${opportunity.id}_${Date.now()}`,
      timestamp: Date.now(),
      opportunity,
      riskLevel: 'medium',
      maxStake: 0,
      factors: {
        exposure: 0,
        confidence: 0,
        volatility: 0,
        correlation: 0,
        timeToEvent: 0
      },
      limits: {
        maxExposure: this.config.maxExposure,
        maxStake: this.config.maxExposurePerBet,
        minOdds: 1.1,
        maxOdds: 10
      },
      warnings: [],
      recommendations: []
    };

    // Calculate risk factors
    assessment.factors.exposure = this.calculateExposureFactor(opportunity);
    assessment.factors.confidence = this.calculateConfidenceFactor(opportunity);
    assessment.factors.volatility = this.calculateVolatilityFactor(opportunity);
    assessment.factors.correlation = this.calculateCorrelationFactor(opportunity);
    assessment.factors.timeToEvent = this.calculateTimeToEventFactor(opportunity);

    // Calculate overall risk level
    assessment.riskLevel = this.calculateOverallRisk(assessment.factors);

    // Calculate max stake
    assessment.maxStake = this.calculateMaxStake(assessment);

    // Generate warnings and recommendations
    this.generateWarnings(assessment);
    this.generateRecommendations(assessment);

    return assessment;
  }

  private calculateExposureFactor(opportunity: BettingOpportunity): number {
    const playerExposure = this.metrics.exposureByPlayer[opportunity.playerId] || 0;
    const metricExposure = this.metrics.exposureByMetric[opportunity.metric] || 0;
    
    const playerFactor = playerExposure / this.config.maxExposurePerPlayer;
    const metricFactor = metricExposure / this.config.maxExposurePerMetric;
    const totalFactor = this.metrics.totalExposure / this.config.maxExposure;

    return Math.max(playerFactor, metricFactor, totalFactor);
  }

  private calculateConfidenceFactor(opportunity: BettingOpportunity): number {
    const { confidence } = opportunity;
    if (confidence >= this.config.confidenceThresholds.high) return 0.2;
    if (confidence >= this.config.confidenceThresholds.medium) return 0.5;
    return 0.8;
  }

  private calculateVolatilityFactor(opportunity: BettingOpportunity): number {
    const volatility = opportunity.metadata?.volatility || 0;
    if (volatility <= this.config.volatilityThresholds.low) return 0.2;
    if (volatility <= this.config.volatilityThresholds.medium) return 0.5;
    return 0.8;
  }

  private calculateCorrelationFactor(opportunity: BettingOpportunity): number {
    // Calculate correlation with existing bets
    let maxCorrelation = 0;
    for (const bet of this.activeBets.values()) {
      const correlation = this.calculateBetCorrelation(bet, opportunity);
      maxCorrelation = Math.max(maxCorrelation, correlation);
    }
    return maxCorrelation;
  }

  private calculateTimeToEventFactor(opportunity: BettingOpportunity): number {
    const timeToEvent = opportunity.metadata?.timeToEvent || 0;
    if (timeToEvent > 86400) return 0.2; // More than 24 hours
    if (timeToEvent > 3600) return 0.5; // More than 1 hour
    return 0.8; // Less than 1 hour
  }

  private calculateBetCorrelation(bet: BetRecord, opportunity: BettingOpportunity): number {
    // Simple correlation based on shared factors
    let correlation = 0;
    
    // Same player
    if (bet.playerId === opportunity.playerId) {
      correlation += 0.3;
    }
    
    // Same metric
    if (bet.metric === opportunity.metric) {
      correlation += 0.3;
    }
    
    // Same time period
    const timeDiff = Math.abs(
      (opportunity.metadata?.eventTime || 0) - 
      (bet.metadata?.eventTime || 0)
    );
    if (timeDiff < 3600) correlation += 0.4;
    else if (timeDiff < 86400) correlation += 0.2;

    return correlation;
  }

  private calculateOverallRisk(factors: RiskAssessment['factors']): 'low' | 'medium' | 'high' {
    const riskScore = 
      factors.exposure * 0.3 +
      factors.confidence * 0.2 +
      factors.volatility * 0.2 +
      factors.correlation * 0.2 +
      factors.timeToEvent * 0.1;

    if (riskScore <= 0.3) return 'low';
    if (riskScore <= 0.6) return 'medium';
    return 'high';
  }

  private calculateMaxStake(assessment: RiskAssessment): number {
    const { riskLevel, factors, opportunity } = assessment;
    let maxStake = this.config.maxExposurePerBet;

    // Adjust based on risk level
    if (riskLevel === 'high') maxStake *= 0.5;
    else if (riskLevel === 'medium') maxStake *= 0.75;

    // Adjust based on bankroll
    maxStake = Math.min(maxStake, this.metrics.bankroll * this.config.maxBankrollPercentage);

    // Adjust based on exposure
    const remainingExposure = this.config.maxExposure - this.metrics.totalExposure;
    maxStake = Math.min(maxStake, remainingExposure);

    // Adjust based on player exposure
    const playerExposure = this.metrics.exposureByPlayer[opportunity.playerId] || 0;
    const remainingPlayerExposure = this.config.maxExposurePerPlayer - playerExposure;
    maxStake = Math.min(maxStake, remainingPlayerExposure);

    // Adjust based on metric exposure
    const metricExposure = this.metrics.exposureByMetric[opportunity.metric] || 0;
    const remainingMetricExposure = this.config.maxExposurePerMetric - metricExposure;
    maxStake = Math.min(maxStake, remainingMetricExposure);

    // Apply Kelly criterion
    maxStake *= this.metrics.kellyMultiplier;

    return Math.max(0, Math.floor(maxStake));
  }

  private generateWarnings(assessment: RiskAssessment): void {
    const { factors, opportunity } = assessment;

    if (factors.exposure > 0.8) {
      assessment.warnings.push('High exposure level');
    }

    if (factors.confidence < this.config.confidenceThresholds.medium) {
      assessment.warnings.push('Low confidence prediction');
    }

    if (factors.volatility > this.config.volatilityThresholds.high) {
      assessment.warnings.push('High market volatility');
    }

    if (factors.correlation > 0.7) {
      assessment.warnings.push('High correlation with existing bets');
    }

    if (factors.timeToEvent > 0.7) {
      assessment.warnings.push('Close to event start time');
    }

    if (this.metrics.activeBets >= this.config.maxActiveBets) {
      assessment.warnings.push('Maximum active bets reached');
    }

    if (this.metrics.bankroll < this.config.minBankroll) {
      assessment.warnings.push('Bankroll below minimum threshold');
    }
  }

  private generateRecommendations(assessment: RiskAssessment): void {
    const { riskLevel, maxStake, opportunity } = assessment;

    if (maxStake > 0) {
      assessment.recommendations.push(`Recommended maximum stake: $${maxStake}`);
    } else {
      assessment.recommendations.push('Do not place this bet');
    }

    if (riskLevel === 'high') {
      assessment.recommendations.push('Consider reducing position size');
      assessment.recommendations.push('Set tight stop loss');
    }

    if (assessment.factors.correlation > 0.5) {
      assessment.recommendations.push('Consider hedging existing positions');
    }

    if (assessment.factors.volatility > this.config.volatilityThresholds.medium) {
      assessment.recommendations.push('Monitor market conditions closely');
    }
  }

  private updateExposure(bet: BetRecord): void {
    this.activeBets.set(bet.id, bet);
    
    // Update exposure metrics
    this.metrics.totalExposure += bet.stake;
    this.metrics.exposureByPlayer[bet.playerId] = 
      (this.metrics.exposureByPlayer[bet.playerId] || 0) + bet.stake;
    this.metrics.exposureByMetric[bet.metric] = 
      (this.metrics.exposureByMetric[bet.metric] || 0) + bet.stake;
    this.metrics.activeBets = this.activeBets.size;
  }

  private handleBetSettlement(betId: string, result: { won: boolean; profitLoss: number }): void {
    const bet = this.activeBets.get(betId);
    if (!bet) return;

    // Update exposure
    this.metrics.totalExposure -= bet.stake;
    this.metrics.exposureByPlayer[bet.playerId] -= bet.stake;
    this.metrics.exposureByMetric[bet.metric] -= bet.stake;
    
    // Update P&L
    this.metrics.profitLoss += result.profitLoss;
    
    // Remove from active bets
    this.activeBets.delete(betId);
    this.metrics.activeBets = this.activeBets.size;
  }

  private updateMetrics(): void {
    // Calculate ROI
    this.metrics.roi = this.metrics.bankroll > 0 
      ? this.metrics.profitLoss / this.metrics.bankroll 
      : 0;

    // Calculate win rate
    const settledBets = Array.from(this.activeBets.values())
      .filter(bet => bet.result && bet.result !== 'pending');
    const winningBets = settledBets.filter(bet => bet.result === 'win');
    this.metrics.winRate = settledBets.length > 0 
      ? winningBets.length / settledBets.length 
      : 0;

    // Calculate average stake
    const totalStake = Array.from(this.activeBets.values())
      .reduce((sum, bet) => sum + bet.stake, 0);
    this.metrics.averageStake = this.activeBets.size > 0 
      ? totalStake / this.activeBets.size 
      : 0;

    // Emit metrics update
    this.eventBus.emit('metric:recorded', {
      name: 'risk_metrics',
      value: this.metrics.totalExposure,
      timestamp: Date.now(),
      labels: {
        active_bets: String(this.metrics.activeBets),
        win_rate: this.metrics.winRate.toFixed(2),
        roi: this.metrics.roi.toFixed(2)
      }
    });
  }

  public getRiskAssessment(id: string): RiskAssessment | undefined {
    return this.riskAssessments.get(id);
  }

  public getMetrics(): RiskMetrics {
    return { ...this.metrics };
  }

  public getActiveBets(): BetRecord[] {
    return Array.from(this.activeBets.values());
  }

  public getConfig(): RiskConfig {
    return { ...this.config };
  }
} 