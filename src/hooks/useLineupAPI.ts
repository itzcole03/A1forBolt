import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getPlayers, submitLineup, type Player, type LineupSubmission } from '@/services/api';
import { useCallback, useMemo } from 'react';

export const LINEUP_QUERY_KEY = ['lineup'];

export function useLineupAPI() {
  const queryClient = useQueryClient();

  const {
    data: players = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: LINEUP_QUERY_KEY,
    queryFn: getPlayers,
  });

  const submitMutation = useMutation({
    mutationFn: submitLineup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: LINEUP_QUERY_KEY });
    },
  });

  const filterPlayers = useCallback(
    ({
      position,
      team,
      minSalary,
      maxSalary,
      minConfidence,
      searchTerm,
    }: {
      position?: string;
      team?: string;
      minSalary?: number;
      maxSalary?: number;
      minConfidence?: number;
      searchTerm?: string;
    } = {}) => {
      return players.filter(player => {
        if (position && player.position !== position) return false;
        if (team && player.team !== team) return false;
        if (minSalary && player.salary < minSalary) return false;
        if (maxSalary && player.salary > maxSalary) return false;
        if (minConfidence && player.confidence < minConfidence) return false;
        if (searchTerm && !player.name.toLowerCase().includes(searchTerm.toLowerCase()))
          return false;
        return true;
      });
    },
    [players]
  );

  const positions = useMemo(() => {
    return Array.from(new Set(players.map(p => p.position))).sort();
  }, [players]);

  const teams = useMemo(() => {
    return Array.from(new Set(players.map(p => p.team))).sort();
  }, [players]);

  const validateLineup = useCallback((selectedPlayers: Player[]) => {
    const errors: string[] = [];
    const totalSalary = selectedPlayers.reduce((sum, p) => sum + p.salary, 0);

    if (totalSalary > 50000) {
      errors.push('Lineup exceeds salary cap of $50,000');
    }

    const positionCounts = selectedPlayers.reduce(
      (counts, player) => {
        counts[player.position] = (counts[player.position] || 0) + 1;
        return counts;
      },
      {} as Record<string, number>
    );

    // Example position requirements - adjust based on sport
    const requirements = {
      QB: 1,
      RB: 2,
      WR: 3,
      TE: 1,
      FLEX: 1,
      DST: 1,
    };

    Object.entries(requirements).forEach(([position, required]) => {
      const actual = positionCounts[position] || 0;
      if (actual < required) {
        errors.push(`Need ${required} ${position}, have ${actual}`);
      }
    });

    return {
      isValid: errors.length === 0,
      errors,
      totalSalary,
    };
  }, []);

  return {
    players,
    isLoading,
    error,
    filterPlayers,
    positions,
    teams,
    validateLineup,
    submitLineup: submitMutation.mutate,
    isSubmitting: submitMutation.isPending,
    submitError: submitMutation.error,
  };
}
