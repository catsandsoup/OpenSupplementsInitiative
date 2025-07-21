import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  CircularProgress,
  TextField,
  FormControlLabel,
  Checkbox,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  Assignment as AssignmentIcon,
  Description as DocumentIcon,
  Science as LabIcon,
  Factory as FactoryIcon,
  Verified as VerifiedIcon,
  GetApp as DownloadIcon,
  Visibility as PreviewIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AdminReviewPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [supplement, setSupplement] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [checklist, setChecklist] = useState({
    basicInfo: false,
    ingredients: false,
    healthClaims: false,
    labTests: false,
    factoryCerts: false,
    regulatoryDocs: false,
    safetyData: false
  });
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [showRejectionDialog, setShowRejectionDialog] = useState(false);
  const [finalDecision, setFinalDecision] = useState('');

  useEffect(() => {
    if (user?.role === 'admin' && id) {
      loadSupplementData();
      loadDocuments();
    }
  }, [user, id]);

  const loadSupplementData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/supplements/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSupplement(data.supplement);
        setReviewNotes(data.supplement.review_notes || '');
      } else {
        setError('Failed to load supplement data');
      }
    } catch (err) {
      setError('Error loading supplement data');
    } finally {
      setLoading(false);
    }
  };

  const loadDocuments = async () => {
    try {
      const response = await fetch(`/api/documents?supplementId=${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setDocuments(data.documents);
      }
    } catch (err) {
      console.error('Error loading documents:', err);
    }
  };

  const handleChecklistChange = (item) => {
    setChecklist(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const updateSupplementStatus = async (newStatus, notes) => {
    try {
      const response = await fetch(`/api/supplements/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: newStatus,
          reviewNotes: notes
        })
      });

      if (response.ok) {
        navigate('/admin');
      } else {
        setError('Failed to update supplement status');
      }
    } catch (err) {
      setError('Error updating supplement status');
    }
  };

  const handleApprove = () => {
    updateSupplementStatus('approved', reviewNotes);
    setShowApprovalDialog(false);
  };

  const handleReject = () => {
    updateSupplementStatus('rejected', reviewNotes);
    setShowRejectionDialog(false);
  };

  const handleStartReview = () => {
    updateSupplementStatus('under_review', reviewNotes);
  };

  const getCompletionPercentage = () => {
    const completed = Object.values(checklist).filter(Boolean).length;
    const total = Object.keys(checklist).length;
    return Math.round((completed / total) * 100);
  };

  const getDocumentsByCategory = (category) => {
    return documents.filter(doc => doc.document_type === category);
  };

  const handlePreviewDocument = (doc) => {
    window.open(`/api/documents/${doc.id}/download`, '_blank');
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

  if (!supplement) {
    return (
      <Container>
        <Alert severity="error">
          Supplement not found.
        </Alert>
      </Container>
    );
  }

  const osiData = supplement.osi_data;

  return (
    <Container maxWidth="xl">
      <Box sx={{ mb: 4 }}>
        <Button 
          variant="outlined" 
          onClick={() => navigate('/admin')}
          sx={{ mb: 2 }}
        >
          ← Back to Dashboard
        </Button>
        <Typography variant="h4" gutterBottom>
          Review: {osiData?.artgEntry?.productName || 'Unnamed Product'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={supplement.status.replace('_', ' ').toUpperCase()}
            color={supplement.status === 'approved' ? 'success' : 
                   supplement.status === 'rejected' ? 'error' : 
                   supplement.status === 'under_review' ? 'warning' : 'info'}
          />
          <Typography variant="body2" color="text.secondary">
            Submitted: {supplement.submitted_at ? new Date(supplement.submitted_at).toLocaleDateString() : 'Not submitted'}
          </Typography>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Review Checklist */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, position: 'sticky', top: 20 }}>
            <Typography variant="h6" gutterBottom>
              Review Checklist
            </Typography>
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Completion: {getCompletionPercentage()}%
              </Typography>
              <Box sx={{ width: '100%', bgcolor: 'grey.300', borderRadius: 1, mt: 1 }}>
                <Box 
                  sx={{ 
                    width: `${getCompletionPercentage()}%`, 
                    bgcolor: 'primary.main', 
                    height: 8, 
                    borderRadius: 1 
                  }} 
                />
              </Box>
            </Box>

            <List dense>
              <ListItem>
                <ListItemIcon>
                  <Checkbox
                    checked={checklist.basicInfo}
                    onChange={() => handleChecklistChange('basicInfo')}
                  />
                </ListItemIcon>
                <ListItemText primary="Basic Product Information" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Checkbox
                    checked={checklist.ingredients}
                    onChange={() => handleChecklistChange('ingredients')}
                  />
                </ListItemIcon>
                <ListItemText primary="Ingredient Verification" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Checkbox
                    checked={checklist.healthClaims}
                    onChange={() => handleChecklistChange('healthClaims')}
                  />
                </ListItemIcon>
                <ListItemText primary="Health Claims Review" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Checkbox
                    checked={checklist.labTests}
                    onChange={() => handleChecklistChange('labTests')}
                  />
                </ListItemIcon>
                <ListItemText primary="Laboratory Test Results" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Checkbox
                    checked={checklist.factoryCerts}
                    onChange={() => handleChecklistChange('factoryCerts')}
                  />
                </ListItemIcon>
                <ListItemText primary="Factory Certifications" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Checkbox
                    checked={checklist.regulatoryDocs}
                    onChange={() => handleChecklistChange('regulatoryDocs')}
                  />
                </ListItemIcon>
                <ListItemText primary="Regulatory Documents" />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Checkbox
                    checked={checklist.safetyData}
                    onChange={() => handleChecklistChange('safetyData')}
                  />
                </ListItemIcon>
                <ListItemText primary="Safety Data Review" />
              </ListItem>
            </List>

            <Divider sx={{ my: 2 }} />

            <TextField
              fullWidth
              multiline
              rows={4}
              label="Review Notes"
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="Add your review notes and feedback..."
              sx={{ mb: 2 }}
            />

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {supplement.status === 'submitted' && (
                <Button
                  variant="outlined"
                  color="warning"
                  onClick={handleStartReview}
                  startIcon={<AssignmentIcon />}
                >
                  Start Review
                </Button>
              )}
              {supplement.status === 'under_review' && (
                <>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => setShowApprovalDialog(true)}
                    startIcon={<CheckIcon />}
                    disabled={getCompletionPercentage() < 100}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="contained"
                    color="error"
                    onClick={() => setShowRejectionDialog(true)}
                    startIcon={<CancelIcon />}
                  >
                    Reject
                  </Button>
                </>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Product Details */}
        <Grid item xs={12} md={8}>
          {/* Basic Information */}
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">Basic Product Information</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Product Name</Typography>
                  <Typography variant="body1">{osiData?.artgEntry?.productName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Sponsor/Manufacturer</Typography>
                  <Typography variant="body1">{osiData?.artgEntry?.sponsor}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Product Category</Typography>
                  <Typography variant="body1">{osiData?.artgEntry?.productCategory}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2">Dosage Form</Typography>
                  <Typography variant="body1">{osiData?.components?.[0]?.dosageForm}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2">Adult Dosage</Typography>
                  <Typography variant="body1">{osiData?.dosageInformation?.adults}</Typography>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>

          {/* Active Ingredients */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Active Ingredients ({osiData?.components?.[0]?.activeIngredients?.length || 0})
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
                    {osiData?.components?.[0]?.activeIngredients?.map((ingredient, index) => (
                      <TableRow key={index}>
                        <TableCell>{ingredient.name}</TableCell>
                        <TableCell>{ingredient.commonName}</TableCell>
                        <TableCell>{ingredient.quantity}</TableCell>
                        <TableCell>{ingredient.supplierInfo?.supplierName || 'Not specified'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </AccordionDetails>
          </Accordion>

          {/* Health Claims */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Health Claims ({osiData?.permittedIndications?.length || 0})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <List>
                {osiData?.permittedIndications?.map((indication, index) => (
                  <ListItem key={index} divider>
                    <ListItemText
                      primary={
                        typeof indication === 'string' 
                          ? indication 
                          : indication?.text || 'Health claim information not available'
                      }
                      secondary={indication?.evidenceNotes}
                    />
                  </ListItem>
                ))}
              </List>
            </AccordionDetails>
          </Accordion>

          {/* Supporting Documents */}
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                Supporting Documents ({documents.length})
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              {documents.length > 0 ? (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Document Type</TableCell>
                        <TableCell>File Name</TableCell>
                        <TableCell>Upload Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {documents.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell>
                            <Chip 
                              label={doc.document_type.replace('_', ' ')} 
                              size="small"
                              icon={
                                doc.document_type === 'lab_test' ? <LabIcon /> :
                                doc.document_type === 'factory_cert' ? <FactoryIcon /> :
                                <DocumentIcon />
                              }
                            />
                          </TableCell>
                          <TableCell>{doc.file_name}</TableCell>
                          <TableCell>{new Date(doc.created_at).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Tooltip title="Preview Document">
                              <IconButton
                                size="small"
                                onClick={() => handlePreviewDocument(doc)}
                              >
                                <PreviewIcon />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Alert severity="warning">
                  No supporting documents uploaded
                </Alert>
              )}
            </AccordionDetails>
          </Accordion>

          {/* Warnings and Safety Information */}
          {osiData?.warnings?.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="h6">
                  Warnings & Safety Information ({osiData.warnings.length})
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {osiData.warnings.map((warning, index) => (
                    <ListItem key={index} divider>
                      <ListItemIcon>
                        <WarningIcon color="warning" />
                      </ListItemIcon>
                      <ListItemText primary={
                        typeof warning === 'string' 
                          ? warning 
                          : warning?.text || warning?.warning || 'Warning information not available'
                      } />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}
        </Grid>
      </Grid>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onClose={() => setShowApprovalDialog(false)}>
        <DialogTitle>Approve Product</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to approve this product? This will generate a certificate and make it publicly available.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
          <Button onClick={handleApprove} color="success" variant="contained">
            Approve
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectionDialog} onClose={() => setShowRejectionDialog(false)}>
        <DialogTitle>Reject Product</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Please provide detailed feedback on why this product is being rejected:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            placeholder="Explain what needs to be corrected or what evidence is missing..."
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRejectionDialog(false)}>Cancel</Button>
          <Button onClick={handleReject} color="error" variant="contained">
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminReviewPage;