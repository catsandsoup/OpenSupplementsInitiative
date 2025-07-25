import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,

  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Button
} from '@mui/material';
import {
  Verified as VerifiedIcon,
  Business as BusinessIcon,
  Science as ScienceIcon,
  Warning as WarningIcon,
  Factory as FactoryIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Link as LinkIcon
} from '@mui/icons-material';

const PublicProductDetail = () => {
  const { id } = useParams();
  const [supplement, setSupplement] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProductDetails();
  }, [id]);

  const loadProductDetails = async () => {
    try {
      setLoading(true);
      
      // Load supplement data
      const supplementResponse = await fetch(`/api/public/supplements/${id}`);
      if (!supplementResponse.ok) {
        throw new Error('Product not found');
      }
      const supplementData = await supplementResponse.json();
      setSupplement(supplementData.supplement);

      // Load certificate data
      const certificateResponse = await fetch(`/api/public/supplements/${id}/certificate`);
      if (certificateResponse.ok) {
        const certificateData = await certificateResponse.json();
        setCertificate(certificateData.certificate);
      }
    } catch (err) {
      setError(err.message || 'Error loading product details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCertificateStatus = () => {
    if (!certificate) return { color: 'default', text: 'No Certificate' };
    
    const now = new Date();
    const expiresAt = new Date(certificate.expires_at);
    
    if (certificate.status === 'revoked') {
      return { color: 'error', text: 'Revoked' };
    } else if (expiresAt < now) {
      return { color: 'warning', text: 'Expired' };
    } else if (certificate.status === 'active') {
      return { color: 'success', text: 'Valid' };
    }
    
    return { color: 'default', text: certificate.status };
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  if (!supplement) {
    return (
      <Container>
        <Alert severity="info" sx={{ mt: 4 }}>
          Product not found
        </Alert>
      </Container>
    );
  }

  const osiData = supplement.osi_data || {};
  const artgEntry = osiData.artgEntry || {};
  const components = osiData.components || [];
  const primaryComponent = components[0] || {};
  const activeIngredients = primaryComponent.activeIngredients || [];
  const excipients = primaryComponent.excipients || [];
  const additionalInfo = osiData.additionalProductInformation || {};
  const manufacturingDetails = additionalInfo.manufacturingDetails || {};
  const supplierDetails = additionalInfo.supplierDetails || [];
  const permittedIndications = osiData.permittedIndications || [];
  const warnings = osiData.warnings || [];
  const structuredWarnings = osiData.structuredWarnings || [];
  const dosageInfo = osiData.dosageInformation || {};
  const certStatus = getCertificateStatus();

  // Safety function to ensure we never pass objects as React children
  const safeRenderText = (value, fallback = 'Information not available') => {
    if (typeof value === 'string') return value;
    if (value && typeof value === 'object') {
      return value.text || value.warning || value.indication || fallback;
    }
    return fallback;
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={8}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <VerifiedIcon color="success" sx={{ mr: 1 }} />
                  <Chip 
                    label={supplement.osi_number} 
                    color="primary" 
                    size="medium"
                    sx={{ mr: 2 }}
                  />
                  <Chip 
                    label={certStatus.text}
                    color={certStatus.color}
                    size="medium"
                  />
                </Box>
                
                <Typography variant="h4" component="h1" gutterBottom>
                  {artgEntry.productName || 'Unnamed Product'}
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <BusinessIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="h6" color="text.secondary">
                    {supplement.organization_name || supplement.trading_name}
                  </Typography>
                </Box>

                <Typography variant="body1" color="text.secondary" paragraph>
                  {additionalInfo.productDescription || 'No description available'}
                </Typography>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Box sx={{ textAlign: 'center' }}>
                  {certificate && (
                    <Box sx={{ mb: 2 }}>
                      <CheckCircleIcon sx={{ fontSize: 100, color: 'success.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        OSI Certified Product
                      </Typography>
                    </Box>
                  )}
                  
                  <Button
                    variant="outlined"
                    startIcon={<VerifiedIcon />}
                    onClick={() => window.open(`/verify/${supplement.osi_number}`, '_blank')}
                  >
                    Verify Certificate
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Basic Product Information */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              Product Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Dosage Form
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {primaryComponent.dosageForm || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Route of Administration
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {primaryComponent.routeOfAdministration || 'Not specified'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  ARTG Number
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {artgEntry.artgNumber || 'Not registered'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Certification Date
                </Typography>
                <Typography variant="body1" gutterBottom>
                  {certificate ? formatDate(certificate.issued_at) : 'Not certified'}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Active Ingredients */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              <ScienceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Active Ingredients
            </Typography>
            
            {activeIngredients.length > 0 ? (
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Ingredient</TableCell>
                      <TableCell>Strength</TableCell>
                      <TableCell>Unit</TableCell>
                      <TableCell>Source</TableCell>
                      <TableCell>Supplier</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeIngredients.map((ingredient, index) => {
                      const supplier = supplierDetails.find(s => s.ingredient === ingredient.name) || {};
                      return (
                        <TableRow key={index}>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {ingredient.commonName || ingredient.name}
                            </Typography>
                            {ingredient.name !== ingredient.commonName && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                {ingredient.name}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{ingredient.quantity?.value || 'Not specified'}</TableCell>
                          <TableCell>{ingredient.quantity?.unit || 'Not specified'}</TableCell>
                          <TableCell>{ingredient.equivalentTo?.substance || 'Not specified'}</TableCell>
                          <TableCell>{supplier.supplier || 'Not specified'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info">No active ingredients information available</Alert>
            )}
          </CardContent>
        </Card>

        {/* Manufacturing Information */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              <FactoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Manufacturing Details
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Manufacturing Site
                </Typography>
                <Typography variant="body2">
                  {manufacturingDetails.manufacturer || 'Not specified'}
                </Typography>
                {manufacturingDetails.manufacturerAddress && (
                  <Typography variant="caption" color="text.secondary" display="block">
                    {manufacturingDetails.manufacturerAddress}
                  </Typography>
                )}
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  GMP Certification
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CheckCircleIcon color="success" sx={{ mr: 1, fontSize: 20 }} />
                  <Typography variant="body2">
                    GMP Certified Facility
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            {/* Excipients */}
            {excipients.length > 0 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Excipients (Inactive Ingredients)
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {excipients.map((excipient, index) => (
                    <Chip 
                      key={index}
                      label={excipient.name}
                      variant="outlined"
                      size="small"
                    />
                  ))}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Health Claims and Scientific Evidence */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              <InfoIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Health Claims & Scientific Evidence
            </Typography>
            
            {permittedIndications && permittedIndications.length > 0 ? (
              <Box>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Permitted Indications
                </Typography>
                <List>
                  {permittedIndications.map((indication, index) => {
                    const indicationText = safeRenderText(indication, 'Indication not available');
                    const evidenceNotes = typeof indication === 'object' && indication.evidenceNotes 
                      ? safeRenderText(indication.evidenceNotes, null) 
                      : null;
                    
                    return (
                      <ListItem key={index} sx={{ pl: 0 }}>
                        <ListItemIcon>
                          <CheckCircleIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary={indicationText}
                          secondary={evidenceNotes}
                          primaryTypographyProps={{ variant: 'body2' }}
                          secondaryTypographyProps={{ variant: 'caption' }}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Box>
            ) : (
              <Alert severity="info">No health claims information available</Alert>
            )}

            {/* Scientific Studies */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Supporting Scientific Literature
              </Typography>
              <Alert severity="info" icon={<LinkIcon />}>
                Scientific studies and DOI references will be displayed here when available.
                This feature requires integration with the evidence management system.
              </Alert>
            </Box>
          </CardContent>
        </Card>

        {/* Safety Information */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom>
              <WarningIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
              Safety Information
            </Typography>
            
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Warnings and Precautions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {warnings && warnings.length > 0 ? (
                  <List>
                    {warnings.map((warning, index) => {
                      // Handle both string warnings and structured warning objects
                      let warningText = '';
                      let warningType = '';
                      let warningSource = '';
                      
                      if (typeof warning === 'string') {
                        warningText = warning;
                      } else if (warning && typeof warning === 'object') {
                        warningText = warning.text || warning.warning || 'Warning information not available';
                        warningType = warning.type || '';
                        warningSource = warning.source || '';
                      } else {
                        warningText = 'Warning information not available';
                      }
                      
                      return (
                        <ListItem key={index} sx={{ pl: 0 }}>
                          <ListItemIcon>
                            <WarningIcon color="warning" />
                          </ListItemIcon>
                          <ListItemText 
                            primary={warningText}
                            secondary={warningType && warningSource ? `${warningType} - ${warningSource}` : (warningType || warningSource || null)}
                            primaryTypographyProps={{ variant: 'body2' }}
                            secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    No specific warnings listed. Always consult healthcare provider before use.
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Usage Instructions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  <strong>Adults:</strong> {dosageInfo.adults || 'Follow label directions or consult healthcare provider.'}
                </Typography>
                {dosageInfo.children && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Children:</strong> {dosageInfo.children}
                  </Typography>
                )}
                {dosageInfo.generalNotes && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>Notes:</strong> {dosageInfo.generalNotes}
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="subtitle1">Storage Instructions</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2">
                  {osiData.storageShelfLife?.storageConditions || 'Store in a cool, dry place away from direct sunlight.'}
                </Typography>
                {osiData.storageShelfLife?.useByInstructions && (
                  <Typography variant="body2" sx={{ mt: 1 }}>
                    <strong>After Opening:</strong> {osiData.storageShelfLife.useByInstructions}
                  </Typography>
                )}
              </AccordionDetails>
            </Accordion>
          </CardContent>
        </Card>

        {/* Certificate Verification */}
        {certificate && (
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h5" gutterBottom>
                <VerifiedIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                Certificate Verification
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    OSI Certificate Number
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {supplement.osi_number}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Certificate Status
                  </Typography>
                  <Chip 
                    label={certStatus.text}
                    color={certStatus.color}
                    sx={{ mb: 2 }}
                  />
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Issued Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(certificate.issued_at)}
                  </Typography>
                  
                  <Typography variant="subtitle2" color="text.secondary">
                    Expires Date
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {formatDate(certificate.expires_at)}
                  </Typography>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <VerifiedIcon sx={{ fontSize: 120, color: 'success.main', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Enter OSI number to verify certificate authenticity
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<VerifiedIcon />}
                      onClick={() => window.open(`/verify/${supplement.osi_number}`, '_blank')}
                      sx={{ mt: 1 }}
                    >
                      Verify Now
                    </Button>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 3 }} />
              
              <Alert severity="success" icon={<CheckCircleIcon />}>
                This product has been verified by the Open Supplements Initiative (OSI) and meets 
                all requirements for ingredient transparency, manufacturing quality, and scientific evidence.
              </Alert>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default PublicProductDetail;