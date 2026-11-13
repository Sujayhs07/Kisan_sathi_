@echo off
echo ===================================================
echo Starting Kisan Saathi Frontend (Vite on port 3000)
echo ===================================================
cd /d "%~dp0frontend"
if not exist node_modules (
  echo [Info] Installing frontend dependencies...
  call npm install
)
npm run dev
pause
