$projectRoot = $PSScriptRoot

& (Join-Path $projectRoot "stop_frontend.ps1")
& (Join-Path $projectRoot "stop_backend.ps1")

Write-Output "DocuMind AI stopped (frontend + backend)."