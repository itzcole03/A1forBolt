import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Stack,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useModelPerformance } from '../../hooks/useModelPerformance';

interface PerformanceExportProps {
  modelName: string;
  onClose: () => void;
}

type ExportFormat = 'csv' | 'json' | 'excel';

export const PerformanceExport: React.FC<PerformanceExportProps> = ({ modelName, onClose }) => {
  const [format, setFormat] = useState<ExportFormat>('csv');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const { history } = useModelPerformance(modelName);

  const handleExport = () => {
    const filteredData = history.filter(entry => {
      const timestamp = new Date(entry.timestamp);
      return (!startDate || timestamp >= startDate) && (!endDate || timestamp <= endDate);
    });

    const data = filteredData.map(entry => ({
      timestamp: new Date(entry.timestamp).toISOString(),
      ...entry.metrics,
    }));

    switch (format) {
      case 'csv':
        exportCSV(data);
        break;
      case 'json':
        exportJSON(data);
        break;
      case 'excel':
        exportExcel(data);
        break;
    }
  };

  const exportCSV = (data: any[]) => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(',')),
    ].join('\n');

    downloadFile(csvContent, 'performance_data.csv', 'text/csv');
  };

  const exportJSON = (data: any[]) => {
    const jsonContent = JSON.stringify(data, null, 2);
    downloadFile(jsonContent, 'performance_data.json', 'application/json');
  };

  const exportExcel = (data: any[]) => {
    // For Excel export, we'll use CSV format with .xlsx extension
    // In a real implementation, you would use a library like xlsx
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => row[header]).join(',')),
    ].join('\n');

    downloadFile(
      csvContent,
      'performance_data.xlsx',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog fullWidth open maxWidth="sm" onClose={onClose}>
      <DialogTitle>Export Performance Data</DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          <FormControl fullWidth>
            <InputLabel>Format</InputLabel>
            <Select
              label="Format"
              value={format}
              onChange={e => setFormat(e.target.value as ExportFormat)}
            >
              <MenuItem value="csv">CSV</MenuItem>
              <MenuItem value="json">JSON</MenuItem>
              <MenuItem value="excel">Excel</MenuItem>
            </Select>
          </FormControl>

          <Box>
            <Typography gutterBottom variant="subtitle2">
              Date Range
            </Typography>
            <Stack direction="row" spacing={2}>
              <DatePicker
                label="Start Date"
                slotProps={{ textField: { fullWidth: true } }}
                value={startDate}
                onChange={(date: Date | null) => setStartDate(date)}
              />
              <DatePicker
                label="End Date"
                slotProps={{ textField: { fullWidth: true } }}
                value={endDate}
                onChange={(date: Date | null) => setEndDate(date)}
              />
            </Stack>
          </Box>

          <Typography color="text.secondary" variant="body2">
            {history.length} data points available
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="primary" variant="contained" onClick={handleExport}>
          Export
        </Button>
      </DialogActions>
    </Dialog>
  );
};
