Quick Start Guide

Animal Shelter Management System - Get Started in 5 Minutes

This guide will help you set up and run your Animal Shelter Management System quickly after a clean install.

Fast Track Setup

1. Run Database Setup (1 minute)

Double click the file: setup-database.bat

This automatically:
- Checks SQL Server installation
- Creates the AnimalsDB database
- Creates all required tables
- Adds sample data
- Verifies everything works

Alternative: If you prefer manual setup see DATABASE_SETUP_README.md

2. Start Backend Server (1 minute)

Open PowerShell and run:
```powershell
cd C:\Users\ickov\OneDrive\Desktop\Capstone\Backend
npm install
npm start
```

You should see: Server running on port 5000

3. Start Frontend Application (1 minute)

Open a NEW PowerShell window and run:
```powershell
cd C:\Users\ickov\OneDrive\Desktop\Capstone\Frontend\app
npm install
npm run serve
```

You should see: App running at: http://localhost:8080

4. Access the Application (30 seconds)

1. Open your browser
2. Go to: http://localhost:8080
3. Click Register to create an admin account
4. Log in and start managing your shelter

System Requirements Checklist

Before starting make sure you have:
- Node.js version 16 or newer installed
- SQL Server Express installed
- SQL Server service running
- Internet connection for npm packages

Do not have these? See INSTALLATION_GUIDE.md for detailed installation steps.

What is Next

After successful setup:

1. Add Animals by going to Dashboard then Add Animal
2. Test Volunteer Form by filling out a volunteer application
3. Test Adoption Form by submitting an adoption request
4. Configure PayPal by updating PayPal credentials in .env for donations
5. Explore Dashboard to view statistics and manage applications

Additional Resources

| Document | Purpose |
| README.md | Project overview and quick reference |
| INSTALLATION_GUIDE.md | Detailed installation instructions |
| DATABASE_SETUP_README.md | Database configuration guide |
| Documentation.md | Complete system documentation |

Common Issues and Quick Fixes

Database Connection Failed
```powershell
Restart SQL Server
Restart-Service -Name 'MSSQL$SQLEXPRESS'
```

Port Already in Use
```powershell
Check what is using the port
netstat -ano | findstr :5000
netstat -ano | findstr :8080
```

npm Install Issues
```powershell
Clear cache and reinstall
npm cache clean --force
Remove-Item node_modules -Recurse -Force
npm install
```

Need Help?

1. Check the error message carefully
2. Look in the Troubleshooting section of README.md
3. Review INSTALLATION_GUIDE.md for detailed steps
4. Check the console output for specific errors

Verification Steps

After setup verify everything works:

- Database created successfully AnimalsDB
- Backend server running on port 5000
- Frontend server running on port 8080
- Can access http://localhost:8080 in browser
- Can register and login as admin
- Can see the dashboard

Ready to go? Run setup-database.bat and follow steps 2 to 4 above.

Last Updated: October 29, 2025
