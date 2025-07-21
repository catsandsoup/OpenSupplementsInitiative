import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Chip,
  LinearProgress,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Tooltip,
  useTheme
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Speed as SpeedIcon,
  Visibility as VisibilityIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import LoadingSpinner from '../components/LoadingSpinner';
import HelpTooltip from '../components/HelpTooltip';

const DemoControlPanel = () => {
  const { user } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();
  const theme = useTheme();
  
  const [demoMode, setDemoMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [demoStats, setDemoStats] = useState({
    totalProducts: 0,
    activeUsers: 0,
    completedDemos: 0,
    systemHealth: 'good'
  });
  const [demoScenarios, setDemoScenarios] = useState([]);
  const [presentationMode, setPresentationMode] = useState(false);
  const [acceleratedMode, setAcceleratedMode] = useState(false);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDemoStatus();
      loadDemoStats();
      loadDemoScenarios();
    }
  }, [user]);

  const loadDemoStatus = async () => {
    try {
      const response = await fetch('/api/admin/demo/status', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDemoMode(data.demoMode);
        setPresentationMode(data.presentationMode);
        setAcceleratedMode(data.acceleratedMode);
      }
    } catch (error) {
      console.error('Error loading demo status:', error);
    }
  };

  const loadDemoStats = async () => {
    try {
      const response = await fetch('/api/admin/demo/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDemoStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading demo stats:', error);
    }
  };

  const loadDemoScenarios = async () => {
    try {
      const response = await fetch('/api/admin/demo/scenarios', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDemoScenarios(data.scenarios);
      }
    } catch (error) {
      console.error('Error loading demo scenarios:', error);
    }
  };

  const handleResetDemoData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/demo/reset', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        showSuccess('Demo data reset successfully!');
        loadDemoStats();
        loadDemoScenarios();
      } else {
        showError('Failed to reset demo data');
      }
    } catch (error) {
      showError('Error resetting demo data');
    } finally {
      setLoading(false);
      setResetDialogOpen(false);
    }
  };

  const handleToggleDemoMode = async () => {
    try {
      const response = await fetch('/api/admin/demo/mode', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ demoMode: !demoMode })
      });

      if (response.ok) {
        setDemoMode(!demoMode);
        showSuccess(`Demo mode ${!demoMode ? 'enabled' : 'disabled'}`);
      } else {
        showError('Failed to toggle demo mode');
      }
    } catch (error) {
      showError('Error toggling demo mode');
    }
  };

  const handleTogglePresentationMode = async () => {
    try {
      const response = await fetch('/api/admin/demo/presentation', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ presentationMode: !presentationMode })
      });

      if (response.ok) {
        setPresentationMode(!presentationMode);
        showSuccess(`Presentation mode ${!presentationMode ? 'enabled' : 'disabled'}`);
        
        // Apply presentation styles to body
        if (!presentationMode) {
          document.body.classList.add('presentation-mode');
        } else {
          document.body.classList.remove('presentation-mode');
        }
      } else {
        showError('Failed to toggle presentation mode');
      }
    } catch (error) {
      showError('Error toggling presentation mode');
    }
  };

  const handleToggleAcceleratedMode = async () => {
    try {
      const response = await fetch('/api/admin/demo/accelerated', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ acceleratedMode: !acceleratedMode })
      });

      if (response.ok) {
        setAcceleratedMode(!acceleratedMode);
        showSuccess(`Accelerated mode ${!acceleratedMode ? 'enabled' : 'disabled'}`);
      } else {
        showError('Failed to toggle accelerated mode');
      }
    } catch (error) {
      showError('Error toggling accelerated mode');
    }
  };

  const handleRunDemoScenario = async (scenarioId) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/demo/scenarios/${scenarioId}/run`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        showSuccess('Demo scenario executed successfully!');
        loadDemoStats();
      } else {
        showError('Failed to run demo scenario');
      }
    } catch (error) {
      showError('Error running demo scenario');
    } finally {
      setLoading(false);
    }
  };

  const handleExportTGAPackage = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/export/tga', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `OSI-TGA-Export-${new Date().toISOString().split('T')[0]}.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        showSuccess('TGA export package downloaded successfully!');
      } else {
        showError('Failed to export TGA package');
      }
    } catch (error) {
      showError('Error exporting TGA package');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <Container>
        <Alert severity="error">
          Access denied. Admin privileges required.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Demo Control Panel
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage demo presentations and system configuration
        </Typography>
      </Box>

      {/* Demo Mode Controls */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PlayIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Demo Mode</Typography>
                <HelpTooltip
                  title="Demo Mode"
                  description="Enables demo-specific features and data for presentations"
                  placement="top"
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={demoMode}
                    onChange={handleToggleDemoMode}
                    color="primary"
                  />
                }
                label={demoMode ? 'Enabled' : 'Disabled'}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {demoMode ? 'Demo features are active' : 'Standard mode active'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <VisibilityIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6">Presentation Mode</Typography>
                <HelpTooltip
                  title="Presentation Mode"
                  description="Optimizes UI for presentations with larger fonts and clearer visuals"
                  placement="top"
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={presentationMode}
                    onChange={handleTogglePresentationMode}
                    color="secondary"
                  />
                }
                label={presentationMode ? 'Enabled' : 'Disabled'}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {presentationMode ? 'Large fonts and clear visuals' : 'Standard UI'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SpeedIcon sx={{ mr: 1, color: 'warning.main' }} />
                <Typography variant="h6">Accelerated Mode</Typography>
                <HelpTooltip
                  title="Accelerated Mode"
                  description="Speeds up workflows and reduces wait times for demonstrations"
                  placement="top"
                />
              </Box>
              <FormControlLabel
                control={
                  <Switch
                    checked={acceleratedMode}
                    onChange={handleToggleAcceleratedMode}
                    color="warning"
                  />
                }
                label={acceleratedMode ? 'Enabled' : 'Disabled'}
              />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {acceleratedMode ? 'Fast workflows active' : 'Normal timing'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Demo Statistics */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Demo Statistics
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main">
                  {demoStats.totalProducts}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Demo Products
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main">
                  {demoStats.activeUsers}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Active Users
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="info.main">
                  {demoStats.completedDemos}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Demos
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Chip
                  icon={demoStats.systemHealth === 'good' ? <CheckCircleIcon /> : <WarningIcon />}
                  label={`System ${demoStats.systemHealth}`}
                  color={demoStats.systemHealth === 'good' ? 'success' : 'warning'}
                />
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                  variant="contained"
                  startIcon={<RefreshIcon />}
                  onClick={() => setResetDialogOpen(true)}
                  color="warning"
                  disabled={loading}
                >
                  Reset Demo Data
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  onClick={handleExportTGAPackage}
                  disabled={loading}
                >
                  Export TGA Package
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<AssessmentIcon />}
                  onClick={() => window.open('/admin/health', '_blank')}
                >
                  System Health Dashboard
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Demo Scenarios
              </Typography>
              <List dense>
                {demoScenarios.map((scenario) => (
                  <ListItem
                    key={scenario.id}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleRunDemoScenario(scenario.id)}
                        disabled={loading}
                      >
                        <PlayIcon />
                      </IconButton>
                    }
                  >
                    <ListItemIcon>
                      <SettingsIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={scenario.name}
                      secondary={scenario.description}
                    />
                  </ListItem>
                ))}
              </List>
              {demoScenarios.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                  No demo scenarios available
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Reset Confirmation Dialog */}
      <Dialog
        open={resetDialogOpen}
        onClose={() => setResetDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <WarningIcon sx={{ mr: 1, color: 'warning.main' }} />
            Reset Demo Data
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            This will reset all demo data including:
          </Typography>
          <List dense>
            <ListItem>
              <ListItemIcon>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="All demo supplement submissions" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Demo user accounts and organizations" />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <DeleteIcon color="error" />
              </ListItemIcon>
              <ListItemText primary="Generated certificates and documents" />
            </ListItem>
          </List>
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. Fresh demo data will be recreated.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResetDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleResetDemoData}
            color="warning"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <LoadingSpinner size={20} /> : <RefreshIcon />}
          >
            {loading ? 'Resetting...' : 'Reset Demo Data'}
          </Button>
        </DialogActions>
      </Dialog>

      {loading && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <LinearProgress />
        </Box>
      )}
    </Container>
  );
};

export default DemoControlPanel;