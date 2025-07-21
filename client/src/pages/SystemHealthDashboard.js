import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Alert,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  useTheme,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Speed as SpeedIcon,
  Security as SecurityIcon,
  Cloud as CloudIcon,
  Memory as MemoryIcon,
  NetworkCheck as NetworkIcon,
  Timer as TimerIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import HelpTooltip from '../components/HelpTooltip';

const SystemHealthDashboard = () => {
  const { user } = useAuth();
  const theme = useTheme();
  
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState({
    overall: 'good',
    services: [],
    metrics: {},
    alerts: [],
    performance: {}
  });
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadHealthData();
      
      // Auto-refresh every 30 seconds
      const interval = setInterval(loadHealthData, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/health', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setHealthData(data);
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error('Error loading health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good':
      case 'healthy':
      case 'online':
        return 'success';
      case 'warning':
      case 'degraded':
        return 'warning';
      case 'error':
      case 'critical':
      case 'offline':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'good':
      case 'healthy':
      case 'online':
        return <CheckCircleIcon />;
      case 'warning':
      case 'degraded':
        return <WarningIcon />;
      case 'error':
      case 'critical':
      case 'offline':
        return <ErrorIcon />;
      default:
        return <CheckCircleIcon />;
    }
  };

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              System Health Dashboard
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Real-time monitoring of OSI Platform infrastructure
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {lastUpdated && (
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </Typography>
            )}
            <Tooltip title="Refresh">
              <IconButton onClick={loadHealthData} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Overall Health Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
              {getStatusIcon(healthData.overall)}
              <Typography variant="h6" sx={{ ml: 1 }}>
                Overall System Health
              </Typography>
            </Box>
            <Chip
              label={healthData.overall.toUpperCase()}
              color={getStatusColor(healthData.overall)}
              variant="filled"
            />
            <HelpTooltip
              title="System Health"
              description="Overall health status based on all monitored services and metrics"
              placement="top"
            />
          </Box>
          
          {healthData.alerts && healthData.alerts.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Active Alerts
              </Typography>
              {healthData.alerts.map((alert, index) => (
                <Alert 
                  key={index} 
                  severity={alert.severity} 
                  sx={{ mb: 1 }}
                  variant="outlined"
                >
                  <Typography variant="body2">
                    <strong>{alert.service}:</strong> {alert.message}
                  </Typography>
                </Alert>
              ))}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Service Status */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Service Status
          </Typography>
          <Grid container spacing={2}>
            {healthData.services && healthData.services.map((service) => (
              <Grid item xs={12} sm={6} md={4} key={service.name}>
                <Card variant="outlined">
                  <CardContent sx={{ py: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ mr: 1 }}>
                          {service.name === 'Database' && <StorageIcon />}
                          {service.name === 'API Server' && <CloudIcon />}
                          {service.name === 'Authentication' && <SecurityIcon />}
                          {service.name === 'File Storage' && <StorageIcon />}
                          {service.name === 'Certificate Authority' && <SecurityIcon />}
                          {service.name === 'Email Service' && <NetworkIcon />}
                        </Box>
                        <Typography variant="body2" fontWeight="medium">
                          {service.name}
                        </Typography>
                      </Box>
                      <Chip
                        size="small"
                        label={service.status}
                        color={getStatusColor(service.status)}
                        variant="filled"
                      />
                    </Box>
                    {service.responseTime && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                        Response: {service.responseTime}ms
                      </Typography>
                    )}
                    {service.uptime && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                        Uptime: {formatUptime(service.uptime)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Performance Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Performance Metrics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <SpeedIcon sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                    <Typography variant="h5" color="primary.main">
                      {healthData.performance?.avgResponseTime || 0}ms
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Avg Response Time
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <TrendingUpIcon sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                    <Typography variant="h5" color="success.main">
                      {healthData.performance?.requestsPerMinute || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Requests/min
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <MemoryIcon sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                    <Typography variant="h5" color="warning.main">
                      {healthData.performance?.memoryUsage || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Memory Usage
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <StorageIcon sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                    <Typography variant="h5" color="info.main">
                      {healthData.performance?.diskUsage || 0}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Disk Usage
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                System Resources
              </Typography>
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">CPU Usage</Typography>
                  <Typography variant="body2">{healthData.metrics?.cpuUsage || 0}%</Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={healthData.metrics?.cpuUsage || 0}
                  color={healthData.metrics?.cpuUsage > 80 ? 'error' : healthData.metrics?.cpuUsage > 60 ? 'warning' : 'primary'}
                />
              </Box>
              
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Memory Usage</Typography>
                  <Typography variant="body2">
                    {formatBytes(healthData.metrics?.memoryUsed || 0)} / {formatBytes(healthData.metrics?.memoryTotal || 0)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(healthData.metrics?.memoryUsed / healthData.metrics?.memoryTotal) * 100 || 0}
                  color={(healthData.metrics?.memoryUsed / healthData.metrics?.memoryTotal) > 0.8 ? 'error' : 
                         (healthData.metrics?.memoryUsed / healthData.metrics?.memoryTotal) > 0.6 ? 'warning' : 'primary'}
                />
              </Box>

              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Disk Usage</Typography>
                  <Typography variant="body2">
                    {formatBytes(healthData.metrics?.diskUsed || 0)} / {formatBytes(healthData.metrics?.diskTotal || 0)}
                  </Typography>
                </Box>
                <LinearProgress 
                  variant="determinate" 
                  value={(healthData.metrics?.diskUsed / healthData.metrics?.diskTotal) * 100 || 0}
                  color={(healthData.metrics?.diskUsed / healthData.metrics?.diskTotal) > 0.8 ? 'error' : 
                         (healthData.metrics?.diskUsed / healthData.metrics?.diskTotal) > 0.6 ? 'warning' : 'primary'}
                />
              </Box>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  System Uptime
                </Typography>
                <Typography variant="body2" fontWeight="medium">
                  {formatUptime(healthData.metrics?.uptime || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent System Activity
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Details</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {healthData.recentActivity && healthData.recentActivity.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(activity.timestamp).toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {activity.event}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {activity.service}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={activity.status}
                        color={getStatusColor(activity.status)}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {activity.details}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {(!healthData.recentActivity || healthData.recentActivity.length === 0) && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No recent activity to display
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default SystemHealthDashboard;