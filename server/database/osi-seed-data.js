// Enhanced OSI seed data with multiple realistic supplement examples

const generateOSIData = (productInfo) => {
  return {
    artgEntry: {
      artgNumber: productInfo.artgNumber,
      productName: productInfo.productName,
      type: "Medicine Listed",
      sponsor: productInfo.sponsor,
      postalAddress: productInfo.address,
      artgStartDate: productInfo.startDate,
      productCategory: "Medicine",
      status: "Active",
      approvalArea: "Listed Medicines"
    },
    conditions: [
      "For oral use only",
      "Store below 25°C in a cool, dry place"
    ],
    products: [{
      productName: productInfo.productName,
      productType: "Single Medicine Product",
      effectiveDate: productInfo.startDate
    }],
    permittedIndications: productInfo.indications,
    indicationRequirements: [
      "If symptoms persist, talk to your health professional",
      "Always read the label and follow the directions for use"
    ],
    standardIndications: "No Standard Indications included on Record",
    specificIndications: "No Specific Indications included on Record",
    warnings: productInfo.warnings,
    dosageInformation: productInfo.dosage,
    allergenInformation: productInfo.allergens,
    additionalProductInformation: {
      packSizeInformation: {
        packSize: productInfo.packSize,
        poisonSchedule: null
      }
    },
    components: [{
      formulation: "Main Formulation",
      dosageForm: productInfo.dosageForm,
      routeOfAdministration: "Oral",
      visualIdentification: productInfo.appearance,
      activeIngredients: productInfo.activeIngredients,
      excipients: productInfo.excipients
    }],
    documentInformation: {
      dataEntrySource: "Product Label and TGA Summary",
      dataEntryDate: new Date().toISOString().split('T')[0],
      version: "0.2-demo",
      notes: "Demo product for OSI platform demonstration"
    }
  };
};

