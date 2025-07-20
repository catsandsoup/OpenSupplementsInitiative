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
  Divider,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';

const IngredientsStep = ({ data, updateData, onNext, onBack }) => {
  const [expandedIngredient, setExpandedIngredient] = useState(false);
  const [expandedExcipient, setExpandedExcipient] = useState(false);

  const addActiveIngredient = () => {
    const updatedComponents = [...data.components];
    updatedComponents[0].activeIngredients.push({
      name: '',
      commonName: '',
      quantity: {
        value: 0,
        unit: 'mg'
      },
      equivalentTo: null,
      supplierInfo: {
        supplierName: '',
        supplierAddress: '',
        factoryName: '',
        factoryAddress: '',
        certifications: []
      }
    });
    updateData('components', updatedComponents);
  };

  const updateActiveIngredient = (index, field, value) => {
    const updatedComponents = [...data.components];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedComponents[0].activeIngredients[index][parent][child] = value;
    } else {
      updatedComponents[0].activeIngredients[index][field] = value;
    }
    updateData('components', updatedComponents);
  };

  const removeActiveIngredient = (index) => {
    const updatedComponents = [...data.components];
    updatedComponents[0].activeIngredients.splice(index, 1);
    updateData('components', updatedComponents);
  };

  const addExcipient = () => {
    const updatedComponents = [...data.components];
    updatedComponents[0].excipients.push({
      name: '',
      function: '',
      supplierInfo: {
        supplierName: '',
        supplierAddress: ''
      }
    });
    updateData('components', updatedComponents);
  };

  const updateExcipient = (index, field, value) => {
    const updatedComponents = [...data.components];
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      updatedComponents[0].excipients[index][parent][child] = value;
    } else {
      updatedComponents[0].excipients[index][field] = value;
    }
    updateData('components', updatedComponents);
  };

  const removeExcipient = (index) => {
    const updatedComponents = [...data.components];
    updatedComponents[0].excipients.splice(index, 1);
    updateData('components', updatedComponents);
  };

  const addEquivalentTo = (ingredientIndex) => {
    const updatedComponents = [...data.components];
    updatedComponents[0].activeIngredients[ingredientIndex].equivalentTo = {
      substance: '',
      value: 0,
      unit: 'mg'
    };
    updateData('components', updatedComponents);
  };

  const removeEquivalentTo = (ingredientIndex) => {
    const updatedComponents = [...data.components];
    updatedComponents[0].activeIngredients[ingredientIndex].equivalentTo = null;
    updateData('components', updatedComponents);
  };

  const isFormValid = () => {
    const activeIngredients = data.components[0].activeIngredients;
    return activeIngredients.length > 0 && 
           activeIngredients.every(ing => 
             ing.name && ing.name.trim() && 
             ing.commonName && ing.commonName.trim() && 
             ing.quantity && ing.quantity.value > 0 &&
             ing.supplierInfo && ing.supplierInfo.supplierName && ing.supplierInfo.supplierName.trim()
           );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Ingredients & Suppliers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Provide detailed information about all active ingredients and excipients, including supplier details for traceability
      </Typography>

      {/* Active Ingredients Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Active Ingredients
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addActiveIngredient}
          >
            Add Ingredient
          </Button>
        </Box>

        {data.components[0].activeIngredients.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Add at least one active ingredient to continue
          </Alert>
        )}

        {data.components[0].activeIngredients.map((ingredient, index) => (
          <Accordion 
            key={index} 
            expanded={expandedIngredient === index}
            onChange={() => setExpandedIngredient(expandedIngredient === index ? false : index)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ flexGrow: 1 }}>
                  {ingredient.commonName || ingredient.name || `Ingredient ${index + 1}`}
                  {ingredient.quantity.value > 0 && (
                    <Typography component="span" color="text.secondary" sx={{ ml: 1 }}>
                      ({ingredient.quantity.value} {ingredient.quantity.unit})
                    </Typography>
                  )}
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removeActiveIngredient(index);
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
                {/* Basic Ingredient Info */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Scientific/Chemical Name *"
                    value={ingredient.name}
                    onChange={(e) => updateActiveIngredient(index, 'name', e.target.value)}
                    helperText="Full botanical or chemical name"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Common Name *"
                    value={ingredient.commonName}
                    onChange={(e) => updateActiveIngredient(index, 'commonName', e.target.value)}
                    helperText="Name commonly known by consumers"
                  />
                </Grid>

                {/* Quantity */}
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Quantity *"
                    type="number"
                    value={ingredient.quantity.value}
                    onChange={(e) => updateActiveIngredient(index, 'quantity.value', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={12} md={2}>
                  <FormControl fullWidth>
                    <InputLabel>Unit</InputLabel>
                    <Select
                      value={ingredient.quantity.unit}
                      onChange={(e) => updateActiveIngredient(index, 'quantity.unit', e.target.value)}
                      label="Unit"
                    >
                      <MenuItem value="mg">mg</MenuItem>
                      <MenuItem value="mcg">mcg</MenuItem>
                      <MenuItem value="g">g</MenuItem>
                      <MenuItem value="IU">IU</MenuItem>
                      <MenuItem value="ml">ml</MenuItem>
                      <MenuItem value="%">%</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                {/* Equivalent To */}
                <Grid item xs={12} md={6}>
                  {ingredient.equivalentTo ? (
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                        <Typography variant="subtitle2">Equivalent To:</Typography>
                        <Button
                          size="small"
                          color="error"
                          onClick={() => removeEquivalentTo(index)}
                          sx={{ ml: 1 }}
                        >
                          Remove
                        </Button>
                      </Box>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Substance"
                            value={ingredient.equivalentTo.substance}
                            onChange={(e) => {
                              const updatedComponents = [...data.components];
                              updatedComponents[0].activeIngredients[index].equivalentTo.substance = e.target.value;
                              updateData('components', updatedComponents);
                            }}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <TextField
                            fullWidth
                            size="small"
                            label="Value"
                            type="number"
                            value={ingredient.equivalentTo.value}
                            onChange={(e) => {
                              const updatedComponents = [...data.components];
                              updatedComponents[0].activeIngredients[index].equivalentTo.value = parseFloat(e.target.value) || 0;
                              updateData('components', updatedComponents);
                            }}
                          />
                        </Grid>
                        <Grid item xs={3}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Unit</InputLabel>
                            <Select
                              value={ingredient.equivalentTo.unit}
                              onChange={(e) => {
                                const updatedComponents = [...data.components];
                                updatedComponents[0].activeIngredients[index].equivalentTo.unit = e.target.value;
                                updateData('components', updatedComponents);
                              }}
                              label="Unit"
                            >
                              <MenuItem value="mg">mg</MenuItem>
                              <MenuItem value="mcg">mcg</MenuItem>
                              <MenuItem value="g">g</MenuItem>
                              <MenuItem value="IU">IU</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Box>
                  ) : (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => addEquivalentTo(index)}
                    >
                      Add Equivalent To
                    </Button>
                  )}
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" gutterBottom>
                    Supplier Information
                  </Typography>
                </Grid>

                {/* Supplier Info */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Supplier Name *"
                    value={ingredient.supplierInfo?.supplierName || ''}
                    onChange={(e) => {
                      const updatedComponents = [...data.components];
                      if (!updatedComponents[0].activeIngredients[index].supplierInfo) {
                        updatedComponents[0].activeIngredients[index].supplierInfo = {};
                      }
                      updatedComponents[0].activeIngredients[index].supplierInfo.supplierName = e.target.value;
                      updateData('components', updatedComponents);
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Factory Name"
                    value={ingredient.supplierInfo?.factoryName || ''}
                    onChange={(e) => {
                      const updatedComponents = [...data.components];
                      if (!updatedComponents[0].activeIngredients[index].supplierInfo) {
                        updatedComponents[0].activeIngredients[index].supplierInfo = {};
                      }
                      updatedComponents[0].activeIngredients[index].supplierInfo.factoryName = e.target.value;
                      updateData('components', updatedComponents);
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Supplier Address"
                    multiline
                    rows={2}
                    value={ingredient.supplierInfo?.supplierAddress || ''}
                    onChange={(e) => {
                      const updatedComponents = [...data.components];
                      if (!updatedComponents[0].activeIngredients[index].supplierInfo) {
                        updatedComponents[0].activeIngredients[index].supplierInfo = {};
                      }
                      updatedComponents[0].activeIngredients[index].supplierInfo.supplierAddress = e.target.value;
                      updateData('components', updatedComponents);
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Factory Address"
                    multiline
                    rows={2}
                    value={ingredient.supplierInfo?.factoryAddress || ''}
                    onChange={(e) => {
                      const updatedComponents = [...data.components];
                      if (!updatedComponents[0].activeIngredients[index].supplierInfo) {
                        updatedComponents[0].activeIngredients[index].supplierInfo = {};
                      }
                      updatedComponents[0].activeIngredients[index].supplierInfo.factoryAddress = e.target.value;
                      updateData('components', updatedComponents);
                    }}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Excipients Section */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            Excipients (Other Ingredients)
          </Typography>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addExcipient}
          >
            Add Excipient
          </Button>
        </Box>

        {data.components[0].excipients.length === 0 && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Add excipients (inactive ingredients) if applicable
          </Alert>
        )}

        {data.components[0].excipients.map((excipient, index) => (
          <Accordion 
            key={index}
            expanded={expandedExcipient === index}
            onChange={() => setExpandedExcipient(expandedExcipient === index ? false : index)}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography sx={{ flexGrow: 1 }}>
                  {excipient.name || `Excipient ${index + 1}`}
                </Typography>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    removeExcipient(index);
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
                    label="Excipient Name *"
                    value={excipient.name}
                    onChange={(e) => updateExcipient(index, 'name', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Function"
                    value={excipient.function || ''}
                    onChange={(e) => updateExcipient(index, 'function', e.target.value)}
                    helperText="e.g., Binder, Filler, Coating agent"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Supplier Name"
                    value={excipient.supplierInfo?.supplierName || ''}
                    onChange={(e) => updateExcipient(index, 'supplierInfo.supplierName', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Supplier Address"
                    value={excipient.supplierInfo?.supplierAddress || ''}
                    onChange={(e) => updateExcipient(index, 'supplierInfo.supplierAddress', e.target.value)}
                  />
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          size="large"
        >
          Back: Basic Information
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!isFormValid()}
          size="large"
        >
          Next: Health Claims & Evidence
        </Button>
      </Box>
    </Box>
  );
};

export default IngredientsStep;