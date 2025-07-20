# OSI Platform MVP

Open Supplements Initiative - A comprehensive platform for standardizing and certifying dietary supplement information.

## Overview

The OSI Platform provides a complete end-to-end system for:
- Manufacturers to submit detailed product data with evidence
- OSI staff to review and verify submissions
- Digital certificate generation with cryptographic signatures
- Public product catalog with verification capabilities

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Docker and Docker Compose
- Git

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd osi-platform
   ```

2. **Install dependencies**
   ```bash
   npm run install:all
   ```

3. **Start the database**
   ```bash
   npm run docker:up
   ```

4. **Set up environment variables**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your configuration
   ```

5. **Run database migrations and seed data**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

6. **Start the development servers**
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Demo Accounts

After seeding the database, you can use these demo accounts:

- **Admin**: admin@osi.org / admin123
- **Manufacturer**: demo@healthsupplements.com / manufacturer123

## Project Structure

```
osi-platform/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── contexts/       # React contexts
│   │   └── utils/          # Utility functions
│   └── package.json
├── server/                 # Node.js backend
│   ├── database/           # Database schema and migrations
│   ├── middleware/         # Express middleware
│   ├── routes/             # API routes
│   └── package.json
├── docker-compose.yml      # Docker services
└── package.json           # Root package.json
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user

### Supplements
- `GET /api/supplements` - List supplements
- `POST /api/supplements` - Create supplement
- `GET /api/supplements/:id` - Get supplement details
- `PUT /api/supplements/:id` - Update supplement

### Certificates
- `GET /api/certificates` - List certificates
- `POST /api/certificates` - Generate certificate
- `GET /api/certificates/:id` - Get certificate details

### Public API
- `GET /api/public/supplements` - Public supplement catalog
- `GET /api/public/verify/:osiNumber` - Verify certificate

## Database Schema

The platform uses PostgreSQL with the following core tables:
- `users` - User accounts and authentication
- `organizations` - Company/manufacturer profiles
- `supplements` - Product data in OSI JSON format
- `certificates` - Digital certificates and signatures
- `documents` - Uploaded evidence files
- `audit_logs` - System audit trail

## Development

### Running Tests
```bash
cd server && npm test
cd client && npm test
```

### Database Operations
```bash
# Reset database
npm run docker:down
npm run docker:up
npm run db:migrate
npm run db:seed

# View database
docker exec -it osi-postgres psql -U osi_user -d osi_platform
```

### Building for Production
```bash
npm run build
npm start
```

## MVP Demo Flow

1. **Manufacturer Registration**: Company creates account and submits product data
2. **Evidence Upload**: Upload third-party lab tests, certificates, and studies
3. **Admin Review**: OSI staff reviews and verifies all submitted evidence
4. **Certificate Generation**: System generates cryptographically signed certificate
5. **Public Verification**: Product appears in public catalog with QR code verification

## Next Steps

This MVP provides the foundation for:
- Advanced digital signature implementation
- Blockchain integration for certificate transparency
- Mobile applications for QR code scanning
- Integration with regulatory authorities (TGA, FDA)
- Advanced search and filtering capabilities

## Support

For questions or issues, please contact the OSI development team.