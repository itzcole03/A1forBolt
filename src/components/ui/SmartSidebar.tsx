import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  IconButton,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SportsIcon from '@mui/icons-material/Sports';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import SettingsIcon from '@mui/icons-material/Settings';
import { useNavigate, useLocation } from 'react-router-dom';

interface SmartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Sports', icon: <SportsIcon />, path: '/sports' },
  { text: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const sidebarVariants = {
  open: {
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  closed: {
    x: -300,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
};

const backdropVariants = {
  open: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  closed: {
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

export const SmartSidebar: React.FC<SmartSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            animate="open"
            exit="closed"
            initial="closed"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 1199,
            }}
            variants={backdropVariants}
            onClick={onClose}
          />
          <motion.div
            animate="open"
            exit="closed"
            initial="closed"
            style={{
              position: 'fixed',
              left: 0,
              top: 0,
              height: '100%',
              width: '300px',
              zIndex: 1200,
            }}
            variants={sidebarVariants}
          >
            <Box
              sx={{
                height: '100%',
                bgcolor: 'background.paper',
                boxShadow: theme.shadows[4],
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: 1,
                  borderColor: 'divider',
                }}
              >
                <Typography color="primary" component="h2" variant="h6">
                  Navigation
                </Typography>
                <IconButton
                  size="small"
                  sx={{
                    '&:hover': {
                      bgcolor: 'action.hover',
                    },
                  }}
                  onClick={onClose}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              <List sx={{ flex: 1, pt: 1 }}>
                {menuItems.map(item => {
                  const isActive = location.pathname === item.path;
                  return (
                    <ListItem
                      key={item.text}
                      button
                      sx={{
                        my: 0.5,
                        mx: 1,
                        borderRadius: 1,
                        bgcolor: isActive ? 'action.selected' : 'transparent',
                        '&:hover': {
                          bgcolor: 'action.hover',
                        },
                      }}
                      onClick={() => {
                        navigate(item.path);
                        onClose();
                      }}
                    >
                      <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          color: isActive ? 'primary' : 'inherit',
                          fontWeight: isActive ? 600 : 400,
                        }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
