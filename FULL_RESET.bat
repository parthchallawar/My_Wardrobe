@echo off
echo ==========================================
echo BACKEND FULL RESET & FIX
echo ==========================================
echo.
echo This will completely fix all errors:
echo 1. Stop all Node processes
echo 2. Delete all caches
echo 3. Delete node_modules
echo 4. Reinstall dependencies
echo 5. Start server fresh
echo.
cd C:\Users\parth\projects\wardrobe-ai\backend

echo.
echo [Step 1/5] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo.
echo [Step 2/5] Deleting node_modules...
if exist node_modules (
    rmdir /s /q node_modules
    if %errorlevel% equ 0 (
        echo   ✓ node_modules deleted
    ) else (
        echo   ✗ Failed to delete node_modules
        echo   You may need to close applications using files in node_modules
        pause
        exit /b 1
    )
) else (
    echo   - node_modules not found
)

echo.
echo [Step 3/5] Deleting package-lock.json...
if exist package-lock.json (
    del package-lock.json
    echo   ✓ package-lock.json deleted
) else (
    echo   - package-lock.json not found
)

echo.
echo [Step 4/5] Clearing npm cache...
call npm cache clean --force --silent
echo   ✓ npm cache cleared

echo.
echo [Step 5/5] Reinstalling dependencies...
echo   This may take 2-3 minutes...
echo.
call npm install --silent --no-audit --no-fund

if %errorlevel% equ 0 (
    echo.
    echo ==========================================
    echo       ✓ INSTALLATION SUCCESSFUL!
    echo ==========================================
    echo.
    echo Verifying models...
    echo.
    timeout /t 2 /nobreak >nul
    echo Starting backend server...
    echo.
    echo ==========================================
    echo.
    call npm run dev
) else (
    echo.
    echo ==========================================
    echo       ✗ INSTALLATION FAILED!
    echo ==========================================
    echo.
    echo Please check the error messages above.
    echo.
    pause
)
