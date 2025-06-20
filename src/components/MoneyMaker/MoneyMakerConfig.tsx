import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import { MoneyMakerConfig as ConfigType } from './types';

interface Props {
  onConfigChange: (config: ConfigType) => void;
  onActivate: () => void;
  onDeactivate: () => void;
  isActive: boolean;
}

const sports = [
  { value: 'nba', label: 'NBA' },
  { value: 'nfl', label: 'NFL' },
  { value: 'mlb', label: 'MLB' },
  { value: 'nhl', label: 'NHL' },
];

const strategies = [
  { value: 'maximum', label: 'Maximum Points' },
  { value: 'balanced', label: 'Balanced' },
  { value: 'contrarian', label: 'Contrarian' },
  { value: 'value', label: 'Value' },
];

export const MoneyMakerConfig: React.FC<Props> = ({
  onConfigChange,
  onActivate,
  onDeactivate,
  isActive,
}) => {
  const [config, setConfig] = React.useState<ConfigType>({
    entry: 100,
    timeWindow: '60',
    minWinRate: 84,
    strategy: 'maximum',
    maxLegs: 3,
    sport: 'nba',
  });

  const handleSelectChange = (field: keyof ConfigType) => (event: SelectChangeEvent) => {
    const newConfig = { ...config, [field]: event.target.value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  const handleSliderChange = (field: keyof ConfigType) => (_: Event, value: number | number[]) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);
    onConfigChange(newConfig);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography gutterBottom variant="h6">
        Configuration
      </Typography>

      <Grid container spacing={3}>
        <Grid item md={6} xs={12}>
          <FormControl fullWidth>
            <InputLabel>Sport</InputLabel>
            <Select label="Sport" value={config.sport} onChange={handleSelectChange('sport')}>
              {sports.map(sport => (
                <MenuItem key={sport.value} value={sport.value}>
                  {sport.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item md={6} xs={12}>
          <FormControl fullWidth>
            <InputLabel>Strategy</InputLabel>
            <Select
              label="Strategy"
              value={config.strategy}
              onChange={handleSelectChange('strategy')}
            >
              {strategies.map(strategy => (
                <MenuItem key={strategy.value} value={strategy.value}>
                  {strategy.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography gutterBottom>Entry Amount ($)</Typography>
          <Slider
            max={1000}
            min={10}
            step={10}
            value={config.entry}
            valueLabelDisplay="auto"
            onChange={handleSliderChange('entry')}
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography gutterBottom>Time Window (minutes)</Typography>
          <Slider
            max={120}
            min={15}
            step={15}
            value={parseInt(config.timeWindow)}
            valueLabelDisplay="auto"
            onChange={handleSliderChange('timeWindow')}
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography gutterBottom>Minimum Win Rate (%)</Typography>
          <Slider
            max={95}
            min={50}
            step={1}
            value={config.minWinRate}
            valueLabelDisplay="auto"
            onChange={handleSliderChange('minWinRate')}
          />
        </Grid>

        <Grid item md={6} xs={12}>
          <Typography gutterBottom>Maximum Legs</Typography>
          <Slider
            max={6}
            min={2}
            step={1}
            value={config.maxLegs}
            valueLabelDisplay="auto"
            onChange={handleSliderChange('maxLegs')}
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Button
              color={isActive ? 'error' : 'primary'}
              size="large"
              variant="contained"
              onClick={isActive ? onDeactivate : onActivate}
            >
              {isActive ? 'Deactivate' : 'Activate'} Money Maker
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
