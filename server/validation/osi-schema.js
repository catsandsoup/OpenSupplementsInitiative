const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// Create AJV instance
const ajv = new Ajv({ allErrors: true });
addFormats(ajv);

// OSI v0.2 JSON Schema based on the template
const osiSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "artgEntry": {
      "type": "object",
      "description": "Details related to regulatory listings",
      "properties": {
        "artgNumber": { "type": "string", "description": "The unique ARTG number or regulatory identifier" },
        "productName": { "type": "string", "description": "The official name of the product" },
        "type": { "type": "string", "description": "The type of entry, e.g., 'Medicine Listed'" },
        "sponsor": { "type": "string", "description": "The name of the sponsor company" },
        "postalAddress": { "type": "string", "description": "The official postal address of the sponsor" },
        "artgStartDate": { "type": "string", "format": "date", "description": "Date when product was first registered" },
        "productCategory": { "type": "string", "description": "The category assigned to the product" },
        "status": { "type": "string", "description": "Current regulatory status" },
        "approvalArea": { "type": "string", "description": "The specific area of approval or listing" }
      },
      "required": ["artgNumber", "productName", "sponsor", "status"],
      "additionalProperties": false
    },
    "conditions": {
      "type": "array",
      "description": "Any specific conditions of listing or sale",
      "items": { "type": "string" }
    },
    "products": {
      "type": "array",
      "description": "Basic product identification details",
      "items": {
        "type": "object",
        "properties": {
          "productName": { "type": "string", "description": "Product name" },
          "productType": { "type": "string", "description": "e.g., Single Medicine Product" },
          "effectiveDate": { "type": "string", "format": "date", "description": "Effective date" }
        },
        "required": ["productName", "productType"],
        "additionalProperties": false
      }
    },
    "permittedIndications": {
      "type": "array",
      "description": "Approved or stated uses/health claims",
      "items": {
        "type": "object",
        "properties": {
          "text": { "type": "string", "description": "The text of the indication or health claim" },
          "evidenceNotes": { "type": "string", "description": "Notes on evidence for this indication" }
        },
        "required": ["text"],
        "additionalProperties": false
      }
    },
    "indicationRequirements": {
      "type": "array",
      "description": "Mandatory statements or conditions related to indications",
      "items": { "type": "string" }
    },
    "standardIndications": { "type": "string", "description": "Standard indications text" },
    "specificIndications": { "type": "string", "description": "Specific indications text" },
    "warnings": {
      "type": "array",
      "description": "Safety warnings and advisories",
      "items": { "type": "string" }
    },
    "dosageInformation": {
      "type": "object",
      "description": "Recommended dosages and usage instructions",
      "properties": {
        "adults": { "type": "string", "description": "Dosage instructions for adults" },
        "children": { "type": "string", "description": "Dosage instructions for children" },
        "generalNotes": { "type": "string", "description": "General notes about dosage" }
      },
      "additionalProperties": false
    },
    "allergenInformation": {
      "type": "object",
      "description": "Information regarding allergens",
      "properties": {
        "containsAllergens": { "type": "array", "items": { "type": "string" } },
        "freeOfClaims": { "type": "array", "items": { "type": "string" } },
        "allergenStatement": { "type": "string" },
        "crossContaminationRisk": { "type": ["boolean", "null"] }
      },
      "additionalProperties": false
    },
    "additionalProductInformation": {
      "type": "object",
      "description": "Other product-specific details",
      "properties": {
        "packSizeInformation": {
          "type": "object",
          "properties": {
            "packSize": { "type": ["string", "null"] },
            "poisonSchedule": { "type": ["string", "null"] }
          },
          "additionalProperties": false
        }
      },
      "additionalProperties": false
    },
    "components": {
      "type": "array",
      "description": "Details of the product's formulation(s)",
      "items": {
        "type": "object",
        "properties": {
          "formulation": { "type": "string", "description": "Identifier for the formulation" },
          "dosageForm": { "type": "string", "description": "The physical form of the supplement" },
          "routeOfAdministration": { "type": "string", "description": "How the supplement is administered" },
          "visualIdentification": { "type": ["string", "null"], "description": "Physical description" },
          "activeIngredients": {
            "type": "array",
            "description": "List of active ingredients",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string", "description": "Full chemical or botanical name" },
                "commonName": { "type": "string", "description": "Commonly known name" },
                "quantity": { "type": "string", "description": "Amount of the ingredient" },
                "equivalentTo": { "type": ["string", "null"], "description": "Equivalent amount if applicable" }
              },
              "required": ["name", "commonName", "quantity"],
              "additionalProperties": false
            }
          },
          "excipients": {
            "type": "array",
            "description": "List of other ingredients",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string", "description": "Name of the excipient" }
              },
              "required": ["name"],
              "additionalProperties": false
            }
          }
        },
        "required": ["formulation", "dosageForm", "activeIngredients", "excipients"],
        "additionalProperties": false
      }
    },
    "documentInformation": {
      "type": "object",
      "description": "Metadata about this data entry",
      "properties": {
        "dataEntrySource": { "type": "string", "description": "Origin of the data" },
        "dataEntryDate": { "type": "string", "format": "date", "description": "Date this data was created" },
        "version": { "type": "string", "description": "Version of the OSI format" },
        "notes": { "type": "string", "description": "Specific notes about this data entry" }
      },
      "required": ["dataEntrySource", "dataEntryDate", "version"],
      "additionalProperties": false
    }
  },
  "required": [
    "artgEntry",
    "products",
    "permittedIndications",
    "warnings",
    "dosageInformation",
    "allergenInformation",
    "components",
    "documentInformation"
  ],
  "additionalProperties": false
};

