Stray Care Project Documentation

A comprehensive web application for stray dog management, adoption, volunteering, and donations.

Table of Contents

Project Overview
Tech Stack
Installation and Setup
Project Structure
API Configuration
Environment Variables
Database Schema
Recent Improvements
Features
Development
Troubleshooting

Project Overview

Stray Care is a full-stack web application designed to help rescue and manage stray dogs. It provides:

Aimal Management: Add, update, and manage dog profiles
Adoption System: Users can apply to adopt dogs
Volunteer Program: Manage volunteer applications and tracking
Donation System: Accept PayPal donations to support the shelter
Report System: Users can report stray dogs with location and details
Admin Dashboard: Comprehensive management interface

Tech Stack

Frontend
Vue.js 3: Progressive JavaScript framework
Vue Router: Client-side routing
Composition API: Modern Vue component structure

Backend
Node.js: JavaScript runtime
Express.js: Web framework
SQL Server: Database (MSSQL)

External Services
Google Maps API: Location services and address autocomplete
PayPal SDK: Payment processing
JWT: Authentication tokens
bcryptjs: Password hashing

Installation and Setup

Prerequisites
Node.js v14 or higher
SQL Server 2019 or higher
npm or yarn
Git

Backend Setup

```bash
cd Backend
npm install
cp .env.example .env

Configure .env with your database and API credentials
npm run dev
```

Frontend Setup

```bash
cd Frontend/app
npm install
cp .env.example .env

Configure .env with API URLs and API keys
npm run serve
```

Project Structure

```
Capstone/
├── Backend/
│   ├── config/
│   │   ├── db.js              # Database configuration
│   │   └── gcloud.js          # Google Cloud storage config
│   ├── controllers/
│   │   ├── animalController.js
│   │   ├── adoptionController.js
│   │   ├── AuthController.js
│   │   ├── volunteerController.js
│   │   ├── reportController.js
│   │   └── paypalController.js
│   ├── routes/
│   │   └── [various route files]
│   ├── middleware/
│   │   └── auth.js
│   ├── index.js               # Express app entry point
│   └── package.json
│
├── Frontend/app/
│   ├── src/
│   │   ├── components/        # Vue components
│   │   ├── config/
│   │   │   └── api.js         # Centralized API configuration
│   │   ├── utils/
│   │   │   └── googleMaps.js  # Google Maps loader utility
│   │   ├── App.vue
│   │   ├── main.js            # Entry point with router
│   │   └── assets/
│   ├── public/
│   ├── package.json
│   ├── vue.config.js
│   └── .env                   # Environment variables
│
└── Documentation.md
```

API Configuration

Centralized API Endpoints (Frontend/app/src/config/api.js)

All API calls are now centralized in one configuration file to avoid hardcoded URLs and ensure consistency:

```javascript
import { API, fetchAPI, getImageUrl } from '@/config/api'

Example usage:
const animals = await fetchAPI(API.ANIMALS)
const imageUrl = getImageUrl('uploads/dog.jpg')
```

Available API Endpoints:
API.ANIMALS: List all animals
API.ANIMAL_BY_ID(id): Get animal by ID
API.VOLUNTEERS: Volunteer endpoints
API.DONATIONS: Donation endpoints
API.ORDERS: PayPal order endpoints

Benefits of Centralized API Config

Single point of configuration: Change base URL in one place
Automatic token injection: Auth tokens added to all requests
Consistent error handling: Standardized error responses
Easy migration: Switch between dev/prod easily
Reduced code duplication: No more hardcoded URLs in components

Environment Variables

Frontend (.env)

```env
API Configuration
VUE_APP_API_BASE_URL=http://localhost:5000
VUE_APP_UPLOADS_BASE_URL=http://localhost:5000/uploads

Google Maps
VUE_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

PayPal
VUE_APP_PAYPAL_CLIENT_ID=your_paypal_client_id
```

Backend (.env)

