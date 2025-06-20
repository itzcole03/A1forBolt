import React, { useEffect } from 'react';
import { Box } from '@mui/material';
import { BettingSettingsPanel } from './BettingSettingsPanel';
import { BettingSettingsSummary } from './BettingSettingsSummary';
import { useBettingSettings } from '../../hooks/useBettingSettings';

export const BettingSettingsContainer: React.FC = () => {
  const { fetchSettings } = useBettingSettings();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '2fr 1fr',
          },
          gap: 3,
        }}
      >
        <BettingSettingsPanel />
        <BettingSettingsSummary />
      </Box>
    </Box>
  );
};
