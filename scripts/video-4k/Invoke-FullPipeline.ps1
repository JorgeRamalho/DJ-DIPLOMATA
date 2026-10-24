#Requires -Version 5.1
<#
.SYNOPSIS
  Orquestra o pipeline: verifica ferramentas e aponta próximos passos.
.EXAMPLE
  .\Invoke-FullPipeline.ps1
#>
$here = $PSScriptRoot
$root = (Resolve-Path (Join-Path $here "..\..")).Path

Write-Host "=== DJ Diplomata - pipeline 4K ===" -ForegroundColor Cyan
Write-Host "Projeto: $root"
Write-Host ""
Write-Host "Guia completo: $here\UPSCALE-4K.md"
Write-Host ""

$topazRoot = "${env:ProgramFiles}\Topaz Labs LLC\Topaz Video AI"
if (Test-Path $topazRoot) {
  Write-Host "Topaz detectado. Rode: .\Invoke-TopazUpscale.ps1" -ForegroundColor Green
} else {
  Write-Host "Topaz nao instalado - siga Parte 1 e 2A do UPSCALE-4K.md" -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "FFmpeg fallback (opcional; instala via winget se faltar):" -ForegroundColor Cyan
try {
  & (Join-Path $here "Invoke-FfmpegUpscale.ps1")
} catch {
  Write-Host $_.Exception.Message -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Depois do Topaz: abra DaVinci Resolve e siga Parte 3 do UPSCALE-4K.md" -ForegroundColor Yellow
