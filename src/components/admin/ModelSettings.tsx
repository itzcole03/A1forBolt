import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Paper,
  Grid,
} from '@mui/material';
import { predictionService } from '../../services/predictionService';

interface ModelSettingsProps {
  onSettingsChange?: (settings: {
    modelType: string;
    confidenceThreshold: number;
    kellyThreshold: number;
  }) => void;
}

export const ModelSettings: React.FC<ModelSettingsProps> = ({ onSettingsChange }) => {
  const [modelType, setModelType] = useState('xgboost');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.7);
  const [kellyThreshold, setKellyThreshold] = useState(0.1);
  const [performance, setPerformance] = useState<any>(null);

  useEffect(() => {
    const fetchPerformance = async () => {
      const data = await predictionService.getModelPerformance(modelType);
      setPerformance(data);
    };
    fetchPerformance();
  }, [modelType]);

  const handleModelChange = (event: any) => {
    const newModelType = event.target.value;
    setModelType(newModelType);
    if (onSettingsChange) {
      onSettingsChange({
        modelType: newModelType,
        confidenceThreshold,
        kellyThreshold,
      });
    }
  };

  const handleConfidenceChange = (_: any, newValue: number | number[]) => {
    setConfidenceThreshold(newValue as number);
    if (onSettingsChange) {
      onSettingsChange({
        modelType,
        confidenceThreshold: newValue as number,
        kellyThreshold,
      });
    }
  };

  const handleKellyChange = (_: any, newValue: number | number[]) => {
    setKellyThreshold(newValue as number);
    if (onSettingsChange) {
      onSettingsChange({
        modelType,
        confidenceThreshold,
        kellyThreshold: newValue as number,
      });
    }
  };

  const handleClearCache = async () => {
    predictionService.clearCaches();
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Typography gutterBottom variant="h6">
        Model Settings
      </Typography>

      <Grid container spacing={3}>
        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <FormControl fullWidth>
            <InputLabel>Model Type</InputLabel>
            <Select label="Model Type" value={modelType} onChange={handleModelChange}>
              <MenuItem value="xgboost">XGBoost</MenuItem>
              <MenuItem value="lightgbm">LightGBM</MenuItem>
              <MenuItem value="catboost">CatBoost</MenuItem>
              <MenuItem value="neuralNetwork">Neural Network</MenuItem>
              <MenuItem value="randomForest">Random Forest</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Typography gutterBottom>Confidence Threshold</Typography>
          <Slider
            max={1}
            min={0}
            step={0.05}
            value={confidenceThreshold}
            valueLabelDisplay="auto"
            valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
            onChange={handleConfidenceChange}
          />
        </Grid>

        <Grid sx={{ width: { xs: '100%', md: '33.33%' } }}>
          <Typography gutterBottom>Kelly Criterion Threshold</Typography>
          <Slider
            max={0.5}
            min={0}
            step={0.01}
            value={kellyThreshold}
            valueLabelDisplay="auto"
            valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
            onChange={handleKellyChange}
          />
        </Grid>

        <Grid sx={{ width: '100%' }}>
          <Button color="secondary" sx={{ mt: 2 }} variant="contained" onClick={handleClearCache}>
            Clear Cache
          </Button>
        </Grid>

        {performance && (
          <Grid sx={{ width: '100%' }}>
            <Box sx={{ mt: 2 }}>
              <Typography gutterBottom variant="subtitle1">
                Model Performance
              </Typography>
              <Grid container spacing={2}>
                <Grid sx={{ width: '33.33%' }}>
                  <Typography variant="body2">Accuracy</Typography>
                  <Typography variant="h6">{(performance.accuracy * 100).toFixed(1)}%</Typography>
                </Grid>
                <Grid sx={{ width: '33.33%' }}>
                  <Typography variant="body2">ROI</Typography>
                  <Typography variant="h6">{(performance.roi * 100).toFixed(1)}%</Typography>
                </Grid>
                <Grid sx={{ width: '33.33%' }}>
                  <Typography variant="body2">Win Rate</Typography>
                  <Typography variant="h6">{(performance.win_rate * 100).toFixed(1)}%</Typography>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        )}
      </Grid>
    </Paper>
  );
};
