@echo off
echo ==========================================
echo StyleAI - Wardrobe Assistant Setup
echo ==========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
if not exist node_modules (
    call npm install
) else (
    echo Backend dependencies already installed.
)
cd ..

echo.
echo [2/4] Installing Frontend Dependencies...
cd frontend
if not exist node_modules (
    call npm install
) else (
    echo Frontend dependencies already installed.
)
cd ..

echo.
echo [3/4] Setting up Environment Files...
if not exist backend\.env (
    echo Creating backend .env file...
    echo PORT=5000 > backend\.env
    echo MONGODB_URI=mongodb://localhost:27017/wardrobe-ai >> backend\.env
    echo JWT_SECRET=your_jwt_secret_key_here_change_in_production >> backend\.env
    echo NODE_ENV=development >> backend\.env
    echo Backend .env file created successfully!
) else (
    echo Backend .env file already exists.
)

if not exist frontend\.env (
    echo Creating frontend .env file...
    echo VITE_API_URL=http://localhost:5000/api > frontend\.env
    echo Frontend .env file created successfully!
) else (
    echo Frontend .env file already exists.
)

echo.
echo [4/4] Setup Complete!
echo.
echo ==========================================
echo IMPORTANT: Before running the application
echo ==========================================
echo.
echo 1. Make sure MongoDB is installed and running:
echo    - Local: mongod
echo    - Or use MongoDB Atlas for cloud database
echo.
echo 2. To start the application, run:
echo    start-backend.bat    (to start backend server)
echo    start-frontend.bat   (to start frontend app)
echo.
echo Or manually:
echo    Backend: cd backend ^&^& npm run dev
echo    Frontend: cd frontend ^&^& npm run dev
echo.
echo ==========================================

pause
