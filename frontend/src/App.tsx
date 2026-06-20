import React, { useState, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SnackbarProvider } from 'notistack';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';

import { Layout } from './components/Layout';
import { UserList } from './pages/UserList';
import { UserCreate } from './pages/UserCreate';
import { UserEdit } from './pages/UserEdit';
import { UserDetail } from './pages/UserDetail';

// Module augmentation to support custom palette fields in TypeScript
declare module '@mui/material/styles' {
  interface Palette {
    neutral: {
      main: string;
    };
  }
  interface PaletteOptions {
    neutral?: {
      main: string;
    };
  }
  interface PaletteColor {
    lightOpacity?: string;
  }
  interface SimplePaletteColorOptions {
    lightOpacity?: string;
  }
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const App: React.FC = () => {
  // Read theme preference from localStorage or fallback to false (light mode)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme-mode');
    return saved === 'dark';
  });

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      localStorage.setItem('theme-mode', next ? 'dark' : 'light');
      return next;
    });
  };

  // Generate responsive, polished MUI Theme
  const theme = useMemo(() => {
    const mode = darkMode ? 'dark' : 'light';
    return createTheme({
      palette: {
        mode,
        primary: {
          main: mode === 'dark' ? '#818cf8' : '#4f46e5', // indigo 400 vs indigo 600
          lightOpacity: mode === 'dark' ? 'rgba(129, 140, 248, 0.12)' : 'rgba(79, 70, 229, 0.08)',
        },
        secondary: {
          main: mode === 'dark' ? '#2dd4bf' : '#0f766e', // teal 400 vs teal 700
        },
        background: {
          default: mode === 'dark' ? '#0b0f19' : '#f8fafc', // deep dark slate vs light slate
          paper: mode === 'dark' ? '#111827' : '#ffffff',  // gray 900 vs white
        },
        text: {
          primary: mode === 'dark' ? '#f9fafb' : '#0f172a',
          secondary: mode === 'dark' ? '#9ca3af' : '#475569',
        },
        neutral: {
          main: mode === 'dark' ? '#1f2937' : '#f1f5f9',
        },
        info: {
          main: '#0284c7',
          lightOpacity: 'rgba(2, 132, 199, 0.08)',
        },
      },
      typography: {
        fontFamily: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ].join(','),
        h4: {
          fontSize: '1.875rem',
          fontWeight: 700,
          letterSpacing: '-0.025em',
        },
        h5: {
          fontSize: '1.5rem',
          fontWeight: 700,
          letterSpacing: '-0.025em',
        },
        h6: {
          fontSize: '1.125rem',
          fontWeight: 600,
        },
        body1: {
          fontSize: '0.975rem',
          lineHeight: 1.6,
        },
        body2: {
          fontSize: '0.875rem',
          lineHeight: 1.5,
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
              boxShadow: 'none',
              borderRadius: 8,
              fontWeight: 600,
              '&:hover': {
                boxShadow: 'none',
              },
            },
          },
        },
        MuiCard: {
          styleOverrides: {
            root: {
              boxShadow: 'none',
            },
          },
        },
        MuiTextField: {
          defaultProps: {
            size: 'small',
          },
        },
        MuiSelect: {
          defaultProps: {
            size: 'small',
          },
        },
      },
    });
  }, [darkMode]);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider
          maxSnack={3}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          autoHideDuration={4000}
        >
          <BrowserRouter>
            <Routes>
              {/* Outer Layout containing common nav & sidebar */}
              <Route path="/" element={<Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} />}>
                {/* Default route redirects to /users directory */}
                <Route index element={<Navigate to="/users" replace />} />
                
                {/* Users CRUD operations */}
                <Route path="users" element={<UserList />} />
                <Route path="users/create" element={<UserCreate />} />
                <Route path="users/:id" element={<UserDetail />} />
                <Route path="users/:id/edit" element={<UserEdit />} />
              </Route>
              
              {/* Fallback routing */}
              <Route path="*" element={<Navigate to="/users" replace />} />
            </Routes>
          </BrowserRouter>
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