```env
Server
PORT=5000
NODE_ENV=development

Database
DB_SERVER=localhost
DB_PORT=1433
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_DATABASE=AnimalsDB

JWT
JWT_SECRET=your_jwt_secret_key

PayPal
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

Database Schema

Main Tables

**Animals**
- AnimalId (PK)
- Name, Breed, Age, Description
- ImageUrl, Status
- CreatedAt, UpdatedAt

**Volunteers**
- VolunteerId (PK)
- Name, Email, Phone, Location
- Experience, Availability
- Skills, Status
- CreatedAt

**AdoptionForms**
- AdoptionFormId (PK)
- AnimalId (FK)
- Applicant details (name, email, phone, address)
- Home details (homeType, hasPets, hasYard, workSchedule)
- Status, CreatedAt

**Reports**
- ReportId (PK)
- Location, Details, Coordinates
- Images (JSON array)
- Status, CreatedAt

**Donations**
- DonationId (PK)
- Amount, TransactionId
- AdminId (FK), Status
- CreatedAt

---

Features

User Features:
- Browse Dogs: View all available dogs for adoption
- Apply for Adoption: Submit adoption applications
- Make Donations: Secure PayPal donations
- Report Strays: Report stray dogs with location
- Volunteer: Apply to volunteer with detailed form

Admin Features:
- Dashboard: Manage all operations
- Animal Management: Add, edit, delete dogs
- Applications: Review adoption and volunteer applications
- Reports: View and manage stray dog reports
- Donations: Track donation history

Development

Running the Application

Terminal 1: Backend
```bash
cd Backend
npm run dev
```

Terminal 2: Frontend
```bash
cd Frontend/app
npm run serve
```

Application URLs:
- Frontend: http://localhost:8080
- Backend: http://localhost:5000

Code Standards

Use Vue 3 Composition API
Follow ES6+ JavaScript standards
Add JSDoc comments for functions
Use consistent naming conventions
Keep components small and focused

Project Structure

Root Directory:
- Backend: Express.js REST API server
- Frontend: Vue.js 3 single page application
- Documentation: Project guides and specifications

Backend Structure:
- index.js: Main application entry point
- package.json: Node.js dependencies
- config: Configuration files (database, Google Cloud)
- controllers: Business logic (adoptions, animals, auth, PayPal, reports, volunteers)
- middleware: Authentication and request processing
- routes: API route definitions
- uploads: File storage directory

Frontend Structure:
- app/src: Source code directory
- App.vue: Root Vue component
- main.js: Application entry point
- components: Reusable Vue components (Add, Adopt, Dashboard, Donate, Login, Register, etc.)
- config: Configuration and centralized API
- utils: Utility functions (Google Maps loader, API helpers)
- assets: Images and static resources
- public: Static HTML and favicon

Recent Improvements

Google Maps Optimization:
Async loading with loading=async parameter prevents page load blocking
Place types reduced to recommended limit of 4 types for better performance
Migration guide provided for deprecated Autocomplete and Marker APIs

API Centralization:
Centralized api.js configuration eliminates hardcoded URLs across components
Single point of configuration for base URL changes
Consistent API response handling and error management
Automatic authorization token injection for authenticated endpoints

Environment Configuration:
.env.example templates provided for frontend and backend
Sensitive credentials never committed to repository
Easy setup for local development and deployment

Troubleshooting

Common Issues

Issue: Google Maps API key is not configured
Solution: Verify VUE_APP_GOOGLE_MAPS_API_KEY is set in .env and restart dev server after changing env variables

Issue: Failed to fetch from API
Solution: Check backend is running on port 5000, verify database connection in .env, check CORS configuration in Backend/index.js

Issue: Cannot read property maps of undefined
Solution: Ensure Google Maps API key is valid, check network request in browser DevTools, clear browser cache and restart

Issue: Token not found error
Solution: Login again to get new token, check localStorage is enabled, token may have expired so login is required

Issue: Database Connection Error
Solution: Verify SQL Server is running, check connection string in .env, verify user has database permissions, ensure database exists: AnimalsDB

Support and Contact

For issues or questions, please refer to the main Documentation.md file or contact the development team.

License

This project is part of the Capstone requirement.

Last Updated: November 3, 2025
Version: 1.0.0

**Last Updated**: November 3, 2025  
**Version**: 1.0.0
