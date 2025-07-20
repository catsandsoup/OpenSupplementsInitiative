import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import OrganizationSetup from '../components/OrganizationSetup';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [supplements, setSupplements] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showOrgSetup, setShowOrgSetup] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch supplements and organization data in parallel
      const [supplementsResponse, organizationResponse] = await Promise.allSettled([
        api.get('/supplements'),
        api.get('/organizations/my/profile')
      ]);

      if (supplementsResponse.status === 'fulfilled') {
        setSupplements(supplementsResponse.value.data.supplements);
      } else {
        console.error('Error fetching supplements:', supplementsResponse.reason);
        setError('Failed to load supplements');
      }

      if (organizationResponse.status === 'fulfilled') {
        setOrganization(organizationResponse.value.data.organization);
      } else {
        // User doesn't have an organization yet - this is normal for new users
        console.log('No organization found for user');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplements = async () => {
    try {
      const response = await api.get('/supplements');
      setSupplements(response.data.supplements);
    } catch (error) {
      console.error('Error fetching supplements:', error);
      setError('Failed to load supplements');
    }
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

  const getStatusLabel = (status) => {
    switch (status) {
      case 'draft': return 'Draft';
      case 'submitted': return 'Submitted';
      case 'under_review': return 'Under Review';
      case 'approved': return 'Approved';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const handleSubmitForReview = async (supplementId) => {
    try {
      await api.post(`/supplements/${supplementId}/submit`);
      fetchSupplements(); // Refresh the list
    } catch (error) {
      console.error('Error submitting supplement:', error);
      setError('Failed to submit supplement for review');
    }
  };

  const handleOrganizationCreated = (newOrganization) => {
    setOrganization(newOrganization);
    setShowOrgSetup(false);
  };

  if (loading) {
    return <LoadingSpinner message="Loading your supplements..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Welcome, {user?.first_name}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your supplement products and track their certification status
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/supplement/new')}
            size="large"
          >
            New Product
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Organization Setup Alert */}
        {!organization && user?.role === 'manufacturer' && (
          <Alert 
            severity="info" 
            sx={{ mb: 3 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={() => setShowOrgSetup(true)}
                startIcon={<BusinessIcon />}
              >
                Set Up Now
              </Button>
            }
          >
            <Typography variant="body2">
              <strong>Complete your setup:</strong> Please set up your organization profile to start submitting products for OSI certification.
            </Typography>
          </Alert>
        )}

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Total Products
                </Typography>
                <Typography variant="h4">
                  {supplements.length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h4" color="success.main">
                  {supplements.filter(s => s.status === 'approved').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Under Review
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {supplements.filter(s => s.status === 'under_review' || s.status === 'submitted').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  Drafts
                </Typography>
                <Typography variant="h4" color="text.secondary">
                  {supplements.filter(s => s.status === 'draft').length}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Products Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Products
            </Typography>
            
            {supplements.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                  You haven't submitted any products yet.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/supplement/new')}
                >
                  Submit Your First Product
                </Button>
              </Box>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Product Name</TableCell>
                      <TableCell>ARTG Number</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supplements.map((supplement) => (
                      <TableRow key={supplement.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {supplement.osi_data?.artgEntry?.productName || 'Unnamed Product'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {supplement.organization_name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {supplement.osi_data?.artgEntry?.artgNumber || 'Not set'}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getStatusLabel(supplement.status)}
                            color={getStatusColor(supplement.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {supplement.submitted_at 
                            ? new Date(supplement.submitted_at).toLocaleDateString()
                            : 'Not submitted'
                          }
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/supplement/${supplement.id}`)}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {supplement.status === 'draft' && (
                              <>
                                <Tooltip title="Edit">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/supplement/${supplement.id}/edit`)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Submit for Review">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleSubmitForReview(supplement.id)}
                                  >
                                    <SendIcon />
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
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Quick Actions
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/supplement/new')}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <AddIcon color="primary" />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        Submit New Product
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Start a new product submission
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Card sx={{ cursor: 'pointer' }} onClick={() => navigate('/catalog')}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <ViewIcon color="primary" />
                    <Box>
                      <Typography variant="body1" fontWeight="medium">
                        Browse Catalog
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        View certified products
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Box>

      {/* Organization Setup Dialog */}
      <OrganizationSetup
        open={showOrgSetup}
        onClose={() => setShowOrgSetup(false)}
        onSuccess={handleOrganizationCreated}
      />
    </Container>
  );
};

export default Dashboard;