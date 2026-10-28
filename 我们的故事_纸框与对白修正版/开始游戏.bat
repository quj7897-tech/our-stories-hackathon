@echo off
cd /d "%~dp0"
where node >nul 2>nul
if not errorlevel 1 (
  node server.cjs --open
) else (
  python server.py --open
)
pause
