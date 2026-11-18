@echo off
title Coco's Bakery - Servidor Local
chcp 65001 >nul
echo.
echo ========================================================
echo    🧁 INICIANDO COCO'S BAKERY (SERVIDOR LOCAL) 🧁
echo ========================================================
echo.

set PORT=3000

:: Comprobar si Python está instalado
where python >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Iniciando servidor con Python en http://localhost:%PORT% ...
    echo Abriendo el navegador web en breve...
    echo Presiona Ctrl+C o cerra esta ventana para detener el servidor.
    echo ========================================================
    echo.
    start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:%PORT%/index.html"
    python -m http.server %PORT%
    goto finish
)

:: Comprobar si Node / npx está disponible
where npx >nul 2>&1
if %errorlevel% equ 0 (
    echo [OK] Iniciando servidor con Node.js en http://localhost:%PORT% ...
    echo Abriendo el navegador web en breve...
    echo Presiona Ctrl+C o cerra esta ventana para detener el servidor.
    echo ========================================================
    echo.
    start "" cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:%PORT%/index.html"
    npx serve -l %PORT% .
    goto finish
)

:: Fallback si no hay servidor local instalado
echo [AVISO] No se encontro Python ni Node.js en el sistema.
echo Abriendo index.html directamente en el navegador predeterminado...
start "" "index.html"

:finish
pause
