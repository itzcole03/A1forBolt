import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { useLogger } from '../../hooks/useLogger';
import { useMetrics } from '../../hooks/useMetrics';

interface FantasyPredictionEnhancerProps {
  fantasyData: Array<{
    playerId: string;
    playerName: string;
    team: string;
    position: string;
    salary: number;
    projectedPoints: number;
    actualPoints?: number;
    ownershipPercentage?: number;
    valueScore?: number;
  }>;
  predictions: Array<{
    playerId: string;
    playerName: string;
    predictedWinProbability: number;
    predictedScore: number;
  }>;
  onEnhancedPredictions: (
    enhancedPredictions: Array<{
      playerId: string;
      playerName: string;
      predictedWinProbability: number;
      predictedScore: number;
      fantasyValue: number;
      confidenceScore: number;
    }>
  ) => void;
}

export const FantasyPredictionEnhancer: React.FC<FantasyPredictionEnhancerProps> = ({
  fantasyData,
  predictions,
  onEnhancedPredictions,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enhancedPredictions, setEnhancedPredictions] = useState<
    Array<{
      playerId: string;
      playerName: string;
      predictedWinProbability: number;
      predictedScore: number;
      fantasyValue: number;
      confidenceScore: number;
    }>
  >([]);
  const logger = useLogger();
  const metrics = useMetrics();

  useEffect(() => {
    const enhancePredictions = async () => {
      if (!fantasyData.length || !predictions.length) return;

      setIsLoading(true);
      setError(null);

      try {
        // Match predictions with fantasy data
        const matchedData = predictions
          .map(prediction => {
            const fantasyPlayer = fantasyData.find(
              player => player.playerId === prediction.playerId
            );

            if (!fantasyPlayer) {
              return null;
            }

            // Calculate fantasy value score
            const fantasyValue = fantasyPlayer.valueScore || 0;

            // Calculate confidence score based on multiple factors
            const confidenceScore = calculateConfidenceScore(
              prediction.predictedWinProbability,
              prediction.predictedScore,
              fantasyValue,
              fantasyPlayer.ownershipPercentage || 0
            );

            return {
              playerId: prediction.playerId,
              playerName: prediction.playerName,
              predictedWinProbability: prediction.predictedWinProbability,
              predictedScore: prediction.predictedScore,
              fantasyValue,
              confidenceScore,
            };
          })
          .filter(Boolean) as Array<{
          playerId: string;
          playerName: string;
          predictedWinProbability: number;
          predictedScore: number;
          fantasyValue: number;
          confidenceScore: number;
        }>;

        setEnhancedPredictions(matchedData);
        onEnhancedPredictions(matchedData);

        metrics.track('predictions_enhanced', 1, {
          predictionCount: predictions.length.toString(),
          enhancedCount: matchedData.length.toString(),
        });

        logger.info('Successfully enhanced predictions with fantasy data', {
          predictionCount: predictions.length,
          enhancedCount: matchedData.length,
        });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to enhance predictions';
        setError(errorMessage);
        logger.error('Error enhancing predictions', { error: errorMessage });
        metrics.increment('prediction_enhancement_error');
      } finally {
        setIsLoading(false);
      }
    };

    enhancePredictions();
  }, [fantasyData, predictions, onEnhancedPredictions, logger, metrics]);

  const calculateConfidenceScore = (
    winProbability: number,
    predictedScore: number,
    fantasyValue: number,
    ownershipPercentage: number
  ): number => {
    // Normalize each factor to a 0-1 scale
    const normalizedWinProb = winProbability / 100;
    const normalizedScore = Math.min(predictedScore / 30, 1); // Assuming max score of 30
    const normalizedValue = Math.min(fantasyValue / 5, 1); // Assuming max value score of 5
    const normalizedOwnership = ownershipPercentage / 100;

    // Weight each factor
    const weights = {
      winProbability: 0.3,
      predictedScore: 0.3,
      fantasyValue: 0.25,
      ownership: 0.15,
    };

    // Calculate weighted average
    return (
      (normalizedWinProb * weights.winProbability +
        normalizedScore * weights.predictedScore +
        normalizedValue * weights.fantasyValue +
        normalizedOwnership * weights.ownership) *
      100
    ); // Convert to percentage
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" my={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h6">
          Enhanced Predictions
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Player</TableCell>
                <TableCell align="right">Win Probability</TableCell>
                <TableCell align="right">Predicted Score</TableCell>
                <TableCell align="right">Fantasy Value</TableCell>
                <TableCell align="right">Confidence</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {enhancedPredictions.map(prediction => (
                <TableRow key={prediction.playerId}>
                  <TableCell>{prediction.playerName}</TableCell>
                  <TableCell align="right">
                    {prediction.predictedWinProbability.toFixed(1)}%
                  </TableCell>
                  <TableCell align="right">{prediction.predictedScore.toFixed(1)}</TableCell>
                  <TableCell align="right">{prediction.fantasyValue.toFixed(2)}</TableCell>
                  <TableCell align="right">{prediction.confidenceScore.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );
};
