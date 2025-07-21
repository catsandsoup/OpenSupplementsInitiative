import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  Paper,
  Divider
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

const BasicInfoStep = ({ data, updateData, onNext }) => {
  const [alternateNameInput, setAlternateNameInput] = useState('');

  // Ensure data has the expected structure with defaults
  const safeData = {
    artgEntry: {
      productName: '',
      alternateNames: [],
      sponsor: '',
      postalAddress: '',
      productCategory: 'Medicine',
      status: 'Draft',
      ...data?.artgEntry
    },
    products: data?.products || [{
      productName: '',
      alternateNames: [],
      productType: 'Single Medicine Product',
      effectiveDate: new Date().toISOString().split('T')[0]
    }],
    dosageInformation: {
      adults: '',
      children: '',
      generalNotes: '',
      ...data?.dosageInformation
    },
    additionalProductInformation: {
      packSizeInformation: {
        packSize: '',
        poisonSchedule: '',
        ...data?.additionalProductInformation?.packSizeInformation
      },
      ...data?.additionalProductInformation
    },
    storageShelfLife: {
      storageConditions: '',
      shelfLifeMonths: null,
      useByInstructions: '',
      batchNumberFormat: '',
      expiryDateFormat: '',
      ...data?.storageShelfLife
    },
    components: data?.components || [{
      formulation: 'Primary',
      dosageForm: '',
      routeOfAdministration: '',
      visualIdentification: '',
      activeIngredients: [],
      excipients: []
    }]
  };

  const handleInputChange = (section, field, value) => {
    const updatedSection = {
      ...safeData[section],
      [field]: value
    };
    updateData(section, updatedSection);

    // Sync product name between artgEntry and products
    if (section === 'artgEntry' && field === 'productName') {
      const updatedProducts = [...safeData.products];
      updatedProducts[0] = {
        ...updatedProducts[0],
        productName: value
      };
      updateData('products', updatedProducts);
    }
  };

  const handleProductChange = (field, value) => {
    const updatedProducts = [...safeData.products];
    updatedProducts[0] = {
      ...updatedProducts[0],
      [field]: value
    };
    updateData('products', updatedProducts);
  };

  const addAlternateName = () => {
    if (alternateNameInput.trim()) {
      const updatedArtgEntry = {
        ...safeData.artgEntry,
        alternateNames: [...safeData.artgEntry.alternateNames, alternateNameInput.trim()]
      };
      updateData('artgEntry', updatedArtgEntry);
      setAlternateNameInput('');
    }
  };

  const removeAlternateName = (index) => {
    const updatedArtgEntry = {
      ...safeData.artgEntry,
      alternateNames: safeData.artgEntry.alternateNames.filter((_, i) => i !== index)
    };
    updateData('artgEntry', updatedArtgEntry);
  };

  const handleDosageInfoChange = (field, value) => {
    const updatedDosageInfo = {
      ...safeData.dosageInformation,
      [field]: value
    };
    updateData('dosageInformation', updatedDosageInfo);
  };

  const handlePackInfoChange = (field, value) => {
    const updatedPackInfo = {
      ...safeData.additionalProductInformation,
      packSizeInformation: {
        ...safeData.additionalProductInformation.packSizeInformation,
        [field]: value
      }
    };
    updateData('additionalProductInformation', updatedPackInfo);
  };

  const handleStorageChange = (field, value) => {
    const updatedStorage = {
      ...safeData.storageShelfLife,
      [field]: value
    };
    updateData('storageShelfLife', updatedStorage);
  };

  const isFormValid = () => {
    // More lenient validation - only require product name and dosage form
    return (
      safeData.artgEntry.productName && safeData.artgEntry.productName.trim() &&
      safeData.components[0].dosageForm && safeData.components[0].dosageForm.trim()
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Basic Product Information
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide essential details about your supplement product
      </Typography>

      <Grid container spacing={3}>
        {/* Product Registration Details */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Product Registration Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Name *"
                  value={safeData.artgEntry.productName}
                  onChange={(e) => handleInputChange('artgEntry', 'productName', e.target.value)}
                  helperText="Official name as it will appear on the certificate"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Sponsor/Manufacturer *"
                  value={safeData.artgEntry.sponsor}
                  onChange={(e) => handleInputChange('artgEntry', 'sponsor', e.target.value)}
                  helperText="Company responsible for the product"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Sponsor Address"
                  value={safeData.artgEntry.postalAddress}
                  onChange={(e) => handleInputChange('artgEntry', 'postalAddress', e.target.value)}
                  multiline
                  rows={2}
                  helperText="Complete postal address of the sponsor"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Product Category</InputLabel>
                  <Select
                    value={safeData.artgEntry.productCategory}
                    onChange={(e) => handleInputChange('artgEntry', 'productCategory', e.target.value)}
                    label="Product Category"
                  >
                    <MenuItem value="Medicine">Medicine</MenuItem>
                    <MenuItem value="Device">Device</MenuItem>
                    <MenuItem value="Supplement">Supplement</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Product Type"
                  value={safeData.products[0].productType}
                  onChange={(e) => handleProductChange('productType', e.target.value)}
                />
              </Grid>
            </Grid>

            {/* Alternate Names */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Alternate Names (Optional)
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  label="Add alternate name"
                  value={alternateNameInput}
                  onChange={(e) => setAlternateNameInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addAlternateName()}
                />
                <Button
                  variant="outlined"
                  onClick={addAlternateName}
                  startIcon={<AddIcon />}
                >
                  Add
                </Button>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {safeData.artgEntry.alternateNames.map((name, index) => (
                  <Chip
                    key={index}
                    label={name}
                    onDelete={() => removeAlternateName(index)}
                    deleteIcon={<DeleteIcon />}
                  />
                ))}
              </Box>
            </Box>
          </Paper>
        </Grid>

        {/* Dosage Form and Administration */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dosage Form and Administration
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Dosage Form *</InputLabel>
                  <Select
                    value={safeData.components[0].dosageForm}
                    onChange={(e) => {
                      const updatedComponents = [...safeData.components];
                      updatedComponents[0].dosageForm = e.target.value;
                      updateData('components', updatedComponents);
                    }}
                    label="Dosage Form *"
                  >
                    <MenuItem value="Tablet">Tablet</MenuItem>
                    <MenuItem value="Capsule">Capsule</MenuItem>
                    <MenuItem value="Liquid">Liquid</MenuItem>
                    <MenuItem value="Powder">Powder</MenuItem>
                    <MenuItem value="Softgel">Softgel</MenuItem>
                    <MenuItem value="Gummy">Gummy</MenuItem>
                    <MenuItem value="Spray">Spray</MenuItem>
                    <MenuItem value="Cream">Cream</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel>Route of Administration</InputLabel>
                  <Select
                    value={safeData.components[0].routeOfAdministration}
                    onChange={(e) => {
                      const updatedComponents = [...safeData.components];
                      updatedComponents[0].routeOfAdministration = e.target.value;
                      updateData('components', updatedComponents);
                    }}
                    label="Route of Administration"
                  >
                    <MenuItem value="Oral">Oral</MenuItem>
                    <MenuItem value="Topical">Topical</MenuItem>
                    <MenuItem value="Sublingual">Sublingual</MenuItem>
                    <MenuItem value="Nasal">Nasal</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Visual Identification"
                  value={safeData.components[0].visualIdentification}
                  onChange={(e) => {
                    const updatedComponents = [...safeData.components];
                    updatedComponents[0].visualIdentification = e.target.value;
                    updateData('components', updatedComponents);
                  }}
                  helperText="Physical appearance description"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Dosage Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Dosage Instructions
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Adult Dosage *"
                  value={safeData.dosageInformation.adults}
                  onChange={(e) => handleDosageInfoChange('adults', e.target.value)}
                  multiline
                  rows={2}
                  helperText="e.g., Take 1 tablet daily with food"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Children Dosage"
                  value={safeData.dosageInformation.children}
                  onChange={(e) => handleDosageInfoChange('children', e.target.value)}
                  multiline
                  rows={2}
                  helperText="Leave blank if not suitable for children"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="General Notes"
                  value={safeData.dosageInformation.generalNotes}
                  onChange={(e) => handleDosageInfoChange('generalNotes', e.target.value)}
                  multiline
                  rows={2}
                  helperText="Additional usage instructions or precautions"
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Pack Size and Storage */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Pack Size and Storage
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Pack Size"
                  value={safeData.additionalProductInformation.packSizeInformation.packSize}
                  onChange={(e) => handlePackInfoChange('packSize', e.target.value)}
                  helperText="e.g., 60 tablets, 500ml bottle"
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Poison Schedule"
                  value={safeData.additionalProductInformation.packSizeInformation.poisonSchedule}
                  onChange={(e) => handlePackInfoChange('poisonSchedule', e.target.value)}
                  helperText="If applicable"
                />
              </Grid>

              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  label="Storage Conditions"
                  value={safeData.storageShelfLife.storageConditions}
                  onChange={(e) => handleStorageChange('storageConditions', e.target.value)}
                  helperText="e.g., Store below 25°C in a cool, dry place"
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Shelf Life (months)"
                  type="number"
                  value={safeData.storageShelfLife.shelfLifeMonths || ''}
                  onChange={(e) => handleStorageChange('shelfLifeMonths', parseInt(e.target.value) || null)}
                />
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!isFormValid()}
          size="large"
        >
          Next: Ingredients & Suppliers
        </Button>
      </Box>
    </Box>
  );
};

export default BasicInfoStep;