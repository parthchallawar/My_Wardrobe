@echo off
echo ==========================================
echo Complete Clean & Restart
echo ==========================================
echo.
echo This will:
echo 1. Clear Node.js module cache
echo 2. Remove Mongoose compiled models cache
echo 3. Restart backend server
echo.

cd backend

echo Step 1: Clearing cache...
if exist node_modules\.cache (
    echo - Removing node_modules\.cache
    rmdir /s /q node_modules\.cache
)

echo.
echo Step 2: Checking node_modules...
if not exist node_modules (
    echo node_modules not found, please run npm install first
    pause
    exit /b
)

echo.
echo Step 3: Starting backend server...
echo.
echo ==========================================
echo.
echo Press Ctrl+C to stop the server
echo.
node server.js

pause
