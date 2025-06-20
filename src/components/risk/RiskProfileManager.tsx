import React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Slider from '@mui/material/Slider';
import TextField from '@mui/material/TextField';
import { useRiskProfile } from '../../hooks/useRiskProfile';
import { RiskProfile } from '../../types/core';

export const RiskProfileManager: React.FC = () => {
  const { activeProfile, profiles, isLoading, error, updateProfile, setActiveProfile } =
    useRiskProfile();

  const [selectedProfile, setSelectedProfile] = React.useState<string>('');
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedProfile, setEditedProfile] = React.useState(activeProfile);

  React.useEffect(() => {
    if (activeProfile) {
      setSelectedProfile(activeProfile.id);
      setEditedProfile(activeProfile);
    }
  }, [activeProfile]);

  const handleProfileSelect = async (profileId: string) => {
    setSelectedProfile(profileId);
    await setActiveProfile(profileId);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (editedProfile) {
      const success = await updateProfile(editedProfile);
      if (success) {
        setIsEditing(false);
      }
    }
  };

  const handleCancel = () => {
    setEditedProfile(activeProfile);
    setIsEditing(false);
  };

  const handleProfileChange = (field: keyof RiskProfile, value: number) => {
    if (editedProfile) {
      setEditedProfile(prev => ({
        ...prev!,
        [field]: value,
        updatedAt: Date.now(),
      }));
    }
  };

  if (isLoading) {
    return (
      <Box alignItems="center" display="flex" justifyContent="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading risk profiles: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <Typography gutterBottom variant="h5">
        Risk Profile Management
      </Typography>

      <Grid container spacing={3}>
        <Grid item md={4} xs={12}>
          <Card>
            <CardContent>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Select Profile</InputLabel>
                <Select
                  label="Select Profile"
                  value={selectedProfile}
                  onChange={e => handleProfileSelect(e.target.value)}
                >
                  {profiles.map(profile => (
                    <MenuItem key={profile.id} value={profile.id}>
                      {profile.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {activeProfile && (
                <Box>
                  <Typography gutterBottom variant="h6">
                    {activeProfile.name}
                  </Typography>

                  {isEditing ? (
                    <Box>
                      <Typography gutterBottom>Maximum Stake</Typography>
                      <Slider
                        max={1000}
                        min={10}
                        step={10}
                        sx={{ mb: 2 }}
                        value={editedProfile?.maxStake || 0}
                        valueLabelDisplay="auto"
                        onChange={(_, value) => handleProfileChange('maxStake', value as number)}
                      />

                      <Typography gutterBottom>Minimum Stake</Typography>
                      <Slider
                        max={100}
                        min={1}
                        step={1}
                        sx={{ mb: 2 }}
                        value={editedProfile?.minStake || 0}
                        valueLabelDisplay="auto"
                        onChange={(_, value) => handleProfileChange('minStake', value as number)}
                      />

                      <Typography gutterBottom>Confidence Threshold</Typography>
                      <Slider
                        max={0.95}
                        min={0.5}
                        step={0.05}
                        sx={{ mb: 2 }}
                        value={editedProfile?.confidenceThreshold || 0}
                        valueLabelDisplay="auto"
                        onChange={(_, value) =>
                          handleProfileChange('confidenceThreshold', value as number)
                        }
                      />

                      <Box display="flex" gap={1} mt={2}>
                        <Button fullWidth color="primary" variant="contained" onClick={handleSave}>
                          Save Changes
                        </Button>
                        <Button fullWidth variant="outlined" onClick={handleCancel}>
                          Cancel
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    <Box>
                      <Typography gutterBottom color="text.secondary" variant="body2">
                        Maximum Stake: ${activeProfile.maxStake}
                      </Typography>
                      <Typography gutterBottom color="text.secondary" variant="body2">
                        Minimum Stake: ${activeProfile.minStake}
                      </Typography>
                      <Typography gutterBottom color="text.secondary" variant="body2">
                        Confidence Threshold: {(activeProfile.confidenceThreshold * 100).toFixed(0)}
                        %
                      </Typography>
                      <Button
                        fullWidth
                        color="primary"
                        sx={{ mt: 2 }}
                        variant="contained"
                        onClick={handleEdit}
                      >
                        Edit Profile
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item md={8} xs={12}>
          <Card>
            <CardContent>
              <Typography gutterBottom variant="h6">
                Risk Profile Statistics
              </Typography>
              {activeProfile && (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="body2">
                      Maximum Exposure
                    </Typography>
                    <Typography variant="h6">${activeProfile.maxExposure}</Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="body2">
                      Volatility Threshold
                    </Typography>
                    <Typography variant="h6">
                      {(activeProfile.volatilityThreshold * 100).toFixed(0)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="body2">
                      Stop Loss
                    </Typography>
                    <Typography variant="h6">
                      {(activeProfile.stopLossPercentage * 100).toFixed(0)}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography color="text.secondary" variant="body2">
                      Take Profit
                    </Typography>
                    <Typography variant="h6">
                      {(activeProfile.takeProfitPercentage * 100).toFixed(0)}%
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
