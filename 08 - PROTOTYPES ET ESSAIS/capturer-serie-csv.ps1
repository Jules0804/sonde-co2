param(
  [Parameter(Mandatory = $true)]
  [string] $Port,

  [Parameter(Mandatory = $true)]
  [string] $Output,

  [int] $Baud = 115200,

  [int] $DurationMinutes = 30
)

$ErrorActionPreference = "Stop"

if ($DurationMinutes -lt 1) {
  throw "DurationMinutes doit etre superieur ou egal a 1."
}

$outputPath = [System.IO.Path]::GetFullPath($Output)
$outputDir = [System.IO.Path]::GetDirectoryName($outputPath)
if (-not [System.IO.Directory]::Exists($outputDir)) {
  [System.IO.Directory]::CreateDirectory($outputDir) | Out-Null
}

$serial = [System.IO.Ports.SerialPort]::new($Port, $Baud, [System.IO.Ports.Parity]::None, 8, [System.IO.Ports.StopBits]::One)
$serial.NewLine = "`n"
$serial.ReadTimeout = 1000
$serial.DtrEnable = $true
$serial.RtsEnable = $true

$writer = [System.IO.StreamWriter]::new($outputPath, $false, [System.Text.UTF8Encoding]::new($false))
$started = Get-Date
$deadline = $started.AddMinutes($DurationMinutes)
$lineCount = 0

try {
  $serial.Open()
  Write-Host "Capture serie demarree : $Port -> $outputPath"
  Write-Host "Baud : $Baud ; duree : $DurationMinutes min"
  Write-Host "Ctrl+C pour arreter proprement si necessaire."

  while ((Get-Date) -lt $deadline) {
    try {
      $line = $serial.ReadLine().TrimEnd("`r", "`n")
      if ($line.Length -eq 0) {
        continue
      }
      $writer.WriteLine($line)
      $writer.Flush()
      $lineCount++
      if (($lineCount % 25) -eq 0) {
        Write-Host "$lineCount lignes capturees..."
      }
    } catch [System.TimeoutException] {
      # Aucun caractere pendant cette seconde : on continue jusqu'a la duree demandee.
    }
  }
} finally {
  if ($serial.IsOpen) {
    $serial.Close()
  }
  $writer.Close()
}

$elapsed = (Get-Date) - $started
Write-Host "Capture terminee : $lineCount lignes en $([math]::Round($elapsed.TotalSeconds, 1)) s."
Write-Host "Fichier : $outputPath"
