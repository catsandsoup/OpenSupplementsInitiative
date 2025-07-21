const express = require('express');
const router = express.Router();
const { query } = require('../database/connection');
const auth = require('../middleware/auth');
const os = require('os');
const fs = require('fs').promises;

// Middleware to ensure admin access
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Get comprehensive system health data
router.get('/', auth, requireAdmin, async (req, res) => {
  try {
    const healthData = {
      overall: 'good',
      services: [],
      metrics: {},
      alerts: [],
      performance: {},
      recentActivity: []
    };

    // Check database health
    const dbHealth = await checkDatabaseHealth();
    healthData.services.push({
      name: 'Database',
      status: dbHealth.status,
      responseTime: dbHealth.responseTime,
      uptime: dbHealth.uptime
    });

    // Check API server health
    const apiHealth = await checkAPIHealth();
    healthData.services.push({
      name: 'API Server',
      status: apiHealth.status,
      responseTime: apiHealth.responseTime,
      uptime: process.uptime()
    });

    // Check authentication service
    const authHealth = await checkAuthHealth();
    healthData.services.push({
      name: 'Authentication',
      status: authHealth.status,
      responseTime: authHealth.responseTime
    });

    // Check file storage
    const storageHealth = await checkStorageHealth();
    healthData.services.push({
      name: 'File Storage',
      status: storageHealth.status,
      responseTime: storageHealth.responseTime
    });

    // Check certificate authority
    const caHealth = await checkCertificateAuthorityHealth();
    healthData.services.push({
      name: 'Certificate Authority',
      status: caHealth.status,
      responseTime: caHealth.responseTime
    });

    // Check email service (mock)
    healthData.services.push({
      name: 'Email Service',
      status: 'online',
      responseTime: 45
    });

    // Get system metrics
    healthData.metrics = await getSystemMetrics();

    // Get performance metrics
    healthData.performance = await getPerformanceMetrics();

    // Get recent activity
    healthData.recentActivity = await getRecentActivity();

    // Check for alerts
    healthData.alerts = await checkSystemAlerts(healthData);

    // Determine overall health
    healthData.overall = determineOverallHealth(healthData.services, healthData.alerts);

    res.json(healthData);
  } catch (error) {
    console.error('Error getting system health:', error);
    res.status(500).json({ 
      error: 'Failed to get system health',
      overall: 'error',
      services: [],
      metrics: {},
      alerts: [{ severity: 'error', service: 'System', message: 'Health check failed' }]
    });
  }
});

// Check database health
async function checkDatabaseHealth() {
  const startTime = Date.now();
  try {
    await query('SELECT 1');
    const responseTime = Date.now() - startTime;
    
    // Get database uptime (approximate)
    const uptimeResult = await query(`
      SELECT EXTRACT(EPOCH FROM (NOW() - pg_postmaster_start_time())) as uptime
    `);
    const uptime = uptimeResult.rows[0]?.uptime || 0;

    return {
      status: responseTime < 100 ? 'healthy' : responseTime < 500 ? 'degraded' : 'critical',
      responseTime,
      uptime
    };
  } catch (error) {
    return {
      status: 'offline',
      responseTime: Date.now() - startTime,
      uptime: 0
    };
  }
}

// Check API server health
async function checkAPIHealth() {
  const startTime = Date.now();
  try {
    // Simple health check - if we're here, API is responding
    const responseTime = Date.now() - startTime;
    return {
      status: 'online',
      responseTime
    };
  } catch (error) {
    return {
      status: 'offline',
      responseTime: Date.now() - startTime
    };
  }
}

// Check authentication health
async function checkAuthHealth() {
  const startTime = Date.now();
  try {
    // Check if we can query users table
    await query('SELECT COUNT(*) FROM users LIMIT 1');
    const responseTime = Date.now() - startTime;
    
    return {
      status: responseTime < 50 ? 'healthy' : 'degraded',
      responseTime
    };
  } catch (error) {
    return {
      status: 'offline',
      responseTime: Date.now() - startTime
    };
  }
}

// Check storage health
async function checkStorageHealth() {
  const startTime = Date.now();
  try {
    // Check if uploads directory is accessible
    const uploadsPath = require('path').join(__dirname, '../uploads');
    await fs.access(uploadsPath);
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime
    };
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime
    };
  }
}

// Check certificate authority health
async function checkCertificateAuthorityHealth() {
  const startTime = Date.now();
  try {
    // Check if we can query certificates table
    await query('SELECT COUNT(*) FROM certificates LIMIT 1');
    const responseTime = Date.now() - startTime;
    
    return {
      status: 'healthy',
      responseTime
    };
  } catch (error) {
    return {
      status: 'degraded',
      responseTime: Date.now() - startTime
    };
  }
}

