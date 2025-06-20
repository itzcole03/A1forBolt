import React from 'react';
import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import SmartMenuIcon from '@mui/icons-material/SmartToy';
import ThemeToggle from './ThemeToggle';

import { motion } from 'framer-motion';

interface NavbarProps {
  onMenuClick: () => void;
  onSmartSidebarClick: () => void;
  title?: string;
}

const MotionIconButton = motion.create(IconButton);

const Navbar = ({
  onMenuClick,
  onSmartSidebarClick,
  title = 'Sports Betting App',
}: NavbarProps) => {
  const theme = useTheme();

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: theme.zIndex.drawer + 1,
        bgcolor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(8px)',
        borderBottom: 1,
        borderColor: 'divider',
      }}
    >
      <Toolbar>
        <MotionIconButton
          aria-label="open drawer"
          color="primary"
          edge="start"
          sx={{ mr: 2 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onMenuClick}
        >
          <MenuIcon />
        </MotionIconButton>
        <Typography
          noWrap
          component="div"
          sx={{
            flexGrow: 1,
            color: 'primary.main',
            fontWeight: 600,
          }}
          variant="h6"
        >
          {title}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MotionIconButton
            aria-label="open smart sidebar"
            color="primary"
            edge="start"
            sx={{ mr: 2 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onSmartSidebarClick}
          >
            <SmartMenuIcon />
          </MotionIconButton>
          <ThemeToggle />
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
