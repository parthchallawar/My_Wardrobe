@echo off
echo ==========================================
echo Restarting Backend Server
echo ==========================================
echo.

cd backend

echo Stopping any existing server processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo Starting backend server...
echo.
echo ==========================================
npm run dev

pause
