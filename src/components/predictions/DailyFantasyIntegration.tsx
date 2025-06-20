import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import { useLogger } from '../../hooks/useLogger';
import { useMetrics } from '../../hooks/useMetrics';

interface DailyFantasyData {
  playerId: string;
  playerName: string;
  team: string;
  position: string;
  salary: number;
  projectedPoints: number;
  actualPoints?: number;
  ownershipPercentage?: number;
  valueScore?: number;
}

interface DailyFantasyIntegrationProps {
  onDataUpdate: (data: DailyFantasyData[]) => void;
  sport: string;
  date: string;
}

export const DailyFantasyIntegration: React.FC<DailyFantasyIntegrationProps> = ({
  onDataUpdate,
  sport,
  date,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<DailyFantasyData[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [site, setSite] = useState<'draftkings' | 'fanduel'>('draftkings');
  const logger = useLogger();
  const metrics = useMetrics();

  useEffect(() => {
    const fetchData = async () => {
      if (!apiKey) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/dailyfantasy/${sport}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            site,
            date,
            sport,
          }),
        });

        if (!response.ok) {
          throw new Error(`API request failed: ${response.statusText}`);
        }

        const fantasyData = await response.json();

        // Calculate value score based on projected points and salary
        const processedData = fantasyData.map((player: DailyFantasyData) => ({
          ...player,
          valueScore: player.projectedPoints / (player.salary / 1000), // Points per $1000
        }));

        setData(processedData);
        onDataUpdate(processedData);

        metrics.track('dailyfantasy_data_fetched', 1, {
          sport,
          site,
          playerCount: processedData.length.toString(),
        });

        logger.info('Successfully fetched DailyFantasy data', {
          sport,
          site,
          playerCount: processedData.length,
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch DailyFantasy data';
        setError(errorMessage);
        logger.error('Error fetching DailyFantasy data', { error: errorMessage });
        metrics.increment('dailyfantasy_fetch_error');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [apiKey, site, date, sport, onDataUpdate, logger, metrics]);

  const handleApiKeyChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(event.target.value);
  };

  const handleSiteChange = (event: SelectChangeEvent<'draftkings' | 'fanduel'>) => {
    setSite(event.target.value as 'draftkings' | 'fanduel');
  };

  return (
    <Card>
      <CardContent>
        <Typography gutterBottom variant="h6">
          Daily Fantasy Integration
        </Typography>

        <Grid container spacing={3}>
          <Grid item md={6} xs={12}>
            <TextField
              fullWidth
              label="API Key"
              margin="normal"
              type="password"
              value={apiKey}
              onChange={handleApiKeyChange}
            />
          </Grid>
          <Grid item md={6} xs={12}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Site</InputLabel>
              <Select label="Site" value={site} onChange={handleSiteChange}>
                <MenuItem value="draftkings">DraftKings</MenuItem>
                <MenuItem value="fanduel">FanDuel</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {isLoading && (
          <Box display="flex" justifyContent="center" my={3}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {data.length > 0 && (
          <Box mt={3}>
            <Typography gutterBottom variant="subtitle1">
              Data Summary
            </Typography>
            <Typography variant="body2">{data.length} players loaded</Typography>
            <Typography variant="body2">
              Average Value Score:{' '}
              {(
                data.reduce((sum, player) => sum + (player.valueScore || 0), 0) / data.length
              ).toFixed(2)}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
