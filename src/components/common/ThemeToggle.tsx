import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useTheme as useCustomTheme } from '../../hooks/useTheme';

const ThemeToggle: React.FC = () => {
  const { theme } = useCustomTheme();
  const muiTheme = useTheme();
  const isDark = muiTheme.palette.mode === 'dark';

  return (
    <IconButton
      aria-label="toggle theme"
      color="inherit"
      sx={{
        color: muiTheme.palette.text.primary,
        '&:hover': {
          bgcolor: muiTheme.palette.action.hover,
        },
      }}
      onClick={theme.toggle}
    >
      {isDark ? <Brightness7 /> : <Brightness4 />}
    </IconButton>
  );
};

export default React.memo(ThemeToggle);
