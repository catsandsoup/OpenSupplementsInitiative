import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  TextField,
  InputAdornment,
  Chip,
  Button,
  Pagination,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery,
  Fade,
  Skeleton
} from '@mui/material';
import {
  Search as SearchIcon,
  Verified as VerifiedIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Assignment as AssignmentIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner, { ProductCardSkeleton } from '../components/LoadingSpinner';
import HelpTooltip from '../components/HelpTooltip';

const PublicCatalog = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [supplements, setSupplements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [stats, setStats] = useState({
    totalCertifiedSupplements: 0,
    activeCertificates: 0,
    verifiedOrganizations: 0,
    recentCertifications: 0
  });

  useEffect(() => {
    loadSupplements();
    loadStats();
  }, [page, search]);

  const loadSupplements = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20'
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(`/api/public/supplements?${params}`);
      
      if (response.ok) {
        const data = await response.json();
        setSupplements(data.supplements);
        setPagination(data.pagination);
      } else {
        setError('Failed to load supplements');
      }
    } catch (err) {
      setError('Error loading supplements');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await fetch('/api/public/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setStatsLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset to first page when searching
  };

  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleViewProduct = (supplementId) => {
    navigate(`/product/${supplementId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            OSI Certified Supplements
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Discover supplements with complete transparency and verified authenticity
          </Typography>

          {/* Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Fade in timeout={300}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        Certified Products
                      </Typography>
                      <HelpTooltip
                        title="Certified Products"
                        description="Total number of supplements that have received OSI certification"
                        placement="top"
                      />
                    </Box>
                    {statsLoading ? (
                      <Skeleton variant="text" width={60} height={48} sx={{ mx: 'auto' }} />
                    ) : (
                      <Typography variant="h3" fontWeight="bold" color="primary.main">
                        {stats.totalCertifiedSupplements}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Fade in timeout={400}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <SecurityIcon sx={{ mr: 1, color: 'success.main' }} />
                      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        Active Certificates
                      </Typography>
                      <HelpTooltip
                        title="Active Certificates"
                        description="Number of currently valid OSI certificates"
                        placement="top"
                      />
                    </Box>
                    {statsLoading ? (
                      <Skeleton variant="text" width={60} height={48} sx={{ mx: 'auto' }} />
                    ) : (
                      <Typography variant="h3" fontWeight="bold" color="success.main">
                        {stats.activeCertificates}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Fade in timeout={500}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <BusinessIcon sx={{ mr: 1, color: 'info.main' }} />
                      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        Verified Organizations
                      </Typography>
                      <HelpTooltip
                        title="Verified Organizations"
                        description="Number of manufacturers verified by OSI"
                        placement="top"
                      />
                    </Box>
                    {statsLoading ? (
                      <Skeleton variant="text" width={60} height={48} sx={{ mx: 'auto' }} />
                    ) : (
                      <Typography variant="h3" fontWeight="bold" color="info.main">
                        {stats.verifiedOrganizations}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Fade in timeout={600}>
                <Card sx={{ height: '100%' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <ScheduleIcon sx={{ mr: 1, color: 'warning.main' }} />
                      <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                        Recent Certifications
                      </Typography>
                      <HelpTooltip
                        title="Recent Certifications"
                        description="Number of products certified in the last 30 days"
                        placement="top"
                      />
                    </Box>
                    {statsLoading ? (
                      <Skeleton variant="text" width={60} height={48} sx={{ mx: 'auto' }} />
                    ) : (
                      <Typography variant="h3" fontWeight="bold" color="warning.main">
                        {stats.recentCertifications}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          </Grid>
        </Box>

        {/* Search */}
        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            placeholder="Search by product name, manufacturer, or OSI number..."
            value={search}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{ maxWidth: 600, mx: 'auto', display: 'block' }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Loading */}
        {loading && (
          <Grid container spacing={3}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <ProductCardSkeleton />
              </Grid>
            ))}
          </Grid>
        )}

        {/* Products Grid */}
        {!loading && (
          <>
            <Grid container spacing={3}>
              {supplements.map((supplement, index) => (
                <Grid item xs={12} md={6} lg={4} key={supplement.id}>
                  <Fade in timeout={300 + (index * 100)}>
                    <Card 
                      sx={{ 
                        height: '100%', 
                        display: 'flex', 
                        flexDirection: 'column',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: theme.shadows[8],
                        }
                      }}
                      onClick={() => handleViewProduct(supplement.id)}
                    >
                      <CardContent sx={{ flexGrow: 1, p: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <VerifiedIcon color="success" sx={{ mr: 1 }} />
                            <Chip 
                              label={supplement.osi_number} 
                              color="primary" 
                              size="small"
                              sx={{ fontWeight: 600 }}
                            />
                          </Box>
                          <HelpTooltip
                            title="OSI Certified"
                            description="This product has been verified and certified by OSI"
                            type="success"
                            size="small"
                          />
                        </Box>
                        
                        <Typography 
                          variant="h6" 
                          component="h2" 
                          gutterBottom
                          sx={{ 
                            fontWeight: 600,
                            lineHeight: 1.3,
                            mb: 2,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {supplement.osi_data?.artgEntry?.productName || 'Unnamed Product'}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                          <BusinessIcon sx={{ mr: 1, color: 'text.secondary', fontSize: 18 }} />
                          <Typography 
                            variant="body2" 
                            color="text.secondary"
                            sx={{ 
                              fontWeight: 500,
                              display: '-webkit-box',
                              WebkitLineClamp: 1,
                              WebkitBoxOrient: 'vertical',
                              overflow: 'hidden',
                            }}
                          >
                            {supplement.organization_name || supplement.trading_name}
                          </Typography>
                        </Box>

                        <Box sx={{ mb: 2 }}>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            <strong>Dosage Form:</strong> {supplement.osi_data?.components?.[0]?.dosageForm || 'Not specified'}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Active Ingredients:</strong> {supplement.osi_data?.components?.[0]?.activeIngredients?.length || 0}
                          </Typography>
                        </Box>

                        <Box sx={{ 
                          mt: 'auto', 
                          pt: 2, 
                          borderTop: `1px solid ${theme.palette.divider}`,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <Box>
                            <Typography variant="caption" color="text.secondary" display="block">
                              <strong>Certified:</strong> {formatDate(supplement.issued_at)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" display="block">
                              <strong>Expires:</strong> {formatDate(supplement.expires_at)}
                            </Typography>
                          </Box>
                          <Button
                            size="small"
                            variant="outlined"
                            sx={{ 
                              minWidth: 'auto',
                              px: 2,
                              '&:hover': {
                                backgroundColor: theme.palette.primary.main,
                                color: 'white',
                              }
                            }}
                          >
                            View Details
                          </Button>
                        </Box>
                      </CardContent>
                    </Card>
                  </Fade>
                </Grid>
              ))}
            </Grid>

            {/* No Results */}
            {supplements.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No certified supplements found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {search ? 'Try adjusting your search terms' : 'No products have been certified yet'}
                </Typography>
              </Box>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.pages}
                  page={pagination.page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}
      </Box>
    </Container>
  );
};

export default PublicCatalog;