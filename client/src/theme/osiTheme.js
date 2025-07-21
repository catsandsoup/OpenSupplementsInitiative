import { createTheme } from '@mui/material/styles';

// OSI Brand Colors
const osiColors = {
  primary: {
    main: '#2E7D32', // Forest Green - represents trust, health, nature
    light: '#4CAF50',
    dark: '#1B5E20',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#FF6B35', // Vibrant Orange - represents innovation, energy
    light: '#FF8A65',
    dark: '#E64A19',
    contrastText: '#ffffff',
  },
  success: {
    main: '#4CAF50',
    light: '#81C784',
    dark: '#388E3C',
  },
  warning: {
    main: '#FF9800',
    light: '#FFB74D',
    dark: '#F57C00',
  },
  error: {
    main: '#F44336',
    light: '#EF5350',
    dark: '#D32F2F',
  },
  info: {
    main: '#2196F3',
    light: '#64B5F6',
    dark: '#1976D2',
  },
  grey: {
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
  },
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
  },
  text: {
    primary: '#212121',
    secondary: '#757575',
  },
};

// Custom component styles
const componentOverrides = {
  MuiAppBar: {
    styleOverrides: {
      root: {
        backgroundColor: osiColors.primary.main,
        boxShadow: '0 2px 8px rgba(46, 125, 50, 0.15)',
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        boxShadow: '0 2px 12px rgba(0, 0, 0, 0.08)',
        transition: 'box-shadow 0.3s ease-in-out, transform 0.2s ease-in-out',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)',
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        textTransform: 'none',
        fontWeight: 600,
        padding: '10px 24px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 16,
        fontWeight: 500,
      },
      colorPrimary: {
        backgroundColor: osiColors.primary.light,
        color: '#ffffff',
      },
      colorSuccess: {
        backgroundColor: osiColors.success.main,
        color: '#ffffff',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 8,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: osiColors.primary.light,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: osiColors.primary.main,
            borderWidth: 2,
          },
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
      elevation1: {
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
      },
      elevation3: {
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        '&.MuiAlert-standardSuccess': {
          backgroundColor: '#E8F5E8',
          color: osiColors.success.dark,
        },
        '&.MuiAlert-standardError': {
          backgroundColor: '#FFEBEE',
          color: osiColors.error.dark,
        },
        '&.MuiAlert-standardWarning': {
          backgroundColor: '#FFF3E0',
          color: osiColors.warning.dark,
        },
        '&.MuiAlert-standardInfo': {
          backgroundColor: '#E3F2FD',
          color: osiColors.info.dark,
        },
      },
    },
  },
  MuiTableHead: {
    styleOverrides: {
      root: {
        backgroundColor: osiColors.grey[50],
        '& .MuiTableCell-head': {
          fontWeight: 600,
          color: osiColors.text.primary,
        },
      },
    },
  },
};

// Typography configuration
const typography = {
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
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.01562em',
  },
  h2: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1.3,
    letterSpacing: '-0.00833em',
  },
  h3: {
    fontSize: '1.75rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: '1.5rem',
    fontWeight: 600,
    lineHeight: 1.4,
  },
  h5: {
    fontSize: '1.25rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  h6: {
    fontSize: '1.125rem',
    fontWeight: 600,
    lineHeight: 1.5,
  },
  subtitle1: {
    fontSize: '1rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  subtitle2: {
    fontSize: '0.875rem',
    fontWeight: 500,
    lineHeight: 1.5,
  },
  body1: {
    fontSize: '1rem',
    lineHeight: 1.6,
  },
  body2: {
    fontSize: '0.875rem',
    lineHeight: 1.6,
  },
  button: {
    fontSize: '0.875rem',
    fontWeight: 600,
    textTransform: 'none',
  },
  caption: {
    fontSize: '0.75rem',
    lineHeight: 1.4,
  },
};

// Create the OSI theme
export const osiTheme = createTheme({
  palette: osiColors,
  typography,
  components: componentOverrides,
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1920,
    },
  },
  shadows: [
    'none',
    '0 2px 8px rgba(0, 0, 0, 0.08)',
    '0 4px 12px rgba(0, 0, 0, 0.10)',
    '0 4px 16px rgba(0, 0, 0, 0.12)',
    '0 6px 20px rgba(0, 0, 0, 0.15)',
    '0 8px 24px rgba(0, 0, 0, 0.18)',
    '0 12px 28px rgba(0, 0, 0, 0.20)',
    '0 16px 32px rgba(0, 0, 0, 0.22)',
    '0 20px 36px rgba(0, 0, 0, 0.24)',
    '0 24px 40px rgba(0, 0, 0, 0.26)',
    '0 28px 44px rgba(0, 0, 0, 0.28)',
    '0 32px 48px rgba(0, 0, 0, 0.30)',
    '0 36px 52px rgba(0, 0, 0, 0.32)',
    '0 40px 56px rgba(0, 0, 0, 0.34)',
    '0 44px 60px rgba(0, 0, 0, 0.36)',
    '0 48px 64px rgba(0, 0, 0, 0.38)',
    '0 52px 68px rgba(0, 0, 0, 0.40)',
    '0 56px 72px rgba(0, 0, 0, 0.42)',
    '0 60px 76px rgba(0, 0, 0, 0.44)',
    '0 64px 80px rgba(0, 0, 0, 0.46)',
    '0 68px 84px rgba(0, 0, 0, 0.48)',
    '0 72px 88px rgba(0, 0, 0, 0.50)',
    '0 76px 92px rgba(0, 0, 0, 0.52)',
    '0 80px 96px rgba(0, 0, 0, 0.54)',
    '0 84px 100px rgba(0, 0, 0, 0.56)',
  ],
});

export default osiTheme;