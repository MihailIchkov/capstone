@echo off
:: Animal Shelter Management System - Database Setup
:: This script sets up the SQL Server database

echo =========================================
echo Animal Shelter Database Setup Script
echo =========================================
echo.

:: Configuration
set SERVER=localhost\SQLEXPRESS
set USERNAME=sa
set PASSWORD=159359750
set SCRIPTPATH=%~dp0database_setup.sql

:: Step 1: Check if SQL Server is installed
echo Step 1: Checking if SQL Server is installed...
sc query "MSSQL$SQLEXPRESS" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: SQL Server Express not found!
    echo Please install SQL Server Express first.
    echo Download from: https://www.microsoft.com/sql-server/sql-server-downloads
    pause
    exit /b 1
)
echo [OK] SQL Server Express found
echo.

:: Step 2: Check if SQL Server is running
echo Step 2: Checking if SQL Server service is running...
sc query "MSSQL$SQLEXPRESS" | find "RUNNING" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo SQL Server service is not running. Attempting to start...
    net start "MSSQL$SQLEXPRESS" >nul 2>&1
    timeout /t 5 /nobreak >nul
    echo [OK] SQL Server service started
) else (
    echo [OK] SQL Server service is running
)
echo.

:: Step 3: Check if script file exists
echo Step 3: Checking for database setup script...
if not exist "%SCRIPTPATH%" (
    echo ERROR: database_setup.sql not found!
    echo Expected location: %SCRIPTPATH%
    pause
    exit /b 1
)
echo [OK] Setup script found
echo.

:: Step 4: Execute the database setup script
echo Step 4: Executing database setup script...
echo This may take a few moments...
echo.

sqlcmd -S %SERVER% -U %USERNAME% -P %PASSWORD% -i "%SCRIPTPATH%" -C

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [OK] Database setup completed successfully!
) else (
    echo.
    echo ERROR: Database setup failed!
    echo Please check the error messages above.
    pause
    exit /b 1
)
echo.

:: Step 5: Verify database creation
echo Step 5: Verifying database creation...
sqlcmd -S %SERVER% -U %USERNAME% -P %PASSWORD% -Q "SELECT name FROM sys.databases WHERE name = 'AnimalsDB'" -h -1 -C | find "AnimalsDB" >nul 2>&1

if %ERRORLEVEL% EQU 0 (
    echo [OK] AnimalsDB database created successfully
) else (
    echo WARNING: AnimalsDB database not found!
)
echo.

:: Step 6: List created tables
echo Step 6: Listing created tables...
echo.
echo Tables created:
sqlcmd -S %SERVER% -U %USERNAME% -P %PASSWORD% -Q "USE AnimalsDB; SELECT '  [OK] ' + TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE' ORDER BY TABLE_NAME" -h -1 -C

echo.
echo =========================================
echo DATABASE SETUP COMPLETED!
echo =========================================
echo.
echo Next steps:
echo 1. Navigate to Backend folder:
echo    cd C:\Users\ickov\OneDrive\Desktop\Capstone\Backend
echo.
echo 2. Install dependencies:
echo    npm install
echo.
echo 3. Start the backend server:
echo    npm start
echo.
echo 4. Navigate to Frontend folder and install dependencies:
echo    cd C:\Users\ickov\OneDrive\Desktop\Capstone\Frontend\app
echo    npm install
echo.
echo 5. Start the frontend application:
echo    npm run serve
echo.
echo 6. Open browser and register an admin account:
echo    http://localhost:8080
echo.
echo =========================================
pause
