import { createTheme, alpha } from '@mui/material/styles';

// Material Design 3 inspired dark theme with Fênix brand colors
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#f97316',    // phoenix-500
      light: '#fb923c',   // phoenix-400
      dark: '#ea580c',    // phoenix-600
      contrastText: '#fff',
    },
    secondary: {
      main: '#10b981',    // emerald-500
      light: '#34d399',
      dark: '#059669',
      contrastText: '#fff',
    },
    error: {
      main: '#ef4444',
    },
    warning: {
      main: '#f59e0b',
    },
    success: {
      main: '#10b981',
    },
    background: {
      default: '#09090b',
      paper: '#121214',
    },
    text: {
      primary: '#fafafa',
      secondary: '#a1a1aa',
    },
    divider: 'rgba(255,255,255,0.08)',
  },
  typography: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.03em',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 700,
      letterSpacing: '0.04em',
      textTransform: 'none',
    },
    overline: {
      fontWeight: 700,
      letterSpacing: '0.12em',
      fontFamily: "'JetBrains Mono', 'Menlo', monospace",
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: 'linear-gradient(135deg, #09090b 0%, #121214 50%, #09090b 100%)',
          backgroundAttachment: 'fixed',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '::selection': {
          backgroundColor: 'rgba(249, 115, 22, 0.3)',
          color: '#fafafa',
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: '#09090b',
        },
        '::-webkit-scrollbar-thumb': {
          background: '#3f3f46',
          borderRadius: '4px',
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: '#71717a',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.875rem',
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
          boxShadow: '0 4px 14px rgba(249, 115, 22, 0.3)',
          '&:hover': {
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
            boxShadow: '0 6px 20px rgba(249, 115, 22, 0.4)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(18, 18, 20, 0.6)',
          border: '1px solid rgba(255,255,255,0.06)',
          backdropFilter: 'blur(12px)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            borderColor: 'rgba(249, 115, 22, 0.3)',
            boxShadow: '0 8px 32px rgba(249, 115, 22, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            backgroundColor: 'rgba(9, 9, 11, 0.6)',
            '& fieldset': {
              borderColor: 'rgba(255,255,255,0.08)',
            },
            '&:hover fieldset': {
              borderColor: 'rgba(249, 115, 22, 0.4)',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#f97316',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          fontSize: '0.7rem',
          letterSpacing: '0.06em',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 8,
          backgroundColor: 'rgba(255,255,255,0.06)',
        },
        bar: {
          borderRadius: 8,
          background: 'linear-gradient(90deg, #ea580c, #fb923c)',
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          background: 'transparent',
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          color: '#27272a',
          '&.Mui-active': {
            color: '#f97316',
          },
          '&.Mui-completed': {
            color: '#10b981',
          },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(9, 9, 11, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: '#3f3f46',
          '&.Mui-checked': {
            color: '#f97316',
          },
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: {
          color: '#f97316',
          height: 6,
        },
        thumb: {
          width: 20,
          height: 20,
          '&:hover': {
            boxShadow: '0 0 0 8px rgba(249, 115, 22, 0.16)',
          },
        },
        track: {
          background: 'linear-gradient(90deg, #ea580c, #fb923c)',
          border: 'none',
        },
        rail: {
          backgroundColor: '#27272a',
        },
      },
    },
    MuiFab: {
      styleOverrides: {
        primary: {
          background: 'linear-gradient(135deg, #ea580c 0%, #f97316 100%)',
          boxShadow: '0 4px 20px rgba(249, 115, 22, 0.35)',
          '&:hover': {
            background: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
            boxShadow: '0 6px 28px rgba(249, 115, 22, 0.5)',
          },
        },
      },
    },
  },
});

export default theme;
