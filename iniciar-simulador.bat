@echo off
title Simulador de Creditos PIS/COFINS
echo ====================================================
echo   INICIANDO SIMULADOR PIS / COFINS (PEPS / FIFO)
echo ====================================================
echo.
cd /d "%~dp0"
echo Abrindo o servidor local...
start http://localhost:5173
npm run dev
pause
