$ErrorActionPreference = "Stop"

Write-Host "Ports serie detectes par Windows :"
Write-Host ""

$ports = [System.IO.Ports.SerialPort]::GetPortNames() | Sort-Object

if ($ports.Count -eq 0) {
  Write-Host "Aucun port COM detecte."
  Write-Host "Verifier que la Wemos est branchee en USB et que le pilote est installe."
  exit 1
}

foreach ($port in $ports) {
  Write-Host "- $port"
}

Write-Host ""
Write-Host "Pour identifier la Wemos :"
Write-Host "1. lancer ce script Wemos debranchee ;"
Write-Host "2. brancher la Wemos ;"
Write-Host "3. relancer ce script ;"
Write-Host "4. le nouveau port apparu est le port a utiliser dans capturer-serie-csv.ps1."
