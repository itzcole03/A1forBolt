import React from 'react';
import { Box, Typography, Button, ButtonGroup, Tooltip } from '@mui/material';
import { RiskProfileType } from '@/types/betting';

interface RiskProfileSelectorProps {
  currentProfile: RiskProfileType;
  onProfileChange: (profile: RiskProfileType) => void;
}

export const RiskProfileSelector: React.FC<RiskProfileSelectorProps> = ({
  currentProfile,
  onProfileChange,
}) => {
  const profiles = [
    {
      type: RiskProfileType.CONSERVATIVE,
      label: 'Conservative',
      description: 'Lower risk, higher confidence required',
    },
    {
      type: RiskProfileType.MODERATE,
      label: 'Moderate',
      description: 'Balanced risk and reward',
    },
    {
      type: RiskProfileType.AGGRESSIVE,
      label: 'Aggressive',
      description: 'Higher risk tolerance, more opportunities',
    },
  ];

  return (
    <Box>
      <Typography gutterBottom variant="h6">
        Risk Profile
      </Typography>
      <Typography gutterBottom color="text.secondary" variant="body2">
        Select your risk tolerance level
      </Typography>
      <ButtonGroup aria-label="risk profile selection" sx={{ mt: 2 }} variant="contained">
        {profiles.map(profile => (
          <Tooltip key={profile.type} placement="top" title={profile.description}>
            <Button
              color={currentProfile === profile.type ? 'primary' : 'inherit'}
              variant={currentProfile === profile.type ? 'contained' : 'outlined'}
              onClick={() => onProfileChange(profile.type)}
            >
              {profile.label}
            </Button>
          </Tooltip>
        ))}
      </ButtonGroup>
    </Box>
  );
};
