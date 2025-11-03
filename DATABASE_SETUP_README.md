Database Setup Instructions

Animal Shelter Management System SQL Database Setup

This guide will help you set up the SQL Server database for your Animal Shelter Management System after a clean install.

Prerequisites

Before running the database setup script make sure you have:

1. SQL Server Express or Developer Edition installed
2. SQL Server Management Studio SSMS installed recommended
3. SQL Server service running
4. SQL Server Authentication enabled with the sa account

Quick Setup Guide

Option 1: Using SQL Server Management Studio SSMS Recommended

1. Open SQL Server Management Studio

2. Connect to your SQL Server
   Server name: localhost\SQLEXPRESS or just localhost if using Developer Edition
   Authentication: Windows Authentication initially
   Click Connect

3. Enable SQL Server Authentication if not already enabled
   Right click on the server name in Object Explorer
   Select Properties
   Go to Security page
   Select SQL Server and Windows Authentication mode
   Click OK
   Restart SQL Server service see instructions below

4. Enable and Set Password for SA Account
   Open a New Query window
   Run these commands:
   ```sql
   ALTER LOGIN sa ENABLE;
   ALTER LOGIN sa WITH PASSWORD = '159359750';
   ```
   Restart SQL Server service again

5. Run the Database Setup Script
   In SSMS click File then Open then File
   Navigate to: C:\Users\ickov\OneDrive\Desktop\Capstone\database_setup.sql
   Click Execute or press F5
   Wait for the script to complete you should see success messages

6. Verify the Setup
   In Object Explorer expand Databases
   You should see AnimalsDB
   Expand AnimalsDB then Tables
   You should see 7 tables:
     Admins
     Animals
     AdoptionForms
     Donations
     Reports
     Volunteers
     VolunteerSkills

Option 2: Using PowerShell or Command Line

1. Open PowerShell as Administrator

2. Navigate to the Capstone folder
   ```powershell
   cd "C:\Users\ickov\OneDrive\Desktop\Capstone"
   ```

3. Run the SQL script using SQLCMD
   ```powershell
   sqlcmd -S localhost\SQLEXPRESS -U sa -P 159359750 -i database_setup.sql
   ```
   
   If you get an error about trust server certificate use:
   ```powershell
   sqlcmd -S localhost\SQLEXPRESS -U sa -P 159359750 -C -i database_setup.sql
   ```

4. Verify the setup
   ```powershell
   sqlcmd -S localhost\SQLEXPRESS -U sa -P 159359750 -Q "USE AnimalsDB; SELECT name FROM sys.tables;"
   ```

How to Restart SQL Server Service

Method 1: Using Services Manager
1. Press Win + R
2. Type services.msc and press Enter
3. Find SQL Server SQLEXPRESS in the list
4. Right click then Restart
5. Wait for the service to restart

Method 2: Using PowerShell as Administrator
```powershell
Restart-Service -Name 'MSSQL$SQLEXPRESS'
```

Database Tables Overview

The script creates the following tables:

1. Admins for User Authentication
- AdminID Primary Key
- Username, Password hashed, Email
- Role admin
- Timestamps

2. Animals for Pet Management
- AnimalId Primary Key
- Name, Breed, Age, Description
- ImageUrl, Status
- Timestamps

3. Volunteers for Volunteer Applications
- VolunteerId Primary Key
- Name, Email, Phone, Location
- Availability, Experience, Reason
- Status Pending, Approved, Rejected
- Timestamps

4. VolunteerSkills for Volunteer Skills Tracking
- VolunteerSkillId Primary Key
- VolunteerId Foreign Key
- Skill
- Timestamps

5. AdoptionForms for Adoption Applications
- AdoptionFormId Primary Key
- AnimalId Foreign Key
- Applicant details Name, Email, Phone, Address
- Home information HasPets, HomeType, HasYard, WorkSchedule
- Experience, Status
- Timestamps

6. Donations for Payment Tracking
- DonationId Primary Key
- Amount, TransactionId PayPal
- AdminId Foreign Key
- Status, Timestamps

7. Reports for Stray Animal Reports
- ReportId Primary Key
- Location, Details, Coordinates
- Images, Status
- Timestamps

After Database Setup

