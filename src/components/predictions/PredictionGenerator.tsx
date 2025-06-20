import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  SelectChangeEvent,
} from '@mui/material';
import { useLogger } from '../../hooks/useLogger';
import { useMetrics } from '../../hooks/useMetrics';

interface PredictionGeneratorProps {
  modelName: string;
  availableModels: string[];
  onPredictionsGenerated: (
    predictions: Array<{
      playerId: string;
      playerName: string;
      predictedWinProbability: number;
      predictedScore: number;
      confidence: number;
      timestamp: string;
    }>
  ) => void;
}

export const PredictionGenerator: React.FC<PredictionGeneratorProps> = ({
  modelName,
  availableModels,
  onPredictionsGenerated,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedModel, setSelectedModel] = useState(modelName);
  const [predictions, setPredictions] = useState<
    Array<{
      playerId: string;
      playerName: string;
      predictedWinProbability: number;
      predictedScore: number;
      confidence: number;
      timestamp: string;
    }>
  >([]);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const logger = useLogger();
  const metrics = useMetrics();

  useEffect(() => {
    setSelectedModel(modelName);
  }, [modelName]);

  const handleModelChange = (event: SelectChangeEvent) => {
    setSelectedModel(event.target.value);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDate(event.target.value);
  };

  const generatePredictions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/predictions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelName: selectedModel,
          date,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate predictions: ${response.statusText}`);
      }

      const data = await response.json();
      const timestamp = new Date().toISOString();

      const processedPredictions = data.map((prediction: any) => ({
        ...prediction,
        timestamp,
      }));

      setPredictions(processedPredictions);
      onPredictionsGenerated(processedPredictions);

      metrics.track('predictions_generated', 1, {
        modelName: selectedModel,
        predictionCount: processedPredictions.length.toString(),
      });

      logger.info('Successfully generated predictions', {
        modelName: selectedModel,
        predictionCount: processedPredictions.length,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate predictions';
      setError(errorMessage);
      logger.error('Error generating predictions', { error: errorMessage });
      metrics.increment('prediction_generation_error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h6">
          Generate Predictions
        </Typography>

        <Grid container spacing={3}>
          <Grid item md={4} xs={12}>
            <FormControl fullWidth>
              <InputLabel>Model</InputLabel>
              <Select label="Model" value={selectedModel} onChange={handleModelChange}>
                {availableModels.map(model => (
                  <MenuItem key={model} value={model}>
                    {model}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item md={4} xs={12}>
            <TextField
              fullWidth
              InputLabelProps={{ shrink: true }}
              label="Date"
              type="date"
              value={date}
              onChange={handleDateChange}
            />
          </Grid>
          <Grid item md={4} xs={12}>
            <Button
              fullWidth
              color="primary"
              disabled={isLoading}
              sx={{ height: '56px' }}
              variant="contained"
              onClick={generatePredictions}
            >
              Generate Predictions
            </Button>
          </Grid>
        </Grid>

        {isLoading && (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {predictions.length > 0 && (
          <Box mt={3}>
            <Typography gutterBottom variant="subtitle1">
              Generated Predictions
            </Typography>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Player</TableCell>
                    <TableCell align="right">Win Probability</TableCell>
                    <TableCell align="right">Predicted Score</TableCell>
                    <TableCell align="right">Confidence</TableCell>
                    <TableCell align="right">Generated At</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {predictions.map(prediction => (
                    <TableRow key={prediction.playerId}>
                      <TableCell>{prediction.playerName}</TableCell>
                      <TableCell align="right">
                        {prediction.predictedWinProbability.toFixed(1)}%
                      </TableCell>
                      <TableCell align="right">{prediction.predictedScore.toFixed(1)}</TableCell>
                      <TableCell align="right">{prediction.confidence.toFixed(1)}%</TableCell>
                      <TableCell align="right">
                        {new Date(prediction.timestamp).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
