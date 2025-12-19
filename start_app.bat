@echo off
echo ===================================================
echo       INICIANDO GYMCORE SAAS (Backend + Frontend)
echo ===================================================

:: Iniciar Backend en una nueva ventana
echo Iniciando Backend (FastAPI)...
start "GymCore Backend" cmd /k "cd gymcore\backend && venv\Scripts\activate && uvicorn main:app --reload --port 8000"

:: Esperar unos segundos para que el backend arranque
timeout /t 5 /nobreak >nul

:: Iniciar Frontend en una nueva ventana
echo Iniciando Frontend (React)...
start "GymCore Frontend" cmd /k "cd gymcore\frontend && pnpm start"

echo.
echo ===================================================
echo       SISTEMA INICIADO CORRECTAMENTE
echo ===================================================
echo Backend: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
pause