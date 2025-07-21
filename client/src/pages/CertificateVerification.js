import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Container, Typography, Paper, Box, TextField, Button, Alert,
  CircularProgress, Grid, Divider, Chip, Card, CardContent,
  InputAdornment, Stack
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import VerifiedIcon from '@mui/icons-material/Verified';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

import { format } from 'date-fns';

const CertificateVerification = () => {
  const { osiNumber: urlOsiNumber } = useParams();
  const [osiNumber, setOsiNumber] = useState(urlOsiNumber || '');
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (urlOsiNumber) {
      handleVerification(urlOsiNumber);
    }
  }, [urlOsiNumber]);

  const handleVerification = async (numberToVerify = osiNumber) => {
    if (!numberToVerify.trim()) {
      setError('Please enter an OSI number');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);
      
      const response = await axios.get(`/api/public/verify/${numberToVerify.trim()}`);
      setVerification(response.data);
    } catch (err) {
      if (err.response?.status === 404) {
        setVerification({
          valid: false,
          status: 'not_found',
          message: 'Certificate not found',
          certificate: null
        });
      } else {
        setError(err.response?.data?.error || 'Failed to verify certificate');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleVerification();
  };

  const getStatusIcon = () => {
    if (!verification) return null;
    
    if (verification.valid) {
      return <VerifiedIcon sx={{ fontSize: 60 }} color="success" />;
    } else if (verification.status === 'expired') {
      return <WarningAmberIcon sx={{ fontSize: 60 }} color="warning" />;
    } else {
      return <ErrorOutlineIcon sx={{ fontSize: 60 }} color="error" />;
    }
  };

  const getStatusColor = () => {
    if (!verification) return 'default';
    if (verification.valid) return 'success';
    if (verification.status === 'expired') return 'warning';
    return 'error';
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 8, mb: 8 }}>
      <Paper sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <VerifiedIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Certificate Verification
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Enter an OSI number to verify the authenticity and status of a supplement certificate
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={8}>
              <TextField
                fullWidth
                label="OSI Number"
                placeholder="e.g., OSI-2024-000001"
                value={osiNumber}
                onChange={(e) => setOsiNumber(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                disabled={loading || !osiNumber.trim()}
              >
                {loading ? <CircularProgress size={24} /> : 'Verify'}
              </Button>
            </Grid>
          </Grid>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }}>
            {error}
          </Alert>
        )}

        {verification && hasSearched && (
          <>
            <Divider sx={{ my: 3 }} />
            
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              {getStatusIcon()}
              <Typography variant="h5" sx={{ mt: 2 }}>
                Certificate {verification.valid ? 'Verified' : 
                  verification.status === 'expired' ? 'Expired' : 
                  verification.status === 'revoked' ? 'Revoked' : 'Not Found'}
              </Typography>
              <Chip 
                label={verification.status.toUpperCase().replace('_', ' ')} 
                color={getStatusColor()} 
                sx={{ mt: 1 }} 
              />
              <Typography variant="body1" sx={{ mt: 2 }}>
                {verification.message}
              </Typography>
            </Box>

            {verification.certificate && (
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Certificate Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        OSI Number
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {verification.certificate.osiNumber}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Product Name
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {verification.certificate.productName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Manufacturer
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {verification.certificate.organizationName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Issue Date
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(verification.certificate.issuedAt)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Expiry Date
                      </Typography>
                      <Typography variant="body1" gutterBottom>
                        {formatDate(verification.certificate.expiresAt)}
                      </Typography>
                    </Grid>
                    {verification.certificate.revokedAt && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Revoked Date
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {formatDate(verification.certificate.revokedAt)}
                        </Typography>
                      </Grid>
                    )}
                    {verification.certificate.revocationReason && (
                      <Grid item xs={12}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Revocation Reason
                        </Typography>
                        <Typography variant="body1" gutterBottom>
                          {verification.certificate.revocationReason}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {verification.valid && (
                    <Box sx={{ mt: 3, textAlign: 'center' }}>
                      <Stack direction="row" spacing={2} justifyContent="center">
                        <Button 
                          variant="outlined" 
                          component={Link}
                          to="/catalog"
                        >
                          View All Products
                        </Button>
                        <Button 
                          variant="contained"
                          href={`/api/public/certificates/${verification.certificate.osiNumber}/download`}
                          target="_blank"
                        >
                          Download Certificate
                        </Button>
                      </Stack>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}

            {!verification.certificate && verification.status === 'not_found' && (
              <Card variant="outlined" sx={{ mt: 3 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <ErrorOutlineIcon color="error" sx={{ fontSize: 40, mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Certificate Not Found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    The OSI number you entered does not match any certificate in our database.
                    Please check the number and try again.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    OSI numbers follow the format: OSI-YYYY-NNNNNN
                  </Typography>
                </CardContent>
              </Card>
            )}
          </>
        )}

        {!hasSearched && (
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Typography variant="body2" color="text.secondary">
              Enter an OSI number above to verify a certificate's authenticity and current status.
              You can find OSI numbers on product labels and certificates.
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default CertificateVerification;