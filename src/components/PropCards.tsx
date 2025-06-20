import React from 'react';
import { Grid, Card, CardContent, Typography, Button, Box, Chip, Skeleton } from '@mui/material';
import { TrendingUp as TrendingUpIcon } from '@mui/icons-material';
import { useAppStore } from '../../stores/useAppStore';

interface Prop {
  id: string;
  title: string;
  description: string;
  odds: number;
  category: string;
  confidence: number;
  prediction: string;
}

interface PropCardsProps {
  data: Prop[];
  isLoading: boolean;
}

export const PropCards: React.FC<PropCardsProps> = ({ data, isLoading }) => {
  const { addToBetSlip } = useAppStore();

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4].map(index => (
          <Grid key={index} item md={4} sm={6} xs={12}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
                <Skeleton variant="text" width="80%" />
                <Box sx={{ mt: 2 }}>
                  <Skeleton height={36} variant="rectangular" />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {data.map(prop => (
        <Grid key={prop.id} item md={4} sm={6} xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography component="div" variant="h6">
                  {prop.title}
                </Typography>
                <Chip color="primary" label={prop.category} size="small" variant="outlined" />
              </Box>

              <Typography gutterBottom color="text.secondary">
                {prop.description}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                <Typography color="success.main" variant="body2">
                  {prop.prediction}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography color="primary" variant="h6">
                  {prop.odds.toFixed(2)}
                </Typography>
                <Button
                  color="primary"
                  variant="contained"
                  onClick={() =>
                    addToBetSlip({
                      id: prop.id,
                      selection: prop.title,
                      odds: prop.odds,
                      stake: 0,
                    })
                  }
                >
                  Add to Bet Slip
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default React.memo(PropCards);
