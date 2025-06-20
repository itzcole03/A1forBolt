import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  LocalFireDepartment as FireIcon,
  EmojiEvents as TrophyIcon,
  ThumbUp as ThumbUpIcon,
  Comment as CommentIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

interface TrendingProp {
  id: string;
  playerName: string;
  team: string;
  propType: string;
  value: number;
  direction: 'over' | 'under';
  modifier?: 'goblin' | 'devil';
  confidence: number;
  fireCount: number;
  communityStats: {
    likes: number;
    comments: number;
    shares: number;
  };
  topComment?: {
    user: string;
    avatar?: string;
    text: string;
    likes: number;
  };
}

interface TrendingPropsProps {
  props: TrendingProp[];
  onPropSelect: (propId: string) => void;
}

const TrendingCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

const ConfidenceBar = styled(LinearProgress)(({ theme }) => ({
  height: 4,
  borderRadius: 2,
  marginTop: theme.spacing(0.5),
}));

export const TrendingProps: React.FC<TrendingPropsProps> = ({ props, onPropSelect }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success.main';
    if (confidence >= 60) return 'primary.main';
    if (confidence >= 40) return 'warning.main';
    return 'error.main';
  };

  return (
    <Box>
      <Typography gutterBottom variant="h6">
        Trending Props
      </Typography>
      <Grid container spacing={2}>
        {props.map(prop => (
          <Grid key={prop.id} item xs={12}>
            <TrendingCard>
              <CardContent>
                <Grid container spacing={2}>
                  {/* Header */}
                  <Grid item xs={12}>
                    <Box alignItems="center" display="flex" justifyContent="space-between">
                      <Typography variant="h6">{prop.playerName}</Typography>
                      <Box alignItems="center" display="flex" gap={1}>
                        <FireIcon color="error" />
                        <Typography color="error" variant="h6">
                          {prop.fireCount}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography color="textSecondary" variant="body2">
                      {prop.team} • {prop.propType}
                    </Typography>
                  </Grid>

                  {/* Prop Details */}
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography color="textSecondary" variant="body2">
                            Line
                          </Typography>
                          <Typography variant="h6">{prop.value}</Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography color="textSecondary" variant="body2">
                            Direction
                          </Typography>
                          <Box alignItems="center" display="flex" gap={1}>
                            {prop.direction === 'over' ? (
                              <TrendingUpIcon color="success" />
                            ) : (
                              <TrendingDownIcon color="error" />
                            )}
                            <Typography
                              color={prop.direction === 'over' ? 'success.main' : 'error.main'}
                              variant="h6"
                            >
                              {prop.direction.toUpperCase()}
                            </Typography>
                            {prop.modifier && (
                              <Chip
                                color={prop.modifier === 'goblin' ? 'success' : 'error'}
                                label={prop.modifier}
                                size="small"
                              />
                            )}
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Confidence */}
                  <Grid item xs={12}>
                    <Box alignItems="center" display="flex" justifyContent="space-between">
                      <Typography color="textSecondary" variant="body2">
                        Community Confidence
                      </Typography>
                      <Typography color={getConfidenceColor(prop.confidence)} variant="body1">
                        {prop.confidence}%
                      </Typography>
                    </Box>
                    <ConfidenceBar
                      sx={{
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getConfidenceColor(prop.confidence),
                        },
                      }}
                      value={prop.confidence}
                      variant="determinate"
                    />
                  </Grid>

                  {/* Community Stats */}
                  <Grid item xs={12}>
                    <Box display="flex" gap={2}>
                      <Tooltip title="Likes">
                        <Box alignItems="center" display="flex" gap={0.5}>
                          <ThumbUpIcon fontSize="small" />
                          <Typography variant="body2">{prop.communityStats.likes}</Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Comments">
                        <Box alignItems="center" display="flex" gap={0.5}>
                          <CommentIcon fontSize="small" />
                          <Typography variant="body2">{prop.communityStats.comments}</Typography>
                        </Box>
                      </Tooltip>
                      <Tooltip title="Shares">
                        <Box alignItems="center" display="flex" gap={0.5}>
                          <ShareIcon fontSize="small" />
                          <Typography variant="body2">{prop.communityStats.shares}</Typography>
                        </Box>
                      </Tooltip>
                    </Box>
                  </Grid>

                  {/* Top Comment */}
                  {prop.topComment && (
                    <Grid item xs={12}>
                      <Box
                        sx={{
                          p: 1,
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Box alignItems="center" display="flex" gap={1} mb={1}>
                          <Avatar
                            alt={prop.topComment.user}
                            src={prop.topComment.avatar}
                            sx={{ width: 24, height: 24 }}
                          />
                          <Typography fontWeight="bold" variant="body2">
                            {prop.topComment.user}
                          </Typography>
                        </Box>
                        <Typography variant="body2">{prop.topComment.text}</Typography>
                        <Box alignItems="center" display="flex" gap={0.5} mt={1}>
                          <ThumbUpIcon color="action" fontSize="small" />
                          <Typography color="textSecondary" variant="caption">
                            {prop.topComment.likes}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </TrendingCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};
