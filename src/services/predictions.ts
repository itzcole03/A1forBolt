import { predictionService } from './predictionService';

export const usePredictionService = () => {
  return {
    generateEnsemblePrediction: predictionService.predict?.bind(predictionService),
    getPredictionHistory: predictionService.getGeneralInsights?.bind(predictionService),
    getModelPerformance: undefined, // Add if you have a method for this
  };
};
