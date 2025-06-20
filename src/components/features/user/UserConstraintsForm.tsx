import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
} from '@mui/material';
import { UserConstraints } from '@/types';

interface UserConstraintsFormProps {
  constraints: UserConstraints;
  onConstraintsChange: (field: keyof UserConstraints, value: any) => void;
}

const SPORTS_OPTIONS = ['NBA', 'NFL', 'MLB', 'NHL', 'Soccer'];
const MARKET_OPTIONS = ['Moneyline', 'Spread', 'Over/Under', 'Props', 'Parlays'];

export const UserConstraintsForm: React.FC<UserConstraintsFormProps> = ({
  constraints,
  onConstraintsChange,
}) => {
  const handleMultiSelectChange = (
    field: 'preferred_sports' | 'preferred_markets',
    value: string[]
  ) => {
    onConstraintsChange(field, value);
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto' }}>
      <Typography gutterBottom variant="h6">
        Betting Constraints
      </Typography>

      <Box sx={{ mt: 3 }}>
        <Typography gutterBottom>Maximum Stake (% of Bankroll)</Typography>
        <Slider
          marks={[
            { value: 1, label: '1%' },
            { value: 25, label: '25%' },
            { value: 50, label: '50%' },
          ]}
          max={50}
          min={1}
          value={constraints.max_bankroll_stake * 100}
          valueLabelDisplay="auto"
          valueLabelFormat={value => `${value}%`}
          onChange={(_, value) =>
            onConstraintsChange('max_bankroll_stake', (value as number) / 100)
          }
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <Typography gutterBottom>Time Window (Hours)</Typography>
        <TextField
          fullWidth
          inputProps={{ min: 1, max: 168 }}
          type="number"
          value={constraints.time_window_hours}
          onChange={e => onConstraintsChange('time_window_hours', parseInt(e.target.value))}
        />
      </Box>

      <Box sx={{ mt: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Preferred Sports</InputLabel>
          <Select
            multiple
            input={<OutlinedInput label="Preferred Sports" />}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(value => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            value={constraints.preferred_sports}
            onChange={e => handleMultiSelectChange('preferred_sports', e.target.value as string[])}
          >
            {SPORTS_OPTIONS.map(sport => (
              <MenuItem key={sport} value={sport}>
                {sport}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ mt: 3 }}>
        <FormControl fullWidth>
          <InputLabel>Preferred Markets</InputLabel>
          <Select
            multiple
            input={<OutlinedInput label="Preferred Markets" />}
            renderValue={selected => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map(value => (
                  <Chip key={value} label={value} />
                ))}
              </Box>
            )}
            value={constraints.preferred_markets}
            onChange={e => handleMultiSelectChange('preferred_markets', e.target.value as string[])}
          >
            {MARKET_OPTIONS.map(market => (
              <MenuItem key={market} value={market}>
                {market}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};
