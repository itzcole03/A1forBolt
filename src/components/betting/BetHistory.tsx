import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  Badge,
  useColorModeValue,
  Spinner,
  Center,
} from '@chakra-ui/react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { format } from 'date-fns';

interface Bet {
  _id: string;
  eventId: string;
  marketType: string;
  selection: string;
  odds: number;
  stake: number;
  potentialWinnings: number;
  status: 'pending' | 'won' | 'lost' | 'cancelled';
  placedAt: string;
  settledAt?: string;
  result?: string;
  metadata: {
    sport: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    startTime: string;
  };
}

interface BetHistoryProps {
  status?: string;
}

export const BetHistory: React.FC<BetHistoryProps> = ({ status }) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const { data, isLoading, error } = useQuery<{ bets: Bet[]; pagination: any }>({
    queryKey: ['bets', status],
    queryFn: async () => {
      const response = await axios.get('/api/betting/my-bets', {
        params: { status },
      });
      return response.data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'won':
        return 'green';
      case 'lost':
        return 'red';
      case 'cancelled':
        return 'gray';
      default:
        return 'yellow';
    }
  };

  if (isLoading) {
    return (
      <Center p={8}>
        <Spinner size="xl" />
      </Center>
    );
  }

  if (error) {
    return (
      <Box p={4}>
        <Text color="red.500">Error loading betting history</Text>
      </Box>
    );
  }

  return (
    <Box bg={bgColor} borderColor={borderColor} borderRadius="lg" borderWidth={1} overflow="hidden">
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Event</Th>
            <Th>Market</Th>
            <Th>Selection</Th>
            <Th isNumeric>Odds</Th>
            <Th isNumeric>Stake</Th>
            <Th isNumeric>Potential Winnings</Th>
            <Th>Status</Th>
            <Th>Placed At</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data?.bets.map(bet => (
            <Tr key={bet._id}>
              <Td>
                <Text fontWeight="medium">
                  {bet.metadata.homeTeam} vs {bet.metadata.awayTeam}
                </Text>
                <Text color="gray.500" fontSize="sm">
                  {bet.metadata.league}
                </Text>
              </Td>
              <Td>{bet.marketType}</Td>
              <Td>{bet.selection}</Td>
              <Td isNumeric>{bet.odds}</Td>
              <Td isNumeric>${bet.stake.toFixed(2)}</Td>
              <Td isNumeric>${bet.potentialWinnings.toFixed(2)}</Td>
              <Td>
                <Badge colorScheme={getStatusColor(bet.status)}>{bet.status}</Badge>
              </Td>
              <Td>{format(new Date(bet.placedAt), 'MMM d, yyyy HH:mm')}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};
