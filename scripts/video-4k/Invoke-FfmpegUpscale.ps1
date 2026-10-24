#Requires -Version 5.1
<#
.SYNOPSIS
  Upscale básico 4K com FFmpeg (fallback). Preferir Topaz para realismo.
.EXAMPLE
  .\Invoke-FfmpegUpscale.ps1
  .\Invoke-FfmpegUpscale.ps1 -Only club-live-mix-cinematic.mp4
#>
[CmdletBinding()]
param(
  [string] $ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
  [string] $Only = ""
)

$ErrorActionPreference = "Stop"

function Get-FfmpegPath {
  $cmd = Get-Command ffmpeg -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  $candidates = @(
    "$env:LOCALAPPDATA\Microsoft\WinGet\Links\ffmpeg.exe",
    "C:\ffmpeg\bin\ffmpeg.exe"
  )
  foreach ($p in $candidates) {
    if (Test-Path $p) { return $p }
  }
  return $null
}

$InputDir = Join-Path $ProjectRoot "img"
$OutputDir = Join-Path $ProjectRoot "img\4k"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$jobs = @(
  @{
    File = "club-live-mix-cinematic.mp4"
    Scale = "2160:2880"
    Label = "3x4-vertical"
  },
  @{
    File = "club-pov-wide-cinematic.mp4"
    Scale = "3840:2160"
    Label = "16x9-wide"
  },
  @{
    File = "club-crowd-shoulder-cinematic.mp4"
    Scale = "3840:2160"
    Label = "16x9-shoulder"
  },
  @{
    File = "club-set-loop.mp4"
    Scale = "2160:3840"
    Label = "9x16-loop"
  }
)

if ($Only) {
  $jobs = $jobs | Where-Object { $_.File -eq $Only }
  if (-not $jobs) {
    Write-Error "Arquivo não mapeado: $Only"
  }
}

$ffmpeg = Get-FfmpegPath
if (-not $ffmpeg) {
  Write-Host ""
  Write-Host "FFmpeg não encontrado." -ForegroundColor Yellow
  Write-Host "Instale com: winget install --id Gyan.FFmpeg -e"
  Write-Host "Depois feche o terminal, abra de novo e rode este script novamente."
  Write-Host "Para qualidade realista, use Topaz (ver UPSCALE-4K.md)."
  exit 1
}

Write-Host "Usando: $ffmpeg" -ForegroundColor Cyan
Write-Host "Saída:  $OutputDir" -ForegroundColor Cyan
Write-Host "AVISO: upscale só com FFmpeg não remove 'filtro de IA' como o Topaz." -ForegroundColor Yellow
Write-Host ""

foreach ($job in $jobs) {
  $inPath = Join-Path $InputDir $job.File
  if (-not (Test-Path $inPath)) {
    Write-Warning "Pulando (não existe): $inPath"
    continue
  }

  $base = [System.IO.Path]::GetFileNameWithoutExtension($job.File)
  $outPath = Join-Path $OutputDir "$base-ffmpeg-4k-$($job.Label).mp4"

  Write-Host ">>> $($job.File) -> $(Split-Path $outPath -Leaf)"

  $vf = "scale=$($job.Scale):flags=lanczos,format=yuv420p"

  & $ffmpeg -y -hide_banner -loglevel warning -i $inPath `
    -vf $vf `
    -c:v libx265 -tag:v hvc1 -crf 18 -preset slow `
    -pix_fmt yuv420p `
    -c:a copy `
    $outPath

  if ($LASTEXITCODE -ne 0) {
    Write-Error "FFmpeg falhou em $($job.File)"
  }
}

Write-Host ""
Write-Host "Concluído. Próximo passo: Topaz + DaVinci (UPSCALE-4K.md)." -ForegroundColor Green
