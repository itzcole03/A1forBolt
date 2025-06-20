import React from 'react';
import { Switch, FormControlLabel } from '@mui/material';
import { usePredictionStore } from '@/store/predictionStore';
import { strategyService } from '@/services/strategy';

interface Props {
  strategyName: string;
}

export const StrategyAutomationToggle: React.FC<Props> = ({ strategyName }) => {
  const isAutomated = usePredictionStore(state => state.automatedStrategies[strategyName] || false);
  const setStrategyAutomation = usePredictionStore(state => state.setStrategyAutomation);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = event.target.checked;
    setStrategyAutomation(strategyName, enabled);
    if (enabled) {
      strategyService.startAutomation(strategyName);
    } else {
      strategyService.stopAutomation(strategyName);
    }
  };

  return (
    <FormControlLabel
      control={<Switch checked={isAutomated} color="primary" onChange={handleChange} />}
      label="Automate"
    />
  );
};
