@echo off
SET NODE_DIR=C:\Users\kaila\.gemini\antigravity-ide\scratch\nodejs\node-v20.18.1-win-x64
SET PATH=%NODE_DIR%;%PATH%
SET PROJ=C:\Users\kaila\.gemini\antigravity-ide\scratch\civicmind-ai

echo.
echo  ============================================
echo   CivicMind AI - Launching...
echo  ============================================
echo.

echo [1/2] Starting Backend Server on port 5000...
start "CivicMind Backend :5000" cmd /k "cd /d "%PROJ%\server" && node server.js"

echo Waiting 4 seconds for backend to start...
timeout /t 4 /nobreak >nul

echo [2/2] Starting Frontend on port 5173...
start "CivicMind Frontend :5173" cmd /k "cd /d "%PROJ%\client" && npm run dev"

echo.
echo Opening browser in 6 seconds...
timeout /t 6 /nobreak >nul
start "" "http://localhost:5173"

echo.
echo  ✅ CivicMind AI is LIVE!
echo.
echo  Frontend : http://localhost:5173
echo  Backend  : http://localhost:5000/api/health
echo.
echo  Log in with your registered production credentials or register a new citizen account.
echo.
pause