// Compile the schema
const validateOSI = ajv.compile(osiSchema);

// Validation function
const validateOSIData = (data) => {
  const valid = validateOSI(data);
  
  if (!valid) {
    const errors = validateOSI.errors.map(error => ({
      field: error.instancePath || error.schemaPath,
      message: error.message,
      value: error.data
    }));
    
    return {
      valid: false,
      errors
    };
  }
  
  return {
    valid: true,
    errors: []
  };
};

// Additional business logic validation
const validateBusinessRules = (data) => {
  const errors = [];
  
  // Check that at least one active ingredient exists
  if (data.components && data.components.length > 0) {
    const hasActiveIngredients = data.components.some(component => 
      component.activeIngredients && component.activeIngredients.length > 0
    );
    
    if (!hasActiveIngredients) {
      errors.push({
        field: 'components.activeIngredients',
        message: 'At least one active ingredient is required',
        value: null
      });
    }
  }
  
  // Check that product name matches between artgEntry and products
  if (data.artgEntry && data.products && data.products.length > 0) {
    const artgProductName = data.artgEntry.productName;
    const productNames = data.products.map(p => p.productName);
    
    if (!productNames.includes(artgProductName)) {
      errors.push({
        field: 'products.productName',
        message: 'Product name in products array should match artgEntry.productName',
        value: productNames
      });
    }
  }
  
  // Validate date formats and logic
  if (data.artgEntry && data.artgEntry.artgStartDate) {
    const startDate = new Date(data.artgEntry.artgStartDate);
    const today = new Date();
    
    if (startDate > today) {
      errors.push({
        field: 'artgEntry.artgStartDate',
        message: 'ARTG start date cannot be in the future',
        value: data.artgEntry.artgStartDate
      });
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// Combined validation function with draft mode support
const validateSupplementData = (data, isDraft = false) => {
  if (isDraft) {
    // For drafts, only validate basic structure and required fields that are present
    return validateDraftData(data);
  }
  
  // First validate against JSON schema
  const schemaValidation = validateOSIData(data);
  
  if (!schemaValidation.valid) {
    return schemaValidation;
  }
  
  // Then validate business rules
  const businessValidation = validateBusinessRules(data);
  
  return businessValidation;
};

// Lenient validation for draft submissions
const validateDraftData = (data) => {
  const errors = [];
  
  // Only check for basic structure
  if (!data || typeof data !== 'object') {
    errors.push({
      field: 'root',
      message: 'Data must be an object',
      value: data
    });
    return { valid: false, errors };
  }
  
  // Check for basic required sections (but allow them to be incomplete)
  const requiredSections = ['artgEntry', 'products', 'components'];
  
  for (const section of requiredSections) {
    if (!data[section]) {
      errors.push({
        field: section,
        message: `${section} section is required`,
        value: null
      });
    }
  }
  
  // If artgEntry exists, check for product name
  if (data.artgEntry && !data.artgEntry.productName) {
    errors.push({
      field: 'artgEntry.productName',
      message: 'Product name is required',
      value: null
    });
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

module.exports = {
  osiSchema,
  validateOSIData,
  validateBusinessRules,
  validateSupplementData,
  validateDraftData
};