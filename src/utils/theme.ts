import { createTheme as createMuiTheme, Theme, ThemeOptions } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

// Define the theme type
declare module '@mui/material/styles' {
  interface Theme {
    custom: {
      maxWidth: number;
      headerHeight: number;
      sidebarWidth: number;
      borderRadius: number;
      transition: string;
    };
  }
  interface ThemeOptions {
    custom?: {
      maxWidth: number;
      headerHeight: number;
      sidebarWidth: number;
      borderRadius: number;
      transition: string;
    };
  }
}

// Create theme function
export const createTheme = (mode: 'light' | 'dark' = 'light'): Theme => {
  const isDark = mode === 'dark';

  return createMuiTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#90caf9' : '#1976d2',
        light: isDark ? '#e3f2fd' : '#42a5f5',
        dark: isDark ? '#1565c0' : '#1565c0',
        contrastText: isDark ? '#000' : '#fff',
      },
      secondary: {
        main: isDark ? '#f48fb1' : '#9c27b0',
        light: isDark ? '#fce4ec' : '#ba68c8',
        dark: isDark ? '#7b1fa2' : '#7b1fa2',
        contrastText: isDark ? '#000' : '#fff',
      },
      background: {
        default: isDark ? '#121212' : '#f5f5f5',
        paper: isDark ? '#1e1e1e' : '#ffffff',
      },
      text: {
        primary: isDark ? '#ffffff' : '#000000',
        secondary: isDark ? '#b0bec5' : '#757575',
      },
      error: {
        main: isDark ? '#ef5350' : '#d32f2f',
      },
      warning: {
        main: isDark ? '#ffb74d' : '#ed6c02',
      },
      info: {
        main: isDark ? '#29b6f6' : '#0288d1',
      },
      success: {
        main: isDark ? '#66bb6a' : '#2e7d32',
      },
    },
    typography: {
      fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h1: {
        fontSize: '2.5rem',
        fontWeight: 500,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 500,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      body1: {
        fontSize: '1rem',
      },
      body2: {
        fontSize: '0.875rem',
      },
    },
    shape: {
      borderRadius: 8,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            boxShadow: isDark ? '0 4px 6px rgba(0, 0, 0, 0.3)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
    custom: {
      maxWidth: 1200,
      headerHeight: 64,
      sidebarWidth: 240,
      borderRadius: 12,
      transition: 'all 0.3s ease-in-out',
    },
  });
};

// Hook to get the current theme
export const useTheme = () => {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  return createTheme(prefersDarkMode ? 'dark' : 'light');
};
