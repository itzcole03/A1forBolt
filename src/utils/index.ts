import dotenv from 'dotenv';
import express from 'express';
import { apiService } from './services/api/apiService';
import { dataIntegrationService } from './services/data/dataIntegrationService';
import { playerPropService } from './services/betting/playerPropService';
import { modelTrainingService } from './services/analytics/modelTrainingService';
import { featureEngineeringService } from './services/analytics/featureEngineeringService';
import { backtestingService } from './services/analytics/backtestingService';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
app.use(express.json());

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// API endpoints
app.post('/api/props/analyze', async (req, res) => {
  try {
    const analysis = await playerPropService.analyzeProp(req.body);
    res.json(analysis);
  } catch (error) {
    console.error('Error analyzing prop:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

app.post('/api/lineup/optimize', async (req, res) => {
  try {
    const { availableProps, targetLegs } = req.body;
    const optimization = await playerPropService.optimizeLineup(
      availableProps,
      targetLegs
    );
    res.json(optimization);
  } catch (error) {
    console.error('Error optimizing lineup:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

app.post('/api/backtest', async (req, res) => {
  try {
    const results = await backtestingService.runBacktest(req.body);
    res.json(results);
  } catch (error) {
    console.error('Error running backtest:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

app.post('/api/models/train', async (req, res) => {
  try {
    const { modelId, data, config } = req.body;
    const result = await modelTrainingService.trainModel(modelId, data, config);
    res.json(result);
  } catch (error) {
    console.error('Error training model:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Initialize services
async function initializeServices() {
  try {
    // Start data integration service
    dataIntegrationService.startAllStreams();

    // Subscribe to real-time data streams
    const dataStream = apiService.getDataStream();
    dataStream.subscribe({
      next: (data) => {
        console.log('Received real-time data update:', data);
        // Process real-time data updates
      },
      error: (error) => {
        console.error('Error in data stream:', error);
      }
    });

    console.log('Services initialized successfully');
  } catch (error) {
    console.error('Error initializing services:', error);
    process.exit(1);
  }
}

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  initializeServices();
}); 