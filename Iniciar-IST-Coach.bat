@echo off
setlocal
cd /d "%~dp0"
title IST Coach - Poker Pro
cls

echo ============================================================
echo         IST COACH - ASISTENTE DE POKER EN TIEMPO REAL
echo ============================================================
echo.

:: 0. Auto-actualizar desde GitHub si git esta disponible
where git >nul 2>nul
if %errorlevel% equ 0 (
    echo [0/3] Buscando actualizaciones en GitHub...
    git pull origin main >nul 2>nul
)

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] No se encontro Node.js en esta computadora.
    echo Por favor instala Node.js desde https://nodejs.org
    echo.
    pause
    exit /b
)

if not exist "node_modules" (
    echo [1/3] Instalando dependencias necesarias por primera vez...
    call npm install
)

echo [2/3] Creando acceso directo en el Escritorio...
set "DESK_PATH=%USERPROFILE%\Desktop"
if exist "%USERPROFILE%\OneDrive\Escritorio" set "DESK_PATH=%USERPROFILE%\OneDrive\Escritorio"
if exist "%USERPROFILE%\OneDrive\Desktop" set "DESK_PATH=%USERPROFILE%\OneDrive\Desktop"

powershell -NoProfile -ExecutionPolicy Bypass -Command " = New-Object -ComObject WScript.Shell;  = .CreateShortcut('%DESK_PATH%\IST Coach.lnk'); .TargetPath = '%~f0'; .WorkingDirectory = '%~dp0'; .IconLocation = 'shell32.dll,14'; .Save()" >nul 2>&1

echo [3/3] Abriendo navegador en http://localhost:3000
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:3000'"

echo.
echo ============================================================
echo   La aplicacion se esta iniciando en tu navegador.
echo   Manten esta ventana minimizada mientras juegas.
echo   Para cerrar la aplicacion, cierra esta ventana.
echo ============================================================
echo.

call npm run dev
pause