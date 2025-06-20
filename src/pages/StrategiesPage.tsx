import React from 'react';
import { Card, CardContent, Typography, Grid } from '@mui/material';
import { strategyService } from '@/services/strategy';
import { StrategyAutomationToggle } from '@/components/StrategyAutomationToggle';

export const StrategiesPage: React.FC = () => {
  const strategies = strategyService.getAllStrategies();

  return (
    <Grid container spacing={2}>
      {strategies.map(strategy => (
        <Grid key={strategy.name} item md={6} xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6">{strategy.name}</Typography>
              <Typography color="textSecondary" variant="body2">
                {strategy.description}
              </Typography>
              <StrategyAutomationToggle strategyName={strategy.name} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
