@echo off
echo ==========================================
echo Fixing Backend Installation
echo ==========================================
echo.

echo Step 1: Cleaning corrupted node_modules...
cd backend
if exist node_modules (
    echo Removing node_modules folder...
    rmdir /s /q node_modules
    echo node_modules removed successfully.
) else (
    echo node_modules folder not found, skipping cleanup.
)

if exist package-lock.json (
    echo Removing package-lock.json...
    del package-lock.json
    echo package-lock.json removed successfully.
)

echo.
echo Step 2: Installing dependencies...
call npm install

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo Installation Successful!
    echo ==========================================
    echo.
    echo You can now start the backend server:
    echo   npm run dev
    echo.
) else (
    echo.
    echo ==========================================
    echo Installation Failed!
    echo ==========================================
    echo.
    echo Please check the error messages above.
    echo.
)

cd ..
pause
