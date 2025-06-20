import React, { useState, useEffect } from 'react';
import { UnifiedServiceRegistry } from '../../services/unified/UnifiedServiceRegistry';
import { UnifiedPredictionService } from '../../services/unified/UnifiedPredictionService';
import { UnifiedAnalyticsService } from '../../services/unified/UnifiedAnalyticsService';
import { UnifiedWebSocketService } from '../../services/unified/UnifiedWebSocketService';
import { UnifiedStateService } from '../../services/unified/UnifiedStateService';
import { UnifiedSettingsService } from '../../services/unified/UnifiedSettingsService';
import { UnifiedNotificationService } from '../../services/unified/UnifiedNotificationService';
import { UnifiedErrorService } from '../../services/unified/UnifiedErrorService';
import { Card, Button, Spinner, Badge, Modal, Toast } from '../ui/UnifiedUI';

interface Prediction {
  id: string;
  eventId: string;
  marketType: string;
  prediction: number;
  confidence: number;
  timestamp: number;
  features: Record<string, number>;
  modelVersion: string;
  metadata: Record<string, any>;
}

interface PredictionOpportunity {
  id: string;
  eventId: string;
  marketType: string;
  prediction: number;
  confidence: number;
  expectedValue: number;
  kellyFraction: number;
  timestamp: number;
  metadata: Record<string, any>;
}

export const UnifiedPredictionInterface: React.FC = () => {
  // Initialize services
  const serviceRegistry = UnifiedServiceRegistry.getInstance();
  const predictionService = serviceRegistry.getService<UnifiedPredictionService>('prediction');
  const analyticsService = serviceRegistry.getService<UnifiedAnalyticsService>('analytics');
  const webSocketService = serviceRegistry.getService<UnifiedWebSocketService>('websocket');
  const stateService = serviceRegistry.getService<UnifiedStateService>('state');
  const settingsService = serviceRegistry.getService<UnifiedSettingsService>('settings');
  const notificationService =
    serviceRegistry.getService<UnifiedNotificationService>('notification');
  const errorService = serviceRegistry.getService<UnifiedErrorService>('error');

  // State
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [opportunities, setOpportunities] = useState<PredictionOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  } | null>(null);

  // Load data
  useEffect(() => {
    loadData();
    setupWebSocket();
    return () => {
      webSocketService.disconnect();
    };
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [predictions, opportunities] = await Promise.all([
        predictionService.getPredictions(),
        predictionService.getOpportunities(),
      ]);
      setPredictions(predictions);
      setOpportunities(opportunities);
    } catch (error) {
      handleError('Failed to load prediction data', error);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    webSocketService.connect();
    webSocketService.subscribe('predictions', data => {
      setPredictions(prev => [...prev, data]);
      notificationService.notifyUser({
        type: 'info',
        message: 'New prediction available',
        data,
      });
    });
    webSocketService.subscribe('opportunities', data => {
      setOpportunities(prev => [...prev, data]);
      notificationService.notifyUser({
        type: 'info',
        message: 'New opportunity detected',
        data,
      });
    });
  };

  const handleError = (message: string, error: any) => {
    setError(message);
    setToast({ message, type: 'error' });
    errorService.handleError(error, {
      code: 'PREDICTION_ERROR',
      source: 'UnifiedPredictionInterface',
      details: { message },
    });
  };

  const handlePredictionClick = (prediction: Prediction) => {
    setSelectedPrediction(prediction);
    setShowDetailsModal(true);
  };

  const handleOpportunityClick = async (opportunity: PredictionOpportunity) => {
    try {
      await predictionService.analyzeOpportunity(opportunity);
      setToast({
        message: 'Opportunity analyzed successfully',
        type: 'success',
      });
    } catch (error) {
      handleError('Failed to analyze opportunity', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={loadData}>
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Predictions & Opportunities</h1>
        <div className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Button variant="primary" onClick={loadData}>
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Predictions */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Predictions</h2>
          <div className="space-y-4">
            {predictions.map(prediction => (
              <Card
                key={prediction.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handlePredictionClick(prediction)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{prediction.marketType}</h3>
                    <p className="text-sm text-gray-600">Event ID: {prediction.eventId}</p>
                  </div>
                  <Badge
                    variant={
                      prediction.confidence >= 0.8
                        ? 'success'
                        : prediction.confidence >= 0.6
                          ? 'primary'
                          : 'secondary'
                    }
                  >
                    {prediction.confidence.toFixed(2)}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Prediction: {prediction.prediction.toFixed(2)}
                  </p>
                  <p className="text-xs text-gray-500">Model: {prediction.modelVersion}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Opportunities */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Betting Opportunities</h2>
          <div className="space-y-4">
            {opportunities.map(opportunity => (
              <Card
                key={opportunity.id}
                className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => handleOpportunityClick(opportunity)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{opportunity.marketType}</h3>
                    <p className="text-sm text-gray-600">Event ID: {opportunity.eventId}</p>
                  </div>
                  <Badge
                    variant={
                      opportunity.expectedValue >= 0.1
                        ? 'success'
                        : opportunity.expectedValue >= 0
                          ? 'primary'
                          : 'danger'
                    }
                  >
                    EV: {opportunity.expectedValue.toFixed(2)}
                  </Badge>
                </div>
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Prediction: {opportunity.prediction.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Kelly Fraction: {opportunity.kellyFraction.toFixed(2)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Prediction Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        title="Prediction Details"
        onClose={() => setShowDetailsModal(false)}
      >
        {selectedPrediction && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Market Information</h3>
              <p className="text-sm text-gray-600">Type: {selectedPrediction.marketType}</p>
              <p className="text-sm text-gray-600">Event ID: {selectedPrediction.eventId}</p>
            </div>
            <div>
              <h3 className="font-semibold">Prediction Details</h3>
              <p className="text-sm text-gray-600">
                Value: {selectedPrediction.prediction.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600">
                Confidence: {selectedPrediction.confidence.toFixed(2)}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Features</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedPrediction.features).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span className="ml-2">{value.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-semibold">Metadata</h3>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(selectedPrediction.metadata).map(([key, value]) => (
                  <div key={key} className="text-sm">
                    <span className="text-gray-600">{key}:</span>
                    <span className="ml-2">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Toast Notifications */}
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
};
