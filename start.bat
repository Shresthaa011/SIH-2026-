@echo off
title GeoSetu-India Platform Launcher
echo Starting GeoSetu-India Platform...
cd /d "%~dp0"
start "GeoSetu-India Server" powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port 8080
timeout /t 2 /nobreak >nul
start http://localhost:8080
echo GeoSetu-India is now running at http://localhost:8080
echo Keep the server console window open while using the platform.
