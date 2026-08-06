@echo off
setlocal
cd /d "%~dp0server"

if not exist node_modules (
  echo Installation des dependances ^(premiere fois^)...
  call npm install
)
if not exist .env copy .env.example .env >nul

if not exist cloudflared.exe (
  echo Telechargement de l'outil de partage ^(premiere fois, ~50 Mo^)...
  curl -sL -o cloudflared.exe "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
)

echo Demarrage du serveur Middlwear...
start "Middlwear - serveur (laisse cette fenetre ouverte)" cmd /k "node server.js"

timeout /t 3 /nobreak >nul

echo.
echo ================================================================
echo   Lien a envoyer a tes amis. Il reste actif tant que CETTE
echo   fenetre ET la fenetre "Middlwear - serveur" restent ouvertes.
echo   Ferme les deux quand tu as fini de partager.
echo ================================================================
echo.
cloudflared.exe tunnel --url http://localhost:3000
