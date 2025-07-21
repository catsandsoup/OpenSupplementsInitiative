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
  Tooltip,
  useTheme,
  useMediaQuery,
  Fade,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Schedule as ScheduleIcon,
  CheckCircle as CheckCircleIcon,
  Description as DraftIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/ToastProvider';
import api from '../utils/api';
import LoadingSpinner, { ProductCardSkeleton, TableSkeleton } from '../components/LoadingSpinner';
import OrganizationSetup from '../components/OrganizationSetup';
import HelpTooltip, { FieldHelpTooltip, StatusIndicator } from '../components/HelpTooltip';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { showSuccess, showError, showInfo } = useToast();
  
  const [supplements, setSupplements] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(null);
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
    setSubmitting(supplementId);
    try {
      await api.post(`/supplements/${supplementId}/submit`);
      await fetchSupplements(); // Refresh the list
      showSuccess('Product submitted for review successfully!');
    } catch (error) {
      console.error('Error submitting supplement:', error);
      showError('Failed to submit supplement for review. Please try again.');
    } finally {
      setSubmitting(null);
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
            <Fade in timeout={300}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography color="text.secondary" variant="subtitle2" fontWeight={600}>
                      Total Products
                    </Typography>
                    <HelpTooltip
                      title="Total Products"
                      description="Total number of products you've created in the system"
                      placement="top"
                    />
                  </Box>
                  <Typography variant="h3" fontWeight="bold" color="primary.main">
                    {supplements.length}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Fade in timeout={400}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <CheckCircleIcon sx={{ mr: 1, color: 'success.main' }} />
                    <Typography color="text.secondary" variant="subtitle2" fontWeight={600}>
                      Approved
                    </Typography>
                    <HelpTooltip
                      title="Approved Products"
                      description="Products that have been reviewed and approved for OSI certification"
                      placement="top"
                    />
                  </Box>
                  <Typography variant="h3" fontWeight="bold" color="success.main">
                    {supplements.filter(s => s.status === 'approved').length}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Fade in timeout={500}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                    <Typography color="text.secondary" variant="subtitle2" fontWeight={600}>
                      Under Review
                    </Typography>
                    <HelpTooltip
                      title="Under Review"
                      description="Products currently being reviewed by OSI administrators"
                      placement="top"
                    />
                  </Box>
                  <Typography variant="h3" fontWeight="bold" color="warning.main">
                    {supplements.filter(s => s.status === 'under_review' || s.status === 'submitted').length}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Fade in timeout={600}>
              <Card sx={{ height: '100%' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                    <DraftIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography color="text.secondary" variant="subtitle2" fontWeight={600}>
                      Drafts
                    </Typography>
                    <HelpTooltip
                      title="Draft Products"
                      description="Products that are still being prepared and haven't been submitted yet"
                      placement="top"
                    />
                  </Box>
                  <Typography variant="h3" fontWeight="bold" color="text.secondary">
                    {supplements.filter(s => s.status === 'draft').length}
                  </Typography>
                </CardContent>
              </Card>
            </Fade>
          </Grid>
        </Grid>

        {/* Products Table */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Your Products
            </Typography>
            
            {supplements.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <Box sx={{ mb: 3 }}>
                  <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                </Box>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No products yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 400, mx: 'auto' }}>
                  Start your OSI certification journey by submitting your first product for review.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/supplement/new')}
                  size="large"
                >
                  Submit Your First Product
                </Button>
              </Box>
            ) : isMobile ? (
              // Mobile Card View
              <Grid container spacing={2}>
                {supplements.map((supplement) => (
                  <Grid item xs={12} key={supplement.id}>
                    <Card variant="outlined" sx={{ position: 'relative' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                              {supplement.osi_data?.artgEntry?.productName || 'Unnamed Product'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              {supplement.organization_name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ARTG: {supplement.osi_data?.artgEntry?.artgNumber || 'Not set'}
                            </Typography>
                          </Box>
                          <StatusIndicator
                            status={supplement.status}
                            title={getStatusLabel(supplement.status)}
                            description={`Product is currently ${supplement.status}`}
                          />
                        </Box>
                        
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Chip
                            label={getStatusLabel(supplement.status)}
                            color={getStatusColor(supplement.status)}
                            size="small"
                          />
                          <Typography variant="caption" color="text.secondary">
                            {supplement.submitted_at 
                              ? `Submitted ${new Date(supplement.submitted_at).toLocaleDateString()}`
                              : 'Not submitted'
                            }
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', gap: 1, mt: 2, justifyContent: 'flex-end' }}>
                          <Button
                            size="small"
                            startIcon={<ViewIcon />}
                            onClick={() => navigate(`/supplement/${supplement.id}`)}
                          >
                            View
                          </Button>
                          
                          {supplement.status === 'draft' && (
                            <>
                              <Button
                                size="small"
                                startIcon={<EditIcon />}
                                onClick={() => navigate(`/supplement/${supplement.id}/edit`)}
                              >
                                Edit
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                startIcon={submitting === supplement.id ? <LoadingSpinner size={16} /> : <SendIcon />}
                                onClick={() => handleSubmitForReview(supplement.id)}
                                disabled={submitting === supplement.id}
                              >
                                {submitting === supplement.id ? 'Submitting...' : 'Submit'}
                              </Button>
                            </>
                          )}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              // Desktop Table View
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Product Name
                          <HelpTooltip
                            title="Product Information"
                            description="Product name and organization details"
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>ARTG Number</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          Status
                          <HelpTooltip
                            title="Certification Status"
                            description="Current status of your product in the OSI certification process"
                            size="small"
                          />
                        </Box>
                      </TableCell>
                      <TableCell>Submitted</TableCell>
                      <TableCell align="center">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {supplements.map((supplement) => (
                      <TableRow 
                        key={supplement.id}
                        sx={{ 
                          '&:hover': { 
                            backgroundColor: theme.palette.action.hover 
                          } 
                        }}
                      >
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {supplement.osi_data?.artgEntry?.productName || 'Unnamed Product'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {supplement.organization_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {supplement.osi_data?.artgEntry?.artgNumber || (
                              <span style={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                                Not set
                              </span>
                            )}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StatusIndicator
                              status={supplement.status}
                              title={getStatusLabel(supplement.status)}
                              description={`Product is currently ${supplement.status}`}
                              size="small"
                            />
                            <Chip
                              label={getStatusLabel(supplement.status)}
                              color={getStatusColor(supplement.status)}
                              size="small"
                            />
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {supplement.submitted_at 
                              ? new Date(supplement.submitted_at).toLocaleDateString()
                              : (
                                <span style={{ color: theme.palette.text.secondary, fontStyle: 'italic' }}>
                                  Not submitted
                                </span>
                              )
                            }
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => navigate(`/supplement/${supplement.id}`)}
                                sx={{ 
                                  '&:hover': { 
                                    backgroundColor: theme.palette.primary.main + '10' 
                                  } 
                                }}
                              >
                                <ViewIcon />
                              </IconButton>
                            </Tooltip>
                            
                            {supplement.status === 'draft' && (
                              <>
                                <Tooltip title="Edit Product">
                                  <IconButton
                                    size="small"
                                    onClick={() => navigate(`/supplement/${supplement.id}/edit`)}
                                    sx={{ 
                                      '&:hover': { 
                                        backgroundColor: theme.palette.info.main + '10' 
                                      } 
                                    }}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                </Tooltip>
                                <Tooltip title="Submit for Review">
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleSubmitForReview(supplement.id)}
                                    disabled={submitting === supplement.id}
                                    sx={{ 
                                      '&:hover': { 
                                        backgroundColor: theme.palette.success.main + '10' 
                                      } 
                                    }}
                                  >
                                    {submitting === supplement.id ? (
                                      <LoadingSpinner size={16} />
                                    ) : (
                                      <SendIcon />
                                    )}
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