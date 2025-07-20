import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Badge,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Visibility as ViewIcon,
  Assignment as ReviewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Schedule as PendingIcon,
  RateReview as UnderReviewIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState({
    total: 0,
    submitted: 0,
    underReview: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadSupplements();
    }
  }, [user]);

  const loadSupplements = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/supplements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSupplements(data.supplements);
        calculateStats(data.supplements);
      } else {
        setError('Failed to load supplements');
      }
    } catch (err) {
      setError('Error loading supplements');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (supplementsData) => {
    const stats = {
      total: supplementsData.length,
      submitted: supplementsData.filter(s => s.status === 'submitted').length,
      underReview: supplementsData.filter(s => s.status === 'under_review').length,
      approved: supplementsData.filter(s => s.status === 'approved').length,
      rejected: supplementsData.filter(s => s.status === 'rejected').length
    };
    setStats(stats);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'default';
      case 'submitted': return 'info';
      case 'under_review': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'submitted': return <PendingIcon />;
      case 'under_review': return <UnderReviewIcon />;
      case 'approved': return <ApproveIcon />;
      case 'rejected': return <RejectIcon />;
      default: return <PendingIcon />;
    }
  };

  const handleReviewProduct = (supplementId) => {
    navigate(`/admin/review/${supplementId}`);
  };

  const handleViewProduct = (supplementId) => {
    navigate(`/supplement/${supplementId}`);
  };

  const updateSupplementStatus = async (supplementId, newStatus, reviewNotes = '') => {
    try {
      const response = await fetch(`/api/supplements/${supplementId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes: reviewNotes
        })
      });

      if (response.ok) {
        loadSupplements(); // Reload data
      } else {
        setError('Failed to update supplement status');
      }
    } catch (err) {
      setError('Error updating supplement status');
    }
  };

  const getFilteredSupplements = () => {
    switch (activeTab) {
      case 0: return supplements; // All
      case 1: return supplements.filter(s => s.status === 'submitted');
      case 2: return supplements.filter(s => s.status === 'under_review');
      case 3: return supplements.filter(s => s.status === 'approved');
      case 4: return supplements.filter(s => s.status === 'rejected');
      default: return supplements;
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

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Review and manage supplement submissions
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Submissions
              </Typography>
              <Typography variant="h4">
                {stats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Review
              </Typography>
              <Typography variant="h4" color="info.main">
                {stats.submitted}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Under Review
              </Typography>
              <Typography variant="h4" color="warning.main">
                {stats.underReview}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h4" color="success.main">
                {stats.approved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Rejected
              </Typography>
              <Typography variant="h4" color="error.main">
                {stats.rejected}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs for filtering */}
      <Paper sx={{ mb: 3 }}>
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="All Submissions" />
          <Tab 
            label={
              <Badge badgeContent={stats.submitted} color="info">
                Pending Review
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={stats.underReview} color="warning">
                Under Review
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={stats.approved} color="success">
                Approved
              </Badge>
            } 
          />
          <Tab 
            label={
              <Badge badgeContent={stats.rejected} color="error">
                Rejected
              </Badge>
            } 
          />
        </Tabs>
      </Paper>

      {/* Supplements Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Product Name</TableCell>
                <TableCell>Manufacturer</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell>Reviewed</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {getFilteredSupplements().map((supplement) => (
                <TableRow key={supplement.id}>
                  <TableCell>
                    <Typography variant="subtitle2">
                      {supplement.osi_data?.artgEntry?.productName || 'Unnamed Product'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {supplement.osi_data?.artgEntry?.sponsor || 'Unknown Sponsor'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {supplement.organization_name || supplement.first_name + ' ' + supplement.last_name}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      icon={getStatusIcon(supplement.status)}
                      label={supplement.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(supplement.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {supplement.submitted_at ? 
                      new Date(supplement.submitted_at).toLocaleDateString() : 
                      'Not submitted'
                    }
                  </TableCell>
                  <TableCell>
                    {supplement.reviewed_at ? 
                      new Date(supplement.reviewed_at).toLocaleDateString() : 
                      'Not reviewed'
                    }
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => handleViewProduct(supplement.id)}
                        >
                          <ViewIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Review Product">
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleReviewProduct(supplement.id)}
                        >
                          <ReviewIcon />
                        </IconButton>
                      </Tooltip>
                      {supplement.status === 'submitted' && (
                        <Tooltip title="Start Review">
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => updateSupplementStatus(supplement.id, 'under_review')}
                          >
                            <UnderReviewIcon />
                          </IconButton>
                        </Tooltip>
                      )}
                      {supplement.status === 'under_review' && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => updateSupplementStatus(supplement.id, 'approved')}
                            >
                              <ApproveIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => updateSupplementStatus(supplement.id, 'rejected')}
                            >
                              <RejectIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {getFilteredSupplements().length === 0 && (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" color="text.secondary">
              No supplements found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {activeTab === 0 ? 
                'No supplement submissions yet.' : 
                `No supplements with ${['all', 'submitted', 'under review', 'approved', 'rejected'][activeTab]} status.`
              }
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default AdminDashboard;