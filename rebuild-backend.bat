@echo off
echo ==========================================
echo Complete Backend Rebuild
echo ==========================================
echo.
echo This will:
echo 1. Delete node_modules
echo 2. Delete package-lock.json
echo 3. Clear npm cache
echo 4. Reinstall all dependencies
echo 5. Start the server
echo.
echo NOTE: This may take 2-3 minutes
echo.
pause

cd backend

echo.
echo Step 1: Cleaning up...
if exist node_modules (
    echo - Removing node_modules folder...
    rmdir /s /q node_modules
    echo   Done.
)
if exist package-lock.json (
    echo - Removing package-lock.json...
    del package-lock.json
    echo   Done.
)

echo.
echo Step 2: Clearing npm cache...
call npm cache clean --force

echo.
echo Step 3: Installing dependencies...
call npm install

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo Installation Complete!
    echo ==========================================
    echo.
    echo Starting server...
    echo.
    npm run dev
) else (
    echo.
    echo ==========================================
    echo Installation Failed!
    echo ==========================================
    echo.
    echo Please check the error messages above.
    echo.
    pause
)
