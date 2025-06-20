import React from 'react';
import { useWebSocketStore } from '../services/websocket';
import { Box, Typography, CircularProgress, Alert, Snackbar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { fadeIn } from '../utils/animations';

const StatusContainer = styled(Box)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: theme.spacing(2),
  zIndex: theme.zIndex.snackbar,
  animation: `${fadeIn} 0.3s ease-in-out`,
}));

export const ConnectionStatus: React.FC = () => {
  const { isConnected, isReconnecting, lastError, resetError } = useWebSocketStore();
  const [serviceStatus, setServiceStatus] = React.useState<Record<string, unknown>>({});

  React.useEffect(() => {
    const updateStatus = () => {
      setServiceStatus(window.appStatus ? { ...window.appStatus } : {});
    };
    updateStatus();
    const interval = setInterval(updateStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  const renderStatus = (service: string, label: string) => {
    const status = serviceStatus[service];
    if (!status) return null;
    let color: 'success' | 'warning' | 'error' = 'success';
    if (!status.connected) color = status.quality < 0.5 ? 'error' : 'warning';
    return (
      <Box key={service} display="flex" alignItems="center" gap={1} mb={0.5}>
        <Typography variant="body2" color={color} fontWeight={600}>
          {label}:
        </Typography>
        <Typography variant="body2" color={color}>
          {status.connected ? 'Online' : 'Offline'}
          {typeof status.quality === 'number' && (
            <> (Q: {Math.round(status.quality * 100)}%)</>
          )}
        </Typography>
        <Typography variant="caption" color="textSecondary">
          {status.timestamp ? `Updated ${Math.floor((Date.now() - status.timestamp) / 1000)}s ago` : ''}
        </Typography>
      </Box>
    );
  };

  return (
    <>
      <StatusContainer>
        {renderStatus('weather', 'Weather')}
        {renderStatus('injuries', 'Injuries')}
        {renderStatus('realtime', 'Real-Time')}
        {/* Legacy WebSocket status for backward compatibility */}
        {isReconnecting && (
          <Box alignItems="center" display="flex" gap={1}>
            <CircularProgress size={20} />
            <Typography color="textSecondary" variant="body2">
              Reconnecting...
            </Typography>
          </Box>
        )}
        {!isConnected && !isReconnecting && (
          <Typography color="error" variant="body2">
            Disconnected
          </Typography>
        )}
      </StatusContainer>

      <Snackbar
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={6000}
        open={!!lastError}
        onClose={resetError}
      >
        <Alert severity="error" sx={{ width: '100%' }} onClose={resetError}>
          {lastError}
        </Alert>
      </Snackbar>
    </>
  );
};
