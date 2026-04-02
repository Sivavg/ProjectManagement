import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',       // Clear blue
      light: '#3b82f6',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
      contrastText: '#ffffff',
    },
    background: {
      default: '#f1f5f9',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: 'rgba(0,0,0,0.08)',
    success: { main: '#16a34a', light: '#dcfce7' },
    warning: { main: '#d97706', light: '#fef3c7' },
    error:   { main: '#dc2626', light: '#fee2e2' },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h4: { fontWeight: 700, fontSize: '1.5rem', color: '#0f172a' },
    h6: { fontWeight: 600, fontSize: '1rem'   },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, fontSize: '0.85rem' },
    button: { fontWeight: 600, textTransform: 'none', letterSpacing: 0 },
    caption: { fontSize: '0.75rem' },
  },
  shape: { borderRadius: 8 },
  shadows: [
    'none',
    '0 1px 2px rgba(0,0,0,0.05)',
    '0 1px 4px rgba(0,0,0,0.08)',
    '0 2px 8px rgba(0,0,0,0.08)',
    '0 4px 12px rgba(0,0,0,0.08)',
    '0 8px 16px rgba(0,0,0,0.08)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '7px 18px',
          fontSize: '0.875rem',
        },
        containedPrimary: {
          backgroundColor: '#2563eb',
          '&:hover': { backgroundColor: '#1d4ed8' },
        },
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(0,0,0,0.07)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          border: 'none',
        },
      },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            backgroundColor: '#ffffff',
            '& fieldset': { borderColor: '#e2e8f0' },
            '&:hover fieldset': { borderColor: '#94a3b8' },
            '&.Mui-focused fieldset': {
              borderColor: '#2563eb',
              borderWidth: '1.5px',
            },
          },
          '& .MuiInputLabel-root.Mui-focused': { color: '#2563eb' },
        },
      },
    },
    MuiSelect: {
      defaultProps: { size: 'small' },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f1f5f9',
          padding: '12px 16px',
          fontSize: '0.875rem',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#f8fafc',
          color: '#64748b',
          fontSize: '0.78rem',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          border: '1px solid rgba(0,0,0,0.07)',
          boxShadow: 'none',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:hover': { backgroundColor: '#f8fafc' },
          '&:last-child td': { border: 0 },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 5, fontWeight: 600, fontSize: '0.75rem' },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontSize: '0.875rem', fontWeight: 600 },
      },
    },
    MuiDivider: {
      styleOverrides: { root: { borderColor: '#f1f5f9' } },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          borderRight: '1px solid #e2e8f0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          border: 'none',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: 'none',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          '&.Mui-selected': {
            backgroundColor: '#eff6ff',
            color: '#2563eb',
            '& .MuiListItemIcon-root': { color: '#2563eb' },
            '&:hover': { backgroundColor: '#dbeafe' },
          },
          '&:hover': { backgroundColor: '#f8fafc' },
        },
      },
    },
  },
});

export default theme;
