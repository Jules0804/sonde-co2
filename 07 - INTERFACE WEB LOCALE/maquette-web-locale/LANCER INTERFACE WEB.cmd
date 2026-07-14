@echo off
title Prototype Ventilation CO2
set "NODE=C:\Users\jules\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" set "NODE=node"
cd /d "%~dp0"
echo.
echo Comptes demo :
echo - installateur / installateur123
echo - administrateur / administrateur123
echo.
"%NODE%" server.mjs
pause
