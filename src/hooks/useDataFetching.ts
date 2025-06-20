import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useStore } from '../store';
import { api } from '../services/api';
import { showError, showSuccess } from '../components/Toaster';
import { Bet, Prop, UserStats, PerformanceData, Headline } from '../types';

export const useDataFetching = () => {
  const queryClient = useQueryClient();
  const { setProps, setStats, setPerformance, setHeadlines } = useStore();

  // Fetch props
  const { data: props, isLoading: isLoadingProps } = useQuery({
    queryKey: ['props'],
    queryFn: async () => {
      const response = await api.getProps();
      setProps(response.data);
      return response.data;
    },
    onError: error => {
      showError('Failed to fetch props');
      console.error('Error fetching props:', error);
    },
  });

  // Fetch user stats
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const response = await api.getUserStats();
      setStats(response.data);
      return response.data;
    },
    onError: error => {
      showError('Failed to fetch user stats');
      console.error('Error fetching stats:', error);
    },
  });

  // Fetch performance data
  const { data: performance, isLoading: isLoadingPerformance } = useQuery({
    queryKey: ['performance'],
    queryFn: async () => {
      const response = await api.getPerformance();
      setPerformance(response.data);
      return response.data;
    },
    onError: error => {
      showError('Failed to fetch performance data');
      console.error('Error fetching performance:', error);
    },
  });

  // Fetch headlines
  const { data: headlines, isLoading: isLoadingHeadlines } = useQuery({
    queryKey: ['headlines'],
    queryFn: async () => {
      const response = await api.getHeadlines();
      setHeadlines(response.data);
      return response.data;
    },
    onError: error => {
      showError('Failed to fetch headlines');
      console.error('Error fetching headlines:', error);
    },
  });

  // Place bet mutation
  const placeBetMutation = useMutation({
    mutationFn: async (bet: Omit<Bet, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await api.placeBet(bet);
      return response.data;
    },
    onSuccess: () => {
      showSuccess('Bet placed successfully');
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
    onError: error => {
      showError('Failed to place bet');
      console.error('Error placing bet:', error);
    },
  });

  return {
    props,
    stats,
    performance,
    headlines,
    isLoadingProps,
    isLoadingStats,
    isLoadingPerformance,
    isLoadingHeadlines,
    placeBet: placeBetMutation.mutate,
    isPlacingBet: placeBetMutation.isPending,
  };
};
