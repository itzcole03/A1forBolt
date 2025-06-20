import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  VStack,
  Text,
  useToast,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from '@chakra-ui/react';
import { useAuth } from '../../hooks/useAuth';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface BetFormProps {
  eventId: string;
  marketType: string;
  selection: string;
  odds: number;
  metadata: {
    sport: string;
    league: string;
    homeTeam: string;
    awayTeam: string;
    startTime: Date;
  };
}

export const BetForm: React.FC<BetFormProps> = ({
  eventId,
  marketType,
  selection,
  odds,
  metadata,
}) => {
  const [stake, setStake] = useState<number>(0);
  const { user } = useAuth();
  const toast = useToast();

  const placeBetMutation = useMutation({
    mutationFn: async (betData: any) => {
      const response = await axios.post('/api/betting/place', betData);
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: 'Bet placed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: error => {
      toast({
        title: 'Error placing bet',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: 'Authentication required',
        description: 'Please log in to place bets',
        status: 'warning',
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    placeBetMutation.mutate({
      eventId,
      marketType,
      selection,
      odds,
      stake,
      metadata,
    });
  };

  const potentialWinnings = stake * odds;

  return (
    <Box as="form" borderRadius="lg" borderWidth={1} p={4} onSubmit={handleSubmit}>
      <VStack align="stretch" spacing={4}>
        <Text fontSize="lg" fontWeight="bold">
          Place Your Bet
        </Text>

        <FormControl>
          <FormLabel>Event</FormLabel>
          <Text>
            {metadata.homeTeam} vs {metadata.awayTeam}
          </Text>
        </FormControl>

        <FormControl>
          <FormLabel>Market</FormLabel>
          <Text>{marketType}</Text>
        </FormControl>

        <FormControl>
          <FormLabel>Selection</FormLabel>
          <Text>{selection}</Text>
        </FormControl>

        <FormControl>
          <FormLabel>Odds</FormLabel>
          <Text>{odds}</Text>
        </FormControl>

        <FormControl isRequired>
          <FormLabel>Stake</FormLabel>
          <NumberInput
            min={0.01}
            step={0.01}
            value={stake}
            onChange={(_, value) => setStake(value)}
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </FormControl>

        <FormControl>
          <FormLabel>Potential Winnings</FormLabel>
          <Text>${potentialWinnings.toFixed(2)}</Text>
        </FormControl>

        <Button
          colorScheme="blue"
          isDisabled={!stake || stake < 0.01}
          isLoading={placeBetMutation.isPending}
          type="submit"
        >
          Place Bet
        </Button>
      </VStack>
    </Box>
  );
};
