import { Injectable } from '@nestjs/common';
import { UserPersonalizationService } from '../analytics/userPersonalizationService';
import { PredictionOptimizationService } from '../analytics/predictionOptimizationService';
import { RiskManagementService } from '../riskManagement';
import { BankrollService } from '../bankroll';
import { NotificationService } from '../notification';
import { UnifiedBettingCore } from '../unified/UnifiedBettingCore';
import { EventEmitter } from 'events';

@Injectable()
export class BettingAutomationService extends EventEmitter {
  private static instance: BettingAutomationService;
  private isRunning: boolean = false;
  private readonly updateInterval: number = 5 * 60 * 1000; // 5 minutes
  private updateTimer: NodeJS.Timeout | null = null;

  private constructor(
    private readonly userPersonalizationService: UserPersonalizationService,
    private readonly predictionOptimizationService: PredictionOptimizationService,
    private readonly riskManagementService: RiskManagementService,
    private readonly bankrollService: BankrollService,
    private readonly notificationService: NotificationService,
    private readonly unifiedBettingCore: UnifiedBettingCore
  ) {
    super();
  }

  public static getInstance(): BettingAutomationService {
    if (!BettingAutomationService.instance) {
      BettingAutomationService.instance = new BettingAutomationService(
        new UserPersonalizationService(),
        new PredictionOptimizationService(),
        RiskManagementService.getInstance(),
        BankrollService.getInstance(),
        NotificationService.getInstance(),
        UnifiedBettingCore.getInstance()
      );
    }
    return BettingAutomationService.instance;
  }

  public async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    try {
      this.isRunning = true;
      this.notificationService.notify('info', 'Betting automation started');

      // Initialize all services
      await this.initializeServices();

      // Start the update loop
      this.startUpdateLoop();

      // Set up event listeners
      this.setupEventListeners();

      this.emit('started');
    } catch (error) {
      this.isRunning = false;
      this.notificationService.notify('error', 'Failed to start betting automation', { error });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    try {
      this.isRunning = false;
      if (this.updateTimer) {
        clearInterval(this.updateTimer);
        this.updateTimer = null;
      }

      this.notificationService.notify('info', 'Betting automation stopped');
      this.emit('stopped');
    } catch (error) {
      this.notificationService.notify('error', 'Error stopping betting automation', { error });
      throw error;
    }
  }

  private async initializeServices(): Promise<void> {
    try {
      // Initialize each service
      await Promise.all([
        this.userPersonalizationService.initialize(),
        this.predictionOptimizationService.initialize(),
        this.riskManagementService.initialize(),
        this.bankrollService.initialize(),
        this.unifiedBettingCore.initialize(),
      ]);
    } catch (error) {
      this.notificationService.notify('error', 'Failed to initialize services', { error });
      throw error;
    }
  }

  private startUpdateLoop(): void {
    this.updateTimer = setInterval(async () => {
      try {
        await this.performUpdate();
      } catch (error) {
        this.notificationService.notify('error', 'Error in update loop', { error });
      }
    }, this.updateInterval);
  }

  private async performUpdate(): Promise<void> {
    try {
      // Get latest predictions
      const predictions = await this.predictionOptimizationService.getOptimizedPrediction({
        timestamp: Date.now(),
        marketData: await this.getMarketData(),
        userProfiles: await this.getUserProfiles(),
      });

      // Process each prediction
      for (const prediction of predictions) {
        // Get personalized prediction
        const personalizedPrediction =
          await this.userPersonalizationService.getPersonalizedPrediction(
            prediction.userId,
            prediction
          );

        // Assess risk
        const riskAssessment = await this.riskManagementService.assessRisk({
          prediction: personalizedPrediction,
          bankroll: this.bankrollService.getCurrentBalance(),
          activeBets: await this.getActiveBets(),
        });

        // Make betting decision
        if (this.shouldPlaceBet(riskAssessment)) {
          await this.placeBet(personalizedPrediction, riskAssessment);
        }
      }

      // Update bankroll metrics
      await this.updateBankrollMetrics();

      // Check for stop loss/take profit
      this.checkBankrollLimits();
    } catch (error) {
      this.notificationService.notify('error', 'Error in update cycle', { error });
    }
  }

  private setupEventListeners(): void {
    // Listen for bankroll events
    this.bankrollService.on('stopLoss', () => {
      this.notificationService.notify('warning', 'Stop loss reached');
      this.stop();
    });

    this.bankrollService.on('takeProfit', () => {
      this.notificationService.notify('success', 'Take profit reached');
      this.stop();
    });

    // Listen for risk events
    this.riskManagementService.on('highRisk', data => {
      this.notificationService.notify('warning', 'High risk detected', data);
    });

    // Listen for prediction events
    this.predictionOptimizationService.on('modelUpdate', data => {
      this.notificationService.notify('info', 'Prediction models updated', data);
    });
  }

  private async getMarketData(): Promise<any> {
    // Implement market data fetching
    return {};
  }

  private async getUserProfiles(): Promise<any[]> {
    // Implement user profile fetching
    return [];
  }

  private async getActiveBets(): Promise<any[]> {
    // Implement active bets fetching
    return [];
  }

  private shouldPlaceBet(riskAssessment: any): boolean {
    return (
      riskAssessment.riskLevel === 'low' &&
      riskAssessment.expectedValue > 0 &&
      riskAssessment.confidence > 0.7
    );
  }

  private async placeBet(prediction: any, riskAssessment: any): Promise<void> {
    try {
      const stake = this.calculateStake(riskAssessment);
      await this.unifiedBettingCore.placeBet({
        prediction,
        stake,
        riskAssessment,
      });

      this.notificationService.notify('success', 'Bet placed successfully', {
        prediction,
        stake,
        riskAssessment,
      });
    } catch (error) {
      this.notificationService.notify('error', 'Failed to place bet', { error });
    }
  }

  private calculateStake(riskAssessment: any): number {
    const maxStake = riskAssessment.maxStake;
    const recommendedStake = riskAssessment.recommendedStake;
    return Math.min(maxStake, recommendedStake);
  }

  private async updateBankrollMetrics(): Promise<void> {
    const metrics = await this.bankrollService.getMetrics();
    this.emit('metricsUpdated', metrics);
  }

  private checkBankrollLimits(): void {
    if (this.bankrollService.checkStopLoss()) {
      this.stop();
    }
    if (this.bankrollService.checkTakeProfit()) {
      this.stop();
    }
  }
}
