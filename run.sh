#!/bin/bash
cd "$(dirname "$0")"
PORT=8000
( sleep 1
  URL="http://localhost:$PORT"
  if command -v open >/dev/null 2>&1; then open "$URL"
  elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$URL"
  else echo "Ouvre : $URL"; fi ) &
echo "Middlwear → http://localhost:$PORT   (Ctrl+C pour arrêter)"
python3 -m http.server $PORT
