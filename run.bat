@echo off
cd /d "%~dp0"
start "" http://localhost:8000
echo Middlwear -^> http://localhost:8000   (Ctrl+C pour arreter)
python -m http.server 8000
