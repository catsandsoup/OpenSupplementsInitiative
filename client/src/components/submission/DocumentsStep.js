import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  LinearProgress,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Divider
} from '@mui/material';
import {
  CloudUpload as UploadIcon,
  Delete as DeleteIcon,
  InsertDriveFile as FileIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Visibility as PreviewIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';

const DocumentsStep = ({ data, updateData, onNext, onBack }) => {
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const fileInputRef = useRef(null);

  // Document categories for organization
  const documentCategories = [
    { value: 'lab_test', label: 'Laboratory Test Results' },
    { value: 'factory_cert', label: 'Factory Certifications (GMP, ISO)' },
    { value: 'regulatory_approval', label: 'Regulatory Approvals' },
    { value: 'scientific_study', label: 'Scientific Studies' },
    { value: 'coa', label: 'Certificate of Analysis' },
    { value: 'safety_data', label: 'Safety Data Sheets' },
    { value: 'stability_study', label: 'Stability Studies' },
    { value: 'other', label: 'Other Supporting Documents' }
  ];

  // Initialize documents array if not exists
  const documents = data.supportingDocuments || [];

  const handleFileUpload = async (files, category) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      const fileId = `${Date.now()}_${file.name}`;
      
      try {
        setUploadProgress(prev => ({ ...prev, [fileId]: 0 }));
        
        const formData = new FormData();
        formData.append('file', file);
        formData.append('category', category);
        formData.append('supplementId', data.id || 'new');

        const response = await fetch('/api/documents/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (response.ok) {
          const result = await response.json();
          
          const newDocument = {
            id: result.id,
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            category: category,
            uploadedAt: new Date().toISOString(),
            status: 'uploaded',
            url: result.url,
            description: '',
            linkedTo: [] // Can link to specific ingredients or claims
          };

          const updatedDocuments = [...documents, newDocument];
          updateData('supportingDocuments', updatedDocuments);
          
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileId];
            return newProgress;
          });
        } else {
          throw new Error('Upload failed');
        }
      } catch (error) {
        setUploadErrors(prev => ({ ...prev, [fileId]: error.message }));
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[fileId];
          return newProgress;
        });
      }
    }
  };

  const removeDocument = (index) => {
    const updatedDocuments = documents.filter((_, i) => i !== index);
    updateData('supportingDocuments', updatedDocuments);
  };

  const handlePreviewDocument = (doc) => {
    if (doc.fileType === 'application/pdf' || doc.fileType.startsWith('image/')) {
      // Open in new tab for preview
      window.open(doc.url, '_blank');
    } else {
      // For other file types, trigger download
      handleDownloadDocument(doc);
    }
  };

  const handleDownloadDocument = (doc) => {
    // Create a temporary link to trigger download
    const link = document.createElement('a');
    link.href = doc.url;
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const linkDocumentToIngredient = (docIndex, ingredientName) => {
    const updatedDocuments = [...documents];
    if (!updatedDocuments[docIndex].linkedTo) {
      updatedDocuments[docIndex].linkedTo = [];
    }
    if (!updatedDocuments[docIndex].linkedTo.includes(ingredientName)) {
      updatedDocuments[docIndex].linkedTo.push(ingredientName);
    }
    updateData('supportingDocuments', updatedDocuments);
  };

  const unlinkDocumentFromItem = (docIndex, itemName) => {
    const updatedDocuments = [...documents];
    if (updatedDocuments[docIndex].linkedTo) {
      updatedDocuments[docIndex].linkedTo = updatedDocuments[docIndex].linkedTo.filter(
        item => item !== itemName
      );
    }
    updateData('supportingDocuments', updatedDocuments);
  };

  const downloadMockTemplate = (templateType) => {
    // Create mock document templates for demo purposes
    const templates = {
      lab_test: {
        name: 'Lab_Test_Results_Template.pdf',
        content: generateMockLabTest()
      },
      gmp_cert: {
        name: 'GMP_Certificate_Template.pdf',
        content: generateMockGMPCert()
      },
      coa: {
        name: 'Certificate_of_Analysis_Template.pdf',
        content: generateMockCOA()
      }
    };

    const template = templates[templateType];
    if (template) {
      // Create a blob with the mock content
      const blob = new Blob([template.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create download link
      const link = document.createElement('a');
      link.href = url;
      link.download = template.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    }
  };

  const generateMockLabTest = () => {
    return `LABORATORY TEST RESULTS - TEMPLATE
========================================

Laboratory: Accredited Testing Labs Inc.
Address: 123 Science Drive, Test City, TC 12345
Phone: (555) 123-4567
Accreditation: ISO/IEC 17025:2017

SAMPLE INFORMATION
------------------
Product Name: [Your Product Name]
Batch/Lot Number: [Batch Number]
Sample Received: [Date]
Testing Period: [Date Range]
Report Date: [Date]

TESTS PERFORMED
---------------
1. IDENTITY TESTING
   - HPLC Analysis: PASS
   - UV Spectroscopy: PASS
   - Result: Confirmed identity of active ingredients

2. PURITY TESTING
   - Heavy Metals (Lead, Mercury, Cadmium, Arsenic): < 0.1 ppm
   - Microbial Testing: < 10 CFU/g
   - Pesticide Residues: Not Detected

3. POTENCY TESTING
   - Active Ingredient A: 98.5% (Spec: 95-105%)
   - Active Ingredient B: 101.2% (Spec: 95-105%)

CONCLUSION
----------
The sample meets all specified requirements for identity, purity, and potency.

Authorized Signatory: Dr. Jane Smith, PhD
Laboratory Director
Date: [Date]

Note: This is a template for demonstration purposes only.`;
  };

  const generateMockGMPCert = () => {
    return `GOOD MANUFACTURING PRACTICE CERTIFICATE - TEMPLATE
==================================================

Certificate Number: GMP-2024-001
Issue Date: [Date]
Expiry Date: [Date + 3 years]

FACILITY INFORMATION
--------------------
Company Name: [Your Company Name]
Facility Address: [Manufacturing Address]
Contact Person: [Name, Title]
Phone: [Phone Number]

CERTIFICATION DETAILS
----------------------
This certificate confirms that the above facility has been inspected and found to comply with:
- Good Manufacturing Practice (GMP) standards
- ISO 22000:2018 Food Safety Management
- HACCP principles

SCOPE OF CERTIFICATION
----------------------
- Manufacturing of dietary supplements
- Packaging and labeling operations
- Quality control testing
- Storage and distribution

INSPECTION DETAILS
------------------
Inspection Date: [Date]
Inspector: [Name], Certified GMP Auditor
Next Inspection Due: [Date]

COMPLIANCE AREAS VERIFIED
-------------------------
✓ Personnel training and hygiene
✓ Facility design and maintenance
✓ Equipment calibration and maintenance
✓ Raw material control
✓ Production process controls
✓ Quality control procedures
✓ Documentation and record keeping
✓ Complaint handling procedures

Issued by: GMP Certification Body
Authorized Signatory: [Name]
Date: [Date]

Note: This is a template for demonstration purposes only.`;
  };

  const generateMockCOA = () => {
    return `CERTIFICATE OF ANALYSIS - TEMPLATE
===================================

Product: [Product Name]
Batch/Lot Number: [Batch Number]
Manufacturing Date: [Date]
Expiry Date: [Date]
Quantity Manufactured: [Quantity]

RAW MATERIAL ANALYSIS
---------------------
Ingredient A:
- Supplier: [Supplier Name]
- Lot Number: [Lot Number]
- Assay: 99.2% (Spec: ≥98%)
- Heavy Metals: <0.1 ppm
- Microbiological: Pass

Ingredient B:
- Supplier: [Supplier Name]
- Lot Number: [Lot Number]
- Assay: 100.8% (Spec: 98-102%)
- Moisture: 2.1% (Spec: ≤5%)
- Microbiological: Pass

FINISHED PRODUCT TESTING
------------------------
Physical Tests:
- Appearance: White to off-white tablets
- Weight: 500mg ± 5%
- Hardness: 8.5 kp (Spec: 6-12 kp)
- Disintegration: 12 minutes (Spec: ≤15 min)

Chemical Tests:
- Active Ingredient A: 248mg (Spec: 240-260mg)
- Active Ingredient B: 52mg (Spec: 50-55mg)
- Total Plate Count: <10 CFU/g
- Yeast & Mold: <10 CFU/g

STABILITY DATA
--------------
Storage Conditions: 25°C/60% RH
- 0 months: 100.0%
- 6 months: 99.8%
- 12 months: 99.2%
- 18 months: 98.9%

CONCLUSION
----------
This batch meets all specifications and is approved for release.

Quality Control Manager: [Name]
Date: [Date]
Signature: [Signature]

Note: This is a template for demonstration purposes only.`;
  };

  const updateDocumentDescription = (index, description) => {
    const updatedDocuments = [...documents];
    updatedDocuments[index].description = description;
    updateData('supportingDocuments', updatedDocuments);
  };

  const getDocumentsByCategory = (category) => {
    return documents.filter(doc => doc.category === category);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getRequiredDocuments = () => {
    return [
      {
        category: 'lab_test',
        title: 'Laboratory Test Results',
        description: 'Third-party lab tests for identity, purity, and potency of active ingredients',
        required: true
      },
      {
        category: 'factory_cert',
        title: 'Manufacturing Certifications',
        description: 'GMP certificates, facility licenses, and quality system certifications',
        required: true
      },
      {
        category: 'coa',
        title: 'Certificate of Analysis',
        description: 'COA for each batch of raw materials and finished product',
        required: true
      },
      {
        category: 'scientific_study',
        title: 'Scientific Evidence',
        description: 'Published studies supporting health claims (if applicable)',
        required: false
      }
    ];
  };

  const isFormValid = () => {
    const requiredDocs = getRequiredDocuments().filter(doc => doc.required);
    return requiredDocs.every(reqDoc => 
      getDocumentsByCategory(reqDoc.category).length > 0
    );
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Supporting Documents
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Upload all required supporting documents to verify your product claims and manufacturing quality
      </Typography>

      {/* Document Requirements Overview */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Document Requirements
        </Typography>
        
        <Grid container spacing={2}>
          {getRequiredDocuments().map((reqDoc) => {
            const uploadedDocs = getDocumentsByCategory(reqDoc.category);
            const isComplete = uploadedDocs.length > 0;
            
            return (
              <Grid item xs={12} md={6} key={reqDoc.category}>
                <Box sx={{ 
                  p: 2, 
                  border: 1, 
                  borderColor: isComplete ? 'success.main' : reqDoc.required ? 'error.main' : 'grey.300',
                  borderRadius: 1,
                  bgcolor: isComplete ? 'success.light' : 'background.paper'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {isComplete ? (
                      <CheckIcon color="success" sx={{ mr: 1 }} />
                    ) : reqDoc.required ? (
                      <ErrorIcon color="error" sx={{ mr: 1 }} />
                    ) : (
                      <FileIcon color="action" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="subtitle1">
                      {reqDoc.title}
                      {reqDoc.required && <Chip label="Required" size="small" color="error" sx={{ ml: 1 }} />}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {reqDoc.description}
                  </Typography>
                  <Typography variant="caption" color={isComplete ? 'success.main' : 'text.secondary'}>
                    {uploadedDocs.length} document{uploadedDocs.length !== 1 ? 's' : ''} uploaded
                  </Typography>
                </Box>
              </Grid>
            );
          })}
        </Grid>
      </Paper>

      {/* Document Upload Sections */}
      {documentCategories.map((category) => (
        <Paper key={category.value} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              {category.label}
            </Typography>
            <Button
              variant="outlined"
              startIcon={<UploadIcon />}
              onClick={() => {
                fileInputRef.current.click();
                fileInputRef.current.onchange = (e) => {
                  if (e.target.files.length > 0) {
                    handleFileUpload(e.target.files, category.value);
                  }
                };
              }}
            >
              Upload Files
            </Button>
          </Box>

          {/* Uploaded Documents List */}
          <List>
            {getDocumentsByCategory(category.value).map((doc, index) => (
              <ListItem key={doc.id || index} divider>
                <FileIcon sx={{ mr: 2, color: 'primary.main' }} />
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body1">{doc.fileName}</Typography>
                      <Chip 
                        label={doc.status} 
                        size="small" 
                        color={doc.status === 'uploaded' ? 'success' : 'default'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(doc.fileSize)} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        label="Description (optional)"
                        value={doc.description}
                        onChange={(e) => updateDocumentDescription(
                          documents.findIndex(d => d.id === doc.id), 
                          e.target.value
                        )}
                        sx={{ mt: 1 }}
                        helperText="Describe what this document contains or proves"
                      />
                      {/* Document Linking */}
                      {doc.linkedTo && doc.linkedTo.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" color="text.secondary">
                            Linked to:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {doc.linkedTo.map((item, idx) => (
                              <Chip
                                key={idx}
                                label={item}
                                size="small"
                                variant="outlined"
                                onDelete={() => unlinkDocumentFromItem(documents.findIndex(d => d.id === doc.id), item)}
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <IconButton
                      color="primary"
                      onClick={() => handlePreviewDocument(doc)}
                      title="Preview/View Document"
                    >
                      <PreviewIcon />
                    </IconButton>
                    <IconButton
                      color="secondary"
                      onClick={() => handleDownloadDocument(doc)}
                      title="Download Document"
                    >
                      <DownloadIcon />
                    </IconButton>
                    <IconButton
                      color="error"
                      onClick={() => removeDocument(documents.findIndex(d => d.id === doc.id))}
                      title="Delete Document"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>

          {getDocumentsByCategory(category.value).length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No documents uploaded for this category yet
            </Alert>
          )}
        </Paper>
      ))}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Uploading Files...
          </Typography>
          {Object.entries(uploadProgress).map(([fileId, progress]) => (
            <Box key={fileId} sx={{ mb: 1 }}>
              <Typography variant="body2">{fileId.split('_').slice(1).join('_')}</Typography>
              <LinearProgress variant="determinate" value={progress} />
            </Box>
          ))}
        </Paper>
      )}

      {/* Upload Errors */}
      {Object.keys(uploadErrors).length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Upload Errors:</Typography>
          {Object.entries(uploadErrors).map(([fileId, error]) => (
            <Typography key={fileId} variant="body2">
              {fileId.split('_').slice(1).join('_')}: {error}
            </Typography>
          ))}
        </Alert>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        multiple
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx"
      />

      {/* Mock Document Templates */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'secondary.light' }}>
        <Typography variant="h6" gutterBottom>
          Document Templates (Demo)
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          Download these sample templates to understand the required document formats:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DownloadIcon />}
              onClick={() => downloadMockTemplate('lab_test')}
            >
              Lab Test Template
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DownloadIcon />}
              onClick={() => downloadMockTemplate('gmp_cert')}
            >
              GMP Certificate Template
            </Button>
          </Grid>
          <Grid item xs={12} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<DownloadIcon />}
              onClick={() => downloadMockTemplate('coa')}
            >
              COA Template
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Document Linking Interface */}
      {documents.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Link Documents to Ingredients/Claims
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Connect your documents to specific ingredients or health claims for better traceability
          </Typography>
          
          {documents.map((doc, docIndex) => (
            <Box key={doc.id} sx={{ mb: 3, p: 2, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>
                {doc.fileName}
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Link to Ingredient</InputLabel>
                    <Select
                      value=""
                      onChange={(e) => linkDocumentToIngredient(docIndex, e.target.value)}
                      label="Link to Ingredient"
                    >
                      {data.components?.[0]?.activeIngredients?.map((ingredient, idx) => (
                        <MenuItem key={idx} value={ingredient.commonName || ingredient.name}>
                          {ingredient.commonName || ingredient.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Link to Health Claim</InputLabel>
                    <Select
                      value=""
                      onChange={(e) => linkDocumentToIngredient(docIndex, `Claim: ${e.target.value}`)}
                      label="Link to Health Claim"
                    >
                      {data.permittedIndications?.map((claim, idx) => {
                        const claimText = typeof claim === 'string' ? claim : claim?.text || 'Health claim';
                        return (
                          <MenuItem key={idx} value={claimText}>
                            {claimText.substring(0, 50)}...
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              
              {doc.linkedTo && doc.linkedTo.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Currently linked to:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                    {doc.linkedTo.map((item, idx) => (
                      <Chip
                        key={idx}
                        label={item}
                        size="small"
                        variant="outlined"
                        color="primary"
                        onDelete={() => unlinkDocumentFromItem(docIndex, item)}
                      />
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ))}
        </Paper>
      )}

      {/* Document Guidelines */}
      <Paper sx={{ p: 3, mb: 3, bgcolor: 'info.light' }}>
        <Typography variant="h6" gutterBottom>
          Document Guidelines
        </Typography>
        <Typography variant="body2" component="div">
          <ul>
            <li>All documents must be in English or include certified translations</li>
            <li>Laboratory tests must be from accredited third-party laboratories</li>
            <li>Certificates must be current and not expired</li>
            <li>File formats accepted: PDF, DOC, DOCX, JPG, PNG, XLS, XLSX</li>
            <li>Maximum file size: 10MB per file</li>
            <li>Ensure all documents are clearly legible and complete</li>
          </ul>
        </Typography>
      </Paper>

      {/* Validation Summary */}
      {!isFormValid() && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="subtitle2">Missing Required Documents:</Typography>
          {getRequiredDocuments()
            .filter(reqDoc => reqDoc.required && getDocumentsByCategory(reqDoc.category).length === 0)
            .map(reqDoc => (
              <Typography key={reqDoc.category} variant="body2">
                • {reqDoc.title}
              </Typography>
            ))}
        </Alert>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          variant="outlined"
          onClick={onBack}
          size="large"
        >
          Back: Health Claims
        </Button>
        <Button
          variant="contained"
          onClick={onNext}
          disabled={!isFormValid()}
          size="large"
        >
          Next: Review & Submit
        </Button>
      </Box>
    </Box>
  );
};

export default DocumentsStep;