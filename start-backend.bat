@echo off
echo ===================================================
echo Starting Kisan Saathi Node API Server (Port 5000)
echo ===================================================
cd /d "%~dp0server"
if not exist node_modules (
  echo [Info] Installing backend dependencies (express, pg, dotenv, tsx)...
  call npm install
)
npx tsx server.ts
pause
