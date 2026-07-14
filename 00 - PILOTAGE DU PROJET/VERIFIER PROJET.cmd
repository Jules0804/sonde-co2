@echo off
title Verification projet Ventilation CO2
set "NODE=C:\Users\jules\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%NODE%" set "NODE=node"
set "PYTHON=C:\Users\jules\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
if not exist "%PYTHON%" set "PYTHON=python"
set "PROJECT=%~dp0.."
set "FAILED=0"

echo === Simulateur et contrats materiels ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\simulateur"
"%NODE%" --test --test-isolation=none test\controller.test.js test\firmware-vectors.test.js test\hardware-contracts.test.js test\service-access.test.js test\config-store.test.js test\history-log.test.js
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Application Web locale et API ===
pushd "%PROJECT%\07 - INTERFACE WEB LOCALE\maquette-web-locale"
"%NODE%" --test --test-isolation=none test\core.test.mjs test\api.test.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Analyseur de reception ===
pushd "%PROJECT%\08 - PROTOTYPES ET ESSAIS"
"%NODE%" --test --test-isolation=none analyser-reception.test.mjs
if errorlevel 1 set "FAILED=1"
"%NODE%" --test --test-isolation=none analyser-charge-analogique.test.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Netlist et securite du cablage lot 1 ===
pushd "%PROJECT%\04 - ELECTRONIQUE ET CABLAGE"
"%NODE%" --test --test-isolation=none verifier-netlist-lot1.test.mjs
if errorlevel 1 set "FAILED=1"
"%NODE%" verifier-netlist-lot1.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Dimensionnement alimentation six moteurs ===
pushd "%PROJECT%\09 - ACHATS ET COUTS"
"%NODE%" --test --test-isolation=none dimensionner-alimentation-lot2.test.mjs
if errorlevel 1 set "FAILED=1"
"%NODE%" dimensionner-alimentation-lot2.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Dimensionnement aeraulique du banc ===
pushd "%PROJECT%\05 - MECANIQUE ET AERAULIQUE"
"%NODE%" --test --test-isolation=none dimensionner-registre-banc.test.mjs
if errorlevel 1 set "FAILED=1"
"%NODE%" dimensionner-registre-banc.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === CAO sonde CO2 de gaine ===
pushd "%PROJECT%\05 - MECANIQUE ET AERAULIQUE"
"%PYTHON%" -m py_compile fusion360_sonde_sen0536_boitiers.py
if errorlevel 1 set "FAILED=1"
"%PYTHON%" -m py_compile "CAO SONDE SEN0536\V0.1 - boitier simple\fusion360_sonde_sen0536_V0_1_ARCHIVE.py" "CAO SONDE SEN0536\V0.2 - sonde de gaine\fusion360_sonde_sen0536_V0_2_ARCHIVE.py" "CAO SONDE SEN0536\V0.3 - tube demontable chicane\fusion360_sonde_sen0536_V0_3.py"
if errorlevel 1 set "FAILED=1"
"%NODE%" verifier-cao-sonde-sen0536.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Plan de partitions ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-partitions.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrats materiels ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-hardware-contracts.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat pilotes lot 1 ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-lot1-drivers-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat port I2C ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-esp32-i2c-port-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat cycle capteur SCD41 ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-sensor-cycle-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat sortie actionneur ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-actuator-output-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat orchestrateur firmware ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-firmware-app-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat API HTTP firmware ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-http-api-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat authentification locale firmware ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-local-auth-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat stockage identifiants firmware ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-credential-store-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat garde API firmware ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-api-request-guard-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat reponses API firmware ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-api-response-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat payloads API firmware ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-api-payloads-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat serveur HTTP firmware ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-http-server-app-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat handlers API firmware ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-api-handlers-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat stockage configuration ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-config-store-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat historique et evenements ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-history-log-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat noyau controle ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-control-core-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat mode service Wi-Fi ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-service-mode-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Contrat orchestration main ESP32-S2 ===
pushd "%PROJECT%\06 - LOGICIEL EMBARQUE\firmware-esp32"
"%NODE%" test\validate-app-main-contract.mjs
if errorlevel 1 set "FAILED=1"
popd

echo.
echo === Coherence documentaire de phase 2 ===
pushd "%PROJECT%"
"%NODE%" "00 - PILOTAGE DU PROJET\verifier-phase2.mjs"
if errorlevel 1 set "FAILED=1"
popd

echo.
if "%FAILED%"=="0" (
  echo RESULTAT : toutes les verifications ont reussi.
) else (
  echo RESULTAT : au moins une verification a echoue.
)
if /i not "%~1"=="--no-pause" pause
exit /b %FAILED%
