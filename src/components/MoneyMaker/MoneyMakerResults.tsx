import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from '@mui/material';
import { OptimalLineup } from './types';

interface MoneyMakerResultsProps {
  lineup: OptimalLineup;
}

export const MoneyMakerResults: React.FC<MoneyMakerResultsProps> = ({ lineup }) => {
  const formatNumber = (num: number) => {
    return num.toFixed(1);
  };

  return (
    <Box className="results-section">
      <Typography className="mb-4" variant="h6">
        Optimal Lineup Results
      </Typography>

      <Box className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Box className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Typography color="textSecondary" variant="subtitle2">
            Total Payout
          </Typography>
          <Typography className="text-green-500" variant="h4">
            ${formatNumber(lineup.totalPayout)}
          </Typography>
        </Box>

        <Box className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Typography color="textSecondary" variant="subtitle2">
            Win Probability
          </Typography>
          <Typography className="text-blue-500" variant="h4">
            {formatNumber(lineup.winProbability)}%
          </Typography>
        </Box>

        <Box className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
          <Typography color="textSecondary" variant="subtitle2">
            Kelly Criterion
          </Typography>
          <Typography className="text-purple-500" variant="h4">
            {formatNumber(lineup.kellyCriterion)}x
          </Typography>
        </Box>
      </Box>

      <TableContainer className="mb-4" component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Player</TableCell>
              <TableCell>Team</TableCell>
              <TableCell>Market</TableCell>
              <TableCell>Line</TableCell>
              <TableCell>Odds</TableCell>
              <TableCell>Confidence</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {lineup.picks.map((pick, index) => (
              <TableRow key={index}>
                <TableCell>{pick.playerName}</TableCell>
                <TableCell>{pick.team}</TableCell>
                <TableCell>{pick.market}</TableCell>
                <TableCell>{pick.line}</TableCell>
                <TableCell>{pick.odds}</TableCell>
                <TableCell>{formatNumber(pick.confidence)}%</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
        <Typography className="mb-2" color="textSecondary" variant="subtitle2">
          Analysis
        </Typography>
        <Typography className="text-gray-600 dark:text-gray-300" variant="body2">
          {lineup.analysis}
        </Typography>
      </Box>
    </Box>
  );
};
