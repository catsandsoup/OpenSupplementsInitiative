const { validateSupplementData } = require('./validation/osi-schema');
const { generateOSIData, supplementProducts } = require('./database/osi-seed-data');

console.log('Testing OSI Validation System...\n');

// Test 1: Valid OSI data
console.log('Test 1: Valid OSI Data');
const validData = generateOSIData(supplementProducts[0]);
const validResult = validateSupplementData(validData);
console.log('Valid:', validResult.valid);
console.log('Errors:', validResult.errors.length);
console.log('');

// Test 2: Invalid OSI data (missing required field)
console.log('Test 2: Invalid OSI Data (missing required artgEntry)');
const invalidData = { ...validData };
delete invalidData.artgEntry;
const invalidResult = validateSupplementData(invalidData);
console.log('Valid:', invalidResult.valid);
console.log('Errors:', invalidResult.errors.length);
if (invalidResult.errors.length > 0) {
  console.log('First error:', invalidResult.errors[0]);
}
console.log('');

// Test 3: Invalid business rules (no active ingredients)
console.log('Test 3: Invalid Business Rules (no active ingredients)');
const noIngredientsData = { ...validData };
noIngredientsData.components[0].activeIngredients = [];
const businessRuleResult = validateSupplementData(noIngredientsData);
console.log('Valid:', businessRuleResult.valid);
console.log('Errors:', businessRuleResult.errors.length);
if (businessRuleResult.errors.length > 0) {
  console.log('First error:', businessRuleResult.errors[0]);
}
console.log('');

console.log('Validation testing complete!');