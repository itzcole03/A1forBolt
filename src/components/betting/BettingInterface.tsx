import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography, Tab, Tabs } from '@mui/material';
import { useSports, useEvents, useOdds, usePlaceBet } from '../../services/bettingService';
import { useBettingStore } from '../../stores/bettingStore';
import SportSelector from './SportSelector';
import EventList from './EventList';
import BetSlip from './BetSlip';
import OddsDisplay from './OddsDisplay';
import { ErrorBoundary } from 'react-error-boundary';
import { toast } from 'react-toastify';
import { BettingAnalytics } from './BettingAnalytics';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      aria-labelledby={`betting-tab-${index}`}
      hidden={value !== index}
      id={`betting-tabpanel-${index}`}
      role="tabpanel"
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const BettingInterface: React.FC = () => {
  const { selectedSport, selectedEvent, updateOdds, setSelectedSport, setSelectedEvent } =
    useBettingStore();
  const { data: sports, isLoading: sportsLoading } = useSports();
  const { data: events, isLoading: eventsLoading } = useEvents(selectedSport?.id ?? '');
  const { data: odds } = useOdds(selectedEvent?.id ?? '');
  const placeBet = usePlaceBet();
  const [selectedTab, setSelectedTab] = useState(0);

  // Update odds in store when they change
  useEffect(() => {
    if (odds && selectedEvent) {
      updateOdds(selectedEvent.id, odds);
    }
  }, [odds, selectedEvent, updateOdds]);

  const handleError = (error: Error) => {
    toast.error(`An error occurred: ${error.message}`);
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  if (sportsLoading) {
    return (
      <Box alignItems="center" display="flex" justifyContent="center" minHeight="100vh">
        <Typography>Loading sports data...</Typography>
      </Box>
    );
  }

  return (
    <ErrorBoundary fallback={<div>Something went wrong</div>} onError={handleError}>
      <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Paper sx={{ width: '100%', mb: 2 }}>
          <Tabs
            indicatorColor="primary"
            textColor="primary"
            value={selectedTab}
            variant="fullWidth"
            onChange={handleTabChange}
          >
            <Tab label="Betting" />
            <Tab label="Analytics" />
          </Tabs>
        </Paper>

        <TabPanel index={0} value={selectedTab}>
          <Grid container spacing={2}>
            <Grid item md={3} xs={12}>
              <SportSelector selectedSport={selectedSport} onSportSelect={setSelectedSport} />
              <EventList
                selectedEvent={selectedEvent}
                sport={selectedSport}
                onEventSelect={setSelectedEvent}
              />
            </Grid>
            <Grid item md={6} xs={12}>
              {selectedEvent && <OddsDisplay event={selectedEvent} />}
            </Grid>
            <Grid item md={3} xs={12}>
              <BetSlip onPlaceBet={placeBet.mutate} />
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel index={1} value={selectedTab}>
          <BettingAnalytics />
        </TabPanel>
      </Box>
    </ErrorBoundary>
  );
};

export default React.memo(BettingInterface);
