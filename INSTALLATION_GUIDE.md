Animal Shelter Management System Installation Guide

What You Need Before Starting

Required Software
1. Node.js (version 16 or newer)
2. SQL Server Express or SQL Server Developer Edition
3. Git for cloning the repository
4. A web browser (Chrome, Firefox, or Edge)

Optional but Recommended
1. SQL Server Management Studio for database management
2. Visual Studio Code for editing code

Step 1: Install Required Software

Install Node.js
1. Download Node.js from https://nodejs.org
2. Run the installer
3. Follow the installation wizard
4. Accept all default settings
5. Restart your computer after installation

Install SQL Server
1. Download SQL Server Express from https://www.microsoft.com/sql-server/sql-server-downloads
2. Run the installer
3. Choose "Basic" installation type
4. Accept the license terms
5. Choose installation location or use default
6. Wait for installation to complete
7. Note down the instance name (usually SQLEXPRESS)

Install SQL Server Management Studio (Optional)
1. Download SSMS from https://aka.ms/ssmsfullsetup
2. Run the installer
3. Follow the installation wizard
4. Restart your computer after installation

Install Git
1. Download Git from https://git-scm.com/download/win
2. Run the installer
3. Accept all default settings
4. Complete the installation

Step 2: Download the Project

Option 1: Using Git (Recommended)
1. Open PowerShell or Command Prompt
2. Navigate to where you want to store the project
   ```
   cd Desktop
   ```
3. Clone the repository
   ```
   git clone https://github.com/MihailIchkov/capstone.git
   ```
4. Navigate into the project folder
   ```
   cd capstone
   ```

Option 2: Download ZIP
1. Go to https://github.com/MihailIchkov/capstone
2. Click the green "Code" button
3. Click "Download ZIP"
4. Extract the ZIP file to your Desktop
5. Rename the folder to "capstone" if needed

Step 3: Set Up the Database

Create Database User
1. Open SQL Server Management Studio
2. Click "Connect" to connect to your local server
   Server name: localhost\SQLEXPRESS
   Authentication: Windows Authentication
   Click "Connect"

3. In the toolbar, click "Options"
4. Go to "Connection Properties" tab
5. Check "Trust server certificate"
6. Click "Connect"

Enable SQL Server Authentication
1. Once connected, open a new query window
2. Run these commands one at a time:
   ```sql
   ALTER LOGIN sa ENABLE;
   ALTER LOGIN sa WITH PASSWORD = '159359750';
   ```

3. Restart SQL Server service
   Open Services (Press Win + R, type services.msc)
   Find "SQL Server (SQLEXPRESS)"
   Right click and select "Restart"

Create the Database and Tables
1. In SQL Server Management Studio, open a new query window
2. Run this command to create the database:
   ```sql
   CREATE DATABASE AnimalsDB;
   ```

3. Change to use the new database:
   ```sql
   USE AnimalsDB;
   ```

4. Create the Animals table:
   ```sql
   CREATE TABLE Animals (
       AnimalId INT PRIMARY KEY IDENTITY(1,1),
       Name NVARCHAR(100),
       Breed NVARCHAR(100),
       Age INT,
       Description TEXT,
       ImageUrl NVARCHAR(255),
       CreatedAt DATETIME DEFAULT GETDATE()
   );
   ```

5. Create the Volunteers table:
   ```sql
   CREATE TABLE Volunteers (
       VolunteerId INT PRIMARY KEY IDENTITY(1,1),
       Name NVARCHAR(100),
       Email NVARCHAR(100),
       Phone NVARCHAR(20),
       Location NVARCHAR(200),
       Experience TEXT,
       Status NVARCHAR(50) DEFAULT 'Pending',
       CreatedAt DATETIME DEFAULT GETDATE()
   );
   ```

6. Create the AdoptionForms table:
   ```sql
   CREATE TABLE AdoptionForms (
       AdoptionId INT PRIMARY KEY IDENTITY(1,1),
       AnimalId INT FOREIGN KEY REFERENCES Animals(AnimalId),
       Name NVARCHAR(100),
       Email NVARCHAR(100),
       Phone NVARCHAR(20),
       HomeType NVARCHAR(50),
       HasPets BIT,
       ExistingPets TEXT,
       HasYard BIT,
       WorkSchedule NVARCHAR(200),
       Experience TEXT,
       Status NVARCHAR(50) DEFAULT 'Pending',
       CreatedAt DATETIME DEFAULT GETDATE()
   );
   ```

