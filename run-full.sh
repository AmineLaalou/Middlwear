#!/bin/bash
cd "$(dirname "$0")/server"
if [ ! -d node_modules ]; then
  echo "Installation des dépendances (première fois)..."
  npm install
fi
[ -f .env ] || cp .env.example .env
PORT="${PORT:-3000}"
( sleep 1
  URL="http://localhost:$PORT"
  if command -v open >/dev/null 2>&1; then open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"
  else echo "Ouvre : $URL"; fi ) &
echo "Middlwear (mode complet) → http://localhost:$PORT   (Ctrl+C pour arrêter)"
node server.js
