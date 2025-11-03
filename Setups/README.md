Animal Shelter Management System

A web application for managing animal shelter operations including animal management, volunteer coordination, adoption processes, and donation handling.

Table of Contents

- Overview
- Features
- Technology Stack
- Quick Start
- Database Setup
- Installation Guide
- Running the Application
- Project Structure
- Documentation
- Troubleshooting
- License

Overview

The Animal Shelter Management System helps animal shelters manage their daily operations. It provides tools to manage animals, volunteers, adoptions, and donations.

Features

- Animal Management: Add, update, delete, and track animals with images and information
- Volunteer System: Accept and manage volunteer applications with skills tracking
- Adoption Process: Handle adoption applications with status tracking
- Donation System: Secure PayPal integration for processing donations
- Admin Dashboard: View statistics and recent activities
- Authentication: Secure login with role based access control
- Report System: Track and manage stray animal reports
- Responsive Design: Works on mobile devices

Technology Stack

Frontend
- Vue.js 3
- Vue Router
- Axios for API calls
- Modern responsive CSS

Backend
- Node.js
- Express.js
- SQL Server (MSSQL)
- JWT Authentication
- PayPal SDK
- Multer for file uploads

Database
- Microsoft SQL Server Express/Developer

Quick Start

Prerequisites

Before you begin, make sure you have installed:
- Node.js version 16 or newer from https://nodejs.org
- SQL Server Express from https://www.microsoft.com/sql-server/sql-server-downloads
- Git from https://git-scm.com/download/win
- SQL Server Management Studio recommended from https://aka.ms/ssmsfullsetup

Quick Setup Automated

1. Clone the repository
   ```bash
   git clone https://github.com/MihailIchkov/capstone.git
   cd capstone
   ```

2. Run the automated database setup
   ```bash
   Using the batch file recommended for Windows
   .\setup-database.bat
   
   OR using SQL Server Management Studio
   Open and execute: database_setup.sql
   ```

3. Install dependencies and start the application
   ```bash
   Backend
   cd Backend
   npm install
   npm start
   
   Frontend in a new terminal
   cd Frontend/app
   npm install
   npm run serve
   ```

4. Access the application
   Open browser: http://localhost:8080
   Register an admin account
   Start managing your shelter

Database Setup

Option 1: Automated Setup Recommended

Run the batch file in the project root:
```bash
.\setup-database.bat
```

This will:
- Check SQL Server installation
- Enable SQL authentication
- Create the AnimalsDB database
- Create all required tables
- Insert sample data
- Verify the setup

Option 2: Manual Setup Using SSMS

1. Open SQL Server Management Studio
2. Connect to your server: localhost\SQLEXPRESS
3. Enable SQL Server Authentication:
   ```sql
   ALTER LOGIN sa ENABLE;
   ALTER LOGIN sa WITH PASSWORD = '159359750';
   ```
4. Restart SQL Server service
5. Execute the setup script:
   File, Open, database_setup.sql
   Click Execute or press F5

Option 3: Command Line Setup

```bash
sqlcmd -S localhost\SQLEXPRESS -U sa -P 159359750 -i database_setup.sql -C
```

Database Tables

The setup creates the following tables:
- Admins for user authentication and authorization
- Animals for pet records and information
- Volunteers for volunteer applications and details
- VolunteerSkills for skills associated with volunteers
- AdoptionForms for adoption applications
- Donations for payment tracking
- Reports for stray animal reports

Installation Guide

Step 1: Install Required Software

Node.js
1. Download from https://nodejs.org
2. Run the installer and accept defaults
3. Restart your computer

SQL Server
1. Download SQL Server Express
2. Choose "Basic" installation
3. Note the instance name (usually SQLEXPRESS)
4. Complete installation

SQL Server Management Studio (Optional but Recommended)
1. Download SSMS
2. Install with default settings
3. Restart computer

Step 2: Clone or Download Project

Using Git:
```bash
cd Desktop
git clone https://github.com/MihailIchkov/capstone.git
cd capstone
```

Or download ZIP:
- Go to GitHub repository
- Click Code then Download ZIP
- Extract to your desired location

Step 3: Configure Environment

The .env file in the Backend folder should contain:
```env
PORT=5000
DB_SERVER=localhost
DB_PORT=1433
DB_INSTANCE=SQLEXPRESS
DB_DATABASE=AnimalsDB
DB_USER=sa
DB_PASSWORD=159359750
JWT_SECRET=someStrongSecret

PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret
```

Step 4: Install Dependencies

Backend:
```bash
cd Backend
npm install
```

Frontend:
```bash
cd Frontend/app
npm install
```

Running the Application

Start Backend Server
```bash
cd Backend
npm start
```
Expected output: Server running on port 5000

Start Frontend Application
```bash
cd Frontend/app
npm run serve
```
Expected output: App running at: http://localhost:8080

