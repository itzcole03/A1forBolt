import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
} from '@mui/material';
import { DataIntegrationHub } from '../../core/DataIntegrationHub';
import { useAppState } from './StateProvider';
import { useThemeStore } from '@stores/themeStore';

const Settings: React.FC = () => {
  const { props, entries } = useAppState();
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeStore();
  const [lastSync, setLastSync] = useState(new Date());
  const [liveUpdates, setLiveUpdates] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [dataSharing, setDataSharing] = useState(false);
  const [compactView, setCompactView] = useState(false);

  const handleExport = (type: 'csv' | 'json') => {
    const data = { props, entries };
    const blob = new Blob([type === 'json' ? JSON.stringify(data, null, 2) : toCSV(data)], {
      type: type === 'json' ? 'application/json' : 'text/csv',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `betting-data.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  function toCSV(data: any) {
    // Simple CSV export for demo
    const propRows = data.props.map(
      (p: any) => `${p.id},${p.player},${p.team},${p.stat},${p.line},${p.type},${p.percentage}`
    );
    const entryRows = data.entries.map(
      (e: any) => `${e.id},${e.date},${e.legs},${e.entry},${e.potentialPayout},${e.status}`
    );
    return `Props\nID,Player,Team,Stat,Line,Type,Percentage\n${propRows.join('\n')}\n\nEntries\nID,Date,Legs,Entry,PotentialPayout,Status\n${entryRows.join('\n')}`;
  }

  // Data source health
  const hub = DataIntegrationHub.getInstance();
  const metrics = Array.from(hub.getSourceMetrics().entries());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Card>
        <CardContent>
          <Typography sx={{ mb: 3 }} variant="h6">
            Appearance
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={<Switch checked={mode === 'dark'} onChange={toggleTheme} />}
              label="Dark Mode"
            />
            <FormControlLabel
              control={
                <Switch checked={compactView} onChange={e => setCompactView(e.target.checked)} />
              }
              label="Compact View"
            />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography sx={{ mb: 3 }} variant="h6">
            Notifications
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch checked={liveUpdates} onChange={e => setLiveUpdates(e.target.checked)} />
              }
              label="Live Updates"
            />
            <FormControlLabel control={<Switch checked={true} />} label="Arbitrage Alerts" />
            <FormControlLabel control={<Switch checked={true} />} label="High Confidence Picks" />
          </Box>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography sx={{ mb: 3 }} variant="h6">
            Data & Privacy
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button fullWidth variant="outlined" onClick={() => handleExport('csv')}>
              Export Betting Data (CSV)
            </Button>
            <Button fullWidth variant="outlined" onClick={() => handleExport('json')}>
              Export Betting Data (JSON)
            </Button>
            <Button fullWidth color="error" variant="outlined">
              Clear All Data
            </Button>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography sx={{ mb: 2 }} variant="subtitle1">
              Data Source Health
            </Typography>
            <List>
              {metrics.map(([id, m]) => (
                <ListItem key={id}>
                  <ListItemText
                    primary={id}
                    secondary={`Latency ${m.latency.toFixed(0)}ms, Reliability ${(m.reliability * 100).toFixed(1)}%, Last Sync ${new Date(m.lastSync).toLocaleTimeString()}`}
                  />
                </ListItem>
              ))}
            </List>
            <Typography color="text.secondary" variant="caption">
              Last Sync: {lastSync.toLocaleTimeString()}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={analyticsEnabled}
                  onChange={e => setAnalyticsEnabled(e.target.checked)}
                />
              }
              label="Enable Analytics"
            />
            <FormControlLabel
              control={
                <Switch checked={dataSharing} onChange={e => setDataSharing(e.target.checked)} />
              }
              label="Allow Data Sharing"
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default React.memo(Settings);
