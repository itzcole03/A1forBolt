import React, { useEffect, useState } from 'react';
import { Box, Typography, Container, CircularProgress, Alert, Divider } from '@mui/material';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { predictionService, Prediction } from '../services/predictionService';
import { LivePredictions } from '../components/predictions/LivePredictions';
import { ModelPerformance } from '../components/predictions/ModelPerformance';
import { BettingOpportunities } from '../components/predictions/BettingOpportunities';
import { useWebSocket } from '../hooks/useWebSocket';
import { BettingSettingsContainer } from '../components/betting/BettingSettingsContainer';

const PredictionsDashboard: React.FC = () => {
  const [error, setError] = useState<string | null>(null);

  // Fetch initial predictions
  const { data: predictions, isLoading: predictionsLoading } = useQuery<Prediction[]>({
    queryKey: ['predictions'],
    queryFn: () => predictionService.getRecentPredictions(),
    staleTime: 30000,
  });

  // Fetch model performance
  const { data: performance, isLoading: performanceLoading } = useQuery({
    queryKey: ['model-performance'],
    queryFn: () => predictionService.getModelPerformance('xgboost'),
    staleTime: 60000,
  });

  // WebSocket connection for real-time updates
  const { lastMessage, isConnected } = useWebSocket(`${process.env.VITE_WS_URL}/ws/predictions`);
  useEffect(() => {
    if (lastMessage) {
      // TODO: Handle real-time prediction updates if needed
      // const data = JSON.parse(lastMessage.data);
      // if (data.type === 'prediction_update') { ... }
    }
  }, [lastMessage]);

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <motion.div animate={{ opacity: 1 }} exit={{ opacity: 0 }} initial={{ opacity: 0 }}>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography gutterBottom component="h1" variant="h4">
          Predictions Dashboard
        </Typography>

        <BettingSettingsContainer />
        <Divider sx={{ my: 4 }} />

        {!isConnected && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Connecting to prediction server...
          </Alert>
        )}

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
            },
            gap: 3,
          }}
        >
          {/* Live Predictions */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography gutterBottom variant="h6">
              Live Predictions
            </Typography>
            {predictionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <LivePredictions predictions={predictions || []} />
            )}
          </Box>

          {/* Model Performance */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography gutterBottom variant="h6">
              Model Performance
            </Typography>
            {performanceLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <ModelPerformance metrics={performance || {}} />
            )}
          </Box>

          {/* Betting Opportunities */}
          <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            <Typography gutterBottom variant="h6">
              Betting Opportunities
            </Typography>
            {predictionsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <BettingOpportunities predictions={predictions || []} />
            )}
          </Box>
        </Box>
      </Container>
    </motion.div>
  );
};

export default PredictionsDashboard;
