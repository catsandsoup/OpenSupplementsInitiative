// Frontend OSI validation utilities

// Basic form field validation
export const validateRequiredField = (value, fieldName) => {
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return `${fieldName} is required`;
  }
  return null;
};

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// Date validation
export const validateDate = (dateString, fieldName) => {
  if (!dateString) {
    return `${fieldName} is required`;
  }
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  
  return null;
};

// ARTG number validation (Australian format)
export const validateARTGNumber = (artgNumber) => {
  if (!artgNumber) {
    return 'ARTG number is required';
  }
  
  // Basic ARTG format validation (AUST L XXXXXX or AUST R XXXXXX)
  const artgRegex = /^AUST [LR] \d{6}$/;
  if (!artgRegex.test(artgNumber)) {
    return 'ARTG number must be in format "AUST L 123456" or "AUST R 123456"';
  }
  
  return null;
};

// Ingredient quantity validation
export const validateQuantity = (quantity, ingredientName) => {
  if (!quantity) {
    return `Quantity is required for ${ingredientName}`;
  }
  
  // Basic quantity format validation (number + unit)
  const quantityRegex = /^\d+(\.\d+)?\s*(mg|g|mcg|μg|IU|mL|L)$/i;
  if (!quantityRegex.test(quantity)) {
    return `Quantity for ${ingredientName} must include a number and unit (e.g., "500 mg", "1.5 g")`;
  }
  
  return null;
};

// Validate array has at least one item
export const validateArrayNotEmpty = (array, fieldName) => {
  if (!array || !Array.isArray(array) || array.length === 0) {
    return `At least one ${fieldName} is required`;
  }
  return null;
};

// Validate OSI data structure on frontend (basic checks)
export const validateOSIStructure = (osiData) => {
  const errors = [];
  
  // Check required top-level fields
  const requiredFields = [
    'artgEntry',
    'products',
    'permittedIndications',
    'warnings',
    'dosageInformation',
    'allergenInformation',
    'components',
    'documentInformation'
  ];
  
  requiredFields.forEach(field => {
    if (!osiData[field]) {
      errors.push(`${field} is required`);
    }
  });
  
  // Check artgEntry required fields
  if (osiData.artgEntry) {
    const artgRequired = ['artgNumber', 'productName', 'sponsor', 'status'];
    artgRequired.forEach(field => {
      if (!osiData.artgEntry[field]) {
        errors.push(`artgEntry.${field} is required`);
      }
    });
  }
  
  // Check components have active ingredients
  if (osiData.components && Array.isArray(osiData.components)) {
    const hasActiveIngredients = osiData.components.some(component => 
      component.activeIngredients && component.activeIngredients.length > 0
    );
    
    if (!hasActiveIngredients) {
      errors.push('At least one active ingredient is required');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Format validation errors for display
export const formatValidationErrors = (errors) => {
  if (!errors || errors.length === 0) {
    return [];
  }
  
  return errors.map(error => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error.field && error.message) {
      return `${error.field}: ${error.message}`;
    }
    
    return error.message || 'Unknown validation error';
  });
};

// Create empty OSI data structure for forms
export const createEmptyOSIData = () => {
  return {
    artgEntry: {
      artgNumber: '',
      productName: '',
      type: 'Medicine Listed',
      sponsor: '',
      postalAddress: '',
      artgStartDate: '',
      productCategory: 'Medicine',
      status: 'Active',
      approvalArea: 'Listed Medicines'
    },
    conditions: [],
    products: [{
      productName: '',
      productType: 'Single Medicine Product',
      effectiveDate: ''
    }],
    permittedIndications: [{
      text: '',
      evidenceNotes: ''
    }],
    indicationRequirements: [],
    standardIndications: 'No Standard Indications included on Record',
    specificIndications: 'No Specific Indications included on Record',
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
        poisonSchedule: null
      }
    },
    components: [{
      formulation: 'Main Formulation',
      dosageForm: '',
      routeOfAdministration: 'Oral',
      visualIdentification: '',
      activeIngredients: [{
        name: '',
        commonName: '',
        quantity: '',
        equivalentTo: null
      }],
      excipients: [{
        name: ''
      }]
    }],
    documentInformation: {
      dataEntrySource: '',
      dataEntryDate: new Date().toISOString().split('T')[0],
      version: '0.2',
      notes: ''
    }
  };
};