Step 4: Configure the Application

Set Up Backend Configuration
1. Navigate to the Backend folder in the project
2. Find the file named ".env"
3. Open it with Notepad or any text editor
4. Make sure these settings are correct:
   ```
   PORT=5000
   DB_SERVER=localhost
   DB_PORT=1433
   DB_INSTANCE=SQLEXPRESS
   DB_DATABASE=AnimalsDB
   DB_USER=sa
   DB_PASSWORD=159359750
   JWT_SECRET=someStrongSecret
   ```
5. Save the file if you made any changes

Install Backend Dependencies
1. Open PowerShell or Command Prompt
2. Navigate to the Backend folder:
   ```
   cd Desktop\Capstone\capstone\Backend
   ```
3. Install the required packages:
   ```
   npm install
   ```
4. Wait for the installation to complete (this may take a few minutes)

Install Frontend Dependencies
1. In PowerShell or Command Prompt, navigate to the Frontend app folder:
   ```
   cd ..\Frontend\app
   ```
2. Install the required packages:
   ```
   npm install
   ```
3. Wait for the installation to complete (this may take several minutes)

Step 5: Run the Application

Start the Backend Server
1. Open PowerShell or Command Prompt
2. Navigate to the Backend folder:
   ```
   cd Desktop\Capstone\capstone\Backend
   ```
3. Start the server:
   ```
   node index.js
   ```
4. You should see a message saying "Server running on port 5000"
5. Leave this window open while using the application

Start the Frontend Application
1. Open a NEW PowerShell or Command Prompt window (keep the backend running)
2. Navigate to the Frontend app folder:
   ```
   cd Desktop\Capstone\capstone\Frontend\app
   ```
3. Start the development server:
   ```
   npm run serve
   ```
4. Wait for it to compile (may take a minute)
5. You should see a message with a local address (usually http://localhost:8080)
6. Leave this window open while using the application

Access the Application
1. Open your web browser
2. Go to http://localhost:8080
3. You should see the Animal Shelter Management System homepage

Step 6: Create an Admin Account

Register as Administrator
1. In the application, click on "Login" or "Admin"
2. Click "Register" if available
3. Fill in the registration form with your details
4. Submit the form
5. You can now log in with these credentials

Common Problems and Solutions

Problem: Cannot connect to database
Solution:
1. Make sure SQL Server service is running
2. Check that the password in the .env file matches what you set (159359750)
3. Verify the instance name is SQLEXPRESS
4. Make sure you enabled SQL Server authentication
5. Restart SQL Server service

Problem: npm install fails
Solution:
1. Make sure Node.js is installed correctly
2. Close and reopen PowerShell to refresh the environment
3. Run PowerShell as Administrator
4. Try running npm install again

Problem: Port already in use
Solution:
1. Close any other applications using port 5000 or 8080
2. Or change the port in the .env file for Backend
3. Restart the servers

Problem: Tables not created
Solution:
1. Make sure you ran all the CREATE TABLE commands
2. Make sure you selected the AnimalsDB database first with USE AnimalsDB
3. Check for error messages in SQL Server Management Studio
4. Try running the commands again one at a time

Problem: Cannot see the website
Solution:
1. Make sure both Backend and Frontend servers are running
2. Check the console messages for any errors
3. Try a different browser
4. Clear your browser cache
5. Make sure you are going to http://localhost:8080

Stopping the Application

Stop the Servers
1. Go to the PowerShell window running the Backend
2. Press Ctrl + C
3. Type Y when asked to confirm
4. Go to the PowerShell window running the Frontend
5. Press Ctrl + C
6. Type Y when asked to confirm

Close Everything
1. Close all PowerShell windows
2. Close your web browser
3. The database will continue running in the background (this is normal)

Need Help?

If you encounter any issues not covered in this guide:
1. Check the error messages carefully
2. Make sure all prerequisites are installed correctly
3. Verify all configuration settings
4. Try restarting your computer
5. Contact the development team for assistance

Next Steps

After successful installation:
1. Log in as administrator
2. Add some animals to the system
3. Test the volunteer application form
4. Test the adoption application form
5. Test the donation system
6. Explore the admin dashboard

Congratulations! Your Animal Shelter Management System is now ready to use.