const supplementProducts = [
  {
    artgNumber: "AUST L 123456",
    productName: "VitaBoost Immune Support",
    sponsor: "Health Supplements Co. Pty Ltd",
    address: "123 Wellness Street, Melbourne VIC 3000",
    startDate: "2024-01-15",
    packSize: "60 Tablets",
    dosageForm: "Tablet, film coated",
    appearance: "White, oval-shaped, film-coated tablet",
    indications: [
      {
        text: "Maintain/support immune system health",
        evidenceNotes: "Supported by clinical studies on vitamin C and zinc"
      },
      {
        text: "Support general health and wellbeing",
        evidenceNotes: "Traditional use of ingredients"
      }
    ],
    warnings: [
      "Always read the label and follow the directions for use",
      "If symptoms persist, talk to your health professional",
      "Contains sulfites"
    ],
    dosage: {
      adults: "Take 1 tablet once daily with food or as directed by your healthcare professional",
      children: "Not recommended for children under 12 years",
      generalNotes: "Best taken with food to enhance absorption"
    },
    allergens: {
      containsAllergens: ["Sulfites"],
      freeOfClaims: ["Gluten-Free", "Dairy-Free", "Vegan"],
      allergenStatement: "Contains sulfites. Free from gluten, dairy, and animal products.",
      crossContaminationRisk: false
    },
    activeIngredients: [
      {
        name: "Ascorbic acid",
        commonName: "Vitamin C",
        quantity: "500 mg",
        equivalentTo: null
      },
      {
        name: "Zinc sulfate monohydrate",
        commonName: "Zinc",
        quantity: "22 mg",
        equivalentTo: "Zinc 8 mg"
      },
      {
        name: "Echinacea purpurea extract",
        commonName: "Echinacea",
        quantity: "100 mg",
        equivalentTo: "Echinacea purpurea (dry root) 500 mg"
      }
    ],
    excipients: [
      { name: "Microcrystalline cellulose" },
      { name: "Magnesium stearate" },
      { name: "Silicon dioxide" },
      { name: "Hypromellose" },
      { name: "Titanium dioxide" }
    ]
  },
  {
    artgNumber: "AUST L 234567",
    productName: "Omega-3 Marine Complex",
    sponsor: "Health Supplements Co. Pty Ltd",
    address: "123 Wellness Street, Melbourne VIC 3000",
    startDate: "2024-02-01",
    packSize: "90 Capsules",
    dosageForm: "Capsule, soft gelatin",
    appearance: "Clear, amber-colored soft gelatin capsule",
    indications: [
      {
        text: "Support heart health",
        evidenceNotes: "Clinical studies support cardiovascular benefits of omega-3 fatty acids"
      },
      {
        text: "Support brain function",
        evidenceNotes: "DHA is important for normal brain function"
      }
    ],
    warnings: [
      "Always read the label and follow the directions for use",
      "If symptoms persist, talk to your health professional",
      "Contains fish products"
    ],
    dosage: {
      adults: "Take 1-2 capsules daily with meals or as directed by your healthcare professional",
      children: "Children over 12 years: Take 1 capsule daily",
      generalNotes: "Take with food to reduce fishy aftertaste"
    },
    allergens: {
      containsAllergens: ["Fish"],
      freeOfClaims: ["Gluten-Free", "Dairy-Free"],
      allergenStatement: "Contains fish. Free from gluten and dairy.",
      crossContaminationRisk: null
    },
    activeIngredients: [
      {
        name: "Fish oil concentrate",
        commonName: "Omega-3 Marine Oil",
        quantity: "1000 mg",
        equivalentTo: "EPA 300 mg, DHA 200 mg"
      }
    ],
    excipients: [
      { name: "Gelatin" },
      { name: "Glycerol" },
      { name: "Purified water" },
      { name: "Natural vitamin E" }
    ]
  },
  {
    artgNumber: "AUST L 345678",
    productName: "Magnesium Plus B6",
    sponsor: "Health Supplements Co. Pty Ltd",
    address: "123 Wellness Street, Melbourne VIC 3000",
    startDate: "2024-01-20",
    packSize: "120 Tablets",
    dosageForm: "Tablet, uncoated",
    appearance: "White, round, uncoated tablet",
    indications: [
      {
        text: "Support muscle function",
        evidenceNotes: "Magnesium is essential for normal muscle function"
      },
      {
        text: "Support nervous system function",
        evidenceNotes: "Magnesium and B6 support normal nervous system function"
      },
      {
        text: "Relieve muscle cramps and mild muscle spasms",
        evidenceNotes: "Traditional use and clinical evidence"
      }
    ],
    warnings: [
      "Always read the label and follow the directions for use",
      "If symptoms persist, talk to your health professional",
      "Contains sulfites"
    ],
    dosage: {
      adults: "Take 1-2 tablets daily or as directed by your healthcare professional",
      children: "Not recommended for children under 12 years",
      generalNotes: "Can be taken with or without food"
    },
    allergens: {
      containsAllergens: ["Sulfites"],
      freeOfClaims: ["Gluten-Free", "Dairy-Free", "Vegan"],
      allergenStatement: "Contains sulfites. Free from gluten, dairy, and animal products.",
      crossContaminationRisk: false
    },
    activeIngredients: [
      {
        name: "Magnesium oxide",
        commonName: "Magnesium",
        quantity: "500 mg",
        equivalentTo: "Magnesium 300 mg"
      },
      {
        name: "Pyridoxine hydrochloride",
        commonName: "Vitamin B6",
        quantity: "25 mg",
        equivalentTo: "Pyridoxine 20.6 mg"
      }
    ],
    excipients: [
      { name: "Microcrystalline cellulose" },
      { name: "Croscarmellose sodium" },
      { name: "Magnesium stearate" },
      { name: "Silicon dioxide" }
    ]
  }
];

module.exports = {
  generateOSIData,
  supplementProducts
};