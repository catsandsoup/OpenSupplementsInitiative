/**
 * Utility functions for normalizing OSI data structures
 */

/**
 * Normalizes warnings data to prevent React child object errors
 * Handles both string warnings and structured warning objects
 * @param {Object} osiData - The OSI data object
 * @returns {Object} - The normalized OSI data object
 */
function normalizeWarningsData(osiData) {
  if (!osiData) return osiData;

  // Create a deep copy to avoid mutating the original data
  const normalizedData = JSON.parse(JSON.stringify(osiData));

  // Normalize warnings array
  if (normalizedData.warnings && Array.isArray(normalizedData.warnings)) {
    normalizedData.warnings = normalizedData.warnings.map(warning => {
      if (typeof warning === 'string') {
        return warning;
      } else if (warning && typeof warning === 'object') {
        return warning.text || warning.warning || 'Warning information not available';
      }
      return 'Warning information not available';
    });
  }

  // Handle structuredWarnings if they exist
  if (normalizedData.structuredWarnings && Array.isArray(normalizedData.structuredWarnings)) {
    // If we have structured warnings but no regular warnings, convert them
    if (!normalizedData.warnings || normalizedData.warnings.length === 0) {
      normalizedData.warnings = normalizedData.structuredWarnings.map(warning => {
        if (typeof warning === 'string') {
          return warning;
        } else if (warning && typeof warning === 'object') {
          return warning.text || warning.warning || 'Warning information not available';
        }
        return 'Warning information not available';
      });
    }
    
    // Keep structuredWarnings for frontend components that can handle the full object structure
    // but ensure they're properly structured
    normalizedData.structuredWarnings = normalizedData.structuredWarnings.map(warning => {
      if (typeof warning === 'string') {
        return { text: warning, type: 'General', source: 'Unknown' };
      } else if (warning && typeof warning === 'object') {
        return {
          text: warning.text || warning.warning || 'Warning information not available',
          type: warning.type || 'General',
          source: warning.source || 'Unknown'
        };
      }
      return { text: 'Warning information not available', type: 'General', source: 'Unknown' };
    });
  }

  // Normalize other potential object arrays that could cause React child errors
  if (normalizedData.permittedIndications && Array.isArray(normalizedData.permittedIndications)) {
    normalizedData.permittedIndications = normalizedData.permittedIndications.map(indication => {
      if (typeof indication === 'string') {
        return { text: indication, evidenceNotes: null };
      } else if (indication && typeof indication === 'object') {
        return {
          text: indication.text || indication.indication || 'Indication not available',
          evidenceNotes: indication.evidenceNotes || indication.evidence || null
        };
      }
      return { text: 'Indication not available', evidenceNotes: null };
    });
  }

  return normalizedData;
}

/**
 * Normalizes supplement data for frontend consumption
 * @param {Object} supplement - The supplement object from database
 * @returns {Object} - The normalized supplement object
 */
function normalizeSupplementData(supplement) {
  if (!supplement) return supplement;

  if (supplement.osi_data) {
    supplement.osi_data = normalizeWarningsData(supplement.osi_data);
  }

  return supplement;
}

/**
 * Normalizes an array of supplements for frontend consumption
 * @param {Array} supplements - Array of supplement objects from database
 * @returns {Array} - Array of normalized supplement objects
 */
function normalizeSupplementsArray(supplements) {
  if (!Array.isArray(supplements)) return supplements;

  return supplements.map(supplement => normalizeSupplementData(supplement));
}

module.exports = {
  normalizeWarningsData,
  normalizeSupplementData,
  normalizeSupplementsArray
};