# OpenSupplimentsInitiative
Standardising supplement information for healthcare software interoperability and public accessibility.
# Supplement Data Standardization Project

## Mission Statement

This project is dedicated to revolutionising dietary supplement information management by establishing a clear, comprehensive, and **interoperable** data format, moving beyond the limitations of hosted PDFs and commercial/proprietary databases. Currently,  supplement details are often fragmented and inconsistent. Our mission is to cut through this complexity by developing a machine-readable, interoperable, and signable framework that ensures consistency and global interoperability of listed supplement information from certifying organisations such as the TGA (Australia).

OSI aims to empower healthcare professionals with efficacious, accurate, and personalised client care tools. This standard will allow **medical databases, patient management software, and other health applications to directly link to and utilise trusted supplement data** 

---

## The Problem

The management and utilisation of dietary supplement information currently face significant challenges:

* **Data Fragmentation:** Information is scattered across manufacturer websites, regulatory body summaries (like the TGA in Australia), product labels, and research articles, often with varying levels of detail and format.
* **Inconsistency:** The same product or ingredient can be described differently, making accurate comparisons and data aggregation difficult.
* **Inefficiency:** Healthcare practitioners, particularly nutritionists and dietitians, spend considerable time collating and verifying supplement details.
* **Limited Interoperability:** There is a lack of a standardised format that allows different software systems (e.g., electronic health records, patient management software, research databases) to easily consume and share supplement data.

---

## Our Solution: The OpenSupp Format v0.1

This project proposes the **OpenSupp**, a structured JSON (JavaScript Object Notation) template designed to address these challenges. This format provides a consistent and comprehensive way to record dietary supplement information.

**Key principles of the OpenSupp Format:**

* **Standardisation:** Provides a defined set of fields for common supplement attributes.
* **Clarity:** Organises information logically for both human readability and machine processing.
* **Comprehensiveness:** Aims to capture a wide range of data points relevant to clinical practice and regulatory oversight.
* **Interoperability:** The structured nature facilitates easier integration with other systems.
* **Authority-Linked:** Designed to accommodate and reference official identifiers, initially including TGA ARTG.

---

## What This Repository Contains

This repository hosts the foundational elements of the Supplement Data Standardization Project:

* **This `README.md` file:** An overview of the project, its mission, and the data format.
* **`/template/supplement_data_template_v0.2.json`:** A blank, generic template file representing the Supplidata Format v0.2. This can be used as a starting point for creating new supplement data records.
* **`/examples/` directory:** Contains populated example files that demonstrate how the template is used for different (fictional) products.
    * `example_000001_magneaze_megamag.osi`: A detailed example of a multi-ingredient formula.
    * *(Future examples may include different product types like single-ingredient supplements, herbal formulas, etc.)*

---

## Overview of the Supplidata Format v0.2 Structure

The `supplement_data_template_v0.1.osi` file outlines the core structure. Key sections include:

* **`artgEntry`**: Details related to regulatory listings (e.g., TGA ARTG number, sponsor, product status).
* **`conditions`**: Any conditions of listing or sale.
* **`products`**: Basic product identification.
* **`permittedIndications`**: Approved or stated uses, with a field for evidence notes.
* **`indicationRequirements`**: Mandatory statements or conditions related to indications.
* **`warnings`**: Critical safety warnings and advisories.
* **`dosageInformation`**: Recommended dosages for different groups and general usage notes.
* **`allergenInformation`**: Detailed information on contained allergens, "free-from" claims, and allergen statements.
* **`components`**:
    * `activeIngredients`: Detailed list including full name, common name, quantity, and equivalents.
    * `excipients`: List of other ingredients.
* **`documentInformation`**: Metadata about the data entry itself (source, date, version).

For a complete understanding of all fields and their intended use, please refer to the blank template file in the `/template/` directory.

---

## Example Snippet: Active Ingredients

```json
// From: components[0].activeIngredients
[
  {
    "name": "Calcium ascorbate dihydrate",
    "commonName": "Vitamin C",
    "quantity": "242.1 mg",
    "equivalentTo": "ascorbic acid (Vitamin C) 200 mg"
  },
  {
    "name": "Colecalciferol",
    "commonName": "Vitamin D3",
    "quantity": "0.0125 mg",
    "equivalentTo": "Vitamin D3 500 IU"
  }
]