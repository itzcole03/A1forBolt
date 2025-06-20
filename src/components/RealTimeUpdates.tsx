import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import Collapse from '@mui/material/Collapse';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import WarningIcon from '@mui/icons-material/Warning';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import { styled } from '@mui/styles';
import { realTimeUpdates } from '@/services/realTimeUpdates';
import { Sport } from '@/services/sportsAnalytics';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useErrorBoundary } from '@/hooks/useErrorBoundary';

const UpdatesCard = styled(Card)(({ theme }) => ({
  background: 'rgba(255, 255, 255, 0.9)',
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      aria-labelledby={`updates-tab-${index}`}
      hidden={value !== index}
      id={`updates-tabpanel-${index}`}
      role="tabpanel"
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

export const RealTimeUpdates: React.FC<{ sport: Sport }> = ({ sport }) => {
  const [value, setValue] = useState(0);
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [updates, setUpdates] = useState<{
    odds: any[];
    injuries: any[];
    lineMovements: any[];
    news: any[];
    predictions: any[];
  }>({
    odds: [],
    injuries: [],
    lineMovements: [],
    news: [],
    predictions: [],
  });

  const { sendMessage, isConnected } = useWebSocket(
    process.env.VITE_WS_URL || 'ws://localhost:3000',
    {
      onMessage: data => {
        if (data.type === 'prediction:update') {
          setUpdates(prev => ({
            ...prev,
            predictions: [data.payload, ...prev.predictions].slice(0, 10),
          }));
        } else if (data.type === 'odds:update') {
          setUpdates(prev => ({
            ...prev,
            odds: [data.payload, ...prev.odds].slice(0, 10),
          }));
        } else if (data.type === 'model:metrics') {
          console.log('Model metrics:', data.payload);
        }
      },
    }
  );

  const { showBoundary } = useErrorBoundary();

  const handleError = useCallback(
    (error: Error) => {
      setError(error.message);
      showBoundary(error);
    },
    [showBoundary]
  );

  const loadUpdates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const sportUpdates = await realTimeUpdates.getSportUpdates(sport);
      setUpdates(prev => ({
        ...prev,
        ...sportUpdates,
      }));
    } catch (error) {
      handleError(error as Error);
    } finally {
      setLoading(false);
    }
  }, [sport, handleError]);

  useEffect(() => {
    loadUpdates();
  }, [loadUpdates]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const handleRefresh = () => {
    loadUpdates();
  };

  if (!isConnected) {
    return (
      <UpdatesCard>
        <CardContent>
          <Alert severity="warning">WebSocket connection lost. Attempting to reconnect...</Alert>
        </CardContent>
      </UpdatesCard>
    );
  }

  return (
    <UpdatesCard>
      <CardContent>
        <Box alignItems="center" display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Real-Time Updates</Typography>
          <Box>
            <IconButton disabled={loading} onClick={handleRefresh}>
              <RefreshIcon />
            </IconButton>
            <IconButton onClick={() => setExpanded(!expanded)}>
              {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </IconButton>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Collapse in={expanded}>
          <Tabs
            sx={{ borderBottom: 1, borderColor: 'divider' }}
            value={value}
            variant="fullWidth"
            onChange={handleTabChange}
          >
            <Tab label="Odds" />
            <Tab label="Injuries" />
            <Tab label="Line Movements" />
            <Tab label="News" />
            <Tab label="Predictions" />
          </Tabs>

          {loading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <TabPanel index={0} value={value}>
                <List>
                  {updates.odds.map((odds, index) => (
                    <React.Fragment key={odds.propId}>
                      <ListItem>
                        <ListItemIcon>
                          {odds.movement.direction === 'up' ? (
                            <TrendingUpIcon color="success" />
                          ) : odds.movement.direction === 'down' ? (
                            <TrendingDownIcon color="error" />
                          ) : (
                            <InfoIcon color="action" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${odds.value} (${odds.movement.direction})`}
                          secondary={`Updated ${formatTimestamp(odds.timestamp)}`}
                        />
                        <Box display="flex" gap={1}>
                          <Chip color="success" label={`O ${odds.overMultiplier}x`} size="small" />
                          <Chip color="error" label={`U ${odds.underMultiplier}x`} size="small" />
                        </Box>
                      </ListItem>
                      {index < updates.odds.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>

              <TabPanel index={1} value={value}>
                <List>
                  {updates.injuries.map((injury, index) => (
                    <React.Fragment key={injury.playerId}>
                      <ListItem>
                        <ListItemIcon>
                          <LocalHospitalIcon
                            color={
                              injury.status === 'out'
                                ? 'error'
                                : injury.status === 'questionable'
                                  ? 'warning'
                                  : 'success'
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={`${injury.playerName} (${injury.team})`}
                          secondary={
                            <>
                              <Typography color="textPrimary" component="span" variant="body2">
                                {injury.status.toUpperCase()}
                              </Typography>
                              {` - ${injury.injury}`}
                              {injury.expectedReturn && (
                                <Typography color="textSecondary" component="span" variant="body2">
                                  {` - Expected return: ${injury.expectedReturn}`}
                                </Typography>
                              )}
                            </>
                          }
                        />
                      </ListItem>
                      {index < updates.injuries.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>

              <TabPanel index={2} value={value}>
                <List>
                  {updates.lineMovements.map((movement, index) => (
                    <React.Fragment key={`${movement.propId}_${movement.timestamp}`}>
                      <ListItem>
                        <ListItemIcon>
                          {movement.direction === 'up' ? (
                            <TrendingUpIcon color="success" />
                          ) : (
                            <TrendingDownIcon color="error" />
                          )}
                        </ListItemIcon>
                        <ListItemText
                          primary={`${movement.oldValue} → ${movement.newValue}`}
                          secondary={`Updated ${formatTimestamp(movement.timestamp)}`}
                        />
                        <Chip
                          color={movement.confidence >= 80 ? 'success' : 'warning'}
                          label={`${movement.confidence}% confidence`}
                          size="small"
                        />
                      </ListItem>
                      {index < updates.lineMovements.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>

              <TabPanel index={3} value={value}>
                <List>
                  {updates.news.map((news, index) => (
                    <React.Fragment key={news.id}>
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon
                            color={
                              news.impact === 'high'
                                ? 'error'
                                : news.impact === 'medium'
                                  ? 'warning'
                                  : 'info'
                            }
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={news.title}
                          secondary={
                            <>
                              <Typography color="textPrimary" component="span" variant="body2">
                                {news.type.toUpperCase()}
                              </Typography>
                              {` - ${news.content}`}
                              <Typography color="textSecondary" component="span" variant="body2">
                                {` - ${formatTimestamp(news.timestamp)}`}
                              </Typography>
                            </>
                          }
                        />
                      </ListItem>
                      {index < updates.news.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>

              <TabPanel index={4} value={value}>
                <List>
                  {updates.predictions.map((prediction, index) => (
                    <React.Fragment key={prediction.id}>
                      <ListItem>
                        <ListItemIcon>
                          <Tooltip
                            title={`Confidence: ${(prediction.confidence * 100).toFixed(1)}%`}
                          >
                            <Box>
                              {prediction.confidence > 0.8 ? (
                                <TrendingUpIcon color="success" />
                              ) : prediction.confidence > 0.6 ? (
                                <InfoIcon color="info" />
                              ) : (
                                <WarningIcon color="warning" />
                              )}
                            </Box>
                          </Tooltip>
                        </ListItemIcon>
                        <ListItemText
                          primary={`${prediction.event} - ${prediction.market}`}
                          secondary={
                            <>
                              <Typography color="textPrimary" component="span" variant="body2">
                                Prediction: {prediction.prediction}
                              </Typography>
                              <br />
                              <Typography color="textSecondary" component="span" variant="body2">
                                Updated {formatTimestamp(prediction.timestamp)}
                              </Typography>
                            </>
                          }
                        />
                        <Box display="flex" gap={1}>
                          <Chip
                            color={
                              prediction.confidence > 0.8
                                ? 'success'
                                : prediction.confidence > 0.6
                                  ? 'info'
                                  : 'warning'
                            }
                            label={`Confidence: ${(prediction.confidence * 100).toFixed(1)}%`}
                            size="small"
                          />
                        </Box>
                      </ListItem>
                      {index < updates.predictions.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              </TabPanel>
            </>
          )}
        </Collapse>
      </CardContent>
    </UpdatesCard>
  );
};
