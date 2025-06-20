import React from 'react';
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  CircularProgress,
  Box,
  Chip,
} from '@mui/material';
import { Event } from '../../types/betting';
import { useBettingStore } from '../../stores/bettingStore';
import { format } from 'date-fns';

interface EventListProps {
  events: Event[];
  isLoading: boolean;
  selectedSport: Sport | null;
}

const EventList: React.FC<EventListProps> = ({ events, isLoading, selectedSport }) => {
  const { selectedEvent, selectEvent } = useBettingStore();

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (!selectedSport) {
    return (
      <Box p={3}>
        <Typography align="center" color="text.secondary">
          Please select a sport to view events
        </Typography>
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box p={3}>
        <Typography align="center" color="text.secondary">
          No events available for {selectedSport.name}
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {events.map(event => (
        <ListItem
          key={event.id}
          disablePadding
          divider
          sx={{
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
        >
          <ListItemButton
            selected={selectedEvent?.id === event.id}
            onClick={() => selectEvent(event)}
          >
            <ListItemText
              primary={
                <Box alignItems="center" display="flex" gap={1}>
                  <Typography variant="subtitle1">
                    {event.homeTeam} vs {event.awayTeam}
                  </Typography>
                  <Chip
                    color={
                      event.status === 'live'
                        ? 'error'
                        : event.status === 'upcoming'
                          ? 'primary'
                          : 'default'
                    }
                    label={event.status}
                    size="small"
                  />
                </Box>
              }
              secondary={
                <Box alignItems="center" display="flex" gap={2}>
                  <Typography color="text.secondary" variant="body2">
                    {format(new Date(event.startTime), 'MMM d, h:mm a')}
                  </Typography>
                  {event.score && (
                    <Typography color="text.secondary" variant="body2">
                      Score: {event.score.home} - {event.score.away}
                    </Typography>
                  )}
                </Box>
              }
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default React.memo(EventList);
