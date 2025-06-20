import React from 'react';
import { IconButton, useTheme } from '@mui/material';
import { Brightness4, Brightness7 } from '@mui/icons-material';
import { useThemeStore } from '@stores/themeStore';

import { motion } from 'framer-motion';

const MotionIconButton = motion.create(IconButton);

const ThemeToggle = () => {
  const theme = useTheme();
  const { toggleTheme } = useThemeStore();

  return (
    <MotionIconButton
      aria-label="toggle theme"
      color="primary"
      sx={{
        transition: 'transform 0.2s ease-in-out',
        '&:hover': {
          transform: 'rotate(15deg)',
        },
      }}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
    >
      {theme.palette.mode === 'dark' ? (
        <motion.div
          animate={{ rotate: 360 }}
          initial={{ rotate: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Brightness7 />
        </motion.div>
      ) : (
        <motion.div
          animate={{ rotate: 360 }}
          initial={{ rotate: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Brightness4 />
        </motion.div>
      )}
    </MotionIconButton>
  );
};

export default ThemeToggle;
