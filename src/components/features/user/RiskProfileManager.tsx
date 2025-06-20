import React from 'react';
import { useRiskProfileStore, RiskLevel } from '../stores/riskProfileStore';
import {
  Box,
  Typography,
  Paper,
  Slider,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const ProfileContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
}));

const SliderContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
}));

export const RiskProfileManager: React.FC = () => {
  const { currentProfile, bankroll, updateRiskProfile, updateBankroll } = useRiskProfileStore();

  const handleProfileTypeChange = (event: SelectChangeEvent<RiskLevel>) => {
    updateRiskProfile({ profile_type: event.target.value });
  };

  const handleMaxStakeChange = (_: Event, newValue: number | number[]) => {
    updateRiskProfile({ max_stake_percentage: newValue as number });
  };

  const handleMaxDailyLossChange = (_: Event, newValue: number | number[]) => {
    updateRiskProfile({ max_daily_loss: newValue as number });
  };

  const handleMaxConcurrentBetsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(event.target.value);
    if (!isNaN(value)) {
      updateRiskProfile({ max_concurrent_bets: value });
    }
  };

  const handleMinConfidenceChange = (_: Event, newValue: number | number[]) => {
    updateRiskProfile({ min_confidence: newValue as number });
  };

  const handleKellyFractionChange = (_: Event, newValue: number | number[]) => {
    updateRiskProfile({ kelly_fraction: newValue as number });
  };

  const handleBankrollChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(event.target.value);
    if (!isNaN(value)) {
      updateBankroll(value);
    }
  };

  return (
    <ProfileContainer>
      <Typography gutterBottom variant="h6">
        Risk Profile Settings
      </Typography>

      <FormControl fullWidth margin="normal">
        <InputLabel>Risk Profile Type</InputLabel>
        <Select
          label="Risk Profile Type"
          value={currentProfile.profile_type}
          onChange={handleProfileTypeChange}
        >
          <MenuItem value="conservative">Conservative</MenuItem>
          <MenuItem value="moderate">Moderate</MenuItem>
          <MenuItem value="aggressive">Aggressive</MenuItem>
        </Select>
      </FormControl>

      <SliderContainer>
        <Typography gutterBottom>Maximum Stake Percentage</Typography>
        <Slider
          max={0.2}
          min={0.01}
          step={0.01}
          value={currentProfile.max_stake_percentage}
          valueLabelDisplay="auto"
          valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
          onChange={handleMaxStakeChange}
        />
      </SliderContainer>

      <SliderContainer>
        <Typography gutterBottom>Maximum Daily Loss</Typography>
        <Slider
          max={0.3}
          min={0.05}
          step={0.05}
          value={currentProfile.max_daily_loss}
          valueLabelDisplay="auto"
          valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
          onChange={handleMaxDailyLossChange}
        />
      </SliderContainer>

      <TextField
        fullWidth
        inputProps={{ min: 1, max: 10 }}
        label="Maximum Concurrent Bets"
        margin="normal"
        type="number"
        value={currentProfile.max_concurrent_bets}
        onChange={handleMaxConcurrentBetsChange}
      />

      <SliderContainer>
        <Typography gutterBottom>Minimum Confidence</Typography>
        <Slider
          max={0.9}
          min={0.5}
          step={0.05}
          value={currentProfile.min_confidence}
          valueLabelDisplay="auto"
          valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
          onChange={handleMinConfidenceChange}
        />
      </SliderContainer>

      <SliderContainer>
        <Typography gutterBottom>Kelly Criterion Fraction</Typography>
        <Slider
          max={1}
          min={0.1}
          step={0.1}
          value={currentProfile.kelly_fraction}
          valueLabelDisplay="auto"
          valueLabelFormat={value => `${(value * 100).toFixed(0)}%`}
          onChange={handleKellyFractionChange}
        />
      </SliderContainer>

      <TextField
        fullWidth
        inputProps={{ min: 0, step: 100 }}
        InputProps={{
          startAdornment: <Typography>$</Typography>,
        }}
        label="Bankroll"
        margin="normal"
        type="number"
        value={bankroll}
        onChange={handleBankrollChange}
      />
    </ProfileContainer>
  );
};
