import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Checkbox,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
  Send as SendIcon,
  Save as SaveIcon
} from '@mui/icons-material';

const ReviewStep = ({ data, onSubmit, onBack, onSaveDraft, loading }) => {
  const [confirmations, setConfirmations] = useState({
    dataAccuracy: false,
    documentsComplete: false,
    legalCompliance: false,
    termsAccepted: false
  });

  const handleConfirmationChange = (field) => {
    setConfirmations(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const isReadyToSubmit = () => {
    return Object.values(confirmations).every(Boolean);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getCompletionStatus = () => {
    const checks = [
      {
        label: 'Basic Product Information',
        complete: data.artgEntry.productName && data.artgEntry.sponsor,
        details: `Product: ${data.artgEntry.productName || 'Not specified'}`
      },
      {
        label: 'Active Ingredients',
        complete: data.components[0].activeIngredients.length > 0,
        details: `${data.components[0].activeIngredients.length} active ingredient(s)`
      },
      {
        label: 'Health Claims',
        complete: data.permittedIndications.length > 0,
        details: `${data.permittedIndications.length} health claim(s)`
      },
      {
        label: 'Supporting Documents',
        complete: (data.supportingDocuments || []).length > 0,
        details: `${(data.supportingDocuments || []).length} document(s) uploaded`
      },
      {
        label: 'Dosage Information',
        complete: data.dosageInformation.adults,
        details: data.dosageInformation.adults ? 'Specified' : 'Not specified'
      }
    ];

    return checks;
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Review & Submit
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Review all information before submitting your product for OSI certification
      </Typography>

      {/* Completion Status */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Submission Completeness
        </Typography>
        
        <Grid container spacing={2}>
          {getCompletionStatus().map((check, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box sx={{ display: 'flex', alignItems: 'center', p: 2, border: 1, borderRadius: 1, borderColor: check.complete ? 'success.main' : 'warning.main' }}>
                {check.complete ? (
                  <CheckIcon color="success" sx={{ mr: 2 }} />
                ) : (
                  <WarningIcon color="warning" sx={{ mr: 2 }} />
                )}
                <Box>
                  <Typography variant="subtitle2">{check.label}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {check.details}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Paper>

      {/* Product Summary */}
      <Accordion defaultExpanded sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">Product Summary</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Product Name</Typography>
              <Typography variant="body1">{data.artgEntry.productName}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Sponsor/Manufacturer</Typography>
              <Typography variant="body1">{data.artgEntry.sponsor}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Dosage Form</Typography>
              <Typography variant="body1">{data.components[0].dosageForm}</Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2">Route of Administration</Typography>
              <Typography variant="body1">{data.components[0].routeOfAdministration}</Typography>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2">Adult Dosage</Typography>
              <Typography variant="body1">{data.dosageInformation.adults}</Typography>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Active Ingredients */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Active Ingredients ({data.components[0].activeIngredients.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Ingredient Name</TableCell>
                  <TableCell>Common Name</TableCell>
                  <TableCell>Quantity</TableCell>
                  <TableCell>Supplier</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.components[0].activeIngredients.map((ingredient, index) => (
                  <TableRow key={index}>
                    <TableCell>{ingredient.name}</TableCell>
                    <TableCell>{ingredient.commonName}</TableCell>
                    <TableCell>
                      {ingredient.quantity.value} {ingredient.quantity.unit}
                      {ingredient.equivalentTo && (
                        <Typography variant="caption" display="block" color="text.secondary">
                          Equiv. to {ingredient.equivalentTo.value} {ingredient.equivalentTo.unit} {ingredient.equivalentTo.substance}
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>{ingredient.supplierInfo?.supplierName || 'Not specified'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </AccordionDetails>
      </Accordion>

      {/* Health Claims */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Health Claims ({data.permittedIndications.length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {data.permittedIndications.map((indication, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={indication.text}
                  secondary={indication.evidenceNotes}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Warnings */}
      {data.warnings.length > 0 && (
        <Accordion sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              Warnings & Advisories ({data.warnings.length})
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <List>
              {data.warnings.map((warning, index) => (
                <ListItem key={index} divider>
                  <ListItemText
                    primary={warning.text}
                    secondary={
                      <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                        <Chip label={warning.type} size="small" />
                        <Chip label={warning.source} size="small" variant="outlined" />
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Supporting Documents */}
      <Accordion sx={{ mb: 2 }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Supporting Documents ({(data.supportingDocuments || []).length})
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          {(data.supportingDocuments || []).length > 0 ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>File Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Size</TableCell>
                    <TableCell>Upload Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(data.supportingDocuments || []).map((doc, index) => (
                    <TableRow key={index}>
                      <TableCell>{doc.fileName}</TableCell>
                      <TableCell>
                        <Chip label={doc.category.replace('_', ' ')} size="small" />
                      </TableCell>
                      <TableCell>{formatFileSize(doc.fileSize)}</TableCell>
                      <TableCell>{new Date(doc.uploadedAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Alert severity="warning">
              No supporting documents uploaded. Consider adding relevant documentation to strengthen your submission.
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Submission Confirmations */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'warning.light' }}>
        <Typography variant="h6" gutterBottom>
          Submission Confirmations
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Please confirm the following before submitting your product for review:
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmations.dataAccuracy}
                onChange={() => handleConfirmationChange('dataAccuracy')}
              />
            }
            label="I confirm that all product information provided is accurate and complete to the best of my knowledge"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmations.documentsComplete}
                onChange={() => handleConfirmationChange('documentsComplete')}
              />
            }
            label="I confirm that all required supporting documents have been uploaded and are authentic"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmations.legalCompliance}
                onChange={() => handleConfirmationChange('legalCompliance')}
              />
            }
            label="I confirm that this product complies with all applicable regulatory requirements in the intended markets"
          />
          
          <FormControlLabel
            control={
              <Checkbox
                checked={confirmations.termsAccepted}
                onChange={() => handleConfirmationChange('termsAccepted')}
              />
            }
            label="I accept the OSI Terms of Service and understand that false information may result in certification denial or revocation"
          />
        </Box>
      </Paper>

      {/* Submission Actions */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Submit for Review
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Once submitted, your product will enter the OSI review process. You will be notified of the review status and any additional requirements.
        </Typography>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">What happens next?</Typography>
          <Typography variant="body2">
            1. Initial validation of submitted data and documents<br/>
            2. Technical review by OSI experts<br/>
            3. Evidence verification and compliance check<br/>
            4. Certificate generation (if approved)<br/>
            5. Publication in OSI public database
          </Typography>
        </Alert>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={onBack}
            size="large"
            disabled={loading}
          >
            Back: Documents
          </Button>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={onSaveDraft}
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
              disabled={loading}
            >
              Save Draft
            </Button>
            
            <Button
              variant="contained"
              onClick={onSubmit}
              disabled={!isReadyToSubmit() || loading}
              startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              size="large"
              color="primary"
            >
              {loading ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </Box>
        </Box>

        {!isReadyToSubmit() && (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Please complete all confirmation checkboxes above to submit your product for review.
          </Alert>
        )}
      </Paper>
    </Box>
  );
};

export default ReviewStep;