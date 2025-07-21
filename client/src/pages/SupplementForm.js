import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Stepper,
  Step,
  StepLabel,
  Box,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import BasicInfoStep from '../components/submission/BasicInfoStep';
import IngredientsStep from '../components/submission/IngredientsStep';
import HealthClaimsStep from '../components/submission/HealthClaimsStep';
import DocumentsStep from '../components/submission/DocumentsStep';
import ReviewStep from '../components/submission/ReviewStep';

const steps = [
  'Basic Information',
  'Ingredients & Suppliers',
  'Health Claims & Evidence',
  'Supporting Documents',
  'Review & Submit'
];

const SupplementForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isDraft, setIsDraft] = useState(true);

  // Form data state following OSI schema structure
  const [formData, setFormData] = useState({
    // Basic product information
    artgEntry: {
      artgNumber: '',
      productName: '',
      alternateNames: [],
      sponsor: '',
      postalAddress: '',
      productCategory: 'Medicine',
      status: 'Draft'
    },
    products: [{
      productName: '',
      alternateNames: [],
      productType: 'Single Medicine Product',
      effectiveDate: new Date().toISOString().split('T')[0]
    }],
    permittedIndications: [],
    indicationRequirements: [],
    warnings: [],
    dosageInformation: {
      adults: '',
      children: '',
      generalNotes: ''
    },
    allergenInformation: {
      containsAllergens: [],
      freeOfClaims: [],
      allergenStatement: '',
      crossContaminationRisk: null
    },
    additionalProductInformation: {
      packSizeInformation: {
        packSize: '',
        poisonSchedule: ''
      }
    },
    components: [{
      formulation: 'Primary',
      dosageForm: '',
      routeOfAdministration: '',
      visualIdentification: '',
      activeIngredients: [],
      excipients: []
    }],
    clinicalTrials: [],
    evidenceRegulatorySummary: {
      overallEvidenceStatement: '',
      keyRegulatoryPoints: [],
      evidenceGradingSystemUsed: '',
      references: []
    },
    interactions: [],
    contraindicationsAdverseEffects: {
      contraindications: [],
      adverseEffects: []
    },
    intendedPopulation: {
      primaryTargetGroups: [],
      ageRange: {
        minAge: null,
        maxAge: null,
        unit: 'years'
      },
      sex: 'Any',
      specificConsiderations: ''
    },
    storageShelfLife: {
      storageConditions: '',
      shelfLifeMonths: null,
      useByInstructions: '',
      batchNumberFormat: '',
      expiryDateFormat: ''
    },
    productIdentifiers: [],
    documentInformation: {
      dataEntrySource: 'Manufacturer Submission',
      dataEntryDate: new Date().toISOString().split('T')[0],
      version: '0.2.0',
      notes: ''
    },
    // Additional fields for submission tracking
    submissionMetadata: {
      submittedBy: user?.id || '',
      organizationId: user?.organizationId || '',
      status: 'draft',
      lastSaved: null,
      submittedAt: null
    }
  });

  // Load existing supplement data if editing
  useEffect(() => {
    if (id && id !== 'new') {
      loadSupplementData(id);
    }
  }, [id]);

  const loadSupplementData = async (supplementId) => {
    try {
      setLoading(true);
      const response = await api.get(`/supplements/${supplementId}`);
      const data = response.data.supplement;
      setFormData(data.osi_data || data);
      setIsDraft(data.status === 'draft');
    } catch (err) {
      console.error('Error loading supplement data:', err);
      setError(err.response?.data?.error || 'Error loading supplement data');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleStepClick = (step) => {
    setActiveStep(step);
  };

  const updateFormData = (section, data) => {
    setFormData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const saveDraft = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Prepare data for draft submission - make it more lenient
      const draftData = {
        ...formData,
        // Ensure required fields have default values for draft
        artgEntry: {
          productName: formData.artgEntry?.productName || '',
          alternateNames: formData.artgEntry?.alternateNames || [],
          sponsor: formData.artgEntry?.sponsor || '',
          postalAddress: formData.artgEntry?.postalAddress || '',
          productCategory: formData.artgEntry?.productCategory || 'Medicine',
          status: 'Draft',
          artgNumber: formData.artgEntry?.artgNumber || `DRAFT-${Date.now()}`,
          ...formData.artgEntry
        },
        // Ensure products array exists
        products: formData.products || [{
          productName: formData.artgEntry?.productName || '',
          alternateNames: [],
          productType: 'Single Medicine Product',
          effectiveDate: new Date().toISOString().split('T')[0]
        }],
        // Convert warnings to simple strings
        warnings: (formData.warnings || []).map(w => {
          if (typeof w === 'string') return w;
          if (typeof w === 'object') return w.text || w.warning || 'Warning text not available';
          return String(w);
        }),
        // Ensure components have proper structure
        components: (formData.components || []).map(comp => ({
          formulation: comp.formulation || 'Primary',
          dosageForm: comp.dosageForm || '',
          routeOfAdministration: comp.routeOfAdministration || '',
          visualIdentification: comp.visualIdentification || '',
          activeIngredients: (comp.activeIngredients || []).map(ing => ({
            substance: ing.substance || '',
            quantity: typeof ing.quantity === 'object' 
              ? `${ing.quantity.value || ''} ${ing.quantity.unit || ''}`.trim()
              : (ing.quantity || ''),
            ...(ing.equivalentTo && ing.equivalentTo.substance ? {
              equivalentTo: typeof ing.equivalentTo === 'object'
                ? `${ing.equivalentTo.value || ''} ${ing.equivalentTo.unit || ''} ${ing.equivalentTo.substance || ''}`.trim()
                : ing.equivalentTo
            } : {}),
            supplier: ing.supplier || '',
            factory: ing.factory || '',
            batchNumber: ing.batchNumber || '',
            expiryDate: ing.expiryDate || ''
          })),
          excipients: (comp.excipients || []).map(exc => ({
            substance: exc.substance || '',
            quantity: typeof exc.quantity === 'object'
              ? `${exc.quantity.value || ''} ${exc.quantity.unit || ''}`.trim()
              : (exc.quantity || ''),
            purpose: exc.purpose || ''
          }))
        })),
        // Ensure other required sections exist
        permittedIndications: formData.permittedIndications || [],
        indicationRequirements: formData.indicationRequirements || [],
        dosageInformation: {
          adults: '',
          children: '',
          generalNotes: '',
          ...formData.dosageInformation
        },
        allergenInformation: {
          containsAllergens: [],
          freeOfClaims: [],
          allergenStatement: '',
          crossContaminationRisk: null,
          ...formData.allergenInformation
        },
        additionalProductInformation: {
          packSizeInformation: {
            packSize: '',
            poisonSchedule: '',
            ...formData.additionalProductInformation?.packSizeInformation
          },
          ...formData.additionalProductInformation
        },
        storageShelfLife: {
          storageConditions: '',
          shelfLifeMonths: null,
          useByInstructions: '',
          batchNumberFormat: '',
          expiryDateFormat: '',
          ...formData.storageShelfLife
        },
        clinicalTrials: formData.clinicalTrials || [],
        evidenceRegulatorySummary: {
          overallEvidenceStatement: '',
          keyRegulatoryPoints: [],
          evidenceGradingSystemUsed: '',
          references: [],
          ...formData.evidenceRegulatorySummary
        },
        interactions: formData.interactions || [],
        contraindicationsAdverseEffects: {
          contraindications: [],
          adverseEffects: [],
          ...formData.contraindicationsAdverseEffects
        },
        intendedPopulation: {
          primaryTargetGroups: [],
          ageRange: {
            minAge: null,
            maxAge: null,
            unit: 'years'
          },
          sex: 'Any',
          specificConsiderations: '',
          ...formData.intendedPopulation
        },
        productIdentifiers: formData.productIdentifiers || [],
        documentInformation: {
          dataEntrySource: 'Manufacturer Submission',
          dataEntryDate: new Date().toISOString().split('T')[0],
          version: '0.2.0',
          notes: '',
          ...formData.documentInformation
        },
        submissionMetadata: {
          submittedBy: user?.id || '',
          organizationId: user?.organizationId || '',
          status: 'draft',
          lastSaved: new Date().toISOString(),
          submittedAt: null,
          ...formData.submissionMetadata
        }
      };

      let response;
      if (id && id !== 'new') {
        response = await api.put(`/supplements/${id}`, { 
          osiData: draftData, 
          status: 'draft' 
        });
      } else {
        response = await api.post('/supplements', draftData);
      }

      setSuccess('Draft saved successfully');
      
      // Navigate to edit page if this was a new submission
      if (!id || id === 'new') {
        const supplementId = response.data.supplement?.id || response.data.id;
        if (supplementId) {
          navigate(`/supplement/${supplementId}/edit`);
        }
      }
    } catch (err) {
      console.error('Save draft error:', err);
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          'Error saving draft. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const submitForReview = async () => {
    try {
      setLoading(true);
      const payload = {
        ...formData,
        submissionMetadata: {
          ...formData.submissionMetadata,
          submittedAt: new Date().toISOString(),
          status: 'submitted'
        }
      };

      if (id && id !== 'new') {
        await api.post(`/supplements/${id}/submit`);
      } else {
        await api.post('/supplements/submit', payload);
      }

      setSuccess('Supplement submitted for review successfully!');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Submit supplement error:', err);
      setError(err.response?.data?.error || 'Error submitting supplement');
    } finally {
      setLoading(false);
    }
  };

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <BasicInfoStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
          />
        );
      case 1:
        return (
          <IngredientsStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 2:
        return (
          <HealthClaimsStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 3:
        return (
          <DocumentsStep
            data={formData}
            updateData={updateFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case 4:
        return (
          <ReviewStep
            data={formData}
            onSubmit={submitForReview}
            onBack={handleBack}
            onSaveDraft={saveDraft}
            loading={loading}
          />
        );
      default:
        return 'Unknown step';
    }
  };

  if (loading && !formData.artgEntry.productName) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {id && id !== 'new' ? 'Edit Product Submission' : 'New Product Submission'}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Complete all steps to submit your product for OSI certification
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Paper sx={{ p: 3 }}>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel 
                onClick={() => handleStepClick(index)}
                sx={{ cursor: 'pointer' }}
              >
                {label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ minHeight: '400px' }}>
          {getStepContent(activeStep)}
        </Box>

        {/* Save Draft Button - Available on all steps except final review */}
        {activeStep < steps.length - 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="outlined"
              onClick={saveDraft}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Save Draft
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default SupplementForm;