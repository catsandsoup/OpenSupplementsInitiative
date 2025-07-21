import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link as MuiLink,
  useTheme,
  useMediaQuery,
  Fade,
  InputAdornment,
  IconButton,
  Divider
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email as EmailIcon,
  Lock as LockIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import LoadingSpinner from '../components/LoadingSpinner';
import HelpTooltip from '../components/HelpTooltip';

const Login = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { showSuccess, showError } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    if (result.success) {
      showSuccess('Welcome back! Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      setError(result.error);
      showError('Login failed. Please check your credentials.');
    }
    
    setLoading(false);
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleDemoLogin = async (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
    setLoading(true);

    const result = await login(demoEmail, demoPassword);
    
    if (result.success) {
      showSuccess('Demo login successful! Redirecting...');
      setTimeout(() => navigate('/dashboard'), 1000);
    } else {
      setError(result.error);
      showError('Demo login failed. Please try again.');
    }
    
    setLoading(false);
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: { xs: 4, sm: 8 },
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          px: { xs: 2, sm: 0 },
        }}
      >
        <Fade in timeout={500}>
          <Paper 
            elevation={isMobile ? 1 : 3} 
            sx={{ 
              padding: { xs: 3, sm: 4 }, 
              width: '100%',
              borderRadius: 3,
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <LoginIcon 
                sx={{ 
                  fontSize: 48, 
                  color: 'primary.main', 
                  mb: 2 
                }} 
              />
              <Typography 
                component="h1" 
                variant={isMobile ? "h5" : "h4"} 
                gutterBottom
                fontWeight="bold"
              >
                Welcome Back
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Sign in to access your OSI Platform account
              </Typography>
            </Box>

            {error && (
              <Fade in>
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              </Fade>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="action" />
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 2 }}
              />
              
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={handleTogglePassword}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ mb: 3 }}
              />
              
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading || !email || !password}
                startIcon={loading ? <LoadingSpinner size={20} /> : <LoginIcon />}
                sx={{ 
                  mb: 2,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
              
              <Box textAlign="center">
                <MuiLink 
                  component={Link} 
                  to="/register" 
                  variant="body2"
                  sx={{ 
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                  }}
                >
                  Don't have an account? <strong>Sign Up</strong>
                </MuiLink>
              </Box>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Demo Access
              </Typography>
            </Divider>

            <Box sx={{ 
              p: 2, 
              bgcolor: theme.palette.grey[50], 
              borderRadius: 2,
              border: `1px solid ${theme.palette.grey[200]}`,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  Try Demo Accounts
                </Typography>
                <HelpTooltip
                  title="Demo Accounts"
                  description="Use these pre-configured accounts to explore the platform features"
                  placement="top"
                />
              </Box>
              
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth={isMobile}
                  onClick={() => handleDemoLogin('admin@osi.org', 'admin123')}
                  disabled={loading}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Admin Demo
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  fullWidth={isMobile}
                  onClick={() => handleDemoLogin('demo@healthsupplements.com', 'manufacturer123')}
                  disabled={loading}
                  sx={{ 
                    textTransform: 'none',
                    fontWeight: 500,
                  }}
                >
                  Manufacturer Demo
                </Button>
              </Box>
              
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                Demo accounts are pre-loaded with sample data for testing
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Container>
  );
};

export default Login;