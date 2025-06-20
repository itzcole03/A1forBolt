import { IconButton, useTheme } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import { useThemeStore } from '../../store/themeStore';

const ThemeToggle = () => {
  const theme = useTheme();
  const { toggleTheme } = useThemeStore();

  return (
    <IconButton aria-label="toggle theme" color="inherit" sx={{ ml: 1 }} onClick={toggleTheme}>
      {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
    </IconButton>
  );
};

export default ThemeToggle;
