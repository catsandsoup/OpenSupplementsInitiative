# OSI Platform Demo Setup

## Quick Start

### 1. Setup Demo Data
```bash
# From the server directory
cd server
npm run demo:setup
```

### 2. Start the Application
```bash
# Terminal 1 - Start backend
cd server
npm run dev

# Terminal 2 - Start frontend  
cd client
npm start
```

### 3. Access the Demo
- **Application**: http://localhost:3000
- **Public Catalog**: http://localhost:3000/catalog
- **Certificate Verification**: http://localhost:3000/verify/OSI-2024-000001

## Demo Accounts

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@osi.org | admin123 | Review and approve products |
| Manufacturer | demo@healthsupplements.com | manufacturer123 | Submit products for certification |
| Reviewer | reviewer@osi.org | reviewer123 | Secondary review process |

## Demo Products

| Product | Status | OSI Number | Purpose |
|---------|--------|------------|---------|
| VitaBoost Immune Support | ✅ APPROVED | OSI-2024-000001 | Show complete certified product |
| Omega-3 Marine Complex | ⏳ SUBMITTED | - | Demonstrate review process |
| Magnesium Plus B6 | 📝 DRAFT | - | Show product creation |

## Demo Scenarios

### Scenario 1: Complete Workflow (20 minutes)
1. **Login as Manufacturer** → View dashboard with products
2. **Edit Draft Product** → Complete Magnesium Plus B6 details
3. **Submit for Review** → Change status to submitted
4. **Login as Admin** → Review submitted product
5. **Approve Product** → Generate certificate automatically
6. **Verify Certificate** → Use public verification page

### Scenario 2: Certificate Verification (10 minutes)
1. **Public Verification** → Enter OSI-2024-000001
2. **View Certificate Details** → Show product information
3. **Download Certificate** → Professional PDF format
4. **Browse Public Catalog** → Show all certified products

### Scenario 3: Admin Review Process (15 minutes)
1. **Admin Dashboard** → View all submitted products
2. **Review Interface** → Check evidence and documentation
3. **Approval Process** → Add notes and approve/reject
4. **Certificate Management** → View and manage certificates

## Key Demo Features

### 🔒 Security & Trust
- Cryptographic digital signatures
- Tamper-proof certificates  
- Real-time verification
- Complete audit trail

### 📊 Comprehensive Data
- Complete ingredient traceability
- Supplier and factory information
- Clinical evidence and studies
- Manufacturing batch details

### 🌐 Public Access
- Certificate verification by OSI number
- Public product catalog
- Professional certificate downloads
- No registration required for verification

### 🔄 Complete Workflow
- Manufacturer product submission
- Admin review and approval
- Automatic certificate generation
- Public verification and access

## Demo Script

Full presentation script available at: `server/database/demo-script.md`

### Key Talking Points

**Problem Statement**:
- Fragmented supplement information
- No standardized data format
- Difficult verification of authenticity
- Regulatory compliance challenges

**OSI Solution**:
- Standardized JSON data format
- Cryptographic certificate security
- Complete ingredient traceability
- Real-time verification system

**Value Proposition**:
- **Manufacturers**: Competitive advantage through transparency
- **Healthcare Providers**: Trusted, standardized information
- **Consumers**: Easy authenticity verification
- **Regulators**: Streamlined compliance and review

## Technical Highlights

### Architecture
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React.js + Material-UI
- **Security**: JWT authentication + digital signatures
- **Standards**: OSI v0.2 JSON format compliance

### API Features
- RESTful API design
- Real-time certificate verification
- Bulk data access capabilities
- Healthcare software integration ready

### Data Security
- Encrypted data storage
- Digital certificate signatures
- Audit logging for all operations
- Tamper-proof verification system

## Troubleshooting

### Common Issues

**Demo data not loading**:
```bash
cd server
npm run demo:reset
```

**Certificate verification fails**:
- Check OSI number format: OSI-YYYY-NNNNNN
- Ensure demo data includes approved products
- Verify certificate generation completed

**Login issues**:
- Use exact email addresses from demo accounts table
- Passwords are case-sensitive
- Clear browser cache if needed

**Public catalog empty**:
- Ensure approved products have certificates
- Check certificate status is 'active'
- Verify demo setup completed successfully

### Reset Commands

```bash
# Full demo reset
npm run demo:setup

# Reset data only (keep documents)
npm run demo:reset

# Regenerate mock documents only
npm run demo:docs
```

## Customization

### Adding New Demo Products
Edit `server/database/demo-data.js` and add to `demoSupplementProducts` array.

### Modifying Demo Accounts
Update `demoUsers` array in `server/database/demo-data.js`.

### Custom Mock Documents
Modify templates in `server/database/mock-documents.js`.

## Production Considerations

### Security Enhancements
- Hardware Security Module (HSM) for certificate signing
- Multi-factor authentication for admin accounts
- Rate limiting and DDoS protection
- Regular security audits and penetration testing

### Scalability Features
- Database clustering and replication
- CDN for certificate and document delivery
- Caching layer for high-traffic endpoints
- Load balancing for multiple server instances

### Integration Capabilities
- Healthcare software APIs (EMR/EHR systems)
- Regulatory authority data feeds
- Laboratory information systems
- Supply chain management platforms

### Compliance Features
- GDPR compliance for user data
- FDA 21 CFR Part 11 for electronic records
- TGA compliance for Australian regulations
- International standards alignment (ISO, WHO)

## Support

### Demo Support
- Check demo script: `server/database/demo-script.md`
- Review troubleshooting section above
- Verify all prerequisites are installed

### Technical Documentation
- API documentation: `/docs/api.md`
- Database schema: `server/database/init.sql`
- OSI format specification: `/docs/osi-format.md`

### Contact Information
- Technical questions: tech@osi.org
- Business inquiries: business@osi.org
- Partnership opportunities: partnerships@osi.org

---

**Ready to demonstrate the future of supplement transparency!** 🚀