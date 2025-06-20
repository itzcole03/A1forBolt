import React from 'react';
import { Box, Typography, Grid, Paper, Button, Tabs, Tab, Divider } from '@mui/material';
import { Event, Market, Selection } from '../../types/betting';
import { useBettingStore } from '../../stores/bettingStore';

interface OddsDisplayProps {
  event: Event;
}

const OddsDisplay: React.FC<OddsDisplayProps> = ({ event }) => {
  const [selectedMarket, setSelectedMarket] = React.useState<Market | null>(
    event.markets[0] ?? null
  );
  const { addBet } = useBettingStore();

  const handleMarketChange = (_: React.SyntheticEvent, newValue: number) => {
    setSelectedMarket(event.markets[newValue]);
  };

  const handleSelectionClick = (selection: Selection) => {
    if (selection.status !== 'active') return;

    addBet({
      id: `${event.id}-${selection.id}`,
      eventId: event.id,
      market: selectedMarket?.name ?? '',
      selection: selection.name,
      odds: selection.odds,
      stake: 0,
      potentialWinnings: 0,
      timestamp: new Date().toISOString(),
      status: 'pending',
    });
  };

  return (
    <Box>
      <Typography gutterBottom variant="h6">
        {event.homeTeam} vs {event.awayTeam}
      </Typography>
      <Typography gutterBottom color="text.secondary" variant="body2">
        {new Date(event.startTime).toLocaleString()}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Tabs
        scrollButtons="auto"
        sx={{ mb: 2 }}
        value={event.markets.findIndex(m => m.id === selectedMarket?.id)}
        variant="scrollable"
        onChange={handleMarketChange}
      >
        {event.markets.map(market => (
          <Tab key={market.id} label={market.name} />
        ))}
      </Tabs>
      {selectedMarket && (
        <Grid container spacing={2}>
          {selectedMarket.selections.map(selection => (
            <Grid key={selection.id} item md={4} sm={6} xs={12}>
              <Paper
                sx={{
                  p: 2,
                  cursor: selection.status === 'active' ? 'pointer' : 'not-allowed',
                  opacity: selection.status === 'active' ? 1 : 0.5,
                  '&:hover': {
                    backgroundColor:
                      selection.status === 'active' ? 'action.hover' : 'background.paper',
                  },
                }}
                onClick={() => handleSelectionClick(selection)}
              >
                <Box alignItems="center" display="flex" justifyContent="space-between">
                  <Typography variant="body1">{selection.name}</Typography>
                  <Button disabled={selection.status !== 'active'} size="small" variant="outlined">
                    {selection.odds}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default React.memo(OddsDisplay);
