@echo off
echo.
echo ========================================================
echo   A INICIAR A APP NATIVAMENTE PARA EVITAR O DOCKER
echo ========================================================
echo.
echo Instalando modulos necessarios (isto so demora um pouco na primeira vez)...
call npm install --silent

echo.
echo A arrancar o servidor na porta 3005...
echo A Cloudflare deverá apanhar isto imediatamente se o teu tunel usar localhost:3005.
echo.

set PORT=3005
call npm run dev
pause
