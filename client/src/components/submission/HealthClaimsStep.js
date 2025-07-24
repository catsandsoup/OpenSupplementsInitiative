import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Paper,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  Link as LinkIcon
} from '@mui/icons-material';

const HealthClaimsStep = ({ data, updateData, onNext, onBack }) => {
  const [expandedClaim, setExpandedClaim] = useState(false);
  const [expandedWarning, setExpandedWarning] = useState(false);
  const [expandedInteraction, setExpandedInteraction] = useState(false);

  // Permitted Indications (Health Claims)
  const addPermittedIndication = () => {
    const updatedIndications = [...data.permittedIndications, {
      text: '',
      evidenceNotes: '',
      supportingStudies: []
    }];
    updateData('permittedIndications', updatedIndications);
  };

  const updatePermittedIndication = (index, field, value) => {
    const updatedIndications = [...data.permittedIndications];
    updatedIndications[index][field] = value;
    updateData('permittedIndications', updatedIndications);
  };

  const removePermittedIndication = (index) => {
    const updatedIndications = data.permittedIndications.filter((_, i) => i !== index);
    updateData('permittedIndications', updatedIndications);
  };

  // Warnings
  const addWarning = () => {
    const currentWarnings = data.warnings || [];
    const updatedWarnings = [...currentWarnings, {
      text: '',
      type: 'GeneralAdvisory',
      source: 'Manufacturer Recommendation'
    }];
    updateData('warnings', updatedWarnings);
  };

  const updateWarning = (index, field, value) => {
    const currentWarnings = data.warnings || [];
    const updatedWarnings = [...currentWarnings];
    updatedWarnings[index][field] = value;
    updateData('warnings', updatedWarnings);
  };

  const removeWarning = (index) => {
    const currentWarnings = data.warnings || [];
    const updatedWarnings = currentWarnings.filter((_, i) => i !== index);
    updateData('warnings', updatedWarnings);
  };

  // Interactions
  const addInteraction = () => {
    const currentInteractions = data.interactions || [];
    const updatedInteractions = [...currentInteractions, {
      interactingSubstanceName: '',
      interactingSubstanceType: 'Medication',
      effect: '',
      severity: 'Minor',
      mechanism: '',
      managementAdvice: '',
      evidenceReferences: []
    }];
    updateData('interactions', updatedInteractions);
  };

  const updateInteraction = (index, field, value) => {
    const currentInteractions = data.interactions || [];
    const updatedInteractions = [...currentInteractions];
    updatedInteractions[index][field] = value;
    updateData('interactions', updatedInteractions);
  };

  const removeInteraction = (index) => {
    const currentInteractions = data.interactions || [];
    const updatedInteractions = currentInteractions.filter((_, i) => i !== index);
    updateData('interactions', updatedInteractions);
  };

  // Clinical Trials
  const addClinicalTrial = () => {
    const updatedTrials = [...data.clinicalTrials, {
      trialId: '',
      url: '',
      title: '',
      status: 'Completed',
      phase: 'Not Applicable',
      outcomeSummary: '',
      completionDate: '',
      population: '',
      intervention: ''
    }];
    updateData('clinicalTrials', updatedTrials);
  };

  const updateClinicalTrial = (index, field, value) => {
    const updatedTrials = [...data.clinicalTrials];
    updatedTrials[index][field] = value;
    updateData('clinicalTrials', updatedTrials);
  };

  const removeClinicalTrial = (index) => {
    const updatedTrials = data.clinicalTrials.filter((_, i) => i !== index);
    updateData('clinicalTrials', updatedTrials);
  };

  // Allergen Information
  const updateAllergenInfo = (field, value) => {
    const updatedAllergenInfo = {
      ...data.allergenInformation,
      [field]: value
    };
    updateData('allergenInformation', updatedAllergenInfo);
  };

  const addAllergen = (type, allergen) => {
    if (allergen.trim()) {
      const updatedAllergenInfo = {
        ...data.allergenInformation,
        [type]: [...data.allergenInformation[type], allergen.trim()]
      };
      updateData('allergenInformation', updatedAllergenInfo);
    }
  };

  const removeAllergen = (type, index) => {
    const updatedAllergenInfo = {
      ...data.allergenInformation,
      [type]: data.allergenInformation[type].filter((_, i) => i !== index)
    };
    updateData('allergenInformation', updatedAllergenInfo);
  };

  const isFormValid = () => {
    return data.permittedIndications.length > 0 && 
           data.permittedIndications.every(indication => indication.text.trim());
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Health Claims & Evidence
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide health claims with supporting evidence, warnings, and safety information
      </Typography>

      {/* Permitted Indications */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Health Claims (Permitted Indications)
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addPermittedIndication}
          >
            Add Health Claim
          </Button>
        </Box>

        {data.permittedIndications.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Add at least one health claim or permitted indication
          </Alert>
        )}

        {data.permittedIndications.map((indication, index) => (
          <Accordion 
            key={index}
            expanded={expandedClaim === index}
            onChange={() => setExpandedClaim(expandedClaim === index ? false : index)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ flexGrow: 1 }}>
                  {indication.text || `Health Claim ${index + 1}`}
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removePermittedIndication(index);
                  }}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Health Claim Text *"
                    value={indication.text}
                    onChange={(e) => updatePermittedIndication(index, 'text', e.target.value)}
                    multiline
                    rows={2}
                    helperText="e.g., 'Supports immune system function'"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Evidence Notes"
                    value={indication.evidenceNotes}
                    onChange={(e) => updatePermittedIndication(index, 'evidenceNotes', e.target.value)}
                    multiline
                    rows={3}
                    helperText="Summary of evidence supporting this claim"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Clinical Trials */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Clinical Trials & Studies
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addClinicalTrial}
          >
            Add Study
          </Button>
        </Box>

        {(data.clinicalTrials || []).map((trial, index) => (
          <Accordion key={index} sx={{ mb: 2 }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ flexGrow: 1 }}>
                  {trial.title || trial.trialId || `Study ${index + 1}`}
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removeClinicalTrial(index);
                  }}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Trial ID"
                    value={trial.trialId}
                    onChange={(e) => updateClinicalTrial(index, 'trialId', e.target.value)}
                    helperText="e.g., NCT number, ACTRN"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="URL/DOI"
                    value={trial.url}
                    onChange={(e) => updateClinicalTrial(index, 'url', e.target.value)}
                    helperText="Direct link to study"
                    InputProps={{
                      startAdornment: <LinkIcon sx={{ mr: 1, color: 'text.secondary' }} />
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Study Title"
                    value={trial.title}
                    onChange={(e) => updateClinicalTrial(index, 'title', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={trial.status}
                      onChange={(e) => updateClinicalTrial(index, 'status', e.target.value)}
                      label="Status"
                    >
                      <MenuItem value="Completed">Completed</MenuItem>
                      <MenuItem value="Recruiting">Recruiting</MenuItem>
                      <MenuItem value="Active">Active</MenuItem>
                      <MenuItem value="Terminated">Terminated</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel>Phase</InputLabel>
                    <Select
                      value={trial.phase}
                      onChange={(e) => updateClinicalTrial(index, 'phase', e.target.value)}
                      label="Phase"
                    >
                      <MenuItem value="Not Applicable">Not Applicable</MenuItem>
                      <MenuItem value="Phase 1">Phase 1</MenuItem>
                      <MenuItem value="Phase 2">Phase 2</MenuItem>
                      <MenuItem value="Phase 3">Phase 3</MenuItem>
                      <MenuItem value="Phase 4">Phase 4</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Completion Date"
                    type="date"
                    value={trial.completionDate}
                    onChange={(e) => updateClinicalTrial(index, 'completionDate', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Outcome Summary"
                    value={trial.outcomeSummary}
                    onChange={(e) => updateClinicalTrial(index, 'outcomeSummary', e.target.value)}
                    multiline
                    rows={2}
                    helperText="Brief summary of main outcomes"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Warnings */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Warnings & Advisories
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addWarning}
          >
            Add Warning
          </Button>
        </Box>

        {(data.warnings || []).map((warning, index) => (
          <Accordion 
            key={index}
            expanded={expandedWarning === index}
            onChange={() => setExpandedWarning(expandedWarning === index ? false : index)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ flexGrow: 1 }}>
                  {warning.text || `Warning ${index + 1}`}
                </Typography>
                <Chip 
                  label={warning.type} 
                  size="small" 
                  sx={{ mr: 1 }}
                />
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWarning(index);
                  }}
                  color="error"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Warning Text"
                    value={warning.text}
                    onChange={(e) => updateWarning(index, 'text', e.target.value)}
                    multiline
                    rows={2}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Warning Type</InputLabel>
                    <Select
                      value={warning.type}
                      onChange={(e) => updateWarning(index, 'type', e.target.value)}
                      label="Warning Type"
                    >
                      <MenuItem value="MandatoryLabel">Mandatory Label</MenuItem>
                      <MenuItem value="GeneralAdvisory">General Advisory</MenuItem>
                      <MenuItem value="Pregnancy">Pregnancy</MenuItem>
                      <MenuItem value="AllergenRelated">Allergen Related</MenuItem>
                      <MenuItem value="InteractionPotential">Interaction Potential</MenuItem>
                      <MenuItem value="Dosing">Dosing</MenuItem>
                      <MenuItem value="Storage">Storage</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Source"
                    value={warning.source}
                    onChange={(e) => updateWarning(index, 'source', e.target.value)}
                    helperText="e.g., TGA Requirement, Manufacturer Recommendation"
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Allergen Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Allergen Information
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Allergen Statement"
              value={data.allergenInformation.allergenStatement}
              onChange={(e) => updateAllergenInfo('allergenStatement', e.target.value)}
              multiline
              rows={2}
              helperText="General allergen advisory statement"
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Contains Allergens
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {(data.allergenInformation?.containsAllergens || []).map((allergen, index) => (
                <Chip
                  key={index}
                  label={allergen}
                  onDelete={() => removeAllergen('containsAllergens', index)}
                  deleteIcon={<DeleteIcon />}
                />
              ))}
            </Box>
            <TextField
              size="small"
              label="Add allergen"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addAllergen('containsAllergens', e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" gutterBottom>
              Free-From Claims
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
              {(data.allergenInformation?.freeOfClaims || []).map((claim, index) => (
                <Chip
                  key={index}
                  label={claim}
                  onDelete={() => removeAllergen('freeOfClaims', index)}
                  deleteIcon={<DeleteIcon />}
                />
              ))}
            </Box>
            <TextField
              size="small"
              label="Add free-from claim"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  addAllergen('freeOfClaims', e.target.value);
                  e.target.value = '';
                }
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          size="large"
        >
          Back: Ingredients
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!isFormValid()}
          size="large"
        >
          Next: Supporting Documents
        </Button>
      </Box>
    </Box>
  );
};

export default HealthClaimsStep;