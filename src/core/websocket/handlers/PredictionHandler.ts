import { WebSocketManager } from '../WebSocketManager';
import { FinalPredictionEngine } from '../../FinalPredictionEngine/types';
import { UnifiedLogger } from '../../logging/types';
import { PredictionRequest, PredictionResponse } from '../../types/prediction';

export class PredictionHandler {
  private readonly PREDICTION_TOPIC = 'predictions';
  private readonly UPDATE_INTERVAL = 5000; // 5 seconds
  private updateInterval: NodeJS.Timeout | null = null;

  constructor(
    private wsManager: WebSocketManager,
    private predictionEngine: FinalPredictionEngine,
    private logger: UnifiedLogger
  ) {
    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.wsManager.on('message', (clientId, message, topic) => {
      if (message.type === 'prediction_request' && topic === this.PREDICTION_TOPIC) {
        this.handlePredictionRequest(clientId, message.data);
      }
    });

    this.wsManager.on('disconnect', clientId => {
      this.logger.info(`Client ${clientId} disconnected from predictions`);
    });
  }

  private async handlePredictionRequest(
    clientId: string,
    request: PredictionRequest
  ): Promise<void> {
    try {
      const prediction = await this.predictionEngine.generatePrediction(request);
      this.wsManager.sendMessage(clientId, {
        type: 'prediction_response',
        data: prediction,
        timestamp: Date.now(),
      });
    } catch (error) {
      this.logger.error(`Error generating prediction for client ${clientId}: ${error}`);
      this.wsManager.sendMessage(clientId, {
        type: 'error',
        data: { message: 'Failed to generate prediction' },
        timestamp: Date.now(),
      });
    }
  }

  startRealTimeUpdates(): void {
    if (this.updateInterval) {
      return;
    }

    this.updateInterval = setInterval(async () => {
      try {
        const activeClients = this.wsManager.getSubscriberCount(this.PREDICTION_TOPIC);
        if (activeClients === 0) {
          return;
        }

        // Get predictions for active events
        const request: PredictionRequest = {
          sport: 'all',
          eventId: 'active',
          riskProfile: { level: 'medium' },
        };

        const prediction = await this.predictionEngine.generatePrediction(request);
        this.wsManager.broadcast(
          {
            type: 'prediction_update',
            data: prediction,
            timestamp: Date.now(),
          },
          this.PREDICTION_TOPIC
        );
      } catch (error) {
        this.logger.error(`Error in real-time prediction updates: ${error}`);
      }
    }, this.UPDATE_INTERVAL);
  }

  stopRealTimeUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  cleanup(): void {
    this.stopRealTimeUpdates();
  }
}
