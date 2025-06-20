import { Router, Request, Response } from 'express';
import { PredictionIntegrationService } from './services/prediction/PredictionIntegrationService.ts';

const router = Router();
const predictionService = new PredictionIntegrationService();

// Generate predictions
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const predictions = await predictionService.generatePredictions(req.body);
    res.json(predictions);
  } catch (error) {
    console.error('Error generating predictions:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Update models with new data
router.post('/update', async (req: Request, res: Response) => {
  try {
    await predictionService.updateModels(req.body);
    res.json({ status: 'success' });
  } catch (error) {
    console.error('Error updating models:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Evaluate model performance
router.get('/evaluate', async (_req: Request, res: Response) => {
  try {
    const evaluation = await predictionService.evaluateModels();
    res.json(evaluation);
  } catch (error) {
    console.error('Error evaluating models:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Get model comparisons
router.get('/compare', async (_req: Request, res: Response) => {
  try {
    const comparison = await predictionService.getModelComparison();
    res.json(comparison);
  } catch (error) {
    console.error('Error getting model comparison:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Get performance metrics
router.get('/metrics', async (_req: Request, res: Response) => {
  try {
    const metrics = await predictionService.getPerformanceMetrics();
    res.json(metrics);
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

// Get daily fantasy recommendations
router.get('/fantasy', async (_req: Request, res: Response) => {
  try {
    const recommendations = await predictionService.getFantasyRecommendations();
    res.json(recommendations);
  } catch (error) {
    console.error('Error getting fantasy recommendations:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
});

export { router as predictionRouter };
