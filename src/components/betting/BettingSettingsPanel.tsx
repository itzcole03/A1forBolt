import React, { useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Button,
} from '@mui/material';
import { RiskProfileSelector } from './RiskProfileSelector';
import { StakeSizingControl } from './StakeSizingControl';
import { ModelSelector } from './ModelSelector';
import { useBettingSettings } from '../../hooks/useBettingSettings';

export const BettingSettingsPanel: React.FC = () => {
  const {
    settings,
    isLoading,
    error,
    handleRiskProfileChange,
    handleStakeChange,
    handleModelChange,
    resetSettings,
  } = useBettingSettings();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Paper elevation={3} sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6">Betting Settings</Typography>
        <Button color="primary" variant="outlined" onClick={resetSettings}>
          Reset to Default
        </Button>
      </Box>

      <Stack spacing={3}>
        <Box>
          <Typography gutterBottom variant="subtitle1">
            Risk Profile
          </Typography>
          <RiskProfileSelector
            currentProfile={settings.riskProfile}
            onProfileChange={handleRiskProfileChange}
          />
        </Box>

        <Divider />

        <Box>
          <Typography gutterBottom variant="subtitle1">
            Stake Size
          </Typography>
          <StakeSizingControl
            defaultStake={settings.stakeSize}
            maxStake={settings.maxStake}
            minStake={settings.minStake}
            onStakeChange={handleStakeChange}
          />
        </Box>

        <Divider />

        <Box>
          <Typography gutterBottom variant="subtitle1">
            Prediction Model
          </Typography>
          <ModelSelector selectedModel={settings.modelId} onModelChange={handleModelChange} />
        </Box>
      </Stack>
    </Paper>
  );
};
