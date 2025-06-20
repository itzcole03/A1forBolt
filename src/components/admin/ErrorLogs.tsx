import React, { useState, useEffect } from 'react';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Delete as DeleteIcon, Refresh as RefreshIcon } from '@mui/icons-material';
import { errorLogger, ErrorLog } from '../../utils/errorLogger';

export const ErrorLogs: React.FC = () => {
  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [severityFilter, setSeverityFilter] = useState<ErrorLog['severity'] | 'all'>('all');

  const fetchLogs = () => {
    const allLogs = errorLogger.getLogs();
    setLogs(allLogs);
  };

  useEffect(() => {
    fetchLogs();
    // Refresh logs every 30 seconds
    const interval = setInterval(fetchLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleClearLogs = () => {
    errorLogger.clearLogs();
    setLogs([]);
  };

  const handleSeverityChange = (event: any) => {
    const severity = event.target.value;
    setSeverityFilter(severity);
  };

  const filteredLogs =
    severityFilter === 'all' ? logs : logs.filter(log => log.severity === severityFilter);

  const getSeverityColor = (severity: ErrorLog['severity']) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Error Logs</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 120 }}>
            <InputLabel>Severity</InputLabel>
            <Select
              label="Severity"
              size="small"
              value={severityFilter}
              onChange={handleSeverityChange}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="error">Error</MenuItem>
              <MenuItem value="warning">Warning</MenuItem>
              <MenuItem value="info">Info</MenuItem>
            </Select>
          </FormControl>
          <IconButton color="primary" onClick={fetchLogs}>
            <RefreshIcon />
          </IconButton>
          <IconButton color="error" onClick={handleClearLogs}>
            <DeleteIcon />
          </IconButton>
        </Box>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Timestamp</TableCell>
              <TableCell>Severity</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Context</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredLogs.map((log, index) => (
              <TableRow key={index}>
                <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <Chip color={getSeverityColor(log.severity)} label={log.severity} size="small" />
                </TableCell>
                <TableCell>{log.message}</TableCell>
                <TableCell>
                  {log.context ? (
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(log.context, null, 2)}
                    </pre>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))}
            {filteredLogs.length === 0 && (
              <TableRow>
                <TableCell align="center" colSpan={4}>
                  No logs found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};
