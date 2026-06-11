@echo off
echo.
echo  ╔═══════════════════════════════╗
echo  ║   ContactHub - Quick Start    ║
echo  ╚═══════════════════════════════╝
echo.

echo [1/2] Installing backend dependencies...
cd backend
call npm install
if not exist .env (
    copy .env.example .env
    echo  Created backend\.env from example. Edit MONGODB_URI ^& JWT_SECRET if needed.
)

echo [2/2] Installing frontend dependencies...
cd ..\frontend
call npm install

echo.
echo  Installation complete!
echo.
echo  To start the application:
echo.
echo  Terminal 1 - Backend:
echo    cd backend ^&^& npm run dev
echo.
echo  Terminal 2 - Frontend:
echo    cd frontend ^&^& ng serve
echo.
echo  Load demo data (optional):
echo    cd backend ^&^& npm run seed
echo.
echo  Open browser: http://localhost:4200
echo  Demo login:   demo@contacts.com / demo1234
echo.
pause