First Time Setup
1. Navigate to http://localhost:8080
2. Click "Register" to create an admin account
3. Log in with your credentials
4. Start using the system!

Project Structure

```
Capstone/
├── Backend/
│   ├── config/
│   │   ├── db.js              # Database configuration
│   │   └── gcloud.js          # Google Cloud config
│   ├── controllers/
│   │   ├── animalController.js
│   │   ├── adoptionController.js
│   │   ├── volunteerController.js
│   │   ├── AuthController.js
│   │   ├── paypalController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/
│   │   ├── animalRoutes.js
│   │   ├── adoptionRoutes.js
│   │   ├── volunteerRoutes.js
│   │   ├── AuthRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── paypalRoutes.js
│   │   └── reportRoutes.js
│   ├── uploads/               # Uploaded images
│   ├── .env                   # Environment variables
│   ├── index.js              # Main server file
│   └── package.json
│
├── Frontend/
│   └── app/
│       ├── public/
│       │   └── index.html
│       ├── src/
│       │   ├── components/
│       │   │   ├── Home.vue
│       │   │   ├── Dashboard.vue
│       │   │   ├── Add.vue
│       │   │   ├── Adopt.vue
│       │   │   ├── AdoptionForm.vue
│       │   │   ├── Volunteer.vue
│       │   │   ├── Donate.vue
│       │   │   ├── Report.vue
│       │   │   ├── Login.vue
│       │   │   ├── Register.vue
│       │   │   ├── Navbar.vue
│       │   │   ├── Footer.vue
│       │   │   └── Layout.vue
│       │   ├── App.vue
│       │   └── main.js
│       ├── package.json
│       └── vue.config.js
│
├── database_setup.sql         # Complete database setup script
├── setup-database.bat         # Automated setup script
├── DATABASE_SETUP_README.md   # Detailed database setup guide
├── INSTALLATION_GUIDE.md      # Comprehensive installation guide
├── Documentation.md           # Full system documentation
└── README.md                 # This file
```

Documentation

- INSTALLATION_GUIDE.md for detailed step by step installation instructions
- DATABASE_SETUP_README.md for database setup and configuration guide
- Documentation.md for complete system documentation including:
  - API endpoints
  - Database schema
  - Component architecture
  - Security implementation
  - Deployment guide

Troubleshooting

Cannot Connect to Database
- Verify SQL Server service is running
- Check credentials in .env file
- Ensure SQL Server Authentication is enabled
- Restart SQL Server service

Port Already in Use
- Close applications using ports 5000 or 8080
- Or modify ports in configuration files

npm Install Fails
- Ensure Node.js is properly installed
- Run PowerShell/Command Prompt as Administrator
- Clear npm cache: npm cache clean --force
- Delete node_modules folder and try again

Tables Not Created
- Run database_setup.sql script
- Check SQL Server error logs
- Verify database AnimalsDB exists
- Ensure you have proper permissions

Frontend Not Loading
- Ensure both backend and frontend servers are running
- Check browser console for errors
- Clear browser cache
- Try a different browser

PayPal Integration Issues
- Verify PayPal credentials in .env
- Check if using correct environment Sandbox/Production
- Review PayPal SDK documentation

Security Notes

Important Security Reminders:
- Change default SA password in production
- Never commit .env files to version control
- Use environment specific configuration
- Implement HTTPS in production
- Regularly update dependencies
- Follow security best practices

API Endpoints

Authentication
- POST /api/auth/login for user login
- POST /api/auth/register for register admin

Animals
- GET /api/animals for get all animals
- GET /api/animals/:id for get animal by ID
- POST /api/animals for add new animal admin
- PUT /api/animals/:id for update animal admin
- DELETE /api/animals/:id for delete animal admin

Volunteers
- POST /api/volunteers for submit volunteer application
- GET /api/volunteers for get all volunteers admin
- PUT /api/volunteers/:id/status for update volunteer status admin

Adoptions
- POST /api/adoptions for submit adoption application
- GET /api/adoptions for get all adoptions admin
- PUT /api/adoptions/:id/status for update adoption status admin

Donations
- POST /api/payments/orders for create PayPal order
- POST /api/payments/orders/:id/capture for capture payment

Reports
- POST /api/reports for submit stray animal report
- GET /api/reports for get all reports admin

Dashboard
- GET /api/dashboard for dashboard statistics admin only

Contributing

Contributions are welcome. Please follow these steps:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

License

This project is licensed under the MIT License. See the LICENSE file for details.

Authors

Mihail Ichkov - https://github.com/MihailIchkov

Acknowledgments

- Vue.js community
- Express.js documentation
- PayPal SDK team
- All contributors and testers

Last Updated: October 29, 2025
Version: 1.0.0

For detailed documentation see Documentation.md
For installation help see INSTALLATION_GUIDE.md
For database setup see DATABASE_SETUP_README.md
