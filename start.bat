@echo off
title TerraByte Platform Launcher
echo Starting TerraByte Platform...
cd /d "%~dp0"
start "TerraByte Server" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
timeout /t 2 /nobreak >nul
start http://localhost:8080
echo TerraByte is now running at http://localhost:8080
echo Keep the server console window open while using the platform.
