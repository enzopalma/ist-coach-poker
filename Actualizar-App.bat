@echo off
setlocal
cd /d "%~dp0"
title Actualizar IST Coach desde GitHub
color 0B
cls

echo ============================================================
echo           ACTUALIZAR IST COACH (DESDE GITHUB)
echo ============================================================
echo.
echo Descargando ultimos cambios y correcciones...
echo.

git pull origin main

echo.
echo ============================================================
echo   Actualizacion completada.
echo   Ya puedes abrir Iniciar-IST-Coach.bat
echo ============================================================
echo.
pause
