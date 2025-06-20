import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  TextField,
  Button,
  Divider,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useBettingStore } from '../../stores/bettingStore';
import { Bet } from '../../types/betting';

interface BetSlipProps {
  onPlaceBet: (bet: Omit<Bet, 'id' | 'status' | 'timestamp'>) => void;
}

const BetSlip: React.FC<BetSlipProps> = ({ onPlaceBet }) => {
  const { betSlip, removeBet, updateBetAmount, clearBetSlip } = useBettingStore();

  const handleStakeChange = (betId: string, amount: string) => {
    const numAmount = parseFloat(amount);
    if (!isNaN(numAmount) && numAmount >= 0) {
      updateBetAmount(betId, numAmount);
    }
  };

  const handlePlaceBets = () => {
    betSlip.bets.forEach(bet => {
      onPlaceBet({
        eventId: bet.eventId,
        market: bet.market,
        selection: bet.selection,
        odds: bet.odds,
        stake: bet.stake,
        potentialWinnings: bet.potentialWinnings,
      });
    });
    clearBetSlip();
  };

  if (betSlip.bets.length === 0) {
    return (
      <Box p={2}>
        <Typography gutterBottom variant="h6">
          Bet Slip
        </Typography>
        <Typography align="center" color="text.secondary">
          Add selections to your bet slip
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box alignItems="center" display="flex" justifyContent="space-between" p={2}>
        <Typography variant="h6">Bet Slip</Typography>
        <Button
          color="error"
          disabled={betSlip.bets.length === 0}
          size="small"
          onClick={clearBetSlip}
        >
          Clear All
        </Button>
      </Box>
      <Divider />
      <List>
        {betSlip.bets.map(bet => (
          <ListItem key={bet.id} divider>
            <ListItemText
              primary={bet.selection}
              secondary={
                <Box>
                  <Typography color="text.secondary" variant="body2">
                    {bet.market}
                  </Typography>
                  <Typography color="text.secondary" variant="body2">
                    Odds: {bet.odds}
                  </Typography>
                </Box>
              }
            />
            <ListItemSecondaryAction>
              <Box alignItems="center" display="flex" gap={1}>
                <TextField
                  inputProps={{ min: 0, step: 0.01 }}
                  size="small"
                  sx={{ width: '100px' }}
                  type="number"
                  value={bet.stake}
                  onChange={e => handleStakeChange(bet.id, e.target.value)}
                />
                <IconButton aria-label="delete" edge="end" onClick={() => removeBet(bet.id)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box p={2}>
        <Box display="flex" justifyContent="space-between" mb={1}>
          <Typography>Total Stake:</Typography>
          <Typography>${betSlip.totalStake.toFixed(2)}</Typography>
        </Box>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography>Potential Winnings:</Typography>
          <Typography>${betSlip.potentialWinnings.toFixed(2)}</Typography>
        </Box>
        <Button
          fullWidth
          color="primary"
          disabled={betSlip.bets.length === 0}
          variant="contained"
          onClick={handlePlaceBets}
        >
          Place Bets
        </Button>
      </Box>
    </Box>
  );
};

export default React.memo(BetSlip);
