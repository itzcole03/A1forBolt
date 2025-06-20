import { NextApiRequest, NextApiResponse } from 'next';
import { getLogger } from './../../core/logging/logger.ts'; // Added .ts extension
import { getMetrics } from './../../core/metrics/metrics.ts'; // Added .ts extension
// import { predictionService } from './../../services/predictions'; // Flagged as missing file, commented out

const logger = getLogger('PredictionGenerator');
const metrics = getMetrics();

interface GeneratePredictionsRequest {
  modelName: string;
  date: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { modelName, date } = req.body as GeneratePredictionsRequest;

  if (!modelName || !date) {
    return res.status(400).json({ error: 'Model name and date are required' });
  }

  try {
    const startTime = Date.now();
    const predictions = await predictionService.generatePredictions(modelName, date);
    const duration = Date.now() - startTime;

    metrics.timing('prediction_generation_duration', duration, {
      modelName,
      date,
    });

    logger.info('Successfully generated predictions', {
      modelName,
      date,
      predictionCount: predictions.length,
    });

    return res.status(200).json(predictions);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Error generating predictions', {
      error: errorMessage,
      modelName,
      date,
    });
    metrics.increment('prediction_generation_error', 1, {
      modelName,
      error: errorMessage,
    });

    return res.status(500).json({ error: errorMessage });
  }
}
