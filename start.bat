@echo off
echo ========================================================
echo Starting Finova Finance Platform...
echo ========================================================
echo.
echo Starting Backend Server on http://localhost:5000...
start "Finova Backend" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak >nul
echo.
echo Starting Frontend Client on http://localhost:3000...
start "Finova Frontend" cmd /k "cd client && npm run dev"
echo.
echo Both servers are launching!
echo Customer Portal: http://localhost:3000
echo Admin Portal:    http://localhost:3000/admin/login
echo API Health:      http://localhost:5000/api/health
echo ========================================================
