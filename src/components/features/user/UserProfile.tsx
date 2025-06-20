import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Button,
  TextField,
  IconButton,
  Divider,
  Chip,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PhotoCamera as PhotoCameraIcon,
} from '@mui/icons-material';

const ProfileCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: `4px solid ${theme.palette.primary.main}`,
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.8,
  },
}));

interface UserProfile {
  id: string;
  username: string;
  email: string;
  fullName: string;
  avatar: string;
  bio: string;
  location: string;
  joinDate: string;
  stats: {
    totalBets: number;
    winningBets: number;
    totalWagered: number;
    netProfit: number;
    winRate: number;
  };
  preferences: {
    favoriteSports: string[];
    favoriteTeams: string[];
    bettingStyle: string;
  };
}

const DEFAULT_PROFILE: UserProfile = {
  id: '1',
  username: 'betpro_user',
  email: 'user@example.com',
  fullName: 'John Doe',
  avatar: '/default-avatar.png',
  bio: 'Sports betting enthusiast and data analyst',
  location: 'New York, USA',
  joinDate: '2024-01-01',
  stats: {
    totalBets: 150,
    winningBets: 85,
    totalWagered: 5000,
    netProfit: 1250,
    winRate: 56.7,
  },
  preferences: {
    favoriteSports: ['NBA', 'NFL', 'MLB'],
    favoriteTeams: ['Lakers', '49ers', 'Yankees'],
    bettingStyle: 'Value Betting',
  },
};

export const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });

  const handleEdit = () => {
    setEditedProfile(profile);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // TODO: Implement profile update API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulated API call
      setProfile(editedProfile);
      setIsEditing(false);
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update profile',
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof UserProfile, value: string) => {
    setEditedProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditedProfile(prev => ({
          ...prev,
          avatar: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <ProfileCard>
      <CardContent>
        <Grid container spacing={3}>
          {/* Profile Header */}
          <Grid item xs={12} md={4} sx={{ textAlign: 'center' }}>
            <Box position="relative" display="inline-block">
              <StyledAvatar
                src={isEditing ? editedProfile.avatar : profile.avatar}
                alt={profile.fullName}
              />
              {isEditing && (
                <IconButton
                  component="label"
                  sx={{
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                    backgroundColor: 'primary.main',
                    color: 'white',
                    '&:hover': {
                      backgroundColor: 'primary.dark',
                    },
                  }}
                >
                  <input
                    type="file"
                    hidden
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <PhotoCameraIcon />
                </IconButton>
              )}
            </Box>
            <Typography variant="h5" sx={{ mt: 2 }}>
              {isEditing ? (
                <TextField
                  fullWidth
                  value={editedProfile.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              ) : (
                profile.fullName
              )}
            </Typography>
            <Typography variant="subtitle1" color="textSecondary">
              @{isEditing ? (
                <TextField
                  fullWidth
                  value={editedProfile.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                />
              ) : (
                profile.username
              )}
            </Typography>
          </Grid>

          {/* Profile Details */}
          <Grid item xs={12} md={8}>
            <Box display="flex" justifyContent="flex-end" mb={2}>
              {isEditing ? (
                <>
                  <Button
                    startIcon={<CancelIcon />}
                    onClick={handleCancel}
                    sx={{ mr: 1 }}
                  >
                    Cancel
                  </Button>
                  <Button
                    startIcon={<SaveIcon />}
                    variant="contained"
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} /> : 'Save'}
                  </Button>
                </>
              ) : (
                <Button
                  startIcon={<EditIcon />}
                  onClick={handleEdit}
                >
                  Edit Profile
                </Button>
              )}
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="subtitle2" color="textSecondary">
                  Bio
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    value={editedProfile.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                  />
                ) : (
                  <Typography>{profile.bio}</Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Email
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    type="email"
                    value={editedProfile.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                  />
                ) : (
                  <Typography>{profile.email}</Typography>
                )}
              </Grid>

              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="textSecondary">
                  Location
                </Typography>
                {isEditing ? (
                  <TextField
                    fullWidth
                    value={editedProfile.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                  />
                ) : (
                  <Typography>{profile.location}</Typography>
                )}
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Stats Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Betting Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Bets
                    </Typography>
                    <Typography variant="h6">
                      {profile.stats.totalBets}
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Win Rate
                    </Typography>
                    <Typography variant="h6">
                      {profile.stats.winRate}%
                    </Typography>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Net Profit
                    </Typography>
                    <Typography
                      variant="h6"
                      color={profile.stats.netProfit >= 0 ? 'success.main' : 'error.main'}
                    >
                      ${profile.stats.netProfit.toLocaleString()}
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
              </Grid>

              {/* Preferences Section */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Preferences
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Favorite Sports
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {profile.preferences.favoriteSports.map((sport) => (
                        <Chip
                          key={sport}
                          label={sport}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Favorite Teams
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {profile.preferences.favoriteTeams.map((team) => (
                        <Chip
                          key={team}
                          label={team}
                          sx={{ mr: 1, mb: 1 }}
                        />
                      ))}
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Betting Style
                    </Typography>
                    <Typography>{profile.preferences.bettingStyle}</Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </CardContent>
    </ProfileCard>
  );
}; 