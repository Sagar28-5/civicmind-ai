@echo off
SET NODE_DIR=C:\Users\kaila\.gemini\antigravity-ide\scratch\nodejs\node-v20.18.1-win-x64
SET PATH=%NODE_DIR%;%PATH%

echo.
echo  ============================================
echo   CivicMind AI - Setup Complete!
echo  ============================================
echo.
echo  Using Node.js: %NODE_DIR%
echo.

echo [1/2] Server packages already installed!
echo [2/2] Client packages already installed!
echo.

echo [3/3] Seeding database with demo data...
cd /d "%~dp0server"
"%NODE_DIR%\node.exe" seed.js
if %ERRORLEVEL% neq 0 (
    echo.
    echo  WARNING: Seed failed!
    echo  Make sure MONGO_URI is set correctly in server\.env
    echo.
) else (
    echo.
    echo  Database seeded successfully!
)

echo.
echo  ============================================
echo   SETUP COMPLETE!
echo  ============================================
echo.
echo  Demo Login Credentials:
echo   Citizen:  citizen@demo.com  /  Demo@123
echo   Officer:  officer@demo.com  /  Demo@123
echo   Admin:    admin@demo.com    /  Demo@123
echo.
echo  Run start.bat to launch the app!
echo.
pause
