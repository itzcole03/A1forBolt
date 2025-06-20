import React, { useState, useEffect } from 'react';
import { Box, Slider, Typography, Paper, TextField, InputAdornment, Tooltip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { bettingService } from '../../services/bettingService';
import { formatCurrency } from '../../utils/formatters';

interface StakeSizingControlProps {
  onStakeChange: (stake: number) => void;
  maxStake?: number;
  minStake?: number;
  defaultStake?: number;
}

export const StakeSizingControl: React.FC<StakeSizingControlProps> = ({
  onStakeChange,
  maxStake = 1000,
  minStake = 10,
  defaultStake = 100,
}) => {
  const [stake, setStake] = useState(defaultStake);
  const [inputValue, setInputValue] = useState(defaultStake.toString());

  // Fetch bankroll metrics for stake validation
  const { data: metrics } = useQuery({
    queryKey: ['bankroll-metrics'],
    queryFn: () => bettingService.getBankrollMetrics(),
    staleTime: 30000, // Cache for 30 seconds
  });

  useEffect(() => {
    onStakeChange(stake);
  }, [stake, onStakeChange]);

  const handleSliderChange = (_: Event, newValue: number | number[]) => {
    const value = newValue as number;
    setStake(value);
    setInputValue(value.toString());
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    const numericValue = Number(value);
    if (!isNaN(numericValue)) {
      const clampedValue = Math.min(Math.max(numericValue, minStake), maxStake);
      setStake(clampedValue);
    }
  };

  const handleBlur = () => {
    const numericValue = Number(inputValue);
    if (isNaN(numericValue)) {
      setInputValue(stake.toString());
    } else {
      const clampedValue = Math.min(Math.max(numericValue, minStake), maxStake);
      setStake(clampedValue);
      setInputValue(clampedValue.toString());
    }
  };

  const getStakePercentage = () => {
    if (!metrics?.currentBalance) return 0;
    return (stake / metrics.currentBalance) * 100;
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Typography gutterBottom variant="h6">
        Stake Size
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
        <Slider
          max={maxStake}
          min={minStake}
          step={10}
          sx={{ flex: 1 }}
          value={stake}
          onChange={handleSliderChange}
        />
        <TextField
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          sx={{ width: '120px' }}
          value={inputValue}
          onBlur={handleBlur}
          onChange={handleInputChange}
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography color="text.secondary" variant="body2">
          {formatCurrency(minStake)} - {formatCurrency(maxStake)}
        </Typography>
        <Tooltip title="Percentage of current bankroll">
          <Typography color="text.secondary" variant="body2">
            {getStakePercentage().toFixed(1)}% of bankroll
          </Typography>
        </Tooltip>
      </Box>
    </Paper>
  );
};
