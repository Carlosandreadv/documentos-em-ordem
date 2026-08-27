@echo off
title Crypto Facil - Servidor
color 0A
echo.
echo  ========================================
echo   CRYPTO FACIL - Servidor Local
echo  ========================================
echo.
echo  Iniciando servidor...
echo.

cd /d "D:\Programas html\Cripto"

REM Mata processo anterior se existir
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9393') do taskkill /PID %%a /F >nul 2>&1

REM Inicia servidor em background
start /B node server.js

REM Espera servidor iniciar
timeout /t 2 /nobreak >nul

REM Abre navegador
start http://localhost:9393/Simples.html

echo  Servidor rodando em: http://localhost:9393
echo  Pressione qualquer tecla para PARAR o servidor...
echo.
pause >nul

REM Mata o servidor
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :9393') do taskkill /PID %%a /F >nul 2>&1
echo  Servidor parado.
timeout /t 2 /nobreak >nul
