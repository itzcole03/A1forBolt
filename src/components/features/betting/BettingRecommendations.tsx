import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Chip,
  IconButton,
  Tooltip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Info as InfoIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { sportsAnalytics } from '@/services/sportsAnalytics';
import { riskManagement } from '@/services/riskManagement';
import { Sport } from '@/services/sportsAnalytics';

const RecommendationsCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: theme.shadows[4],
  },
}));

interface Recommendation {
  id: string;
  sport: Sport;
  event: string;
  betType: string;
  odds: number;
  confidence: number;
  edge: number;
  analysis: string;
  risk: 'low' | 'medium' | 'high';
  timestamp: number;
  favorite: boolean;
}

export const BettingRecommendations: React.FC<{ sport: Sport }> = ({ sport }) => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);
  const [betDialogOpen, setBetDialogOpen] = useState(false);
  const [betAmount, setBetAmount] = useState('');
  const [betType, setBetType] = useState('straight');

  useEffect(() => {
    const loadRecommendations = async () => {
      const sportRecommendations = await sportsAnalytics.getRecommendations(sport);
      setRecommendations(sportRecommendations);
    };

    loadRecommendations();
    const unsubscribe = sportsAnalytics.subscribe('recommendations', (data) => {
      setRecommendations(prev => [data, ...prev].slice(0, 10));
    });

    return () => {
      unsubscribe();
    };
  }, [sport]);

  const handleBetClick = (recommendation: Recommendation) => {
    setSelectedRecommendation(recommendation);
    setBetDialogOpen(true);
  };

  const handlePlaceBet = () => {
    if (selectedRecommendation && betAmount) {
      const amount = parseFloat(betAmount);
      riskManagement.placeBet({
        recommendationId: selectedRecommendation.id,
        amount,
        type: betType,
        odds: selectedRecommendation.odds,
      });
      setBetDialogOpen(false);
      setBetAmount('');
    }
  };

  const toggleFavorite = (recommendationId: string) => {
    setRecommendations(prev =>
      prev.map(rec =>
        rec.id === recommendationId
          ? { ...rec, favorite: !rec.favorite }
          : rec
      )
    );
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      default:
        return 'default';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'success';
    if (confidence >= 60) return 'warning';
    return 'error';
  };

  return (
    <>
      <RecommendationsCard>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Betting Recommendations
          </Typography>

          <Grid container spacing={2}>
            {recommendations.map((recommendation) => (
              <Grid item xs={12} key={recommendation.id}>
                <Box
                  sx={{
                    p: 2,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    position: 'relative',
                  }}
                >
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box>
                      <Typography variant="subtitle1">
                        {recommendation.event}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        {recommendation.betType}
                      </Typography>
                    </Box>
                    <Box display="flex" gap={1}>
                      <Chip
                        size="small"
                        label={`${recommendation.odds}x`}
                        color="primary"
                      />
                      <Chip
                        size="small"
                        label={`${recommendation.confidence}% confidence`}
                        color={getConfidenceColor(recommendation.confidence)}
                      />
                      <Chip
                        size="small"
                        label={recommendation.risk.toUpperCase()}
                        color={getRiskColor(recommendation.risk)}
                      />
                      <IconButton
                        size="small"
                        onClick={() => toggleFavorite(recommendation.id)}
                      >
                        {recommendation.favorite ? (
                          <StarIcon color="warning" />
                        ) : (
                          <StarBorderIcon />
                        )}
                      </IconButton>
                    </Box>
                  </Box>

                  <Box mt={1}>
                    <Typography variant="body2" color="textSecondary">
                      Edge: {recommendation.edge.toFixed(2)}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={recommendation.confidence}
                      sx={{
                        height: 4,
                        mt: 1,
                        bgcolor: 'grey.200',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: getConfidenceColor(recommendation.confidence),
                        },
                      }}
                    />
                  </Box>

                  <Box mt={2}>
                    <Typography variant="body2">
                      {recommendation.analysis}
                    </Typography>
                  </Box>

                  <Box mt={2} display="flex" justifyContent="flex-end">
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<MoneyIcon />}
                      onClick={() => handleBetClick(recommendation)}
                    >
                      Place Bet
                    </Button>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </RecommendationsCard>

      <Dialog open={betDialogOpen} onClose={() => setBetDialogOpen(false)}>
        <DialogTitle>Place Bet</DialogTitle>
        <DialogContent>
          {selectedRecommendation && (
            <Box sx={{ pt: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                {selectedRecommendation.event}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                {selectedRecommendation.betType} @ {selectedRecommendation.odds}x
              </Typography>

              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Bet Type</InputLabel>
                <Select
                  value={betType}
                  label="Bet Type"
                  onChange={(e) => setBetType(e.target.value)}
                >
                  <MenuItem value="straight">Straight Bet</MenuItem>
                  <MenuItem value="parlay">Parlay</MenuItem>
                  <MenuItem value="teaser">Teaser</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Bet Amount"
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                sx={{ mt: 2 }}
                InputProps={{
                  startAdornment: <MoneyIcon color="action" />,
                }}
              />

              <Box mt={2}>
                <Typography variant="body2" color="textSecondary">
                  Potential Payout: ${selectedRecommendation.odds * (parseFloat(betAmount) || 0)}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBetDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePlaceBet}
            disabled={!betAmount || parseFloat(betAmount) <= 0}
          >
            Confirm Bet
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}; 