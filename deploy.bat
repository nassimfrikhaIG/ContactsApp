@echo off
setlocal enabledelayedexpansion
title ContactHub Deploy

echo.
echo ========================================
echo   ContactHub -- Production Deploy
echo ========================================
echo.

where docker >nul 2>&1 || (echo ERROR: Docker is not installed & exit /b 1)

if not exist "backend\.env.production" (
  echo WARNING: backend\.env.production not found -- copying template...
  copy backend\.env.example backend\.env.production
  echo.
  echo Please edit backend\.env.production with your values, then re-run.
  pause & exit /b 1
)

echo [1/4] Building images...
docker compose build --no-cache || exit /b 1

echo [2/4] Stopping existing containers...
docker compose down --remove-orphans 2>nul

echo [3/4] Starting services...
docker compose up -d || exit /b 1

echo [4/4] Waiting 30s for services to start...
timeout /t 30 /nobreak >nul

echo.
echo ========================================
echo   ContactHub is running!
echo ========================================
echo.
echo   Frontend:  http://localhost
echo   API:       http://localhost/api
echo   Health:    http://localhost/api/health
echo.
pause
