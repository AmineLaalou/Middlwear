@echo off
cd /d "%~dp0\server"
if not exist node_modules (
  echo Installation des dependances (premiere fois)...
  call npm install
)
if not exist .env copy .env.example .env >nul
echo Middlwear (mode complet) -^> http://localhost:3000   (Ctrl+C pour arreter)
start "" http://localhost:3000
node server.js