Step 1: Verify Backend Configuration

Check that your .env file in the Backend folder has the correct settings:

```env
PORT=5000
DB_SERVER=localhost
DB_PORT=1433
DB_INSTANCE=SQLEXPRESS
DB_DATABASE=AnimalsDB
DB_USER=sa
DB_PASSWORD=159359750
JWT_SECRET=someStrongSecret
```

Step 2: Install Backend Dependencies

```powershell
cd "C:\Users\ickov\OneDrive\Desktop\Capstone\Backend"
npm install
```

Step 3: Start the Backend Server

```powershell
npm start
```

You should see:
```
Server running on port 5000
Table structure verified/updated successfully
```

Step 4: Install Frontend Dependencies

```powershell
cd "C:\Users\ickov\OneDrive\Desktop\Capstone\Frontend\app"
npm install
```

Step 5: Start the Frontend Application

```powershell
npm run serve
```

Step 6: Create Your First Admin Account

1. Open your browser and go to: http://localhost:8080
```

Step 2: Install Backend Dependencies

```powershell
cd "C:\Users\ickov\OneDrive\Desktop\Capstone\Backend"
npm install
```

Step 3: Start the Backend Server

```powershell
npm start
```

You should see:
```
Server running on port 5000
Table structure verified/updated successfully
```

Step 4: Install Frontend Dependencies

```powershell
cd "C:\Users\ickov\OneDrive\Desktop\Capstone\Frontend\app"
npm install
```

Step 5: Start the Frontend Application

```powershell
npm run serve
```

Step 6: Create Your First Admin Account

1. Open your browser and go to: `http://localhost:8080`
2. Navigate to the Register page
3. Create an admin account with:
   - Username
   - Email
   - Password
   - Role: admin

---

Troubleshooting

Issue: Cannot connect to database

Solution:
1. Verify SQL Server service is running
2. Check if the database name is correct: AnimalsDB
3. Verify sa account credentials
4. Check firewall settings

Issue: Login failed for user sa

Solution:
1. Make sure SQL Server Authentication is enabled
2. Verify the sa account is enabled:
   ```sql
   ALTER LOGIN sa ENABLE;
   ALTER LOGIN sa WITH PASSWORD = '159359750';
   ```
3. Restart SQL Server service

Issue: Cannot open database AnimalsDB

Solution:
1. Run the database_setup.sql script again
2. Or manually create the database:
   ```sql
   CREATE DATABASE AnimalsDB;
   ```

Issue: Invalid object name errors

Solution: The tables were not created. Run the complete database_setup.sql script

Issue: Port 1433 is not accessible

Solution:
1. Enable TCP/IP protocol for SQL Server
2. Open SQL Server Configuration Manager
3. Expand SQL Server Network Configuration
4. Enable TCP/IP
5. Restart SQL Server service

Sample Data

The setup script includes sample data:
- 1 admin user you need to update the password hash
- 4 sample animals
- 2 sample volunteers
- 3 sample volunteer skills

You can modify the script to add more sample data or remove it if you prefer to start fresh.

Database Maintenance

Backup Database
```sql
BACKUP DATABASE AnimalsDB 
TO DISK = 'C:\Backups\AnimalsDB.bak'
WITH FORMAT;
```

Restore Database
```sql
RESTORE DATABASE AnimalsDB 
FROM DISK = 'C:\Backups\AnimalsDB.bak'
WITH REPLACE;
```

View All Data in a Table
```sql
USE AnimalsDB;
SELECT * FROM Animals;
SELECT * FROM Volunteers;
SELECT * FROM AdoptionForms;
```

Security Notes

Important:
- The default password 159359750 is visible in the code. Change it in production
- Always use strong passwords for the sa account
- Consider using Windows Authentication in production
- Never commit .env files with real credentials to version control

Support

If you encounter any issues:
1. Check the error messages in the SQL Server error log
2. Verify all prerequisites are met
3. Ensure SQL Server service is running
4. Check the Backend console for connection errors

Database Schema Diagram

```
Admins 1 connected to many Donations
   
Animals 1 connected to many AdoptionForms
   
Volunteers 1 connected to many VolunteerSkills

Reports standalone
```

Last Updated: October 29, 2025
Version: 1.0
