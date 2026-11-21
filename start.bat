@echo off
title Lover's Lily Mirror 🌸
cd /d "%~dp0"

echo ==========================================================
echo   Starting Lover's Lily Mirror Web Server...
echo ==========================================================
echo.

where python >nul 2>&1
if %errorlevel% equ 0 (
    echo Starting with Python HTTP server...
    start "" http://localhost:3000/
    python -m http.server 3000
    goto :end
)

echo Starting with PowerShell server...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"

:end
pause
