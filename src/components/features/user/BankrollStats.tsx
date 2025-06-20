import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Box,
  Slider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { bankrollService } from '@/services/bankroll';
import { usePredictionStore } from '@/store/predictionStore';

export const BankrollStats: React.FC = () => {
  const stats = bankrollService.getStats();
  const settings = bankrollService.getSettings();
  const setStrategyAutomation = usePredictionStore(state => state.setStrategyAutomation);

  const handleSettingChange = (setting: keyof typeof settings, value: any) => {
    bankrollService.updateSettings({ [setting]: value });
  };

  return (
    <Grid container spacing={3}>
      {/* Current Balance */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Current Balance
            </Typography>
            <Typography variant="h4" color="primary">
              ${stats.currentBalance.toFixed(2)}
            </Typography>
            <Box mt={2}>
              <Typography variant="body2" color="textSecondary">
                Net Profit: ${stats.netProfit.toFixed(2)}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                ROI: {stats.roi.toFixed(2)}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Performance Metrics */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Performance
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Win Rate
                </Typography>
                <Typography variant="h6">
                  {stats.winRate.toFixed(1)}%
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Avg Bet Size
                </Typography>
                <Typography variant="h6">
                  ${stats.averageBetSize.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Best Streak
                </Typography>
                <Typography variant="h6">
                  {stats.bestStreak}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Current Streak
                </Typography>
                <Typography variant="h6">
                  {stats.currentStreak}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Risk Management Settings */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Risk Management
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Max Bet Percentage
                </Typography>
                <Slider
                  value={settings.maxBetPercentage * 100}
                  onChange={(_, value) => handleSettingChange('maxBetPercentage', (value as number) / 100)}
                  min={1}
                  max={10}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Stop Loss Percentage
                </Typography>
                <Slider
                  value={settings.stopLossPercentage * 100}
                  onChange={(_, value) => handleSettingChange('stopLossPercentage', (value as number) / 100)}
                  min={5}
                  max={50}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Take Profit Percentage
                </Typography>
                <Slider
                  value={settings.takeProfitPercentage * 100}
                  onChange={(_, value) => handleSettingChange('takeProfitPercentage', (value as number) / 100)}
                  min={10}
                  max={100}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value}%`}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography gutterBottom>
                  Max Daily Bets
                </Typography>
                <Slider
                  value={settings.maxDailyBets}
                  onChange={(_, value) => handleSettingChange('maxDailyBets', value)}
                  min={1}
                  max={20}
                  valueLabelDisplay="auto"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={settings.autoRebalance}
                      onChange={(e) => handleSettingChange('autoRebalance', e.target.checked)}
                    />
                  }
                  label="Auto Rebalance"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* Progress Bars */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Progress
            </Typography>
            <Box mb={2}>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Stop Loss Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (Math.abs(stats.netProfit) / (stats.startingBalance * settings.stopLossPercentage)) * 100)}
                color="error"
              />
            </Box>
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Take Profit Progress
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, (stats.netProfit / (stats.startingBalance * settings.takeProfitPercentage)) * 100)}
                color="success"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}; 