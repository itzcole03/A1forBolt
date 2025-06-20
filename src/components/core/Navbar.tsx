import React from 'react';
import { AppBar, IconButton, Toolbar, Typography, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ThemeToggle from '../ThemeToggle/ThemeToggle';

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        height: theme.custom.headerHeight,
        transition: theme.custom.transition,
      }}
    >
      <Toolbar>
        <IconButton
          aria-label="open drawer"
          color="inherit"
          edge="start"
          sx={{ mr: 2 }}
          onClick={onMenuClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography noWrap component="div" sx={{ flexGrow: 1 }} variant="h6">
          Sports Betting App
        </Typography>
        <ThemeToggle />
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
