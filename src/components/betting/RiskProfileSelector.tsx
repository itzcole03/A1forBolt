import React from 'react';
import {
  Box,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Typography,
  Paper,
} from '@mui/material';
import type { BettingSettings } from '../../services/bettingService';

type RiskProfile = BettingSettings['riskProfile'];

interface RiskProfileSelectorProps {
  currentProfile: RiskProfile;
  onProfileChange: (profile: RiskProfile) => void;
}

export const RiskProfileSelector: React.FC<RiskProfileSelectorProps> = ({
  currentProfile,
  onProfileChange,
}) => {
  return (
    <Paper sx={{ p: 2 }}>
      <FormControl component="fieldset">
        <FormLabel component="legend">
          <Typography variant="h6">Risk Profile</Typography>
        </FormLabel>
        <RadioGroup
          value={currentProfile}
          onChange={e => onProfileChange(e.target.value as RiskProfile)}
        >
          <FormControlLabel
            control={<Radio />}
            label={
              <Box>
                <Typography variant="subtitle1">Conservative</Typography>
                <Typography color="text.secondary" variant="body2">
                  Lower risk, higher confidence requirements
                </Typography>
              </Box>
            }
            value="conservative"
          />
          <FormControlLabel
            control={<Radio />}
            label={
              <Box>
                <Typography variant="subtitle1">Moderate</Typography>
                <Typography color="text.secondary" variant="body2">
                  Balanced risk and reward
                </Typography>
              </Box>
            }
            value="moderate"
          />
          <FormControlLabel
            control={<Radio />}
            label={
              <Box>
                <Typography variant="subtitle1">Aggressive</Typography>
                <Typography color="text.secondary" variant="body2">
                  Higher risk tolerance, more opportunities
                </Typography>
              </Box>
            }
            value="aggressive"
          />
        </RadioGroup>
      </FormControl>
    </Paper>
  );
};
