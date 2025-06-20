import React from 'react';
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useColorModeValue,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

interface BettingStats {
  _id: string;
  count: number;
  totalStake: number;
  totalWinnings: number;
}

export const BettingStats: React.FC = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { data, isLoading, error } = useQuery<BettingStats[]>({
    queryKey: ['bettingStats'],
    queryFn: async () => {
      const response = await axios.get('/api/betting/stats/summary');
      return response.data;
    },
  });

  if (isLoading || error || !data) {
    return null;
  }

  const stats = {
    total: data.reduce((acc, curr) => acc + curr.count, 0),
    won: data.find(stat => stat._id === 'won')?.count || 0,
    lost: data.find(stat => stat._id === 'lost')?.count || 0,
    pending: data.find(stat => stat._id === 'pending')?.count || 0,
    totalStake: data.reduce((acc, curr) => acc + curr.totalStake, 0),
    totalWinnings: data.reduce((acc, curr) => acc + curr.totalWinnings, 0),
  };

  const winRate = stats.total > 0 ? (stats.won / (stats.won + stats.lost)) * 100 : 0;
  const profit = stats.totalWinnings - stats.totalStake;
  const roi = stats.totalStake > 0 ? (profit / stats.totalStake) * 100 : 0;

  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
      <Box bg={bgColor} borderColor={borderColor} borderRadius="lg" borderWidth={1} p={4}>
        <Stat>
          <StatLabel>Total Bets</StatLabel>
          <StatNumber>{stats.total}</StatNumber>
          <StatHelpText>{stats.pending} pending</StatHelpText>
        </Stat>
      </Box>

      <Box bg={bgColor} borderColor={borderColor} borderRadius="lg" borderWidth={1} p={4}>
        <Stat>
          <StatLabel>Win Rate</StatLabel>
          <StatNumber>{winRate.toFixed(1)}%</StatNumber>
          <StatHelpText>
            {stats.won} wins / {stats.lost} losses
          </StatHelpText>
        </Stat>
      </Box>

      <Box bg={bgColor} borderColor={borderColor} borderRadius="lg" borderWidth={1} p={4}>
        <Stat>
          <StatLabel>Total Stake</StatLabel>
          <StatNumber>${stats.totalStake.toFixed(2)}</StatNumber>
          <StatHelpText>
            Average ${(stats.totalStake / stats.total).toFixed(2)} per bet
          </StatHelpText>
        </Stat>
      </Box>

      <Box bg={bgColor} borderColor={borderColor} borderRadius="lg" borderWidth={1} p={4}>
        <Stat>
          <StatLabel>Profit/Loss</StatLabel>
          <StatNumber>
            ${profit.toFixed(2)}
            <StatArrow type={profit >= 0 ? 'increase' : 'decrease'} />
          </StatNumber>
          <StatHelpText>ROI: {roi.toFixed(1)}%</StatHelpText>
        </Stat>
      </Box>
    </SimpleGrid>
  );
};
