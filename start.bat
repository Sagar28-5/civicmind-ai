@echo off
SET NODE_DIR=C:\Users\kaila\.gemini\antigravity-ide\scratch\nodejs\node-v20.18.1-win-x64
SET PROJ=C:\Users\kaila\.gemini\antigravity-ide\scratch\civicmind-ai

echo.
echo  ============================================
echo   CivicMind AI - Launching...
echo  ============================================
echo.

echo [1/2] Starting Backend Server on port 5000...
start "CivicMind Backend :5000" cmd /k "SET PATH=%NODE_DIR%;%PATH% && cd /d "%PROJ%\server" && "%NODE_DIR%\node.exe" server.js"

echo Waiting 4 seconds for backend to start...
timeout /t 4 /nobreak >nul

echo [2/2] Starting Frontend on port 5173...
start "CivicMind Frontend :5173" cmd /k "SET PATH=%NODE_DIR%;%PATH% && cd /d "%PROJ%\client" && "%NODE_DIR%\npm.cmd" run dev"

echo.
echo Opening browser in 8 seconds...
timeout /t 8 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo  ✅ CivicMind AI is LIVE!
echo.
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:5000/api/health
echo.
echo  Demo Logins:
echo   admin@demo.com   /  Demo@123  (Admin)
echo   officer@demo.com /  Demo@123  (Officer)
echo   citizen@demo.com /  Demo@123  (Citizen)
echo.
pause
