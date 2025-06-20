import React from 'react';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Tooltip,
  Chip,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { bettingService } from '../../services/bettingService';

export interface BettingModel {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  winRate: number;
  lastUpdated: string;
  features: string[];
  isActive: boolean;
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelChange }) => {
  // Fetch available models
  const { data: models, isLoading } = useQuery({
    queryKey: ['betting-models'],
    queryFn: () => bettingService.getAvailableModels(),
    staleTime: 300000, // Cache for 5 minutes
  });

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    onModelChange(event.target.value as string);
  };

  const selectedModelData = models?.find(m => m.id === selectedModel);

  return (
    <Paper sx={{ p: 2 }}>
      <Typography gutterBottom variant="h6">
        Prediction Model
      </Typography>

      <FormControl fullWidth>
        <InputLabel id="model-select-label">Select Model</InputLabel>
        <Select
          disabled={isLoading}
          label="Select Model"
          labelId="model-select-label"
          value={selectedModel}
          onChange={handleChange}
        >
          {models?.map(model => (
            <MenuItem key={model.id} value={model.id}>
              <Box>
                <Typography variant="subtitle1">{model.name}</Typography>
                <Typography color="text.secondary" variant="body2">
                  Accuracy: {model.accuracy.toFixed(1)}% | Win Rate: {model.winRate.toFixed(1)}%
                </Typography>
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedModelData && (
        <Box sx={{ mt: 2 }}>
          <Typography gutterBottom color="text.secondary" variant="body2">
            {selectedModelData.description}
          </Typography>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
            {selectedModelData.features.map(feature => (
              <Tooltip key={feature} title={`Model uses ${feature} for predictions`}>
                <Chip label={feature} size="small" variant="outlined" />
              </Tooltip>
            ))}
          </Box>

          <Typography color="text.secondary" sx={{ display: 'block', mt: 1 }} variant="caption">
            Last updated: {new Date(selectedModelData.lastUpdated).toLocaleString()}
          </Typography>
        </Box>
      )}
    </Paper>
  );
};
