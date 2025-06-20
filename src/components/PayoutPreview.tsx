import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { usePayoutStore } from '../stores/payoutStore';
import { useRiskProfileStore } from '../stores/riskProfileStore';
import { Box, Typography, Paper, Button } from '@mui/material';
import styled from '@emotion/styled';
import { fadeIn, scale, flash, durations, timingFunctions } from '../utils/animations';
import { WebSocketMessage } from '../types/websocket';

const PreviewContainer: React.FC<React.PropsWithChildren<{}>> = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  animation: `${fadeIn} ${durations.normal} ${timingFunctions.easeInOut}`,
})) as unknown as React.FC<React.PropsWithChildren<{}>>;

const ValueDisplay: React.FC<React.PropsWithChildren<{ changed?: boolean }>> = styled(Box)<{
  changed?: boolean;
}>(({ theme, changed }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: theme.spacing(1),
  borderBottom: `1px solid ${theme.palette.divider}`,
  '&:last-child': {
    borderBottom: 'none',
  },
  backgroundColor: changed ? theme.palette.primary.light : 'transparent',
  transition: `background-color ${durations.normal} ${timingFunctions.easeInOut}`,
  animation: changed ? `${flash} ${durations.normal} ${timingFunctions.easeInOut}` : 'none',
})) as unknown as React.FC<React.PropsWithChildren<{ changed?: boolean }>>;

const Value: React.FC<React.PropsWithChildren<{ changed?: boolean; variant?: any; color?: any }>> =
  styled(Typography)<{ changed?: boolean }>(({ theme, changed }) => ({
    fontWeight: changed ? 'bold' : 'normal',
    transition: `all ${durations.normal} ${timingFunctions.easeInOut}`,
    animation: changed ? `${scale} ${durations.normal} ${timingFunctions.easeInOut}` : 'none',
  })) as unknown as React.FC<
    React.PropsWithChildren<{ changed?: boolean; variant?: any; color?: any }>
  >;

const PlaceBetButton: React.FC<
  React.PropsWithChildren<{
    changed?: boolean;
    variant?: any;
    color?: any;
    fullWidth?: boolean;
    onClick?: () => void;
    disabled?: boolean;
  }>
> = styled(Button)<{ changed?: boolean }>(({ theme, changed }) => ({
  marginTop: theme.spacing(2),
  transition: `all ${durations.normal} ${timingFunctions.easeInOut}`,
  animation: changed ? `${scale} ${durations.normal} ${timingFunctions.easeInOut}` : 'none',
})) as unknown as React.FC<
  React.PropsWithChildren<{
    changed?: boolean;
    variant?: any;
    color?: any;
    fullWidth?: boolean;
    onClick?: () => void;
    disabled?: boolean;
  }>
>;

interface PayoutPreviewProps {
  eventId: string;
}

export const PayoutPreview: React.FC<PayoutPreviewProps> = ({ eventId }) => {
  const payoutPreview = usePayoutStore(state => state.getPayoutPreview(eventId));
  const { currentProfile, bankroll } = useRiskProfileStore();
  const [changedValues, setChangedValues] = useState<Set<string>>(new Set());
  const [previousValues, setPreviousValues] = useState<Record<string, number>>({});

  // WebSocket for real-time payout/odds updates
  const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws'}?channel=payout-preview&eventId=${eventId}`;
  useWebSocket(wsUrl, {
    onMessage: (msg: WebSocketMessage) => {
      if (msg.event === 'odds_update' && msg.data?.eventId === eventId) {
        // Optionally handle odds update
      }
      if (msg.event === 'payout_update' && msg.data?.eventId === eventId) {
        usePayoutStore.getState().updatePayoutPreview(eventId, msg.data);
      }
    },
  });

  useEffect(() => {
    if (payoutPreview) {
      const newChangedValues = new Set<string>();
      const newPreviousValues = { ...previousValues };
      if (previousValues.potential_payout !== payoutPreview.potential_payout) {
        newChangedValues.add('potential_payout');
        newPreviousValues.potential_payout = payoutPreview.potential_payout;
      }
      if (previousValues.kelly_stake !== payoutPreview.kelly_stake) {
        newChangedValues.add('kelly_stake');
        newPreviousValues.kelly_stake = payoutPreview.kelly_stake;
      }
      if (previousValues.risk_adjusted_stake !== payoutPreview.risk_adjusted_stake) {
        newChangedValues.add('risk_adjusted_stake');
        newPreviousValues.risk_adjusted_stake = payoutPreview.risk_adjusted_stake;
      }
      if (previousValues.expected_value !== payoutPreview.expected_value) {
        newChangedValues.add('expected_value');
        newPreviousValues.expected_value = payoutPreview.expected_value;
      }
      setChangedValues(newChangedValues);
      setPreviousValues(newPreviousValues);
      const timeout = setTimeout(
        () => setChangedValues(new Set()),
        parseInt(durations.normal) * 1000 || 300
      );
      return () => clearTimeout(timeout);
    }
  }, [payoutPreview]);

  if (!payoutPreview) {
    return (
      <PreviewContainer>
        <Typography color="textSecondary" variant="body2">
          Loading payout preview...
        </Typography>
      </PreviewContainer>
    );
  }

  const handlePlaceBet = () => {
    // TODO: Implement bet placement logic
    console.log('Placing bet with stake:', payoutPreview.risk_adjusted_stake);
  };

  return (
    <PreviewContainer>
      <Typography gutterBottom variant="h6">
        Payout Preview
      </Typography>

      <ValueDisplay changed={changedValues.has('potential_payout')}>
        <Typography variant="body2">Potential Payout</Typography>
        <Value changed={changedValues.has('potential_payout')} color="primary" variant="body1">
          ${payoutPreview.potential_payout.toFixed(2)}
        </Value>
      </ValueDisplay>

      <ValueDisplay changed={changedValues.has('kelly_stake')}>
        <Typography variant="body2">Kelly Criterion Stake</Typography>
        <Value changed={changedValues.has('kelly_stake')} variant="body1">
          ${payoutPreview.kelly_stake.toFixed(2)}
        </Value>
      </ValueDisplay>

      <ValueDisplay changed={changedValues.has('risk_adjusted_stake')}>
        <Typography variant="body2">Risk-Adjusted Stake</Typography>
        <Value changed={changedValues.has('risk_adjusted_stake')} color="secondary" variant="body1">
          ${payoutPreview.risk_adjusted_stake.toFixed(2)}
        </Value>
      </ValueDisplay>

      <ValueDisplay changed={changedValues.has('expected_value')}>
        <Typography variant="body2">Expected Value</Typography>
        <Value
          changed={changedValues.has('expected_value')}
          color={payoutPreview.expected_value > 0 ? 'success.main' : 'error.main'}
          variant="body1"
        >
          ${payoutPreview.expected_value.toFixed(2)}
        </Value>
      </ValueDisplay>

      <PlaceBetButton
        fullWidth
        changed={changedValues.has('risk_adjusted_stake')}
        color="primary"
        disabled={payoutPreview.expected_value <= 0}
        variant="contained"
        onClick={handlePlaceBet}
      >
        Place Bet (${payoutPreview.risk_adjusted_stake.toFixed(2)})
      </PlaceBetButton>

      <Box mt={1}>
        <Typography color="textSecondary" variant="caption">
          Risk Profile: {currentProfile.profile_type}
          <br />
          Bankroll: ${bankroll.toFixed(2)}
        </Typography>
      </Box>
    </PreviewContainer>
  );
};
