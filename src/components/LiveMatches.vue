<template>
  <div class="live-matches">
    <div class="header">
      <h2>Live Matches</h2>
      <div class="connection-status" :class="{ connected: isConnected }">
        {{ isConnected ? 'Connected' : 'Disconnected' }}
      </div>
    </div>

    <div v-if="error" class="error-message">
      {{ error.message }}
    </div>

    <div v-if="!isConnected" class="loading">
      Connecting to live updates...
    </div>

    <div v-else-if="messages.length === 0" class="no-matches">
      No live matches at the moment
    </div>

    <div v-else class="matches-grid">
      <div v-for="match in currentMatches" :key="match.id" class="match-card">
        <div class="match-header">
          <span class="match-time">{{ formatTime(match.start_time) }}</span>
          <span class="match-status">{{ match.status }}</span>
        </div>

        <div class="teams">
          <div class="team home">
            <span class="team-name">{{ match.home_team }}</span>
            <span class="team-odds">{{ formatOdds(match.odds, 'home') }}</span>
          </div>
          <div class="vs">VS</div>
          <div class="team away">
            <span class="team-name">{{ match.away_team }}</span>
            <span class="team-odds">{{ formatOdds(match.odds, 'away') }}</span>
          </div>
        </div>

        <div class="match-actions">
          <button @click="subscribeToMatch(match.id)" class="subscribe-btn">
            Subscribe to Updates
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useWebSocket } from '@/services/websocket';
import { format } from 'date-fns';

interface Match {
  id: string;
  home_team: string;
  away_team: string;
  start_time: string;
  status: string;
  odds: {
    home: number;
    draw: number;
    away: number;
  };
}

const { isConnected, messages, error } = useWebSocket('live_matches', {
  onMessage: (message) => {
    console.log('Received live match update:', message);
  },
});

const currentMatches = computed(() => {
  if (messages.value.length === 0) return [];
  
  // Get the latest message
  const latestMessage = messages.value[messages.value.length - 1];
  return latestMessage.data as Match[];
});

const formatTime = (time: string) => {
  try {
    return format(new Date(time), 'HH:mm');
  } catch (error) {
    return time;
  }
};

const formatOdds = (odds: any, type: 'home' | 'away' | 'draw') => {
  if (!odds) return '-';
  const odd = odds.find((o: any) => o.type === type);
  return odd ? odd.price.toFixed(2) : '-';
};

const subscribeToMatch = (matchId: string) => {
  // Implement match subscription logic
  console.log('Subscribing to match:', matchId);
};
</script>

<style scoped>
.live-matches {
  padding: 1rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.connection-status {
  padding: 0.5rem 1rem;
  border-radius: 1rem;
  font-size: 0.875rem;
  background-color: #ef4444;
  color: white;
}

.connection-status.connected {
  background-color: #22c55e;
}

.error-message {
  padding: 1rem;
  background-color: #fee2e2;
  color: #dc2626;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.loading,
.no-matches {
  text-align: center;
  padding: 2rem;
  color: #6b7280;
}

.matches-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.match-card {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.match-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.875rem;
  color: #6b7280;
}

.teams {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1rem;
}

.team {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.team-name {
  font-weight: 600;
}

.team-odds {
  font-size: 0.875rem;
  color: #6b7280;
}

.vs {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 600;
}

.match-actions {
  display: flex;
  justify-content: center;
}

.subscribe-btn {
  padding: 0.5rem 1rem;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.subscribe-btn:hover {
  background-color: #2563eb;
}
</style> 