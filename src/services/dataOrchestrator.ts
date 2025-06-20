import { RealTimeUpdateService } from './realTimeUpdateService.js';
import { UnifiedPredictionService } from './unified/UnifiedPredictionService.js';
import { UserPersonalizationService } from './analytics/userPersonalizationService.js';
import { usePredictionStore } from '../stores/predictionStore.js';
import { ShapExplainerService } from './analytics/ShapExplainerService.js';
import { PatternRecognitionService } from './analytics/PatternRecognitionService.js';
import { RiskAssessmentService } from './analytics/RiskAssessmentService.js';
import { ModelPerformanceTracker } from './analytics/ModelPerformanceTracker.js';
import { logLiveData } from './integrations/liveDataLogger.js';
import type { PredictionResult } from './unified/UnifiedPredictionService.js';

const rtu = new RealTimeUpdateService();
const predictionService = UnifiedPredictionService.getInstance();
const personalizationService = UserPersonalizationService.getInstance();

// Listen for real-time game, odds, and sentiment updates
rtu.on('games', () => {
  // Optionally update game state in a Zustand store or trigger prediction recalculation
  // ...
});

rtu.on('odds', (odds: any[]) => {
  // For each odds update, trigger prediction recalculation and update store
  odds.forEach((oddsUpdate: any) => {
    // Example: recalculate prediction
    // predictionService.recalculatePredictionForOdds(oddsUpdate);
    // Optionally update prediction store here if needed
    // (No setOpportunities in event-based prediction store)
  });
});

rtu.on('sentiment', () => {
  // Optionally update personalization or analytics
  // personalizationService.updateSentiment(sentiment);
});

// Add more listeners as needed for other data types

// Listen for real-time prediction updates
predictionService.subscribeToPredictions(async (prediction: PredictionResult) => {
  try {
    // 1. SHAP Explainability
    const shap = await ShapExplainerService.explainPrediction(
      prediction.metadata?.modelVersion || {},
      prediction.metadata?.features || {}
    );
    // 2. Pattern Recognition
    const patterns = PatternRecognitionService.analyzeMarketPatterns([
      prediction
    ]);
    // 3. Risk Assessment
    const risk = RiskAssessmentService.assessRisk(prediction);
    // 4. Model Performance Tracking
    ModelPerformanceTracker.logPrediction(
      prediction.metadata?.modelVersion || 'unknown',
      prediction
    );
    const perf = ModelPerformanceTracker.getStats(
      prediction.metadata?.modelVersion || 'unknown'
    );
    // Compose analytics payload
    const analytics = {
      shap,
      patterns,
      risk,
      perf,
      timestamp: Date.now(),
      modelId: prediction.metadata?.modelVersion || 'unknown',
    };
    // Update Zustand prediction store (merge analytics)
    usePredictionStore.getState().updatePrediction(prediction.event, {
      ...prediction,
      analytics,
      timestamp: new Date().toISOString(),
    });
    // Update user personalization
    personalizationService.emit('analytics', {
      predictionId: prediction.id,
      analytics,
    });
    logLiveData(`Analytics pipeline complete for prediction ${prediction.id}`);
  } catch (err) {
    logLiveData(`Analytics pipeline error: ${err}`);
  }
});

// Fallback/error handling is built into RealTimeUpdateService

export default rtu;
