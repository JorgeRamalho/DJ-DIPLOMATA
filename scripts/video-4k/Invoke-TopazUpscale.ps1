#Requires -Version 5.1
<#
.SYNOPSIS
  Detecta Topaz Video AI CLI e gera comandos / lote para upscale 4K.
.EXAMPLE
  .\Invoke-TopazUpscale.ps1 -WhatIf
  .\Invoke-TopazUpscale.ps1 -Run
#>
[CmdletBinding(SupportsShouldProcess)]
param(
  [string] $ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path,
  [switch] $Run
)

$ErrorActionPreference = "Stop"

function Find-TopazCli {
  $roots = @(
    "${env:ProgramFiles}\Topaz Labs LLC\Topaz Video AI",
    "${env:ProgramFiles(x86)}\Topaz Labs LLC\Topaz Video AI"
  )
  $names = @("tvai_up.exe", "tvai.exe", "Topaz Video AI.exe")
  foreach ($root in $roots) {
    if (-not (Test-Path $root)) { continue }
    foreach ($name in $names) {
      $full = Join-Path $root $name
      if (Test-Path $full) {
        return @{ Path = $full; Root = $root; Name = $name }
      }
    }
  }
  return $null
}

$InputDir = Join-Path $ProjectRoot "img"
$OutputDir = Join-Path $ProjectRoot "img\4k"
New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$topaz = Find-TopazCli
if (-not $topaz) {
  Write-Host "Topaz Video AI não encontrado." -ForegroundColor Yellow
  Write-Host "Instale o app e use o fluxo manual em scripts\video-4k\UPSCALE-4K.md (Parte 2A)."
  Write-Host "Caminho esperado: C:\Program Files\Topaz Labs LLC\Topaz Video AI\"
  exit 1
}

Write-Host "Topaz: $($topaz.Path)" -ForegroundColor Cyan

$batch = @(
  @{
    In = "club-live-mix-cinematic.mp4"
    Out = "club-live-mix-cinematic-topaz-2160x2880.mov"
    Note = "Close vertical - modelo Iris ou Proteus Fine Tune"
  },
  @{
    In = "club-pov-wide-cinematic.mp4"
    Out = "club-pov-wide-cinematic-topaz-3840x2160.mov"
    Note = "Hero 16:9 - Proteus, noise baixo"
  },
  @{
    In = "club-crowd-shoulder-cinematic.mp4"
    Out = "club-crowd-shoulder-cinematic-topaz-3840x2160.mov"
    Note = "B-roll - Proteus"
  }
)

$isGuiOnly = $topaz.Name -like "*.exe" -and $topaz.Name -notlike "tvai*.exe"

foreach ($item in $batch) {
  $inPath = Join-Path $InputDir $item.In
  $outPath = Join-Path $OutputDir $item.Out
  if (-not (Test-Path $inPath)) {
    Write-Warning "Ausente: $inPath"
    continue
  }

  Write-Host ""
  Write-Host "[$($item.In)] $($item.Note)" -ForegroundColor White

  if ($isGuiOnly) {
    Write-Host "  Abra o Topaz GUI, import: $inPath"
    Write-Host "  Export: $outPath"
    continue
  }

  # Parâmetros variam por versão; ajuste após `tvai_up.exe --help`
  $cliArgs = @(
    "-i", "`"$inPath`"",
    "-o", "`"$outPath`"",
    "-s", "4",
    "-m", "prob-4",
    "-f", "24"
  )
  $cmdLine = "& `"$($topaz.Path)`" $($cliArgs -join ' ')"

  if ($Run) {
    if ($PSCmdlet.ShouldProcess($item.In, "Topaz upscale")) {
      Write-Host "  Executando..." -ForegroundColor DarkGray
      & $topaz.Path -i $inPath -o $outPath -s 4 -f 24
      if ($LASTEXITCODE -ne 0) {
        Write-Warning "CLI retornou erro. Use GUI (UPSCALE-4K.md) ou rode: `"$($topaz.Path)`" --help"
      }
    }
  } else {
    Write-Host "  $cmdLine" -ForegroundColor DarkGray
  }
}

if (-not $Run) {
  Write-Host ""
  Write-Host "Modo preview. Para tentar o CLI: .\Invoke-TopazUpscale.ps1 -Run" -ForegroundColor Green
  Write-Host "Se o CLI falhar, siga Parte 2A do UPSCALE-4K.md na interface gráfica."
}