// Get system metrics
async function getSystemMetrics() {
  try {
    const totalMemory = os.totalmem();
    const freeMemory = os.freemem();
    const usedMemory = totalMemory - freeMemory;
    
    // Get CPU usage (simplified)
    const cpus = os.cpus();
    const cpuUsage = Math.random() * 30 + 10; // Mock CPU usage between 10-40%
    
    // Get disk usage (simplified)
    const diskUsed = Math.random() * 50 + 20; // Mock disk usage
    const diskTotal = 100;
    
    return {
      cpuUsage: Math.round(cpuUsage),
      memoryUsed: usedMemory,
      memoryTotal: totalMemory,
      diskUsed: diskUsed * 1024 * 1024 * 1024, // Convert to bytes
      diskTotal: diskTotal * 1024 * 1024 * 1024,
      uptime: process.uptime(),
      platform: os.platform(),
      arch: os.arch(),
      nodeVersion: process.version
    };
  } catch (error) {
    console.error('Error getting system metrics:', error);
    return {};
  }
}

// Get performance metrics
async function getPerformanceMetrics() {
  try {
    // Get database performance metrics
    const dbMetrics = await query(`
      SELECT 
        COUNT(*) as total_queries,
        AVG(EXTRACT(MILLISECONDS FROM NOW() - query_start)) as avg_query_time
      FROM pg_stat_activity 
      WHERE state = 'active'
    `);

    // Mock performance data
    const avgResponseTime = Math.random() * 100 + 50; // 50-150ms
    const requestsPerMinute = Math.random() * 100 + 200; // 200-300 req/min
    const memoryUsage = (os.totalmem() - os.freemem()) / os.totalmem() * 100;
    const diskUsage = Math.random() * 30 + 20; // 20-50%

    return {
      avgResponseTime: Math.round(avgResponseTime),
      requestsPerMinute: Math.round(requestsPerMinute),
      memoryUsage: Math.round(memoryUsage),
      diskUsage: Math.round(diskUsage),
      activeConnections: dbMetrics.rows[0]?.total_queries || 0
    };
  } catch (error) {
    console.error('Error getting performance metrics:', error);
    return {
      avgResponseTime: 0,
      requestsPerMinute: 0,
      memoryUsage: 0,
      diskUsage: 0,
      activeConnections: 0
    };
  }
}

// Get recent system activity
async function getRecentActivity() {
  try {
    const activities = await query(`
      SELECT 
        created_at as timestamp,
        action as event,
        'System' as service,
        CASE 
          WHEN action LIKE '%error%' THEN 'error'
          WHEN action LIKE '%warning%' THEN 'warning'
          ELSE 'good'
        END as status,
        details
      FROM audit_logs 
      WHERE created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC 
      LIMIT 20
    `);

    return activities.rows.map(activity => ({
      timestamp: activity.timestamp,
      event: activity.event,
      service: activity.service,
      status: activity.status,
      details: activity.details || 'No additional details'
    }));
  } catch (error) {
    console.error('Error getting recent activity:', error);
    return [];
  }
}

// Check for system alerts
async function checkSystemAlerts(healthData) {
  const alerts = [];

  // Check service health
  healthData.services.forEach(service => {
    if (service.status === 'offline' || service.status === 'critical') {
      alerts.push({
        severity: 'error',
        service: service.name,
        message: `Service is ${service.status}`
      });
    } else if (service.status === 'degraded') {
      alerts.push({
        severity: 'warning',
        service: service.name,
        message: 'Service performance is degraded'
      });
    }
  });

  // Check resource usage
  if (healthData.metrics.cpuUsage > 80) {
    alerts.push({
      severity: 'warning',
      service: 'System',
      message: `High CPU usage: ${healthData.metrics.cpuUsage}%`
    });
  }

  const memoryUsagePercent = (healthData.metrics.memoryUsed / healthData.metrics.memoryTotal) * 100;
  if (memoryUsagePercent > 85) {
    alerts.push({
      severity: 'warning',
      service: 'System',
      message: `High memory usage: ${Math.round(memoryUsagePercent)}%`
    });
  }

  const diskUsagePercent = (healthData.metrics.diskUsed / healthData.metrics.diskTotal) * 100;
  if (diskUsagePercent > 80) {
    alerts.push({
      severity: 'warning',
      service: 'Storage',
      message: `High disk usage: ${Math.round(diskUsagePercent)}%`
    });
  }

  // Check response times
  healthData.services.forEach(service => {
    if (service.responseTime > 1000) {
      alerts.push({
        severity: 'warning',
        service: service.name,
        message: `Slow response time: ${service.responseTime}ms`
      });
    }
  });

  return alerts;
}

// Determine overall health status
function determineOverallHealth(services, alerts) {
  // Check for critical issues
  const hasOfflineServices = services.some(s => s.status === 'offline' || s.status === 'critical');
  const hasCriticalAlerts = alerts.some(a => a.severity === 'error');
  
  if (hasOfflineServices || hasCriticalAlerts) {
    return 'error';
  }

  // Check for warnings
  const hasDegradedServices = services.some(s => s.status === 'degraded');
  const hasWarningAlerts = alerts.some(a => a.severity === 'warning');
  
  if (hasDegradedServices || hasWarningAlerts) {
    return 'warning';
  }

  return 'good';
}

module.exports = router;