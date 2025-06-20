import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  SportsSoccer as SportsIcon,
  AccountBalance as WalletIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

const menuItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Sports', icon: <SportsIcon />, path: '/sports' },
  { text: 'Wallet', icon: <WalletIcon />, path: '/wallet' },
  { text: 'History', icon: <HistoryIcon />, path: '/history' },
  { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
];

const Sidebar = ({ open, onClose }: SidebarProps) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigation = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      sx={{
        width: theme.custom.sidebarWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: theme.custom.sidebarWidth,
          boxSizing: 'border-box',
          mt: `${theme.custom.headerHeight}px`,
          transition: theme.custom.transition,
        },
      }}
      variant="persistent"
      onClose={onClose}
    >
      <List>
        {menuItems.map(item => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;
