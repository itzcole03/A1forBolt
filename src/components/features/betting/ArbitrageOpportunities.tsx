import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Tooltip,
  IconButton,
} from '@mui/material';
import { formatCurrency, formatPercentage } from '../utils/formatters';
import type { ArbitrageOpportunity } from '../types/betting';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface ArbitrageOpportunitiesProps {
  opportunities: ArbitrageOpportunity[];
  onPlaceBet: (opportunity: ArbitrageOpportunity) => void;
}

const ArbitrageOpportunities: React.FC<ArbitrageOpportunitiesProps> = ({
  opportunities,
  onPlaceBet,
}) => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography gutterBottom variant="h5">
        Arbitrage Opportunities
        <Tooltip title="Risk-free profit opportunities across different bookmakers">
          <IconButton>
            <InfoIcon />
          </IconButton>
        </Tooltip>
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: 'repeat(2, 1fr)',
          },
          gap: 3,
        }}
      >
        {opportunities.map((opportunity, index) => (
          <Card key={index}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h6">{opportunity.event_id}</Typography>
                <Chip
                  color="success"
                  icon={<TrendingUpIcon />}
                  label={`${formatPercentage(opportunity.profit_percentage)} Profit`}
                />
              </Box>

              <Typography gutterBottom color="text.secondary" variant="body2">
                Total Probability: {formatPercentage(opportunity.total_probability)}
              </Typography>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom variant="subtitle2">
                  Required Stakes:
                </Typography>
                {Object.entries(opportunity.stakes).map(([bookmaker, stake]) => (
                  <Box
                    key={bookmaker}
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Typography variant="body2">{bookmaker}</Typography>
                    <Typography variant="body2">{formatCurrency(stake)}</Typography>
                  </Box>
                ))}
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography gutterBottom variant="subtitle2">
                  Available Bookmakers:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {opportunity.bookmakers.map(bookmaker => (
                    <Chip key={bookmaker} label={bookmaker} size="small" variant="outlined" />
                  ))}
                </Box>
              </Box>

              <Button
                fullWidth
                color="primary"
                sx={{ mt: 2 }}
                variant="contained"
                onClick={() => onPlaceBet(opportunity)}
              >
                Place Arbitrage Bets
              </Button>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default React.memo(ArbitrageOpportunities);
