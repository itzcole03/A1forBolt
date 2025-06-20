import React, { useState, useMemo } from 'react';
import { Box, Typography, TextField, MenuItem, Grid, Paper, CircularProgress } from '@mui/material';
import { BetRecommendationCard } from './BetRecommendationCard';
import { BetRecommendation } from '../../core/types/prediction';
import { PredictionExplanationModal } from './PredictionExplanationModal';

interface BetRecommendationListProps {
  recommendations: BetRecommendation[];
  loading?: boolean;
  error?: string;
}

type SortOption = 'confidence' | 'stake' | 'expectedValue' | 'riskLevel';
type FilterOption = 'all' | 'low' | 'medium' | 'high';

export const BetRecommendationList: React.FC<BetRecommendationListProps> = ({
  recommendations,
  loading = false,
  error,
}) => {
  const [sortBy, setSortBy] = useState<SortOption>('confidence');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedRecommendation, setSelectedRecommendation] = useState<BetRecommendation | null>(
    null
  );

  const filteredAndSortedRecommendations = useMemo(() => {
    let filtered = recommendations;

    // Apply risk level filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(rec => rec.riskLevel === filterBy);
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'confidence':
          return b.confidence - a.confidence;
        case 'stake':
          return b.stake - a.stake;
        case 'expectedValue':
          return b.expectedValue - a.expectedValue;
        case 'riskLevel':
          const riskOrder = { low: 0, medium: 1, high: 2 };
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        default:
          return 0;
      }
    });
  }, [recommendations, sortBy, filterBy]);

  if (loading) {
    return (
      <Box alignItems="center" display="flex" justifyContent="center" minHeight={200}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
        <Typography color="error">{error}</Typography>
      </Paper>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Paper sx={{ p: 2 }}>
        <Typography color="text.secondary">No bet recommendations available</Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item sm={6} xs={12}>
          <TextField
            fullWidth
            select
            label="Sort By"
            value={sortBy}
            onChange={e => setSortBy(e.target.value as SortOption)}
          >
            <MenuItem value="confidence">Confidence</MenuItem>
            <MenuItem value="stake">Stake Amount</MenuItem>
            <MenuItem value="expectedValue">Expected Value</MenuItem>
            <MenuItem value="riskLevel">Risk Level</MenuItem>
          </TextField>
        </Grid>
        <Grid item sm={6} xs={12}>
          <TextField
            fullWidth
            select
            label="Filter By Risk"
            value={filterBy}
            onChange={e => setFilterBy(e.target.value as FilterOption)}
          >
            <MenuItem value="all">All Risk Levels</MenuItem>
            <MenuItem value="low">Low Risk</MenuItem>
            <MenuItem value="medium">Medium Risk</MenuItem>
            <MenuItem value="high">High Risk</MenuItem>
          </TextField>
        </Grid>
      </Grid>

      <Box>
        {filteredAndSortedRecommendations.map(recommendation => (
          <BetRecommendationCard
            key={recommendation.id}
            recommendation={recommendation}
            onViewDetails={() => setSelectedRecommendation(recommendation)}
          />
        ))}
      </Box>

      {selectedRecommendation && (
        <PredictionExplanationModal
          open={!!selectedRecommendation}
          prediction={{
            prediction: selectedRecommendation.prediction.prediction,
            confidence: selectedRecommendation.confidence,
            explanations: [
              {
                modelName: selectedRecommendation.prediction.type,
                confidence: selectedRecommendation.confidence,
                shapExplanation: {
                  featureNames: Object.keys(selectedRecommendation.prediction.features),
                  featureValues: Object.values(selectedRecommendation.prediction.features),
                  importanceScores: [],
                  baseValue: 0,
                  prediction: selectedRecommendation.prediction.prediction,
                },
              },
            ],
          }}
          onClose={() => setSelectedRecommendation(null)}
        />
      )}
    </Box>
  );
};
